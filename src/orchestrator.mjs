/**
 * ARCOX Fleet Orchestrator
 * Coordinates pure autonomous Gemini decision-making & MCP runtime dispatching.
 * Stores rich live cycle telemetry, phase state, and live log ring buffer in memory.
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
    this.intervalSeconds = Number(process.env.AUTONOMOUS_INTERVAL_SECONDS) || 60
    this.latestCycleSummary = null
    this.cycleCount = 0
    this.currentPhase = 'IDLE'
    this.activeToolName = null
    this.nextRunTimestamp = null
    this.recentLogs = []
    this.subscribers = new Set()
    this.isCycleRunning = false

    this.log('INIT', 'ARCOX Fleet Orchestrator initialized. Connected to Arc Testnet (5042002).')
  }

  log(tag, message, meta = null) {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      tag: String(tag).toUpperCase(),
      message: String(message),
      meta,
    }
    this.recentLogs.push(entry)
    if (this.recentLogs.length > 150) this.recentLogs.shift()

    // Notify live subscribers (SSE)
    for (const sub of this.subscribers) {
      try { sub(entry) } catch {}
    }

    console.log(`[${entry.tag}] ${entry.message}`)
  }

  subscribeLogs(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Run 1 autonomous reasoning & execution cycle
   */
  async runAutonomousCycle(triggerSource = 'SCHEDULED_DAEMON') {
    if (this.isCycleRunning) {
      this.log('CYCLE_GUARD', `⚠️ Cycle already in progress (Phase: ${this.currentPhase}). Skipping trigger: ${triggerSource}`)
      return { ok: true, skipped: true, reason: 'Cycle already in progress', currentPhase: this.currentPhase, latestCycle: this.latestCycleSummary }
    }

    this.isCycleRunning = true
    this.cycleCount++
    const cycleId = `cycle_${Date.now()}`
    const startTime = Date.now()

    this.log('CYCLE_START', `🚀 Starting Autonomous Cycle #${this.cycleCount} (Trigger: ${triggerSource})`)
    this.currentPhase = 'PRE_SCAN'
    this.activeToolName = 'walletBalances'

    try {
      // 1. Step 1: Pre-Execution Balance Scan
      this.log('PRE_SCAN', '📊 Step 1: Reading live on-chain balances & governance...')
      const [initialBalances, mscaStatus, aiRouterStatus] = await Promise.all([
        this.mcpClient.getWalletBalances(),
        this.mcpClient.getMscaStatus(),
        this.mcpClient.getAiRouterStatus(),
      ])
      const initialUsdc = initialBalances?.balances?.Arc_Testnet?.balance || '0.00'
      this.log('PRE_SCAN', `Arc USDC Balance: ${initialUsdc} | AI Runway: $${aiRouterStatus?.unifiedBalance?.totalConfirmedBalance || '0.00'}`)

      // 2. Step 2: Scout Market Snapshot
      this.currentPhase = 'MARKET_SCOUT'
      this.activeToolName = 'intelGetToken'
      this.log('SCOUT', '🔍 Step 2: Scout scanning Arc Network for market signals...')
      const marketSignal = await this.scout.runScan()
      this.log('SCOUT', `Market Signal: Spread ${marketSignal?.payload?.priceSpread || 'N/A'} on ${marketSignal?.payload?.tokenPair || 'USDC/cirBTC'}`)

      // 3. Step 3: Pure Autonomous Reasoning by Gemini
      this.currentPhase = 'AI_REASONING'
      this.activeToolName = 'geminiReasoning'
      this.log('STRATEGIST', '🧠 Step 3: Gemini analyzing telemetry against 71 MCP tools catalog...')
      const actionPlan = await this.strategist.evaluateAutonomousDecision({
        walletBalances: initialBalances,
        mscaStatus,
        aiRouterStatus,
        marketSignal,
      })
      this.log('STRATEGIST', `Decision: [${actionPlan.decision}] (${actionPlan.model}) — "${actionPlan.reasoning?.slice(0, 100)}..."`)

      // 4. Step 4: Execution via Viem & ARCOX Router
      this.currentPhase = 'EXECUTING_MCP'
      this.activeToolName = actionPlan.decision
      this.log('EXECUTOR', `⚡ Step 4: Dispatching action [${actionPlan.decision}] to MCP runtime...`)
      const executionSummary = await this.executor.executeDirective(actionPlan)
      const res = executionSummary.result || {}
      const txHash = res.tx || res.txHash || null
      this.log('EXECUTOR', `Execution Complete! Status: ${res.status || (res.ok ? 'SUCCESS' : 'ERROR')}${txHash ? ` | Tx: ${txHash}` : ''}`)

      // 5. Step 5: Post-Execution Reconciliation
      this.currentPhase = 'POST_RECONCILIATION'
      this.activeToolName = 'walletBalances'
      this.log('RECONCILE', '🔄 Step 5: Reading updated on-chain balances from Arc RPC (Force Refresh)...')
      const [finalBalances, updatedAiStatus] = await Promise.all([
        this.mcpClient.getWalletBalances(true),
        this.mcpClient.getAiRouterStatus(),
      ])

      const initialTokens = initialBalances?.balances?.Arc_Testnet?.tokens || {}
      const initialCirBtc = initialTokens.CIRBTC || initialTokens.cirBTC || '0.00'
      const initialEurc = initialTokens.EURC || '0.00'

      const finalTokens = finalBalances?.balances?.Arc_Testnet?.tokens || {}
      const finalUsdc = finalBalances?.balances?.Arc_Testnet?.balance || '0.00'
      const finalCirBtc = finalTokens.CIRBTC || finalTokens.cirBTC || '0.00'
      const finalEurc = finalTokens.EURC || '0.00'

      const dUsdc = Number(finalUsdc) - Number(initialUsdc)
      const dCirBtc = Number(finalCirBtc) - Number(initialCirBtc)
      const dEurc = Number(finalEurc) - Number(initialEurc)

      let deltaFormatted = ''
      if (Math.abs(dUsdc) > 0.000001) {
        deltaFormatted += `${dUsdc >= 0 ? '+' : ''}${dUsdc.toFixed(6)} USDC`
      }
      if (Math.abs(dCirBtc) > 0.000000001) {
        deltaFormatted += `${deltaFormatted ? ' / ' : ''}${dCirBtc >= 0 ? '+' : ''}${dCirBtc.toFixed(8)} cirBTC`
      }
      if (Math.abs(dEurc) > 0.000001) {
        deltaFormatted += `${deltaFormatted ? ' / ' : ''}${dEurc >= 0 ? '+' : ''}${dEurc.toFixed(6)} EURC`
      }

      // If on-chain balance change is tiny, format explicit action delta
      if (!deltaFormatted || deltaFormatted === '+0.000000 USDC') {
        if (res.costPaid) deltaFormatted = `-${res.costPaid} (x402 Intel Fee)`
        else if (res.amountBridged) deltaFormatted = `-${res.amountBridged} (Bridged to Base)`
        else if (res.depositedAmount) deltaFormatted = `-${res.depositedAmount} (Runway Deposit)`
        else if (res.amountIn && res.receivedAmount) deltaFormatted = `-${res.amountIn} ${res.tokenIn || 'USDC'} ➔ +${res.receivedAmount} ${res.tokenOut || 'cirBTC'}`
        else deltaFormatted = '0.000000 USDC (Read-Only)'
      }

      this.log('RECONCILE', `Initial: ${initialUsdc} USDC ➔ Final: ${finalUsdc} USDC (Delta: ${deltaFormatted})`)

      const durationMs = Date.now() - startTime

      const summary = {
        cycleId,
        cycleNumber: this.cycleCount,
        triggerSource,
        status: 'SUCCESS',
        durationMs,
        timestamp: new Date().toISOString(),
        governance: {
          mode: mscaStatus.mode || 'EOA_VERIFIED',
          wallet: mscaStatus.walletAddress || mscaStatus.mscaWallet || this.mcpClient.account?.address || '0xf60C1BE48c75E890bF9943C104a0Da5B62A07299',
        },
        balanceTelemetry: {
          initialBalance: `${initialUsdc} USDC`,
          finalBalance: `${finalUsdc} USDC`,
          delta: deltaFormatted,
        },
        marketSignal: marketSignal?.payload,
        autonomousDecision: {
          decision: actionPlan.decision,
          reasoning: actionPlan.reasoning,
          model: actionPlan.model,
          actionParams: actionPlan.actionParams,
          executionResult: executionSummary.result,
        },
      }

      this.latestCycleSummary = summary

      await this.memoryBank.recordAuditLog({
        action: 'AUTONOMOUS_CYCLE_COMPLETE',
        cycleId,
        durationMs,
        summary,
      })

      this.log('CYCLE_END', `✅ Cycle #${this.cycleCount} finished in ${durationMs}ms [${initialUsdc} ➔ ${finalUsdc} USDC]`)
      return summary
    } catch (err) {
      this.log('ERROR', `Cycle #${this.cycleCount} error: ${err.message}`)
      throw err
    } finally {
      this.isCycleRunning = false
      this.currentPhase = 'IDLE'
      this.activeToolName = null
      if (this.isRunning) {
        this.nextRunTimestamp = Date.now() + this.intervalSeconds * 1000
      }
    }
  }

  /**
   * Start autonomous polling loop
   */
  startAutonomousDaemon(intervalSeconds = 60) {
    if (this.isRunning) return
    this.isRunning = true
    this.intervalSeconds = intervalSeconds

    this.log('DAEMON', `🤖 Autonomous Daemon started. Interval: ${intervalSeconds}s.`)

    // Run first cycle immediately
    this.runAutonomousCycle('DAEMON_STARTUP').catch(err => this.log('ERROR', `Daemon startup failed: ${err.message}`))

    this.nextRunTimestamp = Date.now() + intervalSeconds * 1000

    this.daemonTimer = setInterval(() => {
      this.runAutonomousCycle('DAEMON_HEARTBEAT').catch(err => {
        this.log('ERROR', `Daemon interval failed: ${err.message}`)
      })
    }, intervalSeconds * 1000)
  }

  stopAutonomousDaemon() {
    if (this.daemonTimer) {
      clearInterval(this.daemonTimer)
      this.daemonTimer = null
    }
    this.isRunning = false
    this.nextRunTimestamp = null
    this.currentPhase = 'IDLE'
    this.log('DAEMON', 'Autonomous Daemon stopped.')
  }
}
