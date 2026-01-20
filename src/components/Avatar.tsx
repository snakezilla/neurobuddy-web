'use client';

import { useEffect, useRef, useState } from 'react';
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

// Idle animation expressions to cycle through
const IDLE_EXPRESSIONS: AvatarState[] = ['idle', 'happy', 'idle', 'surprised', 'idle', 'happy'];

// Placeholder SVG puppy for when Rive file isn't available
function PlaceholderPuppy({ state }: { state: AvatarState }) {
  const [displayState, setDisplayState] = useState<AvatarState>(state);
  const idleIndexRef = useRef(0);

  // Cycle through expressions when idle
  useEffect(() => {
    if (state === 'idle') {
      const interval = setInterval(() => {
        idleIndexRef.current = (idleIndexRef.current + 1) % IDLE_EXPRESSIONS.length;
        setDisplayState(IDLE_EXPRESSIONS[idleIndexRef.current]);
      }, 2500); // Change expression every 2.5 seconds
      return () => clearInterval(interval);
    } else {
      setDisplayState(state);
    }
  }, [state]);

  // Simple animated expressions based on state
  const getExpression = () => {
    switch (displayState) {
      case 'happy':
      case 'celebrating':
        return { eyes: '◠', mouth: '◡', bounce: true, tailWag: true };
      case 'concerned':
        return { eyes: '●', mouth: '︵', bounce: false, tailWag: false };
      case 'talking':
        return { eyes: '◠', mouth: 'O', bounce: false, tailWag: true };
      case 'listening':
        return { eyes: '●', mouth: '‿', bounce: false, tailWag: true };
      case 'thinking':
        return { eyes: '◔', mouth: '~', bounce: false, tailWag: false };
      case 'encouraging':
        return { eyes: '◠', mouth: '◡', bounce: true, tailWag: true };
      case 'sleepy':
        return { eyes: '−', mouth: '‿', bounce: false, tailWag: false };
      case 'surprised':
        return { eyes: 'O', mouth: 'o', bounce: false, tailWag: true };
      case 'waving':
        return { eyes: '◠', mouth: '◡', bounce: true, tailWag: true };
      default:
        return { eyes: '●', mouth: '‿', bounce: false, tailWag: true };
    }
  };

  const expr = getExpression();

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${expr.bounce ? 'animate-bounce' : ''}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Body */}
        <ellipse cx="100" cy="140" rx="50" ry="40" fill="#D4A574" />

        {/* Head */}
        <circle cx="100" cy="80" r="55" fill="#E8C4A0" />

        {/* Ears */}
        <ellipse cx="55" cy="45" rx="20" ry="30" fill="#D4A574" />
        <ellipse cx="145" cy="45" rx="20" ry="30" fill="#D4A574" />

        {/* Inner ears */}
        <ellipse cx="55" cy="48" rx="10" ry="18" fill="#FFB6C1" />
        <ellipse cx="145" cy="48" rx="10" ry="18" fill="#FFB6C1" />

        {/* Eyes */}
        <text x="75" y="85" fontSize="24" textAnchor="middle" fill="#333">
          {expr.eyes}
        </text>
        <text x="125" y="85" fontSize="24" textAnchor="middle" fill="#333">
          {expr.eyes}
        </text>

        {/* Nose */}
        <ellipse cx="100" cy="95" rx="8" ry="6" fill="#333" />

        {/* Mouth */}
        <text x="100" y="118" fontSize="20" textAnchor="middle" fill="#333">
          {expr.mouth}
        </text>

        {/* Tail (wagging for happy states) */}
        <ellipse
          cx="150"
          cy="140"
          rx="25"
          ry="8"
          fill="#D4A574"
          className={expr.tailWag ? 'origin-left animate-pulse' : ''}
          transform="rotate(-30 150 140)"
        />

        {/* Waving paw for waving state */}
        {displayState === 'waving' && (
          <ellipse
            cx="45"
            cy="130"
            rx="12"
            ry="18"
            fill="#E8C4A0"
            className="animate-pulse origin-bottom"
            transform="rotate(-20 45 130)"
          />
        )}
      </svg>
    </div>
  );
}

export function Avatar({ state, className = '' }: AvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Try to load Rive animation
  const { rive, RiveComponent } = useRive({
    src: '/animations/puppy.riv',
    stateMachines: 'State Machine',
    autoplay: true,
    onLoadError: () => {
      // Rive file not found, will use placeholder
      console.log('Rive animation not found, using placeholder');
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
        <PlaceholderPuppy state={state} />
      )}
    </div>
  );
}
