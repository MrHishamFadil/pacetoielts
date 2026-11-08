# Source regression checks

No build step or production dependency is added. Requires Node.js and JSDOM installed **outside** the repository:

```sh
npm install --prefix /tmp/pti-test-deps jsdom@31.0.0
NODE_PATH=/tmp/pti-test-deps/node_modules node tests/confirmed-fixes.cjs
```

Tests execute the real source functions with an isolated DOM, synthetic identities/documents, mocked Firebase responses, denied/malformed storage, corrupt recording data and menu events. They make no production writes. Valid base64 is not proof of playable media; playback and microphone hardware are not tested. Auth tests verify client rendering/guards, not deployed authorization.

Grading changes narrowly preserve word boundaries and explicit time-of-day qualifiers while retaining existing optional-key/number alternatives. This is not a complete IELTS scoring engine or question-specific word-limit validator. Official word-limit guidance: https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening . No learning content was rewritten.
