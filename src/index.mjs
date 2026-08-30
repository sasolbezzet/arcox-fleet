/**
 * ARCOX Fleet HTTP Server & Real-Time Interactive Monitoring Dashboard
 * 100% Real-Time Data | Live SSE Stream | 71 MCP Tools Explorer & Interactive Runner
 * Comprehensive Button Audit & Functional Integration
 */

import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { FleetOrchestrator } from './orchestrator.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-arcox-agent-token, x-payment-id, x-arcox-payment-proof, Accept, Origin, X-Requested-With')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Serve static files (including demo video, thumbnail, architecture diagram)
app.use(express.static(path.join(__dirname, '../public')))

const orchestrator = new FleetOrchestrator({
  apiBaseUrl: process.env.ARCOX_API_BASE_URL,
  connectionToken: process.env.ARCOX_AGENT_CONNECTION_TOKEN,
  privateKey: process.env.AGENT_PRIVATE_KEY,
  rpcUrl: process.env.ARC_RPC_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  projectId: process.env.GCP_PROJECT_ID,
})

// ─── 1. Main Real-Time Dashboard Route ───
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARCOX Fleet — Live Autonomous Commander</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            darkbg: '#070B14',
            cardbg: '#0F172A',
            subcard: '#162038',
            accent: '#38BDF8',
            glow: '#6366F1'
          }
        }
      }
    }
  </script>
  <style>
    @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.85; transform: scale(1.01); } }
    .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
    .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scroll::-webkit-scrollbar-track { background: #0b1120; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
    .custom-scroll::-webkit-scrollbar-thumb:hover { background: #334155; }
  </style>
</head>
<body class="bg-darkbg text-slate-100 min-h-screen font-sans antialiased p-3 md:p-6 custom-scroll">
  <div class="max-w-7xl mx-auto space-y-5">
    
    <!-- Top Header -->
    <header class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-cardbg border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
      <div class="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
            🚀
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-teal-300">
                ARCOX Fleet Commander
              </h1>
              <span id="daemon-badge" class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LIVE (60s)</span>
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5 font-mono">
              Arc Testnet (5042002) • Native Gas: USDC • 71 Native MCP Tools Integrated
            </p>
          </div>
        </div>
      </div>

      <!-- Header Controls & Media Downloads -->
      <div class="relative z-10 flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <div class="bg-subcard/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-mono text-slate-300">
          <span class="text-slate-500">NEXT SCAN:</span>
          <span id="countdown-timer" class="font-bold text-amber-400">--s</span>
        </div>

        <button id="btn-faucet" onclick="openFaucetModal()" class="px-3 py-2 text-xs md:text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition shadow-lg flex items-center gap-1.5 active:scale-95">
          <span>🚰</span> <span>Faucet</span>
        </button>

        <a href="/download-demo" class="px-3 py-2 text-xs md:text-sm font-semibold rounded-xl bg-teal-700 hover:bg-teal-600 text-white transition shadow-lg flex items-center gap-1.5 active:scale-95" title="Download MP4 Demo Video">
          <span>📥</span> <span>Demo Video</span>
        </a>

        <a href="/download-architecture" target="_blank" class="px-3 py-2 text-xs md:text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-lg flex items-center gap-1.5 active:scale-95" title="View Architecture Diagram">
          <span>📐</span> <span>Diagram</span>
        </a>

        <button id="btn-toggle-daemon" onclick="toggleDaemon()" class="px-3 py-2 text-xs md:text-sm font-semibold rounded-xl transition shadow-lg flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white active:scale-95">
          <span id="toggle-icon">⏸</span> <span id="toggle-text">Pause</span>
        </button>

        <button id="btn-trigger" onclick="triggerManualCycle()" class="px-4 py-2 text-xs md:text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg flex items-center gap-1.5 active:scale-95 shadow-indigo-600/30">
          <span>⚡</span> <span>Scan Now</span>
        </button>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
      <button onclick="switchTab('tab-live')" id="btn-tab-live" class="tab-btn px-4 py-2 text-xs md:text-sm font-bold rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-2 transition">
        <span>⚡</span> <span>Live Autonomous Feed</span>
      </button>
      <button onclick="switchTab('tab-tools')" id="btn-tab-tools" class="tab-btn px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-cardbg hover:bg-subcard text-slate-400 border border-slate-800 flex items-center gap-2 transition">
        <span>🧰</span> <span>MCP 71 Tools Explorer</span>
        <span id="tools-count-badge" class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-teal-300 font-mono">71</span>
      </button>
      <button onclick="switchTab('tab-ledger')" id="btn-tab-ledger" class="tab-btn px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-cardbg hover:bg-subcard text-slate-400 border border-slate-800 flex items-center gap-2 transition">
        <span>📜</span> <span>Audit Ledger</span>
      </button>
      <button onclick="switchTab('tab-terminal')" id="btn-tab-terminal" class="tab-btn px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-cardbg hover:bg-subcard text-slate-400 border border-slate-800 flex items-center gap-2 transition">
        <span>💻</span> <span>Live Terminal Stream</span>
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </button>
    </div>

    <!-- ═══════════ TAB 1: LIVE AUTONOMOUS FEED ═══════════ -->
    <div id="tab-live" class="tab-content space-y-5">
      
      <!-- Stepper: Real-Time Cycle Phase -->
      <div class="bg-cardbg border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
            <span>🔄</span> <span>Autonomous Pipeline Stepper</span>
          </span>
          <span id="cycle-count-badge" class="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800/50">
            Cycle #--
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          <div id="step-prescan" class="step-card bg-subcard border border-slate-800 rounded-xl p-3 text-center transition duration-300">
            <div class="text-slate-500 text-[10px] uppercase">Phase 1</div>
            <div class="font-bold text-slate-300 mt-0.5 flex items-center justify-center gap-1">
              <span>📊</span> <span>Pre-Scan</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-1 truncate">Balances & MSCA</div>
          </div>
          <div id="step-scout" class="step-card bg-subcard border border-slate-800 rounded-xl p-3 text-center transition duration-300">
            <div class="text-slate-500 text-[10px] uppercase">Phase 2</div>
            <div class="font-bold text-slate-300 mt-0.5 flex items-center justify-center gap-1">
              <span>🔍</span> <span>Market Scout</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-1 truncate">x402 Intel Feeds</div>
          </div>
          <div id="step-reasoning" class="step-card bg-subcard border border-slate-800 rounded-xl p-3 text-center transition duration-300">
            <div class="text-slate-500 text-[10px] uppercase">Phase 3</div>
            <div class="font-bold text-slate-300 mt-0.5 flex items-center justify-center gap-1">
              <span>🧠</span> <span>Gemini AI</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-1 truncate">Strategy Selection</div>
          </div>
          <div id="step-executing" class="step-card bg-subcard border border-slate-800 rounded-xl p-3 text-center transition duration-300">
            <div class="text-slate-500 text-[10px] uppercase">Phase 4</div>
            <div class="font-bold text-slate-300 mt-0.5 flex items-center justify-center gap-1">
              <span>⚡</span> <span>MCP Execute</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-1 truncate">On-Chain Router</div>
          </div>
          <div id="step-reconcile" class="step-card bg-subcard border border-slate-800 rounded-xl p-3 text-center col-span-2 sm:col-span-1 transition duration-300">
            <div class="text-slate-500 text-[10px] uppercase">Phase 5</div>
            <div class="font-bold text-slate-300 mt-0.5 flex items-center justify-center gap-1">
              <span>🔄</span> <span>Reconcile</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-1 truncate">Audit & Telemetry</div>
          </div>
        </div>
      </div>

      <!-- Real Multi-Chain Balances Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <!-- 1. Arc Testnet EOA -->
        <div class="bg-cardbg border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">Arc Testnet</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Chain 5042002</span>
          </div>
          <div class="text-xl font-black text-white mt-1.5 font-mono" id="stat-balance">Loading...</div>
          <div class="mt-2 space-y-1 text-[11px] font-mono text-slate-400">
            <div class="flex justify-between items-center">
              <a href="https://testnet.arcscan.app/token/0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" target="_blank" class="text-slate-400 hover:text-teal-300">EURC ↗</a>
              <span id="bal-eurc" class="text-slate-200 font-bold">0.00</span>
            </div>
            <div class="flex justify-between items-center">
              <a href="https://testnet.arcscan.app/token/0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF" target="_blank" class="text-slate-400 hover:text-teal-300">cirBTC ↗</a>
              <span id="bal-cirbtc" class="text-slate-200 font-bold">0.00</span>
            </div>
            <div class="flex justify-between items-center">
              <a href="https://testnet.arcscan.app/token/0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C" target="_blank" class="text-slate-400 hover:text-teal-300">USYC ↗</a>
              <span id="bal-usyc" class="text-slate-200 font-bold">0.00</span>
            </div>
          </div>
        </div>

        <!-- 2. Base Sepolia (CCTP Destination) -->
        <div class="bg-cardbg border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">Base Sepolia</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">CCTP Mint</span>
          </div>
          <div class="text-xl font-black text-blue-300 mt-1.5 font-mono" id="stat-base-usdc">Loading...</div>
          <div class="mt-2 space-y-1 text-[11px] font-mono text-slate-400">
            <div class="flex justify-between items-center">
              <a href="https://sepolia.basescan.org/token/0x036CbD53842c5426634e7929541eC2318f3dCF7e" target="_blank" class="text-slate-400 hover:text-blue-300">USDC ↗</a>
              <span class="text-slate-500 text-[10px]">CCTP V2 Minted</span>
            </div>
            <div class="text-[10px] text-slate-500 truncate">Domain: 6 (Base)</div>
          </div>
        </div>

        <!-- 3. Circle Developer Wallet -->
        <div class="bg-cardbg border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">Circle Dev Wallet</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Proxy EOA</span>
          </div>
          <div class="text-xl font-black text-cyan-300 mt-1.5 font-mono" id="stat-circle-usdc">-- USDC</div>
          <div class="mt-2 space-y-1 text-[11px] font-mono text-slate-400">
            <div class="flex justify-between"><span>EURC:</span> <span id="bal-circle-eurc" class="text-slate-200">--</span></div>
            <div class="flex justify-between"><span>cirBTC:</span> <span id="bal-circle-cirbtc" class="text-slate-200">--</span></div>
          </div>
        </div>

        <!-- 4. Solana Devnet -->
        <div class="bg-cardbg border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">Solana Devnet</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">SPL USDC</span>
          </div>
          <div class="text-xl font-black text-purple-300 mt-1.5 font-mono" id="stat-solana-usdc">-- USDC</div>
          <div class="mt-2 space-y-1 text-[10px] font-mono text-slate-400">
            <div class="truncate text-slate-500" id="solana-address">ATA: Loading...</div>
            <div class="text-purple-400 text-[10px]">CCTP Router Program</div>
          </div>
        </div>

        <!-- 5. AI Router Unified Balance -->
        <div class="bg-cardbg border border-slate-800 rounded-2xl p-4 shadow-xl col-span-1 sm:col-span-2 lg:col-span-1">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-400">AI Compute Runway</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Unified Bal</span>
          </div>
          <div class="text-xl font-black text-indigo-300 mt-1.5 font-mono" id="stat-ai-balance">Loading...</div>
          <div class="mt-2 text-[10px] text-indigo-400/80 font-mono">
            Auto-Pay Active per LLM Request
          </div>
        </div>
      </div>

      <!-- Real-Time Scout Market Intelligence Telemetry Card -->
      <div class="bg-cardbg border border-teal-500/30 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">🕵️</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Live Scout Market Intelligence & x402 Telemetry</h3>
          </div>
          <span class="text-[11px] text-teal-400 font-mono px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/50">
            x402 Auto-Pay Protocol Active
          </span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div class="bg-subcard border border-slate-800 rounded-xl p-3">
            <div class="text-slate-500 text-[10px] uppercase">Monitored Pair</div>
            <div class="font-bold text-white mt-1 text-sm" id="scout-pair">USDC / cirBTC</div>
            <div class="text-[10px] text-teal-400 mt-0.5">Arc DEX AMM Pool</div>
          </div>
          <div class="bg-subcard border border-slate-800 rounded-xl p-3">
            <div class="text-slate-500 text-[10px] uppercase">Price Spread</div>
            <div class="font-bold text-emerald-400 mt-1 text-sm" id="scout-spread">+2.4% Arb</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Opportunity Detected</div>
          </div>
          <div class="bg-subcard border border-slate-800 rounded-xl p-3">
            <div class="text-slate-500 text-[10px] uppercase">Scout x402 Micropay</div>
            <div class="font-bold text-indigo-300 mt-1 text-sm" id="scout-x402-cost">0.005 USDC</div>
            <div class="text-[10px] text-indigo-400 mt-0.5 truncate" id="scout-x402-status">Unlocked via memo</div>
          </div>
          <div class="bg-subcard border border-slate-800 rounded-xl p-3">
            <div class="text-slate-500 text-[10px] uppercase">Active Target Router</div>
            <div class="font-bold text-cyan-300 mt-1 text-sm font-mono truncate" id="scout-router">0xDf80031044...</div>
            <div class="text-[10px] text-slate-400 mt-0.5">ArcoxRouter.sol</div>
          </div>
        </div>
      </div>

      <!-- Live Gemini Autonomous Reasoning Box -->
      <div class="bg-cardbg border border-indigo-500/30 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3 relative z-10">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🧠</span>
            <div>
              <h2 class="text-base md:text-lg font-bold text-white">Live Gemini Strategic Reasoning</h2>
              <p class="text-[11px] text-slate-400 font-mono" id="reasoning-meta">Model: Gemini 3.5 Flash | Status: Active</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span id="gemini-decision-tag" class="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 uppercase tracking-wider font-mono">
              ANALYZING...
            </span>
          </div>
        </div>

        <div class="bg-subcard border border-slate-800 rounded-xl p-4 shadow-inner relative z-10">
          <div class="text-[11px] uppercase text-slate-400 font-semibold mb-2 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-indigo-300">
              <span>💭</span> <span>Autonomous Thought Stream:</span>
            </span>
            <span id="reasoning-time" class="text-[10px] text-slate-500 font-mono">Syncing...</span>
          </div>
          <blockquote id="gemini-thought" class="text-sm md:text-base text-slate-200 italic font-mono leading-relaxed">
            "Connecting to autonomous fleet orchestrator..."
          </blockquote>

          <!-- Action Parameters Tag Grid -->
          <div id="action-params-container" class="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs font-mono">
            <!-- Dynamic Params -->
          </div>
        </div>
      </div>

      <!-- Latest Real On-Chain Execution Card -->
      <div class="bg-cardbg border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <span>⚡</span> <span>Latest Execution & On-Chain Proof</span>
          </h2>
          <span id="report-timestamp" class="text-xs text-slate-400 font-mono">Just now</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-subcard border border-slate-800 rounded-xl p-4">
            <div class="text-xs text-slate-400 uppercase font-semibold">Action & Route</div>
            <div class="text-base font-bold text-teal-300 mt-1 font-mono" id="report-action">-</div>
            <div class="text-xs text-slate-400 mt-1 font-mono truncate" id="report-intent">-</div>
          </div>
          <div class="bg-subcard border border-slate-800 rounded-xl p-4">
            <div class="text-xs text-slate-400 uppercase font-semibold">Balance Delta</div>
            <div class="text-base font-bold text-amber-300 mt-1 font-mono" id="report-delta">-</div>
            <div class="text-xs text-slate-400 mt-1 font-mono" id="report-balance-range">-</div>
          </div>
          <div class="bg-subcard border border-slate-800 rounded-xl p-4">
            <div class="text-xs text-slate-400 uppercase font-semibold">On-Chain Verification</div>
            <div class="text-sm font-bold text-blue-400 mt-1 font-mono truncate" id="report-txhash">No Tx yet</div>
            <div class="text-xs text-slate-400 mt-1" id="report-explorer">-</div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════ TAB 2: MCP 71 TOOLS EXPLORER ═══════════ -->
    <div id="tab-tools" class="tab-content hidden space-y-5">
      <div class="bg-cardbg border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <span>🧰</span> <span>ARCOX Native MCP 71-Tools Catalog</span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Direct execution bridge to <code class="text-teal-300">/home/ubuntu/arcox-mcp/packages/runtime/bin/arcox-agent.mjs</code>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input id="tools-search-input" oninput="filterTools()" type="text" placeholder="Search 71 tools..." class="px-3.5 py-2 bg-subcard border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full md:w-64 font-mono">
          </div>
        </div>

        <!-- Category Filters -->
        <div class="flex flex-wrap gap-1.5 text-xs font-mono">
          <button onclick="filterCategory('ALL', this)" class="tool-cat-btn px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold transition">All (71)</button>
          <button onclick="filterCategory('EXECUTION', this)" class="tool-cat-btn px-3 py-1.5 rounded-lg bg-subcard hover:bg-slate-800 text-slate-300 border border-slate-800 transition">⚡ Execution</button>
          <button onclick="filterCategory('INTEL', this)" class="tool-cat-btn px-3 py-1.5 rounded-lg bg-subcard hover:bg-slate-800 text-slate-300 border border-slate-800 transition">🧠 Intel (x402)</button>
          <button onclick="filterCategory('TELEMETRY', this)" class="tool-cat-btn px-3 py-1.5 rounded-lg bg-subcard hover:bg-slate-800 text-slate-300 border border-slate-800 transition">📊 Telemetry</button>
          <button onclick="filterCategory('PAYMENT', this)" class="tool-cat-btn px-3 py-1.5 rounded-lg bg-subcard hover:bg-slate-800 text-slate-300 border border-slate-800 transition">💳 ARCOX Pay</button>
          <button onclick="filterCategory('AGENT', this)" class="tool-cat-btn px-3 py-1.5 rounded-lg bg-subcard hover:bg-slate-800 text-slate-300 border border-slate-800 transition">🤖 Agent Economy</button>
        </div>

        <!-- Tools Grid -->
        <div id="tools-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto custom-scroll pr-1">
          <div class="col-span-full py-8 text-center text-slate-500">Loading 71 MCP tools...</div>
        </div>
      </div>
    </div>

    <!-- ═══════════ TAB 3: AUDIT LEDGER ═══════════ -->
    <div id="tab-ledger" class="tab-content hidden space-y-5">
      <div class="bg-cardbg border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <span>📜</span> <span>Real-Time Audit Ledger</span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">Permanent on-chain audit trail recorded to Firestore Memory Bank</p>
          </div>
          <span id="ledger-count-badge" class="px-2.5 py-1 text-xs font-mono rounded-lg bg-subcard border border-slate-800 text-slate-300">0 logs</span>
        </div>

        <div class="overflow-x-auto custom-scroll">
          <table class="w-full text-left text-xs md:text-sm text-slate-300">
            <thead class="text-[11px] text-slate-400 uppercase bg-slate-900/90 border-b border-slate-800 font-mono">
              <tr>
                <th class="px-3 py-2.5">Time</th>
                <th class="px-3 py-2.5">Decision</th>
                <th class="px-3 py-2.5">Model</th>
                <th class="px-3 py-2.5">Balance Delta</th>
                <th class="px-3 py-2.5">On-Chain TxHash (ArcScan)</th>
              </tr>
            </thead>
            <tbody id="ledger-table-body" class="divide-y divide-slate-800/50 font-mono">
              <tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">Loading audit history...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════ TAB 4: LIVE TERMINAL STREAM ═══════════ -->
    <div id="tab-terminal" class="tab-content hidden space-y-5">
      <div class="bg-cardbg border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 class="text-sm md:text-base font-bold text-white font-mono">Agent Console Live Stream</h2>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="clearTerminal()" class="px-2.5 py-1 text-xs rounded-lg bg-subcard hover:bg-slate-800 text-slate-400 border border-slate-800 font-mono">Clear</button>
            <span id="sse-status" class="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-mono">CONNECTED</span>
          </div>
        </div>

        <div id="terminal-body" class="bg-black/90 border border-slate-800/80 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 custom-scroll select-text">
          <div class="text-slate-600">-- Live event stream initialized --</div>
        </div>
      </div>
    </div>

    <!-- ═══════════ INTERACTIVE TOOL RUNNER MODAL ═══════════ -->
    <div id="tool-modal" onclick="handleModalBackdrop(event, 'tool-modal')" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
      <div class="bg-cardbg border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scroll" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">⚡</span>
            <div>
              <h3 id="modal-tool-name" class="text-base font-bold text-white font-mono">Tool Runner</h3>
              <p id="modal-tool-cat" class="text-[11px] text-teal-400 font-mono">Native MCP Function</p>
            </div>
          </div>
          <button onclick="closeToolModal()" class="text-slate-400 hover:text-white text-xl font-bold p-1">✕</button>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs uppercase font-bold text-slate-400 font-mono">Parameters (JSON):</label>
            <button onclick="resetDefaultParams()" class="text-[11px] text-indigo-400 hover:underline font-mono">Reset Defaults</button>
          </div>
          <textarea id="modal-tool-params" rows="5" class="w-full p-3 bg-subcard border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"></textarea>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button onclick="closeToolModal()" class="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Cancel</button>
          <button id="btn-execute-tool" onclick="executeSelectedTool()" class="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5">
            <span>▶</span> <span>Execute MCP Tool</span>
          </button>
        </div>

        <div id="modal-tool-result-container" class="hidden space-y-2 pt-2 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase font-bold text-slate-400 font-mono">Execution Response:</span>
            <span id="modal-tool-status" class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">SUCCESS</span>
          </div>
          <pre id="modal-tool-result" class="p-3 bg-black/80 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-200 overflow-x-auto max-h-60 custom-scroll"></pre>
        </div>
      </div>
    </div>

    <!-- ═══════════ FAUCET MODAL ═══════════ -->
    <div id="faucet-modal" onclick="handleModalBackdrop(event, 'faucet-modal')" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
      <div class="bg-cardbg border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🚰</span>
            <h3 class="text-lg font-bold text-white">Circle Testnet USDC Faucet</h3>
          </div>
          <button onclick="closeFaucetModal()" class="text-slate-400 hover:text-white text-xl font-bold p-1">✕</button>
        </div>

        <p class="text-xs text-slate-300">
          Klaim 10 USDC testnet gratis langsung di <b>faucet.circle.com</b> atau gunakan backend auto-refuel.
        </p>

        <div class="bg-subcard border border-slate-800 rounded-xl p-3 space-y-1.5">
          <div class="text-[11px] text-slate-400 font-semibold uppercase">Fleet Agent Wallet Address:</div>
          <div class="flex items-center justify-between gap-2">
            <span id="faucet-wallet-addr" class="font-mono text-xs text-indigo-300 break-all select-all font-semibold">0xf60C1BE48c75E890bF9943C104a0Da5B62A07299</span>
            <button onclick="copyWalletAddress()" class="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 font-medium">
              <span id="copy-btn-text">Copy</span>
            </button>
          </div>
        </div>

        <div class="space-y-2 pt-1">
          <a href="https://faucet.circle.com/" target="_blank" onclick="copyWalletAddress()" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95">
            <span>📋</span>
            <span>Salin Address & Buka Circle Faucet ↗</span>
          </a>
          <button id="btn-modal-autorefuel" onclick="claimFaucetBackend()" class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition">
            <span>⚡</span>
            <span>Jalankan Auto-Refuel Backend</span>
          </button>
        </div>
      </div>
    </div>

  </div>

  <script>
    let isDaemonActive = true;
    let nextRunTime = null;
    let allToolsList = [];
    let currentCategory = 'ALL';
    let currentActiveTool = null;

    // Handle Escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeToolModal();
        closeFaucetModal();
      }
    });

    function handleModalBackdrop(event, modalId) {
      if (event.target.id === modalId) {
        if (modalId === 'tool-modal') closeToolModal();
        if (modalId === 'faucet-modal') closeFaucetModal();
      }
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => {
        el.className = 'tab-btn px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-cardbg hover:bg-subcard text-slate-400 border border-slate-800 flex items-center gap-2 transition';
      });
      document.getElementById(tabId).classList.remove('hidden');
      const activeBtn = document.getElementById('btn-' + tabId);
      if (activeBtn) {
        activeBtn.className = 'tab-btn px-4 py-2 text-xs md:text-sm font-bold rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-2 transition';
      }
    }

    function getApiEndpoint(endpoint) {
      const prefix = window.location.pathname.startsWith('/fleet') ? '/fleet' : '';
      return prefix + endpoint;
    }

    async function requestFleetApi(endpoint, options = {}) {
      const url = getApiEndpoint(endpoint);
      try {
        const res = await fetch(url, options);
        if (res.ok) return await res.json();
      } catch (err) {}

      try {
        const fallbackUrl = 'https://43.134.14.43.nip.io/fleet' + endpoint;
        const res2 = await fetch(fallbackUrl, options);
        return await res2.json();
      } catch (err2) {
        return { ok: false, error: err2.message };
      }
    }

    // ─── Dashboard State Refresh ───
    async function updateDashboard() {
      try {
        const statusRes = await requestFleetApi('/api/fleet/status');
        if (statusRes && statusRes.ok) {
          isDaemonActive = statusRes.daemonRunning;
          updateDaemonUI(isDaemonActive);

          if (statusRes.nextRunTimestamp) {
            nextRunTime = statusRes.nextRunTimestamp;
          }

          if (statusRes.cycleCount) {
            document.getElementById('cycle-count-badge').innerText = 'Cycle #' + statusRes.cycleCount;
          }

          // Update Stepper
          updateStepper(statusRes.currentPhase);

          // Update Balances
          const balObj = statusRes.balances?.balances || {};
          const arcData = balObj?.Arc_Testnet || {};
          const arcBal = arcData.balance || '0.00';
          document.getElementById('stat-balance').innerText = Number(arcBal).toFixed(4) + ' USDC';
          
          const tokens = arcData.tokens || {};
          document.getElementById('bal-eurc').innerText = tokens.EURC || '0.00';
          document.getElementById('bal-cirbtc').innerText = tokens.CIRBTC || tokens.cirBTC || '0.00';
          document.getElementById('bal-usyc').innerText = tokens.USYC || '0.00';

          // Base Sepolia CCTP Balance
          const baseData = balObj?.Base_Sepolia || {};
          document.getElementById('stat-base-usdc').innerText = (baseData.balance || '0.00') + ' USDC';

          // AI Router Unified Balance
          document.getElementById('stat-ai-balance').innerText = '$' + (statusRes.aiRouterStatus?.unifiedBalance?.totalConfirmedBalance || '0.00') + ' USDC';

          // Circle Dev Wallet
          const circleBal = balObj?.Circle_Wallet || {};
          document.getElementById('stat-circle-usdc').innerText = (circleBal.USDC || '0.00') + ' USDC';
          document.getElementById('bal-circle-eurc').innerText = circleBal.EURC || '0.00';
          document.getElementById('bal-circle-cirbtc').innerText = circleBal.cirBTC || '0.00';

          // Solana Devnet
          const solBal = balObj?.Solana_Devnet || {};
          document.getElementById('stat-solana-usdc').innerText = (solBal.usdc?.amount || '0.00') + ' USDC';
          document.getElementById('solana-address').innerText = 'ATA: ' + (solBal.usdc?.ata ? solBal.usdc.ata.slice(0, 8) + '...' : 'N/A');

          // Update Scout Market Signal
          if (statusRes.latestCycle?.marketSignal) {
            const sig = statusRes.latestCycle.marketSignal;
            document.getElementById('scout-pair').innerText = sig.tokenPair || 'USDC / cirBTC';
            document.getElementById('scout-spread').innerText = (sig.priceSpread || '+2.4%') + ' Arb';
            document.getElementById('scout-x402-status').innerText = sig.x402Paid ? 'Paid: ' + (sig.x402TxHash ? sig.x402TxHash.slice(0, 8) + '...' : 'Confirmed') : 'Unlocked';
          }

          // Update Latest Cycle Reasoning & Execution
          if (statusRes.latestCycle && statusRes.latestCycle.autonomousDecision) {
            const dec = statusRes.latestCycle.autonomousDecision;
            const telem = statusRes.latestCycle.balanceTelemetry || {};
            const resObj = dec.executionResult || {};

            document.getElementById('gemini-decision-tag').innerText = dec.decision || 'HOLD_AND_MONITOR';
            document.getElementById('gemini-thought').innerText = '"' + dec.reasoning + '"';
            document.getElementById('reasoning-meta').innerText = 'Model: ' + (dec.model || 'Gemini 3.5 Flash') + ' • Updated: ' + new Date(statusRes.latestCycle.timestamp).toLocaleTimeString();
            document.getElementById('reasoning-time').innerText = new Date(statusRes.latestCycle.timestamp).toLocaleTimeString();
            
            // Action Params
            const paramsContainer = document.getElementById('action-params-container');
            const p = dec.actionParams || {};
            let paramsHtml = '';
            for (const [k, v] of Object.entries(p)) {
              paramsHtml += '<span class="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700"><b>' + k + ':</b> ' + String(v).slice(0, 24) + '</span>';
            }
            paramsContainer.innerHTML = paramsHtml || '<span class="text-slate-500">No custom parameters</span>';

            // Execution Card
            document.getElementById('report-timestamp').innerText = new Date(statusRes.latestCycle.timestamp).toLocaleTimeString();
            document.getElementById('report-action').innerText = dec.decision;
            document.getElementById('report-intent').innerText = resObj.intent ? 'Intent: ' + resObj.intent : 'Tool: ' + (resObj.toolName || 'Native Dispatch');
            document.getElementById('report-delta').innerText = telem.delta || '0.000000 USDC';
            document.getElementById('report-balance-range').innerText = telem.initialBalance ? telem.initialBalance + ' ➔ ' + telem.finalBalance : '-';

            const txHash = resObj.tx || resObj.txHash || '-';
            if (txHash && txHash !== '-') {
              document.getElementById('report-txhash').innerHTML = '<a href="https://testnet.arcscan.app/tx/' + txHash + '" target="_blank" class="text-blue-400 hover:underline font-mono">' + txHash.slice(0, 12) + '...' + txHash.slice(-8) + ' ↗</a>';
              document.getElementById('report-explorer').innerHTML = '<a href="https://testnet.arcscan.app/tx/' + txHash + '" target="_blank" class="text-teal-400 hover:underline text-xs">Verified on ArcScan Explorer ↗</a>';
            } else {
              document.getElementById('report-txhash').innerText = 'Passive Hold / Telemetry';
              document.getElementById('report-explorer').innerText = 'No on-chain mutation';
            }
          }
        }
      } catch (e) {
        console.error('Update dashboard error:', e);
      }
    }

    function updateStepper(phase) {
      const steps = {
        'PRE_SCAN': 'step-prescan',
        'MARKET_SCOUT': 'step-scout',
        'AI_REASONING': 'step-reasoning',
        'EXECUTING_MCP': 'step-executing',
        'POST_RECONCILIATION': 'step-reconcile'
      };

      document.querySelectorAll('.step-card').forEach(el => {
        el.className = 'step-card bg-subcard border border-slate-800 rounded-xl p-3 text-center transition duration-300 opacity-60';
      });

      const activeId = steps[phase];
      if (activeId) {
        const el = document.getElementById(activeId);
        if (el) {
          el.className = 'step-card bg-indigo-950/80 border border-indigo-500 rounded-xl p-3 text-center transition duration-300 opacity-100 shadow-lg shadow-indigo-500/20 scale-105';
        }
      }
    }

    function updateDaemonUI(isRunning) {
      const badge = document.getElementById('daemon-badge');
      const btn = document.getElementById('btn-toggle-daemon');
      const icon = document.getElementById('toggle-icon');
      const text = document.getElementById('toggle-text');

      if (isRunning) {
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>LIVE (60s)</span>';
        badge.className = 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5';
        btn.className = 'px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl transition shadow-lg flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white active:scale-95';
        icon.innerText = '⏸';
        text.innerText = 'Pause';
      } else {
        badge.innerHTML = '<span>⏸ PAUSED</span>';
        badge.className = 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5';
        btn.className = 'px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl transition shadow-lg flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95';
        icon.innerText = '▶';
        text.innerText = 'Resume';
      }
    }

    // Countdown Timer Loop (Ticks every second)
    setInterval(() => {
      if (!isDaemonActive || !nextRunTime) {
        document.getElementById('countdown-timer').innerText = 'PAUSED';
        return;
      }
      const diff = Math.max(0, Math.round((nextRunTime - Date.now()) / 1000));
      document.getElementById('countdown-timer').innerText = diff + 's';
    }, 1000);

    // ─── Fetch Audit Ledger ───
    async function updateLedger() {
      try {
        const res = await requestFleetApi('/api/fleet/logs');
        if (res && res.ok && res.logs) {
          document.getElementById('ledger-count-badge').innerText = res.logs.length + ' logs';
          const tbody = document.getElementById('ledger-table-body');
          tbody.innerHTML = res.logs.map(log => {
            const dec = log.summary?.autonomousDecision?.decision || log.action || 'CYCLE';
            const model = log.summary?.autonomousDecision?.model || 'Gemini 3.5';
            const delta = log.summary?.balanceTelemetry?.delta || '0.000000 USDC';
            const txHash = log.summary?.autonomousDecision?.executionResult?.tx || log.summary?.autonomousDecision?.executionResult?.txHash || log.details?.result?.txHash || '-';
            const explorerLink = txHash !== '-' 
              ? '<a href="https://testnet.arcscan.app/tx/' + txHash + '" target="_blank" class="text-blue-400 hover:underline font-mono">' + txHash.slice(0, 10) + '...' + txHash.slice(-8) + ' ↗</a>'
              : '<span class="text-slate-500 text-xs">Passive Telemetry</span>';

            return '<tr class="hover:bg-slate-800/30 transition">' +
              '<td class="px-3 py-2.5 text-slate-400 text-xs font-mono">' + new Date(log.timestamp).toLocaleTimeString() + '</td>' +
              '<td class="px-3 py-2.5 font-bold text-indigo-300"><span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">' + dec + '</span></td>' +
              '<td class="px-3 py-2.5 text-slate-400 text-xs">' + model + '</td>' +
              '<td class="px-3 py-2.5 text-amber-300 font-mono text-xs">' + delta + '</td>' +
              '<td class="px-3 py-2.5 text-xs">' + explorerLink + '</td>' +
            '</tr>';
          }).join('');
        }
      } catch (e) {}
    }

    // ─── Fetch MCP 71 Tools Directory ───
    async function loadToolsDirectory() {
      try {
        const res = await requestFleetApi('/api/fleet/tools');
        if (res && res.ok && res.tools) {
          allToolsList = res.tools;
          document.getElementById('tools-count-badge').innerText = allToolsList.length;
          renderToolsGrid();
        }
      } catch (e) {}
    }

    function renderToolsGrid() {
      const q = (document.getElementById('tools-search-input')?.value || '').toLowerCase();
      const filtered = allToolsList.filter(t => {
        const matchCat = currentCategory === 'ALL' || t.category === currentCategory;
        const matchQ = !q || t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
        return matchCat && matchQ;
      });

      const grid = document.getElementById('tools-grid');
      if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-8 text-center text-slate-500 font-mono text-xs">No tools matching filter.</div>';
        return;
      }

      grid.innerHTML = filtered.map(t => {
        const catBadgeColors = {
          'EXECUTION': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          'INTEL': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
          'TELEMETRY': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          'PAYMENT': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          'AGENT': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
        const badgeClass = catBadgeColors[t.category] || 'bg-slate-800 text-slate-300';

        return '<div class="bg-subcard border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition shadow-lg">' +
          '<div>' +
            '<div class="flex items-center justify-between gap-2">' +
              '<span class="font-bold text-white font-mono text-xs truncate">' + t.name + '</span>' +
              '<span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ' + badgeClass + '">' + t.category + '</span>' +
            '</div>' +
            '<p class="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">' + (t.description || 'Native runtime tool.') + '</p>' +
          '</div>' +
          '<div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">' +
            '<span class="text-[10px] font-mono text-slate-500">mcp-runtime</span>' +
            '<button onclick="openToolModal(\\'' + t.name + '\\')" class="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition flex items-center gap-1 active:scale-95">' +
              '<span>▶</span> <span>Run</span>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function filterCategory(cat, btnElem) {
      currentCategory = cat;
      document.querySelectorAll('.tool-cat-btn').forEach(btn => {
        btn.className = 'tool-cat-btn px-3 py-1.5 rounded-lg bg-subcard hover:bg-slate-800 text-slate-300 border border-slate-800 transition';
      });
      if (btnElem) {
        btnElem.className = 'tool-cat-btn px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold transition';
      }
      renderToolsGrid();
    }

    function filterTools() {
      renderToolsGrid();
    }

    // ─── Tool Modal Execution ───
    function openToolModal(toolName) {
      currentActiveTool = allToolsList.find(t => t.name === toolName) || { name: toolName, category: 'GENERAL', defaultParams: {} };
      document.getElementById('modal-tool-name').innerText = currentActiveTool.name;
      document.getElementById('modal-tool-cat').innerText = currentActiveTool.category + ' • Native Tool';
      document.getElementById('modal-tool-params').value = JSON.stringify(currentActiveTool.defaultParams || {}, null, 2);
      document.getElementById('modal-tool-result-container').classList.add('hidden');
      
      const modal = document.getElementById('tool-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function resetDefaultParams() {
      if (currentActiveTool) {
        document.getElementById('modal-tool-params').value = JSON.stringify(currentActiveTool.defaultParams || {}, null, 2);
      }
    }

    function closeToolModal() {
      const modal = document.getElementById('tool-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    async function executeSelectedTool() {
      if (!currentActiveTool) return;
      const btn = document.getElementById('btn-execute-tool');
      btn.innerText = '⏳ Calling MCP...';
      btn.disabled = true;

      let params = {};
      try {
        params = JSON.parse(document.getElementById('modal-tool-params').value);
      } catch (e) {
        alert('Invalid JSON parameters: ' + e.message);
        btn.innerHTML = '<span>▶</span> <span>Execute MCP Tool</span>';
        btn.disabled = false;
        return;
      }

      try {
        const res = await requestFleetApi('/api/fleet/call-tool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolName: currentActiveTool.name, params })
        });

        document.getElementById('modal-tool-result-container').classList.remove('hidden');
        document.getElementById('modal-tool-status').innerText = res.ok ? 'SUCCESS' : 'ERROR';
        document.getElementById('modal-tool-status').className = res.ok ? 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400' : 'text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400';
        document.getElementById('modal-tool-result').innerText = JSON.stringify(res, null, 2);
      } catch (e) {
        alert('Call failed: ' + e.message);
      } finally {
        btn.innerHTML = '<span>▶</span> <span>Execute MCP Tool</span>';
        btn.disabled = false;
      }
    }

    // ─── Live Terminal & SSE Stream ───
    function appendTerminalLog(log) {
      const body = document.getElementById('terminal-body');
      const tagColors = {
        'PRE_SCAN': 'text-cyan-400',
        'SCOUT': 'text-teal-400',
        'STRATEGIST': 'text-indigo-400',
        'EXECUTOR': 'text-amber-400',
        'RECONCILE': 'text-purple-400',
        'CYCLE_START': 'text-emerald-400 font-bold',
        'CYCLE_END': 'text-emerald-400 font-bold',
        'ERROR': 'text-rose-400 font-bold',
        'USER_TOOL_CALL': 'text-pink-400 font-bold',
      };
      const color = tagColors[log.tag] || 'text-slate-400';
      const line = document.createElement('div');
      line.className = 'hover:bg-slate-900/60 p-0.5 rounded transition';
      line.innerHTML = '<span class="text-slate-600">[' + new Date(log.timestamp).toLocaleTimeString() + ']</span> ' +
        '<span class="font-bold ' + color + '">[' + log.tag + ']</span> ' +
        '<span class="text-slate-300">' + log.message + '</span>';
      body.appendChild(line);
      body.scrollTop = body.scrollHeight;
    }

    function clearTerminal() {
      document.getElementById('terminal-body').innerHTML = '<div class="text-slate-600">-- Terminal cleared --</div>';
    }

    // Connect SSE Stream
    function initSseStream() {
      const prefix = window.location.pathname.startsWith('/fleet') ? '/fleet' : '';
      const source = new EventSource(prefix + '/api/fleet/stream');
      
      source.onopen = () => {
        document.getElementById('sse-status').innerText = 'CONNECTED';
        document.getElementById('sse-status').className = 'px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-mono';
      };

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'LOG') {
            appendTerminalLog(data.log);
          } else if (data.type === 'STATE_UPDATE') {
            updateDashboard();
          }
        } catch (e) {}
      };

      source.onerror = () => {
        document.getElementById('sse-status').innerText = 'RECONNECTING';
        document.getElementById('sse-status').className = 'px-2 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-400 font-mono';
      };
    }

    // ─── Daemon Controls ───
    async function toggleDaemon() {
      const action = isDaemonActive ? 'stop' : 'start';
      const btn = document.getElementById('btn-toggle-daemon');
      btn.disabled = true;
      try {
        const res = await requestFleetApi('/api/fleet/daemon/' + action, { method: 'POST' });
        if (res && res.ok) {
          isDaemonActive = res.running;
          updateDaemonUI(isDaemonActive);
        }
      } catch (e) {
        alert('Toggle notice: ' + e.message);
      } finally {
        btn.disabled = false;
      }
    }

    async function triggerManualCycle() {
      const btn = document.getElementById('btn-trigger');
      btn.innerText = '⏳ Scanning...';
      btn.disabled = true;
      try {
        const res = await requestFleetApi('/api/fleet/run-cycle', { method: 'POST' });
        if (res && res.ok) {
          await updateDashboard();
          await updateLedger();
        }
      } catch (e) {
        alert('Scan notice: ' + e.message);
      } finally {
        btn.innerHTML = '<span>⚡</span> <span>Scan Now</span>';
        btn.disabled = false;
      }
    }

    // ─── Faucet Modal Controls ───
    function openFaucetModal() {
      document.getElementById('faucet-modal').classList.remove('hidden');
      document.getElementById('faucet-modal').classList.add('flex');
    }

    function closeFaucetModal() {
      document.getElementById('faucet-modal').classList.add('hidden');
      document.getElementById('faucet-modal').classList.remove('flex');
    }

    function copyWalletAddress() {
      const addr = document.getElementById('faucet-wallet-addr').innerText;
      navigator.clipboard.writeText(addr).then(() => {
        const btn = document.getElementById('copy-btn-text');
        btn.innerText = 'Copied! ✓';
        setTimeout(() => { btn.innerText = 'Copy'; }, 2500);
      });
    }

    async function claimFaucetBackend() {
      const btn = document.getElementById('btn-modal-autorefuel');
      btn.innerText = '⏳ Refueling via backend...';
      btn.disabled = true;
      try {
        const res = await requestFleetApi('/api/fleet/claim-faucet', { method: 'POST' });
        if (res && res.ok && res.result) {
          alert('🚰 Faucet Refilled! ' + res.result.claimedAmount + ' added to wallet on Arc Testnet.');
          await updateDashboard();
          closeFaucetModal();
        } else {
          alert('Faucet notice: ' + (res?.error || 'Request processed'));
        }
      } catch (e) {
        alert('Faucet error: ' + e.message);
      } finally {
        btn.innerHTML = '<span>⚡</span> <span>Jalankan Auto-Refuel Backend</span>';
        btn.disabled = false;
      }
    }

    // Init loops
    updateDashboard();
    updateLedger();
    loadToolsDirectory();
    initSseStream();
    setInterval(updateDashboard, 2000);
    setInterval(updateLedger, 5000);
  </script>
