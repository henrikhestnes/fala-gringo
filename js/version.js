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
// 1.6 static per-verb pages under verbs/ (crawlable + sitemap) · 1.7 installable PWA (offline)
// 1.8 /ingles/ — English for Brazilians on the same engine
// 1.9 /ingles/: full irregular-verb set (74 entries) + phrasal verbs tab
// 1.10 /ingles/ gets cross-device sync (prefixed code, same worker untouched)
// 1.10.1 fix: with sync off, a miss showed no answer (save() hit the Sync const in its TDZ)
// 1.11 one sync code per device, shared by both apps (fg:syncCode) — two blobs, one "account"

const APP_VERSION = '1.11.0';

(function () {
  if (typeof document === 'undefined') return;   // also loaded by sw.js for the cache name
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
