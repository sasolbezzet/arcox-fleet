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

=== STRATEGIC INSTRUCTIONS ===
1. DYNAMIC ACTION ROTATION: To maintain an active and versatile fleet, distribute your decisions actively across cycles:
   - "SWAP": Execute whenever there is adequate balance (> 0.2 USDC) and market spread opportunity exists.
   - "X402_INTEL": Spend a small 0.005 USDC to query paywalled on-chain Arkham data and discover new liquidity signals.
   - "TOPUP_AI_ROUTER": If AI compute balance is below $3.00, allocate 0.01-0.05 USDC to maintain compute runway.
   - "HOLD_AND_MONITOR": Use strategically when observing market transitions or immediately after large balance changes.
2. Avoid picking the exact same action 3 times in a row. Rotate actively to demonstrate full multi-agent ecosystem mastery.
3. Provide a rich, thoughtful, multi-sentence reasoning explaining your exact thought process and why this action is optimal right now.


Return ONLY a valid JSON object matching this schema:
{
  "decision": "HOLD_AND_MONITOR" | "SWAP" | "X402_INTEL" | "TOPUP_AI_ROUTER" | "BRIDGE" | "SEND",
  "reasoning": "Detailed multi-sentence explanation of your autonomous reasoning and strategic rationale for this cycle",
  "actionParams": {
    "tokenIn": "USDC",
    "tokenOut": "cirBTC",
    "amount": "0.5",
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
          console.warn(`[${this.agentId}] Model ${modelName} rate-limited or busy, cascading to next model...`)
        }
      }
    }

    // Dynamic heuristic fallback
    if (!decisionData) {
      usedModel = 'heuristic-engine'
      const lastDecision = this.history.length > 0 ? this.history[this.history.length - 1].decision : null
      
      if (Number(aiBalance) < 0.05) {
        decisionData = {
          decision: 'TOPUP_AI_ROUTER',
          reasoning: `AI compute balance ($${aiBalance} USDC) is low. Depositing 1.0 USDC to extend autonomous fleet runtime.`,
          actionParams: { amount: '1.0' },
        }
      } else if (lastDecision === 'SWAP') {
        decisionData = {
          decision: 'HOLD_AND_MONITOR',
          reasoning: `A token swap was executed in the previous cycle. Holding current position (${usdcBal} USDC) to prevent unnecessary gas consumption and monitor market reaction.`,
          actionParams: {},
        }
      } else if (lastDecision === 'HOLD_AND_MONITOR') {
        decisionData = {
          decision: 'X402_INTEL',
          reasoning: `Scanning for on-chain whale activity. Settling 0.005 USDC x402 micropayment to fetch real-time Arc DEX liquidity intelligence.`,
          actionParams: { amount: '0.005', recipient: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505' },
        }
      } else {
        decisionData = {
          decision: 'SWAP',
          reasoning: `Detected a favorable ${spread} spread on USDC/cirBTC on Arc Testnet. Allocating a modest 0.5 USDC to capture spread while maintaining ample capital buffer (${usdcBal} USDC).`,
          actionParams: { tokenIn: 'USDC', tokenOut: 'cirBTC', amount: '0.5' },
        }
      }
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
