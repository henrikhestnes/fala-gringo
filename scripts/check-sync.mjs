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

/* An in-memory KV namespace behind the worker. */
function backend(initial = null) {
  const store = new Map();
  if (initial) store.set(code, JSON.stringify(initial));
  const env = { SYNC: { get: async k => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); } } };
  return { store, fetch: request => worker.fetch(request, env) };
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

function client(fetchImpl) {
  const context = vm.createContext({ console, Promise, Date, JSON, Map, Set, fetch: fetchImpl });
  // The app stub supplies a DOM and localStorage but replaces fetch; restore
  // the controlled transport after evaluating it.
  vm.runInContext(source('scripts/dom-stub.js'), context);
  context.fetch = fetchImpl;
  vm.runInContext(source('js/lib/state.js') + '\n' + source('js/progress.js') + '\n' + source('js/lib/sync.js'), context);
  vm.runInContext("Sync._setCode('" + code + "');", context);
  return { context, run: text => vm.runInContext(text, context), sync: () => vm.runInContext('Sync._sync(true)', context) };
}

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
