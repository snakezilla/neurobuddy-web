import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Charlotte voice - softer, nurturing, storyteller quality
const VOICE_ID = 'XB0fDUnXU5powFXDhCwa'; // Charlotte
const ELEVEN_LABS_API = 'https://api.elevenlabs.io/v1';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Input validation schema
const TTSRequestSchema = z.object({
  text: z.string().min(1).max(1000),
  sensoryPreference: z.enum(['quiet', 'normal', 'visual_emphasis']).optional().default('normal'),
});

// Rate limiting: simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check API key is configured
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'TTS service not configured. Please set ELEVENLABS_API_KEY.' },
        { status: 503 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Validate input
    const parseResult = TTSRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { text, sensoryPreference } = parseResult.data;

    // Adjust voice settings based on sensory preference
    const stability = sensoryPreference === 'quiet' ? 0.8 : 0.5;
    const similarityBoost = sensoryPreference === 'quiet' ? 0.6 : 0.75;

    const response = await fetch(
      `${ELEVEN_LABS_API}/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style: 0.4, // Slightly expressive but not over the top
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'TTS generation failed', details: errorText },
        { status: 500 }
      );
    }

    // Return the audio as a stream
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate speech', message: errorMessage },
      { status: 500 }
    );
  }
}
