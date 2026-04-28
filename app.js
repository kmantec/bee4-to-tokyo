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
function showScreen(name) {
  $$('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
  if (!state.user) { renderLogin(); return; }
  $('#bottomNav').classList.remove('hidden');
  if      (name === 'home')     renderHome();
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
    <div class="px-6 py-12 min-h-screen flex flex-col animate-fade-in">
      <div class="text-center mb-10 animate-slide-up">
        <div class="inline-block mb-6 relative">
          <div class="absolute inset-0 bg-navy-500 rounded-2xl blur-xl opacity-20"></div>
          <div class="relative bg-navy-500 text-white w-20 h-20 rounded-2xl flex items-center justify-center">
            <span class="font-display font-bold text-4xl tracking-tight">B4</span>
          </div>
        </div>
        <h1 class="font-display text-5xl font-bold text-navy-500 leading-none tracking-tight">
          Bee<span class="italic">4</span>
        </h1>
        <p class="font-display italic text-2xl text-navy-500/70 mt-1">to Tokyo</p>
        <div class="gold-line w-24 mx-auto my-4"></div>
        <p class="text-sm text-navy-500/60 tracking-wide uppercase font-semibold">Spelling Bee Trainer</p>
      </div>

      <div class="premium-card rounded-3xl p-7 mb-4">
        <div class="flex gap-1 mb-6 p-1 bg-navy-50 rounded-xl">
          <button id="tabLogin" class="flex-1 py-2.5 rounded-lg bg-white text-navy-500 font-semibold text-sm shadow-sm">Log In</button>
          <button id="tabSignup" class="flex-1 py-2.5 rounded-lg text-navy-500/50 font-semibold text-sm">Sign Up</button>
        </div>
        <form id="authForm" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-navy-500/60 tracking-wider uppercase">Name</label>
            <input id="authName" type="text" placeholder="Your name" autocomplete="name"
                   class="w-full mt-1.5 px-4 py-3 bg-navy-50/50 rounded-xl border border-navy-100 focus:border-navy-500 focus:bg-white transition" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-navy-500/60 tracking-wider uppercase">Email</label>
            <input id="authEmail" type="email" placeholder="you@example.com" autocomplete="email"
                   class="w-full mt-1.5 px-4 py-3 bg-navy-50/50 rounded-xl border border-navy-100 focus:border-navy-500 focus:bg-white transition" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-navy-500/60 tracking-wider uppercase">Password</label>
            <input id="authPass" type="password" placeholder="••••••••"
                   class="w-full mt-1.5 px-4 py-3 bg-navy-50/50 rounded-xl border border-navy-100 focus:border-navy-500 focus:bg-white transition" required minlength="6" />
          </div>
          <button type="submit" id="authSubmit" class="btn-primary w-full py-3.5 rounded-xl font-bold tracking-wide">Log In</button>
        </form>
        <div id="authError" class="hidden mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium"></div>
        ${OFFLINE_MODE ? `<p class="mt-5 pt-5 border-t border-navy-100 text-[11px] text-center text-navy-500/50 tracking-wide">Running offline · Configure Firebase for cross-device sync</p>` : ''}
      </div>
      <p class="text-center text-[11px] text-navy-500/40 mt-auto tracking-wider uppercase">Path to the World Finals</p>
    </div>
  `;

  let mode = 'login';
  $('#tabLogin').onclick = () => {
    mode = 'login';
    $('#tabLogin').className = 'flex-1 py-2.5 rounded-lg bg-white text-navy-500 font-semibold text-sm shadow-sm';
    $('#tabSignup').className = 'flex-1 py-2.5 rounded-lg text-navy-500/50 font-semibold text-sm';
    $('#authSubmit').textContent = 'Log In';
  };
  $('#tabSignup').onclick = () => {
    mode = 'signup';
    $('#tabSignup').className = 'flex-1 py-2.5 rounded-lg bg-white text-navy-500 font-semibold text-sm shadow-sm';
    $('#tabLogin').className = 'flex-1 py-2.5 rounded-lg text-navy-500/50 font-semibold text-sm';
    $('#authSubmit').textContent = 'Sign Up';
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
    <div class="animate-fade-in">
      <div class="px-5 pt-8 pb-2 flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase">Welcome back</p>
          <h1 class="font-display text-3xl font-bold text-navy-500 leading-tight mt-0.5">${escapeHtml(state.user.name)}</h1>
        </div>
        <button onclick="window.b4t.logout()" class="text-navy-500/40 hover:text-navy-500 p-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg>
        </button>
      </div>

      <div class="mx-5 mb-5 hero-gradient diagonal-pattern text-white rounded-3xl p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div class="relative">
          <p class="font-display italic text-sm opacity-80">Day Streak</p>
          <p class="font-display text-7xl font-bold leading-none mt-1 num-badge">${p.streakDays}</p>
          <div class="gold-line w-12 my-3 opacity-40"></div>
          <p class="text-sm opacity-90 leading-snug">
            ${todayDone ? 'Today\'s practice complete. Excellent work.' : 'Practice today to keep your streak alive.'}
          </p>
        </div>
      </div>

      <div class="px-5 grid grid-cols-3 gap-2 mb-5">
        ${statCard(p.totalCorrect, 'Correct')}
        ${statCard(accuracy + '%', 'Accuracy')}
        ${statCard(p.completedSessions, 'Sessions')}
      </div>

      <div class="px-5 mb-3">
        <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase mb-2.5">Quick Practice</p>
      </div>

      <!-- Task buttons -->
      <div class="px-5 grid grid-cols-2 gap-3 mb-3">
        ${taskButton('spot',       '🔍', 'Spot the Error',  'Find misspelled words')}
        ${taskButton('anagram',    '🔤', 'Anagram',         'Unscramble letters')}
        ${taskButton('listening',  '🎧', 'Listening',       'Hear and fill in')}
        ${taskButton('brainstorm', '💡', 'Brainstorm',      'Theme + first letter')}
      </div>

      <div class="px-5 mt-3">
        <button onclick="window.b4t.startMock()" class="btn-primary w-full p-5 rounded-2xl flex items-center gap-4 text-left">
          <div class="bg-white/10 rounded-xl p-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497"/></svg>
          </div>
          <div class="flex-1">
            <p class="font-display text-xl font-bold leading-tight">Full Mock Test</p>
            <p class="text-sm opacity-70">All 4 tasks · ESB simulation</p>
          </div>
          <svg class="w-5 h-5 opacity-60" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
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
    <div class="animate-fade-in">
      <div class="px-5 pt-8 pb-3">
        <p class="text-xs font-semibold text-navy-500/50 tracking-wider uppercase">Pick a task</p>
        <h1 class="font-display text-3xl font-bold text-navy-500 mt-0.5">Train</h1>
      </div>
      <div class="px-5 space-y-3">
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
    </div>
  `;
}

// ============================================================
// MOCK TEST MENU
// ============================================================
function renderMockMenu() {
  const tests = state.progress.mockTests || [];
  app().innerHTML = `
    <div class="animate-fade-in">
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
    </div>
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
    <div class="animate-fade-in">
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
      </div>

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
    <div class="animate-fade-in min-h-screen flex flex-col">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.exitSession()" class="text-navy-500/60 hover:text-navy-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
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
    </div>
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
    <div class="animate-fade-in min-h-screen flex flex-col">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.backToSpot()" class="text-navy-500/60 hover:text-navy-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
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
    </div>
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
    <div class="animate-fade-in min-h-screen flex flex-col px-5 pt-6 pb-6">
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
    </div>
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
    <div class="animate-fade-in min-h-screen flex flex-col">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.exitSession()" class="text-navy-500/60 hover:text-navy-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
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
        <div class="premium-card rounded-3xl p-7">
          <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/55 mb-3 text-center">Scrambled Letters</p>
          <p class="font-display text-4xl font-bold text-navy-500 num-badge text-center tracking-widest mb-5">${scrambled}</p>

          <div class="bg-navy-50 rounded-2xl p-4 mb-4">
            <p class="text-[10px] tracking-wider uppercase font-semibold text-navy-500/55 mb-1">Definition (${w.pos})</p>
            <p class="text-sm text-navy-500 leading-snug">${escapeHtml(w.def)}</p>
          </div>

          <input id="anagramInput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
                 placeholder="type the unscrambled word..."
                 class="spell-input w-full px-4 py-4 text-2xl font-bold text-center bg-cream rounded-xl border-2 border-navy-100 focus:border-navy-500 transition" />

          <button onclick="window.b4t.submitAnagram()" class="btn-primary w-full mt-3 py-4 rounded-xl font-bold tracking-wide">
            Check Answer
          </button>
        </div>
      </div>
    </div>
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
    <div class="animate-fade-in min-h-screen flex flex-col px-5 pt-8 pb-6">
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
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      ${s.onComplete
        ? `<button onclick="window.b4t.continueSession(${s.correct}, ${s.words.length})" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Next Task →</button>`
        : `<button onclick="showScreen('home')" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Return Home</button>`
      }
    </div>
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
    <div class="animate-fade-in min-h-screen flex flex-col">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.exitSession()" class="text-navy-500/60 hover:text-navy-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
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
    </div>
  `;

  document.querySelectorAll('[data-gap]').forEach(input => {
    input.addEventListener('input', e => {
      s.answers[e.target.dataset.gap] = e.target.value.trim();
    });
  });
}

async function playListening() {
  const s = state.session;
  if (s.playing) return;
  s.playing = true;
  $('#playStatus').textContent = 'Playing... (1 of 2)';
  $('#playIcon').innerHTML = '<rect x="6" y="5" width="4" height="14" fill="white"/><rect x="14" y="5" width="4" height="14" fill="white"/>';

  await speak(s.script.fullText, { rate: 0.85 });
  await new Promise(r => setTimeout(r, 1500));

  $('#playStatus').textContent = 'Playing... (2 of 2)';
  await speak(s.script.fullText, { rate: 0.85 });

  $('#playStatus').textContent = 'Audio complete';
  $('#playIcon').innerHTML = '<path d="M8 5v14l11-7z"/>';
  s.playing = false;
}

function submitListening() {
  const s = state.session;
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
    <div class="animate-fade-in min-h-screen flex flex-col px-5 pt-8 pb-6">
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
            </div>
          `).join('')}
        </div>
      </div>

      ${s.onComplete
        ? `<button onclick="window.b4t.continueSession(${correct}, ${s.script.segments.length})" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Next Task →</button>`
        : `<button onclick="showScreen('home')" class="btn-primary w-full py-4 rounded-xl font-bold tracking-wide mt-auto">Return Home</button>`
      }
    </div>
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
    <div class="animate-fade-in min-h-screen flex flex-col">
      <div class="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onclick="window.b4t.exitSession()" class="text-navy-500/60 hover:text-navy-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
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
    </div>
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
    <div class="animate-fade-in min-h-screen flex flex-col px-5 pt-8 pb-6">
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
    </div>
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
    <div class="animate-fade-in min-h-screen flex flex-col px-5 pt-6 pb-6">
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
    </div>
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
    <div class="min-h-screen flex flex-col items-center justify-center px-6 py-8 animate-fade-in ${correct ? 'bg-emerald-50' : 'bg-red-50'}">
      <div class="animate-pop">
        <div class="w-24 h-24 rounded-full ${correct ? 'bg-emerald-500' : 'bg-red-500'} flex items-center justify-center mb-6 mx-auto">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            ${correct
              ? '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>'
              : '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>'}
          </svg>
        </div>
      </div>
      <p class="font-display text-3xl font-bold ${correct ? 'text-emerald-700' : 'text-red-700'} mb-2 text-center">
        ${correct ? 'Correct!' : 'Not quite.'}
      </p>
      ${!correct ? `
        <p class="text-xs text-red-600/70 tracking-wider uppercase font-semibold">You typed</p>
        <p class="font-mono text-xl text-red-600 mb-4 line-through">${escapeHtml(userGuess)}</p>
      ` : ''}
      <p class="text-xs text-navy-500/60 tracking-wider uppercase font-semibold mt-2">${correct ? 'Spelled correctly' : 'The correct answer'}</p>
      <p class="font-display text-5xl font-bold text-navy-500 mb-3 text-center break-all">${correctWord}</p>
      <div class="gold-line w-24 my-4"></div>
      <p class="text-sm text-navy-500/70 italic text-center max-w-xs leading-snug">${escapeHtml(def)}</p>
      <button id="continueBtn" class="btn-primary mt-10 px-12 py-4 rounded-2xl font-bold tracking-wide">
        Continue →
      </button>
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
// PUBLIC API
// ============================================================
Object.assign(window.b4t, {
  startTask: (taskId) => {
    if (taskId === 'spot')       startSpotTheError();
    else if (taskId === 'anagram')    startAnagram({ count: 5 });
    else if (taskId === 'listening')  startListening();
    else if (taskId === 'brainstorm') startBrainstorm();
  },
  startMock,
  exitSession: () => {
    if (confirm('Exit this session? Progress will not be saved.')) {
      state.session = null;
      state.mock = null;
      showScreen('home');
    }
  },
  logout: async () => {
    if (!confirm('Log out?')) return;
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
