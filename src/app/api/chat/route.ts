import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChildProfile, Routine, Message } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
  userMessage: string;
  profile: ChildProfile;
  currentRoutine: Routine | null;
  currentStepIndex: number;
  conversationHistory: Message[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

function buildSystemPrompt(
  profile: ChildProfile,
  currentRoutine: Routine | null,
  currentStepIndex: number,
  timeOfDay: string
): string {
  const communicationStyle =
    profile.communicationLevel === 'gestures'
      ? 'Use very simple words, short sentences (3-5 words max), and lots of encouragement.'
      : profile.communicationLevel === 'short_phrases'
      ? 'Use simple sentences (5-8 words), clear instructions, and warm encouragement.'
      : 'Use friendly, clear sentences with enthusiasm and support.';

  const sensoryNote =
    profile.sensoryPreference === 'quiet'
      ? 'Speak gently and calmly. Avoid exclamations.'
      : profile.sensoryPreference === 'visual_emphasis'
      ? 'Describe visual cues and use descriptive language about what things look like.'
      : '';

  let routineContext = '';
  if (currentRoutine) {
    const step = currentRoutine.steps[currentStepIndex];
    routineContext = `
CURRENT ROUTINE: ${currentRoutine.name}
CURRENT STEP (${currentStepIndex + 1}/${currentRoutine.steps.length}): ${step.instruction}
MICRO-STEPS if child needs help: ${step.microSteps?.join(', ') || 'None'}
ENCOURAGEMENT when done: ${step.encouragement}

Guide the child through this step. If they express difficulty, break it into micro-steps.
If they say they're done or succeeded, praise them and indicate readiness for next step.
If they seem frustrated or say "I can't", be extra gentle and encouraging.
`;
  }

  return `You are a friendly, animated puppy companion helping ${profile.name}, a child with Down syndrome.

CHILD'S PROFILE:
- Name: ${profile.name}
- Likes: ${profile.likes.join(', ')}
- Dislikes: ${profile.dislikes.join(', ')}
- Known challenges: ${profile.routineChallenges}
- Communication: ${profile.communicationLevel}

COMMUNICATION STYLE:
${communicationStyle}
${sensoryNote}

TIME OF DAY: ${timeOfDay}
${timeOfDay === 'morning' ? 'Greet them warmly for the new day!' : ''}
${timeOfDay === 'evening' || timeOfDay === 'night' ? 'Be calm and soothing, winding down.' : ''}

${routineContext}

IMPORTANT GUIDELINES:
1. Always be warm, patient, and encouraging
2. Celebrate small victories enthusiastically
3. If the child mentions something they like, incorporate it naturally
4. Avoid mentioning their dislikes
5. If no routine is active, chat about their day using their interests
6. Keep responses SHORT - 1-2 sentences max
7. Never be condescending or use baby talk
8. If they seem stuck or frustrated, offer gentle help
9. Reference their likes to make conversations personal
10. End responses in a way that invites them to continue talking

RESPONSE FORMAT:
- Keep it to 1-2 short sentences
- Use simple vocabulary
- Be warm and encouraging
- Sound like an excited, friendly puppy friend`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const {
      userMessage,
      profile,
      currentRoutine,
      currentStepIndex,
      conversationHistory,
      timeOfDay,
    } = body;

    const systemPrompt = buildSystemPrompt(
      profile,
      currentRoutine,
      currentStepIndex,
      timeOfDay
    );

    // Build conversation messages
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 150,
      temperature: 0.8,
    });

    const assistantMessage = response.choices[0]?.message?.content || "I'm here with you!";

    // Detect if response indicates routine progress
    const indicatesProgress =
      assistantMessage.toLowerCase().includes('great job') ||
      assistantMessage.toLowerCase().includes('well done') ||
      assistantMessage.toLowerCase().includes('next') ||
      assistantMessage.toLowerCase().includes('now let');

    // Detect frustration signals
    const indicatesFrustration =
      userMessage.toLowerCase().includes("can't") ||
      userMessage.toLowerCase().includes('hard') ||
      userMessage.toLowerCase().includes('help') ||
      userMessage.toLowerCase().includes('stuck');

    return NextResponse.json({
      message: assistantMessage,
      indicatesProgress,
      indicatesFrustration,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}
