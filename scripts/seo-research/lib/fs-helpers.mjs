// scripts/seo-research/lib/fs-helpers.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_ROOT = path.resolve(import.meta.dirname, "../../../docs/seo/data");

export async function saveJson(relativePath, data) {
  const fullPath = path.join(DATA_ROOT, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return fullPath;
}
