import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { env, checkEnv } from './config/env.js'
import apiRoutes from './routes/index.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { ApiError } from './utils/ApiError.js'

const app = express()
const supabaseConfigured = checkEnv()

app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

function originAllowed(origin) {
  if (!origin) return true // curl / Postman / server-to-server
  if (env.clientOrigins.includes(origin)) return true
  if (env.nodeEnv === 'production' && /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin)) {
    return true
  }
  if (env.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    return true
  }
  return false
}

app.use(
  cors({
    origin(origin, callback) {
      if (originAllowed(origin)) return callback(null, true)
      return callback(new ApiError(403, `Origin ${origin} is not allowed by CORS.`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

app.use(express.json({ limit: '1mb' }))
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.get('/', (req, res) => {
  res.json({
    service: 'CafeBook API',
    version: '1.0.0',
    health: '/api/health',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CafeBook API',
    supabaseConfigured,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api', apiRoutes)

app.use(notFound)
app.use(errorHandler)

const currentFile = fileURLToPath(import.meta.url)
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : ''

if (entryFile === path.resolve(currentFile)) {
  const server = app.listen(env.port, () => {
    console.log(`\nCafeBook API listening on http://localhost:${env.port}`)
    console.log(`Environment: ${env.nodeEnv}`)
    console.log(`Allowed origins: ${env.clientOrigins.join(', ') || 'none'}`)
  })

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${env.port} is already in use. Change PORT in backend/.env or stop the other process.`,
      )
      process.exit(1)
    }
    throw error
  })
}

export default app
