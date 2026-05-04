/**
 * Entry shim: package.json has "type":"module", so CommonJS lives in update-admin.cjs.
 * Run: node update-admin.js   (same as node update-admin.cjs)
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const cjs = path.join(dir, "update-admin.cjs");
const result = spawnSync(process.execPath, [cjs], { stdio: "inherit", env: process.env });
process.exit(result.status === null ? 1 : result.status);
