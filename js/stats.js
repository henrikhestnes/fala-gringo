// The statistics page (#stats, 1.28): everything the progress state can say,
// read from the local store — which IS the synced state, since every pull
// merges the other devices into it. One view per app (each has its own blob
// and registry), rendered into #view by the router in app.js, reached from the
// progress sheet. No dependencies: bars are flex spans, the heatmap is the
// sheet's, scaled to a year.
//
//   Tabs        per drill tab a stacked bar of its cards by state — unseen,
//               shaky, then the review ladder 7 / 14 / 30 / 60 / 120 days —
//               with mastered, seen and lifetime accuracy; 🎓 when 80% sit at
//               30 days or more (the graduation rule)
//   Forecast    what comes due when: now, each of the next 14 days, 15–30
//   Activity    streak and longest run, a 52-week heatmap, totals, and a
//               month-by-month table with the share answered right (from the
//               per-day `right` log, which starts with 1.28)
//   Daily       finished Dailies, perfect ones, strict streak, first-try spread
//   Card by card for a topic whose ids are lexeme|form (verbs by person, nouns
//               by form): a grid of cells coloured by state, leeches outlined
//   Leeches     the full list (the sheet shows ten)
//   Milestones  the earned ones with dates
//   Data        record count, days logged, blob size
//
// Wording via APP_STRINGS.stats on the subpages (a nested object, like the
// milestones' — the keys below are the whole set).

const STATS_STRINGS = Object.assign({
  title: 'Statistics',
  intro: 'Everything your progress holds, read on this device — synced devices merge into it. ' +
         'Tabs first, then what is coming due, your activity, and the cards that resist.',
  secTabs: 'Tabs',
  secForecast: 'Reviews ahead',
  secActivity: 'Activity',
  secMonths: 'Month by month',
  secDaily: 'Daily challenge',
  secGrid: 'Card by card',
  secLeeches: 'Tricky cards',
  secMilestones: 'Milestones',
  secData: 'Data',
  buckets: ['unseen', 'shaky', '7-day', '14-day', '30-day', '60-day', '120-day'],
  bucketsLong: ['never answered', 'missed, not yet answered right again', 'review every 7 days',
                'every 14 days', 'every 30 days', 'every 60 days', 'every 120 days'],
  tabLine: '{mastered} of {total} mastered · {seen} seen · {acc}',
  accuracy: '{pct}% right of {n}',
  accuracyNone: 'no answers yet',
  graduated: '🎓 graduated',
  gradShare: '{pct}% at 30 days or more',
  now: 'now',
  tomorrow: 'tomorrow',
  later: 'later',
  forecastLine: '{now} to review now · {week} more in the next 7 days · {month} within 30',
  forecastNone: 'Nothing scheduled yet — mastered cards come back on the review ladder.',
  streakLine: '🔥 {n}-day streak · longest run {best} days',
  activityLine: '{days} days practised · {answers} answers · {acc}',
  monthHead: ['Month', 'Days', 'Answers', 'Right'],
  dailyLine: '{played} played · {perfect} perfect · {n}-day streak',
  dailyDist: 'first-try answers per Daily, 7 down to 0',
  dailyNone: 'No Daily finished yet.',
  gridHint: 'Each cell is one card, coloured like the bars above — hover for the form and its tally. A red outline marks a tricky card.',
  leechLine: 'Missed four times or more, at 40% or more of their answers.',
  leechNone: 'None — no card has resisted you four times.',
  earned: 'earned {date}',
  dataLine: '{records} card records · {days} days logged · {kb} KB'
}, (window.APP_STRINGS || {}).stats || {});

