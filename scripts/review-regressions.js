/* Shared regression coverage for the review fixes. Runs in all three app stubs. */
step('a hit AFTER a miss clears shaky through a merge, a miss after a hit keeps it; reset markers reject older snapshots', function () {
  Store.resetAll();
  const topic = TOPICS.find(t => t.kind === 'quiz');
  const card = topicCards(topic)[0];
  Store.recordAnswer(topic.id, card.id, false);
  const missed = Store.snapshot();
  Store.markMastered(topic.id, card.id);
  Store.recordAnswer(topic.id, card.id, true);
  const recovered = Store.snapshot();
  // The server (or another tab) still holds the miss; the newer record is the
  // correct answer. The merge must not take the older streak — that made a
  // card answered right come back shaky on every sync round (1.26.2).
  [ProgressState.merge(missed, recovered), ProgressState.merge(recovered, missed)].forEach(m => {
    const r = m.strength[topic.id][card.id];
    if (r.s !== 1 || r.l !== 1 || r.m !== 1) throw new Error('a later correct answer was merged back into shaky: ' + JSON.stringify(r));
  });
  // And the other way round: a miss recorded after the hit is the latest event.
  Store.recordAnswer(topic.id, card.id, false);
  const missedAgain = Store.snapshot();
  [ProgressState.merge(recovered, missedAgain), ProgressState.merge(missedAgain, recovered)].forEach(m => {
    const r = m.strength[topic.id][card.id];
    if (r.s !== 0 || r.l !== 0 || r.m !== 2) throw new Error('a later miss was merged away: ' + JSON.stringify(r));
  });
  Store.resetTopic(topic.id);
  Store.applySynced(ProgressState.merge(Store.snapshot(), recovered));
  if (Store.masteredCount(topic.id)) throw new Error('reset resurrected');
  Store.markMastered(topic.id, card.id);
  const afterReset = Store.snapshot();
  if (!ProgressState.merge(recovered, afterReset).mastered[topic.id][card.id]) throw new Error('new progress after reset lost');
  return 'a later hit clears shaky, a later miss keeps it; reset stays reset; new work after reset survives';
});

step('the strength merge is conservative WITHOUT event stamps: a miss on either side keeps the card shaky, in either order', function () {
  const d = Store.today();
  const hit = { s: 2, m: 0, l: 2, t: d - 1 };
  const miss = { s: 0, m: 1, l: 0, t: d - 8 };
  const a = { strength: { topic: { card: hit } } }, b = { strength: { topic: { card: miss } } };
  const ab = ProgressState.merge(a, b).strength.topic.card;
  const ba = ProgressState.merge(b, a).strength.topic.card;
  [ab, ba].forEach(m => {
    if (m.s !== 0 || m.m !== 1 || m.l !== 0) throw new Error('a miss was merged away: ' + JSON.stringify(m));
  });
  if (JSON.stringify(ab) !== JSON.stringify(ba)) throw new Error('merge order matters: ' + JSON.stringify(ab) + ' vs ' + JSON.stringify(ba));
  return 'miss wins both ways: s 0, m 1, l 0';
});

step('local writes reconcile other tabs and retain independent writer journals', function () {
  Store.resetAll();
  const topic = TOPICS.find(t => t.kind === 'quiz');
  const cards = topicCards(topic);
  const external = Store.snapshot();
  external.mastered[topic.id] = { [cards[0].id]: 1 };
  const foreignKey = STORE_KEY + ':tab:test-other';
  localStorage.setItem(foreignKey, JSON.stringify(external));
  // Canonical snapshot can have been overwritten by a racing tab. Its journal
  // must still be read by the next writer, even before a storage event arrives.
  Store.setPref('theme', 'dark');
  Store.markMastered(topic.id, cards[1].id);
  const stored = JSON.parse(localStorage.getItem(STORE_KEY));
  if (!stored.mastered[topic.id][cards[0].id] || !stored.mastered[topic.id][cards[1].id]) throw new Error('lost a tab’s progress');
  localStorage.removeItem(foreignKey);
  return 'both cards preserved across canonical overwrite';
});

