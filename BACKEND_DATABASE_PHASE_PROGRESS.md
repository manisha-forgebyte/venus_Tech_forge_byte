# Backend + Database Phase Progress

Rule:

```txt
Do one phase.
Verify expected result.
Only then move to next phase.
If expected result is not achieved, fix that phase first.
Do not touch frontend code.
Frontend is read only for API understanding and testing.
```

## Phase 1: Frontend API Audit

Status:

```txt
Completed
```

What was checked:

```txt
frontend/src/app/core/services/api.service.ts
frontend/src/app/core/services/auth.service.ts
frontend/src/environments/environment.ts
frontend/src/environments/environment.prod.ts
frontend/proxy.conf.json
```

Result:

```txt
Frontend uses /api as backend base URL.
Most backend calls are centralized in frontend/src/app/core/services/api.service.ts.
No frontend code change is required.
Backend must support existing /api/{Module}/{Action} routes.
```

API call references found:

```txt
Total API call references: 155
```

Module groups found:

```txt
Account: 13
Assets: 6
CatStatus: 7
Common: 9
Company: 12
Entities: 6
EtoE: 6
EtoGen: 6
EtoPPAs: 6
EtoVA: 6
FERCAPI: 2
Filing: 2
Filings: 4
IMSS: 8
Invoice: 16
IPSS: 9
Login: 3
MBRAuth: 7
Mitigation/Mitigations: 7
OR: 5
SelfLimit: 4
User: 11
```

Main backend scope found:

```txt
Login/auth APIs
User APIs
Account APIs
Company APIs
Common dropdown/master APIs
Assets APIs
Entities APIs
CatStatus APIs
EtoE APIs
EtoGen APIs
EtoPPAs APIs
EtoVA APIs
IMSS APIs
IPSS APIs
MBRAuth APIs
Filing/Filings APIs
Mitigation APIs
SelfLimit APIs
OR APIs
Invoice APIs
FERCAPI support endpoints
```

Expected Phase 1 result:

```txt
A clear list of frontend API modules and backend/database scope.
```

Phase 1 expected result:

```txt
Achieved
```

## Phase 2: Backend API Mapping

Status:

```txt
Completed
```

Goal:

```txt
Map each frontend API module to backend controller/service/database table plan.
No code implementation until mapping is clear.
```

Expected result:

```txt
Every frontend API module has a backend implementation plan.
No unknown backend/database area remains before schema work starts.
```

Current backend state:

```txt
AuthModule has working login/register/refresh/logout logic.
Users, companies, assets, entities, filings, market, and reserve now have real Prisma-backed services and controllers.
CompatibilityModule still catches /api/{area}/{action} frontend-style routes for legacy compatibility.
The compatibility layer still owns the remaining legacy routes for account, common, invoice, and a few special-case actions.
```

Recommended backend structure:

```txt
Keep CompatibilityController as the old frontend API adapter.
Move real logic into services as each module is completed.
CompatibilityController should call those services so frontend routes stay unchanged.
Do not change frontend URLs.
```

API to backend/database mapping:

