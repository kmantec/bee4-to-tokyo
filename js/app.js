// Bee4 to Tokyo — Main App v2.0
// 4 Tasks matching real ESB Preliminary Round format

import { ANAGRAM_WORDS, scramble, pickWeightedAnagrams } from '../data/anagrams.js';
import { PASSAGES, pickPassage } from '../data/passages.js';
import { LISTENING_SCRIPTS, pickListeningScript } from '../data/listening.js';
import { BRAINSTORM_THEMES, pickTheme, getThemeById } from '../data/themes.js';
import { firebaseConfig, OFFLINE_MODE } from './firebase-config.js';

// ============================================================
// FIREBASE
// ============================================================
let firebaseAuth = null, firebaseDb = null;

async function initFirebase() {
  if (OFFLINE_MODE) { console.log('🟡 Offline mode'); return false; }
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, onAuthStateChanged, signInWithEmailAndPassword,
            createUserWithEmailAndPassword, signOut }
      = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, getDoc, setDoc }
      = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const app = initializeApp(firebaseConfig);
    firebaseAuth = { onAuthStateChanged, signInWithEmailAndPassword,
                     createUserWithEmailAndPassword, signOut, instance: getAuth(app) };
    firebaseDb = { doc, getDoc, setDoc, instance: getFirestore(app) };
    return true;
  } catch (e) { console.warn('Firebase failed:', e); return false; }
}

async function loadProgress(userId) {
  if (firebaseDb && userId) {
    try {
      const snap = await firebaseDb.getDoc(firebaseDb.doc(firebaseDb.instance, 'progress', userId));
      if (snap.exists()) return snap.data();
    } catch {}
  }
  const local = localStorage.getItem('b4t_progress');
  return local ? JSON.parse(local) : defaultProgress();
}

async function saveProgress(progress, userId) {
  localStorage.setItem('b4t_progress', JSON.stringify(progress));
  if (firebaseDb && userId) {
    try {
      await firebaseDb.setDoc(firebaseDb.doc(firebaseDb.instance, 'progress', userId), progress, { merge: true });
    } catch {}
  }
}

function defaultProgress() {
  return {
    totalAttempts: 0, totalCorrect: 0,
    streakDays: 0, lastPracticeDate: null,
    taskStats: {
      spot:       { attempts: 0, correct: 0 },
      anagram:    { attempts: 0, correct: 0 },
      listening:  { attempts: 0, correct: 0 },
      brainstorm: { attempts: 0, correct: 0 },
    },
    mockTests: [],
    completedSessions: 0,
  };
}

// ============================================================
// SPEECH (Web Speech API)
// ============================================================
let englishVoice = null;

function initSpeech() {
  if (!('speechSynthesis' in window)) return;
  const load = () => {
    const voices = window.speechSynthesis.getVoices();
    englishVoice =
      voices.find(v => v.lang.startsWith('en-GB') && /female|kate|serena|moira/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith('en-US') && /samantha|karen|ava/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith('en-GB')) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
  };
  load();
  window.speechSynthesis.onvoiceschanged = load;
}

function speak(text, opts = {}) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  return new Promise(resolve => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (englishVoice) u.voice = englishVoice;
    u.rate = opts.rate ?? 0.85;
    u.pitch = 1.0;
    u.volume = 1.0;
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}

// ============================================================
// STATE
// ============================================================
const state = {
  user: null,
  progress: defaultProgress(),
  session: null,
};

const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const app = () => $('#app');

// ============================================================
// ROUTER
// ============================================================
// Wrap rendered content with a phone-like responsive container.
// On all screens (phone, iPad portrait, iPad landscape, desktop), content stays at max-w-md (~448px)
// so layout looks consistent and avoids overwhelming a child user.
const PAGE_SHELL = 'max-w-md mx-auto';

