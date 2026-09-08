// Router, top-bar wiring and one delegated click handler for the whole app.
// Hash routing keeps every tab linkable and the back button working.

(function () {
  const view = () => document.getElementById('view');

  // overridable UI wording, same contract as quiz.js (the /ingles/ subpage
  // sets window.APP_STRINGS to Portuguese before the engine loads)
  const APP_STR = Object.assign({
    modeHardTitle: 'Modo Raiz (hardcore): no Portuguese shown. Tap for Modo Nutella.',
    modeEasyTitle: 'Modo Nutella (soft): the Portuguese infinitive is shown as a hint. Tap for Modo Raiz.',
    resetConfirm: 'Reset mastered progress for "{label}"?',
    goalLeft: '{n} to go today: {reviews} reviews + {fresh} new ({done} done). ' +
              'The streak only needs one answer a day.',
    goalWaiting: ' {n} more reviews wait beyond today\'s goal.',
    goalDone: 'Tudo em dia por hoje! Reviews done, new cards for today done.',
    goalHit: 'Daily goal done! {n} reviews still wait — keep going if you like.',
    streakDays: '🔥 {n}-day streak',
    streakDay: '🔥 1-day streak',
    streakAtRisk: 'practice today to keep it',
    streakCold: 'not yet today',
    tierNames: ['Iniciante', 'Intermediário', 'Avançado'],
    tierTitle: 'Level: {tier}',
    graduatedTitle: '🎓 Graduated — {pct}% of the cards at review level 3 or higher',
    learnerTitle: 'You: {tier} — the highest level among the tabs you have taken up'
  }, window.APP_STRINGS || {});

  function toast(msg) { if (typeof showToast === 'function') showToast(msg); }

  /* ------------------------------------------------------------- theming */

  function themePref() {
    const p = Store.getPref('theme', null);
    return p === 'light' || p === 'dark' ? p : null;   // null = auto, follow the system
  }

  function effectiveTheme() {
    const pref = themePref();
    if (pref) return pref;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  const THEME_ICONS = {
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="9"></circle>' +
          '<path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"></path></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
           '<circle cx="12" cy="12" r="4"></circle>' +
           '<path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"></path></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
          '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>'
  };

  function updateThemeButton() {
    const btn = document.getElementById('themeBtn');
    const pref = themePref();
    const label = pref === null
      ? 'Theme: follows the system (now ' + effectiveTheme() + '). Tap for light.'
      : pref === 'light' ? 'Theme: light. Tap for dark.'
      : 'Theme: dark. Tap to follow the system.';
    btn.setAttribute('title', label);
    btn.setAttribute('aria-label', label);
    btn.innerHTML = THEME_ICONS[pref || 'auto'];
  }

  function applyTheme() {
    const pref = themePref();
    if (pref) document.documentElement.setAttribute('data-theme', pref);
    else document.documentElement.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', effectiveTheme() === 'dark' ? '#131412' : '#009c3b');
    updateThemeButton();
  }

  function toggleTheme() {
    const pref = themePref();   // cycle: auto -> light -> dark -> auto
    Store.setPref('theme', pref === null ? 'light' : pref === 'light' ? 'dark' : null);
    applyTheme();
  }

  // in auto, restyle live when the OS switches (the CSS media query recolors the
  // page by itself; this refreshes the meta theme-color and the button tooltip)
  const darkMq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (darkMq && typeof darkMq.addEventListener === 'function') {
    darkMq.addEventListener('change', () => { if (themePref() === null) applyTheme(); });
  }

  /* ---------------------------------------------------------------- tabs */

  function tierName(tier) {
    return (tier && APP_STR.tierNames[tier - 1]) || '';
  }

  /* The pill on a drill tab: its mastery %, or 🎓 once the tab has graduated
     (Store.graduation — a live condition, so a tab that slips back loses the
     cap until it earns it again). */
  function tabBadge(t) {
    const g = Quiz.graduation(t);
    if (g.qualifies) return { text: '🎓', title: tfill(APP_STR.graduatedTitle, { pct: Math.round(g.share * 100) }) };
    const total = topicCards(t).length;
    const pct = total ? Math.round((Store.masteredCount(t.id) / total) * 100) : 0;
    return { text: pct + '%', title: t.tier ? tfill(APP_STR.tierTitle, { tier: tierName(t.tier) }) : '' };
  }

  /* The strip is stacked by tier, and says so: a small caption opens each
     tier's run of tabs (Iniciante · Presente Nouns … | Intermediário · …), so a
     newcomer sees where to start and what comes after without a tooltip. The
     captions are presentational — the tabs themselves carry the level in their
     title, and the learner's own level sits by the flame. */
  function renderTabs() {
    const activeId = currentTopicId();
    let lastTier = 0;
    document.getElementById('tabs').innerHTML = TOPICS.map(t => {
      let extra = '', title = '', caption = '';
      if (t.kind === 'quiz') {
        const b = tabBadge(t);
        extra = '<span class="pct">' + b.text + '</span>';
        title = b.title;
        if (t.tier && t.tier !== lastTier) {
          caption = '<span class="tier-label" data-tier="' + t.tier + '" aria-hidden="true">' +
            escapeHtml(tierName(t.tier)) + '</span>';
          lastTier = t.tier;
        }
      }
      return caption + '<button class="tab' + (t.kind === 'daily' ? ' daily' : '') + '" role="tab" ' +
        'aria-selected="' + (t.id === activeId) + '" data-tab="' + t.id + '"' +
        (title ? ' title="' + escapeHtml(title) + '"' : '') + '>' +
        escapeHtml(t.label) + extra + '</button>';
    }).join('');
  }

  /* The learner's title: the highest tier among the tabs they have taken up —
     active (drilled this month) or graduated. Nothing to do with the mastered
     %, so an advanced learner who skipped Presente is Avançado from day one. */
  function learnerTier() {
    let best = 0;
    TOPICS.forEach(t => {
      if (t.kind !== 'quiz' || !t.tier || t.tier <= best) return;
      if (Store.isActiveTopic(t.id) || Store.graduatedOn(t.id) || Quiz.graduation(t).qualifies) best = t.tier;
    });
    return best;
  }

  /* Refresh one tab's mastery percentage in place (the drills and the Daily call
     this after every answer). Only the span changes, so a horizontally scrolled
     tab strip on a phone keeps its position; a strip without the span yet
     (first paint) falls back to a full render. */
  function updateTabPct(topicId) {
    const t = topicById(topicId);
    if (!t || t.kind !== 'quiz') return;
    const span = document.querySelector('[data-tab="' + topicId + '"] .pct');
    if (!span) { renderTabs(); return; }
    const b = tabBadge(t);
    span.textContent = b.text;
    const tab = span.parentNode;
    if (tab && tab.setAttribute) tab.setAttribute('title', b.title);
  }

  /* ------------------------------------------------- today's goal + streak */

  /* The ring in the top bar: cards still ahead today across the tabs the
     learner drills (Quiz.todayGoal), filling as they get done, with the streak
     beside it. Hidden until the first drill answer ever, so a newcomer's top
     bar is not a scoreboard of zeros. The flame dims until today counts. */
  const RING_C = 2 * Math.PI * 9;   // circumference of the r=9 ring
  let lastLeft = -1;

  function streakLabel(st) {
    return st.n === 1 ? APP_STR.streakDay : tfill(APP_STR.streakDays, { n: st.n });
  }

  function renderGoal() {
    const btn = document.getElementById('goalBtn');
    if (!btn) return;
    const st = Store.streak();
    const goal = Quiz.todayGoal();
    const tier = learnerTier();
    const show = goal.active > 0 || st.n > 0 || tier > 0;
    btn.hidden = !show;
    if (!show) { lastLeft = -1; return; }

    const total = goal.done + goal.left;
    const frac = total ? goal.done / total : 1;
    const done = goal.active > 0 && goal.left === 0;
    btn.className = 'goal-btn' + (done ? ' done' : '');
    btn.innerHTML = '' +
      '<svg class="goal-ring" viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle class="track" cx="12" cy="12" r="9"></circle>' +
        '<circle class="fill" cx="12" cy="12" r="9" stroke-dasharray="' +
          (frac * RING_C).toFixed(2) + ' ' + RING_C.toFixed(2) + '"></circle>' +
        '<text x="12" y="12.5" text-anchor="middle" dominant-baseline="middle">' +
          (done ? '✓' : goal.left) + '</text>' +
      '</svg>' +
      '<span class="goal-streak' + (st.today ? '' : ' cold') + '">🔥' + st.n + '</span>' +
      (tier ? '<span class="goal-title">' + escapeHtml(tierName(tier)) + '</span>' : '');
    const doneText = goal.waiting ? tfill(APP_STR.goalHit, { n: goal.waiting }) : APP_STR.goalDone;
    const title = (done ? doneText
                        : tfill(APP_STR.goalLeft, { n: goal.left, reviews: goal.reviews, fresh: goal.fresh, done: goal.done }) +
                          (goal.waiting ? tfill(APP_STR.goalWaiting, { n: goal.waiting }) : '')) +
      (st.n ? ' · ' + streakLabel(st) + (st.atRisk ? ' — ' + APP_STR.streakAtRisk
                                         : st.today ? '' : ' — ' + APP_STR.streakCold) : '') +
      (tier ? ' · ' + tfill(APP_STR.learnerTitle, { tier: tierName(tier) }) : '');
    btn.setAttribute('title', title);
    btn.setAttribute('aria-label', title);

    // the moment the last card of the day clears: a small celebration, once
    if (done && lastLeft > 0) {
      btn.classList.add('celebrate');
      toast(doneText + (st.n ? ' ' + streakLabel(st) : ''));
    }
    lastLeft = goal.left;
  }

  /* Tap: go where today's work is (the fullest tab), or hear that there is none. */
  function goalTap() {
    const goal = Quiz.todayGoal();
    const st = Store.streak();
    const tier = learnerTier();
    const who = tier ? tierName(tier) + ' · ' : '';   // the title is hidden on narrow screens; the tap says it
    if (goal.active && goal.left) {
      toast(who + goal.per.filter(p => p.left).map(p => p.topic.label + ' ' + p.left).join(' · '));
      go(goal.per[0].topic.id);
    } else {
      toast(who + (goal.waiting ? tfill(APP_STR.goalHit, { n: goal.waiting }) : APP_STR.goalDone) +
            (st.n ? ' ' + streakLabel(st) : ''));
    }
  }

  function updateModeButton() {
    const btn = document.getElementById('modeBtn');
    // aria-pressed reflects Hard Mode, which is the default state.
    // "Raiz vs Nutella" is Brazil's own meme for hardcore vs soft.
    btn.setAttribute('aria-pressed', Mode.hard ? 'true' : 'false');
    btn.textContent = Mode.hard ? 'Modo Raiz' : 'Modo Nutella';
    btn.title = Mode.hard ? APP_STR.modeHardTitle : APP_STR.modeEasyTitle;
  }

  /* -------------------------------------------------------------- routing */

  function currentTopicId() {
    const id = (location.hash || '').replace(/^#/, '');
    // fall back to the first registered topic ('browse' in the main app; the
    // /ingles/ subpage has no browse tab, so its first drill is the default)
    return topicById(id) ? id : TOPICS[0].id;
  }

  function route() {
    const topic = topicById(currentTopicId());
    Quiz.stopVoice();   // leaving a drill must stop the mic + pending auto-advance
    renderTabs();
    window.scrollTo(0, 0);
    if (topic.kind === 'browse') Browse.render();
    else if (topic.kind === 'daily') Daily.mount();
    else Quiz.mount(topic);
    renderGoal();
  }

  function go(id) {
    if (currentTopicId() === id) { route(); return; }
    location.hash = '#' + id;
  }

  /* ------------------------------------------------- delegated interaction */

  document.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { go(tab.dataset.tab); return; }

    const say = e.target.closest('[data-speak]');
    if (say) {
      e.stopPropagation();
      speak(say.dataset.speak, say.classList.contains('speak-btn') ? say : null);
      return;
    }

    const foco = e.target.closest('.chip[data-focus]');
    if (foco) { Quiz.toggleFocus(); return; }

    const mic = e.target.closest('.chip[data-mic]');
    if (mic) { Quiz.toggleMic(); return; }

    const micResume = e.target.closest('[data-mic-resume]');
    if (micResume) { Quiz.resumeMic(); return; }

    const chip = e.target.closest('.chip[data-group]');
    if (chip) { Quiz.toggleGroup(chip.dataset.group); return; }

    const rst = e.target.closest('[data-reset-topic]');
    if (rst) {
      const t = topicById(rst.dataset.resetTopic);
      // confirm() is absent in the headless smoke stub; treat that as a yes
      if (t && (typeof window.confirm !== 'function' ||
                window.confirm(tfill(APP_STR.resetConfirm, { label: t.label })))) {
        Store.resetTopic(t.id);
        view().dataset.topic = '';  // force the quiz chrome (mastered count) to rebuild
        route();
      }
      return;
    }

    const br = e.target.closest('[data-browse]');
    if (br) { Browse.action(br.dataset.browse); return; }

    const conj = e.target.closest('[data-conj]');
    if (conj) {
      const row = conj.closest('.verb-row');
      if (row) row.classList.toggle('expanded');
      return;
    }

    const word = e.target.closest('.verb-pt, .verb-en');
    if (word) { word.classList.toggle('hidden'); return; }
  });

  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  const goalBtn = document.getElementById('goalBtn');
  if (goalBtn) goalBtn.addEventListener('click', goalTap);
  document.getElementById('modeBtn').addEventListener('click', () => {
    Mode.toggle();
    updateModeButton();
    const topic = topicById(currentTopicId());
    // re-render so the hint appears/disappears on the card in view
    if (topic.kind === 'daily') Daily.rerender();
    else if (topic.kind === 'quiz') Quiz.rerender();
  });

  window.addEventListener('hashchange', route);

  applyTheme();
  updateModeButton();
  route();

  // Installable/offline (sw.js): needs a secure origin — from file:// the app
  // simply runs without it, same degradation as mic mode.
  if ('serviceWorker' in navigator &&
      (location.protocol === 'https:' || location.hostname === 'localhost')) {
    // one root worker serves both apps; a subpage points back up at it
    navigator.serviceWorker.register(window.SW_PATH || 'sw.js');
  }

  // sync.js re-renders through this after pulling remote progress
  window.App = { refresh: route, updateTabPct: updateTabPct, refreshGoal: renderGoal };
})();
