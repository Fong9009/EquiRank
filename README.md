# EquiRank — Financial Marketplace Platform

---

## About the project

This project was built for **FIT3048 Industry Experience** at Monash University, working with a real client to deliver a production-style financial marketplace.

EquiRank is a **B2B-style marketplace** where **borrowers** submit loan requests, **lenders** browse and fund them, and **admins** approve users, manage requests, and configure risk settings. The app includes registration with admin approval, JWT-based sessions, profile completion wizards, loan and company analytics with charts, and an admin panel for user/contact/loan management.

*This repository is intended for portfolio review. To run it locally, please follow the setup below.*

---

## Highlights

- **Full-stack** — Next.js 16 (App Router), React 19, TypeScript, MySQL; API routes and server-side logic
- **Authentication & authorization** — NextAuth.js v5 (credentials + JWT), role-based access (borrower / lender / admin), approval workflow
- **Database** — MySQL with schema, migrations CLI, connection pooling, and optional backups
- **Security** — bcrypt password hashing, rate limiting, security headers, parameterized queries
- **UX** — Responsive layout, dark theme, charts (Recharts), carousels (Swiper), profile wizards
- **Admin tooling** — User approval, contact messages, loan request management, risk settings, file cleanup

---

## Tech stack

| Area                | Technologies                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **Frontend**  | Next.js 16, React 19, TypeScript, CSS Modules, Tailwind CSS, Lucide React, Recharts, Swiper            |
| **Backend**   | Next.js API Routes, NextAuth.js v5, MySQL (mysql2), JWT, bcryptjs                                      |
| **Database**  | MySQL 8+, schema in `src/database/schema.sql`, migrations and CLI (`db:init`, `db:health`, etc.) |
| **Dev / Ops** | Turbopack (dev), Vercel/Railway-ready (env-based config)                                               |

---

## What’s in the app

- **Borrowers** — Register, complete profile, create and manage loan requests
- **Lenders** — Browse available loans, view company and covenant analytics, fund loans, recent searches
- **Admins** — Approve/reject users, manage contact messages, assign funders, configure risk weights, view archived requests, file cleanup

---

## Getting started (local run)

**Prerequisites:** Node.js 18+, npm, MySQL 8+

1. **Clone and install**

   ```bash
   git clone https://github.com/YOUR_USERNAME/EquiRank.git
   cd EquiRank
   npm install
   ```
2. **Environment**

   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local`: set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and generate `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`). See `env.example` for all options.
3. **Database**

   ```bash
   mysql -u YOUR_USER -p -e "CREATE DATABASE IF NOT EXISTS equirank;"
   mysql -u YOUR_USER -p equirank < src/database/schema.sql
   npm run db:health   # verify connection
   ```
4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Admin panel: `/dashboard/admin` (after logging in as an admin).

---

## Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`        | Start dev server (Turbopack) |
| `npm run build`      | Production build             |
| `npm run start`      | Run production build         |
| `npm run lint`       | ESLint                       |
| `npm run db:health`  | Check DB connection          |
| `npm run db:init`    | Initialize DB and migrations |
| `npm run db:migrate` | Run pending migrations       |

---

## Project context

- **Purpose** — Developed for **FIT3048 Industry Experience** (Monash University) with a real client; portfolio use with permission.
- **Deployment** — Configured for Vercel (frontend) and Railway for MySQL; see `env.example` and the Deployment section in the repo for production env vars.
- **Security** — Secrets (e.g. `NEXTAUTH_SECRET`, `JWT_SECRET`, DB credentials) are not committed; use `.env.local` locally and platform env vars in production.
