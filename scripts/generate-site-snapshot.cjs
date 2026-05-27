/**
 * Build-time: fetch all public CMS data once and write a static JSON snapshot.
 * Run: node scripts/generate-site-snapshot.cjs
 */
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");

dotenv.config({ path: envPath });

function loadEnv() {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_ANON_KEY;

const OUT_PUBLIC = path.join(root, "public/data/site-snapshot.json");
const OUT_SRC = path.join(root, "src/generated/site-snapshot.json");

async function fetchAll(client) {
  const [
    safaris,
    destinations,
    blogs,
    carousel_images,
    destination_lodges,
    lodges_service_cards,
    site_marketing_blocks,
    reviews,
  ] = await Promise.all([
    client.from("safaris").select("*"),
    client.from("destinations").select("*"),
    client.from("blogs").select("*").order("created_at", { ascending: false }),
    client.from("carousel_images").select("*").order("order", { ascending: true }),
    client.from("destination_lodges").select("*").order("order", { ascending: true }),
    client
      .from("lodges_service_cards")
      .select("id, sort_order, name, area, category, note, image_url")
      .order("sort_order", { ascending: true }),
    client.from("site_marketing_blocks").select("id, eyebrow, headline, body"),
    client.from("reviews").select("*").eq("is_active", true).order("display_order", { ascending: true }),
  ]);

  const errors = [
    safaris.error,
    destinations.error,
    blogs.error,
    carousel_images.error,
    destination_lodges.error,
    lodges_service_cards.error,
    site_marketing_blocks.error,
    reviews.error,
  ].filter(Boolean);

  if (errors.length) {
    console.warn("Snapshot partial errors:", errors.map((e) => e.message).join("; "));
  }

  return {
    generatedAt: new Date().toISOString(),
    safaris: safaris.data ?? [],
    destinations: destinations.data ?? [],
    blogs: blogs.data ?? [],
    carousel_images: carousel_images.data ?? [],
    destination_lodges: destination_lodges.data ?? [],
    lodges_service_cards: lodges_service_cards.data ?? [],
    site_marketing_blocks: site_marketing_blocks.data ?? [],
    reviews: reviews.data ?? [],
  };
}

function writeOutputs(snapshot) {
  const json = JSON.stringify(snapshot);
  fs.mkdirSync(path.dirname(OUT_PUBLIC), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_SRC), { recursive: true });
  fs.writeFileSync(OUT_PUBLIC, json);
  fs.writeFileSync(OUT_SRC, json);
  fs.writeFileSync(`${OUT_PUBLIC}.br`, zlib.brotliCompressSync(json, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 6 } }));
  const kb = (Buffer.byteLength(json) / 1024).toFixed(1);
  console.log(`Wrote site snapshot (${kb} KB) → public/data + src/generated`);
}

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("No Supabase env — writing empty snapshot (app uses local fallbacks).");
    writeOutputs({
      generatedAt: new Date().toISOString(),
      safaris: [],
      destinations: [],
      blogs: [],
      carousel_images: [],
      destination_lodges: [],
      lodges_service_cards: [],
      site_marketing_blocks: [],
      reviews: [],
    });
    return;
  }

  const client = createClient(supabaseUrl, supabaseKey);
  const snapshot = await fetchAll(client);
  const total =
    snapshot.safaris.length +
    snapshot.destinations.length +
    snapshot.blogs.length +
    snapshot.carousel_images.length;
  console.log(`Fetched ${total}+ rows from Supabase.`);
  writeOutputs(snapshot);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
