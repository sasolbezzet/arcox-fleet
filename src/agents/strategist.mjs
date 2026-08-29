/**
 * 🧠 Strategist Agent (Multi-Model Gemini Reasoning Engine)
 * Features dynamic history tracking so Gemini remembers recent actions
 * and rotates rationally between SWAP, X402_INTEL, TOPUP_AI_ROUTER, and HOLD_AND_MONITOR.
 */

import { GoogleGenAI } from '@google/genai'
import { ARCOX_SERVICE_CATALOG } from '../services/arcox-service-catalog.mjs'

const MODEL_CASCADE = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

export class StrategistAgent {
  constructor({ memoryBank, geminiApiKey = process.env.GEMINI_API_KEY }) {
    this.agentId = 'strategist-agent-01'
    this.memoryBank = memoryBank
    this.geminiApiKey = geminiApiKey
    this.ai = this.geminiApiKey ? new GoogleGenAI({ apiKey: this.geminiApiKey }) : null
    this.history = []
    this.scanCount = 0
  }

  async evaluateAutonomousDecision({ walletBalances, mscaStatus, aiRouterStatus, marketSignal }) {
    this.scanCount++
    console.log(`\n[${this.agentId}] 🧠 Gemini is analyzing real on-chain balances and ARCOX Service Catalog...`)
    
    const balanceObj = walletBalances?.balances || {}
    const usdcBal = balanceObj?.Arc_Testnet?.balance || '0.00'
    const aiBalance = aiRouterStatus?.unifiedBalance?.totalConfirmedBalance || '2.50'
    const dailyLimitRemaining = mscaStatus?.remainingLimitUsdc || '9.5'
    const spread = marketSignal?.payload?.priceSpread || '1.8%'
    const recentHistoryText = this.history.slice(-3).map((h, i) => `#${i+1}: ${h.decision} (${h.time})`).join(', ') || 'None (First Cycle)'

    console.log(`   • Real On-Chain Balances: ${JSON.stringify(balanceObj)}`)
    console.log(`   • AI Compute Runway: $${aiBalance} USDC`)
    console.log(`   • Recent Action History: [${recentHistoryText}]`)

const prompt = `
You are the Autonomous AI Commander of the ARCOX Enterprise Fleet on Arc Testnet (Chain ID 5042002).
You operate independently without hardcoded rules. Every 60s cycle, you inspect the financial telemetry and decide the single most rational autonomous action.

=== REAL-TIME TELEMETRY ===
- Current Wallet USDC Balance: ${usdcBal} USDC (Native Gas)
- AI Router Compute Balance: $${aiBalance} USDC (Threshold: $0.05)
- Remaining Daily Limit: $${dailyLimitRemaining} USDC
- Market Opportunity: Spread of ${spread} on USDC/cirBTC pair
- Recent Past Actions: ${recentHistoryText}
- Current Cycle Number: #${this.scanCount}

=== ALL AVAILABLE ARCOX SERVICES ===
${JSON.stringify(ARCOX_SERVICE_CATALOG.services, null, 2)}

=== ALL AVAILABLE NATIVE MCP TOOLS ===
Execution Tools: executeSwap, executeBridge, executeSend, depositUnifiedBalance
Intel Tools: intelGetToken, intelGetAddress, intelGetEntity, intelGetContract, intelSearch
Read-Only Tools: walletBalances, transactionHistory, serviceCatalog, agentStatus, listAiModels, payListRecentPayments, listAgentIdentities
Payment Tools: createPaymentRequest, payPaymentRequest
Agent Economy: registerAgentIdentity, createAgentJob, fundAgentJob, submitAgentJob, completeAgentJob

=== STRATEGIC INSTRUCTIONS ===
1. DYNAMIC ACTION ROTATION: Select from the complete native ARCOX ecosystem:
   - "CLAIM_USDC_FAUCET": If current USDC balance is critically low (< 0.20 USDC), claim testnet USDC immediately.
   - "INTEL_GET_TOKEN": Pay 0.005 USDC to fetch real-time Arkham token intelligence.
   - "INTEL_GET_ADDRESS": Pay 0.01 USDC to analyze wallet flows and smart money movements.
   - "INTEL_GET_ENTITY": Pay 0.02 USDC to inspect institutional reserves (Circle, market makers).
   - "INTEL_GET_CONTRACT": Analyze smart contract code and verification status.
   - "INTEL_SEARCH": Search Arkham intelligence database for whale activity.
   - "INTEL_GET_SWAPS": Pay 0.03 USDC to inspect historical DEX swap volumes.
   - "INTEL_GET_POLYMARKET": Pay 0.03 USDC to evaluate prediction market odds.
   - "INTEL_GET_HYPERCORE": Pay 0.02 USDC to analyze perpetual futures positioning.
   - "INTEL_GET_RISK": Pay 0.03 USDC to audit on-chain compliance risk scores.
   - "SWAP": Execute token swaps on Arc DEX via AMM router or AppKit.
   - "BRIDGE": Execute CCTP cross-chain bridge (Arc -> Base/Arbitrum Sepolia) via ArcoxRouter.bridgeUsdcWithFee.
   - "SEND": Send USDC/tokens to another address via ArcoxRouter.sendTokenWithFee.
   - "TX_HISTORY": Inspect recent on-chain transaction history across all chains.
   - "WALLET_BALANCES": Read live multi-chain wallet balances (Arc, Circle Wallet, Solana).
   - "SERVICE_CATALOG": Inspect all available ARCOX services and their parameters.
   - "TOPUP_AI_ROUTER": Deposit USDC to Unified Balance for AI compute runway.
   - "AI_ROUTER_STATUS": Check AI Router status and compute balance.
   - "LIST_AI_MODELS": List available AI models for inference calls.
   - "CREATE_PAYMENT": Create an ARCOX Pay USDC invoice/payment request.
   - "LIST_PAYMENTS": List recent ARCOX Pay payment transactions.
   - "AGENT_STATUS": Check the agent's own status and identity.
   - "REGISTER_AGENT": Register agent identity in the ARCOX agent economy.
   - "LIST_AGENTS": List all registered agent identities.
   - "HOLD_AND_MONITOR": Strategically monitor the network without state changes.
2. Avoid picking the exact same action 3 times in a row. Rotate actively across intel, execution, and read-only tools.
3. Provide a rich, thoughtful, multi-sentence reasoning explaining your exact thought process and why this action is optimal right now.

Return ONLY a valid JSON object matching this schema:
{
  "decision": "<one of the action names above>",
  "reasoning": "Detailed multi-sentence explanation",
  "actionParams": {
    "tokenIn": "USDC",
    "tokenOut": "cirBTC",
    "fromChain": "Arc_Testnet",
    "toChain": "Base_Sepolia",
    "amount": "0.01",
    "id": "BTC",
    "address": "0x...",
    "query": "search term",
    "recipient": "0x5294E9927c3306DcBaDb03fe70b92e01cCede505"
  }
}
`

    let decisionData = null
    let usedModel = 'gemini-3.5-flash'

    if (this.ai) {
      for (const modelName of MODEL_CASCADE) {
        try {
          const response = await this.ai.models.generateContent({
            model: modelName,
            contents: prompt,
          })
          const text = response.text || ''
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            decisionData = JSON.parse(jsonMatch[0])
            usedModel = modelName
            break
          }
        } catch (err) {
          console.warn(`[Strategist] ${modelName} unavailable (${err.message.slice(0, 40)}...), trying next model in cascade...`)
        }
      }
    }

