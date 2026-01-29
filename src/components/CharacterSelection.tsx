'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import { saveProfile } from '@/lib/storage';
import { Avatar } from './Avatar';
import type { CharacterType } from '@/types';

export function CharacterSelection() {
  const { childProfile, setChildProfile, setCurrentScreen } = useAppStore();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredCharacter, setHoveredCharacter] = useState<CharacterType | null>(null);

  const handleSelectCharacter = useCallback((character: CharacterType) => {
    setSelectedCharacter(character);
  }, []);

  const handleConfirm = async () => {
    if (!selectedCharacter || !childProfile) return;

    setIsSubmitting(true);

    try {
      const updatedProfile = {
        ...childProfile,
        character: selectedCharacter,
        updatedAt: Date.now(),
      };

      await saveProfile(updatedProfile);
      setChildProfile(updatedProfile);
      setCurrentScreen('companion');
    } catch {
      // Silently fail, user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterName = childProfile?.name || 'your child';

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Choose Your Friend!
          </h1>
          <p className="text-lg text-gray-600">
            Who would {characterName} like to play with?
          </p>
        </div>

        {/* Character Selection Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
          {/* Puppy Option */}
          <button
            onClick={() => handleSelectCharacter('puppy')}
            onMouseEnter={() => setHoveredCharacter('puppy')}
            onMouseLeave={() => setHoveredCharacter(null)}
            className={`relative bg-white rounded-3xl p-4 md:p-6 shadow-lg transition-all duration-300 transform ${
              selectedCharacter === 'puppy'
                ? 'ring-4 ring-sky-400 scale-105 shadow-xl'
                : hoveredCharacter === 'puppy'
                ? 'scale-102 shadow-xl'
                : 'hover:shadow-xl'
            }`}
          >
            {/* Selection indicator */}
            {selectedCharacter === 'puppy' && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-lg z-10">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Avatar Preview */}
            <div className="h-40 md:h-56 flex items-center justify-center mb-4">
              <Avatar
                character="puppy"
                state={selectedCharacter === 'puppy' ? 'celebrating' : hoveredCharacter === 'puppy' ? 'happy' : 'idle'}
                className="w-full h-full"
              />
            </div>

            {/* Label */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                Buddy
              </h2>
              <p className="text-sm md:text-base text-gray-500">
                A playful puppy pal!
              </p>
            </div>
          </button>

          {/* Princess Option */}
          <button
            onClick={() => handleSelectCharacter('princess')}
            onMouseEnter={() => setHoveredCharacter('princess')}
            onMouseLeave={() => setHoveredCharacter(null)}
            className={`relative bg-white rounded-3xl p-4 md:p-6 shadow-lg transition-all duration-300 transform ${
              selectedCharacter === 'princess'
                ? 'ring-4 ring-pink-400 scale-105 shadow-xl'
                : hoveredCharacter === 'princess'
                ? 'scale-102 shadow-xl'
                : 'hover:shadow-xl'
            }`}
          >
            {/* Selection indicator */}
            {selectedCharacter === 'princess' && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg z-10">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Avatar Preview */}
            <div className="h-40 md:h-56 flex items-center justify-center mb-4">
              <Avatar
                character="princess"
                state={selectedCharacter === 'princess' ? 'celebrating' : hoveredCharacter === 'princess' ? 'happy' : 'idle'}
                className="w-full h-full"
              />
            </div>

            {/* Label */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                Rosie
              </h2>
              <p className="text-sm md:text-base text-gray-500">
                A kind princess friend!
              </p>
            </div>
          </button>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedCharacter || isSubmitting}
            className={`px-12 py-4 rounded-full text-xl font-bold shadow-lg transition-all duration-300 transform ${
              selectedCharacter
                ? selectedCharacter === 'puppy'
                  ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white hover:from-sky-500 hover:to-sky-600 hover:scale-105 active:scale-95'
                  : 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600 hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            } disabled:transform-none disabled:hover:scale-100`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Getting ready...
              </span>
            ) : selectedCharacter ? (
              `Let's Play with ${selectedCharacter === 'puppy' ? 'Buddy' : 'Rosie'}!`
            ) : (
              'Pick a friend first!'
            )}
          </button>
        </div>

        {/* Fun message */}
        {selectedCharacter && (
          <p className="text-center text-gray-500 mt-4 animate-bounce">
            {selectedCharacter === 'puppy'
              ? '🐕 Woof woof! Buddy is so excited!'
              : '👑 Rosie can\'t wait to meet you!'}
          </p>
        )}
      </div>
    </div>
  );
}
