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
    goalLeft: '{n} cards left today in your tabs ({done} done)',
    goalDone: 'Tudo em dia por hoje! Nothing left in your tabs.',
    streakDays: '🔥 {n}-day streak',
    streakDay: '🔥 1-day streak',
    streakAtRisk: 'practice today to keep it',
    streakCold: 'not yet today'
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

  function renderTabs() {
    const activeId = currentTopicId();
    document.getElementById('tabs').innerHTML = TOPICS.map(t => {
      let extra = '';
      if (t.kind === 'quiz') {
        const total = topicCards(t).length;
        const pct = total ? Math.round((Store.masteredCount(t.id) / total) * 100) : 0;
        extra = '<span class="pct">' + pct + '%</span>';
      }
      return '<button class="tab' + (t.kind === 'daily' ? ' daily' : '') + '" role="tab" ' +
        'aria-selected="' + (t.id === activeId) + '" data-tab="' + t.id + '">' +
        escapeHtml(t.label) + extra + '</button>';
    }).join('');
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
    const total = topicCards(t).length;
    span.textContent = (total ? Math.round((Store.masteredCount(t.id) / total) * 100) : 0) + '%';
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
    const show = goal.active > 0 || st.n > 0;
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
      '<span class="goal-streak' + (st.today ? '' : ' cold') + '">🔥' + st.n + '</span>';
    const title = (done ? APP_STR.goalDone : tfill(APP_STR.goalLeft, { n: goal.left, done: goal.done })) +
      (st.n ? ' · ' + streakLabel(st) + (st.atRisk ? ' — ' + APP_STR.streakAtRisk
                                         : st.today ? '' : ' — ' + APP_STR.streakCold) : '');
    btn.setAttribute('title', title);
    btn.setAttribute('aria-label', title);

    // the moment the last card of the day clears: a small celebration, once
    if (done && lastLeft > 0) {
      btn.classList.add('celebrate');
      toast(APP_STR.goalDone + (st.n ? ' ' + streakLabel(st) : ''));
    }
    lastLeft = goal.left;
  }

  /* Tap: go where today's work is (the fullest tab), or hear that there is none. */
  function goalTap() {
    const goal = Quiz.todayGoal();
    const st = Store.streak();
    if (goal.active && goal.left) {
      toast(goal.per.filter(p => p.left).map(p => p.topic.label + ' ' + p.left).join(' · '));
      go(goal.per[0].topic.id);
    } else {
      toast(APP_STR.goalDone + (st.n ? ' ' + streakLabel(st) : ''));
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
