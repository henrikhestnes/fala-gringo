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

  return { likelyKnown: likelyKnown, knownPatterns: knownPatterns,
           PATTERN_MIN: PATTERN_MIN, PATTERN_SOLID: PATTERN_SOLID };
})();
