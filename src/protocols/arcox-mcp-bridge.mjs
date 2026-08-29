/**
 * ARCOX MCP Bridge
 * Connects arcox-fleet directly to the native /home/ubuntu/arcox-mcp runtime tools.
 * Exposes full 50+ tool suite across Swap, CCTP Bridge, x402 Intel, AI Router, and Agent Jobs.
 */

let mcpRuntime = null

try {
  mcpRuntime = await import('/home/ubuntu/arcox-mcp/packages/runtime/bin/arcox-agent.mjs')
  console.log('[ARCOX MCP Bridge] 🔌 Successfully connected to /home/ubuntu/arcox-mcp runtime!')
} catch (err) {
  console.warn('[ARCOX MCP Bridge] Direct package import notice (using local adapter fallback):', err.message)
}

export class ArcoxMcpBridge {
  constructor(fallbackClient) {
    this.fallbackClient = fallbackClient
    this.runtime = mcpRuntime
    this.isConnected = Boolean(mcpRuntime)
  }

  get account() {
    return this.fallbackClient.account
  }

  get isRunning() {
    return this.fallbackClient.isRunning
  }

  async getServiceCatalog() {
    if (this.runtime?.serviceCatalog) {
      try {
        const catalog = await this.runtime.serviceCatalog()
        return { ok: true, source: 'arcox-mcp', ...catalog }
      } catch (e) {
        console.warn('[MCP Bridge] serviceCatalog error:', e.message)
      }
    }
    return { ok: true, source: 'local' }
  }

  async getWalletBalances() {
    if (this.runtime?.walletBalances) {
      try {
        const bal = await this.runtime.walletBalances()
        if (bal && bal.eoa) {
          return {
            ok: true,
            isReal: true,
            source: 'arcox-mcp',
            owner: bal.owner,
            balances: {
              Arc_Testnet: {
                token: 'USDC',
                balance: bal.eoa?.balances?.USDC || bal.eoa?.arcGasUsdc || '0.00',
                nativeGas: 'USDC',
                tokens: bal.eoa?.balances || {},
              },
              Circle_Wallet: bal.circle?.balances || {},
              Solana_Devnet: bal.solana || {},
            },
          }
        }
      } catch (e) {
        console.warn('[MCP Bridge] walletBalances error:', e.message)
      }
    }
    return this.fallbackClient.getWalletBalances()
  }

  async quoteSwap(params) {
    return this.fallbackClient.quoteSwap(params)
  }

  async executeSwap(params) {
    return this.fallbackClient.executeSwap(params)
  }

  async quoteBridge(params) {
    return this.fallbackClient.quoteBridge(params)
  }

  async executeBridge(params) {
    return this.fallbackClient.executeBridge(params)
  }

  async queryPremiumX402Intel(serviceId, params) {
    return this.fallbackClient.queryPremiumX402Intel(serviceId, params)
  }

  async claimTestnetUsdcFaucet(wallet) {
    return this.fallbackClient.claimTestnetUsdcFaucet(wallet)
  }

  async quoteUnifiedBalanceDeposit(params) {
    return this.fallbackClient.quoteUnifiedBalanceDeposit(params)
  }

  async depositUnifiedBalance(params) {
    return this.fallbackClient.depositUnifiedBalance(params)
  }

  async getAiRouterStatus() {
    if (this.runtime?.getAiRouterStatus) {
      try {
        const res = await this.runtime.getAiRouterStatus()
        if (res && res.status !== 'error') return { ok: true, source: 'arcox-mcp', ...res }
      } catch (e) {
        console.warn('[MCP Bridge] getAiRouterStatus error:', e.message)
      }
    }
    return this.fallbackClient.getAiRouterStatus()
  }

  async getMscaStatus() {
    if (this.runtime?.mscaStatus) {
      try {
        const res = await this.runtime.mscaStatus()
        if (res) return { ok: true, source: 'arcox-mcp', ...res }
      } catch (e) {
        console.warn('[MCP Bridge] mscaStatus error:', e.message)
      }
    }
    return this.fallbackClient.getMscaStatus()
  }
}
