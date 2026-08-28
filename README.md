# ARCOX Fleet

Autonomous multi-agent orchestrator for on-chain execution and self-funding AI workflows on the Arc Network.

**Hackathon Track:** Track 3 — The Fortified Enterprise Fleet  
**Hackathon:** All Things Agentic Hackathon (Google & Devpost)

---

## Overview

ARCOX Fleet coordinates three specialized autonomous agents that operate continuously in the background without manual prompts:

1. **Scout Agent:** Scans Arc Testnet pools and settles x402 on-chain USDC memo micropayments for paywalled intelligence data.
2. **Strategist Agent:** Evaluates financial signals and available ecosystem services using **Google Gemini 3.5 / 2.5 Flash** (`@google/genai`), applying risk guardrails before dispatching actions.
3. **Executor & Treasury Agent:** Dispatches smart contract calls (DEX Swaps, transfers) via **Viem** directly to Arc Testnet RPC and maintains fleet compute runway through the **ARCOX AI Router Unified Balance** auto-deposit loop.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     ARCOX FLEET ORCHESTRATOR                           │
│                                                                        │
│  ┌──────────────────┐    ┌────────────────────┐    ┌────────────────┐ │
│  │ 1. Scout Agent   │───▶│ 2. Strategist Agent│───▶│ 3. Executor &  │ │
│  │ (Scan & x402 Pay)│    │ (Gemini Reasoning) │    │    Treasury    │ │
│  └─────────┬────────┘    └─────────┬──────────┘    └────────┬───────┘ │
│            │                       │                        │         │
│            ▼                       ▼                        ▼         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │     State & Audit Log Manager (Google Cloud Firestore / Memory)  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Viem RPC & HTTP
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  ARC NETWORK LAYER-1 EVM (TESTNET)                     │
│                                                                        │
│  • RPC: https://rpc.testnet.arc.io | Chain ID: 5042002                 │
│  • Native Gas Token: USDC (6 decimals)                                 │
│  • Router Contract: 0xDf800310443BEB589CEf91A09854203Ea36e43a7         │
│  • Treasury / Intel: 0x5294E9927c3306DcBaDb03fe70b92e01cCede505       │
│  • Block Explorer: https://testnet.arcscan.app                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Wallet & Execution Modes

ARCOX Fleet supports multiple execution setups:

* **Direct EOA Agent Wallet (Recommended for testing):** Set `AGENT_PRIVATE_KEY` in `.env`. The agent uses Viem to sign and broadcast real on-chain transactions directly to Arc Testnet RPC.
* **Delegated MSCA Token Mode:** Set `ARCOX_AGENT_CONNECTION_TOKEN` (`arx_at_...`) for modular smart contract account integration with daily spending limits.
* **Simulation Mode:** If no keys are provided, the fleet runs in mock mode for offline testing and CI runs.

### Financial Guardrails
* **Daily Spend Limits:** Soft-capped at $10.00 USDC per day by default.
* **Slippage Threshold:** Trades with slippage exceeding 1.5% are rejected.
* **Dual-Balance Telemetry:** Compares pre-execution balance against post-execution on-chain receipts to calculate exact expenditure and gas deltas.

---

## Project Structure

```text
arcox-fleet/
├── src/
│   ├── index.mjs                    # Express server & web dashboard
│   ├── orchestrator.mjs             # Multi-agent coordination loop
│   ├── agents/
│   │   ├── scout.mjs                # Market scanner & x402 payer
│   │   ├── strategist.mjs           # Gemini reasoning & model cascade
│   │   └── executor.mjs             # Viem dispatcher & treasury agent
│   ├── memory/
│   │   └── firestore-bank.mjs       # Firestore persistent state & audit logs
│   ├── protocols/
│   │   ├── arcox-api-client.mjs     # HTTP client for ARCOX backend
│   │   └── mcp-client.mjs           # Viem EVM client & on-chain signer
│   └── services/
│       └── arcox-service-catalog.mjs# Service registry exposed to Gemini
├── scripts/
│   ├── render_perfect_video.py      # 1080p demo slide generator
│   └── compile_perfect_video.sh     # FFmpeg video compilation script
├── test/
│   └── run-autonomous-cycle.mjs     # Standalone CLI test runner
├── Dockerfile                       # Container definition for Cloud Run
├── package.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites
* Node.js v20 or later
* An Arc Testnet wallet with testnet USDC (faucet: [faucet.circle.com](https://faucet.circle.com))
* (Optional) Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
```bash
git clone https://github.com/sasolbezzet/arcox-fleet.git
cd arcox-fleet
npm install
```

### 3. Configuration
Copy the environment file and adjust permissions:
```bash
cp .env.example .env
chmod 600 .env
```

Configure `.env`:
```ini
# Google Gemini API
GEMINI_API_KEY=AIzaSy...

# Google Cloud
GCP_PROJECT_ID=arcox-fleet-hackathon
PORT=8080

# Arc Testnet Configuration
ARC_RPC_URL=https://rpc.testnet.arc.io
ARC_CHAIN_ID=5042002
ARC_USDC_CONTRACT=0x3600000000000000000000000000000000000000
ARC_EXPLORER_URL=https://testnet.arcscan.app

# Wallet Configuration (Choose one)
AGENT_PRIVATE_KEY=0x...
ARCOX_AGENT_CONNECTION_TOKEN=

# Autonomous Loop Settings
AUTONOMOUS_DAEMON=true
AUTONOMOUS_INTERVAL_SECONDS=60
```

### 4. Running a Single Test Cycle
```bash
npm run test:cycle
```

### 5. Running the Full Service & Web Dashboard
```bash
npm start
```
* Web Dashboard: `http://localhost:8080/` (or public endpoint)
* Health Check: `GET /api/fleet/status`
* Trigger Cycle: `POST /api/fleet/run-cycle`
* Audit Logs: `GET /api/fleet/logs`

---

## Real-Time Web Dashboard

The web dashboard provides live monitoring and interactive controls:
* **Live On-Chain Balance:** Continuously syncs native USDC balance from Arc RPC.
* **Gemini Reasoning Feed:** Displays the actual reasoning string generated on each cycle.
* **Execution Telemetry:** Shows pre-scan vs post-reconciliation deltas and on-chain TxHash links.
* **Daemon Controls:** Pause, resume, or trigger immediate cycles.

---

## On-Chain Verification

All executed transactions settle on the Arc Testnet and can be inspected on the explorer:

* **ArcScan Explorer:** [https://testnet.arcscan.app](https://testnet.arcscan.app)
* **Sample Swap Tx:** [`0x653c6f2bf0d051d9364545b0d1f9dbfd88db5b5412067f55e8862568c109802f`](https://testnet.arcscan.app/tx/0x653c6f2bf0d051d9364545b0d1f9dbfd88db5b5412067f55e8862568c109802f) (Block #59283984)
* **Sample Memo Tx:** [`0x11f6364044ab791625ce49bba2532c71cc5f781d731351030957fa16b960779e`](https://testnet.arcscan.app/tx/0x11f6364044ab791625ce49bba2532c71cc5f781d731351030957fa16b960779e) (Block #59290115)

---

## Google Cloud Run Deployment

To deploy to Google Cloud Run:
```bash
gcloud run deploy arcox-fleet \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## License
MIT
