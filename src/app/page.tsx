'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { getProfile, getSettings, isSetupComplete as checkSetup } from '@/lib/storage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Landing } from '@/components/Landing';
import { Onboarding } from '@/components/Onboarding';
import { CharacterSelection } from '@/components/CharacterSelection';
import { Companion } from '@/components/Companion';
import { PinEntry } from '@/components/PinEntry';
import { Settings } from '@/components/Settings';

export default function Home() {
  const {
    currentScreen,
    setCurrentScreen,
    setChildProfile,
    setParentSettings,
    setSetupComplete,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  // Load saved data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const setupDone = await checkSetup();
        if (setupDone) {
          const profile = await getProfile();
          const settings = await getSettings();
          if (profile && settings) {
            setChildProfile(profile);
            setParentSettings(settings);
            setSetupComplete(true);
            // If user has completed setup before, skip landing
            setShowLanding(false);
            setCurrentScreen('companion');
          }
        }
      } catch {
        // Failed to load from IndexedDB - will start fresh with onboarding
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [setChildProfile, setParentSettings, setSetupComplete, setCurrentScreen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-sky-200 rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-sky-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for new visitors
  if (showLanding && currentScreen === 'onboarding') {
    return (
      <Landing 
        onStart={() => {
          setShowLanding(false);
        }} 
      />
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <Onboarding />;
      case 'character_selection':
        return <CharacterSelection />;
      case 'companion':
        return <Companion />;
      case 'pin_entry':
        return <PinEntry />;
      case 'settings':
        return <Settings />;
      default:
        return <Onboarding />;
    }
  };

  return <ErrorBoundary>{renderScreen()}</ErrorBoundary>;
}
