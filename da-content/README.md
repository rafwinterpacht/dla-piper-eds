# DA-clean content for the `dla-piper-da` (da.live) demo site

These are the migrated pages with the xwalk `<!-- field:* -->` hint comments **removed**
(0 hints), so they paste cleanly into da.live. Blocks and content are otherwise identical to
the AEM/UE site — that's the mixed-mode demo (same blocks/code, different authoring tool).

> NOTE: This folder is a **staging area you can open locally** — it is NOT served. The
> `dla-piper-da` site gets its content from da.live (`content.da.live/rafwinterpacht/dla-piper-da/`),
> not from this repo. Paste each file into the matching da.live document, then Preview it.

## File → da.live document path

| File in this folder | Create this document in da.live |
|---|---|
| `en-us.plain.html` | `/en-us` |
| `en-us/about-us.plain.html` | `/en-us/about-us` |
| `en-us/people/r/ryan-frank-w.plain.html` | `/en-us/people/r/ryan-frank-w` |
| `en-us/insights/publications/2026/05/doj-and-cftc-criminal-and-civil-insider-trading-charges.plain.html` | `/en-us/insights/publications/2026/05/doj-and-cftc-criminal-and-civil-insider-trading-charges` |
| `en-us/news/2025/12/dla-piper-wins-strategic-direction-honor-at-financial-times-innovative-lawyers-awards.plain.html` | `/en-us/news/2025/12/dla-piper-wins-strategic-direction-honor-at-financial-times-innovative-lawyers-awards` |
| `nav.plain.html` | `/nav` (header fragment) |
| `footer.plain.html` | `/footer` (footer fragment) |

## How to paste into da.live

da.live's editor expects rendered rich content, not raw HTML source. Either:
1. Open the `.plain.html` file in a browser, select-all, copy, paste into the DA document; or
2. Use da.live's HTML/import paste if available, with this markup directly.
The block tables (`<div class="hero-article">…`, `<div class="columns-cta">…`) round-trip into
DA block tables. After pasting, **Preview** each document.

## Images (required — upload to the DA project media)

Upload these (from the code repo's `content/images/`, or wherever you keep them) so the logo,
leadership photos, featured cards, and footer social icons resolve. Reference them at the same
relative `images/...` paths the docs use:

- desktop-logo.svg, dla-logo.svg
- person-ryan.jpg, person-severs.jpg, person-brown.jpg, person-gilluly.jpg,
  person-wallace.jpg, person-chesley.jpg, person-parameswaran.jpg, person-king.jpg
- featured-about.jpg, featured-capabilities.jpg, featured-careers.jpg, featured-insights.jpg
- social-linkedin.svg, social-twitter.svg, social-instagram.svg, social-facebook.svg, social-youtube.svg

## Fragments look empty on their own — that's expected

`/nav` and `/footer` are fragments fetched by `header.js` / `footer.js`. Viewed directly they
show bare markup with no chrome. Judge them on a real page (e.g. the news article), where they
get injected at top/bottom.

## Suggested first end-to-end test

Author `/nav`, `/footer`, and the news doc, then preview:
`https://main--dla-piper-da--rafwinterpacht.aem.page/en-us/news/2025/12/dla-piper-wins-strategic-direction-honor-at-financial-times-innovative-lawyers-awards`
It exercises a real page + header (`/nav`) + footer (`/footer`) together.