</body>
</html>`)
})

// ─── 2. Real-Time Status API ───
app.get('/api/fleet/status', async (req, res) => {
  try {
    const [walletBalances, mscaStatus, aiRouterStatus] = await Promise.all([
      orchestrator.mcpClient.getWalletBalances(),
      orchestrator.mcpClient.getMscaStatus(),
      orchestrator.mcpClient.getAiRouterStatus(),
    ])
    res.json({
      ok: true,
      daemonRunning: orchestrator.isRunning,
      currentPhase: orchestrator.currentPhase,
      activeToolName: orchestrator.activeToolName,
      cycleCount: orchestrator.cycleCount,
      nextRunTimestamp: orchestrator.nextRunTimestamp,
      balances: walletBalances,
      mscaStatus,
      aiRouterStatus,
      latestCycle: orchestrator.latestCycleSummary,
    })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

// ─── 3. Full 71 MCP Tools Catalog API with Comprehensive Default Params ───
const TOOL_METADATA_MAP = {
  // Execution
  executeSwap: { category: 'EXECUTION', description: 'Execute on-chain token swap on Arc DEX AMM router.', defaultParams: { tokenIn: 'USDC', tokenOut: 'cirBTC', amount: '0.01', source: 'eoa' } },
  executeBridge: { category: 'EXECUTION', description: 'Execute CCTP cross-chain bridge (Arc -> Base Sepolia) via ArcoxRouter.', defaultParams: { fromChain: 'Arc_Testnet', toChain: 'Base_Sepolia', token: 'USDC', amount: '0.01', source: 'eoa' } },
  executeSend: { category: 'EXECUTION', description: 'Send USDC or token to counterparty via ArcoxRouter.sendTokenWithFee.', defaultParams: { to: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505', token: 'USDC', amount: '0.01', source: 'eoa' } },
  executeConfirmedSwap: { category: 'EXECUTION', description: 'Execute confirmed swap with preview confirmation.', defaultParams: { tokenIn: 'USDC', tokenOut: 'cirBTC', amount: '0.01', confirmed: true } },
  executeConfirmedBridge: { category: 'EXECUTION', description: 'Execute confirmed CCTP bridge with preview confirmation.', defaultParams: { fromChain: 'Arc_Testnet', toChain: 'Base_Sepolia', token: 'USDC', amount: '0.01', confirmed: true } },
  executeConfirmedSend: { category: 'EXECUTION', description: 'Execute confirmed token send with preview confirmation.', defaultParams: { to: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505', token: 'USDC', amount: '0.01', confirmed: true } },
  depositUnifiedBalance: { category: 'EXECUTION', description: 'Deposit USDC to AI Router Unified Balance for compute runway.', defaultParams: { amount: '0.05' } },
  retryBridgeMint: { category: 'EXECUTION', description: 'Retry destination mint for CCTP bridge message.', defaultParams: { burnTx: '0x5c1fddfa876423ec94880a7e8d4712fd64a26c9e3da3fbeb4c574788e68927e8' } },
  retryConfirmedBridge: { category: 'EXECUTION', description: 'Retry confirmed bridge transaction.', defaultParams: { burnTx: '0x5c1fddfa876423ec94880a7e8d4712fd64a26c9e3da3fbeb4c574788e68927e8' } },

  // Intel (x402)
  intelGetToken: { category: 'INTEL', description: 'Fetch real-time Arkham token intelligence, volume, and trending status.', defaultParams: { id: 'BTC' } },
  intelGetAddress: { category: 'INTEL', description: 'Analyze wallet flows, counterparties, and smart money movements.', defaultParams: { address: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505' } },
  intelGetEntity: { category: 'INTEL', description: 'Inspect institutional entity reserves (Circle, major funds, market makers).', defaultParams: { entity: 'circle' } },
  intelGetContract: { category: 'INTEL', description: 'Fetch smart contract verification status, creator, and bytecode security.', defaultParams: { address: '0xDf800310443BEB589CEf91A09854203Ea36e43a7' } },
  intelGetTx: { category: 'INTEL', description: 'Analyze on-chain transaction traces and gas fees.', defaultParams: { hash: '0xc86317e80240df3ae083dfbf3f25b3a9a9a5a9a7c86378524d33e9a82000de6a' } },
  intelSearch: { category: 'INTEL', description: 'Search Arkham global intelligence database for whale activity.', defaultParams: { query: 'arc testnet whale' } },
  intelQuoteWalletReport: { category: 'INTEL', description: 'Quote comprehensive Arkham wallet audit report.', defaultParams: { address: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505' } },
  intelExecuteWalletReport: { category: 'INTEL', description: 'Execute comprehensive Arkham wallet audit report.', defaultParams: { address: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505' } },
  x402PayInvoice: { category: 'INTEL', description: 'Autonomously pay x402 invoice via on-chain USDC memo.', defaultParams: { invoiceId: 'inv_arcox_x402', confirmed: true, confirmationText: 'yes' } },
  x402InvoiceStatus: { category: 'INTEL', description: 'Query status of an x402 intelligence invoice.', defaultParams: { invoiceId: 'inv_arcox_x402' } },

  // Telemetry & Discovery
  walletBalances: { category: 'TELEMETRY', description: 'Query live multi-chain wallet balances (Arc, Circle Dev, Solana Devnet).', defaultParams: {} },
  transactionHistory: { category: 'TELEMETRY', description: 'Audit recent on-chain transactions across all connected networks.', defaultParams: {} },
  serviceCatalog: { category: 'TELEMETRY', description: 'Query complete ARCOX MCP services, routes, and fee structures.', defaultParams: {} },
  agentStatus: { category: 'TELEMETRY', description: 'Check agent operational status, active configuration, and health telemetry.', defaultParams: {} },
  agentAccount: { category: 'TELEMETRY', description: 'Get agent EOA and Circle wallet account identifiers.', defaultParams: {} },
  mscaStatus: { category: 'TELEMETRY', description: 'Inspect Model Armor / MSCA policy guardrails and daily spend limits.', defaultParams: {} },
  getAiRouterStatus: { category: 'TELEMETRY', description: 'Check AI Router status and compute runway balance.', defaultParams: {} },
  getUnifiedBalance: { category: 'TELEMETRY', description: 'Get total confirmed Unified Balance across AI router routes.', defaultParams: {} },
  listAiModels: { category: 'TELEMETRY', description: 'List available AI models supported by ARCOX AI Router.', defaultParams: {} },
  callAiModel: { category: 'TELEMETRY', description: 'Call AI model via AI Router with Unified Balance auto-pay.', defaultParams: { model: 'gemini-1.5-flash', prompt: 'Summarize Arc network liquidity state' } },
  routerFor: { category: 'TELEMETRY', description: 'Get verified router address for specified network.', defaultParams: { chain: 'Arc_Testnet' } },
  nativeSwapBridgeRouterFor: { category: 'TELEMETRY', description: 'Get native swap & bridge router address.', defaultParams: { chain: 'Arc_Testnet' } },
  normalizeChainName: { category: 'TELEMETRY', description: 'Normalize network name identifier.', defaultParams: { chain: 'arc' } },
  metadataFor: { category: 'TELEMETRY', description: 'Get chain metadata and RPC parameters.', defaultParams: { chain: 'Arc_Testnet' } },
  getApiKeyStatus: { category: 'TELEMETRY', description: 'Check status of AI API keys.', defaultParams: {} },
  getUsageLogs: { category: 'TELEMETRY', description: 'Query AI Router usage and billing logs.', defaultParams: {} },

  // Payment
  createPaymentRequest: { category: 'PAYMENT', description: 'Create an on-chain USDC payment request / invoice on Arc Testnet.', defaultParams: { amount: '0.01', token: 'USDC', memo: 'Fleet autonomous payment' } },
  getPaymentRequest: { category: 'PAYMENT', description: 'Query status of an ARCOX Pay invoice.', defaultParams: { requestId: 'req_001' } },
  payPaymentRequest: { category: 'PAYMENT', description: 'Settle an ARCOX Pay invoice using wallet USDC balance.', defaultParams: { requestId: 'req_001', amount: '0.01' } },
  payListRecentPayments: { category: 'PAYMENT', description: 'List recent inbound and outbound payment ledger transactions.', defaultParams: {} },
  payGetPaymentStatus: { category: 'PAYMENT', description: 'Check payment settlement receipt.', defaultParams: { paymentId: 'pay_001' } },
  checkPaymentStatus: { category: 'PAYMENT', description: 'Check payment verification status.', defaultParams: { paymentId: 'pay_001' } },
  quotePaymentRequest: { category: 'PAYMENT', description: 'Quote fee for creating payment request.', defaultParams: { amount: '0.01', token: 'USDC' } },
  quoteEcoRoutePayment: { category: 'PAYMENT', description: 'Quote eco-route gas-optimized payment.', defaultParams: { amount: '0.01' } },
  quoteSend: { category: 'PAYMENT', description: 'Quote fees and net amount for token send.', defaultParams: { to: '0x5294E9927c3306DcBaDb03fe70b92e01cCede505', token: 'USDC', amount: '0.01' } },
  quoteSwap: { category: 'PAYMENT', description: 'Quote exchange rate and minimum output for DEX swap.', defaultParams: { tokenIn: 'USDC', tokenOut: 'cirBTC', amountIn: '0.01' } },
  quoteBridge: { category: 'PAYMENT', description: 'Quote CCTP cross-chain bridge fee and net amount.', defaultParams: { fromChain: 'Arc_Testnet', toChain: 'Base_Sepolia', token: 'USDC', amount: '0.01' } },
  quoteUnifiedBalanceDeposit: { category: 'PAYMENT', description: 'Quote deposit fee for Unified Balance compute top-up.', defaultParams: { amount: '0.05' } },
  quoteAiRouterAutoPay: { category: 'PAYMENT', description: 'Quote auto-pay deduction rate for AI router inference.', defaultParams: {} },
  setAiRouterAutoPay: { category: 'PAYMENT', description: 'Enable or disable AI Router Unified Balance auto-pay.', defaultParams: { enabled: true } },

  // Agent Economy
  registerAgentIdentity: { category: 'AGENT', description: 'Register agent identity with name and endpoint in ARCOX registry.', defaultParams: { name: 'arcox-fleet-agent', endpoint: 'https://43.134.14.43.nip.io/fleet' } },
  listAgentIdentities: { category: 'AGENT', description: 'List all registered agent identities in the ARCOX registry.', defaultParams: {} },
  getAgentIdentity: { category: 'AGENT', description: 'Get active agent identity profile and reputation.', defaultParams: {} },
  selectAgentIdentity: { category: 'AGENT', description: 'Switch active agent identity context.', defaultParams: { agentId: 'arcox-fleet-agent' } },
  createAgentJob: { category: 'AGENT', description: 'Create autonomous task/job for other agents to execute.', defaultParams: { title: 'Arbitrage Opportunity Scanner', reward: '0.1' } },
  createIdentityBoundAgentJob: { category: 'AGENT', description: 'Create job bound specifically to agent identity.', defaultParams: { title: 'DEX Liquidity Provisioning', agentId: 'arcox-fleet-agent' } },
  fundAgentJob: { category: 'AGENT', description: 'Fund escrow budget for agent job.', defaultParams: { jobId: 'job_001', amount: '0.05' } },
  submitAgentJob: { category: 'AGENT', description: 'Submit completed proof of work for agent job.', defaultParams: { jobId: 'job_001', result: 'Completed successfully' } },
  completeAgentJob: { category: 'AGENT', description: 'Mark agent job complete and release escrow payout.', defaultParams: { jobId: 'job_001' } },
  setAgentJobBudget: { category: 'AGENT', description: 'Set or update job maximum budget.', defaultParams: { jobId: 'job_001', budget: '0.1' } },
  listIdentityBoundAgentJobs: { category: 'AGENT', description: 'List jobs assigned to this agent identity.', defaultParams: {} },
  readAgent: { category: 'AGENT', description: 'Read agent configuration and registered metadata.', defaultParams: {} },
  readJob: { category: 'AGENT', description: 'Read agent job details and execution state.', defaultParams: { jobId: 'job_001' } },
  assertTransactionIdentity: { category: 'AGENT', description: 'Cryptographically assert transaction origin to agent identity.', defaultParams: { txHash: '0xc86317e80240df3ae083dfbf3f25b3a9a9a5a9a7c86378524d33e9a82000de6a' } },
  classifyPrompt: { category: 'AGENT', description: 'Classify user prompt into optimal ARCOX tool and intent.', defaultParams: { text: 'Swap 1 USDC to cirBTC on Arc' } },
  makeAgentResponse: { category: 'AGENT', description: 'Format structured agent response envelope.', defaultParams: { message: 'Action executed successfully.' } },
  createAiApiKey: { category: 'AGENT', description: 'Generate sub-agent API key for AI compute runway.', defaultParams: { name: 'fleet-subagent-01' } },
  deleteAiApiKey: { category: 'AGENT', description: 'Revoke sub-agent API key.', defaultParams: { keyId: 'key_001' } },
  createApiSession: { category: 'AGENT', description: 'Establish authenticated session for MSCA x402 operations.', defaultParams: {} },
  refreshApiSession: { category: 'AGENT', description: 'Refresh active session token.', defaultParams: {} },
  backendSession: { category: 'AGENT', description: 'Get active backend session state.', defaultParams: {} },
  simulateCircleWebhook: { category: 'AGENT', description: 'Simulate Circle webhook event for testing payout flows.', defaultParams: { type: 'transfer.completed' } },
}

// ─── 3. Tools Catalog API ───
app.get('/api/fleet/tools', (req, res) => {
  try {
    const tools = orchestrator.mcpClient.listTools()
    const categorizedTools = tools.map(name => {
      const meta = TOOL_METADATA_MAP[name] || {}
      let category = meta.category || 'GENERAL'
      let description = meta.description || 'Native ARCOX MCP Tool'
      let defaultParams = meta.defaultParams || {}

      if (category === 'GENERAL') {
        if (name.startsWith('execute') || name.includes('Swap') || name.includes('Bridge') || name.includes('Send')) category = 'EXECUTION'
        else if (name.startsWith('intel') || name.includes('x402')) category = 'INTEL'
        else if (name.includes('Balances') || name.includes('History') || name.includes('Status')) category = 'TELEMETRY'
        else if (name.includes('Pay') || name.includes('Payment')) category = 'PAYMENT'
        else if (name.includes('Agent') || name.includes('Job')) category = 'AGENT'
      }

      return { name, category, description, defaultParams }
    })

    res.json({ ok: true, count: categorizedTools.length, tools: categorizedTools })
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || 'Failed to list tools' })
  }
})

// ─── 4. Direct Tool Execution API ───
app.post('/api/fleet/call-tool', async (req, res) => {
  try {
    const body = req.body || {}
    const toolName = body.toolName
    const params = body.params || {}
    if (!toolName || typeof toolName !== 'string') {
      return res.status(400).json({ ok: false, error: 'toolName string is required' })
    }

    orchestrator.log('USER_TOOL_CALL', `User manually invoked tool: ${toolName}`)
    const result = await orchestrator.mcpClient.callTool(toolName, params)
    res.json({ ok: result?.ok !== false, toolName, result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || 'Tool execution error' })
  }
})

// ─── 5. Server-Sent Events (SSE) Live Log Stream ───
app.get('/api/fleet/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  // Send initial recent logs
  for (const log of orchestrator.recentLogs.slice(-20)) {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'LOG', log })}\n\n`)
    }
  }

  // Subscribe to new logs
  const unsubscribe = orchestrator.subscribeLogs(log => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'LOG', log })}\n\n`)
    }
  })

  // Periodic heartbeat
  const pingInterval = setInterval(() => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'PING', timestamp: Date.now() })}\n\n`)
    }
  }, 15000)

  req.on('close', () => {
    clearInterval(pingInterval)
    unsubscribe()
  })
})

