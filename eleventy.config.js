// Eleventy configuration.
//
// This site is a GitHub Pages *project* site, served from /website/.
// Eleventy does not have Jekyll-style `baseurl`/`relative_url` built in, so
// we expose a `siteBase` value to templates and prefix asset URLs manually.
//
// The build output goes to `dist/`, which `actions/upload-pages-artifact`
// uploads to Pages.

const siteData = require("./src/data/site.json");

module.exports = function (eleventyConfig) {
  const siteBase = "/website";

  eleventyConfig.addGlobalData("siteBase", siteBase);
  eleventyConfig.addGlobalData("siteUrl", `https://wujunzero.github.io${siteBase}`);

  // Expose site.json as `site` in Liquid templates (Jekyll-style).
  eleventyConfig.addGlobalData("site", siteData);

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

  // Pass through static assets (CSS, images, favicon) unchanged.
  eleventyConfig.addPassthroughCopy({ "src/assets/main.css": "assets/main.css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/Jun_Wu.jpg": "assets/Jun_Wu.jpg" });
  eleventyConfig.addPassthroughCopy({ "src/assets/Jun_Wu.webp": "assets/Jun_Wu.webp" });
  eleventyConfig.addPassthroughCopy({ "src/assets/favicon.ico": "assets/favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/assets/orcid.webp": "assets/orcid.webp" });
  eleventyConfig.addPassthroughCopy("robots.txt");

  // Expose publications as a named collection so templates can use
  // `collections.publications`.
  eleventyConfig.addCollection("publications", (collectionApi) =>
    collectionApi.getFilteredByTag("research")
  );

  // Markdown: keep Liquid tags and HTML blocks intact.
  const MarkdownIt = require("markdown-it");
  const mdIt = MarkdownIt({ html: true });
  mdIt.disable("code");
  eleventyConfig.setLibrary("md", mdIt);

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "includes",
      layouts: "layouts",
    },
    // Layouts and includes live in src/ and are not rendered as standalone pages.
    templateFormats: ["md", "html", "liquid"],
    eleventyExcludeIglob: ["layouts/**", "includes/**", "rss.xml", "sitemap.xml"],
  };
};
