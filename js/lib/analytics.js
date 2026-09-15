/* Optional PostHog analytics. Independent of Store: imports, resets, sync and
   inferred reviews must never become analytics activity. Only explicit calls
   from the quiz/Daily answer handlers count. No answers or sync codes leave.
   See docs/analytics.md for event definitions and dashboard setup. */
(function () {
  'use strict';
  const config = window.FG_ANALYTICS_CONFIG || {};
  const DISABLED = 'fg:analytics:disabled';
  const EVENTS = ['$pageview', 'app_opened', 'answer_submitted', 'support_clicked'];
  const APP = /^\/ingles(?:\/|$)/.test(location.pathname) ? 'ingles'
    : /^\/noruegues(?:\/|$)/.test(location.pathname) ? 'noruegues' : 'portugues';
  const LANGUAGE = { portugues: 'pt-BR', ingles: 'en-US', noruegues: 'nb-NO' }[APP];
  const REFERENCE = /^\/verbs(?:\/|$)/.test(location.pathname);
  let disabled = true;
  let booted = false;
  let campaign = {};
  const configured = /^phc_[a-zA-Z0-9]+$/.test(config.token || '') &&
    /^https:\/\/(us|eu)\.i\.posthog\.com$/.test(config.apiHost || '') &&
    location.protocol === 'https:' && (config.hosts || []).indexOf(location.hostname) !== -1;

  function privacySignal() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  }
  function allowed() { return configured && !disabled && !privacySignal(); }
  function localDay() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function baseProperties() {
    return Object.assign({ app: APP, language: LANGUAGE, local_day: localDay(),
      page_type: REFERENCE ? 'reference' : 'app',
      $current_url: location.origin + location.pathname,
      $pathname: location.pathname, $host: location.host }, campaign);
  }

  // An allowlist is intentional: SDK upgrades cannot add text, raw query
  // strings, referrer paths, person properties, or recordings to our payloads.
  function beforeSend(event) {
    if (!allowed() || !event || EVENTS.indexOf(event.event) === -1) return null;
    const props = event.properties || {};
    const clean = {};
    ['token', 'distinct_id', '$device_id', '$session_id', '$window_id',
      '$lib', '$lib_version', '$browser', '$browser_version', '$os', '$os_version',
      '$device_type', '$screen_height', '$screen_width', '$viewport_height', '$viewport_width',
      '$is_identified', '$process_person_profile', 'app', 'language', 'local_day',
      'page_type', 'topic', 'practice_mode', 'input_mode', 'result',
      'utm_source', 'utm_medium', 'utm_campaign', '$referring_domain',
      '$current_url', '$pathname', '$host'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(props, key)) clean[key] = props[key];
    });
    // These values always come from our sanitized capture context, never the
    // SDK's automatic attribution (which may contain arbitrary URL data).
    clean.$current_url = location.origin + location.pathname;
    clean.$pathname = location.pathname;
    clean.$host = location.host;
    ['utm_source', 'utm_medium', 'utm_campaign', '$referring_domain'].forEach(key => {
      if (campaign[key]) clean[key] = campaign[key]; else delete clean[key];
    });
    clean.$process_person_profile = false;
    event.properties = clean;
    return event;
  }

  function capture(name, props) {
    if (!allowed() || !booted) return;
    try { window.posthog.capture(name, Object.assign(baseProperties(), props || {})); }
    catch (_) { /* Analytics must never interrupt a lesson. */ }
  }

  function boot() {
    if (!allowed() || booted) return;
    // PostHog's snippet protocol: the SDK consumes _i and queued method calls
    // once array.js arrives. Bound the pre-load queue if the CDN is blocked.
    const stub = [];
    stub.__SV = 1;
    stub.people = [];
    ['capture', 'opt_out_capturing', 'opt_in_capturing'].forEach(method => {
      stub[method] = function () {
        if (stub.length < 100) stub.push([method].concat(Array.prototype.slice.call(arguments)));
      };
    });
    stub._i = [[config.token, {
      api_host: config.apiHost,
      defaults: '2026-05-30',
      persistence: 'localStorage',
      person_profiles: 'never',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_dead_clicks: false,
      capture_exceptions: false,
      capture_heatmaps: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      advanced_disable_feature_flags: true,
      respect_dnt: true,
      ip: false,
      before_send: beforeSend
    }, 'posthog']];
    window.posthog = stub;
    booted = true;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = config.apiHost.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
    document.head.appendChild(script);
    window.posthog.opt_in_capturing({ captureEventName: false });
    capture('$pageview');
    if (!REFERENCE) capture('app_opened');
  }

  function updateControl() {
    const el = document.getElementById('analyticsControl');
    if (!el) return;
    el.hidden = !configured;
    const pt = APP !== 'portugues';
    const note = document.getElementById('analyticsNote');
    const button = document.getElementById('analyticsToggle');
    if (note) note.textContent = pt
      ? 'Usamos o PostHog para contar visitas e prática, sem gravar suas respostas ou áudio.'
      : 'We use PostHog to count visits and practice, without recording your answers or audio.';
    if (button) {
      button.textContent = privacySignal() ? (pt ? 'Estatísticas desativadas pelo navegador' : 'Analytics disabled by your browser')
        : allowed() ? (pt ? 'Desativar estatísticas neste navegador' : 'Turn off analytics in this browser')
        : (pt ? 'Ativar estatísticas neste navegador' : 'Turn on analytics in this browser');
      button.disabled = privacySignal();
      button.onclick = function () {
        try {
          localStorage.setItem(DISABLED, allowed() ? '1' : '0');
          disabled = localStorage.getItem(DISABLED) === '1';
          if (disabled && booted) window.posthog.opt_out_capturing();
          location.reload();
        } catch (_) { disabled = true; updateControl(); }
      };
    }
  }

  // The owner can open /?analytics=off once on each browser they test with.
  // No query values other than the three campaign labels are ever captured.
  if (configured) {
    try {
      const query = new URLSearchParams(location.search);
      if (query.get('analytics') === 'off') localStorage.setItem(DISABLED, '1');
      if (query.get('analytics') === 'on') localStorage.setItem(DISABLED, '0');
      disabled = localStorage.getItem(DISABLED) === '1';
      const probe = 'fg:analytics:probe';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      // Session attribution survives navigation from a reference page into
      // the app. Campaign labels are deliberately short, non-personal slugs.
      const saved = JSON.parse(sessionStorage.getItem('fg:analytics:campaign') || '{}');
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
        const value = query.get(key) || saved[key];
        if (typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value)) campaign[key] = value;
      });
      let domain = saved.$referring_domain;
      if (document.referrer) {
        const ref = new URL(document.referrer);
        if (ref.hostname !== location.hostname) domain = ref.hostname;
      }
      if (typeof domain === 'string' && /^[a-zA-Z0-9.-]{1,253}$/.test(domain)) campaign.$referring_domain = domain;
      if (!disabled && !privacySignal()) sessionStorage.setItem('fg:analytics:campaign', JSON.stringify(campaign));
    } catch (_) { disabled = true; }
  }

  window.Analytics = {
    answer: function (topic, mode, inputMode, result) {
      if (!/^[a-zA-Z0-9_-]+$/.test(topic) || ['drill', 'daily'].indexOf(mode) === -1 ||
          ['typed', 'spoken'].indexOf(inputMode) === -1 || ['correct', 'near', 'wrong'].indexOf(result) === -1) return;
      capture('answer_submitted', { topic: topic, practice_mode: mode, input_mode: inputMode, result: result });
    }
  };
  try {
    updateControl();
    boot();
    document.addEventListener('click', function (event) {
      const link = event.target.closest && event.target.closest('a[href]');
      if (link && link.href && link.href.indexOf('https://buymeacoffee.com/henrikhestnes') === 0) capture('support_clicked');
    });
    window.addEventListener('storage', function (event) {
      if (event.key === DISABLED) {
        disabled = event.newValue !== '0';
        if (disabled && booted) window.posthog.opt_out_capturing();
        updateControl();
      }
    });
  } catch (_) { disabled = true; }
})();
