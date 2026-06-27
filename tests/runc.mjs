// Run a C program from the command line: node tests/runc.mjs file.c [input]
import fs from 'fs';
import { load } from './load.mjs';
const SEE = load();
export function runC(src, opts) {
  opts = opts || {};
  const files = typeof src === 'string' ? [{ path: '/prog.c', text: src }] : src;
  const r = SEE.Build.build(files, opts.read || ((p) => (opts.files && opts.files[p]) || null), { debugInternal: true });
  const fmt = (e) => (e.pos ? e.pos.file + ':' + e.pos.line + ':' + e.pos.col + ': ' : '') + e.kind + ': ' + e.message;
  if (!r.ok) return { ok: false, errors: r.errors.map(fmt), warnings: r.warnings.map(fmt), out: '' };
  let out = '';
  let vfs = opts.vfs || null;
  if (!vfs) {
    vfs = new SEE.VFS();
    vfs.mkdir('/tmp', { trusted: true, exist: true });
    vfs.mkdir('/data', { trusted: true, exist: true });
    vfs.writeText('/data/numbers.txt', '3 1 4 1 5 9 2 6\n', { trusted: true });
    vfs.mkdir('/locked', { trusted: true, exist: true });
    vfs.writeText('/locked/readme.txt', 'read only\n', { trusted: true });
    vfs.entries.get('/locked').readOnly = true;
  }
  const m = new SEE.Machine(r.prog, { write: (fd, b) => { out += (fd === 2 ? '' : '') + Buffer.from(b).toString('latin1'); }, vfs, cwd: '/', argv: opts.argv });
  if (opts.input !== undefined) { m.libc.input = [...Buffer.from(opts.input, 'latin1')]; m.libc.inputEOF = true; }
  let res;
  for (let k = 0; k < (opts.maxSlices || 100); k++) { res = m.run(1e6); if (res !== 'budget') break; }
  return { ok: true, res, out, vfs, exit: m.exitCode, fault: m.fault, warnings: r.warnings.map(fmt), runtime: m.warnings.map((w) => w.msg), m };
}
if (process.argv[2] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const r = runC(fs.readFileSync(process.argv[2], 'utf8'), { input: process.argv[3] });
  console.log(JSON.stringify({ ok: r.ok, res: r.res, exit: r.exit, fault: r.fault && { title: r.fault.title, msg: r.fault.msg, at: r.fault.at }, errors: r.errors, warnings: r.warnings, runtime: r.runtime }, null, 1));
  console.log('---- output ----\n' + r.out);
}
