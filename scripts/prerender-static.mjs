/**
 * Post-build: render each public route to static HTML under dist/.
 * Run: node scripts/prerender-static.mjs
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const sitemapPath = path.join(root, "public/sitemap.xml");

const SKIP_PREFIXES = ["/admin", "/dashboard", "/booking", "/login", "/signup", "/forgot-password", "/reset-password", "/diagnostics", "/payment-success"];

function routesFromSitemap() {
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const locs = [...xml.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
  return [...new Set(locs)].filter((route) => !SKIP_PREFIXES.some((p) => route === p || route.startsWith(`${p}/`)));
}

function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        /* retry */
      }
      if (Date.now() - start > timeoutMs) return reject(new Error(`Preview server not ready: ${url}`));
      setTimeout(tick, 400);
    };
    tick();
  });
}

function startPreview() {
  const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");
  return new Promise((resolve, reject) => {
    const proc = spawn(
      process.execPath,
      [viteBin, "preview", "--host", "127.0.0.1", "--port", "4173"],
      {
        cwd: root,
        stdio: "pipe",
        env: { ...process.env, NODE_ENV: "production" },
      },
    );
    proc.on("error", reject);
    resolve({ proc, baseUrl: "http://127.0.0.1:4173" });
  });
}

function writeHtmlForRoute(route, html) {
  const rel = route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
  const outPath = path.join(distDir, rel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
}

async function main() {
  if (process.env.VERCEL === "1") {
    console.log("Skipping prerender on Vercel (SPA + meta tags; run npm run prerender locally if needed).");
    process.exit(0);
  }

  if (!fs.existsSync(distDir)) {
    console.error("dist/ missing — run vite build first.");
    process.exit(1);
  }

  const routes = routesFromSitemap();
  console.log(`Prerendering ${routes.length} routes…`);

  const { proc, baseUrl } = await startPreview();
  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    for (const route of routes) {
      const page = await context.newPage();
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 90_000 });
      await page.waitForTimeout(800);
      const html = await page.content();
      writeHtmlForRoute(route, html);
      await page.close();
      console.log(`  ✓ ${route}`);
    }

    await browser.close();
    console.log("Prerender complete.");
  } finally {
    proc.kill("SIGTERM");
  }
}

main().catch((err) => {
  const msg = String(err?.message || err);
  if (msg.includes("Executable doesn't exist") || msg.includes("browserType.launch")) {
    console.warn("Prerender skipped (Playwright browser missing). Run: npx playwright install && npm run prerender");
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
