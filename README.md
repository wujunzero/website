# website

Jun Wu's academic homepage — built with [Eleventy](https://11ty.io/) and deployed to GitHub Pages.

## Local development

```bash
npm install
npm run serve          # http://localhost:8080/website/
npm run build          # Eleventy → dist/  (+ rss.xml, sitemap.xml)
```

> The site is a **project** Pages site, served from `/website/`. That prefix is
> derived from `src/data/site.json` → `url` and applied through Eleventy's
> `pathPrefix`, so templates just write `{{ "/assets/main.css" | url }}`.
> `npm run serve` already serves the correct path; a plain static server on
> `dist/` (`npx serve dist`) will not rewrite the prefix, so use the dev server
> for previews.

## Layout

```
src/
  pages/          home.html, 404.md
  publications/   one .md per paper (19)
  layouts/        base.html, post.html
  includes/       head.html, nav.html, footer.html
  assets/         main.css (design tokens), main.js (~4.6KB), images
  data/           site.json (metadata), news.json (homepage News items)
scripts/
  generate-feeds.js   writes dist/rss.xml + dist/sitemap.xml (eleventy.after hook)
```

## Adding content

### A new paper

Create `src/publications/YYYY-MM-DD-short-slug.md`. The filename is only for
sorting; the public URL comes from the title:

```yaml
---
layout: post
title: "Full title, exactly as published"
date: "2026-03-14"
tags: [research]
type: journal          # journal | conference
author: "Jun Wu"       # marks you in the author list (bold, no colour)
authors:
  - "First Author"
  - "Jun Wu"
venue: "IEEE Transactions on ..."
venue_url: "https://doi.org/10.xxxx/yyyy"
paper: "https://doi.org/10.xxxx/yyyy"
code: "https://github.com/wujunzero/repo"   # optional
eleventyComputed:
  permalink: "{{ title | slugify }}/"
---
```

Nothing else needs touching — the homepage groups by year through the
`groupByYear` filter and the type buttons count themselves.

> **The title is the URL.** `permalink` is `{{ title | slugify }}`, so editing
> the title of a paper that is already online silently breaks every inbound
> link. If a title really has to change, pin the old path with an explicit
> `permalink: "old-slug/"`.

### A news line

Append to `src/data/news.json`. **Array order is display order and the first
entry becomes "last updated"**, so insert the newest at the top:

```json
{ "date": "2026.03", "text": "Paper on … accepted at …" }
```

### Syncing with Google Scholar

1. Open <https://scholar.google.com/citations?user=xhn6R7EAAAAJ&hl=en&pagesize=100>
2. Compare against `src/publications/`; anything missing is a new entry
3. For each new one, look up the DOI and take the title from the **publisher**,
   not from Scholar — Scholar OCR has misread titles before (`In-Label` came
   back as `Io-Label`)
4. Add the `.md` with full author names, not Scholar's initials

SSRN preprints are deliberately not listed. Add one with `type: preprint` only
if you decide it belongs on the page.

### Everything else

| Change | Where |
|---|---|
| Email, ORCID, Scholar / DBLP / Semantic Scholar URLs | `src/data/site.json` (single source) |
| Projects, Teaching | the matching `<section>` in `src/pages/home.html` |
| Recruiting banner | flip `show_recruit` at the top of `pages/home.html` |
| Colours, type scale, spacing | CSS custom properties at the top of `src/assets/main.css` |
| Nav items | `src/includes/nav.html` plus the matching section `id` in `home.html` |

### Before pushing

```bash
rm -rf dist && npm run build
xmllint --noout dist/rss.xml dist/sitemap.xml
find dist -name '*.html' | wc -l     # papers + index + 404
```

A push to `main` triggers Pages deployment (about 25 s); `dist/` is never
committed.

## GitHub Pages CI

`.github/workflows/pages.yml` — Node 22, `npm ci`, Eleventy build,
`xmllint` validation of the generated feeds, deploy on push to `main`.
Pull requests run the same build + validation but never deploy.
