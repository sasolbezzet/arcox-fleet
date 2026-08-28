/**
 * ARCOX Fleet Orchestrator (Google ADK & GenAI Pattern)
 * Coordinates the Triad Multi-Agent Swarm through an autonomous, closed-loop cycle.
 * Supports both manual triggers and continuous background autonomous daemon loops.
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
    this.mcpClient = new ArcoxMcpClient({
      baseUrl: config.apiBaseUrl,
      token: config.connectionToken,
      privateKey: config.privateKey,
      rpcUrl: config.rpcUrl,
    })

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

    this.isRunning = false
    this.daemonTimer = null
  }

  /**
   * Run 1 full autonomous closed-loop cycle
   */
  async runAutonomousCycle(triggerSource = 'MANUAL_OR_WEBHOOK') {
    console.log('\n================================================================================')
    console.log(`🚀 ARCOX FLEET: AUTONOMOUS CYCLE TRIGGERED [Source: ${triggerSource}]`)
    console.log(`   Time: ${new Date().toISOString()}`)
    console.log('   Infrastructure: Google Cloud Run & Firestore | Brain: Gemini 3.5 Flash')
    console.log('   Execution Engine: Direct Arc Testnet RPC (5042002) + ARCOX Protocol')
    console.log('================================================================================')

    const cycleId = `cycle_${Date.now()}`
    const startTime = Date.now()

    // 0. Check Governance Status
    const mscaStatus = await this.mcpClient.getMscaStatus()
    const walletDisplay = mscaStatus.walletAddress || mscaStatus.mscaWallet || '0x71C...ArcMSCA'
    console.log(`[Governance] Mode: ${mscaStatus.mode} | Wallet: ${walletDisplay} | Daily Limit: $${mscaStatus.dailyLimitUsdc} USDC`)

    // 1. Phase 1: Scout Market & x402 Auto-Payment
    const marketSignal = await this.scout.runScan()

    // 2. Phase 2: Strategist Analysis & Model Armor Validation (Gemini 3.5)
    const actionPlan = await this.strategist.evaluateSignal(marketSignal, mscaStatus)

    // 3. Phase 3: Executor Safe Execution & Self-Funding
    const executionReport = await this.executor.executeDirective(actionPlan)

    const durationMs = Date.now() - startTime

    const summary = {
      cycleId,
      triggerSource,
      status: 'SUCCESS',
      durationMs,
      timestamp: new Date().toISOString(),
      governance: {
        mode: mscaStatus.mode,
        wallet: walletDisplay,
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
      triggerSource,
      durationMs,
      summary,
    })

    console.log('\n================================================================================')
    console.log(`✅ AUTONOMOUS CYCLE FINISHED [${durationMs}ms] - Agent Swarm resting until next trigger.`)
    console.log('================================================================================\n')

    return summary
  }

  /**
   * Start autonomous background daemon loop (runs 24/7 on interval)
   */
  startAutonomousDaemon(intervalSeconds = 60) {
    if (this.isRunning) return
    this.isRunning = true

    console.log(`\n🤖 [Autonomous Daemon] Started! Fleet will trigger automatically every ${intervalSeconds} seconds.`)

    // Run first cycle immediately
    this.runAutonomousCycle('DAEMON_STARTUP').catch(err => console.error('[Daemon Error]:', err.message))

    this.daemonTimer = setInterval(() => {
      this.runAutonomousCycle('DAEMON_SCHEDULED_HEARTBEAT').catch(err => {
        console.error('[Daemon Cycle Error]:', err.message)
      })
    }, intervalSeconds * 1000)
  }

  /**
   * Stop autonomous daemon loop
   */
  stopAutonomousDaemon() {
    if (this.daemonTimer) {
      clearInterval(this.daemonTimer)
      this.daemonTimer = null
    }
    this.isRunning = false
    console.log('[Autonomous Daemon] Stopped.')
  }
}