// a window property on purpose (a top-level const is not one): app.js and the
// sheet test for window.Stats before they use it
window.Stats = (function () {
  const S = STATS_STRINGS;
  const LOCALE = (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) || 'en-GB';
  const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
  const quizTopics = () => TOPICS.filter(t => t.kind === 'quiz');
  const local = day => { const d = new Date(day * 86400000); return new Date(d.getTime() + d.getTimezoneOffset() * 60000); };
  const ymd = day => { const d = local(day); return String(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()); };
  const dateText = day => local(day).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });

  /* ------------------------------------------------------------- buckets */

  /* 0 unseen · 1 shaky · 2–6 review level 1–5 (a mastered card with no level
     yet counts as level 1, as the schedule treats it). */
  function bucketOf(topicId, cardId) {
    const st = Store.cardState(topicId, cardId);
    if (st === 'new') return 0;
    if (st === 'shaky') return 1;
    return Math.min(Math.max(Store.reviewLevel(topicId, cardId), 1), 5) + 1;
  }
  const accuracyText = (right, total) => total ? tfill(S.accuracy, { pct: pct(right, total), n: total }) : S.accuracyNone;

  function legendHtml() {
    return '<p class="stat-legend">' + S.buckets.map((b, i) =>
      '<span title="' + escapeHtml(S.bucketsLong[i]) + '"><i class="stat-swatch" data-b="' + i + '"></i>' + escapeHtml(b) + '</span>').join('') + '</p>';
  }

  /* ---------------------------------------------------------------- tabs */

  function tabSummary(t) {
    const cards = topicCards(t);
    const counts = [0, 0, 0, 0, 0, 0, 0];
    let right = 0, total = 0, mastered = 0;
    cards.forEach(c => {
      counts[bucketOf(t.id, c.id)]++;
      const a = Store.attempts(t.id, c.id);
      right += a.right; total += a.total;
      if (Store.isMastered(t.id, c.id)) mastered++;
    });
    const g = Quiz.graduation(t);   // the same live rule as the 🎓 on the tab
    return { topic: t, cards: cards.length, counts: counts, right: right, total: total, mastered: mastered,
             seen: cards.length - counts[0], solidPct: Math.round(g.share * 100), graduated: !!g.qualifies };
  }
  function barHtml(counts, total, label) {
    return '<div class="stat-bar" role="img" aria-label="' + escapeHtml(label) + '">' +
      counts.map((n, i) => n ? '<span data-b="' + i + '" style="flex-grow:' + n + '" title="' + escapeHtml(S.buckets[i] + ' · ' + n) + '"></span>' : '').join('') +
      '</div>';
  }
  function tabsHtml() {
    const rows = quizTopics().map(tabSummary);
    return '<section><h3>' + escapeHtml(S.secTabs) + '</h3>' + legendHtml() +
      rows.map(r => {
        const line = tfill(S.tabLine, { mastered: r.mastered, total: r.cards, seen: r.seen, acc: accuracyText(r.right, r.total) });
        return '<div class="stat-row">' +
          '<button class="tab-link" type="button" data-tab="' + escapeHtml(r.topic.id) + '">' + escapeHtml(r.topic.label) +
            (r.graduated ? ' <b>🎓</b>' : '') + '</button>' +
          barHtml(r.counts, r.cards, r.topic.label + ': ' + line) +
          '<small>' + escapeHtml(line) + ' · ' + escapeHtml(r.graduated ? S.graduated : tfill(S.gradShare, { pct: r.solidPct })) + '</small>' +
        '</div>';
      }).join('') + '</section>';
  }

  /* ------------------------------------------------------------ forecast */

  /* Cards by the day their next review falls: `now` (due or shaky), each of
     the next DAYS days, and `later` (up to 30). Beyond 30 is not shown. */
  const FC_DAYS = 14;
  function forecast() {
    const days = new Array(FC_DAYS + 1).fill(0);   // [0] unused (now is its own bucket)
    let now = 0, later = 0;
    quizTopics().forEach(t => topicCards(t).forEach(c => {
      const st = Store.cardState(t.id, c.id);
      if (st === 'new') return;
      if (st === 'shaky' || st === 'due') { now++; return; }
      const d = Store.dueIn(t.id, c.id);
      if (d === null || d <= 0) { now++; return; }
      if (d <= FC_DAYS) days[d]++; else if (d <= 30) later++;
    }));
    const week = days.slice(1, 8).reduce((a, b) => a + b, 0);
    const month = days.slice(1).reduce((a, b) => a + b, 0) + later;
    return { now: now, days: days, later: later, week: week, month: month };
  }
  function forecastHtml() {
    const f = forecast();
    if (!f.now && !f.month) return '<section><h3>' + escapeHtml(S.secForecast) + '</h3><p class="muted">' + escapeHtml(S.forecastNone) + '</p></section>';
    const cols = [{ n: f.now, label: S.now, cls: ' now' }]
      .concat(f.days.slice(1).map((n, i) => ({ n: n, label: i === 0 ? S.tomorrow : '+' + (i + 1), cls: '' })))
      .concat([{ n: f.later, label: S.later, cls: ' later' }]);
    const max = Math.max(1, ...cols.map(c => c.n));
    return '<section><h3>' + escapeHtml(S.secForecast) + '</h3>' +
      '<p class="muted">' + escapeHtml(tfill(S.forecastLine, { now: f.now, week: f.week, month: f.month })) + '</p>' +
      '<div class="fc" role="img" aria-label="' + escapeHtml(tfill(S.forecastLine, { now: f.now, week: f.week, month: f.month })) + '">' +
        cols.map(c => '<div class="fc-col' + c.cls + '" title="' + escapeHtml(c.label + ' · ' + c.n) + '">' +
          '<span class="fc-n">' + (c.n || '') + '</span><i class="fc-bar" style="height:' + Math.round(100 * c.n / max) + '%"></i></div>').join('') +
      '</div>' +
      '<div class="fc-labels" aria-hidden="true">' + cols.map(c => '<span>' + escapeHtml(c.label) + '</span>').join('') + '</div>' +
    '</section>';
  }

  /* ------------------------------------------------------------ activity */

  function longestRun() {
    const today = Store.today();
    let best = 0, run = 0;
    for (let d = today - 730; d <= today; d++) {
      if (Store.answeredOn(d)) { run++; if (run > best) best = run; } else run = 0;
    }
    return best;
  }
  function activityHtml() {
    const st = Store.streak(), today = Store.today();
    let days = 0, answers = 0, right = 0, tracked = 0;
    const months = new Map();   // 'YYYY-MM' -> { label, days, answers, right, tracked }
    for (let d = today - 365; d <= today; d++) {
      const n = Store.answeredOn(d);
      const dt = local(d), key = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
      if (!months.has(key)) months.set(key, { label: dt.toLocaleDateString(LOCALE, { month: 'short', year: '2-digit' }), days: 0, answers: 0, right: 0, tracked: 0 });
      if (!n) continue;
      const m = months.get(key), r = Store.rightOn(d);
      m.days++; m.answers += n; days++; answers += n;
      if (r !== undefined) { m.right += r; m.tracked += n; right += r; tracked += n; }
    }
    const rows = Array.from(months.values()).reverse().filter(m => m.days);
    return '<section><h3>' + escapeHtml(S.secActivity) + '</h3>' +
      '<p class="muted">' + escapeHtml(tfill(S.streakLine, { n: st.n, best: longestRun() })) + '</p>' +
      '<p class="muted">' + escapeHtml(tfill(S.activityLine, { days: days, answers: answers, acc: accuracyText(right, tracked) })) + '</p>' +
      (window.App && App.heatmapHtml ? '<div class="hm-wrap">' + App.heatmapHtml(52) + '</div>' : '') +
      (rows.length ? '<h3>' + escapeHtml(S.secMonths) + '</h3><table><thead><tr>' +
        S.monthHead.map((h, i) => '<th' + (i ? ' class="num"' : '') + '>' + escapeHtml(h) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map(m => '<tr><td>' + escapeHtml(m.label) + '</td><td class="num">' + m.days + '</td><td class="num">' + m.answers + '</td>' +
          '<td class="num">' + (m.tracked ? pct(m.right, m.tracked) + '%' : '–') + '</td></tr>').join('') +
        '</tbody></table>' : '') +
    '</section>';
  }

  /* --------------------------------------------------------------- daily */

  function dailyHtml() {
    if (!TOPICS.some(t => t.kind === 'daily')) return '';
    const hist = Store.dailyHistory();
    const keys = Object.keys(hist);
    if (!keys.length) return '<section><h3>' + escapeHtml(S.secDaily) + '</h3><p class="muted">' + escapeHtml(S.dailyNone) + '</p></section>';
    const today = Store.today();
    let n = 0, d = ymd(today) in hist ? today : today - 1;
    while (ymd(d) in hist) { n++; d--; }
    const dist = [0, 0, 0, 0, 0, 0, 0, 0];
    keys.forEach(k => { const v = Math.min(7, Math.max(0, hist[k] | 0)); dist[v]++; });
    const max = Math.max(1, ...dist);
    return '<section><h3>' + escapeHtml(S.secDaily) + '</h3>' +
      '<p class="muted">' + escapeHtml(tfill(S.dailyLine, { played: keys.length, perfect: dist[7], n: n })) + '</p>' +
      '<p class="muted">' + escapeHtml(S.dailyDist) + '</p>' +
      '<div class="dist">' + [7, 6, 5, 4, 3, 2, 1, 0].map(v =>
        '<span>' + v + '</span><i style="width:' + Math.round(100 * dist[v] / max) + '%"></i><span>' + dist[v] + '</span>').join('') + '</div>' +
    '</section>';
  }

  /* ---------------------------------------------------------------- grid */

  /* A topic whose ids read lexeme|form (falar|0 … falar|3, hus|indef / hus|def)
     is a grid: one row per lexeme, one column per form. The column header is
     the word every answer in the column starts with (eu, você, nós…) when
     there is one, else the form key. */
  function gridFor(t) {
    const cards = topicCards(t);
    if (cards.length < 10 || !cards.every(c => String(c.id).includes('|'))) return '';
    const cols = [], rows = new Map();
    cards.forEach(c => {
      const id = String(c.id), i = id.indexOf('|');
      const lex = id.slice(0, i), col = id.slice(i + 1);
      if (!cols.includes(col)) cols.push(col);
      if (!rows.has(lex)) rows.set(lex, new Map());
      rows.get(lex).set(col, c);
    });
    if (cols.length > 8 || rows.size < 5) return '';
    const heads = cols.map(col => {
      const firsts = {}; let n = 0;
      rows.forEach(r => { const c = r.get(col); if (!c) return; n++; const w = String(c.answer).split(/\s+/)[0]; firsts[w] = (firsts[w] || 0) + 1; });
      const top = Object.keys(firsts).sort((a, b) => firsts[b] - firsts[a])[0];
      return top && firsts[top] >= n * 0.8 ? top : col;
    });
    const sum = tabSummary(t);
    let body = '<span class="vg-head"></span>' + heads.map(h => '<span class="vg-head" lang="' + TARGET_LANG + '">' + escapeHtml(h) + '</span>').join('');
    rows.forEach((r, lex) => {
      body += '<span class="vg-lex" lang="' + TARGET_LANG + '" title="' + escapeHtml(lex) + '">' + escapeHtml(lex) + '</span>' +
        cols.map(col => {
          const c = r.get(col);
          if (!c) return '<span class="vg-cell empty" aria-hidden="true"></span>';
          const b = bucketOf(t.id, c.id), a = Store.attempts(t.id, c.id), leech = Store.isLeech(t.id, c.id);
          const title = c.answer + ' · ' + S.buckets[b] + (a.total ? ' · ' + tfill(S.accuracy, { pct: pct(a.right, a.total), n: a.total }) : '');
          return '<span class="vg-cell' + (leech ? ' leech' : '') + '" data-b="' + b + '" title="' + escapeHtml(title) + '"></span>';
        }).join('');
    });
    return '<details class="vg"><summary>' + escapeHtml(t.label) + ' <small>' + sum.mastered + ' / ' + sum.cards + '</small></summary>' +
      '<div class="vg-table" style="--cols:' + cols.length + '">' + body + '</div></details>';
  }
  function gridsHtml() {
    const grids = quizTopics().map(gridFor).filter(Boolean);
    if (!grids.length) return '';
    return '<section><h3>' + escapeHtml(S.secGrid) + '</h3><p class="muted">' + escapeHtml(S.gridHint) + '</p>' + grids.join('') + '</section>';
  }

  /* ------------------------------------------------------------- leeches */

  /* Every leech (Store.isLeech) across the drill tabs, worst miss ratio
     first — the progress sheet shows the top of this list. */
  function leechList() {
    const out = [];
    quizTopics().forEach(t => topicCards(t).forEach(c => {
      if (Store.isLeech(t.id, c.id)) out.push({ topic: t, card: c, tally: Store.attempts(t.id, c.id), ratio: Store.missRatio(t.id, c.id) });
    }));
    return out.sort((a, b) => (b.ratio - a.ratio) || (b.tally.wrong - a.tally.wrong));
  }
  function leechLinks(list) {
    return '<p class="today-line leech-list">' + list.map(l =>
      '<button class="tab-link" type="button" data-tab="' + escapeHtml(l.topic.id) + '">' +
        '<b lang="' + TARGET_LANG + '">' + escapeHtml(l.card.answer) + '</b> · ' + escapeHtml(l.topic.label) +
        ' <small>' + escapeHtml(tfill(QUIZ_STRINGS.accuracy, { right: l.tally.right, total: l.tally.total })) + '</small>' +
      '</button>').join('') + '</p>';
  }
  function leechesHtml() {
    const all = leechList();
    return '<section><h3>' + escapeHtml(S.secLeeches) + (all.length ? ' <span class="sheet-count">' + all.length + '</span>' : '') + '</h3>' +
      '<p class="muted">' + escapeHtml(S.leechLine) + '</p>' +
      (all.length ? leechLinks(all) : '<p class="muted">' + escapeHtml(S.leechNone) + '</p>') + '</section>';
  }

  /* ---------------------------------------------------- milestones, data */

  function milestonesHtml() {
    if (!window.Milestones) return '';
    const ms = Milestones.list(), earned = ms.filter(m => m.earned).sort((a, b) => a.earned - b.earned);
    if (!earned.length) return '';
    return '<section><h3>' + escapeHtml(S.secMilestones) + ' <span class="sheet-count">' + earned.length + ' / ' + ms.length + '</span></h3>' +
      '<ul class="ms-list">' + earned.map(m => '<li><span aria-hidden="true">' + m.icon + '</span> ' + escapeHtml(m.label) +
        '<small>' + escapeHtml(tfill(S.earned, { date: dateText(m.earned) })) + '</small></li>').join('') + '</ul></section>';
  }
  function dataHtml() {
    const snap = Store.snapshot();
    let records = 0;
    Object.values(snap.strength).forEach(t => { records += Object.keys(t).length; });
    return '<section><h3>' + escapeHtml(S.secData) + '</h3><p class="muted">' +
      escapeHtml(tfill(S.dataLine, { records: records, days: Object.keys(snap.days).length, kb: (JSON.stringify(snap).length / 1024).toFixed(1) })) +
      '</p></section>';
  }

  /* -------------------------------------------------------------- render */

  function html() {
    return '<div class="stats-page" lang="' + UI_LANG + '">' +
      '<h2>' + escapeHtml(S.title) + '</h2><p class="muted">' + escapeHtml(S.intro) + '</p>' +
      tabsHtml() + forecastHtml() + activityHtml() + dailyHtml() + gridsHtml() + leechesHtml() + milestonesHtml() + dataHtml() +
    '</div>';
  }
  function render() {
    const view = document.getElementById('view');
    if (!view) return;
    view.dataset.topic = 'stats';
    view.innerHTML = html();
  }

  return { render: render, html: html, leechList: leechList, forecast: forecast, tabSummary: tabSummary, bucketOf: bucketOf };
})();
