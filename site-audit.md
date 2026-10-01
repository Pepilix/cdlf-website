# CDLF site audit

Pages audited: `index.html` (home) and `help.html` (Need help).
Date: 1 October 2026. Checked in the browser at 1440px, 375px and 320px wide, plus link checks against the live sites.
Status: findings only. Nothing has been changed yet.

Severity: **High** = fix before launch. **Medium** = should fix. **Low** = nice to have.

---

## Summary

| # | Check | Result | Severity |
|---|---|---|---|
| 1 | Vercel.app / preview domain | None found. Two launch-related gaps (see notes) | Medium |
| 2 | Generic page titles | Home title is brand-only, with no keywords | Medium |
| 3 | Default favicon | Not default, but uses a non-square logo (looks squashed); no Apple touch icon | Low |
| 4 | Open Graph image | Present but uses a relative path, so social sites can't load it; no other OG or Twitter tags | High |
| 5 | Canonical URLs | Missing on both pages | Medium |
| 6 | H1 structure | Valid: one H1 per page, no skipped levels. The H1 is brand-only and styled as a small label | Low |
| 7 | Alt text | All images have alt text. Decorative ones are correctly empty | Pass |
| 8 | sitemap.xml / robots.txt | Both missing (404) | Medium |
| 9 | Console errors | None on load or scroll. One browser warning when "Watch with sound" opens | Low |
| 10 | Leftover console.logs | None | Pass |
| 11 | Exposed source maps | None in our code or the CDN libraries | Pass |
| 12 | Massive JS bundles | Three.js is ~255 KB compressed (~1.2 MB unminified) to draw one disc | High |
| 13 | Broken mobile layouts | Fine at 375px+. At 320px the menu button sticks out of the header bar | Medium |
| 14 | Inconsistent UI spacing | Section padding uses 5 different values; two different side edges | Low |
| 15 | Dead buttons and links | All links live. The newsletter "Subscribe" shows a success message but sends nothing | High |
| 16 | AEO / SEO | No structured data (charity schema), no Q&A content, thin title and H1 | Medium |
| 17 | Page speed | Heavy first load: about 2 MB+ including the YouTube player | High |
| 18 | Mobile usage | Good tap targets and text sizes; autoplaying video costs mobile data | Medium |

---

## Details and proposed fixes

### 1. Preview domain (Medium)
- **Found:** no `vercel.app`, `netlify`, `localhost` or other preview addresses in the code.
- **Gap 1:** the menu, Donate and footer links point at the *current* WordPress pages on cdlf.uk. That's fine while those pages exist, but they need updating as each new page is built.
- **Gap 2:** no live domain is set anywhere, so canonical and OG URLs (items 4 and 5) have nothing to point at.
- **Fix:** add a single site address, assumed to be `https://cdlf.uk`, and use it for the canonical, OG and sitemap URLs.

### 2. Page titles (Medium)
- **Home:** `Charlie Dallas Lancaster Foundation` (brand only).
- **Help:** `Need help now? | Charlie Dallas Lancaster Foundation` (good).
- **Fix:** change the home title to something like `Charlie Dallas Lancaster Foundation | Mental health and suicide prevention charity, York`. That's about 60 characters, and it tells searchers what the charity does.

### 3. Favicon (Low)
- **Found:** `assets/logo.png` (260×196, not square) is used as the favicon, so browsers squash it. There's no `apple-touch-icon` and no `/favicon.ico` (404).
- **Fix:** make square icons from the logo disc and lettering: 32px, 180px (Apple) and 512px. Add a `favicon.ico` and a web manifest.

### 4. Open Graph / social sharing (High)
- **Found:** `<meta property="og:image" content="assets/logo.png">` uses a relative path, so Facebook and WhatsApp can't load it. There's no `og:title`, `og:description`, `og:url` or `twitter:card`, and help.html has none at all.
- **Impact:** shares from Facebook and Instagram are the main way donors arrive, according to the brief, and they'll show a blank or random preview.
- **Fix:** add a full OG and Twitter set to both pages. Use a proper 1200×630 share image (logo disc on warm white, or the York Minster walk photo with the logo) at an absolute URL.

### 5. Canonical URLs (Medium)
- **Found:** no `<link rel="canonical">` on either page.
- **Fix:** add `https://cdlf.uk/` and `https://cdlf.uk/help/` (or `/help.html`, whichever the final URL structure uses).

### 6. H1 structure (Low)
- **Found:** structurally sound. Each page has one H1, and the levels run H1 → H2 → H3 with no skips.
- **Home H1:** "Charlie Dallas Lancaster Foundation", styled as a small grey label. Charlie's quote is the visual headline.
- **Suggestion (optional):** keep the look but make the H1 more descriptive for search and assistants. For example, "Charlie Dallas Lancaster Foundation: supporting mental health and suicide prevention in York and North Yorkshire", with the second part visually small or hidden.

