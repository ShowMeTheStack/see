// Stepping back: undoing lines and statements, with their memory changes, output, heap blocks,
// calls and input; after a crash and after the end; and with the history turned off.
const DIR = '/home/user/e2e';
const MAIN = DIR + '/main.c';
const src = (...lines) => lines.join('\n') + '\n';

const BACK = src(
  '#include <stdio.h>',                      // 1
  '#include <stdlib.h>',                     // 2
  'int add(int a, int b)',                   // 3
  '{',                                       // 4
  '    int s = a + b;',                      // 5
  '    return s;',                           // 6
  '}',                                       // 7
  'int main(void)',                          // 8
  '{',                                       // 9
  '    int x;',                              // 10
  '    int y = 0;',                          // 11
  '    int *p;',                             // 12
  '    x = 5;',                              // 13
  '    printf("x is %d\\n", x);',            // 14
  '    y = add(x, 2);',                      // 15
  '    p = (int *)malloc(3 * sizeof(int));', // 16
  '    p[0] = 1; p[1] = 2; p[2] = 3;',       // 17
  '    free(p);',                            // 18
  '    x = x + y;',                          // 19
  '    printf("done %d\\n", x);',            // 20
  '    return 0;',                           // 21
  '}');                                      // 22
// the lines F10 visits in BACK, from the start
const ORDER = [11, 13, 14, 15, 16, 17, 18, 19, 20, 21];

const FACT = src(
  '#include <stdio.h>',          // 1
  'int fact(int n)',             // 2
  '{',                           // 3
  '    if (n <= 1)',             // 4
  '        return 1;',           // 5
  '    return n * fact(n - 1);', // 6
  '}',                           // 7
  'int main(void)',              // 8
  '{',                           // 9
  '    int r = 0;',              // 10
  '    r = fact(3);',            // 11
  '    printf("%d\\n", r);',     // 12
  '    return 0;',               // 13
  '}');                          // 14

const LOOP = src(
  '#include <stdio.h>',          // 1
  'int main(void)',              // 2
  '{',                           // 3
  '    int i;',                  // 4
  '    int sum = 0;',            // 5
  '    for (i = 0; i < 5; i++) {', // 6
  '        sum += i;',           // 7
  '        printf("%d ", sum);', // 8
  '    }',                       // 9
  '    printf("\\n");',          // 10
  '    return 0;',               // 11
  '}');                          // 12

const CRASH = src(
  '#include <stdio.h>',          // 1
  'int main(void)',              // 2
  '{',                           // 3
  '    int x = 1;',              // 4
  '    int *q = 0;',             // 5
  '    printf("before\\n");',    // 6
  '    x = *q + 1;',             // 7
  '    printf("after %d\\n", x);', // 8
  '    return 0;',               // 9
  '}');                          // 10

const INPUT = src(
  '#include <stdio.h>',          // 1
  'int main(void)',              // 2
  '{',                           // 3
  '    int a = 0, b = 0;',       // 4
  '    scanf("%d", &a);',        // 5
  '    scanf("%d", &b);',        // 6
  '    printf("sum %d\\n", a + b);', // 7
  '    return 0;',               // 8
  '}');                          // 9

async function clean(p) {
  await p.ev(`(() => { const a = SEE.app; if (a.vm) a.stop(); a.stopAnimate(); a.updateUI(); a.clearBreakpoints(); a.watchPanel.list = []; a.watchPanel.save(); a.settings.record = true; a.settings.libFrames = false; SEE.UI.closeAllModals(); SEE.UI.closeMenus(); a.callout.hide(); document.querySelectorAll('.toast').forEach((t) => t.remove()); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); })()`);
  await p.sleep(20);
}
/** Debug BACK and step over until the given line */
async function backAt(p, line) {
  await p.debugProgram(BACK);
  const n = ORDER.indexOf(line);
  if (n < 0) throw new Error('line ' + line + ' is not visited');
  await p.step('over', n);
  p.assert.equal(await p.line(), line);
}
const bp = (p, line1) => p.ev(`SEE.app.toggleBreakpoint(SEE.app.active.path, ${line1 - 1})`);
const uninit = (p, expr) => p.ev(`(() => { const r = SEE.Debug.evaluate(SEE.app.vm, 0, ${JSON.stringify(expr)}); return SEE.Debug.uninit(SEE.app.vm, r.addr, SEE.Types.sizeof(r.type)); })()`);
const liveBlocks = (p) => p.ev('SEE.app.vm.libc.blocks.filter((b) => !b.free).length');
const freedBlocks = (p) => p.ev('SEE.app.vm.libc.blocks.filter((b) => b.free).length');
const VROW = (name) => `[...document.querySelectorAll('#panel-vars .vrow')].find((r) => r.querySelector('.vn') && r.querySelector('.vn').textContent.replace(/^[▸▾]/, '') === ${JSON.stringify(name)})`;
const MCELL = (name) => `[...document.querySelectorAll('#panel-memory .cell')].find((r) => r.querySelector('.n') && r.querySelector('.n').textContent.replace(/^[▸▾]/, '') === ${JSON.stringify(name)})`;
const frameCount = (p) => p.ev('SEE.app.vm.frames.length');

