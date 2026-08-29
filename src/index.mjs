/**
 * ARCOX Fleet HTTP Server & Real-Time Interactive Monitoring Dashboard
 * With MP4 Demo Video & Thumbnail Static Hosting
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

// CORS middleware to allow Vercel frontend to query VPS backend seamlessly
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// Serve static files (including demo video & thumbnail)

app.use(express.static(path.join(__dirname, '../public')))

const orchestrator = new FleetOrchestrator({
  apiBaseUrl: process.env.ARCOX_API_BASE_URL,
  connectionToken: process.env.ARCOX_AGENT_CONNECTION_TOKEN,
  privateKey: process.env.AGENT_PRIVATE_KEY,
  rpcUrl: process.env.ARC_RPC_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  projectId: process.env.GCP_PROJECT_ID,
})

// 1. Interactive Live Web Dashboard (Mobile-friendly, Dark Mode)
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.send(`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARCOX Fleet — Live Autonomous Commander</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class', theme: { extend: { colors: { darkbg: '#0B0F17', cardbg: '#141D2E', subcard: '#1B273D' } } } }
  </script>
</head>
<body class="bg-darkbg text-slate-100 min-h-screen font-sans antialiased p-3 md:p-6">
  <div class="max-w-6xl mx-auto space-y-5">
    
    <!-- Top Bar & Daemon Controls -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-cardbg border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">🚀</span>
          <h1 class="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">ARCOX Fleet Commander</h1>
          <span id="daemon-badge" class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">● RUNNING (60s)</span>
        </div>
        <p class="text-xs text-slate-400 mt-1">Track 3: The Fortified Enterprise Fleet | Arc Testnet (Chain ID 5042002)</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <button id="btn-faucet" onclick="claimFaucet()" class="flex-1 md:flex-none px-3.5 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition shadow-lg flex items-center justify-center gap-1.5 active:scale-95">
          <span>🚰</span> <span>Claim Faucet</span>
        </button>
        <a href="/thumbnail.png" download="ARCOX_Fleet_Thumbnail.png" class="flex-1 md:flex-none px-3 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition shadow-lg flex items-center justify-center gap-1">
          <span>🖼️</span> <span>Thumbnail</span>
        </a>
        <a href="/arcox-fleet-demo.mp4" download="ARCOX_Fleet_Demo.mp4" class="flex-1 md:flex-none px-3 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition shadow-lg flex items-center justify-center gap-1">
          <span>📥</span> <span>Demo Video</span>
        </a>
        <button id="btn-toggle-daemon" onclick="toggleDaemon()" class="flex-1 md:flex-none px-3 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white">
          <span id="toggle-icon">⏸</span> <span id="toggle-text">Stop</span>
        </button>
        <button id="btn-trigger" onclick="triggerManualCycle()" class="flex-1 md:flex-none px-3.5 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg flex items-center justify-center gap-1 active:scale-95">
          <span>⚡</span> <span>Scan Now</span>
        </button>
      </div>
    </header>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <div class="bg-cardbg border border-slate-800 rounded-xl p-4 shadow-lg">
        <div class="text-[11px] uppercase font-semibold tracking-wider text-slate-400">On-Chain USDC Balance</div>
        <div class="text-xl md:text-2xl font-bold text-white mt-1" id="stat-balance">Loading...</div>
        <div class="text-[11px] text-emerald-400 mt-0.5 font-mono">Arc Native Gas Token</div>
      </div>
      <div class="bg-cardbg border border-slate-800 rounded-xl p-4 shadow-lg">
        <div class="text-[11px] uppercase font-semibold tracking-wider text-slate-400">AI Compute Runway</div>
        <div class="text-xl md:text-2xl font-bold text-indigo-300 mt-1" id="stat-ai-balance">Loading...</div>
        <div class="text-[11px] text-indigo-400 mt-0.5 font-mono">AI Router Unified Balance</div>
      </div>
      <div class="bg-cardbg border border-slate-800 rounded-xl p-4 shadow-lg">
        <div class="text-[11px] uppercase font-semibold tracking-wider text-slate-400">Model Armor Daily Limit</div>
        <div class="text-xl md:text-2xl font-bold text-white mt-1" id="stat-daily-limit">$10.00 USDC</div>
        <div class="text-[11px] text-blue-400 mt-0.5 font-mono">Zero-Trust Guardrail</div>
      </div>
      <div class="bg-cardbg border border-slate-800 rounded-xl p-4 shadow-lg">
        <div class="text-[11px] uppercase font-semibold tracking-wider text-slate-400">Heartbeat Interval</div>
        <div class="text-xl md:text-2xl font-bold text-white mt-1" id="stat-interval">Every 60s</div>
        <div class="text-[11px] text-amber-400 mt-0.5 font-mono" id="stat-status-text">Autonomous Loop Active</div>
      </div>
    </div>

    <!-- Active x402 Premium Intelligence Feeds Banner -->
    <div class="bg-cardbg border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div class="flex items-center justify-between mb-2.5">
        <div class="flex items-center gap-2">
          <span class="text-lg">📡</span>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Active x402 Premium Intelligence Feeds (Auto-Paid via Micro-USDC)</h3>
        </div>
        <span class="text-[11px] text-teal-400 font-mono">Auto-Pay Active</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
        <div class="bg-subcard border border-slate-800/80 rounded-lg p-2.5">
          <div class="text-slate-400 text-[10px]">1. Arkham Whale Flow</div>
          <div class="text-teal-300 font-semibold mt-0.5">0.005 USDC/call</div>
        </div>
        <div class="bg-subcard border border-slate-800/80 rounded-lg p-2.5">
          <div class="text-slate-400 text-[10px]">2. DefiLlama Yield & TVL</div>
          <div class="text-teal-300 font-semibold mt-0.5">0.003 USDC/call</div>
        </div>
        <div class="bg-subcard border border-slate-800/80 rounded-lg p-2.5">
          <div class="text-slate-400 text-[10px]">3. CoinGecko Depth</div>
          <div class="text-teal-300 font-semibold mt-0.5">0.004 USDC/call</div>
        </div>
        <div class="bg-subcard border border-slate-800/80 rounded-lg p-2.5">
          <div class="text-slate-400 text-[10px]">4. Arc Gas & MEV Forecast</div>
          <div class="text-teal-300 font-semibold mt-0.5">0.002 USDC/call</div>
        </div>
        <div class="bg-subcard border border-slate-800/80 rounded-lg p-2.5 col-span-2 md:col-span-1">
          <div class="text-slate-400 text-[10px]">5. CCTP Cross-Chain Arb</div>
          <div class="text-teal-300 font-semibold mt-0.5">0.005 USDC/call</div>
        </div>
      </div>
    </div>


    <!-- Live Real-Time Gemini Reasoning Box -->
    <div class="bg-cardbg border border-indigo-500/30 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-0"></div>
      
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">🧠</span>
          <h2 class="text-base md:text-lg font-bold text-white">Live Gemini Autonomous Reasoning</h2>
        </div>
        <span id="gemini-decision-tag" class="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 uppercase">Analyzing...</span>
      </div>

      <div class="bg-subcard border border-slate-800 rounded-xl p-4 shadow-inner">
        <div class="text-xs uppercase text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
          <span class="flex items-center gap-2"><span>💭</span> <span>Autonomous Thought Stream (Updates on Every Scan):</span></span>
          <span id="reasoning-time" class="text-[10px] text-slate-500 font-mono">Syncing...</span>
        </div>
        <blockquote id="gemini-thought" class="text-sm md:text-base text-slate-200 italic font-mono leading-relaxed">
          Waiting for first scan cycle...
        </blockquote>
      </div>
    </div>

    <!-- Latest Execution Report Breakdown -->
    <div class="bg-cardbg border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base md:text-lg font-bold text-white flex items-center gap-2">
          <span>⚡</span> <span>Latest Execution & On-Chain Proof Report</span>
        </h2>
        <span id="report-timestamp" class="text-xs text-slate-400 font-mono">Just now</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="bg-subcard border border-slate-800 rounded-xl p-3.5">
          <div class="text-xs text-slate-400">Action Executed</div>
          <div class="text-base font-bold text-teal-300 mt-1 font-mono" id="report-action">-</div>
          <div class="text-xs text-slate-500 mt-0.5" id="report-intent">-</div>
        </div>
        <div class="bg-subcard border border-slate-800 rounded-xl p-3.5">
          <div class="text-xs text-slate-400">Pre vs Post Balance Delta</div>
          <div class="text-base font-bold text-amber-300 mt-1 font-mono" id="report-delta">-</div>
          <div class="text-xs text-slate-500 mt-0.5" id="report-balance-range">-</div>
        </div>
        <div class="bg-subcard border border-slate-800 rounded-xl p-3.5">
          <div class="text-xs text-slate-400">On-Chain Block & Explorer Proof</div>
          <div class="text-sm font-bold text-blue-400 mt-1 font-mono truncate" id="report-txhash">No Tx yet</div>
          <div class="text-xs text-slate-400 mt-0.5" id="report-explorer">-</div>
        </div>
      </div>
    </div>

    <!-- Audit Trail Table -->
    <div class="bg-cardbg border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base md:text-lg font-bold text-white flex items-center gap-2">
          <span>📜</span> Real-Time Audit Log & Telemetry History
        </h2>
        <span class="text-xs text-slate-400" id="log-count">0 logs recorded</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs md:text-sm text-slate-300">
          <thead class="text-[11px] text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
            <tr>
              <th class="px-3 py-2.5">Time</th>
              <th class="px-3 py-2.5">Decision</th>
              <th class="px-3 py-2.5">Balance Delta</th>
              <th class="px-3 py-2.5">On-Chain TxHash (ArcScan)</th>
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
    let isDaemonActive = true;

    function getApiEndpoint(endpoint) {
      const prefix = window.location.pathname.startsWith('/fleet') ? '/fleet' : '';
      return prefix + endpoint;
    }

    async function requestFleetApi(endpoint, options = {}) {
      const url = getApiEndpoint(endpoint);
      try {
        const res = await fetch(url, options);
        if (res.ok) return await res.json();
      } catch (err) {
        // Fallback to VPS backend if relative URL fails
      }

      try {
        const fallbackUrl = 'https://43.134.14.43.nip.io/fleet' + endpoint;
        const res2 = await fetch(fallbackUrl, options);
        return await res2.json();
      } catch (err2) {
        console.warn('API fetch warning:', err2.message);
        return { ok: false, error: err2.message };
      }
    }

    async function updateDashboard() {
      try {
        const [statusRes, logsRes] = await Promise.all([
          requestFleetApi('/api/fleet/status'),
          requestFleetApi('/api/fleet/logs')
        ]);

        if (statusRes && statusRes.ok) {
          isDaemonActive = statusRes.daemonRunning;
          updateDaemonUI(isDaemonActive);

          const bal = statusRes.balances?.balances?.Arc_Testnet?.balance || '0.00';
          document.getElementById('stat-balance').innerText = Number(bal).toFixed(4) + ' USDC';
          document.getElementById('stat-ai-balance').innerText = '$' + (statusRes.aiRouterStatus?.unifiedBalance?.totalConfirmedBalance || '0.00') + ' USDC';
          document.getElementById('stat-daily-limit').innerText = '$' + (statusRes.mscaStatus?.remainingLimitUsdc || '9.5') + ' USDC';

          if (statusRes.latestCycle && statusRes.latestCycle.autonomousDecision) {
            const dec = statusRes.latestCycle.autonomousDecision;
            const telem = statusRes.latestCycle.balanceTelemetry || {};
            const resObj = dec.executionResult || {};

            document.getElementById('gemini-decision-tag').innerText = 'DECISION: ' + dec.decision + ' (' + (dec.model || 'Gemini') + ')';
            document.getElementById('gemini-thought').innerText = '"' + dec.reasoning + '"';
            document.getElementById('reasoning-time').innerText = 'Updated: ' + new Date(statusRes.latestCycle.timestamp).toLocaleTimeString();
            document.getElementById('report-timestamp').innerText = new Date(statusRes.latestCycle.timestamp).toLocaleTimeString();
            document.getElementById('report-action').innerText = dec.decision;
            document.getElementById('report-intent').innerText = resObj.intent ? 'Intent: ' + resObj.intent : 'Status: ' + (resObj.status || 'DONE');
            document.getElementById('report-delta').innerText = telem.delta ? telem.delta : '0.000000 USDC';
            document.getElementById('report-balance-range').innerText = telem.initialBalance ? telem.initialBalance + ' ➔ ' + telem.finalBalance : '-';

            const txHash = resObj.txHash || '-';
            if (txHash !== '-') {
              document.getElementById('report-txhash').innerHTML = '<a href="https://testnet.arcscan.app/tx/' + txHash + '" target="_blank" class="text-blue-400 hover:underline font-mono">' + txHash.slice(0, 12) + '...' + txHash.slice(-8) + ' ↗</a>';
              document.getElementById('report-explorer').innerHTML = '<a href="https://testnet.arcscan.app/tx/' + txHash + '" target="_blank" class="text-teal-400 hover:underline text-xs">Verify on ArcScan Explorer ↗</a>';
            } else {
              document.getElementById('report-txhash').innerText = 'Passive Hold / Telemetry';
              document.getElementById('report-explorer').innerText = 'No on-chain state mutation';
            }
          }
        }

        if (logsRes && logsRes.ok && logsRes.logs && logsRes.logs.length > 0) {
          document.getElementById('log-count').innerText = logsRes.logs.length + ' logs recorded';

          const tbody = document.getElementById('logs-table-body');
          tbody.innerHTML = logsRes.logs.map(log => {
            const txHash = log.summary?.autonomousDecision?.executionResult?.txHash || log.details?.result?.txHash || '-';
            const explorerLink = txHash !== '-' 
              ? '<a href="https://testnet.arcscan.app/tx/' + txHash + '" target="_blank" class="text-blue-400 hover:underline font-mono text-xs">' + txHash.slice(0, 10) + '...' + txHash.slice(-8) + ' ↗</a>'
              : '<span class="text-slate-500 text-xs">Passive Telemetry</span>';
            
            const actionText = log.summary?.autonomousDecision?.decision || log.action || 'CYCLE';
            const deltaText = log.summary?.balanceTelemetry?.delta || '0.0000 USDC';

            return '<tr class="hover:bg-slate-800/30 transition">' +
              '<td class="px-3 py-2.5 text-slate-400 font-mono text-xs">' + new Date(log.timestamp).toLocaleTimeString() + '</td>' +
              '<td class="px-3 py-2.5 font-semibold text-slate-200"><span class="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">' + actionText + '</span></td>' +
              '<td class="px-3 py-2.5 font-mono text-xs text-amber-300">' + deltaText + '</td>' +
              '<td class="px-3 py-2.5">' + explorerLink + '</td>' +
            '</tr>';
          }).join('');
        }
      } catch (e) {
        console.error('Update failed:', e);
      }
    }

    function updateDaemonUI(isRunning) {
      const badge = document.getElementById('daemon-badge');
      const btn = document.getElementById('btn-toggle-daemon');
      const icon = document.getElementById('toggle-icon');
      const text = document.getElementById('toggle-text');
      const intervalStat = document.getElementById('stat-interval');
      const statusText = document.getElementById('stat-status-text');

      if (isRunning) {
        badge.innerText = '● 24/7 RUNNING (60s)';
        badge.className = 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse';
        btn.className = 'flex-1 md:flex-none px-3 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white';
        icon.innerText = '⏸';
        text.innerText = 'Stop';
        intervalStat.innerText = 'Every 60s';
        statusText.innerText = 'Autonomous Loop Active';
      } else {
        badge.innerText = '⏸ PAUSED';
        badge.className = 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30';
        btn.className = 'flex-1 md:flex-none px-3 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white';
        icon.innerText = '▶';
        text.innerText = 'Start';
        intervalStat.innerText = 'PAUSED';
        statusText.innerText = 'Waiting for manual trigger';
      }
    }

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

    async function claimFaucet() {
      const btn = document.getElementById('btn-faucet');
      btn.innerText = '⏳ Refueling...';
      btn.disabled = true;
      try {
        const res = await requestFleetApi('/api/fleet/claim-faucet', { method: 'POST' });
        if (res && res.ok && res.result) {
          alert('🚰 Faucet Refilled! ' + res.result.claimedAmount + ' added to wallet on Arc Testnet.');
          await updateDashboard();
        } else {
          alert('Faucet notice: ' + (res?.error || 'Request processed'));
        }
      } catch (e) {
        alert('Faucet error: ' + e.message);
      } finally {
        btn.innerHTML = '<span>🚰</span> <span>Claim Faucet</span>';
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
        }
      } catch (e) {
        alert('Scan notice: ' + e.message);
      } finally {
        btn.innerHTML = '<span>⚡</span> <span>Scan Now</span>';
        btn.disabled = false;
      }
    }

    setInterval(updateDashboard, 3000);
    updateDashboard();
  </script>

</body>
</html>`)
})


// 2. Direct Downloads Routes
app.get('/download-demo', (req, res) => {
  const filePath = path.join(__dirname, '../public/arcox-fleet-demo.mp4')
  res.download(filePath, 'ARCOX_Fleet_Demo.mp4')
})

app.get('/download-thumbnail', (req, res) => {
  const filePath = path.join(__dirname, '../public/thumbnail.png')
  res.download(filePath, 'ARCOX_Fleet_Thumbnail.png')
})

app.get('/download-architecture', (req, res) => {
  const filePath = path.join(__dirname, '../public/architecture_diagram.png')
  res.download(filePath, 'ARCOX_Fleet_Architecture_Diagram.png')
})

const VPS_UPSTREAM = 'https://43.134.14.43.nip.io/fleet'

// 3. Real-time Status & Execution APIs
// If running in Vercel Serverless environment, proxy all API calls to the 24/7 VPS daemon
// so there is always exactly ONE single persistent background instance!
if (process.env.VERCEL === '1') {
  app.use('/api/fleet', async (req, res) => {
    const targetUrl = `${VPS_UPSTREAM}/api/fleet${req.url}`
    try {
      const fetchOpts = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
        fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      }
      const upstream = await fetch(targetUrl, fetchOpts)
      const data = await upstream.json().catch(() => ({ ok: false }))
      return res.status(upstream.status).json(data)
    } catch (err) {
      return res.status(502).json({ ok: false, error: `VPS daemon upstream error: ${err.message}` })
    }
  })
}

// 3. Local Real-time Status API (VPS Execution)
app.get('/api/fleet/status', async (req, res) => {

  try {
    const [walletBalances, mscaStatus, aiRouterStatus] = await Promise.all([
      orchestrator.mcpClient.getWalletBalances(),
      orchestrator.mcpClient.getMscaStatus(),
      orchestrator.mcpClient.getAiRouterStatus(),
    ])
    res.json({
      ok: true,
      balances: walletBalances,
      mscaStatus,
      aiRouterStatus,
      daemonRunning: orchestrator.isRunning,
      latestCycle: orchestrator.latestCycleSummary,
    })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

// 4. Daemon Control APIs: Start & Stop
app.post('/api/fleet/daemon/start', (req, res) => {
  const interval = Number(process.env.AUTONOMOUS_INTERVAL_SECONDS) || 60
  orchestrator.startAutonomousDaemon(interval)
  res.json({ ok: true, running: true, message: 'Autonomous daemon started' })
})

app.post('/api/fleet/daemon/stop', (req, res) => {
  orchestrator.stopAutonomousDaemon()
  res.json({ ok: true, running: false, message: 'Autonomous daemon stopped' })
})

// 5. Trigger API
app.post('/api/fleet/run-cycle', async (req, res) => {
  try {
    const result = await orchestrator.runAutonomousCycle('API_REQUEST')
    res.json({ ok: true, result })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

// 5b. Faucet Claim API
app.post('/api/fleet/claim-faucet', async (req, res) => {
  try {
    const walletAddress = orchestrator.mcpClient.account ? orchestrator.mcpClient.account.address : req.body.address
    const result = await orchestrator.mcpClient.claimTestnetUsdcFaucet(walletAddress)
    res.json({ ok: true, result })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

// 6. Audit logs API
app.get('/api/fleet/logs', async (req, res) => {
  try {
    const logs = await orchestrator.memoryBank.listRecentLogs(25)
    res.json({ ok: true, count: logs.length, logs })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
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

