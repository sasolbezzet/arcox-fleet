/**
 * ARCOX Fleet Orchestrator
 * Coordinates pure autonomous Gemini 3.5 decision-making every 60 seconds.
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
   * Run 1 autonomous reasoning & execution cycle
   */
  async runAutonomousCycle(triggerSource = 'SCHEDULED_DAEMON') {
    console.log('\n================================================================================')
    console.log(`🚀 ARCOX FLEET: AUTONOMOUS REASONING CYCLE [Trigger: ${triggerSource}]`)
    console.log(`   Time: ${new Date().toISOString()}`)
    console.log('   Brain: Google Gemini 3.5 Flash | Execution: Arc Testnet (5042002)')
    console.log('================================================================================')

    const cycleId = `cycle_${Date.now()}`
    const startTime = Date.now()

    // 1. Step 1: Scan real-time on-chain balances & wallet status
    console.log('📊 Step 1: Scanning on-chain balances & governance status...')
    const [walletBalances, mscaStatus, aiRouterStatus] = await Promise.all([
      this.mcpClient.getWalletBalances(),
      this.mcpClient.getMscaStatus(),
      this.mcpClient.getAiRouterStatus(),
    ])

    // 2. Step 2: Scout market snapshot
    const marketSignal = await this.scout.runScan()

    // 3. Step 3: Pure Autonomous Reasoning by Gemini 3.5 with full ARCOX Service Catalog
    const actionPlan = await this.strategist.evaluateAutonomousDecision({
      walletBalances,
      mscaStatus,
      aiRouterStatus,
      marketSignal,
    })

    // 4. Step 4: Execute Gemini's chosen action
    const executionSummary = await this.executor.executeDirective(actionPlan)

    const durationMs = Date.now() - startTime

    const summary = {
      cycleId,
      triggerSource,
      status: 'SUCCESS',
      durationMs,
      timestamp: new Date().toISOString(),
      governance: {
        mode: mscaStatus.mode,
        wallet: mscaStatus.walletAddress || mscaStatus.mscaWallet,
      },
      autonomousDecision: {
        decision: actionPlan.decision,
        reasoning: actionPlan.reasoning,
        executionResult: executionSummary.result,
      },
    }

    await this.memoryBank.recordAuditLog({
      action: 'AUTONOMOUS_CYCLE_COMPLETE',
      cycleId,
      durationMs,
      summary,
    })

    console.log('================================================================================')
    console.log(`✅ CYCLE COMPLETED in ${durationMs}ms. Gemini decided: [${actionPlan.decision}]`)
    console.log('================================================================================\n')

    return summary
  }

  /**
   * Start 60-second autonomous polling loop
   */
  startAutonomousDaemon(intervalSeconds = 60) {
    if (this.isRunning) return
    this.isRunning = true

    console.log(`\n🤖 [Autonomous Daemon Active] Gemini 3.5 will scan balances and reason every ${intervalSeconds} seconds.`)

    // Run first cycle immediately
    this.runAutonomousCycle('DAEMON_STARTUP').catch(err => console.error('[Daemon Startup Error]:', err.message))

    this.daemonTimer = setInterval(() => {
      this.runAutonomousCycle('DAEMON_HEARTBEAT').catch(err => {
        console.error('[Daemon Interval Error]:', err.message)
      })
    }, intervalSeconds * 1000)
  }

  stopAutonomousDaemon() {
    if (this.daemonTimer) {
      clearInterval(this.daemonTimer)
      this.daemonTimer = null
    }
    this.isRunning = false
    console.log('[Autonomous Daemon] Stopped.')
  }
}
