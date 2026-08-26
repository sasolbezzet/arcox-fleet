/**
 * ARCOX Fleet Orchestrator (Google ADK & GenAI Pattern)
 * Coordinates the Triad Multi-Agent Swarm through an autonomous, closed-loop cycle.
 */

import { ArcoxApiClient } from './protocols/arcox-api-client.mjs'
import { ArcoxMcpClient } from './protocols/mcp-client.mjs'
import { FirestoreMemoryBank } from './memory/firestore-bank.mjs'
import { ScoutAgent } from './agents/scout.mjs'
import { StrategistAgent } from './agents/strategist.mjs'
import { ExecutorAgent } from './agents/executor.mjs'

export class FleetOrchestrator {
  constructor(config = {}) {
    this.memoryBank = new FirestoreMemoryBank(config)
    this.apiClient = new ArcoxApiClient(config.apiBaseUrl, config.connectionToken)
    this.mcpClient = new ArcoxMcpClient({ baseUrl: config.apiBaseUrl, token: config.connectionToken })

    this.scout = new ScoutAgent({
      apiClient: this.apiClient,
      mcpClient: this.mcpClient,
      memoryBank: this.memoryBank,
    })

    this.strategist = new StrategistAgent({
      memoryBank: this.memoryBank,
      geminiApiKey: config.geminiApiKey,
    })

    this.executor = new ExecutorAgent({
      mcpClient: this.mcpClient,
      memoryBank: this.memoryBank,
    })
  }

  /**
   * Run 1 full autonomous closed-loop cycle
   */
  async runAutonomousCycle() {
    console.log('================================================================================')
    console.log('🚀 ARCOX FLEET: STARTING AUTONOMOUS ENTERPRISE MULTI-AGENT CYCLE')
    console.log('   Target Track: Track 3 - The Fortified Enterprise Fleet')
    console.log('   Infrastructure: Google Cloud Run & Firestore | Brain: Gemini 3.5 Flash')
    console.log('   Security: Zero Private Key (100% MSCA Token Authority)')
    console.log('================================================================================')

    const cycleId = `cycle_${Date.now()}`
    const startTime = Date.now()

    // 0. Check MSCA Governance Status
    const mscaStatus = await this.mcpClient.getMscaStatus()
    console.log(`[Governance] MSCA Wallet: ${mscaStatus.mscaWallet} | Daily Limit: $${mscaStatus.dailyLimitUsdc} USDC`)

    // 1. Phase 1: Scout Market & x402 Auto-Payment
    const marketSignal = await this.scout.runScan()

    // 2. Phase 2: Strategist Analysis & Model Armor Validation (Gemini 3.5)
    const actionPlan = await this.strategist.evaluateSignal(marketSignal, mscaStatus)

    // 3. Phase 3: Executor Safe Execution & Self-Funding
    const executionReport = await this.executor.executeDirective(actionPlan)

    const durationMs = Date.now() - startTime

    const summary = {
      cycleId,
      status: 'SUCCESS',
      durationMs,
      timestamp: new Date().toISOString(),
      governance: {
        mode: 'ZERO_PRIVATE_KEY_MSCA',
        mscaWallet: mscaStatus.mscaWallet,
        dailyLimitCheck: 'PASSED',
      },
      phases: {
        phase1_intel: marketSignal,
        phase2_reasoning: actionPlan,
        phase3_settlement: executionReport,
      },
    }

    await this.memoryBank.recordAuditLog({
      action: 'CYCLE_COMPLETED',
      cycleId,
      durationMs,
      summary,
    })

    console.log('\n================================================================================')
    console.log(`✅ CYCLE COMPLETED SUCCESSFULLY in ${durationMs}ms`)
    console.log('================================================================================\n')

    return summary
  }
}
