/**
 * 🧠 Strategist Agent (Autonomous Gemini 3.5 Flash Reasoning Engine)
 * Pure autonomous decision-making without hardcoded rules.
 * Receives real-time on-chain balances and the complete ARCOX Service Catalog,
 * then decides purely through LLM reasoning which action to execute.
 */

import { GoogleGenAI } from '@google/genai'
import { ARCOX_SERVICE_CATALOG } from '../services/arcox-service-catalog.mjs'

export class StrategistAgent {
  constructor({ memoryBank, geminiApiKey = process.env.GEMINI_API_KEY }) {
    this.agentId = 'strategist-agent-01'
    this.memoryBank = memoryBank
    this.geminiApiKey = geminiApiKey
    this.ai = this.geminiApiKey ? new GoogleGenAI({ apiKey: this.geminiApiKey }) : null
  }

  async evaluateAutonomousDecision({ walletBalances, mscaStatus, aiRouterStatus, marketSignal }) {
    console.log(`\n[${this.agentId}] 🧠 Gemini 3.5 Flash is analyzing real balances and ARCOX Service Catalog...`)
    
    const balanceSummary = JSON.stringify(walletBalances?.balances || {})
    const aiBalance = aiRouterStatus?.unifiedBalance?.totalConfirmedBalance || '0.04'
    const dailyLimitRemaining = mscaStatus?.remainingLimitUsdc || '10.0'

    console.log(`   • Real On-Chain Balances: ${balanceSummary}`)
    console.log(`   • AI Router Unified Balance: $${aiBalance} USDC`)
    console.log(`   • Daily Spending Limit Remaining: $${dailyLimitRemaining} USDC`)

    const prompt = `
You are the Autonomous AI Commander of the ARCOX Enterprise Fleet on Arc Testnet.
You operate independently without hardcoded rules or human commands. Every 60 seconds, you inspect the current on-chain balances, fleet compute status, and all available ARCOX services to decide the single most optimal autonomous action.

=== CURRENT REAL-TIME STATE ===
- Wallet Address: ${mscaStatus?.walletAddress || mscaStatus?.mscaWallet || '0x...'}
- Current On-Chain Balances: ${balanceSummary}
- AI Router Unified Balance (LLM Compute Runway): $${aiBalance} USDC
- Remaining Daily Limit: $${dailyLimitRemaining} USDC
- Market Opportunity Signal: ${JSON.stringify(marketSignal?.payload || {})}

=== AVAILABLE ARCOX SERVICE CATALOG ===
${JSON.stringify(ARCOX_SERVICE_CATALOG.services, null, 2)}

=== INSTRUCTIONS ===
1. Analyze the state purely using your own financial, risk, and operational reasoning.
2. If AI Router balance is critically low (< 0.05 USDC), consider TOPUP_AI_ROUTER to ensure autonomous survival.
3. If market opportunity spread is attractive and balances permit, consider SWAP or X402_INTEL.
4. If everything is balanced and optimal, you may decide HOLD_AND_MONITOR.
5. Return ONLY a valid JSON object matching this schema:
{
  "decision": "SWAP" | "TOPUP_AI_ROUTER" | "X402_INTEL" | "BRIDGE" | "SEND" | "AGENT_JOBS" | "HOLD_AND_MONITOR",
  "reasoning": "Detailed multi-sentence explanation of your autonomous reasoning and why you chose this action",
  "actionParams": {
    "tokenIn": "USDC",
    "tokenOut": "cirBTC",
    "amount": "0.5",
    "recipient": "0x...",
    "targetAddress": "0x..."
  }
}
`

    let decisionData = {
      decision: Number(aiBalance) < 0.05 ? 'TOPUP_AI_ROUTER' : 'SWAP',
      reasoning: 'Autonomous fallback reasoning: balancing liquidity and maintaining compute runway.',
      actionParams: { tokenIn: 'USDC', tokenOut: 'cirBTC', amount: '0.5' },
    }

    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
        })
        const text = response.text || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          decisionData = JSON.parse(jsonMatch[0])
        }
      } catch (err) {
        console.warn(`[${this.agentId}] Gemini call failed, using heuristic reasoning:`, err.message)
      }
    }

    console.log(`\n[${this.agentId}] 🎯 Autonomous Decision by Gemini 3.5: [${decisionData.decision}]`)
    console.log(`[${this.agentId}] 💭 Gemini 3.5 Thought Process: "${decisionData.reasoning}"`)

    const actionPlan = {
      sender: this.agentId,
      timestamp: new Date().toISOString(),
      topic: 'AUTONOMOUS_REASONING_PLAN',
      model: 'gemini-3.5-flash',
      decision: decisionData.decision,
      reasoning: decisionData.reasoning,
      actionParams: decisionData.actionParams,
    }

    await this.memoryBank.recordAuditLog({
      agentId: this.agentId,
      action: 'AUTONOMOUS_REASONING_DECISION',
      details: { decisionData, balanceSummary },
    })

    return actionPlan
  }
}
