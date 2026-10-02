# Fala Gringo

*"Fala, gringo!" — the Rio greeting, and exactly what this app makes you do.*

**Live at [falagringo.com](https://falagringo.com)** — free, no account, works offline.

A tool for learning everyday **Brazilian Portuguese** — the spoken carioca register
you actually hear in Rio, not textbook European Portuguese. It is aimed at an
English speaker: you are shown English and type the Portuguese.

Browse 162 verbs with their conjugations across three indicative tenses — plus the
present and imperfect subjunctive on a 58-verb core — or drill any of thirteen topics by typing
the answer.

**Static site, no build step, no required dependencies.** Optional sync and production-only usage analytics run separately from lessons. Open
`index.html` directly from disk or serve the repository root (production is Cloudflare Pages).

## Tabs

| Tab | What it is | Cards |
|---|---|---|
| **Browse** | The verb list: tap a word to hide/reveal it, expand a row for all three tenses, tap any form to hear it | 162 verbs |
| **Presente** | Verb drill, present tense | 638 |
| **Perfeito** | Verb drill, pretérito perfeito | 636 |
| **Imperfeito** | Verb drill, pretérito imperfeito | 637 |
| **Subj. Presente** | Verb drill, presente do subjuntivo — 58 core verbs | 228 |
| **Subj. Imperfeito** | Verb drill, imperfeito do subjuntivo — 58 core verbs | 228 |
| **Nouns** | With gender and article — incl. family, body & mind | 139 |
| **Adjectives** | With agreement | 80 |
| **Adverbs** | Frequency, manner, place, time | 42 |
| **Connecting** | Prepositions, contractions, demonstratives, articles, conjunctions — fill the gap | 96 |
| **Numbers** | Numbers, weekdays, months, colours | 77 |
| **Glossary** | Everyday carioca expressions | 70 |
| **Sentences** | Full-sentence translation — incl. hypotheticals & wishes, real conditions (se + future subjunctive), verb + preposition, opinions | 129 |
| **★ Daily** | 7 cards a day, one per topic, deterministic from the date, 5 attempts each, shareable result | 7 |

3096 quiz cards in total.

### Espero que dê certo — the present subjunctive (Subj. Presente tab)

*"I hope it works out" — the mood of wishes, doubts and everything you want someone
else to do.*

The forms derive from the presente **eu** form: drop the `-o`, add `-e / -e / -emos / -em`
for -ar verbs and `-a / -a / -amos / -am` for the rest (falo → fale, tenho → tenha, faço →
faça, peço → peça), an -ar stem keeping its sound (fico → fique, chego → chegue, começo →
comece). Six verbs have no eu form in `-o` and keep their old forms: ser *seja*, estar
*esteja*, ir *vá*, dar *dê*, saber *saiba*, querer *queira*. The data checks verify all 232
stored forms against that rule.

Every example embeds a trigger: `quero/espero que…`, `tomara que…`, `talvez…`, `é
importante que…`, `não acho que…`, `duvido que…`, `caso…`. The drill accepts the bare
form, `eu fale`, and `que eu fale`. Same 58-verb core as the imperfect below.

### Se eu soubesse… — the imperfect subjunctive (Subj. Imperfeito tab)

*"If only I knew…" — the tense of hindsight, and the feeling of every language
learner.*

The forms are the easy half: for **every** Portuguese verb, regular or irregular, the
imperfect subjunctive derives from the pretérito perfeito 3pl — drop `-ram`, add
`-sse / -sse / -ssemos / -ssem` (falaram → falasse, fizeram → fizesse, foram → fosse).
The data checks verify all 232 stored forms against that rule.

The hard half is knowing **when** to use it, so every gloss and example embeds a
trigger: `se…` hypotheticals, `queria/gostaria que…` past wishes, `como se…` (as if),
`era melhor que…`, `antes que…`. The drill accepts the bare form, `eu falasse`, and
the trigger-prefixed `se/que eu falasse`. The Sentences tab's *Hypotheticals & wishes*
group practices producing whole trigger sentences.

It covers a curated 58-verb core (the verbs you actually reach for in hypotheticals)
rather than all 162 — and `haver` stays out for the same reason it is not drilled
elsewhere: only 3sg `houvesse` is live usage.

## How the drill works

- The prompt is **English**; you type the Portuguese.
- Answers are **case-, accent- and punctuation-insensitive** — `nos falavamos`
  is accepted for `nós falávamos`. For verbs, the bare form works too
  (`falávamos` as well as `nós falávamos`).
- **A wrong answer does not clear the card.** It goes back into the deck and
  returns until you get it right. Getting it wrong reveals the answer, an example
  sentence and the full conjugation table.
- **Every verb has both a written pronunciation and a listen button**, using the
  browser's Brazilian-Portuguese voice.
- With Foco off, a deck is the whole topic, minus any category
  chips you switch off.
- Each tab shows how much of it you have mastered; a card counts as mastered once
  you have answered it correctly. A **reset** link next to the count clears that
  topic's mastery. Mastery, the Hard/Easy choice, the light/dark choice and
  today's Daily result are the only things stored, all under a single
  `localStorage` key (`pvs:v1`).
- **Light and dark themes**, following the system setting unless you override it
  with the toggle in the top bar.

### Hard Mode (the default) and Easy Mode

**Hard Mode** shows no Portuguese at all — the English prompt has to identify the
answer on its own. **Easy Mode** adds the infinitive as a hint chip.

Because Hard Mode is the default, prompt uniqueness is a correctness
requirement, not a nicety: no prompt may be satisfiable by two different answers.
That is enforced mechanically (see below), which is why glosses carry
disambiguating qualifiers — `to be (permanent)` vs `to be (temporary)`,
`to know (a fact)` vs `to know (a person/place)`, `to call (phone)` vs
`to call (by name)`. Where two verbs really are interchangeable in spoken
Brazilian Portuguese (`pôr` / `botar` / `colocar`, `caminhar` / `andar`), both
answers are accepted rather than a false distinction being invented.

`haver` appears in Browse but not in the drills: only `há` ("there is/are") is
live usage, so drilling `hei` / `hão` would teach the wrong thing.

## Checks

Two check suites, neither needing a toolchain:

```sh
osascript -l JavaScript scripts/check.jxa    # data invariants
osascript -l JavaScript scripts/smoke.jxa    # app behaviour, against a DOM stub
```

They use the JavaScriptCore engine bundled with macOS. `verify.html` runs the
same data checks in the browser — just open it.

`scripts/check.jxa` and `verify.html` share `js/checks.js`, which asserts:
162 verbs; 1944 forms with all three indicative tenses; every drilled form has a
form, meaning, pronunciation and example; every regular verb matches an independent
conjugation oracle (`js/conjugate.js`); every verb flagged irregular really is;
58 complete imperfect-subjunctive blocks whose forms all derive from the perfeito 3pl (a rule
with no exceptions, so it verifies irregulars too) and whose examples all contain
their form inside a trigger context; every card's answer is among its own accepted
answers; and **no ambiguous prompts** — identical, distinguished only by word
order, or only partly qualified.

## Layout

```
index.html          shell: top bar, tab strip, <main>
verify.html         data checks in the browser
css/app.css         design tokens + components (light + dark)
js/lib/             text.js (normalize/shuffle), tts.js, fx.js
js/data/*.js        one file per topic
js/topics.js        registry — normalises all 9 schemas into one card shape
js/quiz.js          the single drill engine, shared by all twelve drill topics
js/browse.js        the verb list
js/daily.js         daily challenge
js/progress.js      localStorage: mastery, prefs, daily results
js/conjugate.js     regular-conjugation oracle (checks only)
js/checks.js        shared assertions
js/app.js           hash router + delegated events
scripts/check.jxa   headless data checks
scripts/smoke.jxa   headless app smoke test (+ smoke-steps.js)
```

Classic `<script>` tags rather than ES modules, deliberately: the app then works
opened as a local `file://` as well as over HTTP.

`js/data/verbs.js` is the source of truth for verb forms — they are stored
explicitly rather than generated at runtime, so a pronunciation hint can hang off
each form without drifting.

## Credits

The content, the engine and the typing-drill format are this project's own.
[gjermundbae/portuguese-verb-flashcards](https://github.com/gjermundbae/portuguese-verb-flashcards)
is a sister project built on the same idea; the two verb lists were compared
early on so that neither missed a common verb. The pronunciations and example
sentences for 29 of the verbs (348 forms) are **generated content and worth
spot-checking**, especially stress placement.


## v1.24: settings, backups and safe progress

Search Browse in Portuguese or English; expand a verb to load its conjugations. The gear button opens the daily workload settings and per-language JSON backup export/import (backups never contain the sync code). Storage failures are visible instead of silent.

Review levels now advance only when a review is due; extra practice neither climbs nor postpones the next review. Inferred sibling reviews update their clocks without counting as answers. A reset on one device is not undone by another device's stale snapshot.

The [review notes](docs/review-improvements.md) list every change with its reason, including what was rolled back in 1.24.1. The [pronunciation audit](docs/pronunciation-audit.md) records the corrected hints. The six JXA suites remain dependency-free; `node --test scripts/check-sync.mjs` runs the sync worker and client together with no packages.

## Launch analytics

PostHog measures visits, submitted answers, practice days and return visits across the three languages. The footer offers a browser opt-out. Local development is excluded, and answers/audio/sync codes are never included. See [analytics setup and dashboard definitions](docs/analytics.md).

## License

[MIT](LICENSE).
