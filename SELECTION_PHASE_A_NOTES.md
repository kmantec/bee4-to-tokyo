# Selection Round Phase A Integration

Added to existing app without layout rebuild:

- `data/roots.js` — 53 Greek/Latin roots with examples
- `data/championship_traps.js` — 196 trap words, 3 tiers, tags
- `js/app.js` imports these datasets and adds two Learn Mode modules:
  - 🌳 Roots Lab
  - 🏆 Championship Traps

Usage:
1. Replace the files in your GitHub repo with the files in this patch.
2. Commit changes.
3. Wait for GitHub Pages deployment.
4. Open Learn Mode and test the two new buttons.

No Firebase schema change is required.
