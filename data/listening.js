// Bee4 to Tokyo — Listening Gap-fill scripts (Task 3)
// Format: short paragraphs read aloud via Web Speech API
// Player hears, then fills in the gaps

export const LISTENING_SCRIPTS = [
  // ============================================================
  // BEE 4 (CEFR B2)
  // ============================================================
  {
    id: "documentary-progress",
    level: 4,
    title: "Human Progress Documentary",
    // Full script that will be spoken
    fullText: "I recently watched a very interesting documentary programme. It tracked the progress of our civilisation over several centuries. One of the questions they asked was how much of human progress was a complete accident. They suggested that many scientific discoveries happened as a result of sheer luck. It's quite a controversial claim, as most people like to think that we are in full control of our fate.",
    // Segments with gaps (matches past paper format)
    segments: [
      { before: "I recently watched a very interesting", gap: "documentary", after: "programme." },
      { before: "It tracked the progress of our", gap: "civilisation", after: "over several centuries." },
      { before: "One of the questions they asked was how much of human progress was a complete", gap: "accident", after: "." },
      { before: "They suggested that many scientific", gap: "discoveries", after: "happened as a result of sheer luck." },
      { before: "It's quite a", gap: "controversial", after: "claim, as most people like to think that we are in full control of our fate." },
    ],
  },
  {
    id: "school-debate",
    level: 4,
    title: "School Debate Competition",
    fullText: "Our school recently organised a debate competition. The topic was whether technology has improved education. Many students argued that online learning provides excellent opportunities. Others pointed out the importance of face-to-face interaction. The winning team presented a balanced perspective on the issue.",
    segments: [
      { before: "Our school recently organised a debate", gap: "competition", after: "." },
      { before: "The topic was whether", gap: "technology", after: "has improved education." },
      { before: "Many students argued that online learning provides excellent", gap: "opportunities", after: "." },
      { before: "Others pointed out the importance of face-to-face", gap: "interaction", after: "." },
      { before: "The winning team presented a balanced", gap: "perspective", after: "on the issue." },
    ],
  },
  {
    id: "cooking-tradition",
    level: 4,
    title: "Family Cooking Traditions",
    fullText: "Cooking has always been an important tradition in our family. My grandmother taught me how to prepare authentic regional dishes. Each ingredient must be measured carefully for the perfect result. The combination of fresh herbs creates an extraordinary flavour. We always celebrate special occasions with these homemade meals.",
    segments: [
      { before: "Cooking has always been an important", gap: "tradition", after: "in our family." },
      { before: "My grandmother taught me how to prepare", gap: "authentic", after: "regional dishes." },
      { before: "Each", gap: "ingredient", after: "must be measured carefully for the perfect result." },
      { before: "The combination of fresh herbs creates an", gap: "extraordinary", after: "flavour." },
      { before: "We always", gap: "celebrate", after: "special occasions with these homemade meals." },
    ],
  },
  {
    id: "travel-experience",
    level: 4,
    title: "Travel Experience",
    fullText: "Last summer my family went on an amazing adventure across Europe. We visited several historical landmarks and museums. The architecture in each city was absolutely magnificent. We tried different cuisines and learned about local customs. The whole experience was truly unforgettable.",
    segments: [
      { before: "Last summer my family went on an amazing", gap: "adventure", after: "across Europe." },
      { before: "We visited several", gap: "historical", after: "landmarks and museums." },
      { before: "The", gap: "architecture", after: "in each city was absolutely magnificent." },
      { before: "We tried different cuisines and learned about local", gap: "customs", after: "." },
      { before: "The whole experience was truly", gap: "unforgettable", after: "." },
    ],
  },
  {
    id: "music-concert",
    level: 4,
    title: "First Music Concert",
    fullText: "Last weekend I attended my very first orchestra concert. The musicians performed with incredible precision and passion. I was fascinated by the conductor's energy throughout the evening. The audience was completely silent during the most emotional moments. The standing ovation at the end was absolutely unforgettable.",
    segments: [
      { before: "Last weekend I attended my very first", gap: "orchestra", after: "concert." },
      { before: "The musicians performed with incredible", gap: "precision", after: "and passion." },
      { before: "I was", gap: "fascinated", after: "by the conductor's energy throughout the evening." },
      { before: "The audience was completely silent during the most", gap: "emotional", after: "moments." },
      { before: "The standing ovation at the end was absolutely", gap: "unforgettable", after: "." },
    ],
  },
  {
    id: "weekend-plans",
    level: 4,
    title: "Weekend Plans",
    fullText: "This Saturday my friends and I are organising a small picnic. We are planning to visit the botanical gardens in the afternoon. Each person will bring their favourite homemade dish to share. The weather forecast predicts a beautiful sunny day. We expect this gathering to be very enjoyable for everyone.",
    segments: [
      { before: "This Saturday my friends and I are", gap: "organising", after: "a small picnic." },
      { before: "We are planning to visit the", gap: "botanical", after: "gardens in the afternoon." },
      { before: "Each person will bring their favourite", gap: "homemade", after: "dish to share." },
      { before: "The weather", gap: "forecast", after: "predicts a beautiful sunny day." },
      { before: "We expect this gathering to be very", gap: "enjoyable", after: "for everyone." },
    ],
  },
  {
    id: "online-class",
    level: 4,
    title: "Online Class Experience",
    fullText: "I have recently started taking an online photography course. The instructor explains every concept very clearly and patiently. Each lesson includes practical exercises and creative assignments. We meet once a week for group discussions and feedback. This experience has significantly improved my technical skills.",
    segments: [
      { before: "I have recently started taking an online", gap: "photography", after: "course." },
      { before: "The", gap: "instructor", after: "explains every concept very clearly and patiently." },
      { before: "Each lesson includes practical exercises and creative", gap: "assignments", after: "." },
      { before: "We meet once a week for group", gap: "discussions", after: "and feedback." },
      { before: "This experience has", gap: "significantly", after: "improved my technical skills." },
    ],
  },
  {
    id: "school-project",
    level: 4,
    title: "School Project",
    fullText: "Our class is preparing a major presentation about renewable energy. Each team is responsible for a different aspect of the topic. We have spent weeks gathering information from reliable sources. The teacher will evaluate our research, design, and delivery. We are all hoping for an excellent grade on this important project.",
    segments: [
      { before: "Our class is preparing a major", gap: "presentation", after: "about renewable energy." },
      { before: "Each team is", gap: "responsible", after: "for a different aspect of the topic." },
      { before: "We have spent weeks gathering information from", gap: "reliable", after: "sources." },
      { before: "The teacher will", gap: "evaluate", after: "our research, design, and delivery." },
      { before: "We are all hoping for an", gap: "excellent", after: "grade on this important project." },
    ],
  },
  {
    id: "library-visit",
    level: 4,
    title: "Visit to the Library",
    fullText: "Yesterday I spent the entire afternoon at the city library. The librarian recommended several biographies of famous scientists. I borrowed three books on environmental conservation topics. The atmosphere there is perfect for serious studying and reading. I plan to return next weekend with my younger sister.",
    segments: [
      { before: "Yesterday I spent the entire afternoon at the city", gap: "library", after: "." },
      { before: "The", gap: "librarian", after: "recommended several biographies of famous scientists." },
      { before: "I borrowed three books on environmental", gap: "conservation", after: "topics." },
      { before: "The", gap: "atmosphere", after: "there is perfect for serious studying and reading." },
      { before: "I plan to return next weekend with my", gap: "younger", after: "sister." },
    ],
  },

  // ============================================================
  // BEE 5 (CEFR C1)
  // ============================================================
  {
    id: "professor-lecture",
    level: 5,
    title: "Professor's Lecture",
    fullText: "I've recently attended a lecture on entrepreneurship, delivered by professor Jones. I must say that he is extremely knowledgeable about the subject. His analysis of the main issues encountered in this field was excellent. He provided us with valuable insight into a number of management techniques. The professor clearly has a great understanding of this subject, but his approach remains totally pragmatic and down to earth.",
    segments: [
      { before: "I've recently attended a lecture on", gap: "entrepreneurship", after: ", delivered by professor Jones." },
      { before: "I must say that he is extremely", gap: "knowledgeable", after: "about the subject." },
      { before: "His", gap: "analysis", after: "of the main issues encountered in this field was excellent." },
      { before: "He provided us with", gap: "valuable", after: "insight into a number of management techniques." },
      { before: "The professor clearly has a great understanding of this subject, but his approach remains totally", gap: "pragmatic", after: "and down to earth." },
    ],
  },
  {
    id: "financial-report",
    level: 5,
    title: "Annual Financial Report",
    fullText: "Our company's quarterly performance has exceeded all expectations. The acquisition of our competitor has strengthened our market position significantly. We have observed a substantial increase in revenue across all divisions. Our innovative strategies have proven highly effective in challenging conditions. The board has unanimously approved the proposed expansion plan.",
    segments: [
      { before: "Our company's", gap: "quarterly", after: "performance has exceeded all expectations." },
      { before: "The", gap: "acquisition", after: "of our competitor has strengthened our market position significantly." },
      { before: "We have observed a", gap: "substantial", after: "increase in revenue across all divisions." },
      { before: "Our", gap: "innovative", after: "strategies have proven highly effective in challenging conditions." },
      { before: "The board has", gap: "unanimously", after: "approved the proposed expansion plan." },
    ],
  },

  // ============================================================
  // BEE 3 (CEFR B1)
  // ============================================================
  {
    id: "career-thoughts",
    level: 3,
    title: "Future Career Thoughts",
    fullText: "My brother would like to become an engineer. Me, on the other hand, I'd quite like to work as an architect. I've always been interested in all sorts of creative matters. I guess we still have a lot of time to fully consider our options. A decision about a future career is incredibly important, and shouldn't be taken lightly.",
    segments: [
      { before: "My brother would like to become an", gap: "engineer", after: "." },
      { before: "Me, on the other hand, I'd quite like to work as an", gap: "architect", after: "." },
      { before: "I've always been interested in all sorts of", gap: "creative", after: "matters." },
      { before: "I guess we still have a lot of time to fully", gap: "consider", after: "our options." },
      { before: "A decision about a future career is", gap: "incredibly", after: "important, and shouldn't be taken lightly." },
    ],
  },
];

// Pick a script by level distribution: Bee 4 = 60%, Bee 5 = 30%, Bee 3 = 10%
export function pickListeningScript() {
  const r = Math.random();
  let level;
  if (r < 0.6) level = 4;
  else if (r < 0.9) level = 5;
  else level = 3;

  const candidates = LISTENING_SCRIPTS.filter(s => s.level === level);
  if (candidates.length === 0) return LISTENING_SCRIPTS[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}
