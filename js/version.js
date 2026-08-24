// Visible versioning. APP_VERSION is bumped by hand (there is no build step to
// derive it): patch for fixes/content, minor for a new feature, major for a
// redesign. The deploy date needs no maintenance — document.lastModified is the
// page's Last-Modified header (opened from disk it is the file's mtime, so the
// label says "updated"). Hosts that send no such header (Cloudflare Pages uses
// ETags instead) make the browser substitute the current time; a timestamp
// within a minute of now is that substitute, so the label shows only the
// version then.
//
// 1.0 the app · 1.1 Foco mode · 1.2 cross-device sync · 1.3 Foco by default + spaced review
// 1.4 three-state theme (auto follows the system) · 1.5 mic mode (hands-free spoken answers)
// 1.6 static per-verb pages under verbs/ (crawlable + sitemap)

const APP_VERSION = '1.6.2';

(function () {
  const el = document.getElementById('buildInfo');
  if (!el) return;
  let when = '';
  const lm = document.lastModified ? new Date(document.lastModified) : null;
  if (lm && !isNaN(lm.getTime()) && Date.now() - lm.getTime() > 60000) {
    when = ' · updated ' +
      lm.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + String(lm.getHours()).padStart(2, '0') + ':' +
      String(lm.getMinutes()).padStart(2, '0');
  }
  el.textContent = 'v' + APP_VERSION + when;
})();
