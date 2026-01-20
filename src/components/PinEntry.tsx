'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { verifyPin } from '@/lib/storage';

export function PinEntry() {
  const { parentSettings, setCurrentScreen } = useAppStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    if (!parentSettings) {
      setError('Settings not found');
      return;
    }

    if (verifyPin(pin, parentSettings.pinHash)) {
      setCurrentScreen('settings');
      setPin('');
      setError('');
      setAttempts(0);
    } else {
      setAttempts((a) => a + 1);
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleCancel = () => {
    setCurrentScreen('companion');
    setPin('');
    setError('');
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => {
          if (!parentSettings) return;
          if (verifyPin(newPin, parentSettings.pinHash)) {
            setCurrentScreen('settings');
            setPin('');
            setAttempts(0);
          } else {
            setAttempts((a) => a + 1);
            setError('Incorrect PIN');
            setPin('');
          }
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-sky-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Parent Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN</p>
        </div>

        {/* PIN display */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
                pin.length > i
                  ? 'border-sky-500 bg-sky-50 text-sky-600'
                  : 'border-gray-200'
              }`}
            >
              {pin.length > i ? '•' : ''}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center text-red-500 text-sm mb-4">{error}</div>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map(
            (key) => (
              <button
                key={key || 'empty'}
                onClick={() => {
                  if (key === 'back') {
                    handleBackspace();
                  } else if (key) {
                    handleKeyPress(key);
                  }
                }}
                disabled={!key}
                className={`h-14 rounded-xl font-medium text-xl transition-colors ${
                  key === 'back'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : key
                    ? 'bg-gray-50 text-gray-800 hover:bg-gray-100 active:bg-sky-100'
                    : 'invisible'
                }`}
              >
                {key === 'back' ? (
                  <svg
                    className="w-6 h-6 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                    />
                  </svg>
                ) : (
                  key
                )}
              </button>
            )
          )}
        </div>

        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="w-full mt-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>

        {attempts >= 3 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Forgot your PIN? Clear browser data to reset.
          </p>
        )}
      </div>
    </div>
  );
}
