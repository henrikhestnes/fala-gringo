// The conjugation rules, readable (1.33).
//
// The rules were always in the app — js/conjugate.js is the oracle the checks
// verify every regular verb against, and the answer card highlights where a
// form breaks them — but there was nowhere to READ them. This file renders one
// card per verb tense: the endings on three model verbs, computed from that same
// oracle (so a rule card can never drift from what the checks enforce), a few
// hand-written notes, the verbs of the data that break the pattern (computed by
// regularExpectation() in topics.js, grouped by how they break it), and which
// person/ending patterns the learner has shown they know (Infer.knownPatterns,
// a ✓ in the table).
//
// Shown in three places: the 📖 Rule panel under a verb drill (quiz.js — an
// answer given while it is open is practice, not recorded), the "How the …
// works" link under the answer card's conjugation table, and the #regras page
// (all five tenses, from Browse). Root app only: the subpages do not load it.

window.Rules = (function () {
  const MODELS = ['falar', 'comer', 'partir'];

  /* Per tense: the lead, the hand-written notes, and how to build the forms.
     `source` (the subjunctives) names the form the tense is built FROM; the
     table then shows that form above the four it gives. */
  const TENSES = {
    presente: {
      title: 'Presente',
      lead: 'Drop the <b>-ar</b>, <b>-er</b> or <b>-ir</b> and add the ending for the person.',
      notes: [
        '<b>você</b> shares its form with <b>ele</b>, <b>ela</b> and <b>a gente</b> (<i>a gente fala</i> — how Rio says “we” most of the time); <b>vocês</b> with <b>eles</b> and <b>elas</b>.',
        '-er and -ir differ only in the <b>nós</b> form: <i>comemos</i> but <i>partimos</i>.',
        'The <b>eu</b> form is the one to know well: it is where most irregular verbs break (<i>posso, peço, durmo</i>), and the present subjunctive is built from it.'
      ]
    },
    perfeito: {
      title: 'Pretérito Perfeito',
      lead: 'For things that happened and are done. Drop the <b>-ar</b>, <b>-er</b> or <b>-ir</b> and add:',
      notes: [
        'The <b>nós</b> form of -ar and -ir verbs is the same as in the presente (<i>falamos</i>, <i>partimos</i>) — context tells you which.',
        'The irregular verbs take a new stem for the whole tense (<i>fiz-, tiv-, pud-, quis-, soub-, disse-, trouxe-</i>), and <b>ser</b> and <b>ir</b> share theirs: <i>fui</i> is both “I was” and “I went”.',
        'Learn the <b>vocês</b> form of these well: the imperfect subjunctive is built from it.'
      ]
    },
    imperfeito: {
      title: 'Pretérito Imperfeito',
      lead: 'For what used to happen or was going on. <b>-ar</b> verbs take <b>-ava</b>; <b>-er</b> and <b>-ir</b> verbs take <b>-ia</b>.',
      notes: [
        '<b>eu</b> and <b>você</b> share the form: <i>eu falava, você falava</i>.',
        '<b>nós</b> carries an accent: <i>falávamos, comíamos</i>.',
        'The easiest tense: only <b>ser</b>, <b>ter</b>, <b>vir</b> and <b>pôr</b> are truly irregular (<i>era, tinha, vinha, punha</i>).'
      ]
    },
    'subjuntivo-presente': {
      title: 'Presente do Subjuntivo',
      lead: 'Take the <b>eu</b> form of the presente, drop the <b>-o</b> and swap the vowel: <b>-ar</b> verbs take <b>-e</b>, <b>-er</b> and <b>-ir</b> verbs take <b>-a</b>.',
      source: { tense: 'presente', row: 0, cut: /o$/, label: 'eu' },
      notes: [
        'It follows a wish, a doubt or a feeling: <i>quero que…</i>, <i>tomara que…</i>, <i>talvez…</i>, <i>espero que…</i>, <i>é bom que…</i>',
        'An -ar stem keeps its sound: <i>fico → fique, chego → chegue, começo → comece</i>.',
        'Because it starts from the eu form, an irregular eu carries through: <i>faço → faça, tenho → tenha, digo → diga</i>.'
      ]
    },
    subjuntivo: {
      title: 'Imperfeito do Subjuntivo',
      lead: 'Take the <b>vocês</b> form of the pretérito perfeito, drop the <b>-ram</b> and add <b>-sse</b>.',
      source: { tense: 'perfeito', row: 3, cut: /ram$/, label: 'vocês' },
      notes: [
        'It follows <i>se…</i> (if), <i>como se…</i> (as if) and wishes in the past: <i>queria que…</i>',
        '<b>No exceptions.</b> A verb with an irregular perfeito gives an irregular-looking form, but by the same rule: <i>fizeram → fizesse, foram → fosse</i>.',
        '<b>nós</b> takes an accent: <i>falássemos</i>, <i>comêssemos</i> (closed ê), but <i>fizéssemos</i> (open é) when the perfeito stem changed.'
      ]
    }
  };

  const verbs = () => window.DATA_VERBS.verbs;
  const byPt = pt => verbs().find(v => v.pt === pt) || null;
  const persons = () => window.DATA_VERBS.personsShort;
  const it = s => '<i>' + escapeHtml(s) + '</i>';
  const plain = s => normalize(s);

  function has(tense) { return Object.prototype.hasOwnProperty.call(TENSES, tense); }

  /* The forms the rule gives for a model verb (the oracle — never the data). */
  function ruleForms(pt, tense) {
    const o = conjugateRegular(pt);
    if (!o) return null;
    if (tense === 'subjuntivo') return subjImperfectFromPerfeito3pl(o.perfeito[3], pt);
    if (tense === 'subjuntivo-presente') return subjPresentRegular(o.presente[0], pt);
    return o[tense] || null;
  }

  /* stem|ending: the form split where it leaves the infinitive's stem (fal|ávamos). */
  function split(form, pt) {
    const stem = pt.slice(0, -2);
    let a = 0;
    while (a < form.length && a < stem.length && form[a] === stem[a]) a++;
    return escapeHtml(form.slice(0, a)) + '<b class="rule-end">' + escapeHtml(form.slice(a)) + '</b>';
  }

  /* Regular verbs per class in this tense — "-ar · 74 verbs follow it". */
  function regularCount(tense, cls) {
    return verbs().filter(v => v.quiz !== false && v.tenses[tense] && v.pt.slice(-2) === cls &&
      (function () {
        const e = regularExpectation(v, tense);
        return e && v.tenses[tense].every((r, i) => r.form === e[i]);
      })()).length;
  }

  /* The patterns (class|tense|person) the learner has shown on PATTERN_MIN
     regular verbs — js/infer.js, the same judgement the Foco schedule uses. */
  function knownSet(tense) {
    const t = topicById(tense);
    if (!t || !window.Infer || typeof Store === 'undefined') return new Set();
    try { return Infer.knownPatterns(tense, topicCards(t)); } catch (e) { return new Set(); }
  }

  function tableHtml(tense, known) {
    const spec = TENSES[tense];
    const head = '<tr><th></th>' + MODELS.map(pt => {
      const cls = pt.slice(-2);
      const n = regularCount(tense, cls);
      const verbsN = n + (n === 1 ? ' verb' : ' verbs');
      return '<th title="' + verbsN + ' in this app follow this pattern exactly"><span class="rule-cls">-' + cls + '</span> ' + it(pt) +
        '<small>' + verbsN + '</small></th>';
    }).join('') + '</tr>';
    let src = '';
    if (spec.source) {
      src = '<tr class="rule-src"><td class="rule-who">from ' + escapeHtml(spec.source.label) + '</td>' + MODELS.map(pt => {
        const f = conjugateRegular(pt)[spec.source.tense][spec.source.row];
        const m = f.match(spec.source.cut);
        return '<td>' + escapeHtml(f.slice(0, m.index)) + '<s>' + escapeHtml(m[0]) + '</s> →</td>';
      }).join('') + '</tr>';
    }
    const rows = persons().map((who, i) => '<tr><td class="rule-who">' + escapeHtml(who) + '</td>' + MODELS.map(pt => {
      const f = ruleForms(pt, tense)[i];
      const ok = known.has(pt.slice(-2) + '|' + tense + '|' + i);
      return '<td' + (ok ? ' class="is-known"' : '') + '><button type="button" class="rule-form" lang="pt-BR" data-speak="' +
        escapeHtml(who + ' ' + f) + '">' + split(f, pt) + '</button>' +
        (ok ? '<span class="rule-ok" title="You know this ending">✓</span>' : '') + '</td>';
    }).join('') + '</tr>').join('');
    return '<div class="rule-table-wrap"><table class="rule-table" lang="pt-BR">' + head + src + rows + '</table></div>';
  }

  /* A verb's forms that differ from the regular pattern, marked the way the
     answer card marks them. */
  function diffForms(v, tense) {
    const e = regularExpectation(v, tense);
    return v.tenses[tense].map((r, i) => {
      if (e && r.form === e[i]) return null;
      return { i: i, form: r.form, html: markIrregular(r.form, e ? irregularSpan(r.form, e[i]) : null), expected: e ? e[i] : null };
    }).filter(Boolean);
  }

  function chip(v, inner) {
    return '<span class="rule-verb" lang="pt-BR"><b>' + escapeHtml(v.pt) + '</b> ' + inner + '</span>';
  }

  /* The verbs that break the pattern, grouped by how: only an accent added
     (saímos), only the eu form (posso), or more. The subjunctives are rules
     on top of another form instead, so they list where an irregular source
     carries through (faço → faça) and the listed exceptions. */
  function breakersHtml(tense) {
    const spec = TENSES[tense];
    const list = verbs().filter(v => v.quiz !== false && v.tenses[tense]);
    const groups = [];
    if (spec.source) {
      const exceptions = [], chains = [];
      list.forEach(v => {
        const src = v.tenses[spec.source.tense] && v.tenses[spec.source.tense][spec.source.row];
        const listed = tense === 'subjuntivo-presente' && SUBJ_PRESENT_EXCEPTIONS[v.pt];
        if (listed) { exceptions.push(chip(v, escapeHtml(v.tenses[tense][0].form))); return; }
        const o = conjugateRegular(v.pt);
        const regularSrc = o && o[spec.source.tense][spec.source.row] === (src && src.form);
        if (src && !regularSrc) chains.push(chip(v, escapeHtml(src.form) + ' → ' + escapeHtml(v.tenses[tense][0].form)));
      });
      if (chains.length) groups.push(['An irregular ' + spec.source.label + ' form carries through', chains]);
      if (exceptions.length) groups.push(['Exceptions — forms of their own, learnt by heart', exceptions]);
    } else {
      const accent = [], euOnly = [], more = [];
      list.forEach(v => {
        const d = diffForms(v, tense);
        if (!d.length) return;
        const html = d.map(x => x.html).join(' · ');
        if (d.every(x => x.expected && plain(x.form) === plain(x.expected))) accent.push(chip(v, html));
        else if (d.length === 1 && d[0].i === 0) euOnly.push(chip(v, html));
        else more.push(chip(v, html));
      });
      if (euOnly.length) groups.push(['Only the eu form changes', euOnly]);
      if (more.length) groups.push([tense === 'perfeito' ? 'A new stem for the tense' : 'More forms change', more]);
      if (accent.length) groups.push(['Only an accent, so the vowel keeps its own syllable', accent]);
    }
    if (!groups.length) return '';
    return '<div class="rule-breakers"><h4>' + (spec.source ? 'Where it looks irregular'
        : 'Verbs that break it <small>(the highlighted letters are what changes)</small>') + '</h4>' +
      groups.map(g => '<p class="rule-group"><span class="rule-group-name">' + escapeHtml(g[0]) +
        '</span>' + g[1].join('') + '</p>').join('') + '</div>';
  }

  function knownLine(tense, known) {
    const n = Array.from(known).filter(k => k.split('|')[1] === tense).length;
    const total = MODELS.length * persons().length;
    if (!n) return '<p class="rule-progress">A ✓ appears on an ending once you have answered it right on ' +
      (window.Infer ? Infer.PATTERN_MIN : 5) + ' regular verbs.</p>';
    return '<p class="rule-progress">✓ ' + n + ' of ' + total + ' endings: ones you have shown you know on ' +
      (window.Infer ? Infer.PATTERN_MIN : 5) + '+ regular verbs.</p>';
  }

  /* One tense, the same card in the drill's panel and on the #regras page. */
  function cardHtml(tense, opts) {
    if (!has(tense) || typeof conjugateRegular !== 'function') return '';
    opts = opts || {};
    const spec = TENSES[tense];
    const known = knownSet(tense);
    const t = topicById(tense);
    return '<section class="rule-card" data-rule-tense="' + escapeHtml(tense) + '">' +
      '<h3 lang="pt-BR">' + escapeHtml(spec.title) + '</h3>' +
      '<p class="rule-lead">' + spec.lead + '</p>' +
      tableHtml(tense, known) +
      knownLine(tense, known) +
      '<ul class="rule-notes">' + spec.notes.map(n => '<li>' + n + '</li>').join('') + '</ul>' +
      breakersHtml(tense) +
      (opts.drillLink && t ? '<p class="rule-foot"><button class="tab-link" type="button" data-tab="' + escapeHtml(t.id) +
        '">Drill ' + escapeHtml(t.label) + ' →</button></p>' : '') +
      '</section>';
  }

  /* The drill's 📖 panel: the open tab's tense, and a way to the rest. */
  function panelHtml(tense) {
    return cardHtml(tense) +
      '<p class="rule-foot"><a class="tab-link" href="#regras">All five tenses →</a></p>';
  }

  function pageHtml() {
    return '<div class="rules-page" lang="en">' +
      '<h2>How verbs conjugate</h2>' +
      '<p class="muted">Every Portuguese verb ends in <b>-ar</b>, <b>-er</b> or <b>-ir</b>, and that ending decides its pattern. ' +
      'The tables below are the regular patterns, with the verbs in this app that break them. ' +
      'The persons drilled are <b>eu</b>, <b>você</b> (also ele, ela, a gente), <b>nós</b> and <b>vocês</b> (also eles, elas). ' +
      'Tap a form to hear it.</p>' +
      Object.keys(TENSES).map(k => cardHtml(k, { drillLink: true })).join('') +
      '</div>';
  }

  function render() {
    const view = document.getElementById('view');
    if (!view) return;
    view.dataset.topic = 'regras';
    view.className = 'narrow';
    view.innerHTML = pageHtml();
  }

  return { has: has, cardHtml: cardHtml, panelHtml: panelHtml, pageHtml: pageHtml, render: render,
           ruleForms: ruleForms, TENSES: TENSES, MODELS: MODELS };
})();
