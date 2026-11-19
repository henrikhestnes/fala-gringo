// Topic registry.
//
// The source repo duplicated its whole drill engine once per page because every
// topic has a different card schema. Here each topic instead normalises its data
// into ONE card shape, and a single engine (quiz.js) drives all of them:
//
//   { id, topic, group, meta, hint, prompt, sub, accepted[], answer,
//     pron, speak, reveal, allowEmpty, variants? }
//
//   hint      shown only in Easy Mode (the answer-revealing crutch)
//   accepted  every string counted as correct, compared via normalize()
//   reveal    HTML shown after answering (example / tip / note / conj table)
//   variants  optional: [{ accepted, answer, pron, flag, speak, reveal }] — the
//             face shown when one of THOSE accepted strings is the one typed
//             (synonym verbs: coloco for ponho), see cardFace() in lib/text.js

const V = window.DATA_VERBS;

function substituteSlots(template, mapping) {
  return template.replace(/\{(\w+)\}/g, (m, id) =>
    Object.prototype.hasOwnProperty.call(mapping, id) ? mapping[id] : m);
}

/* Every combination of a card's slot variants; first variant of each = canonical. */
function expandSlots(card) {
  if (!card.slots) return [card.pt];
  const ids = Object.keys(card.slots);
  let mappings = [{}];
  for (const id of ids) {
    const next = [];
    for (const m of mappings) {
      for (const v of card.slots[id]) next.push(Object.assign({}, m, { [id]: v }));
    }
    mappings = next;
    if (mappings.length > 64) break; // guard; no card in the data comes close
  }
  return mappings.map(m => substituteSlots(card.pt, m));
}

/* The Portuguese example carries lang="pt-BR" and its English gloss lang="en",
   so a screen reader switches voice mid-card — the shell itself is English. */
function exampleBlock(pt, en) {
  if (!pt) return '';
  return '<div class="example" lang="pt-BR">"' + escapeHtml(pt) + '"' +
         (en ? '<span class="en" lang="en">' + escapeHtml(en) + '</span>' : '') + '</div>';
}
function tipBlock(html) { return html ? '<div class="tip">' + html + '</div>' : ''; }
function noteBlock(html) { return html ? '<div class="note">' + html + '</div>' : ''; }

/* ---------------------------------------------------------------- verbs ---- */

function verbGroup(v) {
  if (v.irregular) return 'irregular';
  const end = v.pt.slice(-2);
  return (end === 'ar' || end === 'er' || end === 'ir') ? '-' + end + ' verbs' : 'irregular';
}

const SYNONYMS = (function () {
  const map = {};
  (V.synonyms || []).forEach(group => group.forEach(v => { map[v] = group; }));
  return map;
})();

/* ---- irregularity, shown on the answer card ----
   The regular expectation for a tense: the oracle's forms, or for the imperfect
   subjunctive what a REGULAR perfeito 3pl would derive to (fazer → fazeram →
   fazesse, so fizesse shows its irregular "iz"). null when the oracle has nothing
   to say — pôr has no -ar/-er/-ir ending — or the page skipped js/conjugate.js. */
function regularExpectation(verb, tense) {
  if (typeof conjugateRegular !== 'function') return null;
  const oracle = conjugateRegular(verb.pt);
  if (!oracle) return null;
  if (tense === 'subjuntivo') {
    return typeof subjImperfectFromPerfeito3pl === 'function'
      ? subjImperfectFromPerfeito3pl(oracle.perfeito[3], verb.pt) : null;
  }
  // the present subjunctive: what a REGULAR presente eu form would derive to
  // (fazer → fazo → faza, so faça shows its "ç"; ser → so → sa, so seja is all irregular)
  if (tense === 'subjuntivo-presente') {
    return typeof subjPresentRegular === 'function'
      ? subjPresentRegular(oracle.presente[0], verb.pt) : null;
  }
  return oracle[tense] || null;
}

