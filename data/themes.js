// Bee4 to Tokyo — Brainstorm Themes (Task 4)
// Based on real past paper formats:
//   Bee 3: COUNTRYSIDE
//   Bee 4: WEATHER
//   Bee 5: PERSONALITY
//
// Each theme has 5 questions: definition + first letter + accepted answers (≥5 letters)

export const BRAINSTORM_THEMES = [
  // ============================================================
  // BEE 4 THEMES (60%)
  // ============================================================
  {
    id: "weather",
    name: "WEATHER",
    level: 4,
    icon: "🌦",
    description: "Storms, climate, and atmospheric conditions",
    // Real past paper questions
    questions: [
      { letter: "B", def: "A severe snow storm with strong winds.",                              answers: ["blizzard"] },
      { letter: "C", def: "Quite cold, sounds like a South American country.",                   answers: ["chilly"] },
      { letter: "D", def: "Rain in very small, light drops; light rain.",                        answers: ["drizzle", "drizzling"] },
      { letter: "F", def: "A sudden light fall of snow, blown in different directions by the wind.", answers: ["flurry"] },
      { letter: "H", def: "A period of time such as a few weeks when the weather is much hotter than usual.", answers: ["heatwave"] },
      // Additional questions for variety
      { letter: "T", def: "A storm with thunder and lightning.",                                 answers: ["thunder", "thunderstorm"] },
      { letter: "M", def: "Tiny drops of water in the air that make it hard to see.",            answers: ["mist"] },
      { letter: "S", def: "Bright light and warmth from the sun.",                               answers: ["sunshine", "scorching"] },
      { letter: "F", def: "Frozen water that falls from clouds in cold weather.",                answers: ["frost", "freezing"] },
      { letter: "H", def: "A violent tropical storm with very strong winds.",                    answers: ["hurricane"] },
    ],
  },
  {
    id: "food",
    name: "FOOD AND COOKING",
    level: 4,
    icon: "🍽",
    description: "Dishes, ingredients, and cuisine",
    questions: [
      { letter: "A", def: "A small dish served before the main meal.",                           answers: ["appetizer", "appetiser"] },
      { letter: "B", def: "A long, thin loaf of French bread.",                                  answers: ["baguette"] },
      { letter: "C", def: "A buttery, crescent-shaped French pastry.",                           answers: ["croissant"] },
      { letter: "D", def: "A sweet course served at the end of a meal.",                         answers: ["dessert"] },
      { letter: "I", def: "One of the foods used to make a particular dish.",                    answers: ["ingredient"] },
      { letter: "S", def: "Long thin Italian pasta strings.",                                    answers: ["spaghetti"] },
      { letter: "C", def: "A brown spice from tree bark used in cooking.",                       answers: ["cinnamon"] },
      { letter: "P", def: "A thin flat cake made from batter.",                                  answers: ["pancake"] },
    ],
  },
  {
    id: "sports",
    name: "SPORTS",
    level: 4,
    icon: "⚽",
    description: "Olympic and team sports",
    questions: [
      { letter: "A", def: "The sport of shooting arrows from a bow.",                            answers: ["archery"] },
      { letter: "B", def: "A sport played with rackets and a shuttlecock.",                      answers: ["badminton"] },
      { letter: "G", def: "A sport of physical exercises like flips and balances.",              answers: ["gymnastics"] },
      { letter: "M", def: "A long-distance running race of about 42 km.",                        answers: ["marathon"] },
      { letter: "V", def: "A team sport where players hit a ball over a high net.",              answers: ["volleyball"] },
      { letter: "W", def: "A sport where two people fight without weapons, on a mat.",           answers: ["wrestling"] },
      { letter: "C", def: "The sport of riding bicycles in a race or for fitness.",              answers: ["cycling"] },
      { letter: "F", def: "The sport of fighting with thin swords.",                             answers: ["fencing"] },
    ],
  },
  {
    id: "transport",
    name: "TRANSPORT",
    level: 4,
    icon: "🚗",
    description: "Vehicles by land, sea, and air",
    questions: [
      { letter: "B", def: "A two-wheeled vehicle you ride by pedalling.",                        answers: ["bicycle"] },
      { letter: "H", def: "An aircraft with rotating blades on top.",                            answers: ["helicopter"] },
      { letter: "A", def: "A vehicle for taking sick people to hospital.",                       answers: ["ambulance"] },
      { letter: "M", def: "A two-wheeled vehicle with a powerful engine.",                       answers: ["motorcycle"] },
      { letter: "S", def: "A boat that travels under water.",                                    answers: ["submarine"] },
      { letter: "E", def: "A moving staircase between floors.",                                  answers: ["escalator"] },
      { letter: "T", def: "A vehicle used on farms to pull heavy equipment.",                    answers: ["tractor"] },
      { letter: "C", def: "A vehicle with wheels, often pulled by horses.",                      answers: ["carriage"] },
    ],
  },

  // ============================================================
  // BEE 5 THEMES (30%)
  // ============================================================
  {
    id: "personality",
    name: "PERSONALITY",
    level: 5,
    icon: "🎭",
    description: "Character traits and personalities",
    // Real past paper questions
    questions: [
      { letter: "A", def: "A person who shows that they love or like someone.",                  answers: ["admirer"] },
      { letter: "M", def: "One day he is happy, the next day he is sad.",                        answers: ["moody"] },
      { letter: "F", def: "A person who can always change to adapt to new situations.",          answers: ["flexible"] },
      { letter: "A", def: "Describes somebody who wants to achieve a lot in life.",              answers: ["ambitious"] },
      { letter: "I", def: "Describes a person who is not confident about themself.",             answers: ["insecure"] },
      // Additional
      { letter: "C", def: "Describes a person who is full of energy and joy.",                   answers: ["cheerful"] },
      { letter: "S", def: "Describes someone who is shy and quiet around new people.",           answers: ["shy", "silent"] },
      { letter: "G", def: "Describes a kind, friendly person who is willing to give freely.",    answers: ["generous"] },
      { letter: "S", def: "Describes someone who works hard and has high standards.",            answers: ["studious"] },
      { letter: "C", def: "Describes someone who is calm and not easily upset.",                 answers: ["composed"] },
    ],
  },
  {
    id: "emotions",
    name: "EMOTIONS",
    level: 5,
    icon: "💭",
    description: "Feelings and moods",
    questions: [
      { letter: "B", def: "Very confused; unable to understand what is happening.",              answers: ["bewildered"] },
      { letter: "E", def: "Extremely happy.",                                                    answers: ["ecstatic"] },
      { letter: "F", def: "Extremely angry.",                                                    answers: ["furious"] },
      { letter: "M", def: "Very unhappy.",                                                       answers: ["miserable"] },
      { letter: "R", def: "Glad that something bad has ended or didn't happen.",                 answers: ["relieved"] },
      { letter: "T", def: "Extremely excited and pleased.",                                      answers: ["thrilled"] },
      { letter: "A", def: "Worried or nervous about something.",                                 answers: ["anxious"] },
      { letter: "D", def: "Very pleased and happy.",                                             answers: ["delighted"] },
    ],
  },

  // ============================================================
  // BEE 3 THEMES (10%)
  // ============================================================
  {
    id: "countryside",
    name: "COUNTRYSIDE",
    level: 3,
    icon: "🌾",
    description: "Rural landscapes and nature",
    // Real past paper questions
    questions: [
      { letter: "F", def: "A large area of land with grass or crops.",                           answers: ["fields", "forest"] },
      { letter: "S", def: "A popular activity you can do in the snowy mountains.",               answers: ["skiing", "sledding"] },
      { letter: "W", def: "The animals and plants of the natural world.",                        answers: ["wildlife"] },
      { letter: "C", def: "A small house in the countryside.",                                   answers: ["cabin", "cottage"] },
      { letter: "S", def: "A continuous body of surface water flowing within banks.",            answers: ["stream"] },
      // Additional
      { letter: "M", def: "A very high natural rise of land.",                                   answers: ["mountain"] },
      { letter: "V", def: "A small group of houses in the countryside.",                         answers: ["village"] },
      { letter: "M", def: "A wet area of land, often with reeds and wildlife.",                  answers: ["meadow", "marsh"] },
    ],
  },
  {
    id: "animals",
    name: "ANIMALS",
    level: 3,
    icon: "🦁",
    description: "Wild and domestic animals",
    questions: [
      { letter: "E", def: "The largest land animal, with a long trunk.",                         answers: ["elephant"] },
      { letter: "K", def: "An Australian animal that hops on strong back legs.",                 answers: ["kangaroo"] },
      { letter: "P", def: "A black and white bird that cannot fly, found in cold areas.",        answers: ["penguin"] },
      { letter: "S", def: "A small bushy-tailed animal that climbs trees.",                      answers: ["squirrel"] },
      { letter: "D", def: "A friendly, intelligent sea mammal.",                                 answers: ["dolphin"] },
      { letter: "J", def: "A large spotted wild cat from the Americas.",                         answers: ["jaguar"] },
      { letter: "L", def: "A large spotted wild cat from Africa and Asia.",                      answers: ["leopard"] },
    ],
  },
];

// Pick a theme by level distribution: Bee 4 = 60%, Bee 5 = 30%, Bee 3 = 10%
export function pickTheme() {
  const r = Math.random();
  let level;
  if (r < 0.6) level = 4;
  else if (r < 0.9) level = 5;
  else level = 3;

  const candidates = BRAINSTORM_THEMES.filter(t => t.level === level);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getThemeById(id) {
  return BRAINSTORM_THEMES.find(t => t.id === id);
}
