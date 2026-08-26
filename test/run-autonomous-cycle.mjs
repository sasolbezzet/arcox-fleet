/**
 * Standalone Test Runner for 1 Autonomous Cycle
 */

import 'dotenv/config'
import { FleetOrchestrator } from '../src/orchestrator.mjs'

async function main() {
  const orchestrator = new FleetOrchestrator({
    apiBaseUrl: process.env.ARCOX_API_BASE_URL,
    connectionToken: process.env.ARCOX_AGENT_CONNECTION_TOKEN,
    geminiApiKey: process.env.GEMINI_API_KEY,
    projectId: process.env.GCP_PROJECT_ID,
  })

  const result = await orchestrator.runAutonomousCycle()
  console.log('Result Output:\n', JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error('Execution failed:', err)
  process.exit(1)
})
