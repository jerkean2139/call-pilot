# CoreTrack Assessment

## Project Context
This is a conversion-focused assessment tool for entrepreneurs deciding between hiring a business coach or a fractional Chief AI Officer (CAIO). The primary goal is lead generation — the assessment calculates real-time operational leakage in dollars and drives users to book a call with Jeremy.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS (primary: #D50000, secondary: #000000, accent: #FFFFFF)
- Framer Motion for animations
- Recharts for data visualization
- Lucide React for icons
- Fonts: Montserrat (headings), Open Sans (body)

## Design Principles
- Mobile-first, thumb-zone friendly
- Loss aversion framing ("You're losing $X" not "You could save $X")
- Real-time interactivity — calculator updates on every answer
- Minimal backend — keep assessment logic client-side
- Every page should drive toward the CTA (book a call with Jeremy)

## Key Routes
- `/` — Landing page
- `/leakage` — Leakage assessment with live calculator
- `/leakage/results` — Results with Coach vs CAIO recommendation
- `/assessment` — Original talent assessment (legacy)
