// Registro de tópicos do /ingles/ — o espelho de ../../js/topics.js.
//
// Mesmo contrato: cada tópico normaliza seus dados para o card shape único
// { id, topic, group, meta, hint, prompt, sub, accepted[], answer, pron,
//   speak, reveal, allowEmpty } e o MESMO motor (../../js/quiz.js) roda tudo.
// A direção é invertida: o prompt é português, a resposta digitada é inglês.
// `hint` (só no Modo Nutella) mostra o verbo inglês na forma base.

function exampleBlock(en, pt) {
  if (!en) return '';
  return '<div class="example">"' + escapeHtml(en) + '"' +
         (pt ? '<span class="en">' + escapeHtml(pt) + '</span>' : '') + '</div>';
}
function tipBlock(html) { return html ? '<div class="tip">' + html + '</div>' : ''; }

/* ------------------------------------------------- verbos irregulares ---- */

function buildIrregularCards() {
  const cards = [];
  window.DATA_EN_IRREGULARES.verbs.forEach(v => {
    cards.push({
      id: v.base + '|past',
      group: 'passado',
      meta: 'passado simples',
      hint: v.base,
      prompt: escapeHtml(v.pt),
      sub: 'Digite o passado simples em inglês',
      accepted: [v.past].concat(v.pastAlts || []),
      answer: v.past,
      pron: v.pastPron,
      speak: v.past,
      reveal: exampleBlock(v.examplePast, v.examplePastPt)
    });
    if (v.part) {
      cards.push({
        id: v.base + '|part',
        group: 'particípio',
        meta: 'particípio — "I have …"',
        hint: v.base,
        prompt: escapeHtml(v.pt),
        sub: 'Digite o particípio em inglês',
        accepted: [v.part].concat(v.partAlts || []),
        answer: v.part,
        pron: v.partPron,
        speak: v.part,
        reveal: exampleBlock(v.examplePart, v.examplePartPt)
      });
    }
  });
  return cards;
}

/* --------------------------------------------------- phrasal verbs ---- */

function buildPhrasalCards() {
  return window.DATA_EN_PHRASAL.cards.map(c => ({
    id: c.pv,
    group: c.group,
    meta: 'phrasal verb',
    hint: c.pv.split(' ')[0],       // Modo Nutella mostra só o verbo-raiz
    prompt: escapeHtml(c.pt),
    sub: 'Digite o phrasal verb em inglês',
    accepted: [c.pv].concat(c.alts || []),
    answer: c.pv,
    pron: c.pron,
    speak: c.pv,
    reveal: exampleBlock(c.example, c.examplePt) +
            (c.tip ? tipBlock(escapeHtml(c.tip)) : '')
  }));
}

/* ------------------------------------------------------------ registro ---- */

const TOPICS = [
  { id: 'irregulares', label: 'Irregulares', kind: 'quiz', tier: 2,
    groups: ['passado', 'particípio'], build: buildIrregularCards },
  { id: 'phrasal', label: 'Phrasal verbs', kind: 'quiz', tier: 3,
    groups: () => window.DATA_EN_PHRASAL.groups, build: buildPhrasalCards }
];

const _cardCache = {};

function topicById(id) {
  return TOPICS.find(t => t.id === id) || null;
}

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

function allQuizCards() {
  const out = [];
  TOPICS.forEach(t => {
    if (t.kind !== 'quiz') return;
    topicCards(t).forEach(c => out.push(c));
  });
  return out;
}