### 7. Alt text (Pass)
- Every `<img>` has an alt attribute. The three empty ones are deliberately decorative: the header logo inside a labelled link, the mobile-menu logo, and the video poster.
- **Minor:** the six partner logos have no width/height attributes, which can cause a small layout jump as they load. **Fix:** add the dimensions.

### 8. sitemap.xml / robots.txt (Medium)
- **Found:** both return 404.
- **Fix:** add a `sitemap.xml` listing the live pages, and a `robots.txt` that allows crawling and points to the sitemap.

### 9. Console errors (Low)
- **Clean:** a fresh load and a full scroll produce no errors or warnings.
- **One warning:** when "Watch with sound" opens, the browser warns that the player's `allow` setting overrides `allowfullscreen`. It's harmless.
- **Fix:** remove the redundant `allowFullscreen` line.

### 10. Leftover console.logs (Pass)
None found in either page.

### 11. Source maps (Pass)
No `sourceMappingURL` references in our code or in the GSAP and Three.js CDN files we load.

### 12. JS bundle size (High)

| Script | Compressed |
|---|---|
| three.module.js (full, unminified build) | ~255 KB |
| gsap + ScrollTrigger + SplitText | ~45 KB |

- **Problem:** Three.js is the whole 3D engine, loaded to draw one painted disc.
- **Fix option A (recommended):** rewrite the disc with plain WebGL (the same shader, about 3 KB, no library). It looks identical, and this saves ~250 KB.
- **Fix option B:** switch to `three.module.min.js` (~166 KB). That's smaller but still large for one disc.
- **Note:** you asked for Three.js specifically. Option A drops the library but keeps the effect. Your call.

### 13. Mobile layouts (Medium)
- **375px and up:** no horizontal scroll, the header fits, the montage has no gaps, and the crisis pop-up and help page are good.
- **320px (iPhone SE 1st gen and small Androids):** the menu button sits about 11px outside the rounded header bar.
- **Fix:** below 360px, shrink the header logo and button padding a little more, or show "Help" instead of "Need help now?".

### 14. Spacing consistency (Low)
- **Vertical:** section padding varies: hero 96/128, mission 144, impact 144, partners 128, sign-up panel 120, footer 104.
- **Horizontal:** full-width cards (header, film, yellow panel) sit 24px from the edge, while text and grids sit 130px in on a 1440px screen. This is partly deliberate, as the cards are meant to be wider, but there are two different max widths (1400 vs 1280).
- **Fix:** move to one spacing scale with three section sizes (e.g. 96 / 128 / 160 on desktop), and line the card edges up with the content grid or keep a single deliberate step.

### 15. Dead buttons and links (High)
- **All live:** every external link returned a page:
  - cdlf.uk pages
  - JustGiving
  - Strava (club now titled "CDLF MILE A LIFE 2026")
  - all six partner charities
  - Samaritans, Shout, CALM, Staying Safe
  - Instagram
  - YouTube
- **Check by hand:** Menfulness and Facebook block automated checks. Menfulness loaded fine in the browser, and Facebook needs a manual check.
- **Dead button:** the **Subscribe** form says "Thank you. You are on the list." but sends the address nowhere. Supporters would think they've signed up.
- **Fix:** connect it to the foundation's mailing-list provider (Mailchimp or similar; we need to know which). Until then, change it to "Email info@cdlf.uk to join the list", or hide it.

### 16. AEO / SEO (Medium)
- **Have:** meta descriptions on both pages, `lang="en-GB"`, semantic headings, tel/sms links, fast static HTML.
- **Missing:**
  - **Structured data (JSON-LD):** `NGO` / `Organization` with the registered charity number 1195207, logo, address area (York), email, social profiles (`sameAs`) and donate URL. This is what AI assistants and Google's knowledge panel read.
  - **Event schema** for A Mile a Life (23 May to 23 June, Strava, virtual/York).
  - **Q&A-style content** that answer engines can quote, e.g. "What is A Mile a Life?", "Where does the money go?", "How do I get help right now?". Most of it exists in the copy. It just needs question-shaped headings or a short FAQ block.
  - **Help page:** a description that mentions the numbers is already there. Adding a `WebPage` and contact-point schema with the crisis numbers would help assistants surface it.
  - **Film:** `VideoObject` schema. The YouTube title is "Why We Do What We Do I 2024 Promo I CDLF".
- **Fix:** add the JSON-LD blocks and a short FAQ section, using existing copy only.

### 17. Page speed (High)
Lighthouse can't run in this environment, so these are measured weights rather than a score.

| First-visit cost | Approx. |
|---|---|
| HTML | 66 KB |
| Fonts (Fraunces upright + italic, Source Sans 3, Caveat Brush) | ~358 KB |
| Scripts (Three.js ~255 + GSAP ~45) | ~300 KB |
| Hero images (lettering, logo, film poster) | ~200 KB |
| YouTube player (loads straight away, as the film sits just under the hero) | ~1 MB+ |
| **Total before scrolling** | **~2 MB+** |

