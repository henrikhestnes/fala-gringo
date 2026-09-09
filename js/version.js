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
// 1.18 the habit loop: a day log (answers per LOCAL day — the calendar now turns at the learner's
//      midnight, not UTC), a streak with one grace day, and today's goal ring in the top bar — what Foco
//      still asks across the tabs the learner actually drills (a beginner's goal never includes the
//      subjunctive), filling as it gets done; the done/empty screens point at where today's work still is
// 1.19 tiers: every drill tab carries a level (Iniciante / Intermediário / Avançado); the learner's title —
//      the highest tier among the tabs they have taken up — sits by the flame; a tab GRADUATES (🎓 in place of
//      its %) once 80% of its cards reach review level 3, celebrated once with confetti and a "next tab" nudge
// 1.19.1 typed slips are keyboard-shaped: a substituted or extra letter counts only on a neighbouring key
//        (s for a), never a different vowel (e for a) — dropped, doubled and swapped letters stay forgiven

// 1.19.2 fix: the goal ring summed the 20-card intake of EVERY drilled tab (twelve tabs = a 290-card day) and
//        owed a whole backlog of misses at once; today's goal is now at most 30 cards (GOAL_MAX, pref goalMax) —
//        reviews first, then up to 10 new (GOAL_NEW, pref goalNew) — and the rest "waits", shown but not owed;
//        the unseen siblings a missed verb form drags into the deck count as new, not as reviews
// 1.19.3 footer: each sister app on a line of its own behind its flag (🇺🇸 inglês, 🇳🇴 norueguês;
//        the subpages point back with 🇧🇷)
// 1.20 the Daily keeps a permanent log of finished days (dailyDone): a strict day streak in the header, the
//      done screen and the share string (from day two), a first-try distribution 7..0 on the done screen; the
//      share link now points at falagringo.com; the tab strips are stacked by tier (Presente, Nouns, Numbers,
//      Glossary · Passado, Imperfeito, Pronominais, Adjectives, Adverbs, Connecting · Subjuntivo, Sentences) —
//      the Daily's date-seeded pick changes once with the order, accepted
// 1.20.1 /ingles/ and /noruegues/ wear their flags in the top bar and favicon (🇺🇸 for 🗽, 🇳🇴 for 🏔️)

// 1.20.2 the tab strip captions its tiers: INICIANTE · INTERMEDIÁRIO · AVANÇADO open each run of tabs

// 1.21 milestones (js/milestones.js): ~a dozen markers tied to learning — cards mastered, the streak, the top of
//      the review ladder, graduations, a whole verb, the Daily — earned with a toast; the goal ring now opens a
//      progress sheet (title, streak, today's tabs, milestones) instead of jumping to the fullest tab

// 1.22 the progress sheet shows a 12-week activity heatmap (Monday-first weeks, shaded by answers a day, from
//      the day log), with a "N of M days practised · answers" line
// 1.23 the answer card says when a verb form is irregular: an "irregular" tag by the pronunciation, the letters
//      that break the regular pattern highlighted in the conjugation table (faço → ç, fizesse → i, quer → the
//      dropped ending), and a line naming what the regular -ar/-er/-ir pattern would have given
// 1.23.1 the Browse conjugation panels carry the same irregular marks, with a one-line legend per verb
// 1.23.2 the brand in the top bar (flag + name) is a link to the app's front page, in all three apps
// 1.23.3 fix: that link was index.html, which the host redirects to ./ — the service worker then served the
//        redirected response to a navigation and Chrome failed the load; the link is ./ (index.html from disk),
//        the worker caches the pages under ./ only and strips the redirected flag from anything it serves

// 1.23.4 a synonym typed for a verb card (coloco or boto for "I put") is answered AS that verb — its own form,
//        pronunciation and conjugation table — instead of the card's canonical pôr; on a miss the verb the
//        typed text starts like leads ("colocamos" → colocar); the other synonyms follow in an "also" line

const APP_VERSION = '1.23.4';

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
