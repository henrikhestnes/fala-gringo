// Optional integration tests using Node's built-in test runner and Web APIs.
// No dependencies. Run: node --test scripts/check-sync.mjs
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import worker, { SyncState } from '../sync-worker/worker.js';
const base = new URL('../', import.meta.url);
const source = p => readFileSync(new URL(p, base), 'utf8');
const code = 'abcdefghijklmnop';
const url = 'https://sync.example/' + code;
const empty = () => ({ mastered: {}, strength: {}, daily: {} });

function backend(legacy = null, ref = null) {   // ref: { value } lets a test change what KV answers
  let record, imports = 0, gate = Promise.resolve();
  const serial = fn => {
    const next = gate.then(fn);
    gate = next.catch(() => {});
    return next;
  };
  const storage = {
    get: async () => structuredClone(record),
    put: async (_, value) => { record = structuredClone(value); },
    transaction: fn => serial(() => fn(storage))
  };
  const env = { SYNC: { get: async () => { imports++; const v = ref ? ref.value : legacy; return v && JSON.stringify(v); } } };
  const object = new SyncState({ storage, blockConcurrencyWhile: serial }, env);
  env.SYNC_STATE = { idFromName: id => id, get: () => object };
  return { env, imports: () => imports, fetch: request => worker.fetch(request, env) };
}

test('atomic revisions reject a concurrent stale write and preserve the winner', async () => {
  const api = backend();
  const get = await api.fetch(new Request(url));
  assert.equal(get.headers.get('ETag'), '"0"');
  const a = empty(), b = empty(); a.mastered.nouns = { mesa: 1 }; b.mastered.nouns = { cadeira: 1 };
  const put = data => api.fetch(new Request(url, { method: 'PUT', headers: { 'If-Match': '"0"' }, body: JSON.stringify(data) }));
  const results = await Promise.all([put(a), put(b)]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 412]);
  const stored = await api.fetch(new Request(url));
  assert.equal(stored.headers.get('ETag'), '"1"');
  assert.equal(Object.keys((await stored.json()).mastered.nouns).length, 1);
});

test('KV migration is once-only; old clients and malformed/oversized uploads are rejected', async () => {
  const legacy = empty(); legacy.mastered.nouns = { mesa: 1 };
  const api = backend(legacy);
  assert.deepEqual(await (await api.fetch(new Request(url))).json(), legacy);
  await api.fetch(new Request(url));
  assert.equal(api.imports(), 1);
  const put = (body, headers = {}) => api.fetch(new Request(url, { method: 'PUT', headers, body }));
  assert.equal((await put('{}')).status, 428);
  assert.equal((await put('{', { 'If-Match': '"0"' })).status, 400);
  assert.equal((await put(JSON.stringify({ mastered: {}, strength: { nouns: { bad: null } } }), { 'If-Match': '"0"' })).status, 400);
  assert.equal((await put(' '.repeat(1024 * 1024 + 1), { 'If-Match': '"0"' })).status, 413);
  assert.equal((await api.fetch(new Request(url, { method: 'OPTIONS' }))).headers.get('Access-Control-Expose-Headers'), 'ETag, X-Sync-Version');
});

function client(fetchImpl) {
  const context = vm.createContext({ console, Promise, Date, JSON, Map, Set, fetch: fetchImpl });
  // The normal app stub supplies a DOM and local storage but intentionally
  // replaces fetch; restore the controlled transport after evaluating it.
  vm.runInContext(source('scripts/dom-stub.js'), context);
  context.fetch = fetchImpl;
  vm.runInContext(source('js/lib/state.js') + '\n' + source('js/progress.js') + '\n' + source('js/lib/sync.js'), context);
  vm.runInContext("Sync._setCode('" + code + "');", context);
  return { context, run: text => vm.runInContext(text, context), sync: () => vm.runInContext('Sync._sync(true)', context) };
}

test('failed GET and old backend cannot trigger a blind PUT', async () => {
  for (const result of [new Response('offline', { status: 503 }), new Response('null')]) {
    let puts = 0;
    const c = client(async (_, options) => { if (options?.method === 'PUT') puts++; return result.clone(); });
    assert.equal(await c.sync(), false);
    assert.equal(puts, 0);
  }
});

