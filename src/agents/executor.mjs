/**
 * ⚡ Executor & Treasury Agent (Dynamic Multi-Service Dispatcher)
 * Dynamically executes whichever service Gemini 3.5 Flash autonomously selected,
 * strictly adhering to native ARCOX Quote-Before-Execute protocols.
 */

export class ExecutorAgent {
  constructor({ mcpClient, memoryBank }) {
    this.agentId = 'executor-treasury-01'
    this.mcpClient = mcpClient
    this.memoryBank = memoryBank
  }

  async executeDirective(actionPlan) {
    const decision = actionPlan.decision || 'SWAP'
    const params = actionPlan.actionParams || {}

    console.log(`\n[${this.agentId}] ⚡ Executing Gemini's chosen service: [${decision}]...`)

    let executionResult = null

    switch (decision) {
      case 'SWAP': {
        const tokenIn = params.tokenIn || 'USDC'
        const tokenOut = params.tokenOut || 'cirBTC'
        const amountIn = params.amount || '0.5'

        console.log(`[${this.agentId}] 1️⃣ Calling arcox_quote_swap for ${amountIn} ${tokenIn} -> ${tokenOut}...`)
        const quote = await this.mcpClient.quoteSwap({ tokenIn, tokenOut, amountIn })
        console.log(`   • Preview ID: ${quote.previewId} | Rate: ${quote.exchangeRate}`)

        console.log(`[${this.agentId}] 2️⃣ Executing arcox_execute_swap with confirmation "yes"...`)
        executionResult = await this.mcpClient.executeSwap({
          previewId: quote.previewId,
          confirmationText: 'yes',
          confirmed: true,
        })
        console.log(`   • Swap Settled on Arc Testnet! TxHash: ${executionResult.txHash}`)
        console.log(`   • Explorer: ${executionResult.explorerUrl}`)
        break
      }

      case 'TOPUP_AI_ROUTER': {
        const amount = params.amount || '1.0'
        console.log(`[${this.agentId}] 1️⃣ Quoting AI Router Unified Balance Deposit for ${amount} USDC...`)
        const quote = await this.mcpClient.quoteUnifiedBalanceDeposit({ amount })

        console.log(`[${this.agentId}] 2️⃣ Depositing ${amount} USDC to AI Router Unified Balance...`)
        executionResult = await this.mcpClient.depositUnifiedBalance({
          previewId: quote.previewId,
          confirmationText: 'yes',
          confirmed: true,
        })
        console.log(`   • Deposit Confirmed! New Unified Balance: ${executionResult.newUnifiedBalance}`)
        console.log(`   • AI Compute Runway Extended Successfully.`)
        break
      }

      case 'X402_ARKHAM_WHALE_INTEL':
      case 'X402_DEFILLAMA_YIELD_INTEL':
      case 'X402_COINGECKO_DEPTH_INTEL':
      case 'X402_ARC_GAS_INTEL':
      case 'X402_CCTP_ARBITRAGE_INTEL':
      case 'X402_INTEL': {
        const intelServiceId = decision === 'X402_INTEL' ? 'X402_ARKHAM_WHALE_INTEL' : decision
        console.log(`[${this.agentId}] 💳 Querying & paying for Premium x402 Intelligence: [${intelServiceId}]...`)
        executionResult = await this.mcpClient.queryPremiumX402Intel(intelServiceId, params)
        console.log(`   • x402 Intel Unlocked! Cost: ${executionResult.costPaid} | TxHash: ${executionResult.txHash}`)
        console.log(`   • Intelligence Payload: ${JSON.stringify(executionResult.unlockedPayload)}`)
        break
      }

      case 'CLAIM_USDC_FAUCET': {
        console.log(`[${this.agentId}] 🚰 Triggering autonomous Circle / Arc Testnet USDC Faucet claim...`)
        executionResult = await this.mcpClient.claimTestnetUsdcFaucet(params.recipient)
        console.log(`   • Faucet Disbursed: +${executionResult.claimedAmount}! TxHash: ${executionResult.txHash}`)
        break
      }

      case 'HOLD_AND_MONITOR':
      default: {
        console.log(`[${this.agentId}] 🛡️ Gemini decided to HOLD & MONITOR. Maintaining current portfolio state without on-chain execution.`)
        executionResult = {
          ok: true,
          status: 'HOLDING',
          message: 'Telemetry monitored. No on-chain balance mutation required this cycle.',
          timestamp: new Date().toISOString(),
        }
        break
      }
    }


    const executionSummary = {
      sender: this.agentId,
      timestamp: new Date().toISOString(),
      topic: 'EXECUTION_DISPATCH_COMPLETE',
      decision,
      result: executionResult,
    }

    await this.memoryBank.recordAuditLog({
      agentId: this.agentId,
      action: 'SERVICE_EXECUTED',
      details: executionSummary,
    })

    return executionSummary
  }
}
