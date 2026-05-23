import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const tracked = new Set(
  execSync("git ls-files public/images", { cwd: root, encoding: "utf8" })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((f) => f.replace(/^public/, "").replace(/\\/g, "/")),
);

const refs = new Set();
const walk = (dir) => {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(tsx?|json)$/.test(ent.name)) {
      const text = fs.readFileSync(p, "utf8");
      for (const m of text.matchAll(/["'](\/images\/[^"']+)["']/g)) refs.add(m[1]);
    }
  }
};
walk(path.join(root, "src"));
walk(path.join(root, "public/data"));

const missing = [...refs].filter((r) => {
  const norm = r.split("?")[0];
  return norm.startsWith("/images/") && !tracked.has(norm);
});

console.log(`refs=${refs.size} tracked=${tracked.size} missing=${missing.length}`);
for (const m of missing.slice(0, 50)) console.log(m);
