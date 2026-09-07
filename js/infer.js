// Inference for the Foco deck: which unseen verb forms the learner very likely
// knows already, so they only need one quick confirmation instead of a lesson.
//
// A verb card is two pieces of knowledge: the WORD (arrive = chegar) and the
// PATTERN (regular -ar, vocês, presente = -am). Both are observable elsewhere:
//   word known    — some form of that verb, in any tense tab, is mastered and
//                   not shaky (one hit on "eu chego" proves the stem)
//   pattern known — at least PATTERN_MIN regular forms sharing the same class,
//                   tense and person (across DIFFERENT verbs) are mastered in
//                   this topic, and at least PATTERN_SOLID of the answered ones
//                   are not shaky right now
// An unseen form whose own shape is regular (the oracle in js/conjugate.js
// agrees with the stored form — irregular forms never qualify, but the regular
// forms of a mostly irregular verb do) goes into the "verify" tier when both
// hold. It is asked once, uncapped; a hit starts at review level 2 (quiz.js
// VERIFY_LEVEL), a miss makes it shaky like any other card — and lowers the
// pattern's solid share, so an over-generous guess corrects itself.
//
// The metadata comes from js/topics.js (`card.infer = { lexeme, pattern,
// regular }`); cards without it (non-verb topics, pronominal verbs with their
// clitic, the /ingles/ app) are simply never inferred. Exposed on window so the
// engine can feature-test it without a load-order hazard.

window.Infer = (function () {
  const PATTERN_MIN = 5;      // distinct regular verbs confirmed before a pattern counts as known
  const PATTERN_SOLID = 0.8;  // share of the pattern's answered forms that must be non-shaky

  /* Patterns the learner has demonstrated in this topic. */
  function knownPatterns(topicId, cards) {
    const stats = {};
    cards.forEach(c => {
      if (!c.infer || !c.infer.regular) return;
      const st = Store.cardState(topicId, c.id);
      if (st === 'new') return;
      const p = stats[c.infer.pattern] || (stats[c.infer.pattern] = { ok: 0, shaky: 0 });
      if (st === 'shaky') p.shaky++; else p.ok++;   // due or fresh: both are confirmed knowledge
    });
    const known = new Set();
    Object.keys(stats).forEach(k => {
      const p = stats[k];
      if (p.ok >= PATTERN_MIN && p.ok / (p.ok + p.shaky) >= PATTERN_SOLID) known.add(k);
    });
    return known;
  }

  /* Ids among `unseen` (never-answered cards of this topic) that are likely known. */
  function likelyKnown(topicId, cards, unseen) {
    const out = new Set();
    if (!unseen.some(c => c.infer)) return out;
    const patterns = knownPatterns(topicId, cards);
    if (!patterns.size) return out;
    const words = Store.knownLexemes();
    unseen.forEach(c => {
      if (!c.infer || !c.infer.regular) return;
      if (patterns.has(c.infer.pattern) && words.has(c.infer.lexeme)) out.add(c.id);
    });
    return out;
  }

  /* Due reviews, thinned by evidence. When a verb has several due forms whose
     shape is regular and whose pattern the learner has shown they know, only
     ONE is asked — the historically weakest (most misses, then lowest level) —
     and a clean hit on it confirms the others by implication (quiz.js resets
     their review clock without climbing the ladder, so over the cycles every
     form still gets asked outright; a miss or a near-miss on the lead puts them
     back into the deck instead). Irregular forms and verbs with a single due
     form are always asked. Returns the forms to ask plus leadId -> [implied]. */
  function implyDue(topicId, cards, due) {
    const ask = [], implied = new Map();
    if (!due.some(c => c.infer)) return { ask: due.slice(), implied: implied };
    const patterns = knownPatterns(topicId, cards);
    const byLex = new Map();
    due.forEach(c => {
      if (!c.infer || !c.infer.regular || !patterns.has(c.infer.pattern)) { ask.push(c); return; }
      if (!byLex.has(c.infer.lexeme)) byLex.set(c.infer.lexeme, []);
      byLex.get(c.infer.lexeme).push(c);
    });
    byLex.forEach(group => {
      if (group.length < 2) { ask.push(group[0]); return; }
      const weight = c => Store.misses(topicId, c.id) * 100 - Store.reviewLevel(topicId, c.id) * 10 + Math.random();
      group.sort((a, b) => weight(b) - weight(a));
      ask.push(group[0]);
      implied.set(group[0].id, group.slice(1).map(c => c.id));
    });
    return { ask: ask, implied: implied };
  }

  return { likelyKnown: likelyKnown, knownPatterns: knownPatterns, implyDue: implyDue,
           PATTERN_MIN: PATTERN_MIN, PATTERN_SOLID: PATTERN_SOLID };
})();
