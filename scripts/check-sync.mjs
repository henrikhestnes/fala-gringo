// Integration tests for the sync worker + the real sync client, using Node's
// built-in test runner and Web APIs. No dependencies. Run:
//   node --test scripts/check-sync.mjs
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import worker from '../sync-worker/worker.js';
const base = new URL('../', import.meta.url);
const source = p => readFileSync(new URL(p, base), 'utf8');
const code = 'abcdefghijklmnop';
const url = 'https://sync.example/' + code;
const empty = () => ({ mastered: {}, strength: {}, daily: {} });

/* An in-memory KV namespace behind the worker — and, with `r2: true`, an
   in-memory R2 bucket beside it (the worker then reads R2 first, KV as the
   not-yet-migrated fallback, and writes R2 only). */
function backend(initial = null, { r2 = false } = {}) {
  const store = new Map(), bucket = new Map();
  if (initial) store.set(code, JSON.stringify(initial));
  const env = { SYNC: { get: async k => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); } } };
  if (r2) env.SYNC_R2 = { get: async k => (bucket.has(k) ? { text: async () => bucket.get(k) } : null), put: async (k, v) => { bucket.set(k, v); } };
  return { store, bucket, fetch: request => worker.fetch(request, env) };
}
const put = (api, body, headers = {}) => api.fetch(new Request(url, { method: 'PUT', headers, body }));

test('GET of an unknown code is null; a PUT stores the blob; GET returns it', async () => {
  const api = backend();
  assert.equal(await (await api.fetch(new Request(url))).json(), null);
  const data = empty(); data.mastered.nouns = { mesa: 1 };
  assert.equal((await put(api, JSON.stringify(data))).status, 200);
  assert.deepEqual(await (await api.fetch(new Request(url))).json(), data);
});

test('bad codes, non-JSON, wrong shapes and oversized bodies are rejected', async () => {
  const api = backend();
  assert.equal((await api.fetch(new Request('https://sync.example/short'))).status, 400);
  assert.equal((await put(api, '{')).status, 400);
  assert.equal((await put(api, '[1,2]')).status, 400);
  assert.equal((await put(api, JSON.stringify({ mastered: {} }))).status, 400);
  assert.equal((await put(api, ' '.repeat(1024 * 1024 + 1))).status, 413);
  assert.equal((await api.fetch(new Request(url, { method: 'DELETE' }))).status, 405);
  assert.equal((await api.fetch(new Request(url, { method: 'OPTIONS' }))).status, 204);
});

/* The real client in a vm context over the app's DOM stub. `clock.t` is what
   Date.now() reads inside — tests advance it to cross the request-budget gaps. */
function client(fetchImpl) {
  const clock = { t: Date.now() };
  class FakeDate extends Date { static now() { return clock.t; } }
  const context = vm.createContext({ console, Promise, Date: FakeDate, JSON, Map, Set, fetch: fetchImpl });
  // The app stub supplies a DOM and localStorage but replaces fetch; restore
  // the controlled transport after evaluating it.
  vm.runInContext(source('scripts/dom-stub.js'), context);
  context.fetch = fetchImpl;
  vm.runInContext(source('js/lib/state.js') + '\n' + source('js/progress.js') + '\n' + source('js/lib/sync.js'), context);
  vm.runInContext("Sync._setCode('" + code + "');", context);
  return { context, clock, run: text => vm.runInContext(text, context), sync: () => vm.runInContext('Sync._sync(true)', context) };
}
const tick = () => new Promise(r => setTimeout(r, 5));   // let a round's promise chain settle
const MIN = 60 * 1000;

test('a failed GET never leads to a PUT', async () => {
  let puts = 0;
  const c = client(async (_, options = {}) => { if (options.method === 'PUT') puts++; return new Response('offline', { status: 503 }); });
  assert.equal(await c.sync(), false);
  assert.equal(puts, 0);
});

test('two devices end up with the union of their progress', async () => {
  const api = backend();
  const transport = async (_, options = {}) => api.fetch(new Request(url, options));
  const a = client(transport), b = client(transport);
  a.run("Store.markMastered('nouns','mesa'); Store.recordAnswer('nouns','mesa', true)");
  b.run("Store.markMastered('nouns','cadeira'); Store.recordAnswer('nouns','cadeira', true)");
  assert.equal(await a.sync(), true);
  assert.equal(await b.sync(), true);   // pulls a's card, pushes both
  assert.equal(await a.sync(), true);   // pulls b's
  assert.equal(a.run("Store.masteredCount('nouns')"), 2);
  assert.equal(b.run("Store.masteredCount('nouns')"), 2);
  assert.deepEqual(Object.keys(JSON.parse(api.store.get(code)).mastered.nouns).sort(), ['cadeira', 'mesa']);
});

