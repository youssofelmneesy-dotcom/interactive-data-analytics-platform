/// <reference types="vite/client" />

/**
 * Vite environment type declarations.
 *
 * Provides TypeScript support for:
 * - Vite's import.meta.env
 * - Static asset imports (SVG, PNG, etc.)
 * - Vite-specific module types
 */

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  // Add additional environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Declare static asset imports for Vite's asset handling.
 */
declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.svg?react" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

/**
 * CSS modules support
 */
declare module "*.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.scss" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.sass" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.less" {
  const classes: Record<string, string>;
  export default classes;
}



