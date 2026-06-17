Railway deployment checklist for backend

1. Environment variables (set in Railway service settings):
   - `DATABASE_URL` = your Railway Postgres connection string
   - `FRONTEND_URL` = https://caring-reverence-production-e548.up.railway.app
   - `JWT_SECRET` = (random secure string)
   - `JWT_REFRESH_SECRET` = (random secure string)

2. Start command
   - Ensure Railway uses `npm start` for this service. The project `package.json` contains a `prestart` hook that will run the Prisma init script (`scripts/prisma-init.sh`) before the app starts.

3. What the prestart script does
   - `npx prisma generate` (generate client)
   - `npx prisma db push` (push schema to the DB)
   - `node ./scripts/prisma-seed-runtime.js` (seed initial data)

4. Manual commands (Railway console / local) if needed
```bash
cd backend
npx prisma generate --schema=src/prisma/schema.prisma
npx prisma db push --schema=src/prisma/schema.prisma
node ./scripts/prisma-seed-runtime.js
```

5. Verify
   - Visit `https://<backend-url>/api/health` to confirm backend is up
   - Use the login POST to verify seeded admin user:
```bash
curl -X POST 'https://venustechforgebyte-production.up.railway.app/api/Login/GetLogin' \
  -H 'Content-Type: application/json' \
  -d '{"email":"puttugunasekhar@forgebyte.ai","password":"Latha@2004"}'
```

If you still see errors, check Railway build logs for the prestart output; the script prints steps and errors.
