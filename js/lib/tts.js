// Text-to-speech via the Web Speech API. Speaks pt-BR by default; a page can
// set window.APP_LANG before loading this file to speak another language
// (the /ingles/ subpage sets 'en-US'). Carried over from the original
// single-file study tool — this is the capability the flashcards repo lacks,
// and it now backs every topic.

const SPEAKER_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
  '<path d="M15.5 8.5a5 5 0 0 1 0 7"></path>' +
  '<path d="M19 5a9 9 0 0 1 0 14"></path></svg>';

const TTS_LANG = window.APP_LANG || 'pt-BR';
// the best plain-system voice per language family (Luciana is Apple's pt-BR)
const TTS_FAVOURITE = { pt: /luciana/i, en: /samantha/i, nb: /nora/i };

/* The wording of the missing-voice notice: overridable through
   window.APP_STRINGS.voiceMissing (the subpages say it in Portuguese, naming
   their own language); the default names the language in words, never as a
   locale code. */
const TTS_STR = Object.assign({
  voiceMissing: 'No Brazilian Portuguese voice is installed on this device, so the cards ' +
                'stay silent — a European Portuguese voice would teach the wrong sounds. ' +
                'Add a Brazilian voice in your system settings to hear them.'
}, window.APP_STRINGS || {});

let ttsVoice = null;
let ttsVoiceCount = 0;       // how many voices getVoices() listed on the last look
let ttsWarned = false;       // the missing-voice notice is given once a session, not per card

/* A voice's locale, lower-cased, with the Norwegian aliases folded onto bokmål
   (Windows and some Android builds tag Nora as `no` / `no-NO`). */
function voiceLocale(v) {
  let l = String(v.lang || '').toLowerCase().replace('_', '-');
  if (l === 'no' || l === 'no-no') l = 'nb-no';
  return l;
}

/* Voices this app may speak with. Portuguese is strict: only pt-BR (a pt-BR-x-…
   variant included) — never pt-PT and never a bare `pt`, whose accent is
   anyone's guess; this tool must not model European Portuguese. English and
   Norwegian accept the same-family fallback (en-GB is fine for an English
   learner; nn-NO is not bokmål but beats silence). */
function acceptableVoices(voices) {
  const family = TTS_LANG.slice(0, 2).toLowerCase();
  const locale = TTS_LANG.toLowerCase().replace('_', '-');
  return voices.filter(v => {
    const l = voiceLocale(v);
    if (!l) return false;
    if (family === 'pt') return l === 'pt-br' || l.indexOf('pt-br-') === 0;
    return l === locale || l.slice(0, 2) === family;
  });
}

function loadVoices() {
  const voices = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
  ttsVoiceCount = voices.length;
  const locale = TTS_LANG.toLowerCase().replace('_', '-');
  const ok = acceptableVoices(voices);
  const inLocale = v => voiceLocale(v) === locale || voiceLocale(v).indexOf(locale + '-') === 0;
  const favourite = TTS_FAVOURITE[TTS_LANG.slice(0, 2).toLowerCase()];
  ttsVoice = (favourite ? ok.find(v => inLocale(v) && favourite.test(v.name)) : null)
          || ok.find(v => inLocale(v) && /google|natural|premium|enhanced/i.test(v.name))
          || ok.find(v => inLocale(v))
          || ok[0]
          || null;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function voiceWarning(show) {
  const el = document.getElementById('voiceWarning');
  if (!el) return;
  if (!show) { el.hidden = true; return; }
  el.textContent = TTS_STR.voiceMissing;
  el.hidden = false;
  if (!ttsWarned && typeof showToast === 'function') showToast(TTS_STR.voiceMissing);
  ttsWarned = true;
}

function speak(text, btn, onDone) {
  if (!window.speechSynthesis || !text) { if (onDone) onDone(); return; }
  loadVoices();
  // An EMPTY voice list (Chrome before voiceschanged, iOS home-screen apps) is
  // not a missing voice: speak with the language set and let the engine pick.
  // Only a populated list with no acceptable voice in it is.
  if (!ttsVoice && ttsVoiceCount > 0) {
    voiceWarning(true);
    if (onDone) onDone();
    return;
  }
  voiceWarning(false);
  speechSynthesis.cancel();
  document.querySelectorAll('.speak-btn.playing').forEach(b => b.classList.remove('playing'));

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = TTS_LANG;
  utterance.rate = 0.9;
  if (ttsVoice) utterance.voice = ttsVoice;

  // onDone (mic mode's auto-advance) fires exactly once, whether the utterance
  // finishes or is cancelled by a later speak()
  const done = () => {
    if (btn) btn.classList.remove('playing');
    if (onDone) { const cb = onDone; onDone = null; cb(); }
  };
  if (btn) btn.classList.add('playing');
  utterance.onend = done;
  utterance.onerror = done;

  speechSynthesis.speak(utterance);
}

/* Markup for an inline speaker button. Clicks are handled by one delegated
   listener in app.js, so this works inside innerHTML-rendered cards. */
function speakButton(text, label) {
  return '<button type="button" class="speak-btn" data-speak="' + escapeHtml(text) + '"' +
         ' aria-label="' + escapeHtml('Ouvir ' + (label || text)) + '"' +
         ' title="' + escapeHtml('Ouvir "' + text + '"') + '">' + SPEAKER_SVG + '</button>';
}
