/**
 * Library of curated typing race passages across difficulty levels and categories.
 */
const TEXT_LIBRARY = [
  // --- EASY (Sprint / Casual, 20-35 words, clean vocabulary) ---
  {
    id: "e1",
    category: "Philosophy",
    difficulty: "easy",
    source: "Marcus Aurelius",
    text: "The happiness of your life depends upon the quality of your thoughts. Waste no more time arguing about what a good man should be. Be one."
  },
  {
    id: "e2",
    category: "Inspiration",
    difficulty: "easy",
    source: "Steve Jobs",
    text: "The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle for anything less."
  },
  {
    id: "e3",
    category: "Racing",
    difficulty: "easy",
    source: "Mario Andretti",
    text: "If everything seems under control, you are just not going fast enough. Push the throttle down, feel the tires grip the asphalt, and never look back."
  },
  {
    id: "e4",
    category: "Gaming",
    difficulty: "easy",
    source: "Portal",
    text: "This was a triumph. I'm making a note here: huge success. It's hard to overstate my satisfaction with the progress we have made today."
  },
  {
    id: "e5",
    category: "Technology",
    difficulty: "easy",
    source: "Alan Kay",
    text: "The best way to predict the future is to invent it. Every line of code written with clarity and purpose shapes tomorrow's world."
  },
  {
    id: "e6",
    category: "Adventure",
    difficulty: "easy",
    source: "The Hobbit",
    text: "Not all those who wander are lost. The old that is strong does not wither, and deep roots are never reached by the cold winter frost."
  },

  // --- MEDIUM (Standard Circuit, 45-70 words, balanced vocabulary & punctuation) ---
  {
    id: "m1",
    category: "Sci-Fi",
    difficulty: "medium",
    source: "Blade Runner",
    text: "I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time, like tears in rain. Time to drive forward."
  },
  {
    id: "m2",
    category: "Cyberpunk",
    difficulty: "medium",
    source: "William Gibson, Neuromancer",
    text: "The sky above the port was the color of television, tuned to a dead channel. Behind the neon signs and roaring engines, the digital frontier opened up with lightning speed. Keystrokes pulsed like fiber-optic currents flowing directly through the machine."
  },
  {
    id: "m3",
    category: "Motorsport",
    difficulty: "medium",
    source: "Ayrton Senna",
    text: "And suddenly I realized that I was no longer driving the car consciously. I was driving it by a kind of instinct, only I was in a different dimension. The track was just a tunnel, and I was going faster and faster, completely focused on the finish line."
  },
  {
    id: "m4",
    category: "Coding",
    difficulty: "medium",
    source: "Linus Torvalds",
    text: "Talk is cheap. Show me the code. Software development is not about memorizing complex syntax; it is about decomposing overwhelming problems into elegant, testable components that perform under pressure without stuttering or breaking."
  },
  {
    id: "m5",
    category: "Space",
    difficulty: "medium",
    source: "Carl Sagan, Cosmos",
    text: "The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself. Across the cosmic ocean, light travels billions of years to reach our eyes, reminding us that curiosity is our greatest evolutionary gift."
  },
  {
    id: "m6",
    category: "Cinema",
    difficulty: "medium",
    source: "The Matrix",
    text: "You take the blue pill, the story ends, you wake up in your bed and believe whatever you want to believe. You take the red pill, you stay in Wonderland, and I show you how deep the rabbit hole goes. Remember: all I'm offering is the truth."
  },
  {
    id: "m7",
    category: "Speed",
    difficulty: "medium",
    source: "Fast & Furious",
    text: "It don't matter if you win by an inch or a mile. Winning's winning. Ask any racer, any real racer. You put your foot on the floor, listen to the twin turbos spool, and trust your instincts as the checkered flag approaches."
  },

  // --- HARD (Grand Prix, 70-100 words, rich vocabulary, numbers & punctuation) ---
  {
    id: "h1",
    category: "Science",
    difficulty: "hard",
    source: "Richard Feynman",
    text: "Nature uses only the longest threads to weave her patterns, so each small piece of her fabric reveals the organization of the entire tapestry. If you thought that science was certain, well, that is just an error on your part! We are always trying to find what is doubtful, and in doing so, we sharpen our understanding of the universe."
  },
  {
    id: "h2",
    category: "Literature",
    difficulty: "hard",
    source: "Herman Melville, Moby Dick",
    text: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation."
  },
  {
    id: "h3",
    category: "Cyberpunk",
    difficulty: "hard",
    source: "Ghost in the Shell",
    text: "There are countless ingredients that make up the human body and mind, like all the components that constitute me as an individual with my own personality. There is a face and a voice to distinguish myself from others, the hand you see now, and the memories that belong exclusively to my synthetic neural pathways."
  },
  {
    id: "h4",
    category: "Technology",
    difficulty: "hard",
    source: "Ada Lovelace",
    text: "The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves. In distributing and combining computing mechanisms, we find that numerical operations can be transmuted into general symbolic logic, anticipating algorithmic machines centuries ahead of their practical realization."
  }
];

function getRandomText(difficulty = "all") {
  let pool = TEXT_LIBRARY;
  if (difficulty && difficulty !== "all") {
    const filtered = TEXT_LIBRARY.filter(t => t.difficulty === difficulty);
    if (filtered.length > 0) pool = filtered;
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