```txt
Login
Backend: AuthController/AuthService
Database: User
Status: mostly complete

User
Backend: UsersService or CompatibilityController user handlers
Database: User, Role
Status: partly complete

Account
Backend: Account service through CompatibilityController
Database: Account, AccountGroup, UserAccount/permissions if needed
Status: placeholder

Company
Backend: Company service through CompatibilityController
Database: Company, CompanyFilingFlags, Account, AccountGroup
Status: placeholder

Common
Backend: Common lookup service through CompatibilityController
Database: Role, AccountGroup, CommonLookup, plus module-specific lookup values
Status: placeholder

Assets
Backend: Assets service through CompatibilityController
Database: Asset
Status: placeholder/empty module

Entities
Backend: Entities service through CompatibilityController
Database: Entity
Status: placeholder/empty module

CatStatus
Backend: Entities or CatStatus service through CompatibilityController
Database: CatStatus
Status: placeholder

EtoE
Backend: Entities relationship service through CompatibilityController
Database: EntityToEntity
Status: placeholder

EtoGen
Backend: Entities relationship service through CompatibilityController
Database: EntityToGeneratorAsset
Status: placeholder

EtoPPAs
Backend: Entities relationship service through CompatibilityController
Database: EntityToPpa
Status: placeholder

EtoVA
Backend: Entities relationship service through CompatibilityController
Database: EntityToVerticalAsset
Status: placeholder

IMSS
Backend: Market service through CompatibilityController
Database: IndicativeMarketScreenStudy, IMSSParameter
Status: placeholder/empty module

IPSS
Backend: Market service through CompatibilityController
Database: IndicativePowerSupplyStudy, IPSSParameter
Status: placeholder/empty module

MBRAuth
Backend: Entities authorization service through CompatibilityController
Database: MbrAuthorization
Status: placeholder

Filing/Filings
Backend: Filings service through CompatibilityController
Database: Filing
Status: placeholder/empty module

FERCAPI
Backend: Filings/FERC support service through CompatibilityController
Database: optional cache table or direct response handling
Status: placeholder

Mitigation/Mitigations
Backend: Market or mitigation service through CompatibilityController
Database: Mitigation
Status: placeholder

SelfLimit
Backend: Market service through CompatibilityController
Database: SelfLimitation
Status: placeholder

OR
Backend: Reserve service through CompatibilityController
Database: OperatingReserve
Status: placeholder/empty module

Invoice
Backend: Invoice service through CompatibilityController
Database: Invoice, MonthlyInvoice, Filing invoice links
Status: placeholder
```

Phase 2 expected result:

```txt
Achieved
```

Current backend/database implementation status after source review:

```txt
Core auth, user, company, asset, entity, filing, market, and reserve modules are implemented with Prisma-backed persistence.
CompatibilityController still acts as the legacy adapter for many frontend-style routes.
CopyEntityData now performs a real database copy across the main company-scoped tables.
FERCAPI now returns live database-backed snapshots instead of an empty placeholder response.
The remaining work is route cleanup and completing the smaller legacy modules without changing frontend URLs.
```

## Phase 3: Database Schema Design

Status:

```txt
Completed
```

Goal:

```txt
Create/extend Prisma models for all required backend data modules.
Do not push schema until models are reviewed and compile cleanly.
```

Expected result:

```txt
Prisma schema contains tables needed for frontend API modules.
Existing User/auth behavior remains supported.
```

Models added to backend/src/prisma/schema.prisma:

```txt
Role
Account
AccountGroup
Company
CompanyFilingFlags
CommonLookup
Asset
Entity
CategoryStatus
EntityToEntity
EntityToGeneratorAsset
EntityToPpa
EntityToVerticalAsset
IndicativeMarketScreenStudy
ImssParameter
IndicativePowerSupplyStudy
IpssParameter
MbrAuthorization
Filing
Mitigation
SelfLimitation
OperatingReserve
Invoice
MonthlyInvoice
```

Design note:

```txt
Models include stable legacy numeric IDs used by frontend routes.
Models include core cid/aid/gid/isActive fields where needed.
Models include Json data columns for detailed frontend form payloads.
This keeps the first full backend/database pass flexible and avoids risky field guessing.
```

Validation command:

```powershell
npx prisma validate --schema=src/prisma/schema.prisma
```

Validation result:

```txt
The schema at src/prisma/schema.prisma is valid.
No Prisma schema errors.
```

Phase 3 expected result:

```txt
Achieved
```

## Phase 4: Database Sync + Seed

Status:

```txt
Completed
```

Goal:

```txt
Push the validated Prisma schema to local PostgreSQL.
Regenerate Prisma Client.
Seed required base data for admin, roles, account, account group, company, flags, and lookup values.
```

Expected result:

