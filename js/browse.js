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

  function conjPanelHtml(verb) {
    const V = window.DATA_VERBS;
    const blocks = V.tenses.map(t => {
      if (!verb.tenses[t.key]) return '';   // the subjunctive is optional per verb
      const lines = verb.tenses[t.key].map((r, i) => {
        const who = r.person || V.personsShort[i];
        return '<div class="conj-line">' +
          '<span class="who">' + escapeHtml(who) + '</span>' +
          '<span class="form" data-speak="' + escapeHtml(who + ' ' + r.form) + '">' +
            escapeHtml(r.form) + '</span>' +
          (r.meaning ? '<span class="gloss">' + escapeHtml(r.meaning) + '</span>' : '') +
        '</div>'; }).join('');
      return '<div class="conj-tense"><div class="conj-title">' + escapeHtml(t.label) + '</div>' +
             lines + '</div>';
    }).join('');
    return '<div class="conjugation-panel"><div class="conj-body">' + blocks + '</div></div>';
  }

  function rowHtml(verb, num, color) {
    return '<div class="verb-row" style="--row-color:' + color + '">' +
      '<span class="verb-num">' + num + '.</span>' +
      speakButton(verb.pt, 'a pronúncia de ' + verb.pt) +
      '<div class="verb-text">' +
        '<span class="verb-pt" data-lang="pt">' + escapeHtml(verb.pt) +
          (verb.irregular ? ' <span class="tag">(irregular)</span>' : '') + '</span>' +
        '<span class="verb-en" data-lang="en">' + escapeHtml(verb.en) + '</span>' +
      '</div>' +
      '<button class="conj-btn" type="button" aria-label="Show conjugations" ' +
        'data-conj="1">' + CHEVRON_SVG + '</button>' +
      conjPanelHtml(verb) +
    '</div>';
  }

  function render() {
    const V = window.DATA_VERBS;
    const view = document.getElementById('view');
    view.dataset.topic = 'browse';
    view.className = shuffled ? 'shuffled' : '';

    let body = '';
    if (shuffled) {
      const colorOf = {};
      V.categories.forEach(c => { colorOf[c.name] = c.color; });
      shuffle(V.verbs).forEach((v, i) => {
        body += rowHtml(v, i + 1, colorOf[v.category] || 'var(--border)');
      });
    } else {
      V.categories.forEach(cat => {
        const list = V.verbs.filter(v => v.category === cat.name);
        if (!list.length) return;
        body += '<div class="cat-head"><span class="cat-dot" style="background:' + cat.color +
                '"></span>' + escapeHtml(cat.name) + '</div>';
        list.forEach((v, i) => { body += rowHtml(v, i + 1, cat.color); });
      });
    }

    view.innerHTML = '' +
      '<div class="view-head">' +
        '<h1>Verbos</h1>' +
        '<p>' + V.verbs.length + ' verbs — tap any word to hide or reveal it</p>' +
      '</div>' +
      '<div class="controls" style="margin-bottom:1rem">' +
        '<button class="btn" data-browse="hide-pt">Hide Português</button>' +
        '<button class="btn" data-browse="hide-en">Hide English</button>' +
        '<button class="btn" data-browse="show">Show all</button>' +
        '<button class="btn' + (shuffled ? ' active' : '') + '" data-browse="shuffle">Shuffle</button>' +
        (shuffled ? '<button class="btn" data-browse="reset">Original order</button>' : '') +
      '</div>' + body;
  }

  function action(what) {
    if (what === 'hide-pt') {
      document.querySelectorAll('[data-lang="pt"]').forEach(el => el.classList.add('hidden'));
    } else if (what === 'hide-en') {
      document.querySelectorAll('[data-lang="en"]').forEach(el => el.classList.add('hidden'));
    } else if (what === 'show') {
      document.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
    } else if (what === 'shuffle') {
      shuffled = true; render();
    } else if (what === 'reset') {
      shuffled = false; render();
    }
  }

  return { render: render, action: action };
})();
