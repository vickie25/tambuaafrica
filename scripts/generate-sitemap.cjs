/**
 * Build-time: generate public/sitemap.xml from Supabase (or local fallbacks).
 * Run after generate-site-snapshot.cjs so snapshot can be reused.
 *
 * Usage: node scripts/generate-sitemap.cjs
 */
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const snapshotPath = path.join(root, "public/data/site-snapshot.json");
const outPath = path.join(root, "public/sitemap.xml");

const SITE_ORIGIN = "https://tambuaafrica.com";

/** Public indexable routes (no auth, no admin). */
const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/safaris", changefreq: "weekly", priority: "0.9" },
  { path: "/destinations", changefreq: "monthly", priority: "0.8" },
  { path: "/travel-info", changefreq: "monthly", priority: "0.8" },
  { path: "/gallery", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.7" },
  { path: "/services/ticketing", changefreq: "monthly", priority: "0.6" },
  { path: "/services/transfers", changefreq: "monthly", priority: "0.6" },
  { path: "/services/lodges-camps", changefreq: "monthly", priority: "0.6" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
];

function loadEnv() {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function toLastmod(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function parseIdsFromTs(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf-8");
  const re = /\bid:\s*"([^"]+)"/g;
  const ids = [];
  let m;
  while ((m = re.exec(text))) {
    const id = m[1];
    if (id !== "string") ids.push(id);
  }
  return [...new Set(ids)];
}

function readSnapshot() {
  if (!fs.existsSync(snapshotPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
  } catch {
    return null;
  }
}

async function fetchFromSupabase(env) {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const client = createClient(url, key);
  const [safarisRes, blogsRes] = await Promise.all([
    client.from("safaris").select("id, updated_at"),
    client.from("blogs").select("id, updated_at").order("created_at", { ascending: false }),
  ]);

  if (safarisRes.error && blogsRes.error) return null;

  return {
    safaris: safarisRes.data ?? [],
    blogs: blogsRes.data ?? [],
  };
}

function buildUrlEntries({ safaris, blogs }) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [];

  for (const page of STATIC_PAGES) {
    entries.push({
      loc: `${SITE_ORIGIN}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  for (const safari of safaris) {
    if (!safari.id) continue;
    entries.push({
      loc: `${SITE_ORIGIN}/safaris/${encodeURIComponent(safari.id)}`,
      lastmod: toLastmod(safari.updated_at),
      changefreq: "weekly",
      priority: "0.85",
    });
  }

  for (const blog of blogs) {
    if (!blog.id) continue;
    entries.push({
      loc: `${SITE_ORIGIN}/blog/${encodeURIComponent(String(blog.id))}`,
      lastmod: toLastmod(blog.updated_at),
      changefreq: "monthly",
      priority: "0.65",
    });
  }

  return entries;
}

function renderXml(entries) {
  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${escapeXml(e.loc)}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function main() {
  const env = { ...loadEnv(), ...process.env };
  let safaris = [];
  let blogs = [];
  let source = "fallback";

  const snapshot = readSnapshot();
  if (snapshot?.safaris?.length || snapshot?.blogs?.length) {
    safaris = snapshot.safaris.map((s) => ({ id: s.id, updated_at: s.updated_at }));
    blogs = snapshot.blogs.map((b) => ({ id: b.id, updated_at: b.updated_at }));
    source = "site-snapshot.json";
  } else {
    const remote = await fetchFromSupabase(env);
    if (remote) {
      safaris = remote.safaris;
      blogs = remote.blogs;
      source = "Supabase";
    }
  }

  if (!safaris.length) {
    const ids = parseIdsFromTs(path.join(root, "src/data/safaris.ts"));
    safaris = ids.map((id) => ({ id, updated_at: null }));
    if (ids.length) source = "src/data/safaris.ts (fallback)";
  }

  if (!blogs.length) {
    const ids = parseIdsFromTs(path.join(root, "src/data/blogPosts.ts"));
    blogs = ids.map((id) => ({ id, updated_at: null }));
    if (ids.length && source.includes("fallback")) source = "local TS fallbacks";
  }

  const entries = buildUrlEntries({ safaris, blogs });
  const xml = renderXml(entries);
  fs.writeFileSync(outPath, xml);

  console.log(
    `Wrote sitemap.xml (${entries.length} URLs, ${safaris.length} safaris, ${blogs.length} blogs) — source: ${source}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
