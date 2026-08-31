// Invariantes dos dados do /ingles/ — o espelho de ../../js/checks.js, rodado
// por scripts/check-ingles.jxa. As regras são as mesmas do app principal,
// com a direção invertida:
//
// - Nenhum prompt ambíguo: no Modo Raiz só aparece o português, então um
//   gloss `pt` + meta não pode servir para duas respostas diferentes.
// - Toda carta tem forma, pronúncia aproximada e exemplo (com tradução).
// - A resposta canônica está entre as próprias respostas aceitas.
// - Todo exemplo contém a forma que a carta ensina.

function runChecks() {
  const results = [];
  function check(name, fn) {
    try {
      const detail = fn();
      results.push({ ok: true, name: name, detail: detail || '' });
    } catch (e) {
      results.push({ ok: false, name: name, detail: (e && e.message) || String(e) });
    }
  }
  function fail(msg) { throw new Error(msg); }

  const D = window.DATA_EN_IRREGULARES;
  const P = window.DATA_EN_PHRASAL;

  check('every irregular verb entry is complete', () => {
    const bad = [];
    D.verbs.forEach(v => {
      ['base', 'pt', 'past', 'pastPron', 'examplePast', 'examplePastPt'].forEach(k => {
        if (!v[k]) bad.push(v.base + ': missing ' + k);
      });
      if (v.part) {
        ['partPron', 'examplePart', 'examplePartPt'].forEach(k => {
          if (!v[k]) bad.push(v.base + ': missing ' + k);
        });
      }
    });
    if (bad.length) fail(bad.join('\n'));
    return D.verbs.length + ' verbs';
  });

  check('base forms are unique (card ids depend on them)', () => {
    const seen = {};
    D.verbs.forEach(v => {
      if (seen[v.base]) fail('duplicate base: ' + v.base);
      seen[v.base] = 1;
    });
  });

  check('every phrasal verb entry is complete and unique', () => {
    const bad = [];
    const seen = {};
    P.cards.forEach(c => {
      ['pv', 'pt', 'group', 'pron', 'example', 'examplePt'].forEach(k => {
        if (!c[k]) bad.push((c.pv || '?') + ': missing ' + k);
      });
      if (seen[c.pv]) bad.push('duplicate phrasal: ' + c.pv);
      seen[c.pv] = 1;
    });
    if (bad.length) fail(bad.join('\n'));
    return P.cards.length + ' phrasal verbs';
  });

  check('every phrasal example contains the exact phrasal verb', () => {
    // contíguo e sem flexão de propósito: as frases usam imperativo, modal ou
    // sujeito I/you/we/they (ver a nota no topo de phrasal.js)
    const bad = P.cards.filter(c =>
      !new RegExp('\\b' + c.pv + '\\b', 'i').test(c.example));
    if (bad.length) fail(bad.map(c => c.pv + ': "' + c.example + '"').join('\n'));
  });

  const cards = allQuizCards();

  check('every card is drillable (accepted, answer, pron, reveal)', () => {
    const bad = [];
    cards.forEach(c => {
      if (!c.accepted || !c.accepted.length) bad.push(c.id + ': no accepted answers');
      if (!c.answer) bad.push(c.id + ': no answer');
      if (!c.pron) bad.push(c.id + ': no pronunciation hint');
      if (!c.reveal) bad.push(c.id + ': no example reveal');
    });
    if (bad.length) fail(bad.join('\n'));
    return cards.length + ' cards';
  });

  check('every canonical answer is among its accepted answers', () => {
    const bad = cards.filter(c => !c.accepted.some(a => normalize(a) === normalize(c.answer)));
    if (bad.length) fail(bad.map(c => c.id).join(', '));
  });

  check('no ambiguous prompts (pt gloss + meta identifies one answer)', () => {
    const seen = {};
    const bad = [];
    cards.forEach(c => {
      const key = normalize(c.prompt) + '|' + normalize(c.meta);
      if (seen[key] && normalize(seen[key].answer) !== normalize(c.answer)) {
        bad.push('"' + c.prompt + '" (' + c.meta + '): ' + seen[key].answer + ' vs ' + c.answer);
      }
      seen[key] = c;
    });
    if (bad.length) fail(bad.join('\n'));
  });

  check('every example contains the form it teaches', () => {
    const bad = [];
    D.verbs.forEach(v => {
      const has = (sentence, form) =>
        new RegExp('\\b' + form + '\\b', 'i').test(sentence);
      if (!has(v.examplePast, v.past)) bad.push(v.base + ': "' + v.examplePast + '" lacks ' + v.past);
      if (v.part && !has(v.examplePart, v.part)) bad.push(v.base + ': "' + v.examplePart + '" lacks ' + v.part);
    });
    if (bad.length) fail(bad.join('\n'));
  });

  check('every card group is declared by its topic', () => {
    const bad = [];
    const summary = [];
    TOPICS.filter(t => t.kind === 'quiz').forEach(t => {
      const declared = new Set(topicGroups(t));
      topicCards(t).forEach(c => {
        if (!declared.has(c.group)) bad.push(t.id + '/' + c.id + ': ' + c.group);
      });
      summary.push(t.id + ': ' + topicGroups(t).join(', '));
    });
    if (bad.length) fail(bad.join('\n'));
    return summary.join('\n');
  });

  return results;
}
