# 🏆 ARCOX Fleet

**Zero-Trust Autonomous Enterprise Multi-Agent Fleet on Google Cloud & Gemini with Native ARCOX Economic Layer**

Built for the **All Things Agentic Hackathon** (Devpost & Google)  
**Category:** *Track 3: The Fortified Enterprise Fleet*

---

## 🌟 Overview

**ARCOX Fleet** is an enterprise-grade multi-agent autonomous system that solves the fundamental challenge of **Agent Economic Autonomy and Zero-Trust Financial Governance**.

Unlike traditional passive chatbots, ARCOX Fleet consists of a **Triad Multi-Agent Swarm** that runs asynchronously in the background:
1. **🕵️ Scout Agent (Intel & Market Scout):** Detects market opportunities and autonomously overcomes paid paywalls via the **x402 Arc USDC Micropayment Protocol**.
2. **🧠 Strategist Agent (Cognitive Brain & Governance):** Powered by **Google Gemini 3.5 Flash** with **Zero-Trust Model Armor** (strictly validating daily limits and slippage before execution).
3. **⚡ Executor & Treasury Agent (DEX & Self-Funding):** Executes native **Quote-Before-Execute** swaps/bridges via **MSCA Wallets (Zero Private Key!)** and maintains fleet compute runway via **ARCOX AI Router Unified Balance Auto-Pay**.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      GOOGLE CLOUD RUN RUNTIME                           │
│                                                                         │
│  ┌──────────────────┐    ┌────────────────────┐    ┌─────────────────┐ │
│  │ 🕵️ Scout Agent   │───▶│ 🧠 Strategist      │───▶│ ⚡ Executor     │ │
│  │ (x402 Auto-Payer)│    │ (Gemini 3.5 Flash) │    │ & Treasury      │ │
│  └─────────┬────────┘    └─────────┬──────────┘    └────────┬────────┘ │
│            │                       │                        │          │
│            ▼                       ▼                        ▼          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │             Google Cloud Firestore (Enterprise Memory Bank)       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (MCP & HTTP)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     NATIVE ARCOX & ARC NETWORK                          │
│                                                                         │
│  • Arc Network (Chain ID: 5042002 | RPC: https://rpc.testnet.arc.io)    │
│  • Native Gas Token: USDC                                               │
│  • MSCA Connection Tokens (arx_at_...) — Zero Raw Private Keys          │
│  • x402 Micropayments & AI Router Auto-Pay Unified Balance              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart (Spin-up Instructions for Devpost Judges)

### 1. Prerequisites
* Node.js v20+ installed
* (Optional) Google Cloud Project ID & Gemini API Key

### 2. Installation
```bash
git clone https://github.com/sasolbezzet/arcox-fleet.git
cd arcox-fleet
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
*(All parameters are pre-configured for Arc Testnet. If no Gemini API key is supplied, deterministic reasoning fallback is used).*

### 4. Run Standalone Autonomous Cycle Test
To test 1 complete autonomous cycle locally:
```bash
npm run test:cycle
```

### 5. Start the Server (Google Cloud Run Ready)
```bash
npm start
```
* The server will listen on `http://localhost:8080`.
* Health check: `GET http://localhost:8080/`
* Trigger cycle: `POST http://localhost:8080/api/fleet/run-cycle`
* View audit logs: `GET http://localhost:8080/api/fleet/logs`

---

## ☁️ Google Cloud Deployment (Cloud Run)

To deploy directly to Google Cloud Run using Cloud Build (0% local Docker load):
```bash
gcloud run deploy arcox-fleet \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🛡️ Zero-Trust Security Model
* **Zero Private Key Exposure:** No private keys are ever stored in `.env` or in memory.
* **MSCA Connection Tokens:** Each agent operates via owner-issued `arx_at_...` tokens with hard daily spending limits.
* **Quote-Before-Execute:** Value-moving tools strictly mandate preview verification before execution.
