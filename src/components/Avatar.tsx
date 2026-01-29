'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import type { AvatarState, CharacterType } from '@/types';

interface AvatarProps {
  state: AvatarState;
  character?: CharacterType;
  className?: string;
  onTouch?: (type: 'tap' | 'poke' | 'pet' | 'longpress') => void;
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
  excited: 11,
  playful: 12,
  breathing: 13,
  night_mode: 14,
  reading: 15,
  celebrating_big: 16,
  // Touch states
  touched: 17,
  poked: 18,
  petted: 19,
  curious: 20,
};

// CSS-only animation for expressiveness without React re-renders
const EXPRESSION_CONFIG: Record<AvatarState, {
  eyes: string;
  mouth: string;
  bodyAnimation: string;
  tailAnimation: string;
  earAnimation: string;
  extraElements?: 'sparkles' | 'hearts' | 'zzz' | 'question' | 'wave' | 'brain_sparkle' | 'giggle';
  dimmed?: boolean;
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
  excited: { eyes: '★', mouth: '◡', bodyAnimation: 'animate-super-bounce', tailAnimation: 'animate-wag-excited', earAnimation: 'animate-ear-perk', extraElements: 'sparkles' },
  playful: { eyes: '◠', mouth: '◡', bodyAnimation: 'animate-wiggle', tailAnimation: 'animate-wag-fast', earAnimation: 'animate-ear-perk' },
  breathing: { eyes: '−', mouth: '○', bodyAnimation: 'animate-breathe-deep', tailAnimation: '', earAnimation: '', dimmed: true },
  night_mode: { eyes: '⌣', mouth: '‿', bodyAnimation: 'animate-breathe-slow', tailAnimation: '', earAnimation: 'animate-ear-droop', dimmed: true },
  reading: { eyes: '●', mouth: '‿', bodyAnimation: 'animate-lean-forward', tailAnimation: 'animate-wag-slow', earAnimation: 'animate-ear-perk' },
  celebrating_big: { eyes: '★', mouth: '◡', bodyAnimation: 'animate-celebration-spin', tailAnimation: 'animate-wag-excited', earAnimation: 'animate-ear-perk', extraElements: 'brain_sparkle' },
  // Touch interaction states
  touched: { eyes: 'O', mouth: '◡', bodyAnimation: 'animate-bounce-gentle', tailAnimation: 'animate-wag-fast', earAnimation: 'animate-ear-perk' },
  poked: { eyes: '><', mouth: 'D', bodyAnimation: 'animate-wiggle', tailAnimation: 'animate-wag-excited', earAnimation: '', extraElements: 'giggle' },
  petted: { eyes: '◠', mouth: '◡', bodyAnimation: 'animate-lean-into', tailAnimation: 'animate-wag-excited', earAnimation: '', extraElements: 'hearts' },
  curious: { eyes: '●', mouth: '?', bodyAnimation: 'animate-tilt-head', tailAnimation: 'animate-wag-slow', earAnimation: 'animate-ear-perk', extraElements: 'question' },
};

// Touch interaction hook
function useTouchInteraction(onTouch?: (type: 'tap' | 'poke' | 'pet' | 'longpress') => void) {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const point = 'touches' in e ? e.touches[0] : e;
    touchStartRef.current = { x: point.clientX, y: point.clientY, time: Date.now() };
    isDraggingRef.current = false;

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        onTouch?.('longpress');
      }
    }, 600);
  }, [onTouch]);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartRef.current) return;

    const point = 'touches' in e ? e.touches[0] : e;
    const dx = point.clientX - touchStartRef.current.x;
    const dy = point.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If moved more than 20px, it's a drag (pet gesture)
    if (distance > 20) {
      isDraggingRef.current = true;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    if (isDraggingRef.current) {
      // It was a drag - pet gesture
      onTouch?.('pet');
    } else if (touchStartRef.current && Date.now() - touchStartRef.current.time < 300) {
      // Quick tap
      tapCountRef.current += 1;

      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }

      tapTimerRef.current = setTimeout(() => {
        if (tapCountRef.current >= 3) {
          onTouch?.('poke');
        } else {
          onTouch?.('tap');
        }
        tapCountRef.current = 0;
      }, 300);
    }

    touchStartRef.current = null;
    isDraggingRef.current = false;
  }, [onTouch]);

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}

