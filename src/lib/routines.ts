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
  // ========================================
  // NEW ENGAGEMENT-FOCUSED ROUTINES
  // "Sugary" content with Paw Patrol energy
  // ========================================
  {
    id: 'after-school',
    name: 'After-School Wind-Down',
    icon: '🎒',
    triggerPhrases: [
      'after school',
      'back from school',
      'got home',
      'home from school',
      'how was your day',
      'just got back',
      'finished school',
    ],
    steps: [
      {
        id: 'afterschool-1',
        instruction: "Hey hey hey! You're BACK! I missed you SO much! Tell me, how was your day?",
        encouragement: "Wow, that sounds amazing! I love hearing about your adventures!",
        microSteps: [
          'Take a deep breath',
          'Think about one fun thing',
          'Tell me about it!',
        ],
      },
      {
        id: 'afterschool-2',
        instruction: "Okay okay okay! Let's do something FUN together! Should we draw something cool or build with blocks? You pick!",
        encouragement: "GREAT choice! You always pick the best things!",
        microSteps: [
          'Think about what sounds fun',
          'Say drawing or building',
        ],
      },
      {
        id: 'afterschool-3',
        instruction: "Woohoo! Let's GO! What color should we use first? Blue like the sky or green like the grass?",
        encouragement: "Ooh that's my FAVORITE! You have such good taste!",
        microSteps: [
          'Look at the colors',
          'Pick your favorite one',
        ],
      },
      {
        id: 'afterschool-4',
        instruction: "You're doing SO great! What should we add next? Something big or something small?",
        encouragement: "PERFECT! This is looking INCREDIBLE!",
        microSteps: [
          'Think about what would look cool',
          'Add it to your creation',
        ],
      },
      {
        id: 'afterschool-5',
        instruction: "Okay friend, you said you were feeling tired earlier. Want to pick a yummy snack or find a cozy spot to rest?",
        encouragement: "That's such a smart choice! You know what you need!",
        microSteps: [
          'Think about how your body feels',
          'Pick snack or rest',
        ],
      },
      {
        id: 'afterschool-6',
        instruction: "You are absolutely AMAZING! We had SO much fun together! Give yourself a big hug - you deserve it!",
        encouragement: "I'm SO proud of you! You're the BEST! See you soon, superstar!",
        microSteps: [
          'Take a deep breath',
          'Give yourself a hug',
          'Smile big!',
        ],
      },
    ],
  },
  {
    id: 'bedtime',
    name: 'Bedtime Calm',
    icon: '🌙',
    triggerPhrases: [
      'bedtime',
      'going to sleep',
      'sleepy',
      'night time',
      'time for bed',
      'go to bed',
      'tired',
      'ready for sleep',
    ],
    steps: [
      {
        id: 'bedtime-1',
        instruction: "Hey there, sleepy friend. It's getting to be nighttime. Let's get cozy together, okay?",
        encouragement: "There you go, nice and comfy.",
        microSteps: [
          'Find a cozy spot',
          'Get comfortable',
        ],
      },
      {
        id: 'bedtime-2',
        instruction: "Let's breathe together. Breathe IN with me... and now OUT. Say 'in' when you breathe in!",
        encouragement: "Perfect breathing! You sound so calm.",
        microSteps: [
          'Breathe in slowly',
          'Say in',
          'Breathe out slowly',
          'Say out',
        ],
      },
      {
        id: 'bedtime-3',
        instruction: "Again... IN... and OUT. Feel your tummy going up and down. You're doing great!",
        encouragement: "So peaceful. You're a breathing champion!",
        microSteps: [
          'Feel your tummy rise',
          'Feel it fall back down',
        ],
      },
      {
        id: 'bedtime-4',
        instruction: "Now let's do a little story! Once upon a time, a little puppy went to the... where did the puppy go? You say it!",
        encouragement: "Ooh yes! That's a wonderful place for a puppy adventure!",
        microSteps: [
          'Think of a fun place',
          'Say it out loud',
        ],
      },
      {
        id: 'bedtime-5',
        instruction: "And at that place, the puppy found a magical... what did the puppy find?",
        encouragement: "Wow! What a special discovery! I love this story!",
        microSteps: [
          'Imagine something magical',
          'Tell me what it is',
        ],
      },
      {
        id: 'bedtime-6',
        instruction: "The puppy was so happy and sleepy. Just like you! Let's do one more slow breath... IN... and OUT.",
        encouragement: "Beautiful. You're ready for sweet dreams.",
        microSteps: [
          'Close your eyes if you want',
          'One big breath in',
          'Let it all out',
        ],
      },
      {
        id: 'bedtime-7',
        instruction: "Good night, sweet friend. I loved hearing your voice today. Sweet dreams!",
        encouragement: "Sleep tight. You made today wonderful. I'll see you tomorrow!",
        microSteps: [
          'Snuggle into bed',
          'Close your eyes',
        ],
      },
    ],
  },
  {
    id: 'reading',
    name: 'Reading Time',
    icon: '📚',
    triggerPhrases: [
      'read',
      'reading',
      'story time',
      'book',
      'let\'s read',
      'time to read',
      'read together',
      'read a book',
    ],
    steps: [
      {
        id: 'reading-1',
        instruction: "READING TIME! Let's power up our super reading muscles! Stand up and shake it out with me - shake shake SHAKE!",
        encouragement: "WOO! Your brain is all powered up!",
        microSteps: [
          'Stand up tall',
          'Shake your arms',
          'Shake your legs',
        ],
      },
      {
        id: 'reading-2',
        instruction: "Count with me! ONE... TWO... THREE! Now let's sit down and get ready to read!",
        encouragement: "Great counting! You're SO ready!",
        microSteps: [
          'Count out loud with me',
          'Find a comfy reading spot',
        ],
      },
      {
        id: 'reading-3',
        instruction: "I'll read one part, then YOU read the next part! Ready? Here we go!",
        encouragement: "WOW! Your reading voice is AMAZING!",
        microSteps: [
          'Listen when I read',
          'Then it\'s your turn!',
        ],
      },
      {
        id: 'reading-4',
        instruction: "Keep going! You're doing SO well! Read the next line to me!",
        encouragement: "Incredible! You're a reading SUPERSTAR!",
        microSteps: [
          'Find the next words',
          'Say them nice and clear',
        ],
      },
      {
        id: 'reading-5',
        instruction: "Okay brain quiz! In the story, who was the happiest? Why do you think they were happy?",
        encouragement: "SMART answer! You really understood the story!",
        microSteps: [
          'Think about the story',
          'Tell me who was happy',
          'Tell me why',
        ],
      },
      {
        id: 'reading-6',
        instruction: "You did it! BRAIN SPARKLE TIME! Your brain just got bigger and stronger! You're AMAZING!",
        encouragement: "Reading champion! Superstar! I'm SO proud of you!",
        microSteps: [
          'Do a happy dance',
          'Give yourself a high five',
        ],
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
