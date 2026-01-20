# NeuroBuddy

**An AI-powered animated companion designed specifically for children with Down syndrome to help them navigate daily routines through voice interaction.**

NeuroBuddy is a warm, patient, and encouraging virtual puppy friend that guides children through everyday tasks like brushing teeth, putting on shoes, and getting dressed. Using voice interaction and adaptive communication, NeuroBuddy meets each child where they are.

## Why NeuroBuddy?

Children with Down syndrome often benefit from:
- **Consistent routines** - NeuroBuddy provides the same patient guidance every time
- **Simple, clear instructions** - Adapts communication level (gestures, short phrases, or full sentences)
- **Positive reinforcement** - Celebrates every small victory with enthusiasm
- **Patience without frustration** - Never gets tired, never gets impatient
- **Personalization** - Incorporates the child's interests into conversations
- **Sensory accommodation** - Adjusts voice volume and speed for sensory preferences

## Live Demo

**[Try NeuroBuddy Now](https://neurobuddy-web.vercel.app)**

## Features

- **Voice Interaction** - Listens and responds naturally using speech recognition
- **High-Quality Speech** - ElevenLabs AI voice (Charlotte) provides warm, nurturing audio
- **Routine Guidance** - Step-by-step help with daily tasks:
  - Putting on a coat
  - Brushing teeth
  - Putting on shoes
- **Adaptive Communication** - Three levels: gestures, short phrases, full sentences
- **Frustration Detection** - Recognizes when child is struggling and offers help
- **Help Alert System** - Notifies caregivers when child needs assistance
- **Offline Support** - Falls back to browser TTS and encouraging phrases when offline
- **Parent Controls** - PIN-protected settings to customize the experience
- **Privacy First** - All data stored locally on device (IndexedDB), no cloud storage

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **State Management**: Zustand
- **AI Chat**: OpenAI GPT-4o
- **Text-to-Speech**: ElevenLabs API (with browser TTS fallback)
- **Speech Recognition**: Web Speech API
- **Animation**: Rive (with SVG fallback)
- **Storage**: IndexedDB
- **Styling**: Tailwind CSS 4

## Installation

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- OpenAI API key
- ElevenLabs API key (optional but recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/snakezilla/neurobuddy-web.git
cd neurobuddy-web
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Required: OpenAI API Key for chat functionality
OPENAI_API_KEY=sk-proj-your-key-here

# Optional but recommended: ElevenLabs for high-quality voice
ELEVENLABS_API_KEY=sk_your-key-here
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

## Usage Guide

### First-Time Setup (Parent/Caregiver)

1. **Open NeuroBuddy** - The onboarding wizard appears
2. **Enter Child's Info**:
   - Name
   - Things they love (used for personalization)
   - Things to avoid (never mentioned by buddy)
3. **Set Communication Level**:
   - **Gestures** - Very simple 3-5 word responses
   - **Short phrases** - 5-8 word sentences
   - **Full sentences** - Complete friendly sentences
4. **Choose Sensory Preference**:
   - **Quiet & calm** - Softer, slower voice
   - **Normal** - Standard volume
   - **Visual emphasis** - Describes visual cues
5. **Describe Challenges** - Areas where extra support is needed
6. **Set Parent PIN** - 4-digit PIN to protect settings

### Daily Use (Child)

1. **Tap the microphone button** to start talking
2. **Say what you want to do** - "I need to brush my teeth"
3. **Follow the friendly instructions** from the puppy
4. **Say when you're done** - "I did it!" or "All done!"
5. **The puppy celebrates with you!**

### Routine Triggers

Say these phrases to start guided routines:
- **Coat**: "put on my coat", "need my coat", "jacket"
- **Teeth**: "brush my teeth", "brushing teeth", "toothbrush"
- **Shoes**: "put on shoes", "need my shoes", "getting my shoes"

### Parent Settings

1. Tap the **gear icon** (top right)
2. Enter your **4-digit PIN**
3. Modify profile, communication level, or PIN
4. Changes take effect immediately

## Browser Support

| Browser | Speech Recognition | Recommendation |
|---------|-------------------|----------------|
| Chrome | Excellent | **Best choice** |
| Edge | Good | Works well |
| Firefox | Limited (Beta) | May have issues |
| Safari | Limited | Not recommended |

**For the best experience, use Chrome or Edge on desktop or Android.**

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts    # OpenAI chat endpoint
│   │   └── tts/route.ts     # ElevenLabs TTS endpoint
│   ├── globals.css          # Tailwind + animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main app entry
├── components/
│   ├── Avatar.tsx           # Animated puppy
│   ├── Companion.tsx        # Main interactive screen
│   ├── ErrorBoundary.tsx    # Error handling
│   ├── Onboarding.tsx       # Setup wizard
│   ├── PinEntry.tsx         # PIN verification
│   └── Settings.tsx         # Parent settings
├── hooks/
│   ├── useSpeechRecognition.ts
│   └── useTTS.ts
├── lib/
│   ├── routines.ts          # Routine definitions
│   └── storage.ts           # IndexedDB operations
├── store/
│   └── index.ts             # Zustand state
└── types/
    └── index.ts             # TypeScript types
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
4. Deploy!

### Environment Variables in Vercel

```bash
# Using Vercel CLI
vercel env add OPENAI_API_KEY production
vercel env add ELEVENLABS_API_KEY production
```

## Known Issues & Debugging

See [docs/DEBUGGING.md](docs/DEBUGGING.md) for:
- Known issues and their status
- Performance considerations
- Browser compatibility details

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to ensure no errors
5. Submit a pull request

## License

MIT License - feel free to use and modify for your own projects.

## Acknowledgments

- Inspired by the need for patient, consistent support for children with Down syndrome
- Built with love using Next.js, OpenAI, and ElevenLabs
- Avatar concept: A friendly, non-threatening puppy companion

---

**Made with love for special children who deserve the most patient friend in the world.**