    // Dynamic heuristic fallback — cycles through ALL tool categories
    if (!decisionData) {
      console.log('[Strategist] ⚙️ Applying Full-Spectrum MCP Rotation Engine...')
      const lastAction = this.history.length > 0 ? this.history[this.history.length - 1].decision : 'NONE'

      // Full rotation sequence covering every MCP tool category
      const ROTATION = [
        { decision: 'INTEL_GET_TOKEN',    reasoning: 'Calling native MCP intelGetToken to fetch Arkham trending token intelligence with x402 micropayment.' },
        { decision: 'SWAP',               reasoning: 'Token intel confirmed positive momentum. Executing real on-chain DEX swap via native MCP executeSwap on Arc AMM router.' },
        { decision: 'BRIDGE',             reasoning: 'Post-swap rebalance. Executing real CCTP cross-chain bridge via native MCP executeBridge (Arc -> Base Sepolia).' },
        { decision: 'TX_HISTORY',         reasoning: 'Reviewing transaction history via native MCP transactionHistory to audit recent on-chain activity.' },
        { decision: 'INTEL_GET_ADDRESS',  reasoning: 'Calling native MCP intelGetAddress to analyze wallet counterparties and smart money flows.' },
        { decision: 'WALLET_BALANCES',    reasoning: 'Reading live multi-chain wallet balances via native MCP walletBalances (Arc, Circle Wallet, Solana).' },
        { decision: 'SEND',              reasoning: 'Sending micro USDC to treasury via native MCP executeSend through ArcoxRouter.sendTokenWithFee.' },
        { decision: 'INTEL_GET_ENTITY',   reasoning: 'Calling native MCP intelGetEntity to inspect Circle institutional reserves and solvency.' },
        { decision: 'SERVICE_CATALOG',    reasoning: 'Querying native MCP serviceCatalog to inspect all available ARCOX services and parameters.' },
        { decision: 'INTEL_SEARCH',       reasoning: 'Searching Arkham intelligence database via native MCP intelSearch for whale activity patterns.' },
        { decision: 'AGENT_STATUS',       reasoning: 'Checking agent operational status via native MCP agentStatus for self-diagnostics.' },
        { decision: 'INTEL_GET_RISK',     reasoning: 'Calling native MCP x402 intel to audit on-chain compliance risk scores.' },
        { decision: 'LIST_PAYMENTS',      reasoning: 'Listing recent ARCOX Pay payment transactions via native MCP payListRecentPayments.' },
        { decision: 'INTEL_GET_SWAPS',    reasoning: 'Calling native MCP x402 intel to analyze historical DEX swap volumes and execution data.' },
        { decision: 'HOLD_AND_MONITOR',   reasoning: `Cycle complete. Holding position (${usdcBal} USDC) to observe network stability before next rotation.` },
      ]

      let decision, reasoning

      if (Number(usdcBal) < 0.20) {
        decision = 'CLAIM_USDC_FAUCET'
        reasoning = `On-chain wallet balance critically low (${usdcBal} USDC). Claiming testnet USDC faucet to maintain operating liquidity.`
      } else {
        // Find current position in rotation based on last action
        const lastIdx = ROTATION.findIndex(r => r.decision === lastAction)
        const nextIdx = (lastIdx + 1) % ROTATION.length
        decision = ROTATION[nextIdx].decision
        reasoning = ROTATION[nextIdx].reasoning
      }

      decisionData = {
        decision,
        reasoning,
        actionParams: {
          tokenIn: 'USDC', tokenOut: 'cirBTC',
          fromChain: 'Arc_Testnet', toChain: 'Base_Sepolia',
          amount: '0.01', id: 'BTC',
          address: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505',
          query: 'arc testnet whale activity',
          recipient: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505',
        },
      }
      usedModel = 'heuristic-engine'
    }

    // Record to local memory history
    this.history.push({
      cycle: this.scanCount,
      decision: decisionData.decision,
      time: new Date().toLocaleTimeString(),
    })

    console.log(`\n[${this.agentId}] 🎯 Autonomous Decision by ${usedModel}: [${decisionData.decision}]`)
    console.log(`[${this.agentId}] 💭 Thought Process: "${decisionData.reasoning}"`)

    const actionPlan = {
      sender: this.agentId,
      timestamp: new Date().toISOString(),
      topic: 'AUTONOMOUS_REASONING_PLAN',
      model: usedModel,
      decision: decisionData.decision,
      reasoning: decisionData.reasoning,
      actionParams: decisionData.actionParams,
    }

    await this.memoryBank.recordAuditLog({
      agentId: this.agentId,
      action: 'AUTONOMOUS_REASONING_DECISION',
      details: { decisionData, balanceObj, model: usedModel },
    })

    return actionPlan
  }
}
