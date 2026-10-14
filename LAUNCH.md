# Before launch: confirmations and technical steps

This is the checklist for taking the GitHub Pages preview to the live site at **https://cdlf.uk/**.

Placeholders in the pages are marked in two ways:
- **Visible boxes** with `class="tbc"`, labelled "Placeholder".
- **Comments** containing `PLACEHOLDER` or `To check`.

Search the project for both.

---

## 1. Needs trustee approval

| # | Item | Where | Notes |
|---|---|---|---|
| T1 | **How donations are used.** Approved wording for the "100%" statement. | Home, Impact section (`.tbc` box) | The current site says "Currently, 100% of our proceeds go to the wonderful charities we support." The new site no longer shows "100%" as an impact figure. Please confirm the exact wording, including whether any running costs are covered separately. |
| T2 | **Other business supporters**, named only with their permission. | Corporate partnerships, "The difference it makes" | Only Persimmon Homes (2023) is named, based on Persimmon's own published article. |
| T3 | **Sponsorship options and partner recognition.** | Corporate partnerships, "Ways your business can help" | No packages, prices or benefits are listed. Add them only once agreed. |
| T4 | **Victoria's quote** on the partnerships page: "we then gift the money on to other mental health support networks and charities locally." | Corporate partnerships, "Why support CDLF" | Taken from Persimmon's 2023 article. Confirm she's happy for it to be used. |
| T5 | **Founding statement:** "set up in 2021 by Charlie's family and friends". | Corporate partnerships | Based on the original brief (launched May 2021). Confirm the wording. |

## 2. Facts to confirm

| # | Item | Notes |
|---|---|---|
| F1 | **Grants after 2023.** | Impact figures cover June 2021 to 2023 only and are labelled that way. Update the figures, date ranges and grant bars together (comment `IMPACT FIGURES` in `index.html` and `corporate-partnerships/index.html`). |
| F2 | **Photo permissions**, especially photos showing children and members of the public. | A Mile a Life montage; the Persimmon photo also appears on the partnerships page. |
| F3 | **Photo years and captions.** | Walking through York, Charlie's army, Lancaster Samms, #bemorecharlie. |
| F4 | **The website address.** Will the site stay at `https://cdlf.uk/`? | All canonical, social sharing and sitemap URLs assume it. If it changes, search for `cdlf.uk/` in every page, `sitemap.xml` and `robots.txt`. |
| F5 | **Charity registration body.** | The structured data lists 1195207 as a Charity Commission for England and Wales number. Confirm. |
| F6 | **Local NHS crisis line for York and North Yorkshire** (Tees, Esk and Wear Valleys NHS FT). | Not listed: the number couldn't be verified on the trust's website, which now directs people to NHS 111's mental health option (which is listed). Add it only once confirmed. |
| F7 | **A replacement helpline for young people**, after Papyrus. | Childline (verified) is listed for under-19s. |

## 3. Integrations to connect

| # | Item | Current behaviour | To do |
|---|---|---|---|
| I1 | **Corporate enquiry form** (`corporate-partnerships/`) | Checks each field, then opens the visitor's own email app with the message written out, addressed to info@cdlf.uk. The page says so. | Connect a form service the foundation controls (for example Netlify Forms, Formspree, or the website host's own). Set the form's `action` and remove `data-mailto`. Check the privacy policy covers enquiry data. |
| I2 | **Mailing list** | The sign-up form was removed (it previously showed "You are on the list" without saving anything). "Stay in touch" links to Instagram and Facebook instead. | Once the provider is known (Mailchimp or similar), add a sign-up form with consent wording. |
| I3 | **Instagram feed on the home page** | Not built. | Needs a Business or Creator account and a feed service (see the family questions). |
| I4 | **Donate** | Links to the existing page at cdlf.uk/donate/. | Keep, or rebuild as a new page. |

## 4. Technical steps at launch

1. **Remove `noindex`.** Delete the line marked `PREVIEW-ONLY` from:
   - `index.html`
   - `help/index.html`
   - `corporate-partnerships/index.html`

   Keep it on `help.html`, which is only a redirect.
2. **Keep the production SEO files at the site root:** `robots.txt` (allows crawling, points to the sitemap) and `sitemap.xml` (lists the live URLs). Add new pages to the sitemap as they launch.
3. **Upload `assets/og-image.jpg`** so `https://cdlf.uk/assets/og-image.jpg` resolves. Then test sharing with the Facebook Sharing Debugger.
4. **Set up redirects from the old WordPress addresses.** The QR codes use `https://cdlf.uk/help/`, which is unchanged. Others to redirect as pages are built:
   - `/about-charlie/`
   - `/beneficiaries/`
   - `/a-mile-a-life/`
   - `/fundraising-donate/`
   - `/our-team/`
   - `/donate/`
5. **Update the menu links.** "Charlie's story", "About us" and "Donate" still point to the current cdlf.uk pages. "Our impact", "Get involved" and "A Mile a Life" jump to sections of the home page until their own pages exist.
6. **Recheck every helpline number and opening time** on the help page. They were last checked on 14 October 2026; recheck at least yearly.
7. **After launch:** submit the sitemap in Google Search Console, and run Lighthouse on all three pages. The help page should score 95+ on accessibility and performance.
