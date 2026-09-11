// Persistent state: per-card mastery, mode preferences, daily results, the
// day log (answers per day, for the streak) and the tabs the learner drills.
// ONE localStorage key, wrapped in try/catch so unavailable storage degrades to
// an in-memory session instead of throwing. A page sharing this engine sets
// window.APP_STORE_KEY before loading this file to keep its own progress blob
// (the /ingles/ subpage does) — the two apps must never mix mastery data.
//
// Two rules keep the blob safe (1.24):
//  * read-before-mutate — every mutation first folds in whatever another tab
//    of the same app wrote since (the `storage` event covers the idle case), so
//    a stale in-memory copy can never overwrite a newer miss or a reset;
//  * never write over what could not be read — a blob that fails to parse is
//    moved aside under `<key>:bad:<time>` and the app starts fresh; if storage
//    itself is unreadable, saves are refused and the shell shows the warning.
//  Shapes are coerced, not rejected (ProgressState.clean): an unknown field
//  from a newer release is dropped, never a reason to lose the learner's work.

const STORE_KEY = window.APP_STORE_KEY || 'pvs:v1';

/* Correct answers in a row (since the last miss) before a card stops counting
   as shaky. One: a missed card is shaky only until it is answered right again —
   that answer puts it on the first rung of the review ladder (due in 7 days),
   and a second miss resets it, so a lucky hit is caught a week later anyway.
   (Pre-1.14 this was 3, a guard from the flat-schedule era that kept cards
   "shaky" for weeks once reviews were a week or more apart.) */
const FOCUS_STREAK = 1;

/* Review schedule: days a mastered card stays out of the Foco deck, indexed by
   its review level — how many due reviews have been confirmed since
   its last miss (early and same-day practice do not raise it). 7, 14, 30, 60, then 120
   for good; a miss makes it shaky again and restarts the ladder. */
const REVIEW_INTERVALS = [7, 14, 30, 60, 120];

/* Unseen cards Foco introduces per topic per day — the deck would otherwise be
   the whole topic (a tense tab is ~500 forms) and the first pass would never
   end. Verb topics round up to whole conjugations. The `newPerDay` pref
   overrides it on a device. */
const NEW_PER_DAY = 20;

/* New cards in TODAY'S GOAL (the ring in the top bar), across all of the
   learner's tabs together. The per-tab intake (NEW_PER_DAY) is how much Foco
   will SHOW when a tab is opened; the goal must not sum that over every tab —
   twelve drilled tabs made a 290-card "day". The goal is the reviews owed plus
   this many new cards, wherever they come from; the rest is appetite. The
   `goalNew` pref overrides it on a device. */
const GOAL_NEW = 10;

/* The most cards TODAY'S GOAL asks for in total. Reviews owed come first (a
   backlog of 200 missed forms is weeks of lapses — a daily goal that only
   closes when the whole debt is paid is the opposite of a habit), then the new
   cards up to GOAL_NEW if there is room. Once this many are right today the
   ring closes; whatever still waits is shown, not owed. Foco itself keeps
   offering everything. The `goalMax` pref overrides it on a device. */
const GOAL_MAX = 30;

/* A tab counts as one of the learner's own — part of today's goal in the top
   bar — for this many days after it was last drilled. The tabs encode a level
   (a beginner lives on Presente, an advanced learner on Subjuntivo and
   Sentences), so the goal must never demand the tabs a learner has not chosen,
   and a tab that graduates (nothing due for a month) quietly leaves it. */
const ACTIVE_DAYS = 30;

/* A tab graduates when this share of its cards sit at review level
   GRADUATE_LEVEL or higher (confirmed on three distinct days: mastered, +7,
   +14 — about three weeks of showing up) and none of them is shaky. The 🎓 on
   the tab follows the live condition; the stamp in the store only makes sure
   the celebration happens once. */
const GRADUATE_LEVEL = 3;
const GRADUATE_SHARE = 0.8;