```txt
Database tables exist.
Prisma Client is generated.
Seed completes without error.
Backend can still connect to PostgreSQL.
Existing login/admin behavior remains working.
```

Actions completed:

```txt
Confirmed Docker PostgreSQL container is running.
Validated Prisma schema.
Synced Prisma schema to PostgreSQL.
Regenerated Prisma Client.
Updated backend/src/prisma/seed.ts with base data.
Ran database seed.
Verified seeded table counts.
Ran backend build.
Ran e2e test.
Restarted backend watch server.
Verified backend health endpoint.
```

Important note:

```txt
Prisma db push synced the database successfully.
Initial Prisma generate hit a Windows EPERM file-lock because backend watch was running.
Only backend Node watch processes were stopped.
Prisma generate then completed successfully.
Backend watch server was restarted after validation.
```

Seeded base data:

```txt
Admin user remains available.
Roles: 4
Accounts: 1
Account groups: 1
Companies: 1
Company filing flags: 1
Common lookup values: 7
```

Validation commands:

```powershell
npx prisma validate --schema=src/prisma/schema.prisma
npx prisma db push --schema=src/prisma/schema.prisma
npx prisma generate --schema=src/prisma/schema.prisma
npx prisma db seed
npm run build
npm run test:e2e
Invoke-RestMethod http://localhost:3000/api/health
```

Validation result:

```txt
Prisma schema valid.
Database synced.
Prisma Client generated.
Seed executed.
Build passed.
E2E test passed.
/api/health returned status ok.
No Phase 4 validation errors.
```

Phase 4 expected result:

```txt
Achieved
```

## Phase 5: Auth + User Backend

Status:

```txt
Partially complete
```

Goal:

```txt
Complete and verify login, refresh, logout, users, roles, inactive users, user activation, and user delete flows.
```

Expected result:

```txt
Login works.
User list works from database.
Create/update/delete/deactivate users work from database.
Inactive user restore/delete flows work.
Role type APIs return database-backed roles.
Backend build and e2e checks pass.
```

Current source review:

```txt
Auth and user CRUD are implemented against Prisma.
Role types are read from the database when available.
Legacy compatibility routes are still being maintained so the frontend keeps working without URL changes.
```

Pre-Phase-4 fix:

```txt
Fixed backend/test/app.e2e-spec.ts.
Removed node:test import because project e2e tests run with Jest.
Added explicit Jest imports from @jest/globals so IDE does not show red lines for describe, it, beforeEach, afterEach.
```

Validation command:

```powershell
npm run test:e2e
```

Validation result:

```txt
Test Suites: 1 passed, 1 total
Tests: 1 passed, 1 total
No e2e test error.
```

IDE/type validation command:

```powershell
npx tsc --noEmit --module nodenext --moduleResolution nodenext --target ES2023 --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck --experimentalDecorators --emitDecoratorMetadata --types jest,node test/app.e2e-spec.ts
```

IDE/type validation result:

```txt
No TypeScript errors for backend/test/app.e2e-spec.ts.
```

## Database Status

```txt
The Prisma schema is already defined and validated.
The PostgreSQL database has already been synced with Prisma.
Seed data has already been loaded.
The current database is the source of truth for auth, users, companies, assets, entities, filings, market, reserve, and lookup data.
```

```txt
Database progress is roughly 80% to 85%.
The schema and base data are done; the remaining work is mostly legacy-route cleanup and a few compatibility-heavy areas.
```

### Database Tables In Use

```txt
User
Role
Account
AccountGroup
Company
CompanyFilingFlags
CommonLookup
Asset
Entity
CategoryStatus
EntityToEntity
EntityToGeneratorAsset
EntityToPpa
EntityToVerticalAsset
IndicativeMarketScreenStudy
ImssParameter
IndicativePowerSupplyStudy
IpssParameter
MbrAuthorization
Filing
Mitigation
SelfLimitation
OperatingReserve
Invoice
MonthlyInvoice
```

