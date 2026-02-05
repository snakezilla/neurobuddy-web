/**
 * @file useTTS.ts
 * @description This hook provides Text-to-Speech (TTS) functionality for the application.
 * It can use either the browser's built-in speech synthesis or the ElevenLabs API for higher quality audio.
 * It also includes character-specific voice profiles and sensory preferences.
 */
'use client';

import { useCallback, useRef, useState } from 'react';
import type { SensoryPreference, CharacterType } from '@/types';

// Voice profiles for different characters to give them a unique personality.
const VOICE_PROFILES = {
  puppy: {
    pitch: 1.35, // A higher-pitched, playful voice.
    rate: 0.92,
    // A list of preferred voice names to match the character.
    preferredVoices: ['Google UK English Male', 'Daniel', 'Alex', 'Junior'],
  },
  princess: {
    pitch: 1.45, // A gentle, higher-pitched feminine voice.
    rate: 0.88, // Slightly slower and more melodic.
    preferredVoices: ['Samantha', 'Google UK English Female', 'Karen', 'Victoria', 'Microsoft Zira'],
  },
};

interface UseTTSOptions {
  sensoryPreference?: SensoryPreference;
  character?: CharacterType;
  useElevenLabs?: boolean; // Option to use the ElevenLabs API.
}

/**
 * A custom hook for handling Text-to-Speech.
 * @param {UseTTSOptions} options - Configuration for the TTS.
 * @returns An object with state and functions to control TTS.
 */
export function useTTS({ sensoryPreference = 'normal', character = 'puppy', useElevenLabs = false }: UseTTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading state when fetching from API.
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null); // To keep track of blob URLs for cleanup.
  const abortControllerRef = useRef<AbortController | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  /**
   * Cleans up the audio blob URL to prevent memory leaks.
   */
  const cleanupAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  /**
   * Uses the browser's built-in speech synthesis to speak the given text.
   * This is a fallback for when the ElevenLabs API is not used or fails.
   */
  const speakWithBrowser = useCallback((text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      const voiceProfile = VOICE_PROFILES[character];

      // Adjust voice settings based on sensory preference and character.
      const baseRate = voiceProfile.rate;
      const basePitch = voiceProfile.pitch;

      utterance.rate = sensoryPreference === 'quiet' ? baseRate * 0.9 : baseRate;
      utterance.pitch = basePitch;
      utterance.volume = sensoryPreference === 'quiet' ? 0.7 : 1.0;

      // Find the best available voice for the character.
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find((v) =>
        voiceProfile.preferredVoices.some((pref) => v.name.includes(pref))
      );

      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) => v.lang.startsWith('en') && !v.name.toLowerCase().includes('espeak')
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
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
          resolve();
        }
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    });
  }, [sensoryPreference, character]);

  /**
   * Uses the ElevenLabs API to generate high-quality audio and play it.
   */
  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      cleanupAudioUrl();

      abortControllerRef.current = new AbortController();
      setIsLoading(true);

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
        audioUrlRef.current = audioUrl;

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

  /**
   * The main speak function that decides whether to use ElevenLabs or the browser's TTS.
   */
  const speak = useCallback(
    async (text: string) => {
      if (!text) return;

      setError(null);

      try {
        if (useElevenLabs) {
          // Attempt to use ElevenLabs, but fall back to browser TTS if it fails.
          try {
            await speakWithElevenLabs(text);
          } catch {
            await speakWithBrowser(text);
          }
        } else {
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

  /**
   * Stops any currently playing audio, whether from ElevenLabs or the browser.
   */
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    cleanupAudioUrl();
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
