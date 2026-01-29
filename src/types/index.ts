// Child profile types
export type CommunicationLevel = 'gestures' | 'short_phrases' | 'full_sentences';
export type SensoryPreference = 'quiet' | 'normal' | 'visual_emphasis';

export interface ChildProfile {
  id: string;
  name: string;
  likes: string[];
  dislikes: string[];
  communicationLevel: CommunicationLevel;
  routineChallenges: string;
  sensoryPreference: SensoryPreference;
  character: CharacterType; // Puppy or Princess
  createdAt: number;
  updatedAt: number;
}

export interface ParentSettings {
  pinHash: string;
  scheduledRoutines: ScheduledRoutine[];
}

export interface ScheduledRoutine {
  id: string;
  routineId: string;
  time: string; // HH:MM format
  days: number[]; // 0-6, Sunday-Saturday
  enabled: boolean;
}

// Routine types
export interface RoutineStep {
  id: string;
  instruction: string;
  encouragement: string;
  microSteps?: string[];
}

export interface Routine {
  id: string;
  name: string;
  icon: string;
  triggerPhrases: string[];
  steps: RoutineStep[];
}

// Character type selection
export type CharacterType = 'puppy' | 'princess';

// Avatar states
export type AvatarState =
  | 'idle'
  | 'talking'
  | 'listening'
  | 'happy'
  | 'concerned'
  | 'celebrating'
  | 'thinking'
  | 'encouraging'
  | 'sleepy'
  | 'surprised'
  | 'waving'
  // New expressive states for enhanced routines
  | 'excited'        // Paw Patrol energy - bouncy, high stimulation
  | 'playful'        // Co-activity mode - inviting, engaging
  | 'breathing'      // Bedtime calm - slow, rhythmic
  | 'night_mode'     // Evening wind-down - gentle, dimmer
  | 'reading'        // Story time - focused, attentive
  | 'celebrating_big' // Brain sparkle celebration - big reward moment
  // Touch interaction states
  | 'touched'        // Brief reaction to tap
  | 'poked'          // Giggly reaction to repeated taps
  | 'petted'         // Happy/content reaction to drag gesture
  | 'curious';       // Head tilt for long press

// Conversation types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// App state
export type AppScreen = 'onboarding' | 'character_selection' | 'companion' | 'settings' | 'pin_entry' | 'dashboard';

export type FrustrationLevel = 'none' | 'mild' | 'moderate' | 'high';

export interface AppState {
  isSetupComplete: boolean;
  currentScreen: AppScreen;
  childProfile: ChildProfile | null;
  parentSettings: ParentSettings | null;
  avatarState: AvatarState;
  isListening: boolean;
  isSpeaking: boolean;
  currentRoutine: Routine | null;
  currentStepIndex: number;
  frustrationLevel: FrustrationLevel;
  messages: Message[];
  isOnline: boolean;
}
