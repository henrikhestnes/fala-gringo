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
// 1.23.5 the Daily remembers what was typed per card (`typed`, synced) so its done-screen rows name the synonym
//        the learner reached for (eu caminho, not eu ando)
// 1.23.6 the imperfect subjunctive reaches 18 more verbs (58 in all, 228 cards): conseguir, acontecer, existir, ganhar,
//        entender, aprender, pegar, ligar, comer, tomar, começar, tentar, sentir, perder, viver, mudar, parar, ler —
//        the verbs a carioca actually puts in "se eu…" that the 40-verb core had left out

// 1.24.0: a safe store (read-before-mutate, never overwrite an unreadable blob, unknown
//         fields stripped not fatal), reset generations, accessible tabs/dialogs/live regions,
//         settings sheet with backups, Browse search/lazy panels, stable Daily identities,
//         due-only review advancement, pt-BR-only voices, audited pronunciation and glosses
// 1.24.1: back to the simple sync — pull, merge, push to the KV worker (no keepalive, 1 MiB cap);
//         the revision-checked Durable Object protocol and the per-record causal vectors that
//         shipped with 1.24.0 were more machinery than the problem deserved; the onboarding
//         starter/short session and the "Practicing:" wording go too
// 1.24.2: a compact Browse search toolbar, refined verb cards and roomier conjugation panels
// 1.24.3: keep reveal hints inside short word buttons and refine the topic navigation
// 1.24.4: restore solid white surfaces to inactive topic tabs
// 1.25.0: Rio welcome/footer, first-run guidance and optional sync setup,
//         plus explicit extra batches of new cards after finishing Foco
// 1.25.1: bounded Foco sessions; confirmations share intake; misses no longer recruit unseen forms
// 1.25.2: Modo Nutella by default for new profiles; saved mode choices preserved
// 1.25.3: longer review intervals and one-level setbacks per unresolved lapse
// 1.25.4: middle-ground review schedule (10/21/45/90/180 days)
// 1.25.5: original review intervals restored; gentler mistake penalties retained
// 1.25.6: original mistake penalty restored; session and mode changes retained
// 1.25.7: remove the Foco session cap; keep the separate daily goal
// 1.26.0: optional PostHog practice and acquisition analytics, with browser opt-out
// 1.26.1: discourage automatic translation so language exercises keep their original text
// 1.26.2: fix: a card answered right after a miss came back shaky on every sync round — the merge took the
//         lower streak from the copy still holding the miss; the record with the newer event stamp now decides
// 1.27.0: lifetime tally per card (`c` corrects beside `m` misses): "7 of 9 right" on the answer card, in Browse
//         and the Daily; LEECHES (4+ misses at 40%+) wear a "tricky" tag, lead the due tier and are listed
//         on the progress sheet; due and shaky tiers order by worst lifetime ratio among equals
// 1.28.0: the statistics page (#stats, js/stats.js, from the progress sheet): per tab a stacked bar of card states
//         (unseen · shaky · 7/14/30/60/120-day) with accuracy; a review forecast for the next 30 days; a year's
//         heatmap, longest run and a month-by-month table with the share answered right (the day log now also
//         keeps correct answers per day, `right`, synced like `days`); the Daily's history; card-by-card grids for
//         lexeme|form topics (verbs by person); every leech; the milestones earned; record count and blob size
// 1.28.1: fix: the statistics page shared a class name with the drill header's stat chips and rendered as a row of
//         slivers; the tally counts misses since it began (`w`, beside the lifetime `m`) so historical misses no
//         longer read as "0% right of 137" and no longer make every long-missed card a leech
// 1.28.2: introduce one new form per word per day in Foco, including extra batches;
//         defer unseen siblings of reviews so revealed answers cannot prime their first test
// 1.28.3: balance the persons/forms in new intake instead of always selecting the first row
// 1.28.4: cadastrar (to sign up, to register) — 147 verbs
// 1.28.5: the "keep practicing" batch takes held-back siblings once no fresh word is left, so a nearly finished tab never stalls
// 1.28.6: the Passado tab is now Perfeito — every verb tab names its tense (Presente · Perfeito · Imperfeito · Subjuntivo)
// 1.28.7: 396 cards from a Rio teacher's caderno (March–September 2026) — 36 glossary expressions (cadê, sei lá,
//         pois é, tô nem aí, pode deixar…), a family group and 40 more nouns, 27 adjectives (teimoso, folgado, ansioso vs
//         nervoso…), 14 adverbs (cedo, tarde, semana que vem, mesmo…), 9 connectors (só que, senão, porém, aliás, embora…),
//         15 verbs (sentar, fugir, cuidar, emprestar, paquerar, acompanhar, lidar, torcer, experimentar, devolver, demorar,
//         consertar, suar, reparar, gritar — 162 verbs), 5 pronominal verbs (se acostumar, se adaptar, se mudar, se queixar,
//         se arrumar) + 8 object-pronoun phrases, and three new Sentences groups: real conditions (se + futuro do subjuntivo),
//         verb + preposition (sonhar com, contar com, torcer pro…) and opinions & stances (que eu saiba, seja como for…)
// 1.29.0: the Presente do Subjuntivo tab (Subj. Presente, tier 3, id subjuntivo-presente) on the same 58-verb core as the
//         imperfect — 228 cards, forms derived from the presente eu form (falo → fale, faço → faça; ser/estar/ir/dar/saber/
//         querer listed), the rule in conjugate.js and checked like the perfeito-3pl one, every example inside a trigger
//         (quero que, tomara que, talvez…), "que eu fale" accepted; the Subjuntivo tab is now Subj. Imperfeito
// 1.30.0: the tab strip is two rows — Browse · INICIANTE · INTERMEDIÁRIO · AVANÇADO · ★ Daily (each level with its tabs'
//         combined %) over the tabs of the open level only, so a laptop sees one short line instead of fifteen pills
//         wrapping mid-tier (the subpages, with 2 and 5 drill tabs, keep the captioned single row); the app reopens
//         on the tab it was closed on (pref lastTab, per device and per app)
// 1.30.1: fix: on a drill tab the level buttons did nothing — every redraw re-derived the open level from the selected
//         tab; the level now follows the tab only on navigation, a tap's choice survives sync pulls and % updates
// 1.30.2: fix: the sync merge took the lower review level of two copies, so with two devices no card ever climbed
//         past the rung they last agreed on and the whole deck came due every week — the newer record now keeps
//         its climb (an offline miss the other side holds still floors it). Overdue credit: a due hit first earns
//         the rung the span since the clock fits (a 7-day card right after 21 days → the 14-day rung, then +1), so
//         a backlog paid off after a break jumps forward; near-misses and implied confirmations earn the span
//         without the climb. Make-up: never-missed cards confirmed across a span are lifted to the level the
//         ladder would have given, on every load/sync
// 1.30.3: fix: the make-up reached none of the cards learned before September — their first-correct day was
//         backfilled weeks late and they carry no intake day. A never-missed card without an intake day has
//         been known since before the learner's earliest Foco intake, so that horizon now bounds its span
//         (at most the 30-day rung from that evidence alone)
// 1.31.0: the derived schedule — a regular verb form is due only while its WORD or its PATTERN has no fresher
//         confirmation anywhere ("cheguei" in Perfeito keeps chegar covered in Presente; "falo" keeps the -ar / eu
//         ending covered for every regular verb). Both are derived from the records on every read — nothing is
//         written to the covered cards — and the deck, the goal, graduation and the statistics all follow it.
//         Irregular forms keep their own clock. The due tier asks first for the answers that confirm the most;
//         an answer that covers other due cards drops them live ("N implied"), a miss can bring them back
// 1.31.1: fix: "Progress synced" every 2.5 s — applying a pulled state saved, the save reached the sync module's own
//         change listener and scheduled another round; when the merge kept finding a difference the client polled
//         the worker for ever (an upload's one-minute throttle paused it, hence "it stops after an answer"). The
//         module ignores its own applies. And a request budget for the worker's free tier: scheduled rounds ten
//         minutes apart, a hide-push at most every two minutes, a re-pull on return at most every five, no CORS
//         preflight on uploads — a session costs a GET on load and one or two uploads; the worker can store in R2
//         (33,000 writes a day free) instead of KV (1,000), reading KV for codes not yet migrated
// 1.32.0: a second opinion on the verdict — under a miss, "I knew it — just a typo" re-grades it as a slip (the card
//         clears, the ladder does not climb on the learner's word); under a forgiven slip or a by-sound spoken match,
//         "actually, I got that wrong" re-grades it as a miss (the card goes back into the deck). The store puts the
//         last record back and records the new verdict afresh (Store.amendAnswer), so tally, ladder, day log and
//         goal read as if it had been the first; mastery the amended answer earned goes with it
// 1.32.1: fix: on the Daily, Enter after an answer did nothing — the answered box is disabled and a disabled input
//         fires no keydown; focus now moves to the → button as in the drills, so Enter advances
// 1.32.2: fix: Modo Raiz gave the noun's gender away — the meta read "noun · feminine" while only the article chip
//         was hidden; the gender now rides in the chip ("a … (feminine)") and the meta says just "noun"
// 1.32.3: fix: every drill render scrolled the card to the top of the viewport, so on a desktop the first load ran
//         the page to its end and hid the stat chips under the sticky bar; the page now moves only when the answer
//         box is actually out of view (under the bar or the mobile keyboard), and lands below the bar when it does
// 1.32.4: the drill scrolls by the least that brings the answer box into view — below the bar, above the keyboard —
//         instead of putting the card's top edge at the top of the screen (which on a phone hid the first-card
//         guide, and hopped while the keyboard slid up)
// 1.32.5: the first card takes focus like every other (1.32.4 had held it back until the guide was dismissed)
// 1.32.6: on a phone, while the answer box has focus the sticky bar steps aside and the drill moves to the top of
//         the screen (the first-card guide while it shows, else the card), so the card and the reveal get the room
//         the keyboard leaves; the bar returns on blur, on the answer, on unmount and on navigation
// 1.32.7: the top bar is static on narrow screens instead of hiding on focus (1.32.6 stuck hidden on iOS, whose Done key
//         hides the keyboard without blurring the box); the drill still moves to the top of the screen when the box is
//         focused on a touch device, and a flick up brings the tabs back
const APP_VERSION = '1.32.7';

(function () {
  if (typeof document === 'undefined') return;   // also loaded by sw.js for the cache name
  const el = document.getElementById('buildInfo');
  if (!el) return;
  let when = '';
  const lm = document.lastModified ? new Date(document.lastModified) : null;
  if (lm && !isNaN(lm.getTime()) && Date.now() - lm.getTime() > 60000) {
    const locale = document.documentElement.lang || 'en-GB';   // the page's own language decides the date format
    when = ' · updated ' +
      lm.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + String(lm.getHours()).padStart(2, '0') + ':' +
      String(lm.getMinutes()).padStart(2, '0');
  }
  el.textContent = 'v' + APP_VERSION + when;
})();
