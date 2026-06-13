# DLA Piper "About Us" Page Migration Plan

## Overview
Migrate `https://www.dlapiper.com/en-us/about-us` into the AEM Edge Delivery Services project (crosswalk/xwalk type, target site `dla-piper-eds`). This is a full-page migration: analyze structure, map/create blocks, apply styling, import content, and validate against the original.

## Source & Target
- **Source URL:** https://www.dlapiper.com/en-us/about-us
- **Project type:** `xwalk` (Universal Editor / JCR content model)
- **Preview target:** `rafwinterpacht` / `dla-piper-eds`
- **Existing blocks available:** hero, cards, columns, carousel, accordion, tabs, quote, table, embed, video, search, modal, fragment, header, footer, form

## Approach
1. **Site/page analysis** — scrape the page, capture screenshots, identify sections and content sequences, and decide default-content vs. block authoring for each sequence.
2. **Block mapping** — match each identified section against existing blocks (reuse first, ~70% similarity threshold); flag any new block variants that need creation.
3. **Import infrastructure** — generate block parsers and page transformers, plus the page template, so content can be imported reliably.
4. **Content import** — run the bundled import script to produce the page content in the project (no hand-written HTML).
5. **Design/styling** — extract design tokens and per-block computed styles from the source and apply EDS-ready CSS.
6. **Crosswalk conversion** — convert imported HTML to JCR XML and validate Universal Editor block models for xwalk compatibility.
7. **Validation** — render in preview and compare visually against the original, iterating on CSS until it matches.

## Checklist
- [ ] Analyze the source page structure (sections, sequences, blocks, screenshots)
- [ ] Map identified sections to existing blocks; identify any new block variants needed
- [ ] Create or extend block variants where no suitable existing block matches
- [ ] Generate import infrastructure (parsers, transformers, page template)
- [ ] Run the import to generate page content in the project
- [ ] Extract design tokens and apply block-level styling from the source
- [ ] Convert imported content to JCR XML for xwalk and validate block models
- [ ] Render the page in preview and verify it loads cleanly
- [ ] Visually compare migrated page against the original and fix CSS differences
- [ ] Final QA pass and report results

## Notes
- Header and footer migration (navigation/megamenu, footer) can be handled as a follow-up if needed — confirm whether they're in scope for this page.
- Execution requires **Execute mode**; this artifact is the proposed plan for approval.
