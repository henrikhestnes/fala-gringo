/* Smoke-test steps for the /ingles/ subpage. Concatenated into the same eval
   as the stub, the config globals and the app sources (see smoke-ingles.jxa).
   The interesting assertions are the ones the main suite cannot make: the
   inverted direction boots, the APP_* overrides actually thread through the
   shared engine, and the two apps' progress stays apart. */

function goTo(hash) {
  window.location.hash = hash;
  (window._h.hashchange || []).forEach(function (fn) { fn(); });
}

function shownCard(topicId) {
  // unlike the main app, a prompt alone is not unique here — the same pt gloss
  // fronts both the passado and the particípio card — so match prompt + meta
  var m = registry.cardArea.innerHTML.match(/<div class="card-prompt">([\s\S]*?)<\/div>/);
  if (!m) throw new Error('no prompt rendered');
  var mm = registry.cardArea.innerHTML.match(/<div class="card-meta"><span>([\s\S]*?)<\/span>/);
  if (!mm) throw new Error('no meta rendered');
  var card = topicCards(topicById(topicId)).filter(function (c) {
    return c.prompt === m[1] && escapeHtml(c.meta) === mm[1];
  })[0];
  if (!card) throw new Error('could not identify shown card: ' + m[1] + ' / ' + mm[1]);
  return card;
}

