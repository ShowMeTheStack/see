// Language tests: every tests/cases/*.c is built and run; its OUTPUT, ERROR, WARNING or FAULT comment says what should happen.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runC } from './runc.mjs';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'cases');
const only = process.argv[2];
let pass = 0, fail = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.c') || fs.statSync(path.join(dir, x)).isDirectory()).sort()) {
  if (only && !f.includes(only)) continue;
  let src, project = null;
  if (fs.statSync(path.join(dir, f)).isDirectory()) {
    // a project: every .c file is compiled; "expect" holds the markers
    const d = path.join(dir, f);
    src = fs.readFileSync(path.join(d, 'expect'), 'utf8');
    const all = {};
    for (const x of fs.readdirSync(d)) if (x !== 'expect') all['/' + x] = fs.readFileSync(path.join(d, x), 'utf8');
    project = { files: Object.keys(all).filter((x) => x.endsWith('.c')).sort().map((x) => ({ path: x, text: all[x] })), all };
  } else src = fs.readFileSync(path.join(dir, f), 'utf8');
  const exp = /\/\* OUTPUT\n([\s\S]*?)\*\/\s*$/.exec(src);
  const input = /\/\* INPUT\n([\s\S]*?)\*\//.exec(src);
  const errs = [...src.matchAll(/\/\* ERROR: (.*?) \*\//g)].map((m) => m[1]);
  const warns = [...src.matchAll(/\/\* WARNING: (.*?) \*\//g)].map((m) => m[1]);
  const faults = [...src.matchAll(/\/\* FAULT: (.*?) \*\//g)].map((m) => m[1]);
  const rts = [...src.matchAll(/\/\* RUNTIME: (.*?) \*\//g)].map((m) => m[1]);
  const exitM = /\/\* EXIT: (-?\d+) \*\//.exec(src);
  let r, problem = null;
  try { r = runC(project ? project.files : src, { input: input ? input[1] : '', files: project ? project.all : null }); } catch (e) { problem = 'crash: ' + e.stack; }
  if (!problem) {
    if (errs.length) {
      if (r.ok) problem = 'expected an error: ' + errs[0];
      else for (const e of errs) if (!r.errors.some((x) => x.includes(e))) problem = 'missing error "' + e + '"; got ' + r.errors.join(' | ');
    } else if (!r.ok) problem = 'build failed: ' + r.errors.join(' | ');
    else {
      for (const w of warns) if (!r.warnings.some((x) => x.includes(w))) problem = 'missing warning "' + w + '"; got ' + r.warnings.join(' | ');
      for (const w of rts) if (!r.runtime.some((x) => x.includes(w))) problem = 'missing runtime warning "' + w + '"; got ' + r.runtime.join(' | ');
      if (faults.length) {
        if (!r.fault) problem = 'expected a fault: ' + faults[0] + ' (res ' + r.res + ')';
        else for (const x of faults) if (!(r.fault.title + ': ' + r.fault.msg).includes(x)) problem = 'fault "' + r.fault.title + ': ' + r.fault.msg + '" lacks "' + x + '"';
      } else if (r.fault) problem = 'fault: ' + r.fault.title + ': ' + r.fault.msg + ' at line ' + r.fault.at.line;
      if (exp && r.out !== exp[1]) problem = (problem ? problem + '\n' : '') + 'output differs:\n--- expected\n' + exp[1] + '--- got\n' + r.out;
      if (exitM && r.exit !== +exitM[1]) problem = 'exit ' + r.exit + ', expected ' + exitM[1];
    }
  }
  if (process.env.VERBOSE) console.log('done ' + f);
  if (problem) { fail++; console.log('FAIL ' + f + '\n  ' + problem.replace(/\n/g, '\n  ')); } else pass++;
}
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
