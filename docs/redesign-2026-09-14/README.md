# The Harness Lab redesign — 2026-09-14

The homepage now presents The Harness Lab as a founder-led software and AI automation studio for businesses with manual digital workflows. It replaces package pricing and long technical explanations with three clear service areas, an interactive workflow example, selected work, Spencer's bio, and a short contact form.

## Review

- Production preview: `http://127.0.0.1:4174/` while the local preview server is running.
- `desktop-full.png` and `mobile-full.png`: complete page previews.
- `desktop-hero.png`, `desktop-workflow.png`, `desktop-work.png`, `desktop-about.png`, and `desktop-contact.png`: design details.
- No changes have been published. Source is saved on `codex/workflow-studio-redesign`.

## Design

The existing winged emblem is the focal point, surrounded by slow orbital motion and a restrained particle field. The palette is carbon `#080a0b`, graphite `#101315`, warm white `#f2f0eb`, amber `#e6bf83`, slate `#a6abae`, and soft green `#b3d4b2`. Space Grotesk carries headlines, Spline Sans the body, and Spline Sans Mono the small labels. The layout alternates concise explanations with actual product screenshots. Motion has a pause control and respects reduced-motion preferences.

## Content and provenance

- Spencer supplied his photo, telephone number, both email addresses, project domains, and the fact that he is completely self-taught.
- Portrait copied unchanged from the supplied original. Existing logos and social card are byte-for-byte unchanged. See `asset-integrity.json`.
- TitleDesk screenshots and logo come from the existing TitleDesk storefront source, not a fabricated product mockup. Product copy avoids unverified release, accuracy, or performance claims.
- Wealth & Powers OS, Jayson Powers, its images, and the testimonial excerpt are preserved from the existing homepage. Its description is shorter and does not repeat investment-return claims.
- BrandStreams and APEX.BUILD are included based on Spencer's request and the repositories in his GitHub account. APEX's README identifies `apex-build.dev` and its cloud IDE / multi-agent development scope. No project is presented as a newly verified production deployment.
- GitHub inspected: `spencerandtheteagues/BrandStreams`, `spencerandtheteagues/apex-build-platform`, `spencerandtheteagues/wealth-powers-os`, and the account's repository inventory.

## Verification

- `npm run lint`: passed (the original source had 25 lint errors).
- `npm run build`: passed.
- `npm audit`: zero reported vulnerabilities after reviewed dependency pins; see `dependency-audit.json`.
- Browser verification against the production build: required content, no service prices, links and anchors, three workflow examples, timer cancellation, five image dialogs, keyboard focus restoration, mobile navigation, reduced motion, and no horizontal overflow at 320/390/768/1024/1440 pixels.
- Contact form success/failure tested with intercepted requests; no real email was sent. Existing intake API health endpoint returned `ok: true`. Actual email delivery was not tested.
- All rendered images decode, no browser JavaScript errors, and no failed local assets. See `verification.json`.
- Production files are recorded in `build-sha256.json`.
- `bash -n scripts/publish-pages.sh` and `git diff --check`: passed. The publish script now installs without lifecycle scripts and starts from the current remote `gh-pages` commit, preserving publishing history and rejecting concurrent pushes.

Browser verification uses an already-installed Playwright runtime; no browser test dependency was added to the site. Re-run with `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` pointing to that runtime, then `node scripts/verify-redesign.mjs` against the production preview.

## Separate availability findings

On 2026-09-14, `brandstream.my` returned 200. `title-desk.com` and `apex-build.dev` returned 503; APEX's response included `x-render-routing: suspend`. The TitleDesk domain remains the requested product link. APEX's portfolio card links to its GitHub project. These separate sites have not been changed.

## Publishing after approval

The `.com` site is served from `spencerandtheteagues/praetor-forge-site`, branch `gh-pages`, with `public/CNAME` preserved as `theharnesslab.com`. Source baseline: `1e12bc518c2008d712426a396ffe24b170bdfb27`; publication baseline: `f9494361ea886b4ed34048c67bfc033f1701a4dc`.

Re-fetch before publishing and reconcile any intervening changes. Save source to `main`, then run the reviewed `scripts/publish-pages.sh` after approval. The script performs an ordinary push, never a force push. Confirm live HTML, asset hashes, form UI, links, and responsive rendering after Pages updates.

The `.dev` site is a separate GitHub Pages repository: `THE-HARNESS-LAB/theharnesslab-dev`. Its prepared redirect lives in `/Users/spencerteague/theharnesslab-site-2026-09-14` on branch `codex/unify-harnesslab-domains`. It keeps the `.dev` CNAME and existing assets, points visitors to `.com`, and preserves query strings and section anchors. The redirect was tested with intercepted browser navigation and has not been published. Publish the `.com` experience first, then the `.dev` redirect. Its source baseline is `a1022a6`.
