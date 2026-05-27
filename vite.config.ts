import fs, { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Bhimsen Thapa media folder on disk (do not rename files inside). Prefer `Compressed Video`, else `Compressed Videos`. */
function resolveBhimsenMediaDir(): string {
  const preferred = path.resolve(__dirname, 'Compressed Video')
  const legacy = path.resolve(__dirname, 'Compressed Videos')
  try {
    if (fs.existsSync(preferred) && fs.statSync(preferred).isDirectory()) return preferred
    if (fs.existsSync(legacy) && fs.statSync(legacy).isDirectory()) return legacy
  } catch {
    /* ignore */
  }
  return preferred
}

const bhimsenMediaDir = resolveBhimsenMediaDir()

/** Static Vision site (do not edit files in this folder — copied/served as-is at `/vision/`). */
const visionSiteDir = path.resolve(__dirname, 'Desh Uthcha Website')
const VISION_URL_PREFIX = '/vision'

/** Public Commitments Tracker (built output) served at `/commitments/`. */
const commitmentsDistDir = path.resolve(__dirname, 'Public Commitments Tracker', 'dist')
const COMMITMENTS_URL_PREFIX = '/commitments'

/** Final Desh Uthcha Website (built output) served at `/final/`. */
const finalWebsiteDistDir = path.resolve(__dirname, 'Final Desh Uthcha Website', 'dist')
const FINAL_WEBSITE_URL_PREFIX = '/final'

const VISION_MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function createStaticMiddleware(urlPrefix: string, rootAbsolute: string) {
  return function staticMiddleware(
    req: { url?: string },
    res: {
      statusCode: number
      setHeader: (k: string, v: string) => void
      end: () => void
    },
    next: () => void,
  ) {
    const raw = req.url?.split('?')[0] ?? ''
    if (raw !== urlPrefix && !raw.startsWith(`${urlPrefix}/`)) {
      next()
      return
    }
    if (raw === urlPrefix) {
      res.statusCode = 302
      res.setHeader('Location', `${urlPrefix}/`)
      res.end()
      return
    }
    let rel = raw.slice(urlPrefix.length + 1)
    if (!rel || rel === '/') rel = 'index.html'
    if (rel.includes('..')) {
      next()
      return
    }
    const normalized = path.normalize(rel)
    if (normalized.startsWith('..')) {
      next()
      return
    }
    const file = path.join(rootAbsolute, normalized)
    if (!file.startsWith(rootAbsolute)) {
      next()
      return
    }
    try {
      if (!fs.statSync(file).isFile()) {
        next()
        return
      }
    } catch {
      next()
      return
    }
    const ext = path.extname(file).toLowerCase()
    res.statusCode = 200
    res.setHeader('Content-Type', VISION_MIME[ext] ?? 'application/octet-stream')
    createReadStream(file).pipe(res as import('node:http').ServerResponse)
  }
}

function staticSiteServePlugin(
  name: string,
  urlPrefix: string,
  devRoot: string,
  previewRoot: string,
): Plugin {
  return {
    name,
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(createStaticMiddleware(urlPrefix, devRoot))
    },
    configurePreviewServer(server) {
      server.middlewares.use(createStaticMiddleware(urlPrefix, previewRoot))
    },
  }
}

/** Dev / preview: serve `Desh Uthcha Website` at `/vision/*` (full page, not the React app). */
function visionSiteServePlugin(): Plugin {
  return staticSiteServePlugin(
    'serve-desh-uthcha-vision-site',
    VISION_URL_PREFIX,
    visionSiteDir,
    path.resolve(__dirname, 'dist', 'vision'),
  )
}

/** Dev / preview: serve `Final Desh Uthcha Website/dist` at `/final/*`. */
function finalWebsiteServePlugin(): Plugin {
  return staticSiteServePlugin(
    'serve-final-desh-uthcha-website',
    FINAL_WEBSITE_URL_PREFIX,
    finalWebsiteDistDir,
    path.resolve(__dirname, 'dist', 'final'),
  )
}

