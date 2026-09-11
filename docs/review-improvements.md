# App review implementation — v1.24.0

All changes live in the `review/app-improvements` worktree. No site or backend has been deployed. This note records what changed and why; the durable description of how things work is in `CLAUDE.md`.

## Persistence and sync

| Problem | Fix |
| --- | --- |
| Lost updates: blind KV `PUT`s, last writer wins | Durable Object per code, `If-Match` revision on every write, 412 → re-merge and retry (`sync-worker/worker.js`, `js/lib/sync.js`) |
| Old misses / resets coming back through a merge | Records carry an event stamp `u` and a per-**device** causal vector `v`; `resets` are generations. A side on an older generation drops only what it wrote *before* the reset (`js/lib/state.js`) |
| A stored blob with one unknown field wiped the learner's progress on the next save (earlier 1.24 draft) | `ProgressState.clean()` coerces and strips instead of rejecting; `save()` never writes over a blob the store could not read; an unparseable blob is quarantined under `<key>:bad:<time>` |
| Vectors grew by one actor per page load (blob past the 1 MB cap within months) | One stable device id (`fg:device`); vectors capped at 8 actors as a safety net |
| Per-tab journals (six full-blob writes per answer, orphan keys from killed tabs) | Dropped. Read-before-mutate plus the `storage` event cover the real race; leftover `:tab:` keys are folded in and removed |
| KV import persisted an empty read (eventually-consistent KV could lose the last pre-upgrade minute); a malformed legacy value failed the code forever | Empty reads are not stored; a value served later is still imported; malformed data is cleaned |
| Spurious "synced" toast and redundant PUT because merge output had another key order | Comparisons use `ProgressState.stable()` (sorted keys) |
| A newer client's blob would be stripped and pushed back by an older client | Older client pauses ("reload to update"), pulls and pushes nothing; polls every 10 min |
| Flush on close removed | A hidden tab attempts one GET + conditional PUT (harmless if cut short) |
| Backup could not restore after an accidental reset | `Store.importBackup(raw, 'restore')` re-stamps the file's records; a checkbox in the settings sheet |
| Streak forgave every isolated gap (alternate days = endless streak) | One grace day per run |
| Verify hits never spent the new-card allowance | `f` = first direct correct day; `newDoneToday` reads it |
| Implied confirmations counted as answers, inflated the day log and closed the goal early | Implied hits reset the review clock only |
| A replayed Daily could lower a finished score | `setDailyDone` keeps the max; a finished pre-v2 record is adopted as finished |

## Engine, UI and accessibility

- Review level advances only on a *due* confirmation; early or same-day practice neither climbs nor postpones the clock. `CLAUDE.md` describes the record shape.
- TTS: an empty voice list speaks with the utterance language (normal before `voiceschanged` and in iOS home-screen PWAs); a populated list must contain pt-BR for Portuguese (pt-PT and bare pt refused), same-family fallback for English/Norwegian (`no`→`nb`); the missing-voice notice appears once a session.
- The mic can no longer resume against a stale drill deck: `Quiz.unmount()` on non-quiz tabs, `resumeMic()` checks the mounted topic.
- Tabs: roving tabindex, `aria-controls`/`tabpanel`, Home/End; dialogs: focus entry, Tab trap, Esc, focus returned to the opening button (or to the tab a sheet link navigated to); `inert` background; labelled answer input with a live feedback region; reduced-motion covers every animation; contrast ≥ 4.5:1 for `--text-3` in both themes and for the active tab.
- Settings sheet (⚙): daily goal limits, per-topic intake, backup export/import (merge or restore). All new strings are `APP_STR`/`QUIZ_STRINGS` keys with Portuguese values in both subpage shells, including the praise/miss words.
- Short practice (five cards) from the starter — shown only to a newcomer — with a "continue with the full deck" action; Browse search and lazy conjugation panels; the goal celebration fires once a day; toggling the mic keeps the run; reclaimed implied reviews come next, not last.
- Hyphens normalise to spaces (`terca feira` matches `terça-feira`); spoken-digit expansion keeps the following space; `m500`/`m1000` milestones only list where reachable.
- Root shell is `lang="en"` with `lang="pt-BR"` on Portuguese fragments; subpages carry `og:image`, an apple-touch-icon and their own manifests; the service worker falls back to the app shell for offline navigations, registers with `updateViaCache: 'none'`, and a tappable toast announces a new version; `check.jxa` verifies the CORE list against the shells' script tags.

## Content

- 25 `-eu` forms hinted `-EH-oo` (five had the `-ei` diphthong); a data check now enforces it. Coda `s` before k/p/t and word-final `s` written `sh`, `nh` as `ny`, pre-consonant `l` as `w`, dʒi palatalisation completed, `pode` vs `pôde` distinguished — the same convention across every topic (glossary gained pronunciation hints). `docs/pronunciation-audit.md` has the tables.
- Glosses that were unique by string but not in practice (`tiro`, `deixo`, `escuto`, `curto`, `viver`, `queria`, `pegar`) carry qualifiers on every row; four gloss/example mismatches fixed; the perfeito of `dever` is Browse-only.
- Cross-tab consistency: "from 9 to 5" accepts `5` and `17`; "I called you" accepts the natural `te liguei` forms; `dever de casa` canonical with `lição` accepted; the European `preciso de estudar` is no longer accepted; sentence cards support `alts` (whole alternative sentences).
- Subpages: `were` = `uâr`, `hang` = `rr…`, hang out no longer glossed with `sair`; Norwegian conjunctions grouped as such, V2 word-order tips on `i dag` and `kanskje`, dead `én` alternatives removed; new accepted-answer collision check for `/ingles/`.

## Not done (out of scope for a fix pass)

New vocabulary and tabs — a tier-1 tab for `/ingles/`, future with `ir` + infinitive and present continuous for the root app, Norwegian adjectives, clock and days — are content additions and were not attempted.

## Validation

- Six JXA suites: check 26 · smoke 89 · check-ingles 10 · smoke-ingles 35 · check-noruegues 13 · smoke-noruegues 36, all passing; every runner exits non-zero on a failure.
- `node --test scripts/check-sync.mjs`: 10 tests over the real worker and sync client (node only, no packages).
- Verb pages regenerated (`scripts/generate-verb-pages.jxa`) after the pronunciation and gloss corrections; links are extensionless when hosted.
- No native-speaker recording review and no production Cloudflare deployment took place. Rollout order and its one timing caveat are in `sync-worker/README.md`.
