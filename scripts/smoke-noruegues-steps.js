/* Smoke-test steps for the /noruegues/ subpage. Concatenated into the same eval
   as the stub, the config globals and the app sources (see smoke-noruegues.jxa).
   The assertions the other suites cannot make: the Norwegian direction boots,
   the APP_* overrides thread through the shared engine, å/ø/æ survive answer
   matching (så ≠ sa), the gender alternatives (ei/en) pass, the mic listens
   in nb-NO with the page's own digit table, and progress stays apart from the
   other two apps. */

function goTo(hash) {
  window.location.hash = hash;
  (window._h.hashchange || []).forEach(function (fn) { fn(); });
}

function shownCard(topicId) {
  // the same pt gloss fronts both tenses of a verb (and both forms of a noun),
  // so match prompt + meta
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

function cardById(topicId, id) {
  var card = topicCards(topicById(topicId)).filter(function (c) { return c.id === id; })[0];
  if (!card) throw new Error(topicId + '/' + id + ' card missing');
  return card;
}

function rivalsOf(topicId, card) {
  var own = {}; card.accepted.forEach(function (a) { own[normalize(a)] = 1; });
  return topicCards(topicById(topicId)).filter(function (c) { return c !== card; }).reduce(function (acc, c) {
    return acc.concat(c.accepted.filter(function (a) { return !own[normalize(a)]; }));
  }, []);
}

step('with no browse tab, the app boots straight into the verbs drill', function () {
  if (registry.view.dataset.topic !== 'verbos')
    throw new Error('booted into "' + registry.view.dataset.topic + '"');
  if (!registry.answerInput) throw new Error('no answer input rendered');
  var tabs = (registry.tabs.innerHTML.match(/data-tab="/g) || []).length;
  if (tabs !== TOPICS.length) throw new Error('got ' + tabs + ' tabs');
  return 'default tab = verbos, ' + tabs + ' tabs';
});

step('the chrome uses the Portuguese strings from APP_STRINGS', function () {
  if (!/cartas dominadas/.test(registry.view.innerHTML))
    throw new Error('masteredLine override missing from the chrome');
  if (!/>Certas</.test(registry.view.innerHTML))
    throw new Error('statKnown override missing from the stats row');
  return '"cartas dominadas" and "Certas" rendered';
});

step('a correct Norwegian answer is accepted and marks mastery', function () {
  var before = Store.masteredCount('verbos');
  var card = shownCard('verbos');
  registry.answerInput.value = card.answer.toUpperCase();   // case-insensitive too
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('rejected: ' + registry.feedback.innerHTML);
  if (Store.masteredCount('verbos') !== before + 1)
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

step('å is a letter, not an accented a: så (saw) is not sa (said)', function () {
  var saw = cardById('verbos', 'se|past');       // så
  var said = cardById('verbos', 'si|past');      // sa
  if (normalize('så') === normalize('sa')) throw new Error('normalize() folds å into a');
  if (matchAnswer(saw, 'sa', rivalsOf('verbos', saw), false))
    throw new Error('"sa" accepted for så');
  if (matchAnswer(said, 'så', rivalsOf('verbos', said), false))
    throw new Error('"så" accepted for sa');
  if (!matchAnswer(saw, 'SÅ', rivalsOf('verbos', saw), false))
    throw new Error('"SÅ" rejected for så');
  // ø and æ never decomposed, so they were always safe — pin it anyway
  if (normalize('kjøpte') === normalize('kjopte')) throw new Error('ø folded into o');
  if (normalize('lærte') === normalize('larte')) throw new Error('æ folded into a');
  // Portuguese accents are still forgiven by the very same function (the root app relies on it)
  if (normalize('está') !== normalize('esta')) throw new Error('Portuguese accent no longer forgiven');
  return 'så ≠ sa, kjøpte ≠ kjopte, lærte ≠ larte; está = esta still';
});

step('bokmål alternatives pass: snakka for snakket, ei/en jente, jenta/jenten, syv for sju', function () {
  var past = cardById('verbos', 'snakke|past');
  if (!matchAnswer(past, 'snakka', rivalsOf('verbos', past), false)) throw new Error('"snakka" rejected');
  if (past.answer !== 'snakket') throw new Error('canonical past is "' + past.answer + '"');
  var indef = cardById('substantivos', 'jente|indef');
  if (indef.answer !== 'ei jente') throw new Error('canonical indefinite is "' + indef.answer + '"');
  if (!matchAnswer(indef, 'en jente', rivalsOf('substantivos', indef), false)) throw new Error('"en jente" rejected');
  // one edit away and no rival card carries it — only the card's `exact` flag refuses it
  if (matchAnswer(indef, 'et jente', rivalsOf('substantivos', indef), false)) throw new Error('"et jente" accepted');
  var def = cardById('substantivos', 'jente|def');
  if (def.answer !== 'jenta') throw new Error('canonical definite is "' + def.answer + '"');
  if (!matchAnswer(def, 'jenten', rivalsOf('substantivos', def), false)) throw new Error('"jenten" rejected');
  var hus = cardById('substantivos', 'hus|def');
  if (hus.answer !== 'huset') throw new Error('neuter definite is "' + hus.answer + '"');
  if (matchAnswer(hus, 'husen', rivalsOf('substantivos', hus), false)) throw new Error('"husen" accepted for huset');
  if (matchAnswer(hus, 'husen', rivalsOf('substantivos', hus), true)) throw new Error('spoken "husen" accepted for huset');
  var rom = cardById('substantivos', 'rom|def');
  if (rom.answer !== 'rommet') throw new Error('def override lost: "' + rom.answer + '"');
  var sju = cardById('numeros', 'sju');
  if (!matchAnswer(sju, 'syv', rivalsOf('numeros', sju), false)) throw new Error('"syv" rejected');
  return 'all alternatives accepted, canonicals unchanged; et jente / husen refused (exact cards)';
});

step('typed slips are tolerated, but not into another answer; sound key is identity', function () {
  var card = cardById('verbos', 'snakke|pres');   // snakker
  var m = matchAnswer(card, 'snaker', rivalsOf('verbos', card), false);
  if (!m || m.grade !== 'near' || m.hit !== 'snakker') throw new Error('"snaker": ' + JSON.stringify(m));
  if (phoneticKey('snakker') !== 'snakker') throw new Error('pt-BR sound rules leaked into nb-NO: ' + phoneticKey('snakker'));
  // sitter (sits) vs sitter typed as "siter" is a slip; "satt" for "sett"? — pick a real rival pair:
  // "femten" (15) vs "femti" (50): two edits apart, both answers, so neither may drift into the other
  var femten = cardById('numeros', 'femten');
  if (matchAnswer(femten, 'femti', rivalsOf('numeros', femten), false)) throw new Error('"femti" accepted for femten');
  return '"snaker" ≈ snakker; femti refused for femten; sound key is identity in nb-NO';
});

step('the phrases tab drills with theme chips and accepts an alternative phrase', function () {
  goTo('#frases');
  var chips = (registry.view.innerHTML.match(/data-group="/g) || []).length;
  if (chips !== window.DATA_NO_FRASES.groups.length) throw new Error('got ' + chips + ' theme chips');
  var card = shownCard('frases');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('rejected "' + card.answer + '": ' + registry.feedback.innerHTML);
  var takk = cardById('frases', 'Tusen takk');
  if (!matchAnswer(takk, 'Takk skal du ha!', rivalsOf('frases', takk), false)) throw new Error('"Takk skal du ha!" rejected');
  return chips + ' chips; "' + card.answer + '" accepted for "' + card.prompt + '"; "Takk skal du ha!" ≡ Tusen takk';
});

step('Modo Raiz hides the hint; Modo Nutella shows the infinitive', function () {
  goTo('#verbos');
  if (/card-hint/.test(registry.cardArea.innerHTML)) throw new Error('hint leaked in Modo Raiz');
  registry.modeBtn.fire('click');
  var m = registry.cardArea.innerHTML.match(/card-hint">([^<]*)</);
  if (!m) throw new Error('no hint in Modo Nutella');
  var card = shownCard('verbos');
  if (m[1] !== escapeHtml(card.hint)) throw new Error('hint is "' + m[1] + '"');
  if (!/^å /.test(card.hint)) throw new Error('hint is not an infinitive: ' + card.hint);
  registry.modeBtn.fire('click');                            // back to the default
  return 'hint "' + m[1] + '" only in Modo Nutella';
});

step('the mic listens in nb-NO and uses the page\'s own digit table', function () {
  Quiz.toggleMic();
  if (!window._activeRec) throw new Error('mic did not start listening');
  if (window._activeRec.lang !== 'nb-NO')
    throw new Error('recognizer lang is "' + window._activeRec.lang + '"');
  var sju = { accepted: ['sju', 'syv'], allowEmpty: false };
  if (micAnswer(sju, ['7']) !== 'sju') throw new Error('"7" did not expand to sju');
  var vinte = { accepted: ['vinte'], allowEmpty: false };
  if (micAnswer(vinte, ['20']) !== null) throw new Error('Portuguese digit expansion ran despite nb-NO');
  if (micAnswer(sju, ['Sju!']) !== 'sju') throw new Error('normalized spoken match failed');
  Quiz.toggleMic();
  return 'lang=nb-NO; "7" → sju via APP_SPOKEN_DIGITS; "20" no longer → vinte';
});

step('progress lives under its own storage key, apart from the other apps', function () {
  if (STORE_KEY !== 'fg-noruegues:v1') throw new Error('STORE_KEY is "' + STORE_KEY + '"');
  if (window.localStorage.getItem('fg-noruegues:v1') === null)
    throw new Error('nothing written under fg-noruegues:v1');
  if (window.localStorage.getItem('pvs:v1') !== null)
    throw new Error('the subpage wrote into the main app\'s pvs:v1 blob');
  if (window.localStorage.getItem('fg-ingles:v1') !== null)
    throw new Error('the subpage wrote into /ingles/\'s blob');
  return 'writes go to fg-noruegues:v1; pvs:v1 and fg-ingles:v1 untouched';
});

step('sync loads inert, speaks Portuguese, and targets its own prefixed key', function () {
  if (typeof Sync === 'undefined') throw new Error('Sync not defined');
  if (Store.getPref('syncNudge', 0) !== 1)
    throw new Error('nudge counter not recorded: ' + Store.getPref('syncNudge', 0));
  Sync.onLocalChange();                  // no code -> schedules nothing
  if (registry.syncBtn.className !== 'icon-btn sync-off')
    throw new Error('button class is "' + registry.syncBtn.className + '"');
  var title = registry.syncBtn.getAttribute('title') || '';
  if (!/toque para conectar/.test(title)) throw new Error('tooltip not localized: "' + title + '"');
  Sync._setCode('abcdefghijklmnop');
  var ep = Sync._endpoint();
  if (!/\/norueguesabcdefghijklmnop$/.test(ep)) throw new Error('endpoint is "' + ep + '"');
  if (localStorage.getItem('fg:syncCode') !== 'abcdefghijklmnop') throw new Error('shared key not written');
  Sync._setCode('');
  if (localStorage.getItem('fg:syncCode') !== null) throw new Error('off did not clear the shared key');
  return 'off-state tooltip in PT; shared fg:syncCode; endpoint …' + ep.slice(ep.lastIndexOf("/"));
});
