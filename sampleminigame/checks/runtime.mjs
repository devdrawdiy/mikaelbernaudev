import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
export function dependency(name) {
  return require(process.env.CODEX_NODE_MODULES ? resolve(process.env.CODEX_NODE_MODULES, name) : name);
}
