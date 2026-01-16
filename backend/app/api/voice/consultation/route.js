// ============================================================
// API ROUTE: /api/voice/consultation
// Voice-Enabled Consultation Notes for Doctors
// ============================================================
// PURPOSE: Handle voice recording for doctor consultation notes
// WHO CAN ACCESS: DOCTOR only
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import OpenAI from 'openai';

// Lazy-load OpenAI client
let openai = null;
function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key') {
      return null;
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

function isAIEnabled() {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key';
}

// AI extraction prompt for consultation notes
const CONSULTATION_EXTRACTION_PROMPT = `You are a medical assistant helping a doctor document a patient consultation. Extract structured consultation notes from this doctor's voice recording.

TRANSCRIPT:
{transcript}

Extract and return ONLY valid JSON (no markdown, no code blocks):
{
  "diagnosis": "Primary diagnosis and any secondary diagnoses",
  "differential_diagnoses": ["array", "of", "differential", "diagnoses"],
  "history_of_present_illness": "Detailed HPI from the conversation",
  "physical_examination_findings": "Any PE findings mentioned",
  "assessment": "Doctor's clinical assessment",
  "treatment_plan": "Detailed treatment plan including non-pharmacological",
  "prescriptions": [
    {
      "medication": "Drug name",
      "dosage": "e.g., 500mg",
      "frequency": "e.g., twice daily",
      "duration": "e.g., 7 days",
      "instructions": "e.g., take with food"
    }
  ],
  "follow_up": "Follow-up instructions and timeline",
  "patient_education": "Any patient education or advice given",
  "additional_notes": "Any other relevant notes",
  "icd_codes": ["ICD-10 codes if identifiable"],
  "confidence": number (0-1)
}

Only extract explicitly mentioned information. Return null for missing data.
Format prescriptions as complete instructions. Be thorough but accurate.`;

// POST - Upload audio and process with AI for consultation
export async function POST(request) {
  try {
    // 0. CHECK IF AI IS ENABLED
    if (!isAIEnabled()) {
      return Response.json(
        {
          error: 'Voice AI feature is not configured',
          message: 'OpenAI API key is not set. Please configure OPENAI_API_KEY to use voice features.',
          aiEnabled: false
        },
        { status: 503 }
      );
    }

    // 1. AUTHENTICATION
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader?.split(' ')[1] || cookieToken;

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.hospitalId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. AUTHORIZATION - Only doctors can use consultation voice
    if (decoded.role !== 'DOCTOR') {
      return Response.json(
        { error: 'Only doctors can use consultation voice recording' },
        { status: 403 }
      );
    }

    // 3. PARSE FORM DATA
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const appointmentId = formData.get('appointmentId');

    if (!audioFile || !appointmentId) {
      return Response.json(
        { error: 'Audio file and appointmentId are required' },
        { status: 400 }
      );
    }

    // 4. VERIFY APPOINTMENT EXISTS AND IS ASSIGNED TO THIS DOCTOR
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        assignedDoctorId: decoded.userId,
        hospitalId: decoded.hospitalId,
      },
      include: {
        patient: true,
        consultationNote: true,
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Must be in consultation to use voice notes
    if (appointment.status !== 'IN_CONSULTATION') {
      return Response.json(
        { error: 'Consultation must be started to use voice notes' },
        { status: 400 }
      );
    }

    try {
      // 5. TRANSCRIBE WITH WHISPER API
      const transcription = await getOpenAI().audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
      });

      const rawTranscript = transcription.text;
      const audioDuration = Math.round(transcription.duration || 0);

      // 6. EXTRACT CONSULTATION NOTES WITH GPT-4
      const extractionPrompt = CONSULTATION_EXTRACTION_PROMPT.replace('{transcript}', rawTranscript);

      const extraction = await getOpenAI().chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a medical documentation assistant. Extract structured consultation notes from doctor voice recordings. Return only valid JSON.',
          },
          {
            role: 'user',
            content: extractionPrompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      let extractedNotes = {};
      let confidence = 0;

      try {
        const jsonResponse = extraction.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        const cleanJson = jsonResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedNotes = JSON.parse(cleanJson);
        confidence = extractedNotes.confidence || 0.5;
      } catch (parseError) {
        console.error('Failed to parse AI extraction:', parseError);
        extractedNotes = { error: 'Failed to parse extraction', raw: extraction.choices[0].message.content };
        confidence = 0;
      }

      // 7. FORMAT PRESCRIPTIONS FOR FRONTEND
      let formattedPrescriptions = [];
      if (extractedNotes.prescriptions && Array.isArray(extractedNotes.prescriptions)) {
        formattedPrescriptions = extractedNotes.prescriptions.map(rx => {
          if (typeof rx === 'string') return rx;
          return `${rx.medication} ${rx.dosage} - ${rx.frequency}${rx.duration ? ` for ${rx.duration}` : ''}${rx.instructions ? ` (${rx.instructions})` : ''}`;
        });
      }

      return Response.json(
        {
          message: 'Voice recording processed successfully',
          transcript: rawTranscript,
          audioDuration,
          extractedNotes: {
            diagnosis: extractedNotes.diagnosis || '',
            differentialDiagnoses: extractedNotes.differential_diagnoses || [],
            historyOfPresentIllness: extractedNotes.history_of_present_illness || '',
            physicalExamination: extractedNotes.physical_examination_findings || '',
            assessment: extractedNotes.assessment || '',
            treatmentPlan: extractedNotes.treatment_plan || '',
            prescriptions: formattedPrescriptions,
            followUp: extractedNotes.follow_up || '',
            patientEducation: extractedNotes.patient_education || '',
            additionalNotes: extractedNotes.additional_notes || '',
            icdCodes: extractedNotes.icd_codes || [],
          },
          confidence,
        },
        { status: 200 }
      );
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      return Response.json(
        { error: 'Failed to process audio', details: aiError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Consultation voice error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
