# ERP modules

This remains one Next.js application. Module folders are URL segments.
The root URL redirects to /home.

| Folder | Responsibility | URLs |
| --- | --- | --- |
| home | ERP module selection | /home |
| inventory | Inventory and warehouse workflows | /inventory, /inventory/items, /inventory/stock, /inventory/receiving |
| procurement | Purchasing and sourcing | /procurement, /procurement/orders |
| operations | Cross-module controls | /operations/approvals, /operations/reports, /operations/audit |

Root layout.tsx and globals.css remain shared. Components and context stay in
src/components and src/context. Links use the module URLs; UI and request payloads remain.

Item details use /inventory/items/detail?id=<item-id>. The page reads the query
in the browser and calls /api/items/<item-id>; IDs do not become build-time routes.

Prisma, seeds, database helpers and Prisma-backed API handlers were removed.
Frontend requests still use the existing /api/... URLs. Provide these endpoints
through your backend when setting up infrastructure. No backend replacement,
proxy, Docker or deployment configuration is added here.
