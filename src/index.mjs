/**
 * ARCOX Fleet HTTP Server
 * Google Cloud Run Entry Point with Health Check and Autonomous Cycle Trigger.
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
  geminiApiKey: process.env.GEMINI_API_KEY,
  projectId: process.env.GCP_PROJECT_ID,
})

// 1. Health check & Metadata (Google Cloud Run)
app.get('/', (req, res) => {
  res.json({
    service: 'ARCOX Fleet Multi-Agent Orchestrator',
    status: 'ACTIVE',
    hackathon: 'All Things Agentic Hackathon (Google & Devpost)',
    track: 'Track 3: The Fortified Enterprise Fleet',
    brain: 'Google Gemini 3.5 Flash (@google/genai)',
    security: 'Zero-Trust MSCA Scoped Tokens (Zero Private Key in runtime)',
    blockchain: 'Arc Testnet (Chain ID 5042002 | Native Gas: USDC)',
    endpoints: {
      health: 'GET /',
      runCycle: 'POST /api/fleet/run-cycle',
      auditLogs: 'GET /api/fleet/logs',
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// 2. Trigger autonomous cycle
app.post('/api/fleet/run-cycle', async (req, res) => {
  try {
    const result = await orchestrator.runAutonomousCycle()
    res.json({ ok: true, result })
  } catch (error) {
    console.error('[Orchestrator Error]:', error)
    res.status(500).json({ ok: false, error: error.message })
  }
})

// 3. View recent audit logs
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
  console.log(`📡 Ready to execute autonomous multi-agent cycles.`)
})
