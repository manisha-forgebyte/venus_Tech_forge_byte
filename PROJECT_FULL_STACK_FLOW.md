# Venu Tech Full Stack Flow

This file explains the main frontend, backend, database flow, what was changed, and the common commands to run/check the project.

## 1. Project Parts

### Frontend

Path:

```txt
frontend/
```

Technology:

```txt
Angular 17
```

Main responsibility:

- Shows UI screens.
- Handles login forms, company pages, filings, entities, assets, invoices, users, etc.
- Calls backend APIs through one base path: `/api`.
- Does not connect directly to the database.

Important frontend files:

```txt
frontend/src/environments/environment.ts
frontend/src/environments/environment.prod.ts
frontend/src/app/core/services/api.service.ts
frontend/proxy.conf.json
frontend/src/index.html
```

Current frontend API setup:

```ts
baseUrl: '/api'
```

This means frontend calls URLs like:

```txt
/api/Login/GetLogin
/api/User/GetListByCID/1
/api/Company/GetCompanyListByAID/1
```

### Backend

Path:

```txt
backend/
```

Technology:

```txt
NestJS + Prisma
```

Main responsibility:

- Receives frontend API calls.
- Handles login/authentication.
- Reads/writes database data.
- Returns data back to frontend.

Important backend files:

```txt
backend/src/main.ts
backend/src/app.module.ts
backend/src/modules/auth/auth.controller.ts
backend/src/modules/auth/auth.service.ts
backend/src/modules/compatibility/compatibility.controller.ts
backend/src/prisma/prisma.service.ts
backend/src/prisma/schema.prisma
backend/src/prisma/seed.ts
backend/.env
```

Backend runs on:

```txt
http://localhost:3000
```

### Database

Technology:

```txt
PostgreSQL
```

Database connection from `backend/.env`:

```txt
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/venu_tech_db?schema=public"
```

Database name:

```txt
venu_tech_db
```

Database port:

```txt
5433
```

Database user:

```txt
postgres
```

The frontend does not use this database URL. Only the backend uses it through Prisma.

## 2. What We Fixed

The frontend production config previously pointed to an external Azure backend URL:

```txt
https://mbrapi-gheraeemegh5d4ct.eastus-01.azurewebsites.net/api
```

That was removed from the frontend connection flow.

Now both frontend environment files use:

```txt
/api
```

Changed file:

```txt
frontend/src/environments/environment.prod.ts
```

Current value:

```ts
baseUrl: '/api'
```

Also updated browser connection policy in:

```txt
frontend/src/index.html
```

Current CSP connection rule:

```txt
connect-src 'self'
```

Meaning:

- Frontend API/data requests stay on the same site.
- No direct connection to the old Azure backend is allowed by CSP.
- In local development, Angular proxy sends `/api` to the local backend.

## 3. Application Flow

Normal local flow:

```txt
User
  -> Angular frontend at http://localhost:4200
  -> frontend calls /api/...
  -> Angular proxy forwards /api to http://localhost:3000
  -> NestJS backend receives request
  -> Prisma talks to PostgreSQL database
  -> Backend returns JSON/data to frontend
  -> Frontend displays data
```

Login flow:

```txt
Login page
  -> api.service.ts calls /api/Login/GetLogin
  -> AuthController/AuthService validates email and password
  -> Prisma checks User table
  -> Backend returns user data + access token + refresh token
  -> Frontend stores/uses token and opens application pages
```

Database flow:

```txt
backend/.env DATABASE_URL
  -> PrismaService
  -> Prisma Client
  -> PostgreSQL venu_tech_db
```

## 4. Admin Details

The seed file creates/updates this local admin user:

```txt
Email: puttugunasekhar@forgebyte.ai
Password: Latha@2004
Role: Site Admin
aid: 1
cid: 1
gid: 1
isActive: true
```

Seed file:

```txt
backend/src/prisma/seed.ts
```

The seed also disables this old admin account if it exists:

```txt
admin@venu.tech
```

## 5. Commands

Run these commands from the project root unless noted.

### Install frontend dependencies

```powershell
cd frontend
npm install
```

### Start frontend

```powershell
cd frontend
npm start
```

Frontend URL:

```txt
http://localhost:4200
```

### Build frontend

```powershell
cd frontend
npm run build
```

### Install backend dependencies

```powershell
cd backend
npm install
```

### Start backend

```powershell
cd backend
npm run start:dev
```

Backend URL:

```txt
http://localhost:3000
```

### Check backend health

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Expected idea:

```txt
status: ok
service: venu-tech-backend
```

### Generate Prisma client

```powershell
cd backend
npx prisma generate --schema=src/prisma/schema.prisma
```

### Push Prisma schema to database

```powershell
cd backend
npx prisma db push --schema=src/prisma/schema.prisma
```

### Seed admin user

```powershell
cd backend
npx prisma db seed
```

### Open Prisma Studio

```powershell
cd backend
npx prisma studio --schema=src/prisma/schema.prisma
```

Use Prisma Studio to view/edit database rows in browser.

### Check admin user with Prisma Studio

1. Run backend database setup.
2. Run:

```powershell
cd backend
npx prisma studio --schema=src/prisma/schema.prisma
```

3. Open the `User` table.
4. Search:

```txt
puttugunasekhar@forgebyte.ai
```

### Check admin user with psql

Use this if PostgreSQL `psql` command is available:

```powershell
psql "postgresql://postgres:postgres123@localhost:5433/venu_tech_db?schema=public" -c "select uid, name, email, role, aid, cid, gid, \"isActive\" from \"User\";"
```

### Test login API directly

Start backend first, then run:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/api/Login/GetLogin -ContentType "application/json" -Body '{"email":"puttugunasekhar@forgebyte.ai","password":"Latha@2004"}'
```

If login works, backend returns user details and tokens.

## 6. How To Confirm Frontend Uses Only Backend

Check frontend API environment:

```powershell
Get-Content frontend/src/environments/environment.ts
Get-Content frontend/src/environments/environment.prod.ts
```

Both should show:

```txt
baseUrl: '/api'
```

Check proxy:

```powershell
Get-Content frontend/proxy.conf.json
```

It should show:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Search for old external API URLs:

```powershell
rg -n "mbrapi-gheraeemegh5d4ct|azurewebsites|baseUrl.*http|connect-src.*http" frontend/src frontend/proxy.conf.json frontend/angular.json frontend/package.json --glob "!src/assets/**"
```

Expected:

```txt
No results
```

## 7. Important Notes

- Frontend connects to backend only through `/api`.
- Backend connects to PostgreSQL using `DATABASE_URL`.
- Frontend never connects directly to PostgreSQL.
- `frontend/src/assets/eia-data.json` is a local static asset, not a database connection.
- Google Fonts in `index.html` are for font loading, not backend/database access.
- FERC URLs are external validation/page URLs, not the project backend or database.

kay please complete that full backend without distrubing my existiong code not get more errors full backend i need and database note here we writen based on frontend  never cahnge anything on frontend in frontend we do only that concetions to backend and database main we build that backend anddata base never distrub my existing code 