// Speech recognition via the Web Speech API — the mirror of tts.js, and like
// it listening in pt-BR unless the page sets window.APP_LANG first.
// Backs mic mode (the 🎤 chip in quiz.js): the learner speaks the
// answer instead of typing it. Chrome/Edge (webkitSpeechRecognition; the audio
// goes to Google's servers, so it needs a network) and Safari 14.1+ support it;
// where the API is missing the chip never renders and the app behaves exactly
// as before. The microphone itself also needs a secure context (https or
// localhost) — opened from file:// the first listen fails with a visible
// message rather than breaking anything.

const Stt = (function () {
  const Ctor = (typeof window !== 'undefined' &&
                (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
  let rec = null;

  /* One-shot listen. Exactly one of onResult / onError fires per call (Chrome
     sometimes ends silently instead of raising no-speech; onend covers that). */
  function listen(handlers) {
    abort();
    if (!Ctor) { handlers.onError('unsupported'); return; }
    rec = new Ctor();
    rec.lang = window.APP_LANG || 'pt-BR';
    rec.interimResults = true;   // live transcript into the answer box
    rec.maxAlternatives = 5;     // grade every hypothesis, not just the top one
    rec.continuous = false;
    let settled = false;

    rec.onresult = e => {
      const res = e.results[e.results.length - 1];
      if (!res.isFinal) {
        if (handlers.onInterim) handlers.onInterim(res[0].transcript);
        return;
      }
      settled = true;
      const alts = [];
      for (let i = 0; i < res.length; i++) alts.push(res[i].transcript);
      handlers.onResult(alts);
    };
    rec.onerror = e => {
      if (settled) return;
      settled = true;
      handlers.onError((e && e.error) || 'error');
    };
    rec.onend = () => {
      if (settled) return;
      settled = true;
      handlers.onError('no-speech');
    };

    try { rec.start(); }
    catch (err) {
      if (!settled) { settled = true; handlers.onError('start-failed'); }
    }
  }

  function abort() {
    if (!rec) return;
    const r = rec;
    rec = null;
    r.onresult = r.onerror = r.onend = null;   // stale callbacks must not fire
    try { r.abort(); } catch (e) { /* already stopped */ }
  }

  return {
    supported: () => !!Ctor,
    listen: listen,
    abort: abort
  };
})();

/* ---------------------------------------------- spoken-answer matching ----
   Recognizers write numbers as digits ("20", "3º") while the cards store the
   words ("vinte", "terceiro"), so digit tokens are expanded before comparing. */

const PT_UNITS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete',
                  'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze',
                  'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const PT_TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta',
                 'setenta', 'oitenta', 'noventa'];
const PT_HUNDREDS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
                     'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
const PT_ORDINALS = ['', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto',
                     'sexto', 'sétimo', 'oitavo', 'nono', 'décimo'];

function ptCardinal(n) {
  if (n === 100) return 'cem';
  if (n === 1000) return 'mil';
  if (n < 0 || n > 999) return null;
  const h = Math.floor(n / 100), r = n % 100;
  const parts = [];
  if (h) parts.push(PT_HUNDREDS[h]);
  if (r < 20) { if (r || !h) parts.push(PT_UNITS[r]); }
  else {
    const t = Math.floor(r / 10), u = r % 10;
    parts.push(u ? PT_TENS[t] + ' e ' + PT_UNITS[u] : PT_TENS[t]);
  }
  return parts.join(' e ');
}

/* "25" -> "vinte e cinco", "3º"/"3ª" -> "terceiro"/"terceira"; anything the
   tables don't cover is left alone. */
function expandSpokenDigits(text) {
  return String(text).replace(/(\d+)\s*([ºª°]?)/g, (m, num, marker) => {
    const n = parseInt(num, 10);
    if (marker && marker !== '°' && n >= 1 && n <= 10) {
      const w = PT_ORDINALS[n];
      return marker === 'ª' ? w.replace(/o$/, 'a') : w;
    }
    const w = ptCardinal(n);
    return w === null ? m : w;
  });
}

/* The string to submit for a recognition result, or null when no hypothesis is
   correct: the matching accepted spelling if any alternative (raw or with its
   digits expanded) hits, and '' for a spoken "nada" on a card whose right
   answer is nothing (the connecting topic's empty gaps). The digit expansion
   is Portuguese-specific, so it only runs when the app listens in Portuguese;
   another language's page can supply its own as window.APP_SPOKEN_DIGITS
   (text -> text; /noruegues/ does, for its numbers tab). */
function micAnswer(card, alternatives, rivals) {
  const isPt = (window.APP_LANG || 'pt-BR').slice(0, 2).toLowerCase() === 'pt';
  const expand = isPt ? expandSpokenDigits
               : (typeof window.APP_SPOKEN_DIGITS === 'function' ? window.APP_SPOKEN_DIGITS : null);
  const cands = [];
  alternatives.forEach(alt => (expand ? [alt, expand(alt)] : [alt]).forEach(c => cands.push(c)));
  // an exact hit in ANY hypothesis beats a sound-alike in the top one
  for (const cand of cands) {
    const key = normalize(cand);
    const hit = card.accepted.find(a => normalize(a) === key);
    if (hit !== undefined) return hit;
  }
  // then by sound (text.js phoneticKey), guarded against the card's rivals so a
  // form that merely sounds like a DIFFERENT form of the conjugation stays a miss
  for (const cand of cands) {
    const m = matchAnswer(card, cand, rivals, true);
    if (m) return m.hit;
  }
  if (card.allowEmpty && alternatives.some(alt => normalize(alt) === 'nada')) return '';
  return null;
}
