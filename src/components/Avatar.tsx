'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import type { AvatarState } from '@/types';

interface AvatarProps {
  state: AvatarState;
  className?: string;
}

// Map our avatar states to Rive state machine inputs
const STATE_TO_INPUT: Record<AvatarState, number> = {
  idle: 0,
  talking: 1,
  listening: 2,
  happy: 3,
  concerned: 4,
  celebrating: 5,
  thinking: 6,
  encouraging: 7,
  sleepy: 8,
  surprised: 9,
  waving: 10,
};

// CSS-only animation for expressiveness without React re-renders
const EXPRESSION_CONFIG: Record<AvatarState, {
  eyes: string;
  mouth: string;
  bodyAnimation: string;
  tailAnimation: string;
  earAnimation: string;
  extraElements?: 'sparkles' | 'hearts' | 'zzz' | 'question' | 'wave';
}> = {
  idle: { eyes: '●', mouth: '‿', bodyAnimation: 'animate-breathe', tailAnimation: 'animate-wag-slow', earAnimation: '' },
  talking: { eyes: '◠', mouth: 'O', bodyAnimation: '', tailAnimation: 'animate-wag-fast', earAnimation: 'animate-ear-perk' },
  listening: { eyes: '●', mouth: '‿', bodyAnimation: 'animate-tilt-head', tailAnimation: 'animate-wag-slow', earAnimation: 'animate-ear-listen' },
  happy: { eyes: '◠', mouth: '◡', bodyAnimation: 'animate-bounce-gentle', tailAnimation: 'animate-wag-fast', earAnimation: '', extraElements: 'sparkles' },
  concerned: { eyes: '●', mouth: '︵', bodyAnimation: 'animate-shrink', tailAnimation: '', earAnimation: 'animate-ear-droop' },
  celebrating: { eyes: '★', mouth: '◡', bodyAnimation: 'animate-bounce-big', tailAnimation: 'animate-wag-excited', earAnimation: '', extraElements: 'sparkles' },
  thinking: { eyes: '◔', mouth: '~', bodyAnimation: '', tailAnimation: '', earAnimation: '', extraElements: 'question' },
  encouraging: { eyes: '◠', mouth: '◡', bodyAnimation: 'animate-nod', tailAnimation: 'animate-wag-fast', earAnimation: '', extraElements: 'hearts' },
  sleepy: { eyes: '−', mouth: '‿', bodyAnimation: 'animate-breathe-slow', tailAnimation: '', earAnimation: 'animate-ear-droop', extraElements: 'zzz' },
  surprised: { eyes: 'O', mouth: 'o', bodyAnimation: 'animate-jump', tailAnimation: 'animate-wag-excited', earAnimation: 'animate-ear-perk' },
  waving: { eyes: '◠', mouth: '◡', bodyAnimation: 'animate-bounce-gentle', tailAnimation: 'animate-wag-fast', earAnimation: '', extraElements: 'wave' },
};

