// Allow TypeScript to accept CSS files as side-effect (and default) imports.
declare module "*.css" {
  const styles: Record<string, string>;
  export default styles;
}
