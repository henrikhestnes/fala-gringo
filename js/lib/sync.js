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
// by syncing; the daily log merges element-wise), and pushes send the whole
// merged state a couple of seconds after an answer. Because every sync merges,
// a push lost to a closed tab or a dead connection heals on the next load.

const SYNC_URL = '';   // ← your deployed worker, e.g. 'https://fala-gringo-sync.you.workers.dev'

const Sync = (function () {
  let pushTimer = 0;
  let lastPushed = '';   // last JSON known to be on the server; skips no-op pushes

  const canFetch = typeof fetch === 'function';   // absent in the smoke-test stub

  function code() { return Store.getPref('syncCode', ''); }
  function enabled() { return !!SYNC_URL && canFetch && !!code(); }
  function endpoint() { return SYNC_URL.replace(/\/+$/, '') + '/' + code(); }

  function toast(msg) { if (typeof showToast === 'function') showToast(msg); }

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
      .then(res => (res.ok ? res.json() : null))
      .then(remote => {
        const local = Store.snapshot();
        const merged = mergeStates(local, remote || { mastered: {}, strength: {}, daily: {} });
        const mergedJson = JSON.stringify(merged);
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
      .catch(() => { /* offline — the next load heals */ });
  }

  function push() {
    if (!enabled()) return;
    const body = JSON.stringify(Store.snapshot());
    if (body === lastPushed) return;
    fetch(endpoint(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      cache: 'no-store'
    }).then(res => { if (res.ok) lastPushed = body; })
      .catch(() => { /* offline — the next answer reschedules */ });
  }

  function schedulePush() {
    if (!enabled()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 2500);
  }

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
      }
    }
  }

  const btn = document.getElementById('syncBtn');
  if (btn) btn.addEventListener('click', manage);

  pull();   // merge in whatever the other devices did since last time

  return {
    onLocalChange: schedulePush,   // called by Store.save()
    manage: manage,
    _merge: mergeStates            // exposed for the checks
  };
})();
