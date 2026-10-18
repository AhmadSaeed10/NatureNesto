// src/content uses extensionless relative imports (the Next.js convention), which Node's
// ESM resolver rejects. This hook retries those imports with ".ts" so scripts can reuse
// the typed content files directly.
import * as nodeModule from "node:module";

interface ResolveResult {
  url: string;
  format?: string | null;
  shortCircuit?: boolean;
}
type NextResolve = (specifier: string, context: unknown) => ResolveResult;
type ResolveHook = (specifier: string, context: unknown, nextResolve: NextResolve) => ResolveResult;

// registerHooks ships in Node 22.15+, ahead of the installed @types/node.
const { registerHooks } = nodeModule as unknown as {
  registerHooks: (hooks: { resolve: ResolveHook }) => void;
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      const relative = specifier.startsWith("./") || specifier.startsWith("../");
      if (relative && !/\.[cm]?[jt]s$/.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});