// Expressive SVG puppy with CSS-only animations (no re-renders)
function ExpressivePuppy({ state, onTouch }: { state: AvatarState; onTouch?: (type: 'tap' | 'poke' | 'pet' | 'longpress') => void }) {
  const config = useMemo(() => EXPRESSION_CONFIG[state] || EXPRESSION_CONFIG.idle, [state]);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchInteraction(onTouch);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Main puppy container with body animation */}
      <div className={`relative ${config.bodyAnimation}`}>
        <svg viewBox="-30 -30 260 280" className="w-full h-full overflow-visible" style={{ minHeight: '350px', maxHeight: '500px' }}>
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
          {config.eyes !== '−' && config.eyes !== '◔' && config.eyes !== '><' && (
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
          {(state === 'happy' || state === 'celebrating' || state === 'encouraging' || state === 'petted') && (
            <ellipse cx="100" cy="125" rx="8" ry="12" fill="#FF9999" className="animate-tongue" />
          )}

          {/* Cheek blush for happy states */}
          {(state === 'happy' || state === 'celebrating' || state === 'encouraging' || state === 'waving' || state === 'petted' || state === 'poked') && (
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

        {config.extraElements === 'giggle' && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/4 left-1/4 text-lg animate-sparkle-1">hehe</span>
            <span className="absolute top-1/3 right-1/4 text-sm animate-sparkle-2">teehee!</span>
          </div>
        )}

        {/* Brain Sparkle - Big celebration for routine completion */}
        {config.extraElements === 'brain_sparkle' && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-brain-glow">
              <span className="text-4xl">🧠</span>
              <span className="absolute -top-2 -right-2 text-2xl animate-sparkle-burst-1">✨</span>
              <span className="absolute -bottom-2 -left-2 text-xl animate-sparkle-burst-2">💫</span>
            </div>
            <span className="absolute top-1/4 left-1/5 text-2xl animate-particle-1">🌟</span>
            <span className="absolute top-1/3 right-1/5 text-xl animate-particle-2">⭐</span>
            <span className="absolute top-1/2 left-1/4 text-lg animate-particle-3">✨</span>
            <span className="absolute top-1/3 left-1/2 text-2xl animate-particle-4">🎉</span>
            <span className="absolute top-2/5 right-1/4 text-xl animate-particle-5">💫</span>
            <span className="absolute bottom-1/3 left-1/3 text-lg animate-particle-6">🌈</span>
          </div>
        )}

        {/* Dimmed overlay for night_mode and breathing states */}
        {config.dimmed && (
          <div className="absolute inset-0 bg-indigo-900/20 rounded-full pointer-events-none animate-fade-gentle" />
        )}
      </div>
    </div>
  );
}

