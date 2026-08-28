#!/usr/bin/env python3
"""
Generate a professional 3:2 ratio thumbnail (1200x800) for Devpost submission.
Clean typography, zero visual clutter, high contrast, modern developer aesthetic.
"""

import os
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 800
OUT_PATH = '/home/ubuntu/arcox-fleet/public/thumbnail.png'

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'

font_logo = ImageFont.truetype(FONT_BOLD, 48)
font_sub = ImageFont.truetype(FONT_BOLD, 22)
font_card_t = ImageFont.truetype(FONT_BOLD, 18)
font_card_b = ImageFont.truetype(FONT_REG, 15)
font_badge = ImageFont.truetype(FONT_BOLD, 14)
font_meta = ImageFont.truetype(FONT_MONO, 14)

img = Image.new('RGB', (WIDTH, HEIGHT), color='#0B0F17')
draw = ImageDraw.Draw(img)

# Top gradient bar
draw.rectangle([0, 0, WIDTH, 6], fill='#4F46E5')

# Track Badge
draw.rounded_rectangle([50, 45, 340, 75], radius=6, fill='#1E1B4B', outline='#4338CA')
draw.text((65, 52), "TRACK 3: THE FORTIFIED ENTERPRISE FLEET", font=font_badge, fill='#A5B4FC')

draw.rounded_rectangle([355, 45, 550, 75], radius=6, fill='#064E3B', outline='#059669')
draw.text((370, 52), "ALL THINGS AGENTIC", font=font_badge, fill='#34D399')

# Main Title
draw.text((50, 95), "ARCOX FLEET", font=font_logo, fill='#FFFFFF')
draw.text((50, 155), "Autonomous On-Chain Multi-Agent Swarm with Self-Funding AI Compute", font=font_sub, fill='#38BDF8')

# 3 Agent Architecture Cards
cards = [
    ("🕵️ Scout Agent", "• Scans Arc Testnet liquidity\n• Settles x402 USDC micropayments\n• Broadcasts market signals", '#0F2338', '#0284C7', 50),
    ("🧠 Strategist Agent", "• Google Gemini 3.5 & 2.5 Flash\n• 7-service ecosystem catalog\n• Zero-Trust Model Armor limits", '#1E1B4B', '#6366F1', 425),
    ("⚡ Executor Agent", "• Direct Viem on-chain signing\n• Arc DEX router token swaps\n• AI Router compute auto-deposit", '#064E3B', '#10B981', 800),
]

for title, desc, bg, border, x in cards:
    draw.rounded_rectangle([x, 210, x + 350, 470], radius=12, fill=bg, outline=border, width=2)
    draw.text((x + 20, 230), title, font=font_card_t, fill='#FFFFFF')
    draw.line([(x + 20, 260), (x + 330, 260)], fill='#334155', width=1)
    
    y = 280
    for line in desc.split('\n'):
        draw.text((x + 20, y), line, font=font_card_b, fill='#CBD5E1')
        y += 35

# Bottom Live Telemetry Showcase Box
draw.rounded_rectangle([50, 495, 1150, 730], radius=12, fill='#141D2E', outline='#334155', width=2)
draw.text((75, 515), "📊 VERIFIED LIVE ON-CHAIN & AI TELEMETRY (Arc Testnet 5042002):", font=font_card_t, fill='#F59E0B')

stats = [
    ("Native Gas Token:", "USDC (Arc Network Layer-1 EVM)"),
    ("Model Armor Daily Limit:", "$10.00 USDC with slippage guardrails (<1.5%)"),
    ("Dual-Balance Reconciliation:", "Pre-Scan vs Post-Execution delta tracking"),
    ("Self-Funding AI Router:", "Auto-replenishes LLM compute runway without humans"),
    ("Verified ArcScan Explorer Tx:", "https://testnet.arcscan.app (Block #59283984)")
]

y = 550
for k, v in stats:
    draw.text((75, y), f"• {k}", font=font_badge, fill='#94A3B8')
    draw.text((370, y), v, font=font_meta, fill='#38BDF8' if 'ArcScan' in k else '#FFFFFF')
    y += 34

# Footer
draw.text((50, 755), "Live Dashboard: https://43.134.14.43.nip.io/fleet/", font=font_meta, fill='#818CF8')
draw.text((WIDTH - 420, 755), "Built with Gemini 3.5 & Google GenAI SDK", font=font_meta, fill='#64748B')

img.save(OUT_PATH, 'PNG')
print(f"Thumbnail created successfully at: {OUT_PATH} (1200x800, exact 3:2 ratio)")
