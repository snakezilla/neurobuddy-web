import { NextRequest, NextResponse } from 'next/server';

// Charlotte voice - softer, nurturing, storyteller quality
const VOICE_ID = 'XB0fDUnXU5powFXDhCwa'; // Charlotte
const ELEVEN_LABS_API = 'https://api.elevenlabs.io/v1';

interface TTSRequest {
  text: string;
  sensoryPreference?: 'quiet' | 'normal' | 'visual_emphasis';
}

export async function POST(request: NextRequest) {
  try {
    const { text, sensoryPreference = 'normal' }: TTSRequest = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Adjust voice settings based on sensory preference
    const stability = sensoryPreference === 'quiet' ? 0.8 : 0.5;
    const similarityBoost = sensoryPreference === 'quiet' ? 0.6 : 0.75;

    const response = await fetch(
      `${ELEVEN_LABS_API}/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
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
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return NextResponse.json(
        { error: 'TTS generation failed' },
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
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
