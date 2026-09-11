// Offline support. The cache is keyed to APP_VERSION (js/version.js), so the
// usual version bump on every user-visible change also ships fresh assets:
// the browser re-checks importScripts on navigation, a changed version makes
// this worker "new", and activate drops the old cache. Runtime strategy is
// stale-while-revalidate — instant loads from cache, silently refreshed in the
// background, so an update is at most one reload behind.
importScripts('js/version.js');

const CACHE = 'fala-gringo-' + APP_VERSION;

// The pages are cached under their directory URL only: the host answers
// index.html with a redirect to ./, and a redirected response can never be
// handed to a navigation (Chrome fails the load with ERR_FAILED) — see clean().
const CORE = [
  './', 'css/app.css', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'js/lib/text.js', 'js/lib/tts.js', 'js/lib/stt.js', 'js/lib/fx.js',
  'js/lib/state.js', 'js/progress.js', 'js/conjugate.js',
  'js/data/verbs.js', 'js/data/pronominal.js', 'js/data/nouns.js',
  'js/data/adjectives.js', 'js/data/adverbs.js', 'js/data/connecting.js',
  'js/data/numbers.js', 'js/data/glossary.js', 'js/data/sentences.js',
  'js/topics.js', 'js/infer.js', 'js/quiz.js', 'js/browse.js', 'js/daily.js',
  'js/milestones.js', 'js/app.js', 'js/lib/sync.js', 'js/version.js',
  // the /ingles/ subpage (English for Brazilians) shares the engine above and
  // registers this same root worker, so its own files ride in the same cache
  'ingles/', 'ingles/manifest.json', 'ingles/js/topics.js',
  'ingles/js/data/irregulares.js', 'ingles/js/data/phrasal.js',
  // same deal for /noruegues/ (Norwegian for Brazilians)
  'noruegues/', 'noruegues/manifest.json', 'noruegues/js/topics.js',
  'noruegues/js/data/verbos.js', 'noruegues/js/data/substantivos.js', 'noruegues/js/data/frases.js',
  'noruegues/js/data/numeros.js', 'noruegues/js/data/palavrinhas.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('fala-gringo-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* A response that came through a redirect (index.html → ./) is marked
   `redirected`, and the browser refuses such a response for a navigation. Copy
   the body into a plain response before serving or caching it. */
function clean(res) {
  if (!res || !res.redirected) return res;
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

/* The app shell that serves a URL offline: a navigation to anything under
   /ingles/ or /noruegues/ gets that subpage, everything else the root page —
   the hash router takes it from there. Paths are relative to this worker. */
function shellFor(url) {
  const root = new URL('./', location.href).pathname;
  const path = new URL(url).pathname;
  const rel = path.indexOf(root) === 0 ? path.slice(root.length) : path;
  if (rel.indexOf('ingles/') === 0) return 'ingles/';
  if (rel.indexOf('noruegues/') === 0) return 'noruegues/';
  return './';
}

self.addEventListener('fetch', e => {
  const req = e.request;
  // Same-origin GETs only: the sync worker and the analytics beacon go straight
  // to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(hit => {
        const refresh = fetch(req).then(raw => {
          const res = clean(raw);
          if (res && res.ok) return cache.put(req, res.clone()).then(() => res);
          return res;
        }).catch(() => hit);
        e.waitUntil(refresh.then(() => undefined));
        if (hit) return hit;
        // offline and not cached: a navigation still gets its app shell
        // instead of the browser's error page (respondWith(undefined) fails)
        return refresh.then(res => res || (req.mode === 'navigate' ? cache.match(shellFor(req.url)) : undefined));
      })
    )
  );
});
