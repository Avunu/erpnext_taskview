// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

// Allow TypeScript to accept CSS files as side-effect (and default) imports.
declare module "*.css" {
  const styles: Record<string, string>;
  export default styles;
}
