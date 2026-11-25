#!/usr/bin/env node
// Post-build script: generates dist/rss.xml and dist/sitemap.xml
// from the publication front-matter in src/publications/*.md.
// Eleventy's XML engine does not run Liquid, so we do it here.

const fs = require("fs");
const path = require("path");
const siteData = require("../src/data/site.json");

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Read all publication front-matter.
const pubDir = path.join(__dirname, "..", "src", "publications");
const pubs = fs
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
        if (val.startsWith("[") && val.endsWith("]")) {
          val = val
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/^["']|["']$/g, ""));
        }
        data[m[1]] = val;
      }
    }
    // Use the title to compute the slug — matches Eleventy's eleventyComputed
    // permalink: "{{ title | slugify }}/"
    data._slug = slugify(data.title || "");
    return data;
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

const distDir = path.join(__dirname, "..", "dist");
if (!fs.existsSync(distDir)) {
  console.error("dist/ not found. Run eleventy first.");
  process.exit(1);
}

// --- RSS ---
const rssItems = pubs
  .map((p) => {
    const dateStr = p.date ? new Date(p.date).toUTCString() : "";
    return `    <item>
      <title>${p.title}</title>
      <link>${siteData.url}/${p._slug}/</link>
      <description>${p.venue || ""}</description>
      <guid>${siteData.url}/${p._slug}/</guid>
      ${dateStr ? `<pubDate>${dateStr}</pubDate>` : ""}
    </item>`;
  })
  .join("\n");

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteData.title}</title>
    <description>${siteData.description}</description>
    <link>${siteData.url}</link>
    <atom:link href="${siteData.url}/rss.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(distDir, "rss.xml"), rssXml);
console.log(`Wrote dist/rss.xml (${pubs.length} items)`);

// --- Sitemap ---
const smUrls = pubs
  .map((p) => {
    const lastmod = p.date ? new Date(p.date).toISOString().slice(0, 10) : "";
    return `  <url>
    <loc>${siteData.url}/${p._slug}/</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
  })
  .join("\n");

const smXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${smUrls}
  <url>
    <loc>${siteData.url}/rss.xml</loc>
  </url>
</urlset>
`;
fs.writeFileSync(path.join(distDir, "sitemap.xml"), smXml);
console.log(`Wrote dist/sitemap.xml (${pubs.length} URLs)`);
