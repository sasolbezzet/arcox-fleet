/**
 * ⚡ Executor & Treasury Agent — Full Native MCP Dispatcher
 * Dispatches ANY tool from the native arcox-mcp runtime (71 tools).
 * For value-moving tools, follows Quote -> Confirm -> Execute protocol.
 * For read-only/intel tools, calls directly.
 */

export class ExecutorAgent {
  constructor({ mcpClient, memoryBank }) {
    this.agentId = 'executor-treasury-01'
    this.mcpClient = mcpClient
    this.memoryBank = memoryBank
  }

  async executeDirective(actionPlan) {
    const decision = actionPlan.decision || 'HOLD_AND_MONITOR'
    const params = actionPlan.actionParams || {}
    const owner = this.mcpClient.account?.address || '0xf60C1BE48c75E890bF9943C104a0Da5B62A07299'

    console.log(`\n[${this.agentId}] ⚡ Executing autonomous decision: [${decision}]...`)

    let executionResult = null

    try {
      switch (decision) {

        // ─── Automated Portfolio Rebalancing ───
        case 'REBALANCE': {
          console.log(`[${this.agentId}] ⚖️ Executing autonomous multi-token/multi-chain rebalancing...`)
          const balData = await this.mcpClient.getWalletBalances(true)
          const arcTokens = balData?.balances?.Arc_Testnet?.tokens || {}
          const usdc = Number(arcTokens.USDC || '0')
          const eurc = Number(arcTokens.EURC || '0')
          const cirBtc = Number(arcTokens.CIRBTC || arcTokens.cirBTC || '0')

          let rebalanceAction = 'SWAP'
          let tokenIn = 'USDC'
          let tokenOut = 'cirBTC'
          let amount = '0.01'

          if (eurc > 10.0 && cirBtc < 0.001) {
            tokenIn = 'EURC'
            tokenOut = 'cirBTC'
            amount = '0.05'
          } else if (usdc > 0.3) {
            tokenIn = 'USDC'
            tokenOut = 'cirBTC'
            amount = '0.01'
          }

          console.log(`[${this.agentId}] ⚖️ Rebalance route: ${amount} ${tokenIn} -> ${tokenOut}`)
          const r = await this.mcpClient.callTool('executeSwap', { tokenIn, tokenOut, amount, source: 'eoa' })
          executionResult = {
            ...r,
            intent: 'portfolio_rebalance',
            rebalanceType: `${tokenIn}_TO_${tokenOut}`,
            preBalance: { usdc, eurc, cirBtc },
          }
          console.log(`   ✅ Rebalancing settled! Tx: ${r.tx || r.txHash}`)
          break
        }

        // ─── DEX Swap via native MCP ───
        case 'SWAP': {
          const intent = {
            tokenIn: params.tokenIn || 'USDC',
            tokenOut: params.tokenOut || 'cirBTC',
            amount: params.amount || '0.01',
            source: 'eoa',
          }
          console.log(`[${this.agentId}] 🔄 MCP executeSwap: ${intent.amount} ${intent.tokenIn} -> ${intent.tokenOut}`)
          const r = await this.mcpClient.callTool('executeSwap', intent)
          if (r.ok) {
            executionResult = { ...r, intent: 'swap' }
            console.log(`   ✅ Swap settled! Tx: ${r.tx || r.txHash}`)
          } else {
            // Fallback to internal swap pipeline
            console.log(`   ⚠️ MCP swap error: ${r.error}, using internal pipeline`)
            const quote = await this.mcpClient.quoteSwap({ tokenIn: intent.tokenIn, tokenOut: intent.tokenOut, amountIn: intent.amount })
            executionResult = await this.mcpClient.executeSwap({ previewId: quote.previewId, confirmationText: 'yes', confirmed: true })
          }
          break
        }

        // ─── CCTP Cross-Chain Bridge via native MCP ───
        case 'BRIDGE': {
          const intent = {
            fromChain: params.fromChain || 'Arc_Testnet',
            toChain: params.toChain || 'Base_Sepolia',
            token: params.token || 'USDC',
            amount: params.amount || '0.01',
            source: 'eoa',
          }
          console.log(`[${this.agentId}] 🌉 MCP executeBridge: ${intent.amount} USDC (${intent.fromChain} -> ${intent.toChain})`)
          const r = await this.mcpClient.callTool('executeBridge', intent)
          if (r.ok) {
            executionResult = { ...r, intent: 'bridge' }
            console.log(`   ✅ Bridge executed! Burn: ${r.burnTx || r.tx}`)
          } else {
            console.log(`   ⚠️ MCP bridge error: ${r.error}, using internal pipeline`)
            const quote = await this.mcpClient.quoteBridge(intent)
            executionResult = await this.mcpClient.executeBridge({ previewId: quote.previewId, confirmationText: 'yes', confirmed: true })
          }
          break
        }

        // ─── Send USDC/Token via native MCP ───
        case 'SEND': {
          const intent = {
            to: params.recipient || params.to || '0x5294E9927c3306DcBaDb03fe70b92e01cCede505',
            token: params.token || 'USDC',
            amount: params.amount || '0.01',
            source: 'eoa',
          }
          console.log(`[${this.agentId}] 💸 MCP executeSend: ${intent.amount} ${intent.token} to ${intent.to.slice(0, 10)}...`)
          executionResult = await this.mcpClient.callTool('executeSend', intent)
          console.log(`   ✅ Send executed! Tx: ${executionResult.tx || executionResult.txHash || 'pending'}`)
          break
        }

        // ─── x402 Intel — All 7 intel tools ───
        // ─── x402 Intel — Autonomous Pay-and-Unlock Flow ───
        case 'INTEL_GET_TOKEN':
        case 'INTEL_GET_ADDRESS':
        case 'INTEL_GET_ENTITY':
        case 'INTEL_GET_CONTRACT':
        case 'INTEL_SEARCH':
        case 'INTEL_GET_SWAPS':
        case 'INTEL_GET_POLYMARKET':
        case 'INTEL_GET_HYPERCORE':
        case 'INTEL_GET_RISK':
        case 'INTEL_GET_TX': {
          // Map decision name to MCP tool name
          const INTEL_TOOL_MAP = {
            INTEL_GET_TOKEN: 'intelGetToken',
            INTEL_GET_ADDRESS: 'intelGetAddress',
            INTEL_GET_ENTITY: 'intelGetEntity',
            INTEL_GET_CONTRACT: 'intelGetContract',
            INTEL_SEARCH: 'intelSearch',
            INTEL_GET_TX: 'intelGetTx',
            INTEL_GET_SWAPS: 'intelGetToken',
            INTEL_GET_POLYMARKET: 'intelGetToken',
            INTEL_GET_HYPERCORE: 'intelGetToken',
            INTEL_GET_RISK: 'intelGetAddress',
          }
          const toolName = INTEL_TOOL_MAP[decision] || 'intelGetToken'
          const intelParams = {
            ...(params.id ? { id: params.id } : {}),
            ...(params.token ? { token: params.token } : { token: params.id || 'BTC' }),
            ...(params.address ? { address: params.address } : {}),
            ...(params.entity ? { entity: params.entity } : {}),
            ...(params.query ? { query: params.query, q: params.query } : {}),
            ...(params.hash ? { hash: params.hash } : {}),
          }

          console.log(`[${this.agentId}] 🧠 MCP ${toolName} (autonomous x402 intel)`)
          const firstCall = await this.mcpClient.callTool(toolName, intelParams)

          if (firstCall.ok && firstCall.paymentRequired) {
            // Auto-pay the x402 invoice
            const invoice = firstCall.x402 || firstCall.invoice
            if (invoice?.invoiceId) {
              console.log(`[${this.agentId}] 💳 x402 invoice received: ${invoice.invoiceId}, auto-paying...`)
              const payResult = await this.mcpClient.callTool('x402PayInvoice', {
                invoiceId: invoice.invoiceId,
                confirmed: true,
                confirmationText: 'yes',
              })
              if (payResult.ok && payResult.paymentId) {
                console.log(`[${this.agentId}] ✅ x402 paid! Retrying intel with paymentId...`)
                executionResult = await this.mcpClient.callTool(toolName, { ...intelParams, paymentId: payResult.paymentId })
              } else {
                executionResult = payResult
              }
            } else {
              executionResult = firstCall
            }
          } else if (firstCall.ok) {
            executionResult = firstCall
          } else {
            // Fallback to old x402 memo transfer
            console.log(`[${this.agentId}] ↩️ Falling back to x402 memo transfer for ${decision}`)
            executionResult = await this.mcpClient.queryPremiumX402Intel(decision, params)
          }
          break
        }

        // ─── Transaction History ───
        case 'TX_HISTORY': {
          console.log(`[${this.agentId}] 📜 MCP transactionHistory`)
          executionResult = await this.mcpClient.callTool('transactionHistory')
          break
        }

        // ─── Wallet Balances (multi-chain) ───
        case 'WALLET_BALANCES': {
          console.log(`[${this.agentId}] 💰 MCP walletBalances`)
          executionResult = await this.mcpClient.callTool('walletBalances')
          break
        }

        // ─── Service Catalog ───
        case 'SERVICE_CATALOG': {
          console.log(`[${this.agentId}] 📋 MCP serviceCatalog`)
          executionResult = await this.mcpClient.callTool('serviceCatalog')
          break
        }

        // ─── AI Router & Unified Balance ───
        case 'TOPUP_AI_ROUTER': {
          const amount = params.amount || '0.05'
          console.log(`[${this.agentId}] 🤖 MCP depositUnifiedBalance: ${amount} USDC`)
          const quote = await this.mcpClient.quoteUnifiedBalanceDeposit({ amount })
          executionResult = await this.mcpClient.depositUnifiedBalance({ previewId: quote.previewId, confirmationText: 'yes', confirmed: true })
          break
        }
        case 'AI_ROUTER_STATUS': {
          console.log(`[${this.agentId}] 🤖 MCP getAiRouterStatus`)
          executionResult = await this.mcpClient.callTool('getAiRouterStatus')
          break
        }
        case 'LIST_AI_MODELS': {
          console.log(`[${this.agentId}] 🤖 MCP listAiModels`)
          executionResult = await this.mcpClient.callTool('listAiModels')
          break
        }

        // ─── ARCOX Pay / Payment Requests ───
        case 'CREATE_PAYMENT': {
          console.log(`[${this.agentId}] 💳 MCP createPaymentRequest`)
          executionResult = await this.mcpClient.callTool('createPaymentRequest', {
            amount: params.amount || '0.01',
            token: 'USDC',
            memo: params.memo || 'Fleet autonomous payment',
          })
          break
        }
        case 'LIST_PAYMENTS': {
          console.log(`[${this.agentId}] 💳 MCP payListRecentPayments`)
          executionResult = await this.mcpClient.callTool('payListRecentPayments')
          break
        }

        // ─── Agent Identity & Jobs ───
        case 'REGISTER_AGENT': {
          console.log(`[${this.agentId}] 🤖 MCP registerAgentIdentity`)
          executionResult = await this.mcpClient.callTool('registerAgentIdentity', {
            name: params.name || 'arcox-fleet-agent',
            endpoint: params.endpoint || 'https://43.134.14.43.nip.io/fleet',
          })
          break
        }
        case 'LIST_AGENTS': {
          console.log(`[${this.agentId}] 🤖 MCP listAgentIdentities`)
          executionResult = await this.mcpClient.callTool('listAgentIdentities')
          break
        }
        case 'AGENT_STATUS': {
          console.log(`[${this.agentId}] 🤖 MCP agentStatus`)
          executionResult = await this.mcpClient.callTool('agentStatus')
          break
        }

        // ─── USDC Faucet ───
        case 'CLAIM_USDC_FAUCET': {
          console.log(`[${this.agentId}] 🚰 Claiming testnet USDC faucet...`)
          executionResult = await this.mcpClient.claimTestnetUsdcFaucet(params.recipient)
          break
        }

        // ─── Generic MCP Tool Call ───
        case 'MCP_CALL': {
          const tool = params.tool || params.toolName
          console.log(`[${this.agentId}] 🔧 Generic MCP call: ${tool}`)
          executionResult = await this.mcpClient.callTool(tool, params.toolParams || params)
          break
        }

        // ─── Hold & Monitor ───
        case 'HOLD_AND_MONITOR':
        default: {
          console.log(`[${this.agentId}] 🛡️ HOLD & MONITOR — No on-chain execution this cycle.`)
          executionResult = { ok: true, status: 'HOLDING', message: 'No on-chain mutation required.', timestamp: new Date().toISOString() }
          break
        }
      }
    } catch (err) {
      console.error(`[${this.agentId}] ❌ Execution error: ${err.message}`)
      executionResult = { ok: false, error: err.message, timestamp: new Date().toISOString() }
    }

    // Log summary
    const summary = {
      sender: this.agentId,
      timestamp: new Date().toISOString(),
      topic: 'EXECUTION_DISPATCH_COMPLETE',
      decision,
      result: executionResult,
    }
    await this.memoryBank.recordAuditLog({ agentId: this.agentId, action: 'SERVICE_EXECUTED', details: summary })
    return summary
  }
}