### Database Work Completed

```txt
Prisma schema validated successfully.
Database schema pushed successfully.
Prisma Client generated successfully.
Seed data inserted successfully.
Build and e2e checks passed after the database work.
```

### Database Work Remaining

```txt
Refine the database-backed handling for the compatibility-heavy legacy areas.
Add any missing tables only if a real route needs them.
Keep frontend API names unchanged while improving backend persistence.
```

## Backend Module Summary

| Module | Database | Status | Notes |
|---|---|---|---|
| Auth | `User` | Completed | Login, register, refresh, and logout are implemented. |
| Users | `User`, `Role` | Completed | Database-backed CRUD and inactive-user handling exist. |
| Companies | `Company`, `CompanyFilingFlags`, `Account`, `AccountGroup` | Completed | Real Prisma-backed CRUD exists. |
| Assets | `Asset` | Completed | Real Prisma-backed CRUD exists. |
| Entities | `Entity` | Completed | Real Prisma-backed CRUD exists. |
| Filings | `Filing` | Completed | Real Prisma-backed CRUD exists. |
| Market | `IndicativeMarketScreenStudy`, `IndicativePowerSupplyStudy`, `Mitigation`, `SelfLimitation`, `OperatingReserve` | Completed | Market and reserve-related study routes are implemented. |
| Reserve | `OperatingReserve` | Completed | Dedicated reserve module is implemented. |
| Compatibility adapter | Multiple tables | Partially complete | Keeps legacy `/api/{Module}/{Action}` routes working. |
| Account | `Account`, `AccountGroup` | Partially complete | Still mostly handled inside `CompatibilityController`. |
| Common | `Role`, `AccountGroup`, `CommonLookup` | Partially complete | Lookup and dropdown responses are still compatibility-driven. |
| Invoice | `Invoice`, `MonthlyInvoice` | Partially complete | Legacy invoice flows still live in `CompatibilityController`. |
| FERCAPI | Live database snapshot | Partially complete | Support endpoints now return real database-backed snapshots. |
| MBRAuth | `MbrAuthorization` | Partially complete | Present in schema and compatibility routing, but not split into its own module yet. |
| CatStatus | `CategoryStatus` | Partially complete | Present in schema and compatibility routing. |
| EtoE | `EntityToEntity` | Partially complete | Present in schema and compatibility routing. |
| EtoGen | `EntityToGeneratorAsset` | Partially complete | Present in schema and compatibility routing. |
| EtoPPAs | `EntityToPpa` | Partially complete | Present in schema and compatibility routing. |
| EtoVA | `EntityToVerticalAsset` | Partially complete | Present in schema and compatibility routing. |

## Estimated Completion

```txt
These are practical source-based estimates, not formal measurements.
They reflect how much of each module is real Prisma-backed implementation versus legacy compatibility fallback.
```

| Area | Estimated Complete |
|---|---:|
| Auth | 95% |
| Users | 90% |
| Companies | 90% |
| Assets | 90% |
| Entities | 90% |
| Filings | 85% |
| Market | 85% |
| Reserve | 80% |
| Compatibility adapter | 60% |
| Account | 40% |
| Common | 35% |
| Invoice | 35% |
| FERCAPI | 25% |
| MBRAuth | 35% |
| CatStatus | 30% |
| EtoE | 30% |
| EtoGen | 30% |
| EtoPPAs | 30% |
| EtoVA | 30% |

```txt
Overall backend + database completion is roughly 75% to 80% based on the current source.
The main backend foundation is in place; the remaining work is mostly legacy-route cleanup and the smaller compatibility-heavy modules.
```

## Legacy Routes Still In Play

```txt
These are the main legacy action names still being handled by CompatibilityController.
They are kept intentionally so the frontend can continue using /api/{Module}/{Action} without URL changes.
```

