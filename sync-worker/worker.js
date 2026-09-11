import '../js/lib/state.js';
// Fala Gringo sync backend, protocol v2: one strongly consistent Durable
// Object per secret code, revision-checked writes.
//
//   GET  /<code>            -> the stored progress JSON (or `null`), ETag "<revision>"
//   PUT  /<code>            -> If-Match: "<revision>" required; 412 when stale,
//                              428 when missing (a pre-1.24 client's blind write)
//
// The learner's sync code is both identity and password (capability-URL
// style); the three apps prefix it on the wire (`ingles<code>`, `noruegues<code>`).
// Existing KV data (the pre-1.24 backend) is imported the first time a code is
// seen with a value — a null read is NOT persisted, so a value that KV serves
// a little later (it is eventually consistent) is still picked up. The KV
// value itself is never touched, for rollback and manual recovery.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-Match',
  'Access-Control-Expose-Headers': 'ETag, X-Sync-Version',
  'Cache-Control': 'no-store',
  'X-Sync-Version': '2'
};
const LIMIT = 1024 * 1024;
function response(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: Object.assign({}, CORS, extra) });
}
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return response(null, 204);
    const code = new URL(request.url).pathname.replace(/^\/+/, '');
    if (!/^[a-z0-9]{16,64}$/.test(code)) return response('bad code', 400);
    if (!['GET', 'PUT'].includes(request.method)) return response('method not allowed', 405);
    if (!env.SYNC_STATE) return response('sync storage not configured', 503);
    return env.SYNC_STATE.get(env.SYNC_STATE.idFromName(code)).fetch(request);
  }
};

export class SyncState {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }

  /* The current record, importing from KV when this object has none yet. A
     malformed legacy value is cleaned (never a reason to fail every request
     for this code); an empty KV answer yields a virtual revision 0 that is not
     stored, so the import is retried on the next request until a PUT lands. */
  async record() {
    const stored = await this.ctx.storage.get('record');
    if (stored !== undefined) return stored;
    let data = null;
    if (this.env.SYNC) {
      try {
        const legacy = await this.env.SYNC.get(this.code);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (parsed !== null) {
            const cleaned = globalThis.ProgressState.clean(parsed);
            data = globalThis.ProgressState.validate(parsed) ? parsed : cleaned;
          }
        }
      } catch (e) { data = null; }
    }
    if (data === null) return { revision: 0, data: null };
    return this.ctx.blockConcurrencyWhile(async () => {
      const again = await this.ctx.storage.get('record');
      if (again !== undefined) return again;
      const record = { revision: 0, data };
      await this.ctx.storage.put('record', record);
      return record;
    });
  }

  async fetch(request) {
    this.code = new URL(request.url).pathname.replace(/^\/+/, '');
    if (request.method === 'GET') {
      const record = await this.record();
      return response(JSON.stringify(record.data), 200, { 'Content-Type': 'application/json', ETag: '"' + record.revision + '"' });
    }
    const match = request.headers.get('If-Match');
    if (!match) return response('conditional write required; update the app', 428);
    // Read incrementally so a large request cannot allocate an unbounded body.
    const reader = request.body && request.body.getReader();
    if (!reader) return response('missing body', 400);
    let size = 0, chunks = [];
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > LIMIT) { await reader.cancel(); return response('too big', 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    chunks.forEach(c => { bytes.set(c, offset); offset += c.length; });
    let data;
    try { data = JSON.parse(new TextDecoder().decode(bytes)); }
    catch (_) { return response('not json', 400); }
    if (!globalThis.ProgressState.validate(data) || !data.mastered || !data.strength)
      return response('invalid progress', 400);
    await this.record();   // import first, so the revision below is the real one
    return this.ctx.storage.transaction(async txn => {
      const record = (await txn.get('record')) || { revision: 0, data: null };
      if (match !== '"' + record.revision + '"') return response('revision changed', 412);
      const revision = record.revision + 1;
      await txn.put('record', { revision, data });
      return response('ok', 200, { ETag: '"' + revision + '"' });
    });
  }
}
