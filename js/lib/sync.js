// Optional cross-device sync — OFF by default.
//
// The app stays a static site; sync is a tiny Cloudflare Worker (sync-worker/)
// that stores the progress blob in KV under a long random secret code, which
// the learner pastes into each device (the ⇅ button in the top bar). While
// SYNC_URL below is empty the app makes zero network requests, exactly as before.
//
// The model is pull-merge-push, never overwrite: on load the remote state is
// fetched and MERGED into the local one (union of mastered; per-card strength
// keeps max misses + min streak, so a shaky card can never graduate out of Foco
// by syncing; the daily log merges element-wise; the day log and drilled-tab
// stamps take the higher value). Pushes send the whole state,
// throttled to one per minute (KV free tier allows 1,000 writes/day) with a
// final flush when the tab is hidden or closed. Because every sync merges, a
// push lost to a dead connection or a killed tab heals on the next load.
//
// The /ingles/ subpage shares this file. Its progress must never merge with the
// main app's, so it sets window.APP_SYNC_APP = 'ingles' before loading it and
// that prefix goes in front of the code on the wire (`/ingles<code>`): the same
// unchanged worker then stores its blob under a separate KV key. The code itself
// is ONE per device, not per app: it lives under a shared localStorage key
// (CODE_KEY, same origin), so switching sync on in either app switches it on in
// both — one "account", two separate blobs. The UI wording is overridable
// through window.APP_STRINGS, same contract as quiz.js/app.js.

const SYNC_URL = 'https://fala-gringo-sync.henrik-hestnes.workers.dev';   // scheme required: without it fetch() treats this as a relative path

