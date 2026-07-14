// Check the reference texts: every entry has text, and every example builds without warnings,
// runs to the end and prints something. Usage: node tools/check-ref.mjs [file fragment]
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { runC } from '../tests/runc.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2];
let pass = 0, fail = 0;
for (const f of readdirSync(join(root, 'src/ide/ref')).filter((x) => x.endsWith('.js')).sort()) {
  if (only && !f.includes(only)) continue;
  globalThis.SEE.RefText = {};
  try { vm.runInThisContext(readFileSync(join(root, 'src/ide/ref', f), 'utf8'), { filename: f }); } catch (e) { console.log('FAIL ' + f + ': does not load: ' + e.message); fail++; continue; }
  for (const [name, e] of Object.entries(globalThis.SEE.RefText)) {
    const why = [];
    if (!e.text || e.text.length < 60) why.push('text missing or too short');
    if (/<[a-z]+[ >]/i.test(e.text || '')) why.push('text has HTML');
    if (e.example) {
      const r = runC(e.example, { input: '', maxSlices: 10 });
      if (!r.ok) why.push('example does not build: ' + r.errors.join(' | '));
      else {
        if (r.warnings.length) why.push('example warns: ' + r.warnings.join(' | '));
        if (r.fault) why.push('example crashes: ' + r.fault.msg);
        else if (r.res !== 'exit') why.push('example does not finish (' + r.res + ')');
        else if (!r.out.trim() && !/abort|exit|signal|raise|assert|setjmp|longjmp/.test(name)) why.push('example prints nothing');
      }
    }
    if (why.length) { fail++; console.log('FAIL ' + f + ' ' + name + ': ' + why.join('; ')); } else pass++;
  }
}
console.log(pass + ' entries ok, ' + fail + ' with problems');
if (fail) process.exitCode = 1;
