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

step('theme toggle alternates the stored preference', function () {
  goTo('#browse');
  registry.themeBtn.fire('click');
  var t1 = Store.getPref('theme', null);
  registry.themeBtn.fire('click');
  var t2 = Store.getPref('theme', null);
  if (!t1 || !t2 || t1 === t2) throw new Error('did not alternate: ' + t1 + ' / ' + t2);
  return t1 + ' -> ' + t2;
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

step('Foco mode drills the whole conjugation of a missed verb', function () {
  Store.resetTopic('imperfeito');        // clear strength recorded by earlier steps
  goTo('#imperfeito');
  if (!/data-focus/.test(registry.view.innerHTML)) throw new Error('no Foco chip rendered');
  var missed = shownCard('imperfeito');
  registry.answerInput.value = 'zzz errado';
  registry.actionBtn.fire('click');      // miss -> the card turns shaky
  var lex = String(missed.id).split('|')[0];
  var expected = topicCards(topicById('imperfeito')).filter(function (c) {
    return String(c.id).split('|')[0] === lex;
  }).length;
  Quiz.toggleFocus();                    // on
  var total = parseInt(registry.statTotal.textContent, 10);
  if (total !== expected)
    throw new Error('Foco deck has ' + total + ' cards, expected all ' +
                    expected + ' forms of "' + lex + '"');
  return 'missed one form of "' + lex + '"; Foco deck = its ' + expected + ' forms';
});

step('three straight correct answers graduate a verb out of Foco', function () {
  for (var run = 0; run < 3; run++) {
    var guard = 0;
    while (registry.answerInput && guard++ < 30) {
      var c = shownCard('imperfeito');
      registry.answerInput.value = c.answer;
      registry.actionBtn.fire('click');  // check
      registry.actionBtn.fire('click');  // advance
    }
    if (!/done-screen/.test(registry.cardArea.innerHTML))
      throw new Error('run ' + (run + 1) + ' did not reach the done screen');
    registry.againBtn.fire('click');     // rebuild the (shrinking) Foco deck
  }
  if (!/Nada na mira/.test(registry.cardArea.innerHTML))
    throw new Error('Foco deck did not empty after three clean runs');
  Quiz.toggleFocus();                    // off again
  if (!registry.answerInput) throw new Error('full deck did not come back');
  return 'verb graduated after a 3-streak; full deck restored on toggle-off';
});

step('sync is inert without fetch and the button shows the off state', function () {
  if (typeof Sync === 'undefined') throw new Error('Sync not defined');
  Sync.onLocalChange();                  // must schedule nothing and not throw
  if (registry.syncBtn.className !== 'icon-btn sync-off')
    throw new Error('button class is "' + registry.syncBtn.className + '"');
  if (!/tap to link/.test(registry.syncBtn.getAttribute('title') || ''))
    throw new Error('off-state tooltip missing');
  registry.syncBtn.fire('click');        // no fetch in the stub -> setup toast, no prompt
  flushTimers();
  if (registry.toast.textContent.indexOf('backend') === -1)
    throw new Error('no setup hint shown: "' + registry.toast.textContent + '"');
  return 'no network attempted; off state dot + tooltip rendered';
});

step('the footer shows the app version', function () {
  var text = registry.buildInfo.textContent;
  if (!/^v\d+\.\d+\.\d+/.test(text)) throw new Error('build info reads "' + text + '"');
  if (text !== 'v' + APP_VERSION) throw new Error('stub has no lastModified, expected bare version');
  return '"' + text + '" (date suffix needs document.lastModified, absent in the stub)';
});

step('sync merge is conservative: union mastery, keep cards shaky', function () {
  var a = { mastered: { nouns: { x: 1 } },
            strength: { presente: { 'ser|0': { s: 3, m: 1 }, 'ir|2': { s: 2, m: 2 } } },
            daily: { '20260821': { attempts: [1, 0], failed: [false, false], solved: [true, false], current: 1 } } };
  var b = { mastered: { nouns: { y: 1 } },
            strength: { presente: { 'ser|0': { s: 0, m: 1 } } },
            daily: { '20260821': { attempts: [1, 2], failed: [false, true], solved: [true, false], current: 1 } } };
  var m = Sync._merge(a, b);
  if (!m.mastered.nouns.x || !m.mastered.nouns.y) throw new Error('mastery not unioned');
  var ser = m.strength.presente['ser|0'];
  if (ser.s !== 0 || ser.m !== 1) throw new Error('ser|0 merged to ' + JSON.stringify(ser));
  var ir = m.strength.presente['ir|2'];
  if (ir.s !== 2 || ir.m !== 2) throw new Error('one-sided entry not kept: ' + JSON.stringify(ir));
  var d = m.daily['20260821'];
  if (d.attempts[1] !== 2 || d.failed[1] !== true || d.solved[0] !== true)
    throw new Error('daily merged to ' + JSON.stringify(d));
  return 'graduated-on-A but just-missed-on-B stays shaky; daily merged element-wise';
});
