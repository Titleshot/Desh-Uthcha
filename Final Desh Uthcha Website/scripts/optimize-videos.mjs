/**
 * Re-encode project-root MP4s for smaller files + smoother streaming (same filenames).
 * - H.264 / yuv420p (broad device support)
 * - CRF ~24 (visually close to source for most clips)
 * - max width 1280 (enough for phones / most laptops; big win on 4K masters)
 * - +faststart (moov at front → starts playing sooner)
 * - strips audio (-an) for lighter B-roll-style clips
 *
 * First run: copies originals to ./video-original-backup/
 * Re-runs: encode from backup so quality chain stays predictable.
 *
 * Usage:
 *   node scripts/optimize-videos.mjs
 *   node scripts/optimize-videos.mjs --only=Shashan
 *   node scripts/optimize-videos.mjs --dry
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const backupDir = path.join(root, "video-original-backup");

function ffmpegBin() {
  try {
    execFileSync("ffmpeg", ["-hide_banner", "-version"], { stdio: "pipe" });
    return "ffmpeg";
  } catch {
    console.error("ffmpeg not found in PATH. Install FFmpeg (e.g. winget install Gyan.FFmpeg) and retry.");
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length).toLowerCase() : "";

function listTargets() {
  return fs
    .readdirSync(root)
    .filter((f) => f.endsWith(".mp4") && !f.endsWith(".opt.tmp.mp4"))
    .filter((f) => !only || f.toLowerCase().includes(only));
}

function main() {
  const ff = ffmpegBin();
  const targets = listTargets();
  if (targets.length === 0) {
    console.log("No MP4 files matched.");
    process.exit(0);
  }
  console.log(`Found ${targets.length} file(s)${only ? ` (filter: "${only}")` : ""}.`);
  if (dry) {
    targets.forEach((t) => console.log(" -", t));
    process.exit(0);
  }

  fs.mkdirSync(backupDir, { recursive: true });

  for (const file of targets) {
    const dest = path.join(root, file);
    const backup = path.join(backupDir, file);
    const tmp = path.join(root, `${file}.opt.tmp.mp4`);

    if (!fs.existsSync(backup)) {
      console.log(`Backup → ${path.relative(root, backup)}`);
      fs.copyFileSync(dest, backup);
    }

    console.log(`Encoding: ${file} …`);
    const argv = [
      "-hide_banner",
      "-loglevel",
      "error",
      "-stats",
      "-y",
      "-i",
      backup,
      "-vf",
      "scale='min(1280,iw)':-2,format=yuv420p",
      "-c:v",
      "libx264",
      "-crf",
      "24",
      "-preset",
      "fast",
      "-movflags",
      "+faststart",
      "-an",
      tmp,
    ];
    try {
      execFileSync(ff, argv, { stdio: "inherit", cwd: root });
    } catch (e) {
      console.error(`FAILED: ${file}`, e?.message ?? e);
      try {
        fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
      process.exit(1);
    }

    const before = fs.statSync(backup).size;
    const after = fs.statSync(tmp).size;
    fs.renameSync(tmp, dest);
    console.log(`OK: ${file}  ${(before / 1e6).toFixed(2)} MB → ${(after / 1e6).toFixed(2)} MB\n`);
  }

  console.log("All done. Originals kept in video-original-backup/");
}

main();
