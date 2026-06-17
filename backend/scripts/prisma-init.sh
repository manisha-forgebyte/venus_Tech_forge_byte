#!/usr/bin/env bash
set -e

echo "Prisma init script starting..."

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set; skipping Prisma DB initialization."
  exit 0
fi

echo "DATABASE_URL found, running Prisma generate, db push, and seed"
npx prisma generate --schema=src/prisma/schema.prisma
npx prisma db push --schema=src/prisma/schema.prisma
echo "Attempting to run runtime JS seed script"
# Use the runtime JS seed which does not require ts-node/devDependencies
if [ -f ./scripts/prisma-seed-runtime.js ]; then
  node ./scripts/prisma-seed-runtime.js || true
else
  echo "No runtime seed script found; skipping"
fi

echo "Prisma init script completed."
