// Bee4 to Tokyo — Spot the Error passages (Task 1)
// Based on real past paper format: 10 misspelled words per passage
// Distribution: Bee 4 = 60%, Bee 5 = 30%, Bee 3 = 10%
//
// Each passage has:
//   - text: full text with misspelled words inline
//   - errors: array of { wrong, correct } in order of appearance
//   - level: 3, 4, or 5
//   - topic: theme of the passage

export const PASSAGES = [
  // ============================================================
  // BEE 4 PASSAGES (CEFR B2) — 6 passages
  // ============================================================
  {
    id: "career-choices",
    level: 4,
    topic: "Choosing a Career",
    text: `Trying to decide on a future profession can be quite chalenging when you are a teenager. In fact, it is probably quite unrealestic to expect 18 year olds to know. You can choose a career which is considered to be rispectable in your community. But more importantly, your future job needs to give you satisfactien, and at least some opportunity to use your imagiantion. You also want to do something that is worthwhale. You can look for inspireation from members of your family — talk to them about what they do, and find out about the availebility of jobs such as theirs. The last thing you want to do is to face unemploiment. Making the right decision is a huge responsebility!`,
    errors: [
      { wrong: "chalenging",   correct: "challenging" },
      { wrong: "unrealestic",  correct: "unrealistic" },
      { wrong: "rispectable",  correct: "respectable" },
      { wrong: "satisfactien", correct: "satisfaction" },
      { wrong: "imagiantion",  correct: "imagination" },
      { wrong: "worthwhale",   correct: "worthwhile" },
      { wrong: "inspireation", correct: "inspiration" },
      { wrong: "availebility", correct: "availability" },
      { wrong: "unemploiment", correct: "unemployment" },
      { wrong: "responsebility",correct: "responsibility" },
    ],
  },
  {
    id: "healthy-lifestyle",
    level: 4,
    topic: "Healthy Lifestyle",
    text: `Living a healthy lifestyle is a major chalenge in our modern society. Many people struggle to maintain proper nutritien because of busy schedules. Regular exercise should be a fundemantal part of your weekly routine. Sleep is equally importent — adults need at least seven hours every night. Stress menagement is another aspect that should not be overlooked. Drinking enough water keeps your body hidrated throughout the day. Avoiding processed food and choosing fresh ingredeints makes a significant difference. Mental wellbeing is just as crucial as physical helth. Building healthy habbits takes time and dedication. Remember that small changes can lead to remarkible improvements over the long term.`,
    errors: [
      { wrong: "chalenge",     correct: "challenge" },
      { wrong: "nutritien",    correct: "nutrition" },
      { wrong: "fundemantal",  correct: "fundamental" },
      { wrong: "importent",    correct: "important" },
      { wrong: "menagement",   correct: "management" },
      { wrong: "hidrated",     correct: "hydrated" },
      { wrong: "ingredeints",  correct: "ingredients" },
      { wrong: "helth",        correct: "health" },
      { wrong: "habbits",      correct: "habits" },
      { wrong: "remarkible",   correct: "remarkable" },
    ],
  },
  {
    id: "social-media",
    level: 4,
    topic: "Social Media Impact",
    text: `Social media has fundamantally changed how we communicate. Many teenagers spend severel hours each day scrolling through their feeds. While these platforms can help us stay conected with friends, they also have negative consequenses. Cyberbullying has become a serious problem affecting milions of young people worldwide. The constant comparrison with others can damage self-esteem and create unnessesary anxiety. Privacy is another major concern, as personal informasion can easily be misused. However, social media also provides oppurtunities for learning and creativity. Many people have built succesful careers as content creators. The key is to use these tools responcibly and maintain a healthy balance.`,
    errors: [
      { wrong: "fundamantally",correct: "fundamentally" },
      { wrong: "severel",      correct: "several" },
      { wrong: "conected",     correct: "connected" },
      { wrong: "consequenses", correct: "consequences" },
      { wrong: "milions",      correct: "millions" },
      { wrong: "comparrison",  correct: "comparison" },
      { wrong: "unnessesary",  correct: "unnecessary" },
      { wrong: "informasion",  correct: "information" },
      { wrong: "oppurtunities",correct: "opportunities" },
      { wrong: "succesful",    correct: "successful" },
    ],
  },
  {
    id: "space-exploration",
    level: 4,
    topic: "Space Exploration",
    text: `Space exploration has fascinated humans for centuries. The first manned mision to the Moon happened in 1969, marking a histroical achievement. Since then, technologie has advanced dramatically. Modern telescopes can capture images of distant galexies that were previously invisible. International cooporation has been essential for major projects like the International Space Station. Scientists are now planning missions to Mars within the next decadde. Some companies are developing tourrist trips to space for wealthy customers. The challange of long-distance space travel includes radiation exposure and psicological effects on astronauts. Despite these obsticles, the desire to explore beyond our planet remains strong. Future generations will likely witness discoveries we cannot yet imagiane.`,
    errors: [
      { wrong: "mision",       correct: "mission" },
      { wrong: "histroical",   correct: "historical" },
      { wrong: "technologie",  correct: "technology" },
      { wrong: "galexies",     correct: "galaxies" },
      { wrong: "cooporation",  correct: "cooperation" },
      { wrong: "decadde",      correct: "decade" },
      { wrong: "tourrist",     correct: "tourist" },
      { wrong: "challange",    correct: "challenge" },
      { wrong: "psicological", correct: "psychological" },
      { wrong: "imagiane",     correct: "imagine" },
    ],
  },
  {
    id: "ancient-civilisations",
    level: 4,
    topic: "Ancient Civilisations",
    text: `Ancient civilisations have left behind remarkible monuments and artworks. The Egyptian pirimids continue to amaze visitors thousands of years after their construckion. In Greece, the Parthenon stands as a symbal of architectural excellence. The Roman Empire developed an impresive network of roads connecting distant territories. Their engenearing skills allowed them to build aqueducts that supplied water to entire cities. Chinese civilisation contibuted countless inventions including paper and gunpowder. The Mayan culture in Central America created sofisticated calendar systems. Ancient peoples also developed unique writing sistems to record their history. Many of their religous beliefs still influence modern cultures today. Studying these civilisations helps us understand how human societies have evolved through the cenchuries.`,
    errors: [
      { wrong: "remarkible",   correct: "remarkable" },
      { wrong: "pirimids",     correct: "pyramids" },
      { wrong: "construckion", correct: "construction" },
      { wrong: "symbal",       correct: "symbol" },
      { wrong: "impresive",    correct: "impressive" },
      { wrong: "engenearing",  correct: "engineering" },
      { wrong: "contibuted",   correct: "contributed" },
      { wrong: "sofisticated", correct: "sophisticated" },
      { wrong: "sistems",      correct: "systems" },
      { wrong: "cenchuries",   correct: "centuries" },
    ],
  },
  {
    id: "climate-change",
    level: 4,
    topic: "Climate Change",
    text: `Climate change is one of the most serius issues facing humanity today. Rising tempratures are causing glaciers to melt at an alarming rate. Sea levels are rising, threatining coastal cities around the world. Extreme weather events such as hurricanes and droughts are becoming more frequant. Scientists agree that human activities are the primery cause of these changes. Burning fossil fewels releases greenhouse gases into the atmosphere. Deforestattion reduces the planet's ability to absorb carbon dioxide. Many governments have pledged to reduce emisions by switching to renewable energy. Individuals can also help by adopting more sustenable lifestyles. The next decade will be crucial in determining the future of our planet's enviroment.`,
    errors: [
      { wrong: "serius",       correct: "serious" },
      { wrong: "tempratures",  correct: "temperatures" },
      { wrong: "threatining",  correct: "threatening" },
      { wrong: "frequant",     correct: "frequent" },
      { wrong: "primery",      correct: "primary" },
      { wrong: "fewels",       correct: "fuels" },
      { wrong: "deforestattion",correct: "deforestation" },
      { wrong: "emisions",     correct: "emissions" },
      { wrong: "sustenable",   correct: "sustainable" },
      { wrong: "enviroment",   correct: "environment" },
    ],
  },

  // ============================================================
  // BEE 5 PASSAGES (CEFR C1) — 3 passages
  // ============================================================
  {
    id: "confidential-email",
    level: 5,
    topic: "Confidential Business Email",
    text: `I'd like to start this email by officielly reminding everyone that the content of the attached report is highly confedential, so please ensure that you do not discuss it with anyone. We want to elimminate any sources of possible information leaks. The report provides a comprihensive overview of the project we have been working on, as well as a lot of statitsical data that we do not want to share at this stage. I cannot overemphasize the implikations of a potential leak, and am sure that you will all be suportive of my request. If you want to seek clarificeition on any of the points, please contact me directly, I will be happy to answer any questions. I would also ask that everyone acknoledges safe receipt of this email, and signs the attached declaretion. Yours respectfuly, John Smith.`,
    errors: [
      { wrong: "confedential", correct: "confidential" },
      { wrong: "elimminate",   correct: "eliminate" },
      { wrong: "comprihensive",correct: "comprehensive" },
      { wrong: "statitsical",  correct: "statistical" },
      { wrong: "implikations", correct: "implications" },
      { wrong: "suportive",    correct: "supportive" },
      { wrong: "clarificeition",correct: "clarification" },
      { wrong: "acknoledges",  correct: "acknowledges" },
      { wrong: "declaretion",  correct: "declaration" },
      { wrong: "respectfuly",  correct: "respectfully" },
    ],
  },
  {
    id: "scientific-research",
    level: 5,
    topic: "Scientific Research",
    text: `Recent breakthroughs in genetics have revolutionised our understanding of human biolagy. Scientists can now analize DNA sequences with unprecedented accurassy. This has led to remarkible advances in personalised medicine and disease prevension. However, ethical considerations are paramont when working with genetic information. Researchers must navagate complex regulatory frameworks while persuing innovative therapies. The intersection of artifical intelligence and genetic research has accelerated the pace of discovary. Some critics argue that the field is moving too quickly without sufficient safegards. Public skeptisism remains a significant chalenge for the scientific community. Despite these obsticles, the potential benefits for human welfare are extraordnary. The coming decades will undoubtedly bring transformations we cannot fully anticipate today.`,
    errors: [
      { wrong: "biolagy",      correct: "biology" },
      { wrong: "analize",      correct: "analyse" },
      { wrong: "accurassy",    correct: "accuracy" },
      { wrong: "prevension",   correct: "prevention" },
      { wrong: "paramont",     correct: "paramount" },
      { wrong: "navagate",     correct: "navigate" },
      { wrong: "persuing",     correct: "pursuing" },
      { wrong: "skeptisism",   correct: "scepticism" },
      { wrong: "safegards",    correct: "safeguards" },
      { wrong: "extraordnary", correct: "extraordinary" },
    ],
  },
  {
    id: "artistic-expression",
    level: 5,
    topic: "Artistic Expression",
    text: `Artistic expression has always been a fundemental part of human civilization. Throughout history, artists have used various mediums to convay their emotions and ideas. The Renaisance period produced some of the most magnificant works ever created. Master painters like Leonardo da Vinci demostrated extraordinary skill and creativity. Their techniqes continue to inspire contemporary artists across the globe. Modern art has expanded to include digital photagraphy and computer-generated imagery. Critics often debate whether traditional craftmanship is still relevant in today's world. Galleries and museums play a crucial role in preserveing our cultural heritage. They provide aprropriate venues for the public to apreciate diverse artistic perspectives. Ultimately, art serves as a powerful tool for understanding the human expereence.`,
    errors: [
      { wrong: "fundemental",  correct: "fundamental" },
      { wrong: "convay",       correct: "convey" },
      { wrong: "Renaisance",   correct: "Renaissance" },
      { wrong: "magnificant",  correct: "magnificent" },
      { wrong: "demostrated",  correct: "demonstrated" },
      { wrong: "techniqes",    correct: "techniques" },
      { wrong: "photagraphy",  correct: "photography" },
      { wrong: "craftmanship", correct: "craftsmanship" },
      { wrong: "preserveing",  correct: "preserving" },
      { wrong: "expereence",   correct: "experience" },
    ],
  },

  // ============================================================
  // BEE 3 PASSAGES (CEFR B1) — 1 passage
  // ============================================================
  {
    id: "environment",
    level: 3,
    topic: "Protecting Our Environment",
    text: `Nowadays, people are getting more and more concerned about the importance of protecting the enviromnent that we live in. There are many aspects that should be taken into account. One issue is polution: of the air we breathe, of the soil, of the water. Sceintists have been developing and sharing their knowledge of what impact it has on the human popullation, and governments and individuals have been trying to take action. Another reason for concern is the overuse of natural resaurces, such as oil, coal or gas. Also, in the past we used to be surrouended by beautiful landscapes — nowadays the reinforests are disappearing at a rate of 6000 acres every hour! Another interesting fact — did you know that even moskitoes are necessary for the eco-system? These insects are part of the food chain, and necessary for the surviaval of certain species of fish and animals. We really need to minimaise our negative impact on planet Earth as much as we can!`,
    errors: [
      { wrong: "enviromnent",  correct: "environment" },
      { wrong: "polution",     correct: "pollution" },
      { wrong: "Sceintists",   correct: "Scientists" },
      { wrong: "popullation",  correct: "population" },
      { wrong: "resaurces",    correct: "resources" },
      { wrong: "surrouended",  correct: "surrounded" },
      { wrong: "reinforests",  correct: "rainforests" },
      { wrong: "moskitoes",    correct: "mosquitoes" },
      { wrong: "surviaval",    correct: "survival" },
      { wrong: "minimaise",    correct: "minimise" },
    ],
  },
];

// Pick a passage by level distribution: Bee 4 = 60%, Bee 5 = 30%, Bee 3 = 10%
export function pickPassage() {
  const r = Math.random();
  let level;
  if (r < 0.6) level = 4;
  else if (r < 0.9) level = 5;
  else level = 3;

  const candidates = PASSAGES.filter(p => p.level === level);
  if (candidates.length === 0) return PASSAGES[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}
