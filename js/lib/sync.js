// Optional cross-device sync: inactive until a learner links a secret code.
// Protocol v2 pulls, merges and conditionally writes a revision to one Durable
// Object per code. Failed pulls never permit uploads; stale revisions retry.
// Answer vectors preserve causally later recoveries and keep concurrent misses
// conservative. Reset generations prevent deleted progress from returning.
// The three apps share fg:syncCode, while ingles/noruegues wire prefixes keep
// their progress separate. Preferences remain per-device and per-app.
// See sync-worker/README.md for the required backend upgrade before publishing.

const SYNC_URL = 'https://fala-gringo-sync.henrik-hestnes.workers.dev';   // scheme required: without it fetch() treats this as a relative path

const Sync = (function () {
  const STR = Object.assign({
    syncTitleOff: 'Sync is off — tap to link your devices',
    syncTitleError: 'Last sync failed — will retry',
    syncTitleBusy: 'Syncing…',
    syncUpgrade: 'Sync is paused until the server is updated. Your progress is still saved on this device.',
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
  // key prefix on the worker: '' for the main app, 'ingles' for the subpage —
  // it must satisfy the worker's [a-z0-9]{16,64} code regex together with the code
  const APP = String(window.APP_SYNC_APP || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // the code is shared with the other app, so it must fit behind the LONGEST prefix
  // any app uses ('noruegues', 9 chars) — generated codes are 32 anyway
  const MAX_CODE = 64 - 9;

  const PUSH_INTERVAL = 60 * 1000;   // at most one regular upload a minute while drilling
  const PAUSED_INTERVAL = 10 * 60 * 1000;   // while paused (server or app out of date) poll rarely
  let pushTimer = 0;
  let lastPushAt = 0;
  let lastPushed = '';   // stable JSON of the state known to be on the server; skips no-op pushes
  let status = 'ok';     // 'ok' | 'error' — meaningful only while sync is on
  let lastSyncAt = 0;
  let paused = '';       // '' | 'server' (old worker) | 'app' (newer client wrote the remote blob)
  let generation = 0;
  let inFlight = null;
  let dirty = false;
  const stable = ProgressState.stable;

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
    generation++;
    lastPushed = '';
    paused = '';
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
    else if (st === 'error') title = paused === 'server' ? STR.syncUpgrade : paused === 'app' ? STR.syncUpdateApp : STR.syncTitleError;
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

  // Every upload follows a successful GET and carries its revision. The server
  // atomically rejects a stale revision; we merge and retry instead of overwriting.
  function synchronize(upload) {
    if (!enabled()) return Promise.resolve(false);
    if (inFlight) { if (upload) dirty = true; return inFlight; }
    const gen = generation, url = endpoint();
    const current = () => gen === generation && enabled() && endpoint() === url;
    let retries = 0;
    async function attempt() {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('http ' + res.status);
      const revision = res.headers && res.headers.get('ETag');
      const protocol = res.headers && res.headers.get('X-Sync-Version');
      const remote = await res.json();
      if (!current()) return false;
      // A remote blob this build cannot fully understand was written by a newer
      // client: merging would strip what it does not know and push that back.
      // Pull nothing, push nothing, say so — the learner's local work is safe.
      if (remote !== null && !ProgressState.validate(remote)) { paused = 'app'; throw new Error('newer remote state'); }
      const local = Store.snapshot();
      const merged = mergeStates(local, remote || {});
      // Preferences belong to this device, never to the sync payload.
      delete merged.prefs; delete merged.prefTimes;
      const body = stable(merged);
      if (body !== stable(local)) {
        Store.applySynced(merged);
        if (window.App && App.refreshProgress) App.refreshProgress();
        toast(STR.syncPulled);
      }
      if (!revision || protocol !== '2') { paused = 'server'; throw new Error('backend upgrade required'); }
      paused = '';
      if (remote !== null && body === stable(remote)) { lastPushed = body; markOk(); return true; }
      if (!upload) { dirty = true; markOk(); return true; }
      if (!current()) return false;
      lastPushAt = Date.now();
      const put = await fetch(url, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'If-Match': revision },
        body: JSON.stringify(merged), cache: 'no-store'
      });
      if (!current()) return false;
      if (put.status === 412 && retries++ < 3) return attempt();
      if (!put.ok) throw new Error('http ' + put.status);
      lastPushed = body; markOk(); return true;
    }
    inFlight = attempt().catch(() => { if (current()) { dirty = true; markError(); } return false; })
      .then(ok => {
        inFlight = null;
        if (enabled() && (dirty || stable(Store.snapshot()) !== lastPushed)) schedulePush();
        return ok;
      });
    return inFlight;
  }
  function pull() { return synchronize(false); }
  function push() { if (pushTimer) clearTimeout(pushTimer); pushTimer = 0; dirty = false; return synchronize(true); }
  /* Throttle, don't debounce: the first change after a quiet spell uploads in
     2.5 s; further changes ride along until PUSH_INTERVAL has passed. After a
     failure wait a full interval; while paused (see above) poll rarely — the
     answer will not change until a deploy or a reload. */
  function schedulePush() {
    dirty = true;
    if (!enabled() || pushTimer || inFlight) return;
    const base = paused ? PAUSED_INTERVAL : status === 'error' ? PUSH_INTERVAL : 2500;
    const wait = Math.max(base, lastPushAt + PUSH_INTERVAL - Date.now());
    pushTimer = setTimeout(push, wait);
  }
  // Local persistence is authoritative on close. A GET + conditional PUT is
  // not guaranteed to finish while the page hides, but it is safe to try (a
  // truncated attempt changes nothing), and it usually lands — so the other
  // device sees this session's last answers without waiting for the next visit.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { Store.refreshStorage(); push(); }
    else if (document.visibilityState === 'hidden' && enabled() && (dirty || pushTimer || stable(Store.snapshot()) !== lastPushed)) push();
  });
  window.addEventListener('online', () => push());
  window.addEventListener('storage', e => {
    if (e.key === CODE_KEY) { generation++; lastPushed = ''; lastSyncAt = 0; paused = ''; updateButton(); pull(); }
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
    onLocalChange: schedulePush,   // Store.save() calls this through Store.onChange (below)
    manage: manage,
    _merge: mergeStates,           // exposed for the checks
    _endpoint: endpoint,           // likewise — proves the /ingles/ key prefix
    _sync: synchronize,
    _setCode: setCode              // likewise — drives the shared-code + migration checks
  };
})();

// Subscribe only now: the initialiser above already saves (the nudge counter), and
// Store.save() must not touch `Sync` while this const is still being initialised.
Store.onChange(Sync.onLocalChange);
