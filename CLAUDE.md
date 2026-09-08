# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Fala Gringo** is a study tool for **beginner–intermediate Portuguese** learners: an English speaker is shown English and types the Portuguese. It is a static site — no build step, no dependencies; the only network requests are the optional progress sync (`js/lib/sync.js`), which stays off until `SYNC_URL` is set there. Open `index.html` directly from disk or serve the repo root.

### ⚠️ Brazilian Portuguese ONLY

It is of the utmost importance that this tool **only teaches Brazilian Portuguese** — specifically the spoken carioca (Rio) register — and **never European Portuguese**. This applies to every contribution:

- Vocabulary and word choice: prefer the Brazilian word (`ônibus` not `autocarro`, `celular` not `telemóvel`, `café da manhã` not `pequeno-almoço`).
- Grammar and register: `você`/`vocês` conjugation, no `tu`/`vós` forms anywhere in the data (`persons` is `eu / você / nós / vocês`).
- Spelling: Brazilian orthography (`ação`, `ideia`, `gênero` — never `acção`, `género`).
- Pronunciation hints and IPA: Brazilian sounds (final `-s` as in Rio, `dʒi`/`tʃi` palatalization — e.g. `cidade` = `see-DAH-jee`, carioca `ʁ`).
- TTS uses the browser's **pt-BR** voice; `index.html` declares `lang="pt-BR"`.
- Example sentences must sound like spoken Brazilian Portuguese, not textbook European Portuguese. Where two verbs are interchangeable in spoken BR-PT (`pôr`/`botar`/`colocar`, `andar`/`caminhar`), both are accepted answers rather than inventing a false distinction.

Any new card, example, gloss, or pronunciation must follow these conventions. When in doubt, match the Rio-register style of the existing data in `js/data/`.

## Commands

Two headless check suites, run with the JavaScriptCore engine bundled with macOS — no toolchain needed:

```sh
osascript -l JavaScript scripts/check.jxa           # data invariants
osascript -l JavaScript scripts/smoke.jxa           # app behaviour, against a DOM stub
osascript -l JavaScript scripts/check-ingles.jxa    # /ingles/ data invariants
osascript -l JavaScript scripts/smoke-ingles.jxa    # /ingles/ behaviour
osascript -l JavaScript scripts/check-noruegues.jxa     # /noruegues/ data invariants
osascript -l JavaScript scripts/smoke-noruegues.jxa     # /noruegues/ behaviour
```

`verify.html` runs the main data checks in a browser (just open it). There is no build, lint, or package manager; there is no single-test runner — the suites are fast, run them whole.

**Run all suites after any change to `js/` data or logic** (the engine is shared with `/ingles/` and `/noruegues/`, so an engine change can break any of the three apps). The checks are the safety net for hand-maintained data.

## Architecture

Classic `<script>` tags, **deliberately not ES modules**: the app must keep working when opened as a local `file://` page. Each file exposes globals (`window.DATA_VERBS`, etc.). Do not convert to modules or add a bundler.