step('extra practice does not advance or postpone scheduled reviews; inference is not activity', function () {
  Store.resetAll();
  const topic = TOPICS.find(t => t.kind === 'quiz');
  const cards = topicCards(topic), d = Store.today();
  const seed = Store.snapshot();
  seed.mastered[topic.id] = { [cards[0].id]: 1, [cards[1].id]: 1 };
  seed.strength[topic.id] = { [cards[0].id]: { s: 4, m: 0, l: 4, t: d - 1 }, [cards[1].id]: { s: 1, m: 0, l: 1, t: d - 8 } };
  seedState(seed);
  Store.recordAnswer(topic.id, cards[0].id, true);
  Store.recordAnswer(topic.id, cards[1].id, true, 0, true, true);
  // Force a merge of identical snapshots to ensure explicit a=0 survives.
  Store.applySynced(ProgressState.merge(Store.snapshot(), Store.snapshot()));
  const out = Store.snapshot();
  if (out.strength[topic.id][cards[0].id].l !== 4 || out.strength[topic.id][cards[0].id].t !== d - 1) throw new Error('early practice changed review schedule');
  if (Store.answeredOn(d) !== 1 || Store.doneToday(topic.id) !== 1) throw new Error('inferred review counted as an answer');
  if (out.strength[topic.id][cards[1].id].t !== d) throw new Error('implied clock not reset');
  return 'one real answer counted; due clock preserved on extra practice';
});

step('backup round-trip validates language and malformed data; storage failure is visible', function () {
  Store.resetAll();
  const topic = TOPICS.find(t => t.kind === 'quiz'), card = topicCards(topic)[0];
  Store.markMastered(topic.id, card.id);
  const backup = Store.exportBackup();
  if (/syncCode/.test(backup)) throw new Error('sync secret exported');
  Store.importBackup(backup);
  if (!Store.isMastered(topic.id, card.id)) throw new Error('round trip lost progress');
  const foreign = JSON.parse(backup); foreign.app = 'another-language';
  let rejected = 0;
  try { Store.importBackup(JSON.stringify(foreign)); } catch (_) { rejected++; }
  const broken = JSON.parse(backup); broken.data.strength = { [topic.id]: { bad: null } };
  try { Store.importBackup(JSON.stringify(broken)); } catch (_) { rejected++; }
  if (rejected !== 2) throw new Error('invalid backup accepted');
  const write = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('quota'); };
  Store.setPref('test-storage', true);
  if (!Store.storageFailed() || registry.storageWarning.hidden) throw new Error('failure not visible');
  localStorage.setItem = write;
  Store.setPref('test-storage', false);
  if (Store.storageFailed() || !registry.storageWarning.hidden) throw new Error('recovery not reflected');
  return 'secret-free export; invalid imports rejected; storage warning recovers';
});

step('voice selection: an empty list speaks by language, Portuguese takes pt-BR only, the others their family; one notice a session', function () {
  const synth = window.speechSynthesis;
  const spoken = [];
  const fake = voices => ({ getVoices: () => voices, cancel() {}, speak(u) { spoken.push(u); if (u.onend) u.onend(); } });
  const origToast = showToast;
  let toasts = 0;
  showToast = function (m) { toasts++; return origToast(m); };
  try {
    // 1. no voices listed yet (Chrome before voiceschanged, an iOS home-screen app): speak, lang set, no notice
    window.speechSynthesis = fake([]);
    let done = 0;
    speak('primeiro', null, () => { done++; });
    if (done !== 1 || spoken.length !== 1 || spoken[0].lang !== TTS_LANG || spoken[0].voice) throw new Error('empty list did not speak by language');
    if (!registry.voiceWarning.hidden || toasts) throw new Error('empty list raised the missing-voice notice');
    // 2. voices listed, none acceptable: refuse, explain once, in words
    const family = TTS_LANG.slice(0, 2);
    const wrong = family === 'pt' ? [{ lang: 'pt-PT', name: 'Joana' }, { lang: 'pt', name: 'Bare Portuguese' }]
                                  : [{ lang: 'de-DE', name: 'Anna' }, { lang: 'pt-BR', name: 'Luciana' }];
    window.speechSynthesis = fake(wrong);
    loadVoices();
    if (ttsVoice) throw new Error('unacceptable voice selected: ' + ttsVoice.lang);
    speak('segundo', null, () => { done++; });
    speak('terceiro', null, () => { done++; });
    if (done !== 3 || spoken.length !== 1) throw new Error('spoke with an unacceptable voice');
    if (registry.voiceWarning.hidden || !registry.voiceWarning.textContent) throw new Error('missing voice not explained');
    if (/\b[a-z]{2}-[A-Z]{2}\b/.test(registry.voiceWarning.textContent)) throw new Error('raw locale code in the notice: ' + registry.voiceWarning.textContent);
    if (toasts !== 1) throw new Error('notice toasted ' + toasts + ' times for two cards');
    // 3. acceptable: the exact locale in any spelling; pt-BR variants; en/nb same-family fallback (and the no-NO alias)
    const ok = family === 'pt' ? [{ lang: 'pt_BR', name: 'Luciana' }]
             : family === 'en' ? [{ lang: 'en-GB', name: 'Daniel' }]
             : [{ lang: 'no-NO', name: 'Nora' }];
    window.speechSynthesis = fake(ok);
    loadVoices();
    if (!ttsVoice) throw new Error('acceptable voice refused: ' + JSON.stringify(ok));
    speak('quarto', null, () => { done++; });
    if (spoken.length !== 2 || spoken[1].voice !== ttsVoice || !registry.voiceWarning.hidden) throw new Error('acceptable voice not used / notice not cleared');
    if (family === 'pt') {
      window.speechSynthesis = fake([{ lang: 'pt-BR-x-sfb', name: 'Francisca' }]);
      loadVoices();
      if (!ttsVoice) throw new Error('pt-BR-x-… variant refused');
    }
  } finally {
    window.speechSynthesis = synth;
    showToast = origToast;
    registry.voiceWarning.hidden = true;
  }
  return 'empty list → spoke with lang=' + TTS_LANG + '; wrong voices refused, one notice in words; acceptable spellings/family taken';
});

