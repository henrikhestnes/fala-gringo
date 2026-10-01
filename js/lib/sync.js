// Optional cross-device sync — OFF until a learner links a secret code.
//
// The app stays a static site; sync is a tiny Cloudflare Worker (sync-worker/)
// that stores the progress blob in KV under a long random secret code, which
// the learner pastes into each device (the ⇅ button in the top bar). While
// SYNC_URL below is empty the app makes zero network requests.
//
// The model is pull → merge → push, never overwrite: on load (and on every
// push) the remote state is fetched and MERGED into the local one
// (ProgressState.merge: union of mastered, misses kept, streak and level the
// lower of the two, so a shaky card can never graduate out of Foco by syncing;
// reset generations so a reset on one device is not undone by another's stale
// snapshot). Pushes send the merged state.
//
// The request budget (1.31.1) is set by the worker's free tier, which meters
// every request and, on KV, allows only a thousand writes a day: a scheduled
// round (one GET, at most one PUT) runs at most once per PUSH_INTERVAL while
// the learner keeps answering; hiding the tab uploads at most once per
// WRITE_GAP; a returning tab re-pulls at most once per PULL_GAP; the PUT body
// goes as text/plain so the browser sends no CORS preflight (a second request
// per upload). A round only ever follows a LOCAL change: applying a pulled
// state saves too, but that save is the module's own and must not schedule
// another round — it did, and when the merge kept finding a difference the
// client polled the worker every 2.5 s, for ever. A typical session therefore
// costs a GET on load and one or two uploads. Two devices pushing within the same
// minute can still overwrite each other on the server — the loser's answers
// live on locally and heal on its next pull, because every sync merges. A
// failed GET never leads to a push (an HTTP error is not an empty remote).
//
// The three apps share one code (CODE_KEY, same origin); /ingles/ and
// /noruegues/ prefix it on the wire so the worker keeps three separate blobs.
// Preferences are per device and per app on purpose. UI wording is overridable
// through window.APP_STRINGS, same contract as quiz.js/app.js.

const SYNC_URL = 'https://fala-gringo-sync.henrik-hestnes.workers.dev';   // scheme required: without it fetch() treats this as a relative path

