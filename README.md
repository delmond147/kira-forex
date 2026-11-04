# KIRAFOREX Digital Platform

A production-grade digital platform for Kira — CEO of Kiraforex Trading Academy and Founder of Africa's Female Forex Traders.

## Architecture

This project is separated into two completely decoupled applications sharing a Supabase backend:

- `frontend/`: Independent public-facing Next.js App Router website (e.g. `kiraforex.com`)
- `admin-dashboard/`: Independent private CMS administration dashboard (e.g. `admin.kiraforex.com`)
- `supabase/`: Database migrations, RLS policies, and seed data
- `assets/`: Brand assets, official logos, and processed media
