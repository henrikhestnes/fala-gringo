# App review implementation — v1.24

What the September 2026 review pass changed and why. The durable description of how things work is in `CLAUDE.md`; this note is the changelog with reasons. 1.24.0 shipped everything below plus a heavier sync design; 1.24.1 rolled that part back the same day (see the last section).

## Persistence and sync

| Problem | Fix |
| --- | --- |
| A stored blob with one unknown field could wipe the learner's progress on the next save (an earlier 1.24 draft) | `ProgressState.clean()` coerces and strips instead of rejecting; `save()` never writes over a blob the store could not read; an unparseable blob is quarantined under `<key>:bad:<time>` |
| A stale in-memory tab could overwrite a newer miss or reset written by another tab | Read-before-mutate: every mutation folds the disk in first; the `storage` event covers the idle case |
| A reset on one device was undone by another device's stale snapshot | `resets` are generations; a side on an older generation drops what it wrote *before* the reset (records carry an event stamp `u`) and keeps what it did afterwards |
| Sync pushes silently failed once the blob passed 64 KiB (`keepalive` cap) and the worker rejected anything over 128 KB | No `keepalive`; worker cap 1 MiB |
| Spurious "synced" toast and redundant PUT because merge output had another key order | Comparisons use `ProgressState.stable()` (sorted keys) |
| A newer client's blob would be stripped and pushed back by an older client | Older client pauses ("reload to update"), pulls and pushes nothing; polls every 10 min |
| No backup with sync off | Settings sheet: export/import (merge, or restore past an accidental reset) |
| Streak forgave every isolated gap (alternate days = endless streak) | One grace day per run |
| Verify hits never spent the new-card allowance | `f` = first direct correct day; `newDoneToday` reads it |
| Implied confirmations counted as answers, inflated the day log and closed the goal early | Implied hits reset the review clock only |
| A replayed Daily could lower a finished score; a mid-day deploy scrambled a half-done Daily | `setDailyDone` keeps the max; Daily records carry a card manifest and merge by identity; a finished pre-manifest record is adopted as finished |

## Engine, UI and accessibility

- Review level advances only on a *due* confirmation; early or same-day practice neither climbs nor postpones the clock. Before, drilling with Foco off every day pushed cards to the 120-day interval within a week without a single spaced test.
- TTS: an empty voice list speaks with the utterance language (normal before `voiceschanged` and in iOS home-screen PWAs); a populated list must contain pt-BR for Portuguese (pt-PT and bare pt refused), same-family fallback for English/Norwegian (`no`→`nb`); the missing-voice notice appears once a session.
- The mic can no longer resume against a stale drill deck: `Quiz.unmount()` on non-quiz tabs, `resumeMic()` checks the mounted topic.
- Tabs: roving tabindex, `aria-controls`/`tabpanel`, Home/End; dialogs: focus entry, Tab trap, Esc, focus returned to the opening button (or to the tab a sheet link navigated to); `inert` background; labelled answer input with a live feedback region; reduced-motion covers every animation; contrast ≥ 4.5:1 for `--text-3` in both themes and for the active tab.
- Settings sheet (⚙): daily goal limits, per-topic intake, backup export/import. All new strings are `APP_STR`/`QUIZ_STRINGS` keys with Portuguese values in both subpage shells, including the praise/miss words.
- Browse search and lazy conjugation panels; the goal celebration fires once a day; toggling the mic keeps the run; reclaimed implied reviews come next, not last.
- Hyphens normalise to spaces (`terca feira` matches `terça-feira`); spoken-digit expansion keeps the following space; `m500`/`m1000` milestones only list where reachable.
- Root shell is `lang="en"` with `lang="pt-BR"` on Portuguese fragments; subpages carry `og:image`, an apple-touch-icon and their own manifests; the service worker falls back to the app shell for offline navigations, registers with `updateViaCache: 'none'`, and a tappable toast announces a new version; `check.jxa` verifies the CORE list against the shells' script tags.

## Content

- 25 `-eu` forms hinted `-EH-oo` (five had the `-ei` diphthong); a data check now enforces it. Coda `s` before k/p/t and word-final `s` written `sh`, `nh` as `ny`, pre-consonant `l` as `w`, dʒi palatalisation completed, `pode` vs `pôde` distinguished — the same convention across every topic (glossary gained pronunciation hints). `docs/pronunciation-audit.md` has the tables.
- Glosses that were unique by string but not in practice (`tiro`, `deixo`, `escuto`, `curto`, `viver`, `queria`, `pegar`) carry qualifiers on every row; four gloss/example mismatches fixed; the perfeito of `dever` is Browse-only.
- Cross-tab consistency: "from 9 to 5" accepts `5` and `17`; "I called you" accepts the natural `te liguei` forms; `dever de casa` canonical with `lição` accepted; the European `preciso de estudar` is no longer accepted; sentence cards support `alts` (whole alternative sentences).
- Subpages: `were` = `uâr`, `hang` = `rr…`, hang out no longer glossed with `sair`; Norwegian conjunctions grouped as such, V2 word-order tips on `i dag` and `kanskje`, dead `én` alternatives removed; new accepted-answer collision check for `/ingles/`.

## Rolled back in 1.24.1

1.24.0 also shipped a revision-checked sync protocol (a Durable Object per code, `If-Match` on every PUT, per-record causal vectors with a per-device actor id) and an onboarding starter with a five-card short session, plus a "Practicing:" prefix on the learner title. All of it was removed the same day: the sync design solved a rare, self-healing race with a second backend and a merge that took three review rounds to get right, and the starter and wording were product changes made by a review pass rather than by the author. The KV worker was redeployed; the Durable Object class was deleted (KV was never written by the interim worker, so nothing was lost).

## Not done (out of scope for a fix pass)

New vocabulary and tabs — a tier-1 tab for `/ingles/`, future with `ir` + infinitive and present continuous for the root app, Norwegian adjectives, clock and days — are content additions and were not attempted.

## Validation

- Six JXA suites (`scripts/*.jxa`), all passing; every runner exits non-zero on a failure.
- `node --test scripts/check-sync.mjs`: the worker handler and the real sync client together (node only, no packages).
- Verb pages regenerated after the pronunciation and gloss corrections; links are extensionless when hosted.
- No native-speaker recording review took place.
