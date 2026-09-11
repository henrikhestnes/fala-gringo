# Sync backend, protocol v2

The static site uses a secret code shared across the three apps. Progress is separate: the root uses the bare code, English prefixes `ingles`, and Norwegian prefixes `noruegues`. The code is a bearer secret sent only to the configured HTTPS endpoint. Backups never include it.

## Upgrade before publishing the v1.24 client

Version 2 replaces blind KV writes with **revision-checked writes to a Durable Object**. KV has no atomic compare-and-set and cannot safely arbitrate concurrent device updates. Each secret code has its own object. The first request that finds a **value** in KV imports it (once); an empty KV answer is served as a virtual revision 0 and is *not* stored, so a value KV only serves a little later (it is eventually consistent, up to ~60 s) is still picked up on a following request, and a PUT on a never-seen code creates revision 1 directly. A malformed legacy value is cleaned (`ProgressState.clean`) rather than failing every request for that code. The original KV value is left untouched for recovery.

1. The checked-in config targets the existing `fala-gringo-sync` Worker and its production account.
2. Its `SYNC` namespace (`9014f52e474248a5bfb344afdc2021b7`) was verified against active version `f8d906f2-fe2b-40fa-9dcb-57c81bfb2370` on 2026-09-10. Recheck the live binding if deploying later; preserve it rather than creating an empty replacement namespace.
3. From the repository root, deploy the backend using `npx --yes wrangler deploy --config sync-worker/wrangler.jsonc`. Wrangler bundles `worker.js` and the shared `js/lib/state.js` validation code. The `v2` migration creates the SQLite-backed `SyncState` Durable Object class.
4. Verify with a separate test code: GET returns `X-Sync-Version: 2` and `ETag: "0"`; PUT with `If-Match: "0"` advances the revision; reusing the old revision returns 412. Verify that an existing account imports correctly before publishing the client.
5. Publish the static site. Existing browser clients must reload to v1.24: blind PUTs from older versions receive 428 and cannot overwrite upgraded progress (their pulls keep working, so nothing is lost meanwhile).

Either order degrades safely — a v1.24 client against the old KV worker pauses itself ("server needs updating", pull-only), an old client against the new worker pulls but cannot push — but deploy the worker **first**, at a quiet hour: the import takes whatever KV serves, and KV can lag a push made seconds earlier by up to a minute.

The config contains verified account and namespace identifiers, which are not credentials. Both `SYNC` and `SYNC_STATE` bindings are required. No deployment is part of the local test suites. There is no rate limit in the Worker itself — every GET on a well-formed code touches a Durable Object (nothing is stored until a value exists) — so add a Cloudflare rate-limiting rule on the route if abuse ever shows up.

The deployment dry run passed on 2026-09-10 with Wrangler 4.129.0 and both expected bindings. It did not publish the Worker or create the Durable Object namespace.

For a local bundle/configuration check without publishing, run `npx --yes wrangler deploy --dry-run --config sync-worker/wrangler.jsonc --outdir /private/tmp/fala-gringo-sync-bundle`.

For a new installation, create a KV namespace, place its ID in the same config, then deploy. It serves as the empty migration source for new accounts.

## Protocol

- `GET /<code>` returns the progress object (or `null`) and its quoted integer `ETag`.
- `PUT /<code>` requires `If-Match` with that exact ETag and a validated progress object. A transaction checks the revision and writes the next one atomically.
- A stale revision returns 412; a missing precondition returns 428. The client fetches, merges and retries a conflict up to three times, then backs off.
- The body is capped at 1 MiB while streaming. CORS exposes ETag and the protocol version. Responses are not cacheable.

A failed GET or an old backend never permits an upload. A remote blob carrying a record field the client does not know (written by a newer client) pauses that client — it neither pulls nor pushes, and its button says to reload. Clients keep progress locally and retry when online, when visible, or after the retry delay (10 minutes while paused). Changes are normally uploaded after 2.5 seconds idle and at most once a minute during sustained practice; a tab going hidden attempts one last GET + conditional PUT (harmless if cut short), and the next visit reconciles first anyway. States are compared with sorted-key JSON, so key order never counts as a change.

## Conflict semantics

`js/lib/state.js` is the pure merge/validation implementation used by the browser and backend validation. New answer records carry a monotonic `u` timestamp and a causal `v` vector with **one entry per device** (`fg:device` in localStorage, stable across sessions; capped at 8 actors as a safety net — dropping an actor only makes a merge more conservative). A retry that observed a miss supersedes it; concurrent offline answers and legacy records use conservative minimum streak/level. A device with a fast clock cannot hide a concurrent miss. Clock advancement observes merged event clocks, including after local clock rollback. Reset markers start a new global or topic generation: a side on an older generation drops the records it wrote *before* the reset and keeps those written after it (offline work on another device survives). Preferences and sync codes stay local.

Daily result slots merge by `{topic, id}`, never by position across different manifests. A challenge revision determines the selected manifest; overlapping identities retain their results. Device answer counts retain their existing max-merge semantics, rather than pretending that replicated counts are additive.

## Tests and rollout limits

Run `node --test scripts/check-sync.mjs` for transport integration tests using Node's built-in APIs (no packages). They cover simultaneous writes, migration (including a KV value that appears late, and a malformed one), stale/legacy requests, malformed/oversized bodies, failed pulls, retry merging, code changes in flight, a newer client's blob pausing an older one, and key-order-insensitive comparison. The six JXA suites cover app and state behavior without Node (`scripts/store-steps.js` holds the store's persistence regressions).

The integration tests model serialized Durable Object storage; they do not provision Cloudflare or replace a staging migration check. Consult the official [Durable Object storage documentation](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) for the transaction guarantees.
