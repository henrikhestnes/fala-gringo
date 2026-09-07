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

let ttsVoice = null;

function loadVoices() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  const family = TTS_LANG.slice(0, 2).toLowerCase();
  const inFamily = v => v.lang && v.lang.toLowerCase().startsWith(family);
  const favourite = TTS_FAVOURITE[family];
  ttsVoice = (favourite ? voices.find(v => inFamily(v) && favourite.test(v.name)) : null)
          || voices.find(v => v.lang === TTS_LANG && /google|natural|premium|enhanced/i.test(v.name))
          || voices.find(v => v.lang === TTS_LANG)
          || voices.find(inFamily)
          || null;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text, btn, onDone) {
  if (!window.speechSynthesis || !text) { if (onDone) onDone(); return; }
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