step('settings validate goals and dialogs move and restore focus', function () {
  registry.settingsBtn.focus();
  registry.settingsBtn.fire('click');
  if (registry.sheet.hidden || document.activeElement !== registry.sheetHeading) throw new Error('dialog did not receive focus');
  if (!registry.settingsForm || !registry.importBackup || !registry.exportBackup) throw new Error('settings incomplete');
  registry['setting-goalMax'].value = '5'; registry['setting-goalNew'].value = '6'; registry['setting-newPerDay'].value = '20';
  registry.settingsForm.fire('submit', { preventDefault() {} });
  const invalid = registry.settingsStatus.textContent;
  registry['setting-goalNew'].value = '2';
  registry.settingsForm.fire('submit', { preventDefault() {} });
  if (Store.goalMax() !== 5 || Store.goalNew() !== 2 || registry.settingsStatus.textContent === invalid) throw new Error('settings did not validate/save');
  App.closeSheet();
  if (document.activeElement !== registry.settingsBtn) throw new Error('focus not returned');
  Store.setPref('goalMax', GOAL_MAX); Store.setPref('goalNew', GOAL_NEW);
  // Safari never focuses a clicked button (activeElement is body): the opener is still known
  document.activeElement = document.body;
  registry.goalBtn.fire('click');
  if (registry.sheet.hidden) throw new Error('progress sheet did not open');
  App.closeSheet();
  if (document.activeElement !== registry.goalBtn) throw new Error('focus did not fall back to the ring: ' + (document.activeElement && document.activeElement.id));
  // a tab link followed from inside the sheet: focus lands on the selected tab, not back on the ring
  const drill = TOPICS.filter(t => t.kind === 'quiz')[1] || TOPICS.find(t => t.kind === 'quiz');
  registry.goalBtn.fire('click');
  window.location.hash = '#' + drill.id;
  (window._h.hashchange || []).forEach(fn => fn());
  if (!registry.sheet.hidden) throw new Error('sheet still open after the tab link');
  if (document.activeElement !== registry['tab-' + drill.id]) throw new Error('focus after a sheet tab link is on ' + (document.activeElement && document.activeElement.id));
  return 'goal controls saved; focus enters dialog, returns to its opener (body-activeElement too), lands on the tab after a sheet link';
});

step('a mounted drill supplies answer labels and live feedback', function () {
  Store.resetAll();
  Store.setPref('foco', true);
  Store.setPref('mic', false);
  const topic = TOPICS.find(t => t.kind === 'quiz');
  registry.view.dataset.topic = '';
  Quiz.mount(topic);
  if (!/for="answerInput"/.test(registry.cardArea.innerHTML) || !/aria-live="polite"/.test(registry.cardArea.innerHTML)) throw new Error('answer accessibility markup missing');
  return 'labeled input and announced feedback';
});

