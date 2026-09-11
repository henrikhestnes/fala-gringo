// Pure progress-state helpers shared by the store (js/progress.js), the sync
// client (js/lib/sync.js) and the backup import:
//
//   clean(value)     — coerce anything into a well-formed state, STRIPPING what
//                      it does not understand (unknown fields, wrong types) and
//                      never rejecting: the local loader uses it, so a stray
//                      field from a newer release can never make a learner's
//                      progress unreadable.
//   validate(value)  — strict shape check for data that crosses a boundary
//                      (a remote blob, a backup file).
//   merge(a, b)      — the conservative two-way merge.
//   stable(value)    — JSON with sorted keys, so two states that mean the same
//                      thing compare equal whatever order their keys were built in.
//
// Classic script: sets a global, no exports (the app runs from file://).
(typeof window !== 'undefined' ? window : globalThis).ProgressState = (function () {
  const SECTIONS = ['mastered', 'daily', 'dailyDone', 'prefs', 'prefTimes', 'strength', 'days', 'drilled', 'graduated', 'milestones', 'resets'];
  const RECORD_KEYS = ['s', 'm', 't', 'l', 'i', 'u', 'a', 'f'];   // see js/progress.js recordAnswer
  const BAD_KEYS = ['__proto__', 'constructor', 'prototype'];

  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const num = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER;
  const safeKey = k => !BAD_KEYS.includes(k);
  const keysOf = o => Object.keys(o || {}).filter(safeKey);

  /* ---------------------------------------------------------------- clean */

  function cleanRecord(e) {
    if (!isObj(e)) return null;
    const out = {};
    RECORD_KEYS.forEach(k => { if (num(e[k])) out[k] = e[k]; });
    if (out.s === undefined) out.s = 0;
    if (out.m === undefined) out.m = 0;
    return out;
  }
  function cleanDaily(d) {
    if (!isObj(d) || !Array.isArray(d.attempts) || d.attempts.length > 100) return null;
    const n = d.attempts.length;
    const out = { attempts: d.attempts.map(x => Number.isInteger(x) && x >= 0 ? Math.min(x, 5) : 0), failed: [], solved: [], typed: [] };
    for (let i = 0; i < n; i++) {
      out.failed[i] = !!(Array.isArray(d.failed) && d.failed[i]);
      out.solved[i] = !!(Array.isArray(d.solved) && d.solved[i]);
      const t = Array.isArray(d.typed) ? d.typed[i] : '';
      out.typed[i] = typeof t === 'string' ? t.slice(0, 10000) : '';
    }
    out.current = Number.isInteger(d.current) && d.current >= 0 && d.current < Math.max(1, n) ? d.current : 0;
    if (Array.isArray(d.cards) && d.cards.length === n &&
        d.cards.every(c => isObj(c) && typeof c.topic === 'string' && typeof c.id === 'string')) {
      out.cards = d.cards.map(c => ({ topic: c.topic, id: c.id }));
      out.version = 2;
      if (num(d.u)) out.u = d.u;
    }
    return out;
  }
  function cleanNumbers(o) {
    const out = {};
    keysOf(o).forEach(k => { if (num(o[k])) out[k] = o[k]; });
    return out;
  }
  function cleanState(value) {
    const src = isObj(value) ? value : {};
    const out = {};
    SECTIONS.forEach(k => { out[k] = {}; });
    keysOf(src.mastered).forEach(topic => {
      if (!isObj(src.mastered[topic])) return;
      const t = out.mastered[topic] = {};
      keysOf(src.mastered[topic]).forEach(id => { const v = src.mastered[topic][id]; if (v === 1 || v === true) t[id] = 1; });
    });
    keysOf(src.strength).forEach(topic => {
      if (!isObj(src.strength[topic])) return;
      const t = out.strength[topic] = {};
      keysOf(src.strength[topic]).forEach(id => { const r = cleanRecord(src.strength[topic][id]); if (r) t[id] = r; });
    });
    keysOf(src.daily).forEach(day => { const d = cleanDaily(src.daily[day]); if (d) out.daily[day] = d; });
    ['dailyDone', 'days', 'drilled', 'graduated', 'milestones', 'resets', 'prefTimes'].forEach(k => { out[k] = cleanNumbers(src[k]); });
    if (isObj(src.prefs)) {
      // preferences are free-form but must survive JSON; prototype keys are dropped
      keysOf(src.prefs).forEach(k => {
        const v = src.prefs[k];
        if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) out.prefs[k] = v;
      });
    }
    return out;
  }

  /* ------------------------------------------------------------- validate */

  /* Strict about TYPES and UNKNOWN FIELDS, tolerant of missing optional ones
     (a pre-1.23.4 Daily has no `typed`, a pre-1.12 record no `l`). A record
     field this build does not know means a newer client wrote the blob — the
     caller then refuses to merge-and-push, which would silently delete it. */
  function validate(value) {
    if (!isObj(value)) return false;
    const deepSafe = v => !isObj(v) || Object.keys(v).every(k => safeKey(k) && deepSafe(v[k]));
    if (!deepSafe(value)) return false;
    if (SECTIONS.some(k => value[k] !== undefined && !isObj(value[k]))) return false;
    const all = (o, fn) => Object.values(o || {}).every(fn);
    if (!all(value.mastered, t => isObj(t) && all(t, n => n === 1 || n === true))) return false;
    if (!all(value.strength, t => isObj(t) && all(t, e => isObj(e) && Object.keys(e).every(k => RECORD_KEYS.includes(k) && num(e[k]))))) return false;
    if (['days', 'drilled', 'graduated', 'milestones', 'dailyDone', 'resets', 'prefTimes'].some(k => !all(value[k], num))) return false;
    if (!all(value.prefs, v => v === null || ['string', 'number', 'boolean'].includes(typeof v))) return false;
    const bools = (d, k) => d[k] === undefined || (Array.isArray(d[k]) && d[k].length === d.attempts.length && d[k].every(v => typeof v === 'boolean'));
    if (!all(value.daily, d => isObj(d) && Array.isArray(d.attempts) && d.attempts.length <= 100 &&
      d.attempts.every(n => Number.isInteger(n) && n >= 0 && n <= 5) && bools(d, 'solved') && bools(d, 'failed') &&
      (d.typed === undefined || (Array.isArray(d.typed) && d.typed.every(t => typeof t === 'string' && t.length <= 10000))) &&
      (d.u === undefined || num(d.u)) && (d.version === undefined || d.version === 2) &&
      (d.current === undefined || (Number.isInteger(d.current) && d.current >= 0 && d.current < Math.max(1, d.attempts.length))) &&
      (d.cards === undefined || (Array.isArray(d.cards) && d.cards.length === d.attempts.length &&
        d.cards.every(c => isObj(c) && typeof c.topic === 'string' && typeof c.id === 'string'))))) return false;
    return true;
  }

  /* ---------------------------------------------------------------- stable */

  function stable(value) {
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    if (isObj(value)) {
      return '{' + Object.keys(value).sort().filter(k => value[k] !== undefined)
        .map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
    }
    return JSON.stringify(value === undefined ? null : value);
  }

  /* ----------------------------------------------------------------- merge */

  function eachKey(a, b, fn) {
    const seen = Object.create(null);
    [a, b].forEach(o => keysOf(o).forEach(k => {
      if (!seen[k]) { seen[k] = 1; fn(k, (a || {})[k], (b || {})[k]); }
    }));
  }
  const lvl = e => (e.l != null ? e.l : (e.t ? 1 : 0));   // pre-1.12 records carry no `l`

  /* A reset starts a new generation for a topic (or for everything). A side
     whose generation is OLDER than the merged one drops what it learned BEFORE
     the reset — records carry their event stamp `u`, so anything that device
     did after the reset (offline, say) is kept. Cards mastered without a
     surviving record (pre-1.1 data) go with the generation. */
  function applyResets(s, resets) {
    const all = resets.all || 0;
    const stampOf = topic => Math.max(resets[topic] || 0, all);
    const before = topic => Math.max(s.resets[topic] || 0, s.resets.all || 0) < stampOf(topic);
    const topics = new Set(keysOf(s.mastered).concat(keysOf(s.strength), keysOf(s.drilled), keysOf(s.graduated),
                                                      keysOf(resets).filter(k => k !== 'all')));
    topics.forEach(topic => {
      if (!before(topic)) return;
      const cut = stampOf(topic);
      const kept = {};
      keysOf(s.strength[topic]).forEach(id => { if ((s.strength[topic][id].u || 0) > cut) kept[id] = s.strength[topic][id]; });
      if (Object.keys(kept).length) s.strength[topic] = kept; else delete s.strength[topic];
      const m = {};
      keysOf(s.mastered[topic]).forEach(id => { if (kept[id]) m[id] = 1; });
      if (Object.keys(m).length) s.mastered[topic] = m; else delete s.mastered[topic];
      if (!Object.keys(kept).length) { delete s.drilled[topic]; delete s.graduated[topic]; }
    });
    if ((s.resets.all || 0) < all) {
      // a whole-profile reset: the day log, the Daily history and the markers
      // carry no event stamps, so they go with the old generation
      ['daily', 'dailyDone', 'days', 'milestones'].forEach(k => { s[k] = {}; });
    }
  }

  function mergeStates(x, y) {
    x = cleanState(x); y = cleanState(y);
    const resets = {};
    eachKey(x.resets, y.resets, (k, a, b) => { resets[k] = Math.max(a || 0, b || 0); });
    [x, y].forEach(s => applyResets(s, resets));
    const out = { mastered: {}, strength: {}, daily: {}, dailyDone: {}, days: {}, drilled: {}, graduated: {}, milestones: {}, resets: resets, prefs: {}, prefTimes: {} };

    eachKey(x.mastered, y.mastered, (topic, a, b) => {
      out.mastered[topic] = Object.assign({}, a || {}, b || {});
    });

    eachKey(x.strength, y.strength, (topic, a, b) => {
      const t = out.strength[topic] = {};
      eachKey(a || {}, b || {}, (card, sa, sb) => {
        // one-sided: take it verbatim; both: the pessimistic view — misses
        // never shrink, the streak and level are the lower ones (a card is
        // never pushed further out than either device believes), the review
        // clock the newer, "introduced" and "first correct" the earliest. A
        // shaky card can therefore never graduate out of Foco by syncing; the
        // price is that a miss seen on one device stays until it is answered
        // right again anywhere, which is the safe side to err on.
        if (!sa || !sb) { t[card] = sa || sb; return; }
        const merged = { s: Math.min(sa.s || 0, sb.s || 0), m: Math.max(sa.m || 0, sb.m || 0), l: Math.min(lvl(sa), lvl(sb)) };
        if (sa.t || sb.t) merged.t = Math.max(sa.t || 0, sb.t || 0);   // a card never confirmed has no clock
        if (sa.i || sb.i) merged.i = Math.min(sa.i || Infinity, sb.i || Infinity);
        if (sa.f || sb.f) merged.f = Math.min(sa.f || Infinity, sb.f || Infinity);
        ['u', 'a'].forEach(k => { if (sa[k] !== undefined || sb[k] !== undefined) merged[k] = Math.max(sa[k] || 0, sb[k] || 0); });
        t[card] = merged;
      });
    });

    eachKey(x.daily, y.daily, (day, a, b) => {
      if (!a || !b) { out.daily[day] = a || b; return; }
      // the newer manifest (by event stamp) decides which cards the day has;
      // results follow card identity, never position, across manifests
      const aid = JSON.stringify(a.cards || []), bid = JSON.stringify(b.cards || []);
      const base = (a.u || 0) !== (b.u || 0) ? ((a.u || 0) > (b.u || 0) ? a : b)
                 : a.cards && b.cards ? (aid <= bid ? a : b) : (a.cards ? a : b.cards ? b : a);
      const identities = base.cards;
      const n = identities ? identities.length : Math.max(a.attempts.length, b.attempts.length);
      const m = { attempts: [], failed: [], solved: [], typed: [], current: 0 };
      if (identities) { m.cards = identities; m.version = 2; m.u = base.u || 0; }
      const index = (r, i) => !identities ? i : !r.cards ? -1 : r.cards.findIndex(c =>
        c.topic === identities[i].topic && c.id === identities[i].id);
      for (let i = 0; i < n; i++) {
        const ai = index(a, i), bi = index(b, i);
        m.attempts[i] = Math.max(a.attempts[ai] || 0, b.attempts[bi] || 0);
        m.failed[i] = !!(a.failed[ai] || b.failed[bi]);
        m.solved[i] = !!(a.solved[ai] || b.solved[bi]);
        m.typed[i] = a.typed[ai] || b.typed[bi] || '';
      }
      const pending = m.attempts.findIndex((_, i) => !m.failed[i] && !m.solved[i]);
      m.current = pending < 0 ? Math.max(0, n - 1) : pending;
      out.daily[day] = m;
    });

    // the day log and the drilled-tab stamps: a day practised anywhere counts
    // (answers = the higher count), a tab drilled anywhere is active (newest day)
    eachKey(x.days, y.days, (day, a, b) => { out.days[day] = Math.max(a || 0, b || 0); });
    eachKey(x.drilled, y.drilled, (topic, a, b) => { out.drilled[topic] = Math.max(a || 0, b || 0); });
    // a finished Daily counts wherever it was finished; the better first-try count stands
    eachKey(x.dailyDone, y.dailyDone, (day, a, b) => { out.dailyDone[day] = Math.max(a || 0, b || 0); });
    // a graduation / milestone happened once: the earliest day either device saw it
    eachKey(x.graduated, y.graduated, (topic, a, b) => { out.graduated[topic] = Math.min(a || Infinity, b || Infinity); });
    eachKey(x.milestones, y.milestones, (id, a, b) => { out.milestones[id] = Math.min(a || Infinity, b || Infinity); });

    // preferences: the most recently set value wins (per key)
    eachKey(x.prefs, y.prefs, (k, a, b) => {
      const at = x.prefTimes[k] || 0, bt = y.prefTimes[k] || 0;
      out.prefs[k] = at >= bt ? (a === undefined ? b : a) : b;
      out.prefTimes[k] = Math.max(at, bt);
    });
    return out;
  }

  return { merge: mergeStates, clean: cleanState, validate: validate, stable: stable, SECTIONS: SECTIONS };
})();
