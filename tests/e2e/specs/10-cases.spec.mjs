// Every language test in tests/cases, built and run inside the page exactly as the studio does it.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../cases');
export default function (t) {
  for (const f of readdirSync(dir).sort()) {
    const full = join(dir, f);
    const isDir = statSync(full).isDirectory();
    const src = readFileSync(isDir ? join(full, 'expect') : full, 'utf8');
    const files = {};
    if (isDir) { for (const x of readdirSync(full)) if (x !== 'expect') files[x] = readFileSync(join(full, x), 'utf8'); } else files['main.c'] = src;
    const exp = /\/\* OUTPUT\n([\s\S]*?)\*\/\s*$/.exec(src);
    const input = /\/\* INPUT\n([\s\S]*?)\*\//.exec(src);
    const errs = [...src.matchAll(/\/\* ERROR: (.*?) \*\//g)].map((m) => m[1]);
    const faults = [...src.matchAll(/\/\* FAULT: (.*?) \*\//g)].map((m) => m[1]);
    t.test('case ' + f, async (p) => {
      const folder = '/home/user/case-' + f.replace(/\W+/g, '-');
      // the files test reads and writes these, as tests/runc.mjs sets them up
      await p.ev(`(() => { const v = SEE.app.vfs; v.mkdir('/data', { exist: true, trusted: true }); v.writeText('/data/numbers.txt', '3 1 4 1 5 9 2 6\\n', { trusted: true }); v.mkdir('/locked', { exist: true, trusted: true }); v.writeText('/locked/readme.txt', 'read only\\n', { trusted: true }); v.entries.get('/locked').readOnly = true; })()`);
      for (const [name, text] of Object.entries(files)) await p.newFile(folder + '/' + name, text);
      await p.ev(`SEE.app.openFile(${JSON.stringify(folder + '/' + (files['main.c'] ? 'main.c' : Object.keys(files).find((x) => x.endsWith('.c'))))})`);
      if (errs.length) {
        await p.build();
        const probs = (await p.problems()).join('\n');
        for (const e of errs) p.assert.ok(probs.includes(e), 'missing error ' + e + ' in ' + probs);
        return;
      }
      await p.ev('SEE.app.run()');
      await p.settle(20000);
      if (input) { await p.ev(`SEE.app.feedInput(${JSON.stringify(input[1])}); SEE.app.feedEOF()`); await p.settle(20000); }
      const st = await p.state();
      if (faults.length) {
        p.assert.equal(st, 'faulted');
        const msg = await p.ev('SEE.app.vm.fault.title + ": " + SEE.app.vm.fault.msg');
        for (const x of faults) p.assert.ok(msg.includes(x), msg + ' lacks ' + x);
      } else p.assert.equal(st, 'exited', await p.output());
      if (exp) {
        const out = await p.ev("SEE.app.terminal.items.filter(i => !/note|in/.test(i.cls)).map(i => i.text).join('')");
        // __FILE__ names the file where it really is
        p.assert.equal(out.split(folder + '/' + (files['main.c'] ? 'main.c' : '')).join('/prog.c'), exp[1]);
      }
    }, { timeout: 40000 });
  }
}
