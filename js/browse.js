// The browse view — the original study tool, carried across as a tab.
// Tap any word to hide/reveal it, expand a row for all three tenses, and tap any
// form to hear it. This is the only tab where Portuguese is visible up front, so
// Hard Mode deliberately does not apply here.

const Browse = (function () {
  const CHEVRON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="6 9 12 15 18 9"></polyline></svg>';

  let shuffled = false;
  let query = '';
  let order = null;

  /* The same irregularity marks as the drill's answer card (topics.js: the
     letters that differ from the regular oracle, a dashed gap for a dropped
     ending), with one legend line under the panel when the verb has any. */
  function conjPanelHtml(verb) {
    const V = window.DATA_VERBS;
    const m = verb.pt.match(/(ar|er|ir)$/);
    let irregular = 0;
    const blocks = V.tenses.map(t => {
      if (!verb.tenses[t.key]) return '';   // the subjunctive is optional per verb
      const expected = regularExpectation(verb, t.key);
      const lines = verb.tenses[t.key].map((r, i) => {
        const who = r.person || V.personsShort[i];
        const span = irregularSpan(r.form, expected && expected[i]);
        if (span) irregular++;
        return '<div class="conj-line' + (span ? ' is-irregular' : '') + '">' +
          '<span class="who">' + escapeHtml(who) + '</span>' +
          '<button type="button" class="form" lang="pt-BR" data-speak="' + escapeHtml(who + ' ' + r.form) + '">' +
            markIrregular(r.form, span) + '</button>' +
          (r.meaning ? '<span class="gloss" lang="en">' + escapeHtml(r.meaning) + '</span>' : '') +
        '</div>'; }).join('');
      return '<div class="conj-tense"><div class="conj-title">' + escapeHtml(t.label) + '</div>' +
             lines + '</div>';
    }).join('');
    let legend = '';
    if (irregular) {
      legend = '<div class="conj-note">' + irregular + ' form' + (irregular === 1 ? '' : 's') +
        ' break the regular -' + m[1] + ' pattern — the highlighted letters are what changes' +
        ' (a dashed gap: the ending is dropped).</div>';
    } else if (verb.irregular && !m) {
      legend = '<div class="conj-note">Irregular verb — ' + escapeHtml(verb.pt) +
        ' follows no -ar/-er/-ir pattern, so its forms are learnt by heart.</div>';
    }
    return '<div class="conjugation-panel"><div class="conj-body">' + blocks + '</div>' + legend + '</div>';
  }

  function rowHtml(verb, num, color) {
    const id = 'conj-' + window.DATA_VERBS.verbs.indexOf(verb);
    return '<div class="verb-row" data-verb="' + escapeHtml(verb.pt) + '" style="--row-color:' + color + '">' +
      '<span class="verb-num">' + num + '.</span>' + speakButton(verb.pt, verb.pt) +
      '<div class="verb-text">' +
        '<button type="button" class="verb-pt" lang="pt-BR" data-lang="pt" aria-pressed="false" title="Hide or reveal Portuguese">' + escapeHtml(verb.pt) +
          (verb.irregular ? ' <span class="tag">(irregular)</span>' : '') + '</button>' +
        '<button type="button" class="verb-en" lang="en" data-lang="en" aria-pressed="false" title="Hide or reveal English">' + escapeHtml(verb.en) + '</button>' +
      '</div>' +
      '<button class="conj-btn" type="button" aria-label="Show conjugations for ' + escapeHtml(verb.pt) + '" aria-expanded="false" aria-controls="' + id + '" data-conj="1">' + CHEVRON_SVG + '</button>' +
      '<div class="conjugation-slot" id="' + id + '"></div></div>';
  }

  function toggleConjugation(row, button) {
    const slot = row.querySelector('.conjugation-slot');
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    if (expanded && !slot.innerHTML) {
      const verb = window.DATA_VERBS.verbs.find(v => v.pt === row.dataset.verb);
      if (!verb) return;
      slot.innerHTML = conjPanelHtml(verb);
    }
    row.classList.toggle('expanded', expanded);
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', (expanded ? 'Hide' : 'Show') + ' conjugations for ' + row.dataset.verb);
  }

  function renderRows() {
    const V = window.DATA_VERBS;
    const matches = v => !query || normalize(v.pt + ' ' + v.en).includes(normalize(query));
    let body = '', count = 0;
    if (shuffled) {
      const colorOf = {};
      V.categories.forEach(c => { colorOf[c.name] = c.color; });
      (order || V.verbs).filter(matches).forEach((v, i) => { body += rowHtml(v, i + 1, colorOf[v.category]); count++; });
    } else {
      V.categories.forEach(cat => {
        const list = V.verbs.filter(v => v.category === cat.name && matches(v));
        if (!list.length) return;
        body += '<div class="cat-head"><span class="cat-dot" style="background:' + cat.color + '"></span>' + escapeHtml(cat.name) + '</div>';
        list.forEach((v, i) => { body += rowHtml(v, i + 1, cat.color); count++; });
      });
    }
    document.getElementById('browseRows').innerHTML = body || '<p>No verbs match your search.</p>';
    document.getElementById('browseCount').textContent = count + ' of ' + V.verbs.length + ' verbs';
  }

  function render() {
    const view = document.getElementById('view');
    view.dataset.topic = 'browse';
    view.className = shuffled ? 'shuffled' : '';
    // the first-session starter is for a learner who has never answered a card;
    // once they have, the verb list is the page and "Verbos" its heading again
    const fresh = Quiz.newcomer();
    const welcome = fresh
      ? '<section class="welcome"><h1>Start speaking Brazilian Portuguese</h1>' +
        '<p>Try five cards: read the English and type the Portuguese. You can answer with or without accents.</p>' +
        '<button class="btn primary" type="button" data-start-practice="1">Start a short practice →</button>' +
        '<p class="welcome-help">Modo Raiz = without hints · Modo Nutella = with hints. Change it above whenever you like.</p></section>'
      : '';
    const h = fresh ? 'h2' : 'h1';
    view.innerHTML = welcome +
      '<div class="view-head"><' + h + ' lang="pt-BR">Verbos</' + h + '><p>Browse ' + window.DATA_VERBS.verbs.length + ' verbs — tap a word to hide or reveal it.</p></div>' +
      '<label class="search-label" for="browseSearch">Find a verb in Portuguese or English</label>' +
      '<input class="browse-search" id="browseSearch" type="search" autocomplete="off" placeholder="falar, speak…" value="' + escapeHtml(query) + '">' +
      '<p id="browseCount" role="status" aria-live="polite"></p>' +
      '<div class="controls" style="margin-bottom:1rem">' +
        '<button class="btn" data-browse="hide-pt">Hide Português</button>' +
        '<button class="btn" data-browse="hide-en">Hide English</button>' +
        '<button class="btn" data-browse="show">Show all</button>' +
        '<button class="btn' + (shuffled ? ' active' : '') + '" data-browse="shuffle">Shuffle</button>' +
        (shuffled ? '<button class="btn" data-browse="reset">Original order</button>' : '') +
      '</div><div id="browseRows"></div>';
    document.getElementById('browseSearch').addEventListener('input', e => { query = e.target.value; renderRows(); });
    renderRows();
  }

  function action(what) {
    if (what === 'hide-pt') {
      document.querySelectorAll('[data-lang="pt"]').forEach(el => { el.classList.add('hidden'); el.setAttribute('aria-pressed', 'true'); });
    } else if (what === 'hide-en') {
      document.querySelectorAll('[data-lang="en"]').forEach(el => { el.classList.add('hidden'); el.setAttribute('aria-pressed', 'true'); });
    } else if (what === 'show') {
      document.querySelectorAll('.hidden').forEach(el => { el.classList.remove('hidden'); el.setAttribute('aria-pressed', 'false'); });
    } else if (what === 'shuffle') {
      shuffled = true; order = shuffle(window.DATA_VERBS.verbs); render();
    } else if (what === 'reset') {
      shuffled = false; order = null; render();
    }
  }

  return { render: render, action: action, toggleConjugation: toggleConjugation };
})();
