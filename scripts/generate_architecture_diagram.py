#!/usr/bin/env python3
"""
Generate a high-definition, professional System Architecture Diagram PNG (1920x1080)
specifically tailored for the 'Architecture diagram' file upload requirement on Devpost.
"""

import os
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1920, 1080
OUT_PATH = '/home/ubuntu/arcox-fleet/public/architecture_diagram.png'

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'

font_title = ImageFont.truetype(FONT_BOLD, 42)
font_h2 = ImageFont.truetype(FONT_BOLD, 26)
font_h3 = ImageFont.truetype(FONT_BOLD, 20)
font_body = ImageFont.truetype(FONT_REG, 17)
font_mono = ImageFont.truetype(FONT_MONO, 16)
font_badge = ImageFont.truetype(FONT_BOLD, 15)

img = Image.new('RGB', (WIDTH, HEIGHT), color='#0B0F17')
draw = ImageDraw.Draw(img)

# Top Bar
draw.rectangle([0, 0, WIDTH, 8], fill='#4F46E5')

# Header
draw.rounded_rectangle([60, 40, 480, 75], radius=6, fill='#1E1B4B', outline='#4338CA')
draw.text((75, 48), "TRACK 3: THE FORTIFIED ENTERPRISE FLEET", font=font_badge, fill='#A5B4FC')

draw.text((60, 95), "ARCOX Fleet — End-to-End System Architecture", font=font_title, fill='#FFFFFF')
draw.text((60, 150), "Decoupled Google ADK Swarm Pattern on Google Cloud & Arc Network Layer-1 EVM", font=font_body, fill='#38BDF8')

# Layer 1: Multi-Agent Triad Swarm (Google Cloud Runtime)
draw.rounded_rectangle([60, 200, 1860, 560], radius=16, fill='#111927', outline='#4F46E5', width=2)
draw.text((90, 220), "LAYER 1: TRIAD MULTI-AGENT SWARM (Google Agent Development Kit / GenAI SDK)", font=font_h2, fill='#818CF8')

# Agent 1 Card
draw.rounded_rectangle([90, 270, 640, 525], radius=12, fill='#0F2338', outline='#0284C7', width=2)
draw.text((115, 290), "🕵️ 1. Scout Agent", font=font_h3, fill='#38BDF8')
draw.text((115, 325), "Discovery & Paywall Protocol", font=font_badge, fill='#94A3B8')
draw.line([(115, 350), (615, 350)], fill='#334155', width=1)
draw.text((115, 370), "• Scans Arc Testnet DEX liquidity pools", font=font_body, fill='#E2E8F0')
draw.text((115, 405), "• Detects x402 paywalled intelligence", font=font_body, fill='#E2E8F0')
draw.text((115, 440), "• Settles on-chain 0.005 USDC memos", font=font_body, fill='#E2E8F0')
draw.text((115, 475), "• Emits structured JSON signal envelopes", font=font_body, fill='#E2E8F0')

# Arrow 1
draw.line([(645, 400), (695, 400)], fill='#38BDF8', width=3)
draw.polygon([(695, 400), (685, 393), (685, 407)], fill='#38BDF8')
draw.text((650, 375), "Signal", font=font_mono, fill='#38BDF8')

# Agent 2 Card
draw.rounded_rectangle([700, 270, 1250, 525], radius=12, fill='#1E1B4B', outline='#6366F1', width=2)
draw.text((725, 290), "🧠 2. Strategist Agent", font=font_h3, fill='#A5B4FC')
draw.text((725, 325), "Cognitive Brain & Zero-Trust Governance", font=font_badge, fill='#94A3B8')
draw.line([(725, 350), (1225, 350)], fill='#334155', width=1)
draw.text((725, 370), "• Powered by Gemini 3.5 & 2.5 Flash", font=font_body, fill='#E2E8F0')
draw.text((725, 405), "• Evaluates 7-service ARCOX catalog", font=font_body, fill='#E2E8F0')
draw.text((725, 440), "• Zero-Trust Model Armor Guardrail ($10 limit)", font=font_body, fill='#E2E8F0')
draw.text((725, 475), "• Action History memory to prevent trade churn", font=font_body, fill='#E2E8F0')

# Arrow 2
draw.line([(1255, 400), (1305, 400)], fill='#6366F1', width=3)
draw.polygon([(1305, 400), (1295, 393), (1295, 407)], fill='#6366F1')
draw.text((1260, 375), "Plan", font=font_mono, fill='#6366F1')

# Agent 3 Card
draw.rounded_rectangle([1310, 270, 1830, 525], radius=12, fill='#064E3B', outline='#10B981', width=2)
draw.text((1335, 290), "⚡ 3. Executor & Treasury", font=font_h3, fill='#34D399')
draw.text((1335, 325), "On-Chain Dispatch & Self-Funding", font=font_badge, fill='#94A3B8')
draw.line([(1335, 350), (1805, 350)], fill='#334155', width=1)
draw.text((1335, 370), "• Quote-Before-Execute preview check", font=font_body, fill='#E2E8F0')
draw.text((1335, 405), "• Signs real on-chain calls via Viem (EVM)", font=font_body, fill='#E2E8F0')
draw.text((1335, 440), "• AI Router Unified Balance auto-deposit", font=font_body, fill='#E2E8F0')
draw.text((1335, 475), "• Pre-Scan vs Post-Execution delta audit", font=font_body, fill='#E2E8F0')

# Layer 2: Persistence & Observability
draw.rounded_rectangle([60, 580, 1860, 740], radius=16, fill='#161F30', outline='#334155', width=2)
draw.text((90, 600), "LAYER 2: PERSISTENCE & OBSERVABILITY (Google Cloud Firestore & Live Commander)", font=font_h2, fill='#F59E0B')

draw.text((90, 645), "• Google Cloud Firestore: OpenTelemetry audit logs, multi-session memory, and fleet state persistence.", font=font_body, fill='#CBD5E1')
draw.text((90, 680), "• Live Web Commander Dashboard: Dark-mode real-time interface (Vercel / Cloud Run) with start/stop controls and ArcScan links.", font=font_body, fill='#CBD5E1')

# Layer 3: Blockchain Settlement
draw.rounded_rectangle([60, 760, 1860, 1000], radius=16, fill='#0D1F33', outline='#0284C7', width=2)
draw.text((90, 780), "LAYER 3: ON-CHAIN SETTLEMENT (Arc Network Layer-1 EVM Testnet — Chain ID: 5042002)", font=font_h2, fill='#38BDF8')

draw.text((90, 830), "• Native Gas Token: USDC (Gas is settled directly in USDC, eliminating multi-token volatility)", font=font_body, fill='#FFFFFF')
draw.text((90, 865), "• Router Contract: 0xDf800310443BEB589CEf91A09854203Ea36e43a7  •  Verified Tx Blocks on https://testnet.arcscan.app", font=font_mono, fill='#34D399')
draw.text((90, 900), "• Treasury & Intel: 0x5294E9927c3306DcBaDb03fe70b92e01cCede505  •  x402 Micropayment Protocol & AI Router Auto-Pay", font=font_mono, fill='#A5B4FC')
draw.text((90, 935), "• Security: Zero raw private key leakage; $10.00 daily spend caps; sub-second on-chain receipt verification", font=font_body, fill='#CBD5E1')

img.save(OUT_PATH, 'PNG')
print(f"Architecture diagram saved to: {OUT_PATH} (1920x1080 Full HD PNG)")
