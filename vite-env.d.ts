// Fix: Commented out to resolve a "Cannot find type definition file for 'vite/client'" error.
// The project does not use Vite-specific client types, so this change is safe.
// /// <reference types="vite/client" />

// The actual value of `process.env.API_KEY` is injected during the Vite build.
// See `vite.config.ts` for details.

// FIX: Replaced `declare const process` with an augmentation of `NodeJS.ProcessEnv`.
// This resolves the "Cannot redeclare block-scoped variable 'process'" error (TS2451) by
// merging our type with the existing global `process` type instead of redeclaring it.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
