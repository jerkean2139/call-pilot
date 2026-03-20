# Living Legacy

A private, premium Baby Journal & Tracker PWA for families — designed for emotional memory capture, ultra-fast logging, AI-assisted voice journaling, legacy preservation, and family sharing.

## Features

- **One-Handed Quick Logging** — Diaper, feeding, and sleep logs in under 3 seconds
- **Journal & Media Entries** — Rich journal entries with photo/video uploads via Cloudinary
- **Time Capsule Vault** — Encrypted "Letters to the Future" with server-enforced unlock dates
- **AI Voice Memo Alchemist** — Record voice memos, get AI-transcribed and analyzed (OpenAI/mock fallback)
- **Dynamic Milestones** — CDC-inspired milestone tracker with progress visuals
- **Shared Family Timeline** — Real-time family activity feed with polling updates
- **QR Video Anchors** — Generate printable QR codes for video entries
- **Memory Threads** — Auto-grouped storylines from entries
- **Playback Mode** — Browse baby's life by age phase
- **Parent Emotion Layer** — Tag entries with emotions, filter by feeling
- **Print Export** — Printable baby book layout with QR codes for videos
- **Offline Capture** — Log entries offline, auto-sync when back online
- **PWA** — Installable, offline-capable progressive web app

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma
- NextAuth.js (Google + Magic Link)
- Cloudinary (media storage)
- OpenAI Whisper (voice transcription, optional)
- Framer Motion (animations)
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

### Local Development

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd living-legacy
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values (at minimum, set NEXTAUTH_SECRET and ENCRYPTION_KEY)
   ```

3. **Start PostgreSQL:**
   ```bash
   docker compose up -d
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

6. **Start the dev server:**
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

### Quick Setup (one command)

```bash
docker compose up -d && npm install && npx prisma migrate dev && npm run dev
```

## Environment Variables

See `.env.example` for all required and optional variables.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Session encryption secret |
| `NEXTAUTH_URL` | Yes | App URL (http://localhost:3000 for dev) |
| `ENCRYPTION_KEY` | Yes | 32-byte hex key for time capsule encryption |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `EMAIL_SERVER_*` | No | SMTP settings for magic link |
| `CLOUDINARY_*` | No | Cloudinary credentials (mock fallback available) |
| `OPENAI_API_KEY` | No | OpenAI key for Whisper + GPT (mock fallback available) |

## Testing

```bash
npm run test        # Run tests once
npm run test:watch  # Watch mode
```

## Deployment (Railway)

1. Connect your GitHub repo to Railway
2. Add a PostgreSQL plugin
3. Set environment variables in Railway dashboard
4. Railway will auto-detect `railway.toml` and build with Docker
5. Migrations run automatically on deploy

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (app)/app/         # Authenticated app routes
│   ├── (auth)/            # Login + onboarding
│   ├── api/               # API route handlers
│   ├── share/             # Public share routes
│   └── print/             # Print export routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # App shell, navigation
│   └── ...                # Feature components
├── lib/
│   ├── auth/              # NextAuth config
│   ├── db/                # Prisma client + queries
│   ├── ai/                # Voice analysis (OpenAI/mock)
│   ├── cloudinary/        # Media upload
│   ├── encryption/        # Time capsule encryption
│   ├── offline/           # Offline queue management
│   └── qr/                # QR code generation
├── hooks/                 # React hooks
├── prisma/                # Schema + migrations + seed
├── public/                # PWA manifest, icons, SW
├── types/                 # TypeScript types
└── __tests__/             # Test files
```

## Family Groups

This app is designed for two specific family groups:

- **Brynleigh's Family** (Brennen + Halle) — Strawberry theme
- **Easton's Family** (Karley + Dillon) — Storybook theme

Both families share a caregiver (Grandma Sue).

## Privacy

- Invite-only access
- Family-isolated data
- Server-side authorization on all mutations
- Encrypted time capsule content
- Tokenized share links for QR videos
