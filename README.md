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
  publications/   one .md per paper (12)
  layouts/        base.html, post.html
  includes/       head.html, nav.html, footer.html
  assets/         css, images
  data/site.json  global site metadata (url = site root, the only prefix source)
scripts/
  generate-feeds.js   writes dist/rss.xml + dist/sitemap.xml (eleventy.after hook)
```

## GitHub Pages CI

`.github/workflows/pages.yml` — Node 22, `npm ci`, Eleventy build,
`xmllint` validation of the generated feeds, deploy on push to `main`.
Pull requests run the same build + validation but never deploy.
