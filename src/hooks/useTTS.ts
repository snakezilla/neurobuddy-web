'use client';

import { useCallback, useRef, useState } from 'react';
import type { SensoryPreference } from '@/types';

interface UseTTSOptions {
  sensoryPreference?: SensoryPreference;
  useElevenLabs?: boolean; // Set to true when you have API credits
}

export function useTTS({ sensoryPreference = 'normal', useElevenLabs = false }: UseTTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for TTS fetch
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null); // Track blob URL for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup blob URL helper
  const cleanupAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  // Browser's built-in speech synthesis (free, works offline)
  const speakWithBrowser = useCallback((text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure voice settings
      utterance.rate = sensoryPreference === 'quiet' ? 0.85 : 0.95; // Slightly slower
      utterance.pitch = 1.1; // Slightly higher for friendlier tone
      utterance.volume = sensoryPreference === 'quiet' ? 0.7 : 1.0;

      // Try to find a nice female voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes('Samantha') || // macOS
          v.name.includes('Google US English') ||
          v.name.includes('Microsoft Zira') || // Windows
          (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        if (event.error !== 'canceled') {
          reject(new Error(event.error));
        } else {
          resolve(); // Cancelled is not an error
        }
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    });
  }, [sensoryPreference]);

  // ElevenLabs API (high quality, costs credits)
  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      // Cancel any ongoing speech and cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      cleanupAudioUrl();

      abortControllerRef.current = new AbortController();
      setIsLoading(true); // Show loading state during fetch

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sensoryPreference }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('ElevenLabs API failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl; // Track for cleanup

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        if (sensoryPreference === 'quiet') {
          audio.volume = 0.6;
        }

        setIsLoading(false);

        return new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            setIsSpeaking(false);
            cleanupAudioUrl();
            resolve();
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            cleanupAudioUrl();
            reject(new Error('Audio playback failed'));
          };

          setIsSpeaking(true);
          audio.play().catch((err) => {
            cleanupAudioUrl();
            reject(err);
          });
        });
      } catch (err) {
        setIsLoading(false);
        cleanupAudioUrl();
        throw err;
      }
    },
    [sensoryPreference, cleanupAudioUrl]
  );

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;

      setError(null);

      try {
        if (useElevenLabs) {
          // Try ElevenLabs first, fall back to browser
          try {
            await speakWithElevenLabs(text);
          } catch {
            // ElevenLabs failed, fall back to browser TTS silently
            await speakWithBrowser(text);
          }
        } else {
          // Use browser speech synthesis (free)
          await speakWithBrowser(text);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError('Failed to speak');
        setIsSpeaking(false);
        setIsLoading(false);
      }
    },
    [useElevenLabs, speakWithElevenLabs, speakWithBrowser]
  );

  const stop = useCallback(() => {
    // Stop ElevenLabs audio
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    cleanupAudioUrl();
    // Stop browser speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, [cleanupAudioUrl]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
  };
}
