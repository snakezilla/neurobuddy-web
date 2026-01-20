'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { saveProfile, saveSettings, hashPin } from '@/lib/storage';
import type { CommunicationLevel, SensoryPreference } from '@/types';

const COMMUNICATION_OPTIONS: { value: CommunicationLevel; label: string }[] = [
  { value: 'gestures', label: 'Mostly gestures' },
  { value: 'short_phrases', label: 'Short phrases' },
  { value: 'full_sentences', label: 'Full sentences' },
];

const SENSORY_OPTIONS: { value: SensoryPreference; label: string }[] = [
  { value: 'quiet', label: 'Quiet & calm' },
  { value: 'normal', label: 'Normal' },
  { value: 'visual_emphasis', label: 'Visual emphasis' },
];

export function Settings() {
  const { childProfile, parentSettings, setChildProfile, setParentSettings, setCurrentScreen } =
    useAppStore();

  const [name, setName] = useState('');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [communicationLevel, setCommunicationLevel] = useState<CommunicationLevel>('short_phrases');
  const [routineChallenges, setRoutineChallenges] = useState('');
  const [sensoryPreference, setSensoryPreference] = useState<SensoryPreference>('normal');

  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load current profile
  useEffect(() => {
    if (childProfile) {
      setName(childProfile.name);
      setLikes(childProfile.likes.join(', '));
      setDislikes(childProfile.dislikes.join(', '));
      setCommunicationLevel(childProfile.communicationLevel);
      setRoutineChallenges(childProfile.routineChallenges);
      setSensoryPreference(childProfile.sensoryPreference);
    }
  }, [childProfile]);

  const handleSaveProfile = async () => {
    if (!childProfile) return;

    setIsSaving(true);
    setMessage('');

    try {
      const updatedProfile = {
        ...childProfile,
        name: name.trim(),
        likes: likes.split(',').map((s) => s.trim()).filter(Boolean),
        dislikes: dislikes.split(',').map((s) => s.trim()).filter(Boolean),
        communicationLevel,
        routineChallenges: routineChallenges.trim(),
        sensoryPreference,
        updatedAt: Date.now(),
      };

      await saveProfile(updatedProfile);
      setChildProfile(updatedProfile);
      setMessage('Profile saved!');
    } catch (error) {
      console.error('Save error:', error);
      setMessage('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePin = async () => {
    if (!parentSettings) return;

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMessage('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmNewPin) {
      setMessage('PINs do not match');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const updatedSettings = {
        ...parentSettings,
        pinHash: hashPin(newPin),
      };

      await saveSettings(updatedSettings);
      setParentSettings(updatedSettings);
      setShowPinChange(false);
      setNewPin('');
      setConfirmNewPin('');
      setMessage('PIN updated!');
    } catch (error) {
      console.error('PIN change error:', error);
      setMessage('Failed to update PIN');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setCurrentScreen('companion');
  };

  return (
    <div className="min-h-screen bg-sky-100 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-xl text-center ${
              message.includes('Failed') || message.includes('must') || message.includes('match')
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-600'
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Child Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Likes (comma separated)
              </label>
              <input
                type="text"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dislikes (comma separated)
              </label>
              <input
                type="text"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Communication level
              </label>
              <select
                value={communicationLevel}
                onChange={(e) => setCommunicationLevel(e.target.value as CommunicationLevel)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none bg-white"
              >
                {COMMUNICATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sensory preference
              </label>
              <select
                value={sensoryPreference}
                onChange={(e) => setSensoryPreference(e.target.value as SensoryPreference)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none bg-white"
              >
                {SENSORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Routine challenges
              </label>
              <textarea
                value={routineChallenges}
                onChange={(e) => setRoutineChallenges(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* PIN section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Security</h2>

          {!showPinChange ? (
            <button
              onClick={() => setShowPinChange(true)}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Change PIN
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none text-center text-xl tracking-widest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:outline-none text-center text-xl tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPinChange(false);
                    setNewPin('');
                    setConfirmNewPin('');
                  }}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePin}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors disabled:opacity-50"
                >
                  Update PIN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
