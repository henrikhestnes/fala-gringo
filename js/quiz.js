// The one drill engine, shared by all twelve quiz topics.
//
// Core loop kept from the source flashcards repo (credited in the README): a card answered
// wrongly is NOT marked known — it stays in the deck and comes back around until
// you get it right. Foco offers the full eligible queue; switching it off drills
// the whole topic minus any group chips you switch off.

/* Every user-facing string in the engine, so a page teaching another language
   can reword the chrome (window.APP_STRINGS, set before this file loads — the
   /ingles/ subpage swaps these for Portuguese). '{name}' slots go through
   tfill(). Card-level text (prompt, sub, tips) comes from the topic builders
   and needs nothing here. */
const QUIZ_STRINGS = Object.assign({
  focoTitle: 'The cards needing work, reviews first: due (after 7, 14, 30, 60, then 120 days ' +
             'of confirmed answers), missed (until answered right again), ' +
             'forms you likely know from the verb and the pattern (one quick confirmation), ' +
             'and up to {cap} new cards a day, including confirmations. Switch off to drill the whole deck.',
  focoChip: '🎯 Foco',
  focoDue: '{n} due',
  focoImplied: '{n} implied',
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
  answerLabel: 'Your answer in Brazilian Portuguese',
  checkLabel: 'Check answer',
  nextLabel: 'Next card',
  skip: 'Skip →',
  restart: 'Restart ↻',
  doneTitlePerfect: 'Perfeito!',
  doneTitle: 'Fechou!',
  clearedAll: 'You cleared all {n} cards',
  clearedPerfect: ' without a single mistake.',
  errorsMade: 'Errors made',
  hardCards: 'Hard Mode cards',
  startOver: 'Start over ↻',
  moreNew: 'Keep practicing · {n} new cards →',
  answerIs: 'The answer is',
  also: 'also',                       // the card's other synonyms, after the answer
  accuracy: '{right} of {total} right',   // the card's lifetime tally, after the answer
  leechTag: 'tricky',                 // a leech: missed often (Store.isLeech)
  todayStill: 'Still today:',
  todayCaughtUp: 'Tudo em dia por hoje! Nothing left in your tabs.',
  todayGoalHit: 'Daily goal done! {n} reviews still wait — keep going if you like.',
  streakDays: '🔥 {n}-day streak',
  streakDay: '🔥 1-day streak',
  graduatedToast: '🎓 {label} graduated! Next: {next}',
  graduatedToastLast: '🎓 {label} graduated — every tab is!',
  nearIs: 'Close! You typed “{typed}” — the answer is',
  dailyRollover: 'A new day has started — here is today’s Daily.',
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

/* The language the learner types (pt-BR here, en-US / nb-NO on the subpages)
   and the one the chrome is written in — lang attributes on the card so a
   screen reader switches voice between the prompt and the answer. */
const TARGET_LANG = window.APP_LANG || 'pt-BR';
const UI_LANG = window.APP_LANG ? 'pt-BR' : 'en';

/* The card's lifetime tally as tags for the answer line ("7 of 9 right", and
   "tricky" for a leech — Store.isLeech), from the second answer on. Shared by
   the drills, the Daily and Browse. */
function tallyTags(topicId, cardId) {
  const a = Store.attempts(topicId, cardId);
  if (a.total < 2) return '';
  return '<span class="pron-tag tally-tag" lang="' + UI_LANG + '">' +
      escapeHtml(tfill(QUIZ_STRINGS.accuracy, { right: a.right, total: a.total })) + '</span>' +
    (Store.isLeech(topicId, cardId)
      ? '<span class="pron-tag leech-tag" lang="' + UI_LANG + '">' + escapeHtml(QUIZ_STRINGS.leechTag) + '</span>' : '');
}

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
  let dropped = new Set();   // due cards this run's answers covered through their word and pattern (js/infer.js)
  let extraHeld = new Map(); // held-back siblings the extra-batch button admitted: id -> 'verify' | 'new'

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

  /* Every answer of the topic's OTHER cards that this card does not accept
     itself — what a near-miss must stay clear of (text.js matchAnswer). Cached
     per card for the mounted topic. */
  const rivalCache = new Map();
  function rivalsFor(card) {
    let r = rivalCache.get(card.id);
    if (r) return r;
    const own = acceptedFor(card);
    r = [];
    topicCards(topic).forEach(o => {
      if (o === card) return;
      o.accepted.forEach(a => { if (a && !own.has(normalize(a))) r.push(a); });
    });
    rivalCache.set(card.id, r);
    return r;
  }

  function gradeTyped(card, value) {
    return matchAnswer(card, value, rivalsFor(card), false);
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

  /* Related forms share the part before "|": verbs, pronominal verbs and
     Norwegian nouns. Cards without "|" each stand alone. */
  function lexeme(card) {
    return String(card.id).split('|')[0];
  }

  // The last id segment identifies the person (also for pronominal verbs),
  // or the form in the sister apps. Independent cards have no form to balance.
  function intakeForm(card) {
    const parts = String(card.id).split('|');
    return parts.length > 1 ? parts[parts.length - 1] : null;
  }

  /* One new form per word per topic per day: seeing an answer (including its
     conjugation table) must not prime a sibling's first assessment. Derive the
     exclusions from saved progress so reloads, filters and extra batches obey
     the same rule. Reviews still run in full; their unseen siblings wait. */
  function newIntake(topicId, cards, extra) {
    const today = Store.today();
    const records = Store.snapshot().strength[topicId] || {};
    const blocked = new Set(), reserved = new Map();
    topicCards(topicById(topicId)).forEach(c => {
      const key = lexeme(c), record = records[c.id] || {};
      const state = Store.cardState(topicId, c.id);
      const answeredToday = (record.a !== undefined ? record.a : record.t) === today;
      if (state === 'due' || state === 'shaky' || answeredToday ||
          (record.i === today && state !== 'new')) blocked.add(key);
      // Older versions admitted whole verbs. Keep only one unfinished form,
      // chosen in data order, even if several siblings already have a stamp.
      if (record.i === today && !reserved.has(key)) reserved.set(key, c.id);
    });
    const unseen = cards.filter(c => Store.cardState(topicId, c.id) === 'new');
    const likely = (window.Infer && Infer.likelyKnown) ? Infer.likelyKnown(topicId, cards, unseen) : new Set();
    let room = extra ? Store.newPerDay() : Store.newPerDay() - Store.introducedToday(topicId);
    const intake = [];
    const formCounts = new Map();
    const countForm = c => {
      const form = intakeForm(c);
      if (form !== null) formCounts.set(form, (formCounts.get(form) || 0) + 1);
    };
    // Include today's completed and reserved cards so extra batches (even
    // one-card batches) continue the mix instead of starting with "eu" again.
    topicCards(topicById(topicId)).forEach(c => {
      if (Store.introducedOn(topicId, c.id) === today) countForm(c);
    });
    // An explicit extra batch takes fresh words first and fills the room left
    // with the held-back siblings, so a nearly finished tab never stalls behind
    // the one-form rule. Those stay out of the regular deck (their stamps look
    // like legacy whole-word intake), so the button offers them again instead.
    const byLex = new Map(), held = new Map();
    unseen.slice().sort((a, b) =>
      Number(Store.introducedOn(topicId, b.id) === today) - Number(Store.introducedOn(topicId, a.id) === today) ||
      Number(likely.has(b.id)) - Number(likely.has(a.id))).forEach(c => {
      const key = lexeme(c), introduced = Store.introducedOn(topicId, c.id);
      const deferred = blocked.has(key) || (reserved.has(key) && reserved.get(key) !== c.id);
      if (deferred && !extra) return;
      if (extra && introduced && !deferred) return;
      const into = deferred ? held : byLex;
      if (!into.has(key)) into.set(key, []);
      into.get(key).push(c);
    });
    held.forEach((group, key) => { if (!byLex.has(key)) byLex.set(key, group); });
    byLex.forEach(group => {
      // Keep word order and inferred-confirmation priority, but choose the
      // least represented eligible person within each word. Only considering
      // eligible cards also handles missing, mastered and filtered-out forms.
      // A form already introduced today and still unanswered is resumed first.
      const resumed = c => Number(Store.introducedOn(topicId, c.id) === today);
      group.sort((a, b) => resumed(b) - resumed(a) || Number(likely.has(b.id)) - Number(likely.has(a.id)) ||
        (formCounts.get(intakeForm(a)) || 0) - (formCounts.get(intakeForm(b)) || 0));
      const c = group[0], introduced = Store.introducedOn(topicId, c.id);
      const resume = !extra && introduced === today;
      if (!resume && room <= 0) return;
      intake.push(c);
      if (introduced !== today) countForm(c);
      if (!resume) room--;
    });
    return { intake: intake, likely: likely, waiting: unseen.length - intake.length };
  }

  /* The Foco deck (the default) — the cards needing work, in tiers:
       due     mastered cards whose review interval ran out, most overdue first
       shaky   only forms actually missed and not answered right since
       verify  likely-known unseen forms, sharing the daily new-card allowance
       new     unseen cards, at most one form per word per day, in data order
     All eligible reviews are included; the daily goal does not limit the deck.
     A regular verb form is due only while its word or its pattern has no
     fresher confirmation anywhere (the derived schedule, js/infer.js), so an
     answer in this run can cover other due cards: syncDeck() drops them and
     the chip counts them as "implied"; a miss that takes their cover away
     brings them back. Reviews come before new material so a short session
     still does what matters. Switching the chip off drills the whole topic.

     focoPlan() is the pure part — it reads the store and touches nothing, so
     the top bar can ask what every active tab would put in front of the
     learner today (todayGoal) — and focusDeck() turns the plan for the mounted
     topic into the deck, stamping today's intake. */
  function focoPlan(topicId, cards) {
    const due = [], shaky = [];
    cards.forEach(c => {
      const st = Store.cardState(topicId, c.id);
      if (st === 'shaky') shaky.push(c);
      else if (st === 'due') due.push(c);
    });

    const { intake, likely, waiting } = newIntake(topicId, cards, false);

    // leeches first, then the answers that confirm the most waiting words and
    // patterns (js/infer.js coverage), then most overdue, then the worst
    // lifetime miss ratio; shuffle BEFORE the (stable) sort so cards equal on
    // all of these — most of them, on any given day — don't come out in data order
    const harder = (a, b) => Store.missRatio(topicId, b.id) - Store.missRatio(topicId, a.id);
    const cover = (window.Infer && Infer.coverage) ? c => Infer.coverage(topicId, c) : () => 0;
    const dueOrdered = shuffle(due).sort((a, b) =>
      (Number(Store.isLeech(topicId, b.id)) - Number(Store.isLeech(topicId, a.id))) ||
      (cover(b) - cover(a)) ||
      (Store.overdue(topicId, b.id) - Store.overdue(topicId, a.id)) || harder(a, b));
    return { due: dueOrdered, shaky: shuffle(shaky).sort(harder),
             verify: shuffle(intake.filter(c => likely.has(c.id))),
             intake: shuffle(intake.filter(c => !likely.has(c.id))), waiting: waiting };
  }

  function focusDeck(cards) {
    const plan = focoPlan(topic.id, cards);
    dropped = new Set();

    // siblings the extra-batch button let past the one-form rule, while unanswered
    const planned = new Set(plan.verify.concat(plan.intake).map(c => c.id));
    cards.forEach(c => {
      const tier = extraHeld.get(c.id);
      if (!tier || planned.has(c.id) || Store.cardState(topic.id, c.id) !== 'new') return;
      (tier === 'verify' ? plan.verify : plan.intake).push(c);
      plan.waiting--;
    });

    const tiers = [['due', plan.due], ['shaky', plan.shaky], ['verify', plan.verify], ['new', plan.intake]];
    tierOf = new Map();
    const out = [];
    tiers.forEach(([name, list]) => list.forEach(c => { tierOf.set(c.id, name); out.push(c); }));
    counts = { due: plan.due.length, implied: 0, shaky: plan.shaky.length, verify: plan.verify.length,
               new: plan.intake.length, waiting: plan.waiting };

    // Only admitted cards spend intake, including inferred confirmations.
    Store.markIntroduced(topic.id, out.filter(c =>
      Store.cardState(topic.id, c.id) === 'new').map(c => c.id));
    return out;
  }

  function filteredCards() {
    let cards = topicCards(topic);
    const groups = topicGroups(topic);
    if (groups.length && activeGroups) cards = cards.filter(c => activeGroups.has(c.group));
    if (focusOn()) return focusDeck(cards);
    counts = null;
    tierOf = new Map();
    dropped = new Set();
    return shuffle(cards);
  }

  /* Today's goal, the number on the ring in the top bar, across the tabs the
     learner actually drills (Store.isActiveTopic — the tabs encode a level, so
     a beginner's goal never includes the subjunctive). At most Store.goalMax()
     cards a day: the REVIEWS Foco owes first (due + missed), then
     up to Store.goalNew() NEW cards in total (verify, intake) if room
     is left. Both allowances are spent by what was already got right today,
     and handed to the tabs in registry order (beginner tabs first). Reviews
     beyond today's ceiling are `waiting`: shown, not owed — a backlog is paid
     off at the learner's pace, and Foco keeps offering all of it. Computed
     from the store alone, so it follows every answer and is the same whichever
     tab is open. */
  function todayGoal() {
    const active = TOPICS.filter(t => t.kind === 'quiz' && Store.isActiveTopic(t.id));
    let done = 0, newDone = 0;
    active.forEach(t => { done += Store.doneToday(t.id); newDone += Store.newDoneToday(t.id); });
    let room = Math.max(0, Store.goalMax() - done);
    let allowance = Math.max(0, Store.goalNew() - newDone);
    const plans = active.map(t => ({ topic: t, plan: focoPlan(t.id, topicCards(t)) }));
    const per = [];
    let owed = 0, reviews = 0, fresh = 0;
    plans.forEach(({ topic, plan }) => {                       // reviews first, all tabs
      const r = plan.due.length + plan.shaky.length;
      const take = Math.min(r, room);
      room -= take; owed += r; reviews += take;
      per.push({ topic: topic, reviews: take, fresh: 0, left: take, done: Store.doneToday(topic.id) });
    });
    allowance = Math.min(allowance, room);
    plans.forEach(({ plan }, i) => {                          // then new cards, in the room left
      const pool = plan.verify.length + plan.intake.length;
      const take = Math.min(pool, allowance);
      allowance -= take; fresh += take;
      per[i].fresh = take; per[i].left += take;
    });
    per.sort((a, b) => b.left - a.left);
    return { active: active.length, left: reviews + fresh, reviews: reviews, fresh: fresh,
             waiting: owed - reviews, done: done, per: per };
  }

  /* Graduation of a whole tab (Store.graduation over all its cards). */
  function graduation(t) {
    return Store.graduation(t.id, topicCards(t).map(c => c.id));
  }

  /* The tab to take up after `t` graduates: the first tab in tab order that
     has not graduated, of the same tier first, then the tiers above, then any
     tier below (an advanced learner who never did Presente is pointed back). */
  function nextTopic(t) {
    const open = TOPICS.filter(o => o.kind === 'quiz' && o !== t && !graduation(o).qualifies);
    const tier = t.tier || 0;
    return open.find(o => (o.tier || 0) === tier) ||
           open.filter(o => (o.tier || 0) > tier).sort((a, b) => (a.tier || 0) - (b.tier || 0))[0] ||
           open[0] || null;
  }

  /* After a correct answer: did this answer graduate the tab? Stamped once,
     celebrated once (confetti + the "next tab" nudge); the 🎓 on the tab
     itself follows the live condition (js/app.js). */
  function checkGraduation() {
    if (!topic || Store.graduatedOn(topic.id) || !graduation(topic).qualifies) return;
    Store.markGraduated(topic.id);
    const next = nextTopic(topic);
    const msg = next ? tfill(QUIZ_STRINGS.graduatedToast, { label: topic.label, next: next.label })
                     : tfill(QUIZ_STRINGS.graduatedToastLast, { label: topic.label });
    if (typeof showToast === 'function') showToast(msg);
    if (typeof launchFireworks === 'function') launchFireworks();
    // the 🎓 on the tab and the title by the flame follow via updateStats()
  }

  /* One line under a finished or empty deck: where today's work still is
     (tab links, fullest first), or that there is none — with the streak. */
  function todayLineHtml() {
    const goal = todayGoal();
    if (!goal.active) return '';
    const still = goal.per.filter(p => p.left > 0);
    if (still.length) {
      return '<p class="today-line">' + escapeHtml(QUIZ_STRINGS.todayStill) + ' ' +
        still.map(p => '<button class="tab-link" type="button" data-tab="' + escapeHtml(p.topic.id) + '">' +
          escapeHtml(p.topic.label) + ' <b>' + p.left + '</b></button>').join('') + '</p>';
    }
    const st = Store.streak();
    const flame = st.n ? ' ' + (st.n === 1 ? QUIZ_STRINGS.streakDay : tfill(QUIZ_STRINGS.streakDays, { n: st.n })) : '';
    const text = goal.waiting ? tfill(QUIZ_STRINGS.todayGoalHit, { n: goal.waiting }) : QUIZ_STRINGS.todayCaughtUp;
    return '<p class="today-line caught-up">' + escapeHtml(text) + escapeHtml(flame) + '</p>';
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

  function nextNewBatch() {
    if (!topic || !focusOn()) return { intake: [], likely: new Set() };
    const cards = topicCards(topic).filter(c => !activeGroups || activeGroups.has(c.group));
    return newIntake(topic.id, cards, true);
  }

  function moreNewHtml() {
    if (!topic || !focusOn()) return '';
    const batch = nextNewBatch().intake;
    return batch.length ? '<div class="controls"><button class="btn primary" id="moreNewBtn" type="button">' +
      escapeHtml(tfill(QUIZ_STRINGS.moreNew, { n: batch.length })) + '</button></div>' : '';
  }

  function bindMoreNew() {
    const button = document.getElementById('moreNewBtn');
    if (button) button.addEventListener('click', () => {
      // Explicit extra intake, not a permanent change to the daily limit.
      // Unfinished fresh words survive a reload; held-back siblings (taken
      // only when fresh words run out) are offered by the button again.
      const { intake, likely } = nextNewBatch();
      intake.forEach(c => extraHeld.set(c.id, likely.has(c.id) ? 'verify' : 'new'));
      Store.markIntroduced(topic.id, intake.map(c => c.id));
      buildDeck();
    });
  }

  function mount(t) {
    topic = t;
    extraHeld = new Map();
    if (!window.APP_LANG && !Store.getPref('firstRunStarted', false)) {
      const saved = Store.snapshot();
      const hasAnswers = Object.keys(saved.days).length ||
        Object.values(saved.strength).some(rows => Object.values(rows).some(r => r.s || r.m || r.a || r.t)) ||
        Object.values(saved.mastered).some(rows => Object.keys(rows).length);
      Store.setPref('firstRunStarted', true);
      Store.setPref('firstRunActive', !hasAnswers);
    }
    document.getElementById('view').dataset.topic = '';
    rivalCache.clear();
    const groups = topicGroups(topic);
    activeGroups = groups.length ? new Set(groups) : null;
    buildDeck();
  }

  /* Leaving a drill tab (Browse, the Daily): forget the deck, so nothing —
     the mic resuming after the progress sheet closes, say — can act on a
     card that is no longer on screen. The Daily has its own #answerInput. */
  function unmount() {
    stopVoice();
    topic = null;
    deck = [];
    current = 0;
    answered = false;
    counts = null;
    tierOf = new Map();
    dropped = new Set();
    rivalCache.clear();
  }

  /* ---------------------------------------------------------------- chrome */

  /* What is still ahead in this run, per tier: a card answered right leaves
     its tier, a card missed this run counts as shaky until it is cleared. */
  function liveCounts() {
    if (!counts) return null;
    const live = { due: 0, implied: counts.implied, shaky: 0, verify: 0, new: 0, waiting: counts.waiting };
    deck.forEach((c, i) => {
      if (known.has(i)) return;
      const tier = missed.has(c.id) ? 'shaky' : (tierOf.get(c.id) || 'new');
      live[tier]++;
    });
    return live;
  }

  /* "🎯 Foco · 12 due · 30 implied · 3 shaky · 20 new" — the tiers still ahead, zeros omitted. */
  function focoChipHtml() {
    const c = focusOn() ? liveCounts() : null;
    const parts = [];
    if (c) {
      [['due', 'focoDue'], ['implied', 'focoImplied'], ['shaky', 'focoShaky'], ['verify', 'focoVerify'], ['new', 'focoNew']].forEach(([k, str]) => {
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
      '<button type="button" aria-pressed="' + (activeGroups && activeGroups.has(g) ? 'true' : 'false') + '" class="chip' + (activeGroups && activeGroups.has(g) ? ' active' : '') +
      '" data-group="' + escapeHtml(g) + '">' + escapeHtml(g) + '</button>').join('');
    const focusChip = '<button class="chip focus' + (focusOn() ? ' active' : '') +
      '" aria-pressed="' + (focusOn() ? 'true' : 'false') + '" id="focoChip" data-focus="1" title="' +
      escapeHtml(tfill(QUIZ_STRINGS.focoTitle, { streak: FOCUS_STREAK, cap: Store.newPerDay() })) +
      '">' + focoChipHtml() + '</button>';
    const micChip = (typeof Stt !== 'undefined' && Stt.supported())
      ? '<button class="chip mic' + (micOn() ? ' active' : '') +
        '" aria-pressed="' + (micOn() ? 'true' : 'false') + '" data-mic="1" title="' + escapeHtml(QUIZ_STRINGS.micTitle) + '">' +
        QUIZ_STRINGS.micChip + '</button>'
      : '';
    return '<div class="view-head">' +
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
    if (window.App && App.updateTabPct) App.updateTabPct(topic.id);   // the tab's mastery % too
    if (window.App && App.refreshGoal) App.refreshGoal();             // and the ring in the top bar
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
                           : QUIZ_STRINGS.emptyFocoBody) + '</p>' + moreNewHtml() + todayLineHtml() + '</div>'
        : '<div class="card empty"><h2>' + QUIZ_STRINGS.emptyTitle + '</h2>' +
          '<p>' + QUIZ_STRINGS.emptyBody + '</p></div>';
      bindMoreNew();
      return;
    }

    if (known.size >= deck.length) {
      renderDone(area);
      return;
    }

    while (known.has(current)) current = (current + 1) % deck.length;
    const card = deck[current];

    const hint = (!Mode.hard && card.hint)
      ? '<span class="card-hint" lang="' + TARGET_LANG + '">' + escapeHtml(card.hint) + '</span>' : '';

    // First-use help belongs only to the English-speaking Portuguese app.
    // Existing activity (including synced progress) skips it automatically.
    const progress = Store.snapshot();
    const firstCard = !window.APP_LANG && !Store.getPref('answerGuideDismissed', false) &&
      !Object.keys(progress.days).length &&
      !Object.values(progress.strength).some(rows => Object.values(rows).some(r => r.s || r.m || r.a || r.t)) &&
      !Object.keys(progress.mastered).some(id => Object.keys(progress.mastered[id]).length);

    area.innerHTML = '' +
      (firstCard ? '<aside class="answer-guide" id="answerGuide">' +
        '<strong>Your first card</strong><p id="answerGuideHelp">Read the English below and type its Portuguese translation. ' +
        'Press Enter or the arrow to check. It’s okay to guess — mistakes come back for another try.</p>' +
        '<p>Modo Nutella shows hints. Try Modo Raiz at the top when you’re ready to answer without them.</p>' +
        '<button class="btn" id="dismissAnswerGuide" type="button">Got it</button></aside>' : '') +
      '<div class="card">' +
        '<div class="card-meta"><span>' + escapeHtml(card.meta) + '</span>' + hint + '</div>' +
        '<div class="card-prompt" id="answerPrompt" lang="' + UI_LANG + '">' + card.prompt + '</div>' +
        (card.target ? '<div class="card-target">' + card.target + '</div>' : '') +
        '<div class="card-sub">' + escapeHtml(card.sub) + '</div>' +
        '<div class="input-row">' +
          '<label class="sr-only" for="answerInput">' + escapeHtml(QUIZ_STRINGS.answerLabel) + '</label>' +
          '<input class="answer-input" id="answerInput" aria-describedby="answerPrompt' + (firstCard ? ' answerGuideHelp' : '') + '" lang="' + TARGET_LANG + '" type="text" placeholder="' +
            escapeHtml(QUIZ_STRINGS.placeholder) + '" ' +
            'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
            'enterkeyhint="go" />' +
          '<button class="check-btn" id="actionBtn" type="button" aria-label="' + escapeHtml(QUIZ_STRINGS.checkLabel) + '">&rarr;</button>' +
        '</div>' +
        (micOn() ? '<div class="mic-status" id="micStatus" role="status"></div>' : '') +
        '<div class="feedback" id="feedback" role="status" aria-live="polite" aria-atomic="true"></div>' +
        '<div id="firstRunNotice"></div>' +
        '<div id="revealArea" lang="' + UI_LANG + '"></div>' +
      '</div>' +
      '<div class="controls">' +
        '<button class="btn" id="skipBtn" type="button">' + escapeHtml(QUIZ_STRINGS.skip) + '</button>' +
        '<button class="btn" id="restartBtn" type="button">' + escapeHtml(QUIZ_STRINGS.restart) + '</button>' +
      '</div>';

    answered = false;
    const input = document.getElementById('answerInput');
    if (firstCard) document.getElementById('dismissAnswerGuide').addEventListener('click', () => {
      Store.setPref('answerGuideDismissed', true);
      document.getElementById('answerGuide').hidden = true;
      input.setAttribute('aria-describedby', 'answerPrompt');
      focusAnswerInput(input);
    });
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
        todayLineHtml() + moreNewHtml() +
        '<div class="controls">' +
          '<button class="btn primary" id="againBtn" type="button">' +
            escapeHtml(QUIZ_STRINGS.startOver) + '</button>' +
        '</div>' +
      '</div>';
    document.getElementById('againBtn').addEventListener('click', buildDeck);
    bindMoreNew();
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
    if (!card) return;   // no deck (unmounted, or an empty Foco deck): nothing to listen for
    if (document.getElementById('sheet') && !document.getElementById('sheet').hidden) return;
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
        const match = micAnswer(card, alts, rivalsFor(card));
        input.value = match !== null ? match : alts[0] || '';
        if (!input.value.trim() && !card.allowEmpty) { startMic(); return; }
        checkAnswer(true);
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

  /* The chip only changes how the current card is answered: the chrome is
     rebuilt (chip state, status line) and the card re-rendered, but the deck
     and the run — cards cleared, errors made — stay as they are. */
  function toggleMic() {
    if (!topic) return;
    Store.setPref('mic', Store.getPref('mic', false) !== true);
    document.getElementById('view').dataset.topic = '';  // force chrome rebuild
    render();
  }

  /* Listen again on the card in view — only while a drill is actually mounted
     and on screen: the Daily has an #answerInput of its own, and the progress
     sheet closing over it must not start the mic against a stale deck. */
  function resumeMic() {
    if (!topic || !micOn() || answered) return;
    const view = document.getElementById('view');
    if (!view || view.dataset.topic !== topic.id || !document.getElementById('answerInput')) return;
    stopVoice();
    micRetries = 0;
    startMic();
  }

  /* ---------------------------------------------------------------- answer */

  /* The deck follows the derived schedule (js/infer.js) after every answer:
     a due review whose word and pattern the answers so far have confirmed
     is no longer due — it leaves the deck and the chip counts it as implied;
     a miss can take that cover away again (the missed form vouches for
     nothing), and the reviews it uncovers come back right after the current
     card, ahead of the new material. Only Foco decks; nothing is written. */
  function syncDeck() {
    if (!counts) return;
    const drop = new Set();
    deck.forEach((c, i) => {
      if (known.has(i) || i === current || missed.has(c.id) || tierOf.get(c.id) !== 'due') return;
      if (Store.cardState(topic.id, c.id) === 'ok') drop.add(i);
    });
    if (drop.size) {
      const shift = i => i - Array.from(drop).filter(d => d < i).length;
      known = new Set(Array.from(known).filter(i => !drop.has(i)).map(shift));
      current = shift(current);
      deck = deck.filter((c, i) => { if (!drop.has(i)) return true; dropped.add(c.id); tierOf.delete(c.id); return false; });
      counts.implied += drop.size;
    }
    const back = [];
    dropped.forEach(id => {
      if (Store.cardState(topic.id, id) !== 'due') return;
      const c = topicCards(topic).find(x => x.id === id);
      if (c) back.push(c);
    });
    if (back.length) {
      back.forEach(c => { dropped.delete(c.id); tierOf.set(c.id, 'due'); });
      deck.splice(current + 1, 0, ...back);
      known = new Set(Array.from(known).map(i => i > current ? i + back.length : i));   // indices past the insert shift
      counts.implied -= back.length;
    }
  }

  /* "also eu ponho · eu boto": the synonyms the card would equally have taken. */
  function alsoLine(card, face) {
    const others = otherFaces(card, face);
    if (!others.length) return '';
    return '<span class="also-tag">' + escapeHtml(QUIZ_STRINGS.also) + ' ' +
           others.map(a => '<b lang="' + TARGET_LANG + '">' + escapeHtml(a) + '</b>').join(' · ') + '</span>';
  }

  function handleAction() {
    if (answered) { advance(); return; }
    checkAnswer();
  }

  // Small, contextual nudges: no special deck and no changes to review scoring.
  function firstRunFeedback(ok, near, feedback) {
    if (window.APP_LANG || !Store.getPref('firstRunActive', false)) return false;
    const key = ok ? 'firstCorrectHint' : 'firstMistakeHint';
    if (!near && !Store.getPref(key, false)) {
      Store.setPref(key, true);
      feedback.innerHTML += '<p class="first-run-hint">' + (ok
        ? 'Boa! Press Enter or tap the arrow for the next card.'
        : 'No worries — this card will come back. Read the answer, then try again. Use the speaker button to hear it.') + '</p>';
    }
    if (!ok || near) return false;
    const hits = Math.min(5, Store.getPref('firstRunCorrect', 0) + 1);
    Store.setPref('firstRunCorrect', hits);
    if (hits < 5) return false;
    Store.setPref('firstRunActive', false);
    const offerSync = typeof Sync !== 'undefined' && Sync.canOfferSetup() && !Store.getPref('firstRunSyncDismissed', false);
    const notice = document.getElementById('firstRunNotice');
    notice.innerHTML = '<aside class="answer-guide first-run-checkpoint" aria-label="Your first practice milestone">' +
      '<strong>Boa! Five correct answers.</strong><p>You can stop here or keep going. Foco brings back cards when they need practice.</p>' +
      '<div class="controls"><button class="btn primary" id="firstRunContinue">Keep practicing</button>' +
      '<button class="btn" data-tab="browse">Back to Browse</button></div>' +
      (offerSync ? '<div class="first-run-sync" id="firstRunSync"><strong>Keep your progress on another device</strong>' +
        '<p>Your progress already saves on this device. Connect your phone and computer with a private sync code.</p>' +
        '<button class="btn" id="firstRunSetup">Set up sync</button> <button class="btn" id="firstRunNotNow">Not now</button></div>' : '') + '</aside>';
    document.getElementById('firstRunContinue').addEventListener('click', () => { notice.innerHTML = ''; advance(); });
    if (offerSync) {
      const dismissSync = () => {
        Store.setPref('firstRunSyncDismissed', true);
        Store.setPref('syncNudge', 4); // respect this choice in the older visit-based nudge too
        document.getElementById('firstRunSync').hidden = true;
        document.getElementById('firstRunContinue').focus();
      };
      document.getElementById('firstRunNotNow').addEventListener('click', dismissSync);
      document.getElementById('firstRunSetup').addEventListener('click', () => {
        if (Sync.canOfferSetup()) Sync.manage();
        dismissSync();
      });
    }
    return true;
  }

  function checkAnswer(spoken) {
    const card = deck[current];
    const input = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const revealArea = document.getElementById('revealArea');
    const btn = document.getElementById('actionBtn');
    // connecting-word cards where the right answer is "nothing" accept an empty box
    if (!input.value.trim() && !card.allowEmpty) return;

    if (micOn()) stopVoice();   // a typed answer can land while the mic still listens

    answered = true;
    btn.setAttribute('aria-label', QUIZ_STRINGS.nextLabel);
    input.disabled = true;
    Store.markDrilled(topic.id);   // this tab is one of the learner's own (today's goal, js/app.js)

    const res = gradeTyped(card, input.value);
    const ok = !!res;
    if (window.Analytics) Analytics.answer(topic.id, 'drill',
      spoken === true ? 'spoken' : 'typed', ok ? (res.grade === 'near' ? 'near' : 'correct') : 'wrong');
    // the synonym the learner reached for (coloco for ponho) shows its own answer,
    // pronunciation and table — on a miss too, judged by how the typed text starts;
    // the other synonyms follow in an "also" line
    const face = cardFace(card, ok ? res.hit : input.value);
    // the answer is in the language being learnt; the pronunciation hint is
    // written for the reader's ear (English-based here, aportuguesado on the
    // subpages), so it keeps the chrome's language
    const answerHtml = '<strong lang="' + TARGET_LANG + '">' + escapeHtml(face.answer) + '</strong>';
    // the record is written first so the tags can read this answer's tally
    const near = ok && res.grade === 'near';
    if (ok) {
      known.add(current);
      Store.markMastered(topic.id, card.id);
      // a confirmed inferred-known form skips the first rung of the review ladder
      Store.recordAnswer(topic.id, card.id, true,
                         (!near && tierOf.get(card.id) === 'verify') ? VERIFY_LEVEL : 0, near);
    } else {
      missed.add(card.id);
      Store.recordAnswer(topic.id, card.id, false);
    }
    const pron = (face.pron ? '<span class="pron-tag" lang="' + UI_LANG + '">' + escapeHtml(face.pron) + '</span>' : '') +
                 (face.flag ? '<span class="pron-tag flag-tag">' + escapeHtml(face.flag) + '</span>' : '') +
                 tallyTags(topic.id, card.id);
    const say = (face.speak ? speakButton(face.speak, face.answer) : '') + alsoLine(card, face);
    if (ok) {
      // a near-miss (one slip, unambiguous) clears the card but earns no review
      // level: it comes back on its current interval instead of a longer one
      if (Mode.hard) stats.hardSolved++;
      input.classList.add('correct');
      btn.classList.add('go-green');
      feedback.className = 'feedback ok' + (near ? ' near' : '');
      feedback.innerHTML = near
        ? '≈ ' + tfill(QUIZ_STRINGS.nearIs, { typed: escapeHtml(input.value.trim()) }) + ' ' + answerHtml + pron + say
        : '✓ ' + praiseWord() + ' ' + answerHtml + pron + say;
      revealArea.innerHTML = face.reveal || '';
      syncDeck();   // this answer may have covered other due forms of the word and the pattern
      checkGraduation();
      updateStats();
    } else {
      stats.errors++;
      syncDeck();   // the missed form vouches for nothing now: reviews it covered come back
      perfect = false;
      input.classList.add('wrong', 'shake');
      setTimeout(() => input.classList.remove('shake'), 340);
      btn.classList.add('go-red');
      feedback.className = 'feedback err';
      feedback.innerHTML = '✗ ' + missWord() + ' ' + QUIZ_STRINGS.answerIs + ' ' + answerHtml + pron + say;
      revealArea.innerHTML = face.reveal || '';
      updateStats();   // the chip now shows this card as shaky
    }

    const checkpoint = firstRunFeedback(ok, ok && res.grade === 'near', feedback);
    requestAnimationFrame(() => {
      const t = document.querySelector('.conj-table-wrapper');
      if (t) t.classList.add('visible');
    });
    setTimeout(() => (checkpoint ? document.getElementById('firstRunContinue') : btn).focus(), 0);

    if (micOn() && !checkpoint) {
      setMicStatus('');
      // hands-free: read the answer out, then move on by itself
      const gen = micGen;
      speak(face.speak || face.answer, null, () => {
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
    if (!topic || !activeGroups) return;
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
    if (!topic) return;
    Store.setPref('foco', !focusOn());
    document.getElementById('view').dataset.topic = '';  // force chrome rebuild
    buildDeck();
  }

  return {
    mount: mount,
    unmount: unmount,
    rerender: function () {
      if (!topic) return;
      document.getElementById('view').dataset.topic = '';
      render();
    },
    toggleGroup: toggleGroup,
    toggleFocus: toggleFocus,
    toggleMic: toggleMic,
    resumeMic: resumeMic,
    stopVoice: stopVoice,
    isActive: () => !!topic,
    todayGoal: todayGoal,
    graduation: graduation,
    nextTopic: nextTopic,
    _counts: () => counts,     // exposed for the smoke checks
    _tierOf: id => tierOf.get(id),
    _dropped: () => Array.from(dropped)
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
