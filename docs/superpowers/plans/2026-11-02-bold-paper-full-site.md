# Bold Paper full-site implementation plan

Goal: Extend the approved Bold Paper direction to the full static site on a preview branch only.

Architecture: Shared bold-site.css and bold-site.js provide consistent navigation, footer, controls and surfaces. bold-home.css contains the approved artwork layout. Existing auth, assessment, progress and Firestore content scripts are preserved byte-for-byte.

Constraints: No main merge, deploy, Pages configuration, database changes or new claims. Retain info@pacetoielts.com. Use system fonts and original inline SVG artwork.

- [x] Inventory 44 HTML pages and inspect dynamic content boundaries.
- [x] Create branch from design/ielts-bold-paper.
- [x] Apply a keyboard-operable shared header/footer and theme stylesheet to all 44 pages.
- [x] Build the complete homepage around approved copy, artwork, four skill links, learning steps and contact email.
- [ ] Check relative links, script preservation and responsive rendering at 390, 768 and 1440px.
- [ ] Report preview-host authentication limits; do not claim logged-in assessment verification.
