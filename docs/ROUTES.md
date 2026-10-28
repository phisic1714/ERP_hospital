# ERP modules

Each module is an independent Next.js app under apps/<module>/src/app.
Shell owns /home and redirects the root URL there. Module basePath settings add
their public URL prefixes without repeating those folders inside src/app.

| Folder | Responsibility | URLs |
| --- | --- | --- |
| home | ERP module selection | /home |
| inventory | Inventory and warehouse workflows | /inventory, /inventory/items, /inventory/stock, /inventory/receiving |
| procurement | Purchasing and sourcing | /procurement, /procurement/orders |
| operations | Cross-module controls | /operations/approvals, /operations/reports, /operations/audit |

Each app layout.tsx imports globals.css from @erp/ui/globals.css and uses
ApplicationLayout from packages/ui. Context lives in packages/app-context.
Links use module URLs; UI and request payloads remain.

Item details use /inventory/items/detail?id=<item-id>. The page reads the query
in the browser and calls /api/items/<item-id>; IDs do not become build-time routes.

Prisma, seeds, database helpers and Prisma-backed API handlers were removed.
Frontend requests still use the existing /api/... URLs. Provide these endpoints
through your backend when setting up infrastructure. No backend replacement,
proxy, Docker or deployment configuration is added here.
