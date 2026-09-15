// Node 18+, no dependencies. --dry-run prints the exact dashboard definitions.
// --apply validates every query before creating anything, then creates/reuses
// the three dashboards and named insights. Private API key comes from the
// environment only; never put it in a file served by this static site.
import { pathToFileURL } from 'node:url';

export function dashboards() {
  return [['portugues', 'Fala Gringo'], ['ingles', 'Fala Como Gringo'], ['noruegues', 'Fala Viking']].map(([app, name]) => {
    const filter = [{ key: 'app', value: [app], operator: 'exact', type: 'event' }];
    const event = (id, order = 0) => ({ kind: 'EventsNode', event: id, name: id, math: 'dau', order });
    const viz = source => ({ kind: 'InsightVizNode', source });
    const table = query => ({ kind: 'DataTableNode', source: { kind: 'HogQLQuery', query }, full: true });
    const trend = (id, extra = {}) => viz({ kind: 'TrendsQuery', series: [event(id)], properties: filter,
      dateRange: { date_from: '-30d' }, interval: 'day', ...extra });
    const practiceDays = `SELECT distinct_id, properties.local_day AS day, count() AS answers
FROM events WHERE event = 'answer_submitted' AND properties.app = '${app}'
GROUP BY distinct_id, day`;
    return {
      name: name + ' — Launch metrics',
      description: 'Browser-based launch metrics. Ten submitted answers = a meaningful practice day. Wrong answers count; reveals, inferred reviews, imports and sync do not. SQL tiles use their stated windows independently of dashboard date filters. Support clicks are interest, not purchases.',
      insights: [
        { name: 'Daily visitors · last 30 days', description: 'Unique browsers on the app and its reference pages; repeat page loads count once per day.', query: trend('$pageview') },
        { name: 'Visitor sources · last 30 days', description: 'Tagged campaign source, otherwise referring domain. Session attribution follows reference-page visitors into practice.', query: table(`SELECT
coalesce(nullIf(properties.utm_source, ''), nullIf(properties.$referring_domain, ''), 'direct') AS source,
uniq(distinct_id) AS visitors, count() AS pageviews
FROM events WHERE event = '$pageview' AND properties.app = '${app}'
AND timestamp >= now() - INTERVAL 30 DAY GROUP BY source ORDER BY visitors DESC LIMIT 30`) },
        { name: 'Entry pages · last 30 days', description: 'Unique browsers per page; a browser may visit several pages.', query: trend('$pageview', { breakdownFilter: { breakdown: '$pathname', breakdown_type: 'event' }, trendsFilter: { display: 'ActionsTable' } }) },
        { name: 'First app open → first answer · within 24 hours', description: 'First app_opened matching this language to answer_submitted within 24 hours. Reference-only visitors are outside this funnel.', query: viz({ kind: 'FunnelsQuery', series: [{ ...event('app_opened'), math: 'first_time_for_user_with_filters' }, { ...event('answer_submitted', 1), math: 'total' }], properties: filter,
          dateRange: { date_from: '-30d' }, funnelsFilter: { funnelWindowInterval: 1, funnelWindowIntervalUnit: 'day', funnelOrderType: 'ordered', funnelVizType: 'steps', funnelAggregateByHogQL: 'distinct_id' },
          aggregation_group_type_index: null }) },
        { name: 'Practice days · last 30 completed calendar days', description: 'One row per learner-local date. Active = at least one submitted answer; meaningful = at least ten. Current dates are omitted to avoid partial-day comparisons.', query: table(`WITH practice_days AS (${practiceDays})
SELECT day, count() AS active_browsers, countIf(answers >= 10) AS meaningful_practice_browsers,
sum(answers) AS submitted_answers FROM practice_days
WHERE toDate(day) >= today() - INTERVAL 30 DAY AND toDate(day) < today()
GROUP BY day ORDER BY day DESC`) },
        { name: 'Do first-time learners return?', description: 'Day-by-day return after a first-ever submitted answer. Any submitted answer counts as a return; this is different from a ten-answer practice day.', query: viz({ kind: 'RetentionQuery', properties: filter, dateRange: { date_from: '-30d' },
          retentionFilter: { targetEntity: { id: 'answer_submitted', name: 'answer_submitted', type: 'events' },
            returningEntity: { id: 'answer_submitted', name: 'answer_submitted', type: 'events' },
            retentionType: 'retention_first_time', retentionReference: 'total', period: 'Day', totalIntervals: 8 } }) },
        { name: 'First week · three meaningful practice days', description: 'Exact launch target: at least ten answers on at least three distinct local dates, from first practice date through date + 6. Only learners whose first answer was at least seven full days ago enter the denominator. All observed history; no incomplete cohorts.', query: table(`WITH
practice_days AS (${practiceDays}),
first_practice AS (
 SELECT distinct_id, min(properties.local_day) AS first_day, min(timestamp) AS first_at
 FROM events WHERE event = 'answer_submitted' AND properties.app = '${app}' GROUP BY distinct_id
),
learner_weeks AS (
 SELECT f.distinct_id AS learner, f.first_day AS first_day,
 countIf(p.answers >= 10 AND dateDiff('day', toDate(f.first_day), toDate(p.day)) >= 0
 AND dateDiff('day', toDate(f.first_day), toDate(p.day)) <= 6) AS meaningful_days
 FROM first_practice f JOIN practice_days p ON f.distinct_id = p.distinct_id
 WHERE f.first_at <= now() - INTERVAL 7 DAY GROUP BY f.distinct_id, f.first_day
)
SELECT toStartOfWeek(toDate(first_day), 1) AS starting_week, count() AS eligible_learners,
countIf(meaningful_days >= 3) AS reached_three_days,
round(100.0 * countIf(meaningful_days >= 3) / nullIf(count(), 0), 1) AS percent
FROM learner_weeks GROUP BY starting_week ORDER BY starting_week DESC`) },
        { name: 'Topics practised · last 30 days', description: 'Actual submitted answers, including wrong answers; no browsing or automatic implied confirmations.', query: table(`SELECT properties.topic AS topic, uniq(distinct_id) AS learners, count() AS submitted_answers
FROM events WHERE event = 'answer_submitted' AND properties.app = '${app}'
AND timestamp >= now() - INTERVAL 30 DAY GROUP BY topic ORDER BY learners DESC`) },
        { name: 'Support-link interest · last 30 days', description: 'Unique browsers clicking Buy me a cafezinho. This is not a payment-confirmed event and must not be reported as revenue.', query: trend('support_clicked') }
      ]
    };
  });
}