step('new local events advance beyond imported reset and Daily clocks', function () {
  Store.resetAll();
  const future = Date.now() + 1000000;
  const seed = Store.snapshot();
  seed.resets.all = future;
  seed.daily.clockTest = { version: 2, cards: [{ topic: 'test', id: 'old' }], attempts: [0], solved: [false], current: 0 };
  Store.applySynced(seed);
  Store.setDaily('clockTest', { version: 2, cards: [{ topic: 'test', id: 'new' }], attempts: [0], solved: [false], current: 0 });
  if (Store.getDaily('clockTest').cards[0].id !== 'new') throw new Error('imported Daily prevented its local replacement');
  Store.resetAll();
  if (Store.snapshot().resets.all <= future) throw new Error('reset failed to advance past the imported clock');
  return 'local Daily replaces the imported one; a reset stamps past an imported future clock';
});

step('Foco offers every eligible review regardless of the daily goal size', function () {
  Store.resetAll();
  Store.setPref('foco', true); Store.setPref('mic', false);
  Store.setPref('goalMax', 5);
  const t = TOPICS.filter(t => t.kind === 'quiz').sort((a, b) => topicCards(b).length - topicCards(a).length)[0];
  const cards = topicCards(t), d = Store.today();
  const seed = Store.snapshot();
  seed.mastered[t.id] = {}; seed.strength[t.id] = {};
  cards.slice(0, 40).forEach((c, i) => {
    seed.mastered[t.id][c.id] = 1;
    // Missed cards exercise the backlog without inferred sibling compression.
    seed.strength[t.id][c.id] = { s: 0, m: 1, l: 0, t: d - 10, i: d - 20 };
  });
  seedState(seed);
  Quiz.mount(t);
  if (Quiz._counts().shaky !== 40 || Number(registry.statTotal.textContent) < 40) throw new Error('daily goal capped the review queue');
  if (Store.introducedToday(t.id) !== Quiz._counts().new + Quiz._counts().verify) throw new Error('intake was not recorded');
  const c = shownCard(t.id);
  registry.answerInput.value = c.answer; registry.actionBtn.fire('click'); registry.actionBtn.fire('click');
  if (!registry.answerInput || /done-screen/.test(registry.cardArea.innerHTML)) throw new Error('review queue ended early');
  Quiz.toggleFocus();
  if (Number(registry.statTotal.textContent) !== cards.length) throw new Error('Foco off no longer offers whole topic');
  Store.setPref('goalMax', GOAL_MAX); Store.setPref('foco', true);
  Store.resetAll();
  return '40 misses all included with a daily goal of 5; Foco off offers all';
});

step('Foco orders due reviews leech first, then most overdue, then worst lifetime ratio; shaky by ratio', function () {
  Store.resetAll();
  Store.setPref('foco', true); Store.setPref('mic', false);
  // cards without an inference pattern, so implyDue cannot thin the due tier
  const t = TOPICS.filter(t => t.kind === 'quiz').find(t => topicCards(t).filter(c => !c.infer).length >= 5);
  const [easy, hard, leech, shakyMild, shakyBad] = topicCards(t).filter(c => !c.infer).slice(0, 5);
  const d = Store.today();
  const seed = Store.snapshot();
  seed.mastered[t.id] = {}; seed.strength[t.id] = {};
  [easy, hard, leech, shakyMild, shakyBad].forEach(c => { seed.mastered[t.id][c.id] = 1; });
  seed.strength[t.id][easy.id]  = { s: 5, m: 0, c: 5, l: 1, t: d - 9 };   // 2 days overdue, never missed
  seed.strength[t.id][hard.id]  = { s: 1, m: 2, w: 2, c: 2, l: 1, t: d - 9 };   // 2 days overdue, half missed
  seed.strength[t.id][leech.id] = { s: 1, m: 5, w: 5, c: 3, l: 1, t: d - 8 };   // 1 day overdue, but a leech
  seed.strength[t.id][shakyMild.id] = { s: 0, m: 1, w: 1, c: 9, l: 0, t: d - 3 };
  seed.strength[t.id][shakyBad.id]  = { s: 0, m: 3, w: 3, c: 3, l: 0, t: d - 3 };
  seedState(seed);
  Quiz.mount(t);
  if (Quiz._counts().due !== 3 || Quiz._counts().shaky !== 2) throw new Error('tiers: ' + JSON.stringify(Quiz._counts()));
  const order = [];
  for (let k = 0; k < 5; k++) {
    const c = shownCard(t.id);
    order.push(c.id);
    registry.answerInput.value = c.answer; registry.actionBtn.fire('click');
    if (k === 0 && !(/tally-tag/.test(registry.feedback.innerHTML) && /leech-tag/.test(registry.feedback.innerHTML)))
      throw new Error('the leech\'s answer line lacks its tally or tag: ' + registry.feedback.innerHTML);
    registry.actionBtn.fire('click');
  }
  const want = [leech.id, hard.id, easy.id, shakyBad.id, shakyMild.id];
  if (order.join('\n') !== want.join('\n')) throw new Error('deck order ' + JSON.stringify(order) + ', wanted ' + JSON.stringify(want));
  return 'leech → half-missed → clean, then the worse shaky card first; tally + tricky tag shown';
});

