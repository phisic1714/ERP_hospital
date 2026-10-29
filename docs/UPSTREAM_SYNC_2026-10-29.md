# Upstream main port to Dev_pee - 2026-10-29

Source: upstream/main at dc57eb4 (commits fc2d1c9 and dc57eb4).
Common ancestor: 8644d1f. Dev_pee started at 35ec693.
Safety ref: backup/Dev_pee-before-main-sync-20261029.
Origin/main is still 8644d1f; the new work is on the upstream repository main.

This is a source-level port, not a Git merge. The local main branch and GitHub
Pages preview configuration are unchanged. No commits or pushes are made here.

| Original source | Microapp destination |
| --- | --- |
| src/app/budget/** | apps/budget/src/app/** |
| src/app/hr/** | apps/hr/src/app/** |
| src/app/finance/** | apps/finance/src/app/** |
| src/app/procurement/{orders,plans,requisitions} | apps/procurement/src/app/** |
| src/app/page.tsx | apps/shell/src/app/home/page.tsx |
| src/components/layout/{Sidebar,Topbar} | packages/ui/src/layout/** |
| src/context/{BudgetContext,HRContext} | packages/app-context/src/** |
| src/app/layout.tsx provider additions | packages/ui/src/layout/ApplicationLayout.tsx |
| src/app/api/** changes | apps/mock-api/src/app/api/** |
| prisma/schema.prisma | prisma/schema.prisma, preserving native client targets |

The updated API carries departmentName, allocationId and budgetCode through
procurement plans, requisitions and purchase orders. targetBudget distinguishes
a plan target from its allocation. UI and provider changes are adapted to package
imports and public microapp URLs. Local dev proxy, routing helpers, Compose and
Docker build manifests include the three new apps.

Do not copy upstream prisma/dev.db: existing demo data is retained. Generated
tsconfig.tsbuildinfo is also excluded. Source-level three-way comparisons were
performed for changed files, using the common ancestor and local module paths.

Budget and HR originally use in-memory mock Context state. The port adds
same-tab sessionStorage persistence so full navigation between microapps does
not reset this state. Finance remains disabled on Home, matching upstream.

## Validation

- npm run build: all seven frontend apps exported successfully.
- npm run build:mock-api: API build passed.
- npm run typecheck: all eight apps passed after removing temporary dev caches.
- Static HTTP checks: all 65 page routes and 139 assets passed.
- Local dev Shell proxy: Budget, HR, Finance and updated Procurement pages loaded;
  55 assets and HMR websocket upgrades for all three new apps passed.
- Plan -> PR -> approval -> PO API flow retained allocationId, budgetCode and
  departmentName; direct PO creation retained the same fields.
- Legacy SQLite schema upgraded on a copied DB, with row counts preserved and
  the original fixture unchanged. Application schema init creates a consistent
  backup before upgrading, never copies upstream dev.db or resets existing data.
- Production Docker/Compose configuration was updated and syntax-checked; running
  Docker containers were not rebuilt or redeployed in this task.
- Browser interaction was not automated; HTTP/export/API checks do not prove
  every HR/Budget form interaction. Those remain the upstream demo workflows.
