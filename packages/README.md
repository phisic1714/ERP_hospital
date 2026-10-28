# Shared packages

- `@erp/ui`: shared StatusBadge, layout, toast and procurement components.
- `@erp/app-context`: AppProvider, useApp and user/toast types used by apps and UI.
- `@erp/next-config`: Next.js static-export settings and shared UI transpilation.

Each consuming app declares these workspace dependencies. Install dependencies
with `npm install` from the repository root; keep a single root lockfile.

```tsx
import { StatusBadge } from '@erp/ui';

<StatusBadge status="ACTIVE" />
```

```js
import sharedConfig from '@erp/next-config';

export default { ...sharedConfig, basePath: '/procurement' };
```

Root Tailwind scans apps and packages/ui. If an app adds its own Tailwind
configuration, include packages/ui/src in its content paths (prefer absolute
paths or paths relative to that config file).

Components have moved out of src/components. Import their public package paths:

```tsx
import { Sidebar } from '@erp/ui/layout/Sidebar';
import { Topbar } from '@erp/ui/layout/Topbar';
import { MainContent } from '@erp/ui/layout/MainContent';
import { ToastContainer } from '@erp/ui/ui/ToastContainer';
import { SourcingHeader, ModalShell } from '@erp/ui/procurement/SourcingUI';
import { AppProvider, useApp } from '@erp/app-context';
```

UI imports context from @erp/app-context rather than an app-specific alias. Each
app still mounts its own AppProvider; state is not synchronized between apps.

Each app now owns src/app and imports @erp/ui/globals.css in its root layout.
ApplicationLayout supplies the shared providers, Sidebar, Topbar and content
wrapper. Pass the app basePath to keep navigation scoped to the active app.

```tsx
import '@erp/ui/globals.css';
import { ApplicationLayout } from '@erp/ui/layout/ApplicationLayout';

// In a module root layout:
// return <ApplicationLayout basePath="/inventory">{children}</ApplicationLayout>;
```

Use `@erp/ui/navigation` for links and programmatic navigation across apps.
It removes the active basePath from internal Next links and uses full navigation
for links to a different app, preserving the public module URLs.

## Global styles

Import shared global CSS once in each app root layout:

```tsx
import '@erp/ui/globals.css';
```

Source: packages/ui/src/styles/globals.css. Keep Tailwind/PostCSS configured in
the consuming app; the stylesheet is compiled as part of that app build.