// Disney-style Princess character
function ExpressivePrincess({ state, onTouch }: { state: AvatarState; onTouch?: (type: 'tap' | 'poke' | 'pet' | 'longpress') => void }) {
  const config = useMemo(() => EXPRESSION_CONFIG[state] || EXPRESSION_CONFIG.idle, [state]);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchInteraction(onTouch);

  // Princess-specific animations (replace tail with hair, ears with tiara)
  const hairAnimation = config.tailAnimation.replace('wag', 'sway') || 'animate-hair-flow';
  const tiaraAnimation = config.earAnimation || 'animate-tiara-sparkle';

  return (
    <div
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className={`relative ${config.bodyAnimation}`}>
        <svg viewBox="-30 -50 260 320" className="w-full h-full overflow-visible" style={{ minHeight: '350px', maxHeight: '500px' }}>
          <defs>
            <radialGradient id="princess-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD1DC" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E6E6FA" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dress-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DDA0DD" />
              <stop offset="50%" stopColor="#DA70D6" />
              <stop offset="100%" stopColor="#BA55D3" />
            </linearGradient>
            <linearGradient id="hair-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="100%" stopColor="#654321" />
            </linearGradient>
            <filter id="princess-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Magical glow */}
          <circle cx="100" cy="120" r="100" fill="url(#princess-glow)" className="animate-pulse-slow" />

          {/* Flowing dress */}
          <path
            d="M50 150 Q30 200 40 250 Q100 270 160 250 Q170 200 150 150 Q100 160 50 150"
            fill="url(#dress-gradient)"
            filter="url(#princess-shadow)"
          />

          {/* Dress details - lace trim */}
          <path
            d="M40 248 Q100 268 160 248"
            fill="none"
            stroke="#FFD700"
            strokeWidth="3"
            className="animate-shimmer"
          />

          {/* Body/torso */}
          <ellipse cx="100" cy="140" rx="35" ry="25" fill="#FFE4C4" filter="url(#princess-shadow)" />

          {/* Neck */}
          <ellipse cx="100" cy="115" rx="12" ry="15" fill="#FFE4C4" />

          {/* Head */}
          <ellipse cx="100" cy="70" rx="45" ry="50" fill="#FFE4C4" filter="url(#princess-shadow)" />

          {/* Hair - flowing locks with animation */}
          <g className={hairAnimation}>
            {/* Main hair volume */}
            <ellipse cx="100" cy="50" rx="55" ry="45" fill="url(#hair-gradient)" />
            {/* Side hair flowing left */}
            <path
              d="M45 50 Q30 100 35 160 Q40 180 50 170 Q55 120 55 70"
              fill="url(#hair-gradient)"
              className="animate-hair-sway-left"
            />
            {/* Side hair flowing right */}
            <path
              d="M155 50 Q170 100 165 160 Q160 180 150 170 Q145 120 145 70"
              fill="url(#hair-gradient)"
              className="animate-hair-sway-right"
            />
          </g>

          {/* Tiara */}
          <g className={tiaraAnimation}>
            <path
              d="M60 30 L75 10 L90 25 L100 5 L110 25 L125 10 L140 30"
              fill="#FFD700"
              stroke="#FFA500"
              strokeWidth="2"
            />
            {/* Gems */}
            <circle cx="100" cy="15" r="5" fill="#FF69B4" className="animate-gem-sparkle" />
            <circle cx="75" cy="20" r="3" fill="#87CEEB" className="animate-gem-sparkle-delay" />
            <circle cx="125" cy="20" r="3" fill="#87CEEB" className="animate-gem-sparkle-delay" />
          </g>

          {/* Face */}
          {/* Eye whites */}
          <ellipse cx="80" cy="70" rx="14" ry="12" fill="white" />
          <ellipse cx="120" cy="70" rx="14" ry="12" fill="white" />

          {/* Eyes */}
          <text x="80" y="76" fontSize="18" textAnchor="middle" fill="#4A4A4A" className="select-none">
            {config.eyes}
          </text>
          <text x="120" y="76" fontSize="18" textAnchor="middle" fill="#4A4A4A" className="select-none">
            {config.eyes}
          </text>

          {/* Eye shine */}
          {config.eyes !== '−' && config.eyes !== '◔' && config.eyes !== '><' && (
            <>
              <circle cx="84" cy="66" r="3" fill="white" opacity="0.9" />
              <circle cx="124" cy="66" r="3" fill="white" opacity="0.9" />
            </>
          )}

          {/* Eyelashes */}
          <path d="M66 65 Q68 60 72 63" stroke="#333" strokeWidth="1.5" fill="none" />
          <path d="M88 63 Q92 60 94 65" stroke="#333" strokeWidth="1.5" fill="none" />
          <path d="M106 65 Q108 60 112 63" stroke="#333" strokeWidth="1.5" fill="none" />
          <path d="M128 63 Q132 60 134 65" stroke="#333" strokeWidth="1.5" fill="none" />

          {/* Nose */}
          <ellipse cx="100" cy="85" rx="4" ry="3" fill="#DEB887" opacity="0.6" />

          {/* Mouth */}
          <text x="100" y="102" fontSize="18" textAnchor="middle" fill="#DB7093" className="select-none">
            {config.mouth}
          </text>

          {/* Blush */}
          {(state === 'happy' || state === 'celebrating' || state === 'encouraging' || state === 'petted' || state === 'poked') && (
            <>
              <ellipse cx="60" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.4" />
              <ellipse cx="140" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.4" />
            </>
          )}

          {/* Arms */}
          <ellipse cx="55" cy="160" rx="10" ry="25" fill="#FFE4C4" />
          <ellipse cx="145" cy="160" rx="10" ry="25" fill="#FFE4C4" />

          {/* Hands */}
          <circle cx="55" cy="185" r="8" fill="#FFE4C4" />
          <circle cx="145" cy="185" r="8" fill="#FFE4C4" />

          {/* Waving hand for wave state */}
          {config.extraElements === 'wave' && (
            <g className="animate-wave" style={{ transformOrigin: '145px 160px' }}>
              <ellipse cx="155" cy="140" rx="10" ry="25" fill="#FFE4C4" transform="rotate(-30 155 140)" />
              <circle cx="165" cy="120" r="8" fill="#FFE4C4" />
            </g>
          )}
        </svg>

        {/* Sparkles and effects */}
        {config.extraElements === 'sparkles' && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/4 left-1/4 text-2xl animate-sparkle-1">✨</span>
            <span className="absolute top-1/3 right-1/4 text-xl animate-sparkle-2">💫</span>
            <span className="absolute top-1/2 left-1/3 text-lg animate-sparkle-3">⭐</span>
          </div>
        )}

        {config.extraElements === 'hearts' && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/4 left-1/3 text-2xl animate-float-1">💖</span>
            <span className="absolute top-1/3 right-1/3 text-xl animate-float-2">💕</span>
          </div>
        )}

        {config.extraElements === 'giggle' && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/4 left-1/4 text-lg animate-sparkle-1 text-pink-400">tee-hee!</span>
            <span className="absolute top-1/3 right-1/4 text-sm animate-sparkle-2 text-purple-400">✨</span>
          </div>
        )}

        {config.extraElements === 'brain_sparkle' && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-brain-glow">
              <span className="text-4xl">👑</span>
              <span className="absolute -top-2 -right-2 text-2xl animate-sparkle-burst-1">✨</span>
              <span className="absolute -bottom-2 -left-2 text-xl animate-sparkle-burst-2">💫</span>
            </div>
            <span className="absolute top-1/4 left-1/5 text-2xl animate-particle-1">🌟</span>
            <span className="absolute top-1/3 right-1/5 text-xl animate-particle-2">⭐</span>
            <span className="absolute top-1/2 left-1/4 text-lg animate-particle-3">✨</span>
            <span className="absolute top-1/3 left-1/2 text-2xl animate-particle-4">🎀</span>
          </div>
        )}

        {config.dimmed && (
          <div className="absolute inset-0 bg-indigo-900/20 rounded-full pointer-events-none animate-fade-gentle" />
        )}
      </div>
    </div>
  );
}

export function Avatar({ state, character = 'puppy', className = '', onTouch }: AvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const riveLoadedRef = useRef(false);

  // Try to load Rive animation (only for puppy currently)
  const { rive, RiveComponent } = useRive({
    src: character === 'puppy' ? '/animations/puppy.riv' : '/animations/princess.riv',
    stateMachines: 'State Machine',
    autoplay: true,
    onLoad: () => {
      riveLoadedRef.current = true;
    },
    onLoadError: () => {
      riveLoadedRef.current = false;
    },
  });

  const stateInput = useStateMachineInput(rive, 'State Machine', 'state');

  useEffect(() => {
    if (stateInput) {
      stateInput.value = STATE_TO_INPUT[state];
    }
  }, [state, stateInput]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible ${className}`}
      style={{ minHeight: '350px' }}
    >
      {rive ? (
        <RiveComponent className="w-full h-full" />
      ) : character === 'princess' ? (
        <ExpressivePrincess state={state} onTouch={onTouch} />
      ) : (
        <ExpressivePuppy state={state} onTouch={onTouch} />
      )}
    </div>
  );
}