| Area | Current legacy actions handled |
|---|---|
| Login | `getlogin`, `refreshtoken`, `logout` |
| Common | `updateincinfilingflag`, `updateincinfilingflagall`, `getentitydataforxml`, `getentitydataforpdfbycid`, `importentitiesfromexcel`, `importassetsfromexcel`, `copyentitydata` |
| User | `deletebyid`, `getlistbycid`, `createuser`, `updateuser`, `updatemyprofile`, `updateuseractivatebycid`, `deleteuserinactivesbycid`, `roletypes`, `inactive`, `byuid`, `getuserbyuid` |
| Account | `getaccoungroupsbyaid`, `getaccountgroupsbyaid`, `getaccountandcompany`, `getaccountandcompanybycid`, `getadminaccountcompany`, `admingetaccounts`, `getaccountdetailsbycid`, `getaccountdetailsbyaid`, `insupdgroups`, `createaccount`, `updateaccount`, `updateaccountdetails`, `admindeleteaccount`, `deleteaccoungroupsbyagid`, `deleteaccountgroupsbyagid` |
| Company | `getcompanylistbyaid`, `admingetcompaniesbyaid`, `getcompanylistbycid`, `getcompanylistbyuidagid`, `getcompanydetails`, `getfilingflagsbycid`, `createcompany`, `updatecompany`, `updatecompanydetails`, `updatefilingflags`, `admindeletecompany`, `copyentitydata` |
| Filing | `getfilingslist`, `getfilingbyid`, `getlistbycid`, `insupdfiling`, `createfiling`, `updatefiling` |
| Invoice | `getinvoicedatabycid`, `admingetinvoices`, `getinvoicebyid`, `getadmingetinvoicemonthlycountbycid`, `getadmingetinvoicemonthlybyid`, `getfilingsforinvoicebycid`, `getfilingsforinvoicesbycid`, `forwardtoexternal*`, `createinvoice`, `updateinvoice`, `createmonthlyinvoice`, `updatemonthlyinvoice`, `updatesentinvoice`, `updatefercstatus`, `adminupdateinvoicesisbilledbyids`, `adminchangeaccountforven` |
| IMSS | `getlistbycid`, `getrecordbyid`, `getbyid`, `getparamslistbycidandid`, `insupdimssui`, `insupdimssuicopy` |
| IPSS | `getlistbycid`, `getrecordbyid`, `getbyid`, `getparamslistbycidandid`, `insupdipssui`, `insupdipssuicopy`, `bulkimportipssstudy` |
| MBRAuth | `getlistbycid`, `getlist`, `getrecordbyid`, `getbyid`, `getauthbyid`, `*byid`, `getparamslistbycidandid`, `insupd*`, `create*`, `update*`, `copy*` |
| Mitigation | `getlistbycid`, `getlist`, `getrecordbyid`, `getbyid`, `getauthbyid`, `*byid`, `getparamslistbycidandid`, `insupd*`, `create*`, `update*`, `copy*` |
| SelfLimit | `getlistbycid`, `getlist`, `getrecordbyid`, `getbyid`, `getauthbyid`, `*byid`, `getparamslistbycidandid`, `insupd*`, `create*`, `update*`, `copy*` |
| OR | `getlistbycid`, `getlist`, `getrecordbyid`, `getbyid`, `getauthbyid`, `*byid`, `getparamslistbycidandid`, `insupd*`, `create*`, `update*`, `copy*` |

## Next Build Steps

```txt
1. Move the account and common flows out of CompatibilityController into dedicated services.
2. Add explicit Invoice and FERCAPI modules if you want those routes fully separated.
3. Keep the legacy action names unchanged so the frontend does not need any updates.
4. Add route-by-route tests for the high-risk legacy flows before refactoring more.
```

## Remaining Work

```txt
Split the remaining legacy routes out of CompatibilityController where it makes sense.
Add dedicated modules/services for account, common, invoice, and any other remaining compatibility-heavy areas.
Keep frontend URLs unchanged.
Keep Prisma-backed database behavior as the source of truth.
```