/* Where a form breaks the pattern: the letters left once the longest common prefix
   and suffix with the regular expectation are peeled off (faço/fazo → "ç",
   fizéssemos/fazêssemos → "izé", é/se → the whole form). null = regular. */
function irregularSpan(form, expected) {
  if (!expected || form === expected) return null;
  let a = 0;
  while (a < form.length && a < expected.length && form[a] === expected[a]) a++;
  let b = 0;
  while (b < form.length - a && b < expected.length - a &&
         form[form.length - 1 - b] === expected[expected.length - 1 - b]) b++;
  // quer/diz/traz: nothing is respelt, the ending is simply dropped — `drop` marks the gap
  return { pre: form.slice(0, a), mid: form.slice(a, form.length - b), post: form.slice(form.length - b),
           drop: a + b === form.length };
}

function markIrregular(form, span) {
  if (!span) return escapeHtml(form);
  const mark = span.drop ? '<mark class="irr drop" title="ending dropped"></mark>'
                         : '<mark class="irr">' + escapeHtml(span.mid) + '</mark>';
  return escapeHtml(span.pre) + mark + escapeHtml(span.post);
}

/* One line under the table about the form just answered. */
function conjNote(verb, expected, spans, i) {
  const m = verb.pt.match(/(ar|er|ir)$/);
  const ending = m ? '-' + m[1] : null;
  const it = f => '<i>' + escapeHtml(f) + '</i>';
  let text;
  if (!expected) {
    if (!verb.irregular) return '';
    text = 'Irregular verb — ' + escapeHtml(verb.pt) + ' follows no -ar/-er/-ir pattern, so its forms are learnt by heart.';
  } else if (spans[i]) {
    const sp = spans[i];
    if (sp.drop) {
      text = 'Irregular — the regular ' + ending + ' ending is dropped here (the pattern would give ' + it(expected[i]) + ').';
    } else if (!sp.pre && !sp.post) {
      text = 'Irregular form — nothing here follows the regular ' + ending + ' pattern.';
    } else {
      text = 'Irregular in the highlighted letters — the regular ' + ending + ' pattern would give ' + it(expected[i]) + '.';
    }
  } else if (spans.some(Boolean)) {
    text = 'This form is regular; the highlighted forms of ' + escapeHtml(verb.pt) + ' break the ' + ending + ' pattern.';
  } else {
    return '';
  }
  return '<div class="conj-note">' + text + '</div>';
}

function verbConjTable(verb, tense, tenseLabel, currentIndex) {
  const expected = regularExpectation(verb, tense);
  const spans = verb.tenses[tense].map((r, i) => irregularSpan(r.form, expected && expected[i]));
  const rows = verb.tenses[tense].map((r, i) =>
    '<tr class="' + (i === currentIndex ? 'is-current' : '') + (spans[i] ? ' is-irregular' : '') + '">' +
    '<td class="conj-pronoun">' + escapeHtml(r.person || V.personsShort[i]) + '</td>' +
    '<td class="conj-form">' + markIrregular(r.form, spans[i]) + '</td>' +
    '<td class="conj-pron" lang="en">' + escapeHtml(r.pron) + '</td></tr>').join('');
  return '<div class="conj-table-wrapper"><div class="conj-table-label" lang="pt-BR">' +
         escapeHtml(verb.pt + ' — ' + tenseLabel) + '</div>' +
         '<table class="conj-table" lang="pt-BR">' + rows + '</table>' +
         conjNote(verb, expected, spans, currentIndex) + ruleLink(tense, tenseLabel) + '</div>';
}

/* The way from a form to its rule (js/rules.js, 1.33): opens the drill's 📖
   panel — app.js routes the click. The Daily hides it (css): no help there. */
function ruleLink(tense, tenseLabel) {
  return '<button class="rule-link" type="button" data-rule="' + escapeHtml(tense) + '" lang="en">📖 How the ' +
    escapeHtml(tenseLabel) + ' works</button>';
}

