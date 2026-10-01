// Inference for the Foco deck: which unseen verb forms the learner very likely
// knows already (one quick confirmation instead of a lesson), and — since
// 1.31 — the DERIVED SCHEDULE of the regular forms they have seen.
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
// hold. It shares the new-card allowance; a hit starts at review level 2 (quiz.js
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

  /* ------------------------------------------------- the derived schedule
     (1.31). A regular form's knowledge is its WORD and its PATTERN, and both
     are confirmed by other cards all the time: a hit on "cheguei" in Perfeito
     keeps chegar known, a hit on "falo" keeps the -ar / eu / presente ending
     known, and "chego" needs no review of its own while both stand. So the
     atoms are derived from the records — never written — and a regular card
     is due only while its own clock has run out AND its word or its pattern
     has no fresher confirmation anywhere:
       stem atom      — per lexeme, across every tense tab: the confirmed form
                        (not new, not shaky) whose next review lies furthest
                        ahead vouches for the word until then, at its level
       pattern atom   — per tab and pattern: the regular form whose next
                        review lies furthest ahead vouches for the ending —
                        once the pattern is known at all (knownPatterns)
       irregular form — its own clock, as before: faço is a fact, not a rule
     The derived view feeds Store.cardState / dueIn / reviewLevel (progress.js
     setDeriver), so the deck, the goal, graduation and the statistics all
     see the same schedule. The record's own ladder still climbs on the card
     that is actually asked (with its overdue credit), so whichever form
     carries an atom climbs for it; nothing is ever written to the others. */
  let cache = null;

  function cardIndex() {
    if (cache && cache.index) return cache.index;
    const index = new Map();
    TOPICS.forEach(t => {
      if (t.kind !== 'quiz') return;
      const byId = new Map();
      topicCards(t).forEach(c => byId.set(c.id, c));
      index.set(t.id, byId);
    });
    return index;
  }

  function atoms() {
    const key = Store.revision() + ':' + Store.today();
    if (cache && cache.key === key) return cache;
    const index = cardIndex();
    const stems = new Map(), pats = new Map();
    index.forEach((byId, topicId) => {
      byId.forEach(c => {
        if (!c.infer) return;
        const st = Store.rawCardState(topicId, c.id);
        if (st === 'new') return;
        const pk = topicId + '|' + c.infer.pattern;
        let p = pats.get(pk);
        if (!p) pats.set(pk, p = { ok: 0, shaky: 0, next: -Infinity, level: 0, known: false });
        if (st === 'shaky') { if (c.infer.regular) p.shaky++; return; }   // a missed form vouches for nothing
        const next = Store.rawDueIn(topicId, c.id);
        if (next === null) return;                                          // mastered pre-1.1, no clock to vouch with
        const level = Store.rawReviewLevel(topicId, c.id);
        let s = stems.get(c.infer.lexeme);
        if (!s) stems.set(c.infer.lexeme, s = { next: -Infinity, level: 0 });
        if (next > s.next) { s.next = next; s.level = level; }
        if (!c.infer.regular) return;
        p.ok++;
        if (next > p.next) { p.next = next; p.level = level; }
      });
    });
    pats.forEach(p => { p.known = p.ok >= PATTERN_MIN && p.ok / (p.ok + p.shaky) >= PATTERN_SOLID; });
    cache = { key: key, index: index, stems: stems, pats: pats };
    return cache;
  }

  /* Store's deriver: the schedule of a seen, unmissed, regular form in a known
     pattern — null for every other card. */
  function derive(topicId, cardId) {
    const a = atoms();
    const byId = a.index.get(topicId), c = byId && byId.get(cardId);
    if (!c || !c.infer || !c.infer.regular) return null;
    const st = Store.rawCardState(topicId, cardId);
    if (st !== 'due' && st !== 'ok') return null;
    const own = Store.rawDueIn(topicId, cardId);
    if (own === null) return null;
    const p = a.pats.get(topicId + '|' + c.infer.pattern);
    if (!p || !p.known) return null;
    const s = a.stems.get(c.infer.lexeme);
    const vouch = Math.min(s.next, p.next);
    return { dueIn: Math.max(own, vouch),
             level: Math.max(Store.rawReviewLevel(topicId, cardId), Math.min(s.level, p.level)),
             implied: own <= 0 && vouch > 0 };
  }

  /* How many atoms with no fresher confirmation this card's answer would
     confirm — 2 for a regular form whose word and pattern are both waiting,
     1 for an irregular form of a waiting word. Orders the due tier, so the
     answers that cover the most come first. */
  function coverage(topicId, card) {
    if (!card.infer) return 0;
    const a = atoms();
    let n = 0;
    const s = a.stems.get(card.infer.lexeme);
    if (!s || s.next <= 0) n++;
    const p = a.pats.get(topicId + '|' + card.infer.pattern);
    if (card.infer.regular && p && p.known && p.next <= 0) n++;
    return n;
  }

  if (typeof Store !== 'undefined' && Store.setDeriver) Store.setDeriver(derive);

  return { likelyKnown: likelyKnown, knownPatterns: knownPatterns, derive: derive, coverage: coverage,
           PATTERN_MIN: PATTERN_MIN, PATTERN_SOLID: PATTERN_SOLID };
})();
