// Offline support. The cache is keyed to APP_VERSION (js/version.js), so the
// usual version bump on every user-visible change also ships fresh assets:
// the browser re-checks importScripts on navigation, a changed version makes
// this worker "new", and activate drops the old cache. Runtime strategy is
// stale-while-revalidate — instant loads from cache, silently refreshed in the
// background, so an update is at most one reload behind.
importScripts('js/version.js');

const CACHE = 'fala-gringo-' + APP_VERSION;

const CORE = [
  './', 'index.html', 'css/app.css', 'manifest.json',
  'js/lib/text.js', 'js/lib/tts.js', 'js/lib/stt.js', 'js/lib/fx.js',
  'js/progress.js', 'js/conjugate.js',
  'js/data/verbs.js', 'js/data/pronominal.js', 'js/data/nouns.js',
  'js/data/adjectives.js', 'js/data/adverbs.js', 'js/data/connecting.js',
  'js/data/numbers.js', 'js/data/glossary.js', 'js/data/sentences.js',
  'js/topics.js', 'js/infer.js', 'js/quiz.js', 'js/browse.js', 'js/daily.js',
  'js/app.js', 'js/lib/sync.js', 'js/version.js',
  // the /ingles/ subpage (English for Brazilians) shares the engine above and
  // registers this same root worker, so its own files ride in the same cache
  'ingles/', 'ingles/index.html', 'ingles/js/topics.js',
  'ingles/js/data/irregulares.js', 'ingles/js/data/phrasal.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Same-origin GETs only: the sync worker and the analytics beacon go straight
  // to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(hit => {
        const refresh = fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || refresh;
      })
    )
  );
});
