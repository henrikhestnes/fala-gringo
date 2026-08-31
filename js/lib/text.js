// Text helpers shared by every topic.

/* Case-, accent- and punctuation-insensitive comparison key.
   Punctuation stripping matters for the sentences topic, where answers are full
   sentences; it is harmless everywhere else. */
function normalize(str) {
  return String(str == null ? '' : str)
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[?!.,;:¿¡"']+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Uniform Fisher-Yates. (The source repo used sort(() => Math.random() - 0.5),
   which is biased.) */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* `**word**` -> <em>word</em>, on already-escaped text. */
function emphasize(escaped) {
  return escaped.replace(/\*\*(.+?)\*\*/g, '<em>$1</em>');
}

/* '{name}' placeholders -> values; used by the UI-string tables so a page can
   override the engine's wording (window.APP_STRINGS) in another language. */
function tfill(str, map) {
  return String(str).replace(/\{(\w+)\}/g, (m, k) =>
    Object.prototype.hasOwnProperty.call(map, k) ? map[k] : m);
}

function formatCount(n, singular, plural) {
  return n + ' ' + (n === 1 ? singular : (plural || singular + 's'));
}

/* The app's voice: rotating carioca exclamations for hits and misses.
   Plain strings, safe to inline into feedback HTML without escaping. */
const PRAISE_WORDS = ['Boa, gringo!', 'Aí sim!', 'Mandou bem!', 'É isso aí!', 'Tá virando carioca!', 'Show de bola!'];
const MISS_WORDS = ['Quase!', 'Não foi dessa vez…', 'Relaxa, acontece.', 'Eita…'];
function praiseWord() { return PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)]; }
function missWord() { return MISS_WORDS[Math.floor(Math.random() * MISS_WORDS.length)]; }

/* mulberry32 — deterministic PRNG for the daily challenge. */
function seededRandom(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
