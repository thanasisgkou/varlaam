// Auto-compress oversized images in public/images/ before build.
// Idempotent via a cache file in node_modules/.cache/.
//
// Rules:
//   - Skip files smaller than MIN_BYTES.
//   - Skip files we have already processed (cache keyed by path + mtime).
//   - Resize down to MAX_WIDTH preserving aspect ratio.
//   - PNGs with alpha stay PNG (re-compressed); other PNGs and JPEGs land
//     as JPEG q=82 mozjpeg; WebPs stay WebP.
//
// Run manually:    npm run images:compress
// Runs at build:   npm run prebuild → triggered by `npm run build`

import sharp from 'sharp';
import { readdir, readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'public', 'images');
const CACHE_DIR = join(__dirname, '..', 'node_modules', '.cache');
const CACHE_FILE = join(CACHE_DIR, 'compress-images.json');

const MAX_WIDTH = 1920;
const MIN_BYTES = 200 * 1024;            // skip anything under 200 KB
const PROCESSABLE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const SKIP_DIR_NAMES = new Set(['hero']); // hero photos already curated

function fmt(bytes) {
  return (bytes / 1024).toFixed(0) + ' KB';
}

async function loadCache() {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      yield* walk(join(dir, entry.name));
    } else if (entry.isFile()) {
      yield join(dir, entry.name);
    }
  }
}

async function compressOne(absPath, stats) {
  const ext = extname(absPath).toLowerCase();
  const buffer = await readFile(absPath);
  let processor = sharp(buffer, { failOn: 'truncated' });
  const meta = await processor.metadata();

  if (meta.width && meta.width > MAX_WIDTH) {
    processor = processor.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  let output;
  if (ext === '.png') {
    if (meta.hasAlpha) {
      output = await processor
        .png({ compressionLevel: 9, palette: true, quality: 80 })
        .toBuffer();
    } else {
      // PNG without transparency: pngquant-style compression keeps file as .png
      // so existing markdown references still work. (Converting to .jpg would
      // require rewriting every entry that links to it.)
      output = await processor
        .png({ compressionLevel: 9, palette: true, quality: 78 })
        .toBuffer();
    }
  } else if (ext === '.webp') {
    output = await processor.webp({ quality: 80, effort: 5 }).toBuffer();
  } else {
    // .jpg/.jpeg
    output = await processor.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  }

  if (output.length >= stats.size) {
    return { skipped: true };
  }
  await writeFile(absPath, output);
  return { skipped: false, before: stats.size, after: output.length };
}

async function main() {
  if (!existsSync(ROOT)) {
    console.log('🖼️  No public/images/ directory — nothing to do.');
    return;
  }

  const cache = await loadCache();
  let processed = 0;
  let skippedSmall = 0;
  let skippedCached = 0;
  let totalSaved = 0;
  const wins = [];

  for await (const absPath of walk(ROOT)) {
    const ext = extname(absPath).toLowerCase();
    if (!PROCESSABLE_EXTS.has(ext)) continue;

    const stats = await stat(absPath);
    if (stats.size < MIN_BYTES) {
      skippedSmall++;
      continue;
    }

    const relPath = relative(ROOT, absPath).replace(/\\/g, '/');
    const cacheKey = relPath;
    const cacheEntry = cache[cacheKey];
    if (
      cacheEntry &&
      cacheEntry.size === stats.size &&
      cacheEntry.mtime === stats.mtimeMs
    ) {
      skippedCached++;
      continue;
    }

    try {
      const res = await compressOne(absPath, stats);
      if (res.skipped) {
        // Mark as processed even if no win — don't keep retrying
        const after = await stat(absPath);
        cache[cacheKey] = { size: after.size, mtime: after.mtimeMs };
      } else {
        const saved = res.before - res.after;
        totalSaved += saved;
        processed++;
        wins.push({ path: relPath, before: res.before, after: res.after });
        const after = await stat(absPath);
        cache[cacheKey] = { size: after.size, mtime: after.mtimeMs };
      }
    } catch (err) {
      console.warn(`⚠️  Skipping ${relPath}: ${err.message}`);
    }
  }

  await saveCache(cache);

  if (processed === 0) {
    const note =
      skippedCached > 0
        ? ` (${skippedCached} already optimised, ${skippedSmall} under ${(MIN_BYTES / 1024).toFixed(0)}KB)`
        : '';
    console.log(`🖼️  No images needed compression${note}.`);
    return;
  }

  console.log(`🖼️  Compressed ${processed} image(s):`);
  for (const w of wins) {
    const pct = ((1 - w.after / w.before) * 100).toFixed(0);
    console.log(`   ${w.path}: ${fmt(w.before)} → ${fmt(w.after)} (-${pct}%)`);
  }
  console.log(`💾 Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('Image compression failed:', err);
  process.exit(1);
});