step('the statistics page (#stats) renders from the store: forecast and tab summary match the records, one row per tab', function () {
  Store.resetAll();
  const t = TOPICS.filter(t => t.kind === 'quiz')[0];
  const cards = topicCards(t).slice(0, 4), d = Store.today();
  const seed = Store.snapshot();
  seed.mastered[t.id] = {}; seed.strength[t.id] = {};
  cards.forEach(c => { seed.mastered[t.id][c.id] = 1; });
  seed.strength[t.id][cards[0].id] = { s: 2, m: 0, c: 2, l: 1, t: d - 9 };    // due now
  seed.strength[t.id][cards[1].id] = { s: 0, m: 1, w: 1, c: 1, l: 0, t: d - 1 };    // shaky: now
  seed.strength[t.id][cards[2].id] = { s: 1, m: 0, c: 1, l: 1, t: d - 6 };    // due tomorrow
  seed.strength[t.id][cards[3].id] = { s: 3, m: 0, c: 3, l: 3, t: d - 10 };   // 30-day rung: due in 20
  seed.days[d] = 4; seed.right[d] = 3;
  seedState(seed);
  const f = Stats.forecast();
  if (f.now !== 2 || f.days[1] !== 1 || f.later !== 1 || f.week !== 1 || f.month !== 2) throw new Error('forecast ' + JSON.stringify(f));
  const sum = Stats.tabSummary(t);
  if (sum.mastered !== 4 || sum.counts[1] !== 1 || sum.counts[2] !== 2 || sum.counts[4] !== 1 || sum.right !== 7 || sum.total !== 8)
    throw new Error('summary ' + JSON.stringify(sum));
  window.location.hash = '#stats';
  App.refresh();
  const html = document.getElementById('view').innerHTML;
  [' class="stats-page"', 'stat-bar', 'fc-col now', 'hm-grid', STATS_STRINGS.secTabs, STATS_STRINGS.secForecast, STATS_STRINGS.secActivity, '88%', '75%']
    .forEach(s => { if (!html.includes(s)) throw new Error('stats page lacks ' + JSON.stringify(s)); });
  const rows = (html.match(/class="stat-row"/g) || []).length, tabs = TOPICS.filter(x => x.kind === 'quiz').length;
  if (rows !== tabs) throw new Error(rows + ' rows for ' + tabs + ' drill tabs');
  if (document.getElementById('view').dataset.topic !== 'stats') throw new Error('view not marked as the stats page');
  window.location.hash = '';
  App.refresh();
  if (document.getElementById('view').dataset.topic === 'stats') throw new Error('leaving #stats did not re-route');
  return 'forecast 2 now / 1 tomorrow / 1 later; 88% on the tab, 75% today; ' + rows + ' rows';
});

