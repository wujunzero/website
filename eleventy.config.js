// Eleventy configuration.
//
// This site is a GitHub Pages *project* site, served from /website/.
// `src/data/site.json` -> `url` is the authoritative absolute site root; the
// Pages prefix is derived from it and fed to Eleventy's `pathPrefix`, so
// templates use `{{ "/assets/x.css" | url }}` instead of hand-built prefixes.
//
// The build output goes to `dist/`, which `actions/upload-pages-artifact`
// uploads to Pages.

const siteData = require("./src/data/site.json");

module.exports = function (eleventyConfig) {
  // "https://wujunzero.github.io/website" -> "/website/"
  const siteUrl = siteData.url.replace(/\/+$/, "");
  const pathname = new URL(siteUrl).pathname.replace(/\/+$/, "");
  const pathPrefix = `${pathname}/`;

  eleventyConfig.addGlobalData("siteUrl", siteUrl);

  // Expose site.json as `site` in Liquid templates (Jekyll-style).
  eleventyConfig.addGlobalData("site", siteData);

  // News items power the homepage timeline. Kept as data (not markup) so
  // adding an entry never means touching a template.
  eleventyConfig.addGlobalData("news", require("./src/data/news.json"));

  // Jekyll-compatible slugify: lowercase, spaces→hyphens, strip non-alphanumeric.
  eleventyConfig.addFilter("slugify", (str) =>
    str
      .toLowerCase()
      .replace(/[\s]+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  );

  // Jekyll-compatible sortDesc: sort an array by a property descending.
  // Eleventy collections are arrays of page objects; sort by a key on .data.
  eleventyConfig.addFilter("sortDesc", (arr, key) => {
    const items = Array.isArray(arr) ? [...arr] : [];
    items.sort((a, b) => {
      const va = a.data ? a.data[key] : a[key];
      const vb = b.data ? b.data[key] : b[key];
      const da = new Date(va).getTime();
      const db = new Date(vb).getTime();
      if (da > db) return -1;
      if (da < db) return 1;
      return 0;
    });
    return items;
  });

  // Group an already-sorted list of publications into {year, items} buckets,
  // newest year first. Used by the homepage to render year sections.
  eleventyConfig.addFilter("groupByYear", (items) => {
    const groups = new Map();
    (Array.isArray(items) ? items : []).forEach((item) => {
      const raw = item.data ? item.data.date : item.date;
      const year = String(new Date(raw).getFullYear());
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(item);
    });
    return [...groups.entries()]
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([year, items]) => ({ year, items }));
  });

  // Pass through static assets (CSS, images, favicon) unchanged.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("robots.txt");

  // Expose publications as a named collection so templates can use
  // `collections.publications`.
  eleventyConfig.addCollection("publications", (collectionApi) =>
    collectionApi.getFilteredByTag("research")
  );

  // Markdown: keep raw HTML blocks intact. The homepage is a .html template
  // (it is pure markup, so running it through markdown only injected stray
  // <p> wrappers); this only applies to the publication .md files.
  const MarkdownIt = require("markdown-it");
  const mdIt = MarkdownIt({ html: true });
  eleventyConfig.setLibrary("md", mdIt);

  // Generate rss.xml / sitemap.xml after Eleventy has written dist/.
  // Hooking the event (instead of chaining a second npm script) means
  // `npm run serve` produces up-to-date feeds too.
  eleventyConfig.on("eleventy.after", () => {
    require("./scripts/generate-feeds.js")();
  });

  return {
    // Drives the `url` filter and the `--serve` dev server path.
    pathPrefix,
    dir: {
      input: "src",
      output: "dist",
      includes: "includes",
      layouts: "layouts",
    },
    // Layouts and includes live in src/ and are not rendered as standalone
    // pages — Eleventy already skips `dir.layouts` / `dir.includes`, so no
    // explicit exclusion is needed here.
    templateFormats: ["md", "html", "liquid"],
  };
};
