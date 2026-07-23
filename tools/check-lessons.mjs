// Check every lesson without a browser: build its files, walk its steps with the debugger the way
// the studio does, and test each step's line, check, output, state and errors.
// Usage: node tools/check-lessons.mjs [lesson id or file fragment]
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { load } from '../tests/load.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEE = load();
const lessons = [];
SEE.Lessons = { add: (l) => lessons.push(l) };
const only = process.argv[2];
for (const f of readdirSync(join(root, 'src/ide/lessons')).filter((x) => x.endsWith('.js')).sort()) {
  const before = lessons.length;
  try { vm.runInThisContext(readFileSync(join(root, 'src/ide/lessons', f), 'utf8'), { filename: f }); } catch (e) { console.log('FAIL ' + f + ': does not load: ' + e.message); process.exitCode = 1; continue; }
  for (let i = before; i < lessons.length; i++) lessons[i].file = f;
}
const ids = new Set();
let pass = 0, fail = 0;
for (const l of lessons) {
  if (only && !l.id.includes(only) && !l.file.includes(only)) continue;
  const why = [];
  if (ids.has(l.id)) why.push('duplicate id');
  ids.add(l.id);
  for (const k of ['id', 'unit', 'title', 'files', 'steps']) if (!l[k]) why.push('missing ' + k);
  if (why.length) { fail++; console.log('FAIL ' + l.id + ': ' + why.join('; ')); continue; }
  const dir = '/lessons/' + l.id;
  const main = l.main || Object.keys(l.files).find((x) => x.endsWith('.c'));
  const text = Object.assign({}, l.files);
  let m = null, dbg = null, out = '', problems = [];
  const build = () => {
    const files = Object.keys(text).filter((x) => x.endsWith('.c')).map((x) => ({ path: dir + '/' + x, text: text[x] }));
    const r = SEE.Build.build(files, (p) => { const n = p.replace(dir + '/', ''); return text[n] !== undefined ? text[n] : null; }, {});
    problems = r.errors.concat(r.warnings).map((e) => e.message);
    return r;
  };
  const settle = () => { let r; for (let i = 0; i < 400; i++) { r = m.run(100000); if (r !== 'budget') break; } return r; };
  const start = (mode) => {
    const r = build();
    if (!r.ok) throw new Error('does not build: ' + r.errors.map((e) => (e.pos ? e.pos.line + ': ' : '') + e.message).join(' | '));
    out = '';
    const vfs = new SEE.VFS();
    for (const d of ['/tmp', '/home', '/home/user']) vfs.mkdir(d, { trusted: true, exist: true });
    m = new SEE.Machine(r.prog, { write: (fd, b) => { out += Buffer.from(b).toString('latin1'); }, cwd: dir, argv: [l.id], vfs });
    if (mode === 'run') { m.debug = false; dbg = null; settle(); return; }
    dbg = new SEE.Debug.Debugger(m, { outputMark: () => out.length, outputRewind: (n) => { out = out.slice(0, n); } });
    dbg.resume('start');
    settle();
  };
  const live = () => m && dbg && m.state === 'paused';
  const ensure = () => { if (!m || !dbg || m.state === 'exited' || m.state === 'faulted') start('debug'); };
  l.steps.forEach((s, i) => {
    const tag = 'step ' + (i + 1);
    try {
      const act = s.do;
      if (act && typeof act === 'object' && act.edit) {
        const [line, t] = act.edit;
        const f = act.file || main;
        const lines = text[f].split('\n');
        lines[line - 1] = t;
        text[f] = lines.join('\n');
      }
      if (act === 'start' || act === 'restart') start('debug');
      else if (act === 'run') start('run');
      else if (act === 'build') build();
      else if (['over', 'into', 'out', 'stmt'].includes(act)) {
        ensure();
        for (let k = 0; k < (s.times || 1); k++) { if (!live()) break; dbg.resume(act); m.resumed = true; settle(); }
      } else if (act === 'continue') { ensure(); if (live()) { dbg.resume('run'); m.resumed = true; settle(); } }
      else if (act === 'back') { for (let k = 0; k < (s.times || 1); k++) if (!dbg.stepBack()) throw new Error('cannot step back'); }
      else if (act && typeof act === 'object' && act.to !== undefined) {
        ensure();
        if (live()) { dbg.setBreakpoint(dir + '/' + (act.file || main), act.to); dbg.resume('run'); m.resumed = true; settle(); dbg.clearBreakpoint(dir + '/' + (act.file || main), act.to); }
      } else if (act && typeof act === 'object' && act.set) {
        ensure();
        const r = SEE.Debug.evaluate(m, 0, act.set[0]);
        SEE.Debug.setValue(m, r.type, r.addr, act.set[1], 0, r.bits);
      } else if (act && typeof act === 'object' && act.edit) { /* done above */ }
      else if (act) throw new Error('unknown do: ' + JSON.stringify(act));
      if (s.input && m && m.libc) {
        for (const b of Buffer.from(s.input, 'latin1')) m.libc.input.push(b);
        out += s.input;
        if (m.state === 'input') { if (dbg) m.resumed = false; settle(); }
      }
      if (s.line !== undefined && m && m.where().line !== s.line) why.push(tag + ': at line ' + m.where().line + ', expected ' + s.line);
      if (s.state && (!m || m.state !== s.state)) why.push(tag + ': state ' + (m && m.state) + ', expected ' + s.state + (m && m.fault ? ' (' + m.fault.msg + ')' : ''));
      if (s.check) {
        try { const r = SEE.Debug.evaluate(m, 0, s.check); if (!r.value) why.push(tag + ': check ' + s.check + ' is false'); } catch (e) { why.push(tag + ': check ' + s.check + ': ' + e.message); }
      }
      if (s.output && !out.includes(s.output)) why.push(tag + ': output lacks ' + JSON.stringify(s.output) + ' (got ' + JSON.stringify(out.slice(-120)) + ')');
      if (s.errors && !problems.some((p) => p.includes(s.errors))) why.push(tag + ': no problem mentions ' + JSON.stringify(s.errors) + ' (got ' + JSON.stringify(problems) + ')');
      if (!s.text || s.text.length < 40) why.push(tag + ': text missing or too short');
      if (m && m.state === 'faulted' && !s.state && !(l.steps.slice(i).some((x) => x.state === 'faulted'))) why.push(tag + ': the program crashed: ' + m.fault.msg);
    } catch (e) { why.push(tag + ': ' + e.message); }
  });
  if (why.length) { fail++; console.log('FAIL ' + l.id + ' (' + l.file + ')\n    ' + why.join('\n    ')); } else pass++;
}
console.log(pass + ' lessons ok, ' + fail + ' with problems');
if (fail) process.exitCode = 1;