// ─── 6. Daemon Control APIs ───
app.post('/api/fleet/daemon/start', (req, res) => {
  try {
    const rawInterval = Number(req.body?.interval || process.env.AUTONOMOUS_INTERVAL_SECONDS) || 60
    const interval = Math.min(Math.max(5, rawInterval), 86400)
    orchestrator.startAutonomousDaemon(interval)
    res.json({ ok: true, running: true, intervalSeconds: interval, message: 'Autonomous daemon started' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || 'Failed to start daemon' })
  }
})

app.post('/api/fleet/daemon/stop', (req, res) => {
  try {
    orchestrator.stopAutonomousDaemon()
    res.json({ ok: true, running: false, message: 'Autonomous daemon stopped' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || 'Failed to stop daemon' })
  }
})

// ─── 7. Run 1 Cycle Manually ───
app.post('/api/fleet/run-cycle', async (req, res) => {
  try {
    if (orchestrator.isCycleRunning) {
      return res.status(409).json({ ok: false, error: 'A cycle is already running', running: true })
    }
    const result = await orchestrator.runAutonomousCycle('API_REQUEST')
    res.json({ ok: true, result })
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || 'Cycle execution failed' })
  }
})

// ─── 8. Faucet Claim API ───
app.post('/api/fleet/claim-faucet', async (req, res) => {
  try {
    const targetAddress = req.body?.address || (orchestrator.mcpClient?.account ? orchestrator.mcpClient.account.address : '0xf60C1BE48c75E890bF9943C104a0Da5B62A07299')
    const result = await orchestrator.mcpClient.claimTestnetUsdcFaucet(targetAddress)
    res.json({ ok: true, result })
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || 'Faucet claim failed' })
  }
})

// ─── 9. Audit Logs API ───
app.get('/api/fleet/logs', async (req, res) => {
  try {
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 25), 100)
    const logs = await orchestrator.memoryBank.listRecentLogs(limit)
    res.json({ ok: true, count: logs.length, logs })
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to retrieve logs' })
  }
})

// ─── 10. Direct Downloads Routes ───
app.get('/download-demo', (req, res) => {
  res.download(path.join(__dirname, '../public/arcox-fleet-demo.mp4'), 'ARCOX_Fleet_Demo.mp4')
})

app.get('/download-thumbnail', (req, res) => {
  res.download(path.join(__dirname, '../public/thumbnail.png'), 'ARCOX_Fleet_Thumbnail.png')
})

app.get('/download-architecture', (req, res) => {
  res.download(path.join(__dirname, '../public/architecture_diagram.png'), 'ARCOX_Fleet_Architecture_Diagram.png')
})

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🌐 ARCOX Fleet Web Dashboard running on port ${PORT}`)
    if (process.env.AUTONOMOUS_DAEMON !== 'false') {
      orchestrator.startAutonomousDaemon(Number(process.env.AUTONOMOUS_INTERVAL_SECONDS) || 60)
    }
  })
}

export default app
