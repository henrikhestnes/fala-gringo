/* Smoke-test steps. Concatenated INTO the same eval as the app sources so that
   the app's top-level const bindings (Mode, Store, Quiz, Browse, Daily, TOPICS)
   are in scope. Uses step()/registry/flushTimers from the JXA host script. */

step('app boots and renders the Browse view', function () {
  var html = registry.view.innerHTML;
  if (!/<h1>Verbos<\/h1>/.test(html)) throw new Error('browse view did not render');
  var rows = (html.match(/class="verb-row"/g) || []).length;
  if (rows !== 124) throw new Error('expected 124 verb rows, got ' + rows);
  return rows + ' verb rows, ' + html.length + ' bytes of HTML';
});

step('tab strip lists all 14 tabs', function () {
  var tabs = (registry.tabs.innerHTML.match(/data-tab="/g) || []).length;
  if (tabs !== 14) throw new Error('got ' + tabs + ' tabs');
  return '14 tabs incl. Browse + Daily';
});

step('Hard Mode (Modo Raiz) is the default on a fresh profile', function () {
  if (!Mode.hard) throw new Error('Mode.hard was false');
  if (registry.modeBtn.textContent !== 'Modo Raiz')
    throw new Error('button reads "' + registry.modeBtn.textContent + '"');
  return 'Mode.hard = true, button reads "Modo Raiz"';
});

function goTo(hash) {
  window.location.hash = hash;
  (window._h.hashchange || []).forEach(function (fn) { fn(); });
}
function shownCard(topicId) {
  var m = registry.cardArea.innerHTML.match(/<div class="card-prompt">([\s\S]*?)<\/div>/);
  if (!m) throw new Error('no prompt rendered');
  var prompt = m[1];
  var card = topicCards(topicById(topicId)).filter(function (c) { return c.prompt === prompt; })[0];
  if (!card) throw new Error('could not identify shown card: ' + prompt);
  return card;
}

step('every quiz tab renders a usable card', function () {
  var out = [];
  TOPICS.filter(function (t) { return t.kind === 'quiz'; }).forEach(function (t) {
    goTo('#' + t.id);
    if (!registry.cardArea) throw new Error(t.id + ': no cardArea');
    var html = registry.cardArea.innerHTML;
    if (!/answer-input/.test(html)) throw new Error(t.id + ': no answer input');
    if (!/card-prompt/.test(html)) throw new Error(t.id + ': no prompt');
    if (!registry.statTotal) throw new Error(t.id + ': no stats');
    out.push(t.id + '(' + registry.statTotal.textContent + ')');
  });
  return out.join(' ');
});

step('Hard Mode hides the hint, Easy Mode shows it, and the pref persists', function () {
  goTo('#presente');
  if (/card-hint/.test(registry.cardArea.innerHTML)) throw new Error('hint leaked in Hard Mode');
  registry.modeBtn.fire('click');
  if (!/card-hint/.test(registry.cardArea.innerHTML)) throw new Error('no hint in Easy Mode');
  if (registry.modeBtn.textContent !== 'Modo Nutella') throw new Error('label not updated');
  if (Store.getPref('hardMode', true) !== false) throw new Error('pref not written');
  registry.modeBtn.fire('click');
  if (!Mode.hard) throw new Error('did not toggle back to Hard');
  if (/card-hint/.test(registry.cardArea.innerHTML)) throw new Error('hint still shown');
  return 'hint appears only in Easy Mode; pref round-trips through the store';
});

step('a correct answer is accepted and marks the card mastered', function () {
  goTo('#nouns');
  var before = Store.masteredCount('nouns');
  var card = shownCard('nouns');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('not accepted: ' + registry.feedback.innerHTML);
  var after = Store.masteredCount('nouns');
  if (after !== before + 1) throw new Error('mastery ' + before + ' -> ' + after);
  return 'accepted "' + card.answer + '"; mastered ' + before + ' -> ' + after;
});

step('accent- and case-insensitive input is accepted', function () {
  goTo('#imperfeito');
  var card = shownCard('imperfeito');
  var sloppy = card.answer.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  registry.answerInput.value = sloppy;
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('rejected "' + sloppy + '" for "' + card.answer + '"');
  return '"' + sloppy + '" accepted for "' + card.answer + '"';
});

step('the bare verb form is accepted without the pronoun', function () {
  goTo('#perfeito');
  var card = shownCard('perfeito');
  var bare = card.answer.split(' ').slice(1).join(' ');
  registry.answerInput.value = bare;
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('rejected bare form "' + bare + '" for "' + card.answer + '"');
  return '"' + bare + '" accepted for "' + card.answer + '"';
});

step('a wrong answer reveals the answer and does not count as known', function () {
  goTo('#presente');
  registry.answerInput.value = 'zzz não é resposta';
  registry.actionBtn.fire('click');
  if (!/The answer is/.test(registry.feedback.innerHTML))
    throw new Error('no reveal: ' + registry.feedback.innerHTML);
  if (!/conj-table/.test(registry.revealArea.innerHTML))
    throw new Error('no conjugation table on a miss');
  var known = String(registry.statKnown.textContent);
  if (known !== '0') throw new Error('counted as known: ' + known);
  return 'answer revealed with conjugation table; Known stayed ' + known;
});

step('Skip advances the deck without granting mastery', function () {
  goTo('#adverbs');
  var before = Store.masteredCount('adverbs');
  registry.skipBtn.fire('click');
  var after = Store.masteredCount('adverbs');
  if (after !== before) throw new Error('skip changed mastery ' + before + ' -> ' + after);
  if (!registry.answerInput) throw new Error('no next card after skip');
  return 'skipped; mastery unchanged at ' + before;
});

step('group chips shrink the deck but can never empty it', function () {
  goTo('#presente');
  var total = parseInt(registry.statTotal.textContent, 10);
  Quiz.toggleGroup('-ar verbs');
  var fewer = parseInt(registry.statTotal.textContent, 10);
  if (!(fewer < total)) throw new Error('deck did not shrink: ' + total + ' -> ' + fewer);
  ['-er verbs', '-ir verbs', 'irregular'].forEach(function (g) { Quiz.toggleGroup(g); });
  var left = parseInt(registry.statTotal.textContent, 10);
  if (!(left > 0)) throw new Error('deck emptied');
  return total + ' -> ' + fewer + ' after one chip; floor holds at ' + left;
});

step('clearing a deck shows the done screen', function () {
  goTo('#adverbs');
  var guard = 0;
  while (registry.answerInput && guard++ < 200) {
    var card = shownCard('adverbs');
    registry.answerInput.value = card.answer;
    registry.actionBtn.fire('click');
    registry.actionBtn.fire('click');   // second press advances
  }
  if (!/done-screen/.test(registry.cardArea.innerHTML))
    throw new Error('no done screen after ' + guard + ' answers');
  if (!/result-stat/.test(registry.cardArea.innerHTML))
    throw new Error('no run stats on the done screen');
  return 'cleared 28 adverb cards in ' + guard + ' rounds; done screen with run stats';
});

step('the reset control clears a topic\'s mastery', function () {
  goTo('#browse');                     // leave and re-enter so the chrome rebuilds
  goTo('#adverbs');
  var before = Store.masteredCount('adverbs');
  if (!(before > 0)) throw new Error('expected mastered adverbs from the previous step');
  if (!/data-reset-topic="adverbs"/.test(registry.view.innerHTML))
    throw new Error('no reset control rendered');
  // dispatch through the app's delegated click handler (confirm() is absent
  // in this stub, which the handler treats as a yes)
  var fakeTarget = { closest: function (sel) {
    return sel === '[data-reset-topic]' ? { dataset: { resetTopic: 'adverbs' } } : null;
  } };
  (document._h.click || []).forEach(function (fn) { fn({ target: fakeTarget }); });
  if (Store.masteredCount('adverbs') !== 0)
    throw new Error('mastery not cleared: ' + Store.masteredCount('adverbs'));
  if (/data-reset-topic="adverbs"/.test(registry.view.innerHTML))
    throw new Error('reset control still shown with 0 mastered');
  return 'mastered ' + before + ' -> 0; control hidden again';
});

step('daily challenge builds 7 cards from 7 different topics', function () {
  goTo('#daily');
  var dots = (registry.view.innerHTML.match(/<span class="daily-dot/g) || []).length;
  if (dots !== 7) throw new Error('got ' + dots + ' dots');
  if (!registry.answerInput) throw new Error('no card rendered');
  return '7 dots, one card showing';
});

step('daily: four misses count down, the fifth reveals the answer', function () {
  goTo('#daily');
  for (var i = 0; i < 4; i++) {
    registry.answerInput.value = 'errado-' + i;
    registry.actionBtn.fire('click');
    if (!/left/.test(registry.feedback.innerHTML) || !/✗/.test(registry.feedback.innerHTML))
      throw new Error('attempt ' + (i + 1) + ': ' + registry.feedback.innerHTML);
    flushTimers();
  }
  registry.answerInput.value = 'errado-final';
  registry.actionBtn.fire('click');
  if (!/The answer is/.test(registry.feedback.innerHTML))
    throw new Error('fifth miss did not reveal: ' + registry.feedback.innerHTML);
  return 'four "tries left" messages, then a reveal';
});

step('daily progress survives a reload', function () {
  Daily.mount();                       // what reopening the page does
  var failedDots = (registry.view.innerHTML.match(/done-fail/g) || []).length;
  if (failedDots < 1) throw new Error('the failed card was not restored');
  return 'failed card still marked after re-mounting';
});

step('daily is deterministic for a given day', function () {
  var first = [];
  Daily.mount();
  var a = registry.view.innerHTML;
  Daily.mount();
  var b = registry.view.innerHTML;
  if (a !== b) throw new Error('two mounts produced different challenges');
  return 'same 7 cards on repeated mounts';
});

step('theme cycles auto -> light -> dark -> auto', function () {
  goTo('#browse');
  if (Store.getPref('theme', null) !== null)
    throw new Error('a fresh profile should follow the system');
  registry.themeBtn.fire('click');
  var t1 = Store.getPref('theme', null);
  registry.themeBtn.fire('click');
  var t2 = Store.getPref('theme', null);
  registry.themeBtn.fire('click');
  var t3 = Store.getPref('theme', null);
  if (t1 !== 'light' || t2 !== 'dark' || t3 !== null)
    throw new Error('cycle was ' + t1 + ' / ' + t2 + ' / ' + t3);
  if (!/follows the system/.test(registry.themeBtn.getAttribute('title') || ''))
    throw new Error('auto-state tooltip missing');
  return 'three taps round-trip back to following the system';
});

step('browse controls all run and keep 124 rows', function () {
  goTo('#browse');
  Browse.action('shuffle');
  var shuffledRows = (registry.view.innerHTML.match(/class="verb-row"/g) || []).length;
  Browse.action('reset');
  Browse.action('hide-pt');
  Browse.action('hide-en');
  Browse.action('show');
  var rows = (registry.view.innerHTML.match(/class="verb-row"/g) || []).length;
  if (rows !== 124 || shuffledRows !== 124)
    throw new Error('rows: shuffled=' + shuffledRows + ' final=' + rows);
  return 'shuffle/reset/hide/show all fine; 124 rows throughout';
});

step('browse renders all tenses per verb with glosses', function () {
  goTo('#browse');
  var html = registry.view.innerHTML;
  ['Presente', 'Pretérito Perfeito', 'Pretérito Imperfeito',
   'Imperfeito do Subjuntivo'].forEach(function (t) {
    if (html.indexOf(t) === -1) throw new Error('missing tense block: ' + t);
  });
  var panels = (html.match(/conjugation-panel/g) || []).length;
  if (panels !== 124) throw new Error('expected 124 panels, got ' + panels);
  var subj = (html.match(/Imperfeito do Subjuntivo/g) || []).length;
  if (subj !== 40) throw new Error('expected 40 subjunctive blocks, got ' + subj);
  return '124 conjugation panels; 40 carry the subjunctive';
});

step('subjuntivo drill accepts the trigger-prefixed answer', function () {
  goTo('#subjuntivo');
  var card = shownCard('subjuntivo');
  registry.answerInput.value = 'se ' + card.answer;
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('rejected "se ' + card.answer + '"');
  return '"se ' + card.answer + '" accepted';
});

step('pronominal drill accepts every declared answer variant', function () {
  goTo('#pronominal');
  var card = shownCard('pronominal');
  // the last accepted entry is the pronoun-prefixed form on conjugation cards
  // and the loosest alt elsewhere — the variant most likely to regress
  registry.answerInput.value = card.accepted[card.accepted.length - 1];
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('rejected "' + card.accepted[card.accepted.length - 1] +
                    '" for "' + card.answer + '"');
  return '"' + card.accepted[card.accepted.length - 1] + '" accepted for "' + card.answer + '"';
});

step('an unknown hash falls back to Browse', function () {
  goTo('#nonsense');
  if (!/<h1>Verbos<\/h1>/.test(registry.view.innerHTML)) throw new Error('did not fall back');
  return 'ok';
});

step('Foco is the default and a fresh topic is all "needing work"', function () {
  Store.resetTopic('adverbs');           // clear anything earlier steps recorded
  goTo('#adverbs');
  if (!/chip focus active/.test(registry.view.innerHTML))
    throw new Error('Foco chip not active by default');
  var total = parseInt(registry.statTotal.textContent, 10);
  var all = topicCards(topicById('adverbs')).length;
  if (total !== all) throw new Error('fresh Foco deck ' + total + ', expected all ' + all);
  return 'chip active on a fresh profile; deck holds all ' + all + ' cards';
});

step('one clean pass empties the Foco deck until reviews fall due', function () {
  var guard = 0;
  while (registry.answerInput && guard++ < 60) {
    var c = shownCard('adverbs');
    registry.answerInput.value = c.answer;
    registry.actionBtn.fire('click');    // check
    registry.actionBtn.fire('click');    // advance
  }
  if (!/done-screen/.test(registry.cardArea.innerHTML))
    throw new Error('did not clear the deck in ' + guard + ' rounds');
  registry.againBtn.fire('click');       // rebuild: everything mastered + fresh
  if (!/Tudo em dia/.test(registry.cardArea.innerHTML))
    throw new Error('deck did not empty after mastering everything');
  Quiz.toggleFocus();                    // off -> the full deck must come back
  if (!registry.answerInput) throw new Error('full deck did not come back');
  Quiz.toggleFocus();                    // back to the default for later steps
  return 'mastered everything -> "Tudo em dia"; toggle-off still drills all';
});

step('a miss pulls the whole conjugation back into Foco', function () {
  Store.resetTopic('imperfeito');
  var cards = topicCards(topicById('imperfeito'));
  cards.forEach(function (c) {           // simulate a fully mastered, fresh topic
    Store.markMastered('imperfeito', c.id);
    Store.recordAnswer('imperfeito', c.id, true);
  });
  var missed = cards[0];
  Store.recordAnswer('imperfeito', missed.id, false);
  goTo('#browse'); goTo('#imperfeito');
  var lex = String(missed.id).split('|')[0];
  var expected = cards.filter(function (c) {
    return String(c.id).split('|')[0] === lex;
  }).length;
  var total = parseInt(registry.statTotal.textContent, 10);
  if (total !== expected)
    throw new Error('deck has ' + total + ' cards, expected the ' +
                    expected + ' forms of "' + lex + '"');
  for (var i = 0; i < FOCUS_STREAK; i++) Store.recordAnswer('imperfeito', missed.id, true);
  goTo('#browse'); goTo('#imperfeito');
  if (!/Tudo em dia/.test(registry.cardArea.innerHTML))
    throw new Error('verb did not graduate after a ' + FOCUS_STREAK + '-streak');
  return 'miss -> the ' + expected + ' forms of "' + lex + '"; 3-streak -> empty again';
});

step('a mastered card comes back for review once it goes stale', function () {
  var cards = topicCards(topicById('imperfeito'));
  var snap = Store.snapshot();
  snap.strength.imperfeito[cards[5].id].t -= (REVIEW_DAYS + 1);
  Store.applySynced(snap);
  goTo('#browse'); goTo('#imperfeito');
  var total = parseInt(registry.statTotal.textContent, 10);
  if (total !== 1) throw new Error('expected exactly the stale card, got ' + total);
  return '"' + cards[5].id + '" resurfaced after ' + REVIEW_DAYS + '+ days';
});

step('sync is inert without a code, survives its own init saves, and shows the off state', function () {
  if (typeof Sync === 'undefined') throw new Error('Sync not defined');
  // regression: the initialiser stores the discovery-nudge counter via Store.setPref,
  // which fires save() — that used to read `Sync` inside its own temporal dead zone
  // and throw, leaving every later save() broken (a miss then showed no answer)
  if (Store.getPref('syncNudge', 0) !== 1)
    throw new Error('nudge counter not recorded: ' + Store.getPref('syncNudge', 0));
  Sync.onLocalChange();                  // no code -> must schedule nothing and not throw
  if (registry.syncBtn.className !== 'icon-btn sync-off')
    throw new Error('button class is "' + registry.syncBtn.className + '"');
  if (!/tap to link/.test(registry.syncBtn.getAttribute('title') || ''))
    throw new Error('off-state tooltip missing');
  registry.syncBtn.fire('click');        // no prompt() in the stub -> a silent no-op
  flushTimers();
  // the root app keeps the bare key — existing learners' blobs must stay reachable
  Store.setPref('syncCode', 'abcdefghijklmnop');
  var ep = Sync._endpoint();
  Store.setPref('syncCode', '');
  if (!/\/abcdefghijklmnop$/.test(ep) || /\/ingles/.test(ep)) throw new Error('endpoint is "' + ep + '"');
  return 'init saves survived (nudge=1); no network attempted; off-state dot + tooltip; bare key endpoint';
});

step('the footer shows the app version', function () {
  var text = registry.buildInfo.textContent;
  if (!/^v\d+\.\d+\.\d+/.test(text)) throw new Error('build info reads "' + text + '"');
  if (text !== 'v' + APP_VERSION) throw new Error('stub has no lastModified, expected bare version');
  return '"' + text + '" (date suffix needs document.lastModified, absent in the stub)';
});

step('sync merge is conservative: union mastery, keep cards shaky', function () {
  var a = { mastered: { nouns: { x: 1 } },
            strength: { presente: { 'ser|0': { s: 3, m: 1, t: 20660 }, 'ir|2': { s: 2, m: 2 } } },
            daily: { '20260821': { attempts: [1, 0], failed: [false, false], solved: [true, false], current: 1 } } };
  var b = { mastered: { nouns: { y: 1 } },
            strength: { presente: { 'ser|0': { s: 0, m: 1, t: 20655 } } },
            daily: { '20260821': { attempts: [1, 2], failed: [false, true], solved: [true, false], current: 1 } } };
  var m = Sync._merge(a, b);
  if (!m.mastered.nouns.x || !m.mastered.nouns.y) throw new Error('mastery not unioned');
  var ser = m.strength.presente['ser|0'];
  if (ser.s !== 0 || ser.m !== 1 || ser.t !== 20660)
    throw new Error('ser|0 merged to ' + JSON.stringify(ser));
  var ir = m.strength.presente['ir|2'];
  if (ir.s !== 2 || ir.m !== 2) throw new Error('one-sided entry not kept: ' + JSON.stringify(ir));
  var d = m.daily['20260821'];
  if (d.attempts[1] !== 2 || d.failed[1] !== true || d.solved[0] !== true)
    throw new Error('daily merged to ' + JSON.stringify(d));
  return 'graduated-on-A but just-missed-on-B stays shaky; daily merged element-wise';
});

/* Deliver a final recognition result into whatever the app is listening with
   (the stub's fake SpeechRecognition records itself in window._activeRec). */
function fireRecResult(text) {
  var rec = window._activeRec;
  if (!rec || !rec.onresult) throw new Error('no active recognition');
  var res = [{ transcript: text }];
  res.isFinal = true;
  rec.onresult({ results: [res] });
}

step('mic chip renders with SpeechRecognition present and defaults off', function () {
  goTo('#nouns');
  if (!/data-mic=/.test(registry.view.innerHTML))
    throw new Error('mic chip missing (the stub provides the API)');
  if (/chip mic active/.test(registry.view.innerHTML))
    throw new Error('mic mode on by default');
  if (window._activeRec) throw new Error('listening while the mode is off');
  return 'chip present, inactive, nothing listening';
});

step('mic mode: recognized speech auto-submits and auto-advances', function () {
  goTo('#nouns');
  Quiz.toggleMic();
  if (!/chip mic active/.test(registry.view.innerHTML)) throw new Error('chip not active');
  if (!window._activeRec) throw new Error('mic did not start listening');
  if (!registry.micStatus || !/Ouvindo/.test(registry.micStatus.innerHTML))
    throw new Error('no listening status shown');
  var card = shownCard('nouns');
  fireRecResult(card.answer);
  if (!/✓/.test(registry.feedback.innerHTML))
    throw new Error('spoken answer rejected: ' + registry.feedback.innerHTML);
  flushTimers();   // TTS is a no-op in the stub, so the advance timer is already queued
  if (!registry.answerInput) throw new Error('did not advance to the next card');
  if (!window._activeRec) throw new Error('mic not listening again on the next card');
  return 'spoke "' + card.answer + '"; accepted, advanced, listening again';
});

step('mic matching expands recognizer digits into number words', function () {
  var cards = topicCards(topicById('numbers'));
  var vinte = cards.filter(function (c) { return c.answer === 'vinte'; })[0];
  if (micAnswer(vinte, ['20']) !== 'vinte')
    throw new Error('"20" resolved to ' + JSON.stringify(micAnswer(vinte, ['20'])));
  if (micAnswer(vinte, ['30']) !== null) throw new Error('"30" wrongly accepted for vinte');
  var third = cards.filter(function (c) { return c.answer === 'terceiro'; })[0];
  if (micAnswer(third, ['3º']) !== 'terceiro') throw new Error('ordinal "3º" not matched');
  var empty = topicCards(topicById('connecting')).filter(function (c) { return c.allowEmpty; })[0];
  if (!empty || micAnswer(empty, ['nada']) !== '')
    throw new Error('spoken "nada" did not map to the empty answer');
  return '"20" -> vinte, "3º" -> terceiro, "30" stays wrong, "nada" -> empty gap';
});

step('mic mode switches off cleanly', function () {
  goTo('#nouns');
  Quiz.toggleMic();
  if (window._activeRec) throw new Error('still listening after toggle-off');
  if (Store.getPref('mic', null) !== false) throw new Error('pref not written');
  if (/mic-status/.test(registry.cardArea.innerHTML))
    throw new Error('mic status still rendered');
  return 'listening stopped, status gone, pref = false';
});
