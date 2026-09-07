# Fala Gringo

*"Fala, gringo!" — the Rio greeting, and exactly what this app makes you do.*

A tool for learning everyday **Brazilian Portuguese** — the spoken carioca register
you actually hear in Rio, not textbook European Portuguese. It is aimed at an
English speaker: you are shown English and type the Portuguese.

Browse 125 verbs with their conjugations across three indicative tenses — plus the
imperfect subjunctive on a 40-verb core — or drill any of eleven topics by typing
the answer.

**Static site, no build step, no dependencies, no network requests.** Open
`index.html` directly from disk or serve the repository root from GitHub Pages.

## Tabs

| Tab | What it is | Cards |
|---|---|---|
| **Browse** | The verb list: tap a word to hide/reveal it, expand a row for all three tenses, tap any form to hear it | 125 verbs |
| **Presente** | Verb drill, present tense | 494 |
| **Passado** | Verb drill, pretérito perfeito | 494 |
| **Imperfeito** | Verb drill, pretérito imperfeito | 494 |
| **Subjuntivo** | Verb drill, imperfeito do subjuntivo — 40 core verbs | 160 |
| **Nouns** | With gender and article | 83 |
| **Adjectives** | With agreement | 53 |
| **Adverbs** | Frequency, manner, place, time | 28 |
| **Connecting** | Prepositions, contractions, demonstratives, articles — fill the gap | 87 |
| **Numbers** | Numbers, weekdays, months, colours | 77 |
| **Glossary** | Everyday expressions | 34 |
| **Sentences** | Full-sentence translation, incl. hypotheticals & wishes | 83 |
| **★ Daily** | 7 cards a day, one per topic, deterministic from the date, 5 attempts each, shareable result | 7 |

2081 quiz cards in total.

### Se eu soubesse… — the imperfect subjunctive (Subjuntivo tab)

*"If only I knew…" — the tense of hindsight, and the feeling of every language
learner.*

The forms are the easy half: for **every** Portuguese verb, regular or irregular, the
imperfect subjunctive derives from the pretérito perfeito 3pl — drop `-ram`, add
`-sse / -sse / -ssemos / -ssem` (falaram → falasse, fizeram → fizesse, foram → fosse).
The data checks verify all 160 stored forms against that rule.

The hard half is knowing **when** to use it, so every gloss and example embeds a
trigger: `se…` hypotheticals, `queria/gostaria que…` past wishes, `como se…` (as if),
`era melhor que…`, `antes que…`. The drill accepts the bare form, `eu falasse`, and
the trigger-prefixed `se/que eu falasse`. The Sentences tab's *Hypotheticals & wishes*
group practices producing whole trigger sentences.

It covers a curated 40-verb core (the verbs you actually reach for in hypotheticals)
rather than all 125 — and `haver` stays out for the same reason it is not drilled
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
- No batching or gating: a deck is always the whole topic, minus any category
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
125 verbs; 1500 forms with all three indicative tenses; every drilled form has a
form, meaning, pronunciation and example; every regular verb matches an independent
conjugation oracle (`js/conjugate.js`); every verb flagged irregular really is;
40 complete subjunctive blocks whose forms all derive from the perfeito 3pl (a rule
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
js/topics.js        registry — normalises all 8 schemas into one card shape
js/quiz.js          the single drill engine, shared by all ten topics
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

The card content for the non-verb topics, and the hand-written verb
pronunciations and example sentences, come from
[gjermundbae/portuguese-verb-flashcards](https://github.com/gjermundbae/portuguese-verb-flashcards),
whose typing-drill format this tool's quiz is modelled on.

The two verb sets were merged into a 124-verb superset (`acontecer` was added later, third person only): 105 from this repo, 95
from theirs, 76 in common. Every shared verb agreed on all three tenses. The 29
verbs only this repo had needed pronunciations and examples written for them
(348 forms), following their Rio-register conventions — **those are generated
content and worth spot-checking**, especially stress placement.
