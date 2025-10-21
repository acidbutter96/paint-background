# paint-background — installation & usage

This document provides ready-to-use instructions to install and use the `paint-background` package (a WebGL background React component) in other Next.js projects.

## 1) Installation

Choose one of the methods below.

- Via npm (after publishing to npm):

```bash
npm install paint-background

# or yarn
yarn add paint-background
```

- Directly from GitHub (no publish required):

```bash
# SSH
npm install git+ssh://git@github.com:acidbutter96/paint-background.git

# HTTPS (public)
npm install git+https://github.com/acidbutter96/paint-background.git
```

- Local (quick test with tarball):

```bash
# create a tarball in the library repo
cd /path/to/paint-background/packages/background-lib
npm pack

# install the tarball in the consumer project
cd /path/to/consumer-project
npm install /path/to/paint-background/packages/background-lib/paint-background-1.0.0.tgz
```

Note: the package declares `react` and `react-dom` as peerDependencies. The consumer project must provide these dependencies.

---

## 2) Usage in Next.js (App Router — recommended)

Because the component is client-only, create a small client wrapper and import it from a server layout.

- Example wrapper `components/BackgroundClient.tsx` in the consumer project:

```tsx
'use client';
import Background from 'paint-background';

export default function BackgroundClient() {
  return <Background />;
}
```

- Use the wrapper in `app/layout.tsx` (server component):

```tsx
import BackgroundClient from '@/components/BackgroundClient';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <BackgroundClient />
        {children}
      </body>
    </html>
  );
}
```

This avoids the Next.js error about using `dynamic(..., { ssr: false })` inside server components.

---

## 3) Usage in Pages Router (`pages/_app.tsx`)

Because `_app.tsx` runs on the client, you can import the component directly there:

```tsx
// pages/_app.tsx
import Background from 'paint-background';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Background />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

---

## 4) Available props (example)

- `enabled?: boolean` — if false, the canvas is not initialized.
- `zIndex?: number` — sets the canvas z-index.
- `pointerEvents?: 'none' | 'auto'` — controls pointer-events behavior.

Example:

```tsx
<Background enabled={true} zIndex={-2} pointerEvents="none" />
```

---

## 5) Quick test after install

1. Install the package using one of the methods above.
2. Import and use it according to the examples.
3. In the browser devtools:
   - check the console for errors.
   - verify a full-screen `<canvas>` is present.
   - if nothing appears, confirm the wrapper file contains `'use client'`.

---

## 6) Common issues and fixes

- If you install from Git and the package lacks `dist/`: ask the author to either commit `dist/` or add a `prepare` script to build during install.
- Next.js error about SSR/dynamic imports: use a `'use client'` wrapper for the App Router.
- Canvas overlays the app content: adjust the `zIndex` prop or the app's CSS.
- WebGL does not render (blank background): check the console for shader errors or environment policies that block WebGL.

---

## 7) Advanced tips (CI / team)

- Add a `prepare` script to `packages/background-lib/package.json` so installs from Git auto-build the package:

```json
"scripts": {
  "build": "tsup src/index.tsx --format esm,cjs --dts",
  "prepare": "tsup src/index.tsx --format esm,cjs --dts"
}
```

`prepare` runs automatically when someone installs from a Git repo.

- If you maintain both the library and the app in the same repo, consider using workspaces (yarn/pnpm) to link packages locally:

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

---

## 8) Quick checklist to share in the consumer project's chat

1. Install the package (choose one method):
   - `npm i paint-background` (if published) or
   - `npm i git+ssh://git@github.com:acidbutter96/paint-background.git` or
   - install the tarball produced by `npm pack`.
2. Create a client wrapper `components/BackgroundClient.tsx` with `'use client'`.
3. Import the wrapper in `app/layout.tsx` and render it before `children`.
4. If installation from Git fails because `dist/` is missing: ask the repo owner to either commit `dist/` or add `prepare`.

---

If you want, I can:
- add the `prepare` script to `packages/background-lib/package.json`, or
- run `yarn build` and commit `dist/` so the package can be installed from Git without a build step.

Tell me which action you prefer and I will perform it.
