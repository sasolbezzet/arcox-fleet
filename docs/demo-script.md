# 🎬 Video Demo Script (~4 Minutes)
**Project:** ARCOX Fleet (Google & Devpost Hackathon)  
**Track:** Track 3 — The Fortified Enterprise Fleet  

---

### [0:00 - 0:45] Intro & The Core Problem
* **Visual:** Pitch slide / Problem statement overview.
* **Audio:** "Welcome! In this demo, we present ARCOX Fleet — a zero-trust autonomous multi-agent treasury and workflow network built on Google Cloud and Gemini 3.5. 
Today's AI agents face a major economic dilemma: without native payment capabilities, agents crash when API quotas run dry. On the other hand, giving full private keys to LLMs creates massive security risks. ARCOX Fleet solves this by giving agents scoped MSCA connection tokens, an autonomous x402 payment protocol, and self-funding AI Router capabilities."

---

### [0:45 - 1:30] Google Cloud Infrastructure & Architecture
* **Visual:** Google Cloud Console / Cloud Run Dashboard showing `arcox-fleet` service active, alongside Google Cloud Firestore collections (`agent_states`, `audit_logs`).
* **Audio:** "Our backend runs serverlessly on Google Cloud Run, leveraging Google Firestore as an enterprise persistent Memory Bank. The cognitive brain of our fleet is powered by Gemini 3.5 Flash through the Google GenAI SDK, providing rapid multi-step reasoning with zero-trust Model Armor guardrails."

---

### [1:30 - 3:00] Live Multi-Agent Execution & x402 Micropayments
* **Visual:** Split screen: Web UI / Terminal running `POST /api/fleet/run-cycle`.
* **Audio:** "Let's watch the Triad Swarm in action:
1. **Scout Agent** scans the market on Arc Network. When it hits a paywalled intelligence endpoint, it receives an HTTP 402 Payment Required response. Instead of stopping, Scout autonomously settles an on-chain x402 USDC micropayment on Arc Testnet to unlock the data!
2. **Strategist Agent** receives the unlocked data and runs it through Gemini 3.5 Flash. Our Model Armor strictly enforces MSCA daily spending limits ($10 USDC) and slippage rules before approving the trade.
3. **Executor Agent** follows the native ARCOX Quote-Before-Execute protocol, obtaining a quote preview before broadcasting the transaction on Arc Testnet via its isolated MSCA wallet."

---

### [3:00 - 3:45] Self-Funding & AI Router Auto-Pay
* **Visual:** Terminal showing AI Router Unified Balance top-up and ArcScan block explorer confirmation.
* **Audio:** "Notice what happens next: Executor Agent checks the fleet's AI Router Unified Balance. Seeing that compute credits are low, the fleet autonomously executes a deposit to its AI Router balance. The fleet has funded its own ongoing intelligence compute, operating completely self-sustained without human intervention."

---

### [3:45 - 4:00] Conclusion & Enterprise Vision
* **Visual:** Architecture diagram and Devpost summary slide.
* **Audio:** "ARCOX Fleet demonstrates the future of enterprise autonomous agents: economically empowered, natively integrated with Google Cloud and Gemini, and strictly secured with Zero-Trust governance. Thank you!"
