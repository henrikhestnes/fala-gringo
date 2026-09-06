// The one drill engine, shared by all twelve quiz topics.
//
// Core loop kept from the source flashcards repo (credited in the README): a card answered
// wrongly is NOT marked known — it stays in the deck and comes back around until
// you get it right. Batching is gone; a deck is the whole topic minus any group
// chips you switch off, filtered to the Foco cards while the 🎯 chip is on (the default).

/* Every user-facing string in the engine, so a page teaching another language
   can reword the chrome (window.APP_STRINGS, set before this file loads — the
   /ingles/ subpage swaps these for Portuguese). '{name}' slots go through
   tfill(). Card-level text (prompt, sub, tips) comes from the topic builders
   and needs nothing here. */
const QUIZ_STRINGS = Object.assign({
  focoTitle: 'The cards needing work, reviews first: due (after 7, 14, 30, 60, then 120 days ' +
             'of confirmed answers), missed (until answered right {streak} times in a row), ' +
             'forms you likely know from the verb and the pattern (one quick confirmation), ' +
             'and up to {cap} new cards a day. Switch off to drill the whole deck.',
  focoChip: '🎯 Foco',
  focoDue: '{n} due',
  focoShaky: '{n} shaky',
  focoVerify: '{n} to confirm',
  focoNew: '{n} new',
  micTitle: 'Mic mode: speak the answer instead of typing — it is recognized, ' +
            'submitted and read back, and the deck advances hands-free.',
  micChip: '🎤 Falar',
  masteredLine: '{n} of {total} cards mastered',
  easyTag: ' · Easy Mode',
  reset: 'reset',
  statTotal: 'Total',
  statKnown: 'Known',
  statLeft: 'Left',
  emptyFocoTitle: 'Tudo em dia! 🎯',
  emptyFocoBody: 'Every card here is mastered and fresh. Reviews come due on an expanding ' +
                 'schedule (7, 14, 30… days) — or switch the Foco chip off to drill the whole deck now.',
  emptyFocoWaiting: 'Nothing due and today\'s new cards are done — {n} more wait for tomorrow. ' +
                    'Switch the Foco chip off to drill the whole deck now.',
  emptyTitle: 'No cards',
  emptyBody: 'Every category is switched off — turn one back on above.',
  placeholder: 'fala aí…',
  skip: 'Skip →',
  restart: 'Restart ↻',
  doneTitlePerfect: 'Perfeito!',
  doneTitle: 'Fechou!',
  clearedAll: 'You cleared all {n} cards',
  clearedPerfect: ' without a single mistake.',
  errorsMade: 'Errors made',
  hardCards: 'Hard Mode cards',
  startOver: 'Start over ↻',
  answerIs: 'The answer is',
  listening: 'Ouvindo… fala aí',
  listeningEmpty: ' — diga “nada” se nada falta na lacuna',
  micResumeSuffix: ' — tap to listen again',
  micErrors: {
    'no-speech': 'Não ouvi nada',
    'not-allowed': 'Mic blocked — allow microphone access (needs https or localhost)',
    'service-not-allowed': 'Mic blocked — allow microphone access (needs https or localhost)',
    'audio-capture': 'No microphone found',
    'network': 'Speech service unreachable — are you online?'
  }
}, window.APP_STRINGS || {});

