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
      id: 'TOPUP_AI_ROUTER',
      name: 'ARCOX AI Router & Unified Balance Self-Funding',
      description: 'Manage the AI fleet compute runway. Top up Unified Balance and enable Auto-Pay per LLM request.',
      tools: ['get_ai_router_status', 'get_unified_balance', 'quote_unified_balance_deposit', 'deposit_unified_balance', 'set_ai_router_auto_pay'],
      parameters: { amount: 'string (e.g. 1.0)' },
      whenToUse: 'When Unified Balance is low (< 0.05 USDC) or when you want to extend the autonomous runtime of the agent fleet.',
    },
    {
      id: 'X402_INTEL',
      name: 'ARCOX Intel x402 Paid Intelligence',
      description: 'Access Arkham-backed on-chain intelligence endpoints protected by real Arc USDC x402 memo micropayments.',
      tools: ['intel_get_token', 'intel_get_address', 'x402_pay_invoice', 'x402_invoice_status'],
      parameters: { targetAddress: 'string', asset: 'USDC', price: '0.005 USDC' },
      whenToUse: 'When you need deep on-chain intelligence on token holders, whale movements, or contract reputation.',
    },
    {
      id: 'BRIDGE',
      name: 'ARCOX Cross-Chain CCTP & Native Router Bridge',
      description: 'Bridge USDC/native assets between Arc Testnet, Base Sepolia, Ethereum Sepolia, and Solana Devnet.',
      tools: ['arcox_route_status', 'arcox_quote_bridge', 'arcox_execute_bridge', 'arcox_retry_bridge'],
      parameters: { fromChain: 'Arc_Testnet', toChain: 'Base_Sepolia', token: 'USDC', amount: 'string' },
      whenToUse: 'When cross-chain liquidity rebalancing or asset migration is required.',
    },
    {
      id: 'SEND',
      name: 'ARCOX Direct Transfer / Payroll',
      description: 'Send USDC or tokens directly to another wallet address on Arc Testnet.',
      tools: ['arcox_quote_send', 'arcox_execute_send'],
      parameters: { recipient: '0x...', token: 'USDC', amount: 'string' },
      whenToUse: 'When making peer-to-peer transfers or settling payments.',
    },
    {
      id: 'AGENT_JOBS',
      name: 'ERC-8004 Identity & ERC-8183 Agent Jobs Marketplace',
      description: 'Create, fund, or complete verifiable on-chain agent jobs with Arc transaction memos.',
      tools: ['create_agent_job', 'list_agent_jobs', 'complete_agent_job'],
      parameters: { jobTitle: 'string', budgetUsdc: 'string' },
      whenToUse: 'When delegating or contracting autonomous sub-tasks to other on-chain agents.',
    },
    {
      id: 'HOLD_AND_MONITOR',
      name: 'Hold & Passive Telemetry Monitoring',
      description: 'Do not execute any on-chain transaction this cycle. Maintain current portfolio and monitor the network.',
      tools: ['arcox_wallet_balances', 'msca_status'],
      parameters: {},
      whenToUse: 'When balances are optimal, no urgent rebalancing is needed, or gas/risks are unfavorable.',
    },
  ],
}
