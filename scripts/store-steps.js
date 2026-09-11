/* Regression steps for the store's persistence rules (js/progress.js) and the
   shared state helpers (js/lib/state.js). Runs in all three app stubs — only
   the Store, ProgressState, TOPICS/topicCards and seedState are used. */

function firstQuizCards() {
  var topic = TOPICS.filter(function (t) { return t.kind === 'quiz'; })[0];
  return { topic: topic, cards: topicCards(topic) };
}

step('a stored blob with unknown fields is cleaned on read, never wiped on write', function () {
  Store.resetAll();
  var q = firstQuizCards();
  Store.markMastered(q.topic.id, q.cards[0].id);
  Store.recordAnswer(q.topic.id, q.cards[0].id, true);
  var blob = JSON.parse(localStorage.getItem(STORE_KEY));
  blob.strength[q.topic.id][q.cards[0].id].x = 'from a newer release';
  blob.futureSection = { a: 1 };
  blob.strength[q.topic.id]['garbage'] = null;
  localStorage.setItem(STORE_KEY, JSON.stringify(blob));
  Store.setPref('probe', 1);   // read-before-mutate folds the disk in, then writes
  if (!Store.isMastered(q.topic.id, q.cards[0].id)) throw new Error('progress wiped by a foreign field');
  var after = localStorage.getItem(STORE_KEY);
  if (/from a newer release|futureSection|"garbage"/.test(after)) throw new Error('unknown data not stripped: ' + after.slice(0, 200));
  if (Store.storageFailed()) throw new Error('a cleanable blob was reported as a storage failure');
  return 'unknown record field, unknown section and a null record stripped; mastery kept';
});

step('an unparseable blob is quarantined under <key>:bad:<time>, not overwritten', function () {
  localStorage.setItem(STORE_KEY, '{definitely not json');
  Store.setPref('probe', 2);
  var bad = null;
  for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf(STORE_KEY + ':bad:') === 0) bad = k; }
  if (!bad || localStorage.getItem(bad) !== '{definitely not json') throw new Error('broken blob not preserved');
  if (!JSON.parse(localStorage.getItem(STORE_KEY)).prefs) throw new Error('canonical not rewritten');
  localStorage.removeItem(bad);
  return 'raw blob moved to ' + bad.replace(/\d+$/, '<time>') + '; app started fresh';
});

step('a leftover per-tab journal is folded in and removed', function () {
  Store.resetAll();
  var q = firstQuizCards();
  var foreign = Store.snapshot();
  foreign.mastered[q.topic.id] = {}; foreign.mastered[q.topic.id][q.cards[1].id] = 1;
  localStorage.setItem(STORE_KEY + ':tab:old-preview', JSON.stringify(foreign));
  Store.markMastered(q.topic.id, q.cards[0].id);
  if (!Store.isMastered(q.topic.id, q.cards[1].id)) throw new Error('journal content lost');
  if (localStorage.getItem(STORE_KEY + ':tab:old-preview') !== null) throw new Error('journal key not removed');
  return 'journal merged, key gone';
});

step('the device id is stable across answers and causal vectors stay bounded', function () {
  Store.resetAll();
  var q = firstQuizCards();
  Store.recordAnswer(q.topic.id, q.cards[0].id, true);
  Store.recordAnswer(q.topic.id, q.cards[0].id, true);
  var rec = Store.snapshot().strength[q.topic.id][q.cards[0].id];
  var actors = Object.keys(rec.v || {});
  var device = localStorage.getItem('fg:device');
  if (actors.length !== 1 || actors[0] !== device) throw new Error('vector actors: ' + JSON.stringify(rec.v) + ' device ' + device);
  var snap = Store.snapshot();
  var v = {}; for (var i = 0; i < 12; i++) v['dev' + i] = 1000 + i;
  snap.strength[q.topic.id][q.cards[0].id].v = v;
  seedState(snap);
  Store.recordAnswer(q.topic.id, q.cards[0].id, true);
  var n = Object.keys(Store.snapshot().strength[q.topic.id][q.cards[0].id].v).length;
  if (n > 8) throw new Error('vector grew to ' + n + ' actors');
  return 'one actor per device (' + device + '); 12 actors capped to ' + n;
});

step('the streak forgives ONE gap per run — every other day is not a streak', function () {
  var d = Store.today();
  var snap = Store.snapshot();
  snap.days = {}; snap.days[d] = 1; snap.days[d - 2] = 1; snap.days[d - 4] = 1; snap.days[d - 6] = 1;
  seedState(snap);
  var st = Store.streak();
  if (st.n !== 2) throw new Error('alternate days counted as a ' + st.n + '-day streak');
  snap = Store.snapshot();
  snap.days = {}; snap.days[d] = 1; snap.days[d - 1] = 1; snap.days[d - 3] = 1; snap.days[d - 4] = 1;
  seedState(snap);
  if (Store.streak().n !== 4) throw new Error('one gap not forgiven: ' + Store.streak().n);
  return 'd, d-2, d-4, d-6 → 2; d, d-1, gap, d-3, d-4 → 4';
});