const Store = (function () {
  let state;
  let listener = null;
  let storageError = false;   // the last read or write of localStorage failed
  let readFailed = false;     // storage itself could not be read: never write over it
  let lastRaw = null;         // the canonical blob as last read/written (skips re-parsing)
  let clock = 0;

  /* Event stamps (ms, monotonic within a session): on answer records (`u`),
     resets and preference changes. A reset is a generation; the merge keeps a
     record only if it postdates the reset it is compared against. */
  function stamp() {
    // Observe merged clocks before the next local event (including clock rollback).
    clock = Math.max(clock + 1, Date.now());
    Object.values(state.resets).concat(Object.values(state.prefTimes)).forEach(value => { clock = Math.max(clock, value + 1); });
    Object.values(state.daily).forEach(value => { clock = Math.max(clock, (value.u || 0) + 1); });
    Object.values(state.strength).forEach(t => Object.values(t).forEach(e => { clock = Math.max(clock, (e.u || 0) + 1); }));
    return clock;
  }
  function notifyStorage() {
    const el = typeof document !== 'undefined' && document.getElementById('storageWarning');
    if (el) el.hidden = !storageError;
  }
  /* Read the canonical blob; null when unchanged since the last read/write.
     An unparseable blob is quarantined, never overwritten. Leftover per-tab
     journals from the unreleased 1.24 previews are folded in and removed. */
  function readDisk() {
    let raw = localStorage.getItem(STORE_KEY);
    let disk = null;
    if (raw !== lastRaw) {
      let parsed = null;
      if (raw) {
        try { parsed = JSON.parse(raw); }
        catch (e) {
          try { localStorage.setItem(STORE_KEY + ':bad:' + Date.now(), raw); localStorage.removeItem(STORE_KEY); } catch (_) { /* keep going */ }
          raw = null;
        }
      }
      disk = ProgressState.clean(parsed);
      lastRaw = raw;
    }
    if (typeof localStorage.key === 'function') {
      const stale = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORE_KEY + ':tab:')) stale.push(key);
      }
      stale.forEach(key => {
        try { disk = ProgressState.merge(disk || state, ProgressState.clean(JSON.parse(localStorage.getItem(key) || '{}'))); } catch (e) { /* drop it */ }
        localStorage.removeItem(key);
      });
    }
    return disk;
  }
  function reconcile() {
    try {
      const disk = readDisk();
      if (disk) state = ProgressState.merge(state, disk);
      readFailed = false;
    } catch (e) { readFailed = true; storageError = true; notifyStorage(); }
  }
  function save() {
    reconcile();
    if (readFailed) { notifyStorage(); if (listener) listener(); return; }   // never overwrite what could not be read
    try {
      const raw = JSON.stringify(state);
      localStorage.setItem(STORE_KEY, raw);
      lastRaw = raw;
      storageError = false;
    } catch (e) { storageError = true; }
    notifyStorage();
    if (listener) listener();
  }
  state = ProgressState.clean({});
  reconcile();
  window.addEventListener('storage', e => {
    if (e.key === STORE_KEY) {
      reconcile();
      if (window.App && App.refreshProgress) App.refreshProgress();
    }
  });

  /* The calendar day as a number: LOCAL days since the epoch, so a streak, a
     review clock and "today's new cards" all turn over at the learner's own
     midnight — a Rio learner drilling at 22:00 is still on today, not on
     tomorrow's UTC day. (Pre-1.18 records counted UTC days; for a given record
     the two differ by at most one, which only nudges a review by a day.) */
  function today() {
    const now = Date.now();
    return Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / 86400000);
  }
  /* Answers per day, the base of the streak and of "done today". Only the
     newest DAYS_KEPT days are kept: the streak never needs more. */
  const DAYS_KEPT = 730;
  function logDay() {
    const d = today();
    state.days[d] = (state.days[d] || 0) + 1;
    const keys = Object.keys(state.days);
    if (keys.length > DAYS_KEPT) {
      keys.map(Number).sort((a, b) => a - b).slice(0, keys.length - DAYS_KEPT)
        .forEach(k => { delete state.days[k]; });
    }
  }
  /* Review level of a strength record; pre-1.12 records carry no `l`. */
  function levelOf(e) { return e.l != null ? e.l : (e.t ? 1 : 0); }
  /* Days until review at a level: level 0 or 1 -> first rung, then up the ladder. */
  function intervalFor(level) {
    const i = Math.min(Math.max(level, 1), REVIEW_INTERVALS.length) - 1;
    return REVIEW_INTERVALS[i];
  }

  const api = {
    today: today,
    storageFailed: () => storageError,
    refreshStorage: reconcile,

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
      state.resets[topicId] = stamp();
      delete state.drilled[topicId];
      delete state.mastered[topicId];
      delete state.strength[topicId];
      delete state.graduated[topicId];   // earned again with the progress
      save();
    },
    resetAll() {
      state.resets = { all: stamp() };
      state.mastered = {};
      state.daily = {};
      state.dailyDone = {};
      state.strength = {};
      state.days = {};
      state.drilled = {};
      state.graduated = {};
      state.milestones = {};
      save();
    },

    /* --- per-card strength record { s, m, t, l, i, a, f, u, v }:
         s  consecutive-correct streak          m  lifetime misses
         t  the review clock — the day (epoch days) of the last DUE confirmation
            (or implied one); the next review is due intervalFor(l) days later
         l  the review level: due confirmations since the last miss (the
            REVIEW_INTERVALS ladder); early or same-day practice does not raise it
            and does not move `t` — a miss resets it to 0
         i  the day Foco first introduced the card     a  the day of the last
            direct correct answer (today's goal)        f  the day of the FIRST
            direct correct answer (the new-card allowance — a verify card is
            never "introduced", so `i` alone would let it slip past the cap)
         u  event stamp (for the reset generations in the merge)
       A single correct answer proves little, so a card stays "shaky" from its
       first miss until it has been answered correctly FOCUS_STREAK times in a
       row. Records written before 1.12 have no `l`: a card with a last-correct
       day counts as level 1, i.e. exactly the old fixed 7-day review. --- */
    recordAnswer(topicId, cardId, correct, minLevel, near, implied) {
      if (!state.strength[topicId]) state.strength[topicId] = {};
      const s = state.strength[topicId][cardId] || { s: 0, m: 0 };
      if (correct) {
        const day = today();
        let l = levelOf(s);
        const wasDue = !s.t || l === 0 || day - s.t >= intervalFor(l);
        if (wasDue && !near) l = Math.min(l + 1, REVIEW_INTERVALS.length);     // only a due confirmation advances the ladder
        if (l < 1) l = 1;                          // …but a hit after a miss is always back on rung one
        if (minLevel && l < minLevel) l = minLevel;  // inferred-known cards start higher (js/infer.js)
        s.s += 1; s.l = l;
        // Extra practice does not postpone the next scheduled review.
        if (wasDue || implied) s.t = day;
        if (!implied) { s.a = day; if (!s.f) s.f = day; }
        else s.a = s.a || 0;
      } else {
        s.s = 0; s.m += 1; s.l = 0;
      }
      state.strength[topicId][cardId] = s;
      s.u = stamp();
      if (!implied) logDay();   // inferred siblings are scheduling, not learner activity
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

    /* --- the day log: the streak and today's goal (js/app.js renders both) --- */
    answeredOn(day) {
      return state.days[day] || 0;
    },
    /* Consecutive days practised, counted back from today — or from yesterday
       when today is not yet done, so the flame does not go out at midnight.
       One missed day is forgiven (a rest day is not a relapse); two in a row
       end the run. `atRisk`: the grace day is spent, only today can save it. */
    streak() {
      const d = today();
      const has = k => !!state.days[k];
      const doneToday = has(d);
      let n = 0;
      let grace = false;   // ONE gap per run — practising every other day is not a streak
      let cur = doneToday ? d : d - 1;
      for (;;) {
        if (has(cur)) { n++; cur--; }
        else if (!grace && has(cur - 1)) { grace = true; cur--; }   // skip the gap day; the day before it counts next
        else break;
      }
      return { n: n, today: doneToday, atRisk: n > 0 && !doneToday && !has(d - 1) };
    },
    /* Tabs the learner drills: stamped on every drill answer (the Daily does
       NOT stamp — a beginner meeting one subjunctive card there has not taken
       up the tab). Active = drilled within ACTIVE_DAYS. */
    markDrilled(topicId) {
      const d = today();
      if (state.drilled[topicId] === d) return;
      state.drilled[topicId] = d;
      save();
    },
    isActiveTopic(topicId) {
      const d = state.drilled[topicId];
      return !!d && today() - d <= ACTIVE_DAYS;
    },
    /* Graduation (see GRADUATE_LEVEL): the share of the given cards at the
       graduating level and not shaky, and whether that clears the bar. */
    graduation(topicId, cardIds) {
      let ok = 0;
      cardIds.forEach(id => {
        if (this.reviewLevel(topicId, id) >= GRADUATE_LEVEL && this.cardState(topicId, id) !== 'shaky') ok++;
      });
      const share = cardIds.length ? ok / cardIds.length : 0;
      return { share: share, qualifies: cardIds.length > 0 && share >= GRADUATE_SHARE };
    },
    graduatedOn(topicId) {
      return state.graduated[topicId] || 0;
    },
    /* Stamp the day a tab first graduated; true when this call did it. */
    markGraduated(topicId) {
      if (state.graduated[topicId]) return false;
      state.graduated[topicId] = today();
      save();
      return true;
    },
    /* Milestones (js/milestones.js): id -> the day it was earned. */
    milestoneOn(id) {
      return state.milestones[id] || 0;
    },
    markMilestone(id) {
      if (state.milestones[id]) return false;
      state.milestones[id] = today();
      save();
      return true;
    },
    /* Any card anywhere at this review level or higher (not shaky). */
    hasLevel(level) {
      return Object.keys(state.strength).some(topicId =>
        Object.keys(state.strength[topicId]).some(id =>
          levelOf(state.strength[topicId][id]) >= level && this.cardState(topicId, id) !== 'shaky'));
    },
    /* Cards answered correctly today in a topic (the done half of the goal ring). */
    doneToday(topicId) {
      const t = state.strength[topicId] || {};
      const day = today();
      return Object.keys(t).filter(id => (t[id].a !== undefined ? t[id].a : t[id].t) === day).length;
    },

    /* --- daily intake of unseen cards (the Foco cap) --- */
    newPerDay() {
      const n = parseInt(this.getPref('newPerDay', NEW_PER_DAY), 10);
      return n > 0 ? n : NEW_PER_DAY;
    },
    goalNew() {
      const n = parseInt(this.getPref('goalNew', GOAL_NEW), 10);
      return n >= 0 ? n : GOAL_NEW;
    },
    goalMax() {
      const n = parseInt(this.getPref('goalMax', GOAL_MAX), 10);
      return n > 0 ? n : GOAL_MAX;
    },
    /* Unseen cards met and got right today (Foco-introduced, or a verify card
       confirmed) — what has already been spent of the goal's new-card allowance.
       `f` is the first direct correct answer; a pre-1.24 record has none, so it
       falls back to "answered today and introduced today". */
    newDoneToday(topicId) {
      const t = state.strength[topicId] || {};
      const day = today();
      return Object.keys(t).filter(id => {
        const e = t[id];
        if (e.f !== undefined) return e.f === day;
        return (e.a !== undefined ? e.a : e.t) === day && e.i === day;
      }).length;
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
        mastered: state.mastered, strength: state.strength, daily: state.daily, dailyDone: state.dailyDone,
        days: state.days, drilled: state.drilled, graduated: state.graduated, milestones: state.milestones, resets: state.resets
      }));
    },
    applySynced(data) {
      const clean = ProgressState.clean(data);
      ProgressState.SECTIONS.forEach(k => {
        if (k === 'prefs' || k === 'prefTimes') return;          // per device, never synced
        if (k === 'resets' && !Object.keys(clean.resets).length) return;
        state[k] = clean[k];
      });
      save();
    },

    /* A backup file is the synced sections of this app only — never the sync
       code, never device preferences. Import MERGES by default (the same rules
       as sync, so an old file cannot undo newer work); `restore` is for the
       "I reset by accident" case: the backup's records are re-stamped as new
       events, so they survive the reset generation (conflicts with records
       this device still has are merged conservatively, as always). */
    exportBackup() {
      reconcile();
      return JSON.stringify({ format: 'fala-gringo-backup', version: 2, app: STORE_KEY, data: this.snapshot() }, null, 2);
    },
    importBackup(raw, mode) {
      const backup = JSON.parse(raw);
      if (!backup || backup.format !== 'fala-gringo-backup' || backup.version !== 2 || backup.app !== STORE_KEY || !ProgressState.validate(backup.data)) throw new Error('invalid backup');
      reconcile();
      const data = ProgressState.clean(backup.data);
      if (mode === 'restore') {
        Object.keys(data.strength).forEach(topic => Object.keys(data.strength[topic]).forEach(id => {
          data.strength[topic][id].u = stamp();
        }));
        data.resets = Object.assign({}, state.resets, data.resets);   // keep every generation, records outlive them
      }
      this.applySynced(ProgressState.merge(this.snapshot(), data));
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
      state.prefTimes[key] = stamp();
      save();
    },

    /* --- daily challenge, keyed by YYYYMMDD --- */
    getDaily(key) {
      return state.daily[key] || null;
    },
    setDaily(key, value) {
      const previous = state.daily[key];
      value = JSON.parse(JSON.stringify(value));
      if (value.cards) value.u = previous && JSON.stringify(previous.cards) === JSON.stringify(value.cards) ? (previous.u || 0) : stamp();
      state.daily[key] = value;
      // keep only the 30 most recent days
      const keys = Object.keys(state.daily).sort();
      while (keys.length > 30) delete state.daily[keys.shift()];
      save();
    },
    /* The permanent record of a finished Daily: YYYYMMDD -> cards solved on the
       first try. One small number a day, so it is never trimmed — the Daily
       streak and the first-try distribution (js/daily.js) read this. */
    setDailyDone(key, firstTry) {
      const prev = state.dailyDone[key];
      if (prev !== undefined && prev >= firstTry) return;   // a finished day's score only ever improves
      state.dailyDone[key] = firstTry;
      save();
    },
    /* The log plus any finished Daily still in the 30-day result window that
       predates the log (1.20) — so an existing learner's recent history counts. */
    dailyHistory() {
      const out = Object.assign({}, state.dailyDone);
      Object.keys(state.daily).forEach(key => {
        if (key in out) return;
        const r = state.daily[key];
        const n = r && Array.isArray(r.attempts) ? r.attempts.length : 0;
        if (!n) return;
        let complete = true, firstTry = 0;
        for (let i = 0; i < n; i++) {
          const solved = !!(r.solved || [])[i], failed = !!(r.failed || [])[i];
          if (!solved && !failed) { complete = false; break; }
          if (solved && r.attempts[i] === 1) firstTry++;
        }
        if (complete) out[key] = firstTry;
      });
      return out;
    }
  };
  // Refresh before mutations as well as before writes, so a tab's stale object
  // cannot hide a newer miss, reset or preference change.
  ['markMastered', 'resetTopic', 'resetAll', 'recordAnswer', 'markDrilled', 'markGraduated', 'markMilestone',
   'markIntroduced', 'setPref', 'setDaily', 'setDailyDone'].forEach(name => {
    const fn = api[name];
    api[name] = function () { reconcile(); return fn.apply(api, arguments); };
  });
  return api;
})();

/* Difficulty. Hard Mode is the DEFAULT: the Portuguese infinitive (or other
   answer-revealing hint) is withheld, so the English prompt alone must identify
   the answer. Easy Mode shows the hint. */
const Mode = {
  get hard() { return Store.getPref('hardMode', true) !== false; },
  set hard(v) { Store.setPref('hardMode', !!v); },
  toggle() { this.hard = !this.hard; return this.hard; }
};