```
index.html          shell: top bar, tab strip, <main>
css/app.css         design tokens + components (light + dark themes)
js/data/*.js        one file per topic — 9 different card schemas
js/topics.js        registry — normalises all schemas into ONE card shape
js/quiz.js          the single drill engine, shared by all drill topics
js/browse.js        the verb list tab
js/daily.js         daily challenge (deterministic from the date)
js/progress.js      localStorage (single key `pvs:v1`): mastery, per-card strength (Foco), prefs, daily results,
                    the day log (answers per LOCAL day → streak) and the drilled-tab stamps (→ today's goal)
js/conjugate.js     regular-conjugation oracle — verifies the regular verbs in the checks, and
                    tags each verb card's form as regular/irregular for the inference (topics.js)
js/infer.js         Foco inference: unseen verb forms whose word AND pattern the learner has
                    demonstrated become "verify" cards (one quick confirmation, uncapped)
js/checks.js        shared assertions (used by check.jxa and verify.html)
js/milestones.js    the milestone definitions (learning-tied markers; which apply depends on the app's tabs)
js/app.js           hash router + delegated events, the top-bar goal ring and the progress sheet
js/version.js       APP_VERSION shown in the footer — bump it in every commit with a user-visible change (patch: fixes/content, minor: feature); the "updated" date comes free from document.lastModified
js/lib/             text.js (normalize/shuffle), tts.js, stt.js (mic-mode speech recognition + spoken-answer matching), fx.js (confetti + the one `showToast`), sync.js (optional cross-device sync)
sync-worker/        Cloudflare Worker + KV backend for sync — deployed separately, see its README
manifest.json, sw.js, icons/   installable PWA — sw.js caches offline, keyed to APP_VERSION
og.png, 404.html    social-share card + not-found page
wrangler.jsonc      config for the git-connected Cloudflare Worker serving the site
                    (static assets; not_found_handling makes it serve 404.html)
ingles/             English-for-Brazilians subpage on the SAME engine — see its section below
noruegues/            Norwegian-for-Brazilians subpage, same recipe — see its section below
scripts/            check.jxa, smoke.jxa (+ smoke-steps.js, dom-stub.js), check-ingles.jxa,
                    smoke-ingles.jxa (+ smoke-ingles-steps.js), check-noruegues.jxa,
                    smoke-noruegues.jxa (+ smoke-noruegues-steps.js), generate-verb-pages.jxa,
                    og-image.html + app-icon.html (headless-Chrome sources for og.png/icons/)
verbs/              GENERATED static per-verb pages (SEO) — never edit by hand;
                    re-run `osascript -l JavaScript scripts/generate-verb-pages.jxa`
                    after any change to js/data/verbs.js and commit the output
                    (it also rewrites sitemap.xml and robots.txt in the root)
```

The key design decision: instead of one drill engine per topic (each topic's raw data has a different schema), `js/topics.js` normalises everything into one card shape — `{ id, topic, group, meta, hint, prompt, sub, accepted[], answer, pron, speak, reveal, allowEmpty, exact }` — and `js/quiz.js` drives all of them. (`exact: true` opts a card out of the typed-slip forgiveness; only `/noruegues/`'s noun cards set it.)

`js/data/verbs.js` is the **source of truth for verb forms** — 146 verbs, forms stored explicitly rather than generated at runtime, so a pronunciation hint hangs off each form. A curated 40-verb core additionally carries the imperfect subjunctive. `js/conjugate.js` independently verifies the regular verbs in the checks; the app loads it too, only so `topics.js` can tag each verb form as regular or not for the Foco inference — it never conjugates for display.

## /ingles/ — Fala Como Gringo, English for Brazilians (subpage)

The inverse product on the same engine, branded **Fala Como Gringo**: a Portuguese speaker is shown Portuguese and types **American English**. It lives at `/ingles/` and shares `js/quiz.js`, `js/app.js`, `js/progress.js`, `js/lib/` and `css/app.css` verbatim — no forked engine code. The direction flip is entirely configuration, set in an inline `<script>` in `ingles/index.html` **before** the engine loads:

- `window.APP_LANG = 'en-US'` — TTS voice + mic-mode recognizer language (and it disables the Portuguese spoken-digit expansion in `stt.js`).
- `window.APP_STORE_KEY = 'fg-ingles:v1'` — its own localStorage blob; the two apps' progress must never mix.
- `window.APP_SYNC_APP = 'ingles'` — the subpage loads the shared `js/lib/sync.js` too, but this prefix goes in front of the sync code on the wire (`/ingles<code>`), so the unchanged worker stores the blob under a separate KV key (the root app keeps the bare `<code>`). The code itself is **one per device, shared by both apps** through the plain localStorage key `fg:syncCode` (same origin), so turning sync on or off in either app does it for both, while the prefix keeps the two blobs apart on the worker with no backend change. A pre-1.11 per-app `syncCode` pref is migrated into the shared key on first read. The sync prompts/tooltips are Portuguese via `APP_STRINGS` (`sync*` keys, see `STR` in sync.js).
- `window.APP_STRINGS` — Portuguese UI wording for the engine chrome (see `QUIZ_STRINGS` in quiz.js and `APP_STR` in app.js for every overridable key). Card-level text comes from `ingles/js/topics.js`.
- `window.SW_PATH = '../sw.js'` — both apps register the one root service worker; the subpage's files are in its CORE list.

