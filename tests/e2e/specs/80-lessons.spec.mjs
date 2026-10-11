// Every lesson, walked step by step inside the studio with the same checks as tools/check-lessons.mjs.
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../../src/ide/lessons');
export function lessonIds() {
  const ids = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) {
    for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/SEE\.Lessons\.add\(\{\s*id:\s*'([^']+)'/g)) ids.push(m[1]);
  }
  return ids;
}
export function lessonTests(t, part, parts) {
  lessonIds().forEach((id, i) => {
    if (i % parts !== part) return;
    t.test('lesson ' + id, async (p) => {
      const r = await p.ev(`SEE.Lessons.selfTest(SEE.app, ${JSON.stringify(id)})`);
      const bad = r.filter((x) => !x.ok);
      p.assert.deepEqual(bad, [], JSON.stringify(bad));
      await p.ev('SEE.Lessons.close()');
    }, { timeout: 90000 });
  });
}
export default function (t) { lessonTests(t, 0, 2); }
