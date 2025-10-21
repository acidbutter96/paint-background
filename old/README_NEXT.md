# Background Next.js scaffold

This folder contains a minimal Next.js scaffold that embeds the WebGL background as a React component.

How to run:

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open http://localhost:3000

Notes:
- The `original/` folder contains the original `index.html`, `scripts.js` and `styles.css`.
- The component is loaded client-side (dynamic import with { ssr: false }).
