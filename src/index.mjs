/**
 * ARCOX Fleet HTTP Server & Real-Time Monitoring Dashboard
 * Google Cloud Run Entry Point with Web Dashboard, Health Checks, and REST API.
 */

import 'dotenv/config'
import express from 'express'
import { FleetOrchestrator } from './orchestrator.mjs'

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

const orchestrator = new FleetOrchestrator({
  apiBaseUrl: process.env.ARCOX_API_BASE_URL,
  connectionToken: process.env.ARCOX_AGENT_CONNECTION_TOKEN,
  privateKey: process.env.AGENT_PRIVATE_KEY,
  rpcUrl: process.env.ARC_RPC_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  projectId: process.env.GCP_PROJECT_ID,
})

// 1. Interactive Live Web Dashboard (Browser Monitoring UI)
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.send(`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARCOX Fleet — Live Autonomous Monitor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class', theme: { extend: { colors: { darkbg: '#0B0F17', cardbg: '#161F30' } } } }
  </script>
</head>
<body class="bg-darkbg text-slate-100 min-h-screen font-sans antialiased p-4 md:p-8">
  <div class="max-w-6xl mx-auto space-y-6">
    
    <!-- Header -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
      <div>
        <div class="flex items-center gap-3">
          <span class="text-3xl">🚀</span>
          <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">ARCOX Fleet Monitor</h1>
          <span id="status-badge" class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">● LIVE AUTONOMOUS</span>
        </div>
        <p class="text-sm text-slate-400 mt-1">Target Track: Track 3 — The Fortified Enterprise Fleet | Arc Testnet (Chain ID 5042002)</p>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="triggerManualCycle()" id="btn-trigger" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold rounded-lg shadow-lg transition">⚡ Trigger Cycle Now</button>
        <span class="text-xs text-slate-500" id="last-updated">Auto-refreshing (5s)</span>
      </div>
    </header>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-cardbg border border-slate-800 rounded-xl p-5 shadow-lg">
        <div class="text-xs uppercase font-medium text-slate-400">On-Chain USDC Balance</div>
        <div class="text-2xl font-bold text-white mt-1" id="stat-balance">Loading...</div>
        <div class="text-xs text-emerald-400 mt-1">Arc Network Native Gas</div>
      </div>
      <div class="bg-cardbg border border-slate-800 rounded-xl p-5 shadow-lg">
        <div class="text-xs uppercase font-medium text-slate-400">AI Compute Runway</div>
        <div class="text-2xl font-bold text-indigo-300 mt-1" id="stat-ai-balance">Loading...</div>
        <div class="text-xs text-indigo-400 mt-1">AI Router Unified Balance</div>
      </div>
      <div class="bg-cardbg border border-slate-800 rounded-xl p-5 shadow-lg">
        <div class="text-xs uppercase font-medium text-slate-400">Model Armor Daily Limit</div>
        <div class="text-2xl font-bold text-white mt-1" id="stat-daily-limit">$10.00 USDC</div>
        <div class="text-xs text-blue-400 mt-1">Zero-Trust Guardrail</div>
      </div>
      <div class="bg-cardbg border border-slate-800 rounded-xl p-5 shadow-lg">
        <div class="text-xs uppercase font-medium text-slate-400">Heartbeat Interval</div>
        <div class="text-2xl font-bold text-white mt-1">Every 60s</div>
        <div class="text-xs text-amber-400 mt-1">Autonomous Daemon Active</div>
      </div>
    </div>

    <!-- Live Gemini 3.5 Thought Process -->
    <div class="bg-cardbg border border-indigo-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -z-0"></div>
      <div class="flex items-center gap-2 mb-3">
        <span class="text-xl">🧠</span>
        <h2 class="text-lg font-bold text-white">Latest Gemini 3.5 Flash Autonomous Reasoning</h2>
        <span id="gemini-decision-tag" class="ml-auto px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">Analyzing...</span>
      </div>
      <blockquote id="gemini-thought" class="text-sm text-slate-300 italic bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 leading-relaxed font-mono">
        Waiting for next 60s cycle...
      </blockquote>
    </div>

    <!-- Live Transaction & Audit Trail Feed -->
    <div class="bg-cardbg border border-slate-800 rounded-xl p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <span>📜</span> Real-Time Audit Trail & On-Chain Transactions
        </h2>
        <span class="text-xs text-slate-400" id="log-count">0 logs recorded</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
            <tr>
              <th class="px-4 py-3">Timestamp</th>
              <th class="px-4 py-3">Agent</th>
              <th class="px-4 py-3">Action / Decision</th>
              <th class="px-4 py-3">On-Chain Tx / Explorer Link</th>
            </tr>
          </thead>
          <tbody id="logs-table-body" class="divide-y divide-slate-800/50">
            <tr><td colspan="4" class="px-4 py-4 text-center text-slate-500">Loading audit history...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <script>
    async function updateDashboard() {
      try {
        const [statusRes, logsRes] = await Promise.all([
          fetch('/api/fleet/status').then(r => r.json()),
          fetch('/api/fleet/logs').then(r => r.json())
        ]);

        if (statusRes.ok) {
          const bal = statusRes.balances?.balances?.Arc_Testnet?.balance || '0.00';
          document.getElementById('stat-balance').innerText = bal + ' USDC';
          document.getElementById('stat-ai-balance').innerText = '$' + (statusRes.aiRouterStatus?.unifiedBalance?.totalConfirmedBalance || '0.00') + ' USDC';
          document.getElementById('stat-daily-limit').innerText = '$' + (statusRes.mscaStatus?.dailyLimitUsdc || '10.0') + ' USDC';
        }

        if (logsRes.ok && logsRes.logs.length > 0) {
          document.getElementById('log-count').innerText = logsRes.logs.length + ' logs recorded';
          
          // Find latest reasoning log
          const latestCycle = logsRes.logs.find(l => l.summary?.autonomousDecision);
          if (latestCycle) {
            const dec = latestCycle.summary.autonomousDecision;
            document.getElementById('gemini-decision-tag').innerText = 'DECISION: ' + dec.decision;
            document.getElementById('gemini-thought').innerText = '"' + dec.reasoning + '"';
          }

          // Render table
          const tbody = document.getElementById('logs-table-body');
          tbody.innerHTML = logsRes.logs.map(log => {
            const txHash = log.summary?.phases?.phase3_settlement?.swapResult?.txHash || log.details?.result?.txHash || log.details?.txHash || '-';
            const explorerLink = txHash !== '-' 
              ? '<a href="https://testnet.arcscan.app/tx/' + txHash + '" target="_blank" class="text-blue-400 hover:underline font-mono text-xs">' + txHash.slice(0, 10) + '...' + txHash.slice(-8) + ' ↗</a>'
              : '<span class="text-slate-500 text-xs">Internal / Telemetry</span>';
            
            const actionText = log.action || log.summary?.autonomousDecision?.decision || 'CYCLE';
            const agentName = log.agentId || 'Fleet Orchestrator';

            return '<tr class="hover:bg-slate-800/30 transition">' +
              '<td class="px-4 py-3 text-slate-400 font-mono text-xs">' + new Date(log.timestamp).toLocaleTimeString() + '</td>' +
              '<td class="px-4 py-3 font-semibold text-slate-200">' + agentName + '</td>' +
              '<td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-semibold">' + actionText + '</span></td>' +
              '<td class="px-4 py-3">' + explorerLink + '</td>' +
            '</tr>';
          }).join('');
        }

        document.getElementById('last-updated').innerText = 'Updated: ' + new Date().toLocaleTimeString();
      } catch (e) {
        console.error('Update failed:', e);
      }
    }

    async function triggerManualCycle() {
      const btn = document.getElementById('btn-trigger');
      btn.innerText = '⏳ Executing...';
      btn.disabled = true;
      try {
        await fetch('/api/fleet/run-cycle', { method: 'POST' });
        await updateDashboard();
      } catch (e) {
        alert('Failed: ' + e.message);
      } finally {
        btn.innerText = '⚡ Trigger Cycle Now';
        btn.disabled = false;
      }
    }

    setInterval(updateDashboard, 5000);
    updateDashboard();
  </script>
</body>
</html>`)
})

