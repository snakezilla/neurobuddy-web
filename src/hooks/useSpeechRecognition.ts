'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  continuous?: boolean;
}

// Type for the SpeechRecognition API (browser-specific)
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
    // Check for browser support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowAny = typeof window !== 'undefined' ? (window as any) : null;
    const SpeechRecognitionAPI = windowAny?.SpeechRecognition || windowAny?.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setIsSupported(true);

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

      // Auto-restart if we should still be listening
      if (shouldBeListeningRef.current && continuous) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are normal - no-speech means silence, aborted means intentional stop
        return;
      }
      // Only set error for actual problems (network, audio capture, etc.)
      setError(event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      shouldBeListeningRef.current = false;
      recognition.stop();
    };
  }, [continuous, onListeningChange, onResult]);

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
