/**
 * @file Onboarding.tsx
 * @description This component guides the parent/caregiver through the initial setup process for NeuroBuddy.
 * It collects information about the child and parent settings, creating a personalized experience.
 * This is the first screen a new user will see.
 */
'use-client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { saveProfile, saveSettings, hashPin } from '@/lib/storage';
import type { CommunicationLevel, SensoryPreference, ChildProfile, ParentSettings } from '@/types';

// Constants for communication and sensory options to ensure consistency.
const COMMUNICATION_OPTIONS: { value: CommunicationLevel; label: string; description: string }[] = [
  { value: 'gestures', label: 'Mostly gestures', description: 'Uses pointing, nodding, simple sounds' },
  { value: 'short_phrases', label: 'Short phrases', description: 'Uses 2-4 word sentences' },
  { value: 'full_sentences', label: 'Full sentences', description: 'Speaks in complete sentences' },
];

const SENSORY_OPTIONS: { value: SensoryPreference; label: string; description: string }[] = [
  { value: 'quiet', label: 'Quiet & calm', description: 'Prefers softer voices and gentle tones' },
  { value: 'normal', label: 'Normal', description: 'Comfortable with regular volume' },
  { value: 'visual_emphasis', label: 'Visual emphasis', description: 'Benefits from visual descriptions' },
];

/**
 * The Onboarding component, a multi-step wizard for initial setup.
 */
export function Onboarding() {
  const { setChildProfile, setParentSettings, setSetupComplete, setCurrentScreen } = useAppStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [communicationLevel, setCommunicationLevel] = useState<CommunicationLevel>('short_phrases');
  const [routineChallenges, setRoutineChallenges] = useState('');
  const [sensoryPreference, setSensoryPreference] = useState<SensoryPreference>('normal');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  /**
   * Handles moving to the next step in the onboarding process.
   * Includes validation for the current step.
   */
  const handleNext = () => {
    setError('');
    if (step === 1 && !name.trim()) {
      setError("Please enter your child's name");
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  /**
   * Handles moving to the previous step in the onboarding process.
   */
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  /**
   * Handles the final submission of the onboarding form.
   * Validates the PIN, creates the child and parent profiles, and saves them to storage.
   */
  const handleSubmit = async () => {
    setError('');

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const profile: ChildProfile = {
        id: crypto.randomUUID(),
        name: name.trim(),
        likes: likes.split(',').map((s) => s.trim()).filter(Boolean),
        dislikes: dislikes.split(',').map((s) => s.trim()).filter(Boolean),
        communicationLevel,
        routineChallenges: routineChallenges.trim(),
        sensoryPreference,
        character: 'puppy', // Default character, updated later.
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const settings: ParentSettings = {
        pinHash: hashPin(pin),
        scheduledRoutines: [],
      };

      // Save profiles to IndexedDB and update the global state.
      await saveProfile(profile);
      await saveSettings(settings);

      setChildProfile(profile);
      setParentSettings(settings);
      setSetupComplete(true);
      setCurrentScreen('character_selection');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
        {/* Progress indicator shows the current step. */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-sky-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Child's name and interests. */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to NeuroBuddy!</h1>
              <p className="text-gray-600">Let&apos;s get to know your child</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child&apos;s name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition-colors text-lg text-gray-900 placeholder-gray-400"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Things they love (separate with commas)
              </label>
              <input
                type="text"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                placeholder="e.g., dogs, dinosaurs, drawing, music"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Things to avoid (separate with commas)
              </label>
              <input
                type="text"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                placeholder="e.g., loud noises, spiders"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Step 2: Communication style and sensory preferences. */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Communication Style</h1>
              <p className="text-gray-600">Help us adapt to {name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How does {name} communicate?
              </label>
              <div className="space-y-2">
                {COMMUNICATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCommunicationLevel(option.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      communicationLevel === option.value
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sensory preference
              </label>
              <div className="space-y-2">
                {SENSORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSensoryPreference(option.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      sensoryPreference === option.value
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Routine challenges. */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Routine Challenges</h1>
              <p className="text-gray-600">What tasks does {name} find difficult?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas where {name} might need extra support
              </label>
              <textarea
                value={routineChallenges}
                onChange={(e) => setRoutineChallenges(e.target.value)}
                placeholder="e.g., Getting dressed takes a long time, doesn't like transitions, brushing teeth is hard..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition-colors resize-none text-gray-900 placeholder-gray-400"
              />
              <p className="text-sm text-gray-500 mt-2">
                This helps our buddy be extra patient and supportive in these areas.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Parent PIN setup. */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Set Your PIN</h1>
              <p className="text-gray-600">This protects the parent settings</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4-digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition-colors text-center text-2xl tracking-widest text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition-colors text-center text-2xl tracking-widest text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Display any validation errors. */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* Navigation buttons to move between steps. */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Setting up...' : "Let's Go!"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
