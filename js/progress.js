// Persistent state: per-card mastery, mode preferences, daily results.
// One localStorage key, wrapped in try/catch so private browsing degrades to
// an in-memory session instead of throwing.

const STORE_KEY = 'pvs:v1';

const Store = (function () {
  const empty = { mastered: {}, daily: {}, prefs: {} };
  let state;

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== 'object') return JSON.parse(JSON.stringify(empty));
      return {
        mastered: parsed.mastered && typeof parsed.mastered === 'object' ? parsed.mastered : {},
        daily: parsed.daily && typeof parsed.daily === 'object' ? parsed.daily : {},
        prefs: parsed.prefs && typeof parsed.prefs === 'object' ? parsed.prefs : {}
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(empty));
    }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
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
      save();
    },
    resetAll() {
      state.mastered = {};
      state.daily = {};
      save();
    },

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
