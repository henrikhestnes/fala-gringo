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
// by syncing; the daily log merges element-wise). Pushes send the whole state,
// throttled to one per minute (KV free tier allows 1,000 writes/day) with a
// final flush when the tab is hidden or closed. Because every sync merges, a
// push lost to a dead connection or a killed tab heals on the next load.

const SYNC_URL = 'https://fala-gringo-sync.henrik-hestnes.workers.dev';   // scheme required: without it fetch() treats this as a relative path

const Sync = (function () {
  const PUSH_INTERVAL = 60 * 1000;   // at most one KV write a minute while drilling
  let pushTimer = 0;
  let lastPushAt = 0;
  let lastPushed = '';   // last JSON known to be on the server; skips no-op pushes
  let status = 'ok';     // 'ok' | 'error' — meaningful only while sync is on
  let lastSyncAt = 0;

  const canFetch = typeof fetch === 'function';   // absent in the smoke-test stub

  function code() { return Store.getPref('syncCode', ''); }
  function enabled() { return !!SYNC_URL && canFetch && !!code(); }
  function endpoint() { return SYNC_URL.replace(/\/+$/, '') + '/' + code(); }

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
    if (st === 'off') title = 'Sync is off — tap to link your devices';
    else if (st === 'error') title = 'Last sync failed — will retry';
    else if (!lastSyncAt) title = 'Syncing…';
    else {
      const min = Math.round((Date.now() - lastSyncAt) / 60000);
      title = min < 1 ? 'Synced just now' : 'Synced ' + min + ' min ago';
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
    const out = { mastered: {}, strength: {}, daily: {} };

    eachKey(x.mastered, y.mastered, (topic, a, b) => {
      out.mastered[topic] = Object.assign({}, a || {}, b || {});
    });

    eachKey(x.strength, y.strength, (topic, a, b) => {
      const t = out.strength[topic] = {};
      eachKey(a || {}, b || {}, (card, sa, sb) => {
        // one-sided: take it verbatim; both: pessimistic view — misses never
        // shrink, and a streak only counts if it postdates the miss everywhere
        t[card] = !sa ? sb : !sb ? sa
          : { s: Math.min(sa.s || 0, sb.s || 0), m: Math.max(sa.m || 0, sb.m || 0) };
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
        const merged = mergeStates(local, remote || { mastered: {}, strength: {}, daily: {} });
        const mergedJson = JSON.stringify(merged);
        markOk();
        if (mergedJson !== JSON.stringify(local)) {
          Store.applySynced(merged);          // save() schedules the push back up
          if (window.App) App.refresh();
          toast('Progress synced ⇅');
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
      toast('Sync needs a backend — see sync-worker/README.md');
      return;
    }
    if (typeof window.prompt !== 'function') return;
    if (!code()) {
      const entered = window.prompt(
        'Sync across devices.\n\nPaste the sync code from your other device — ' +
        'or leave the box empty to create a new one.', '');
      if (entered === null) return;
      const c = (entered.trim() || newCode()).toLowerCase();
      if (!/^[a-z0-9]{16,64}$/.test(c)) { toast('That code does not look right'); return; }
      Store.setPref('syncCode', c);
      lastPushed = '';
      lastSyncAt = 0;
      updateButton();
      pull().then(schedulePush);
      window.prompt(
        'Sync is ON. This code is the key to your progress — copy it, keep it ' +
        'private, and paste it on your other devices:', c);
    } else {
      const ans = window.prompt(
        'Sync is ON. Your code is below — copy it to link another device.\n\n' +
        'Type "off" instead to disconnect this device.', code());
      if (ans !== null && ans.trim().toLowerCase() === 'off') {
        Store.setPref('syncCode', '');
        toast('Sync off on this device');
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
      setTimeout(() => toast('⇅ can sync your progress between devices — tap it to set up'), 1200);
    }
  }

  pull();   // merge in whatever the other devices did since last time

  return {
    onLocalChange: schedulePush,   // called by Store.save()
    manage: manage,
    _merge: mergeStates            // exposed for the checks
  };
})();