const Sync = (function () {
  const STR = Object.assign({
    syncTitleOff: 'Sync is off — tap to link your devices',
    syncTitleError: 'Last sync failed — will retry',
    syncTitleBusy: 'Syncing…',
    syncTitleNow: 'Synced just now',
    syncTitleAgo: 'Synced {min} min ago',
    syncNoBackend: 'Sync needs a backend — see sync-worker/README.md',
    syncAsk: 'Sync across devices.\n\nPaste the sync code from your other device — ' +
             'or leave the box empty to create a new one.',
    syncBadCode: 'That code does not look right',
    syncShowNew: 'Sync is ON. This code is the key to your progress — copy it, keep it ' +
                 'private, and paste it on your other devices. It covers both Fala Gringo ' +
                 'and Fala Como Gringo:',
    syncShowOn: 'Sync is ON. Your code is below — copy it to link another device.\n\n' +
                'Type "off" instead to disconnect this device.',
    syncOffWord: 'off',
    syncOffToast: 'Sync off on this device',
    syncPulled: 'Progress synced ⇅',
    syncNudge: '⇅ can sync your progress between devices — tap it to set up'
  }, window.APP_STRINGS || {});
  // key prefix on the worker: '' for the main app, 'ingles' for the subpage —
  // it must satisfy the worker's [a-z0-9]{16,64} code regex together with the code
  const APP = String(window.APP_SYNC_APP || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // the code is shared with the other app, so it must fit behind the LONGEST prefix
  // either app uses ('ingles', 6 chars) — generated codes are 32 anyway
  const MAX_CODE = 64 - 6;

  const PUSH_INTERVAL = 60 * 1000;   // at most one KV write a minute while drilling
  let pushTimer = 0;
  let lastPushAt = 0;
  let lastPushed = '';   // last JSON known to be on the server; skips no-op pushes
  let status = 'ok';     // 'ok' | 'error' — meaningful only while sync is on
  let lastSyncAt = 0;

  const canFetch = typeof fetch === 'function';   // the smoke stub has one that never reaches a network

  /* The code is shared by both apps on this origin through one plain
     localStorage key (each app's Store blob is private to it, so a pref would
     not do). Pre-1.11 devices kept it in the per-app 'syncCode' pref: the first
     read adopts that into the shared key and clears the pref, so a later "off"
     cannot resurrect it. No storage (private mode): falls back to memory. */
  const CODE_KEY = 'fg:syncCode';
  let memCode = '';
  function readShared() {
    try { return localStorage.getItem(CODE_KEY) || ''; } catch (e) { return memCode; }
  }
  function setCode(c) {
    memCode = c || '';
    try { if (c) localStorage.setItem(CODE_KEY, c); else localStorage.removeItem(CODE_KEY); } catch (e) { /* memory only */ }
    if (Store.getPref('syncCode', '')) Store.setPref('syncCode', '');   // retire the legacy pref
  }
  function code() {
    const shared = readShared();
    if (shared) return shared;
    const legacy = Store.getPref('syncCode', '');
    if (legacy) setCode(legacy);
    return legacy;
  }
  function enabled() { return !!SYNC_URL && canFetch && !!code(); }
  function endpoint() {
    return SYNC_URL.replace(/\/+$/, '') + '/' + APP + code();
  }

  function toast(msg) { if (typeof showToast === 'function') showToast(msg); }

  /* Three button states: off = dimmed with an amber dot (attention, not alarm —
     off is a legitimate resting state), on-and-healthy = plain, on-but-failing
     = pulsing red dot. The dangerous state is the loud one. */
  function updateButton() {
    const btn = document.getElementById('syncBtn');
    if (!btn) return;
    const st = enabled() ? status : 'off';
    btn.className = 'icon-btn sync-' + st;
    let title;
    if (st === 'off') title = STR.syncTitleOff;
    else if (st === 'error') title = STR.syncTitleError;
    else if (!lastSyncAt) title = STR.syncTitleBusy;
    else {
      const min = Math.round((Date.now() - lastSyncAt) / 60000);
      title = min < 1 ? STR.syncTitleNow : STR.syncTitleAgo.replace('{min}', min);
    }
    btn.setAttribute('title', title);
  }

  function markOk() { status = 'ok'; lastSyncAt = Date.now(); updateButton(); }
  function markError() { status = 'error'; updateButton(); }

  function newCode() {
    let s = '';
    if (window.crypto && window.crypto.getRandomValues) {
      const a = new Uint32Array(6);
      window.crypto.getRandomValues(a);
      a.forEach(n => { s += n.toString(36).padStart(7, '0'); });
    } else {
      for (let i = 0; i < 6; i++) {
        s += Math.floor(Math.random() * Math.pow(36, 7)).toString(36).padStart(7, '0');
      }
    }
    return ('fg' + s).slice(0, 32);
  }

  /* ----------------------------------------------------------------- merge */

  function eachKey(a, b, fn) {
    const seen = {};
    [a, b].forEach(o => Object.keys(o || {}).forEach(k => {
      if (!seen[k]) { seen[k] = 1; fn(k, (a || {})[k], (b || {})[k]); }
    }));
  }

  function mergeStates(x, y) {
    const out = { mastered: {}, strength: {}, daily: {}, dailyDone: {}, days: {}, drilled: {}, graduated: {}, milestones: {} };

    eachKey(x.mastered, y.mastered, (topic, a, b) => {
      out.mastered[topic] = Object.assign({}, a || {}, b || {});
    });

    eachKey(x.strength, y.strength, (topic, a, b) => {
      const t = out.strength[topic] = {};
      eachKey(a || {}, b || {}, (card, sa, sb) => {
        // one-sided: take it verbatim; both: pessimistic view — misses never
        // shrink, a streak only counts if it postdates the miss everywhere,
        // the review clock runs from the newest correct answer anywhere, the
        // review level is the lower rung (a card is never pushed further out
        // than either device believes), and "introduced" is the earliest day
        if (!sa || !sb) { t[card] = sa || sb; return; }
        const lvl = e => (e.l != null ? e.l : (e.t ? 1 : 0));   // pre-1.12 records carry no `l`
        const merged = { s: Math.min(sa.s || 0, sb.s || 0), m: Math.max(sa.m || 0, sb.m || 0),
                         t: Math.max(sa.t || 0, sb.t || 0), l: Math.min(lvl(sa), lvl(sb)) };
        if (sa.i || sb.i) merged.i = Math.min(sa.i || Infinity, sb.i || Infinity);
        t[card] = merged;
      });
    });

    eachKey(x.daily, y.daily, (day, a, b) => {
      if (!a || !b) { out.daily[day] = a || b; return; }
      const n = Math.max((a.attempts || []).length, (b.attempts || []).length);
      const m = { attempts: [], failed: [], solved: [],
                  current: Math.max(a.current || 0, b.current || 0) };
      for (let i = 0; i < n; i++) {
        m.attempts[i] = Math.max((a.attempts || [])[i] || 0, (b.attempts || [])[i] || 0);
        m.failed[i] = !!((a.failed || [])[i] || (b.failed || [])[i]);
        m.solved[i] = !!((a.solved || [])[i] || (b.solved || [])[i]);
      }
      out.daily[day] = m;
    });

    // the day log and the drilled-tab stamps: a day practised anywhere counts
    // (answers = the higher count), a tab drilled anywhere is active (newest day)
    eachKey(x.days || {}, y.days || {}, (day, a, b) => { out.days[day] = Math.max(a || 0, b || 0); });
    eachKey(x.drilled || {}, y.drilled || {}, (topic, a, b) => { out.drilled[topic] = Math.max(a || 0, b || 0); });
    // a finished Daily counts wherever it was finished; the better first-try count stands
    eachKey(x.dailyDone || {}, y.dailyDone || {}, (day, a, b) => { out.dailyDone[day] = Math.max(a || 0, b || 0); });
    // a graduation happened once: the earliest day either device saw it
    eachKey(x.graduated || {}, y.graduated || {}, (topic, a, b) => { out.graduated[topic] = Math.min(a || Infinity, b || Infinity); });
    eachKey(x.milestones || {}, y.milestones || {}, (id, a, b) => { out.milestones[id] = Math.min(a || Infinity, b || Infinity); });

    return out;
  }

  /* ------------------------------------------------------------- transport */

  function pull() {
    if (!enabled()) return Promise.resolve();
    return fetch(endpoint(), { cache: 'no-store' })
      .then(res => {
        // an HTTP error is NOT an empty remote: merging with {} and pushing
        // could overwrite progress the server actually holds — bail instead
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      })
      .then(remote => {
        const local = Store.snapshot();
        const merged = mergeStates(local, remote || { mastered: {}, strength: {}, daily: {}, dailyDone: {}, days: {}, drilled: {}, graduated: {}, milestones: {} });
        const mergedJson = JSON.stringify(merged);
        markOk();
        if (mergedJson !== JSON.stringify(local)) {
          Store.applySynced(merged);          // save() schedules the push back up
          if (window.App) App.refresh();
          toast(STR.syncPulled);
        } else if (mergedJson !== JSON.stringify(remote)) {
          schedulePush();                     // remote is behind
        } else {
          lastPushed = mergedJson;
        }
      })
      .catch(() => { markError(); /* offline — the next load heals */ });
  }

  function push() {
    pushTimer = 0;
    if (!enabled()) return;
    const body = JSON.stringify(Store.snapshot());
    if (body === lastPushed) return;
    lastPushAt = Date.now();
    fetch(endpoint(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      cache: 'no-store',
      keepalive: true          // lets the flush-on-close request outlive the page
    }).then(res => {
      if (res.ok) { lastPushed = body; markOk(); } else { markError(); }
    }).catch(() => { markError(); /* offline — the next answer reschedules */ });
  }

  /* Throttle, don't debounce: the first change after a quiet spell pushes in
     2.5s; further changes ride along until PUSH_INTERVAL has passed. */
  function schedulePush() {
    if (!enabled() || pushTimer) return;
    const wait = Math.max(2500, lastPushAt + PUSH_INTERVAL - Date.now());
    pushTimer = setTimeout(push, wait);
  }

  /* The tab going away is the last chance to sync this session's answers. */
  function flushPush() {
    if (!pushTimer) return;    // nothing pending
    clearTimeout(pushTimer);
    push();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPush();
  });
  window.addEventListener('pagehide', flushPush);

  /* ------------------------------------------------------------------- ui */

  function manage() {
    if (!SYNC_URL || !canFetch) {
      toast(STR.syncNoBackend);
      return;
    }
    if (typeof window.prompt !== 'function') return;
    if (!code()) {
      const entered = window.prompt(STR.syncAsk, '');
      if (entered === null) return;
      const c = (entered.trim() || newCode()).toLowerCase();
      if (!/^[a-z0-9]{16,64}$/.test(c) || c.length > MAX_CODE) { toast(STR.syncBadCode); return; }
      setCode(c);
      lastPushed = '';
      lastSyncAt = 0;
      updateButton();
      pull().then(schedulePush);
      window.prompt(STR.syncShowNew, c);
    } else {
      const ans = window.prompt(STR.syncShowOn, code());
      // the English "off" always works too, whatever the localized word is
      const word = ans === null ? null : ans.trim().toLowerCase();
      if (word !== null && (word === 'off' || word === STR.syncOffWord.toLowerCase())) {
        setCode('');
        toast(STR.syncOffToast);
        updateButton();
      }
    }
  }

  const btn = document.getElementById('syncBtn');
  if (btn) btn.addEventListener('click', manage);
  updateButton();
  // keep the "Synced N min ago" tooltip honest (setInterval is absent in the smoke stub)
  if (typeof setInterval === 'function') setInterval(updateButton, 60000);

  // one-time discovery nudge: on the third visit with sync still off, say the
  // button exists — then never mention it again
  if (SYNC_URL && canFetch && !code()) {
    const visits = Store.getPref('syncNudge', 0) + 1;
    if (visits <= 3) Store.setPref('syncNudge', visits);
    if (visits === 3) {
      setTimeout(() => toast(STR.syncNudge), 1200);
    }
  }

  pull();   // merge in whatever the other devices did since last time

  return {
    onLocalChange: schedulePush,   // Store.save() calls this through Store.onChange (below)
    manage: manage,
    _merge: mergeStates,           // exposed for the checks
    _endpoint: endpoint,           // likewise — proves the /ingles/ key prefix
    _setCode: setCode              // likewise — drives the shared-code + migration checks
  };
})();

// Subscribe only now: the initialiser above already saves (the nudge counter), and
// Store.save() must not touch `Sync` while this const is still being initialised.
Store.onChange(Sync.onLocalChange);
