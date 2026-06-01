# Venu Tech eTariff Management System

Venu Tech eTariff Management System is a full-stack enterprise application for managing regulatory, operational, and billing data in a legacy-compatible workflow. The frontend is built with Angular and communicates with a NestJS backend through `/api`, while the backend uses Prisma and PostgreSQL to persist users, accounts, companies, assets, entities, filings, invoices, and market-related records.

## Architecture

- Frontend: Angular 17
- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma
- API style: legacy-compatible `/api/{Module}/{Action}` routes

## Key Capabilities

- Authentication and role-based access
- User, account, and company management
- Asset and entity workflows
- Filing and invoice handling
- Market study and reserve data support
- Database-backed compatibility for existing frontend screens

## Repository Structure

- `frontend/` Angular application
- `backend/` NestJS API and Prisma models
- `docker-compose.yml` local infrastructure support
- `PROJECT_FULL_STACK_FLOW.md` high-level system flow
- `BACKEND_DATABASE_PHASE_PROGRESS.md` backend/database phase tracking

## Setup

### Frontend

```powershell
cd frontend
npm install
npm start
```

### Backend

```powershell
cd backend
npm install
npm run start:dev
```

### Database

The backend uses Prisma against PostgreSQL. See `backend/src/prisma/schema.prisma` and `backend/src/prisma/seed.ts` for the current schema and seed data.