// Expressive SVG puppy with CSS-only animations (no re-renders)
function ExpressivePuppy({ state }: { state: AvatarState }) {
  const config = useMemo(() => EXPRESSION_CONFIG[state] || EXPRESSION_CONFIG.idle, [state]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main puppy container with body animation */}
      <div className={`relative ${config.bodyAnimation}`}>
        <svg viewBox="0 0 200 220" className="w-full h-full" style={{ maxWidth: '400px' }}>
          {/* Animated gradient background glow */}
          <defs>
            <radialGradient id="puppy-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE4B5" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFE4B5" stopOpacity="0" />
            </radialGradient>
            <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Glow behind puppy */}
          <circle cx="100" cy="100" r="90" fill="url(#puppy-glow)" className="animate-pulse-slow" />

          {/* Body */}
          <ellipse cx="100" cy="150" rx="55" ry="45" fill="#D4A574" filter="url(#soft-shadow)" />

          {/* Body highlight */}
          <ellipse cx="90" cy="140" rx="25" ry="20" fill="#E8D4B8" opacity="0.5" />

          {/* Tail with CSS animation */}
          <g className={config.tailAnimation} style={{ transformOrigin: '135px 150px' }}>
            <ellipse cx="155" cy="145" rx="28" ry="10" fill="#C49A6C" transform="rotate(-30 155 145)" />
            <ellipse cx="160" cy="140" rx="8" ry="6" fill="#E8D4B8" transform="rotate(-30 160 140)" />
          </g>

          {/* Back legs */}
          <ellipse cx="70" cy="175" rx="18" ry="25" fill="#C49A6C" />
          <ellipse cx="130" cy="175" rx="18" ry="25" fill="#C49A6C" />

          {/* Front legs */}
          <ellipse cx="75" cy="180" rx="12" ry="22" fill="#D4A574" />
          <ellipse cx="125" cy="180" rx="12" ry="22" fill="#D4A574" />

          {/* Paw pads */}
          <ellipse cx="75" cy="195" rx="10" ry="6" fill="#E8C4A0" />
          <ellipse cx="125" cy="195" rx="10" ry="6" fill="#E8C4A0" />

          {/* Head */}
          <circle cx="100" cy="80" r="58" fill="#E8C4A0" filter="url(#soft-shadow)" />

          {/* Head highlight */}
          <circle cx="85" cy="65" r="20" fill="#F5DCC4" opacity="0.6" />

          {/* Ears with CSS animation */}
          <g className={config.earAnimation}>
            <ellipse cx="50" cy="40" rx="22" ry="35" fill="#D4A574" />
            <ellipse cx="150" cy="40" rx="22" ry="35" fill="#D4A574" />
            {/* Inner ears */}
            <ellipse cx="50" cy="45" rx="12" ry="20" fill="#FFB6C1" />
            <ellipse cx="150" cy="45" rx="12" ry="20" fill="#FFB6C1" />
          </g>

          {/* Eye whites */}
          <ellipse cx="75" cy="75" rx="18" ry="16" fill="white" />
          <ellipse cx="125" cy="75" rx="18" ry="16" fill="white" />

          {/* Eyes - using text for expressive symbols */}
          <text x="75" y="82" fontSize="22" textAnchor="middle" fill="#333" className="select-none">
            {config.eyes}
          </text>
          <text x="125" y="82" fontSize="22" textAnchor="middle" fill="#333" className="select-none">
            {config.eyes}
          </text>

          {/* Eye shine (only for open eyes) */}
          {config.eyes !== '−' && config.eyes !== '◔' && (
            <>
              <circle cx="80" cy="70" r="4" fill="white" opacity="0.8" />
              <circle cx="130" cy="70" r="4" fill="white" opacity="0.8" />
            </>
          )}

          {/* Eyebrows for concerned state */}
          {state === 'concerned' && (
            <>
              <line x1="60" y1="55" x2="85" y2="60" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
              <line x1="115" y1="60" x2="140" y2="55" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* Nose */}
          <ellipse cx="100" cy="100" rx="10" ry="8" fill="#333" />
          <ellipse cx="97" cy="98" rx="3" ry="2" fill="#666" opacity="0.5" />

          {/* Mouth */}
          <text x="100" y="122" fontSize="24" textAnchor="middle" fill="#333" className="select-none">
            {config.mouth}
          </text>

          {/* Tongue for happy/celebrating */}
          {(state === 'happy' || state === 'celebrating' || state === 'encouraging') && (
            <ellipse cx="100" cy="125" rx="8" ry="12" fill="#FF9999" className="animate-tongue" />
          )}

          {/* Cheek blush for happy states */}
          {(state === 'happy' || state === 'celebrating' || state === 'encouraging' || state === 'waving') && (
            <>
              <ellipse cx="55" cy="95" rx="12" ry="8" fill="#FFB6C1" opacity="0.5" />
              <ellipse cx="145" cy="95" rx="12" ry="8" fill="#FFB6C1" opacity="0.5" />
            </>
          )}

          {/* Waving paw */}
          {config.extraElements === 'wave' && (
            <g className="animate-wave" style={{ transformOrigin: '40px 140px' }}>
              <ellipse cx="35" cy="120" rx="15" ry="22" fill="#E8C4A0" />
              <ellipse cx="35" cy="105" rx="12" ry="8" fill="#F5DCC4" />
            </g>
          )}
        </svg>

        {/* Extra animated elements outside SVG for better CSS animation control */}
        {config.extraElements === 'sparkles' && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/4 left-1/4 text-2xl animate-sparkle-1">✨</span>
            <span className="absolute top-1/3 right-1/4 text-xl animate-sparkle-2">⭐</span>
            <span className="absolute top-1/2 left-1/3 text-lg animate-sparkle-3">✨</span>
          </div>
        )}

        {config.extraElements === 'hearts' && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/4 left-1/3 text-2xl animate-float-1">💕</span>
            <span className="absolute top-1/3 right-1/3 text-xl animate-float-2">❤️</span>
          </div>
        )}

        {config.extraElements === 'zzz' && (
          <div className="absolute top-1/4 right-1/4 pointer-events-none">
            <span className="text-2xl text-blue-400 animate-float-zzz">💤</span>
          </div>
        )}

        {config.extraElements === 'question' && (
          <div className="absolute top-1/4 right-1/3 pointer-events-none">
            <span className="text-3xl text-amber-500 animate-bounce-slow">❓</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Avatar({ state, className = '' }: AvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const riveLoadedRef = useRef(false);

  // Try to load Rive animation
  const { rive, RiveComponent } = useRive({
    src: '/animations/puppy.riv',
    stateMachines: 'State Machine',
    autoplay: true,
    onLoad: () => {
      riveLoadedRef.current = true;
    },
    onLoadError: () => {
      // Rive file not found, will use expressive SVG fallback
      riveLoadedRef.current = false;
    },
  });

  // Get state machine input
  const stateInput = useStateMachineInput(rive, 'State Machine', 'state');

  // Update Rive state when our state changes
  useEffect(() => {
    if (stateInput) {
      stateInput.value = STATE_TO_INPUT[state];
    }
  }, [state, stateInput]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {rive ? (
        <RiveComponent className="w-full h-full" />
      ) : (
        <ExpressivePuppy state={state} />
      )}
    </div>
  );
}