export async function provision({ host, project, token, fetchImpl = fetch, log = console.log }) {
  if (!/^https:\/\/(us|eu)\.posthog\.com$/.test(host) || !/^\d+$/.test(String(project)) || !token) {
    throw new Error('Set POSTHOG_HOST (https://us.posthog.com or https://eu.posthog.com), POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY.');
  }
  const root = host + '/api/projects/' + project + '/';
  async function request(path, method = 'GET', body) {
    const response = await fetchImpl(root + path, { method, redirect: 'error',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    if (!response.ok) throw new Error(method + ' ' + path + ' failed (' + response.status + '): ' + (await response.text()).slice(0, 500));
    return response.json();
  }
  async function list(path) {
    const all = [];
    let next = path;
    while (next) {
      const page = await request(next);
      all.push(...page.results);
      if (page.next && !page.next.startsWith(root)) throw new Error('Unexpected pagination destination');
      next = page.next ? page.next.slice(root.length) : null;
    }
    return all;
  }
  const definitions = dashboards();
  // Validate server-side query compatibility before dashboard/insight writes.
  for (const dashboard of definitions) {
    for (const insight of dashboard.insights) {
      const result = await request('query/', 'POST', { query: insight.query.source });
      if (result.error || result.query_status?.error || result.query_status?.complete === false) {
        throw new Error('Query not verified: ' + insight.name);
      }
    }
  }
  const existingDashboards = await list('dashboards/?limit=100');
  const existingInsights = await list('insights/?limit=100');
  const links = [];
  for (const definition of definitions) {
    let dashboard = existingDashboards.find(d => !d.deleted && d.name === definition.name);
    if (!dashboard) dashboard = await request('dashboards/', 'POST', { name: definition.name, description: definition.description });
    for (const insight of definition.insights) {
      const name = definition.name.split(' — ')[0] + ' · ' + insight.name;
      const existing = existingInsights.find(i => !i.deleted && i.name === name && (i.dashboards || []).includes(dashboard.id));
      if (existing) continue;
      const created = await request('insights/', 'POST', { ...insight, name, dashboards: [dashboard.id] });
      if (!created.id || !(created.dashboards || []).includes(dashboard.id)) throw new Error('Insight not attached: ' + name);
      existingInsights.push(created);
    }
    const saved = await request('dashboards/' + dashboard.id + '/');
    if (!saved.id) throw new Error('Dashboard verification failed');
    const link = host + '/project/' + project + '/dashboard/' + dashboard.id;
    links.push(link); log(link);
  }
  return links;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--dry-run')) console.log(JSON.stringify(dashboards(), null, 2));
  else if (process.argv.includes('--apply')) {
    provision({ host: process.env.POSTHOG_HOST || 'https://us.posthog.com', project: process.env.POSTHOG_PROJECT_ID,
      token: process.env.POSTHOG_PERSONAL_API_KEY }).catch(error => { console.error(error.message); process.exitCode = 1; });
  } else { console.error('Usage: node scripts/setup-posthog.mjs --dry-run | --apply'); process.exitCode = 1; }
}