/* The card's flag for the feedback line: "irregular" when this form breaks the
   pattern (or the verb has no pattern at all). Regular forms carry none. */
function verbFlag(verb, tense, i, form) {
  const expected = regularExpectation(verb, tense);
  if (!expected) return verb.irregular ? 'irregular' : '';
  return irregularSpan(form, expected[i]) ? 'irregular' : '';
}

/* Inference metadata for js/infer.js: the word, the pattern (class|tense|person),
   and whether THIS form follows the regular rule — judged per form by the
   oracle in js/conjugate.js, so the regular forms of a mostly irregular verb
   qualify while its odd ones never do. The imperfect subjunctive is regular
   whenever the perfeito 3pl it derives from is (the derivation itself has no
   exceptions). Without the oracle loaded (a page that skips it) there is no
   metadata and no inference — everything else is unaffected. */
function verbInfer(verb, tense, i, form) {
  if (typeof conjugateRegular !== 'function') return null;
  const oracle = conjugateRegular(verb.pt);
  if (!oracle) return null;
  let regular;
  if (tense === 'subjuntivo') {
    const perf = verb.tenses.perfeito && verb.tenses.perfeito[3];
    regular = !!perf && oracle.perfeito[3] === perf.form;
  } else if (tense === 'subjuntivo-presente') {
    // regular whenever the presente eu form it derives from is
    const pres = verb.tenses.presente && verb.tenses.presente[0];
    regular = !!pres && oracle.presente[0] === pres.form;
  } else {
    regular = !!oracle[tense] && oracle[tense][i] === form;
  }
  return { lexeme: verb.pt, pattern: verb.pt.slice(-2) + '|' + tense + '|' + i, regular: regular };
}

function buildVerbCards(tense, tenseLabel) {
  const byPt = {};
  V.verbs.forEach(v => { byPt[v.pt] = v; });
  const cards = [];

  V.verbs.forEach(verb => {
    if (verb.quiz === false) return;
    if (!verb.tenses[tense]) return;   // the subjunctive covers a curated subset
    verb.tenses[tense].forEach((row, i) => {
      if (row.quiz === false) return;    // e.g. "eu aconteço": grammatical, never said — Browse only
      const infer = verbInfer(verb, tense, i, row.form);
      const person = row.person || V.personsShort[i];   // acontecer: "isso", "as coisas"
      const full = person + ' ' + row.form;
      const accepted = [row.form, full];
      // the subjunctives are usually cited with their trigger word
      if (tense === 'subjuntivo') accepted.push('se ' + full, 'que ' + full);
      if (tense === 'subjuntivo-presente') accepted.push('que ' + full);

      // genuine BR synonyms (pôr/botar/colocar, caminhar/andar) accept each other;
      // each also brings its own face (answer, pron, table) for when it is the
      // one typed — cardFace() in text.js swaps it in after the match
      const variants = [];
      (SYNONYMS[verb.pt] || []).forEach(other => {
        if (other === verb.pt) return;
        const o = byPt[other];
        if (!o || !o.tenses[tense]) return;
        const orow = o.tenses[tense][i];
        const f = orow.form, ofull = person + ' ' + f;
        const own = [f, ofull];
        if (tense === 'subjuntivo') own.push('se ' + ofull, 'que ' + ofull);
        if (tense === 'subjuntivo-presente') own.push('que ' + ofull);
        accepted.push(...own);
        variants.push({
          accepted: own,
          answer: ofull,
          pron: orow.pron,
          flag: verbFlag(o, tense, i, f),
          speak: ofull,
          reveal: exampleBlock(orow.example) + verbConjTable(o, tense, tenseLabel, i)
        });
      });

      cards.push({
        id: verb.pt + '|' + i,
        group: verbGroup(verb),
        meta: tenseLabel,
        hint: verb.pt,
        prompt: escapeHtml(row.prompt || row.meaning),
        sub: 'Type the Portuguese — "' + person + ' …" or just the verb form',
        accepted: accepted,
        answer: full,
        pron: row.pron,
        flag: verbFlag(verb, tense, i, row.form),
        speak: full,
        reveal: exampleBlock(row.example) +
                verbConjTable(verb, tense, tenseLabel, i),
        variants: variants.length ? variants : undefined,
        infer: infer
      });
    });
  });
  return cards;
}

