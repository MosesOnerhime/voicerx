// ============================================================
// API ROUTE: /api/voice
// PRD Section 5.4: Voice-Enabled Vitals Capture
// ============================================================
// PURPOSE: Handle voice recording upload, transcription, and AI extraction
// WHO CAN ACCESS: NURSE, RECEPTIONIST, ADMIN
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import OpenAI from 'openai';

// Lazy-load OpenAI client to avoid build-time errors
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

// Check if AI features are available
function isAIEnabled() {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key';
}

// AI extraction prompt for vitals
const EXTRACTION_PROMPT = `You are a medical assistant. Extract vitals and symptoms from this nurse-patient conversation transcript.

TRANSCRIPT:
{transcript}

Extract and return ONLY valid JSON (no markdown, no code blocks):
{
  "blood_pressure_systolic": number or null,
  "blood_pressure_diastolic": number or null,
  "pulse_rate": number or null,
  "temperature": number or null,
  "respiratory_rate": number or null,
  "oxygen_saturation": number or null,
  "weight": number or null,
  "height": number or null,
  "pain_level": number (1-10) or null,
  "pain_location": string or null,
  "symptoms": ["array", "of", "symptoms"],
  "symptom_duration": string or null,
  "chief_complaint": "Summary of main issue",
  "confidence": number (0-1)
}

Only extract explicitly mentioned information. Return null for missing data.
Parse blood pressure like "120/80" into systolic=120, diastolic=80.
Temperature in Celsius. Weight in kg. Height in cm.`;

// POST - Upload audio and process with AI
export async function POST(request) {
  try {
    // 0. CHECK IF AI IS ENABLED
    if (!isAIEnabled()) {
      return Response.json(
        {
          error: 'Voice AI feature is not configured',
          message: 'OpenAI API key is not set. Please configure OPENAI_API_KEY to use voice features, or enter vitals manually instead.',
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

    // 2. AUTHORIZATION
    if (!['NURSE', 'RECEPTIONIST', 'ADMIN'].includes(decoded.role)) {
      return Response.json(
        { error: 'Only nurses, receptionists, or admins can upload voice recordings' },
        { status: 403 }
      );
    }

    // 3. PARSE FORM DATA
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const appointmentId = formData.get('appointmentId');
    const autoCreateVitals = formData.get('autoCreateVitals') === 'true';

    if (!audioFile || !appointmentId) {
      return Response.json(
        { error: 'Audio file and appointmentId are required' },
        { status: 400 }
      );
    }

    // 4. VERIFY APPOINTMENT EXISTS
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        hospitalId: decoded.hospitalId,
      },
      include: {
        voiceTranscript: true,
        vitalsRecord: true,
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if voice transcript already exists
    if (appointment.voiceTranscript) {
      return Response.json(
        { error: 'Voice transcript already exists for this appointment. Use PUT to update.' },
        { status: 400 }
      );
    }

    // 5. CREATE INITIAL VOICE TRANSCRIPT RECORD (PENDING)
    const voiceTranscript = await prisma.voiceTranscript.create({
      data: {
        appointmentId,
        audioFileUrl: 'processing', // Will be updated with actual URL if using cloud storage
        audioDurationSeconds: 0, // Will be updated after processing
        rawTranscript: '',
        transcriptionStatus: 'PROCESSING',
      },
    });

    try {
      // 6. TRANSCRIBE WITH WHISPER API
      const transcription = await getOpenAI().audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
      });

      const rawTranscript = transcription.text;
      const audioDuration = Math.round(transcription.duration || 0);

      // 7. EXTRACT VITALS WITH GPT-4
      const extractionPrompt = EXTRACTION_PROMPT.replace('{transcript}', rawTranscript);

      const extraction = await getOpenAI().chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a medical data extraction assistant. Return only valid JSON, no markdown.',
          },
          {
            role: 'user',
            content: extractionPrompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      let extractedVitals = {};
      let confidence = 0;

      try {
        const jsonResponse = extraction.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        const cleanJson = jsonResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedVitals = JSON.parse(cleanJson);
        confidence = extractedVitals.confidence || 0.5;
      } catch (parseError) {
        console.error('Failed to parse AI extraction:', parseError);
        extractedVitals = { error: 'Failed to parse extraction', raw: extraction.choices[0].message.content };
        confidence = 0;
      }

      // 8. UPDATE VOICE TRANSCRIPT WITH RESULTS
      const updatedTranscript = await prisma.voiceTranscript.update({
        where: { id: voiceTranscript.id },
        data: {
          audioFileUrl: 'local', // In production, upload to S3/Cloudinary and store URL
          audioDurationSeconds: audioDuration,
          rawTranscript,
          extractedVitals,
          extractionConfidence: confidence,
          transcriptionStatus: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      // 9. OPTIONALLY CREATE VITALS RECORD
      let vitalsRecord = null;
      if (autoCreateVitals && !appointment.vitalsRecord && extractedVitals && !extractedVitals.error) {
        vitalsRecord = await prisma.$transaction(async (tx) => {
          const vitals = await tx.vitalsRecord.create({
            data: {
              appointmentId,
              bloodPressureSystolic: extractedVitals.blood_pressure_systolic,
              bloodPressureDiastolic: extractedVitals.blood_pressure_diastolic,
              pulseRate: extractedVitals.pulse_rate,
              temperature: extractedVitals.temperature,
              respiratoryRate: extractedVitals.respiratory_rate,
              oxygenSaturation: extractedVitals.oxygen_saturation,
              weight: extractedVitals.weight,
              height: extractedVitals.height,
              painLevel: extractedVitals.pain_level,
              painLocation: extractedVitals.pain_location,
              symptomsDescription: extractedVitals.symptoms?.join(', ') || extractedVitals.chief_complaint,
              symptomDuration: extractedVitals.symptom_duration,
              hasVoiceRecording: true,
              voiceTranscriptId: voiceTranscript.id,
              recordedVia: 'VOICE',
              recordedBy: decoded.userId,
            },
          });

          // Update appointment status
          await tx.appointment.update({
            where: { id: appointmentId },
            data: { status: 'VITALS_RECORDED' },
          });

          return vitals;
        });
      }

      return Response.json(
        {
          message: 'Voice recording processed successfully',
          voiceTranscript: updatedTranscript,
          extractedVitals,
          confidence,
          vitalsRecord,
          nextStep: vitalsRecord
            ? 'Vitals recorded. Assign appointment to an available doctor.'
            : 'Review extracted vitals and create vitals record.',
        },
        { status: 201 }
      );
    } catch (aiError) {
      // Update transcript status to FAILED
      await prisma.voiceTranscript.update({
        where: { id: voiceTranscript.id },
        data: {
          transcriptionStatus: 'FAILED',
          rawTranscript: `Error: ${aiError.message}`,
        },
      });

      console.error('AI processing error:', aiError);
      return Response.json(
        { error: 'Failed to process audio', details: aiError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Voice upload error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve voice transcript for an appointment
export async function GET(request) {
  try {
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

    // 2. GET QUERY PARAMS
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return Response.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    // 3. FETCH VOICE TRANSCRIPT
    const voiceTranscript = await prisma.voiceTranscript.findFirst({
      where: {
        appointmentId,
        appointment: {
          hospitalId: decoded.hospitalId,
        },
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                patientIdNumber: true,
              },
            },
          },
        },
      },
    });

    if (!voiceTranscript) {
      return Response.json(
        { error: 'Voice transcript not found' },
        { status: 404 }
      );
    }

    return Response.json({
      voiceTranscript,
    });
  } catch (error) {
    console.error('Get voice transcript error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
