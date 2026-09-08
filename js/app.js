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
    learnerTitle: 'You: {tier} — the highest level among the tabs you have taken up',
    milestoneToast: '🏅 {label}',
    sheetTitle: 'Your progress',
    sheetToday: 'Today',
    sheetMilestones: 'Milestones',
    sheetActivity: 'Activity',
    heatSummary: '{n} of {total} days practised · {answers} answers',
    heatDay: '{date} · {n} answers',
    heatDayOne: '{date} · 1 answer',
    heatDayNone: '{date} · nothing',
    heatLess: 'less',
    heatMore: 'more',
    heatWeekdays: ['M', '', 'W', '', 'F', '', ''],   // row labels, Monday first; blanks keep the rows aligned
    sheetEarned: 'earned {date}',
    sheetClose: 'Close',
    sheetNoTitle: 'Drill a tab to take it up',
    streakNone: 'no streak yet — today starts one'
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

    // anything newly earned by the answer that triggered this refresh
    if (window.Milestones) {
      const fresh = Milestones.check();
      if (fresh.length) {
        btn.classList.add('celebrate');
        toast(fresh.map(m => tfill(APP_STR.milestoneToast, { label: m.icon + ' ' + m.label })).join(' · '));
      }
    }
    if (!document.getElementById('sheet').hidden) renderSheet();   // keep an open sheet live
  }

  /* ------------------------------------------------------- progress sheet */

  /* One page for the learner's standing, opened from the goal ring: the title
     and streak, today's goal with links to the tabs that still have work, and
     the milestones — earned with their date, the rest dimmed with what they take. */
  function dayToLocal(day) {
    const d = new Date(day * 86400000);
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  }
  function dayToDate(day) {
    return dayToLocal(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* The activity heatmap: the last HEAT_WEEKS weeks of the day log as a
     GitHub-style grid, one column a week (Monday at the top), each cell shaded
     by the answers that day. The current week's days still to come are blank
     cells, so the grid keeps its shape. Read straight from Store.answeredOn. */
  const HEAT_WEEKS = 12;
  function heatLevel(n) { return n === 0 ? 0 : n < 10 ? 1 : n < 30 ? 2 : n < 60 ? 3 : 4; }
  function heatmapHtml() {
    const today = Store.today();
    const wd = (dayToLocal(today).getDay() + 6) % 7;           // Monday = 0
    const first = today - wd - (HEAT_WEEKS - 1) * 7;
    let cells = '', active = 0, answers = 0, past = 0;
    for (let day = first; day < first + HEAT_WEEKS * 7; day++) {
      if (day > today) { cells += '<span class="hm-cell future" aria-hidden="true"></span>'; continue; }
      const n = Store.answeredOn(day);
      past++;
      if (n) { active++; answers += n; }
      const label = n === 0 ? APP_STR.heatDayNone : n === 1 ? APP_STR.heatDayOne : APP_STR.heatDay;
      cells += '<span class="hm-cell" data-l="' + heatLevel(n) + '"' + (day === today ? ' data-today="1"' : '') +
        ' title="' + escapeHtml(tfill(label, { date: dayToDate(day), n: n })) + '"></span>';
    }
    return '' +
      '<p class="hm-summary">' + escapeHtml(tfill(APP_STR.heatSummary, { n: active, total: past, answers: answers })) + '</p>' +
      '<div class="hm" role="img" aria-label="' + escapeHtml(tfill(APP_STR.heatSummary, { n: active, total: past, answers: answers })) + '">' +
        '<div class="hm-days" aria-hidden="true">' + APP_STR.heatWeekdays.map(w => '<span>' + escapeHtml(w) + '</span>').join('') + '</div>' +
        '<div class="hm-grid">' + cells + '</div>' +
      '</div>' +
      '<p class="hm-legend" aria-hidden="true">' + escapeHtml(APP_STR.heatLess) +
        ' <span class="hm-cell" data-l="0"></span><span class="hm-cell" data-l="1"></span><span class="hm-cell" data-l="2"></span>' +
        '<span class="hm-cell" data-l="3"></span><span class="hm-cell" data-l="4"></span> ' + escapeHtml(APP_STR.heatMore) + '</p>';
  }

  function renderSheet() {
    const el = document.getElementById('sheet');
    if (!el) return;
    const st = Store.streak();
    const goal = Quiz.todayGoal();
    const tier = learnerTier();
    const done = goal.active > 0 && goal.left === 0;
    const still = goal.per.filter(p => p.left > 0);
    const streakText = st.n
      ? streakLabel(st) + (st.atRisk ? ' — ' + APP_STR.streakAtRisk : st.today ? '' : ' — ' + APP_STR.streakCold)
      : APP_STR.streakNone;
    const todayText = !goal.active ? APP_STR.sheetNoTitle
      : done ? (goal.waiting ? tfill(APP_STR.goalHit, { n: goal.waiting }) : APP_STR.goalDone)
      : tfill(APP_STR.goalLeft, { n: goal.left, reviews: goal.reviews, fresh: goal.fresh, done: goal.done }) +
        (goal.waiting ? tfill(APP_STR.goalWaiting, { n: goal.waiting }) : '');
    const ms = window.Milestones ? Milestones.list() : [];
    const earned = ms.filter(m => m.earned).length;
    el.innerHTML = '' +
      '<div class="sheet-backdrop" data-sheet-close="1"></div>' +
      '<div class="sheet-panel" role="dialog" aria-modal="true" aria-label="' + escapeHtml(APP_STR.sheetTitle) + '">' +
        '<button class="sheet-close" type="button" data-sheet-close="1" aria-label="' + escapeHtml(APP_STR.sheetClose) + '">×</button>' +
        '<h2>' + escapeHtml(APP_STR.sheetTitle) + '</h2>' +
        '<p class="sheet-standing">' +
          (tier ? '<span class="sheet-tier">' + escapeHtml(tierName(tier)) + '</span> · ' : '') +
          escapeHtml(streakText) + '</p>' +
        '<h3>' + escapeHtml(APP_STR.sheetToday) + '</h3>' +
        '<p class="sheet-today' + (done ? ' caught-up' : '') + '">' + escapeHtml(todayText) + '</p>' +
        (still.length ? '<p class="today-line">' + still.map(p =>
          '<button class="tab-link" type="button" data-tab="' + escapeHtml(p.topic.id) + '">' +
            escapeHtml(p.topic.label) + ' <b>' + p.left + '</b></button>').join('') + '</p>' : '') +
        '<h3>' + escapeHtml(APP_STR.sheetActivity) + '</h3>' +
        heatmapHtml() +
        '<h3>' + escapeHtml(APP_STR.sheetMilestones) + ' <span class="sheet-count">' + earned + ' / ' + ms.length + '</span></h3>' +
        '<div class="ms-grid">' + ms.map(m =>
          '<div class="ms' + (m.earned ? ' earned' : ' locked') + '" data-ms="' + escapeHtml(m.id) + '">' +
            '<span class="ms-icon" aria-hidden="true">' + m.icon + '</span>' +
            '<b>' + escapeHtml(m.label) + '</b>' +
            '<small>' + escapeHtml(m.earned ? tfill(APP_STR.sheetEarned, { date: dayToDate(m.earned) }) : m.desc) + '</small>' +
          '</div>').join('') + '</div>' +
      '</div>';
  }

  function openSheet() {
    const el = document.getElementById('sheet');
    if (!el) return;
    renderSheet();
    el.hidden = false;
    document.documentElement.classList.add('sheet-open');
  }

  function closeSheet() {
    const el = document.getElementById('sheet');
    if (!el || el.hidden) return;
    el.hidden = true;
    el.innerHTML = '';
    document.documentElement.classList.remove('sheet-open');
  }

  /* Tap: the progress sheet — title, streak, today's tabs, milestones. */
  function goalTap() {
    const el = document.getElementById('sheet');
    if (el && !el.hidden) closeSheet(); else openSheet();
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
    closeSheet();       // a tab link on the sheet lands on the tab, not behind the sheet
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

    if (e.target.closest('[data-sheet-close]')) { closeSheet(); return; }

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
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

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
  window.App = { refresh: route, updateTabPct: updateTabPct, refreshGoal: renderGoal, openSheet: openSheet, closeSheet: closeSheet };
})();