/* ------------------------------------------------------------ imperative ---- */

/* Commands, to one person and to a group. The forms are looked up, never
   stored twice: spoken Rio commands one person with the presente você form
   (fala!), the textbook with the present subjunctive (fale!), and a group with
   the present subjunctive vocês form (falem!). Both singular forms are
   accepted; the spoken one leads and the textbook one is a variant face
   (cardFace), so whichever the learner typed is the one answered back, with
   the other named in the "also" line. ser and estar have no spoken short form
   (`spoken: false`): nobody says "é!", seja does both jobs. */
const IMPERATIVE_LABEL = 'Imperativo';
const LETTER = 'A-Za-zÀ-ÖØ-öø-ÿ';

/* Where `form` stands as a word of its own in `text`, any case; -1 if nowhere. */
function wordIndex(text, form) {
  const m = new RegExp('(^|[^' + LETTER + '])' + form + '(?![' + LETTER + '])', 'i').exec(text);
  return m ? m.index + m[1].length : -1;
}
/* The same sentence with one form swapped for another, capital kept. */
function swapForm(text, from, to) {
  const at = wordIndex(text, from);
  if (at < 0) return text;
  const was = text.slice(at, at + from.length);
  const cap = was[0] !== was[0].toLowerCase();
  return text.slice(0, at) + (cap ? to[0].toUpperCase() + to.slice(1) : to) + text.slice(at + from.length);
}

function imperativeFaces(verb, entry) {
  const pres = verb.tenses.presente[1], subj = verb.tenses['subjuntivo-presente'];
  const face = (row, tense, i, who, register) => ({
    form: row.form, pron: row.pron, who: who, register: register,
    span: irregularSpan(row.form, (regularExpectation(verb, tense) || [])[i]),
    flag: verbFlag(verb, tense, i, row.form)
  });
  return {
    spoken: entry.spoken === false ? null : face(pres, 'presente', 1, 'você', 'spoken'),
    textbook: face(subj[1], 'subjuntivo-presente', 1, 'você', entry.spoken === false ? '' : 'textbook'),
    plural: face(subj[3], 'subjuntivo-presente', 3, 'vocês', '')
  };
}

function imperativeTable(verb, faces, current) {
  const rows = [faces.spoken, faces.textbook, faces.plural].filter(Boolean).map(f =>
    '<tr class="' + (f === current ? 'is-current' : '') + (f.span ? ' is-irregular' : '') + '">' +
    '<td class="conj-pronoun">' + escapeHtml(f.who) + '</td>' +
    '<td class="conj-form">' + markIrregular(f.form, f.span) +
    (f.register ? ' <span class="conj-register" lang="en">' + f.register + '</span>' : '') + '</td>' +
    '<td class="conj-pron" lang="en">' + escapeHtml(f.pron) + '</td></tr>').join('');
  return '<div class="conj-table-wrapper"><div class="conj-table-label" lang="pt-BR">' +
         escapeHtml(verb.pt + ' — ' + IMPERATIVE_LABEL) + '</div>' +
         '<table class="conj-table" lang="pt-BR">' + rows + '</table></div>';
}