/**
 * Dev / preview: serve `Public Commitments Tracker/dist` at `/commitments/*`.
 * Note: the tracker build references assets as `/assets/*`, so we also serve those from the tracker dist assets folder.
 */
function commitmentsTrackerServePlugin(): Plugin {
  const assetsPrefix = '/assets'
  return {
    name: 'serve-public-commitments-tracker',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(createStaticMiddleware(COMMITMENTS_URL_PREFIX, commitmentsDistDir))
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? ''
        if (raw !== assetsPrefix && !raw.startsWith(`${assetsPrefix}/`)) {
          next()
          return
        }
        if (raw === assetsPrefix) {
          next()
          return
        }
        let rel = raw.slice(assetsPrefix.length + 1)
        if (!rel || rel === '/' || rel.includes('..')) {
          next()
          return
        }
        const normalized = path.normalize(rel)
        if (normalized.startsWith('..')) {
          next()
          return
        }
        const file = path.join(commitmentsDistDir, 'assets', normalized)
        const assetsRoot = path.join(commitmentsDistDir, 'assets')
        if (!file.startsWith(assetsRoot)) {
          next()
          return
        }
        try {
          if (!fs.statSync(file).isFile()) {
            next()
            return
          }
        } catch {
          next()
          return
        }
        const ext = path.extname(file).toLowerCase()
        res.statusCode = 200
        res.setHeader('Content-Type', VISION_MIME[ext] ?? 'application/octet-stream')
        createReadStream(file).pipe(res as import('node:http').ServerResponse)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(createStaticMiddleware(COMMITMENTS_URL_PREFIX, path.resolve(__dirname, 'dist', 'commitments')))
    },
  }
}

/** Dev server: files at `/series-media/*` read from the Bhimsen folder above. */
function seriesMediaDevPlugin(): Plugin {
  return {
    name: 'serve-compressed-videos',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? ''
        if (!raw.startsWith('/series-media/')) {
          next()
          return
        }
        const rel = decodeURIComponent(raw.slice('/series-media/'.length))
        if (!rel || rel.includes('..')) {
          next()
          return
        }
        const normalized = path.normalize(rel)
        if (normalized.startsWith('..')) {
          next()
          return
        }
        const file = path.join(bhimsenMediaDir, normalized)
        if (!file.startsWith(bhimsenMediaDir)) {
          next()
          return
        }
        try {
          if (!fs.statSync(file).isFile()) {
            next()
            return
          }
        } catch {
          next()
          return
        }
        const ext = path.extname(file).toLowerCase()
        const mime: Record<string, string> = {
          '.mp4': 'video/mp4',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
        }
        res.statusCode = 200
        res.setHeader('Content-Type', mime[ext] ?? 'application/octet-stream')
        createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    seriesMediaDevPlugin(),
    visionSiteServePlugin(),
    finalWebsiteServePlugin(),
    commitmentsTrackerServePlugin(),
    viteStaticCopy({
      targets: [
        /* Static Vision site — files copied unchanged into `dist/vision/` (no nested folder name). */
        { src: 'Desh Uthcha Website/**/*', dest: 'vision', rename: { stripBase: 1 } },
        /* Final Desh Uthcha Website (built) — serve at `/final/`. */
        { src: 'Final Desh Uthcha Website/dist/**/*', dest: 'final', rename: { stripBase: 2 } },
        /* Public Commitments Tracker (built) — serve at `/commitments/`. */
        { src: 'Public Commitments Tracker/dist/**/*', dest: 'commitments', rename: { stripBase: 2 } },
        /* Tracker assets referenced as `/assets/*` (absolute paths). */
        { src: 'Public Commitments Tracker/dist/assets/*', dest: 'assets', rename: { stripBase: 3 } },
      ],
    }),
  ],
})
