/**
 * ARCOX API Client
 * Interacts directly with ARCOX backend for x402 intel, AI Router, and status endpoints.
 */

export class ArcoxApiClient {
  constructor(baseUrl = process.env.ARCOX_API_BASE_URL || 'https://arcoxdex.vercel.app', token = process.env.ARCOX_AGENT_CONNECTION_TOKEN || '') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.token = token
  }

  getHeaders(extra = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...extra,
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
      headers['x-arcox-agent-token'] = this.token
    }
    return headers
  }

  /**
   * Request an intel endpoint (returns 402 with invoice if not yet paid)
   */
  async requestIntel(path = '/api/intel/tokens', paymentId = null) {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`
    const headers = this.getHeaders()
    if (paymentId) {
      headers['x-payment-id'] = paymentId
      headers['x-arcox-payment-proof'] = JSON.stringify({ paymentId, protocol: 'x402' })
    }

    const response = await fetch(url, { headers })
    const status = response.status
    const data = await response.json().catch(() => ({}))

    return {
      status,
      isPaymentRequired: status === 402,
      isSuccess: status >= 200 && status < 300,
      invoice: data?.x402 || null,
      data,
    }
  }

  /**
   * Get AI Router status for an agent / owner
   */
  async getAiRouterStatus(ownerAddress) {
    const url = `${this.baseUrl}/api/ai-router/status?ownerAddress=${encodeURIComponent(ownerAddress || '')}`
    const res = await fetch(url, { headers: this.getHeaders() })
    return res.json()
  }

  /**
   * Check route and DEX liquidity status
   */
  async getRouteStatus() {
    const url = `${this.baseUrl}/api/routes/status`
    try {
      const res = await fetch(url, { headers: this.getHeaders() })
      if (res.ok) return await res.json()
    } catch {
      // Fallback if routes endpoint is in local state
    }
    return { ok: true, activeRoutes: ['Arc_Testnet', 'Base_Sepolia', 'Ethereum_Sepolia'] }
  }
}
