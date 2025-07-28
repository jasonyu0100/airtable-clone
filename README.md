# Airtable Clone

A modern, open-source Airtable alternative built with the T3 Stack.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Authentication**: [NextAuth.js](https://next-auth.js.org) with Google OAuth
- **Database**: PostgreSQL with [Prisma](https://prisma.io) ORM
- **API**: [tRPC](https://trpc.io) for type-safe APIs
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Deployment**: Railway (Database) + Vercel (App)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/jasonyu0100/airtable-clone.git
cd airtable-clone
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler check
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (generate with `npx auth secret`)
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
