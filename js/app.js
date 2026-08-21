// Router, top-bar wiring and one delegated click handler for the whole app.
// Hash routing keeps every tab linkable and the back button working.

(function () {
  const view = () => document.getElementById('view');

  /* ------------------------------------------------------------- theming */

  function effectiveTheme() {
    const pref = Store.getPref('theme', null);
    if (pref === 'light' || pref === 'dark') return pref;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  function applyTheme() {
    const pref = Store.getPref('theme', null);
    if (pref) document.documentElement.setAttribute('data-theme', pref);
    else document.documentElement.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', effectiveTheme() === 'dark' ? '#131412' : '#009c3b');
  }

  function toggleTheme() {
    Store.setPref('theme', effectiveTheme() === 'dark' ? 'light' : 'dark');
    applyTheme();
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

  function updateModeButton() {
    const btn = document.getElementById('modeBtn');
    // aria-pressed reflects Hard Mode, which is the default state.
    // "Raiz vs Nutella" is Brazil's own meme for hardcore vs soft.
    btn.setAttribute('aria-pressed', Mode.hard ? 'true' : 'false');
    btn.textContent = Mode.hard ? 'Modo Raiz' : 'Modo Nutella';
    btn.title = Mode.hard
      ? 'Modo Raiz (hardcore): no Portuguese shown. Tap for Modo Nutella.'
      : 'Modo Nutella (soft): the Portuguese infinitive is shown as a hint. Tap for Modo Raiz.';
  }

  /* -------------------------------------------------------------- routing */

  function currentTopicId() {
    const id = (location.hash || '').replace(/^#/, '');
    return topicById(id) ? id : 'browse';
  }

  function route() {
    const topic = topicById(currentTopicId());
    renderTabs();
    window.scrollTo(0, 0);
    if (topic.kind === 'browse') Browse.render();
    else if (topic.kind === 'daily') Daily.mount();
    else Quiz.mount(topic);
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

    const chip = e.target.closest('.chip[data-group]');
    if (chip) { Quiz.toggleGroup(chip.dataset.group); return; }

    const rst = e.target.closest('[data-reset-topic]');
    if (rst) {
      const t = topicById(rst.dataset.resetTopic);
      // confirm() is absent in the headless smoke stub; treat that as a yes
      if (t && (typeof window.confirm !== 'function' ||
                window.confirm('Reset mastered progress for "' + t.label + '"?'))) {
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

  // sync.js re-renders through this after pulling remote progress
  window.App = { refresh: route };
})();