const Quiz = (function () {
  let topic = null;
  let deck = [];
  let current = 0;
  let known = new Set();
  let answered = false;
  let perfect = true;
  let stats = { errors: 0, hardSolved: 0 };
  let activeGroups = null;
  let counts = null;        // Foco tier sizes of the current deck (+ cards waiting behind the cap)
  let tierOf = new Map();   // card id -> 'due' | 'shaky' | 'verify' | 'new' (Foco decks only)
  let missed = new Set();   // card ids missed in this run (they read as shaky on the chip)

  /* mic mode (the 🎤 chip): hands-free spoken answers */
  let micTimer = 0;    // pending auto-advance
  let micGen = 0;      // bumped by stopVoice(); stale async callbacks check it
  let micRetries = 0;  // silent listens in a row on the current card

  const MIC_RETRIES = 3;       // silent listens before pausing with a resume button
  const MIC_NEXT_OK = 1100;    // ms after the answer audio before auto-advancing
  const MIC_NEXT_MISS = 3200;  // longer on a miss — time to read the reveal
  const MIC_ERROR_TEXT = QUIZ_STRINGS.micErrors;
  const VERIFY_LEVEL = 2;      // review level a confirmed inferred-known card starts at (14 days)

  function acceptedFor(card) {
    const set = new Set();
    card.accepted.forEach(a => set.add(normalize(a)));
    return set;
  }

  function isCorrect(card, value) {
    return acceptedFor(card).has(normalize(value));
  }

  function focusOn() {
    // the pre-1.3 'focus' pref belonged to the opt-in-filter era and is
    // deliberately ignored: everyone starts in the new default (Foco on)
    return Store.getPref('foco', true) !== false;
  }

  function micOn() {
    return typeof Stt !== 'undefined' && Stt.supported() &&
           Store.getPref('mic', false) === true;
  }

  /* Verb card ids are "verb|index" (pronominal: "verb|tense|index"), so the part
     before the first "|" groups a conjugation; non-verb ids have no "|" and each
     card stands alone. */
  function lexeme(card) {
    return String(card.id).split('|')[0];
  }

  /* The Foco deck (the default) — the cards needing work, in tiers:
       due     mastered cards whose review interval ran out, most overdue first
       shaky   missed and no FOCUS_STREAK since — plus, because getting one form
               right doesn't mean the conjugation is known, every other card
               sharing a shaky card's lexeme
       verify  unseen forms the learner very likely knows already (js/infer.js:
               the verb is known and the pattern is known) — asked once, uncapped
       new     unseen cards, at most Store.newPerDay() introduced per day, taken
               in data order (the curated "essentials first" order) by whole
               lexeme so a verb arrives with all its forms
     Reviews come before new material so a short session still does what matters.
     Switching the chip off drills the whole topic. Returns the ordered deck and
     fills `counts` / `tierOf`. */
  function focusDeck(cards) {
    const weak = new Set();
    cards.forEach(c => { if (Store.isShaky(topic.id, c.id)) weak.add(lexeme(c)); });

    const due = [], shaky = [], unseen = [];
    cards.forEach(c => {
      const st = Store.cardState(topic.id, c.id);
      if (st === 'shaky' || weak.has(lexeme(c))) shaky.push(c);
      else if (st === 'due') due.push(c);
      else if (st === 'new') unseen.push(c);
    });

    // inferred-known forms skip the queue (a quick confirmation, not a lesson)
    const likely = (window.Infer && Infer.likelyKnown) ? Infer.likelyKnown(topic.id, cards, unseen) : new Set();
    const verify = unseen.filter(c => likely.has(c.id));

    // today's intake: what was already introduced today comes back for free,
    // then whole lexemes in data order until the cap is reached
    const today = Math.floor(Date.now() / 86400000);
    const fresh = [], intake = [];
    unseen.forEach(c => {
      if (likely.has(c.id)) return;
      if (Store.introducedOn(topic.id, c.id) === today) intake.push(c); else fresh.push(c);
    });
    let room = Store.newPerDay() - Store.introducedToday(topic.id);
    let waiting = 0;
    const byLex = new Map();
    fresh.forEach(c => { const k = lexeme(c); if (!byLex.has(k)) byLex.set(k, []); byLex.get(k).push(c); });
    byLex.forEach(group => {
      if (room > 0) { intake.push(...group); room -= group.length; }
      else waiting += group.length;
    });

    // most overdue first; shuffle BEFORE the (stable) sort so equally overdue
    // cards — most of them, on any given day — don't come out in data order
    const dueOrdered = shuffle(due).sort((a, b) => Store.overdue(topic.id, b.id) - Store.overdue(topic.id, a.id));
    const tiers = [['due', dueOrdered], ['shaky', shuffle(shaky)], ['verify', shuffle(verify)], ['new', shuffle(intake)]];
    tierOf = new Map();
    const out = [];
    tiers.forEach(([name, list]) => list.forEach(c => { tierOf.set(c.id, name); out.push(c); }));
    counts = { due: due.length, shaky: shaky.length, verify: verify.length, new: intake.length, waiting: waiting };

    // stamp every never-seen card that made it into today's deck (new, or dragged
    // in by a shaky sibling) as introduced today; verify cards are re-inferred on
    // every rebuild and must not eat into the intake
    Store.markIntroduced(topic.id, out.filter(c =>
      tierOf.get(c.id) !== 'verify' && Store.cardState(topic.id, c.id) === 'new').map(c => c.id));
    return out;
  }

  function filteredCards() {
    let cards = topicCards(topic);
    const groups = topicGroups(topic);
    if (groups.length && activeGroups) cards = cards.filter(c => activeGroups.has(c.group));
    if (focusOn()) return focusDeck(cards);
    counts = null;
    tierOf = new Map();
    return shuffle(cards);
  }

  function buildDeck() {
    deck = filteredCards();
    current = 0;
    known = new Set();
    answered = false;
    perfect = true;
    stats = { errors: 0, hardSolved: 0 };
    missed = new Set();
    render();
  }

  function mount(t) {
    topic = t;
    const groups = topicGroups(topic);
    activeGroups = groups.length ? new Set(groups) : null;
    buildDeck();
  }

  /* ---------------------------------------------------------------- chrome */

  /* What is still ahead in this run, per tier: a card answered right leaves
     its tier, a card missed this run counts as shaky until it is cleared. */
  function liveCounts() {
    if (!counts) return null;
    const live = { due: 0, shaky: 0, verify: 0, new: 0, waiting: counts.waiting };
    deck.forEach((c, i) => {
      if (known.has(i)) return;
      const tier = missed.has(c.id) ? 'shaky' : (tierOf.get(c.id) || 'new');
      live[tier]++;
    });
    return live;
  }

  /* "🎯 Foco · 12 due · 3 shaky · 20 new" — the tiers still ahead, zeros omitted. */
  function focoChipHtml() {
    const c = focusOn() ? liveCounts() : null;
    const parts = [];
    if (c) {
      [['due', 'focoDue'], ['shaky', 'focoShaky'], ['verify', 'focoVerify'], ['new', 'focoNew']].forEach(([k, str]) => {
        if (c[k]) parts.push(tfill(QUIZ_STRINGS[str], { n: c[k] }));
      });
    }
    return QUIZ_STRINGS.focoChip + parts.map(p => ' · ' + escapeHtml(p)).join('');
  }

  function masteredHtml() {
    const total = topicCards(topic).length;
    const mastered = Store.masteredCount(topic.id);
    return tfill(QUIZ_STRINGS.masteredLine, { n: mastered, total: total }) +
      (Mode.hard ? '' : QUIZ_STRINGS.easyTag) +
      (mastered > 0
        ? ' · <button class="reset-link" type="button" data-reset-topic="' +
          escapeHtml(topic.id) + '">' + QUIZ_STRINGS.reset + '</button>'
        : '');
  }

  function chromeHtml() {
    const groups = topicGroups(topic);
    const chips = groups.map(g =>
      '<button class="chip' + (activeGroups && activeGroups.has(g) ? ' active' : '') +
      '" data-group="' + escapeHtml(g) + '">' + escapeHtml(g) + '</button>').join('');
    const focusChip = '<button class="chip focus' + (focusOn() ? ' active' : '') +
      '" id="focoChip" data-focus="1" title="' +
      escapeHtml(tfill(QUIZ_STRINGS.focoTitle, { streak: FOCUS_STREAK, cap: Store.newPerDay() })) +
      '">' + focoChipHtml() + '</button>';
    const micChip = (typeof Stt !== 'undefined' && Stt.supported())
      ? '<button class="chip mic' + (micOn() ? ' active' : '') +
        '" data-mic="1" title="' + escapeHtml(QUIZ_STRINGS.micTitle) + '">' +
        QUIZ_STRINGS.micChip + '</button>'
      : '';
    return '' +
      '<div class="view-head">' +
        '<h1>' + escapeHtml(topic.label) + '</h1>' +
        '<p id="masteredLine">' + masteredHtml() + '</p>' +
      '</div>' +
      '<div class="filters" id="filterRow">' + focusChip + micChip + chips + '</div>' +
      '<div class="stats">' +
        '<div class="stat"><div class="stat-num" id="statTotal">0</div><div class="stat-lbl">' + QUIZ_STRINGS.statTotal + '</div></div>' +
        '<div class="stat"><div class="stat-num green" id="statKnown">0</div><div class="stat-lbl">' + QUIZ_STRINGS.statKnown + '</div></div>' +
        '<div class="stat"><div class="stat-num red" id="statLeft">0</div><div class="stat-lbl">' + QUIZ_STRINGS.statLeft + '</div></div>' +
      '</div>' +
      '<div class="progress-row">' +
        '<div class="progress-bg"><div class="progress-fill" id="progressBar" style="width:0%"></div></div>' +
        '<span class="progress-pct" id="progressPct">0%</span>' +
      '</div>' +
      '<div id="cardArea"></div>';
  }

  function updateStats() {
    const total = deck.length;
    const pct = total > 0 ? Math.round((known.size / total) * 100) : 0;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('statTotal', total);
    set('statKnown', known.size);
    set('statLeft', total - known.size);
    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = pct + '%';
    set('progressPct', pct + '%');
    // the header follows every answer too: tiers still ahead, cards mastered
    const chip = document.getElementById('focoChip');
    if (chip) chip.innerHTML = focoChipHtml();
    const line = document.getElementById('masteredLine');
    if (line) line.innerHTML = masteredHtml();
  }

  /* ---------------------------------------------------------------- render */

  function render() {
    stopVoice();   // every re-render invalidates the mic + pending auto-advance
    const view = document.getElementById('view');
    if (!document.getElementById('cardArea') || view.dataset.topic !== topic.id) {
      view.dataset.topic = topic.id;
      view.className = 'narrow';
      view.innerHTML = chromeHtml();
    }
    updateStats();

    const area = document.getElementById('cardArea');

    if (deck.length === 0) {
      const waiting = counts ? counts.waiting : 0;
      area.innerHTML = focusOn()
        ? '<div class="card empty"><h2>' + QUIZ_STRINGS.emptyFocoTitle + '</h2>' +
          '<p>' + (waiting ? tfill(QUIZ_STRINGS.emptyFocoWaiting, { n: waiting })
                           : QUIZ_STRINGS.emptyFocoBody) + '</p></div>'
        : '<div class="card empty"><h2>' + QUIZ_STRINGS.emptyTitle + '</h2>' +
          '<p>' + QUIZ_STRINGS.emptyBody + '</p></div>';
      return;
    }

    if (known.size >= deck.length) {
      renderDone(area);
      return;
    }

    while (known.has(current)) current = (current + 1) % deck.length;
    const card = deck[current];

    const hint = (!Mode.hard && card.hint)
      ? '<span class="card-hint">' + escapeHtml(card.hint) + '</span>' : '';

    area.innerHTML = '' +
      '<div class="card">' +
        '<div class="card-meta"><span>' + escapeHtml(card.meta) + '</span>' + hint + '</div>' +
        '<div class="card-prompt">' + card.prompt + '</div>' +
        (card.target ? '<div class="card-target">' + card.target + '</div>' : '') +
        '<div class="card-sub">' + escapeHtml(card.sub) + '</div>' +
        '<div class="input-row">' +
          '<input class="answer-input" id="answerInput" type="text" placeholder="' +
            escapeHtml(QUIZ_STRINGS.placeholder) + '" ' +
            'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
            'enterkeyhint="go" />' +
          '<button class="check-btn" id="actionBtn" type="button" aria-label="Check answer">&rarr;</button>' +
        '</div>' +
        (micOn() ? '<div class="mic-status" id="micStatus"></div>' : '') +
        '<div class="feedback" id="feedback"></div>' +
        '<div id="revealArea"></div>' +
      '</div>' +
      '<div class="controls">' +
        '<button class="btn" id="skipBtn" type="button">' + escapeHtml(QUIZ_STRINGS.skip) + '</button>' +
        '<button class="btn" id="restartBtn" type="button">' + escapeHtml(QUIZ_STRINGS.restart) + '</button>' +
      '</div>';

    answered = false;
    const input = document.getElementById('answerInput');
    document.getElementById('actionBtn').addEventListener('click', handleAction);
    document.getElementById('skipBtn').addEventListener('click', skipCard);
    document.getElementById('restartBtn').addEventListener('click', buildDeck);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAction(); });
    if (micOn()) {
      micRetries = 0;
      startMic();   // hands-free: no input focus, so no mobile keyboard pops up
    } else {
      focusAnswerInput(input);
    }
  }

  function renderDone(area) {
    const title = perfect ? QUIZ_STRINGS.doneTitlePerfect : QUIZ_STRINGS.doneTitle;
    area.innerHTML = '' +
      '<div class="card done-screen">' +
        '<div class="trophy">' + (perfect ? '🎆' : '🏆') + '</div>' +
        '<h2>' + title + '</h2>' +
        '<p>' + tfill(QUIZ_STRINGS.clearedAll, { n: deck.length }) +
          (perfect ? QUIZ_STRINGS.clearedPerfect : '.') + '</p>' +
        '<div class="result-stats">' +
          '<div class="result-stat"><div class="result-stat-num red">' + stats.errors +
            '</div><div class="result-stat-lbl">' + QUIZ_STRINGS.errorsMade + '</div></div>' +
          '<div class="result-stat"><div class="result-stat-num accent">' + stats.hardSolved +
            '</div><div class="result-stat-lbl">' + QUIZ_STRINGS.hardCards + '</div></div>' +
        '</div>' +
        '<button class="btn primary" id="againBtn" type="button">' +
          escapeHtml(QUIZ_STRINGS.startOver) + '</button>' +
      '</div>';
    document.getElementById('againBtn').addEventListener('click', buildDeck);
    if (perfect) launchFireworks();
  }

  /* -------------------------------------------------------------- mic mode */
  /* Hands-free loop: the card renders, the mic listens (js/lib/stt.js), the
     recognized speech is graded through checkAnswer(), the answer is read out,
     and the deck advances by itself. Typing stays live the whole time. */

  function stopVoice() {
    micGen++;
    if (micTimer) { clearTimeout(micTimer); micTimer = 0; }
    if (typeof Stt !== 'undefined') Stt.abort();
  }

  function setMicStatus(html) {
    const el = document.getElementById('micStatus');
    if (el) el.innerHTML = html;
  }

  function startMic() {
    const card = deck[current];
    const gen = micGen;
    setMicStatus('<span class="mic-dot"></span>' + escapeHtml(QUIZ_STRINGS.listening) +
      (card.allowEmpty ? escapeHtml(QUIZ_STRINGS.listeningEmpty) : ''));
    Stt.listen({
      onInterim: t => {
        if (gen !== micGen || answered) return;
        const input = document.getElementById('answerInput');
        if (input) input.value = t;
      },
      onResult: alts => {
        if (gen !== micGen || answered) return;
        micRetries = 0;
        const input = document.getElementById('answerInput');
        if (!input) return;
        const match = micAnswer(card, alts);
        input.value = match !== null ? match : alts[0] || '';
        if (!input.value.trim() && !card.allowEmpty) { startMic(); return; }
        checkAnswer();
      },
      onError: code => {
        if (gen !== micGen || answered) return;
        if (code === 'no-speech' && micRetries < MIC_RETRIES) { micRetries++; startMic(); return; }
        setMicStatus('<button type="button" class="mic-resume" data-mic-resume="1">🎤 ' +
          escapeHtml((MIC_ERROR_TEXT[code] || 'Mic error (' + code + ')') +
                     QUIZ_STRINGS.micResumeSuffix) + '</button>');
      }
    });
  }

  function toggleMic() {
    Store.setPref('mic', Store.getPref('mic', false) !== true);
    document.getElementById('view').dataset.topic = '';  // force chrome rebuild
    buildDeck();
  }

  function resumeMic() {
    if (!micOn() || answered || !document.getElementById('answerInput')) return;
    stopVoice();
    micRetries = 0;
    startMic();
  }

  /* ---------------------------------------------------------------- answer */

  function handleAction() {
    if (answered) { advance(); return; }
    checkAnswer();
  }

  function checkAnswer() {
    const card = deck[current];
    const input = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const revealArea = document.getElementById('revealArea');
    const btn = document.getElementById('actionBtn');
    // connecting-word cards where the right answer is "nothing" accept an empty box
    if (!input.value.trim() && !card.allowEmpty) return;

    if (micOn()) stopVoice();   // a typed answer can land while the mic still listens

    answered = true;
    input.disabled = true;

    const pron = card.pron ? '<span class="pron-tag">' + escapeHtml(card.pron) + '</span>' : '';
    const say = card.speak ? speakButton(card.speak, card.answer) : '';

    const ok = isCorrect(card, input.value);
    if (ok) {
      if (Mode.hard) stats.hardSolved++;
      input.classList.add('correct');
      btn.classList.add('go-green');
      feedback.className = 'feedback ok';
      feedback.innerHTML = '✓ ' + praiseWord() + ' <strong>' + escapeHtml(card.answer) + '</strong>' + pron + say;
      revealArea.innerHTML = card.reveal || '';
      known.add(current);
      Store.markMastered(topic.id, card.id);
      // a confirmed inferred-known form skips the first rung of the review ladder
      Store.recordAnswer(topic.id, card.id, true, tierOf.get(card.id) === 'verify' ? VERIFY_LEVEL : 0);
      updateStats();
    } else {
      stats.errors++;
      missed.add(card.id);
      Store.recordAnswer(topic.id, card.id, false);
      perfect = false;
      input.classList.add('wrong', 'shake');
      setTimeout(() => input.classList.remove('shake'), 340);
      btn.classList.add('go-red');
      feedback.className = 'feedback err';
      feedback.innerHTML = '✗ ' + missWord() + ' ' + QUIZ_STRINGS.answerIs +
        ' <strong>' + escapeHtml(card.answer) + '</strong>' + pron + say;
      revealArea.innerHTML = card.reveal || '';
      updateStats();   // the chip now shows this card as shaky
    }

    requestAnimationFrame(() => {
      const t = document.querySelector('.conj-table-wrapper');
      if (t) t.classList.add('visible');
    });
    setTimeout(() => btn.focus(), 0);

    if (micOn()) {
      setMicStatus('');
      // hands-free: read the answer out, then move on by itself
      const gen = micGen;
      speak(card.speak || card.answer, null, () => {
        if (gen !== micGen) return;
        micTimer = setTimeout(() => { if (gen === micGen) advance(); },
                              ok ? MIC_NEXT_OK : MIC_NEXT_MISS);
      });
    }
  }

  function advance() {
    if (deck.length === 0 || known.size >= deck.length) { answered = false; render(); return; }
    current = (current + 1) % deck.length;
    while (known.has(current)) current = (current + 1) % deck.length;
    answered = false;
    render();
  }

  function skipCard() {
    // a skip clears the card from this run but is not recorded as mastered
    known.add(current);
    perfect = false;
    updateStats();
    advance();
  }

  function toggleGroup(g) {
    if (!activeGroups) return;
    if (activeGroups.has(g)) {
      if (activeGroups.size === 1) return; // never leave the deck empty
      activeGroups.delete(g);
    } else {
      activeGroups.add(g);
    }
    document.getElementById('view').dataset.topic = '';  // force chrome rebuild
    buildDeck();
  }

  function toggleFocus() {
    Store.setPref('foco', !focusOn());
    document.getElementById('view').dataset.topic = '';  // force chrome rebuild
    buildDeck();
  }

  return {
    mount: mount,
    rerender: function () {
      document.getElementById('view').dataset.topic = '';
      render();
    },
    toggleGroup: toggleGroup,
    toggleFocus: toggleFocus,
    toggleMic: toggleMic,
    resumeMic: resumeMic,
    stopVoice: stopVoice,
    isActive: () => !!topic,
    _counts: () => counts,     // exposed for the smoke checks
    _tierOf: id => tierOf.get(id)
  };
})();

/* Keep the answer box visible above the mobile keyboard. The engine re-renders
   through innerHTML, so focus and scroll have to be re-established each time.
   Carried over from the source repo's drill-common.js. */
function focusAnswerInput(input) {
  if (!input) return;
  const target = input.closest('.card') || input;
  const scroll = () => target.scrollIntoView({ block: 'start', behavior: 'auto' });
  input.focus({ preventScroll: true });
  requestAnimationFrame(scroll);
  setTimeout(scroll, 100);
  setTimeout(scroll, 350);
  if (window.visualViewport) {
    const onKeyboard = () => scroll();
    window.visualViewport.addEventListener('resize', onKeyboard);
    setTimeout(() => window.visualViewport.removeEventListener('resize', onKeyboard), 600);
  }
}
