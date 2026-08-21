// Brazilian-Portuguese text-to-speech via the Web Speech API.
// Carried over unchanged from the original single-file study tool — this is the
// capability the flashcards repo lacks, and it now backs every topic.

const SPEAKER_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
  '<path d="M15.5 8.5a5 5 0 0 1 0 7"></path>' +
  '<path d="M19 5a9 9 0 0 1 0 14"></path></svg>';

let ptVoice = null;

function loadVoices() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  const isPt = v => v.lang && v.lang.toLowerCase().startsWith('pt');
  ptVoice = voices.find(v => isPt(v) && /luciana/i.test(v.name))
         || voices.find(v => v.lang === 'pt-BR' && /google|natural|premium|enhanced/i.test(v.name))
         || voices.find(v => v.lang === 'pt-BR')
         || voices.find(isPt)
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
  utterance.lang = 'pt-BR';
  utterance.rate = 0.9;
  if (ptVoice) utterance.voice = ptVoice;

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
