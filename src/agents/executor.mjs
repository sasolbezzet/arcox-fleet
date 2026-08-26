/**
 * ⚡ Executor & Treasury Agent (MCP Execution & Self-Funding)
 * Enforces native ARCOX Quote-Before-Execute MCP tool sequence via MSCA.
 * Performs autonomous self-funding: checks AI Router Unified Balance and deposits if low.
 */

export class ExecutorAgent {
  constructor({ mcpClient, memoryBank }) {
    this.agentId = 'executor-treasury-01'
    this.mcpClient = mcpClient
    this.memoryBank = memoryBank
  }

  async executeDirective(actionPlan) {
    console.log(`\n[${this.agentId}] ⚡ Executing native ARCOX Quote-Before-Execute flow via MSCA...`)
    const directive = actionPlan.executionDirective

    // 1. Step 1: Quote Swap (Read-Only)
    console.log(`[${this.agentId}] 1️⃣ Calling arcox_quote_swap for ${directive.amountIn} ${directive.tokenIn} -> ${directive.tokenOut}...`)
    const quote = await this.mcpClient.quoteSwap({
      source: directive.source,
      tokenIn: directive.tokenIn,
      tokenOut: directive.tokenOut,
      amountIn: directive.amountIn,
    })
    console.log(`   • Preview ID: ${quote.previewId}`)
    console.log(`   • Rate: ${quote.exchangeRate} | Fee: ${quote.networkFee}`)

    // 2. Step 2: Safe Confirmation & Execution
    console.log(`[${this.agentId}] 2️⃣ Executing arcox_execute_swap with explicit confirmation "yes" & previewId...`)
    const execResult = await this.mcpClient.executeSwap({
      previewId: quote.previewId,
      confirmationText: 'yes',
      confirmed: true,
    })
    console.log(`   • Swap Settled on Arc Testnet! TxHash: ${execResult.txHash}`)
    console.log(`   • Explorer: ${execResult.explorerUrl}`)

    // 3. Step 3: Self-Funding Check (AI Router Unified Balance)
    console.log(`\n[${this.agentId}] 💰 Performing Self-Funding Health Check on ARCOX AI Router...`)
    const aiRouterStatus = await this.mcpClient.getAiRouterStatus()
    const currentBalance = Number(aiRouterStatus.unifiedBalance.totalConfirmedBalance)
    console.log(`   • Current Unified Balance: $${currentBalance} USDC`)

    let topupResult = null
    if (currentBalance < 0.05) {
      console.log(`[${this.agentId}] ⚠️ Unified Balance low ($${currentBalance} < $0.05 threshold). Initiating autonomous top-up...`)
      
      const depositQuote = await this.mcpClient.quoteUnifiedBalanceDeposit({ amount: '1.0' })
      topupResult = await this.mcpClient.depositUnifiedBalance({
        previewId: depositQuote.previewId,
        confirmationText: 'yes',
        confirmed: true,
      })
      console.log(`   • Auto-Deposit Successful! New Balance: ${topupResult.newUnifiedBalance}`)
      console.log(`   • AI Router Status: Auto-Pay READY (Armada runway extended)`)
    }

    const executionSummary = {
      sender: this.agentId,
      timestamp: new Date().toISOString(),
      topic: 'EXECUTION_AND_TREASURY_SETTLED',
      swapResult: execResult,
      treasuryStatus: {
        autoTopupExecuted: Boolean(topupResult),
        newBalance: topupResult ? topupResult.newUnifiedBalance : `${currentBalance} USDC`,
      },
    }

    await this.memoryBank.recordAuditLog({
      agentId: this.agentId,
      action: 'TRANSACTION_SETTLED_AND_SELF_FUNDING',
      details: executionSummary,
    })

    return executionSummary
  }
}
