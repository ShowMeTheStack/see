// Check every program in library/: it builds without errors or warnings, runs to the end within
// its budget and prints something; "expect: fault" programs must crash, and "expect: warning"
// ones may warn. Usage: node tools/check-lib.mjs [category or id fragment]
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan } from './gen-library.mjs';
import { runC } from '../tests/runc.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2];
let pass = 0, fail = 0;
const problems = [];
for (const e of scan()) {
  if (only && !e.id.includes(only)) continue;
  const base = join(root, 'library', e.cat, e.dir ? e.id.split('/')[1] : '');
  const all = {};
  for (const f of e.files) all['/' + f] = readFileSync(e.dir ? join(base, f) : join(root, 'library', e.cat, f), 'utf8');
  const cfiles = Object.keys(all).filter((p) => p.endsWith('.c')).map((p) => ({ path: p, text: all[p] }));
  const why = [];
  if (!e.title) why.push('no title: line in the header comment');
  if (!e.about) why.push('no about: line');
  let r;
  try {
    r = runC(cfiles, { input: e.input || '', files: all, argv: ['prog'].concat((e.args || '').split(/\s+/).filter(Boolean)), maxSlices: 40 });
  } catch (err) { why.push('crashed the checker: ' + err.message); }
  if (r) {
    const exp = e.expect || '';
    if (!r.ok) { if (!/error/.test(exp)) why.push('build failed: ' + r.errors.join(' | ')); }
    else {
      if (r.warnings.length && !/warning|error/.test(exp)) why.push('warnings: ' + r.warnings.join(' | '));
      if (/fault/.test(exp)) { if (!r.fault) why.push('expected a crash, but it ' + (r.res === 'exit' ? 'exited with ' + r.exit : 'did not finish')); }
      else if (r.fault) why.push('crashed: ' + r.fault.title + ': ' + r.fault.msg + ' at line ' + (r.fault.at && r.fault.at.line));
      else if (r.res !== 'exit') why.push('did not finish (' + r.res + ')' + (r.res === 'input' ? ': it wants more input than the input: line gives' : ''));
      else if (r.exit !== 0 && !/exit/.test(exp)) why.push('exit status ' + r.exit);
      if (!r.out.trim() && !/fault|silent/.test(exp)) why.push('prints nothing');
      if (r.runtime.length && !/fault|runtime|warning/.test(exp)) why.push('runtime warnings: ' + r.runtime.join(' | '));
    }
  }
  if (why.length) { fail++; problems.push(e.id + ':\n    ' + why.join('\n    ')); } else pass++;
}
for (const p of problems) console.log('FAIL ' + p);
console.log(pass + ' ok, ' + fail + ' with problems');
process.exit(fail ? 1 : 0);
