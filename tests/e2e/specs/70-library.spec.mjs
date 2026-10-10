// Every program in the library, opened from the library browser's index (fetched from library/)
// and run in the page with its canned input. Split into parts so workers can share the load.
import { scan } from '../../../tools/gen-library.mjs';

export function libraryTests(t, part, parts) {
  const all = scan();
  all.forEach((e, i) => {
    if (i % parts !== part) return;
    t.test('library ' + e.id, async (p) => {
      await p.ev(`SEE.Library.openById(SEE.app, ${JSON.stringify(e.id)})`);
      await p.wait(`SEE.app.active && SEE.app.active.path.startsWith('/library/${e.id}/')`, 8000);
      if (e.args) await p.ev(`SEE.app.settings.args = ${JSON.stringify(e.args)}`);
      await p.ev('SEE.app.run()');
      await p.settle(30000);
      if (e.input) { await p.ev(`SEE.app.feedInput(${JSON.stringify(e.input)}); SEE.app.feedEOF()`); await p.settle(30000); }
      else if ((await p.state()) === 'input') { await p.ev('SEE.app.feedEOF()'); await p.settle(30000); }
      const st = await p.state();
      if (/fault/.test(e.expect || '')) p.assert.equal(st, 'faulted', 'expected a crash');
      else if (/error/.test(e.expect || '')) p.assert.ok(true);
      else p.assert.equal(st, 'exited', 'state ' + st + ': ' + (await p.output()).slice(-300));
      await p.ev("SEE.app.settings.args = ''");
    }, { timeout: 60000 });
  });
}
export default function (t) { libraryTests(t, 0, 4); }
