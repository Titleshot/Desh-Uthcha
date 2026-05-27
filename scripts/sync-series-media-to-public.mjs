/**
 * Sync Bhimsen series .mp4 / .webp from `Compressed Video(s)/` → `public/series-media/`
 * (committed assets used in production). Run after adding or replacing files locally.
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
const destDir = path.join(root, 'public', 'series-media')

if (!srcDir) {
  console.error('sync-series-media: no Compressed Video / Compressed Videos folder found')
  process.exit(1)
}

fs.mkdirSync(destDir, { recursive: true })
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
console.log(`sync-series-media: ${n} file(s) → public/series-media/`)
