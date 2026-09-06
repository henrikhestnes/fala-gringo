// Persistent state: per-card mastery, mode preferences, daily results.
// One localStorage key, wrapped in try/catch so private browsing degrades to
// an in-memory session instead of throwing. A page sharing this engine sets
// window.APP_STORE_KEY before loading this file to keep its own progress blob
// (the /ingles/ subpage does) — the two apps must never mix mastery data.

const STORE_KEY = window.APP_STORE_KEY || 'pvs:v1';

/* Correct answers in a row (since the last miss) before a card stops counting
   as shaky and drops out of the Foco deck. */
const FOCUS_STREAK = 3;

/* Days a mastered card stays out of the Foco deck before it comes back for
   review; one correct answer resets the clock, a miss makes it shaky again. */
const REVIEW_DAYS = 7;

const Store = (function () {
  const empty = { mastered: {}, daily: {}, prefs: {}, strength: {} };
  let state;

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== 'object') return JSON.parse(JSON.stringify(empty));
      return {
        mastered: parsed.mastered && typeof parsed.mastered === 'object' ? parsed.mastered : {},
        daily: parsed.daily && typeof parsed.daily === 'object' ? parsed.daily : {},
        prefs: parsed.prefs && typeof parsed.prefs === 'object' ? parsed.prefs : {},
        strength: parsed.strength && typeof parsed.strength === 'object' ? parsed.strength : {}
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(empty));
    }
  }

  /* js/lib/sync.js registers itself here (Store.onChange) once it has finished
     initialising. Deliberately NOT `typeof Sync`: that is a top-level const, and
     a save() fired while sync.js is still running its initialiser (it stores the
     nudge counter) would hit the temporal dead zone and throw — which once left
     Sync uninitialised and every later save() throwing, so a miss showed no answer. */
  let listener = null;

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    if (listener) listener();
  }

  state = load();

  return {
    /* --- mastery: a card counts as mastered once answered correctly --- */
    isMastered(topicId, cardId) {
      const t = state.mastered[topicId];
      return !!(t && t[cardId]);
    },
    markMastered(topicId, cardId) {
      if (!state.mastered[topicId]) state.mastered[topicId] = {};
      if (state.mastered[topicId][cardId]) return false;
      state.mastered[topicId][cardId] = 1;
      save();
      return true;
    },
    masteredCount(topicId) {
      const t = state.mastered[topicId];
      return t ? Object.keys(t).length : 0;
    },
    resetTopic(topicId) {
      delete state.mastered[topicId];
      delete state.strength[topicId];
      save();
    },
    resetAll() {
      state.mastered = {};
      state.daily = {};
      state.strength = {};
      save();
    },

    /* --- per-card strength: consecutive-correct streak, lifetime misses, and
       the day (epoch days) of the last correct answer. A single correct answer
       proves little, so a card stays "shaky" from its first miss until it has
       been answered correctly FOCUS_STREAK times in a row. Feeds the Foco deck
       filter in quiz.js. --- */
    recordAnswer(topicId, cardId, correct) {
      if (!state.strength[topicId]) state.strength[topicId] = {};
      const s = state.strength[topicId][cardId] || { s: 0, m: 0 };
      if (correct) { s.s += 1; s.t = Math.floor(Date.now() / 86400000); }
      else { s.s = 0; s.m += 1; }
      state.strength[topicId][cardId] = s;
      save();
    },
    isShaky(topicId, cardId) {
      const t = state.strength[topicId];
      const s = t && t[cardId];
      return !!(s && s.m > 0 && s.s < FOCUS_STREAK);
    },
    /* Foco deck membership: never answered correctly, currently shaky, or
       mastered but not confirmed within the last REVIEW_DAYS. */
    needsWork(topicId, cardId) {
      const m = state.mastered[topicId];
      if (!(m && m[cardId])) return true;                     // never succeeded
      const e = state.strength[topicId] && state.strength[topicId][cardId];
      if (e && e.m > 0 && e.s < FOCUS_STREAK) return true;    // shaky
      return !(e && e.t) ||                                   // review due
             Math.floor(Date.now() / 86400000) - e.t >= REVIEW_DAYS;
    },

    /* --- sync (js/lib/sync.js): the synced sections out as a deep copy, and
       the merged result back in. Prefs are deliberately per-device. --- */
    snapshot() {
      return JSON.parse(JSON.stringify({
        mastered: state.mastered, strength: state.strength, daily: state.daily
      }));
    },
    applySynced(data) {
      state.mastered = data.mastered && typeof data.mastered === 'object' ? data.mastered : {};
      state.strength = data.strength && typeof data.strength === 'object' ? data.strength : {};
      state.daily = data.daily && typeof data.daily === 'object' ? data.daily : {};
      save();
    },

    /* --- change notification: one subscriber (the sync module), called after
       every save(); a later call replaces the earlier one --- */
    onChange(fn) { listener = typeof fn === 'function' ? fn : null; },

    /* --- preferences --- */
    getPref(key, fallback) {
      return Object.prototype.hasOwnProperty.call(state.prefs, key) ? state.prefs[key] : fallback;
    },
    setPref(key, value) {
      state.prefs[key] = value;
      save();
    },

    /* --- daily challenge, keyed by YYYYMMDD --- */
    getDaily(key) {
      return state.daily[key] || null;
    },
    setDaily(key, value) {
      state.daily[key] = value;
      // keep only the 30 most recent days
      const keys = Object.keys(state.daily).sort();
      while (keys.length > 30) delete state.daily[keys.shift()];
      save();
    }
  };
})();

/* Difficulty. Hard Mode is the DEFAULT: the Portuguese infinitive (or other
   answer-revealing hint) is withheld, so the English prompt alone must identify
   the answer. Easy Mode shows the hint. */
const Mode = {
  get hard() { return Store.getPref('hardMode', true) !== false; },
  set hard(v) { Store.setPref('hardMode', !!v); },
  toggle() { this.hard = !this.hard; return this.hard; }
};
