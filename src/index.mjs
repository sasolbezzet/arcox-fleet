/**
 * ARCOX Fleet HTTP Server & Autonomous Daemon
 * Google Cloud Run Entry Point with Health Check, Webhooks, and Background Event Loop.
 */

import 'dotenv/config'
import express from 'express'
import { FleetOrchestrator } from './orchestrator.mjs'

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

const orchestrator = new FleetOrchestrator({
  apiBaseUrl: process.env.ARCOX_API_BASE_URL,
  connectionToken: process.env.ARCOX_AGENT_CONNECTION_TOKEN,
  privateKey: process.env.AGENT_PRIVATE_KEY,
  rpcUrl: process.env.ARC_RPC_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  projectId: process.env.GCP_PROJECT_ID,
})

// 1. Health check & Metadata (Google Cloud Run)
app.get('/', (req, res) => {
  res.json({
    service: 'ARCOX Fleet Multi-Agent Orchestrator',
    status: 'ACTIVE',
    daemonRunning: orchestrator.isRunning,
    hackathon: 'All Things Agentic Hackathon (Google & Devpost)',
    track: 'Track 3: The Fortified Enterprise Fleet',
    brain: 'Google Gemini 3.5 Flash (@google/genai)',
    security: 'Zero-Trust Scoped Limits & Model Armor',
    blockchain: 'Arc Testnet (Chain ID 5042002 | Native Gas: USDC)',
    triggers: {
      intervalDaemon: 'Automatic every 60 seconds (Configurable)',
      webhook: 'POST /api/fleet/webhook (Event-driven)',
      manualApi: 'POST /api/fleet/run-cycle',
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// 2. Trigger 1: HTTP API Run Cycle
app.post('/api/fleet/run-cycle', async (req, res) => {
  try {
    const result = await orchestrator.runAutonomousCycle('API_REQUEST')
    res.json({ ok: true, result })
  } catch (error) {
    console.error('[Orchestrator Error]:', error)
    res.status(500).json({ ok: false, error: error.message })
  }
})

// 3. Trigger 2: Event-Driven Webhook (Circle Webhook, Arc New Block, Price Anomaly)
app.post('/api/fleet/webhook', async (req, res) => {
  const event = req.body?.event || req.body?.type || 'EXTERNAL_MARKET_EVENT'
  console.log(`\n🔔 [Webhook Trigger Received]: Event "${event}"`)
  
  // Respond 200 immediately to caller, then process agent cycle asynchronously in background
  res.json({ ok: true, message: `Autonomous cycle triggered by webhook event: ${event}` })
  
  orchestrator.runAutonomousCycle(`WEBHOOK_${event}`).catch(err => {
    console.error('[Webhook Trigger Error]:', err.message)
  })
})

// 4. View recent audit logs
app.get('/api/fleet/logs', async (req, res) => {
  try {
    const logs = await orchestrator.memoryBank.listRecentLogs(20)
    res.json({ ok: true, count: logs.length, logs })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🌐 ARCOX Fleet Cloud Run Service running on port ${PORT}`)
  
  // Auto-start Autonomous Background Daemon if configured (default: true)
  const isDaemonEnabled = String(process.env.AUTONOMOUS_DAEMON !== 'false')
  const interval = Number(process.env.AUTONOMOUS_INTERVAL_SECONDS) || 60

  if (isDaemonEnabled) {
    orchestrator.startAutonomousDaemon(interval)
  } else {
    console.log('📡 Autonomous daemon disabled. Waiting for Webhook / API triggers.')
  }
})
