// Downscale public/icons/campaigns/ to the size the icons are actually rendered at.
// CampaignIcon draws them at 1.3em-1.7em, so 64px tall covers 3x DPR.
// Filenames and formats are preserved so no campaign.icon_url values change.
// Sources are read from original-icons/campaigns/, which is outside public/ and
// therefore never copied into the build.
//
//   npm i -D sharp && node scripts/shrink-icons.js [--dry]
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "original-icons/campaigns");
const OUT = path.join(ROOT, "public/icons/campaigns");
const TARGET_H = 64;
const DRY = process.argv.includes("--dry");

const files = fs.readdirSync(SRC).filter((f) => fs.statSync(path.join(SRC, f)).isFile());

(async () => {
  let before = 0, after = 0, resized = 0, skipped = 0;

  for (const f of files) {
    const src = path.join(SRC, f);
    const origBytes = fs.statSync(src).size;
    before += origBytes;

    const meta = await sharp(src).metadata();
    const ext = path.extname(f).toLowerCase();
    let pipeline = sharp(src).resize({ height: TARGET_H, withoutEnlargement: true });
    if (ext === ".png") pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    else if (ext === ".jpg" || ext === ".jpeg") pipeline = pipeline.jpeg({ quality: 82 });
    else if (ext === ".webp") pipeline = pipeline.webp({ quality: 85 });
    else pipeline = null;

    // leave anything already small enough, an unsupported format, or that would
    // grow on re-encode (several icons are already optimal 8-bit palette PNGs)
    let buf = null;
    if (pipeline && meta.height && meta.height > TARGET_H) buf = await pipeline.toBuffer();
    if (!buf || buf.length >= origBytes) {
      if (!DRY && src !== path.join(OUT, f)) fs.copyFileSync(src, path.join(OUT, f));
      after += origBytes;
      skipped++;
      continue;
    }

    if (!DRY) fs.writeFileSync(path.join(OUT, f), buf);
    after += buf.length;
    resized++;
  }

  console.log(`${DRY ? "[dry run] " : ""}${files.length} files: ${resized} resized, ${skipped} copied as-is`);
  console.log(`${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB`
    + ` (${(100 * (before - after) / before).toFixed(1)}% smaller)`);
})();
