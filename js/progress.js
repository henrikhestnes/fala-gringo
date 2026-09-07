// Persistent state: per-card mastery, mode preferences, daily results.
// One localStorage key, wrapped in try/catch so private browsing degrades to
// an in-memory session instead of throwing. A page sharing this engine sets
// window.APP_STORE_KEY before loading this file to keep its own progress blob
// (the /ingles/ subpage does) — the two apps must never mix mastery data.

const STORE_KEY = window.APP_STORE_KEY || 'pvs:v1';

/* Correct answers in a row (since the last miss) before a card stops counting
   as shaky. One: a missed card is shaky only until it is answered right again —
   that answer puts it on the first rung of the review ladder (due in 7 days),
   and a second miss resets it, so a lucky hit is caught a week later anyway.
   (Pre-1.14 this was 3, a guard from the flat-schedule era that kept cards
   "shaky" for weeks once reviews were a week or more apart.) */
const FOCUS_STREAK = 1;

/* Review schedule: days a mastered card stays out of the Foco deck, indexed by
   its review level — how many times it has been confirmed on DISTINCT days since
   its last miss (same-day repeats prove nothing extra). 7, 14, 30, 60, then 120
   for good; a miss makes it shaky again and restarts the ladder. */
const REVIEW_INTERVALS = [7, 14, 30, 60, 120];

/* Unseen cards Foco introduces per topic per day — the deck would otherwise be
   the whole topic (a tense tab is ~500 forms) and the first pass would never
   end. Verb topics round up to whole conjugations. The `newPerDay` pref
   overrides it on a device. */
const NEW_PER_DAY = 20;

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

  function today() { return Math.floor(Date.now() / 86400000); }
  /* Review level of a strength record; pre-1.12 records carry no `l`. */
  function levelOf(e) { return e.l != null ? e.l : (e.t ? 1 : 0); }
  /* Days until review at a level: level 0 or 1 -> first rung, then up the ladder. */
  function intervalFor(level) {
    const i = Math.min(Math.max(level, 1), REVIEW_INTERVALS.length) - 1;
    return REVIEW_INTERVALS[i];
  }

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

    /* --- per-card strength record { s, m, t, l, i }: consecutive-correct
       streak, lifetime misses, the day (epoch days) of the last correct answer,
       the review level (distinct-day confirmations since the last miss — drives
       the REVIEW_INTERVALS ladder) and the day the card was first introduced by
       Foco. A single correct answer proves little, so a card stays "shaky" from
       its first miss until it has been answered correctly FOCUS_STREAK times in
       a row. Records written before 1.12 have no `l`: a card with a last-correct
       day counts as level 1, i.e. exactly the old fixed 7-day review. --- */
    recordAnswer(topicId, cardId, correct, minLevel, near) {
      if (!state.strength[topicId]) state.strength[topicId] = {};
      const s = state.strength[topicId][cardId] || { s: 0, m: 0 };
      if (correct) {
        const day = today();
        let l = levelOf(s);
        if (day > (s.t || 0) && !near) l += 1;     // a new day confirms; a same-day repeat or a near-miss does not
        if (l < 1) l = 1;                          // …but a hit after a miss is always back on rung one
        if (minLevel && l < minLevel) l = minLevel;  // inferred-known cards start higher (js/infer.js)
        s.s += 1; s.t = day; s.l = l;
      } else {
        s.s = 0; s.m += 1; s.l = 0;
      }
      state.strength[topicId][cardId] = s;
      save();
    },
    isShaky(topicId, cardId) {
      const t = state.strength[topicId];
      const s = t && t[cardId];
      return !!(s && s.m > 0 && s.s < FOCUS_STREAK);
    },
    /* Where a card stands for the Foco deck:
         new   — never answered correctly and never missed
         shaky — missed, and not yet FOCUS_STREAK right in a row since
         due   — mastered, and its review interval has run out
         ok    — mastered and fresh */
    cardState(topicId, cardId) {
      const e = state.strength[topicId] && state.strength[topicId][cardId];
      const m = state.mastered[topicId];
      if (!(m && m[cardId])) return (e && e.m > 0) ? 'shaky' : 'new';
      if (e && e.m > 0 && e.s < FOCUS_STREAK) return 'shaky';
      if (!e || !e.t) return 'due';                           // mastered pre-1.1, no record
      return today() - e.t >= intervalFor(levelOf(e)) ? 'due' : 'ok';
    },
    needsWork(topicId, cardId) {
      return this.cardState(topicId, cardId) !== 'ok';
    },
    /* Days past its review date (0 when not due) — orders the review tier. */
    overdue(topicId, cardId) {
      const e = state.strength[topicId] && state.strength[topicId][cardId];
      if (!e || !e.t) return 0;
      return Math.max(0, today() - e.t - intervalFor(levelOf(e)));
    },
    reviewLevel(topicId, cardId) {
      const e = state.strength[topicId] && state.strength[topicId][cardId];
      return e ? levelOf(e) : 0;
    },
    misses(topicId, cardId) {
      const e = state.strength[topicId] && state.strength[topicId][cardId];
      return (e && e.m) || 0;
    },
    /* Lexemes (the part of a card id before "|") with at least one mastered,
       non-shaky form in ANY topic — "the learner knows this word" (js/infer.js). */
    knownLexemes() {
      const out = new Set();
      Object.keys(state.mastered).forEach(topicId => {
        Object.keys(state.mastered[topicId]).forEach(id => {
          const bar = id.indexOf('|');
          if (bar < 0) return;
          const lex = id.slice(0, bar);
          if (!out.has(lex) && this.cardState(topicId, id) !== 'shaky') out.add(lex);
        });
      });
      return out;
    },

    /* --- daily intake of unseen cards (the Foco cap) --- */
    newPerDay() {
      const n = parseInt(this.getPref('newPerDay', NEW_PER_DAY), 10);
      return n > 0 ? n : NEW_PER_DAY;
    },
    introducedOn(topicId, cardId) {
      const e = state.strength[topicId] && state.strength[topicId][cardId];
      return (e && e.i) || 0;
    },
    introducedToday(topicId) {
      const t = state.strength[topicId] || {};
      const day = today();
      return Object.keys(t).filter(id => t[id].i === day).length;
    },
    /* Stamp the cards Foco shows for the first time today; one save for the lot. */
    markIntroduced(topicId, cardIds) {
      let changed = false;
      cardIds.forEach(id => {
        if (!state.strength[topicId]) state.strength[topicId] = {};
        const e = state.strength[topicId][id] || (state.strength[topicId][id] = { s: 0, m: 0 });
        if (!e.i) { e.i = today(); changed = true; }
      });
      if (changed) save();
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
