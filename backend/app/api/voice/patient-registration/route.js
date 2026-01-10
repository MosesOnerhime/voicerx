// ============================================================
// API ROUTE: /api/voice/patient-registration
// Voice-powered patient registration data extraction
// ============================================================
// PURPOSE: Transcribe audio and extract patient registration info
// WHO CAN ACCESS: NURSE, RECEPTIONIST, ADMIN
// ============================================================

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

// Check if AI features are available
function isAIEnabled() {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key';
}

// AI extraction prompt for patient registration
const EXTRACTION_PROMPT = `You are a medical receptionist assistant. Extract patient registration information from this conversation transcript.

TRANSCRIPT:
{transcript}

Extract and return ONLY valid JSON (no markdown, no code blocks) with these fields:
{
  "firstName": string or null,
  "lastName": string or null,
  "dateOfBirth": "YYYY-MM-DD" format or null,
  "gender": "MALE" | "FEMALE" | "OTHER" or null,
  "phoneNumber": string or null,
  "email": string or null,
  "address": string or null,
  "emergencyContactName": string or null,
  "emergencyContactPhone": string or null,
  "emergencyContactRelationship": "SPOUSE" | "PARENT" | "CHILD" | "SIBLING" | "FRIEND" | "OTHER" or null,
  "bloodType": "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" or null,
  "genotype": "AA" | "AS" | "SS" | "AC" | "SC" or null,
  "knownAllergies": string or null,
  "chronicConditions": string or null,
  "currentMedications": string or null,
  "confidence": number between 0 and 1
}

Rules:
- Names should be properly capitalized (e.g., "John Smith" not "john smith")
- Phone numbers should include country code if mentioned (e.g., "+234...")
- Dates should be converted to YYYY-MM-DD format
- If someone says "my wife" or "my husband", relationship is SPOUSE
- If someone says "my mother/father", relationship is PARENT
- If information is unclear or not mentioned, use null
- Confidence reflects how clearly the information was stated
- Only extract information that is explicitly mentioned`;

// POST - Upload audio and extract patient info
export async function POST(request) {
  try {
    // 0. CHECK IF AI IS ENABLED
    if (!isAIEnabled()) {
      return Response.json(
        {
          error: 'Voice AI feature is not configured',
          message: 'OpenAI API key is not set. Please configure OPENAI_API_KEY to use voice features, or use manual form entry instead.',
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
        { error: 'Only nurses, receptionists, or admins can use voice registration' },
        { status: 403 }
      );
    }

    // 3. PARSE FORM DATA
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return Response.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/m4a'];
    if (!validTypes.some(type => audioFile.type?.includes(type.split('/')[1]))) {
      // Allow if type is not set (some browsers don't set it correctly)
      console.log('Audio file type:', audioFile.type);
    }

    try {
      // 4. TRANSCRIBE WITH WHISPER API
      console.log('Starting Whisper transcription...');
      const transcription = await getOpenAI().audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
      });

      const rawTranscript = transcription.text;
      const audioDuration = Math.round(transcription.duration || 0);

      console.log('Transcription complete:', rawTranscript.substring(0, 100) + '...');

      // 5. EXTRACT PATIENT INFO WITH GPT-4o
      const extractionPrompt = EXTRACTION_PROMPT.replace('{transcript}', rawTranscript);

      console.log('Starting GPT-4o extraction...');
      const extraction = await getOpenAI().chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a medical data extraction assistant. Return only valid JSON, no markdown code blocks.',
          },
          {
            role: 'user',
            content: extractionPrompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      let extractedData = {};
      let confidence = 0;

      try {
        const jsonResponse = extraction.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        const cleanJson = jsonResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedData = JSON.parse(cleanJson);
        confidence = extractedData.confidence || 0.5;
        // Remove confidence from extracted data (it's returned separately)
        delete extractedData.confidence;
      } catch (parseError) {
        console.error('Failed to parse AI extraction:', parseError);
        console.error('Raw response:', extraction.choices[0].message.content);
        extractedData = {};
        confidence = 0;
      }

      console.log('Extraction complete. Confidence:', confidence);

      return Response.json(
        {
          message: 'Voice recording processed successfully',
          transcript: rawTranscript,
          extractedData,
          confidence,
          audioDuration,
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
    console.error('Voice registration error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