`ingles/js/topics.js` mirrors the root registry contract (`TOPICS`, `topicById`, `topicCards`, `topicGroups`, `allQuizCards`) and normalises into the same card shape. There is no Browse or Daily tab; `app.js` falls back to `TOPICS[0]`.

Conventions for its content (`ingles/js/data/`): everything the learner **reads** is carioca Portuguese (the ⚠️ rule above applies to the UI and glosses); everything the learner **types/hears** is American English. Pronunciation hints are aportuguesadas for Brazilian ears (`had` = `rréd`, English *h* written as carioca *rr*). The no-ambiguous-prompts invariant is mirrored: a `pt` gloss + meta must identify exactly one English answer (`fazer (ação, tarefa)` = do vs `fazer (criar, produzir)` = make), enforced by `scripts/check-ingles.jxa`.

## /noruegues/ — Fala Viking, Norwegian for Brazilians (subpage)

The same recipe as `/ingles/`, one more time: a Portuguese speaker is shown carioca Portuguese and types **Norwegian Bokmål** (Oslo register — `sju`/`tjue` canonical, `syv`/`tyve` accepted; feminine nouns canonical with `ei`/`-a`, `en`/`-en` accepted). It lives at `/noruegues/`, shares the whole engine verbatim, and is configured by the inline `<script>` in `noruegues/index.html`:

