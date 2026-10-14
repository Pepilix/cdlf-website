# Charlie Dallas Lancaster Foundation: website redesign (preview)

A static redesign of [cdlf.uk](https://cdlf.uk) for the Charlie Dallas Lancaster Foundation (registered charity no. 1195207).

This is a **team preview**, not the live site. Every page carries a `noindex` tag, so search engines skip it. Canonical and sharing URLs point at the production domain, never at GitHub Pages.

## Pages

| URL | File | Purpose |
|---|---|---|
| `/` | `index.html` | Home: Charlie, the film, ways in, impact, A Mile a Life, partners |
| `/help/` | `help/index.html` | Find mental health support. Works with JavaScript off, because it's the landing page for the QR codes on the support boards. |
| `/corporate-partnerships/` | `corporate-partnerships/index.html` | How businesses can support CDLF, with an enquiry form |
| `/help.html` | `help.html` | Redirect to `/help/`, so earlier preview links keep working |

## Shared code

| File | What it does |
|---|---|
| `assets/site.css` | All shared styles: tokens, header and drop-down menu, buttons, cards, sections, footer, dialogs, forms |
| `assets/site.js` | Header, menu, crisis pop-up, smooth in-page links, film card, enquiry form |
| `index.html` (inline) | Home-only extras: the GSAP animations and the WebGL logo disc |
| `help/index.html` (inline) | Its own small stylesheet, with no web fonts or scripts, so it loads fast |

There's no build step: plain HTML, CSS and JavaScript. GSAP comes from cdnjs and fonts from Google Fonts.

## Production SEO files
- **`robots.txt` and `sitemap.xml`:** written for `https://cdlf.uk/`. On GitHub Pages they sit in a sub-folder, so search engines ignore them there.
- **`assets/og-image.jpg`:** the 1200×630 social sharing image.

## Run it locally

```bash
npx serve .
```

## Before launch
See **[LAUNCH.md](LAUNCH.md)** for:
- placeholders awaiting trustee approval
- facts to confirm
- integrations to connect
- the technical launch steps

The earlier audit is in `site-audit.md`.
