// The C reference: every entry shows, and every example runs from "Try this example".
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../../src/ide/ref');
function entries() {
  const ctx = { SEE: {} };
  vm.createContext(ctx);
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) vm.runInContext(readFileSync(join(dir, f), 'utf8'), ctx);
  return Object.entries(ctx.SEE.RefText || {});
}
export default function (t) {
  for (const [name, e] of entries()) {
    t.test('reference ' + name, async (p) => {
      await p.ev(`SEE.Help.open(SEE.app, ${JSON.stringify(name)})`);
      await p.wait("!!document.querySelector('.ref-body h3')", 4000);
      p.assert.equal(await p.text('.ref-body h3'), name);
      if (e.example) {
        await p.click('.ref-body button', 'Try this example');
        await p.wait(`SEE.app.active && SEE.app.active.path.includes('/tmp/try-')`, 4000);
        await p.ev('SEE.app.run()');
        await p.settle(20000);
        if ((await p.state()) === 'input') { await p.ev('SEE.app.feedEOF()'); await p.settle(); }
        p.assert.ok(['exited', 'faulted'].includes(await p.state()), 'state ' + (await p.state()));
        if (!/abort|assert|raise|signal/.test(name)) p.assert.equal(await p.state(), 'exited', await p.output());
      } else await p.closeModals();
    }, { timeout: 40000 });
  }
}
