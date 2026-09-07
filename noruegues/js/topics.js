// Registro de tópicos do /noruegues/ — o espelho de ../../js/topics.js (e do
// ../../ingles/js/topics.js).
//
// Mesmo contrato: cada tópico normaliza seus dados para o card shape único
// { id, topic, group, meta, hint, prompt, sub, accepted[], answer, pron,
//   speak, reveal, allowEmpty } e o MESMO motor (../../js/quiz.js) roda tudo.
// As cartas de substantivo levam `exact: true` (text.js matchAnswer): nelas
// o deslize de uma letra que o motor perdoaria é justamente o gênero.
// A direção: o prompt é português (carioca), a resposta digitada é norueguês
// (bokmål). `hint` (só no Modo Nutella) dá a pista em norueguês — o
// infinitivo do verbo, o substantivo cru, a primeira palavra da frase.

function exampleBlock(no, pt) {
  if (!no) return '';
  return '<div class="example">"' + escapeHtml(no) + '"' +
         (pt ? '<span class="en">' + escapeHtml(pt) + '</span>' : '') + '</div>';
}
function tipBlock(html) { return html ? '<div class="tip">' + html + '</div>' : ''; }

/* --------------------------------------------------------------- verbos ---- */

function buildVerboCards() {
  const cards = [];
  window.DATA_NO_VERBOS.verbs.forEach(v => {
    cards.push({
      id: v.inf + '|pres',
      group: 'presente',
      meta: 'presente',
      hint: 'å ' + v.inf,
      prompt: escapeHtml(v.pt),
      sub: 'Digite o presente em norueguês',
      accepted: [v.pres].concat(v.presAlts || []),
      answer: v.pres,
      pron: v.presPron,
      speak: v.pres,
      reveal: exampleBlock(v.presEx, v.presExPt)
    });
    cards.push({
      id: v.inf + '|past',
      group: 'passado',
      meta: 'passado (preteritum)',
      hint: 'å ' + v.inf,
      prompt: escapeHtml(v.pt),
      sub: 'Digite o passado em norueguês',
      accepted: [v.past].concat(v.pastAlts || []),
      answer: v.past,
      pron: v.pastPron,
      speak: v.past,
      reveal: exampleBlock(v.pastEx, v.pastExPt)
    });
  });
  return cards;
}

/* --------------------------------------------------------- substantivos ---- */

// artigo indefinido por gênero; o feminino também aceita `en` (bokmål)
const NO_ARTICLE = { m: 'en', f: 'ei', n: 'et' };

function nounIndefinite(n) {
  const canon = NO_ARTICLE[n.g] + ' ' + n.n;
  const alts = (n.indefAlts || []).slice();
  if (n.g === 'f') alts.push('en ' + n.n);
  return { canon: canon, alts: alts };
}

function nounDefinite(n) {
  // padrão: -en (m), -a (f), -et (n); palavras em -e perdem o e (jente → jenta,
  // kaffe → kaffen); `def` sobrescreve (rom → rommet)
  const stem = /e$/.test(n.n) ? n.n.slice(0, -1) : n.n;
  const canon = n.def || (stem + { m: 'en', f: 'a', n: 'et' }[n.g]);
  const alts = (n.defAlts || []).slice();
  if (n.g === 'f') alts.push(stem + 'en');
  return { canon: canon, alts: alts };
}

function buildSubstantivoCards() {
  const cards = [];
  window.DATA_NO_SUBSTANTIVOS.nouns.forEach(n => {
    const indef = nounIndefinite(n);
    const def = nounDefinite(n);
    const ptIndef = /^(o |a )/.test(n.ptDef) ? n.ptDef.replace(/^o /, 'um ').replace(/^a /, 'uma ') : n.pt;
    cards.push({
      id: n.n + '|indef',
      group: 'indefinido',
      meta: 'indefinido — com o artigo',
      hint: n.n,
      prompt: escapeHtml(ptIndef),
      sub: 'Digite com o artigo (en / ei / et)',
      accepted: [indef.canon].concat(indef.alts),
      answer: indef.canon,
      exact: true,                    // et jente é erro de gênero, não deslize de digitação
      pron: NO_ARTICLE[n.g] + ' ' + n.pron,
      speak: indef.canon,
      reveal: exampleBlock(n.ex, n.exPt)
    });
    cards.push({
      id: n.n + '|def',
      group: 'definido',
      meta: 'definido — artigo grudado',
      hint: n.n,
      prompt: escapeHtml(n.ptDef),
      sub: 'Digite a forma definida (-en / -a / -et)',
      accepted: [def.canon].concat(def.alts),
      answer: def.canon,
      exact: true,                    // husen vs huset: a terminação É o gênero
      pron: n.pronDef,
      speak: def.canon,
      reveal: exampleBlock(n.exDef, n.exDefPt)
    });
  });
  return cards;
}

/* ------------------------------------------- frases, números, palavrinhas ---- */

// os três tópicos "lista" têm a mesma forma: { no, alts, pt, group, pron,
// example, examplePt, tip }
function buildListCards(data, meta, sub, hintOf) {
  return data.cards.map(c => ({
    id: c.no,
    group: c.group,
    meta: typeof meta === 'function' ? meta(c) : meta,
    hint: hintOf ? hintOf(c) : '',
    prompt: escapeHtml(c.pt),
    sub: sub,
    accepted: [c.no].concat(c.alts || []),
    answer: c.no,
    pron: c.pron,
    speak: c.no,
    reveal: exampleBlock(c.example, c.examplePt) +
            (c.tip ? tipBlock(escapeHtml(c.tip)) : '')
  }));
}

function buildFraseCards() {
  return buildListCards(window.DATA_NO_FRASES, c => c.group,
    'Digite a frase em norueguês', c => c.no.split(' ')[0]);
}
function buildNumeroCards() {
  return buildListCards(window.DATA_NO_NUMEROS,
    c => (c.group === 'ordinais' ? 'ordinal' : 'número'),
    'Digite o número por extenso', null);
}
function buildPalavrinhaCards() {
  return buildListCards(window.DATA_NO_PALAVRINHAS, c => c.group,
    'Digite em norueguês', null);
}

/* ------------------------------------------------------------ registro ---- */

const TOPICS = [
  { id: 'verbos', label: 'Verbos', kind: 'quiz', tier: 3,
    groups: ['presente', 'passado'], build: buildVerboCards },
  { id: 'substantivos', label: 'Substantivos', kind: 'quiz', tier: 2,
    groups: ['indefinido', 'definido'], build: buildSubstantivoCards },
  { id: 'frases', label: 'Frases', kind: 'quiz', tier: 1,
    groups: () => window.DATA_NO_FRASES.groups, build: buildFraseCards },
  { id: 'numeros', label: 'Números', kind: 'quiz', tier: 1,
    groups: () => window.DATA_NO_NUMEROS.groups, build: buildNumeroCards },
  { id: 'palavrinhas', label: 'Palavrinhas', kind: 'quiz', tier: 2,
    groups: () => window.DATA_NO_PALAVRINHAS.groups, build: buildPalavrinhaCards }
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
