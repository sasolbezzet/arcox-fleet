/**
 * ARCOX MCP Bridge — Full Native Integration
 * Directly imports ALL 71 tools from /home/ubuntu/arcox-mcp runtime
 * and exposes a unified callTool(name, params) dispatcher so the fleet
 * agent can call ANY MCP tool autonomously from its reasoning.
 */

let mcpRuntime = null

try {
  mcpRuntime = await import('/home/ubuntu/arcox-mcp/packages/runtime/bin/arcox-agent.mjs')
  console.log('[ARCOX MCP Bridge] 🔌 Connected to native arcox-mcp runtime (' + Object.keys(mcpRuntime).filter(k => typeof mcpRuntime[k] === 'function').length + ' callable tools)')
} catch (err) {
  console.warn('[ARCOX MCP Bridge] Import failed, using fallback:', err.message)
}

// Owner address derived from the configured AGENT_PRIVATE_KEY at startup
let _ownerAddress = null
function ownerAddress(fallbackClient) {
  if (_ownerAddress) return _ownerAddress
  try {
    _ownerAddress = fallbackClient?.account?.address || process.env.AGENT_WALLET_ADDRESS || '0xf60C1BE48c75E890bF9943C104a0Da5B62A07299'
  } catch { _ownerAddress = '0xf60C1BE48c75E890bF9943C104a0Da5B62A07299' }
  return _ownerAddress
}

export class ArcoxMcpBridge {
  constructor(fallbackClient) {
    this.fallbackClient = fallbackClient
    this.runtime = mcpRuntime
    this.isConnected = Boolean(mcpRuntime)
  }

  get account() { return this.fallbackClient.account }
  get isRunning() { return this.fallbackClient.isRunning }
  get isEoaReal() { return this.fallbackClient.isEoaReal }

  /**
   * Universal MCP tool dispatcher.
   * Any tool name from arcox-mcp can be called here.
   * Returns { ok, source, ...result } on success,
   * or { ok: false, error } on failure.
   */
  async callTool(toolName, params = {}) {
    const owner = ownerAddress(this.fallbackClient)
    const fn = this.runtime?.[toolName]
    if (typeof fn !== 'function') {
      return { ok: false, error: `MCP tool "${toolName}" not found in runtime`, source: 'missing' }
    }
    try {
      console.log(`[MCP Bridge] 📡 Calling native arcox-mcp tool: ${toolName}(${JSON.stringify(params).slice(0, 120)})`)
      // Most tools accept (params) or (params, owner)
      const result = await Promise.resolve(fn(params, owner))
      console.log(`[MCP Bridge] ✅ ${toolName} returned successfully`)
      return { ok: true, source: 'arcox-mcp-native', toolName, ...result }
    } catch (err) {
      console.warn(`[MCP Bridge] ⚠️ ${toolName} error: ${err.message?.slice(0, 120)}`)
      return { ok: false, source: 'arcox-mcp-native', toolName, error: err.message }
    }
  }

  /** List all available MCP tool names */
  listTools() {
    if (!this.runtime) return []
    return Object.keys(this.runtime).filter(k => typeof this.runtime[k] === 'function')
  }

  // ─── Convenience wrappers used by the orchestrator pipeline ───

  async getWalletBalances() {
    if (this.runtime?.walletBalances) {
      try {
        const bal = await this.runtime.walletBalances()
        if (bal?.eoa) {
          return {
            ok: true, isReal: true, source: 'arcox-mcp',
            owner: bal.owner,
            balances: {
              Arc_Testnet: { token: 'USDC', balance: bal.eoa?.balances?.USDC || '0', nativeGas: 'USDC', tokens: bal.eoa?.balances || {} },
              Circle_Wallet: bal.circle?.balances || {},
              Solana_Devnet: bal.solana || {},
            },
          }
        }
      } catch (e) { console.warn('[MCP Bridge] walletBalances error:', e.message) }
    }
    return this.fallbackClient.getWalletBalances()
  }

  async getMscaStatus() {
    const r = await this.callTool('mscaStatus')
    if (r.ok) return r
    return this.fallbackClient.getMscaStatus()
  }

  async getAiRouterStatus() {
    const r = await this.callTool('getAiRouterStatus')
    if (r.ok) return r
    return this.fallbackClient.getAiRouterStatus()
  }

  // Passthrough methods for the existing internal pipeline
  async quoteSwap(p) { return this.fallbackClient.quoteSwap(p) }
  async executeSwap(p) { return this.fallbackClient.executeSwap(p) }
  async quoteBridge(p) { return this.fallbackClient.quoteBridge(p) }
  async executeBridge(p) { return this.fallbackClient.executeBridge(p) }
  async queryPremiumX402Intel(s, p) { return this.fallbackClient.queryPremiumX402Intel(s, p) }
  async claimTestnetUsdcFaucet(w) { return this.fallbackClient.claimTestnetUsdcFaucet(w) }
  async quoteUnifiedBalanceDeposit(p) { return this.fallbackClient.quoteUnifiedBalanceDeposit(p) }
  async depositUnifiedBalance(p) { return this.fallbackClient.depositUnifiedBalance(p) }
}
