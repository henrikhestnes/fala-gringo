# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Fala Gringo** is a study tool for **beginner–intermediate Portuguese** learners: an English speaker is shown English and types the Portuguese. It is a static site — no build step, no dependencies, no network requests. Open `index.html` directly from disk or serve the repo root.

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
osascript -l JavaScript scripts/check.jxa    # data invariants
osascript -l JavaScript scripts/smoke.jxa    # app behaviour, against a DOM stub
```

`verify.html` runs the same data checks in a browser (just open it). There is no build, lint, or package manager; there is no single-test runner — the suites are fast, run them whole.

**Run both suites after any change to `js/` data or logic.** The checks are the safety net for hand-maintained data.

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
js/progress.js      localStorage (single key `pvs:v1`): mastery, prefs, daily results
js/conjugate.js     regular-conjugation oracle — used by checks only, not the app
js/checks.js        shared assertions (used by check.jxa and verify.html)
js/app.js           hash router + delegated events
js/lib/             text.js (normalize/shuffle), tts.js, fx.js
scripts/            check.jxa, smoke.jxa (+ smoke-steps.js)
```

The key design decision: instead of one drill engine per topic (each topic's raw data has a different schema), `js/topics.js` normalises everything into one card shape — `{ id, topic, group, meta, hint, prompt, sub, accepted[], answer, pron, speak, reveal, allowEmpty }` — and `js/quiz.js` drives all of them.

`js/data/verbs.js` is the **source of truth for verb forms** — 124 verbs, forms stored explicitly rather than generated at runtime, so a pronunciation hint hangs off each form. A curated 40-verb core additionally carries the imperfect subjunctive. `js/conjugate.js` exists only to independently verify the regular verbs.

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
- The Daily tab is deterministic from the date: 7 cards, one per topic, 5 attempts each.
