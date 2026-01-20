'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { getProfile, getSettings, isSetupComplete as checkSetup } from '@/lib/storage';
import { Onboarding } from '@/components/Onboarding';
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
            setCurrentScreen('companion');
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
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

  switch (currentScreen) {
    case 'onboarding':
      return <Onboarding />;
    case 'companion':
      return <Companion />;
    case 'pin_entry':
      return <PinEntry />;
    case 'settings':
      return <Settings />;
    default:
      return <Onboarding />;
  }
}
