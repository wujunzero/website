# website

Jun Wu's academic homepage — built with [Eleventy](https://11ty.io/) and deployed to GitHub Pages.

## Local development

```bash
npm install
npm run build          # Eleventy → dist/  (+ rss.xml, sitemap.xml)
npx serve dist         # or: python3 -m http.server 8080 -d dist
```

> The site is a **project** Pages site, served from `/website/`.
> Local preview of the built output is static — relative links that start
> with `/website/...` will 404 locally; use the live URL to verify.

## Layout

```
src/
  pages/          home.md, 404.md
  publications/   one .md per paper (12)
  layouts/        base.html, post.html
  includes/       head.html, nav.html, footer.html
  assets/         css, images
  data/site.json  global site metadata
scripts/
  generate-feeds.js   writes dist/rss.xml + dist/sitemap.xml post-build
```

## GitHub Pages CI

`.github/workflows/pages.yml` — Node 22, `npm ci`, Eleventy build,
deploy on push to `main`.
