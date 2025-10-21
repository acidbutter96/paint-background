// Allow importing CSS modules with .module.css
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Provide a minimal JSX namespace fallback if React types are missing at build-time.
// This prevents stray "JSX.IntrinsicElements" errors while dev deps are installed.
declare namespace JSX {
  interface IntrinsicElements {
    // allow any element
    [elemName: string]: any;
  }
}
