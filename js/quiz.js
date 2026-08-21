// The one drill engine, shared by all twelve quiz topics.
//
// Core loop kept from the source flashcards repo (credited in the README): a card answered
// wrongly is NOT marked known — it stays in the deck and comes back around until
// you get it right. Batching is gone; a deck is always the whole topic (minus any
// group chips you switch off).

const Quiz = (function () {
  let topic = null;
  let deck = [];
  let current = 0;
  let known = new Set();
  let answered = false;
  let perfect = true;
  let stats = { errors: 0, hardSolved: 0 };
  let activeGroups = null;

  function acceptedFor(card) {
    const set = new Set();
    card.accepted.forEach(a => set.add(normalize(a)));
    return set;
  }

  function isCorrect(card, value) {
    return acceptedFor(card).has(normalize(value));
  }

  function focusOn() {
    return !!Store.getPref('focus', false);
  }

  /* Verb card ids are "verb|index" (pronominal: "verb|tense|index"), so the part
     before the first "|" groups a conjugation; non-verb ids have no "|" and each
     card stands alone. */
  function lexeme(card) {
    return String(card.id).split('|')[0];
  }

  /* The Foco deck: every card the learner has missed and not yet re-proven with
     a FOCUS_STREAK of correct answers — plus, because getting one form right
     doesn't mean the conjugation is known, every other card sharing its lexeme. */
  function focusCards(cards) {
    const weak = new Set();
    cards.forEach(c => { if (Store.isShaky(topic.id, c.id)) weak.add(lexeme(c)); });
    return cards.filter(c => weak.has(lexeme(c)));
  }

  function filteredCards() {
    let cards = topicCards(topic);
    const groups = topicGroups(topic);
    if (groups.length && activeGroups) cards = cards.filter(c => activeGroups.has(c.group));
    if (focusOn()) cards = focusCards(cards);
    return cards;
  }

  function buildDeck() {
    deck = shuffle(filteredCards());
    current = 0;
    known = new Set();
    answered = false;
    perfect = true;
    stats = { errors: 0, hardSolved: 0 };
    render();
  }

  function mount(t) {
    topic = t;
    const groups = topicGroups(topic);
    activeGroups = groups.length ? new Set(groups) : null;
    buildDeck();
  }

  /* ---------------------------------------------------------------- chrome */

  function chromeHtml() {
    const groups = topicGroups(topic);
    const chips = groups.map(g =>
      '<button class="chip' + (activeGroups && activeGroups.has(g) ? ' active' : '') +
      '" data-group="' + escapeHtml(g) + '">' + escapeHtml(g) + '</button>').join('');
    const shaky = focusCards(topicCards(topic)).length;
    const focusChip = '<button class="chip focus' + (focusOn() ? ' active' : '') +
      '" data-focus="1" title="Only the cards you have missed, until each is answered right ' +
      FOCUS_STREAK + ' times in a row">🎯 Foco' + (shaky ? ' · ' + shaky : '') + '</button>';
    const total = topicCards(topic).length;
    const mastered = Store.masteredCount(topic.id);
    return '' +
      '<div class="view-head">' +
        '<h1>' + escapeHtml(topic.label) + '</h1>' +
        '<p>' + mastered + ' of ' + total + ' cards mastered' +
        (Mode.hard ? '' : ' · Easy Mode') +
        (mastered > 0
          ? ' · <button class="reset-link" type="button" data-reset-topic="' +
            escapeHtml(topic.id) + '">reset</button>'
          : '') + '</p>' +
      '</div>' +
      '<div class="filters" id="filterRow">' + focusChip + chips + '</div>' +
      '<div class="stats">' +
        '<div class="stat"><div class="stat-num" id="statTotal">0</div><div class="stat-lbl">Total</div></div>' +
        '<div class="stat"><div class="stat-num green" id="statKnown">0</div><div class="stat-lbl">Known</div></div>' +
        '<div class="stat"><div class="stat-num red" id="statLeft">0</div><div class="stat-lbl">Left</div></div>' +
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
  }

  /* ---------------------------------------------------------------- render */

  function render() {
    const view = document.getElementById('view');
    if (!document.getElementById('cardArea') || view.dataset.topic !== topic.id) {
      view.dataset.topic = topic.id;
      view.className = 'narrow';
      view.innerHTML = chromeHtml();
    }
    updateStats();

    const area = document.getElementById('cardArea');

    if (deck.length === 0) {
      area.innerHTML = focusOn()
        ? '<div class="card empty"><h2>Nada na mira 🎯</h2>' +
          '<p>Nothing shaky here — a card lands in Foco when you miss it and leaves after ' +
          FOCUS_STREAK + ' straight correct answers. Tap the Foco chip to drill the full deck.</p></div>'
        : '<div class="card empty"><h2>No cards</h2>' +
          '<p>Every category is switched off — turn one back on above.</p></div>';
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
          '<input class="answer-input" id="answerInput" type="text" placeholder="fala aí…" ' +
            'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
            'enterkeyhint="go" />' +
          '<button class="check-btn" id="actionBtn" type="button" aria-label="Check answer">&rarr;</button>' +
        '</div>' +
        '<div class="feedback" id="feedback"></div>' +
        '<div id="revealArea"></div>' +
      '</div>' +
      '<div class="controls">' +
        '<button class="btn" id="skipBtn" type="button">Skip &rarr;</button>' +
        '<button class="btn" id="restartBtn" type="button">Restart &#8635;</button>' +
      '</div>';

    answered = false;
    const input = document.getElementById('answerInput');
    document.getElementById('actionBtn').addEventListener('click', handleAction);
    document.getElementById('skipBtn').addEventListener('click', skipCard);
    document.getElementById('restartBtn').addEventListener('click', buildDeck);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAction(); });
    focusAnswerInput(input);
  }

  function renderDone(area) {
    const title = perfect ? 'Perfeito!' : 'Fechou!';
    area.innerHTML = '' +
      '<div class="card done-screen">' +
        '<div class="trophy">' + (perfect ? '🎆' : '🏆') + '</div>' +
        '<h2>' + title + '</h2>' +
        '<p>You cleared all ' + deck.length + ' cards' +
          (perfect ? ' without a single mistake.' : '.') + '</p>' +
        '<div class="result-stats">' +
          '<div class="result-stat"><div class="result-stat-num red">' + stats.errors +
            '</div><div class="result-stat-lbl">Errors made</div></div>' +
          '<div class="result-stat"><div class="result-stat-num accent">' + stats.hardSolved +
            '</div><div class="result-stat-lbl">Hard Mode cards</div></div>' +
        '</div>' +
        '<button class="btn primary" id="againBtn" type="button">Start over &#8635;</button>' +
      '</div>';
    document.getElementById('againBtn').addEventListener('click', buildDeck);
    if (perfect) launchFireworks();
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

    answered = true;
    input.disabled = true;

    const pron = card.pron ? '<span class="pron-tag">' + escapeHtml(card.pron) + '</span>' : '';
    const say = card.speak ? speakButton(card.speak, card.answer) : '';

    if (isCorrect(card, input.value)) {
      if (Mode.hard) stats.hardSolved++;
      input.classList.add('correct');
      btn.classList.add('go-green');
      feedback.className = 'feedback ok';
      feedback.innerHTML = '✓ ' + praiseWord() + ' <strong>' + escapeHtml(card.answer) + '</strong>' + pron + say;
      revealArea.innerHTML = card.reveal || '';
      known.add(current);
      Store.markMastered(topic.id, card.id);
      Store.recordAnswer(topic.id, card.id, true);
      updateStats();
    } else {
      stats.errors++;
      Store.recordAnswer(topic.id, card.id, false);
      perfect = false;
      input.classList.add('wrong', 'shake');
      setTimeout(() => input.classList.remove('shake'), 340);
      btn.classList.add('go-red');
      feedback.className = 'feedback err';
      feedback.innerHTML = '✗ ' + missWord() + ' The answer is <strong>' + escapeHtml(card.answer) + '</strong>' + pron + say;
      revealArea.innerHTML = card.reveal || '';
    }

    requestAnimationFrame(() => {
      const t = document.querySelector('.conj-table-wrapper');
      if (t) t.classList.add('visible');
    });
    setTimeout(() => btn.focus(), 0);
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
    Store.setPref('focus', !focusOn());
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
    isActive: () => !!topic
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
