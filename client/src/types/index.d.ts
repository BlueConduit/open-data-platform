export {};

/**
 * Extend Window interface to enable accessing hubspot window variable. This is necessary with
 * TypeScript type checking on the Window type.
 */
declare global {
  interface Window {
    hbspt;
  }
}