step('with no browse tab, the app boots straight into the drill', function () {
  if (registry.view.dataset.topic !== 'irregulares')
    throw new Error('booted into "' + registry.view.dataset.topic + '"');
  if (!registry.answerInput) throw new Error('no answer input rendered');
  var tabs = (registry.tabs.innerHTML.match(/data-tab="/g) || []).length;
  if (tabs !== TOPICS.length) throw new Error('got ' + tabs + ' tabs');
  return 'default tab = irregulares, ' + tabs + ' tab(s)';
});

step('the chrome uses the Portuguese strings from APP_STRINGS', function () {
  if (!/cartas dominadas/.test(registry.view.innerHTML))
    throw new Error('masteredLine override missing from the chrome');
  if (!/>Certas</.test(registry.view.innerHTML))
    throw new Error('statKnown override missing from the stats row');
  return '"cartas dominadas" and "Certas" rendered';
});

step('a correct English answer is accepted and marks mastery', function () {
  var before = Store.masteredCount('irregulares');
  var card = shownCard('irregulares');
  registry.answerInput.value = card.answer.toUpperCase();   // case-insensitive too
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('rejected: ' + registry.feedback.innerHTML);
  if (Store.masteredCount('irregulares') !== before + 1)
    throw new Error('mastery not recorded');
  if (!/pron-tag/.test(registry.feedback.innerHTML))
    throw new Error('no pronunciation hint shown');
  return '"' + card.answer.toUpperCase() + '" accepted for "' + card.prompt + '"';
});

step('a miss reveals the answer with the Portuguese wording and an example', function () {
  registry.actionBtn.fire('click');                          // advance past the hit
  registry.answerInput.value = 'zzz-errado';
  registry.actionBtn.fire('click');
  if (!/A resposta é/.test(registry.feedback.innerHTML))
    throw new Error('answerIs override missing: ' + registry.feedback.innerHTML);
  if (!/class="example"/.test(registry.revealArea.innerHTML))
    throw new Error('no example sentence revealed');
  return 'reveal says "A resposta é …" with an example sentence';
});

step('an accepted alternative (got for gotten) passes', function () {
  var card = topicCards(topicById('irregulares')).filter(function (c) {
    return c.id === 'get|part';
  })[0];
  if (!card) throw new Error('get|part card missing');
  if (!isCorrectForSmoke(card, 'got')) throw new Error('"got" rejected for "gotten"');
  if (isCorrectForSmoke(card, 'getted')) throw new Error('"getted" wrongly accepted');
  return '"got" accepted, "getted" rejected, canonical stays "gotten"';
});
function isCorrectForSmoke(card, value) {
  return card.accepted.some(function (a) { return normalize(a) === normalize(value); });
}

step('the phrasal tab drills with theme chips and a tip reveal', function () {
  goTo('#phrasal');
  var total = parseInt(registry.statTotal.textContent, 10);
  var all = topicCards(topicById('phrasal')).length;
  // Foco caps a fresh topic at the daily intake; the rest wait behind the chip
  var cap = Math.min(all, Store.newPerDay());
  if (total !== cap) throw new Error('deck has ' + total + ' of ' + all + ' phrasal cards, expected the ' + cap + ' daily intake');
  if (!/· 20 novas/.test(registry.view.innerHTML)) throw new Error('Foco chip does not read "20 novas"');
  var chips = (registry.view.innerHTML.match(/data-group="/g) || []).length;
  if (chips !== window.DATA_EN_PHRASAL.groups.length)
    throw new Error('got ' + chips + ' theme chips');
  var card = shownCard('phrasal');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('rejected "' + card.answer + '": ' + registry.feedback.innerHTML);
  return all + ' cards, ' + chips + ' chips; "' + card.answer + '" accepted for "' + card.prompt + '"';
});

step('Modo Raiz hides the English hint; Modo Nutella shows the base verb', function () {
  goTo('#irregulares');
  if (/card-hint/.test(registry.cardArea.innerHTML)) throw new Error('hint leaked in Modo Raiz');
  registry.modeBtn.fire('click');
  var m = registry.cardArea.innerHTML.match(/card-hint">([^<]*)</);
  if (!m) throw new Error('no hint in Modo Nutella');
  var card = shownCard('irregulares');
  if (m[1] !== escapeHtml(card.hint)) throw new Error('hint is "' + m[1] + '"');
  registry.modeBtn.fire('click');                            // back to the default
  return 'hint "' + m[1] + '" only in Modo Nutella';
});

step('the mic listens in en-US and skips the Portuguese digit expansion', function () {
  Quiz.toggleMic();
  if (!window._activeRec) throw new Error('mic did not start listening');
  if (window._activeRec.lang !== 'en-US')
    throw new Error('recognizer lang is "' + window._activeRec.lang + '"');
  var fake = { accepted: ['twenty'], allowEmpty: false };
  if (micAnswer(fake, ['20']) !== null)
    throw new Error('digit expansion ran despite en-US');
  if (micAnswer(fake, ['Twenty!']) !== 'twenty')
    throw new Error('normalized spoken match failed');
  Quiz.toggleMic();
  return 'lang=en-US; "20" no longer expands to "vinte"';
});

step('progress lives under its own storage key, apart from the main app', function () {
  if (STORE_KEY !== 'fg-ingles:v1') throw new Error('STORE_KEY is "' + STORE_KEY + '"');
  if (window.localStorage.getItem('fg-ingles:v1') === null)
    throw new Error('nothing written under fg-ingles:v1');
  if (window.localStorage.getItem('pvs:v1') !== null)
    throw new Error('the subpage wrote into the main app\'s pvs:v1 blob');
  return 'writes go to fg-ingles:v1; pvs:v1 untouched';
});

step('sync loads inert, survives its own init saves, speaks Portuguese, and targets its own prefixed key', function () {
  if (typeof Sync === 'undefined') throw new Error('Sync not defined');
  // regression (v1.10.1): the init-time nudge save used to throw on `Sync` in its TDZ
  if (Store.getPref('syncNudge', 0) !== 1)
    throw new Error('nudge counter not recorded: ' + Store.getPref('syncNudge', 0));
  Sync.onLocalChange();                  // no code -> schedules nothing
  if (registry.syncBtn.className !== 'icon-btn sync-off')
    throw new Error('button class is "' + registry.syncBtn.className + '"');
  var title = registry.syncBtn.getAttribute('title') || '';
  if (!/toque para conectar/.test(title)) throw new Error('tooltip not localized: "' + title + '"');
  // the endpoint must carry the app namespace so a code shared with the main
  // app can never merge the two apps' progress on the server
  // the code is the one shared with the main app (same fg:syncCode key) — only the
  // wire prefix differs, so one code links both apps without merging their blobs
  Sync._setCode('abcdefghijklmnop');
  var ep = Sync._endpoint();
  if (!/\/inglesabcdefghijklmnop$/.test(ep)) throw new Error('endpoint is "' + ep + '"');
  if (localStorage.getItem('fg:syncCode') !== 'abcdefghijklmnop') throw new Error('shared key not written');
  if (Store.getPref('syncCode', '')) throw new Error('code leaked into the per-app pref');
  Sync._setCode('');
  if (localStorage.getItem('fg:syncCode') !== null) throw new Error('off did not clear the shared key');
  return 'init saves survived (nudge=1); off-state tooltip in PT; shared fg:syncCode; endpoint …' + ep.slice(ep.lastIndexOf("/"));
});
