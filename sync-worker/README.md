# Sync backend

A single Cloudflare Worker that stores each app's progress blob under a random
secret sync code, in an R2 bucket (binding `SYNC_R2`) when one is bound, else
in a KV namespace (binding `SYNC`). A blob is a couple of hundred KB at most.

## Free tier

What the free plans allow (2026-10), and what the client costs:

| Metered thing | Free allowance | What uses it |
| --- | --- | --- |
| Worker requests | 100,000 / day | every GET and PUT (the static site is Workers Static Assets: free, unlimited, not counted) |
| KV writes | **1,000 / day** | every PUT, when KV is the store |
| KV reads | 100,000 / day | every GET, when KV is the store |
| R2 Class A (writes) | 1,000,000 / month ≈ 33,000 / day | every PUT, when R2 is the store |
| R2 Class B (reads) | 10,000,000 / month | every GET, when R2 is the store |

The client (`js/lib/sync.js`, 1.31.1) is budgeted against this: one GET on load,
then a scheduled round (GET + PUT) at most every 10 minutes while the learner
keeps answering, an upload when the tab hides at most every 2 minutes, a re-pull
when it is shown again at most every 5 minutes, and no CORS preflight on the
upload (the body goes as text/plain). A study session is typically one GET and
one or two PUTs — call it 6 requests and 3 writes per syncing learner per day.
On KV that is **~300 daily syncing learners** before writes run out; on R2 the
Worker request cap binds first, at **~15,000**. Sync is opt-in, so learners who
never link a code cost nothing at all.

**Moving to R2** needs no migration step: the worker reads KV for a code the
bucket does not hold yet, and the next PUT lands in R2. Create the bucket,
enable the `r2_buckets` binding in `wrangler.jsonc` (it is there, commented
out), deploy. R2 must be enabled once in the Cloudflare dashboard; some
accounts are asked for a payment method at that point even though the free
allowance is not billed.

```sh
npx --yes wrangler r2 bucket create fala-gringo-sync
```

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
state at most every ten minutes while drilling and once more when the tab hides
(see "Free tier" above for the whole budget).
Every push is preceded by a pull-and-merge, so the server only ever holds the
latest blob. Two devices both pushing between each other's pulls can still
overwrite each other on the server; the loser's answers live on locally and
heal on its next pull. A failed GET never leads to a push. A blob carrying fields the
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
a failed GET, the newer-client pause, union of two devices' progress,
key-order-insensitive comparison, the request budget (no self-scheduled round
after a pull, ten-minute rounds, the hide/show gaps, no preflight) and the R2
store with its KV fallback. The six JXA suites cover the store and the
merge without node.
