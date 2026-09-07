// Topic registry.
//
// The source repo duplicated its whole drill engine once per page because every
// topic has a different card schema. Here each topic instead normalises its data
// into ONE card shape, and a single engine (quiz.js) drives all of them:
//
//   { id, topic, group, meta, hint, prompt, sub, accepted[], answer,
//     pron, speak, reveal, allowEmpty }
//
//   hint      shown only in Easy Mode (the answer-revealing crutch)
//   accepted  every string counted as correct, compared via normalize()
//   reveal    HTML shown after answering (example / tip / note / conj table)

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

function exampleBlock(pt, en) {
  if (!pt) return '';
  return '<div class="example">"' + escapeHtml(pt) + '"' +
         (en ? '<span class="en">' + escapeHtml(en) + '</span>' : '') + '</div>';
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

function verbConjTable(verb, tense, tenseLabel, currentIndex) {
  const rows = verb.tenses[tense].map((r, i) =>
    '<tr' + (i === currentIndex ? ' class="is-current"' : '') + '>' +
    '<td class="conj-pronoun">' + escapeHtml(r.person || V.personsShort[i]) + '</td>' +
    '<td class="conj-form">' + escapeHtml(r.form) + '</td>' +
    '<td class="conj-pron">' + escapeHtml(r.pron) + '</td></tr>').join('');
  return '<div class="conj-table-wrapper"><div class="conj-table-label">' +
         escapeHtml(verb.pt + ' — ' + tenseLabel) + '</div>' +
         '<table class="conj-table">' + rows + '</table></div>';
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
      // the imperfect subjunctive is usually cited with its trigger word
      if (tense === 'subjuntivo') accepted.push('se ' + full, 'que ' + full);

      // genuine BR synonyms (pôr/botar/colocar, caminhar/andar) accept each other
      (SYNONYMS[verb.pt] || []).forEach(other => {
        if (other === verb.pt) return;
        const o = byPt[other];
        if (!o || !o.tenses[tense]) return;
        const f = o.tenses[tense][i].form;
        accepted.push(f, person + ' ' + f);
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
        speak: full,
        reveal: exampleBlock(row.example) +
                verbConjTable(verb, tense, tenseLabel, i),
        infer: infer
      });
    });
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
    '<td class="conj-pron">' + escapeHtml(r.pron) + '</td></tr>').join('');
  return '<div class="conj-table-wrapper"><div class="conj-table-label">' +
         escapeHtml(verb.pt + ' — ' + PRONOMINAL_TENSE_LABEL[tense]) + '</div>' +
         '<table class="conj-table">' + rows + '</table></div>';
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
    meta: c.gender === 'feminine' ? 'noun · feminine' : 'noun · masculine',
    hint: c.gender === 'feminine' ? 'a …' : 'o …',
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
    const variants = expandSlots(c);
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

  { id: 'perfeito',   label: 'Passado',    kind: 'quiz', tier: 2, groups: VERB_GROUPS,
    build: () => buildVerbCards('perfeito', 'Pretérito Perfeito') },
  { id: 'imperfeito', label: 'Imperfeito', kind: 'quiz', tier: 2, groups: VERB_GROUPS,
    build: () => buildVerbCards('imperfeito', 'Pretérito Imperfeito') },
  { id: 'pronominal', label: 'Pronominais', kind: 'quiz', tier: 2,
    groups: () => window.DATA_PRONOMINAL.groups, build: buildPronominalCards },
  { id: 'adjectives', label: 'Adjectives', kind: 'quiz', tier: 2,
    groups: () => window.DATA_ADJECTIVES.groups, build: buildAdjectiveCards },
  { id: 'adverbs',    label: 'Adverbs',    kind: 'quiz', tier: 2,
    groups: () => window.DATA_ADVERBS.groups,    build: buildAdverbCards },
  { id: 'connecting', label: 'Connecting', kind: 'quiz', tier: 2,
    groups: () => window.DATA_CONNECTING.groups, build: buildConnectingCards },

  { id: 'subjuntivo', label: 'Subjuntivo', kind: 'quiz', tier: 3, groups: VERB_GROUPS,
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