The other issues:
- **Hidden quote:** the hero quote stays hidden until the web fonts load, then writes itself in over about 5 seconds. That's lovely, but on slow phones the main headline appears late.
- **Image formats:** all photos are JPEG/PNG at a single size. The brief asks for WebP/AVIF at three sizes with `srcset`.

The fixes, biggest win first:
1. Drop Three.js for plain WebGL (−250 KB).
2. Remove the Fraunces italic file, as only the date line uses it (−118 KB). Limit the Fraunces axes too.
3. Load the YouTube loop only once the visitor scrolls or a few seconds after load, and skip it on mobile data / Save-Data (−1 MB on first paint).
4. Convert photos to WebP/AVIF with 3 sizes plus `srcset`.
5. Show the quote straight away if fonts haven't loaded within ~1s, so the writing effect never delays the content.
6. Preload the key fonts and the lettering image.

### 18. Mobile usage (Medium)
- **Good:**
  - tap targets are all at least 44px (inline text links at least 24px)
  - no text under 14px
  - the crisis button is visible in the header at all widths
  - phone numbers are tap-to-call and tap-to-text
- **Concern:** the silent film starts streaming on phones as soon as the page opens, which uses mobile data. The brief's main mobile visitor is someone on 4G, possibly in crisis.
- **Fix:** on phones, show the poster with a play button and only start the loop on tap, or when the device isn't in data-saver mode.

---

## Housekeeping
- **Unused images (~880 KB):** five images are no longer used: `charlie.png` (411 KB), `charlie-2.jpg`, `event-2021.jpg`, `charlie-young.jpg`, `charlie-alexandra.jpg`. They don't slow the page, but they'd be uploaded with it. Keep them for the Charlie's story page or remove them.
- **Brief deviation:** the brief said no autoplay. The film now autoplays at your request, with a pause button and auto-pause when off screen.

## Fix log (1 October 2026)

**Approved and done:**

| Item | What changed |
|---|---|
| 12 JS bundle | Three.js removed. The disc is now one small plain-WebGL shader with the same look. Scripts went from ~300 KB to ~45 KB (GSAP only). |
| 17 Speed: fonts | Fraunces upright only (italic dropped), SOFT fixed at 100, opsz 48–144, weights 340–420. Source Sans 3 italic dropped. The date line is now upright. |
| 17 Speed: hero quote | The quote waits at most 1s for the handwriting font, then simply fades in if it hasn't arrived. The lettering is preloaded. |
| 17/18 Film | Phones and data-saver visitors see the poster and a "Watch the film" button; nothing streams until they tap. On desktop the silent loop starts only after the page has fully loaded. |
| 13 320px header | Below 360px the help button reads "Need help?" (screen readers still hear "Need help now?") and the header tightens. Everything stays inside the bar. |
| Photo formats | All photos are WebP at up to 3 sizes with `srcset`/`sizes`, e.g. the 2022 walk photo went from 369 KB to 24–52 KB. AVIF wasn't possible with the tools available here. |
| 3 Favicon | Square icons made from the logo: `favicon.ico`, 192/512 icons, Apple touch icon, `site.webmanifest`, theme colour. Added to both pages. |
| 6 H1 | The H1 now adds "Supporting mental health and suicide prevention charities across York, North Yorkshire and beyond" in small text under the name. |
| 14 Spacing | Three spacing tokens (`--space-s/m/l`) now drive every section's vertical padding. |
| 7 Partner logos | Width and height added. |
| 9 Console warning | The redundant `allowFullscreen` was removed. |
| Unused images | Moved out of `assets/` into `source-images/`, so they won't be uploaded but aren't lost. This includes the full-size originals the WebP files were made from. |

**Bugs found and fixed while verifying:**
- **Pause button:** it showed even when hidden (the button's display style overrode `hidden`). This affected phones and desktop before the loop started.
- **"SplitText called before fonts loaded" warnings:** the hero quote now splits with its own helper, and the mission sentence waits for all fonts.
- **Screen readers:** they now hear the hero quote as one sentence rather than letter by letter.

**On hold (waiting for info):** 1 preview domain/live URLs, 2 title, 4 OG/social, 5 canonical, 8 sitemap/robots, 15 newsletter form, 16 structured data/FAQ.

## Proposed fix order (for approval)
1. **High:** OG/social tags + share image, newsletter form, Three.js → plain WebGL, YouTube loading on mobile/data, fonts trimmed.
2. **Medium:** title, canonical, sitemap/robots, JSON-LD + short FAQ, 320px header, image formats/srcset.
3. **Low:** favicon set, H1 wording, spacing scale, partner logo dimensions, `allowFullscreen` warning, unused images.
