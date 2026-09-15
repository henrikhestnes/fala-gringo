# Launch analytics

Project: [PostHog EU, 274739](https://eu.posthog.com/project/274739).

`js/analytics-config.js` contains the public, write-only project token. Never
put a personal/project-secret API key in this repository: the entire root is
served as static assets. The SDK loads asynchronously only on the configured
HTTPS production hosts. Emptying the public token disables analytics entirely.
Lessons, progress and offline use work independently of PostHog.

## Events

| Event | Trigger |
|---|---|
| `$pageview` | One document load, including verb reference pages. Tab changes within the app are not page views. |
| `app_opened` | One learning-app document load; reference pages are excluded. |
| `answer_submitted` | One actual submission in a drill or Daily, including wrong answers and near misses. |
| `support_clicked` | Click on the existing Buy me a cafezinho link. This is interest, **not a confirmed purchase**. |

All events carry `app` (`portugues`, `ingles`, `noruegues`), `language`,
`local_day` (`YYYY-MM-DD` on the learner's device), and `page_type`.
Answers also carry `topic`, `practice_mode` (`drill`, `daily`), `input_mode`
(`typed`, `spoken`), and `result` (`correct`, `near`, `wrong`). No answer text,
card prompts, microphone recordings, progress blobs or sync codes are sent.
Automatic click capture, replay, surveys, errors and performance capture are off.
A final property allowlist strips unexpected SDK properties and raw query/hash
data. The SDK uses a random browser identity in localStorage, with no person
profiles or connection to the secret sync code. PostHog necessarily receives
network requests; this is browser-based pseudonymous measurement, not a claim
of zero data collection.

Counting happens in the answer handlers rather than `Store.recordAnswer`, so
sync, backups, imported progress, resets, inferred sibling confirmations, skips
and reveal-only Daily actions cannot manufacture learner activity. The fifth
wrong Daily attempt counts once. The reports derive ten-answer days from events
instead of storing another counter in the learner's synced progress.

## Exclude your own browsing

Open [Turn analytics off](https://falagringo.com/?analytics=off) once in **each
browser** you use for testing. The choice applies to all three languages and
reference pages on that origin. Reload other open tabs before testing.
The footer has the same switch. Re-enable with the footer or
`https://falagringo.com/?analytics=on`.

Local files, localhost, previews and unlisted hosts are excluded automatically.
GPC/Do Not Track signals and storage failures disable analytics. The footer
explains what is counted and lets learners opt out. No outbound analytics
request is required for a lesson to work. Offline activity and blocked scripts
can be missed; clearing browser storage or changing devices creates a new
identity. Campaign labels persist within a browser tab's session, not forever.

## Share links with campaign labels

Example tutor link:

`https://falagringo.com/?utm_source=tutor&utm_medium=referral&utm_campaign=first_learners`

For a reference page:

`https://falagringo.com/verbs/falar?utm_source=instagram&utm_medium=social&utm_campaign=first_learners`

Only `utm_source`, `utm_medium`, and `utm_campaign` are accepted, each 1–80
letters/digits/underscores/hyphens. Use campaign names, never emails or names
of individual learners. Attribution follows a learner from a verb page into
the app in the same tab. Only the external referring domain is recorded.

## Dashboard definitions and recovery

`scripts/setup-posthog.mjs` defines nine reports for each language:

1. Daily unique visitors, including reference pages (30 days).
2. Sources: campaign source, otherwise external referring domain, otherwise direct.
3. Pages visited, grouped by path (not strictly landing pages).
4. First app open for that language → submitted answer within 24 hours.
5. Active browsers (1+ answers), meaningful practice browsers (10+), and answer
   totals, by local calendar date, excluding the current report date.
6. Returning learners after first practice, using PostHog's daily retention view.
7. **First-week target:** 10+ answers on 3+ different local dates, within dates
   0–6 after first practice. Denominator contains only browsers whose first
   answer was at least 7 full days ago. Someone who only opened the app never
   enters this practice-based denominator; report 4 covers that drop-off.
8. Topics actually practised (unique browsers and submitted answers).
9. Support-link interest (unique clickers, not purchases or revenue).

Day thresholds count attempts, not distinct cards or correct answers. Ten is
a measurement choice, not the learner's personalized daily goal. SQL report
windows are explicit in each query and do not inherit a dashboard date picker.
Native day charts use the project's timezone; SQL practice charts use the
learner-local date attached to each answer. Native retention and exact
first-week SQL measure different things. First practice means first **observed**
practice in the retained event history; historical local progress is not uploaded.

Review the exact payloads without a network request:

```sh
node scripts/setup-posthog.mjs --dry-run
```

For API provisioning, supply `POSTHOG_HOST=https://eu.posthog.com`,
`POSTHOG_PROJECT_ID=274739`, and `POSTHOG_PERSONAL_API_KEY` through the process
environment, using an account key scoped to this project with dashboard and
insight read/write plus query read access. Keep it out of shell history and
all files in this served repository. Then:

```sh
node scripts/setup-posthog.mjs --apply
```

The script executes every query to check compatibility before creating any
dashboard. It reuses matching named dashboards and attached insights on rerun,
so a failed connection can be retried without duplicating completed reports.
It does not overwrite an existing report's settings. It prints dashboard links
only after reading back the saved dashboard. It does not change sharing or billing.

## Verification

```sh
node --test scripts/check-analytics.mjs scripts/check-sync.mjs
```

Run the six JXA suites listed in CLAUDE.md after changing shared app logic.
Before calling a release live, verify a real pageview and submitted answer in
PostHog Activity and verify the saved reports load. With zero learners the
charts will be empty; the first-week metric requires seven days of observation.
Do not fabricate events or backfill local progress to make charts look populated.

Future paid offers need explicit offer-view, checkout and server-confirmed
purchase events from the actual payment integration. No payment flow exists in
this app today, so none is represented as live revenue tracking.

Sources: [SDK](https://posthog.com/docs/libraries/js),
[configuration](https://posthog.com/docs/libraries/js/config),
[insights API](https://posthog.com/docs/api/insights),
[dashboards API](https://posthog.com/docs/api/dashboards).
