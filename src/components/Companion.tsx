/**
 * @file Companion.tsx
 * @description This is the main interactive component for the NeuroBuddy application.
 * It manages the avatar, speech recognition, text-to-speech, and the conversation flow.
 * It's the core of the user experience, bringing together all the different parts of the application.
 */
'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/store';
import { Avatar } from './Avatar';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTTS } from '@/hooks/useTTS';
import { findRoutineByTrigger } from '@/lib/routines';
import type { AvatarState, FrustrationLevel } from '@/types';

/**
 * A debounce helper function to limit the rate at which a function gets called.
 * This is used to prevent the speech recognition from firing too frequently.
 * @param fn The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A debounced version of the function.
 */
function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Fallback phrases for when the application is offline.
const OFFLINE_PHRASES = [
  "I'm here with you!",
  "You're doing great!",
  "Keep going, you've got this!",
  "I believe in you!",
];

/**
 * Gets the time of day to adjust the avatar's state (e.g., sleepy at night).
 * @returns The current time of day as 'morning', 'afternoon', 'evening', or 'night'.
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/**
 * The main Companion component.
 * This component is responsible for the entire interactive experience.
 */
export function Companion() {
  const {
    childProfile,
    avatarState,
    setAvatarState,
    setListening,
    currentRoutine,
    currentStepIndex,
    startRoutine,
    nextStep,
    endRoutine,
    frustrationLevel,
    setFrustrationLevel,
    messages,
    addMessage,
    isOnline,
    setOnline,
    setCurrentScreen,
  } = useAppStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelpAlert, setShowHelpAlert] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(true); // Hide UI by default
  const [micActive, setMicActive] = useState(false); // Track if mic should be on
  const [displayTranscript, setDisplayTranscript] = useState(''); // For UI display only

  // Refs to manage state that shouldn't trigger re-renders.
  const transcriptQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false); // Use ref to avoid stale closure issues
  const frustrationCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasGreetedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Hook for Text-to-Speech functionality.
  const { speak, stop: stopSpeaking, isSpeaking, isLoading: isTTSLoading } = useTTS({
    sensoryPreference: childProfile?.sensoryPreference,
    character: childProfile?.character || 'puppy',
    useElevenLabs: true,
  });

  // Process a queue of transcripts to handle speech recognition results sequentially.
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || transcriptQueueRef.current.length === 0) {
      return;
    }

    const transcript = transcriptQueueRef.current.shift();
    if (!transcript) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    await processUserInput(transcript);
    isProcessingRef.current = false;
    setIsProcessing(false);

    // If there are more items in the queue, process them.
    if (transcriptQueueRef.current.length > 0 && !isSpeaking) {
      processQueue();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking]);

  // Debounced handler for speech recognition results.
  const debouncedHandleResult = useCallback(
    debounce((transcript: string) => {
      setDisplayTranscript(transcript);
      transcriptQueueRef.current.push(transcript);
      // Only start processing if the avatar is not currently speaking.
      if (!isSpeaking && !isProcessingRef.current) {
        processQueue();
      }
    }, 300),
    [isSpeaking, processQueue]
  );

  // Hook for speech recognition functionality.
  const { isSupported, isListening, startListening, stopListening, error: speechError } = useSpeechRecognition({
    onResult: debouncedHandleResult,
    onListeningChange: setListening,
    continuous: true,
  });

  // Process the queue when the avatar stops speaking.
  useEffect(() => {
    if (!isSpeaking && transcriptQueueRef.current.length > 0 && !isProcessingRef.current) {
      processQueue();
    }
  }, [isSpeaking, processQueue]);

  // Pause speech recognition while the avatar is speaking to prevent feedback loops.
  useEffect(() => {
    if (micActive) {
      if (isSpeaking) {
        stopListening();
      } else {
        startListening();
      }
    }
  }, [isSpeaking, micActive, startListening, stopListening]);

  // Determine the avatar's state based on the current application state.
  const getAvatarState = useCallback((): AvatarState => {
    if (showHelpAlert) return 'waving';
    if (isSpeaking) return 'talking';
    if (isListening && !isSpeaking) return 'listening';
    if (isProcessing) return 'thinking';

    // Time-based idle state.
    const timeOfDay = getTimeOfDay();
    if (timeOfDay === 'night') return 'sleepy';

    // Frustration-based states.
    if (frustrationLevel === 'high') return 'concerned';
    if (frustrationLevel === 'moderate') return 'encouraging';

    return 'idle';
  }, [isSpeaking, isListening, isProcessing, frustrationLevel, showHelpAlert]);

  // Update the avatar's state whenever dependencies change.
  useEffect(() => {
    const newState = getAvatarState();
    setAvatarState(newState);
  }, [getAvatarState, setAvatarState]);

  // Handle online/offline status changes.
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // Escalate frustration levels based on repeated unsuccessful interactions.
  const handleFrustrationEscalation = useCallback(
    (count: number) => {
      let level: FrustrationLevel = 'none';
      if (count >= 4) {
        level = 'high';
        // Trigger a help alert to the parent.
        setShowHelpAlert(true);
        speak(`Hey, can someone help ${childProfile?.name}? We could use a hand!`);
      } else if (count >= 3) {
        level = 'moderate';
        // Try a distraction technique.
        const like = childProfile?.likes[Math.floor(Math.random() * (childProfile?.likes.length || 1))];
        if (like) {
          speak(`You know what? Let's take a little break. Tell me about ${like}!`);
        }
      } else if (count >= 1) {
        level = 'mild';
      }
      setFrustrationLevel(level);
    },
    [childProfile, setFrustrationLevel, speak]
  );

  // Process the user's input by sending it to the AI and handling the response.
  const processUserInput = useCallback(
    async (transcript: string) => {
      if (!childProfile || isProcessing || !transcript) return;

      setIsProcessing(true);

      addMessage({ role: 'user', content: transcript });

      // If there's no active routine, check if the user is trying to start one.
      if (!currentRoutine) {
        const routine = findRoutineByTrigger(transcript);
        if (routine) {
          startRoutine(routine);
          const greeting = `Oh, you want to ${routine.name.toLowerCase()}! I'll help you. ${routine.steps[0].instruction}`;
          addMessage({ role: 'assistant', content: greeting });
          setIsProcessing(false);
          await speak(greeting);
          return;
        }
      }

      try {
        // Send the user's message to the chat API.
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: transcript,
            profile: childProfile,
            currentRoutine,
            currentStepIndex,
            conversationHistory: messages.slice(-10),
            timeOfDay: getTimeOfDay(),
          }),
        });

        if (!response.ok) {
          throw new Error('API error');
        }

        const data = await response.json();
        const assistantMessage = data.message;

        addMessage({ role: 'assistant', content: assistantMessage });

        // If the user is in a routine, check for progress.
        if (currentRoutine && data.indicatesProgress) {
          const isLastStep = currentStepIndex >= currentRoutine.steps.length - 1;

          if (!isLastStep) {
            const nextStepIndex = currentStepIndex + 1;
            const nextInstruction = currentRoutine.steps[nextStepIndex]?.instruction;

            nextStep();
            setAvatarState('celebrating');

            if (nextInstruction) {
              await speak(assistantMessage + ' ' + nextInstruction);
            } else {
              await speak(assistantMessage);
            }
          } else {
            // The routine is complete.
            setAvatarState('celebrating');
            endRoutine();
            await speak(assistantMessage);
          }
          frustrationCountRef.current = 0;
          setFrustrationLevel('none');
        } else {
          await speak(assistantMessage);
        }

        // Check for signs of frustration in the user's response.
        if (data.indicatesFrustration) {
          frustrationCountRef.current++;
          handleFrustrationEscalation(frustrationCountRef.current);
        }
      } catch {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        retryTimeoutRef.current = setTimeout(async () => {
          if (!isMountedRef.current) return;
          // If the app is still offline after a delay, use a fallback phrase.
          const fallback = OFFLINE_PHRASES[Math.floor(Math.random() * OFFLINE_PHRASES.length)];
          addMessage({ role: 'assistant', content: fallback });
          await speak(fallback);
        }, 10000);

        // Provide an immediate gentle response.
        await speak("Hold on, I'm thinking...");
      } finally {
        if (isMountedRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [
      childProfile,
      isProcessing,
      currentRoutine,
      currentStepIndex,
      messages,
      addMessage,
      speak,
      startRoutine,
      nextStep,
      endRoutine,
      setAvatarState,
      setFrustrationLevel,
      handleFrustrationEscalation,
    ]
  );

  // Handle touch interactions with the avatar.
  const handleAvatarTouch = useCallback((type: 'tap' | 'poke' | 'pet' | 'longpress') => {
    if (isSpeaking || isProcessing) return;

    let response = '';
    let newState: AvatarState = 'happy';

    switch (type) {
      case 'tap':
        response = ['Hehe!', 'Hi!', 'Boop!', "That's me!"][Math.floor(Math.random() * 4)];
        newState = 'touched';
        break;
      case 'poke':
        response = ['Hey, that tickles!', 'Hehe, stop it!', 'Silly!', 'Teehee!'][Math.floor(Math.random() * 4)];
        newState = 'poked';
        break;
      case 'pet':
        response = ['Mmm, that feels nice!', 'I love pets!', 'More please!', 'Youre so kind!'][Math.floor(Math.random() * 4)];
        newState = 'petted';
        break;
      case 'longpress':
        response = ["What's up?", 'You need something?', 'I am here!', 'Tell me!'][Math.floor(Math.random() * 4)];
        newState = 'curious';
        break;
    }

    setAvatarState(newState);
    speak(response);

    setTimeout(() => {
      if (!isSpeaking && !isListening) {
        setAvatarState('idle');
      }
    }, 2000);
  }, [isSpeaking, isProcessing, setAvatarState, speak, isListening]);

  // Get a friendly opening question to start the conversation.
  const getOpeningQuestion = () => {
    const questions = [
      "What's the most fun thing you did today?",
      "Do you have a favorite color? Mine is blue!",
      "What makes you smile the most?",
      "Did anything super cool happen today?",
      "What's your favorite thing to play?",
      "Tell me about something that made you happy!",
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Greet the user when the component mounts.
  useEffect(() => {
    if (childProfile && !hasGreetedRef.current) {
      hasGreetedRef.current = true;

      const characterName = childProfile.character === 'princess' ? 'Rosie' : 'Buddy';
      const like = childProfile.likes[0];
      const personalTouch = like ? ` I heard you love ${like}!` : '';

      const introduction = `Hi ${childProfile.name}! I'm ${characterName}! I'm SO happy to meet you!${personalTouch}`;
      const openingQuestion = getOpeningQuestion();
      const fullGreeting = `${introduction} ${openingQuestion}`;

      const timer = setTimeout(() => {
        setAvatarState('excited');
        speak(fullGreeting);
        addMessage({ role: 'assistant', content: fullGreeting });

        setTimeout(() => {
          setMicActive(true);
          if (!isSpeaking) {
            startListening();
          }
        }, 100);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [childProfile, speak, addMessage, setAvatarState, isSpeaking, startListening]);

  // Clean up resources when the component unmounts.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  const dismissHelpAlert = () => {
    setShowHelpAlert(false);
    frustrationCountRef.current = 0;
    setFrustrationLevel('none');
  };

  const toggleMicrophone = () => {
    if (micActive) {
      setMicActive(false);
      stopListening();
    } else {
      setMicActive(true);
      if (!isSpeaking) {
        startListening();
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors relative overflow-hidden ${
        showHelpAlert ? 'bg-amber-100' : 'bg-sky-200'
      }`}
    >
      {showHelpAlert && (
        <div className="absolute inset-0 border-8 border-amber-400 pointer-events-none animate-pulse z-10" />
      )}

      <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
              Offline
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImmersiveMode(!immersiveMode)}
            className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
            aria-label={immersiveMode ? 'Show details' : 'Hide details'}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {immersiveMode ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              )}
            </svg>
          </button>
          <button
            onClick={() => setCurrentScreen('pin_entry')}
            className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full h-full max-w-lg max-h-[70vh] flex items-center justify-center">
          <Avatar
            state={avatarState}
            character={childProfile?.character || 'puppy'}
            className="w-full h-full"
            onTouch={handleAvatarTouch}
          />
        </div>

        {!immersiveMode && (
          <>
            {currentRoutine && (
              <div className="bg-white/80 rounded-2xl px-6 py-3 mb-4 text-center">
                <div className="text-sm text-gray-600">
                  {currentRoutine.icon} {currentRoutine.name}
                </div>
                <div className="text-xs text-gray-500">
                  Step {currentStepIndex + 1} of {currentRoutine.steps.length}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              {isListening && !isSpeaking && !isProcessing && !isTTSLoading && (
                <div className="flex items-center gap-2 text-sky-700">
                  <span className="w-3 h-3 bg-sky-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Listening...</span>
                </div>
              )}
              {isTTSLoading && (
                <div className="flex items-center gap-2 text-purple-700">
                  <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Preparing to speak...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Speaking...</span>
                </div>
              )}
              {isProcessing && !isTTSLoading && (
                <div className="flex items-center gap-2 text-amber-700">
                  <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Thinking...</span>
                </div>
              )}
            </div>

            {displayTranscript && (
              <div className="bg-white/60 rounded-xl px-4 py-2 max-w-md text-center">
                <p className="text-gray-700 text-sm">&ldquo;{displayTranscript}&rdquo;</p>
              </div>
            )}

            {speechError && (
              <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm">
                Microphone error: {speechError}
              </div>
            )}

            {!isSupported && (
              <div className="mt-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm text-center">
                Speech recognition not supported in this browser.
                <br />
                Try Chrome or Edge for best experience.
              </div>
            )}
          </>
        )}
      </main>

      {showHelpAlert && (
        <div className="absolute bottom-24 left-4 right-4 z-20">
          <button
            onClick={dismissHelpAlert}
            className="w-full py-4 bg-white rounded-2xl text-gray-700 font-medium shadow-lg"
          >
            Help has arrived - continue
          </button>
        </div>
      )}

      <footer className="absolute bottom-0 left-0 right-0 p-4 flex justify-center z-20">
        <button
          onClick={toggleMicrophone}
          disabled={!isSupported}
          className={`p-6 rounded-full transition-all shadow-lg ${
            micActive
              ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-300'
              : 'bg-sky-500 hover:bg-sky-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={micActive ? 'Turn off microphone' : 'Turn on microphone'}
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {micActive ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            )}
          </svg>
        </button>
        {micActive && !immersiveMode && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-xs text-gray-600">
            {isSpeaking ? 'Paused while speaking' : 'Always listening'}
          </div>
        )}
      </footer>
    </div>
  );
}