function buildImperativeCards() {
  const byPt = {};
  V.verbs.forEach(v => { byPt[v.pt] = v; });
  const it = f => '<i lang="pt-BR">' + escapeHtml(f) + '</i>';
  const cards = [];

  window.DATA_IMPERATIVO.cards.forEach(entry => {
    const verb = byPt[entry.verb];
    if (!verb || !verb.tenses['subjuntivo-presente']) return;   // the checks name the entry
    const faces = imperativeFaces(verb, entry);
    const lead = faces.spoken || faces.textbook;
    const prompt = who => escapeHtml(entry.en + ' (' + (entry.note ? entry.note + ' · ' : '') + who + ')');
    const base = {
      group: verbGroup(verb),
      meta: IMPERATIVE_LABEL,
      hint: verb.pt,
      // its own clock (regular: false), but a hit still vouches for the word in the other tense tabs
      infer: { lexeme: verb.pt, pattern: verb.pt.slice(-2) + '|imperativo', regular: false }
    };
    const tip = faces.spoken
      ? 'Rio says ' + it(faces.spoken.form) + '; ' + it(faces.textbook.form) + ' is the textbook form you see on signs and in ' +
        'writing. Both count. For "don\'t", put ' + it('não') + ' in front: ' + it('não ' + faces.spoken.form) + ' / ' +
        it('não ' + faces.textbook.form) + '.'
      : 'No short spoken form here: ' + it(verb.tenses.presente[1].form) + ' is never a command, so ' +
        it(faces.textbook.form) + ' does both jobs.';

    const single = Object.assign({}, base, {
      id: verb.pt + '|você',
      prompt: prompt('to one person'),
      sub: faces.spoken ? 'Type the command — the spoken form or the textbook one, both count'
                        : 'Type the command — one word',
      accepted: [lead.form],
      answer: lead.form,
      pron: lead.pron,
      flag: lead.flag,
      speak: lead.form,
      reveal: exampleBlock(entry.sg) + tipBlock(tip) + imperativeTable(verb, faces, lead)
    });
    if (faces.spoken) {
      const t = faces.textbook;
      single.accepted.push(t.form);
      single.variants = [{
        accepted: [t.form], answer: t.form, pron: t.pron, flag: t.flag, speak: t.form,
        reveal: exampleBlock(swapForm(entry.sg, lead.form, t.form)) + tipBlock(tip) + imperativeTable(verb, faces, t)
      }];
    }
    cards.push(single);

    const p = faces.plural;
    cards.push(Object.assign({}, base, {
      id: verb.pt + '|vocês',
      prompt: prompt('to a group'),
      sub: 'Type the command — one word',
      accepted: [p.form],
      answer: p.form,
      pron: p.pron,
      flag: p.flag,
      speak: p.form,
      reveal: exampleBlock(entry.pl) +
              tipBlock('To a group, speech and textbook agree: ' + it(p.form) + '.') +
              imperativeTable(verb, faces, p)
    }));
  });
  return cards;
}

/* ----------------------------------------------------- pronominal verbs ---- */

const PRONOMINAL_TENSE_LABEL = { presente: 'Presente', perfeito: 'Pretérito Perfeito' };
const PRONOMINAL_TENSE_GROUP = { presente: 'presente', perfeito: 'passado' };

/* Same markup as verbConjTable, but for forms that carry their clitic. */
function pronominalConjTable(verb, tense, currentIndex) {
  const rows = verb.tenses[tense].map((r, i) =>
    '<tr' + (i === currentIndex ? ' class="is-current"' : '') + '>' +
    '<td class="conj-pronoun">' + escapeHtml(V.personsShort[i]) + '</td>' +
    '<td class="conj-form">' + escapeHtml(r.form) + '</td>' +
    '<td class="conj-pron" lang="en">' + escapeHtml(r.pron) + '</td></tr>').join('');
  return '<div class="conj-table-wrapper"><div class="conj-table-label" lang="pt-BR">' +
         escapeHtml(verb.pt + ' — ' + PRONOMINAL_TENSE_LABEL[tense]) + '</div>' +
         '<table class="conj-table" lang="pt-BR">' + rows + '</table></div>';
}

