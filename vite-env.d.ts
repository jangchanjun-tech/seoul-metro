// Fix: Commented out to resolve a "Cannot find type definition file for 'vite/client'" error.
// The project does not use Vite-specific client types, so this change is safe.
// /// <reference types="vite/client" />

// Declares the global `process` object to satisfy the TypeScript compiler.
// This resolves the `TS2580: Cannot find name 'process'` error during the `tsc` pre-build check.
// The actual value of `process.env.API_KEY` is injected during the Vite build via `vite.config.ts`.
declare const process: {
  env: {
    API_KEY: string;
  };
};
