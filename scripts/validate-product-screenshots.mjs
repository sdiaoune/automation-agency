import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await fs.readFile(path.join(root, "src/data/product-screenshot-manifest.json"), "utf8"),
);

if (manifest.length !== 22) throw new Error(`Expected 22 routes, found ${manifest.length}`);
if (new Set(manifest.map((item) => item.route)).size !== 22) throw new Error("Duplicate route");
if (new Set(manifest.map((item) => item.scenario)).size !== 22) throw new Error("Duplicate scenario");

for (const item of manifest) {
  for (const [viewport, expected] of [["desktop", [2880, 1800]], ["mobile", [1170, 2532]]]) {
    for (const format of ["jpeg", "webp"]) {
      const file = path.join(root, "public", item[viewport][format].replace(/^\//, ""));
      const metadata = await sharp(file).metadata();
      if (metadata.width !== expected[0] || metadata.height !== expected[1]) {
        throw new Error(`${item.route} ${viewport} ${format} has ${metadata.width}x${metadata.height}`);
      }
    }
  }
}

console.log(`Validated ${manifest.length} routes and ${manifest.length * 4} image files.`);
