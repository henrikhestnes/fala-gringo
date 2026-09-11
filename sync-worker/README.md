# Sync backend

A single Cloudflare Worker + KV namespace that stores each app's progress blob
under a random secret sync code. The free tier is far more than enough: a blob
is a couple of hundred KB at most and syncs a handful of times per study session.

## Deploy

The checked-in `wrangler.jsonc` targets the existing `fala-gringo-sync` Worker
and its production `SYNC` namespace. From the repository root:

```sh
npx --yes wrangler deploy --config sync-worker/wrangler.jsonc
```

For a new installation: create a KV namespace (`wrangler kv namespace create SYNC`),
put its id in `wrangler.jsonc`, deploy, and copy the worker URL into `SYNC_URL`
at the top of `js/lib/sync.js`.

`wrangler.jsonc` also carries a two-step Durable Object migration (`v2` created a
`SyncState` class, `v3` deleted it). That is history from 2026-09-11, when a
revision-checked protocol was live for a few hours before being rolled back to
this simpler design; wrangler needs the record to reconcile the namespace, so
leave it in place.

## Protocol

- `GET /<code>` returns the stored JSON object, or the literal `null`.
- `PUT /<code>` stores the body: a JSON object with `mastered` and `strength`
  maps, at most 1 MiB. Anything else is 400; a bigger body is 413.
- The code is `[a-z0-9]{16,64}`. The `/ingles/` and `/noruegues/` pages prefix
  it on the wire (`/ingles<code>`), so one code gives three separate blobs.

The client (`js/lib/sync.js`) pulls and merges on load, then pushes the merged
state at most once a minute while drilling and once more when the tab hides.
Every push is preceded by a pull-and-merge, so the server only ever holds the
latest blob. Two devices pushing within the same minute can still overwrite
each other on the server; the loser's answers live on locally and heal on its
next pull. A failed GET never leads to a push. A blob carrying fields the
client does not know (a newer client wrote it) pauses that client instead of
being stripped and pushed back.

## Merge semantics

`js/lib/state.js` (`ProgressState.merge`) is the one merge used by sync, by the
backup import and between tabs. It is conservative: mastered cards are unioned,
misses are kept, a card's streak and review level are the lower of the two
sides, the review clock the newer. `resets` are generations: a device on an
older generation drops the records it wrote before the reset (records carry an
event stamp) and keeps what it did afterwards. Preferences and the sync code
never travel.

## Tests

`node --test scripts/check-sync.mjs` runs the worker handler and the real sync
client together in node (no packages): size and shape rejections, no push after
a failed GET, the newer-client pause, union of two devices' progress, and
key-order-insensitive comparison. The six JXA suites cover the store and the
merge without node.
