// Bee4 to Tokyo — Anagram Words (Task 2)
// Distribution: Bee 4 = 60%, Bee 5 = 30%, Bee 3 = 10%
//
// Each word: { word, def, pos (part of speech), level (3|4|5) }

export const ANAGRAM_WORDS = [
  // ============================================================
  // BEE 3 (CEFR B1) — ~10%
  // ============================================================
  { word: "exterior",    def: "the outside part of something, especially a building", pos: "noun", level: 3 },
  { word: "miserable",   def: "extremely unhappy or uncomfortable", pos: "adj", level: 3 },
  { word: "principle",   def: "a basic belief, theory, or rule that has a major influence", pos: "noun", level: 3 },
  { word: "introduce",   def: "to tell someone another person's name when they meet for the first time", pos: "verb", level: 3 },
  { word: "seasonal",    def: "available only during a particular time of year", pos: "adj", level: 3 },
  { word: "vocabulary",  def: "all the words that a person knows", pos: "noun", level: 3 },
  { word: "interior",    def: "the inside part of something", pos: "noun", level: 3 },
  { word: "celebrate",   def: "to do something enjoyable to mark a special event", pos: "verb", level: 3 },
  { word: "dangerous",   def: "able to harm or kill people", pos: "adj", level: 3 },
  { word: "delicious",   def: "having a very pleasant taste or smell", pos: "adj", level: 3 },
  { word: "education",   def: "the process of teaching and learning at a school", pos: "noun", level: 3 },
  { word: "experience",  def: "knowledge or skill gained from doing a job", pos: "noun", level: 3 },
  { word: "imagination", def: "the ability to form ideas or pictures in your mind", pos: "noun", level: 3 },
  { word: "knowledge",   def: "information and understanding gained through learning", pos: "noun", level: 3 },
  { word: "necessary",   def: "needed in order to achieve a particular result", pos: "adj", level: 3 },
  { word: "opportunity", def: "an occasion that offers a possibility of doing something", pos: "noun", level: 3 },
  { word: "remember",    def: "to keep something in your mind", pos: "verb", level: 3 },
  { word: "responsible", def: "having the duty to take care of something", pos: "adj", level: 3 },

  // ============================================================
  // BEE 4 (CEFR B2) — ~60% (target ~30 words)
  // ============================================================
  { word: "participate",   def: "to take part", pos: "verb", level: 4 },
  { word: "sophisticated", def: "knowing a lot about things such as culture, fashion, and the modern world", pos: "adj", level: 4 },
  { word: "ingredient",    def: "one of the foods or liquids that you use in making a particular meal", pos: "noun", level: 4 },
  { word: "investigation", def: "the process of trying to find out all the details or facts about something", pos: "noun", level: 4 },
  { word: "surplus",       def: "more of something than is necessary", pos: "noun", level: 4 },
  { word: "challenging",   def: "difficult in an interesting or stimulating way", pos: "adj", level: 4 },
  { word: "respectable",   def: "considered to be socially acceptable because of good character", pos: "adj", level: 4 },
  { word: "satisfaction",  def: "the feeling of pleasure when you have or do what you want", pos: "noun", level: 4 },
  { word: "worthwhile",    def: "useful, important, or good enough to be a suitable reward", pos: "adj", level: 4 },
  { word: "inspiration",   def: "someone or something that gives you ideas to do something", pos: "noun", level: 4 },
  { word: "availability",  def: "the fact that something is able to be used or obtained", pos: "noun", level: 4 },
  { word: "unemployment",  def: "the state of not having a job", pos: "noun", level: 4 },
  { word: "responsibility",def: "a duty to deal with or take care of something", pos: "noun", level: 4 },
  { word: "accommodate",   def: "to provide enough space or to fit something", pos: "verb", level: 4 },
  { word: "embarrass",     def: "to make someone feel ashamed or uncomfortable", pos: "verb", level: 4 },
  { word: "occurrence",    def: "an event or something that happens", pos: "noun", level: 4 },
  { word: "parallel",      def: "lines that go in the same direction and never meet", pos: "adj", level: 4 },
  { word: "recommend",     def: "to say that something is good", pos: "verb", level: 4 },
  { word: "committee",     def: "a group of people chosen for a specific task", pos: "noun", level: 4 },
  { word: "immediately",   def: "without any delay; at once", pos: "adv", level: 4 },
  { word: "atmosphere",    def: "the layer of gases around the Earth", pos: "noun", level: 4 },
  { word: "biography",     def: "the story of a real person's life written by another", pos: "noun", level: 4 },
  { word: "psychology",    def: "the study of the mind and behaviour", pos: "noun", level: 4 },
  { word: "technology",    def: "machines and equipment based on scientific knowledge", pos: "noun", level: 4 },
  { word: "philosophy",    def: "the study of ideas about the meaning of life", pos: "noun", level: 4 },
  { word: "democracy",     def: "a system of government where people choose their leaders", pos: "noun", level: 4 },
  { word: "environment",   def: "the natural world around us", pos: "noun", level: 4 },
  { word: "consequence",   def: "a result of a particular action or situation", pos: "noun", level: 4 },
  { word: "achievement",   def: "something good that you have succeeded in doing", pos: "noun", level: 4 },
  { word: "development",   def: "the process of growing or changing into something stronger", pos: "noun", level: 4 },
  { word: "hurricane",     def: "a violent tropical storm with very strong winds", pos: "noun", level: 4 },
  { word: "rhinoceros",    def: "a large animal with one or two horns on its nose", pos: "noun", level: 4 },
  { word: "silhouette",    def: "the dark shape of something against a bright background", pos: "noun", level: 4 },
  { word: "rendezvous",    def: "an arranged meeting at a specific time and place", pos: "noun", level: 4 },
  { word: "photograph",    def: "a picture taken with a camera", pos: "noun", level: 4 },
  { word: "encyclopaedia", def: "a book or set of books with information on many subjects", pos: "noun", level: 4 },
  { word: "thunderstorm",  def: "a storm with thunder and lightning", pos: "noun", level: 4 },
  { word: "appreciate",    def: "to recognise or understand the value of something", pos: "verb", level: 4 },
  { word: "concentrate",   def: "to direct all your attention to one thing", pos: "verb", level: 4 },
  { word: "demonstrate",   def: "to show something clearly", pos: "verb", level: 4 },
  { word: "exhibition",    def: "a public display of art, products, or items of interest", pos: "noun", level: 4 },
  { word: "fascinating",   def: "extremely interesting and attractive", pos: "adj", level: 4 },
  { word: "generation",    def: "all the people of about the same age within a society", pos: "noun", level: 4 },
  { word: "hospitality",   def: "friendly and generous reception of guests", pos: "noun", level: 4 },
  { word: "influence",     def: "the power to affect someone or something", pos: "noun", level: 4 },
  { word: "journalism",    def: "the activity of writing for newspapers or magazines", pos: "noun", level: 4 },
  { word: "kindergarten",  def: "a school for very young children", pos: "noun", level: 4 },
  { word: "literature",    def: "written works such as novels, plays, and poetry", pos: "noun", level: 4 },
  { word: "memorable",     def: "worth remembering or easily remembered", pos: "adj", level: 4 },
  { word: "negotiate",     def: "to discuss something to reach an agreement", pos: "verb", level: 4 },
  { word: "obstacle",      def: "something that makes it difficult to achieve a goal", pos: "noun", level: 4 },
  { word: "preparation",   def: "the action of getting ready for something", pos: "noun", level: 4 },
  { word: "qualification", def: "an official record showing a level of skill or education", pos: "noun", level: 4 },
  { word: "relationship",  def: "the way two or more people are connected", pos: "noun", level: 4 },
  { word: "significant",   def: "important enough to be worth noticing", pos: "adj", level: 4 },
  { word: "transportation",def: "a system or means of carrying people or goods", pos: "noun", level: 4 },
  { word: "unfortunately", def: "in a way that is regrettable or sad", pos: "adv", level: 4 },
  { word: "vegetable",     def: "a plant that is grown to be eaten as food", pos: "noun", level: 4 },
  { word: "wonderful",     def: "extremely good or pleasing", pos: "adj", level: 4 },
  { word: "ambulance",     def: "a vehicle for taking sick or injured people to hospital", pos: "noun", level: 4 },
  { word: "boundary",      def: "a line marking the edge of an area", pos: "noun", level: 4 },
  { word: "commercial",    def: "relating to buying and selling goods", pos: "adj", level: 4 },
  { word: "cathedral",     def: "a large important church", pos: "noun", level: 4 },
  { word: "definitely",    def: "without any doubt; certainly", pos: "adv", level: 4 },
  { word: "essential",     def: "completely necessary; absolutely needed", pos: "adj", level: 4 },
  { word: "exhausted",     def: "extremely tired", pos: "adj", level: 4 },
  { word: "frequently",    def: "happening many times; often", pos: "adv", level: 4 },
  { word: "geography",     def: "the study of the Earth and its features", pos: "noun", level: 4 },
  { word: "individual",    def: "a single person, separate from others", pos: "noun", level: 4 },
  { word: "manufacture",   def: "to make goods on a large scale using machines", pos: "verb", level: 4 },

  // ============================================================
  // BEE 5 (CEFR C1) — ~30% (target ~15 words)
  // ============================================================
  { word: "amendment",    def: "a change made to a law, agreement or other written text", pos: "noun", level: 5 },
  { word: "bilingual",    def: "able to speak two languages extremely well", pos: "adj", level: 5 },
  { word: "allegation",   def: "a statement that someone has done something wrong, not yet proved", pos: "noun", level: 5 },
  { word: "exaggeration", def: "a description that makes something seem better, worse, or more than it really is", pos: "noun", level: 5 },
  { word: "insufficient", def: "not enough", pos: "adj", level: 5 },
  { word: "confidential", def: "secret; meant to be kept private", pos: "adj", level: 5 },
  { word: "comprehensive",def: "complete, including everything that is necessary", pos: "adj", level: 5 },
  { word: "statistical",  def: "relating to numbers and data analysis", pos: "adj", level: 5 },
  { word: "implication",  def: "a possible result or meaning of something", pos: "noun", level: 5 },
  { word: "supportive",   def: "providing help and encouragement", pos: "adj", level: 5 },
  { word: "clarification",def: "the act of making something clearer or easier to understand", pos: "noun", level: 5 },
  { word: "acknowledge",  def: "to accept or admit that something is true", pos: "verb", level: 5 },
  { word: "declaration",  def: "an official statement", pos: "noun", level: 5 },
  { word: "respectfully", def: "in a way that shows respect", pos: "adv", level: 5 },
  { word: "eliminate",    def: "to completely remove something", pos: "verb", level: 5 },
  { word: "officially",   def: "in a formal or official way", pos: "adv", level: 5 },
  { word: "magnificent",  def: "very impressive and beautiful", pos: "adj", level: 5 },
  { word: "extraordinary",def: "very unusual or special", pos: "adj", level: 5 },
  { word: "controversial",def: "causing strong disagreement", pos: "adj", level: 5 },
  { word: "perseverance", def: "continued effort despite difficulties", pos: "noun", level: 5 },
];

// Seeded PRNG for deterministic scrambling
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Proper Fisher-Yates scramble using seeded PRNG
export function scramble(word, seed) {
  const letters = word.toUpperCase().split('');
  const rng = mulberry32(hashString(word) + (seed || 0));
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  if (letters.join('') === word.toUpperCase() && letters.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters.join('');
}

// Get words filtered by level weights (Bee 4: 60%, Bee 5: 30%, Bee 3: 10%)
export function pickWeightedAnagrams(n = 5) {
  const bee3 = ANAGRAM_WORDS.filter(w => w.level === 3);
  const bee4 = ANAGRAM_WORDS.filter(w => w.level === 4);
  const bee5 = ANAGRAM_WORDS.filter(w => w.level === 5);

  const counts = {
    4: Math.round(n * 0.6),
    5: Math.round(n * 0.3),
    3: n - Math.round(n * 0.6) - Math.round(n * 0.3),
  };

  const pick = (arr, k) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, k);
  };

  return [
    ...pick(bee4, counts[4]),
    ...pick(bee5, counts[5]),
    ...pick(bee3, counts[3]),
  ].sort(() => Math.random() - 0.5);
}
