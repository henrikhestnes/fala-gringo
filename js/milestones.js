// Milestones: about a dozen markers tied to real learning — cards mastered,
// the streak, the review ladder, graduations, a whole verb, the Daily. Earned
// silently (a toast, the stamp in the store), listed on the progress sheet that
// opens from the goal ring (js/app.js). Nothing here rewards volume for its own
// sake: every marker is either spaced-review evidence or showing up.
//
// A marker applies only where the app can reach it — the Daily ones need a
// Daily tab, the tier ones a tab of that tier, the whole-verb one a lexeme with
// enough forms — so the /ingles/ and /noruegues/ sheets list only what fits.
// Wording is overridable through window.APP_STRINGS.milestones ({ id: [label,
// description] }), the same contract as the rest of the chrome.

window.Milestones = (function () {
  const LABELS = Object.assign({
    first:    ['First card', 'Your first card mastered.'],
    m100:     ['100 cards', '100 cards mastered across your tabs.'],
    m500:     ['500 cards', '500 cards mastered across your tabs.'],
    m1000:    ['1,000 cards', '1,000 cards mastered across your tabs.'],
    s7:       ['7-day streak', 'Practised seven days running.'],
    s30:      ['30-day streak', 'A month of showing up.'],
    s100:     ['100-day streak', 'A hundred days. Carioca de coração.'],
    top:      ['Top of the ladder', 'A card confirmed on five distinct days — the 120-day review.'],
    grad1:    ['First graduation', 'A whole tab at review level 3 or higher.'],
    tier1:    ['{tier} complete', 'Every {tier} tab graduated.'],
    tier2:    ['{tier} complete', 'Every {tier} tab graduated.'],
    tier3:    ['{tier} complete', 'Every {tier} tab graduated.'],
    verb:     ['A whole verb', 'Every form of one verb, in every tense you drill, at review level 3 or higher.'],
    daily7:   ['Perfect Daily', 'All seven Daily cards on the first try.'],
    dstreak7: ['7 Dailies running', 'The Daily finished seven days in a row.']
  }, (window.APP_STRINGS && window.APP_STRINGS.milestones) || {});

  const TIER_NAMES = (window.APP_STRINGS && window.APP_STRINGS.tierNames) || ['Iniciante', 'Intermediário', 'Avançado'];
  const LEVEL = typeof GRADUATE_LEVEL !== 'undefined' ? GRADUATE_LEVEL : 3;
  const TOP = typeof REVIEW_INTERVALS !== 'undefined' ? REVIEW_INTERVALS.length : 5;

  function quizTopics() { return TOPICS.filter(t => t.kind === 'quiz'); }
  function hasTier(n) { return quizTopics().some(t => t.tier === n); }
  function tierDone(n) {
    const tabs = quizTopics().filter(t => t.tier === n);
    return tabs.length > 0 && tabs.every(t => Quiz.graduation(t).qualifies);
  }

  /* Lexemes (the part of a card id before "|") with at least four forms across
     the drill tabs — the verbs of the main app (presente + passado + imperfeito
     + subjuntivo), nothing in /ingles/ (two forms a verb). Built once. */
  let lexemes = null;
  function lexemeGroups() {
    if (lexemes) return lexemes;
    const map = new Map();
    quizTopics().forEach(t => topicCards(t).forEach(c => {
      const bar = String(c.id).indexOf('|');
      if (bar < 0) return;
      const k = String(c.id).slice(0, bar);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push({ topic: t.id, id: c.id });
    }));
    lexemes = [];
    map.forEach(forms => { if (forms.length >= 4) lexemes.push(forms); });
    return lexemes;
  }
  function wholeLexeme() {
    return lexemeGroups().some(forms => forms.every(f =>
      Store.reviewLevel(f.topic, f.id) >= LEVEL && Store.cardState(f.topic, f.id) !== 'shaky'));
  }

  const DEFS = [
    { id: 'first',  icon: '🌱', when: c => c.mastered >= 1 },
    { id: 'm100',   icon: '💯', when: c => c.mastered >= 100 },
    { id: 'm500',   icon: '🏛️', when: c => c.mastered >= 500 },
    { id: 'm1000',  icon: '🗿', when: c => c.mastered >= 1000 },
    { id: 's7',     icon: '🔥', when: c => c.streak >= 7 },
    { id: 's30',    icon: '🔥', when: c => c.streak >= 30 },
    { id: 's100',   icon: '🔥', when: c => c.streak >= 100 },
    { id: 'top',    icon: '🏔️', when: () => Store.hasLevel(TOP) },
    { id: 'grad1',  icon: '🎓', when: () => quizTopics().some(t => Quiz.graduation(t).qualifies || Store.graduatedOn(t.id)) },
    { id: 'tier1',  icon: '🏅', tier: 1, applies: () => hasTier(1), when: () => tierDone(1) },
    { id: 'tier2',  icon: '🏅', tier: 2, applies: () => hasTier(2), when: () => tierDone(2) },
    { id: 'tier3',  icon: '🏅', tier: 3, applies: () => hasTier(3), when: () => tierDone(3) },
    { id: 'verb',   icon: '🧩', applies: () => lexemeGroups().length > 0, when: () => wholeLexeme() },
    { id: 'daily7', icon: '⭐', applies: () => typeof Daily !== 'undefined',
      when: () => { const h = Store.dailyHistory(); return Object.keys(h).some(k => h[k] >= 7); } },
    { id: 'dstreak7', icon: '📅', applies: () => typeof Daily !== 'undefined' && !!Daily.streak, when: () => Daily.streak().n >= 7 }
  ];

  function text(def) {
    const pair = LABELS[def.id] || [def.id, ''];
    const tier = def.tier ? (TIER_NAMES[def.tier - 1] || '') : '';
    return { label: pair[0].replace('{tier}', tier), desc: pair[1].replace('{tier}', tier) };
  }

  function context() {
    let mastered = 0;
    quizTopics().forEach(t => { mastered += Store.masteredCount(t.id); });
    return { mastered: mastered, streak: Store.streak().n };
  }

  /* Every applicable marker with its wording and the day it was earned (0 = not yet). */
  function list() {
    return DEFS.filter(d => !d.applies || d.applies()).map(d => {
      const t = text(d);
      return { id: d.id, icon: d.icon, label: t.label, desc: t.desc, earned: Store.milestoneOn(d.id) };
    });
  }

  /* Stamp whatever is newly met; returns the markers earned by this call, in
     definition order, so the caller can announce them. A marker once earned
     stays earned (the stamp is the record, the condition may lapse). */
  function check() {
    const c = context();
    const fresh = [];
    DEFS.forEach(d => {
      if (Store.milestoneOn(d.id)) return;
      if (d.applies && !d.applies()) return;
      let met = false;
      try { met = !!d.when(c); } catch (e) { met = false; }
      if (met && Store.markMilestone(d.id)) fresh.push(Object.assign({ id: d.id, icon: d.icon }, text(d)));
    });
    return fresh;
  }

  return { list: list, check: check, _defs: DEFS };
})();
