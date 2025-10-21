# paint-background

A tiny React client component that renders a full-screen WebGL background. Designed for Next.js apps (Client Component).

## Install

From npm (after publishing):

```bash
npm i paint-background
```

Or install directly from git (for testing):

```bash
npm i git+ssh://git@github.com:acidbutter96/paint-background.git
```

Local pack test:

```bash
# from packages/background-lib
npm pack
# then in another project: npm i ./paint-background-1.0.0.tgz
```

## Usage

In a Next.js App Router (app/layout.tsx), ensure you render it as a Client Component or import from a client wrapper.

```tsx
import dynamic from 'next/dynamic';
import 'react';

const Background = (await import('paint-background')).Background;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Background />
        {children}
      </body>
    </html>
  );
}
```

Note: This package declares `react` and `react-dom` as peerDependencies. Your project must provide them.
