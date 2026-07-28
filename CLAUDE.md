# Cellgenic Document Manager

## Project Overview

This is a production internal SaaS application for Cellgenic.

Purpose:

Manage product documents without requiring users to access WordPress.

Current supported document types:

- COA
- MSDS
- IFU
- Brochure
- Package Insert

Future integrations:

- WordPress REST API
- Cloudflare R2
- Supabase

---

# Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- App Router

---

# IMPORTANT RULES

Never modify these files unless explicitly requested:

- app/globals.css
- package.json
- next.config.ts
- tsconfig.json
- postcss.config.*

If you think they need changes:

STOP

Explain why first.

Do not edit them automatically.

---

# Tailwind CSS Rules

This project uses Tailwind CSS v4.

Never use:

@tailwind base;
@tailwind components;
@tailwind utilities;

Never use:

theme(...)

Always use Tailwind v4 syntax.

---

# UI Style

Professional SaaS UI.

Inspired by:

- Linear
- Vercel
- Stripe Dashboard

Requirements:

- Dark mode
- Minimal
- Modern
- Responsive
- Reusable components

---

# Code Rules

Always create reusable components.

Never duplicate code.

Prefer server components whenever possible.

Only use client components when required.

Keep folder structure organized.

Explain every created file.

---

# Design Philosophy

This is NOT a demo.

This is a production-ready application.

Every feature should be scalable.

Do not create fake implementations that cannot later connect to:

- Supabase
- Cloudflare R2
- WordPress REST API

Always think about future scalability.

---

# Development Workflow

Never create multiple features at once.

One prompt = One feature.

Never refactor unrelated code.

Only modify files required for the current task.

---

# Current Sprint

Sprint 2

Current objective:

Develop the Documents module.

Do not work on authentication.

Do not work on backend.

Do not install new libraries unless requested.