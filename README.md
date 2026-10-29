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

`npm run dev` starts all four frontend apps and the mock API together, generates
Prisma Client, and initializes the mock database only if it is absent. Stop any
previous dev terminals first, then open http://localhost:3000/home/. Shell proxies
module pages, assets and /api to the appropriate local dev servers, so module
navigation and mock data work through port 3000 without Docker or Nginx.

The individual dev:<app> commands remain available. If using them, start every
app needed for the routes you visit. Use Shell port 3000 as the common entry;
direct module ports are intended for isolated module work.

The dev launcher checks ports and stops all processes it started when Ctrl+C is
pressed. Override ERP_DEV_SHELL_PORT, ERP_DEV_PROCUREMENT_PORT,
ERP_DEV_OPERATIONS_PORT, ERP_DEV_INVENTORY_PORT or ERP_DEV_API_PORT if needed.
Dev rewrites are disabled during production builds; Docker still serves static
exports through its own Nginx gateway.

`npm run build` builds all four apps. Use `npm run build:<app>` for one app, and
`npm run typecheck` to check all four. Static files are exported separately to
`apps/<app>/out/`. No Node server is required to serve these exports.

App configs set their basePath once: /inventory, /procurement or /operations.
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
host nginx.conf changes are required. nginx/static.conf serves the exports inside
each application image, while nginx/gateway.conf routes requests to those images.
Only the Gateway publishes a port, bound to localhost by default.

```powershell
docker compose build shell
docker compose build inventory
docker compose build procurement
docker compose build operations
docker compose up -d
```

Sequential builds limit memory use when building all four apps on Docker Desktop.
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