test('a miss on one device keeps the card shaky after the merge', async () => {
  const api = backend();
  const transport = async (_, options = {}) => api.fetch(new Request(url, options));
  const a = client(transport), b = client(transport);
  a.run("Store.markMastered('nouns','mesa'); Store.recordAnswer('nouns','mesa', true)");
  assert.equal(await a.sync(), true);
  assert.equal(await b.sync(), true);
  b.run("Store.recordAnswer('nouns','mesa', false)");
  assert.equal(await b.sync(), true);
  assert.equal(await a.sync(), true);
  assert.equal(a.run("Store.cardState('nouns','mesa')"), 'shaky');
});

test('a card answered right after a miss stays cleared through the next sync round (1.26.2)', async () => {
  const api = backend();
  const transport = async (_, options = {}) => api.fetch(new Request(url, options));
  const a = client(transport);
  a.run("Store.markMastered('nouns','mesa'); Store.recordAnswer('nouns','mesa', true)");
  assert.equal(await a.sync(), true);
  a.run("Store.recordAnswer('nouns','mesa', false)");
  assert.equal(await a.sync(), true);   // the server now holds the miss
  assert.equal(a.run("Store.cardState('nouns','mesa')"), 'shaky');
  a.run("Store.recordAnswer('nouns','mesa', true)");
  assert.equal(a.run("Store.cardState('nouns','mesa')"), 'ok');
  assert.equal(await a.sync(), true);   // pull → merge with the miss → push: the hit must survive
  assert.equal(a.run("Store.cardState('nouns','mesa')"), 'ok');
  const server = JSON.parse(api.store.get(code)).strength.nouns.mesa;
  assert.equal(server.s, 1); assert.equal(server.m, 1); assert.equal(server.l, 1);
});

test('a remote blob from a newer client pauses sync — nothing pulled, nothing pushed', async () => {
  let puts = 0;
  const remote = empty();
  remote.strength.nouns = { mesa: { s: 1, m: 0, t: 20700, l: 1, zz: 5 } };
  remote.mastered.nouns = { mesa: 1 };
  const c = client(async (_, options = {}) => {
    if (options.method === 'PUT') puts++;
    return new Response(JSON.stringify(remote));
  });
  assert.equal(await c.sync(), false);
  assert.equal(puts, 0);
  assert.equal(c.run("Store.masteredCount('nouns')"), 0);
});

test('an identical remote state is recognised whatever its key order (no spurious push)', async () => {
  const api = backend();
  let puts = 0;
  const transport = async (_, options = {}) => { if (options.method === 'PUT') puts++; return api.fetch(new Request(url, options)); };
  const c = client(transport);
  c.run("Store.markMastered('nouns','mesa'); Store.recordAnswer('nouns','mesa', true)");
  assert.equal(await c.sync(), true);
  assert.equal(puts, 1);
  const d = client(transport);   // a second device, same code, nothing of its own
  assert.equal(await d.sync(), true);
  assert.equal(puts, 1, 'the second device pulled and had nothing to push');
  assert.equal(d.run("Store.masteredCount('nouns')"), 1);
  assert.equal(await d.sync(), true);
  assert.equal(puts, 1, 'a re-sync of an identical state pushes nothing');
});

test('disconnecting mid-pull discards the result', async () => {
  let resolve, puts = 0;
  const c = client(async (_, options = {}) => {
    if (options.method === 'PUT') puts++;
    return new Promise(r => { resolve = r; });
  });
  const pending = c.sync();
  c.run("Sync._setCode('')");
  const remote = empty(); remote.mastered.nouns = { mesa: 1 };
  resolve(new Response(JSON.stringify(remote)));
  assert.equal(await pending, false);
  assert.equal(c.run("Store.masteredCount('nouns')"), 0);
  assert.equal(puts, 0);
});

/* 1.31.1: a round that pulls changes must not schedule another round by itself.
   Applying the pulled state saves, and that save used to reach the module's own
   change listener — with a merge that kept finding a difference the client
   polled the worker every 2.5 s, for ever, and only an upload's one-minute
   throttle paused it. A GET-only round now leaves the timer queue alone. */
test('applying a pulled state schedules no round of its own', async () => {
  const api = backend();
  const a = client(async (_, options = {}) => api.fetch(new Request(url, options)));
  a.run("Store.markMastered('nouns','mesa'); Store.recordAnswer('nouns','mesa', true)");
  assert.equal(await a.sync(), true);   // the server now holds a's state
  let gets = 0, puts = 0;
  const transport = async (_, options = {}) => { if (options.method === 'PUT') puts++; else gets++; return api.fetch(new Request(url, options)); };
  const c = client(transport);          // a fresh device: everything it pulls is new to it
  const timersBefore = c.run('timers.length');
  assert.equal(await c.sync(), true);
  assert.equal(c.run("Store.masteredCount('nouns')"), 1, 'the remote card was pulled');
  assert.equal(puts, 0, 'the server was already ahead: nothing to upload');
  assert.equal(c.run('timers.length'), timersBefore, 'no follow-up round was scheduled');
  c.run('flushTimers()');
  await new Promise(r => setTimeout(r, 5));
  assert.equal(gets, 1, 'no second GET');
});

