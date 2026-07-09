# Page Templates Inventory

This project (`dla-piper-eds`, an xwalk / Universal Editor site) currently defines **4 page templates** for content migration. Each template captures a page type, a representative source URL, and the blocks that get parsed on that page type.

## Available Templates

### 1. `person-profile`
Attorney/person profile page with bio, contact card, practice areas, credentials, and related content.
- **Representative URL:** `https://www.dlapiper.com/en-us/people/r/ryan-frank-w`
- **Blocks:** `hero-profile`, `quote-profile`, `cards-insights`, `columns-contact`
- *(Also used to migrate Loren H. Brown's profile earlier in this session.)*

### 2. `homepage`
DLA Piper homepage with hero, featured insights/news, capabilities, and promotional sections.
- **Representative URL:** `https://www.dlapiper.com/en-us`
- **Blocks:** `hero-banner`, `cards-promo`, `cards-insights`, `columns-cta` (in an `accent-olive` section)

### 3. `insights-publication`
Insights/publication article page with article header (title, date, authors), rich-text body, and related content.
- **Representative URL:** `https://www.dlapiper.com/en-us/insights/publications/2026/05/doj-and-cftc-criminal-and-civil-insider-trading-charges`
- **Blocks:** `hero-article`, `cards-insights`

### 4. `about-us`
Firm overview, mission, values, leadership, awards, and key information sections.
- **Representative URL:** `https://www.dlapiper.com/en-us/about-us`
- **Blocks:** `hero-article`, `columns-media`, `quote-portrait`, `carousel-awards`, `cards-people`

## Checklist
- [x] Read the project's `page-templates.json`
- [x] Enumerate all defined templates with descriptions, source URLs, and blocks
- [ ] (Optional) Pick a template to migrate a new page — requires Execute mode
- [ ] (Optional) Add a new template for a page type not yet covered — requires Execute mode

---
*This was an informational request, so no changes are needed. If you'd like to act on any of the optional items above (migrate a page using one of these templates, or define a new template), switch to Execute mode and let me know which one.*
