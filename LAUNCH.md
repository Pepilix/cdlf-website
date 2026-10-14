# Launch checklist

This is everything needed to take the GitHub Pages preview to the live site at **https://cdlf.uk/**.
Updated 14 October 2026, after the full site build.

The preview is still protected: every page carries a `noindex` tag, and nothing has been deployed to cdlf.uk.

Placeholders in the pages are marked in two ways:
- **Visible boxes** with `class="tbc"`, labelled "Placeholder".
- **Comments** containing `PLACEHOLDER` or `To check`.

Search the project for both.

## The site

| Page | URL | Status |
|---|---|---|
| Home | `/` | Done |
| Charlie's story | `/charlies-story/` | Done: story, photos, memories |
| Our impact | `/our-impact/` | Done: needs grants after 2023 (T1) |
| Get involved | `/get-involved/` | Done: includes the donation form |
| Corporate partnerships | `/corporate-partnerships/` | Done |
| A Mile a Life | `/a-mile-a-life/` | Done: includes other events |
| Find support | `/help/` | Done: no JavaScript, QR code landing page |
| About us | `/about/` | Done: team, ambassadors, partners |
| Contact | `/contact/` | Done |

All content comes from cdlf.uk:
- **Text:** About Charlie, Thoughts on Charlie, Our Team, Fundraising, Donate, Beneficiaries, A Mile a Life, and the News posts.
- **Partner descriptions:** the partners' own websites.
- **The Persimmon example:** Persimmon's own article.

Nothing has been invented. Where a fact couldn't be confirmed, it's left out or marked as a placeholder.

---

## 1. Needs trustee approval

| # | Item | Where | Notes |
|---|---|---|---|
| T1 | **Grants after 2023.** | Our impact (`.tbc` box); home and partnerships figures | The grant list covers June 2021 to 2023. The News page says four further donations were made in December 2023, including to R;pple, with no amounts given. Add those and any later grants. Then update the table, the bars, the totals and the date ranges together (comment `IMPACT FIGURES`). |
| T2 | **How donations are used** (the "100%" wording). | Our impact and Home (`.tbc` boxes) | The current site says "Currently, 100% of our proceeds go to the wonderful charities we support." Confirm the exact wording, including whether any running costs are covered separately. |
| T3 | **Fundraising amounts** on Our impact ("Recent fundraising"). | Our impact | Taken from the foundation's own News posts: £24,000 Winter Ball (Nov 2024), £7,296 row (May 2025), £5,000 Persimmon (June 2023), £1,650 JDW Fitness (reported April 2023), £1,500 Barratt Homes (May 2024). They're labelled as money raised, not grants paid. Please check they're accurate and happy to publish. |
| T4 | **Gemma's role.** | About us; footer | The Our Team page lists Gemma as "Charlie's partner" without "Trustee", but the footer lists her as a trustee (from the original brief). Confirm which is right. |
| T5 | **Memories and team text.** | Charlie's story; About us | The memories are the family's and friends' own words, unedited, with long ones shown in a "Read more" panel. Team bios and ambassador quotes are lightly shortened. Ask everyone named to check their own section. |
| T6 | **Victoria's quote** on the partnerships page. | Corporate partnerships | Taken from Persimmon's 2023 article. |
| T7 | **Other business supporters**, with permission. | Corporate partnerships (`.tbc` box) | Persimmon Homes is the only one named. The News page also mentions Barratt Homes, Lester Film Co., Legions Gym and Kyle Ryde, which could be added if the trustees want. |
| T8 | **Sponsorship options and partner recognition.** | Corporate partnerships (`.tbc` box) | None are listed. Add them only once agreed. |

## 2. Facts to confirm