function buildPronominalCards() {
  const D = window.DATA_PRONOMINAL;
  const cards = [];

  // which-pronoun gap cards (same fill-the-gap shape as the connecting topic)
  D.gaps.forEach(c => {
    const filled = c.pt.replace(/\{([^}]*)\}/g, '$1');
    const blanked = escapeHtml(c.pt).replace(/\{[^}]*\}/g, '<span class="blank">____</span>');
    cards.push({
      id: c.pt,
      group: 'pronouns',
      meta: 'which pronoun?',
      hint: c.hint || '',
      prompt: escapeHtml(c.en),
      target: blanked,
      sub: 'Fill the gap with the right pronoun',
      accepted: [c.answer].concat(c.alts || []),
      answer: c.answer,
      pron: '',
      speak: filled,
      reveal: exampleBlock(filled, c.en) + tipBlock(c.tip ? escapeHtml(c.tip) : '')
    });
  });

  // conjugation drills — the clitic is part of every stored form
  D.verbs.forEach(verb => {
    Object.keys(verb.tenses).forEach(tense => {
      verb.tenses[tense].forEach((row, i) => {
        const person = V.personsShort[i];
        const full = person + ' ' + row.form;
        cards.push({
          id: verb.pt + '|' + tense + '|' + i,
          group: PRONOMINAL_TENSE_GROUP[tense],
          meta: PRONOMINAL_TENSE_LABEL[tense],
          hint: verb.pt,
          prompt: escapeHtml(row.meaning),
          sub: 'Type the Portuguese — "' + person + ' …" or just the pronoun + verb',
          accepted: [row.form, full],
          answer: full,
          pron: row.pron,
          speak: full,
          reveal: exampleBlock(row.example) +
                  (verb.tip ? tipBlock(escapeHtml(verb.tip)) : '') +
                  pronominalConjTable(verb, tense, i)
        });
      });
    });
  });

  // everyday phrases, typed whole
  D.phrases.forEach(c => {
    cards.push({
      id: c.pt,
      group: 'phrases',
      meta: 'phrase',
      hint: c.hint || '',
      prompt: escapeHtml(c.en),
      sub: 'Translate into Portuguese',
      accepted: [c.pt].concat(c.alts || []),
      answer: c.pt,
      pron: c.pron || '',
      speak: c.pt,
      reveal: tipBlock(c.tip ? escapeHtml(c.tip) : '')
    });
  });

  return cards;
}

/* ------------------------------------------------------------ non-verbs ---- */

function buildNounCards() {
  return window.DATA_NOUNS.cards.map(c => ({
    id: c.pt,
    group: c.group,
    // The gender lives in the hint, not the meta: Hard Mode shows the meta and
    // hides the hint, and the article IS the answer being drilled.
    meta: 'noun',
    hint: c.gender === 'feminine' ? 'a … (feminine)' : 'o … (masculine)',
    prompt: escapeHtml(c.en),
    sub: 'Type the Portuguese, including the article',
    accepted: [c.pt].concat(c.alts || []),
    answer: c.pt,
    pron: c.pronHint,
    speak: c.pt,
    reveal: exampleBlock(c.example, c.exampleEn) + noteBlock(c.note ? escapeHtml(c.note) : '')
  }));
}

function buildAdjectiveCards() {
  return window.DATA_ADJECTIVES.cards.map(c => ({
    id: c.pt,
    group: c.group,
    meta: 'adjective',
    hint: c.agreement || '',
    prompt: escapeHtml(c.en),
    sub: 'Type the Portuguese',
    accepted: [c.pt].concat(c.alts || []),
    answer: c.pt,
    pron: c.pronHint,
    speak: c.pt,
    reveal: exampleBlock(c.example, c.exampleEn) +
            (c.agreement ? tipBlock('Agreement: ' + escapeHtml(c.agreement)) : '') +
            noteBlock(c.note ? escapeHtml(c.note) : '')
  }));
}

