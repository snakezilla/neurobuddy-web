import { create } from 'zustand';
import type {
  AppState,
  AppScreen,
  AvatarState,
  ChildProfile,
  ParentSettings,
  Routine,
  Message,
  FrustrationLevel,
} from '@/types';

interface AppStore extends AppState {
  // Setup actions
  setSetupComplete: (complete: boolean) => void;
  setCurrentScreen: (screen: AppScreen) => void;
  setChildProfile: (profile: ChildProfile | null) => void;
  setParentSettings: (settings: ParentSettings | null) => void;

  // Avatar actions
  setAvatarState: (state: AvatarState) => void;
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;

  // Routine actions
  startRoutine: (routine: Routine) => void;
  nextStep: () => void;
  endRoutine: () => void;
  setFrustrationLevel: (level: FrustrationLevel) => void;

  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Connection
  setOnline: (online: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState: AppState = {
  isSetupComplete: false,
  currentScreen: 'onboarding',
  childProfile: null,
  parentSettings: null,
  avatarState: 'idle',
  isListening: false,
  isSpeaking: false,
  currentRoutine: null,
  currentStepIndex: 0,
  frustrationLevel: 'none',
  messages: [],
  isOnline: true,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setSetupComplete: (complete) => set({ isSetupComplete: complete }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setChildProfile: (profile) => set({ childProfile: profile }),
  setParentSettings: (settings) => set({ parentSettings: settings }),

  setAvatarState: (state) => set({ avatarState: state }),
  setListening: (listening) => set({ isListening: listening }),
  setSpeaking: (speaking) => set({ isSpeaking: speaking }),

  startRoutine: (routine) =>
    set({
      currentRoutine: routine,
      currentStepIndex: 0,
      frustrationLevel: 'none',
    }),

  nextStep: () => {
    const { currentRoutine, currentStepIndex } = get();
    if (currentRoutine && currentStepIndex < currentRoutine.steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  endRoutine: () =>
    set({
      currentRoutine: null,
      currentStepIndex: 0,
      frustrationLevel: 'none',
    }),

  setFrustrationLevel: (level) => set({ frustrationLevel: level }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),

  setOnline: (online) => set({ isOnline: online }),

  reset: () => set(initialState),
}));