step('Foco introduces distinct words and defers siblings across misses, reloads, extra batches and days', function () {
  const grouped = TOPICS.filter(t => t.kind === 'quiz' && topicCards(t).some(c => c.id.indexOf('|') >= 0));
  const originalNow = Date.now;
  try {
    Store.setPref('foco', true); Store.setPref('mic', false); Store.setPref('newPerDay', 4);
    grouped.forEach(t => {
      Store.resetAll();
      const cards = topicCards(t), key = c => c.id.split('|')[0];
      const admitted = () => cards.filter(c => Quiz._tierOf(c.id) === 'new' || Quiz._tierOf(c.id) === 'verify');
      // Mixed topics (Pronominais) begin with independent gap cards; isolate
      // the related-form pool so tomorrow actually exercises siblings.
      const seed = Store.snapshot();
      seed.mastered[t.id] = {}; seed.strength[t.id] = {};
      cards.filter(c => c.id.indexOf('|') < 0).forEach(c => {
        seed.mastered[t.id][c.id] = 1;
        seed.strength[t.id][c.id] = { s: 1, m: 0, l: 3, t: Store.today() - 1 };
      });
      seedState(seed);
      Quiz.mount(t);
      const first = admitted(), words = new Set(first.map(key));
      if (first.length !== 4 || words.size !== 4 || Store.introducedToday(t.id) !== 4)
        throw new Error(t.id + ': four new cards must be four words');
      const forms = list => new Set(list.map(c => c.id.split('|').pop()));
      if (forms(first).size < 2) throw new Error(t.id + ': first intake only includes one person/form');
      if (first.every(c => /\|[0-3]$/.test(c.id)) && forms(first).size !== 4)
        throw new Error(t.id + ': first four verbs do not cover all four persons');
      if (topicGroups(t).length > 1) {
        Quiz.toggleGroup(first[0].group);
        if (admitted().some(c => key(c) === key(first[0]))) throw new Error(t.id + ': filter admitted a reserved sibling');
        Quiz.toggleGroup(first[0].group);
        if (admitted().map(c => c.id).join() !== first.map(c => c.id).join()) throw new Error(t.id + ': filters changed intake');
      }
      const missed = shownCard(t.id);
      registry.answerInput.value = 'zzzzzzzzzz'; registry.actionBtn.fire('click'); registry.actionBtn.fire('click');
      if (key(shownCard(t.id)) === key(missed)) throw new Error(t.id + ': miss immediately cued a sibling');
      Quiz.mount(t);
      if (Quiz._tierOf(missed.id) !== 'shaky' || admitted().length !== 3) throw new Error(t.id + ': miss/reload changed intake');
      cards.forEach(c => {
        if (c.id !== missed.id && key(c) === key(missed) && Quiz._tierOf(c.id)) throw new Error(t.id + ': missed form recruited a sibling');
      });
      first.forEach(c => { Store.markMastered(t.id, c.id); Store.recordAnswer(t.id, c.id, true); });
      Quiz.mount(t);
      if (Number(registry.statTotal.textContent) !== 0) throw new Error(t.id + ': finishing refilled intake');
      registry.moreNewBtn.fire('click');
      const extra = admitted();
      if (extra.length !== 4 || new Set(extra.map(key)).size !== 4 || extra.some(c => words.has(key(c))))
        throw new Error(t.id + ': extra batch repeated a word');
      if (forms(extra).size < 2) throw new Error(t.id + ': extra intake only includes one person/form');
      Quiz.mount(t);
      if (admitted().map(c => c.id).join() !== extra.map(c => c.id).join()) throw new Error(t.id + ': reload changed extra intake');
      Date.now = () => originalNow() + 86400000;
      Quiz.mount(t);
      if (!admitted().some(c => words.has(key(c)) && !first.some(f => f.id === c.id)))
        throw new Error(t.id + ': siblings did not become available tomorrow');
      if (new Set(admitted().map(key)).size !== admitted().length) throw new Error(t.id + ': tomorrow repeated a word');
      Date.now = originalNow;
    });
    return grouped.length + ' topics: four cards = four words; missed card returns; reload/extra batch preserve separation; siblings unlock tomorrow';
  } finally {
    Date.now = originalNow;
    Store.setPref('newPerDay', NEW_PER_DAY); Store.resetAll();
  }
});

step('legacy whole-word intake and reviews cannot cue a new sibling', function () {
  try {
    Store.setPref('foco', true); Store.setPref('newPerDay', 4);
    const t = TOPICS.find(t => t.kind === 'quiz' && topicCards(t).some(c => c.id.indexOf('|') >= 0));
    const cards = topicCards(t), key = cards[0].id.split('|')[0];
    const siblings = cards.filter(c => c.id.split('|')[0] === key);
    Store.resetAll();
    Store.markIntroduced(t.id, siblings.map(c => c.id));
    Quiz.mount(t);
    if (siblings.filter(c => Quiz._tierOf(c.id)).length !== 1) throw new Error('legacy intake still asks several forms');
    const lead = siblings.find(c => Quiz._tierOf(c.id));
    Store.recordAnswer(t.id, lead.id, false);
    Quiz.mount(t);
    if (siblings.some(c => c.id !== lead.id && Quiz._tierOf(c.id))) throw new Error('legacy sibling admitted after miss');
    Store.resetAll();
    const seed = Store.snapshot(), d = Store.today();
    seed.mastered[t.id] = { [lead.id]: 1 };
    seed.strength[t.id] = { [lead.id]: { s: 1, m: 0, l: 1, t: d - 8, a: d - 8 } };
    seedState(seed);
    Quiz.mount(t);
    if (Quiz._tierOf(lead.id) !== 'due' || siblings.some(c => c.id !== lead.id && Quiz._tierOf(c.id)))
      throw new Error('due review admitted an unseen sibling');
    Store.recordAnswer(t.id, lead.id, true);
    Quiz.mount(t);
    if (siblings.some(c => Quiz._tierOf(c.id))) throw new Error('completed review unlocked a sibling today');
    return 'old whole-word reservations thinned; misses, due reviews and completed reviews defer unseen siblings';
  } finally {
    Store.setPref('newPerDay', NEW_PER_DAY); Store.resetAll();
  }
});

