# Bee4 to Tokyo — v2.0

A premium spelling bee training app modelled exactly after the Eurasian Spelling Bee Preliminary Round format.

> Path to the World Finals.

## What's New in v2

This version is built from real ESB past papers (Bee 3, 4, and 5). The app now matches the exam **exactly**:

- **4 Tasks** matching the real ESB Preliminary Round
- **3 Bee Levels** with weighted distribution (Bee 4: 60%, Bee 5: 30%, Bee 3: 10%)
- **Full Mock Test** that runs all 4 tasks in sequence

## The 4 Tasks

| Task | Format | Source |
|------|--------|--------|
| 🔍 **Spot the Error** | Tap misspelled words in a passage, then type corrections | Real Task 1 from past papers |
| 🔤 **Anagram** | Unscramble letters using the definition | Real Task 2 format |
| 🎧 **Listening Gap-fill** | Hear a passage twice, fill in missing words | Real Task 3 format (Web Speech API) |
| 💡 **Brainstorm Theme** | Theme + first letter, write a word ≥ 5 letters | Real Task 4 from preliminary papers |

## Word Bank Stats

- **78 anagram words** (Bee 3: 18, Bee 4: 40, Bee 5: 20)
- **10 passages** for Spot the Error (Bee 3: 1, Bee 4: 6, Bee 5: 3)
- **7 listening scripts** (Bee 3: 1, Bee 4: 4, Bee 5: 2)
- **8 brainstorm themes** with 8-10 questions each

## Quick Start

```bash
cd bee4-to-tokyo
python3 -m http.server 8000
# Open http://localhost:8000
```

Or use **VS Code + Live Server** for auto-reload during development.

## Project Structure

```
bee4-to-tokyo/
├── index.html              Entry point + Tailwind config
├── js/
│   ├── app.js              All 4 tasks + Mock test logic
│   └── firebase-config.js  Firebase credentials (placeholders)
├── data/
│   ├── anagrams.js         Anagram word bank (78 words)
│   ├── passages.js         Spot-the-error passages (10 passages)
│   ├── listening.js        Listening gap-fill scripts (7 scripts)
│   └── themes.js           Brainstorm themes (8 themes)
├── SETUP.md                Step-by-step deployment guide
└── README.md               This file
```

## Tech Stack

- **Vanilla JavaScript** (ES Modules) — no build step needed
- **Tailwind CSS** via CDN with custom premium navy/white theme
- **Web Speech API** for Listening task (browser-native, free)
- **Firebase Auth + Firestore** for cross-device sync (optional)
- **GitHub Pages** ready (free hosting)

## Design

- **Typography:** Fraunces (display serif), Plus Jakarta Sans (body), JetBrains Mono (input)
- **Colors:** Navy `#0A2540` primary, gold `#B8985A` accent, cream `#FAFAF7` background
- **Style:** Premium / professional — feels like a real product

## License

Personal training app. Built with care.
