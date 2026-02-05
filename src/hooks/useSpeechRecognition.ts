/**
 * @file useSpeechRecognition.ts
 * @description This hook provides a simple interface for using the browser's Speech Recognition API.
 * It handles starting and stopping listening, and provides feedback on the current state.
 * It is a core part of the voice interaction in the application.
 */
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  continuous?: boolean;
}

// Define a consistent type for the SpeechRecognition API, handling vendor prefixes.
type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: { length: number; [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

/**
 * A custom hook for handling speech recognition.
 * @param {UseSpeechRecognitionOptions} options - Configuration for the speech recognition.
 * @returns An object with state and functions to control speech recognition.
 */
export function useSpeechRecognition({
  onResult,
  onListeningChange,
  continuous = true,
}: UseSpeechRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldBeListeningRef = useRef(false);

  useEffect(() => {
    // Check for browser support for the Speech Recognition API.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowAny = typeof window !== 'undefined' ? (window as any) : null;
    const SpeechRecognitionAPI = windowAny?.SpeechRecognition || windowAny?.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setIsSupported(true);

    // Create and configure the speech recognition instance.
    const recognition = new SpeechRecognitionAPI() as SpeechRecognitionType;
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim();
      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      onListeningChange?.(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListeningChange?.(false);

      // Automatically restart listening if it should be continuous.
      if (shouldBeListeningRef.current && continuous) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    recognition.onerror = (event) => {
      // Ignore common, non-critical errors.
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      setError(event.error);
    };

    recognitionRef.current = recognition;

    // Clean up on unmount.
    return () => {
      shouldBeListeningRef.current = false;
      recognition.stop();
    };
  }, [continuous, onListeningChange, onResult]);

  /**
   * Starts the speech recognition service.
   */
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      shouldBeListeningRef.current = true;
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, [isListening]);

  /**
   * Stops the speech recognition service.
   */
  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isSupported,
    isListening,
    error,
    startListening,
    stopListening,
  };
}
