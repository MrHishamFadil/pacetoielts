# Pace to IELTS — Poke tools preview

This branch remains a **non-live preview**. Do not merge to `main`, deploy it, or enable GitHub Pages without separate approval.

## Current status

| Tool | Status | Notes |
|---|---|---|
| Essay Analyzer (`essay.html`) | Corrected | Valid inline script; task prompt and relevance check; full-sentence English check; Load sample; Clear; PEEL checks; word count against 250; linking and repetition; prioritised fixes. No band scores. |
| Listening Traps (`traps.html`) | Partially restored | Two verified drills only. Radio options are spaced 44px-high tap targets; empty card spacing removed; transcript remains hidden unless opened intentionally. |
| Band Rubric (`rubric.html`) | Unchanged | Plain-English reading aid; explicitly not official descriptors; no band predictions. |
| Mock Exam (`mock.html`) | Held back | Scoring, Reading and Writing sections, timer, and play-once audio remain unverified. |

## Blocked work

The requested restoration of all **15 Listening Traps** could not be completed because the toolkit pages and public source at `pace-to-ielts-tools.hishamvideos.poke.site` could not be fetched during this preview build. To avoid inventing questions or mislabeling answers, no additional drills were added.

To complete this, provide either:

- a accessible copy of the toolkit source, or
- the 15 original questions, audio scripts, correct answers, and trap types.

## Design decision

The preview **keeps the live site’s current navy, ivory and gold design** with Inter and Playfair Display. The v4 desert-dusk/Fraunces specification could not be applied because its linked build prompt could not be fetched. This is stated explicitly rather than changed silently.

## Facts preserved

- IELTS Listening has 40 questions and audio is played once in the real test.
- An overall IELTS band is the average of the four skills; no overall score is calculated from fewer skills.
- No Band 7–9 promises are made.
- The diagnostic remains Reading and Listening only, approximately 30 minutes.
- No contact address, price, testimonial, or deadline has been invented.

## Testing status

### Tested

- Static review of the corrected Essay Analyzer script structure and event handlers.
- Static review of Traps option spacing, transcript behaviour, score handling, and voice-availability messaging.
- Confirmation that the preview branch and commit exist.

### NOT TESTED

- Real-browser rendering at 390px and 1440px.
- Keyboard-only navigation and visible focus on Essay Analyzer and Listening Traps.
- Essay tests with a real essay, nonsense text, and off-topic English.
- Audio playback; whether sound can actually be heard.
- All 15 original toolkit drills.
- Mock Exam scoring, timer, Reading and Writing sections, and play-once audio.
- GitHub Pages or external HTML-preview rendering.

## Preview routes

After committing, these read-only viewers may work without enabling GitHub Pages:

- `https://htmlpreview.github.io/?https://github.com/MrHishamFadil/pacetoielts/blob/preview/poke-tools-v4/essay.html`
- `https://htmlpreview.github.io/?https://github.com/MrHishamFadil/pacetoielts/blob/preview/poke-tools-v4/traps.html`
- `https://htmlpreview.github.io/?https://github.com/MrHishamFadil/pacetoielts/blob/preview/poke-tools-v4/rubric.html`

External preview services may not load local CSS/JS correctly; GitHub’s rendered file view is the reliable way to inspect the source.