test('client retries revision conflict after remerging both devices', async () => {
  const api = backend();
  let inject = true, puts = 0;
  const c = client(async (_, options = {}) => {
    if (options.method === 'PUT') {
      puts++;
      if (inject) {
        inject = false;
        const other = empty(); other.mastered.nouns = { cadeira: 1 };
        await api.fetch(new Request(url, { method: 'PUT', headers: { 'If-Match': '"0"' }, body: JSON.stringify(other) }));
      }
    }
    return api.fetch(new Request(url, options));
  });
  c.run("Store.markMastered('nouns','mesa')");
  assert.equal(await c.sync(), true);
  assert.equal(puts, 2);
  const stored = await (await api.fetch(new Request(url))).json();
  assert.deepEqual(stored.mastered.nouns, { mesa: 1, cadeira: 1 });
});

test('disconnect or code change invalidates a pending pull', async () => {
  let resolve, puts = 0;
  const c = client(async (_, options = {}) => {
    if (options.method === 'PUT') puts++;
    return new Promise(r => { resolve = r; });
  });
  const pending = c.sync();
  c.run("Sync._setCode('')");
  const remote = empty(); remote.mastered.nouns = { mesa: 1 };
  resolve(new Response(JSON.stringify(remote), { headers: { ETag: '"0"', 'X-Sync-Version': '2' } }));
  assert.equal(await pending, false);
  assert.equal(c.run("Store.masteredCount('nouns')"), 0);
  assert.equal(puts, 0);
});

test('an empty KV answer is not persisted: a value KV serves later is still imported', async () => {
  const ref = { value: null };
  const api = backend(null, ref);
  assert.equal(await (await api.fetch(new Request(url))).json(), null);
  ref.value = empty(); ref.value.mastered.nouns = { mesa: 1 };
  const later = await api.fetch(new Request(url));
  assert.deepEqual(await later.json(), ref.value);
  assert.equal(later.headers.get('ETag'), '"0"');
  // imported for good now: a later KV change is ignored
  const imported = ref.value; ref.value = null;
  assert.deepEqual(await (await api.fetch(new Request(url))).json(), imported);
});

test('a malformed legacy value is cleaned on import instead of failing the code forever', async () => {
  const legacy = empty();
  legacy.mastered.nouns = { mesa: 1, cadeira: 'yes' };
  legacy.strength.nouns = { mesa: { s: 1, m: 0, t: 20700, l: 1, x: 'unknown' }, bad: null };
  const api = backend(legacy);
  const got = await (await api.fetch(new Request(url))).json();
  assert.deepEqual(got.mastered.nouns, { mesa: 1 });
  assert.deepEqual(got.strength.nouns, { mesa: { s: 1, m: 0, t: 20700, l: 1 } });
});

test('a PUT on a never-seen code creates revision 1', async () => {
  const api = backend();
  const data = empty(); data.mastered.nouns = { mesa: 1 };
  const put = await api.fetch(new Request(url, { method: 'PUT', headers: { 'If-Match': '"0"' }, body: JSON.stringify(data) }));
  assert.equal(put.status, 200);
  assert.equal(put.headers.get('ETag'), '"1"');
  assert.deepEqual(await (await api.fetch(new Request(url))).json(), data);
});

test('client: a remote blob from a newer client pauses sync — nothing pulled, nothing pushed', async () => {
  let puts = 0;
  const remote = empty();
  remote.strength.nouns = { mesa: { s: 1, m: 0, t: 20700, l: 1, zz: 5 } };
  remote.mastered.nouns = { mesa: 1 };
  const c = client(async (_, options = {}) => {
    if (options.method === 'PUT') puts++;
    return new Response(JSON.stringify(remote), { headers: { ETag: '"3"', 'X-Sync-Version': '2' } });
  });
  assert.equal(await c.sync(), false);
  assert.equal(puts, 0);
  assert.equal(c.run("Store.masteredCount('nouns')"), 0);
});

test('client: an identical remote state is recognised whatever its key order (no spurious push)', async () => {
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
