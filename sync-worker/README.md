# Sync backend

A single Cloudflare Worker + KV namespace that stores the app's `pvs:v1`
progress blob under a random secret sync code. Free tier is far more than
enough (the blob is a few KB and syncs a handful of times per study session).

## Deploy (one time, ~5 minutes, via the dashboard)

1. Sign in at <https://dash.cloudflare.com> (create a free account if needed).
2. **Storage & Databases → KV → Create namespace** — name it `fala-gringo-sync`.
3. **Workers & Pages → Create → Worker** — name it `fala-gringo-sync`, deploy the
   hello-world, then **Edit code**, replace everything with `worker.js` from this
   folder, and deploy.
4. On the worker: **Settings → Bindings → Add → KV namespace** — variable name
   `SYNC` (exactly), select the namespace from step 2. Deploy again.
5. Copy the worker URL (`https://fala-gringo-sync.<your-subdomain>.workers.dev`)
   into `SYNC_URL` at the top of `js/lib/sync.js`, commit, push.

Or with wrangler, if installed: `wrangler kv namespace create SYNC`, put the
returned id in a `wrangler.toml` binding named `SYNC`, then `wrangler deploy worker.js`.

## Using it

The /ingles/ subpage uses the very same worker: it prefixes the code with
`ingles` on the wire (`/ingles<code>`), so its blob lives under a different KV
key and never merges with the main app's. The code is stored once per device
(a shared localStorage key), so linking either app links both.

On any device (either app): tap the ⇅ button in the top bar. First device: leave the box
empty to generate a sync code. Other devices: paste that code. The code is the
key to the progress — anyone who has it can read and write that progress, so
treat it like a password (it never appears in URLs, only in the request path
over HTTPS).

The app pulls-and-merges on every load and pushes at most once a minute while
drilling, with a final flush when the tab is hidden or closed — that keeps a
heavy session at a handful of KV writes, well inside the free tier's 1,000
writes/day. Merging is conservative: mastered cards are unioned, misses are kept,
and a card's correct-streak only counts if it happened since the last miss on
every device — so syncing can never falsely graduate a shaky card out of Foco.
