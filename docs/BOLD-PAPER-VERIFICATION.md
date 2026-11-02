# Bold Paper full-site preview — verification

Branch: design/ielts-bold-paper-full-site. No main merge or deployment requested.

Scope: 44 HTML pages use the shared presentation shell. Original auth.js, app.js, hw.js, plan.js and assessment assets are unchanged. Existing design-explorations files remain unchanged.

Static checks: all revised pages retain their existing external script references, plus bold-site.js. All quoted relative href/src file references resolve to repository files. No external font stylesheet is added; legacy Google font links removed from revised HTML. Shared info@pacetoielts.com mailto retained.

Browser checks in Chrome: homepage, Reading, Listening, Writing, Speaking, Diagnostic, Dashboard, Choose your Pace, Privacy and How marking works opened at 390, 768 and 1440 CSS px. Each reported document scrollWidth equal to viewport width. Mobile homepage menu opens by Enter; keyboard focus proceeds to sign-in then navigation (normal DOM order); Escape closes the menu. Four homepage cards point to their corresponding skill files. Desktop and mobile screenshots reviewed for homepage, Reading; signed-out gates render with the new theme.

Limitations: authenticated Firestore content, marking, saved progress, recording and tutor workflows were not tested. session-1 redirects signed-out visitors to index; its protected content was not visually verified. Restyled templates do not establish mailbox delivery. Browser checks are not a complete accessibility or cross-browser audit.

Storage check: repository working-tree payload is about 9.98 MB, not a Cloudflare account storage reading. Actual Pages/R2/dashboard usage needs account evidence.