function buildAdverbCards() {
  return window.DATA_ADVERBS.cards.map(c => ({
    id: c.pt,
    group: c.group,
    meta: 'adverb',
    hint: '',
    prompt: escapeHtml(c.en),
    sub: 'Type the Portuguese',
    accepted: [c.pt].concat(c.alts || []),
    answer: c.pt,
    pron: c.pronHint,
    speak: c.pt,
    reveal: exampleBlock(c.example, c.exampleEn) + noteBlock(c.note ? escapeHtml(c.note) : '')
  }));
}

function buildConnectingCards() {
  return window.DATA_CONNECTING.cards.map(c => {
    // '—' is their marker for "nothing goes here"
    const raw = [c.answer].concat(c.alts || []);
    const accepted = raw.map(a => (a === '—' ? '' : a));
    const canonical = c.answer === '—' ? '' : c.answer;
    const filled = substituteSlots(c.pt, {}).replace(/\{[^}]*\}/g, canonical);
    const blanked = escapeHtml(c.pt).replace(/\{[^}]*\}/g, '<span class="blank">____</span>');
    return {
      id: c.pt,
      group: c.group,
      meta: 'connecting words',
      hint: c.hint || '',
      prompt: emphasize(escapeHtml(c.en)),
      target: blanked,
      sub: 'Fill the gap' + (c.hint ? ' — "' + c.hint + '"' : ''),
      accepted: accepted,
      allowEmpty: accepted.some(a => a === ''),
      answer: canonical === '' ? '(nothing)' : canonical,
      pron: '',
      speak: filled.replace(/\s+/g, ' ').trim(),
      reveal: exampleBlock(filled.replace(/\s+/g, ' ').trim(), c.en.replace(/\*\*/g, '')) +
              tipBlock(c.tip ? escapeHtml(c.tip) : '')
    };
  });
}

function buildNumberCards() {
  const D = window.DATA_NUMBERS;
  const labels = D.groupLabels || {};
  return D.cards.map(c => ({
    id: c.prompt + '=' + c.answer,
    group: c.group,
    meta: labels[c.group] || c.group,
    hint: '',
    prompt: escapeHtml(c.prompt),
    sub: 'Type the Portuguese',
    accepted: [c.answer].concat(c.alts || []),
    answer: c.answer,
    pron: c.pron,
    speak: c.answer,
    reveal: exampleBlock(c.example) + tipBlock(c.tip || '')
  }));
}

function buildGlossaryCards() {
  return window.DATA_GLOSSARY.cards.map(c => ({
    id: c.pt,
    group: c.group,
    meta: 'expression',
    hint: '',
    prompt: escapeHtml(c.meaning),
    sub: 'Type the Portuguese expression',
    accepted: [c.pt].concat(c.alts || []),
    answer: c.pt,
    pron: c.pronHint || '',
    speak: c.pt,
    reveal: exampleBlock(c.example, c.exampleEn) + noteBlock(c.note ? escapeHtml(c.note) : '')
  }));
}

function buildSentenceCards() {
  return window.DATA_SENTENCES.cards.map(c => {
    // slots expand inside the sentence; `alts` are whole alternative sentences
    // (the canonical stays `pt`, so the reveal and the Daily read naturally)
    const variants = expandSlots(c).concat(c.alts || []);
    return {
      id: c.en,
      group: c.group,
      meta: 'sentence',
      hint: '',
      prompt: escapeHtml(c.en),
      sub: 'Translate into Portuguese',
      accepted: variants,
      answer: variants[0],
      pron: '',
      speak: variants[0],
      reveal: noteBlock(c.note ? escapeHtml(c.note) : '')
    };
  });
}

/* ------------------------------------------------------------- registry ---- */

const VERB_GROUPS = ['-ar verbs', '-er verbs', '-ir verbs', 'irregular'];

/* Each drill tab carries a `tier` (1 Iniciante, 2 Intermediário, 3 Avançado):
   the tabs encode a level — a beginner lives on Presente and concrete
   vocabulary, an advanced learner on Subjuntivo and Sentences. The tier only
   names the learner (the title in the top bar is the highest tier they have
   taken up) and orders the "next tab" nudge when a tab graduates; nothing is
   ever locked. The tabs are stacked by tier (1.20) — the Daily's seeded pick
   depends on this order, which is accepted: nobody's history hinges on it. */
