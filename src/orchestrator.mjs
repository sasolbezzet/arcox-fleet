/**
 * ARCOX Fleet Orchestrator
 * Coordinates pure autonomous Gemini decision-making.
 * Stores latest live cycle telemetry directly in memory for instant web updates.
 */

import { ArcoxApiClient } from './protocols/arcox-api-client.mjs'
import { ArcoxMcpClient } from './protocols/mcp-client.mjs'
import { ArcoxMcpBridge } from './protocols/arcox-mcp-bridge.mjs'
import { FirestoreMemoryBank } from './memory/firestore-bank.mjs'
import { ScoutAgent } from './agents/scout.mjs'
import { StrategistAgent } from './agents/strategist.mjs'
import { ExecutorAgent } from './agents/executor.mjs'

export class FleetOrchestrator {
  constructor(config = {}) {
    this.memoryBank = new FirestoreMemoryBank(config)
    this.apiClient = new ArcoxApiClient(config.apiBaseUrl, config.connectionToken)
    const nativeMcpClient = new ArcoxMcpClient({
      baseUrl: config.apiBaseUrl,
      token: config.connectionToken,
      privateKey: config.privateKey,
      rpcUrl: config.rpcUrl,
    })
    this.mcpClient = new ArcoxMcpBridge(nativeMcpClient)


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
    this.latestCycleSummary = null
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

    // 1. Step 1: Pre-Execution Balance Scan
    console.log('📊 Step 1: [PRE-EXECUTION SCAN] Reading live on-chain balances & governance...')
    const [initialBalances, mscaStatus, aiRouterStatus] = await Promise.all([
      this.mcpClient.getWalletBalances(),
      this.mcpClient.getMscaStatus(),
      this.mcpClient.getAiRouterStatus(),
    ])
    const initialUsdc = initialBalances?.balances?.Arc_Testnet?.balance || '0.00'
    console.log(`   • Pre-Scan Arc Balance: ${initialUsdc} USDC (Native Gas)`)
    console.log(`   • AI Compute Runway: $${aiRouterStatus?.unifiedBalance?.totalConfirmedBalance} USDC`)

    // 2. Step 2: Scout Market Snapshot
    const marketSignal = await this.scout.runScan()

    // 3. Step 3: Pure Autonomous Reasoning by Gemini
    const actionPlan = await this.strategist.evaluateAutonomousDecision({
      walletBalances: initialBalances,
      mscaStatus,
      aiRouterStatus,
      marketSignal,
    })

    // 4. Step 4: Execution via Viem & ARCOX Router
    const executionSummary = await this.executor.executeDirective(actionPlan)

    // 5. Step 5: Post-Execution Reconciliation
    console.log('\n🔄 Step 5: [POST-EXECUTION RECONCILIATION] Reading updated on-chain balance from Arc RPC...')
    const [finalBalances, updatedAiStatus] = await Promise.all([
      this.mcpClient.getWalletBalances(),
      this.mcpClient.getAiRouterStatus(),
    ])
    const finalUsdc = finalBalances?.balances?.Arc_Testnet?.balance || '0.00'
    const deltaUsdc = (Number(finalUsdc) - Number(initialUsdc)).toFixed(6)
    
    console.log(`   • Initial Balance: ${initialUsdc} USDC`)
    console.log(`   • Final Balance:   ${finalUsdc} USDC (Delta: ${deltaUsdc} USDC)`)
    console.log(`   • Final AI Compute Balance: $${updatedAiStatus?.unifiedBalance?.totalConfirmedBalance} USDC`)

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
      balanceTelemetry: {
        initialBalance: `${initialUsdc} USDC`,
        finalBalance: `${finalUsdc} USDC`,
        delta: `${deltaUsdc} USDC`,
      },
      autonomousDecision: {
        decision: actionPlan.decision,
        reasoning: actionPlan.reasoning,
        model: actionPlan.model,
        executionResult: executionSummary.result,
      },
    }

    // Update real-time memory snapshot
    this.latestCycleSummary = summary

    await this.memoryBank.recordAuditLog({
      action: 'AUTONOMOUS_CYCLE_COMPLETE',
      cycleId,
      durationMs,
      summary,
    })

    console.log('================================================================================')
    console.log(`✅ CYCLE COMPLETED in ${durationMs}ms [${initialUsdc} -> ${finalUsdc} USDC] | Next scan in 60s`)
    console.log('================================================================================\n')

    return summary
  }

  /**
   * Start 60-second autonomous polling loop
   */
  startAutonomousDaemon(intervalSeconds = 60) {
    if (this.isRunning) return
    this.isRunning = true

    console.log(`\n🤖 [Autonomous Daemon Active] Gemini will scan balances every ${intervalSeconds} seconds.`)

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
