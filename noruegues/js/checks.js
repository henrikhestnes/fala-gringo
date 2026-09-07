// Invariantes dos dados do /noruegues/ — o espelho de ../../js/checks.js, rodado
// por scripts/check-noruegues.jxa. As regras são as do app principal, com a
// direção invertida:
//
// - Nenhum prompt ambíguo: no Modo Raiz só aparece o português, então um
//   gloss `pt` + meta não pode servir para duas respostas diferentes.
// - Toda carta tem forma, pronúncia aproximada e exemplo (com tradução).
// - A resposta canônica está entre as próprias respostas aceitas.
// - Todo exemplo contém a forma que a carta ensina.
// - Nenhuma resposta aceita colide com outra carta do mesmo tópico depois de
//   normalize() — o que pega, por exemplo, så/sa se o anel do å for perdido.

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

  // \b do JS não conhece æøå; delimita a palavra por letras (incl. as nórdicas)
  const L = 'a-zA-ZæøåÆØÅéÉ';
  function hasWord(sentence, form) {
    const esc = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^' + L + '])' + esc + '($|[^' + L + '])', 'i').test(sentence);
  }

  const V = window.DATA_NO_VERBOS;
  const S = window.DATA_NO_SUBSTANTIVOS;
  const LISTS = [
    ['frases', window.DATA_NO_FRASES],
    ['numeros', window.DATA_NO_NUMEROS],
    ['palavrinhas', window.DATA_NO_PALAVRINHAS]
  ];

  check('every verb entry is complete, with unique infinitives', () => {
    const bad = [];
    const seen = {};
    V.verbs.forEach(v => {
      ['inf', 'pt', 'pres', 'presPron', 'presEx', 'presExPt',
       'past', 'pastPron', 'pastEx', 'pastExPt'].forEach(k => {
        if (!v[k]) bad.push(v.inf + ': missing ' + k);
      });
      if (seen[v.inf]) bad.push('duplicate infinitive: ' + v.inf);
      seen[v.inf] = 1;
    });
    if (bad.length) fail(bad.join('\n'));
    return V.verbs.length + ' verbs';
  });

  check('every verb example contains the form it teaches', () => {
    const bad = [];
    V.verbs.forEach(v => {
      if (!hasWord(v.presEx, v.pres)) bad.push(v.inf + ': "' + v.presEx + '" lacks ' + v.pres);
      if (!hasWord(v.pastEx, v.past)) bad.push(v.inf + ': "' + v.pastEx + '" lacks ' + v.past);
    });
    if (bad.length) fail(bad.join('\n'));
  });

  check('every noun entry is complete, with a known gender and unique lemma', () => {
    const bad = [];
    const seen = {};
    S.nouns.forEach(n => {
      ['n', 'g', 'pt', 'ptDef', 'pron', 'pronDef', 'ex', 'exPt', 'exDef', 'exDefPt'].forEach(k => {
        if (!n[k]) bad.push((n.n || '?') + ': missing ' + k);
      });
      if (!/^[mfn]$/.test(n.g || '')) bad.push(n.n + ': gender "' + n.g + '"');
      if (!/^(o|a) /.test(n.ptDef || '')) bad.push(n.n + ': ptDef must start with o/a: "' + n.ptDef + '"');
      if (seen[n.n]) bad.push('duplicate noun: ' + n.n);
      seen[n.n] = 1;
    });
    if (bad.length) fail(bad.join('\n'));
    return S.nouns.length + ' nouns';
  });

  check('noun examples contain the bare noun and the exact definite form', () => {
    const bad = [];
    const cards = topicCards(topicById('substantivos'));
    S.nouns.forEach(n => {
      if (!hasWord(n.ex, n.n)) bad.push(n.n + ': "' + n.ex + '" lacks ' + n.n);
      const def = cards.find(c => c.id === n.n + '|def').answer;
      if (!hasWord(n.exDef, def)) bad.push(n.n + ': "' + n.exDef + '" lacks ' + def);
    });
    if (bad.length) fail(bad.join('\n'));
  });

  LISTS.forEach(([id, D]) => {
    check(id + ': every entry is complete and unique, example contains the form', () => {
      const bad = [];
      const seen = {};
      D.cards.forEach(c => {
        ['no', 'pt', 'group', 'pron', 'example', 'examplePt'].forEach(k => {
          if (!c[k]) bad.push((c.no || '?') + ': missing ' + k);
        });
        if (seen[c.no]) bad.push('duplicate: ' + c.no);
        seen[c.no] = 1;
        // frases são frases inteiras (pontuação à parte); o resto é palavra
        const ok = id === 'frases'
          ? normalize(c.example).indexOf(normalize(c.no)) !== -1
          : hasWord(c.example, c.no);
        if (!ok) bad.push(c.no + ': "' + c.example + '" lacks the form');
      });
      if (bad.length) fail(bad.join('\n'));
      return D.cards.length + ' cards';
    });
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

  check('within a topic, no accepted answer belongs to two different cards', () => {
    // så (viu) vs sa (disse) só ficam distintos se normalize() preservar o å
    const bad = [];
    TOPICS.forEach(t => {
      const owner = {};
      topicCards(t).forEach(c => {
        c.accepted.forEach(a => {
          const k = normalize(a);
          if (owner[k] && owner[k] !== c.id) bad.push(t.id + ': "' + a + '" in ' + owner[k] + ' and ' + c.id);
          owner[k] = c.id;
        });
      });
    });
    if (bad.length) fail(bad.join('\n'));
    if (normalize('så') === normalize('sa')) fail('normalize() drops the ring of å (så = sa)');
    return 'å, ø, æ survive normalize()';
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
