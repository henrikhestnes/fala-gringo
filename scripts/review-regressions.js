/* Shared regression coverage for the review fixes. Runs in all three app stubs. */
step('newer answers win sync conflicts; reset markers reject older snapshots', function () {
  Store.resetAll();
  const topic = TOPICS.find(t => t.kind === 'quiz');
  const card = topicCards(topic)[0];
  Store.recordAnswer(topic.id, card.id, false);
  const missed = Store.snapshot();
  Store.markMastered(topic.id, card.id);
  Store.recordAnswer(topic.id, card.id, true);
  const recovered = Store.snapshot();
  const merged = ProgressState.merge(missed, recovered);
  if (merged.strength[topic.id][card.id].s !== 1 || merged.strength[topic.id][card.id].l !== 1) throw new Error('stale miss won');
  Store.resetTopic(topic.id);
  Store.applySynced(ProgressState.merge(Store.snapshot(), recovered));
  if (Store.masteredCount(topic.id)) throw new Error('reset resurrected');
  Store.markMastered(topic.id, card.id);
  const afterReset = Store.snapshot();
  if (!ProgressState.merge(recovered, afterReset).mastered[topic.id][card.id]) throw new Error('new progress after reset lost');
  return 'later retry survives; reset stays reset; new work after reset survives';
});

step('concurrent offline misses remain shaky regardless of device clock skew', function () {
  const common = { s: 1, m: 0, l: 1, t: Store.today() - 8, u: 1, v: { shared: 1 } };
  const hit = Object.assign({}, common, { s: 2, l: 2, u: 90000, v: { shared: 1, fastDevice: 90000 } });
  const miss = Object.assign({}, common, { s: 0, m: 1, l: 0, u: 2, v: { shared: 1, slowDevice: 2 } });
  const a = { strength: { topic: { card: hit } } }, b = { strength: { topic: { card: miss } } };
  const merged = ProgressState.merge(a, b).strength.topic.card;
  if (merged.s !== 0 || merged.l !== 0) throw new Error('clock skew hid a concurrent miss');
  const retry = Object.assign({}, merged, { s: 1, l: 1, u: 90001, v: Object.assign({}, merged.v, { fastDevice: 90001 }) });
  const recovered = ProgressState.merge({ strength: { topic: { card: merged } } }, { strength: { topic: { card: retry } } }).strength.topic.card;
  if (recovered.s !== 1 || recovered.l !== 1) throw new Error('observed miss could not be recovered');
  return 'concurrent miss wins; causally later retry recovers it';
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

step('a short session limits actual cards and supplies answer labels and live feedback', function () {
  Store.resetAll();
  Store.setPref('foco', true);
  Store.setPref('mic', false);
  const topic = TOPICS.find(t => t.kind === 'quiz');
  registry.view.dataset.topic = '';
  Quiz.mount(topic, 5);
  if (+registry.statTotal.textContent !== 5) throw new Error('not five cards');
  if (Store.introducedToday(topic.id) !== 5) throw new Error('introduced unseen cards outside short session');
  if (!/for="answerInput"/.test(registry.cardArea.innerHTML) || !/aria-live="polite"/.test(registry.cardArea.innerHTML)) throw new Error('answer accessibility markup missing');
  return 'five cards introduced; labeled input and announced feedback';
});

step('new local events advance beyond imported reset and Daily clocks', function () {
  Store.resetAll();
  const future = Date.now() + 1000000;
  const seed = Store.snapshot();
  seed.resets.all = future;
  seed.daily.clockTest = { version: 2, u: future + 100, cards: [{ topic: 'test', id: 'old' }], attempts: [0], solved: [false], current: 0 };
  Store.applySynced(seed);
  Store.setDaily('clockTest', { version: 2, cards: [{ topic: 'test', id: 'new' }], attempts: [0], solved: [false], current: 0 });
  if (Store.getDaily('clockTest').cards[0].id !== 'new' || Store.getDaily('clockTest').u <= future + 100) throw new Error('imported clock prevented Daily replacement');
  Store.resetAll();
  if (Store.snapshot().resets.all <= future + 100) throw new Error('reset failed to advance clock');
  return 'replacement and reset remain newer after clock skew';
});