step('a verify hit spends the new-card allowance (first correct day, not the intake stamp)', function () {
  Store.resetAll();
  var q = firstQuizCards();
  var d = Store.today();
  Store.recordAnswer(q.topic.id, q.cards[0].id, true, 2);   // a verify card: never "introduced"
  if (Store.newDoneToday(q.topic.id) !== 1) throw new Error('verify hit not counted: ' + Store.newDoneToday(q.topic.id));
  Store.recordAnswer(q.topic.id, q.cards[0].id, true);
  if (Store.newDoneToday(q.topic.id) !== 1) throw new Error('a repeat counted twice');
  var rec = Store.snapshot().strength[q.topic.id][q.cards[0].id];
  if (rec.f !== d) throw new Error('first-correct day not stamped: ' + JSON.stringify(rec));
  var snap = Store.snapshot();
  snap.strength[q.topic.id][q.cards[1].id] = { s: 1, m: 0, l: 1, t: d, i: d };   // a pre-1.24 record
  snap.mastered[q.topic.id] = snap.mastered[q.topic.id] || {};
  snap.mastered[q.topic.id][q.cards[1].id] = 1;
  seedState(snap);
  if (Store.newDoneToday(q.topic.id) !== 2) throw new Error('legacy record fallback: ' + Store.newDoneToday(q.topic.id));
  return 'verify hit = 1 new done; repeat still 1; legacy record counted by its intake stamp';
});

step('a finished Daily\'s first-try score only ever improves', function () {
  Store.resetAll();
  Store.setDailyDone('20260101', 5);
  Store.setDailyDone('20260101', 3);
  if (Store.dailyHistory()['20260101'] !== 5) throw new Error('replay lowered the score');
  Store.setDailyDone('20260101', 7);
  if (Store.dailyHistory()['20260101'] !== 7) throw new Error('better score not kept');
  Store.resetAll();
  return '5, then 3 → 5; then 7 → 7';
});

step('merge is idempotent and stable() ignores key order', function () {
  var a = ProgressState.stable({ b: 1, a: { d: [1, { z: 1, y: 2 }], c: 2 } });
  var b = ProgressState.stable({ a: { c: 2, d: [1, { y: 2, z: 1 }] }, b: 1 });
  if (a !== b) throw new Error('stable differs: ' + a + ' vs ' + b);
  Store.resetAll();
  var q = firstQuizCards();
  Store.recordAnswer(q.topic.id, q.cards[0].id, true);
  Store.recordAnswer(q.topic.id, q.cards[1].id, false);
  var s = Store.snapshot();
  var once = ProgressState.merge(s, s), twice = ProgressState.merge(once, s);
  if (ProgressState.stable(once) !== ProgressState.stable(ProgressState.clean(s))) throw new Error('merge(s, s) != s');
  if (ProgressState.stable(twice) !== ProgressState.stable(once)) throw new Error('merge not idempotent');
  return 'stable() order-insensitive; merge(s,s) == clean(s)';
});

step('a reset drops what predates it but keeps what another device learned afterwards', function () {
  Store.resetAll();
  var q = firstQuizCards();
  Store.markMastered(q.topic.id, q.cards[0].id);
  Store.recordAnswer(q.topic.id, q.cards[0].id, true);
  var other = Store.snapshot();                    // device B, before the reset
  Store.resetTopic(q.topic.id);                    // device A resets the tab
  var cut = Store.snapshot().resets[q.topic.id];
  // B keeps drilling offline after A's reset: one new card
  other.mastered[q.topic.id][q.cards[1].id] = 1;
  other.strength[q.topic.id][q.cards[1].id] = { s: 1, m: 0, l: 1, t: Store.today(), u: cut + 5000, v: { devB: cut + 5000 } };
  var merged = ProgressState.merge(Store.snapshot(), other);
  var m = merged.mastered[q.topic.id] || {};
  if (m[q.cards[0].id]) throw new Error('pre-reset card resurrected');
  if (!m[q.cards[1].id] || !merged.strength[q.topic.id][q.cards[1].id]) throw new Error('post-reset offline work lost');
  return 'card learned before the reset gone; card learned after it kept';
});

step('a backup import merges by default and can RESTORE past an accidental reset', function () {
  Store.resetAll();
  var q = firstQuizCards();
  Store.markMastered(q.topic.id, q.cards[0].id);
  Store.recordAnswer(q.topic.id, q.cards[0].id, true);
  var backup = Store.exportBackup();
  Store.resetTopic(q.topic.id);
  Store.importBackup(backup);
  if (Store.masteredCount(q.topic.id) !== 0) throw new Error('a plain merge undid the reset');
  Store.importBackup(backup, 'restore');
  if (!Store.isMastered(q.topic.id, q.cards[0].id)) throw new Error('restore did not bring the card back');
  var again = ProgressState.merge(Store.snapshot(), JSON.parse(backup).data);   // and it survives a re-merge with the old file
  if (!again.mastered[q.topic.id][q.cards[0].id]) throw new Error('restored record lost on the next merge');
  return 'merge respects the reset; restore re-stamps the records so they outlive it';
});
