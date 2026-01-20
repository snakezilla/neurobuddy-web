import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Validate API key at startup
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Zod schemas for input validation
const ChildProfileSchema = z.object({
  name: z.string().min(1).max(100),
  likes: z.array(z.string().max(200)).max(20),
  dislikes: z.array(z.string().max(200)).max(20),
  communicationLevel: z.enum(['gestures', 'short_phrases', 'full_sentences']),
  sensoryPreference: z.enum(['quiet', 'normal', 'visual_emphasis']),
  routineChallenges: z.string().max(1000).optional().default(''),
});

const RoutineStepSchema = z.object({
  id: z.string(),
  instruction: z.string(),
  encouragement: z.string(),
  microSteps: z.array(z.string()).optional(),
});

const RoutineSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  triggerPhrases: z.array(z.string()),
  steps: z.array(RoutineStepSchema),
});

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
});

const ChatRequestSchema = z.object({
  userMessage: z.string().min(1).max(5000),
  profile: ChildProfileSchema,
  currentRoutine: RoutineSchema.nullable(),
  currentStepIndex: z.number().int().min(0).max(100),
  conversationHistory: z.array(MessageSchema).max(50),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
});

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return openai;
}

// Rate limiting: simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
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

type ChatRequest = z.infer<typeof ChatRequestSchema>;
type ChildProfile = z.infer<typeof ChildProfileSchema>;
type Routine = z.infer<typeof RoutineSchema>;

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
    // Check API key is configured
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Chat service not configured. Please set OPENAI_API_KEY.' },
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
    const parseResult = ChatRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const {
      userMessage,
      profile,
      currentRoutine,
      currentStepIndex,
      conversationHistory,
      timeOfDay,
    } = parseResult.data;

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

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
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
    // Log to server-side monitoring in production (not console)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get response', message: errorMessage },
      { status: 500 }
    );
  }
}
