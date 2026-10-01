# Charlie Dallas Lancaster Foundation: website redesign (preview)

A static redesign of [cdlf.uk](https://cdlf.uk) for the Charlie Dallas Lancaster Foundation (registered charity no. 1195207).

This is a **team preview**, not the live site. Both pages carry a `noindex` tag so search engines skip them.

## What's here

| File | What it is |
|---|---|
| `index.html` | Home page |
| `help.html` | "Need help now?" page. It works with JavaScript off, because it's the landing page for the QR codes on the support boards. |
| `assets/` | Photos (WebP, up to 3 sizes each), logo, partner logos and icons |
| `site-audit.md` | Pre-launch audit, with what's fixed and what's on hold |

No build step. It's plain HTML, CSS and JavaScript. GSAP is loaded from cdnjs, and fonts from Google Fonts.

## Run it locally
Open the folder with any static file server, for example:

```bash
npx serve .
```

## Before launch
- Remove the `noindex` meta tag from both pages.
- Finish the items marked "on hold" in `site-audit.md`:
  - social sharing tags and image
  - newsletter form connection
  - canonical URLs and page title
  - `sitemap.xml` and `robots.txt`
  - structured data and FAQ
- Point the menu links at the new pages as each one is built. They currently go to the existing cdlf.uk pages.
