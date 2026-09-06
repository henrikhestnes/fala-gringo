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
```

`verify.html` runs the main data checks in a browser (just open it). There is no build, lint, or package manager; there is no single-test runner — the suites are fast, run them whole.

**Run all suites after any change to `js/` data or logic** (the engine is shared with `/ingles/`, so an engine change can break either app). The checks are the safety net for hand-maintained data.

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
js/progress.js      localStorage (single key `pvs:v1`): mastery, per-card strength (Foco), prefs, daily results
js/conjugate.js     regular-conjugation oracle — used by checks only, not the app
js/checks.js        shared assertions (used by check.jxa and verify.html)
js/app.js           hash router + delegated events
js/version.js       APP_VERSION shown in the footer — bump it in every commit with a user-visible change (patch: fixes/content, minor: feature); the "updated" date comes free from document.lastModified
js/lib/             text.js (normalize/shuffle), tts.js, stt.js (mic-mode speech recognition + spoken-answer matching), fx.js, sync.js (optional cross-device sync)
sync-worker/        Cloudflare Worker + KV backend for sync — deployed separately, see its README
manifest.json, sw.js, icons/   installable PWA — sw.js caches offline, keyed to APP_VERSION
og.png, 404.html    social-share card + not-found page
wrangler.jsonc      config for the git-connected Cloudflare Worker serving the site
                    (static assets; not_found_handling makes it serve 404.html)
ingles/             English-for-Brazilians subpage on the SAME engine — see its section below
scripts/            check.jxa, smoke.jxa (+ smoke-steps.js, dom-stub.js), check-ingles.jxa,
                    smoke-ingles.jxa (+ smoke-ingles-steps.js), generate-verb-pages.jxa,
                    og-image.html + app-icon.html (headless-Chrome sources for og.png/icons/)
verbs/              GENERATED static per-verb pages (SEO) — never edit by hand;
                    re-run `osascript -l JavaScript scripts/generate-verb-pages.jxa`
                    after any change to js/data/verbs.js and commit the output
                    (it also rewrites sitemap.xml and robots.txt in the root)
```