step('with no fresh word left, the extra batch admits held-back siblings, one per word, and offers them again after a reload', function () {
  try {
    Store.setPref('foco', true); Store.setPref('mic', false); Store.setPref('newPerDay', 4);
    const key = c => c.id.split('|')[0];
    // two words with the most forms (verbs: 4 persons at the root, 2 tenses in the subpages)
    const wordsOf = t => {
      const cs = topicCards(t), size = w => cs.filter(c => key(c) === w).length;
      return [...new Set(cs.filter(c => c.id.indexOf('|') >= 0).map(key))].filter(w => size(w) >= 2)
        .sort((a, b) => size(b) - size(a)).slice(0, 2);
    };
    const t = TOPICS.find(t => t.kind === 'quiz' && wordsOf(t).length === 2);
    const cards = topicCards(t), d = Store.today(), words = wordsOf(t);
    const third = words.every(w => cards.filter(c => key(c) === w).length >= 3);
    const answered = words.map(w => cards.find(c => key(c) === w));
    // the whole tab mastered and fresh, except two words: one form answered today, the rest unseen
    const seed = Store.snapshot();
    seed.mastered[t.id] = {}; seed.strength[t.id] = {};
    cards.filter(c => !words.includes(key(c)) || answered.includes(c)).forEach(c => {
      seed.mastered[t.id][c.id] = 1;
      seed.strength[t.id][c.id] = answered.includes(c) ? { s: 1, m: 0, l: 1, t: d, a: d, f: d, i: d }
                                                       : { s: 1, m: 0, l: 3, t: d - 1, a: d - 1 };
    });
    seedState(seed);
    const admitted = () => cards.filter(c => Quiz._tierOf(c.id) === 'new' || Quiz._tierOf(c.id) === 'verify');
    Quiz.mount(t);
    if (admitted().length) throw new Error('siblings of words answered today entered the regular deck');
    if (!registry.moreNewBtn) throw new Error('no extra batch offered for the held-back siblings');
    registry.moreNewBtn.fire('click');
    const extra = admitted();
    if (extra.length !== 2 || new Set(extra.map(key)).size !== 2 || extra.some(c => !words.includes(key(c)) || answered.includes(c)))
      throw new Error('extra batch should be one unseen sibling per word: ' + extra.map(c => c.id).join());
    Quiz.mount(t);
    if (admitted().length) throw new Error('held-back siblings leaked into the regular deck on reload');
    registry.moreNewBtn.fire('click');
    if (admitted().map(c => c.id).sort().join() !== extra.map(c => c.id).sort().join())
      throw new Error('reload did not offer the same unfinished siblings again');
    extra.forEach(c => { Store.markMastered(t.id, c.id); Store.recordAnswer(t.id, c.id, true); });
    Quiz.mount(t);
    if (!third) {
      if (registry.cardArea.innerHTML.indexOf('moreNewBtn') >= 0) throw new Error('extra batch offered with nothing left');
      return t.id + ': ' + extra.length + ' held-back siblings admitted on request and re-offered after reload';
    }
    registry.moreNewBtn.fire('click');
    const next = admitted();
    if (!next.length || next.some(c => extra.includes(c) || answered.includes(c)) || new Set(next.map(key)).size !== next.length)
      throw new Error('a second extra batch did not move on to the next siblings');
    return t.id + ': ' + extra.length + ' held-back siblings admitted on request, re-offered after reload, then ' + next.length + ' more';
  } finally {
    Store.setPref('newPerDay', NEW_PER_DAY); Store.resetAll();
  }
});
