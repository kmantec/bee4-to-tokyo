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
      { letter: "M", def: "Weather with tiny drops of water in the air that makes it hard to see.",            answers: ["misty"] },
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
  {
    id: "music",
    name: "MUSIC",
    level: 4,
    icon: "🎵",
    description: "Instruments, genres, and musical terms",
    questions: [
      { letter: "P", def: "A large keyboard instrument with 88 keys.",                           answers: ["piano"] },
      { letter: "G", def: "A six-stringed instrument played with fingers or a pick.",            answers: ["guitar"] },
      { letter: "V", def: "A four-stringed instrument played with a bow, held under the chin.",  answers: ["violin"] },
      { letter: "D", def: "A percussion instrument you hit with sticks.",                        answers: ["drums"] },
      { letter: "T", def: "A brass instrument with three valves; very loud.",                    answers: ["trumpet"] },
      { letter: "O", def: "A large group of musicians playing classical music together.",        answers: ["orchestra"] },
      { letter: "C", def: "A person who leads an orchestra with a baton.",                       answers: ["conductor"] },
      { letter: "M", def: "Someone who writes or performs music.",                               answers: ["musician"] },
      { letter: "R", def: "A regular pattern of beats in music.",                                answers: ["rhythm"] },
      { letter: "C", def: "A musical performance for a live audience.",                          answers: ["concert"] },
    ],
  },
  {
    id: "school",
    name: "SCHOOL",
    level: 4,
    icon: "🎒",
    description: "School life, subjects, and learning",
    questions: [
      { letter: "T", def: "A person whose job is to teach students.",                            answers: ["teacher"] },
      { letter: "C", def: "A room where lessons take place.",                                    answers: ["classroom"] },
      { letter: "U", def: "Special clothes that students must wear at school.",                  answers: ["uniform"] },
      { letter: "L", def: "A place full of books where students can study.",                     answers: ["library"] },
      { letter: "H", def: "Schoolwork that students must do at home.",                           answers: ["homework"] },
      { letter: "P", def: "A formal speech given to a class to share information.",              answers: ["presentation"] },
      { letter: "S", def: "A subject that includes biology, chemistry, and physics.",            answers: ["science"] },
      { letter: "M", def: "The subject that includes algebra, geometry, and arithmetic.",        answers: ["mathematics"] },
      { letter: "G", def: "A school subject about countries, maps, and the Earth.",              answers: ["geography"] },
      { letter: "E", def: "A test that measures what students have learned.",                    answers: ["examination"] },
    ],
  },
  {
    id: "technology",
    name: "TECHNOLOGY",
    level: 4,
    icon: "💻",
    description: "Devices, internet, and gadgets",
    questions: [
      { letter: "C", def: "An electronic device used for browsing, working, and playing games.", answers: ["computer"] },
      { letter: "S", def: "A small handheld device used for calls and apps.",                    answers: ["smartphone"] },
      { letter: "K", def: "A device with letters used for typing on a computer.",                answers: ["keyboard"] },
      { letter: "M", def: "A device you move with your hand to control a cursor.",               answers: ["mouse"] },
      { letter: "L", def: "A small portable computer you can carry in a bag.",                   answers: ["laptop"] },
      { letter: "I", def: "A global network connecting computers worldwide.",                    answers: ["internet"] },
      { letter: "B", def: "A program used to view websites; e.g. Chrome or Safari.",             answers: ["browser"] },
      { letter: "S", def: "A program designed to perform tasks on your device.",                 answers: ["software"] },
      { letter: "D", def: "A structured collection of information stored on a computer.",          answers: ["database"] },
      { letter: "P", def: "A secret word used to access an account.",                            answers: ["password"] },
    ],
  },
  {
    id: "nature",
    name: "NATURE",
    level: 4,
    icon: "🌳",
    description: "Trees, plants, and natural features",
    questions: [
      { letter: "F", def: "A large area covered with many trees.",                               answers: ["forest"] },
      { letter: "M", def: "A very high natural rise of land, often with a peak.",                answers: ["mountain"] },
      { letter: "R", def: "A natural flowing stream of water, larger than a creek.",             answers: ["river"] },
      { letter: "O", def: "The largest body of salt water on Earth.",                            answers: ["ocean"] },
      { letter: "W", def: "Water falling from a height, often over rocks or a cliff.",             answers: ["waterfall"] },
      { letter: "V", def: "A large area between hills or mountains.",                            answers: ["valley"] },
      { letter: "D", def: "A dry sandy area with very little rain.",                             answers: ["desert"] },
      { letter: "I", def: "A piece of land surrounded by water.",                                answers: ["island"] },
      { letter: "S", def: "Heavy rain with thunder and lightning.",                              answers: ["storm"] },
      { letter: "R", def: "An arc of colours seen after rain when the sun shines.",              answers: ["rainbow"] },
    ],
  },
  {
    id: "shopping",
    name: "SHOPPING",
    level: 4,
    icon: "🛍",
    description: "Stores, payments, and shopping concepts",
    questions: [
      { letter: "M", def: "A place where people buy and sell goods, often with many stalls.",      answers: ["market"] },
      { letter: "S", def: "A large self-service shop selling food and household items.",         answers: ["supermarket"] },
      { letter: "C", def: "Money paid back when you spend more than the price.",                 answers: ["change"] },
      { letter: "R", def: "A reduction in the price of something.",                              answers: ["reduction"] },
      { letter: "D", def: "A reduction in the original price; same as a sale.",                  answers: ["discount"] },
      { letter: "C", def: "A plastic card used to pay for things instead of cash.",              answers: ["credit"] },
      { letter: "R", def: "A piece of paper showing what you bought and how much.",              answers: ["receipt"] },
      { letter: "B", def: "How much money you have to spend; spending plan.",                    answers: ["budget"] },
      { letter: "P", def: "A person who buys goods or services from a shop.",                    answers: ["purchaser"] },
      { letter: "B", def: "A name and design that identifies a company's products.",             answers: ["brand"] },
    ],
  },
  {
    id: "jobs-careers",
    name: "JOBS AND CAREERS",
    level: 4,
    icon: "💼",
    description: "Professions and workplaces",
    questions: [
      { letter: "A", def: "A person who designs buildings.",                                       answers: ["architect"] },
      { letter: "E", def: "A person who designs and builds machines, bridges, or roads.",          answers: ["engineer"] },
      { letter: "J", def: "A person who writes for newspapers or magazines.",                      answers: ["journalist"] },
      { letter: "P", def: "A person who treats sick people; a doctor.",                            answers: ["physician"] },
      { letter: "S", def: "A person who studies science and does research.",                       answers: ["scientist"] },
      { letter: "T", def: "A person who explains things in a foreign language.",                   answers: ["translator"] },
      { letter: "L", def: "A person trained in law who advises clients.",                          answers: ["lawyer"] },
      { letter: "M", def: "A person who plays a musical instrument or sings.",                     answers: ["musician"] },
      { letter: "R", def: "A person who writes about scientific or academic topics.",              answers: ["researcher"] },
      { letter: "P", def: "A person who flies an aeroplane.",                                      answers: ["pilot"] },
    ],
  },
  {
    id: "house-home",
    name: "HOUSE AND HOME",
    level: 4,
    icon: "🏠",
    description: "Rooms, furniture, and household items",
    questions: [
      { letter: "K", def: "The room where food is prepared and cooked.",                           answers: ["kitchen"] },
      { letter: "B", def: "The room where you sleep.",                                             answers: ["bedroom"] },
      { letter: "B", def: "A room with a bath, shower, and toilet.",                               answers: ["bathroom"] },
      { letter: "F", def: "A piece of furniture for keeping food cold; same as a refrigerator.",   answers: ["fridge", "freezer"] },
      { letter: "C", def: "A small room or piece of furniture for storing clothes.",               answers: ["closet"] },
      { letter: "B", def: "A small upper level inside a tall room, accessed by stairs.",           answers: ["balcony"] },
      { letter: "C", def: "A long soft seat for two or more people; a sofa.",                      answers: ["couch"] },
      { letter: "W", def: "An opening in a wall covered with glass.",                              answers: ["window"] },
      { letter: "G", def: "A piece of land beside or behind a house with plants.",                 answers: ["garden"] },
      { letter: "S", def: "A set of steps inside a building going up or down.",                    answers: ["staircase"] },
    ],
  },
  {
    id: "health-body",
    name: "HEALTH AND BODY",
    level: 4,
    icon: "❤️",
    description: "Body parts, health, and medicine",
    questions: [
      { letter: "S", def: "The hard frame inside your body made of bones.",                        answers: ["skeleton"] },
      { letter: "M", def: "Substance taken to treat or prevent illness.",                          answers: ["medicine"] },
      { letter: "S", def: "A doctor who performs operations on patients.",                         answers: ["surgeon"] },
      { letter: "V", def: "A drug given to protect against a specific disease.",                   answers: ["vaccine"] },
      { letter: "B", def: "The flow of blood around your body.",                                    answers: ["bloodstream"] },
      { letter: "M", def: "Soft tissue that helps your body move.",                                answers: ["muscle"] },
      { letter: "T", def: "Hard coverings at the ends of your toes.",                               answers: ["toenails"] },
      { letter: "S", def: "A small wound or rough skin from a cut that is healing.",               answers: ["scratch"] },
      { letter: "P", def: "A person who is receiving medical treatment.",                          answers: ["patient"] },
      { letter: "F", def: "Higher than normal body temperature when you are sick.",                answers: ["fever"] },
    ],
  },
  {
    id: "hobbies",
    name: "HOBBIES",
    level: 4,
    icon: "🎨",
    description: "Activities people do for fun",
    questions: [
      { letter: "P", def: "Using a brush and colours to make a picture.",                          answers: ["painting"] },
      { letter: "R", def: "Looking at words on a page or screen for enjoyment.",                   answers: ["reading"] },
      { letter: "G", def: "Working in a garden, growing plants and flowers.",                      answers: ["gardening"] },
      { letter: "C", def: "Preparing food in a kitchen as an activity.",                           answers: ["cooking"] },
      { letter: "F", def: "Catching fish from a river, lake, or sea using a rod.",                 answers: ["fishing"] },
      { letter: "K", def: "Making fabric or clothes by looping yarn with two long needles.",       answers: ["knitting"] },
      { letter: "H", def: "Walking long distances in nature, often up mountains.",                 answers: ["hiking"] },
      { letter: "C", def: "Making fabric with yarn using a hooked needle.",                        answers: ["crochet"] },
      { letter: "C", def: "Collecting and keeping items such as stamps or coins.",                 answers: ["collecting"] },
      { letter: "P", def: "Taking photographs as a hobby.",                                        answers: ["photography"] },
    ],
  },
  {
    id: "city-life",
    name: "CITY LIFE",
    level: 4,
    icon: "🏙",
    description: "Urban places and city features",
    questions: [
      { letter: "S", def: "A very tall building with many floors.",                                answers: ["skyscraper"] },
      { letter: "B", def: "A structure built over a river or road.",                               answers: ["bridge"] },
      { letter: "T", def: "A path of metal rails for trains.",                                     answers: ["track"] },
      { letter: "S", def: "Tall posts with lights along city streets.",                            answers: ["streetlight"] },
      { letter: "P", def: "A flat path beside a road for people walking.",                         answers: ["pavement"] },
      { letter: "S", def: "An underground train system in a city.",                                answers: ["subway"] },
      { letter: "T", def: "A heavy flow of cars and vehicles on the road.",                        answers: ["traffic"] },
      { letter: "C", def: "A place where people drive cars at high speed on long roads.",          answers: ["carriageway"] },
      { letter: "M", def: "An area in a city where many shops are gathered together.",             answers: ["marketplace"] },
      { letter: "S", def: "An open public area in a city, often with shops around it.",            answers: ["square"] },
    ],
  },
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
      { letter: "S", def: "Describes someone who is shy and quiet around new people.",           answers: ["silent"] },
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