The key design decision: instead of one drill engine per topic (each topic's raw data has a different schema), `js/topics.js` normalises everything into one card shape — `{ id, topic, group, meta, hint, prompt, sub, accepted[], answer, pron, speak, reveal, allowEmpty }` — and `js/quiz.js` drives all of them.

`js/data/verbs.js` is the **source of truth for verb forms** — 124 verbs, forms stored explicitly rather than generated at runtime, so a pronunciation hint hangs off each form. A curated 40-verb core additionally carries the imperfect subjunctive. `js/conjugate.js` exists only to independently verify the regular verbs.

## /ingles/ — Fala Como Gringo, English for Brazilians (subpage)

The inverse product on the same engine, branded **Fala Como Gringo**: a Portuguese speaker is shown Portuguese and types **American English**. It lives at `/ingles/` and shares `js/quiz.js`, `js/app.js`, `js/progress.js`, `js/lib/` and `css/app.css` verbatim — no forked engine code. The direction flip is entirely configuration, set in an inline `<script>` in `ingles/index.html` **before** the engine loads:

- `window.APP_LANG = 'en-US'` — TTS voice + mic-mode recognizer language (and it disables the Portuguese spoken-digit expansion in `stt.js`).
- `window.APP_STORE_KEY = 'fg-ingles:v1'` — its own localStorage blob; the two apps' progress must never mix.
- `window.APP_SYNC_APP = 'ingles'` — the subpage loads the shared `js/lib/sync.js` too, but this prefix goes in front of the sync code on the wire (`/ingles<code>`), so the unchanged worker stores the blob under a separate KV key (the root app keeps the bare `<code>`). The code itself is **one per device, shared by both apps** through the plain localStorage key `fg:syncCode` (same origin), so turning sync on or off in either app does it for both, while the prefix keeps the two blobs apart on the worker with no backend change. A pre-1.11 per-app `syncCode` pref is migrated into the shared key on first read. The sync prompts/tooltips are Portuguese via `APP_STRINGS` (`sync*` keys, see `STR` in sync.js).
- `window.APP_STRINGS` — Portuguese UI wording for the engine chrome (see `QUIZ_STRINGS` in quiz.js and `APP_STR` in app.js for every overridable key). Card-level text comes from `ingles/js/topics.js`.
- `window.SW_PATH = '../sw.js'` — both apps register the one root service worker; the subpage's files are in its CORE list.

`ingles/js/topics.js` mirrors the root registry contract (`TOPICS`, `topicById`, `topicCards`, `topicGroups`, `allQuizCards`) and normalises into the same card shape. There is no Browse or Daily tab; `app.js` falls back to `TOPICS[0]`.

Conventions for its content (`ingles/js/data/`): everything the learner **reads** is carioca Portuguese (the ⚠️ rule above applies to the UI and glosses); everything the learner **types/hears** is American English. Pronunciation hints are aportuguesadas for Brazilian ears (`had` = `rréd`, English *h* written as carioca *rr*). The no-ambiguous-prompts invariant is mirrored: a `pt` gloss + meta must identify exactly one English answer (`fazer (ação, tarefa)` = do vs `fazer (criar, produzir)` = make), enforced by `scripts/check-ingles.jxa`.

## Correctness invariants (enforced by the checks)

- **No ambiguous prompts.** Hard Mode (the default; labelled "Modo Raiz" in the UI, with Easy Mode as "Modo Nutella") shows no Portuguese at all, so no English prompt may be satisfiable by two different answers. This is why glosses carry qualifiers — `to be (permanent)` vs `to be (temporary)`, `to know (a fact)` vs `to know (a person/place)`. Adding a card means checking its prompt is unique; the checks fail otherwise.
- Every drilled form has a form, meaning, pronunciation, and example.
- Every regular verb matches the conjugation oracle; every verb flagged `irregular` really is irregular.
- Every imperfect-subjunctive form derives from the pretérito perfeito 3pl (drop `-ram`, add `-sse/-sse/-ssemos/-ssem` — a rule with no exceptions), and every subjunctive example contains its form inside a trigger context (`se…`, `como se…`, `queria que…`).
- Every card's canonical answer is among its own accepted answers.
- Answers are compared case-, accent-, and punctuation-insensitively (`js/lib/text.js` `normalize()`); verbs accept the bare form as well as the pronoun-prefixed one.
- `haver` appears in Browse but is deliberately excluded from drills (only 3sg `há`/`houvesse` is live usage) — don't "fix" that.

## Content notes

- Non-verb card content and the hand-written verb pronunciations/examples come from [gjermundbae/portuguese-verb-flashcards](https://github.com/gjermundbae/portuguese-verb-flashcards). The 29 verbs unique to this repo have **generated** pronunciations/examples (348 forms) — worth spot-checking, especially stress placement.
- A wrong answer never clears a card — it returns to the deck until answered correctly. There is no batching: a deck is always the whole topic minus deselected category chips.
- **Foco mode** (🎯 chip on every drill tab, pref `foco` — the abandoned `focus` key is pre-1.3 and ignored, **on by default**): the deck is every card needing work — never answered correctly, "shaky" (missed and not yet re-answered correctly `FOCUS_STREAK` (3) times in a row; on verb topics one shaky form pulls the verb's whole conjugation for that tense into the deck, card ids share a `verb|` prefix), or mastered but unconfirmed for `REVIEW_DAYS` (7) days. Switching the chip off drills the whole topic. Both the drills and the Daily record answers into the strength stats.
- **Mic mode** (🎤 Falar chip on every drill tab, pref `mic`, off by default): hands-free loop — the mic listens (Web Speech API `SpeechRecognition`, pt-BR, in `js/lib/stt.js`), the recognized speech is auto-submitted through the normal `checkAnswer()`, the answer is read back via TTS, and the deck auto-advances. Recognizer digits are expanded to Portuguese number words (`"20"` → `vinte`, `"3º"` → `terceiro`), and saying "nada" on an empty-gap connecting card counts as the empty answer. The chip renders only where the API exists (Chrome/Edge/Safari — not Firefox); the mic itself needs https or localhost, so from `file://` the feature degrades to a visible "blocked" message. The Daily tab has no mic mode.
- The Daily tab is deterministic from the date: 7 cards, one per topic, 5 attempts each.
- **Sync** (⇅ button, `js/lib/sync.js` + `sync-worker/`): pull-merge-push of `{mastered, strength, daily}` keyed by a secret sync code that both apps share via the `fg:syncCode` localStorage key (the /ingles/ app prefixes it on the wire, see that section); other prefs are per-device and per-app on purpose. Merging is conservative (mastered unioned, misses kept, streak = min) so syncing can never falsely graduate a card out of Foco. With `SYNC_URL` empty the whole feature is inert.
