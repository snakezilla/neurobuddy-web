# NeuroBuddy Debugging & Known Issues

This document tracks remaining issues that should be addressed for production readiness.

## Fixed Issues (v1.1.0)

The following issues have been resolved:

| # | Issue | Status |
|---|-------|--------|
| 2 | ElevenLabs API key validation | **Fixed** - Returns 503 if not configured |
| 3 | OpenAI API key validation | **Fixed** - Returns 503 if not configured |
| 4 | Race condition in transcript processing | **Fixed** - Queue-based processing |
| 5 | Missing input validation | **Fixed** - Zod schemas added |
| 6 | Memory leak in TTS audio URLs | **Fixed** - Proper cleanup in all paths |
| 7 | Stale data in routine advancement | **Fixed** - Calculate index before state update |
| 8 | Console.log in production | **Fixed** - All removed |
| 9 | No TTS loading state | **Fixed** - `isLoading` state added |
| 10 | No debounce on speech recognition | **Fixed** - 300ms debounce via queue |
| 11 | Avatar re-renders every 2.5s | **Fixed** - CSS-only animations |
| 12 | No error boundary | **Fixed** - ErrorBoundary component |
| 13 | No rate limiting | **Fixed** - 30/min chat, 20/min TTS |

---

## Remaining Issues (Priority Order)

### CRITICAL - Security

#### 1. Weak PIN Hashing
**File:** `src/lib/storage.ts:37-45`
**Severity:** CRITICAL
**Status:** Open

The current PIN hashing uses a simple djb2-style hash:
```typescript
export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
```

**Problem:** 4-digit PINs have only 10,000 combinations. This hash can be brute-forced in milliseconds.

**Recommended Fix:** Use Web Crypto API with PBKDF2:
```typescript
async function hashPinSecure(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}
```

---

### MEDIUM - User Experience

#### 2. PWA Icons Missing
**File:** `public/manifest.json:10-20`
**Severity:** MEDIUM
**Status:** Open

The manifest references icons that don't exist:
```json
"icons": [
  { "src": "/icon-192.png", ... },
  { "src": "/icon-512.png", ... }
]
```

**Impact:** PWA "Add to Home Screen" shows broken/default icon.

**Fix:** Create and add icon files to `/public/`:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

---

#### 3. Voice Selection Bug on First Use
**File:** `src/hooks/useTTS.ts:38-48`
**Severity:** MEDIUM
**Status:** Open

`speechSynthesis.getVoices()` returns empty array on first call before voices load.

**Impact:** First TTS may use harsh default voice instead of friendly Samantha/Zira.

**Fix:**
```typescript
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        resolve(speechSynthesis.getVoices());
      };
    }
  });
};
```

---

#### 4. Message History Unbounded
**File:** `src/store/index.ts:92-102`
**Severity:** MEDIUM
**Status:** Open

Messages grow indefinitely:
```typescript
addMessage: (message) =>
  set((state) => ({
    messages: [...state.messages, message], // No limit!
  })),
```

**Impact:** Memory bloat over long sessions, potential crash.

**Fix:**
```typescript
messages: [...state.messages, newMessage].slice(-100), // Keep last 100
```

---

### LOW - Code Quality

#### 5. Accessibility: Missing Focus Management
**File:** `src/components/PinEntry.tsx`
**Severity:** LOW
**Status:** Open

PIN entry lacks focus trap and keyboard navigation.

---

#### 6. Accessibility: Missing aria-live Regions
**File:** `src/components/Companion.tsx`
**Severity:** LOW
**Status:** Open

Status updates (speaking, listening) not announced to screen readers.

**Fix:** Add `aria-live="polite"` to status indicators.

---

#### 7. Magic Numbers Without Constants
**Files:** Multiple
**Severity:** LOW
**Status:** Open

Examples:
- `10` for conversation history limit
- `150` for max tokens
- `10000` for retry timeout
- `300` for debounce delay

**Fix:** Extract to named constants:
```typescript
const CONFIG = {
  MAX_CONVERSATION_HISTORY: 10,
  MAX_TOKENS: 150,
  API_RETRY_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 300,
};
```

---

#### 8. Unused Code - clearAllData Function
**File:** `src/lib/storage.ts:90-94`
**Severity:** LOW
**Status:** Open

`clearAllData` is exported but never used.

---

#### 9. Font Override in globals.css
**File:** `src/app/globals.css:11`
**Severity:** LOW
**Status:** Open

```css
font-family: Arial, Helvetica, sans-serif;
```

This overrides the Inter font loaded in layout.tsx.

---

## Performance Monitoring

### Recommended Metrics to Track
1. **API Response Time** - OpenAI chat endpoint latency
2. **TTS Generation Time** - ElevenLabs response time
3. **Speech Recognition Accuracy** - Successful transcription rate
4. **Error Rate** - API failures per session
5. **Memory Usage** - Track for long sessions

### Suggested Tools
- Vercel Analytics (built-in)
- Sentry for error tracking
- LogRocket for session replay

---

## Browser Compatibility Notes

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web Speech API (SR) | Excellent | Beta | Limited | Good |
| SpeechSynthesis (TTS) | Good | Good | Good | Good |
| IndexedDB | Good | Good | Good | Good |
| Rive Animation | Good | Good | Good | Good |

**Best Experience:** Chrome or Edge on desktop/Android. Safari has limited speech recognition support.

---

## Contributing

When fixing issues:
1. Create a branch from `main`
2. Reference issue number in commit
3. Update this file when issue is resolved
4. Run `npm run build` to verify no regressions