- `window.APP_LANG = 'nb-NO'` (TTS favours Apple's Nora, `TTS_FAVOURITE.nb`), `APP_STORE_KEY = 'fg-noruegues:v1'`, `APP_SYNC_APP = 'noruegues'` (wire prefix `/noruegues<code>`; the code itself is the device-wide `fg:syncCode` shared by all three apps), `SW_PATH = '../sw.js'`, and the same Portuguese `APP_STRINGS` set as `/ingles/`.
- `window.APP_SPOKEN_DIGITS` — the engine's spoken-digit expansion in `stt.js` is pt-BR only; a non-Portuguese page can supply its own `text → text` function and `/noruegues/` does, so a mic-mode "7" matches `sju` on the numbers tab.

Five drill tabs (stacked by tier: frases, numeros · substantivos, palavrinhas · verbos), registry in `noruegues/js/topics.js`, data in `noruegues/js/data/`: **verbos** (44 verbs × presente + preteritum, `pastAlts` for the bokmål doublets `snakket/snakka`), **substantivos** (44 nouns × indefinite-with-article + definite-suffixed; `g` is `m`/`f`/`n`, `def`/`defAlts`/`indefAlts` override the regular forms), **frases**, **numeros**, **palavrinhas** (pronouns, question words, adverbs, prepositions — a shared `{ no, alts, pt, group, pron, example, examplePt, tip }` shape). Pronunciation hints are aportuguesadas as in `/ingles/` (`rr` = aspirated h, `ê` for ø, `ü` for y, `ô` for å, long o = `u`); the legend is in the page footer.

Two engine consequences worth knowing:

- `normalize()` in `js/lib/text.js` strips every combining mark **except the ring above** — `å` is a letter (`så` "saw" vs `sa` "said" are both verb answers), and no Portuguese or English answer carries a ring, so the root and `/ingles/` behaviour is unchanged. `ø`/`æ` never decomposed and were always distinct.
- Noun cards carry `exact: true`: the one-letter slip the matcher would forgive (`et jente` for `ei jente`, `husen` for `huset`) is precisely the gender being drilled and no rival card exists to guard it. Verb, phrase and number cards keep the normal near-miss rule.

`scripts/check-noruegues.jxa` mirrors the root invariants (unique prompts, complete cards, example contains the form — with a `\b` replacement that knows æøå — and, new here, no accepted answer shared by two cards of a topic, which is what caught `han` doubling as an alternative for `ham`).

## Correctness invariants (enforced by the checks)

- **No ambiguous prompts.** Hard Mode (the default; labelled "Modo Raiz" in the UI, with Easy Mode as "Modo Nutella") shows no Portuguese at all, so no English prompt may be satisfiable by two different answers. This is why glosses carry qualifiers — `to be (permanent)` vs `to be (temporary)`, `to know (a fact)` vs `to know (a person/place)`. Adding a card means checking its prompt is unique; the checks fail otherwise.
- Every drilled form has a form, meaning, pronunciation, and example.
- Every regular verb matches the conjugation oracle; every verb flagged `irregular` really is irregular.
- Every imperfect-subjunctive form derives from the pretérito perfeito 3pl (drop `-ram`, add `-sse/-sse/-ssemos/-ssem` — a rule with no exceptions), and every subjunctive example contains its form inside a trigger context (`se…`, `como se…`, `queria que…`).
- Every card's canonical answer is among its own accepted answers.
- Answers are compared case-, accent-, and punctuation-insensitively (`js/lib/text.js` `normalize()`); verbs accept the bare form as well as the pronoun-prefixed one. On top of that, `matchAnswer()` forgives a **typed slip** (one edit from 5 characters, two from 12, none below — a letter IS the answer in falo/fala; and only **keyboard-shaped** edits count: a dropped, doubled or swapped letter, or a substituted/extra letter on a **neighbouring QWERTY key** per `KEY_NEAR` — `fslo` is a slip, `fale` is a wrong vowel and a miss) as a **near-miss**: the card clears and shows "≈ Close! You typed …", but the review level does not climb. **Spoken** answers (mic mode) also match by pt-BR sound key (`phoneticKey()`: ç/ss/z/ce → s, -ão/-am, dropped final r, final e/o → i/u …) and grade as a full hit. Both are refused whenever a **rival** — any answer of another card in the topic that this card does not accept — is at least as close (fala for falo, era for eram), so a near-miss can never be mistaken for a different form. The checks fail if two distinct forms of one conjugation share a sound key. The Daily tab stays exact-match.
- `haver` appears in Browse but is deliberately excluded from drills (only 3sg `há`/`houvesse` is live usage) — don't "fix" that. A single verb row can also opt out with `quiz: false` and name its own subject with `person` (`acontecer`, `existir`: `eu aconteço` is Browse-only, the drilled rows read `isso acontece` / `as coisas acontecem`; `nascer` drills only the perfeito in full).

## Content notes

- Non-verb card content and the hand-written verb pronunciations/examples come from [gjermundbae/portuguese-verb-flashcards](https://github.com/gjermundbae/portuguese-verb-flashcards). The 29 verbs unique to this repo have **generated** pronunciations/examples (348 forms) — worth spot-checking, especially stress placement.
- A wrong answer never clears a card — it returns to the deck until answered correctly. There is no batching: a deck is always the whole topic minus deselected category chips.
- **Foco mode** (🎯 chip on every drill tab, pref `foco` — the abandoned `focus` key is pre-1.3 and ignored, **on by default**): the deck is the cards needing work, in tiers, reviews first — **due** (mastered, review interval ran out; most overdue first — thinned by `Infer.implyDue`: of a verb's due regular forms in a pattern the learner has shown they know, only the weakest is asked and a clean hit **implies** the rest, resetting their clock without climbing; a miss or near-miss on the lead reclaims them into the deck; the chip shows "N implied"), **shaky** (missed and not yet answered correctly again — `FOCUS_STREAK` is 1 since 1.14, the ladder does the re-checking; on verb topics one shaky form also drags the verb's *unseen* forms for that tense into this tier past the daily cap, card ids share a `verb|` prefix — its fresh, mastered siblings are left alone), **verify** (unseen forms inferred as likely known, see `js/infer.js`; asked once, uncapped, a hit starts at review level 2), and **new** (unseen cards, at most `NEW_PER_DAY` (20, pref `newPerDay`) introduced per topic per day, taken in data order by whole lexeme; the rest "wait for tomorrow"). Review intervals expand with the card's **review level** = confirmations on distinct days since its last miss: `REVIEW_INTERVALS` 7 → 14 → 30 → 60 → 120 days; a same-day repeat does not raise the level, a miss resets it to 0. The strength record is `{ s streak, m misses, t last-correct day, l level, i introduced day }`; pre-1.12 records have no `l` and count as level 1 (the old fixed 7-day review). The chip reads e.g. "🎯 Foco · 5 due · 20 new". Switching the chip off drills the whole topic. Both the drills and the Daily record answers into the strength stats.
- **The habit loop** (1.18): `Store.today()` is the calendar day in **local** time (pre-1.18 it was UTC; every day-stamped record — `t`, `i`, intake — uses it, so a Rio learner at 22:00 is still on today). `recordAnswer` also bumps the **day log** (`days`: local day → answers, both right and wrong, drills and Daily alike); `Store.streak()` counts consecutive practised days back from today, or from yesterday while today is undone, forgiving a single missed day (two in a row break it; `atRisk` = the grace day is spent). Every drill answer stamps its tab in `drilled` (topic → last day) — the Daily does not, so one subjunctive card there doesn't take the tab up — and a tab is **active** while that stamp is within `ACTIVE_DAYS` (30). **Today's goal** (`Quiz.todayGoal()`, rendered by `renderGoal()` in app.js as the ring + 🔥 in the top bar, hidden until the first drill answer ever) asks for **at most `GOAL_MAX` (30, pref `goalMax`) cards a day**: the **reviews owed** (due + missed) over the active tabs first, then **up to `GOAL_NEW` (10, pref `goalNew`) new cards in total** if there is room — never the per-tab intake summed over every tab, which made twelve drilled tabs a 290-card day, and never a whole backlog of misses at once (1.19.2). Reviews beyond the ceiling are `waiting`: shown in the tooltip and the "Daily goal done! N reviews still wait" state, not owed; "Tudo em dia" is reserved for a day nothing is owed. Both allowances are spent by what was got right today (`Store.doneToday`, `Store.newDoneToday`) and handed to tabs in registry order. The unseen siblings a missed verb form drags into the shaky tier are `plan.dragged` — new cards for the goal, shaky-tier cards for the deck. `focoPlan()` is the pure half of the deck builder, `focusDeck()` the half that stamps intake; the goal is set against the cards answered right today; the tabs encode a level, so a beginner's goal never includes the subjunctive and a graduated tab leaves it after a quiet month. Tapping the ring goes to the fullest tab; the done and empty-Foco screens end with the same "Still today: Passado 12" tab links or "Tudo em dia por hoje!" + streak. Both sections sync (`days` and `drilled` merge by the higher value). Strings: `goal*`/`streak*` in `APP_STR` (app.js), `todayStill`/`todayCaughtUp`/`streakDays`/`streakDay` in `QUIZ_STRINGS`.
- **Tiers and graduation** (1.19): every drill tab in the three registries carries `tier` 1–3 (Iniciante / Intermediário / Avançado; names in `APP_STR.tierNames`). Root: Presente, Nouns, Numbers, Glossary = 1 · Passado, Imperfeito, Pronominais, Adjectives, Adverbs, Connecting = 2 · Subjuntivo, Sentences = 3. The tier does two things only: the **learner title** by the flame (`learnerTier()` in app.js — the highest tier among tabs that are active or graduated, so an advanced learner who skipped Presente is Avançado at once) and the order of the "next tab" nudge. **Nothing is locked.** Since 1.20 the tab strip is stacked by tier (Browse · tier 1 · tier 2 · tier 3 · Daily; the same inside `/noruegues/`, whose default tab is therefore Frases), and since 1.20.2 a `.tier-label` caption (INICIANTE / INTERMEDIÁRIO / AVANÇADO, inked green / yellow / blue, `aria-hidden`) opens each tier's run in `renderTabs()` — the Daily's seeded pick depends on the registry order and changed once with it, accepted. A tab **graduates** (`Store.graduation`: ≥ `GRADUATE_SHARE` 80% of its cards at review level ≥ `GRADUATE_LEVEL` 3 and not shaky) — the 🎓 replacing its % follows the live condition (a miss lifts the cap), while the `graduated` stamp (topic → day, synced by the earliest day, cleared by a topic reset) only makes the celebration happen once: `checkGraduation()` in quiz.js after a correct answer — confetti + a toast naming `nextTopic()` (first ungraduated tab of the same tier in tab order, then higher tiers, then any).
- **Milestones** (1.21, `js/milestones.js`): ~15 definitions — first card, 100/500/1,000 mastered, 7/30/100-day streak, a card at the top review level, first graduation, each tier complete, a whole verb (a lexeme with ≥ 4 forms all at level ≥ 3 — none in `/ingles/`), a perfect Daily, 7 Dailies running. Each has an optional `applies()` so a subpage lists only what it can reach. `Milestones.check()` runs inside `renderGoal()` (i.e. after every answer and on every route) and stamps `milestones` (id → day, synced by the earliest day); a marker once earned stays earned even if the condition lapses. Newly earned ones toast. Wording via `APP_STRINGS.milestones` (`{ id: [label, desc] }`). **The goal ring opens the progress sheet** (`renderSheet()` in app.js, `#sheet` in every shell): the learner's tier + streak, today's goal with tab links, a 12-week **activity heatmap** (1.22, `heatmapHtml()`: Monday-first week columns from the day log, levels 0 / 1–9 / 10–29 / 30–59 / 60+ answers, today outlined, future days blank), and the milestone grid; `route()` closes it, so a tab link lands on the tab. Esc / backdrop / × close it too.
- **Mic mode** (🎤 Falar chip on every drill tab, pref `mic`, off by default): hands-free loop — the mic listens (Web Speech API `SpeechRecognition`, pt-BR, in `js/lib/stt.js`), the recognized speech is auto-submitted through the normal `checkAnswer()`, the answer is read back via TTS, and the deck auto-advances. Recognizer digits are expanded to Portuguese number words (`"20"` → `vinte`, `"3º"` → `terceiro`), and saying "nada" on an empty-gap connecting card counts as the empty answer. The chip renders only where the API exists (Chrome/Edge/Safari — not Firefox); the mic itself needs https or localhost, so from `file://` the feature degrades to a visible "blocked" message. The Daily tab has no mic mode.
- The Daily tab is deterministic from the date: 7 cards, one per topic, 5 attempts each. Finished days go into the permanent `dailyDone` log (YYYYMMDD → first-try count; the 30-day `daily` result window is unchanged and `Store.dailyHistory()` backfills finished days from it). `dailyStreak()` in daily.js is **strict** — consecutive calendar days with a finished Daily, counted from yesterday while today is open — unlike the forgiving drill streak in the top bar; it shows in the Daily header, on the done screen with the first-try distribution (7 down to 0), and in the share string from a 2-day run. `dailyDone` syncs by the higher count.
- **Sync** (⇅ button, `js/lib/sync.js` + `sync-worker/`): pull-merge-push of `{mastered, strength, daily}` keyed by a secret sync code that both apps share via the `fg:syncCode` localStorage key (the /ingles/ app prefixes it on the wire, see that section); other prefs are per-device and per-app on purpose. Merging is conservative (mastered unioned, misses kept, streak = min) so syncing can never falsely graduate a card out of Foco. With `SYNC_URL` empty the whole feature is inert.
