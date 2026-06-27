// Load the engine sources into this Node process (the same files the page uses, in order).
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ENGINE = ['src/core/util.js', 'src/core/vfs.js', 'src/c/lexer.js', 'src/c/cpp.js', 'src/c/types.js', 'src/c/parser.js', 'src/c/codegen.js', 'src/c/memory.js', 'src/c/linker.js', 'src/c/vm.js', 'src/c/libc.js', 'src/c/headers.js', 'src/c/build.js', 'src/c/debug.js'];
export function load() {
  for (const f of ENGINE) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    vm.runInThisContext(fs.readFileSync(p, 'utf8'), { filename: p });
  }
  return globalThis.SEE;
}
