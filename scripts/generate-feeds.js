#!/usr/bin/env node
// Generates dist/rss.xml and dist/sitemap.xml from the publication front-matter
// in src/publications/*.md.
//
// Called from eleventy.config.js on the `eleventy.after` event, so both
// `npm run build` and `npm run serve` produce feeds from the same code path.
// Can also be run standalone: `node scripts/generate-feeds.js`.

const fs = require("fs");
const path = require("path");
const siteData = require("../src/data/site.json");

// Must stay in sync with the `slugify` filter in eleventy.config.js, which
// drives the `permalink` in each publication's eleventyComputed.
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Escape text for XML text nodes and attribute values.
// Needed because values like "Computers & Operations Research" are interpolated
// verbatim — a single bare `&` makes the whole feed unparseable.
function escapeXml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Minimal front-matter reader: single-line `key: value` pairs only, which is
// all the publication files use. Deliberately dependency-free.
function readPublications(pubDir) {
  return fs
    .readdirSync(pubDir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const content = fs.readFileSync(path.join(pubDir, file), "utf8");
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) return null;
      const data = {};
      for (const line of fmMatch[1].split("\n")) {
        const m = line.match(/^(\w+):\s*(.*)$/);
        if (m) {
          let val = m[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          data[m[1]] = val;
        }
      }
      // Use the title to compute the slug, matching the eleventyComputed
      // permalink: "{{ title | slugify }}/"
      data._slug = slugify(data.title || "");
      return data;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function writeRss(distDir, pubs) {
  const rssItems = pubs
    .map((p) => {
      const dateStr = p.date ? new Date(p.date).toUTCString() : "";
      const link = `${siteData.url}/${p._slug}/`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(p.venue || "")}</description>
      <guid>${escapeXml(link)}</guid>
      ${dateStr ? `<pubDate>${dateStr}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteData.title)}</title>
    <description>${escapeXml(siteData.description)}</description>
    <link>${escapeXml(siteData.url)}</link>
    <atom:link href="${escapeXml(`${siteData.url}/rss.xml`)}" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>
`;
  fs.writeFileSync(path.join(distDir, "rss.xml"), rssXml);
  console.log(`Wrote dist/rss.xml (${pubs.length} items)`);
}

function writeSitemap(distDir, pubs) {
  const smUrls = pubs
    .map((p) => {
      const lastmod = p.date ? new Date(p.date).toISOString().slice(0, 10) : "";
      return `  <url>
    <loc>${escapeXml(`${siteData.url}/${p._slug}/`)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
    })
    .join("\n");

  const smXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(`${siteData.url}/`)}</loc>
  </url>
${smUrls}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), smXml);
  console.log(`Wrote dist/sitemap.xml (${pubs.length + 1} URLs)`);
}

function generateFeeds() {
  const root = path.join(__dirname, "..");
  const distDir = path.join(root, "dist");

  if (!fs.existsSync(distDir)) {
    console.error("dist/ not found. Run eleventy first.");
    process.exit(1);
  }

  const pubs = readPublications(path.join(root, "src", "publications"));
  writeRss(distDir, pubs);
  writeSitemap(distDir, pubs);
}

module.exports = generateFeeds;

if (require.main === module) {
  generateFeeds();
}
