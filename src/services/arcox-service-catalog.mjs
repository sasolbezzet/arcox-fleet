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
      id: 'INTEL_GET_TOKEN',
      name: 'ARCOX Intel: Token Intelligence (x402 Paid)',
      description: 'Fetch real-time Arkham token intelligence, price history, market volume, holders, and trending tokens.',
      tools: ['arcox_intel_get_token', 'arcox_x402_pay_invoice'],
      parameters: { id: 'BTC | ETH | USDC | cirBTC', price: '0.005 - 0.03 USDC' },
      whenToUse: 'When evaluating token metrics, trending status, and top holder distribution before trading.',
    },
    {
      id: 'INTEL_GET_ADDRESS',
      name: 'ARCOX Intel: Address & Wallet Flows (x402 Paid)',
      description: 'Analyze on-chain wallet intelligence: balances, historical fund flows, volume, counterparties, and portfolio snapshot.',
      tools: ['arcox_intel_get_address', 'arcox_intel_get_flows', 'arcox_x402_pay_invoice'],
      parameters: { address: '0x...', price: '0.005 - 0.03 USDC' },
      whenToUse: 'When tracking smart money wallets, whale transfers, or verifying counterparty risk.',
    },
    {
      id: 'INTEL_GET_ENTITY',
      name: 'ARCOX Intel: Entity & Institutional Intelligence (x402 Paid)',
      description: 'Inspect institutional entity summaries, balances, counterparties, and predicted labels for major funds and exchanges.',
      tools: ['arcox_intel_get_entity', 'arcox_x402_pay_invoice'],
      parameters: { entity: 'circle | binance | jump-trading', price: '0.02 USDC' },
      whenToUse: 'When analyzing institutional entity holdings and exchange reserves.',
    },
    {
      id: 'INTEL_GET_SWAPS',
      name: 'ARCOX Intel: Historical DEX Swaps (x402 Paid)',
      description: 'Inspect historical on-chain DEX swap transactions across Arc and EVM chains to identify market volume trends.',
      tools: ['arcox_intel_get_swaps', 'arcox_x402_pay_invoice'],
      parameters: { price: '0.03 USDC' },
      whenToUse: 'When analyzing past DEX trade volume and average execution pricing.',
    },
    {
      id: 'INTEL_GET_POLYMARKET',
      name: 'ARCOX Intel: Polymarket Prediction Events (x402 Paid)',
      description: 'Query live Polymarket prediction market events, trading activity, order books, and odds.',
      tools: ['arcox_intel_get_polymarket', 'arcox_x402_pay_invoice'],
      parameters: { price: '0.03 USDC' },
      whenToUse: 'When incorporating real-time decentralized prediction odds into market strategy.',
    },
    {
      id: 'INTEL_GET_HYPERCORE',
      name: 'ARCOX Intel: HyperCore / Hyperliquid Perps (x402 Paid)',
      description: 'Read HyperCore perpetual positions, market liquidity, trades, and aggregate volume.',
      tools: ['arcox_intel_get_hypercore', 'arcox_x402_pay_invoice'],
      parameters: { price: '0.02 - 0.03 USDC' },
      whenToUse: 'When evaluating derivatives positioning, open interest, and perp funding rates.',
    },
    {
      id: 'INTEL_GET_RISK',
      name: 'ARCOX Intel: Compliance & Risk Score (x402 Paid)',
      description: 'Calculate on-chain compliance risk scores and traced risk transaction paths.',
      tools: ['arcox_intel_get_risk', 'arcox_x402_pay_invoice'],
      parameters: { address: '0x...', price: '0.03 - 0.05 USDC' },
      whenToUse: 'When auditing smart contracts or wallets for illicit fund exposure before interaction.',
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


