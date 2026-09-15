// Analytics boundary + real answer-handler regressions. No network/dependencies.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { provision, dashboards } from './setup-posthog.mjs';
const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
}
function browser({ url = 'https://falagringo.com/', token = 'phc_test', blocked = false, optedOut = false, navigator = {}, savedCampaign = null } = {}) {
  const scripts = [], listeners = {}, nodes = {};
  const localStorage = storage(optedOut ? { 'fg:analytics:disabled': '1' } : {});
  if (blocked) localStorage.setItem = () => { throw Error('blocked'); };
  const sessionStorage = storage(savedCampaign ? { 'fg:analytics:campaign': JSON.stringify(savedCampaign) } : {});
  const location = new URL(url);
  location.reload = () => {};
  const context = vm.createContext({ URL, URLSearchParams, Date, navigator, location, localStorage, sessionStorage,
    document: { referrer: 'https://example.org/private?q=secret',
      head: { appendChild: element => scripts.push(element) }, createElement: () => ({}),
      getElementById: id => nodes[id] ||= {}, addEventListener: (name, fn) => { listeners[name] = fn; } },
    FG_ANALYTICS_CONFIG: { token, apiHost: 'https://eu.i.posthog.com', hosts: ['falagringo.com'] },
    addEventListener: (name, fn) => { listeners[name] = fn; }
  });
  context.window = context;
  vm.runInContext(source('js/lib/analytics.js'), context);
  const run = code => vm.runInContext(code, context);
  const captures = () => Array.from(context.posthog || []).filter(e => e[0] === 'capture');
  return { context, run, captures, scripts, nodes, listeners, localStorage, sessionStorage };
}

test('unconfigured, local, preview, storage-blocked and opted-out browsers never load the SDK', () => {
  for (const options of [{ token: '' }, { url: 'file:///tmp/index.html' }, { url: 'http://localhost:8000/' },
    { url: 'https://preview.workers.dev/' }, { blocked: true }, { optedOut: true },
    { url: 'https://falagringo.com/?analytics=off' }, { navigator: { globalPrivacyControl: true } }, { navigator: { doNotTrack: '1' } }]) {
    const b = browser(options);
    b.run("Analytics.answer('presente','drill','typed','correct')");
    assert.equal(b.scripts.length, 0, JSON.stringify(options));
    assert.equal(b.captures().length, 0);
  }
});

test('startup records a pageview and app open; reference pages record only a pageview', () => {
  const b = browser();
  assert.equal(b.scripts[0].src, 'https://eu-assets.i.posthog.com/static/array.js');
  assert.deepEqual(b.captures().map(e => e[1]), ['$pageview', 'app_opened']);
  assert.deepEqual(browser({ url: 'https://falagringo.com/verbs/falar' }).captures().map(e => e[1]), ['$pageview']);
  for (const [path, app, language] of [['/', 'portugues', 'pt-BR'], ['/ingles/', 'ingles', 'en-US'], ['/noruegues/', 'noruegues', 'nb-NO']]) {
    const event = browser({ url: 'https://falagringo.com' + path }).captures()[0][2];
    assert.equal(event.app, app); assert.equal(event.language, language);
  }
});

test('the outgoing boundary strips answer text, sync codes, query strings and surprise SDK events', () => {
  const b = browser({ url: 'https://falagringo.com/?utm_source=tutor&utm_medium=referral&syncCode=secret#private' });
  const config = b.context.posthog._i[0][1];
  assert.equal(config.autocapture, false); assert.equal(config.disable_session_recording, true);
  const props = { ...b.captures()[0][2], distinct_id: 'browser-id', answer: 'private text', syncCode: 'secret',
    $current_url: 'https://falagringo.com/?syncCode=secret', $referrer: 'https://example.org/private',
    $set: { email: 'private@example.org' }, utm_campaign: 'email@private.org' };
  const cleaned = config.before_send({ event: '$pageview', properties: props });
  assert.equal(cleaned.properties.distinct_id, 'browser-id');
  assert.equal(cleaned.properties.$current_url, 'https://falagringo.com/');
  assert.equal(cleaned.properties.utm_source, 'tutor');
  assert.equal(cleaned.properties.$referring_domain, 'example.org');
  assert.doesNotMatch(JSON.stringify(cleaned), /secret|private|email/);
  assert.equal(config.before_send({ event: '$snapshot', properties: props }), null);
});

test('session campaign labels survive reference-to-app navigation and invalid labels are excluded', () => {
  const landing = browser({ url: 'https://falagringo.com/verbs/falar?utm_source=tutor&utm_campaign=first_month' });
  const app = browser({ savedCampaign: JSON.parse(landing.sessionStorage.getItem('fg:analytics:campaign')) });
  assert.equal(app.captures()[0][2].utm_source, 'tutor');
  assert.equal(app.captures()[0][2].utm_campaign, 'first_month');
  assert.equal(browser({ url: 'https://falagringo.com/?utm_source=henrik@example.com' }).captures()[0][2].utm_source, undefined);
});

