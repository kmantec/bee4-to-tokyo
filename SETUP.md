# Bee4 to Tokyo — Setup Guide

## 1. Quick Start with VS Code (5 minutes)

### Install VS Code + Live Server
1. Download VS Code: https://code.visualstudio.com
2. Install the **Live Server** extension (by Ritwick Dey)
3. Open the `bee4-to-tokyo` folder in VS Code (`File → Open Folder`)
4. Right-click `index.html` → **"Open with Live Server"**

The app opens automatically at `http://127.0.0.1:5500`. Edit any file and save → browser reloads instantly.

### Sign Up
- Click the **Sign Up** tab
- Enter any name, email, and a password (≥ 6 characters)
- All progress is saved in your browser's LocalStorage

---

## 2. Deploy to GitHub Pages (15 minutes)

### Create Repository
1. Go to https://github.com → New repository
2. Name: `bee4-to-tokyo`
3. Set to **Public** (required for free GitHub Pages)
4. Click Create

### Upload Files
1. Click **"uploading an existing file"**
2. Drag the contents of `bee4-to-tokyo/` (not the folder itself, the contents)
3. Commit message: "Initial app"
4. Click **Commit changes**

### Enable Pages
1. Go to **Settings** (top of repo)
2. Click **Pages** in the left sidebar
3. Source: **Branch: main**, folder: **/ (root)**
4. Click **Save**
5. Wait 1–2 minutes; URL appears in green box

Your live URL: `https://YOUR-USERNAME.github.io/bee4-to-tokyo/`

---

## 3. Add Firebase for Cross-Device Sync (20 minutes)

This step lets the same account work on iPad, phone, and laptop with synced progress.

### Create Firebase Project
1. Go to https://console.firebase.google.com
2. **Add project** → name it `bee4-to-tokyo`
3. Disable Google Analytics → **Create project**

### Enable Authentication
1. **Authentication** → **Get started**
2. **Sign-in method** tab → enable **Email/Password** → **Save**

### Enable Firestore
1. **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Location: **asia-southeast1** (Singapore — closest to Thailand)
4. Click **Enable**

### Set Security Rules
In Firestore → **Rules** tab, paste this and **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Get Config
1. **⚙️ Settings → Project settings**
2. Scroll to **Your apps** → click **`</>`** (web)
3. App nickname: `bee4-web` → **Register app**
4. Copy the `firebaseConfig` object

### Update App
Edit `js/firebase-config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "bee4-to-tokyo.firebaseapp.com",
  projectId: "bee4-to-tokyo",
  // ... etc
};

export const OFFLINE_MODE = false;  // Change to false!
```

Save and re-upload to GitHub.

### Authorize Domain
1. Firebase → **Authentication** → **Settings**
2. Scroll to **Authorized domains** → **Add domain**
3. Add `YOUR-USERNAME.github.io`

✅ Done! Cross-device sync is now active.

---

## 4. Cost Summary

| Service | Free Tier |
|---------|-----------|
| GitHub | Unlimited public repos |
| GitHub Pages | 100 GB/month bandwidth |
| Firebase Auth | Unlimited users |
| Firestore (Spark) | 50K reads / 20K writes per day |
| Web Speech API | Free, browser-native |

**Total: $0/month forever** for normal usage.

---

## 5. Common Issues

**"Speech doesn't work"**
→ Web Speech API works best on Safari (iOS) and Chrome. Tap the play button once before audio plays (browser autoplay policy).

**"Login fails after Firebase setup"**
→ Check authorized domains. Verify `OFFLINE_MODE = false`. Open browser console (F12) for error details.

**"How do I add words?"**
→ Edit the data files in `data/`:
- Anagrams: `anagrams.js` — add to `ANAGRAM_WORDS` array
- Passages: `passages.js` — add to `PASSAGES` array
- Listening: `listening.js` — add to `LISTENING_SCRIPTS` array
- Themes: `themes.js` — add to `BRAINSTORM_THEMES` array

Each entry has clear examples to follow.

**"How do I change the level distribution?"**
→ Search for `pickPassage`, `pickListeningScript`, `pickTheme`, `pickWeightedAnagrams` and adjust the percentages. Currently set to Bee 4: 60%, Bee 5: 30%, Bee 3: 10%.

---

## 6. Future Enhancements (Optional)

- **PDF import** — paste a past paper, auto-extract words
- **Custom mock test length** (3, 5, or 10 of each task)
- **Audio recording** for self-review of pronunciation
- **Daily reminder** via web notifications
- **Multi-user leaderboard** for siblings/cousins

All possible on the same free stack.