| # | Item | Notes |
|---|---|---|
| F1 | **Photo permissions** | Especially photos showing children and members of the public (A Mile a Life, Charlie's story and the events). |
| F2 | **Photo captions and years** | Walking through York, Charlie's army, Lancaster Samms, #bemorecharlie. In Charlie's story, only people named in the original file names are named (Oliver Newby, John). |
| F3 | **Web address** | All canonical, social sharing and sitemap URLs assume `https://cdlf.uk/`. |
| F4 | **Charity registration body** | The structured data lists 1195207 as a Charity Commission for England and Wales number. |
| F5 | **Local NHS crisis line for York and North Yorkshire** | Not listed, because it couldn't be verified. NHS 111's mental health option is listed instead. |
| F6 | **A replacement helpline for young people after Papyrus** | Childline (verified) is listed for under-19s. |
| F7 | **The News page** | The old site has posts up to 2025, so the original brief's rule ("keep News only if there are posts newer than 2024") applies. Choose either a simple News page, or the Instagram feed on the home page (see I4). The best stories are already used on Our impact and A Mile a Life. |

## 3. Forms and integrations

| # | Item | Current behaviour | Before launch |
|---|---|---|---|
| I1 | **Donation form** (`/get-involved/#donate`) | Rebuilt from the original donate page with the same PayPal account (`info@cdlf.uk`) and settings. One-off payments use PayPal's standard donation, monthly ones a PayPal subscription. Offers £10, £20, £30 or another amount (minimum £1). Preset one-off amounts work without JavaScript. | **A trustee should make one real one-off and one real monthly donation** (for example £1) and confirm both arrive in PayPal. Optionally add thank-you and cancelled pages for PayPal to return people to. |
| I2 | **Contact and corporate enquiry forms** | Each field is checked, then the visitor's own email app opens with the message ready to send to info@cdlf.uk. Both forms say so. | Connect a form service the foundation controls (for example Netlify Forms, Formspree, or the website host's own), point each form's `action` at it, and remove `data-mailto`. |
| I3 | **Mailing list** | No sign-up form; "Stay in touch" links to Instagram and Facebook. | Add a sign-up form with consent wording once the provider is known. |
| I4 | **Instagram feed** | Not built. | Needs a Business or Creator account and a feed service (see the family questions). |
| I5 | **Privacy policy** | Links to the existing page at cdlf.uk/privacy-policy/. | Move it to the new site, and update it to cover the enquiry forms, PayPal, the YouTube embeds and Google Fonts. |

## 4. Technical SEO

| # | Item | Status |
|---|---|---|
| S1 | Unique title and description on every page | Done (checked: no duplicates) |
| S2 | One H1 per page, headings in order | Done (checked on all 9 pages) |
| S3 | Canonical URLs pointing at `https://cdlf.uk/…` | Done. Nothing points at GitHub Pages. |
| S4 | Open Graph and Twitter tags, plus a 1200×630 share image | Done. **Upload `assets/og-image.jpg`** with the site so the absolute URL resolves. |
| S5 | Structured data | Done: NGO and WebSite on the home page; WebPage, AboutPage or ContactPage plus a breadcrumb on each inner page. Check with Google's Rich Results Test after launch. |
| S6 | `sitemap.xml` | Done: all 9 production URLs. |
| S7 | `robots.txt` | Done: allows crawling and points to the sitemap. |
| S8 | `noindex` | **Still on, as instructed.** At launch, remove the line marked `PREVIEW-ONLY` from all nine pages: `index.html`, plus `index.html` inside `charlies-story/`, `our-impact/`, `get-involved/`, `corporate-partnerships/`, `a-mile-a-life/`, `help/`, `about/` and `contact/`. Keep it on `help.html`, which is only a redirect. |
| S9 | 404 page | Not built. Add a simple `404.html` in the site style, with links to Home, Find support and Donate. |
| S10 | Images | WebP at up to three sizes with `srcset`, lazy-loaded below the fold, and alt text on every image. |

## 5. Redirects from the old site (301)

Set these up on the live host, so old links, search results and printed material keep working.

| Old URL | New URL |
|---|---|
| `/about-charlie/` | `/charlies-story/` |
| `/thoughts-on-charlie/` | `/charlies-story/` |
| `/our-team/` | `/about/` |
| `/partners/` | `/about/` |
| `/beneficiaries/` | `/our-impact/` |
| `/fundraising-donate/` | `/get-involved/` |
| `/donate/` | `/get-involved/` |
| `/events/` | `/a-mile-a-life/` |
| `/news/` and each news post | Depends on F7: a new `/news/`, or `/` |
| `/a-mile-a-life/`, `/contact/`, `/help/` | Unchanged; no redirect needed |
| `/privacy-policy/` | Unchanged if moved as-is (I5) |

**`/help/` must keep working.** It's printed as a QR code on 92 support boards.

## 6. Launch day, in order

1. Confirm T1–T8, F1–F7 and I1–I5 above.
2. Remove the `noindex` lines (S8).
3. Deploy the site to the cdlf.uk host, including `robots.txt`, `sitemap.xml` and `assets/og-image.jpg`.
4. Set up the redirects (section 5), and test each old URL, especially `/help/`.
5. Make the test donations (I1) and test both enquiry forms (I2).
6. Submit the sitemap in Google Search Console, then test sharing with the Facebook Sharing Debugger.
7. Run Lighthouse on all pages. The help page should score 95+ on accessibility and performance.
8. Recheck every helpline number and opening time on the help page. They were last checked 14 October 2026; recheck at least yearly.
