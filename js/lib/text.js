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

/* ------------------------------------------------ forgiving matching ---- */

/* Optimal-string-alignment distance (Levenshtein + adjacent swap as one edit),
   capped: returns max+1 as soon as the answer cannot be within `max`. */
function editDistance(a, b, max) {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  let prev2 = null, prev = [];
  for (let j = 0; j <= lb; j++) prev[j] = j;
  for (let i = 1; i <= la; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= lb; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev; prev = cur;
  }
  return Math.min(prev[lb], max + 1);
}

/* Edits tolerated for a typed slip: none on short words (one letter IS the
   answer there: falo/fala), one from five characters, two on sentence-length. */
function nearLimit(len) { return len >= 12 ? 2 : len >= 5 ? 1 : 0; }

/* Brazilian-Portuguese sound key: collapses the spellings a pt-BR speech
   recognizer swaps around — ç/ss/z/ce/ci -> s, ch -> x, c/qu -> k, ge/gi -> j,
   silent h, the -am/-ão nasal, unstressed final e/o -> i/u, the carioca
   dropped final r, vocalised final l. Two strings with one key sound alike in
   Rio. Identity (just normalize) for a non-Portuguese app, e.g. /ingles/. */
function phoneticKey(str) {
  const s = normalize(String(str == null ? '' : str).toLowerCase().replace(/ç/g, 's'));
  if ((window.APP_LANG || 'pt-BR').slice(0, 2).toLowerCase() !== 'pt') return s;
  return s.split(' ').map(w => w
    .replace(/^h/, '')
    .replace(/ch/g, 'x')
    .replace(/sc(?=[ei])/g, 's').replace(/c(?=[ei])/g, 's').replace(/ss/g, 's').replace(/z/g, 's')
    .replace(/g(?=[ei])/g, 'j').replace(/gu(?=[ei])/g, 'g')
    .replace(/qu(?=[ei])/g, 'k').replace(/c(?=[aou])/g, 'k')
    .replace(/ao$/, 'am').replace(/an$/, 'am').replace(/ns$/, 'ms')
    .replace(/r$/, '').replace(/l$/, 'u')
    .replace(/e$/, 'i').replace(/o$/, 'u')     // not before a final s: fez/fiz, pôs/pus are distinct
  ).join(' ');
}

/* Grade an answer against a card: { grade: 'exact' | 'near', hit } or null.
     exact — normalize() equality with an accepted answer (unchanged behaviour)
     near  — within nearLimit() edits of one (typed), or the same/near sound key
             (spoken, where the recognizer is usually the one at fault, so it
             grades as 'exact')
   `rivals` are every other answer the learner could have meant — the other
   cards of the topic, minus anything this card accepts too. A rival at least
   as close as the best own match makes the answer ambiguous (fala for falo,
   era for eram) and it is NOT accepted: a one-letter difference is often the
   whole lesson in a conjugation drill. */
function matchAnswer(card, value, rivals, spoken) {
  const key = normalize(value);
  const own = card.accepted.map(a => ({ raw: a, key: normalize(a) }));
  const exact = own.find(a => a.key === key);
  if (exact) return { grade: 'exact', hit: exact.raw };
  if (!key) return null;
  const toKey = spoken ? phoneticKey : normalize;
  const k = toKey(value);
  const limit = nearLimit(k.length);      // spoken: a sound identity (0 edits) always counts
  let best = null, bestD = limit + 1;
  own.forEach(a => {
    if (!a.key) return;
    const d = editDistance(k, toKey(a.raw), limit);
    if (d < bestD) { bestD = d; best = a.raw; }
  });
  if (!best) return null;
  // the answer minus the words it shares with the match ("eu fala" ~ "eu falo"
  // -> "fala"): if THAT is exactly another form, the learner produced a real
  // form with the wrong ending, not a slip — rivals are stored with their own
  // pronoun ("você fala"), so the full-string distance alone would miss it
  const kw = k.split(' '), bw = toKey(best).split(' ');
  let shared = 0;
  while (shared < kw.length - 1 && shared < bw.length - 1 && kw[shared] === bw[shared]) shared++;
  const bare = shared ? kw.slice(shared).join(' ') : null;
  for (const r of (rivals || [])) {
    const rk = toKey(r);
    if (editDistance(k, rk, bestD) <= bestD) return null;
    if (bare !== null && rk === bare) return null;
  }
  return { grade: spoken ? 'exact' : 'near', hit: best, phonetic: !!spoken };
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
