/**
 * After `vite build`, copies `*.mp4` and `*.webp` from Compressed Video(s) into `dist/series-media/`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function resolveBhimsenMediaDir() {
  const preferred = path.join(root, 'Compressed Video')
  const legacy = path.join(root, 'Compressed Videos')
  try {
    if (fs.existsSync(preferred) && fs.statSync(preferred).isDirectory()) return preferred
    if (fs.existsSync(legacy) && fs.statSync(legacy).isDirectory()) return legacy
  } catch {
    /* ignore */
  }
  return null
}

const srcDir = resolveBhimsenMediaDir()
const destDir = path.join(root, 'dist', 'series-media')

fs.mkdirSync(destDir, { recursive: true })
if (!srcDir) {
  console.log('copy-series-media-dist: skipped (no Compressed Video folder on this machine)')
  process.exit(0)
}
let n = 0
for (const name of fs.readdirSync(srcDir)) {
  if (!/\.(mp4|webp)$/i.test(name)) continue
  const from = path.join(srcDir, name)
  try {
    if (!fs.statSync(from).isFile()) continue
  } catch {
    continue
  }
  fs.copyFileSync(from, path.join(destDir, name))
  n += 1
}
console.log(`copy-series-media-dist: ${n} file(s) → dist/series-media/`)
