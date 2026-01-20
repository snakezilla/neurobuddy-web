import type { Routine } from '@/types';

// Pre-defined routines with scripted backbone
export const ROUTINES: Routine[] = [
  {
    id: 'coat',
    name: 'Put On Coat',
    icon: '🧥',
    triggerPhrases: [
      'coat',
      'jacket',
      'going outside',
      'cold',
      'leaving',
      'put on',
      'get dressed',
    ],
    steps: [
      {
        id: 'coat-1',
        instruction: "First, let's find your coat! Can you see it?",
        encouragement: "Great job looking! You're doing so well!",
        microSteps: [
          'Look around the room',
          'Check the hook by the door',
          'Check your bedroom',
        ],
      },
      {
        id: 'coat-2',
        instruction: 'Now pick up your coat and hold it in front of you.',
        encouragement: "You've got it! That's perfect!",
        microSteps: [
          'Grab the coat with both hands',
          'Hold it so you can see the inside',
        ],
      },
      {
        id: 'coat-3',
        instruction: "Find the arm hole and put your arm in. Let's start with your right arm!",
        encouragement: "Awesome! Your arm is going in!",
        microSteps: [
          'Find the right sleeve',
          'Push your arm through slowly',
          'Keep pushing until your hand comes out',
        ],
      },
      {
        id: 'coat-4',
        instruction: 'Now swing the coat behind you and find the other arm hole.',
        encouragement: "You're almost there! Keep going!",
        microSteps: [
          'Swing the coat around your back',
          'Reach behind to find the other sleeve',
        ],
      },
      {
        id: 'coat-5',
        instruction: 'Put your other arm in the sleeve!',
        encouragement: 'Amazing! Both arms are in!',
        microSteps: [
          'Push your arm through',
          'Wiggle your hand out the end',
        ],
      },
      {
        id: 'coat-6',
        instruction: "Now let's zip up your coat to stay warm!",
        encouragement: "You did it! Your coat is on! I'm so proud of you!",
        microSteps: [
          'Find the zipper at the bottom',
          'Connect the two parts',
          'Pull the zipper up slowly',
        ],
      },
    ],
  },
  {
    id: 'teeth',
    name: 'Brush Teeth',
    icon: '🦷',
    triggerPhrases: [
      'teeth',
      'brush',
      'toothbrush',
      'toothpaste',
      'bedtime',
      'morning routine',
    ],
    steps: [
      {
        id: 'teeth-1',
        instruction: "Let's go to the bathroom and find your toothbrush!",
        encouragement: 'Great! You found it!',
        microSteps: ['Walk to the bathroom', 'Look for your toothbrush'],
      },
      {
        id: 'teeth-2',
        instruction: 'Now put a little bit of toothpaste on your toothbrush.',
        encouragement: 'Perfect amount! Well done!',
        microSteps: [
          'Pick up the toothpaste',
          'Squeeze a pea-sized amount',
          'Put the cap back on',
        ],
      },
      {
        id: 'teeth-3',
        instruction: 'Turn on the water just a little bit and wet your toothbrush.',
        encouragement: "Nice! You're ready to brush!",
        microSteps: ['Turn the tap', 'Put toothbrush under water quickly'],
      },
      {
        id: 'teeth-4',
        instruction: "Now brush your front teeth! Move up and down, like this: up, down, up, down!",
        encouragement: 'Great brushing! Those teeth are getting so clean!',
        microSteps: ['Brush top front teeth', 'Brush bottom front teeth'],
      },
      {
        id: 'teeth-5',
        instruction: "Now brush the sides! Open wide and brush the teeth on the side.",
        encouragement: 'Wonderful! Keep going!',
        microSteps: ['Brush left side', 'Brush right side'],
      },
      {
        id: 'teeth-6',
        instruction: "Don't forget the back teeth! Brush in circles back there.",
        encouragement: "You're doing amazing!",
        microSteps: ['Reach to the back', 'Brush in small circles'],
      },
      {
        id: 'teeth-7',
        instruction: 'Now spit out the toothpaste and rinse your mouth with water.',
        encouragement: "Perfect! Your teeth are sparkling clean! I'm so proud of you!",
        microSteps: ['Spit into sink', 'Take a sip of water', 'Swish and spit'],
      },
    ],
  },
  {
    id: 'shoes',
    name: 'Put On Shoes',
    icon: '👟',
    triggerPhrases: [
      'shoes',
      'sneakers',
      'boots',
      'sandals',
      'footwear',
      'going out',
    ],
    steps: [
      {
        id: 'shoes-1',
        instruction: "Let's find your shoes! Where do you keep them?",
        encouragement: 'Great job finding your shoes!',
        microSteps: ['Look by the door', 'Check your room', 'Look in the closet'],
      },
      {
        id: 'shoes-2',
        instruction: 'Sit down somewhere comfy so we can put them on.',
        encouragement: 'Perfect! Now we can focus.',
        microSteps: ['Find a chair or the floor', 'Sit down safely'],
      },
      {
        id: 'shoes-3',
        instruction: 'Pick up one shoe. Can you tell which foot it goes on?',
        encouragement: "That's right! You know your shoes!",
        microSteps: ['Look at the shape', 'Match it to your foot'],
      },
      {
        id: 'shoes-4',
        instruction: 'Loosen the shoe and slide your foot in.',
        encouragement: 'Your foot is going in! Great job!',
        microSteps: ['Open the shoe wide', 'Point your toes', 'Push your foot in'],
      },
      {
        id: 'shoes-5',
        instruction: "Now do the same with the other shoe!",
        encouragement: 'Amazing! Both shoes are on!',
        microSteps: ['Pick up the other shoe', 'Slide your foot in'],
      },
      {
        id: 'shoes-6',
        instruction: "If your shoes have velcro or laces, let's fasten them!",
        encouragement: "You did it! You're ready to go! I'm so proud of you!",
        microSteps: ['Press velcro together', 'Or tie the laces'],
      },
    ],
  },
];

// Find a routine that matches the user's speech
export function findRoutineByTrigger(text: string): Routine | null {
  const lowerText = text.toLowerCase();
  for (const routine of ROUTINES) {
    for (const phrase of routine.triggerPhrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        return routine;
      }
    }
  }
  return null;
}

// Get routine by ID
export function getRoutineById(id: string): Routine | null {
  return ROUTINES.find((r) => r.id === id) || null;
}
