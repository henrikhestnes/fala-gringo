// Data checks, shared by verify.html (browser) and scripts/check.jxa (headless).
// Pure logic: no DOM access, so it runs anywhere the data files can be loaded.

function runChecks() {
  const results = [];
  function check(name, fn) {
    let ok = false, detail = '';
    try {
      const r = fn();
      if (r === true || r === undefined) ok = true;
      else if (typeof r === 'string') detail = r;
      else if (r && typeof r === 'object') { ok = !!r.ok; detail = r.detail || ''; }
    } catch (e) {
      detail = (e && e.message) || String(e);
    }
    results.push({ name: name, ok: ok, detail: detail });
  }

  const V = window.DATA_VERBS;
  const TENSES = ['presente', 'perfeito', 'imperfeito'];
  const quizTopics = TOPICS.filter(t => t.kind === 'quiz');

  /* -------------------------------------------------------------- verbs --- */

  check('124 verbs in the superset', () =>
    V.verbs.length === 124 ? true : 'got ' + V.verbs.length);

  check('every verb has 3 tenses x 4 persons (1488 forms)', () => {
    const bad = [];
    let n = 0;
    V.verbs.forEach(v => TENSES.forEach(t => {
      const rows = v.tenses[t];
      if (!rows || rows.length !== 4) bad.push(v.pt + '/' + t);
      else n += 4;
    }));
    return bad.length ? bad.join(', ') : (n === 1488 ? true : 'counted ' + n + ' forms');
  });

  check('no duplicate verbs', () => {
    const seen = {}, dup = [];
    V.verbs.forEach(v => { if (seen[v.pt]) dup.push(v.pt); seen[v.pt] = 1; });
    return dup.length ? dup.join(', ') : true;
  });

  check('every quiz verb form has form + meaning + pron + example', () => {
    const bad = [];
    V.verbs.forEach(v => {
      if (v.quiz === false) return;
      TENSES.forEach(t => v.tenses[t].forEach((r, i) => {
        if (!r.form || !r.meaning || !r.pron || !r.example) bad.push(v.pt + '/' + t + '/' + i);
      }));
    });
    return bad.length ? bad.length + ' incomplete: ' + bad.slice(0, 10).join(', ') : true;
  });

  check('regular verbs match the conjugation oracle', () => {
    const bad = [];
    V.verbs.forEach(v => {
      if (v.irregular) return;
      const g = conjugateRegular(v.pt);
      if (!g) { bad.push(v.pt + ' (no rule)'); return; }
      TENSES.forEach(t => {
        const stored = v.tenses[t].map(r => r.form).join(',');
        const oracle = g[t].join(',');
        if (stored !== oracle) bad.push(v.pt + '/' + t + ': ' + stored + ' vs ' + oracle);
      });
    });
    return bad.length ? bad.slice(0, 8).join('\n') : true;
  });

  check('40 verbs carry a complete subjuntivo block', () => {
    const bad = [];
    let n = 0;
    V.verbs.forEach(v => {
      const rows = v.tenses.subjuntivo;
      if (!rows) return;
      n++;
      if (rows.length !== 4) { bad.push(v.pt + ' (rows)'); return; }
      rows.forEach((r, i) => {
        if (!r.form || !r.meaning || !r.pron || !r.example) bad.push(v.pt + '/' + i);
      });
    });
    if (bad.length) return bad.slice(0, 8).join(', ');
    return n === 40 ? true : 'got ' + n + ' verbs with subjuntivo';
  });

  check('every subjuntivo form derives from the perfeito 3pl', () => {
    // This rule has no exceptions in Portuguese, so it verifies irregulars too.
    const bad = [];
    V.verbs.forEach(v => {
      if (!v.tenses.subjuntivo) return;
      const expect = subjImperfectFromPerfeito3pl(v.tenses.perfeito[3].form, v.pt);
      if (!expect) { bad.push(v.pt + ' (no 3pl rule)'); return; }
      const stored = v.tenses.subjuntivo.map(r => r.form).join(',');
      if (stored !== expect.join(',')) bad.push(v.pt + ': ' + stored + ' vs ' + expect.join(','));
    });
    return bad.length ? bad.slice(0, 8).join('\n') : true;
  });

  check('every subjuntivo example uses its form inside a trigger context', () => {
    const TRIGGER = /(^|[ ,("“])(se|que|como se|antes que|talvez)\s/i;
    const bad = [];
    V.verbs.forEach(v => {
      if (!v.tenses.subjuntivo) return;
      v.tenses.subjuntivo.forEach((r, i) => {
        if (r.example.indexOf(r.form) === -1) bad.push(v.pt + '/' + i + ' (form missing)');
        else if (!TRIGGER.test(r.example)) bad.push(v.pt + '/' + i + ' (no trigger)');
      });
    });
    return bad.length ? bad.slice(0, 8).join(', ') : true;
  });

  check('verbs flagged irregular really are irregular', () => {
    const wrong = [];
    V.verbs.forEach(v => {
      if (!v.irregular) return;
      const g = conjugateRegular(v.pt);
      if (!g) return;   // pôr: no regular pattern applies at all
      const same = TENSES.every(t =>
        v.tenses[t].map(r => r.form).join(',') === g[t].join(','));
      if (same) wrong.push(v.pt);
    });
    return wrong.length ? 'flagged irregular but regular: ' + wrong.join(', ') : true;
  });

  /* ------------------------------------------------------------- topics --- */

  check('all 10 quiz topics build cards', () => {
    const counts = quizTopics.map(t => t.label + '=' + topicCards(t).length);
    const empty = quizTopics.filter(t => topicCards(t).length === 0);
    return empty.length ? 'empty: ' + empty.map(t => t.id).join(', ')
                        : { ok: true, detail: counts.join('  ') };
  });

  check('every card has a prompt, an answer and accepted answers', () => {
    const bad = [];
    quizTopics.forEach(t => topicCards(t).forEach(c => {
      if (!c.prompt || !c.answer) bad.push(t.id + ':' + c.id + ' (prompt/answer)');
      else if (!c.accepted || !c.accepted.length) bad.push(t.id + ':' + c.id + ' (accepted)');
      else if (!c.allowEmpty && c.accepted.every(a => normalize(a) === ''))
        bad.push(t.id + ':' + c.id + ' (all accepted empty)');
    }));
    return bad.length ? bad.length + ': ' + bad.slice(0, 8).join(', ') : true;
  });

  check('every card answer is itself accepted', () => {
    const bad = [];
    quizTopics.forEach(t => topicCards(t).forEach(c => {
      if (c.allowEmpty) return;   // canonical renders as "(nothing)"
      let found = false;
      c.accepted.forEach(a => { if (normalize(a) === normalize(c.answer)) found = true; });
      if (!found) bad.push(t.id + ':' + c.id);
    }));
    return bad.length ? bad.slice(0, 8).join(', ') : true;
  });

  check('no duplicate card ids within a topic', () => {
    const bad = [];
    quizTopics.forEach(t => {
      const seen = {};
      topicCards(t).forEach(c => {
        if (seen[c.id]) bad.push(t.id + ':' + c.id);
        seen[c.id] = 1;
      });
    });
    return bad.length ? bad.length + ': ' + bad.slice(0, 8).join(', ') : true;
  });

  check('every card group is declared in its topic', () => {
    const bad = [];
    quizTopics.forEach(t => {
      const groups = topicGroups(t);
      if (!groups.length) return;
      topicCards(t).forEach(c => {
        if (groups.indexOf(c.group) === -1)
          bad.push(t.id + ':' + c.id + ' group="' + c.group + '"');
      });
    });
    return bad.length ? bad.slice(0, 8).join(', ') : true;
  });

  /* --------------------------------------------------------- answerable --- */
  /* The load-bearing guarantee: Hard Mode is the default, so the prompt is all the
     learner sees. No prompt may be satisfied by two different answers. */

  const stripTags = s => String(s == null ? '' : s).replace(/<[^>]*>/g, '');

  /* Everything the learner can see before answering. For the connecting-words
     topic that includes the blanked Portuguese line, which is what distinguishes
     two cards built from the same English sentence. The Easy Mode hint is
     deliberately excluded — Hard Mode is the default and must be answerable. */
  const visible = c => stripTags(c.prompt) + ' ' + stripTags(c.target);

  const strictKey = c => normalize(visible(c));
  const orderlessKey = c => normalize(visible(c)).split('/')
        .map(x => x.trim()).filter(Boolean).sort().join(' | ');
  const hasParen = c => visible(c).indexOf('(') !== -1;

  function ambiguity(keyFn, extraFilter) {
    const groups = {};
    quizTopics.forEach(t => topicCards(t).forEach(c => {
      const k = t.id + '||' + keyFn(c);
      (groups[k] = groups[k] || []).push(c);
    }));
    const bad = [];
    Object.keys(groups).forEach(k => {
      const g = groups[k];
      if (g.length < 2) return;
      const accs = {};
      g.forEach(c => { accs[c.accepted.map(normalize).sort().join('~')] = 1; });
      if (Object.keys(accs).length === 1) return;      // declared synonyms: fine
      if (extraFilter && !extraFilter(g)) return;
      bad.push(k.split('||')[0] + ' "' + visible(g[0]).trim() + '" -> ' +
               g.map(c => c.answer).join(' / '));
    });
    return bad;
  }

  check('no two cards share an identical prompt', () => {
    const bad = ambiguity(strictKey);
    return bad.length ? bad.length + ':\n' + bad.slice(0, 10).join('\n') : true;
  });

  check('no prompt pair is distinguished only by word order', () => {
    const bad = ambiguity(orderlessKey, g => {
      let any = false;
      g.forEach(c => { if (hasParen(c)) any = true; });
      return !any;
    });
    return bad.length ? bad.length + ':\n' + bad.slice(0, 10).join('\n') : true;
  });

  check('no ambiguous family is only partly qualified', () => {
    const bad = ambiguity(orderlessKey, g => {
      let some = false, all = true;
      g.forEach(c => { if (hasParen(c)) some = true; else all = false; });
      return some && !all;
    });
    return bad.length ? bad.length + ':\n' + bad.slice(0, 10).join('\n') : true;
  });

  /* -------------------------------------------------------------- daily --- */

  check('the daily pool is large enough and spans topics', () => {
    const all = allQuizCards();
    return all.length > 1000
      ? { ok: true, detail: all.length + ' cards across ' + quizTopics.length + ' topics' }
      : 'only ' + all.length + ' cards';
  });

  return results;
}
