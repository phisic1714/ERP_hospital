# ERP Hospital

Next.js static-export applications in an npm workspace. All application source
lives under apps; reusable components, context, styles and config live under
packages. There is no root Next.js application or root src folder.

```text
apps/
  shell/src/app/          # / -> /home, module-selection portal
  inventory/src/app/      # /inventory and inventory subpages
  procurement/src/app/    # /procurement and procurement subpages
  operations/src/app/     # /operations/approvals, reports and audit
  budget/src/app/         # /budget and budget management pages
  hr/src/app/             # /hr and HR management pages
  finance/src/app/        # /finance prototypes (Home remains disabled upstream)
packages/
  ui/                    # Layout, navigation, global CSS and components
  app-context/           # Provider and shared types
  next-config/           # Static-export settings
```

Install at the repository root with `npm ci`. Third-party versions stay in root
package.json; each app declares its workspace package dependencies.

| App | Command | Development URL |
| --- | --- | --- |
| Shell | npm run dev:shell | http://localhost:3000/home |
| Procurement | npm run dev:procurement | http://localhost:3001/procurement/ |
| Operations | npm run dev:operations | http://localhost:3002/operations/approvals/ |
| Inventory | npm run dev:inventory | http://localhost:3003/inventory/ |
| Budget | npm run dev:budget | http://localhost:3005/budget/ |
| HR | npm run dev:hr | http://localhost:3006/hr/ |
| Finance | npm run dev:finance | http://localhost:3007/finance/ |

`npm run dev` starts all seven frontend apps and the mock API together, generates
Prisma Client, and initializes the mock database only if it is absent. Stop any
previous dev terminals first, then open http://localhost:3000/home/. Shell proxies
module pages, assets and /api to the appropriate local dev servers, so module
navigation and mock data work through port 3000 without Docker or Nginx.

The individual dev:<app> commands remain available. If using them, start every
app needed for the routes you visit. Use Shell port 3000 as the common entry;
direct module ports are intended for isolated module work.

The dev launcher checks ports and stops all processes it started when Ctrl+C is
pressed. Override ERP_DEV_SHELL_PORT, ERP_DEV_PROCUREMENT_PORT,
ERP_DEV_OPERATIONS_PORT, ERP_DEV_INVENTORY_PORT, ERP_DEV_BUDGET_PORT,
ERP_DEV_HR_PORT, ERP_DEV_FINANCE_PORT or ERP_DEV_API_PORT if needed.
Dev rewrites are disabled during production builds; Docker still serves static
exports through its own Nginx gateway.

`npm run build` builds all seven apps. Use `npm run build:<app>` for one app, and
`npm run typecheck` to check all apps. Static files are exported separately to
`apps/<app>/out/`. No Node server is required to serve these exports.

App configs set their basePath once: /inventory, /procurement, /operations,
/budget, /hr or /finance.
Do not repeat this segment in src/app. Shell has no basePath and owns /home.
When serving exported modules, mount each out directory at its public prefix,
including its _next assets. Backend /api/... requests retain their existing
paths and need to be routed to your external backend by your infrastructure.

Every app root layout imports `@erp/ui/globals.css` and mounts ApplicationLayout
with its basePath. UI navigation uses @erp/ui/navigation: local links use Next
navigation and cross-app links reload the target app. Menu paths are normalized
to retain highlighting and keep /home free of Sidebar and Topbar.

Each app instantiates its own AppProvider. User selection, warehouse selection
and toast state do not transfer between apps. Shared code is not shared runtime
state. Tailwind and PostCSS use root config through small app re-exports.

See packages/README.md for package imports and docs/ROUTES.md for the route map.

## Docker with local Gateway Nginx

All Nginx configuration lives in this repository. No host Nginx installation or
host nginx.conf changes are required. nginx/static.conf serves module exports;
nginx/gateway.conf serves Shell exports locally and proxies module/API requests.
Only the Gateway publishes a port, bound to localhost by default. Shell source
stays in apps/shell, but its static files are packaged into the Dockerfile gateway
target; there is no separate Shell service or container.

```powershell
docker compose build gateway
docker compose build inventory
docker compose build procurement
docker compose build operations
docker compose build budget
docker compose build hr
docker compose build finance
docker compose up -d
```

Sequential builds limit memory use when building all seven apps on Docker Desktop.
You can also use `docker compose up -d --build` to build and start together.

Open http://localhost:8080/home/, http://localhost:8080/inventory/,
http://localhost:8080/procurement/ or
http://localhost:8080/operations/approvals/. The root URL redirects to /home/.
Override ERP_WEB_PORT if port 8080 is already occupied.

Each final application image contains only Nginx and the exported static files.
The Node build stage, node_modules, source, local databases, backups and env files
are not copied to the final image. Static-export changes require a rebuild.

To update only one app:

```powershell
docker compose build procurement
docker compose up -d --no-deps procurement
```

Docker DNS resolution in the gateway refreshes after container replacement.
After editing gateway.conf, validate and reload it:

```powershell
docker compose exec gateway nginx -t
docker compose exec gateway nginx -s reload
```

Use `docker compose ps` and `docker compose logs --tail=100` to inspect services.
The gateway also routes /api/... to the Prisma-backed mock-api service.

## Mock API and Prisma data

The original SQLite schema, main seed, procurement seed and sourcing seed are
restored under prisma/. Their API handlers and server helpers live in
apps/mock-api/src. The frontend apps remain static exports.

```powershell
docker compose build mock-api
docker compose up -d mock-api
docker compose up -d gateway
docker compose exec gateway nginx -t
docker compose exec gateway nginx -s reload
```

The service creates a new mock.db in the named mock-data volume on its first
start, running all three seeds against a temporary database before installing
it. Subsequent starts retain the database without reseeding. Existing dev.db
and local backups are not used or overwritten. The original seed.js clears data;
do not run it directly against a database that you want to retain.

For local API development:

```powershell
npm run prisma:generate
npm run mock:init
npm run dev:mock-api
```

This creates prisma/mock.db only if absent, and serves the API on port 3004.
Docker uses a separate database volume. The mock API retains the original demo
user/role behavior and is intended for development, not production authentication.

## Budget and HR demo state

BudgetProvider and HRProvider come from upstream main and are shared through
@erp/app-context. Their demo arrays persist in sessionStorage on the common
origin so navigating from Budget to Procurement does not discard changes.
They remain mock state, scoped to one browser tab, not production database-backed
HR/Budget services. Finance pages are imported, but the Home card stays disabled
as in upstream main.

When a mock database schema changes, mock:init first creates a consistent SQLite
backup under a .local-backups directory beside the database, then applies Prisma
db push without accept-data-loss. Existing records are retained and seeds are
not rerun. New databases are initialized with the current schema as before.

See docs/UPSTREAM_SYNC_2026-10-29.md for the source mapping of this update.

### Updating Home / Shell in Docker

Shell is part of the Gateway image. After changing apps/shell or shared UI used
by Home, rebuild Gateway (local npm run dev:shell remains available unchanged):

```powershell
docker compose build gateway
docker compose up -d --no-deps gateway
```

A configuration reload alone does not update the baked-in Home files. Module
containers and the mock database volume are independent of this Gateway rebuild.
