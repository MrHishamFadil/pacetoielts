# Pace to IELTS — Poke tools preview

This branch is a **non-live preview**. It must not be merged to `main` or deployed until separately approved.

## Added

| Tool | Status | Notes |
|---|---|---|
| Essay Analyzer (`essay.html`) | Added | Structural feedback only: paragraph organisation, PEEL-style checks, word count, linking and repetition. No band scores. Off-topic or overly repetitive input now produces an appropriate message. |
| Listening Traps (`traps.html`) | Added | Practice mode, replay allowed. Transcript is hidden behind “Show script”. Responsive card layout. Browser speech availability is checked; two voices are used when available. Sample wording was made unambiguous. |
| Band Rubric (`rubric.html`) | Added | Plain-English reading aid for the four Writing criteria. Explicitly not official descriptors and not a band predictor. |
| Mock Exam (`mock.html`) | Held back | Scoring, Reading and Writing sections, timer, and play-once audio were not independently verified. |

## Facts preserved

- IELTS Listening has 40 questions and the audio is played once in the real test.
- An overall IELTS band is the average of the four skills; no overall score is calculated from fewer skills.
- Example scores are labelled as examples.
- No Band 7–9 promises are made.
- The existing diagnostic remains Reading and Listening only, approximately 30 minutes.

## Not verified

- Real-browser rendering at 390px and 1440px.
- Keyboard-only navigation and focus order.
- Speech-synthesis behaviour across browsers and devices.
- Audio playback, timer behaviour, mock-exam scoring, and play-once enforcement.
- GitHub Pages preview rendering.

## Next step

Review the branch files. Do not merge or enable Pages for this branch until you approve the preview and the remaining browser testing is complete.
