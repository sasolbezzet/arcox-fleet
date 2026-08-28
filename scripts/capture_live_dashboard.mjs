/**
 * Live Web Dashboard Video Capture Script
 * Spawns headless Chrome, captures high-res frames continuously during a live autonomous cycle.
 */

import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const FRAMES_DIR = '/home/ubuntu/arcox-fleet/media/live_frames'
fs.mkdirSync(FRAMES_DIR, { recursive: true })

// Clean old frames
execSync(`rm -rf ${FRAMES_DIR}/*`)

console.log('🚀 Starting Headless Chrome for Live Execution Capture...')

// Trigger a manual cycle in parallel after 2 seconds
setTimeout(async () => {
  try {
    console.log('⚡ Triggering autonomous cycle via API...')
    await fetch('http://localhost:8080/api/fleet/run-cycle', { method: 'POST' })
    console.log('✅ Cycle trigger broadcasted!')
  } catch (err) {
    console.error('Trigger failed:', err.message)
  }
}, 2000)

// Capture 120 frames over 24 seconds (~5 frames per second)
const TOTAL_FRAMES = 120
const INTERVAL_MS = 200

let frameIndex = 0

const captureInterval = setInterval(() => {
  if (frameIndex >= TOTAL_FRAMES) {
    clearInterval(captureInterval)
    console.log(`✅ Captured ${frameIndex} live execution frames!`)
    process.exit(0)
  }

  const padded = String(frameIndex).padStart(4, '0')
  const outPath = path.join(FRAMES_DIR, `frame_${padded}.png`)
  
  try {
    execSync(`google-chrome --headless --no-sandbox --disable-gpu --window-size=1920,1080 --screenshot=${outPath} http://localhost:8080/`, {
      stdio: 'ignore',
      timeout: 1500,
    })
  } catch {}

  frameIndex++
  if (frameIndex % 10 === 0) {
    console.log(`📸 Captured live frame ${frameIndex}/${TOTAL_FRAMES}...`)
  }
}, INTERVAL_MS)