export default function (t) {
  t.beforeEach(clean);

  // ---- one line back -----------------------------------------------------------------------------------
  t.test('F8 steps back a line', async (p) => {
    await backAt(p, 14);
    await p.key('F8');
    p.assert.equal(await p.line(), 13);
    p.assert.equal(await p.state(), 'paused');
  });
  t.test('F8 again and again walks back through the lines', async (p) => {
    await backAt(p, 21);
    const seen = [];
    for (let i = 0; i < ORDER.length - 1; i++) { await p.back(); seen.push(await p.line()); }
    p.assert.deepEqual(seen, ORDER.slice(0, -1).reverse());
  });
  t.test('the Back toolbar button steps back', async (p) => {
    await backAt(p, 14);
    await p.click('#tbBack');
    p.assert.equal(await p.line(), 13);
  });
  t.test('Debug > Step back in the menu', async (p) => {
    await backAt(p, 14);
    await p.menu('Debug', 'Step back');
    p.assert.equal(await p.line(), 13);
  });
  t.test('stepping back says so in the status bar and the chip', async (p) => {
    await backAt(p, 14);
    await p.back();
    p.assert.equal(await p.status(), 'Stepped back to line 13 in main()');
    p.assert.equal(await p.chip(), 'Paused (went back)');
  });
  t.test('stepping back moves the exec line mark', async (p) => {
    await backAt(p, 14);
    await p.back();
    p.assert.equal(await p.ev('SEE.app.active.editor.marks.exec'), 12);
  });
  t.test('a step after stepping back says Paused again', async (p) => {
    await backAt(p, 14);
    await p.back();
    await p.step('over');
    p.assert.equal(await p.chip(), 'Paused');
    p.assert.equal(await p.line(), 14);
  });
  t.test('at the first line there is nothing to go back to', async (p) => {
    await p.debugProgram(BACK);
    await p.key('F8');
    await p.waitToast(/Cannot go back further/);
    p.assert.equal(await p.line(), 11);
  });
  t.test('going back to the start then forward again', async (p) => {
    await backAt(p, 16);
    await p.back(4);
    p.assert.equal(await p.line(), 11);
    await p.step('over', 5);
    p.assert.equal(await p.line(), 17);
    p.assert.equal(await p.cval('y'), 7);
  });

  // ---- memory changes are undone ---------------------------------------------------------------------
  t.test('stepping back undoes an assignment', async (p) => {
    await backAt(p, 20);
    p.assert.equal(await p.cval('x'), 12);
    await p.back();
    p.assert.equal(await p.cval('x'), 5);
  });
  t.test('stepping back before the first assignment makes the value not set again', async (p) => {
    await backAt(p, 14);
    p.assert.equal(await uninit(p, 'x'), false);
    await p.back();
    p.assert.equal(await uninit(p, 'x'), true);
  });
  t.test('the Variables panel shows the value red again after stepping back', async (p) => {
    await backAt(p, 14);
    await p.showRight('vars');
    p.assert.doesNotMatch(await p.ev(`(${VROW('x')}).querySelector('.vv').className`), /uninit/);
    await p.back();
    p.assert.match(await p.ev(`(${VROW('x')}).querySelector('.vv').className`), /uninit/);
  });
  t.test('the memory picture shows the value red again after stepping back', async (p) => {
    await backAt(p, 14);
    await p.showRight('memory');
    p.assert.equal(await p.ev(`(${MCELL('x')}).querySelector('.v').textContent`), '5');
    await p.back();
    p.assert.match(await p.ev(`(${MCELL('x')}).querySelector('.v').className`), /uninit/);
  });
  t.test('the memory picture marks the value that went back as changed', async (p) => {
    await backAt(p, 20);
    await p.showRight('memory');
    await p.back();
    p.assert.ok(await p.ev(`(${MCELL('x')}).classList.contains('changed')`));
  });
  t.test('stepping back over a call undoes its result', async (p) => {
    await backAt(p, 16);
    p.assert.equal(await p.cval('y'), 7);
    await p.back();
    p.assert.equal(await p.line(), 15);
    p.assert.equal(await p.cval('y'), 0);
  });
  t.test('stepping back over a call lands before the call, in main', async (p) => {
    await backAt(p, 16);
    await p.back();
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await frameCount(p), 1);
    p.assert.deepEqual(await p.ev('SEE.Debug.frames(SEE.app.vm).filter((f) => !f.system).map((f) => f.name)'), ['main']);
  });
  t.test('stepping back from the first line of a function goes to the caller', async (p) => {
    await backAt(p, 15);
    await p.step('into');
    p.assert.equal(await p.fnName(), 'add');
    await p.back();
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await p.line(), 15);
  });
  t.test('stepping back inside a function stays in it', async (p) => {
    await backAt(p, 15);
    await p.step('into', 2);
    p.assert.equal(await p.line(), 6);
    await p.back();
    p.assert.equal(await p.fnName(), 'add');
    p.assert.equal(await p.line(), 5);
    p.assert.equal(await uninit(p, 's'), true);
  });
  t.test('stepping back undoes all the statements of a line', async (p) => {
    await backAt(p, 18);
    await p.back();
    p.assert.equal(await p.line(), 17);
    p.assert.deepEqual([await uninit(p, 'p[0]'), await uninit(p, 'p[1]'), await uninit(p, 'p[2]')], [true, true, true]);
  });
  t.test('a watch shows the old value after stepping back', async (p) => {
    await p.ev("SEE.app.watchPanel.add('x + y')");
    await backAt(p, 20);
    await p.showRight('watch');
    p.assert.equal(await p.ev("document.querySelector('#panel-watch .wv').textContent"), '19');
    await p.back();
    p.assert.equal(await p.ev("document.querySelector('#panel-watch .wv').textContent"), '12');
  });
  t.test('stepping back round a loop', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 8);
    await p.debugProgram(LOOP);
    for (let k = 0; k < 4; k++) await p.cont();
    p.assert.equal(await p.cval('i'), 3);
    p.assert.equal(await p.cval('sum'), 6);
    await p.back(3);
    p.assert.equal(await p.line(), 8);
    p.assert.equal(await p.cval('i'), 2);
    p.assert.equal(await p.cval('sum'), 3);
  });

  // ---- output is undone ------------------------------------------------------------------------------
  t.test('stepping back undoes printf output in the terminal', async (p) => {
    await backAt(p, 15);
    p.assert.match(await p.output(), /x is 5/);
    await p.back();
    p.assert.doesNotMatch(await p.output(), /x is 5/);
    p.assert.doesNotMatch(await p.ev("document.getElementById('termOut').innerText"), /x is 5/);
  });
  t.test('stepping forward again prints the output again, once', async (p) => {
    await backAt(p, 15);
    await p.back();
    await p.step('over');
    p.assert.equal((await p.output()).match(/x is 5/g).length, 1);
  });
  t.test('output in a loop is undone piece by piece', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 10);
    await p.debugProgram(LOOP);
    await p.cont();
    await p.ev('SEE.app.vm.libc.flushAll()');
    const all = await p.output();
    p.assert.match(all, /0 1 3 6 10 /);
    await bp(p, 10);
    await p.back(3);
    p.assert.doesNotMatch(await p.output() + await p.ev("(document.querySelector('.term .pending') || {}).textContent || ''"), /10 /);
  });
  t.test('stepping back then forward gives the same output', async (p) => {
    await p.debugProgram(BACK);
    await p.cont();
    const once = await p.output();
    await p.stopProgram();
    await backAt(p, 21);
    await p.back(6);
    await p.cont();
    p.assert.equal(await p.output(), once);
  });
  t.test('stepping back then forward in a loop gives the same output', async (p) => {
    await p.newFile(MAIN, LOOP);
    await p.debugProgram(LOOP);
    await p.cont();
    const want = (await p.output()).replace(/^.*\n/, '');
    await p.stopProgram();
    await bp(p, 7);
    await p.debugProgram(LOOP);
    for (let k = 0; k < 4; k++) await p.cont();
    await p.back(5);
    await bp(p, 7);
    await p.cont();
    p.assert.equal((await p.output()).replace(/^.*\n/, ''), want);
  });

  t.test('stepping back undoes output still waiting in the stdout buffer', async (p) => {
    await p.debugProgram(src('#include <stdio.h>', 'int main(void)', '{', '    int i;', '    for (i = 0; i < 3; i++)', '        printf("%d ", i);', '    printf("\\n");', '    return 0;', '}'));
    await p.step('over', 4);
    await p.back(2);
    await p.cont();
    p.assert.match(await p.output(), /^0 1 2 $/m);
  });

  // ---- the heap -----------------------------------------------------------------------------------------
  t.test('stepping back undoes a malloc: the block disappears', async (p) => {
    await backAt(p, 17);
    p.assert.equal(await liveBlocks(p), 1);
    await p.back();
    p.assert.equal(await p.ev('SEE.app.vm.libc.blocks.length'), 0);
  });
  t.test('the memory picture loses the block after stepping back over malloc', async (p) => {
    await backAt(p, 17);
    await p.showRight('memory');
    p.assert.equal(await p.count('#panel-memory .blk'), 1);
    await p.back();
    p.assert.equal(await p.count('#panel-memory .blk'), 0);
    p.assert.match(await p.memText(), /nothing allocated yet/);
  });
  t.test('stepping back over malloc gives back the heap space', async (p) => {
    await backAt(p, 16);
    const brk = await p.ev('SEE.app.vm.mem.brk');
    await p.step('over');
    await p.back();
    p.assert.equal(await p.ev('SEE.app.vm.mem.brk'), brk);
  });
  t.test('a malloc done again after stepping back gives the same block', async (p) => {
    await backAt(p, 17);
    const a = await p.cval('p');
    await p.back();
    await p.step('over');
    p.assert.equal(await p.cval('p'), a);
    p.assert.match(await p.ev("SEE.app.vm.libc.blocks.map((b) => '#' + b.id).join()"), /^#1$/);
  });
  t.test('stepping back undoes a free: the block is back', async (p) => {
    await backAt(p, 19);
    p.assert.equal(await freedBlocks(p), 1);
    await p.back();
    p.assert.equal(await freedBlocks(p), 0);
    p.assert.equal(await liveBlocks(p), 1);
  });
  t.test('the memory picture shows the block again after stepping back over free', async (p) => {
    await backAt(p, 19);
    await p.showRight('memory');
    p.assert.match(await p.memText(), /free \(was block #1\)/);
    await p.back();
    p.assert.doesNotMatch(await p.memText(), /free \(was block #1\)/);
    p.assert.match(await p.memText(), /block #1 · 12 bytes/);
  });
  t.test('the values in a block come back after stepping back over free', async (p) => {
    await backAt(p, 19);
    await p.back();
    p.assert.deepEqual([await p.cval('p[0]'), await p.cval('p[1]'), await p.cval('p[2]')], [1, 2, 3]);
  });
  t.test('the program ends without a leak after stepping back and forward over free', async (p) => {
    await backAt(p, 19);
    await p.back();
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.doesNotMatch(await p.output(), /Memory leak/);
  });

  // ---- one statement back -----------------------------------------------------------------------------
  t.test('Shift+F8 steps back one statement', async (p) => {
    await backAt(p, 18);
    await p.key('F8', { shift: true });
    p.assert.equal(await p.line(), 17);
    p.assert.equal(await p.cval('p[1]'), 2);
    p.assert.equal(await uninit(p, 'p[2]'), true);
  });
  t.test('Shift+F8 twice undoes two statements of the line', async (p) => {
    await backAt(p, 18);
    await p.ev('SEE.app.stepBack(true)');
    await p.ev('SEE.app.stepBack(true)');
    p.assert.equal(await p.line(), 17);
    p.assert.equal(await p.cval('p[0]'), 1);
    p.assert.equal(await uninit(p, 'p[1]'), true);
  });
  t.test('Debug > Step back one statement in the menu', async (p) => {
    await backAt(p, 18);
    await p.menu('Debug', 'Step back one statement');
    p.assert.equal(await p.line(), 17);
    p.assert.equal(await uninit(p, 'p[2]'), true);
  });
  t.test('Shift+F8 after a call goes back into the function', async (p) => {
    await backAt(p, 16);
    await p.ev('SEE.app.stepBack(true)');
    p.assert.equal(await p.fnName(), 'add');
    p.assert.equal(await p.line(), 6);
  });
  t.test('Shift+F8 at the first line of main does not go into the C library', async (p) => {
    await p.debugProgram(BACK);
    await p.ev('SEE.app.stepBack(true)');
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await p.activePath(), MAIN);
  });

  // ---- recursion -------------------------------------------------------------------------------------
  t.test('stepping back from the deepest call climbs out frame by frame', async (p) => {
    await p.debugProgram(FACT);
    await p.step('over');
    await p.step('into', 5);
    p.assert.equal(await p.cval('n'), 1);
    p.assert.equal(await frameCount(p), 4);
    const seen = [];
    for (let i = 0; i < 5; i++) {
      await p.back();
      const n = await p.ev("(() => { try { return SEE.Debug.evaluate(SEE.app.vm, 0, 'n').value; } catch (e) { return null; } })()");
      seen.push(await p.fnName() + ':' + (await p.line()) + ':' + n);
    }
    p.assert.deepEqual(seen, ['fact:6:2', 'fact:4:2', 'fact:6:3', 'fact:4:3', 'main:11:null']);
  });
  t.test('stepping back into the recursion depth with Shift+F8', async (p) => {
    await p.debugProgram(FACT);
    await p.step('over', 2);
    p.assert.equal(await p.line(), 12);
    p.assert.equal(await p.cval('r'), 6);
    await p.key('F8', { shift: true });
    p.assert.equal(await p.fnName(), 'fact');
    p.assert.equal(await p.cval('n'), 1);
    p.assert.equal(await frameCount(p), 4);
  });
  t.test('the call stack is deep again after stepping back into the recursion', async (p) => {
    await p.debugProgram(FACT);
    await p.step('over', 2);
    await p.ev('SEE.app.stepBack(true)');
    await p.showRight('vars');
    p.assert.equal(await p.count('#panel-vars .fr'), 4);
    p.assert.deepEqual([await p.cval('n', 0), await p.cval('n', 1), await p.cval('n', 2)], [1, 2, 3]);
  });
  t.test('F8 over a recursive call undoes it all', async (p) => {
    await p.debugProgram(FACT);
    await p.step('over', 2);
    await p.back();
    p.assert.equal(await p.line(), 11);
    p.assert.equal(await p.cval('r'), 0);
    p.assert.equal(await frameCount(p), 1);
  });
  t.test('after stepping back into the recursion, Continue gives the same answer', async (p) => {
    await p.debugProgram(FACT);
    await p.step('over', 2);
    await p.ev('SEE.app.stepBack(true)');
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await p.output(), /^6$/m);
  });

  // ---- after a crash, after the end ------------------------------------------------------------------
  t.test('stepping back after a crash goes to the start of the crashing line', async (p) => {
    await p.debugProgram(CRASH);
    await p.cont();
    p.assert.equal(await p.state(), 'faulted');
    await p.key('F8');
    p.assert.equal(await p.state(), 'paused');
    p.assert.equal(await p.line(), 7);
    p.assert.equal(await p.cval('x'), 1);
  });
  t.test('stepping back after a crash clears the crash', async (p) => {
    await p.debugProgram(CRASH);
    await p.cont();
    await p.back();
    p.assert.equal(await p.ev('SEE.app.vm.fault'), null);
    p.assert.equal(await p.chip(), 'Paused (went back)');
    p.assert.equal(await p.ev('SEE.app.active.editor.marks.err'), null);
    p.assert.equal(await p.ev('SEE.app.active.editor.marks.exec'), 6);
  });
  t.test('after stepping back from a crash, stepping forward crashes again', async (p) => {
    await p.debugProgram(CRASH);
    await p.cont();
    await p.back();
    await p.step('over');
    p.assert.equal(await p.state(), 'faulted');
    p.assert.equal(await p.line(), 7);
  });
  t.test('after stepping back from a crash, fixing the pointer lets it go on', async (p) => {
    await p.debugProgram(CRASH);
    await p.cont();
    await p.back();
    await p.ev("(() => { const v = SEE.Debug.frames(SEE.app.vm)[0].vars.find((x) => x.name === 'q'); SEE.Debug.setValue(SEE.app.vm, v.type, v.addr, '&x', 0); })()");
    await p.step('over');
    p.assert.equal(await p.state(), 'paused');
    p.assert.equal(await p.cval('x'), 2);
    await p.cont();
    p.assert.match(await p.output(), /after 2/);
  });
  t.test('after a crash, stepping back keeps the output printed before it', async (p) => {
    await p.debugProgram(CRASH);
    await p.cont();
    await p.back();
    p.assert.match(await p.output(), /before/);
    p.assert.doesNotMatch(await p.output(), /Segmentation fault/);
  });
  t.test('after a crash, F8 twice goes to the line before', async (p) => {
    await p.debugProgram(CRASH);
    await p.cont();
    await p.back(2);
    p.assert.equal(await p.line(), 6);
    p.assert.doesNotMatch(await p.output(), /before/);
  });
  t.test('after a crash the status bar offers F8', async (p) => {
    await p.debugProgram(CRASH);
    await p.cont();
    p.assert.match(await p.status(), /F8 steps back/);
    p.assert.equal(await p.ev("document.getElementById('tbBack').disabled"), false);
  });
  t.test('stepping back after the program ended pauses it again', async (p) => {
    await p.debugProgram(BACK);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await p.status(), /You can still step back \(F8\)/);
    await p.key('F8');
    p.assert.equal(await p.state(), 'paused');
    p.assert.equal(await p.chip(), 'Paused (went back)');
    p.assert.match(await p.output(), /done 12/);
    p.assert.doesNotMatch(await p.output(), /exited with status/);
  });
  t.test('stepping back after the end lands in main', async (p) => {
    await p.debugProgram(BACK);
    await p.cont();
    await p.back();
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await p.activePath(), MAIN);
    await p.back();
    p.assert.equal(await p.line(), 20);
  });
  t.test('stepping back after the end reaches main\'s last line', async (p) => {
    await p.debugProgram(BACK);
    await p.cont();
    await p.back();
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await p.line(), 21);
    p.assert.equal(await p.cval('x'), 12);
  });
  t.test('after stepping back from the end, Continue ends it again', async (p) => {
    await p.debugProgram(BACK);
    await p.cont();
    await p.back(3);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.equal((await p.output()).match(/done 12/g).length, 1);
  });

  // ---- input ------------------------------------------------------------------------------------------
  t.test('stepping back over a read gives the unread input back', async (p) => {
    await p.debugProgram(INPUT);
    await p.step('over');
    await p.step('over');
    p.assert.equal(await p.state(), 'input');
    await p.ev('SEE.app.feedInput("3 4\\n")');
    await p.settle();
    p.assert.equal(await p.line(), 6);
    await p.step('over');
    p.assert.equal(await p.cval('b'), 4);
    await p.back();
    p.assert.equal(await p.line(), 6);
    p.assert.equal(await p.cval('b'), 0);
    p.assert.equal(await p.ev('SEE.app.vm.libc.input.length'), 3);
    await p.step('over');
    p.assert.equal(await p.state(), 'paused');
    p.assert.equal(await p.cval('b'), 4);
  });
  t.test('stepping back before the input was typed asks for it again', async (p) => {
    await p.debugProgram(INPUT);
    await p.step('over', 2);
    await p.showBottom('term');
    await p.ev("document.getElementById('termInput').value = '8'");
    await p.ev("document.getElementById('termInput').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))");
    await p.settle();
    p.assert.equal(await p.cval('a'), 8);
    await p.back();
    p.assert.equal(await p.line(), 5);
    p.assert.equal(await p.cval('a'), 0);
    p.assert.doesNotMatch(await p.output(), /^8$/m);
    await p.step('over');
    p.assert.equal(await p.state(), 'input');
  });
  t.test('the sum is the same after stepping back over the reads', async (p) => {
    await p.debugProgram(INPUT);
    await p.step('over', 2);
    await p.ev('SEE.app.feedInput("3 4\\n")');
    await p.settle();
    await p.step('over');
    await p.back();
    await p.cont();
    p.assert.match(await p.output(), /sum 7/);
  });

  // ---- with the history off ----------------------------------------------------------------------------
  t.test('the Back button is disabled when the history setting is off', async (p) => {
    await p.ev('SEE.app.settings.record = false');
    await backAt(p, 14);
    p.assert.equal(await p.ev("document.getElementById('tbBack').disabled"), true);
  });
  t.test('F8 with the history off explains how to turn it on', async (p) => {
    await p.ev('SEE.app.settings.record = false');
    await backAt(p, 14);
    await p.key('F8');
    await p.waitToast(/Keep a history to step back/);
    p.assert.equal(await p.line(), 14);
  });
  t.test('Debug > Step back is disabled with the history off', async (p) => {
    await p.ev('SEE.app.settings.record = false');
    await backAt(p, 14);
    await p.menu('Debug');
    const items = await p.menuItems();
    await p.closeMenus();
    p.assert.equal(items.find((x) => x.label === 'Step back').disabled, true);
    p.assert.equal(items.find((x) => x.label === 'Step back one statement').disabled, true);
  });
  t.test('Debug > Keep a history to step back turns the setting off and on', async (p) => {
    await p.menu('Debug', 'Keep a history to step back');
    p.assert.equal(await p.ev('SEE.app.settings.record'), false);
    await p.menu('Debug');
    p.assert.equal((await p.menuItems()).find((x) => x.label === 'Keep a history to step back').checked, false);
    await p.closeMenus();
    await p.menu('Debug', 'Keep a history to step back');
    p.assert.equal(await p.ev('SEE.app.settings.record'), true);
  });
  t.test('the program still runs normally with the history off', async (p) => {
    await p.ev('SEE.app.settings.record = false');
    await backAt(p, 16);
    p.assert.equal(await p.cval('y'), 7);
    await p.cont();
    p.assert.match(await p.output(), /done 12/);
  });
  t.test('after a crash with the history off, the status bar does not offer F8', async (p) => {
    await p.ev('SEE.app.settings.record = false');
    await p.debugProgram(CRASH);
    await p.cont();
    p.assert.doesNotMatch(await p.status(), /F8/);
    p.assert.equal(await p.ev("document.getElementById('tbBack').disabled"), true);
  });
  t.test('a program paused from a plain Run cannot step back', async (p) => {
    await p.runProgram(src('int main(void)', '{', '    unsigned n = 0;', '    int go = 1;', '    while (go) {', '        n++;', '    }', '    return 0;', '}'), { wait: false });
    await p.sleep(80);
    await p.ev('SEE.app.pause()');
    await p.waitState('paused');
    await p.step('over');
    p.assert.equal(await p.ev("document.getElementById('tbBack').disabled"), true);
  });
  t.test('the Back button is disabled while the program runs', async (p) => {
    await p.debugProgram(src('int main(void)', '{', '    unsigned n = 0;', '    int go = 1;', '    while (go) {', '        n++;', '    }', '    return 0;', '}'));
    await p.step('over', 3);
    p.assert.equal(await p.ev("document.getElementById('tbBack').disabled"), false);
    await p.ev('SEE.app.debugOrContinue()');
    await p.sleep(60);
    p.assert.equal(await p.ev("document.getElementById('tbBack').disabled"), true);
    await p.ev('SEE.app.pause()');
    await p.waitState('paused');
    p.assert.equal(await p.ev("document.getElementById('tbBack').disabled"), false);
  });
}