const TOPICS = [
  { id: 'browse', label: 'Browse', kind: 'browse' },

  { id: 'presente',   label: 'Presente',   kind: 'quiz', tier: 1, groups: VERB_GROUPS,
    build: () => buildVerbCards('presente', 'Presente') },
  { id: 'nouns',      label: 'Nouns',      kind: 'quiz', tier: 1,
    groups: () => window.DATA_NOUNS.groups,      build: buildNounCards },
  { id: 'numbers',    label: 'Numbers', kind: 'quiz', tier: 1,
    groups: () => window.DATA_NUMBERS.groups,    build: buildNumberCards },
  { id: 'glossary',   label: 'Glossary',   kind: 'quiz', tier: 1,
    groups: () => window.DATA_GLOSSARY.groups,   build: buildGlossaryCards },

  { id: 'perfeito',   label: 'Perfeito',   kind: 'quiz', tier: 2, groups: VERB_GROUPS,
    build: () => buildVerbCards('perfeito', 'Pretérito Perfeito') },
  { id: 'imperfeito', label: 'Imperfeito', kind: 'quiz', tier: 2, groups: VERB_GROUPS,
    build: () => buildVerbCards('imperfeito', 'Pretérito Imperfeito') },
  { id: 'imperativo', label: 'Imperativo', kind: 'quiz', tier: 2, groups: VERB_GROUPS,
    build: buildImperativeCards },
  { id: 'pronominal', label: 'Pronominais', kind: 'quiz', tier: 2,
    groups: () => window.DATA_PRONOMINAL.groups, build: buildPronominalCards },
  { id: 'adjectives', label: 'Adjectives', kind: 'quiz', tier: 2,
    groups: () => window.DATA_ADJECTIVES.groups, build: buildAdjectiveCards },
  { id: 'adverbs',    label: 'Adverbs',    kind: 'quiz', tier: 2,
    groups: () => window.DATA_ADVERBS.groups,    build: buildAdverbCards },
  { id: 'connecting', label: 'Connecting', kind: 'quiz', tier: 2,
    groups: () => window.DATA_CONNECTING.groups, build: buildConnectingCards },

  { id: 'subjuntivo-presente', label: 'Subj. Presente', kind: 'quiz', tier: 3, groups: VERB_GROUPS,
    build: () => buildVerbCards('subjuntivo-presente', 'Presente do Subjuntivo') },
  { id: 'subjuntivo', label: 'Subj. Imperfeito', kind: 'quiz', tier: 3, groups: VERB_GROUPS,
    build: () => buildVerbCards('subjuntivo', 'Imperfeito do Subjuntivo') },
  { id: 'sentences',  label: 'Sentences',  kind: 'quiz', tier: 3,
    groups: () => window.DATA_SENTENCES.groups,  build: buildSentenceCards },

  { id: 'daily', label: '★ Daily', kind: 'daily' }
];

const _cardCache = {};

function topicById(id) {
  return TOPICS.find(t => t.id === id) || null;
}

/* Cards are built once per topic and reused; each carries `topic` back-reference. */
function topicCards(topic) {
  if (topic.kind !== 'quiz') return [];
  if (!_cardCache[topic.id]) {
    const cards = topic.build();
    cards.forEach(c => { c.topic = topic.id; });
    _cardCache[topic.id] = cards;
  }
  return _cardCache[topic.id];
}

function topicGroups(topic) {
  if (typeof topic.groups === 'function') return topic.groups();
  return topic.groups || [];
}

/* Every quiz card in a fixed topic order — the daily challenge samples from this. */
function allQuizCards() {
  const out = [];
  TOPICS.forEach(t => {
    if (t.kind !== 'quiz') return;
    topicCards(t).forEach(c => out.push(c));
  });
  return out;
}
