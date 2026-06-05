# KidGuardian

KidGuardian is a privacy-first child safety support MVP for parents and legal guardians.

It helps with transparent, consent-based monitoring of wellbeing signals, incident logging, pattern review, and professional reporting without covert surveillance. The app is intentionally not a diagnostic tool and does not determine guilt, abuse, or legal conclusions.

## Core Principles

- Transparent, opt-in monitoring only
- No covert audio recording
- No hidden background listening
- No facial recognition or biometric identification
- No automatic accusations or legal conclusions
- Clear privacy, consent, and recording indicators
- Raw audio is discarded by default unless a guardian explicitly saves a short clip
- Sensitive actions are written to the audit log

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Prisma 7
- PostgreSQL-compatible persistence layer via Prisma snapshot storage
- Vitest for risk-scoring tests

## What the MVP Includes

- Onboarding with privacy and legal consent
- Child profile management
- Safety dashboard
- Optional baby monitor mode with visible listening indicators
- Incident log and structured notes
- Pattern detection
- Risk scoring with `Low`, `Watch`, `Concerning`, and `Urgent`
- Alerts and review actions
- Professional report generation with PDF export
- Audit logs, consent records, and export requests

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Optional: a PostgreSQL database if you want persistent storage

### Install

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and set the values you need.

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kidguardian
AUTH_SECRET=replace-with-a-long-random-secret
APP_URL=http://localhost:3000
```

- `DATABASE_URL` is optional for local demo mode, but required for persistent snapshot storage.
- `AUTH_SECRET` signs the session cookie.
- `APP_URL` should match your local dev URL or production domain.

### Optional database setup

If you want persistence across reloads or serverless invocations, point `DATABASE_URL` at a PostgreSQL database and push the schema:

```bash
npm run prisma:push
```

The app stores its workspace snapshot in Prisma when a database is available. If no database is configured, it falls back to transparent in-memory demo mode.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Vercel Deployment

1. Push the repository to GitHub at `https://github.com/ignacioperezroca/kid-guardian`.
2. Create a Vercel project named `kid-guardian`.
3. Set the production domain to `kid-guardian.vercel.app`.
4. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `APP_URL=https://kid-guardian.vercel.app`
5. If you want persistent storage, connect a PostgreSQL database and run `npm run prisma:push` against it before or during rollout.
6. Deploy from the `main` branch.

## Safety Disclaimer

KidGuardian is a child safety support tool. It does not diagnose abuse, determine guilt, provide legal advice, or replace emergency services, medical professionals, therapists, schools, or child protection authorities. If a child is in immediate danger, contact emergency services or the appropriate child protection authority.

## Notes for Reviewers

- Risk scores are decision-support signals, not diagnoses or proof.
- Audio analysis is intentionally local-first and mock-driven for the MVP.
- The report PDF and alert workflow are designed for professional sharing with context, not accusation.
