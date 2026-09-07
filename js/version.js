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
// 1.12 Foco: expanding review schedule (7/14/30/60/120 by review level), a daily cap on new cards,
//      reviews-first deck order, and inferred-known verb forms (js/infer.js) that only need confirming
// 1.12.1 fix: equally overdue reviews were served in data order (stable sort on a tie) — shuffled again
// 1.13 the drill header is live: the Foco chip tiers and the mastered count follow every answer
// 1.13.1 the tab strip's mastery % follows every answer too (drills and Daily)
// 1.14 shaky = missed and not yet answered right again (was a 3-streak); a shaky verb drags in only
//      its UNSEEN forms — the flat-era rules had kept hundreds of cards "shaky" for weeks
// 1.15 forgiving matching: a typed slip is a near-miss (clears, no level gain), spoken answers match by
//      pt-BR sound key — both refused when another form of the topic is just as close
// 1.16 implied reviews: of a known-pattern verb's due regular forms only the weakest is asked; a clean
//      hit confirms the rest (clock reset, no climb), a miss reclaims them into the deck
// 1.16.1 acontecer (to happen): third-person rows drilled with their own subject, eu/nós rows Browse-only;
//        four "what happened?" sentence cards
// 1.16.2 21 high-frequency verbs (tomar, olhar, acabar, existir, morrer, nascer, receber, mandar, brincar,
//        almoçar, jantar, avisar, descobrir, ensinar, gastar, buscar, visitar, virar, arrumar, aproveitar,
//        desligar); este → esse in three examples
// 1.16.3 demonstratives: esse/essa/nesse are the canonical answers (este/esta/neste stay accepted) — spoken BR
// 1.17 /noruegues/ — Fala Viking, Norwegian (bokmål) for Brazilians on the same engine: verbs, nouns with
//      gender, phrases, numbers, small words; normalize() keeps the ring of å (så ≠ sa)
// 1.17.1 verb pages: an English "how to use" section per verb (meaning, which forms are irregular, the
//        tenses in English, Rio pronunciation traits) + English tense labels — the pages read as English

const APP_VERSION = '1.17.1';

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