test('tracking failure and a blocked CDN cannot interrupt answers or grow an unbounded queue', () => {
  const b = browser();
  for (let i = 0; i < 250; i++) b.run("Analytics.answer('presente','drill','typed','wrong')");
  assert.equal(b.context.posthog.length, 100);
  b.context.posthog.capture = () => { throw Error('network'); };
  assert.doesNotThrow(() => b.run("Analytics.answer('presente','drill','typed','correct')"));
});

test('a browser opt-out blocks queued events and propagates to another tab', () => {
  const b = browser();
  const beforeSend = b.context.posthog._i[0][1].before_send;
  b.nodes.analyticsToggle.onclick();
  assert.equal(b.localStorage.getItem('fg:analytics:disabled'), '1');
  assert.equal(beforeSend({ event: '$pageview', properties: {} }), null);
  const other = browser();
  other.listeners.storage({ key: 'fg:analytics:disabled', newValue: '1' });
  const count = other.captures().length;
  other.run("Analytics.answer('presente','drill','typed','correct')");
  assert.equal(other.captures().length, count);
  const enabled = browser({ optedOut: true, url: 'https://falagringo.com/?analytics=on' });
  assert.equal(enabled.captures().length, 2);
  assert.ok(enabled.context.posthog.some(call => call[0] === 'opt_in_capturing'));
});

function app() {
  const context = vm.createContext({ console });
  // Use the real production loading order but replace the transport with a
  // recorder. Existing DOM stub supplies the engine's browser dependencies.
  const files = [...source('index.html').matchAll(/<script src="([^"]+)"/g)].map(m => m[1])
    .filter(file => !file.includes('analytics'));
  vm.runInContext(source('scripts/dom-stub.js') + '\n' + files.map(source).join('\n;\n') +
    '\nwindow.analyticsCalls = []; window.Analytics = { answer: (...args) => analyticsCalls.push(args) };', context);
  return code => vm.runInContext(code, context);
}

test('real drill submissions count once; blank input, skip, Store writes and inferred reviews do not', () => {
  const run = app();
  run("Quiz.mount(topicById('presente')); document.getElementById('answerInput').value = ''; registry.actionBtn.fire('click');");
  assert.equal(run('analyticsCalls.length'), 0);
  run("document.getElementById('answerInput').value = 'a deliberate wrong answer'; registry.actionBtn.fire('click');");
  assert.equal(run('analyticsCalls.length'), 1);
  assert.equal(run('analyticsCalls[0].join()'), 'presente,drill,typed,wrong');
  run("registry.actionBtn.fire('click'); registry.skipBtn.fire('click');");
  assert.equal(run('analyticsCalls.length'), 1);
  run("Store.recordAnswer('presente', 'falar|0', true, 0, true, true); Store.resetAll();");
  assert.equal(run('analyticsCalls.length'), 1);
});

test('Daily attempts count once each including the fifth miss; revealing without an answer does not count', () => {
  const run = app();
  run("Daily.mount(); for (let i = 0; i < 5; i++) { document.getElementById('answerInput').value = 'wrong'; registry.actionBtn.fire('click'); }");
  assert.equal(run('analyticsCalls.length'), 5);
  assert.equal(run("analyticsCalls.every(call => call[1] === 'daily' && call[3] === 'wrong')"), true);
  run("registry.actionBtn.fire('click'); registry.giveUpBtn.fire('click');");
  assert.equal(run('analyticsCalls.length'), 5);
});

test('dashboard provisioning verifies queries before writes and reuses existing dashboards on a repeat run', async () => {
  const db = [], insights = [], calls = [];
  const fetchImpl = async (url, options) => {
    const path = new URL(url).pathname.split('/42/')[1];
    const data = options.body ? JSON.parse(options.body) : {};
    calls.push({ path, method: options.method });
    let result;
    if (path === 'query/') result = { results: [] };
    else if (path === 'dashboards/' && options.method === 'POST') { result = { id: db.length + 1, ...data }; db.push(result); }
    else if (path === 'insights/' && options.method === 'POST') { result = { id: insights.length + 1, ...data }; insights.push(result); }
    else if (path === 'dashboards/') result = { results: db, next: null };
    else if (path === 'insights/') result = { results: insights, next: null };
    else result = db.find(d => path === 'dashboards/' + d.id + '/');
    return new Response(JSON.stringify(result));
  };
  const options = { host: 'https://eu.posthog.com', project: '42', token: 'secret', fetchImpl, log: () => {} };
  const links = await provision(options);
  assert.equal(links.length, 3); assert.equal(db.length, 3); assert.equal(insights.length, 27);
  assert.equal(calls.slice(0, 27).every(c => c.path === 'query/'), true);
  await provision(options);
  assert.equal(db.length, 3); assert.equal(insights.length, 27);
  assert.equal(dashboards().length, 3);
});

test('dashboard setup stops before creating anything if PostHog rejects a query', async () => {
  const paths = [];
  await assert.rejects(provision({ host: 'https://eu.posthog.com', project: '42', token: 'secret', log: () => {},
    fetchImpl: async url => { paths.push(url); return new Response('Bad query', { status: 400 }); }
  }), /failed/);
  assert.equal(paths.length, 1); assert.match(paths[0], /query\/$/);
});