function showScreen(name) {
  // Cancel any in-flight speech when navigating
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  $$('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
  if (!state.user) { renderLogin(); return; }
  $('#bottomNav').classList.remove('hidden');
  if      (name === 'home')     renderHome();
  else if (name === 'learn')    renderLearnMode();
  else if (name === 'train')    renderTrainMenu();
  else if (name === 'mock')     renderMockMenu();
  else if (name === 'progress') renderProgress();
}
window.showScreen = showScreen;

// ============================================================
// LOGIN
// ============================================================
function renderLogin() {
  $('#bottomNav').classList.add('hidden');
  app().innerHTML = `
    <div class="screen bg-cream animate-fade-in">
      <div class="screen-scroll flex items-center justify-center px-4 py-4">
        <div class="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">

          <!-- Brand panel -->
          <section class="text-center md:text-left order-2 md:order-1">
            <div class="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-navy-500 text-white shadow-lg mb-3">
              <span class="font-display text-xl md:text-2xl font-bold tracking-tight">ESB</span>
            </div>
            <h1 class="font-display text-3xl md:text-5xl font-bold text-navy-500 leading-[0.95] tracking-tight">Eurasian Spelling Bee</h1>
            <p class="mt-2 tracking-[0.34em] text-gold font-bold text-xs md:text-sm uppercase">Trainer</p>
            <p class="font-display italic text-xl md:text-2xl text-navy-500/70 mt-1">for Pingping</p>

            <div class="mt-3 mx-auto md:mx-0 max-w-[200px] md:max-w-[260px] rounded-2xl bg-white p-2 shadow-lg border border-navy-100/60">
              <picture>
                <source srcset="images/pingping-toys.webp" type="image/webp">
                <img src="images/pingping-toys.png" alt="Pingping's favorite toys"
                     class="w-full rounded-xl block aspect-square object-cover"
                     width="800" height="800" loading="eager" decoding="async"
                     onerror="this.parentElement.parentElement.innerHTML='<div class=\'p-6 text-center text-navy-500/50 text-xs\'>image missing</div>';" />
              </picture>
            </div>

            <div class="hidden md:block mt-4">
              <p class="text-sm text-navy-500/70">⭐ Daily progress builds <span class="text-gold font-bold">mastery</span>.</p>
              <p class="text-xs text-navy-500/45 mt-1">Pattern · Sound · Confidence</p>
            </div>
          </section>

          <!-- Login card -->
          <section class="order-1 md:order-2">
            <div class="premium-card rounded-3xl p-5 md:p-6">
              <div class="mb-4">
                <p class="text-xs font-bold text-navy-500/45 tracking-[0.25em] uppercase">Welcome</p>
                <h2 class="font-display text-2xl md:text-3xl font-bold text-navy-500 leading-tight mt-0.5">Continue Training</h2>
                <p class="text-sm text-navy-500/55 mt-1">Sign in to keep today's practice moving.</p>
              </div>

              <div class="flex gap-1 mb-4 p-1 bg-navy-50 rounded-2xl">
                <button id="tabLogin" class="flex-1 py-2.5 rounded-xl bg-navy-500 text-white font-bold text-sm shadow-sm">Log In</button>
                <button id="tabSignup" class="flex-1 py-2.5 rounded-xl text-navy-500/55 font-bold text-sm">Sign Up</button>
              </div>

              <form id="authForm" class="space-y-3">
                <div>
                  <label class="text-xs font-bold text-navy-500/60 tracking-wider uppercase">Learner Name</label>
                  <input id="authName" type="text" placeholder="Pingping" autocomplete="name"
                         class="w-full mt-1 px-4 py-3 bg-white rounded-xl border border-navy-100 focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition text-navy-500" required />
                </div>
                <div>
                  <label class="text-xs font-bold text-navy-500/60 tracking-wider uppercase">Email</label>
                  <input id="authEmail" type="email" placeholder="you@example.com" autocomplete="email"
                         class="w-full mt-1 px-4 py-3 bg-white rounded-xl border border-navy-100 focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition text-navy-500" required />
                </div>
                <div>
                  <label class="text-xs font-bold text-navy-500/60 tracking-wider uppercase">Password</label>
                  <input id="authPass" type="password" placeholder="At least 6 characters"
                         class="w-full mt-1 px-4 py-3 bg-white rounded-xl border border-navy-100 focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition text-navy-500" required minlength="6" />
                </div>
                <button type="submit" id="authSubmit" class="btn-primary w-full py-3 rounded-xl font-bold tracking-wide text-base">🐝 Continue Training</button>
              </form>

              <div id="authError" class="hidden mt-3 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium"></div>

              ${OFFLINE_MODE ? `<p class="mt-3 pt-3 border-t border-navy-100 text-[11px] text-center text-navy-500/45 tracking-wide">Running offline · Progress saved on this device</p>` : ''}
            </div>
          </section>

        </div>
      </div>
    </div>
  `;

  let mode = 'login';
  $('#tabLogin').onclick = () => {
    mode = 'login';
    $('#tabLogin').className = 'flex-1 py-2.5 rounded-xl bg-navy-500 text-white font-bold text-sm shadow-sm';
    $('#tabSignup').className = 'flex-1 py-2.5 rounded-xl text-navy-500/55 font-bold text-sm';
    $('#authSubmit').textContent = '🐝 Continue Training';
  };
  $('#tabSignup').onclick = () => {
    mode = 'signup';
    $('#tabSignup').className = 'flex-1 py-2.5 rounded-xl bg-navy-500 text-white font-bold text-sm shadow-sm';
    $('#tabLogin').className = 'flex-1 py-2.5 rounded-xl text-navy-500/55 font-bold text-sm';
    $('#authSubmit').textContent = 'Create Account';
  };

  $('#authForm').onsubmit = async (e) => {
    e.preventDefault();
    const name = $('#authName').value.trim();
    const email = $('#authEmail').value.trim();
    const pass = $('#authPass').value;
    $('#authError').classList.add('hidden');
    try {
      if (OFFLINE_MODE || !firebaseAuth) {
        const users = JSON.parse(localStorage.getItem('b4t_users') || '{}');
        if (mode === 'signup') {
          if (users[email]) throw new Error('An account with this email already exists');
          users[email] = { name, password: pass };
          localStorage.setItem('b4t_users', JSON.stringify(users));
        } else {
          if (!users[email] || users[email].password !== pass) throw new Error('Wrong email or password');
        }
        state.user = { uid: email, name: users[email].name, email };
        localStorage.setItem('b4t_currentUser', JSON.stringify(state.user));
      } else {
        let cred;
        if (mode === 'signup') cred = await firebaseAuth.createUserWithEmailAndPassword(firebaseAuth.instance, email, pass);
        else cred = await firebaseAuth.signInWithEmailAndPassword(firebaseAuth.instance, email, pass);
        state.user = { uid: cred.user.uid, name, email };
      }
      state.progress = await loadProgress(state.user.uid);
      if (mode === 'signup') await saveProgress({ ...state.progress, name }, state.user.uid);
      showScreen('home');
    } catch (err) {
      const el = $('#authError');
      el.textContent = err.message.replace('Firebase: ', '');
      el.classList.remove('hidden');
    }
  };
}

// ============================================================
// HOME
// ============================================================
function renderHome() {
  const p = state.progress;
  const accuracy = p.totalAttempts > 0 ? Math.round((p.totalCorrect / p.totalAttempts) * 100) : 0;
  const todayDone = p.lastPracticeDate === todayKey();

  app().innerHTML = `
    <div class="screen has-nav animate-fade-in">
      <div class="screen-scroll px-4 pt-4 pb-2">
        <div class="max-w-2xl mx-auto">

          <!-- Header -->
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase">Welcome back</p>
              <h1 class="font-display text-2xl md:text-3xl font-bold text-navy-500 leading-tight">${escapeHtml(state.user.name)}</h1>
            </div>
            <button onclick="window.b4t.logout()" class="bg-navy-50 hover:bg-navy-100 active:bg-navy-200 text-navy-500/70 hover:text-navy-500 font-bold rounded-full px-3 py-2 flex items-center gap-1.5 transition" aria-label="Log out">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg>
              <span class="text-xs">Log out</span>
            </button>
          </div>

          <!-- Streak hero (compact) -->
          <div class="hero-gradient diagonal-pattern text-white rounded-2xl p-4 relative overflow-hidden mb-3 flex items-center gap-4">
            <div class="flex-shrink-0">
              <p class="font-display italic text-xs opacity-80">Day Streak</p>
              <p class="font-display text-5xl font-bold leading-none num-badge">${p.streakDays}</p>
            </div>
            <div class="flex-1">
              <div class="gold-line w-10 mb-2 opacity-40"></div>
              <p class="text-sm opacity-90 leading-snug">
                ${todayDone ? 'Today\'s practice complete. Excellent work.' : 'Practice today to keep your streak alive.'}
              </p>
            </div>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            ${statCard(p.totalCorrect, 'Correct')}
            ${statCard(accuracy + '%', 'Accuracy')}
            ${statCard(p.completedSessions, 'Sessions')}
          </div>

          <!-- Tasks 2x2 grid -->
          <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase mb-2">Quick Practice</p>
          <div class="grid grid-cols-2 gap-2 mb-3">
            ${taskButton('spot',       '🔍', 'Spot the Error',  'Find errors')}
            ${taskButton('anagram',    '🔤', 'Anagram',         'Unscramble')}
            ${taskButton('listening',  '🎧', 'Listening',       'Hear & fill')}
            ${taskButton('brainstorm', '💡', 'Brainstorm',      'Theme + letter')}
          </div>

          <!-- Bottom action row: Learn + Mock (2 columns on iPad+) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button onclick="showScreen('learn')" class="premium-card p-3 rounded-2xl flex items-center gap-3 text-left border-amber-200 bg-amber-50/50">
              <div class="text-2xl">🧠</div>
              <div class="flex-1 min-w-0">
                <p class="font-display text-base font-bold text-navy-500 leading-tight">Learn Mode</p>
                <p class="text-xs text-navy-500/60 leading-tight">Patterns & techniques</p>
              </div>
            </button>
            <button onclick="window.b4t.startMock()" class="btn-primary p-3 rounded-2xl flex items-center gap-3 text-left">
              <div class="bg-white/10 rounded-lg p-2 flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-display text-base font-bold leading-tight">Full Mock Test</p>
                <p class="text-xs opacity-70 leading-tight">All 4 tasks</p>
              </div>
              <svg class="w-4 h-4 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

function statCard(value, label) {
  return `
    <div class="premium-card rounded-2xl p-3 text-center">
      <p class="font-display num-badge text-2xl font-bold text-navy-500 leading-none">${value}</p>
      <p class="text-[10px] text-navy-500/60 mt-1 tracking-wider uppercase font-semibold">${label}</p>
    </div>
  `;
}

function taskButton(taskId, icon, name, desc) {
  return `
    <button onclick="window.b4t.startTask('${taskId}')" class="premium-card rounded-2xl p-4 text-left">
      <div class="text-3xl mb-2">${icon}</div>
      <p class="font-display font-bold text-navy-500 text-sm leading-tight">${name}</p>
      <p class="text-[11px] text-navy-500/55 mt-0.5 leading-tight">${desc}</p>
    </button>
  `;
}

// ============================================================
// TRAIN MENU
// ============================================================
function renderTrainMenu() {
  const tasks = [
    { id: 'spot',       icon: '🔍', name: 'Spot the Error',     desc: 'Read passages and find 10 misspelled words. Tests your knowledge of correct spelling in context.' },
    { id: 'anagram',    icon: '🔤', name: 'Anagram Solver',     desc: 'Unscramble letters using the given definition. Builds vocabulary and pattern recognition.' },
    { id: 'listening',  icon: '🎧', name: 'Listening Gap-fill', desc: 'Hear a short passage and fill in the missing words. Tests listening + spelling together.' },
    { id: 'brainstorm', icon: '💡', name: 'Brainstorm Theme',   desc: 'Given a theme and first letter, write a word ≥ 5 letters that matches the definition.' },
  ];

  app().innerHTML = `
    <div class="screen has-nav animate-fade-in"><div class="screen-scroll px-4 pt-4"><div class="max-w-2xl mx-auto pb-4">
      <div class="px-5 pt-8 pb-3">
        <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase">Pick a task</p>
        <h1 class="font-display text-3xl font-bold text-navy-500 mt-0.5">Train</h1>
      </div>
      <div class="px-5 space-y-3">
        <button onclick="showScreen('learn')" class="premium-card w-full p-5 rounded-2xl flex items-start gap-4 text-left border-amber-200 bg-amber-50/50"><div class="text-4xl">🧠</div><div><p class="font-display font-bold text-navy-500 text-lg">Learn Mode</p><p class="text-xs text-navy-500/60 mt-1">Structure, pronunciation, error patterns, and Brainstorm logic.</p></div></button>
        ${tasks.map(t => `
          <button onclick="window.b4t.startTask('${t.id}')" class="premium-card w-full p-5 rounded-2xl flex items-start gap-4 text-left">
            <div class="text-4xl flex-shrink-0">${t.icon}</div>
            <div class="flex-1 min-w-0">
              <p class="font-display font-bold text-navy-500 text-lg leading-tight">${t.name}</p>
              <p class="text-xs text-navy-500/60 mt-1 leading-snug">${t.desc}</p>
            </div>
            <svg class="w-5 h-5 text-navy-500/30 flex-shrink-0 mt-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        `).join('')}
      </div>
    </div></div></div>
  `;
}

// ============================================================
// MOCK TEST MENU
// ============================================================
function renderMockMenu() {
  const tests = state.progress.mockTests || [];
  app().innerHTML = `
    <div class="screen has-nav animate-fade-in"><div class="screen-scroll px-4 pt-4"><div class="max-w-2xl mx-auto pb-4">
      <div class="px-5 pt-8 pb-3">
        <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase">Round 1 Simulation</p>
        <h1 class="font-display text-3xl font-bold text-navy-500 mt-0.5">Mock Test</h1>
      </div>

      <div class="px-5 mb-5">
        <button onclick="window.b4t.startMock()" class="btn-primary w-full p-6 rounded-3xl text-left">
          <p class="font-display text-2xl font-bold mb-1">Full Round 1</p>
          <p class="text-sm opacity-80 mb-4">Complete simulation of the ESB Preliminary</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-white/10 rounded-lg p-2">
              <p class="opacity-70">Task 1</p>
              <p class="font-semibold">Spot the Error</p>
            </div>
            <div class="bg-white/10 rounded-lg p-2">
              <p class="opacity-70">Task 2</p>
              <p class="font-semibold">5 Anagrams</p>
            </div>
            <div class="bg-white/10 rounded-lg p-2">
              <p class="opacity-70">Task 3</p>
              <p class="font-semibold">Listening</p>
            </div>
            <div class="bg-white/10 rounded-lg p-2">
              <p class="opacity-70">Task 4</p>
              <p class="font-semibold">Brainstorm</p>
            </div>
          </div>
        </button>
      </div>

      ${tests.length > 0 ? `
      <div class="px-5">
        <h2 class="font-display text-lg font-bold text-navy-500 mb-3">Recent Mock Results</h2>
        <div class="space-y-2">
          ${tests.slice(-5).reverse().map(t => `
            <div class="premium-card p-4 rounded-2xl flex justify-between items-center">
              <div>
                <p class="font-display font-bold text-navy-500 num-badge">${t.score} / ${t.total}</p>
                <p class="text-[11px] text-navy-500/55 mt-0.5">${t.date}</p>
              </div>
              <div class="font-display text-2xl font-bold num-badge ${t.score/t.total >= 0.85 ? 'text-amber-600' : 'text-navy-500/70'}">${Math.round(t.score/t.total*100)}<span class="text-sm">%</span></div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </div></div></div>
  `;
}

// ============================================================
// PROGRESS
// ============================================================
function renderProgress() {
  const p = state.progress;
  const acc = p.totalAttempts > 0 ? Math.round((p.totalCorrect / p.totalAttempts) * 100) : 0;
  const ts = p.taskStats || {};

  const taskAcc = (key) => {
    const s = ts[key] || { attempts: 0, correct: 0 };
    return s.attempts > 0 ? Math.round(s.correct / s.attempts * 100) : 0;
  };

  app().innerHTML = `
    <div class="screen has-nav animate-fade-in"><div class="screen-scroll px-4 pt-4"><div class="max-w-2xl mx-auto pb-4">
      <div class="px-5 pt-8 pb-3">
        <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase">Your Journey</p>
        <h1 class="font-display text-3xl font-bold text-navy-500 mt-0.5">Progress</h1>
      </div>

      <div class="mx-5 hero-gradient diagonal-pattern text-white rounded-3xl p-6 mb-5 relative overflow-hidden">
        <p class="font-display italic text-sm opacity-80">Overall Accuracy</p>
        <p class="font-display text-6xl font-bold num-badge leading-none mt-1">${acc}<span class="text-3xl opacity-60">%</span></p>
        <div class="gold-line w-12 my-3 opacity-40"></div>
        <p class="text-sm opacity-80">${p.totalCorrect} of ${p.totalAttempts} answers correct</p>
      </div>

      <div class="px-5 grid grid-cols-2 gap-3 mb-5">
        <div class="premium-card rounded-2xl p-4">
          <p class="text-[10px] text-navy-500/55 tracking-wider uppercase font-semibold">Streak</p>
          <p class="font-display num-badge text-3xl font-bold text-navy-500 mt-1">${p.streakDays}</p>
        </div>
        <div class="premium-card rounded-2xl p-4">
          <p class="text-[10px] text-navy-500/55 tracking-wider uppercase font-semibold">Sessions</p>
          <p class="font-display num-badge text-3xl font-bold text-navy-500 mt-1">${p.completedSessions}</p>
        </div>
      </div></div></div></div></div></div>

      <div class="px-5 mb-5">
        <h2 class="font-display text-lg font-bold text-navy-500 mb-3">By Task</h2>
        <div class="premium-card rounded-2xl p-5 space-y-4">
          ${[
            { key: 'spot',       icon: '🔍', name: 'Spot the Error' },
            { key: 'anagram',    icon: '🔤', name: 'Anagram' },
            { key: 'listening',  icon: '🎧', name: 'Listening' },
            { key: 'brainstorm', icon: '💡', name: 'Brainstorm' },
          ].map(t => {
            const s = ts[t.key] || { attempts: 0, correct: 0 };
            const pct = taskAcc(t.key);
            return `
              <div>
                <div class="flex justify-between items-baseline mb-1.5">
                  <span class="text-sm font-semibold text-navy-500">${t.icon} ${t.name}</span>
                  <span class="text-xs text-navy-500/60 num-badge">${s.correct}/${s.attempts} · ${pct}%</span>
                </div>
                <div class="bg-navy-50 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-navy-500 h-full rounded-full" style="width:${pct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// TASK 1: SPOT THE ERROR
// ============================================================
function startSpotTheError(opts = {}) {
  const passage = opts.passage || pickPassage();
  state.session = {
    type: 'spot',
    passage,
    flagged: new Set(),  // word indices flagged as errors
    corrections: {},     // wordIndex -> typed correction
    submitted: false,
    isMock: opts.isMock || false,
    onComplete: opts.onComplete,
    title: 'Spot the Error',
  };
  renderSpotTheError();
}

function renderSpotTheError() {
  const s = state.session;
  const passage = s.passage;
  const tokens = tokenize(passage.text);

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-1">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.exitSession()" class="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold rounded-full px-4 py-2 flex items-center gap-1.5 transition shadow-sm border border-red-200" aria-label="Exit session">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          <span class="text-sm">Exit</span>
        </button>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/50">Task 1 · Spot the Error</p>
            <span class="level-pill level-${passage.level}">BEE ${passage.level}</span>
          </div>
          <p class="font-display font-bold text-navy-500 text-sm leading-tight">${passage.topic}</p>
        </div>
      </div>

      <div class="px-5 mb-3">
        <div class="bg-navy-500/5 border border-navy-100 rounded-xl p-3 text-xs text-navy-500/80 leading-snug">
          <strong class="text-navy-500">Tap on each misspelled word</strong> in the passage below. There are <strong>10 errors</strong>. After flagging, you'll be asked to type the correct spelling.
        </div>
      </div>

      <div class="px-5 mb-4 animate-slide-up">
        <div class="premium-card rounded-2xl p-5 leading-relaxed text-navy-500" id="passageBox" style="font-size: 15px; line-height: 1.7;">
          ${tokens.map((tok, i) =>
            tok.type === 'word'
              ? `<span class="passage-word" data-idx="${i}" onclick="window.b4t.toggleWord(${i})">${escapeHtml(tok.value)}</span>`
              : escapeHtml(tok.value)
          ).join('')}
        </div>
      </div>

      <div class="px-5 mb-5">
        <div class="flex justify-between items-center mb-2">
          <p class="text-xs text-navy-500/60">
            Flagged: <span id="flagCount" class="font-bold text-navy-500 num-badge">0</span> / 10
          </p>
          <p class="text-xs text-navy-500/60" id="flagHint">Tap up to 10 words</p>
        </div>
        <button id="submitSpotBtn" onclick="window.b4t.submitSpot()" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide" disabled>
          Submit Answers
        </button>
      </div>
    </div></div></div>
  `;

  s.tokens = tokens;
}

function tokenize(text) {
  // Split text into words and non-words (punctuation/spaces) preserving structure
  const tokens = [];
  let buf = '', isWord = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const charIsWord = /[a-zA-Z'\u2019]/.test(ch);
    if (i === 0) { buf = ch; isWord = charIsWord; continue; }
    if (charIsWord === isWord) {
      buf += ch;
    } else {
      tokens.push({ type: isWord ? 'word' : 'gap', value: buf });
      buf = ch; isWord = charIsWord;
    }
  }
  if (buf) tokens.push({ type: isWord ? 'word' : 'gap', value: buf });
  return tokens;
}

function toggleWord(idx) {
  const s = state.session;
  if (s.submitted) return;
  const el = document.querySelector(`[data-idx="${idx}"]`);
  if (s.flagged.has(idx)) {
    s.flagged.delete(idx);
    el.classList.remove('flagged');
  } else {
    if (s.flagged.size >= 10) {
      showToast('You have already flagged 10 words. Tap one to remove first.');
      return;
    }
    s.flagged.add(idx);
    el.classList.add('flagged');
  }
  $('#flagCount').textContent = s.flagged.size;
  $('#submitSpotBtn').disabled = s.flagged.size === 0;
  $('#flagHint').textContent = s.flagged.size === 10 ? 'Ready to submit!' : `Tap ${10 - s.flagged.size} more`;
}
window.b4t = window.b4t || {};
window.b4t.toggleWord = toggleWord;

function submitSpot() {
  const s = state.session;
  if (s.flagged.size === 0) return;
  // Move to correction phase
  renderSpotCorrections();
}

function renderSpotCorrections() {
  const s = state.session;
  const flaggedTokens = [...s.flagged].sort((a, b) => a - b).map(idx => ({ idx, word: s.tokens[idx].value }));

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-1">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.backToSpot()" class="bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 font-bold rounded-full px-4 py-2 flex items-center gap-1.5 transition shadow-sm border border-amber-300" aria-label="Back to passage">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
          <span class="text-sm">Back</span>
        </button>
        <div>
          <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/50">Task 1 · Step 2</p>
          <p class="font-display font-bold text-navy-500">Type the correct spelling</p>
        </div>
      </div>

      <div class="px-5 space-y-3 mb-5">
        ${flaggedTokens.map((ft, i) => `
          <div class="premium-card rounded-2xl p-4">
            <div class="flex items-baseline gap-3 mb-2">
              <span class="font-display num-badge text-xl font-bold text-navy-500/40">${i + 1}</span>
              <span class="text-sm text-navy-500/60">You flagged:</span>
              <span class="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">${escapeHtml(ft.word)}</span>
            </div>
            <input type="text" data-correction-idx="${ft.idx}" placeholder="Correct spelling..."
                   autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
                   value="${s.corrections[ft.idx] || ''}"
                   class="spell-input w-full px-4 py-3 bg-cream rounded-xl border-2 border-navy-100 focus:border-navy-500 transition" />
          </div>
        `).join('')}
      </div>

      <div class="px-5 pb-6">
        <button onclick="window.b4t.finalizeSpot()" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide">
          Check My Answers
        </button>
      </div>
    </div></div></div>
  `;

  // Setup save-as-you-type
  document.querySelectorAll('[data-correction-idx]').forEach(input => {
    input.addEventListener('input', e => {
      s.corrections[e.target.dataset.correctionIdx] = e.target.value.trim();
    });
  });
}

window.b4t.backToSpot = () => renderSpotTheError();

function finalizeSpot() {
  const s = state.session;
  const passage = s.passage;
  s.submitted = true;

  // Build a set of correct error positions
  const correctErrorWords = new Set(passage.errors.map(e => e.wrong.toLowerCase()));
  const correctMap = {};
  passage.errors.forEach(e => { correctMap[e.wrong.toLowerCase()] = e.correct.toLowerCase(); });

  // Score
  let score = 0;
  const results = [];
  [...s.flagged].forEach(idx => {
    const flaggedWord = s.tokens[idx].value.toLowerCase().replace(/[\u2019']/g, "'");
    const userCorrection = (s.corrections[idx] || '').trim().toLowerCase();
    const wasErrorWord = correctErrorWords.has(flaggedWord);
    const correctSpelling = correctMap[flaggedWord];
    const correctlySpelled = wasErrorWord && userCorrection === correctSpelling;
    if (correctlySpelled) score++;
    results.push({
      flaggedWord: s.tokens[idx].value,
      userCorrection,
      correctSpelling,
      wasErrorWord,
      correctlySpelled,
    });
  });

  // Find any errors the user missed
  const missedErrors = passage.errors.filter(e => {
    const w = e.wrong.toLowerCase();
    return ![...s.flagged].some(idx => s.tokens[idx].value.toLowerCase().replace(/[\u2019']/g, "'") === w);
  });

  // Record stats
  const total = 10;
  recordTaskStats('spot', total, score);

  // Render result
  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-6 pb-6">
      <div class="text-center mb-5">
        <p class="text-xs tracking-wider uppercase font-semibold text-navy-500/50 mb-1">Spot the Error · Result</p>
        <p class="font-display text-7xl font-bold text-navy-500 num-badge leading-none">${score}<span class="text-3xl text-navy-500/50">/${total}</span></p>
        <p class="font-display italic text-lg text-navy-500/70 mt-2">${scoreLabel(score / total)}</p>
      </div>

      ${results.length > 0 ? `
      <div class="premium-card rounded-2xl p-5 mb-3">
        <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/60 mb-3">Your Flagged Words</p>
        <div class="space-y-2.5">
          ${results.map(r => `
            <div class="flex items-start gap-2 p-2.5 rounded-lg ${r.correctlySpelled ? 'bg-emerald-50' : 'bg-red-50'}">
              <span class="text-lg">${r.correctlySpelled ? '✓' : '✗'}</span>
              <div class="flex-1 min-w-0">
                <div class="text-xs">
                  <span class="font-mono font-bold text-amber-700">${escapeHtml(r.flaggedWord)}</span>
                  ${r.wasErrorWord
                    ? `→ <span class="font-mono ${r.correctlySpelled ? 'font-bold text-emerald-700' : 'text-red-600'}">${escapeHtml(r.userCorrection || '(blank)')}</span>${!r.correctlySpelled ? ` (correct: <span class="font-mono font-bold text-navy-500">${r.correctSpelling}</span>)` : ''}`
                    : ` <span class="text-red-600">— this word was actually spelled correctly</span>`
                  }
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      ${missedErrors.length > 0 ? `
      <div class="premium-card rounded-2xl p-5 mb-3 bg-amber-50/40 border-amber-200">
        <p class="text-[10px] tracking-wider uppercase font-semibold text-amber-700 mb-3">Errors You Missed (${missedErrors.length})</p>
        <div class="space-y-1 text-sm">
          ${missedErrors.map(e => `
            <div class="font-mono">
              <span class="text-amber-700 line-through">${e.wrong}</span> → <span class="font-bold text-emerald-700">${e.correct}</span>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      ${s.onComplete
        ? `<button onclick="window.b4t.continueSession(${score}, ${total})" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Next Task →</button>`
        : `<button onclick="showScreen('home')" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Return Home</button>`
      }
    </div></div></div>
  `;

  if (!s.onComplete) {
    updateStreak();
    state.progress.completedSessions++;
    saveProgress(state.progress, state.user.uid);
  }
}

window.b4t.submitSpot = submitSpot;
window.b4t.finalizeSpot = finalizeSpot;

// ============================================================
// TASK 2: ANAGRAM
// ============================================================
function startAnagram(opts = {}) {
  const words = opts.words || pickWeightedAnagrams(opts.count || 5);
  state.session = {
    type: 'anagram',
    words,
    index: 0,
    correct: 0,
    answers: [],
    isMock: opts.isMock || false,
    onComplete: opts.onComplete,
    title: 'Anagram',
  };
  renderAnagram();
}

function renderAnagram() {
  const s = state.session;
  if (s.index >= s.words.length) { renderAnagramEnd(); return; }
  const w = s.words[s.index];
  const scrambled = scramble(w.word, s.index + 1);

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-1">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.exitSession()" class="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold rounded-full px-4 py-2 flex items-center gap-1.5 transition shadow-sm border border-red-200" aria-label="Exit session">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          <span class="text-sm">Exit</span>
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/50">Task 2 · Anagram</p>
            <span class="level-pill level-${w.level}">BEE ${w.level}</span>
          </div>
          <p class="font-display font-bold text-navy-500">
            <span class="num-badge">${s.index + 1}</span><span class="text-navy-500/40 mx-1">/</span><span class="num-badge text-navy-500/60">${s.words.length}</span>
          </p>
        </div>
        <div class="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">${s.correct} ✓</div>
      </div>

      <div class="px-5 mb-6">
        <div class="bg-navy-50 rounded-full h-1 overflow-hidden">
          <div class="bg-navy-500 h-full rounded-full transition-all" style="width:${(s.index / s.words.length) * 100}%"></div>
        </div>
      </div>

      <div class="px-5 mb-4 animate-slide-up">
        <div class="premium-card rounded-3xl p-5 sm:p-7">
          <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/55 mb-3 text-center">Scrambled Letters</p>
          <p class="font-display font-bold text-navy-500 num-badge text-center mb-5 leading-tight" style="font-size: clamp(1.25rem, ${Math.min(80 / scrambled.length, 8)}vw, 2.5rem); letter-spacing: ${scrambled.length > 10 ? '0.02em' : '0.08em'};">${scrambled}</p>

          <div class="bg-navy-50 rounded-2xl p-4 mb-4">
            <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/55 mb-1">Definition (${w.pos})</p>
            <p class="text-sm text-navy-500 leading-snug">${escapeHtml(w.def)}</p>
          </div>

          <input id="anagramInput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
                 placeholder="your answer..."
                 class="spell-input w-full px-4 py-4 text-xl sm:text-2xl font-bold text-center bg-cream rounded-xl border-2 border-navy-100 focus:border-navy-500 transition" />

          <button onclick="window.b4t.submitAnagram()" class="btn-primary w-full mt-3 py-4 rounded-xl font-bold tracking-wide">
            Check Answer
          </button>
        </div>
      </div>
    </div></div></div>
  `;

  setTimeout(() => $('#anagramInput')?.focus(), 100);
  $('#anagramInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') window.b4t.submitAnagram();
  });
}

function submitAnagram() {
  const s = state.session;
  const w = s.words[s.index];
  const guess = ($('#anagramInput')?.value || '').trim().toLowerCase();
  if (!guess) return;
  const correct = guess === w.word.toLowerCase();
  if (correct) s.correct++;
  s.answers.push({ word: w.word, guess, correct, def: w.def, level: w.level });

  showWordFeedback(correct, w.word, guess, w.def, () => {
    s.index++;
    if (s.index < s.words.length) renderAnagram();
    else renderAnagramEnd();
  });
}

function renderAnagramEnd() {
  const s = state.session;
  recordTaskStats('anagram', s.words.length, s.correct);

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-8 pb-6">
      <div class="text-center mb-6">
        <p class="text-xs tracking-wider uppercase font-semibold text-navy-500/50 mb-1">Anagram · Result</p>
        <p class="font-display text-7xl font-bold text-navy-500 num-badge leading-none">${s.correct}<span class="text-3xl text-navy-500/50">/${s.words.length}</span></p>
        <p class="font-display italic text-lg text-navy-500/70 mt-2">${scoreLabel(s.correct / s.words.length)}</p>
      </div>

      ${s.answers.filter(a => !a.correct).length > 0 ? `
      <div class="premium-card rounded-2xl p-5 mb-3">
        <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/60 mb-3">Words to Review</p>
        <div class="space-y-2">
          ${s.answers.filter(a => !a.correct).map(a => `
            <div class="p-3 bg-red-50 rounded-xl">
              <div class="flex items-center justify-between">
                <span class="font-display font-bold text-navy-500">${a.word}</span>
                <span class="level-pill level-${a.level}">BEE ${a.level}</span>
              </div>
              <p class="text-xs text-navy-500/60 mt-1">${a.def}</p>
              ${learnMiniCard(a.word)}
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      ${s.onComplete
        ? `<button onclick="window.b4t.continueSession(${s.correct}, ${s.words.length})" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Next Task →</button>`
        : `<button onclick="showScreen('home')" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Return Home</button>`
      }
    </div></div></div>
  `;

  if (!s.onComplete) {
    updateStreak();
    state.progress.completedSessions++;
    saveProgress(state.progress, state.user.uid);
  }
}

window.b4t.submitAnagram = submitAnagram;

// ============================================================
// TASK 3: LISTENING
// ============================================================
function startListening(opts = {}) {
  const script = opts.script || pickListeningScript();
  state.session = {
    type: 'listening',
    script,
    answers: {},
    submitted: false,
    isMock: opts.isMock || false,
    onComplete: opts.onComplete,
    title: 'Listening',
  };
  renderListening();
}

function renderListening() {
  const s = state.session;
  const script = s.script;

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-1">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.exitSession()" class="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold rounded-full px-4 py-2 flex items-center gap-1.5 transition shadow-sm border border-red-200" aria-label="Exit session">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          <span class="text-sm">Exit</span>
        </button>
        <div>
          <div class="flex items-center gap-2">
            <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/50">Task 3 · Listening</p>
            <span class="level-pill level-${script.level}">BEE ${script.level}</span>
          </div>
          <p class="font-display font-bold text-navy-500 text-sm leading-tight">${script.title}</p>
        </div>
      </div>

      <div class="px-5 mb-3">
        <div class="bg-navy-500/5 border border-navy-100 rounded-xl p-3 text-xs text-navy-500/80 leading-snug">
          You'll hear the passage <strong>twice</strong>. Listen and fill in the missing words. Each gap is <strong>one word</strong>.
        </div>
      </div>

      <div class="px-5 mb-4">
        <div class="hero-gradient diagonal-pattern text-white rounded-2xl p-5 flex items-center gap-4">
          <button onclick="window.b4t.playListening()" id="playBtn" class="bg-white/10 hover:bg-white/20 rounded-2xl w-16 h-16 flex items-center justify-center transition flex-shrink-0">
            <svg id="playIcon" class="w-8 h-8" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="flex-1">
            <p class="font-display text-lg font-bold">Tap to play</p>
            <p class="text-xs opacity-80" id="playStatus">Plays 2 times automatically</p>
          </div>
        </div>
      </div>

      <div class="px-5 mb-4 animate-slide-up">
        <div class="premium-card rounded-2xl p-5">
          <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/55 mb-3">Fill in the gaps</p>
          <div class="space-y-3 text-sm leading-relaxed text-navy-500">
            ${script.segments.map((seg, i) => `
              <div>
                ${escapeHtml(seg.before)}
                <input type="text" data-gap="${i}" placeholder="..."
                       autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
                       class="spell-input inline-block min-w-[120px] px-3 py-1.5 mx-1 bg-amber-50 rounded-lg border-2 border-amber-200 focus:border-amber-500 text-amber-900 font-bold align-middle" />
                ${escapeHtml(seg.after)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="px-5 pb-6">
        <button onclick="window.b4t.submitListening()" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide">
          Submit Answers
        </button>
      </div>
    </div></div></div>
  `;

  document.querySelectorAll('[data-gap]').forEach(input => {
    input.addEventListener('input', e => {
      s.answers[e.target.dataset.gap] = e.target.value.trim();
    });
  });
}

function setListeningPlayIcon(mode) {
  const icon = $('#playIcon');
  if (!icon) return;
  if (mode === 'pause') {
    icon.innerHTML = '<rect x="6" y="5" width="4" height="14" fill="white"/><rect x="14" y="5" width="4" height="14" fill="white"/>';
  } else {
    icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

function setListeningStatus(text) {
  const el = $('#playStatus');
  if (el) el.textContent = text;
}

function listeningStillActive(session, token) {
  return state.session === session && session.playToken === token;
}

function waitListeningDelay(ms, session, token) {
  return new Promise(resolve => {
    const started = Date.now();
    const tick = () => {
      if (!listeningStillActive(session, token) || !session.playing) return resolve();
      if (session.paused) return setTimeout(tick, 100);
      if (Date.now() - started >= ms) return resolve();
      setTimeout(tick, 100);
    };
    tick();
  });
}

async function playListening() {
  const s = state.session;
  if (!s || s.type !== 'listening') return;

  // While audio is playing, the same button becomes Pause / Resume.
  if (s.playing) {
    if (s.paused) {
      speechSynthesis.resume();
      s.paused = false;
      setListeningPlayIcon('pause');
      setListeningStatus(`Playing... (${s.playRound || 1} of 2)`);
    } else {
      speechSynthesis.pause();
      s.paused = true;
      setListeningPlayIcon('play');
      setListeningStatus(`Paused (${s.playRound || 1} of 2) · tap to resume`);
    }
    return;
  }

  s.playing = true;
  s.paused = false;
  s.playRound = 1;
  s.playToken = Date.now();
  const token = s.playToken;

  setListeningPlayIcon('pause');
  setListeningStatus('Playing... (1 of 2)');

  await speak(s.script.fullText, { rate: 0.85 });
  if (!listeningStillActive(s, token) || !s.playing) return;

  await waitListeningDelay(1500, s, token);
  if (!listeningStillActive(s, token) || !s.playing) return;

  s.playRound = 2;
  setListeningStatus('Playing... (2 of 2)');
  await speak(s.script.fullText, { rate: 0.85 });
  if (!listeningStillActive(s, token)) return;

  s.playing = false;
  s.paused = false;
  s.playRound = 0;
  setListeningStatus('Audio complete · tap to play again');
  setListeningPlayIcon('play');
}

function submitListening() {
  const s = state.session;
  if (s && s.playing) {
    speechSynthesis.cancel();
    s.playing = false;
    s.paused = false;
  }
  s.submitted = true;
  let correct = 0;
  const results = s.script.segments.map((seg, i) => {
    const userAnswer = (s.answers[i] || '').toLowerCase().trim();
    const isCorrect = userAnswer === seg.gap.toLowerCase();
    if (isCorrect) correct++;
    return { ...seg, userAnswer, isCorrect };
  });

  recordTaskStats('listening', s.script.segments.length, correct);

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-8 pb-6">
      <div class="text-center mb-6">
        <p class="text-xs tracking-wider uppercase font-semibold text-navy-500/50 mb-1">Listening · Result</p>
        <p class="font-display text-7xl font-bold text-navy-500 num-badge leading-none">${correct}<span class="text-3xl text-navy-500/50">/${s.script.segments.length}</span></p>
        <p class="font-display italic text-lg text-navy-500/70 mt-2">${scoreLabel(correct / s.script.segments.length)}</p>
      </div>

      <div class="premium-card rounded-2xl p-5 mb-3">
        <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/60 mb-3">Your Answers</p>
        <div class="space-y-2">
          ${results.map((r, i) => `
            <div class="p-3 rounded-xl ${r.isCorrect ? 'bg-emerald-50' : 'bg-red-50'}">
              <div class="flex items-center gap-2 mb-1">
                <span>${r.isCorrect ? '✓' : '✗'}</span>
                <span class="text-xs text-navy-500/55">Gap ${i + 1}</span>
              </div>
              <p class="text-sm">
                <span class="font-mono font-bold ${r.isCorrect ? 'text-emerald-700' : 'text-red-600'}">${escapeHtml(r.userAnswer || '(blank)')}</span>
                ${!r.isCorrect ? ` → <span class="font-mono font-bold text-navy-500">${r.gap}</span>` : ''}
              </p>
              ${!r.isCorrect ? learnMiniCard(r.gap) : ''}
            </div>
          `).join('')}
        </div>
      </div>

      ${s.onComplete
        ? `<button onclick="window.b4t.continueSession(${correct}, ${s.script.segments.length})" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Next Task →</button>`
        : `<button onclick="showScreen('home')" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Return Home</button>`
      }
    </div></div></div>
  `;

  if (!s.onComplete) {
    updateStreak();
    state.progress.completedSessions++;
    saveProgress(state.progress, state.user.uid);
  }
}

window.b4t.playListening = playListening;
window.b4t.submitListening = submitListening;

// ============================================================
// TASK 4: BRAINSTORM
// ============================================================
function startBrainstorm(opts = {}) {
  const theme = opts.theme || pickTheme();
  // Pick 5 questions from the theme
  const questions = [...theme.questions].sort(() => Math.random() - 0.5).slice(0, 5);

  state.session = {
    type: 'brainstorm',
    theme,
    questions,
    index: 0,
    correct: 0,
    answers: [],
    isMock: opts.isMock || false,
    onComplete: opts.onComplete,
    title: 'Brainstorm',
  };
  renderBrainstorm();
}

function renderBrainstorm() {
  const s = state.session;
  if (s.index >= s.questions.length) { renderBrainstormEnd(); return; }
  const q = s.questions[s.index];

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-1">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.exitSession()" class="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold rounded-full px-4 py-2 flex items-center gap-1.5 transition shadow-sm border border-red-200" aria-label="Exit session">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          <span class="text-sm">Exit</span>
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/50">Task 4 · Brainstorm</p>
            <span class="level-pill level-${s.theme.level}">BEE ${s.theme.level}</span>
          </div>
          <p class="font-display font-bold text-navy-500">
            <span class="num-badge">${s.index + 1}</span><span class="text-navy-500/40 mx-1">/</span><span class="num-badge text-navy-500/60">${s.questions.length}</span>
          </p>
        </div>
        <div class="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">${s.correct} ✓</div>
      </div>

      <div class="px-5 mb-6">
        <div class="bg-navy-50 rounded-full h-1 overflow-hidden">
          <div class="bg-navy-500 h-full" style="width:${(s.index / s.questions.length) * 100}%"></div>
        </div>
      </div>

      <div class="px-5 mb-4">
        <div class="bg-navy-500 text-white rounded-2xl p-4 flex items-center gap-3">
          <div class="text-3xl">${s.theme.icon}</div>
          <div>
            <p class="text-[10px] tracking-wider uppercase opacity-60 font-semibold">Theme</p>
            <p class="font-display font-bold text-xl leading-tight">${s.theme.name}</p>
          </div>
        </div>
      </div>

      <div class="px-5 mb-4 animate-slide-up">
        <div class="premium-card rounded-3xl p-6">
          <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/55 mb-2">Definition</p>
          <p class="text-base text-navy-500 leading-snug mb-5">${escapeHtml(q.def)}</p>

          <ul class="space-y-1.5 mb-5 text-sm text-navy-500/80">
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Start with <span class="font-display font-bold text-2xl text-navy-500 mx-0.5 num-badge">${q.letter}</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              At least 5 letters
            </li>
          </ul>

          <div class="relative">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 font-display font-bold text-2xl text-navy-500/40 pointer-events-none">${q.letter}</div>
            <input id="bsInput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
                   placeholder="${q.letter.toLowerCase()}..."
                   class="spell-input w-full pl-12 pr-4 py-4 text-2xl font-bold bg-cream rounded-xl border-2 border-navy-100 focus:border-navy-500 transition" />
          </div>

          <button onclick="window.b4t.submitBrainstorm()" class="btn-primary w-full mt-3 py-4 rounded-xl font-bold tracking-wide">
            Submit
          </button>
        </div>
      </div>
    </div></div></div>
  `;

  setTimeout(() => $('#bsInput')?.focus(), 100);
  $('#bsInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') window.b4t.submitBrainstorm();
  });
}

function submitBrainstorm() {
  const s = state.session;
  const q = s.questions[s.index];
  const guess = ($('#bsInput')?.value || '').trim().toLowerCase();
  if (!guess) return;

  if (guess[0] !== q.letter.toLowerCase()) {
    showToast(`Word must start with ${q.letter}`);
    return;
  }
  if (guess.length < 5) {
    showToast('Word must have at least 5 letters');
    return;
  }

  const correct = q.answers.includes(guess);
  if (correct) s.correct++;
  s.answers.push({ ...q, guess, correct });

  showWordFeedback(correct, q.answers[0], guess, q.def, () => {
    s.index++;
    if (s.index < s.questions.length) renderBrainstorm();
    else renderBrainstormEnd();
  });
}

function renderBrainstormEnd() {
  const s = state.session;
  recordTaskStats('brainstorm', s.questions.length, s.correct);

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-8 pb-6">
      <div class="text-center mb-6">
        <p class="text-xs tracking-wider uppercase font-semibold text-navy-500/50 mb-1">Brainstorm · ${s.theme.name}</p>
        <p class="font-display text-7xl font-bold text-navy-500 num-badge leading-none">${s.correct}<span class="text-3xl text-navy-500/50">/${s.questions.length}</span></p>
        <p class="font-display italic text-lg text-navy-500/70 mt-2">${scoreLabel(s.correct / s.questions.length)}</p>
      </div>

      ${s.answers.filter(a => !a.correct).length > 0 ? `
      <div class="premium-card rounded-2xl p-5 mb-3">
        <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/60 mb-3">Possible Answers</p>
        <div class="space-y-2">
          ${s.answers.filter(a => !a.correct).map(a => `
            <div class="p-3 bg-amber-50 rounded-xl">
              <div class="flex items-center gap-2">
                <span class="font-display font-bold text-2xl text-navy-500/40 num-badge">${a.letter}</span>
                <span class="font-display font-bold text-navy-500">${a.answers.join(', ')}</span>
              </div>
              <p class="text-xs text-navy-500/60 mt-1">${a.def}</p>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      ${s.onComplete
        ? `<button onclick="window.b4t.continueSession(${s.correct}, ${s.questions.length})" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Finish Mock →</button>`
        : `<button onclick="showScreen('home')" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Return Home</button>`
      }
    </div></div></div>
  `;

  if (!s.onComplete) {
    updateStreak();
    state.progress.completedSessions++;
    saveProgress(state.progress, state.user.uid);
  }
}

window.b4t.submitBrainstorm = submitBrainstorm;

// ============================================================
// MOCK TEST (all 4 tasks chained)
// ============================================================
function startMock() {
  state.mock = {
    totalScore: 0,
    totalPossible: 0,
    taskScores: [],
    currentTask: 0,
    tasks: ['spot', 'anagram', 'listening', 'brainstorm'],
  };
  runNextMockTask();
}

function runNextMockTask() {
  const m = state.mock;
  if (m.currentTask >= m.tasks.length) {
    renderMockEnd();
    return;
  }
  const task = m.tasks[m.currentTask];
  const onComplete = (score, total) => {
    m.totalScore += score;
    m.totalPossible += total;
    m.taskScores.push({ task, score, total });
    m.currentTask++;
    runNextMockTask();
  };

  if (task === 'spot')       startSpotTheError({ isMock: true, onComplete });
  else if (task === 'anagram')    startAnagram({ isMock: true, onComplete, count: 5 });
  else if (task === 'listening')  startListening({ isMock: true, onComplete });
  else if (task === 'brainstorm') startBrainstorm({ isMock: true, onComplete });
}

window.b4t.continueSession = (score, total) => {
  if (state.mock) {
    state.mock.totalScore = state.mock.totalScore || 0;
    // Already added by onComplete via local closure — but our closure captures m so it works
    // Just trigger next
    // Actually onComplete is set in startMock, so we need to call it
    const handler = state.session.onComplete;
    state.session = null;
    handler(score, total);
  }
};

function renderMockEnd() {
  const m = state.mock;
  const pct = Math.round((m.totalScore / m.totalPossible) * 100);

  state.progress.mockTests = state.progress.mockTests || [];
  state.progress.mockTests.push({
    date: new Date().toISOString().split('T')[0],
    score: m.totalScore,
    total: m.totalPossible,
    breakdown: m.taskScores,
  });
  updateStreak();
  state.progress.completedSessions++;
  saveProgress(state.progress, state.user.uid);

  const taskNames = { spot: '🔍 Spot the Error', anagram: '🔤 Anagram', listening: '🎧 Listening', brainstorm: '💡 Brainstorm' };

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-6 pb-6">
      <div class="text-center mb-5">
        <p class="text-xs tracking-wider uppercase font-semibold text-navy-500/50 mb-1">Full Mock Test · Complete</p>
        <p class="font-display text-7xl font-bold text-navy-500 num-badge leading-none">${pct}<span class="text-3xl text-navy-500/50">%</span></p>
        <p class="text-sm text-navy-500/60 mt-2 num-badge">${m.totalScore} of ${m.totalPossible} correct</p>
        <p class="font-display italic text-lg text-navy-500/70 mt-1">${scoreLabel(pct / 100)}</p>
      </div>

      <div class="premium-card rounded-2xl p-5 mb-4">
        <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/60 mb-3">Score Breakdown</p>
        <div class="space-y-3">
          ${m.taskScores.map(t => {
            const tpct = Math.round(t.score / t.total * 100);
            return `
              <div>
                <div class="flex justify-between items-baseline mb-1.5">
                  <span class="text-sm font-semibold text-navy-500">${taskNames[t.task]}</span>
                  <span class="text-xs text-navy-500/60 num-badge">${t.score}/${t.total} · ${tpct}%</span>
                </div>
                <div class="bg-navy-50 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-navy-500 h-full rounded-full" style="width:${tpct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <button onclick="window.b4t.endMock()" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">
        Return Home
      </button>
    </div></div></div>
  `;
}

window.b4t.endMock = () => {
  state.mock = null;
  showScreen('home');
};

// ============================================================
// HELPERS
// ============================================================

function showWordFeedback(correct, correctWord, userGuess, def, onContinue) {
  app().innerHTML = `
    <div class="screen animate-fade-in ${correct ? 'bg-emerald-50' : 'bg-red-50'}">
      <div class="screen-scroll flex flex-col items-center justify-center px-6 py-6">
        <div class="animate-pop">
          <div class="w-20 h-20 md:w-24 md:h-24 rounded-full ${correct ? 'bg-emerald-500' : 'bg-red-500'} flex items-center justify-center mb-4 mx-auto">
            <svg class="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              ${correct
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>'}
            </svg>
          </div>
        </div>
        <p class="font-display text-2xl md:text-3xl font-bold ${correct ? 'text-emerald-700' : 'text-red-700'} mb-2 text-center">
          ${correct ? 'Correct!' : 'Not quite.'}
        </p>
        ${!correct ? `
          <p class="text-xs text-red-600/70 tracking-wider uppercase font-semibold">You typed</p>
          <p class="font-mono text-lg md:text-xl text-red-600 mb-3 line-through">${escapeHtml(userGuess)}</p>
        ` : ''}
        <p class="text-xs text-navy-500/60 tracking-wider uppercase font-semibold mt-1">${correct ? 'Spelled correctly' : 'The correct answer'}</p>
        <p class="font-display text-4xl md:text-5xl font-bold text-navy-500 mb-2 text-center break-all">${correctWord}</p>
        <div class="gold-line w-20 my-3"></div>
        <p class="text-sm text-navy-500/70 italic text-center max-w-xs leading-snug">${escapeHtml(def)}</p>
        <button id="continueBtn" class="btn-primary mt-6 px-12 py-3 rounded-2xl font-bold tracking-wide">
          Continue →
        </button>
      </div>
    </div>
  `;
  $('#continueBtn').onclick = onContinue;
}

function recordTaskStats(taskKey, total, correct) {
  const p = state.progress;
  p.totalAttempts += total;
  p.totalCorrect += correct;
  p.taskStats = p.taskStats || {};
  p.taskStats[taskKey] = p.taskStats[taskKey] || { attempts: 0, correct: 0 };
  p.taskStats[taskKey].attempts += total;
  p.taskStats[taskKey].correct += correct;
}

function updateStreak() {
  const p = state.progress;
  const today = todayKey();
  const yesterday = yesterdayKey();
  if (p.lastPracticeDate === today) return;
  if (p.lastPracticeDate === yesterday) p.streakDays = (p.streakDays || 0) + 1;
  else p.streakDays = 1;
  p.lastPracticeDate = today;
}

function scoreLabel(ratio) {
  if (ratio >= 0.9) return 'Excellent';
  if (ratio >= 0.75) return 'Strong';
  if (ratio >= 0.6) return 'Solid';
  if (ratio >= 0.4) return 'Keep training';
  return 'Building foundations';
}

function todayKey() { return new Date().toISOString().split('T')[0]; }
function yesterdayKey() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 text-sm font-semibold animate-slide-up';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// ============================================================
// LEARN MODE — S.P.E.L.L. SYSTEM — FULL INTERACTIVE VERSION
// ============================================================
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function normalizeAnswer(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,'');}
function speakLearnWord(word) {
  if (!('speechSynthesis' in window)) { alert('Speech is not supported in this browser.'); return; }
  window.speechSynthesis.cancel();
  const slow = new SpeechSynthesisUtterance(word);
  slow.lang = 'en-GB'; slow.rate = 0.72; slow.pitch = 1.0;
  const normal = new SpeechSynthesisUtterance(word);
  normal.lang = 'en-GB'; normal.rate = 0.95; normal.pitch = 1.0;
  slow.onend = () => setTimeout(() => window.speechSynthesis.speak(normal), 250);
  window.speechSynthesis.speak(slow);
}

const CAT = {S:'Structure', P:'Pronunciation', E:'Error Pattern', L:'Logic'};
const CAT_ICON = {S:'📐', P:'🎵', E:'🎯', L:'💡'};
const CAT_COLOR = {
  S: 'bg-blue-50 text-blue-700 border-blue-200',
  P: 'bg-purple-50 text-purple-700 border-purple-200',
  E: 'bg-red-50 text-red-700 border-red-200',
  L: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};
// [structure, sound, tip/rule, level, category, common trap, quiz, answer, example]
const LEARN_CARDS = {
  investigation:['investigate → investigation','in-ves-ti-ga-tion','Drop final e before -ion. Verb → noun.',4,'S','investigatoin / investigasion','investigate → ______','investigation','The investigation revealed new facts.'],
  participate:['part + ici + pate','par-tic-i-pate','Watch the middle chunk: -ticip-.',4,'S','particapate','A verb meaning “to take part” is ______','participate','Students participate in the competition.'],
  sophisticated:['sophisticate → sophisticated','so-phis-ti-ca-ted','Chunk long words before spelling.',4,'S','soptichisticated','so-phis-ti-ca-ted = ______','sophisticated','She gave a sophisticated answer.'],
  ingredient:['in + gredi + ent','in-gre-di-ent','Ending is -ient, not -eint.',4,'P','ingredeint','One food used to make a dish is an ______','ingredient','Flour is an important ingredient.'],
  surplus:['sur + plus','sur-plus','Meaning clue: more than necessary.',4,'L','srulups','More than necessary = ______','surplus','The shop had a surplus of bread.'],
  challenging:['challenge → challenging','chal-len-ging','Keep double l from challenge.',4,'E','chalenging','challenge → ______','challenging','The task was challenging.'],
  respectable:['respect + able','re-spect-a-ble','-able means “worthy of / able to be”.',4,'S','rispectable','respect + able = ______','respectable','It is a respectable profession.'],
  satisfaction:['satisfy → satisfaction','sat-is-fac-tion','The “shun” sound is often -tion.',4,'P','satisfactien','satisfy → ______','satisfaction','Practice gives satisfaction.'],
  worthwhile:['worth + while','worth-while','Compound word: worth your time.',4,'L','worthwhale','Useful enough to spend time on = ______','worthwhile','The project is worthwhile.'],
  inspiration:['inspire → inspiration','in-spi-ra-tion','Drop final e before -ation.',4,'S','inspireation','inspire → ______','inspiration','Her story was an inspiration.'],
  availability:['available → availability','a-vail-a-bil-i-ty','-ble often changes to -bility. Vowel anchor: avAILAble.',4,'E','availebility','available → ______','availability','Check the availability of seats.'],
  unemployment:['un + employment','un-em-ploy-ment','un- means not; -ment makes a noun.',4,'S','unemploiment','not having a job = ______','unemployment','Unemployment is a serious problem.'],
  responsibility:['responsible → responsibility','re-spon-si-bil-i-ty','-ble changes to -bility.',4,'E','responsebility / responsability','responsible → ______','responsibility','Making choices is a responsibility.'],
  accommodate:['ac + com + mod + ate','a-com-mo-date','High-risk double letters: cc + mm.',4,'E','acommodate / accomodate','a-com-mo-date = ______','accommodate','The room can accommodate four people.'],
  embarrass:['em + barr + ass','em-bar-rass','Double r and double s.',4,'E','embarass','em-bar-rass = ______','embarrass','Do not embarrass your friend.'],
  occurrence:['occur → occurrence','oc-cur-rence','Double c, double r.',4,'E','ocurrence','occur → ______','occurrence','It was a rare occurrence.'],
  parallel:['par + allel','par-al-lel','Double l in the middle.',4,'E','paralel','Lines that never meet are ______','parallel','The lines are parallel.'],
  recommend:['re + commend','rec-om-mend','One c, double m.',4,'E','reccomend / recomend','To say something is good = ______','recommend','I recommend this book.'],
  committee:['com + mit + tee','com-mit-tee','Double m, double t, double e.',4,'E','comittee / commitee','A group chosen for a task = ______','committee','The committee chose a winner.'],
  immediately:['immediate → immediately','im-me-di-ate-ly','Double m. Keep -ate before -ly.',4,'E','imediately','without delay = ______','immediately','Please answer immediately.'],
  psychology:['psych + ology','sy-chol-o-gy','Silent p; -ology = study of.',4,'P','sychology','Study of mind and behaviour = ______','psychology','Psychology studies the mind.'],
  environment:['environ + ment','en-vi-ron-ment','-ment noun ending; watch n before ment.',4,'S','enviromnent','natural world around us = ______','environment','We protect the environment.'],
  consequence:['con + sequence','con-se-quence','quence sounds “kwens”; keep qu.',4,'P','consequense','result of an action = ______','consequence','Every action has a consequence.'],
  achievement:['achieve → achievement','a-chieve-ment','i before e in achieve; add -ment.',4,'S','acheivement','achieve → ______','achievement','Winning is an achievement.'],
  development:['develop + ment','de-vel-op-ment','-ment turns verb into noun.',4,'S','developement','develop → ______','development','Development means growth or progress.'],
  documentary:['document + ary','doc-u-men-ta-ry','-ary ending; keep document.',4,'S','documentry','A factual film/programme = ______','documentary','I watched a documentary programme.'],
  civilisation:['civilise → civilisation','ci-vi-li-sa-tion','British spelling often uses s: civilisation.',4,'P','civilasation','civilise → ______','civilisation','Ancient civilisation is fascinating.'],
  discoveries:['discovery → discoveries','dis-cov-er-ies','Plural: y changes to ies.',4,'E','discoverys','discovery plural = ______','discoveries','Scientific discoveries can change the world.'],
  controversial:['controversy → controversial','con-tro-ver-sial','Chunk long words before spelling.',4,'P','controvercial','A claim many people disagree about = ______','controversial','It is a controversial claim.'],
  blizzard:['weather category','bliz-zard','Severe snow storm with strong winds.',4,'L','blizard','severe snow storm = ______','blizzard','A blizzard covered the town.'],
  drizzle:['weather category','driz-zle','Light rain; double z.',4,'E','drizle','light rain in small drops = ______','drizzle','There was light drizzle.'],
  flurry:['weather category','flur-ry','Sudden light fall of snow.',4,'L','flury','sudden light snow = ______','flurry','A snow flurry blew by.'],
  heatwave:['heat + wave','heat-wave','Compound weather word.',4,'L','heat wave','very hot period for days/weeks = ______','heatwave','The city suffered a heatwave.'],
  chilly:['chill → chilly','chil-ly','Sounds like Chile, but spells chilly.',4,'L','chili / chile','quite cold = ______','chilly','The weather is chilly.'],
  officially:['official + ly','of-fi-cial-ly','Keep -cial, then add -ly.',5,'P','officielly','official + ly = ______','officially','He officially announced it.'],
  confidential:['confidence → confidential','con-fi-den-tial','The “shul” sound here is -tial.',5,'P','confedential','private/secret = ______','confidential','The report is confidential.'],
  eliminate:['e + lim + in + ate','e-lim-i-nate','Ends with -ate. Only one m.',5,'S','elimminate','remove completely = ______','eliminate','We should eliminate errors.'],
  comprehensive:['comprehend → comprehensive','com-pre-hen-sive','-sive adjective ending.',5,'S','comprihensive','complete and including many details = ______','comprehensive','The report is comprehensive.'],
  statistical:['statistics → statistical','sta-tis-ti-cal','Keep statistic + al.',5,'S','statitsical','statistics → ______','statistical','The report has statistical data.'],
  implications:['imply → implication → implications','im-pli-ca-tions','y changes to i, then -cation.',5,'S','implikations','imply → ______','implication','Think about the implications.'],
  clarification:['clarify → clarification','clar-i-fi-ca-tion','y changes to i before -cation.',5,'S','clarificeition','clarify → ______','clarification','Ask for clarification.'],
  acknowledgement:['acknowledge → acknowledgement','ac-knowl-edge-ment','Silent k/w stays; add -ment.',5,'E','acknoledgement','acknowledge → ______','acknowledgement','Please send an acknowledgement.'],
  declaration:['declare → declaration','dec-la-ra-tion','Drop final e before -ation.',5,'S','declaretion','declare → ______','declaration','Sign the declaration.'],
  respectfully:['respectful + ly','re-spect-ful-ly','respectful + ly; keep both parts.',5,'S','respectfuly','respectful + ly = ______','respectfully','Yours respectfully.'],
  bilingual:['bi + lingual','bi-lin-gual','bi- means two; lingual relates to language.',5,'S','bingilula','able to speak two languages = ______','bilingual','She is bilingual.'],
  allegation:['allege → allegation','al-le-ga-tion','Double l; drop final e before -ation.',5,'S','algaleation','statement not yet proved = ______','allegation','An allegation is not yet proven.'],
  exaggeration:['exaggerate → exaggeration','ex-ag-ger-a-tion','High-risk word: double g.',5,'E','exageration','exaggerate → ______','exaggeration','That story is an exaggeration.'],
  insufficient:['in + sufficient','in-suf-fi-cient','in- means not; sufficient has double f.',5,'E','insuficient','not enough = ______','insufficient','The evidence is insufficient.'],
  entrepreneurship:['entrepreneur + ship','en-tre-pre-neur-ship','French-origin word. Learn by chunks.',5,'S','entreprenership','starting/running businesses = ______','entrepreneurship','The lecture was on entrepreneurship.'],
  knowledgeable:['knowledge + able','knowl-edge-a-ble','Silent k; keep knowledge before -able.',5,'E','knowledgable','having much knowledge = ______','knowledgeable','He is knowledgeable.'],
  valuable:['value → valuable','val-u-a-ble','Drop final e before -able.',5,'S','valueable','value → ______','valuable','She gave valuable advice.'],
  pragmatic:['prag + mat + ic','prag-mat-ic','Practical and realistic; ends -matic.',5,'P','pragmatick','practical and realistic = ______','pragmatic','His approach is pragmatic.'],
  exterior:['ex + terior','ex-te-ri-or','ex- often means outside/out.',3,'S','exterrior','outside part = ______','exterior','The exterior is blue.'],
  miserable:['miser + able','mis-er-a-ble','-able ending. Means very unhappy.',3,'S','miserible','extremely unhappy = ______','miserable','He felt miserable.'],
  principle:['prin + ci + ple','prin-ci-ple','principle = rule/belief; principal = main/person.',3,'L','principal','basic belief or rule = ______','principle','Honesty is a principle.'],
  introduce:['intro + duce','in-tro-duce','intro- means into.',3,'S','inucdetro','tell someone another person’s name = ______','introduce','Let me introduce my friend.'],
  seasonal:['season + al','sea-son-al','-al adjective ending.',3,'S','sealason','available only at a certain time of year = ______','seasonal','Mango is seasonal.'],
  vocabulary:['vocab + ulary','vo-cab-u-la-ry','Learn by chunks: vo-cab-u-la-ry.',3,'S','volacabuyr','all words a person knows = ______','vocabulary','She has a strong vocabulary.']
};
const HIGH_VALUE_WORDS = Object.keys(LEARN_CARDS);
const PATTERN_DRILLS = HIGH_VALUE_WORDS.map(w=>[LEARN_CARDS[w][6], LEARN_CARDS[w][7], LEARN_CARDS[w][2], w]);
const ERROR_DRILLS = HIGH_VALUE_WORDS.filter(w=>LEARN_CARDS[w][5]).map(w=>[LEARN_CARDS[w][5].split('/')[0].trim(), LEARN_CARDS[w][7], LEARN_CARDS[w][2], w]);
const BRAINSTORM_DRILLS = [
  ['WEATHER','B','A severe snow storm with strong winds.','blizzard','Think category: snow/storm/cold/rain/heat.'],['WEATHER','C','Quite cold; sounds like a South American country.','chilly','Sound clue: Chile → chilly.'],['WEATHER','D','Rain in very small drops.','drizzle','Light rain words.'],['WEATHER','F','A sudden light fall of snow blown by wind.','flurry','Snow + wind category.'],['WEATHER','H','A very hot period for days or weeks.','heatwave','Compound: heat + wave.'],['PERSONALITY','A','A person who shows love or liking for someone.','admirer','Person noun: -er.'],['PERSONALITY','M','One day happy, next day sad.','moody','Mood changes → moody.'],['PERSONALITY','F','Can adapt to new situations.','flexible','Meaning first.'],['PERSONALITY','A','Wants to achieve a lot in life.','ambitious','Personality adjective.'],['PERSONALITY','I','Not confident about themself.','insecure','in- means not.'],['COUNTRYSIDE','F','A large area of land with grass or crops.','field','Land/farm category.'],['COUNTRYSIDE','W','Animals and plants of the natural world.','wildlife','wild + life.'],['COUNTRYSIDE','C','A small house in the countryside.','cottage','Double t.'],['COUNTRYSIDE','S','A continuous body of flowing water.','stream','Water category.']
];

const UK_US_DRILLS = [
  ['color', 'colour', '-or → -our', 'Many British spellings add u after o: colour, favourite, behaviour.'],
  ['favorite', 'favourite', '-or → -our', 'The UK form keeps the u: favourite.'],
  ['flavor', 'flavour', '-or → -our', 'Food words often use -our in UK spelling: flavour.'],
  ['neighbor', 'neighbour', '-or → -our', 'UK spelling: neighbour.'],
  ['behavior', 'behaviour', '-or → -our', 'UK spelling: behaviour.'],
  ['center', 'centre', '-er → -re', 'Some words reverse -er to -re in UK spelling: centre, theatre.'],
  ['theater', 'theatre', '-er → -re', 'UK spelling uses -re: theatre.'],
  ['meter', 'metre', '-er → -re', 'For the unit of length, UK spelling is metre.'],
  ['liter', 'litre', '-er → -re', 'UK spelling is litre.'],
  ['organize', 'organise', '-ize → -ise', 'In British-style competition spelling, practise -ise forms.'],
  ['realize', 'realise', '-ize → -ise', 'US -ize often becomes UK -ise.'],
  ['recognize', 'recognise', '-ize → -ise', 'US -ize often becomes UK -ise.'],
  ['analyze', 'analyse', '-yze → -yse', 'US -yze becomes UK -yse: analyse.'],
  ['paralyze', 'paralyse', '-yze → -yse', 'US -yze becomes UK -yse: paralyse.'],
  ['traveling', 'travelling', 'double l', 'British spelling often doubles l before -ing/-ed: travelling, travelled.'],
  ['traveled', 'travelled', 'double l', 'British spelling often doubles l before -ing/-ed.'],
  ['canceled', 'cancelled', 'double l', 'UK spelling doubles l: cancelled.'],
  ['canceling', 'cancelling', 'double l', 'UK spelling doubles l: cancelling.'],
  ['program', 'programme', 'programme', 'Use programme for TV/radio/event/training programme. Computer program can stay program.'],
  ['defense', 'defence', '-se → -ce', 'UK spelling often uses -ce for nouns: defence, offence.'],
  ['offense', 'offence', '-se → -ce', 'UK spelling: offence.'],
  ['license', 'licence', 'noun form', 'UK noun is licence; verb is license.'],
  ['practice (verb)', 'practise', 'noun/verb split', 'UK: practice = noun, practise = verb.'],
  ['gray', 'grey', 'a → e', 'UK spelling is usually grey.'],
  ['dialog', 'dialogue', '-ogue', 'UK spelling commonly keeps -ogue: dialogue, catalogue.'],
  ['catalog', 'catalogue', '-ogue', 'UK spelling commonly keeps -ogue: catalogue.']
];

function renderLearnMode() {
  const n4 = HIGH_VALUE_WORDS.filter(w => LEARN_CARDS[w][3] === 4).length;
  const n5 = HIGH_VALUE_WORDS.filter(w => LEARN_CARDS[w][3] === 5).length;
  const n3 = HIGH_VALUE_WORDS.filter(w => LEARN_CARDS[w][3] === 3).length;

  const drillButton = (kind, icon, name, desc, extraClass = '') => `
    <button onclick="window.b4t.startLearnDrill('${kind}')" class="premium-card rounded-2xl p-4 text-left ${extraClass}">
      <div class="text-3xl mb-2">${icon}</div>
      <p class="font-display font-bold text-navy-500">${name}</p>
      <p class="text-xs text-navy-500/60">${desc}</p>
    </button>
  `;

  app().innerHTML = `
    <div class="screen has-nav animate-fade-in"><div class="screen-scroll px-5 pt-8 pb-28"><div class="max-w-2xl mx-auto">

      <div class="flex items-center gap-3 mb-5">
        <button onclick="showScreen('home')" class="bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 font-bold rounded-full px-4 py-2 flex items-center gap-1.5 transition shadow-sm border border-amber-300" aria-label="Back to home">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
          <span class="text-sm">Back</span>
        </button>
        <div>
          <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase">Technique training</p>
          <h1 class="font-display text-3xl font-bold text-navy-500">Learn Mode</h1>
        </div>
      </div>

      <div class="hero-gradient diagonal-pattern text-white rounded-3xl p-6 mb-5">
        <p class="font-display italic text-sm opacity-80">S.P.E.L.L. System</p>
        <p class="font-display text-3xl font-bold leading-tight mt-1">Learn patterns, not just words.</p>
        <p class="text-sm opacity-85 mt-3">Structure · Pronunciation · Error Pattern · Logic · Speed</p>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-5">
        ${drillButton('pattern',    '🧩', 'Pattern Drill',     'suffix, prefix, family')}
        ${drillButton('error',      '🎯', 'Error Instinct',    'choose correct spelling')}
        ${drillButton('brainstorm', '💡', 'Brainstorm Logic',  'definition → word')}
        ${drillButton('mixed',      '🏆', 'Mixed Challenge',   'all techniques', 'border-amber-200 bg-amber-50/60')}
        ${drillButton('speed',      '⚡', 'Speed Recall',      'fast answer training')}
        ${drillButton('uk',         '🇬🇧', 'US → UK Practice',  'British spelling patterns', 'border-blue-200 bg-blue-50/60')}
        <button onclick="window.b4t.reviewLearnMistakes()" class="premium-card rounded-2xl p-4 text-left">
          <div class="text-3xl mb-2">📌</div>
          <p class="font-display font-bold text-navy-500">Mistake Bank</p>
          <p class="text-xs text-navy-500/60">review weak words</p>
        </button>
      </div>

      <div class="premium-card rounded-2xl p-4 mb-5">
        <p class="font-display font-bold text-navy-500 text-lg">Coverage</p>
        <p class="text-sm text-navy-500/70">${HIGH_VALUE_WORDS.length} high-value words · Bee4 ${n4} · Bee5 ${n5} · Bee3 ${n3}</p>
        <p class="text-xs text-navy-500/50 mt-1">Tap LEARN to open a mini lesson and quick quiz.</p>
      </div>

      <div class="flex justify-between items-baseline mb-3">
        <h2 class="font-display text-lg font-bold text-navy-500">High-value Patterns</h2>
        <p class="text-xs text-navy-500/50 font-semibold tabular-nums" id="learnCardCount">${HIGH_VALUE_WORDS.length} words</p>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1" role="tablist">
        <button onclick="window.b4t.filterLearnCards('all')" data-filter="all"
                class="filter-pill bg-navy-500 text-white px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border border-navy-500">
          All ${HIGH_VALUE_WORDS.length}
        </button>
        <button onclick="window.b4t.filterLearnCards('S')" data-filter="S"
                class="filter-pill bg-white border border-navy-100 text-navy-500 hover:bg-blue-50 hover:border-blue-200 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition">
          📐 Structure ${HIGH_VALUE_WORDS.filter(w => LEARN_CARDS[w][4] === 'S').length}
        </button>
        <button onclick="window.b4t.filterLearnCards('P')" data-filter="P"
                class="filter-pill bg-white border border-navy-100 text-navy-500 hover:bg-purple-50 hover:border-purple-200 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition">
          🎵 Sound ${HIGH_VALUE_WORDS.filter(w => LEARN_CARDS[w][4] === 'P').length}
        </button>
        <button onclick="window.b4t.filterLearnCards('E')" data-filter="E"
                class="filter-pill bg-white border border-navy-100 text-navy-500 hover:bg-red-50 hover:border-red-200 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition">
          🎯 Error ${HIGH_VALUE_WORDS.filter(w => LEARN_CARDS[w][4] === 'E').length}
        </button>
        <button onclick="window.b4t.filterLearnCards('L')" data-filter="L"
                class="filter-pill bg-white border border-navy-100 text-navy-500 hover:bg-emerald-50 hover:border-emerald-200 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition">
          💡 Logic ${HIGH_VALUE_WORDS.filter(w => LEARN_CARDS[w][4] === 'L').length}
        </button>
      </div>

      <div id="learnCardList" class="space-y-3">
        ${HIGH_VALUE_WORDS.map(renderLearnCard).join('')}
      </div>

    </div></div></div>
  `;
}

function filterLearnCards(cat) {
  const words = cat === 'all'
    ? HIGH_VALUE_WORDS
    : HIGH_VALUE_WORDS.filter(w => LEARN_CARDS[w][4] === cat);

  // Update card list
  const el = $('#learnCardList');
  if (!el) return;
  el.innerHTML = words.map(renderLearnCard).join('') ||
    `<div class="premium-card rounded-2xl p-6 text-center text-navy-500/60">No words in this category yet.</div>`;

  // Update count
  const countEl = $('#learnCardCount');
  if (countEl) countEl.textContent = `${words.length} word${words.length === 1 ? '' : 's'}`;

  // Update active filter pill (visual feedback)
  document.querySelectorAll('[data-filter]').forEach(btn => {
    const isActive = btn.dataset.filter === cat;
    if (isActive) {
      btn.classList.remove('bg-white', 'border-navy-100', 'text-navy-500');
      btn.classList.add('bg-navy-500', 'text-white', 'border-navy-500');
    } else {
      btn.classList.add('bg-white', 'border-navy-100', 'text-navy-500');
      btn.classList.remove('bg-navy-500', 'text-white', 'border-navy-500');
    }
  });
}

function renderLearnCard(w) {
  const c = LEARN_CARDS[w];
  if (!c) return '';
  const catKey = c[4];
  const catColor = CAT_COLOR[catKey] || 'bg-gray-50 text-gray-700 border-gray-200';
  const catIcon = CAT_ICON[catKey] || '•';
  return `
    <div class="premium-card rounded-2xl px-3 py-2.5 flex items-center gap-3">
      <!-- Listen button -->
      <button onclick="event.stopPropagation(); window.b4t.speakLearnWord('${escapeHtml(w)}')"
              class="bg-navy-50 hover:bg-navy-100 active:bg-navy-200 text-navy-500 rounded-full w-10 h-10 flex items-center justify-center text-sm flex-shrink-0 transition"
              aria-label="Listen to ${escapeHtml(w)}">🔊</button>

      <!-- Word + structure preview -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="font-display font-bold text-lg text-navy-500 leading-tight">${escapeHtml(w)}</p>
          <span class="${catColor} border text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            ${catIcon} BEE ${c[3]}
          </span>
        </div>
        <p class="text-xs text-navy-500/65 truncate font-mono">${escapeHtml(c[0])}</p>
      </div>

      <!-- LEARN button -->
      <button onclick="window.b4t.openLearnCard('${escapeHtml(w)}')"
              class="bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 font-bold text-xs uppercase tracking-wider px-3 py-2 rounded-full border border-amber-300 transition shadow-sm flex-shrink-0">
        Learn
      </button>
    </div>
  `;
}

function openLearnCard(word) {
  const c = LEARN_CARDS[word];
  if (!c) return;
  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-8 pb-6">

      <div class="flex items-center gap-3 mb-5">
        <button onclick="showScreen('learn')" class="bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 font-bold rounded-full px-4 py-2 flex items-center gap-1.5 transition shadow-sm border border-amber-300" aria-label="Back to Learn Mode">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
          <span class="text-sm">Back</span>
        </button>
        <div>
          <p class="text-xs tracking-wider uppercase font-semibold text-navy-500/50">Mini lesson · Bee ${c[3]}</p>
          <div class="flex items-center gap-2">
            <h1 class="font-display text-3xl font-bold text-navy-500">${escapeHtml(word)}</h1>
            <button onclick="window.b4t.speakLearnWord('${escapeHtml(word)}')"
                    class="bg-navy-50 hover:bg-navy-100 text-navy-500 rounded-full w-11 h-11 flex items-center justify-center text-xl"
                    aria-label="Listen to ${escapeHtml(word)}">🔊</button>
          </div>
        </div>
      </div>

      <div class="hero-gradient diagonal-pattern text-white rounded-3xl p-6 mb-4">
        <p class="text-xs uppercase tracking-wider opacity-70 mb-2">${CAT[c[4]]}</p>
        <p class="font-display text-2xl font-bold">${escapeHtml(c[0])}</p>
        <div class="flex items-center gap-3 mt-3">
          <p class="font-mono text-lg opacity-90">${escapeHtml(c[1])}</p>
          <button onclick="window.b4t.speakLearnWord('${escapeHtml(word)}')"
                  class="bg-white/15 hover:bg-white/25 text-white rounded-full px-4 py-2 text-sm font-bold">🔊 Listen</button>
        </div>
      </div>

      <div class="premium-card rounded-3xl p-5 mb-4 space-y-3">
        <p><b>Rule:</b> ${escapeHtml(c[2])}</p>
        <p><b>Common trap:</b> <span class="text-red-600">${escapeHtml(c[5])}</span></p>
        <p class="bg-navy-50 rounded-xl p-3"><b>Example:</b> ${escapeHtml(c[8])}</p>
      </div>

      <button onclick="window.b4t.startCardQuiz('${escapeHtml(word)}')" class="btn-primary w-full py-4 rounded-xl font-bold">Quick Quiz</button>
      <button onclick="showScreen('learn')" class="btn-secondary w-full py-4 rounded-xl font-bold mt-3">Back</button>

    </div></div></div>
  `;
}

function startCardQuiz(word) {
  const c = LEARN_CARDS[word];
  if (!c) return;
  state.session = {
    type: 'learn-card',
    items: [[c[6], c[7], c[2], word]],
    index: 0,
    correct: 0,
    answers: [],
  };
  renderLearnDrill();
}

function startLearnDrill(kind) {
  let items;
  if (kind === 'pattern' || kind === 'speed') items = PATTERN_DRILLS;
  else if (kind === 'error') items = ERROR_DRILLS;
  else if (kind === 'brainstorm') items = BRAINSTORM_DRILLS;
  else if (kind === 'uk') items = UK_US_DRILLS;
  else if (kind === 'mixed') {
    items = [
      ...PATTERN_DRILLS.map(x => ['pattern', ...x]),
      ...ERROR_DRILLS.map(x => ['error', ...x]),
      ...BRAINSTORM_DRILLS.map(x => ['brainstorm', ...x]),
      ...UK_US_DRILLS.map(x => ['uk', ...x]),
    ];
  } else items = PATTERN_DRILLS;

  state.session = {
    type: 'learn-' + kind,
    items: shuffleArray(items).slice(0, kind === 'mixed' ? 10 : 6),
    index: 0,
    correct: 0,
    answers: [],
  };
  renderLearnDrill();
}

function renderLearnDrill() {
  const s = state.session;
  let it = s.items[s.index];
  let kind = s.type.replace('learn-', '');

  if (kind === 'mixed') {
    kind = it[0];
    it = it.slice(1);
  }
  if (s.type === 'learn-card') kind = 'card';

  let body = '';

  if (kind === 'pattern' || kind === 'speed' || kind === 'card') {
    const label = kind === 'speed' ? 'Fast recall'
                : kind === 'card'  ? 'Card quiz'
                : 'Complete the pattern';
    body = `
      <p class="text-xs uppercase tracking-wider font-semibold text-navy-500/50 mb-3">${label}</p>
      <p class="font-display text-3xl font-bold text-navy-500 mb-4">${escapeHtml(it[0])}</p>
      <p class="text-sm text-navy-500/60 mb-4">Hint: ${escapeHtml(it[2])}</p>
      <input id="learnAnswer"
             class="spell-input w-full px-4 py-4 bg-amber-50/40 border-2 border-amber-200 rounded-xl text-xl text-center"
             autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
             aria-label="Your answer" autofocus>
    `;
  } else if (kind === 'error') {
    body = `
      <p class="text-xs uppercase tracking-wider font-semibold text-navy-500/50 mb-3">Choose the correct spelling</p>
      <div class="grid gap-3">
        ${shuffleArray([it[0], it[1]]).map(x => `
          <button onclick="window.b4t.submitLearn('${escapeHtml(x)}')"
                  class="btn-secondary py-4 rounded-xl font-mono text-lg font-bold">${escapeHtml(x)}</button>
        `).join('')}
      </div>
    `;
  } else if (kind === 'uk') {
    body = `
      <p class="text-xs uppercase tracking-wider font-semibold text-navy-500/50 mb-3">US → UK Spelling</p>
      <p class="text-sm text-navy-500/60 mb-3">Convert this American spelling to the British spelling used in the competition style.</p>
      <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
        <p class="text-[10px] uppercase tracking-wider font-semibold text-blue-700/60 mb-1">US spelling</p>
        <p class="font-display text-4xl font-bold text-navy-500">${escapeHtml(it[0])}</p>
      </div>
      <p class="text-sm text-navy-500/60 mb-4">Pattern clue: <b>${escapeHtml(it[2])}</b></p>
      <input id="learnAnswer"
             class="spell-input w-full px-4 py-4 bg-amber-50/40 border-2 border-amber-200 rounded-xl text-xl text-center"
             autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
             placeholder="Type UK spelling..."
             aria-label="British spelling answer" autofocus>
    `;
  } else {
    body = `
      <div class="flex items-center gap-2 mb-4 flex-wrap">
        <span class="level-pill level-4">${escapeHtml(it[0])}</span>
        <span class="font-display font-bold text-3xl text-navy-500">${escapeHtml(it[1])}____</span>
      </div>
      <p class="text-lg text-navy-500 mb-3">${escapeHtml(it[2])}</p>
      <p class="text-sm text-navy-500/60 mb-4">Strategy: ${escapeHtml(it[4])}</p>
      <input id="learnAnswer"
             class="spell-input w-full px-4 py-4 bg-amber-50/40 border-2 border-amber-200 rounded-xl text-xl text-center"
             autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
             aria-label="Your answer" autofocus>
    `;
  }

  const title = kind === 'pattern'    ? 'Pattern Drill'
              : kind === 'error'      ? 'Error Instinct'
              : kind === 'brainstorm' ? 'Brainstorm Logic'
              : kind === 'speed'      ? 'Speed Recall'
              : kind === 'uk'         ? 'US → UK Practice'
              : kind === 'card'       ? 'Quick Quiz'
                                      : 'Mixed Challenge';

  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-8 pb-6">
      <div class="flex items-center gap-3 mb-6">
        <button onclick="showScreen('learn')" class="bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 font-bold rounded-full px-4 py-2 flex items-center gap-1.5 transition shadow-sm border border-amber-300" aria-label="Back to Learn Mode">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
          <span class="text-sm">Back</span>
        </button>
        <div>
          <p class="text-xs tracking-wider uppercase font-semibold text-navy-500/50">Learn Mode · ${s.index + 1}/${s.items.length}</p>
          <h1 class="font-display text-3xl font-bold text-navy-500">${title}</h1>
        </div>
      </div>
      <div class="premium-card rounded-3xl p-6 mb-4">${body}</div>
      ${kind === 'error'
        ? '<button onclick="showScreen(\'learn\')" class="btn-secondary w-full py-4 rounded-xl font-bold mt-auto">Back</button>'
        : '<button onclick="window.b4t.submitLearn()" class="btn-primary w-full py-4 rounded-xl font-bold mt-auto">Check</button>'
      }
    </div></div></div>
  `;

  const inp = $('#learnAnswer');
  if (inp) inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') window.b4t.submitLearn();
  });
}

function submitLearn(choice) {
  const s = state.session;
  let it = s.items[s.index];
  let kind = s.type.replace('learn-', '');

  if (kind === 'mixed') {
    kind = it[0];
    it = it.slice(1);
  }
  if (s.type === 'learn-card') kind = 'card';

  const guess = normalizeAnswer(choice || ($('#learnAnswer')?.value || ''));
  const rawAnswer = (kind === 'pattern' || kind === 'speed' || kind === 'card' || kind === 'uk')
    ? it[1]
    : (kind === 'error' ? it[1] : it[3]);
  const answer = normalizeAnswer(rawAnswer);
  const lesson = kind === 'uk'
    ? `${it[2]} — ${it[3]}`
    : (kind === 'pattern' || kind === 'speed' || kind === 'card')
      ? it[2]
      : (kind === 'error' ? it[2] : it[4]);

  const ok = guess === answer;
  if (ok) s.correct++;
  else logLearnMistake(rawAnswer);

  s.answers.push({ answer: rawAnswer, guess, ok, lesson });
  showLearnFeedback(ok, rawAnswer, guess, lesson);
}

function showLearnFeedback(ok, answer, guess, lesson) {
  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-10 pb-6">
      <div class="text-center mb-6">
        <div class="text-6xl mb-3" aria-hidden="true">${ok ? '✅' : '🧠'}</div>
        <p class="font-display text-3xl font-bold text-navy-500">${ok ? 'Correct!' : 'Learn this pattern'}</p>
      </div>
      <div class="premium-card rounded-3xl p-6 mb-4">
        <p class="text-xs uppercase tracking-wider font-semibold text-navy-500/50 mb-2">Answer</p>
        <p class="font-display text-3xl font-bold text-navy-500 mb-2">${escapeHtml(answer)}</p>
        ${!ok ? `<p class="text-sm text-red-600 mb-3">Your answer: ${escapeHtml(guess || '(blank)')}</p>` : ''}
        <p class="bg-amber-50 rounded-xl p-4 text-navy-500"><b>Technique:</b> ${escapeHtml(lesson)}</p>
        ${LEARN_CARDS[String(answer).toLowerCase()]
          ? `<div class="mt-4">${renderLearnCard(String(answer).toLowerCase())}</div>`
          : ''}
      </div>
      <button onclick="window.b4t.nextLearn()" class="btn-primary w-full py-4 rounded-xl font-bold mt-auto">Continue</button>
    </div></div></div>
  `;
}

function scoreLabelLearn(x) {
  if (x >= 0.9) return 'Excellent pattern control';
  if (x >= 0.7) return 'Good — review mistakes';
  if (x >= 0.5) return 'Building skill';
  return 'Needs focused review';
}

function nextLearn() {
  const s = state.session;
  s.index++;
  if (s.index < s.items.length) {
    renderLearnDrill();
    return;
  }
  app().innerHTML = `
    <div class="screen animate-fade-in"><div class="screen-scroll flex flex-col"><div class="max-w-2xl mx-auto w-full flex flex-col flex-1 px-5 pt-10 pb-6">
      <div class="text-center mb-6">
        <p class="text-xs tracking-wider uppercase font-semibold text-navy-500/50 mb-1">Learn Mode Result</p>
        <p class="font-display text-7xl font-bold text-navy-500 num-badge">${s.correct}<span class="text-3xl text-navy-500/50">/${s.items.length}</span></p>
        <p class="font-display italic text-lg text-navy-500/70 mt-2">${scoreLabelLearn(s.correct / s.items.length)}</p>
      </div>
      <div class="premium-card rounded-2xl p-4 mb-4">
        <p class="font-bold text-navy-500 mb-2">Next best step</p>
        <p class="text-sm text-navy-500/70">If score is below 70%, open Mistake Bank and repeat weak words only.</p>
      </div>
      <button onclick="showScreen('learn')" class="btn-primary w-full py-4 rounded-xl font-bold mt-auto">Back to Learn Mode</button>
    </div></div></div>
  `;
}

function getLearnMistakes() {
  try { return JSON.parse(localStorage.getItem('b4t_learn_mistakes') || '[]'); }
  catch { return []; }
}

function logLearnMistake(word) {
  const a = getLearnMistakes();
  a.push({ word: String(word).toLowerCase(), date: todayKey() });
  localStorage.setItem('b4t_learn_mistakes', JSON.stringify(a.slice(-80)));
}

function reviewLearnMistakes() {
  const words = [...new Set(getLearnMistakes().map(x => x.word))].reverse();
  app().innerHTML = `
    <div class="screen has-nav animate-fade-in"><div class="screen-scroll px-5 pt-8 pb-28"><div class="max-w-2xl mx-auto">
      <button onclick="showScreen('learn')" class="mb-4 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 font-bold rounded-full px-4 py-2 inline-flex items-center gap-1.5 transition shadow-sm border border-amber-300" aria-label="Back to Learn Mode">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
        <span class="text-sm">Back</span>
      </button>
      <h1 class="font-display text-3xl font-bold text-navy-500 mb-4">Mistake Bank</h1>
      ${words.length
        ? `<div class="space-y-3 mb-4">
             ${words.map(w => renderLearnCard(w) || `
               <div class="premium-card rounded-2xl p-4">
                 <p class="font-display font-bold text-xl text-navy-500">${escapeHtml(w)}</p>
                 <p class="text-sm text-navy-500/60">Review spelling and meaning.</p>
               </div>
             `).join('')}
           </div>
           <button onclick="window.b4t.startLearnDrill('mixed')" class="btn-primary w-full py-4 rounded-xl font-bold">Train Mixed Challenge</button>`
        : `<div class="premium-card rounded-2xl p-6 text-center">
             <p class="text-4xl mb-2" aria-hidden="true">🌟</p>
             <p class="font-display font-bold text-xl text-navy-500">No mistakes yet</p>
             <p class="text-sm text-navy-500/60 mt-1">Do drills first. Mistakes will appear here automatically.</p>
           </div>`
      }
    </div></div></div>
  `;
}

function learnMiniCard(word) {
  const c = LEARN_CARDS[String(word).toLowerCase()];
  if (!c) return '';
  return `
    <div class="mt-2 p-3 bg-amber-50 rounded-xl text-xs text-navy-500/75">
      <b>🧠 Learn:</b> ${escapeHtml(c[0])}<br>
      <b>Sound:</b> <span class="font-mono">${escapeHtml(c[1])}</span><br>
      <b>Tip:</b> ${escapeHtml(c[2])}
    </div>
  `;
}


// ============================================================
// PUBLIC API
// ============================================================
Object.assign(window.b4t, {
  speakLearnWord,
  startLearnDrill,
  reviewLearnMistakes,
  submitLearn,
  nextLearn,
  openLearnCard,
  filterLearnCards,
  startCardQuiz,
  startTask: (taskId) => {
    if (taskId === 'spot')       startSpotTheError();
    else if (taskId === 'anagram')    startAnagram({ count: 5 });
    else if (taskId === 'listening')  startListening();
    else if (taskId === 'brainstorm') startBrainstorm();
  },
  startMock,
  exitSession: () => {
    if (confirm('Exit this practice? Your progress this round will not be saved.')) {
      speechSynthesis.cancel();
      if (state.session) {
        state.session.playing = false;
        state.session.paused = false;
      }
      state.session = null;
      state.mock = null;
      showScreen('home');
    }
  },
  logout: async () => {
    if (!confirm('Log out of Bee4 to Tokyo?')) return;
    if (firebaseAuth) try { await firebaseAuth.signOut(firebaseAuth.instance); } catch {}
    localStorage.removeItem('b4t_currentUser');
    state.user = null;
    state.progress = defaultProgress();
    renderLogin();
  },
});

// ============================================================
// BOOT
// ============================================================
(async function boot() {
  initSpeech();
  await initFirebase();

  if (OFFLINE_MODE) {
    const cu = localStorage.getItem('b4t_currentUser');
    if (cu) {
      state.user = JSON.parse(cu);
      state.progress = await loadProgress(state.user.uid);
      showScreen('home');
      return;
    }
  } else if (firebaseAuth) {
    firebaseAuth.onAuthStateChanged(firebaseAuth.instance, async (fbUser) => {
      if (fbUser) {
        state.user = { uid: fbUser.uid, name: fbUser.displayName || 'Student', email: fbUser.email };
        state.progress = await loadProgress(state.user.uid);
        showScreen('home');
      } else renderLogin();
    });
    return;
  }
  renderLogin();
})();
