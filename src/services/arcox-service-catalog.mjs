/**
 * ARCOX Complete Enterprise Service Catalog
 * Provides Google Gemini with comprehensive knowledge of every available tool & service in ARCOX.
 */

export const ARCOX_SERVICE_CATALOG = {
  ecosystem: 'ARCOX Decentralized Agentic Financial Infrastructure',
  blockchain: {
    network: 'Arc Testnet',
    chainId: 5042002,
    rpcUrl: 'https://rpc.testnet.arc.io',
    nativeGasToken: 'USDC (Gas is paid in USDC, 6 decimals)',
    explorer: 'https://testnet.arcscan.app',
  },
  services: [
    {
      id: 'SWAP',
      name: 'ARCOX DEX Retail Swap',
      description: 'Swap retail tokens (USDC, cirBTC, EURC) on Arc Testnet via Router 0xDf800310443BEB589CEf91A09854203Ea36e43a7.',
      tools: ['arcox_quote_swap', 'arcox_execute_swap'],
      parameters: { tokenIn: 'USDC', tokenOut: 'cirBTC | EURC', amountIn: 'string (e.g. 0.5)' },
      whenToUse: 'When you want to rebalance liquidity, capture price spreads, or acquire assets on Arc Testnet.',
    },
    {
      id: 'X402_ARKHAM_WHALE_INTEL',
      name: 'Arkham Whale Flow & Smart Money Radar (x402 Paid)',
      description: 'Query on-chain smart money movements, whale deposits, and exchange inflow/outflow on Arc Testnet via x402 micropayment.',
      tools: ['x402_pay_invoice', 'intel_get_whale_flows'],
      parameters: { asset: 'USDC', costUsdc: '0.005' },
      whenToUse: 'When evaluating market direction before large trades or checking if whales are accumulating.',
    },
    {
      id: 'X402_DEFILLAMA_YIELD_INTEL',
      name: 'DefiLlama Deep Liquidity & Yield APY (x402 Paid)',
      description: 'Query live TVL, 24h pool volume, pool depth, and yield farming APYs on Arc DEX via x402 micropayment.',
      tools: ['x402_pay_invoice', 'intel_get_pool_depth'],
      parameters: { asset: 'USDC', costUsdc: '0.003' },
      whenToUse: 'When searching for the highest yield liquidity pools or checking DEX slippage depth.',
    },
    {
      id: 'X402_COINGECKO_DEPTH_INTEL',
      name: 'CoinGecko Pro Real-Time Volatility & Orderbook (x402 Paid)',
      description: 'Fetch real-time bid/ask order book spreads, 1h/24h volatility, and momentum indicators via x402 micropayment.',
      tools: ['x402_pay_invoice', 'intel_get_market_depth'],
      parameters: { asset: 'USDC', costUsdc: '0.004' },
      whenToUse: 'When assessing short-term price volatility to optimize swap entry timing.',
    },
    {
      id: 'X402_ARC_GAS_INTEL',
      name: 'Arc On-Chain Gas & MEV Congestion Predictor (x402 Paid)',
      description: 'Predict upcoming block congestion, base fees, and MEV frontrunning risks on Arc Testnet via x402 micropayment.',
      tools: ['x402_pay_invoice', 'intel_get_gas_forecast'],
      parameters: { asset: 'USDC', costUsdc: '0.002' },
      whenToUse: 'When optimizing transaction execution fees or avoiding high congestion periods.',
    },
    {
      id: 'X402_CCTP_ARBITRAGE_INTEL',
      name: 'Cross-Chain CCTP Arbitrage Scanner (x402 Paid)',
      description: 'Scan price discrepancies across Base Sepolia, Ethereum Sepolia, and Arc Testnet via x402 micropayment.',
      tools: ['x402_pay_invoice', 'intel_get_cctp_arbitrage'],
      parameters: { asset: 'USDC', costUsdc: '0.005' },
      whenToUse: 'When identifying profitable cross-chain CCTP mint/burn arbitrage opportunities.',
    },
    {
      id: 'TOPUP_AI_ROUTER',
      name: 'ARCOX AI Router & Unified Balance Self-Funding',
      description: 'Manage the AI fleet compute runway. Top up Unified Balance and enable Auto-Pay per LLM request.',
      tools: ['get_ai_router_status', 'get_unified_balance', 'quote_unified_balance_deposit', 'deposit_unified_balance'],
      parameters: { amount: 'string (e.g. 0.05)' },
      whenToUse: 'When Unified Balance is low (< 0.05 USDC) or when maintaining autonomous agent runtime.',
    },
    {
      id: 'CLAIM_USDC_FAUCET',
      name: 'Autonomous Arc / Circle Testnet USDC Faucet Refill',
      description: 'Autonomously claim testnet USDC from faucet when wallet balance falls below operating threshold.',
      tools: ['claim_testnet_faucet'],
      parameters: { recipient: '0x...', amount: '10.0 USDC' },
      whenToUse: 'When wallet on-chain balance is critically low (< 0.20 USDC) to prevent agent starvation.',
    },
    {
      id: 'HOLD_AND_MONITOR',
      name: 'Hold & Passive Telemetry Monitoring',
      description: 'Do not execute any on-chain transaction this cycle. Maintain current portfolio and monitor the network.',
      tools: ['arcox_wallet_balances', 'msca_status'],
      parameters: {},
      whenToUse: 'When balances are optimal, intelligence signals recommend waiting, or market is consolidating.',
    },
  ],
}

