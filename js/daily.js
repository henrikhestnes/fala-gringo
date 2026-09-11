// One global Daily Challenge spanning every topic.
//
// The source repo had a separate daily per verb tense. Here there is a single
// challenge of 7 cards drawn from all twelve topics — at most one card per topic, so
// a day covers different concepts rather than seven conjugations of the same kind.
// Deterministic from the calendar date, 5 attempts per card, resumable.

const Daily = (function () {
  const SIZE = 7;
  const MAX_ATTEMPTS = 5;
  const EPOCH = new Date(2026, 7, 11);   // 11 Aug 2026 = Daily #1
  const SHARE_URL = 'falagringo.com/#daily';

  let cards = [];
  let attempts = [];
  let failed = [];
  let solved = [];
  let typed = [];      // the last text typed per card — the done screen names the synonym it reached for
  let current = 0;
  let answered = false;
  let key = '';

  function keyOf(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return '' + d.getFullYear() + m + day;
  }
  function todayKey() { return keyOf(new Date()); }

  /* Consecutive calendar days with a finished Daily, counted back from today —
     or from yesterday while today is still open, so the header can say what is
     at stake. Strict, Wordle-style: the Daily is the one thing here you either
     did today or did not (the drills' 🔥 in the top bar is the forgiving one). */
  function dailyStreak() {
    const hist = Store.dailyHistory();
    const d = new Date();
    const doneToday = keyOf(d) in hist;
    if (!doneToday) d.setDate(d.getDate() - 1);
    let n = 0;
    while (keyOf(d) in hist) { n++; d.setDate(d.getDate() - 1); }
    return { n: n, today: doneToday };
  }

  function streakLabel(n) { return '🔥 ' + n + '-day streak'; }

  /* Finished Dailies by first-try count, 7 down to 0 — the Wordle-style
     distribution — with today's row marked. */
  function distributionHtml(todayFirst) {
    const hist = Store.dailyHistory();
    const counts = new Array(SIZE + 1).fill(0);
    Object.keys(hist).forEach(k => { const v = Math.min(SIZE, Math.max(0, hist[k] | 0)); counts[v]++; });
    const max = Math.max(1, ...counts);
    const rows = [];
    for (let v = SIZE; v >= 0; v--) {
      rows.push('<div class="daily-dist-row' + (v === todayFirst ? ' today' : '') + '">' +
        '<span class="daily-dist-n">' + v + '</span>' +
        '<div class="daily-dist-track"><div class="daily-dist-bar" style="width:' +
          Math.round((counts[v] / max) * 100) + '%">' + (counts[v] || '') + '</div></div></div>');
    }
    return '<div class="daily-dist" aria-label="Dailies by cards solved on the first try">' + rows.join('') + '</div>';
  }

  /* The mounted challenge's own date, from its key — not the clock, so a page
     left open past midnight keeps naming the Daily it shows until rollDay(). */
  function keyDate() {
    const k = key || todayKey();
    return new Date(+k.slice(0, 4), +k.slice(4, 6) - 1, +k.slice(6, 8));
  }

  function dailyNumber() {
    return Math.round((keyDate() - EPOCH) / 86400000) + 1;
  }

  function formatDate() {
    const locale = document.documentElement.lang || 'en-GB';
    return keyDate().toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function seededShuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* 7 cards, each from a different topic, chosen deterministically for the date. */
  function pickCards() {
    const rng = seededRandom(parseInt(key, 10));
    const quizTopics = TOPICS.filter(t => t.kind === 'quiz');
    const chosen = seededShuffle(quizTopics, rng).slice(0, Math.min(SIZE, quizTopics.length));
    const out = [];
    chosen.forEach(t => {
      const pool = topicCards(t);
      if (!pool.length) return;
      const card = pool[Math.floor(rng() * pool.length)];
      out.push({ card: card, topicLabel: t.label });
    });
    // if there were fewer topics than SIZE, top up from the largest topic
    while (out.length < SIZE && quizTopics.length) {
      const t = quizTopics[Math.floor(rng() * quizTopics.length)];
      const pool = topicCards(t);
      const card = pool[Math.floor(rng() * pool.length)];
      if (!out.some(o => o.card.id === card.id && o.card.topic === card.topic)) {
        out.push({ card: card, topicLabel: t.label });
      }
    }
    return out;
  }

  function save() {
    Store.setDaily(key, {
      version: 2, cards: cards.map(e => ({ topic: e.card.topic, id: e.card.id })),
      attempts: attempts, failed: failed, solved: solved, current: current, typed: typed
    });
  }

  function mount() {
    key = todayKey();
    cards = pickCards();
    const saved = Store.getDaily(key);
    const history = Store.dailyHistory();
    if (saved && Array.isArray(saved.cards)) {
      const resolved = saved.cards.map(ref => {
        const topic = topicById(ref.topic);
        const card = topic && topicCards(topic).find(c => c.id === ref.id);
        return card ? { card: card, topicLabel: topic.label } : null;
      });
      if (resolved.length === SIZE && resolved.every(Boolean)) cards = resolved;
    }
    const identity = cards.map(e => ({ topic: e.card.topic, id: e.card.id }));
    const n = cards.length;
    const shaped = r => r && Array.isArray(r.attempts) && r.attempts.length === n &&
                        Array.isArray(r.solved) && Array.isArray(r.failed);
    // A pre-v2 record has no card IDs, so its positional answers cannot be
    // trusted against a possibly different content release — unless the day is
    // FINISHED (it is in the history): then the score is settled and the record
    // is adopted as a finished v2 record over today's cards, so an upgrade day
    // never becomes replayable and never overwrites a result.
    const legacyDone = !!(saved && !saved.cards && key in history && shaped(saved));
    if (legacyDone) Store.setDailyDone(key, history[key]);
    const usable = saved && ((saved.version === 2 && JSON.stringify(saved.cards) === JSON.stringify(identity) && shaped(saved)) || legacyDone);
    if (usable) {
      attempts = saved.attempts.slice();
      failed = saved.failed.slice();
      solved = saved.solved.slice();
      typed = cards.map((c, i) => (Array.isArray(saved.typed) && saved.typed[i]) || '');   // pre-1.23.4 records have none
      current = Math.min(Math.max(0, saved.current || 0), n - 1);
    } else {
      attempts = new Array(n).fill(0);
      failed = new Array(n).fill(false);
      solved = new Array(n).fill(false);
      typed = new Array(n).fill('');
      current = 0;
    }
    // resume on the first unsettled card
    const pending = cards.findIndex((c, i) => !solved[i] && !failed[i]);
    if (pending !== -1) current = pending;
    answered = false;
    // the manifest is written when there is none to resume from (a first visit
    // pins today's cards; a legacy record is upgraded); a plain revisit saves
    // nothing — no record churn, no sync push before an answer
    if (!usable || legacyDone) save();
    render();
  }

  function dotsHtml() {
    return '<div class="daily-dots">' + cards.map((c, i) => {
      let cls = 'daily-dot';
      if (failed[i]) cls += ' done-fail';
      else if (solved[i]) cls += attempts[i] === 1 ? ' done' : ' done-multi';
      else if (i === current) cls += ' current';
      const mark = failed[i] ? '✕' : (solved[i] ? '✓' : (i + 1));
      return '<span class="' + cls + '">' + mark + '</span>';
    }).join('') + '</div>';
  }

  function resultDots(i) {
    if (failed[i]) return '🟡'.repeat(Math.max(0, attempts[i] - 1)) + '🔴';
    if (attempts[i] === 1) return '🟢';
    return '🟡'.repeat(Math.max(0, attempts[i] - 1)) + '🟢';
  }

  function shareString() {
    const lines = ['Fala Gringo — Daily #' + dailyNumber() + ' (' + formatDate() + ')'];
    lines.push(cards.map((c, i) => resultDots(i)).join(''));
    const solvedCount = cards.filter((c, i) => solved[i]).length;
    lines.push(solvedCount + '/' + cards.length + ' solved');
    const st = dailyStreak();
    if (st.today && st.n >= 2) lines.push(streakLabel(st.n));   // a run worth showing off; day one is not one yet
    lines.push(SHARE_URL);
    return lines.join('\n');
  }

  function rollDay() {
    if (key && key !== todayKey()) { mount(); showToast(QUIZ_STRINGS.dailyRollover); return true; }
    return false;
  }

  function render() {
    if (rollDay()) return;
    const view = document.getElementById('view');
    view.dataset.topic = 'daily';
    view.className = 'narrow';

    if (isFinished()) { renderComplete(view); return; }

    const entry = cards[current];
    const card = entry.card;
    const left = MAX_ATTEMPTS - attempts[current];
    const hint = (!Mode.hard && card.hint)
      ? '<span class="card-hint" lang="pt-BR">' + escapeHtml(card.hint) + '</span>' : '';

    view.innerHTML = '' +
      '<div class="view-head">' +
        '<h1>★ Daily #' + dailyNumber() + '</h1>' +
        '<p>' + formatDate() + ' — 7 cards from across every topic' +
          (dailyStreak().n ? ' · ' + streakLabel(dailyStreak().n) + ' — finish today to keep it' : '') + '</p>' +
      '</div>' +
      dotsHtml() +
      '<div class="card">' +
        '<div class="card-meta"><span>' + escapeHtml(entry.topicLabel + ' · ' + card.meta) +
          '</span>' + hint + '</div>' +
        '<div class="card-prompt" id="answerPrompt" lang="en">' + card.prompt + '</div>' +
        (card.target ? '<div class="card-target">' + card.target + '</div>' : '') +
        '<div class="card-sub">' + escapeHtml(card.sub) + ' · ' +
          formatCount(left, 'try', 'tries') + ' left</div>' +
        '<div class="input-row">' +
          '<label class="sr-only" for="answerInput">Your answer in Brazilian Portuguese</label>' +
          '<input class="answer-input" id="answerInput" lang="pt-BR" aria-describedby="answerPrompt" type="text" placeholder="fala aí…" ' +
            'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
            'enterkeyhint="go" />' +
          '<button class="check-btn" id="actionBtn" type="button" aria-label="Check answer">&rarr;</button>' +
        '</div>' +
        '<div class="feedback" id="feedback" role="status" aria-live="polite" aria-atomic="true"></div>' +
        '<div id="revealArea"></div>' +
      '</div>' +
      '<div class="controls">' +
        '<button class="btn" id="giveUpBtn" type="button">Give up on this card</button>' +
      '</div>';

    answered = false;
    const input = document.getElementById('answerInput');
    document.getElementById('actionBtn').addEventListener('click', handleAction);
    document.getElementById('giveUpBtn').addEventListener('click', () => failCard());
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAction(); });
    focusAnswerInput(input);
  }

  function isFinished() {
    return cards.length > 0 && cards.every((c, i) => solved[i] || failed[i]);
  }

  function handleAction() {
    if (rollDay()) return;
    if (answered) { next(); return; }
    check();
  }

  function accepted(card) {
    const set = new Set();
    card.accepted.forEach(a => set.add(normalize(a)));
    return set;
  }

  /* The answer line: the synonym the learner typed (or typed towards) leads,
     the card's other synonyms follow — same as the drills. */
  function answerHtml(card, typed) {
    const face = cardFace(card, typed);
    const others = otherFaces(card, face);
    return '<strong lang="pt-BR">' + escapeHtml(face.answer) + '</strong>' +
      (face.pron ? '<span class="pron-tag" lang="en">' + escapeHtml(face.pron) + '</span>' : '') +
      (face.flag ? '<span class="pron-tag flag-tag">' + escapeHtml(face.flag) + '</span>' : '') +
      (face.speak ? speakButton(face.speak, face.answer) : '') +
      (others.length ? '<span class="also-tag">also ' +
        others.map(a => '<b lang="pt-BR">' + escapeHtml(a) + '</b>').join(' · ') + '</span>' : '');
  }
  function revealHtml(card, typed) { return cardFace(card, typed).reveal || ''; }

  function check() {
    const entry = cards[current];
    const card = entry.card;
    const input = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    if (!input.value.trim() && !card.allowEmpty) return;

    attempts[current]++;
    typed[current] = input.value.trim();
    const ok = accepted(card).has(normalize(input.value));

    if (ok) {
      solved[current] = true;
      answered = true;
      input.disabled = true;
      input.classList.add('correct');
      document.getElementById('actionBtn').classList.add('go-green');
      document.getElementById('actionBtn').setAttribute('aria-label', 'Next card');
      feedback.className = 'feedback ok';
      feedback.innerHTML = '✓ ' + praiseWord() + ' ' + answerHtml(card, input.value);
      document.getElementById('revealArea').innerHTML = revealHtml(card, input.value);
      Store.markMastered(card.topic, card.id);
      Store.recordAnswer(card.topic, card.id, true);
      if (window.App && App.updateTabPct) App.updateTabPct(card.topic);   // that topic's tab % follows
      if (window.App && App.refreshGoal) App.refreshGoal();               // and the streak / ring
      save();
      requestAnimationFrame(() => {
        const t = document.querySelector('.conj-table-wrapper');
        if (t) t.classList.add('visible');
      });
    } else if (attempts[current] >= MAX_ATTEMPTS) {
      failCard();          // records the miss
    } else {
      Store.recordAnswer(card.topic, card.id, false);
      if (window.App && App.refreshGoal) App.refreshGoal();   // a miss still lights today's flame
      save();
      input.classList.add('wrong', 'shake');
      feedback.className = 'feedback err';
      feedback.innerHTML = '✗ ' + missWord() + ' ' +
        formatCount(MAX_ATTEMPTS - attempts[current], 'try', 'tries') + ' left';
      setTimeout(() => {
        input.classList.remove('wrong', 'shake');
        input.value = '';
        input.focus();
        const f = document.getElementById('feedback');
        if (f) { f.className = 'feedback'; f.innerHTML = ''; }
        const sub = document.querySelector('.card-sub');
        if (sub) {
          sub.textContent = card.sub + ' · ' +
            formatCount(MAX_ATTEMPTS - attempts[current], 'try', 'tries') + ' left';
        }
        renderDots();
      }, 750);
    }
  }

  function failCard() {
    if (rollDay()) return;
    const entry = cards[current];
    const card = entry.card;
    Store.recordAnswer(card.topic, card.id, false);
    if (window.App && App.refreshGoal) App.refreshGoal();
    failed[current] = true;
    answered = true;
    if (attempts[current] === 0) attempts[current] = 1;
    const input = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    if (input) { input.disabled = true; input.classList.add('wrong'); }
    document.getElementById('actionBtn').classList.add('go-red');
    document.getElementById('actionBtn').setAttribute('aria-label', 'Next card');
    feedback.className = 'feedback err';
    const typed = input ? input.value : null;
    feedback.innerHTML = '✗ The answer is ' + answerHtml(card, typed);
    document.getElementById('revealArea').innerHTML = revealHtml(card, typed);
    save();
    renderDots();
    requestAnimationFrame(() => {
      const t = document.querySelector('.conj-table-wrapper');
      if (t) t.classList.add('visible');
    });
  }

  function renderDots() {
    const el = document.querySelector('.daily-dots');
    if (el) el.outerHTML = dotsHtml();
  }

  function next() {
    const nextPending = cards.findIndex((c, i) => !solved[i] && !failed[i]);
    if (nextPending === -1) { render(); return; }
    current = nextPending;
    answered = false;
    save();
    render();
  }

  function renderComplete(view) {
    const solvedCount = cards.filter((c, i) => solved[i]).length;
    const firstTry = cards.filter((c, i) => solved[i] && attempts[i] === 1).length;
    const allFirst = solvedCount === cards.length && firstTry === cards.length;
    const trophy = allFirst ? '🎆' : (solvedCount === cards.length ? '🏆' : '💪');
    Store.setDailyDone(key, firstTry);   // today joins the permanent log (idempotent)
    const st = dailyStreak();
    const played = Object.keys(Store.dailyHistory()).length;

    const rows = cards.map((entry, i) =>
      '<div class="daily-result-row">' +
        '<span class="daily-result-idx">' + (i + 1) + '</span>' +
        '<span class="daily-result-verb" lang="pt-BR">' + escapeHtml(cardFace(entry.card, typed[i]).answer) + '</span>' +
        '<span>' + resultDots(i) + '</span>' +
      '</div>').join('');

    view.innerHTML = '' +
      '<div class="view-head"><h1>★ Daily #' + dailyNumber() + '</h1>' +
        '<p>' + formatDate() + '</p></div>' +
      dotsHtml() +
      '<div class="card done-screen">' +
        '<div class="trophy">' + trophy + '</div>' +
        '<h2>' + (allFirst ? 'Perfeito!' : (solvedCount === cards.length ? 'Fechou!' : 'Por hoje é isso')) + '</h2>' +
        '<p>' + solvedCount + ' of ' + cards.length + ' solved · ' +
          formatCount(firstTry, 'on the first try', 'on the first try') + '</p>' +
        '<div class="share-box" id="shareBox">' + escapeHtml(shareString()) + '</div>' +
        '<div style="text-align:left">' + rows + '</div>' +
        '<div class="daily-stats">' +
          '<p class="daily-stats-line">' + formatCount(played, 'Daily played', 'Dailies played') +
            ' · ' + streakLabel(st.n) + '</p>' +
          distributionHtml(firstTry) +
        '</div>' +
        '<div class="controls">' +
          '<button class="btn primary" id="copyBtn" type="button">Copy result</button>' +
        '</div>' +
        '<p style="margin-top:.8rem;font-size:.8rem">Come back tomorrow for Daily #' +
          (dailyNumber() + 1) + '.</p>' +
      '</div>';

    document.getElementById('copyBtn').addEventListener('click', copyResult);
    if (window.App && App.refreshGoal) App.refreshGoal();   // the finished day may earn a milestone
    if (allFirst) launchFireworks();
  }

  function copyResult() {
    if (rollDay()) return;
    const text = shareString();
    const done = () => showToast('Result copied');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => showToast('Could not copy'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { showToast('Could not copy'); }
      ta.remove();
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.getElementById('view').dataset.topic === 'daily') rollDay();
  });

  return { mount: mount, rerender: render, streak: dailyStreak };
})();
