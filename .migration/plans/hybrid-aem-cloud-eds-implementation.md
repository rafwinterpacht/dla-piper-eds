# DLA Piper Migration Recap + SLICC Feasibility

## Narrative: the DLA Piper EDS migration

Over the DLA Piper engagement we migrated a representative slice of `dlapiper.com` into AEM Edge Delivery Services and proved out **mixed-mode authoring** — Universal Editor / Crosswalk pages alongside da.live document-authored pages, all sharing one set of EDS blocks. We migrated **four page templates** (person profile, homepage, an insights publication, and the about-us page) plus the **shared header and footer**, and built a family of custom blocks (hero-article, columns-cta, cards-people, cards-insights, carousel-awards, columns-media, quote-portrait) styled to the DLA Piper brand (navy `rgb(0 34 64)`, olive accents, Noto Sans/Serif). The header and footer were the hardest pieces: they had to survive AEM's wrapper-div pipeline (not just the local preview DOM), so we rewrote them to be content-signature driven rather than index-based, collapse megamenu submenus structurally, hide the locale list by content pattern, and absolutize image paths. Each of those chrome blocks took roughly **three iterations** of render-inspect-fix against the real AEM output before matching the source.

The work was iteration-heavy because the source site sits behind a **Vercel "Security Checkpoint" bot-wall** that returns 429s and a ~10–15s JS challenge to headless browsers; the stock importer silently captured the *checkpoint* page as if it were content, so we built a **challenge-aware import driver** that polls for the real content selector and reloads until the challenge clears. Other notable challenges: a git conflict cycle where migrated files kept reverting to boilerplate (resolved via a clean branch + PR), discovering the site is **Config-Service-managed** (so `fstab.yaml` is ignored and there's no per-path content-source split — which forced the second `dla-piper-da` site for the DA demo), the manually-created DA site not auto-deploying its code bus (fixed with a direct `POST /code/.../main/*`), and a `md2jcr` quirk where a heading-inside-a-link doesn't round-trip (routed through the columns-cta block instead). Net: a working, branded, mixed-mode demo, but it took meaningful hand-tuning — most of it spent on bot-wall handling, AEM-vs-preview DOM robustness, and the header/footer.

## Can we run a similar demo with SLICC (sliccy.com)?

**Short answer: plausibly for the *capture* half, but it would not replace the EDS-specific half — and I can't confirm specifics without reviewing the tool.** SLICC is described as a browser extension that performs similar tasks. A browser-extension approach has one real advantage here: because it runs **inside a real, logged-in browser session**, it would likely sail past the **Vercel bot-wall** that cost us the most effort — no headless 429s, no challenge-polling driver needed. That alone could remove our single biggest source of iterations.

However, the DLA Piper demo's value wasn't just scraping DOM — it was producing **EDS-shaped output**: block tables / JCR XML with field hints, component models and registration for Universal Editor, brand-matched block CSS, da.live-clean documents, and the header/footer decoration logic. Whether SLICC can emit *that* (versus generic HTML capture) is the open question that decides feasibility. So the right next step is a **scoped bake-off**: point SLICC at one already-migrated page (e.g. the insights publication) and one un-migrated page, then compare its output against our EDS artifacts on capture fidelity, bot-wall handling, block/section mapping, and how much hand-finishing remains. I have not browsed sliccy.com, so the capability claims above are inference from "browser extension that performs similar tasks" — the bake-off is what turns that into a real answer.

## Open questions (need your input)

- Do you want me to **review sliccy.com** (fetch the site) to ground the feasibility assessment in its actual stated capabilities, rather than inference?
- For the bake-off, which page should be the **control** — the insights publication we already migrated, or a fresh DLA Piper URL we haven't touched?
- Is the deliverable a **written comparison** (this document, expanded), or an actual **side-by-side demo run** of SLICC vs. the EDS pipeline?

## Checklist

### Recap deliverable
- [ ] Confirm the recap above captures the scope/iterations/challenges you want to present
- [ ] Adjust depth/length (currently two-paragraph narrative + feasibility) to your audience
- [ ] Pull exact block list / page list from the repo if precise counts are needed for the writeup

### SLICC feasibility
- [ ] Review sliccy.com to confirm its real capabilities (requires fetching the URL — your go-ahead)
- [ ] Define bake-off criteria: bot-wall handling, capture fidelity, EDS block/section mapping, JCR/field-hint output, hand-finishing effort
- [ ] Pick the control page(s) for the comparison
- [ ] Decide deliverable form: written comparison vs. live side-by-side demo run

> Note: this is an analysis/answer artifact — no files or config have been changed. Fetching sliccy.com and running any bake-off require Execute mode; the feasibility section is currently inference pending a review of the tool.