// 2. Real-time Status API
app.get('/api/fleet/status', async (req, res) => {
  try {
    const [walletBalances, mscaStatus, aiRouterStatus] = await Promise.all([
      orchestrator.mcpClient.getWalletBalances(),
      orchestrator.mcpClient.getMscaStatus(),
      orchestrator.mcpClient.getAiRouterStatus(),
    ])
    res.json({ ok: true, balances: walletBalances, mscaStatus, aiRouterStatus, daemonRunning: orchestrator.isRunning })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

// 3. Trigger API
app.post('/api/fleet/run-cycle', async (req, res) => {
  try {
    const result = await orchestrator.runAutonomousCycle('API_REQUEST')
    res.json({ ok: true, result })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

// 4. Webhook Trigger
app.post('/api/fleet/webhook', async (req, res) => {
  const event = req.body?.event || req.body?.type || 'EXTERNAL_MARKET_EVENT'
  res.json({ ok: true, message: `Autonomous cycle triggered by webhook event: ${event}` })
  orchestrator.runAutonomousCycle(`WEBHOOK_${event}`).catch(err => {
    console.error('[Webhook Error]:', err.message)
  })
})

// 5. Audit logs API
app.get('/api/fleet/logs', async (req, res) => {
  try {
    const logs = await orchestrator.memoryBank.listRecentLogs(25)
    res.json({ ok: true, count: logs.length, logs })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🌐 ARCOX Fleet Web Dashboard: http://localhost:${PORT}`)
  console.log(`📡 Autonomous Daemon Active: every ${process.env.AUTONOMOUS_INTERVAL_SECONDS || 60}s`)
  
  const isDaemonEnabled = String(process.env.AUTONOMOUS_DAEMON !== 'false')
  const interval = Number(process.env.AUTONOMOUS_INTERVAL_SECONDS) || 60
  if (isDaemonEnabled) {
    orchestrator.startAutonomousDaemon(interval)
  }
})