/* The request budget (1.31.1): the worker's free tier meters every request and
   KV allows a thousand writes a day, so a session must cost a handful of
   requests, not one a minute. */
test('scheduled rounds are ten minutes apart; changes ride along into one upload sent without a preflight', async () => {
  const api = backend();
  let gets = 0, puts = 0;
  const transport = async (_, options = {}) => {
    if (options.method === 'PUT') { puts++; assert.equal(options.headers, undefined, 'no Content-Type header: text/plain needs no OPTIONS preflight'); }
    else gets++;
    return api.fetch(new Request(url, options));
  };
  const c = client(transport);
  c.run('window.__delays = []; window.setTimeout = function (fn, ms) { timers.push(fn); window.__delays.push(ms); return timers.length; }');
  assert.equal(await c.sync(), true);           // a round at T: GET, then the PUT of the fresh state
  assert.equal([gets, puts].join(), '1,1');
  c.run("Store.markMastered('nouns','mesa'); Store.recordAnswer('nouns','mesa', true)");
  c.run("Store.markMastered('nouns','cadeira'); Store.recordAnswer('nouns','cadeira', true)");
  const delays = c.run('window.__delays');
  assert.equal(delays.length, 1, 'two changes, one scheduled round');
  assert.ok(delays[0] > 9.5 * MIN && delays[0] <= 10 * MIN, 'the round waits for the ten minutes since the last one: ' + delays[0]);
  c.run('flushTimers()');
  await tick();
  assert.equal([gets, puts].join(), '2,2', 'one GET and one PUT for both answers');
  assert.deepEqual(Object.keys(JSON.parse(api.store.get(code)).mastered.nouns).sort(), ['cadeira', 'mesa']);
  assert.equal(c.run('timers.length'), 0, 'the upload scheduled nothing further');
  // a change after a long quiet spell goes up quickly (nothing recent to wait for)
  c.clock.t += 60 * MIN;
  c.run("Store.markMastered('nouns','porta'); Store.recordAnswer('nouns','porta', true)");
  assert.equal(c.run('window.__delays').pop(), 2500, 'first change after a quiet spell: 2.5 s');
});

test('hiding the tab uploads at most every two minutes; showing it re-pulls at most every five', async () => {
  const api = backend();
  let gets = 0, puts = 0;
  const transport = async (_, options = {}) => { if (options.method === 'PUT') puts++; else gets++; return api.fetch(new Request(url, options)); };
  const c = client(transport);
  const fire = state => c.run("document.visibilityState = '" + state + "'; (document._h.visibilitychange || []).forEach(f => f())");
  assert.equal(await c.sync(), true);                     // GET + PUT at T
  assert.equal([gets, puts].join(), '1,1');
  c.run("Store.markMastered('nouns','mesa'); Store.recordAnswer('nouns','mesa', true)");
  c.clock.t += 30 * 1000;
  fire('hidden'); await tick();
  assert.equal([gets, puts].join(), '1,1', 'hidden 30 s after an upload: nothing sent, the change waits');
  assert.ok(c.run('timers.length') > 0, 'the change is still scheduled');
  c.clock.t += 2 * MIN;
  fire('hidden'); await tick();
  assert.equal([gets, puts].join(), '2,2', 'hidden again past the gap: one round, the change lands');
  fire('visible'); await tick();
  assert.equal(gets, 2, 'shown right after a round: no re-pull');
  c.clock.t += 5 * MIN;
  fire('visible'); await tick();
  assert.equal([gets, puts].join(), '3,2', 'shown five minutes later: one pull, nothing to upload');
});

test('the worker prefers an R2 bucket and migrates a KV blob on the first write', async () => {
  const kvBlob = empty(); kvBlob.mastered.nouns = { mesa: 1 };
  const api = backend(kvBlob, { r2: true });
  assert.deepEqual(await (await api.fetch(new Request(url))).json(), kvBlob, 'not yet in R2: served from KV');
  const next = empty(); next.mastered.nouns = { mesa: 1, cadeira: 1 };
  assert.equal((await put(api, JSON.stringify(next))).status, 200);
  assert.deepEqual(JSON.parse(api.bucket.get(code)), next, 'written to R2');
  assert.deepEqual(JSON.parse(api.store.get(code)), kvBlob, 'KV untouched');
  assert.deepEqual(await (await api.fetch(new Request(url))).json(), next, 'served from R2 from now on');
});
