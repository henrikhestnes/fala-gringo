/* Smoke-test steps. Concatenated INTO the same eval as the app sources so that
   the app's top-level const bindings (Mode, Store, Quiz, Browse, Daily, TOPICS)
   are in scope. Uses step()/registry/flushTimers from the JXA host script. */

step('app boots and renders the Browse view', function () {
  var html = registry.view.innerHTML;
  if (!/<h1>Verbos<\/h1>/.test(html)) throw new Error('browse view did not render');
  var rows = (html.match(/class="verb-row"/g) || []).length;
  if (rows !== 146) throw new Error('expected 146 verb rows, got ' + rows);
  return rows + ' verb rows, ' + html.length + ' bytes of HTML';
});

step('tab strip lists all 14 tabs, captioned by tier', function () {
  var tabs = (registry.tabs.innerHTML.match(/data-tab="/g) || []).length;
  if (tabs !== 14) throw new Error('got ' + tabs + ' tabs');
  var labels = registry.tabs.innerHTML.match(/tier-label" data-tier="(\d)"[^>]*>([^<]*)</g) || [];
  if (labels.length !== 3) throw new Error(labels.length + ' tier captions: ' + labels.join(' | '));
  if (!/data-tier="1"[^>]*>Iniciante<\/span><button class="tab" role="tab"[^>]*data-tab="presente"/.test(registry.tabs.innerHTML))
    throw new Error('Iniciante caption not right before Presente');
  if (!/Intermediário<\/span><button[^>]*data-tab="perfeito"/.test(registry.tabs.innerHTML) ||
      !/Avançado<\/span><button[^>]*data-tab="subjuntivo"/.test(registry.tabs.innerHTML))
    throw new Error('Intermediário / Avançado captions misplaced');
  return '14 tabs incl. Browse + Daily; captions before Presente, Passado, Subjuntivo';
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
  Quiz.toggleFocus();                    // whole-topic deck: the Foco cap would hide the shrink
  var total = parseInt(registry.statTotal.textContent, 10);
  Quiz.toggleGroup('-ar verbs');
  var fewer = parseInt(registry.statTotal.textContent, 10);
  if (!(fewer < total)) throw new Error('deck did not shrink: ' + total + ' -> ' + fewer);
  ['-er verbs', '-ir verbs', 'irregular'].forEach(function (g) { Quiz.toggleGroup(g); });
  var left = parseInt(registry.statTotal.textContent, 10);
  if (!(left > 0)) throw new Error('deck emptied');
  Quiz.toggleFocus();                    // back to the default
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

step('browse controls all run and keep 146 rows', function () {
  goTo('#browse');
  Browse.action('shuffle');
  var shuffledRows = (registry.view.innerHTML.match(/class="verb-row"/g) || []).length;
  Browse.action('reset');
  Browse.action('hide-pt');
  Browse.action('hide-en');
  Browse.action('show');
  var rows = (registry.view.innerHTML.match(/class="verb-row"/g) || []).length;
  if (rows !== 146 || shuffledRows !== 146)
    throw new Error('rows: shuffled=' + shuffledRows + ' final=' + rows);
  return 'shuffle/reset/hide/show all fine; 146 rows throughout';
});

step('browse renders all tenses per verb with glosses', function () {
  goTo('#browse');
  var html = registry.view.innerHTML;
  ['Presente', 'Pretérito Perfeito', 'Pretérito Imperfeito',
   'Imperfeito do Subjuntivo'].forEach(function (t) {
    if (html.indexOf(t) === -1) throw new Error('missing tense block: ' + t);
  });
  var panels = (html.match(/conjugation-panel/g) || []).length;
  if (panels !== 146) throw new Error('expected 146 panels, got ' + panels);
  var subj = (html.match(/Imperfeito do Subjuntivo/g) || []).length;
  if (subj !== 40) throw new Error('expected 40 subjunctive blocks, got ' + subj);
  return '146 conjugation panels; 40 carry the subjunctive';
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

/* The schedule is day-based, so steps move the clock: Date.now() is offset
   forward (never back) by whole days. progress.js reads Date.now() at call
   time, so every later step sees the advanced calendar. */
var _dayOffset = 0;
var _realNow = Date.now;
function advanceDays(n) {
  _dayOffset += n * 86400000;
  Date.now = function () { return _realNow() + _dayOffset; };
}

step('Foco is the default and a fresh topic shows only the daily intake', function () {
  Store.resetTopic('adverbs');           // clear anything earlier steps recorded
  goTo('#adverbs');
  if (!/chip focus active/.test(registry.view.innerHTML))
    throw new Error('Foco chip not active by default');
  var total = parseInt(registry.statTotal.textContent, 10);
  var all = topicCards(topicById('adverbs')).length;
  var cap = Store.newPerDay();
  if (all <= cap) throw new Error('adverbs (' + all + ') no longer exceed the cap; pick a bigger topic');
  if (total !== cap) throw new Error('fresh Foco deck ' + total + ', expected the ' + cap + ' daily intake of ' + all);
  if (!new RegExp('· ' + cap + ' new').test(registry.view.innerHTML))
    throw new Error('Foco chip does not read "' + cap + ' new"');
  if (Store.introducedToday('adverbs') !== cap)
    throw new Error('introduced-today stamp is ' + Store.introducedToday('adverbs'));
  // a rebuild the same day must hand back the SAME intake, not another batch
  Quiz.toggleFocus(); Quiz.toggleFocus();
  if (parseInt(registry.statTotal.textContent, 10) !== cap)
    throw new Error('rebuild changed the intake to ' + registry.statTotal.textContent);
  return 'chip active on a fresh profile; ' + cap + ' of ' + all + ' cards, chip reads "' + cap + ' new"; stable across rebuilds';
});

step('clearing the intake leaves the rest waiting; a new day brings them', function () {
  var all = topicCards(topicById('adverbs')).length;
  var cap = Store.newPerDay();
  var guard = 0;
  while (registry.answerInput && guard++ < 60) {
    var c = shownCard('adverbs');
    registry.answerInput.value = c.answer;
    registry.actionBtn.fire('click');    // check
    registry.actionBtn.fire('click');    // advance
  }
  if (!/done-screen/.test(registry.cardArea.innerHTML))
    throw new Error('did not clear the deck in ' + guard + ' rounds');
  registry.againBtn.fire('click');       // rebuild: intake mastered, remainder still capped out
  if (!/Tudo em dia/.test(registry.cardArea.innerHTML))
    throw new Error('deck did not empty after mastering the intake');
  if (!new RegExp((all - cap) + ' more wait for tomorrow').test(registry.cardArea.innerHTML))
    throw new Error('waiting count missing: ' + registry.cardArea.innerHTML);
  Quiz.toggleFocus();                    // off -> the full deck must come back
  if (parseInt(registry.statTotal.textContent, 10) !== all) throw new Error('full deck did not come back');
  Quiz.toggleFocus();                    // back to the default
  advanceDays(1);
  goTo('#browse'); goTo('#adverbs');
  var total = parseInt(registry.statTotal.textContent, 10);
  if (total !== all - cap) throw new Error('next day deck is ' + total + ', expected the remaining ' + (all - cap));
  guard = 0;
  while (registry.answerInput && guard++ < 60) {
    var c2 = shownCard('adverbs');
    registry.answerInput.value = c2.answer;
    registry.actionBtn.fire('click'); registry.actionBtn.fire('click');
  }
  registry.againBtn.fire('click');
  if (!/Tudo em dia/.test(registry.cardArea.innerHTML) || /wait for tomorrow/.test(registry.cardArea.innerHTML))
    throw new Error('topic not fully mastered: ' + registry.cardArea.innerHTML);
  return 'day 1: ' + cap + ' mastered, ' + (all - cap) + ' waiting; day 2: the rest; then "Tudo em dia"';
});

step('review level grows only across distinct days and climbs the interval ladder', function () {
  var id = topicCards(topicById('adverbs'))[0].id;
  // start from a card mastered today (the intake spread over two days above)
  var snap0 = Store.snapshot();
  snap0.strength.adverbs[id] = { s: 1, m: 0, l: 1, t: Store.today() };
  Store.applySynced(snap0);
  var lvl = Store.reviewLevel('adverbs', id);
  if (lvl !== 1) throw new Error('level after first mastery is ' + lvl);
  Store.recordAnswer('adverbs', id, true);          // same day: proves nothing extra
  Store.recordAnswer('adverbs', id, true);
  if (Store.reviewLevel('adverbs', id) !== 1) throw new Error('same-day repeats raised the level');
  if (Store.cardState('adverbs', id) !== 'ok') throw new Error('fresh card reads ' + Store.cardState('adverbs', id));
  advanceDays(REVIEW_INTERVALS[0]);                 // 7 days -> first review due
  if (Store.cardState('adverbs', id) !== 'due') throw new Error('not due after ' + REVIEW_INTERVALS[0] + ' days');
  Store.recordAnswer('adverbs', id, true);          // confirmed on a later day -> level 2
  if (Store.reviewLevel('adverbs', id) !== 2) throw new Error('level after a distinct-day confirm is ' + Store.reviewLevel('adverbs', id));
  advanceDays(REVIEW_INTERVALS[0]);                 // 7 more days: level 2 waits 14
  if (Store.cardState('adverbs', id) !== 'ok') throw new Error('level-2 card came back after only 7 days');
  advanceDays(REVIEW_INTERVALS[1] - REVIEW_INTERVALS[0]);
  if (Store.cardState('adverbs', id) !== 'due') throw new Error('level-2 card not due after 14 days');
  if (Store.overdue('adverbs', id) !== 0) throw new Error('overdue on the due day should be 0, got ' + Store.overdue('adverbs', id));
  Store.recordAnswer('adverbs', id, false);         // a miss restarts the ladder
  if (Store.reviewLevel('adverbs', id) !== 0 || Store.cardState('adverbs', id) !== 'shaky')
    throw new Error('miss did not reset: level ' + Store.reviewLevel('adverbs', id) + ', ' + Store.cardState('adverbs', id));
  // a pre-1.12 record (no `l`) with a last-correct day counts as level 1
  var snap = Store.snapshot();
  snap.strength.adverbs[id] = { s: 3, m: 0, t: Store.today() - 8 };
  Store.applySynced(snap);
  if (Store.reviewLevel('adverbs', id) !== 1 || Store.cardState('adverbs', id) !== 'due')
    throw new Error('legacy record: level ' + Store.reviewLevel('adverbs', id) + ', ' + Store.cardState('adverbs', id));
  return 'same day stays 1; +7d due -> confirm -> 2; +7d ok, +14d due; miss -> 0/shaky; legacy record = level 1';
});

step('the Foco deck puts due reviews before new cards, most overdue first', function () {
  Store.resetTopic('nouns');
  var cards = topicCards(topicById('nouns'));
  var today = Store.today();
  var snap = Store.snapshot();
  snap.mastered.nouns = {}; snap.strength.nouns = {};
  var due = cards.slice(-5);                        // the LAST five in data order, so intake order can't mask it
  due.forEach(function (c, i) {
    snap.mastered.nouns[c.id] = 1;
    snap.strength.nouns[c.id] = { s: 1, m: 0, l: 1, t: today - REVIEW_INTERVALS[0] - i };   // c[4] most overdue
  });
  Store.applySynced(snap);
  goTo('#browse'); goTo('#nouns');
  var total = parseInt(registry.statTotal.textContent, 10);
  if (total !== 5 + Store.newPerDay()) throw new Error('deck is ' + total + ', expected 5 due + ' + Store.newPerDay() + ' new');
  if (!/· 5 due · 20 new/.test(registry.view.innerHTML)) throw new Error('chip breakdown missing: ' + registry.view.innerHTML.match(/chip focus[^<]*/)[0]);
  var first = shownCard('nouns');
  if (first.id !== due[4].id) throw new Error('first card is "' + first.id + '", expected the most overdue "' + due[4].id + '"');
  // the header follows every answer: a miss reads as shaky, a hit leaves its tier,
  // and the mastered count moves as soon as a new card is answered right
  if (!/· 5 due · 20 new$/.test(registry.focoChip.innerHTML)) throw new Error('live chip starts as "' + registry.focoChip.innerHTML + '"');
  registry.answerInput.value = 'zzz-wrong';
  registry.actionBtn.fire('click');
  if (!/· 4 due · 1 shaky · 20 new$/.test(registry.focoChip.innerHTML)) throw new Error('after a miss the chip reads "' + registry.focoChip.innerHTML + '"');
  registry.actionBtn.fire('click');                          // advance; the missed card cycles back later
  for (var i = 0; i < 4; i++) {
    var c = shownCard('nouns');
    if (due.map(function (d) { return d.id; }).indexOf(c.id) === -1) throw new Error('card ' + (i + 2) + ' "' + c.id + '" is not a due review');
    registry.answerInput.value = c.answer;
    registry.actionBtn.fire('click'); registry.actionBtn.fire('click');
  }
  if (!/· 1 shaky · 20 new$/.test(registry.focoChip.innerHTML)) throw new Error('after the due reviews the chip reads "' + registry.focoChip.innerHTML + '"');
  var sixth = shownCard('nouns');
  if (Store.cardState('nouns', sixth.id) !== 'new') throw new Error('sixth card "' + sixth.id + '" is not new');
  if (!/^5 of \d+ cards mastered/.test(registry.masteredLine.innerHTML)) throw new Error('mastered line reads "' + registry.masteredLine.innerHTML + '"');
  registry.answerInput.value = sixth.answer;
  registry.actionBtn.fire('click');
  if (!/^6 of \d+ cards mastered/.test(registry.masteredLine.innerHTML)) throw new Error('mastered line did not move: "' + registry.masteredLine.innerHTML + '"');
  if (!/· 1 shaky · 19 new$/.test(registry.focoChip.innerHTML)) throw new Error('after a new card the chip reads "' + registry.focoChip.innerHTML + '"');
  return '5 due first (most overdue leading), then the 20 new; chip + mastered line follow each answer';
});

step('equally overdue reviews are shuffled, not served in data order', function () {
  // regression (v1.12.1): the stable overdue sort kept ties in data order, so a
  // tab whose cards all fell due together ran through the list verb by verb
  Store.resetTopic('nouns');
  var cards = topicCards(topicById('nouns')).slice(0, 12);
  var today = Store.today();
  var snap = Store.snapshot();
  snap.mastered.nouns = {}; snap.strength.nouns = {};
  cards.forEach(function (c) {
    snap.mastered.nouns[c.id] = 1;
    snap.strength.nouns[c.id] = { s: 1, m: 0, l: 1, t: today - REVIEW_INTERVALS[0] };   // all due, all equal
  });
  Store.applySynced(snap);
  var inOrder = 0;
  for (var run = 0; run < 3; run++) {
    goTo('#browse'); goTo('#nouns');
    var shown = [];
    for (var i = 0; i < cards.length; i++) {
      var c = shownCard('nouns');
      shown.push(c.id);
      registry.answerInput.value = 'zzz-wrong-' + i;      // a miss keeps every card in the deck
      registry.actionBtn.fire('click'); registry.actionBtn.fire('click');
    }
    if (shown.join('|') === cards.map(function (c) { return c.id; }).join('|')) inOrder++;
    Store.applySynced(snap);                                // undo the misses for the next run
  }
  if (inOrder === 3) throw new Error('due ties came out in data order on every rebuild');
  return '12 equally due cards; data order seen in ' + inOrder + ' of 3 rebuilds';
});

step('inference: a known word + a known pattern makes an unseen regular form a "verify" card', function () {
  ['presente', 'perfeito', 'imperfeito', 'subjuntivo'].forEach(function (t) { Store.resetTopic(t); });
  var cards = topicCards(topicById('presente'));
  var today = Store.today();
  // the regular -ar "vocês" forms, one per verb, in data order
  var voces = cards.filter(function (c) { return c.infer && c.infer.regular && c.infer.pattern === 'ar|presente|3'; });
  if (voces.length < Infer.PATTERN_MIN + 3) throw new Error('only ' + voces.length + ' regular -ar vocês forms');
  var irregularForm = cards.filter(function (c) { return c.infer && !c.infer.regular && c.infer.pattern === 'ar|presente|3'; })[0];
  if (!irregularForm) throw new Error('no irregular -ar vocês form to test against');
  var snap = Store.snapshot();
  snap.mastered.presente = {}; snap.strength.presente = {};
  // pattern: PATTERN_MIN distinct regular -ar verbs confirmed in vocês
  voces.slice(0, Infer.PATTERN_MIN).forEach(function (c) {
    snap.mastered.presente[c.id] = 1;
    snap.strength.presente[c.id] = { s: 1, m: 0, l: 1, t: today };
  });
  // word: the "eu" form of the next verb is mastered — its vocês form is unseen
  var target = voces[Infer.PATTERN_MIN];
  var targetEu = target.infer.lexeme + '|0';
  snap.mastered.presente[targetEu] = 1;
  snap.strength.presente[targetEu] = { s: 1, m: 0, l: 1, t: today };
  // a verb the learner has never met anywhere: pattern known, word not
  var stranger = voces[Infer.PATTERN_MIN + 1];
  Store.applySynced(snap);
  goTo('#browse'); goTo('#presente');
  var counts = Quiz._counts();
  if (!counts || counts.verify !== 1) throw new Error('verify tier is ' + JSON.stringify(counts));
  if (Quiz._tierOf(target.id) !== 'verify') throw new Error('"' + target.id + '" is in tier ' + Quiz._tierOf(target.id));
  if (Quiz._tierOf(stranger.id) === 'verify') throw new Error('unknown word "' + stranger.id + '" was inferred');
  if (Quiz._tierOf(irregularForm.id) === 'verify') throw new Error('irregular form "' + irregularForm.id + '" was inferred');
  if (!/· 1 to confirm/.test(registry.view.innerHTML)) throw new Error('chip lacks the verify count');
  // no due, no shaky: the verify card leads the deck; a hit starts at level 2 (14-day review)
  var first = shownCard('presente');
  if (first.id !== target.id) throw new Error('first card is "' + first.id + '", expected the verify card');
  registry.answerInput.value = first.answer;
  registry.actionBtn.fire('click');
  if (!/✓/.test(registry.feedback.innerHTML)) throw new Error('verify card rejected: ' + registry.feedback.innerHTML);
  if (Store.reviewLevel('presente', target.id) !== 2) throw new Error('verify hit landed at level ' + Store.reviewLevel('presente', target.id));
  // a shaky pattern stops qualifying: miss two of the five confirmed forms -> 3/5 solid < 80%
  var snap2 = Store.snapshot();
  voces.slice(0, 2).forEach(function (c) { snap2.strength.presente[c.id] = { s: 0, m: 1, l: 0, t: today }; });
  snap2.mastered.presente[voces[Infer.PATTERN_MIN + 2].infer.lexeme + '|0'] = 1;   // another known word…
  Store.applySynced(snap2);
  goTo('#browse'); goTo('#presente');
  if (Quiz._counts().verify !== 0) throw new Error('…was still inferred from a shaky pattern: ' + JSON.stringify(Quiz._counts()));
  return '"' + target.id + '" verified from "' + targetEu + '" + ' + Infer.PATTERN_MIN + ' -ar vocês; hit -> level 2; stranger, irregular and shaky pattern excluded';
});

step('typed near-misses: one unambiguous slip is accepted, an ambiguous one is a miss', function () {
  var cards = topicCards(topicById('presente'));
  function byId(id) { return cards.filter(function (c) { return c.id === id; })[0]; }
  function rivals(card) {
    var own = {}; card.accepted.forEach(function (a) { own[normalize(a)] = 1; });
    return cards.filter(function (c) { return c !== card; }).reduce(function (acc, c) {
      return acc.concat(c.accepted.filter(function (a) { return !own[normalize(a)]; }));
    }, []);
  }
  var falo = byId('falar|0'), falam = byId('falar|3');
  var m = matchAnswer(falo, 'eu fali', rivals(falo), false);
  if (!m || m.grade !== 'near' || m.hit !== 'eu falo') throw new Error('"eu fali": ' + JSON.stringify(m));
  m = matchAnswer(falo, 'eu faloo', rivals(falo), false);
  if (!m || m.grade !== 'near') throw new Error('"eu faloo": ' + JSON.stringify(m));
  if (matchAnswer(falo, 'eu fala', rivals(falo), false)) throw new Error('"eu fala" accepted for "eu falo" — that is another form');
  if (matchAnswer(falam, 'voces fala', rivals(falam), false)) throw new Error('"vocês fala" accepted for "vocês falam"');
  if (matchAnswer(falo, 'fali', rivals(falo), false)) throw new Error('a 4-letter slip was tolerated');
  // a substitution is a slip only between NEIGHBOURING keys: s sits next to a, x and e do not
  if (matchAnswer(falo, 'eu fslo', rivals(falo), false) === null) throw new Error('one neighbouring-key substitution rejected');
  if (matchAnswer(falo, 'eu fxlo', rivals(falo), false)) throw new Error('"eu fxlo" accepted — x is not next to a');
  if (matchAnswer(falo, 'eu fale', [], false)) throw new Error('"eu fale" accepted for "eu falo" — e is a different vowel, not a slip');
  if (matchAnswer(falo, 'eu fali', [], false) === null) throw new Error('"eu fali" rejected — i sits next to o');
  if (matchAnswer(falo, 'eu fslp', rivals(falo), false)) throw new Error('two substitutions accepted on a short form');
  // an extra letter is a slip when it doubles or sits next to a neighbour; a stray one is not
  if (matchAnswer(falo, 'eu falko', rivals(falo), false) === null) throw new Error('"eu falko" rejected — k sits between l and o');
  if (matchAnswer(falo, 'eu falzo', rivals(falo), false)) throw new Error('"eu falzo" accepted — z is nowhere near l or o');
  // dropped letters and swapped neighbours stay free
  if (matchAnswer(falo, 'eu flao', rivals(falo), false) === null) throw new Error('a swap was rejected');
  var exact = matchAnswer(falo, 'EU FALO!', rivals(falo), false);
  if (!exact || exact.grade !== 'exact') throw new Error('exact match broken: ' + JSON.stringify(exact));
  // sentence-length answers get two edits (both keyboard-shaped: s for a, p for o)
  var sent = topicCards(topicById('sentences'))[0];
  var twoOff = sent.answer.replace(/a/, 's').replace(/o([^o]*)$/, 'p$1');
  var ms = matchAnswer(sent, twoOff, [], false);
  if (sent.answer.length >= 12 && (!ms || ms.grade !== 'near')) throw new Error('two edits on "' + sent.answer + '" -> ' + JSON.stringify(ms));
  var wrongVowels = sent.answer.replace(/a/, 'e').replace(/o([^o]*)$/, 'u$1');
  if (matchAnswer(sent, wrongVowels, [], false)) throw new Error('two wrong vowels accepted on "' + sent.answer + '"');
  // through the UI: a fresh topic whose only unseen card is falo
  Store.resetTopic('presente');
  var snap = Store.snapshot();
  var today = Store.today();
  snap.mastered.presente = {}; snap.strength.presente = {};
  cards.forEach(function (c) {
    if (c.id === falo.id) return;
    snap.mastered.presente[c.id] = 1;
    snap.strength.presente[c.id] = { s: 1, m: 0, l: 3, t: today };
  });
  Store.applySynced(snap);
  goTo('#browse'); goTo('#presente');
  if (shownCard('presente').id !== falo.id) throw new Error('deck did not isolate falo');
  registry.answerInput.value = 'eu fali';
  registry.actionBtn.fire('click');
  if (!/^≈ Close! You typed “eu fali”/.test(registry.feedback.innerHTML)) throw new Error('near feedback: ' + registry.feedback.innerHTML);
  if (registry.feedback.className !== 'feedback ok near') throw new Error('feedback class "' + registry.feedback.className + '"');
  if (!Store.isMastered('presente', falo.id)) throw new Error('near-miss did not clear the card');
  if (Store.reviewLevel('presente', falo.id) !== 1) throw new Error('first near-miss level is ' + Store.reviewLevel('presente', falo.id));
  // a near-miss on a due card confirms it WITHOUT climbing the ladder
  var snap2 = Store.snapshot();
  snap2.strength.presente[falo.id] = { s: 1, m: 0, l: 2, t: today - REVIEW_INTERVALS[1] };
  Store.applySynced(snap2);
  goTo('#browse'); goTo('#presente');
  if (shownCard('presente').id !== falo.id) throw new Error('due falo not shown');
  registry.answerInput.value = 'eu fali';
  registry.actionBtn.fire('click');
  if (Store.reviewLevel('presente', falo.id) !== 2) throw new Error('near-miss raised the level to ' + Store.reviewLevel('presente', falo.id));
  if (Store.cardState('presente', falo.id) !== 'ok') throw new Error('near-miss did not restart the clock: ' + Store.cardState('presente', falo.id));
  return '"eu fali" ≈ eu falo (level kept at 2); "eu fala" / "vocês fala" / "fali" / "fale" rejected; only neighbouring keys slip; sentences take two edits';
});

step('spoken answers match by sound, guarded by the conjugation', function () {
  var cards = topicCards(topicById('presente'));
  function byId(id) { return cards.filter(function (c) { return c.id === id; })[0]; }
  function rivals(card) {
    var own = {}; card.accepted.forEach(function (a) { own[normalize(a)] = 1; });
    return cards.filter(function (c) { return c !== card; }).reduce(function (acc, c) {
      return acc.concat(c.accepted.filter(function (a) { return !own[normalize(a)]; }));
    }, []);
  }
  var falam = byId('falar|3'), falo = byId('falar|0'), fala = byId('falar|1'), faco = byId('fazer|0');
  if (phoneticKey('vocês falão') !== phoneticKey('vocês falam')) throw new Error('-ão/-am not collapsed: ' + phoneticKey('vocês falão'));
  if (phoneticKey('faço') !== phoneticKey('fasso')) throw new Error('ç/ss not collapsed');
  if (phoneticKey('você falar') !== phoneticKey('você fala')) throw new Error('final r not dropped');
  if (phoneticKey('falo') === phoneticKey('fala')) throw new Error('sound key merged falo and fala');
  if (micAnswer(falam, ['vocês falão'], rivals(falam)) !== 'vocês falam') throw new Error('"vocês falão" not accepted by sound');
  if (micAnswer(faco, ['eu fasso'], rivals(faco)) !== 'eu faço') throw new Error('"eu fasso" not accepted by sound');
  if (micAnswer(fala, ['você falar'], rivals(fala)) !== 'você fala') throw new Error('"você falar" not accepted by sound');
  if (micAnswer(falo, ['eu fala'], rivals(falo)) !== null) throw new Error('"eu fala" accepted for "eu falo" by the mic');
  if (micAnswer(falo, ['eu fala', 'eu falo'], rivals(falo)) !== 'eu falo') throw new Error('exact second hypothesis lost to the first');
  if (micAnswer(falo, ['falu'], rivals(falo)) !== 'falo') throw new Error('sound identity on a short form rejected: ' + micAnswer(falo, ['falu'], rivals(falo)));
  return 'falão→falam, fasso→faço, falar→fala by sound; fala≠falo guarded; exact hypothesis wins';
});

step('implied reviews: one form of a known-pattern verb is asked, a clean hit confirms the rest', function () {
  ['presente', 'perfeito', 'imperfeito', 'subjuntivo'].forEach(function (t) { Store.resetTopic(t); });
  var cards = topicCards(topicById('presente'));
  var today = Store.today();
  var snap = Store.snapshot();
  snap.mastered.presente = {}; snap.strength.presente = {};
  cards.forEach(function (c) {                       // the whole tab mastered a week+ ago: all due
    snap.mastered.presente[c.id] = 1;
    snap.strength.presente[c.id] = { s: 1, m: c.id === 'falar|2' ? 2 : 0, l: 1, t: today - REVIEW_INTERVALS[0] - 1 };
  });
  Store.applySynced(snap);
  goTo('#browse'); goTo('#presente');
  var counts = Quiz._counts();
  var regular = cards.filter(function (c) { return c.infer && c.infer.regular; }).length;
  var irregular = cards.length - regular;
  if (counts.due + counts.implied !== cards.length) throw new Error('due + implied = ' + (counts.due + counts.implied) + ', not the whole tab');
  if (!(counts.implied > regular / 2)) throw new Error('only ' + counts.implied + ' of ' + regular + ' regular forms implied');
  if (counts.due < irregular) throw new Error('irregular forms (' + irregular + ') must all be asked, due is ' + counts.due);
  if (!/· \d+ due · \d+ implied$/.test(registry.focoChip.innerHTML)) throw new Error('chip reads "' + registry.focoChip.innerHTML + '"');
  // falar: the most-missed form leads, its three siblings ride along
  var falarAsked = cards.filter(function (c) { return c.infer && c.infer.lexeme === 'falar' && Quiz._tierOf(c.id) === 'due'; });
  if (falarAsked.length !== 1 || falarAsked[0].id !== 'falar|2') throw new Error('falar lead is ' + falarAsked.map(function (c) { return c.id; }).join(','));
  // walk the deck: a clean hit on the falar lead confirms falar|0/1/3 (clock reset, level kept)
  var seen = 0, guard = 0, missLead = null;
  while (registry.answerInput && guard++ < 600) {
    var c = shownCard('presente');
    if (c.id === 'falar|2') {
      registry.answerInput.value = c.answer; registry.actionBtn.fire('click');
      ['falar|0', 'falar|1', 'falar|3'].forEach(function (id) {
        if (Store.cardState('presente', id) !== 'ok') throw new Error(id + ' not confirmed by implication: ' + Store.cardState('presente', id));
        if (Store.reviewLevel('presente', id) !== 1) throw new Error(id + ' climbed to level ' + Store.reviewLevel('presente', id));
      });
      if (Store.reviewLevel('presente', 'falar|2') !== 2) throw new Error('the asked lead did not climb');
      seen++;
    } else if (!missLead && c.infer && c.infer.lexeme !== 'falar' && Quiz._impliedOf(c.id).length === 3) {
      // miss another lead carrying three implied siblings: they must come back into the deck
      missLead = c;
      var before = parseInt(registry.statTotal.textContent, 10);
      registry.answerInput.value = 'zzz-wrong'; registry.actionBtn.fire('click');
      var after = parseInt(registry.statTotal.textContent, 10);
      if (after !== before + 3) throw new Error('missing the lead "' + c.id + '" grew the deck ' + before + ' -> ' + after + ', expected +3');
      if (Quiz._impliedOf(c.id).length) throw new Error('reclaimed siblings still listed as implied');
      seen++;
    } else {
      registry.answerInput.value = c.answer; registry.actionBtn.fire('click');
    }
    registry.actionBtn.fire('click');                // advance
    if (seen === 2) break;
  }
  if (seen !== 2) throw new Error('did not reach both leads in ' + guard + ' rounds');
  return counts.due + ' asked, ' + counts.implied + ' implied of ' + cards.length + '; falar|2 (most missed) led and confirmed its siblings at level 1; a missed lead reclaimed +3';
});

step('a miss makes only that form shaky; one right answer clears it', function () {
  Store.resetTopic('imperfeito');
  var cards = topicCards(topicById('imperfeito'));
  cards.forEach(function (c) {           // simulate a fully mastered, fresh topic
    Store.markMastered('imperfeito', c.id);
    Store.recordAnswer('imperfeito', c.id, true);
  });
  var missed = cards[0];
  Store.recordAnswer('imperfeito', missed.id, false);
  goTo('#browse'); goTo('#imperfeito');
  // the verb's other forms are fresh and mastered: they are NOT dragged back in
  var total = parseInt(registry.statTotal.textContent, 10);
  if (total !== 1) throw new Error('deck has ' + total + ' cards, expected just the missed form');
  if (!/· 1 shaky$/.test(registry.focoChip.innerHTML)) throw new Error('chip reads "' + registry.focoChip.innerHTML + '"');
  Store.recordAnswer('imperfeito', missed.id, true);   // one right answer -> back on the ladder
  if (Store.cardState('imperfeito', missed.id) !== 'ok' || Store.reviewLevel('imperfeito', missed.id) !== 1)
    throw new Error('after the fix-up: ' + Store.cardState('imperfeito', missed.id) + ' / level ' + Store.reviewLevel('imperfeito', missed.id));
  goTo('#browse'); goTo('#imperfeito');
  if (!/Tudo em dia/.test(registry.cardArea.innerHTML))
    throw new Error('deck did not empty after the fix-up');
  return 'miss -> 1 shaky card (fresh siblings left alone); one hit -> level 1, deck empty';
});

step('a shaky form drags its UNSEEN siblings in, cap or no cap', function () {
  var cards = topicCards(topicById('imperfeito'));
  var missed = cards[0];
  var lex = String(missed.id).split('|')[0];
  var siblings = cards.filter(function (c) { return c.id !== missed.id && String(c.id).split('|')[0] === lex; });
  // forget the siblings entirely (never seen), then miss the form again
  var snap = Store.snapshot();
  siblings.forEach(function (c) { delete snap.mastered.imperfeito[c.id]; delete snap.strength.imperfeito[c.id]; });
  Store.applySynced(snap);
  Store.setPref('newPerDay', 1);                      // a cap the drag must ignore
  Store.recordAnswer('imperfeito', missed.id, false);
  goTo('#browse'); goTo('#imperfeito');
  var total = parseInt(registry.statTotal.textContent, 10);
  if (total !== 1 + siblings.length)
    throw new Error('deck has ' + total + ' cards, expected the missed form + its ' + siblings.length + ' unseen siblings');
  siblings.forEach(function (c) {
    if (Quiz._tierOf(c.id) !== 'shaky') throw new Error('sibling "' + c.id + '" is in tier ' + Quiz._tierOf(c.id));
  });
  if (Quiz._counts().new !== 0) throw new Error('unseen siblings leaked into the new tier: ' + JSON.stringify(Quiz._counts()));
  Store.setPref('newPerDay', NEW_PER_DAY);
  Store.recordAnswer('imperfeito', missed.id, true);   // tidy up for the steps that follow
  siblings.forEach(function (c) { Store.markMastered('imperfeito', c.id); Store.recordAnswer('imperfeito', c.id, true); });
  return 'miss -> the form + ' + siblings.length + ' unseen forms of "' + lex + '" in the shaky tier, past a cap of 1';
});

step('a mastered card comes back for review once it goes stale', function () {
  var cards = topicCards(topicById('imperfeito'));
  var snap = Store.snapshot();
  snap.strength.imperfeito[cards[5].id].t -= (REVIEW_INTERVALS[0] + 1);
  Store.applySynced(snap);
  goTo('#browse'); goTo('#imperfeito');
  var total = parseInt(registry.statTotal.textContent, 10);
  if (total !== 1) throw new Error('expected exactly the stale card, got ' + total);
  return '"' + cards[5].id + '" resurfaced after ' + REVIEW_INTERVALS[0] + '+ days';
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
  Sync._setCode('abcdefghijklmnop');
  var ep = Sync._endpoint();
  if (!/\/abcdefghijklmnop$/.test(ep) || /\/ingles/.test(ep)) throw new Error('endpoint is "' + ep + '"');
  // the code lives in the shared (both-apps) localStorage key, not in this app's prefs
  if (localStorage.getItem('fg:syncCode') !== 'abcdefghijklmnop') throw new Error('shared key not written');
  if (Store.getPref('syncCode', '')) throw new Error('code leaked into the per-app pref');
  Sync._setCode('');
  if (localStorage.getItem('fg:syncCode') !== null) throw new Error('off did not clear the shared key');
  // a pre-1.11 device kept the code in its own prefs: adopted once, pref retired
  Store.setPref('syncCode', 'legacycode1234567');
  ep = Sync._endpoint();
  if (!/\/legacycode1234567$/.test(ep)) throw new Error('legacy code not adopted: ' + ep);
  if (localStorage.getItem('fg:syncCode') !== 'legacycode1234567') throw new Error('legacy code not migrated');
  if (Store.getPref('syncCode', '')) throw new Error('legacy pref not retired');
  Sync._setCode('');
  if (Sync._endpoint().slice(-1) !== '/') throw new Error('code survived off: ' + Sync._endpoint());
  return 'init saves survived (nudge=1); no network attempted; off-state dot + tooltip; bare key endpoint; ' +
         'code in shared fg:syncCode, legacy pref migrated then retired';
});

step('the footer shows the app version', function () {
  var text = registry.buildInfo.textContent;
  if (!/^v\d+\.\d+\.\d+/.test(text)) throw new Error('build info reads "' + text + '"');
  if (text !== 'v' + APP_VERSION) throw new Error('stub has no lastModified, expected bare version');
  return '"' + text + '" (date suffix needs document.lastModified, absent in the stub)';
});

step('sync merge is conservative: union mastery, keep cards shaky', function () {
  var a = { mastered: { nouns: { x: 1 } },
            strength: { presente: { 'ser|0': { s: 3, m: 1, t: 20660, l: 3, i: 20650 }, 'ir|2': { s: 2, m: 2 },
                                    'dar|1': { s: 1, m: 0, t: 20660 } } },
            daily: { '20260821': { attempts: [1, 0], failed: [false, false], solved: [true, false], current: 1 } } };
  var b = { mastered: { nouns: { y: 1 } },
            strength: { presente: { 'ser|0': { s: 0, m: 1, t: 20655, l: 0, i: 20652 },
                                    'dar|1': { s: 4, m: 0, t: 20661, l: 3 } } },
            daily: { '20260821': { attempts: [1, 2], failed: [false, true], solved: [true, false], current: 1 } } };
  var m = Sync._merge(a, b);
  if (!m.mastered.nouns.x || !m.mastered.nouns.y) throw new Error('mastery not unioned');
  var ser = m.strength.presente['ser|0'];
  if (ser.s !== 0 || ser.m !== 1 || ser.t !== 20660 || ser.l !== 0 || ser.i !== 20650)
    throw new Error('ser|0 merged to ' + JSON.stringify(ser));
  var ir = m.strength.presente['ir|2'];
  if (ir.s !== 2 || ir.m !== 2) throw new Error('one-sided entry not kept: ' + JSON.stringify(ir));
  // a pre-1.12 record (no `l`) counts as level 1, so the merged level is the lower rung
  var dar = m.strength.presente['dar|1'];
  if (dar.l !== 1 || dar.t !== 20661 || 'i' in dar) throw new Error('dar|1 merged to ' + JSON.stringify(dar));
  var d = m.daily['20260821'];
  if (d.attempts[1] !== 2 || d.failed[1] !== true || d.solved[0] !== true)
    throw new Error('daily merged to ' + JSON.stringify(d));
  return 'graduated-on-A but just-missed-on-B stays shaky at level 0; earliest intro day kept; legacy level = 1; daily merged element-wise';
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

/* ---------------------------------------------------- the habit loop (1.18) */

step('every answer feeds the day log; a drill answer makes its tab one of the learner\'s own', function () {
  Store.resetAll();
  Store.setPref('newPerDay', 2);          // a two-card deck, so the done screen is reachable below
  goTo('#adverbs');                       // routing re-renders the top bar widget
  if (registry.goalBtn.hidden !== true) throw new Error('goal widget shown on an empty profile');
  if (Store.isActiveTopic('adverbs')) throw new Error('mounting a tab already made it active');
  var before = Quiz.todayGoal();
  if (before.active !== 0) throw new Error('goal counts tabs before any answer: ' + JSON.stringify(before));
  var card = shownCard('adverbs');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  var d = Store.today();
  if (Store.answeredOn(d) !== 1) throw new Error('day log reads ' + Store.answeredOn(d));
  if (!Store.isActiveTopic('adverbs')) throw new Error('drilled tab not active');
  var g = Quiz.todayGoal();
  if (g.active !== 1 || g.done !== 1 || g.left !== 1)
    throw new Error('goal after one hit: ' + JSON.stringify({ active: g.active, done: g.done, left: g.left }));
  if (registry.goalBtn.hidden) throw new Error('goal widget still hidden');
  if (!/🔥1/.test(registry.goalBtn.innerHTML)) throw new Error('streak not shown: ' + registry.goalBtn.innerHTML);
  if (!/>1<\/text>/.test(registry.goalBtn.innerHTML)) throw new Error('ring does not show 1 left: ' + registry.goalBtn.innerHTML);
  return 'day log 1; adverbs active; goal 1 done / 1 left; ring "1", 🔥1';
});

step('the done screen says "all caught up" when the learner\'s tabs are empty, and points at the tabs that are not', function () {
  registry.actionBtn.fire('click');          // advance
  var card = shownCard('adverbs');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  registry.actionBtn.fire('click');
  var html = registry.cardArea.innerHTML;
  if (!/done-screen/.test(html)) throw new Error('no done screen');
  if (!/today-line caught-up/.test(html) || !/Tudo em dia por hoje/.test(html))
    throw new Error('done screen lacks the caught-up line: ' + html.slice(-400));
  if (!/1-day streak/.test(html)) throw new Error('streak missing from the caught-up line');
  if (!/goal-btn done/.test(registry.goalBtn.className) || !/✓/.test(registry.goalBtn.innerHTML))
    throw new Error('ring not in its done state: ' + registry.goalBtn.className + ' ' + registry.goalBtn.innerHTML);
  // the Daily does not take a tab up: a single subjunctive card there must not add 20 new cards to the goal
  Store.recordAnswer('subjuntivo', topicCards(topicById('subjuntivo'))[0].id, true);
  if (Store.isActiveTopic('subjuntivo')) throw new Error('an answer outside a drill made the tab active');
  // another drilled tab with work left shows up as a link, fullest first
  Store.markDrilled('nouns');
  App.refreshGoal();
  var g = Quiz.todayGoal();
  if (g.active !== 2 || g.left !== 2 || g.per[0].topic.id !== 'nouns')
    throw new Error('goal with nouns active: ' + JSON.stringify({ active: g.active, left: g.left, first: g.per[0].topic.id }));
  if (!/>2<\/text>/.test(registry.goalBtn.innerHTML)) throw new Error('ring not showing 2 left');
  Quiz.rerender();
  html = registry.cardArea.innerHTML;
  if (!/Still today:/.test(html) || !/data-tab="nouns"[^>]*>Nouns <b>2<\/b>/.test(html))
    throw new Error('done screen does not link the tab with work left: ' + html.slice(-400));
  Store.setPref('newPerDay', NEW_PER_DAY);
  return 'caught up + 🔥 1-day; Daily-only answer leaves subjuntivo out; nouns drilled -> "Still today: Nouns 2", ring 2';
});

step('a tab last drilled over ' + ACTIVE_DAYS + ' days ago leaves the goal', function () {
  var snap = Store.snapshot();
  var d = Store.today();
  snap.drilled = { adverbs: d - ACTIVE_DAYS, nouns: d - ACTIVE_DAYS - 1 };
  Store.applySynced(snap);
  if (!Store.isActiveTopic('adverbs')) throw new Error('exactly ' + ACTIVE_DAYS + ' days ago should still count');
  if (Store.isActiveTopic('nouns')) throw new Error(ACTIVE_DAYS + 1 + ' days ago still active');
  return 'day ' + ACTIVE_DAYS + ' in, day ' + (ACTIVE_DAYS + 1) + ' out';
});

step('the streak counts consecutive days, forgives one gap, breaks on two, and survives an undone today', function () {
  var d = Store.today();
  function withDays(map) {
    var snap = Store.snapshot();
    var days = {};
    Object.keys(map).forEach(function (k) { days[d - Number(k)] = map[k]; });
    snap.days = days;
    Store.applySynced(snap);
    return Store.streak();
  }
  var st = withDays({ 0: 3, 1: 2, 3: 1 });          // today, yesterday, gap, three days ago
  if (st.n !== 3 || !st.today || st.atRisk) throw new Error('gap forgiven: ' + JSON.stringify(st));
  st = withDays({ 0: 1, 1: 1, 4: 1 });              // two missed days end the run
  if (st.n !== 2) throw new Error('double gap not a break: ' + JSON.stringify(st));
  st = withDays({ 1: 1, 2: 1 });                    // not yet today: yesterday's run still stands
  if (st.n !== 2 || st.today || st.atRisk) throw new Error('undone today: ' + JSON.stringify(st));
  st = withDays({ 2: 1, 3: 1 });                    // grace day spent: only today can save it
  if (st.n !== 2 || st.today || !st.atRisk) throw new Error('at-risk: ' + JSON.stringify(st));
  st = withDays({ 3: 1, 4: 1 });                    // two quiet days: gone
  if (st.n !== 0) throw new Error('streak survived two quiet days: ' + JSON.stringify(st));
  st = withDays({ 0: 5 });
  if (st.n !== 1 || !/🔥1/.test((App.refreshGoal(), registry.goalBtn.innerHTML)))
    throw new Error('single day: ' + JSON.stringify(st) + ' ' + registry.goalBtn.innerHTML);
  return '3 over a gap; double gap -> 2; undone today keeps 2; grace spent = at risk; two quiet days -> 0';
});

step('sync merges the day log and the drilled-tab stamps by taking the higher value', function () {
  var m = Sync._merge({ mastered: {}, strength: {}, daily: {}, days: { 20700: 4, 20701: 1 }, drilled: { presente: 20701 } },
                      { mastered: {}, strength: {}, daily: {}, days: { 20701: 3, 20702: 2 }, drilled: { presente: 20690, nouns: 20702 } });
  if (m.days[20700] !== 4 || m.days[20701] !== 3 || m.days[20702] !== 2) throw new Error('days merged to ' + JSON.stringify(m.days));
  if (m.drilled.presente !== 20701 || m.drilled.nouns !== 20702) throw new Error('drilled merged to ' + JSON.stringify(m.drilled));
  // a pre-1.18 blob without the sections merges cleanly
  var legacy = Sync._merge({ mastered: {}, strength: {}, daily: {} }, { mastered: {}, strength: {}, daily: {}, days: { 20700: 1 } });
  if (legacy.days[20700] !== 1 || Object.keys(legacy.drilled).length) throw new Error('legacy merge: ' + JSON.stringify(legacy));
  return 'days: 4/3/2; drilled: presente 20701, nouns 20702; legacy blob fine';
});

/* ------------------------------------------------- tiers + graduation (1.19) */

step('every drill tab carries a tier from 1 to 3', function () {
  var bad = TOPICS.filter(function (t) { return t.kind === 'quiz' && !(t.tier >= 1 && t.tier <= 3); });
  if (bad.length) throw new Error('no tier: ' + bad.map(function (t) { return t.id; }).join(', '));
  var order = TOPICS.filter(function (t) { return t.kind === 'quiz'; }).map(function (t) { return t.tier; }).join('');
  if (order !== '111122222233') throw new Error('tabs not stacked by tier: ' + order);
  if (TOPICS[0].id !== 'browse' || TOPICS[TOPICS.length - 1].id !== 'daily') throw new Error('Browse/Daily moved');
  var byTier = [1, 2, 3].map(function (n) {
    return n + ': ' + TOPICS.filter(function (t) { return t.tier === n; }).map(function (t) { return t.id; }).join(' ');
  });
  return byTier.join(' · ');
});

step('a tab graduates at 80% of its cards on review level 3, wears 🎓, and names the next tab once', function () {
  Store.resetAll();
  var t = topicById('adverbs');
  var cards = topicCards(t);
  var d = Store.today();
  var snap = Store.snapshot();
  snap.mastered.adverbs = {}; snap.strength.adverbs = {};
  var need = Math.ceil(cards.length * GRADUATE_SHARE);         // 23 of 28
  cards.slice(0, need - 1).forEach(function (c) {              // one short of the bar
    snap.mastered.adverbs[c.id] = 1;
    snap.strength.adverbs[c.id] = { s: 3, m: 0, t: d - 1, l: GRADUATE_LEVEL, i: d - 20 };
  });
  snap.drilled = { adverbs: d };
  Store.applySynced(snap);
  goTo('#adverbs');
  if (Quiz.graduation(t).qualifies) throw new Error('qualified one card short of the bar');
  if (!/data-tab="adverbs"[^>]*>Adverbs<span class="pct">\d+%</) throw new Error('tab should still show its %: ' + registry.tabs.innerHTML);
  if (!/goal-title">Intermediário</.test(registry.goalBtn.innerHTML)) throw new Error('title should be Intermediário (adverbs is tier 2): ' + registry.goalBtn.innerHTML);
  // the 23rd card: mastered at level 3 too — the bar is met, but no answer has stamped it yet
  var last = cards[need - 1];
  snap = Store.snapshot();
  snap.mastered.adverbs[last.id] = 1;
  snap.strength.adverbs[last.id] = { s: 3, m: 0, t: d - 1, l: GRADUATE_LEVEL, i: d - 20 };
  Store.applySynced(snap);
  App.refresh();
  if (!Quiz.graduation(t).qualifies) throw new Error('did not qualify at ' + need + '/' + cards.length);
  if (!/data-tab="adverbs"[^>]*>Adverbs<span class="pct">🎓</.test(registry.tabs.innerHTML)) throw new Error('no 🎓 on the tab: ' + registry.tabs.innerHTML);
  if (Store.graduatedOn('adverbs')) throw new Error('stamped before any answer');
  var next = Quiz.nextTopic(t);
  if (!next || next.tier !== 2 || next.id !== 'perfeito') throw new Error('next after adverbs: ' + (next && next.id));
  // the deck holds the 5 unseen cards; a correct answer stamps and celebrates
  var card = shownCard('adverbs');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  if (!Store.graduatedOn('adverbs')) throw new Error('not stamped after a correct answer');
  if (!/🎓 Adverbs graduated! Next: Passado/.test(registry.toast.textContent)) throw new Error('toast reads "' + registry.toast.textContent + '"');
  registry.toast.textContent = '';
  registry.actionBtn.fire('click');
  card = shownCard('adverbs');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  if (registry.toast.textContent) throw new Error('celebrated twice: ' + registry.toast.textContent);
  // a miss on a graduated card makes it shaky: the cap comes off until it is earned back
  Store.recordAnswer('adverbs', cards[0].id, false);
  App.updateTabPct('adverbs');
  if (Quiz.graduation(t).qualifies) throw new Error('still qualifies with a shaky card at 22/28');
  if (Store.graduatedOn('adverbs') === 0) throw new Error('the stamp should survive a slip');
  Store.resetTopic('adverbs');
  if (Store.graduatedOn('adverbs')) throw new Error('reset kept the stamp');
  return need + '/' + cards.length + ' -> 🎓 + title Intermediário; answer stamps once, toast names Passado; a miss lifts the cap; reset clears the stamp';
});

step('with tier-3 progress the title reads Avançado; graduation stamps merge to the earliest day', function () {
  var snap = Store.snapshot();
  snap.drilled = { subjuntivo: Store.today() };
  Store.applySynced(snap);
  App.refreshGoal();
  if (!/goal-title">Avançado</.test(registry.goalBtn.innerHTML)) throw new Error(registry.goalBtn.innerHTML);
  var m = Sync._merge({ mastered: {}, strength: {}, daily: {}, graduated: { presente: 20700 } },
                      { mastered: {}, strength: {}, daily: {}, graduated: { presente: 20690, nouns: 20701 } });
  if (m.graduated.presente !== 20690 || m.graduated.nouns !== 20701) throw new Error(JSON.stringify(m.graduated));
  return 'Avançado; graduated: presente 20690, nouns 20701';
});

step('today\'s goal is the reviews owed plus at most GOAL_NEW new cards in total, not every tab\'s intake', function () {
  Store.resetAll();
  var d = Store.today();
  var snap = Store.snapshot();
  // six drilled tabs with nothing due: the old ring would have demanded 6 x 20 new cards
  snap.drilled = { presente: d, perfeito: d, imperfeito: d, nouns: d, adjectives: d, connecting: d };
  Store.applySynced(snap);
  var g = Quiz.todayGoal();
  if (g.reviews !== 0) throw new Error('reviews owed on a fresh profile: ' + g.reviews);
  if (g.fresh !== GOAL_NEW || g.left !== GOAL_NEW) throw new Error('new allowance: ' + JSON.stringify({ fresh: g.fresh, left: g.left }));
  if (g.per[0].topic.id !== 'presente' || g.per[0].fresh !== GOAL_NEW) throw new Error('allowance should go to the first tab in order: ' + JSON.stringify(g.per.map(function (p) { return p.topic.id + ':' + p.fresh; })));
  // reviews are owed in full on top: 3 due nouns
  snap = Store.snapshot();
  snap.mastered.nouns = {}; snap.strength.nouns = {};
  topicCards(topicById('nouns')).slice(0, 3).forEach(function (c) {
    snap.mastered.nouns[c.id] = 1; snap.strength.nouns[c.id] = { s: 1, m: 0, l: 1, t: d - 8, i: d - 8 };
  });
  Store.applySynced(snap);
  g = Quiz.todayGoal();
  if (g.reviews !== 3 || g.left !== GOAL_NEW + 3) throw new Error('with 3 due: ' + JSON.stringify({ reviews: g.reviews, left: g.left }));
  // new cards got right today spend the allowance
  snap = Store.snapshot();
  snap.strength.presente = {}; snap.mastered.presente = {};
  topicCards(topicById('presente')).slice(0, 4).forEach(function (c) {
    snap.mastered.presente[c.id] = 1; snap.strength.presente[c.id] = { s: 1, m: 0, l: 1, t: d, i: d };
  });
  Store.applySynced(snap);
  g = Quiz.todayGoal();
  if (g.fresh !== GOAL_NEW - 4 || g.done !== 4) throw new Error('after 4 new done: ' + JSON.stringify({ fresh: g.fresh, done: g.done }));
  Store.setPref('goalNew', 0);
  g = Quiz.todayGoal();
  if (g.fresh !== 0 || g.left !== 3) throw new Error('goalNew=0 should leave reviews only: ' + JSON.stringify({ fresh: g.fresh, left: g.left }));
  Store.setPref('goalNew', GOAL_NEW);
  return '6 fresh tabs -> ' + GOAL_NEW + ' new (to presente), not 120; +3 due -> ' + (GOAL_NEW + 3) + '; 4 new done -> ' + (GOAL_NEW - 4) + ' new left; goalNew=0 -> reviews only';
});

step('a backlog of misses is capped at GOAL_MAX a day and the rest waits; dragged-in siblings count as new', function () {
  Store.resetAll();
  var d = Store.today();
  var cards = topicCards(topicById('presente'));
  var snap = Store.snapshot();
  snap.drilled = { presente: d };
  snap.strength.presente = {}; snap.mastered.presente = {};
  var missed = cards.slice(0, 200);                 // 200 forms missed and never recovered
  missed.forEach(function (c) { snap.strength.presente[c.id] = { s: 0, m: 1, l: 0, i: d - 30 }; });
  Store.applySynced(snap);
  var g = Quiz.todayGoal();
  if (g.left !== GOAL_MAX || g.reviews !== GOAL_MAX || g.fresh !== 0)
    throw new Error('200 shaky: ' + JSON.stringify({ left: g.left, reviews: g.reviews, fresh: g.fresh }));
  if (g.waiting !== 200 - GOAL_MAX) throw new Error('waiting ' + g.waiting);
  App.refreshGoal();
  if (!/beyond today/.test(registry.goalBtn.getAttribute('title'))) throw new Error('tooltip: ' + registry.goalBtn.getAttribute('title'));
  // 30 right today closes the ring even though 170 still wait; the state says so instead of "Tudo em dia"
  snap = Store.snapshot();
  missed.slice(0, GOAL_MAX).forEach(function (c) { snap.mastered.presente[c.id] = 1; snap.strength.presente[c.id] = { s: 1, m: 1, l: 1, t: d, i: d - 30 }; });
  Store.applySynced(snap);
  g = Quiz.todayGoal();
  if (g.left !== 0 || g.done !== GOAL_MAX || g.waiting !== 200 - GOAL_MAX) throw new Error('after 30: ' + JSON.stringify({ left: g.left, done: g.done, waiting: g.waiting }));
  App.refreshGoal();
  if (!/goal-btn done/.test(registry.goalBtn.className)) throw new Error('ring not closed');
  if (!/Daily goal done! 170 reviews still wait/.test(registry.goalBtn.getAttribute('title'))) throw new Error('tooltip: ' + registry.goalBtn.getAttribute('title'));
  // one missed verb form drags its unseen siblings into the deck's shaky tier — the goal counts them as new
  Store.resetTopic('presente');
  snap = Store.snapshot();
  snap.strength.presente = {}; snap.mastered.presente = {};
  var ser = cards.filter(function (c) { return c.id.indexOf('ser|') === 0; });
  snap.strength.presente[ser[0].id] = { s: 0, m: 1, l: 0, i: d };
  Store.applySynced(snap);
  g = Quiz.todayGoal();
  var p = g.per[0];
  if (p.reviews !== 1 || p.fresh !== GOAL_NEW) throw new Error('one miss + siblings: ' + JSON.stringify({ reviews: p.reviews, fresh: p.fresh, left: p.left }));
  goTo('#presente');
  var c = Quiz._counts();
  if (c.shaky !== ser.length) throw new Error('the deck should still hold the form + its ' + (ser.length - 1) + ' unseen siblings as shaky, got ' + c.shaky);
  return '200 missed -> goal ' + GOAL_MAX + ', 170 wait; 30 right closes it ("still wait", not Tudo em dia); ser miss = 1 review + siblings as new, deck tier unchanged';
});

/* ------------------------------------------------ the Daily's own streak (1.20) */

step('the Daily keeps a permanent log: strict streak in the header and the share string, first-try distribution', function () {
  Store.resetAll();
  function keyOf(d) { return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return keyOf(d); }
  var snap = Store.snapshot();
  snap.dailyDone = {}; snap.dailyDone[daysAgo(1)] = 5; snap.dailyDone[daysAgo(2)] = 7;
  // a finished pre-1.20 result still in the 30-day window backfills the log; an unfinished one does not
  snap.daily = {};
  snap.daily[daysAgo(3)] = { attempts: [1, 2, 1, 5, 1, 1, 3], failed: [false, false, false, true, false, false, false],
                             solved: [true, true, true, false, true, true, true], current: 6 };
  snap.daily[daysAgo(4)] = { attempts: [1, 0, 0, 0, 0, 0, 0], failed: [false, false, false, false, false, false, false],
                             solved: [true, false, false, false, false, false, false], current: 1 };
  Store.applySynced(snap);
  var hist = Store.dailyHistory();
  if (hist[daysAgo(3)] !== 4 || (daysAgo(4) in hist)) throw new Error('backfill: ' + JSON.stringify(hist));
  goTo('#daily');
  if (!/🔥 3-day streak — finish today to keep it/.test(registry.view.innerHTML))
    throw new Error('header lacks the streak at stake: ' + (registry.view.innerHTML.match(/<p>[^<]*<\/p>/) || [''])[0]);
  // give up on all seven: a finished day, 0 first-try
  var guard = 0;
  while (registry.giveUpBtn && guard++ < 20) { registry.giveUpBtn.fire('click'); flushTimers(); if (registry.actionBtn) registry.actionBtn.fire('click'); }
  var html = registry.view.innerHTML;
  if (!/done-screen/.test(html)) throw new Error('daily not finished after ' + guard + ' give-ups');
  hist = Store.dailyHistory();
  if (hist[keyOf(new Date())] !== 0) throw new Error('today not logged: ' + JSON.stringify(hist));
  if (!/0\/7 solved\n🔥 4-day streak\nfalagringo\.com\/#daily/.test(registry.view.innerHTML))
    throw new Error('share string: ' + registry.view.innerHTML);
  if (!/4 Dailies played · 🔥 4-day streak/.test(html)) throw new Error('stats line missing: ' + html.slice(-900));
  var rows = html.match(/daily-dist-row/g) || [];
  if (rows.length !== 8) throw new Error(rows.length + ' distribution rows');
  if (!/daily-dist-row today"><span class="daily-dist-n">0</.test(html)) throw new Error('today\'s row (0 first-try) not marked');
  // a gap breaks the strict streak; day one alone never reaches the share string
  snap = Store.snapshot();
  snap.dailyDone = {}; snap.dailyDone[keyOf(new Date())] = 0; snap.dailyDone[daysAgo(2)] = 7;   // today's result stays saved, so the mount lands on the done screen
  Store.applySynced(snap);
  Daily.mount();
  if (/🔥 \d+-day streak\nfalagringo/.test(registry.view.innerHTML)) throw new Error('a 1-day run leaked into the share string');
  if (!/3 Dailies played · 🔥 1-day streak/.test(registry.view.innerHTML)) throw new Error('stats after the gap: ' + (registry.view.innerHTML.match(/daily-stats-line">[^<]*/) || [''])[0]);
  var m = Sync._merge({ mastered: {}, strength: {}, daily: {}, dailyDone: { 20260901: 3 } },
                      { mastered: {}, strength: {}, daily: {}, dailyDone: { 20260901: 5, 20260902: 2 } });
  if (m.dailyDone[20260901] !== 5 || m.dailyDone[20260902] !== 2) throw new Error('merge: ' + JSON.stringify(m.dailyDone));
  return 'backfilled 3 days -> header "3-day streak, finish today"; 7 give-ups -> 0/7, "4-day streak" in the share string, 8 rows, today marked; gap -> 1, not shared; merge by max';
});

/* --------------------------------------------------------- milestones (1.21) */

step('milestones are earned once with a toast, and the goal ring opens the progress sheet', function () {
  Store.resetAll();
  Store.setPref('newPerDay', NEW_PER_DAY); Store.setPref('goalNew', GOAL_NEW); Store.setPref('goalMax', GOAL_MAX);
  goTo('#nouns');
  App.refreshGoal();
  if (Milestones.check().length) throw new Error('a fresh profile earned something');
  var ids = Milestones.list().map(function (m) { return m.id; });
  ['first', 'm100', 's7', 'top', 'grad1', 'tier1', 'tier2', 'tier3', 'verb', 'daily7', 'dstreak7'].forEach(function (id) {
    if (ids.indexOf(id) < 0) throw new Error('main app lacks milestone ' + id + ': ' + ids.join(','));
  });
  // the first correct answer earns "first card" — announced once
  registry.toast.textContent = '';
  var card = shownCard('nouns');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  if (!Store.milestoneOn('first')) throw new Error('first card not stamped');
  if (!/🏅 🌱 First card/.test(registry.toast.textContent)) throw new Error('toast: "' + registry.toast.textContent + '"');
  registry.toast.textContent = '';
  registry.actionBtn.fire('click');
  card = shownCard('nouns');
  registry.answerInput.value = card.answer;
  registry.actionBtn.fire('click');
  if (registry.toast.textContent) throw new Error('announced again: ' + registry.toast.textContent);
  // seeded standing: 120 mastered, a 7-day streak, a level-5 card, a perfect Daily, a whole verb at level 3
  var d = Store.today();
  var snap = Store.snapshot();
  var nouns = topicCards(topicById('nouns'));
  snap.mastered.presente = {}; snap.strength.presente = {};
  topicCards(topicById('presente')).slice(0, 120).forEach(function (c) { snap.mastered.presente[c.id] = 1; snap.strength.presente[c.id] = { s: 1, m: 0, l: 1, t: d, i: d }; });
  for (var k = 0; k < 7; k++) snap.days[d - k] = 1;
  var lastP = topicCards(topicById('presente')).slice(-1)[0];          // not one of ser's forms, which the loop below sets to level 3
  snap.mastered.presente[lastP.id] = 1;
  snap.strength.presente[lastP.id] = { s: 5, m: 0, l: 5, t: d, i: d - 200 };
  snap.dailyDone = {}; snap.dailyDone['20260901'] = 7;
  ['presente', 'perfeito', 'imperfeito', 'subjuntivo'].forEach(function (tid) {
    snap.mastered[tid] = snap.mastered[tid] || {}; snap.strength[tid] = snap.strength[tid] || {};
    topicCards(topicById(tid)).filter(function (c) { return c.id.indexOf('ser|') === 0; }).forEach(function (c) {
      snap.mastered[tid][c.id] = 1; snap.strength[tid][c.id] = { s: 3, m: 0, l: 3, t: d - 1, i: d - 30 };
    });
  });
  Store.applySynced(snap);
  var fresh = Milestones.check().map(function (m) { return m.id; }).sort().join(',');
  if (fresh !== 'daily7,m100,s7,top,verb') throw new Error('earned: ' + fresh);
  if (Milestones.check().length) throw new Error('earned twice');
  // the sheet: tier, streak, today's tab links, milestone grid with dates
  registry.goalBtn.fire('click');
  if (registry.sheet.hidden) throw new Error('sheet did not open');
  var html = registry.sheet.innerHTML;
  if (!/sheet-tier">Iniciante</.test(html)) throw new Error('sheet lacks the tier: ' + html.slice(0, 400));
  if (!/7-day streak/.test(html)) throw new Error('sheet lacks the streak');
  var earned = (html.match(/class="ms earned"/g) || []).length, locked = (html.match(/class="ms locked"/g) || []).length;
  if (earned !== 6 || locked !== ids.length - 6) throw new Error(earned + ' earned / ' + locked + ' locked of ' + ids.length);
  if (!/data-ms="m100"[^>]*>.*?earned \d+ \w+ \d{4}</.test(html)) throw new Error('earned card lacks its date');
  if (!/data-ms="s30"[^>]*>.*?A month of showing up/.test(html)) throw new Error('locked card lacks its description');
  if (!/data-tab="nouns"/.test(html)) throw new Error('sheet lacks the tab link for today');
  // a tab link routes and closes the sheet; the ring toggles it
  goTo('#nouns');
  if (!registry.sheet.hidden) throw new Error('sheet still open after routing');
  registry.goalBtn.fire('click'); registry.goalBtn.fire('click');
  if (!registry.sheet.hidden) throw new Error('second tap did not close the sheet');
  var m = Sync._merge({ mastered: {}, strength: {}, daily: {}, milestones: { first: 20700 } },
                      { mastered: {}, strength: {}, daily: {}, milestones: { first: 20690, s7: 20705 } });
  if (m.milestones.first !== 20690 || m.milestones.s7 !== 20705) throw new Error('merge: ' + JSON.stringify(m.milestones));
  return 'first card toasted once; seed -> daily7,m100,s7,top,verb; sheet: Iniciante, 7-day, 6/' + ids.length + ' earned, dates + descriptions, tab link; merge by earliest';
});

step('the progress sheet shows a 12-week heatmap read from the day log', function () {
  Store.resetAll();
  var d = Store.today();
  var snap = Store.snapshot();
  snap.days = {}; snap.days[d] = 5; snap.days[d - 1] = 12; snap.days[d - 2] = 35; snap.days[d - 3] = 70; snap.days[d - 90] = 9;   // the last one falls outside the window
  Store.applySynced(snap);
  App.openSheet();
  var html = registry.sheet.innerHTML;
  var cells = (html.match(/class="hm-cell" data-l="\d"(?: data-today="1")? title=/g) || []).length;   // grid cells only, not the legend swatches
  var future = (html.match(/hm-cell future/g) || []).length;
  if (cells + future !== 84) throw new Error(cells + ' cells + ' + future + ' future != 84');
  var wd = (new Date(d * 86400000 + new Date(d * 86400000).getTimezoneOffset() * 60000).getDay() + 6) % 7;
  if (future !== 6 - wd) throw new Error('future cells ' + future + ' for weekday ' + wd);
  if (!/4 of \d+ days practised · 122 answers/.test(html)) throw new Error('summary: ' + (html.match(/hm-summary">[^<]*/) || [''])[0]);
  var levels = (html.match(/data-l="(\d)"(?: data-today="1")? title=/g) || []).map(function (m) { return m.match(/data-l="(\d)"/)[1]; });
  if (levels.slice(-4).join('') !== '4321') throw new Error('last four days shade as ' + levels.slice(-4).join(''));
  if (!/data-l="1" data-today="1" title="[^"]*· 5 answers"/.test(html)) throw new Error('today not outlined with its count');
  App.closeSheet();
  return '84 cells, ' + future + ' future; 4 of ' + (84 - future) + ' days, 122 answers; shades 4-3-2-1 ending today';
});