const Sync = (function () {
  const STR = Object.assign({
    syncTitleOff: 'Sync is off — tap to link your devices',
    syncTitleError: 'Last sync failed — will retry',
    syncTitleBusy: 'Syncing…',
    syncUpdateApp: 'Sync is paused — another device runs a newer version. Reload to update this one.',
    syncTitleNow: 'Synced just now',
    syncTitleAgo: 'Synced {min} min ago',
    syncNoBackend: 'Sync needs a backend — see sync-worker/README.md',
    syncAsk: 'Sync across devices.\n\nPaste the sync code from your other device — ' +
             'or leave the box empty to create a new one.',
    syncBadCode: 'That code does not look right',
    syncShowNew: 'Sync is ON. This code is the key to your progress — copy it, keep it ' +
                 'private, and paste it on your other devices. It covers all three language apps:',
    syncShowOn: 'Sync is ON. Your code is below — copy it to link another device.\n\n' +
                'Type "off" instead to disconnect this device.',
    syncOffWord: 'off',
    syncOffToast: 'Sync off on this device',
    syncPulled: 'Progress synced ⇅',
    syncNudge: '⇅ can sync your progress between devices — tap it to set up'
  }, window.APP_STRINGS || {});
  // key prefix on the worker: '' for the main app, 'ingles'/'noruegues' for the
  // subpages — it must satisfy the worker's [a-z0-9]{16,64} code regex together
  // with the code
  const APP = String(window.APP_SYNC_APP || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // the code is shared by the apps, so it must fit behind the LONGEST prefix
  // any app uses ('noruegues', 9 chars) — generated codes are 32 anyway
  const MAX_CODE = 64 - 9;

  const PUSH_INTERVAL = 10 * 60 * 1000;     // scheduled rounds: at most one per ten minutes while drilling
  const WRITE_GAP = 2 * 60 * 1000;          // a hide/online push uploads at most once per two minutes
  const PULL_GAP = 5 * 60 * 1000;           // a returning tab (or a reconnect) re-pulls at most once per five minutes
  const PAUSED_INTERVAL = 10 * 60 * 1000;   // while paused (a newer client wrote the blob) poll rarely
  let pushTimer = 0;
  let lastRoundAt = 0;   // when the last round began — any round, not only one that uploaded
  let lastPutAt = 0;     // when the last upload was sent (the hide/online pushes keep WRITE_GAP from it)
  let applying = false;  // Store.applySynced in progress: its save() is ours, not a local change
  let lastPushed = '';   // stable JSON of the state known to be on the server; skips no-op pushes
  let status = 'ok';     // 'ok' | 'error' — meaningful only while sync is on
  let lastSyncAt = 0;
  let paused = false;    // the remote blob carries fields this build does not know
  let generation = 0;
  let inFlight = null;
  let dirty = false;
  const stable = ProgressState.stable;

  const canFetch = typeof fetch === 'function';   // the smoke stub has one that never reaches a network

  /* The code is shared by the apps on this origin through one plain
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
    generation++;
    lastPushed = '';
    paused = false;
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
    else if (st === 'error') title = paused ? STR.syncUpdateApp : STR.syncTitleError;
    else if (!lastSyncAt) title = STR.syncTitleBusy;
    else {
      const min = Math.round((Date.now() - lastSyncAt) / 60000);
      title = min < 1 ? STR.syncTitleNow : STR.syncTitleAgo.replace('{min}', min);
    }
    btn.setAttribute('title', title);
    btn.setAttribute('aria-label', title);
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

  const mergeStates = ProgressState.merge;

  /* ------------------------------------------------------------- transport */

  /* One round: GET, merge, apply locally if that changed anything, and — when
     asked to upload and the server is behind — PUT the merged state. */
  function synchronize(upload) {
    if (!enabled()) return Promise.resolve(false);
    if (inFlight) { if (upload) dirty = true; return inFlight; }
    lastRoundAt = Date.now();
    const gen = generation, url = endpoint();
    const current = () => gen === generation && enabled() && endpoint() === url;
    async function attempt() {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('http ' + res.status);   // an HTTP error is NOT an empty remote
      const remote = await res.json();
      if (!current()) return false;
      // A remote blob this build cannot fully understand was written by a newer
      // client: merging would strip what it does not know and push that back.
      // Pull nothing, push nothing, say so — the learner's local work is safe.
      if (remote !== null && !ProgressState.validate(remote)) { paused = true; throw new Error('newer remote state'); }
      paused = false;
      const local = Store.snapshot();
      const merged = mergeStates(local, remote || {});
      delete merged.prefs; delete merged.prefTimes;   // preferences belong to this device
      const body = stable(merged);
      if (body !== stable(local)) {
        applying = true;
        try { Store.applySynced(merged); } finally { applying = false; }
        if (window.App && App.refreshProgress) App.refreshProgress();
        toast(STR.syncPulled);
      }
      if (remote !== null && body === stable(remote)) { lastPushed = body; markOk(); return true; }
      if (!upload) { dirty = true; markOk(); return true; }
      if (!current()) return false;
      lastPutAt = Date.now();
      // no Content-Type header on purpose: a string body goes as text/plain, a
      // "simple" request the browser sends without an OPTIONS preflight — one
      // worker request per upload, not two (the worker parses the body itself)
      const put = await fetch(url, { method: 'PUT', body: JSON.stringify(merged), cache: 'no-store' });
      if (!current()) return false;
      if (!put.ok) throw new Error('http ' + put.status);
      lastPushed = body; markOk(); return true;
    }
    inFlight = attempt().catch(() => { if (current()) { dirty = true; markError(); } return false; })
      .then(ok => {
        inFlight = null;
        // only a local change that arrived meanwhile (or a server still behind, see
        // `dirty` above) earns another round — never the round's own apply
        if (enabled() && dirty) schedulePush();
        return ok;
      });
    return inFlight;
  }
  function pull() { return synchronize(false); }
  function push() { if (pushTimer) clearTimeout(pushTimer); pushTimer = 0; dirty = false; return synchronize(true); }
  /* Throttle, don't debounce: the first change after a quiet spell uploads in
     2.5 s; further changes ride along until PUSH_INTERVAL has passed since the
     last round began (a GET counts as much as a PUT — the worker's free tier is
     metered per request; the load-time pull is a round too, so a session's
     first upload usually waits the full interval or the tab hiding, whichever
     comes first). After a failure wait a full interval; while paused poll
     rarely — the answer will not change until this device reloads. */
  function schedulePush() {
    dirty = true;
    if (!enabled() || pushTimer || inFlight) return;
    const base = paused ? PAUSED_INTERVAL : status === 'error' ? PUSH_INTERVAL : 2500;
    const wait = Math.max(base, lastRoundAt + PUSH_INTERVAL - Date.now());
    pushTimer = setTimeout(push, wait);
  }
  // Store.save() calls this through Store.onChange; a save made by this
  // module's own applySynced is not a local change and schedules nothing
  function onLocalChange() { if (!applying) schedulePush(); }
  // Local storage is authoritative on close. A GET + PUT is not guaranteed to
  // finish while the page hides, but it is safe to try (a truncated attempt
  // changes nothing) and it usually lands; the next visit reconciles anyway.
  // No `keepalive`: the fetch spec caps keepalive bodies at 64 KiB and a
  // learner's blob outgrows that (1.23.x silently lost every push past it).
  // Both directions are gated: a tab hidden and shown every minute must not
  // cost a request each time — what is skipped rides on the next scheduled
  // round, the next hide past WRITE_GAP, or the next show past PULL_GAP.
  const unsynced = () => dirty || pushTimer || stable(Store.snapshot()) !== lastPushed;
  function pullIfStale() {
    if (!enabled()) return;
    if (Date.now() - lastRoundAt >= PULL_GAP) push();
    else if (unsynced()) schedulePush();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { Store.refreshStorage(); pullIfStale(); }
    else if (document.visibilityState === 'hidden' && enabled() && unsynced() && Date.now() - lastPutAt >= WRITE_GAP) push();
  });
  window.addEventListener('online', pullIfStale);
  window.addEventListener('storage', e => {
    if (e.key === CODE_KEY) { generation++; lastPushed = ''; lastSyncAt = 0; paused = false; updateButton(); pull(); }
  });

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
      pull();
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
    onLocalChange: onLocalChange,  // Store.save() calls this through Store.onChange (below)
    manage: manage,
    canOfferSetup: () => !!SYNC_URL && canFetch && !code(),
    _merge: mergeStates,           // exposed for the checks
    _endpoint: endpoint,           // likewise — proves the /ingles/ key prefix
    _sync: synchronize,
    _setCode: setCode              // likewise — drives the shared-code + migration checks
  };
})();

// Subscribe only now: the initialiser above already saves (the nudge counter), and
// Store.save() must not touch `Sync` while this const is still being initialised.
Store.onChange(Sync.onLocalChange);
