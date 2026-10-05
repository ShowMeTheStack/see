// The debugger: starting, stepping over, into and out, breakpoints (plain, moved, conditional,
// disabled), the Breakpoints panel, run to the cursor, pause, stop, animation, the toolbar in every
// state, the editor's line marks, recursion and the call stack, and programs made of several files.
const DIR = '/home/user/e2e';
const MAIN = DIR + '/main.c';
const src = (...lines) => lines.join('\n') + '\n';

// line numbers below are 1-based, as the status bar shows them
const BASIC = src(
  '#include <stdio.h>',          // 1
  'int sq(int n)',               // 2
  '{',                           // 3
  '    int r = n * n;',          // 4
  '    return r;',               // 5
  '}',                           // 6
  'int main(void)',              // 7
  '{',                           // 8
  '    int a = 2;',              // 9
  '    int b = sq(a);',          // 10
  '    printf("b=%d\\n", b);',   // 11
  '    a = 1; b = 2; a = a + b;', // 12
  '    return 0;',               // 13
  '}');                          // 14

const LOOP = src(
  '#include <stdio.h>',          // 1
  'int main(void)',              // 2
  '{',                           // 3
  '    int sum = 0;',            // 4
  '    int i;',                  // 5
  '    for (i = 0; i < 10; i++) {', // 6
  '        sum += i;',           // 7
  '    }',                       // 8
  '',                            // 9
  '    printf("%d\\n", sum);',   // 10
  '    return 0;',               // 11
  '}');                          // 12

const FOREVER = src(
  'int main(void)',              // 1
  '{',                           // 2
  '    unsigned long n = 0;',    // 3
  '    int go = 1;',             // 4
  '    while (go) {',            // 5
  '        n++;',                // 6
  '    }',                       // 7
  '    return 0;',               // 8
  '}');                          // 9

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
  '    int r = fact(5);',        // 10
  '    printf("%d\\n", r);',     // 11
  '    return 0;',               // 12
  '}');                          // 13

const INPUT = src(
  '#include <stdio.h>',          // 1
  'int main(void)',              // 2
  '{',                           // 3
  '    int a = 0;',              // 4
  '    scanf("%d", &a);',        // 5
  '    printf("%d\\n", a * 2);', // 6
  '    return 0;',               // 7
  '}');                          // 8

const MULTI_DIR = '/home/user/e2e-multi';
const UTIL = src(
  'int twice(int x)',            // 1
  '{',                           // 2
  '    int y = x * 2;',          // 3
  '    return y;',               // 4
  '}');                          // 5
const MULTI_MAIN = src(
  '#include <stdio.h>',          // 1
  'int twice(int x);',           // 2
  'int main(void)',              // 3
  '{',                           // 4
  '    int v = twice(21);',      // 5
  '    printf("%d\\n", v);',     // 6
  '    return 0;',               // 7
  '}');                          // 8

async function clean(p) {
  await p.ev(`(() => { const a = SEE.app; if (a.vm) a.stop(); a.stopAnimate(); a.updateUI(); a.clearBreakpoints(); a.watchPanel.list = []; a.watchPanel.save(); a.settings.record = true; a.settings.speed = 3; a.settings.libFrames = false; const s = document.getElementById('tbSpeed'); if (s) s.value = '3'; SEE.UI.closeAllModals(); SEE.UI.closeMenus(); a.callout.hide(); document.querySelectorAll('.toast').forEach((t) => t.remove()); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); })()`);
  await p.sleep(20);
}
const execMark = (p) => p.ev('SEE.app.active ? SEE.app.active.editor.marks.exec : null');
const frameMark = (p) => p.ev('SEE.app.active ? SEE.app.active.editor.marks.frame : null');
const gutterCls = (p, line0) => p.ev(`(SEE.app.active.editor.inner.children[${line0}] || {}).className || ''`);
const lineCls = (p, line0) => p.ev(`(SEE.app.active.editor.hl.children[${line0}] || {}).className || ''`);
const disabled = (p, id) => p.ev(`document.getElementById(${JSON.stringify(id)}).disabled`);
const bp = (p, line1, opts) => p.ev(`(() => { const a = SEE.app; const path = a.active.path; a.toggleBreakpoint(path, ${line1 - 1}); const o = ${JSON.stringify(opts || null)}; if (o) { Object.assign(a.breakpoints.get(path).get(${line1 - 1}), o); a.breakpointsChanged(path); } })()`);
const bpCount = (p) => p.ev('[...SEE.app.breakpoints.values()].reduce((n, m) => n + m.size, 0)');
const cursorTo = (p, line1) => p.ev(`(() => { const e = SEE.app.active.editor; e.setCursor(${line1 - 1}, 0); })()`);

/** Click an element found by a page expression */
async function clickEl(p, expr) {
  const sel = await p.ev(`(() => { const e = (${expr}); if (!e) return null; document.querySelectorAll('[data-e2e]').forEach((x) => x.removeAttribute('data-e2e')); e.setAttribute('data-e2e', '1'); return '[data-e2e="1"]'; })()`);
  if (!sel) throw new Error('no element for ' + expr);
  await p.click(sel);
}
/** Click in the gutter next to a line (1-based) */
async function gutterClick(p, line1) {
  const xy = await p.ev(`(() => { const e = SEE.app.active.editor; const r = e.main.getBoundingClientRect(); const g = e.gutter.getBoundingClientRect(); return [g.left + g.width / 2, r.top + e.padTop + (${line1 - 1} + 0.5) * e.lineHeight - e.ta.scrollTop]; })()`);
  await p.clickAt(xy[0], xy[1]);
}
async function startMulti(p) {
  await p.newFile(MULTI_DIR + '/util.c', UTIL);
  await p.newFile(MULTI_DIR + '/main.c', MULTI_MAIN);
  await p.ev("SEE.app.startDebug('start')");
  await p.waitState('paused');
}

export default function (t) {
  t.beforeEach(clean);

  // ---- starting --------------------------------------------------------------------------------------
  t.test('F5 stops at the first line of main', async (p) => {
    await p.newFile(MAIN, BASIC);
    await p.key('F5');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
    p.assert.equal(await p.fnName(), 'main');
  });
  t.test('F5 at the start says so in the status bar', async (p) => {
    await p.newFile(MAIN, BASIC);
    await p.key('F5');
    await p.waitState('paused');
    p.assert.match(await p.status(), /first line of main/);
  });
  t.test('the Debug toolbar button starts paused at main', async (p) => {
    await p.newFile(MAIN, BASIC);
    await p.click('#tbDebug');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
  });
  t.test('Debug > Debug in the menu starts paused at main', async (p) => {
    await p.newFile(MAIN, BASIC);
    await p.menu('Debug', 'Debug');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
  });
  t.test('the first line skips a declaration without code', async (p) => {
    await p.newFile(MAIN, src('int main(void)', '{', '    int x;', '    int y;', '    x = 3;', '    y = x;', '    return y;', '}'));
    await p.key('F5');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 5);
  });
  t.test('the terminal says the program is being debugged', async (p) => {
    await p.debugProgram(BASIC);
    p.assert.match(await p.output(), /Debugging \/home\/user\/e2e/);
  });
  t.test('F10 when nothing runs starts paused at main', async (p) => {
    await p.newFile(MAIN, BASIC);
    await p.key('F10');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
  });
  t.test('F11 when nothing runs starts paused at main', async (p) => {
    await p.newFile(MAIN, BASIC);
    await p.key('F11');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
  });
  t.test('a build error stops the debugger from starting', async (p) => {
    await p.newFile(MAIN, 'int main(void) { return zz; }\n');
    await p.key('F5');
    await p.sleep(150);
    p.assert.equal(await p.state(), 'none');
    p.assert.match((await p.problems()).join('\n'), /zz/);
    p.assert.equal(await p.chip(), 'Build failed');
  });

  // ---- step over -----------------------------------------------------------------------------------------
  t.test('F10 goes to the next line', async (p) => {
    await p.debugProgram(BASIC);
    await p.key('F10'); await p.settle();
    p.assert.equal(await p.line(), 10);
    p.assert.equal(await p.cval('a'), 2);
  });
  t.test('F10 steps over a call to a function of the program', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 2);
    p.assert.equal(await p.line(), 11);
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await p.cval('b'), 4);
  });
  t.test('F10 over printf shows its output', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 3);
    p.assert.equal(await p.line(), 12);
    p.assert.match(await p.output(), /b=4/);
  });
  t.test('F10 runs every statement of a line with several statements', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 4);
    p.assert.equal(await p.line(), 13);
    p.assert.equal(await p.cval('a'), 3);
    p.assert.equal(await p.cval('b'), 2);
  });
  t.test('F10 line by line visits each line in order', async (p) => {
    await p.debugProgram(BASIC);
    const seen = [await p.line()];
    for (let i = 0; i < 4; i++) { await p.key('F10'); await p.settle(); seen.push(await p.line()); }
    p.assert.deepEqual(seen, [9, 10, 11, 12, 13]);
  });
  t.test('F10 in a loop goes round the loop', async (p) => {
    await p.debugProgram(LOOP);
    const seen = [];
    for (let i = 0; i < 5; i++) { await p.step('over'); seen.push(await p.line()); }
    p.assert.deepEqual(seen, [6, 7, 6, 7, 6]);
    p.assert.equal(await p.cval('sum'), 1);
  });
  t.test('the Over toolbar button steps over', async (p) => {
    await p.debugProgram(BASIC);
    await p.click('#tbOver'); await p.settle();
    p.assert.equal(await p.line(), 10);
  });
  t.test('Debug > Step over in the menu steps over', async (p) => {
    await p.debugProgram(BASIC);
    await p.menu('Debug', 'Step over'); await p.settle();
    p.assert.equal(await p.line(), 10);
  });
  t.test('F10 past the end of main ends the program', async (p) => {
    await p.debugProgram(BASIC);
    for (let i = 0; i < 8 && (await p.state()) === 'paused'; i++) await p.step('over');
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await p.output(), /exited with status 0/);
  });

  // ---- step into --------------------------------------------------------------------------------------
  t.test('F11 steps into a function of the program', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.key('F11'); await p.settle();
    p.assert.equal(await p.fnName(), 'sq');
    p.assert.equal(await p.line(), 4);
    p.assert.equal(await p.cval('n'), 2);
  });
  t.test('F11 on a line without calls is like F10', async (p) => {
    await p.debugProgram(BASIC);
    await p.key('F11'); await p.settle();
    p.assert.equal(await p.line(), 10);
    p.assert.equal(await p.fnName(), 'main');
  });
  t.test('F11 does not go into printf', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 2);
    await p.step('into');
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await p.line(), 12);
    p.assert.match(await p.output(), /b=4/);
  });
  t.test('F11 does not open the C library source', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 2);
    await p.step('into');
    p.assert.equal(await p.activePath(), MAIN);
  });
  t.test('F11 into strlen and strcpy stays in the program', async (p) => {
    await p.debugProgram(src('#include <string.h>', 'int main(void)', '{', '    char s[16];', '    int n;', '    strcpy(s, "hello");', '    n = (int)strlen(s);', '    return n;', '}'));
    await p.step('into');
    p.assert.equal(await p.line(), 7);
    await p.step('into');
    p.assert.equal(await p.line(), 8);
    p.assert.equal(await p.cval('n'), 5);
  });
  t.test('F11 inside a function walks its lines', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.step('into');
    await p.step('into');
    p.assert.equal(await p.line(), 5);
    p.assert.equal(await p.cval('r'), 4);
  });
  t.test('F11 at the end of a function comes back to the caller', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.step('into', 3);
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await p.line(), 10);
  });
  t.test('the Into toolbar button steps into', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.click('#tbInto'); await p.settle();
    p.assert.equal(await p.fnName(), 'sq');
  });
  t.test('Debug > Step into in the menu steps into', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.menu('Debug', 'Step into'); await p.settle();
    p.assert.equal(await p.fnName(), 'sq');
  });

  // ---- step out ----------------------------------------------------------------------------------------
  t.test('Shift+F11 finishes the function and stops in the caller', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.step('into');
    await p.key('F11', { shift: true }); await p.settle();
    p.assert.equal(await p.fnName(), 'main');
    p.assert.equal(await p.line(), 10);
  });
  t.test('step out stops mid-line: b is not assigned yet', async (p) => {
    await p.debugProgram(src('int sq(int n)', '{', '    return n * n;', '}', 'int main(void)', '{', '    int b = 7;', '    b = sq(3) + 1;', '    return b;', '}'));
    await p.step('over');
    await p.step('into');
    await p.step('out');
    p.assert.equal(await p.line(), 8);
    p.assert.equal(await p.cval('b'), 7);
    await p.step('over');
    p.assert.equal(await p.cval('b'), 10);
  });
  t.test('step out: the status says the function returned', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.step('into');
    await p.step('out');
    p.assert.match(await p.status(), /sq\(\) returned; back in main\(\) at line 10/);
  });
  t.test('step out: the memory picture shows what was returned', async (p) => {
    await p.debugProgram(BASIC);
    await p.showRight('memory');
    await p.step('over');
    await p.step('into');
    await p.step('out');
    p.assert.match(await p.memText(), /sq\(\) returned 4/);
  });
  t.test('step out of a void function says it returned nothing', async (p) => {
    await p.debugProgram(src('int g;', 'void set(int v)', '{', '    g = v;', '}', 'int main(void)', '{', '    set(5);', '    return g;', '}'));
    await p.showRight('memory');
    await p.step('into');
    p.assert.equal(await p.fnName(), 'set');
    await p.step('out');
    p.assert.match(await p.memText(), /set\(\) returned nothing \(void\)/);
  });
  t.test('the returned note goes away at the next step', async (p) => {
    await p.debugProgram(BASIC);
    await p.showRight('memory');
    await p.step('over');
    await p.step('into');
    await p.step('out');
    await p.step('over');
    p.assert.doesNotMatch(await p.memText(), /returned/);
  });
  t.test('the Out toolbar button steps out', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.step('into');
    await p.click('#tbOut'); await p.settle();
    p.assert.equal(await p.fnName(), 'main');
  });
  t.test('step out from deep recursion goes up one frame', async (p) => {
    await p.newFile(MAIN, FACT);
    await bp(p, 5);
    await p.ev("SEE.app.startDebug('start')"); await p.waitState('paused');
    await p.cont();
    p.assert.equal(await p.cval('n'), 1);
    await p.step('out');
    p.assert.equal(await p.fnName(), 'fact');
    p.assert.equal(await p.cval('n'), 2);
    p.assert.equal(await p.line(), 6);
  });

  // ---- one statement -------------------------------------------------------------------------------
  t.test('Ctrl+F11 runs one statement of a line with several', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 3);
    p.assert.equal(await p.line(), 12);
    await p.key('F11', { ctrl: true }); await p.settle();
    p.assert.equal(await p.line(), 12);
    p.assert.equal(await p.cval('a'), 1);
    p.assert.equal(await p.cval('b'), 4);
  });
  t.test('Ctrl+F11 three times finishes the three statements', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 3);
    const vals = [];
    for (let i = 0; i < 3; i++) { await p.step('stmt'); vals.push([await p.line(), await p.cval('a'), await p.cval('b')]); }
    p.assert.deepEqual(vals, [[12, 1, 4], [12, 1, 2], [13, 3, 2]]);
  });
  t.test('Debug > One statement in the menu', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 3);
    await p.menu('Debug', 'One statement'); await p.settle();
    p.assert.equal(await p.line(), 12);
    p.assert.equal(await p.cval('a'), 1);
  });

  // ---- continue and breakpoints ------------------------------------------------------------------------
  t.test('F5 while paused continues to the next breakpoint', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 10);
    await p.key('F5'); await p.waitState('paused');
    p.assert.equal(await p.line(), 4);
    await p.key('F5'); await p.waitState('paused');
    p.assert.equal(await p.line(), 10);
    p.assert.equal(await p.cval('sum'), 45);
  });
  t.test('a breakpoint reports itself in the status bar', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 10);
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.match(await p.status(), /Breakpoint at line 10 in main\(\)/);
  });
  t.test('Continue stops at a breakpoint in a loop every time round', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.debugProgram(LOOP);
    const is = [];
    for (let k = 0; k < 4; k++) { await p.cont(); is.push(await p.cval('i')); }
    p.assert.deepEqual(is, [0, 1, 2, 3]);
  });
  t.test('Continue without breakpoints runs to the end', async (p) => {
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await p.output(), /45/);
  });
  t.test('the Continue toolbar button continues', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 10);
    await p.debugProgram(LOOP);
    await p.click('#tbDebug'); await p.waitState('paused');
    p.assert.equal(await p.line(), 10);
  });
  t.test('F9 toggles a breakpoint on the cursor line', async (p) => {
    await p.newFile(MAIN, LOOP);
    await cursorTo(p, 7);
    await p.ev('SEE.app.active.editor.focus()');
    await p.key('F9');
    p.assert.equal(await p.ev(`SEE.app.breakpoints.get(${JSON.stringify(MAIN)}).has(6)`), true);
    await p.key('F9');
    p.assert.equal(await bpCount(p), 0);
  });
  t.test('clicking the gutter adds and removes a breakpoint', async (p) => {
    await p.newFile(MAIN, LOOP);
    await gutterClick(p, 7);
    p.assert.equal(await bpCount(p), 1);
    p.assert.equal(await p.ev(`SEE.app.breakpoints.get(${JSON.stringify(MAIN)}).has(6)`), true);
    await p.wait(`SEE.app.active.editor.inner.children[6].className.includes('bp')`, 2000);
    await gutterClick(p, 7);
    p.assert.equal(await bpCount(p), 0);
  });
  t.test('a breakpoint shows as a mark in the gutter', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.wait(`/\\bbp\\b/.test(SEE.app.active.editor.inner.children[6].className)`, 2000);
    p.assert.match(await lineCls(p, 6), /bpline/);
  });
  t.test('a breakpoint set while paused takes effect', async (p) => {
    await p.debugProgram(LOOP);
    await bp(p, 10);
    await p.cont();
    p.assert.equal(await p.line(), 10);
  });
  t.test('a breakpoint removed while paused no longer stops', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.debugProgram(LOOP);
    await p.cont();
    await bp(p, 7);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
  });
  t.test('a breakpoint on a blank line moves to the next line with code', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 9);
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.state(), 'paused');
    p.assert.equal(await p.line(), 10);
  });
  t.test('a breakpoint on a declaration without code moves to the next line', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 5);
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.line(), 6);
  });
  t.test('a breakpoint on a closing brace of a loop moves on', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 8);
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.state(), 'paused');
    p.assert.ok((await p.line()) >= 8, 'line ' + (await p.line()));
  });
  t.test('a breakpoint on a comment moves to the code under it', async (p) => {
    await p.newFile(MAIN, src('int main(void)', '{', '    int x = 1;', '    /* a comment */', '    x = x + 1;', '    return x;', '}'));
    await bp(p, 4);
    await p.debugProgram(await p.code());
    await p.cont();
    p.assert.equal(await p.line(), 5);
    p.assert.equal(await p.cval('x'), 1);
  });
  t.test('a breakpoint inside a function stops there with its parameters', async (p) => {
    await p.newFile(MAIN, BASIC);
    await bp(p, 4);
    await p.debugProgram(BASIC);
    await p.cont();
    p.assert.equal(await p.fnName(), 'sq');
    p.assert.equal(await p.cval('n'), 2);
  });
  t.test('a conditional breakpoint i == 5 stops when i is 5', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7, { cond: 'i == 5' });
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.line(), 7);
    p.assert.equal(await p.cval('i'), 5);
    p.assert.equal(await p.cval('sum'), 10);
  });
  t.test('a conditional breakpoint stops only once when true once', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7, { cond: 'i == 5' });
    await p.debugProgram(LOOP);
    await p.cont();
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
  });
  for (const [cond, expect] of [['i > 7', [8, 9]], ['i % 3 == 0', [0, 3, 6, 9]], ['sum >= 20', [7, 8, 9]], ['i == 2 || i == 4', [2, 4]]]) {
    t.test('a conditional breakpoint ' + cond + ' stops at i = ' + expect.join(', '), async (p) => {
      await p.newFile(MAIN, LOOP);
      await bp(p, 7, { cond });
      await p.debugProgram(LOOP);
      const got = [];
      for (let k = 0; k < 12; k++) { await p.cont(); if ((await p.state()) !== 'paused') break; got.push(await p.cval('i')); }
      p.assert.deepEqual(got, expect);
    });
  }
  t.test('a condition shows as its own mark in the gutter', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7, { cond: 'i == 5' });
    await p.wait(`/\\bcond\\b/.test(SEE.app.active.editor.inner.children[6].className)`, 2000);
  });
  t.test('Stop only when… from the gutter menu sets a condition', async (p) => {
    await p.newFile(MAIN, LOOP);
    const xy = await p.ev(`(() => { const e = SEE.app.active.editor; const r = e.main.getBoundingClientRect(); const g = e.gutter.getBoundingClientRect(); return [g.left + g.width / 2, r.top + e.padTop + 6.5 * e.lineHeight - e.ta.scrollTop]; })()`);
    await p.clickAt(xy[0], xy[1], { button: 'right' });
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    await p.click('.menu-pop .menu-item', 'Stop only when');
    await p.waitModal();
    await p.modalInput('i == 5');
    await p.modalButton('OK');
    p.assert.equal(await p.ev(`SEE.app.breakpoints.get(${JSON.stringify(MAIN)}).get(6).cond`), 'i == 5');
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.cval('i'), 5);
  });
  t.test('a disabled breakpoint is skipped', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7, { disabled: true });
    await bp(p, 10);
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.line(), 10);
    p.assert.equal(await p.cval('sum'), 45);
  });
  t.test('a disabled breakpoint alone lets the program run to the end', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7, { disabled: true });
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
  });
  t.test('a disabled breakpoint shows as disabled in the gutter', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7, { disabled: true });
    await p.wait(`/\\bdisabled\\b/.test(SEE.app.active.editor.inner.children[6].className)`, 2000);
  });
  t.test('Disable from the gutter menu turns a breakpoint off', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    const xy = await p.ev(`(() => { const e = SEE.app.active.editor; const r = e.main.getBoundingClientRect(); const g = e.gutter.getBoundingClientRect(); return [g.left + g.width / 2, r.top + e.padTop + 6.5 * e.lineHeight - e.ta.scrollTop]; })()`);
    await p.clickAt(xy[0], xy[1], { button: 'right' });
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    await p.click('.menu-pop .menu-item', 'Disable');
    p.assert.equal(await p.ev(`SEE.app.breakpoints.get(${JSON.stringify(MAIN)}).get(6).disabled`), true);
  });
  t.test('breakpoints are kept after a reload', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.reload();
    p.assert.equal(await p.ev(`!!(SEE.app.breakpoints.get(${JSON.stringify(MAIN)}) && SEE.app.breakpoints.get(${JSON.stringify(MAIN)}).has(6))`), true);
  });
  t.test('Remove all breakpoints in the Debug menu clears them', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7); await bp(p, 10);
    await p.menu('Debug', 'Remove all breakpoints');
    p.assert.equal(await bpCount(p), 0);
  });

  // ---- the Breakpoints panel ---------------------------------------------------------------------------
  t.test('the Breakpoints panel is empty without breakpoints', async (p) => {
    await p.showRight('bps');
    p.assert.match(await p.panelText('bps'), /No breakpoints/);
  });
  t.test('the Breakpoints panel lists every breakpoint with file and line', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 10); await bp(p, 7);
    await p.showRight('bps');
    p.assert.equal(await p.count('#panel-bps .bprow'), 2);
    const locs = await p.texts('#panel-bps .bploc');
    p.assert.match(locs[0], /main\.c:7/);
    p.assert.match(locs[0], /sum \+= i/);
    p.assert.match(locs[1], /main\.c:10/);
    p.assert.match(await p.panelText('bps'), /2 breakpoints/);
  });
  t.test('the Breakpoints panel updates when one is added', async (p) => {
    await p.newFile(MAIN, LOOP);
    await p.showRight('bps');
    await bp(p, 7);
    p.assert.equal(await p.count('#panel-bps .bprow'), 1);
    p.assert.match(await p.panelText('bps'), /1 breakpoint\b/);
  });
  t.test('the condition field of the Breakpoints panel sets a condition', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.showRight('bps');
    await p.click('#panel-bps .bprow input[type=text]');
    await p.insertText('i == 5');
    await p.ev(`document.querySelector('#panel-bps .bprow input[type=text]').dispatchEvent(new Event('change'))`);
    p.assert.equal(await p.ev(`SEE.app.breakpoints.get(${JSON.stringify(MAIN)}).get(6).cond`), 'i == 5');
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.cval('i'), 5);
  });
  t.test('the condition field shows an existing condition', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7, { cond: 'i > 3' });
    await p.showRight('bps');
    p.assert.equal(await p.ev("document.querySelector('#panel-bps .bprow input[type=text]').value"), 'i > 3');
  });
  t.test('the enable checkbox of the Breakpoints panel turns a breakpoint off and on', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.showRight('bps');
    await p.click('#panel-bps .bprow input[type=checkbox]');
    p.assert.equal(await p.ev(`SEE.app.breakpoints.get(${JSON.stringify(MAIN)}).get(6).disabled`), true);
    p.assert.equal(await p.ev("document.querySelector('#panel-bps .bprow input[type=checkbox]').checked"), false);
    await p.click('#panel-bps .bprow input[type=checkbox]');
    p.assert.equal(await p.ev(`SEE.app.breakpoints.get(${JSON.stringify(MAIN)}).get(6).disabled`), false);
  });
  t.test('a breakpoint unchecked in the panel is skipped when running', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.showRight('bps');
    await p.click('#panel-bps .bprow input[type=checkbox]');
    await p.debugProgram(LOOP);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
  });
  t.test('the remove button of the Breakpoints panel removes one', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7); await bp(p, 10);
    await p.showRight('bps');
    await p.click('#panel-bps .bprow button[aria-label="Remove breakpoint"]');
    p.assert.equal(await bpCount(p), 1);
    p.assert.equal(await p.count('#panel-bps .bprow'), 1);
    p.assert.match(await p.text('#panel-bps .bploc'), /main\.c:10/);
  });
  t.test('Remove all in the Breakpoints panel clears the list', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7); await bp(p, 10); await bp(p, 4);
    await p.showRight('bps');
    await p.click('#panel-bps button.btn', 'Remove all');
    p.assert.equal(await bpCount(p), 0);
    p.assert.match(await p.panelText('bps'), /No breakpoints/);
  });
  t.test('clicking a breakpoint location goes to its line', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 10);
    await cursorTo(p, 1);
    await p.showRight('bps');
    await p.click('#panel-bps .bploc');
    await p.sleep(50);
    p.assert.equal(await p.ev('SEE.app.active.editor.cursor().line'), 9);
  });

  // ---- run to the cursor ---------------------------------------------------------------------------------
  t.test('Ctrl+F10 while paused runs to the cursor line', async (p) => {
    await p.debugProgram(LOOP);
    await cursorTo(p, 10);
    await p.key('F10', { ctrl: true });
    await p.waitState('paused');
    p.assert.equal(await p.line(), 10);
    p.assert.equal(await p.cval('sum'), 45);
  });
  t.test('Ctrl+F10 when nothing runs starts and stops at the cursor line', async (p) => {
    await p.newFile(MAIN, LOOP);
    await cursorTo(p, 10);
    await p.key('F10', { ctrl: true });
    await p.wait("SEE.app.vm && SEE.app.vm.state === 'paused' && SEE.app.vm.where().line === 10", 8000);
    p.assert.equal(await p.cval('sum'), 45);
  });
  t.test('run to the cursor leaves no breakpoint behind', async (p) => {
    await p.debugProgram(LOOP);
    await cursorTo(p, 7);
    await p.key('F10', { ctrl: true });
    await p.waitState('paused');
    p.assert.equal(await p.line(), 7);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.equal(await bpCount(p), 0);
  });
  t.test('run to the cursor inside a function', async (p) => {
    await p.debugProgram(BASIC);
    await cursorTo(p, 5);
    await p.ev('SEE.app.runToCursor()');
    await p.waitState('paused');
    p.assert.equal(await p.fnName(), 'sq');
    p.assert.equal(await p.line(), 5);
  });
  t.test('Debug > Run to the cursor in the menu', async (p) => {
    await p.debugProgram(LOOP);
    await cursorTo(p, 10);
    await p.menu('Debug', 'Run to the cursor');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 10);
  });
  t.test('Run to this line from the gutter menu', async (p) => {
    await p.debugProgram(LOOP);
    const xy = await p.ev(`(() => { const e = SEE.app.active.editor; const r = e.main.getBoundingClientRect(); const g = e.gutter.getBoundingClientRect(); return [g.left + g.width / 2, r.top + e.padTop + 9.5 * e.lineHeight - e.ta.scrollTop]; })()`);
    await p.clickAt(xy[0], xy[1], { button: 'right' });
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    await p.click('.menu-pop .menu-item', 'Run to this line');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 10);
  });
  t.test('run to the cursor stops at a breakpoint on the way', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.debugProgram(LOOP);
    await cursorTo(p, 10);
    await p.ev('SEE.app.runToCursor()');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 7);
  });

  // ---- pause and stop ------------------------------------------------------------------------------------
  t.test('Pause stops a long loop that runs at full speed', async (p) => {
    await p.runProgram(FOREVER, { wait: false });
    await p.sleep(150);
    p.assert.equal(await p.running(), true);
    await p.click('#tbPause');
    await p.waitState('paused');
    p.assert.ok([5, 6].includes(await p.line()));
    p.assert.ok((await p.cval('n')) > 0);
  });
  t.test('Pause shows where it stopped in the status bar', async (p) => {
    await p.runProgram(FOREVER, { wait: false });
    await p.sleep(100);
    await p.ev('SEE.app.pause()');
    await p.waitState('paused');
    p.assert.match(await p.status(), /Paused at line [56] in main\(\)/);
    p.assert.equal(await p.chip(), 'Paused');
  });
  t.test('Pause during a debugged run stops it', async (p) => {
    await p.debugProgram(FOREVER);
    await p.ev('SEE.app.debugOrContinue()');
    await p.sleep(120);
    p.assert.equal(await p.running(), true);
    await p.menu('Debug', 'Pause');
    await p.waitState('paused');
    p.assert.equal(await p.state(), 'paused');
  });
  t.test('after Pause, stepping works', async (p) => {
    await p.runProgram(FOREVER, { wait: false });
    await p.sleep(100);
    await p.ev('SEE.app.pause()');
    await p.waitState('paused');
    const n = await p.cval('n');
    await p.step('over'); await p.step('over');
    p.assert.ok((await p.cval('n')) >= n);
    p.assert.equal(await p.state(), 'paused');
  });
  t.test('after Pause, Continue runs on', async (p) => {
    await p.runProgram(FOREVER, { wait: false });
    await p.sleep(80);
    await p.ev('SEE.app.pause()');
    await p.waitState('paused');
    await p.ev('SEE.app.debugOrContinue()');
    await p.sleep(80);
    p.assert.equal(await p.running(), true);
  });
  t.test('Stop ends a running program', async (p) => {
    await p.runProgram(FOREVER, { wait: false });
    await p.sleep(80);
    await p.click('#tbStop');
    p.assert.equal(await p.state(), 'none');
    p.assert.equal(await p.running(), false);
    p.assert.match(await p.output(), /Stopped\./);
  });
  t.test('Shift+F5 stops a paused program', async (p) => {
    await p.debugProgram(BASIC);
    await p.key('F5', { shift: true });
    p.assert.equal(await p.state(), 'none');
    p.assert.equal(await p.chip(), 'Stopped');
    p.assert.equal(await p.status(), 'Program stopped.');
  });
  t.test('Stop clears the exec line mark', async (p) => {
    await p.debugProgram(BASIC);
    await p.stopProgram();
    p.assert.equal(await execMark(p), null);
  });
  t.test('Stop empties the Variables panel', async (p) => {
    await p.debugProgram(BASIC);
    await p.showRight('vars');
    await p.stopProgram();
    p.assert.match(await p.panelText('vars'), /Variables show here while the program is paused/);
  });
  t.test('Stop while waiting for input ends the program', async (p) => {
    await p.debugProgram(INPUT);
    await p.cont();
    p.assert.equal(await p.state(), 'input');
    await p.click('#tbStop');
    p.assert.equal(await p.state(), 'none');
    p.assert.equal(await p.ev("document.querySelector('.term').classList.contains('waiting')"), false);
  });

  // ---- animate ---------------------------------------------------------------------------------------
  t.test('Animate steps by itself', async (p) => {
    await p.newFile(MAIN, LOOP);
    await p.ev("SEE.app.settings.speed = 6; document.getElementById('tbSpeed').value = '6'");
    await p.debugProgram(LOOP);
    await p.click('#tbAnim');
    await p.wait("SEE.app.vm && SEE.app.vm.state === 'paused' && SEE.Debug.evaluate(SEE.app.vm, 0, 'i').value >= 2", 8000);
    p.assert.ok(await p.ev('SEE.app.animating'));
    await p.click('#tbAnim');
  });
  t.test('Animate from not running starts the program and steps', async (p) => {
    await p.newFile(MAIN, LOOP);
    await p.ev("SEE.app.settings.speed = 6");
    await p.click('#tbAnim');
    await p.wait("SEE.app.vm && SEE.app.vm.state === 'paused' && SEE.app.vm.where().line >= 7", 8000);
    await p.click('#tbAnim');
  });
  t.test('Animate from not running starts the program paused at main', async (p) => {
    await p.newFile(MAIN, LOOP);
    await p.click('#tbAnim');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 4);
  });
  t.test('Animate runs a short program to its end', async (p) => {
    await p.debugProgram(src('int main(void)', '{', '    int x = 1;', '    x++;', '    return x;', '}'));
    await p.ev("SEE.app.settings.speed = 6");
    await p.ev('SEE.app.toggleAnimate()');
    await p.wait("SEE.app.vm && SEE.app.vm.state === 'exited'", 8000);
    p.assert.equal(await p.ev('SEE.app.animating'), false);
  });
  t.test('the Animate button looks pressed while animating', async (p) => {
    await p.debugProgram(FOREVER);
    await p.click('#tbAnim');
    p.assert.ok(await p.ev("document.getElementById('tbAnim').classList.contains('on')"));
    await p.click('#tbAnim');
    p.assert.equal(await p.ev("document.getElementById('tbAnim').classList.contains('on')"), false);
  });
  t.test('stopping the animation leaves the program paused', async (p) => {
    await p.debugProgram(LOOP);
    await p.ev("SEE.app.settings.speed = 6");
    await p.click('#tbAnim');
    await p.wait('SEE.app.vm.steps > 4', 5000);
    await p.click('#tbAnim');
    await p.settle();
    const line = await p.line();
    await p.sleep(150);
    p.assert.equal(await p.state(), 'paused');
    p.assert.equal(await p.line(), line);
  });
  t.test('the speed slider sets the animation speed', async (p) => {
    await p.ev("(() => { const s = document.getElementById('tbSpeed'); s.value = '5'; s.dispatchEvent(new Event('input')); })()");
    p.assert.equal(await p.ev('SEE.app.settings.speed'), 5);
    await p.ev("(() => { const s = document.getElementById('tbSpeed'); s.value = '0'; s.dispatchEvent(new Event('input')); })()");
    p.assert.equal(await p.ev('SEE.app.settings.speed'), 0);
    p.assert.equal(await p.ev("JSON.parse(localStorage.getItem('see.settings')).speed"), 0);
  });
  t.test('a slow speed steps slower than a fast one', async (p) => {
    await p.debugProgram(FOREVER);
    await p.ev("SEE.app.settings.speed = 6");
    await p.ev('SEE.app.toggleAnimate()');
    await p.sleep(400);
    await p.ev('SEE.app.toggleAnimate()');
    await p.settle();
    const fast = await p.ev('SEE.app.vm.steps');
    await p.debugProgram(FOREVER);
    await p.ev("SEE.app.settings.speed = 0");
    await p.ev('SEE.app.toggleAnimate()');
    await p.sleep(400);
    await p.ev('SEE.app.toggleAnimate()');
    await p.settle();
    const slow = await p.ev('SEE.app.vm.steps');
    p.assert.ok(fast > slow, `fast ${fast} slow ${slow}`);
  });
  t.test('the speed slider has one stop per speed', async (p) => {
    p.assert.equal(await p.attr('#tbSpeed', 'min'), '0');
    p.assert.equal(await p.attr('#tbSpeed', 'max'), '6');
  });
  t.test('Animate keeps stepping through a line with a breakpoint', async (p) => {
    await p.newFile(MAIN, LOOP);
    await bp(p, 7);
    await p.ev("SEE.app.settings.speed = 6");
    await p.debugProgram(LOOP);
    await p.ev('SEE.app.toggleAnimate()');
    await p.wait("SEE.app.vm && SEE.app.vm.state === 'paused' && SEE.Debug.evaluate(SEE.app.vm, 0, 'i').value >= 2", 8000);
    await p.ev('SEE.app.toggleAnimate()');
  });

  // ---- the toolbar in each state -------------------------------------------------------------------------
  const STATES = {
    'not running': async (p) => { await p.newFile(MAIN, LOOP); },
    running: async (p) => { await p.runProgram(FOREVER, { wait: false }); await p.sleep(80); },
    paused: async (p) => { await p.debugProgram(LOOP); await p.step('over'); },
    'waiting for input': async (p) => { await p.debugProgram(INPUT); await p.cont(); },
    ended: async (p) => { await p.debugProgram(LOOP); await p.cont(); },
  };
  const ENABLED = {
    tbBuild: [1, 0, 1, 1, 1],
    tbRun: [1, 0, 1, 1, 1],
    tbDebug: [1, 0, 1, 1, 1],
    tbPause: [0, 1, 0, 0, 0],
    tbOver: [1, 0, 1, 1, 1],
    tbInto: [1, 0, 1, 1, 1],
    tbOut: [0, 0, 1, 0, 0],
    tbBack: [0, 0, 1, 1, 1],
    tbStop: [0, 1, 1, 1, 0],
  };
  const CHIP = { 'not running': /^(Ready|Stopped)$/, running: /^Running$/, paused: /^Paused$/, 'waiting for input': /^Waiting for input$/, ended: /^Exited \(0\)$/ };
  Object.keys(STATES).forEach((name, si) => {
    t.test('toolbar buttons when ' + name, async (p) => {
      await STATES[name](p);
      const got = {}, want = {};
      for (const [id, en] of Object.entries(ENABLED)) { got[id] = !(await disabled(p, id)); want[id] = !!en[si]; }
      p.assert.deepEqual(got, want);
      await p.stopProgram();
    });
    t.test('state chip when ' + name, async (p) => {
      await STATES[name](p);
      p.assert.match(await p.chip(), CHIP[name]);
      p.assert.equal(await p.ev("document.getElementById('stState').textContent"), await p.chip());
      await p.stopProgram();
    });
    t.test('Debug button label when ' + name, async (p) => {
      await STATES[name](p);
      p.assert.equal(await p.text('#tbDebug .lbl'), name === 'paused' ? 'Continue' : 'Debug');
      await p.stopProgram();
    });
    t.test('Debug menu enabled items when ' + name, async (p) => {
      await STATES[name](p);
      await p.menu('Debug');
      const items = await p.menuItems();
      await p.closeMenus();
      const dis = (label) => items.find((x) => x.label.startsWith(label)).disabled;
      p.assert.equal(dis('Pause'), name !== 'running');
      if (name !== 'waiting for input') p.assert.equal(dis('Step out'), name !== 'paused');
      p.assert.equal(dis('Stop'), name === 'not running');
      if (name !== 'waiting for input') p.assert.equal(items[0].label, name === 'paused' ? 'Continue' : 'Debug');
      await p.stopProgram();
    });
  });
  t.test('Debug > Step out is off while the program waits for input', async (p) => {
    await STATES['waiting for input'](p);
    await p.menu('Debug');
    const items = await p.menuItems();
    await p.closeMenus();
    p.assert.equal(items.find((x) => x.label === 'Step out').disabled, true);
    p.assert.equal(items[0].label, 'Debug');
  });
  t.test('F10 on a loop whose body is one line stops at the next time round', async (p) => {
    await p.debugProgram(src('int main(void)', '{', '    unsigned n = 0;', '    for (;;) {', '        n++;', '    }', '    return 0;', '}'));
    await p.step('over');
    if (await p.line() === 4) await p.step('over');
    p.assert.equal(await p.line(), 5);
    await p.ev("SEE.app.step('over')");
    await p.settle(3000);
    p.assert.equal(await p.line(), 5);
    p.assert.equal(await p.cval('n'), 1);
  });
  t.test('F10 works while the terminal input has the focus', async (p) => {
    await p.debugProgram(INPUT);
    await p.step('over');
    await p.ev("SEE.app.step('over')");
    await p.waitState('input');
    await p.ev("document.getElementById('termInput').focus()");
    await p.type('4\n');
    await p.settle();
    p.assert.equal(await p.line(), 6);
    await p.key('F10');
    await p.settle();
    p.assert.equal(await p.line(), 7);
  });
  t.test('the Back button is off after a plain Run ends', async (p) => {
    await p.runProgram(LOOP);
    p.assert.equal(await disabled(p, 'tbBack'), true);
    p.assert.equal(await disabled(p, 'tbStop'), true);
  });
  t.test('the chip says Stepping while a step is under way', async (p) => {
    await p.debugProgram(FOREVER);
    await p.ev("SEE.app.resume('out')");
    await p.sleep(60);
    p.assert.equal(await p.chip(), 'Stepping');
    await p.stopProgram();
  });
  t.test('the chip names the crash after a fault', async (p) => {
    await p.debugProgram(src('int main(void)', '{', '    int *q = 0;', '    *q = 1;', '    return 0;', '}'));
    await p.cont();
    p.assert.equal(await p.chip(), 'Segmentation fault');
    p.assert.match(await p.ev("document.getElementById('stateChip').className"), /fault/);
  });
  t.test('the chip turns paused-coloured when paused', async (p) => {
    await p.debugProgram(LOOP);
    p.assert.match(await p.ev("document.getElementById('stateChip').className"), /paused/);
  });
  t.test('the chip says the exit status of a failing program', async (p) => {
    await p.debugProgram(src('int main(void)', '{', '    return 3;', '}'));
    await p.cont();
    p.assert.equal(await p.chip(), 'Exited (3)');
  });

  // ---- the exec line and frame marks ----------------------------------------------------------------------
  t.test('the exec line mark is on the paused line', async (p) => {
    await p.debugProgram(BASIC);
    p.assert.equal(await execMark(p), 8);
    await p.wait(`/\\bexec\\b/.test(SEE.app.active.editor.inner.children[8].className)`, 2000);
    p.assert.match(await lineCls(p, 8), /\bexec\b/);
  });
  t.test('the exec line mark follows each step', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    p.assert.equal(await execMark(p), 9);
    await p.wait(`/\\bexec\\b/.test(SEE.app.active.editor.hl.children[9].className)`, 2000);
    p.assert.doesNotMatch(await lineCls(p, 8), /\bexec\b/);
  });
  t.test('only one line carries the exec mark', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over', 2);
    await p.sleep(60);
    p.assert.equal(await p.ev("SEE.app.active.editor.hl.querySelectorAll('.exec').length"), 1);
    p.assert.equal(await p.ev("SEE.app.active.editor.inner.querySelectorAll('.exec').length"), 1);
  });
  t.test('the exec line mark moves into a function stepped into', async (p) => {
    await p.debugProgram(BASIC);
    await p.step('over');
    await p.step('into');
    p.assert.equal(await execMark(p), 3);
  });
  t.test('the exec line mark goes when the program ends', async (p) => {
    await p.debugProgram(BASIC);
    await p.cont();
    p.assert.equal(await execMark(p), null);
  });
  t.test('the exec line mark goes while running', async (p) => {
    await p.debugProgram(FOREVER);
    await p.ev('SEE.app.debugOrContinue()');
    await p.sleep(60);
    p.assert.equal(await execMark(p), null);
    await p.stopProgram();
  });
  t.test('a crash marks the crashing line as an error', async (p) => {
    await p.debugProgram(src('int main(void)', '{', '    int *q = 0;', '    *q = 1;', '    return 0;', '}'));
    await p.cont();
    p.assert.equal(await p.ev('SEE.app.active.editor.marks.err'), 3);
    await p.wait(`/\\berr\\b/.test(SEE.app.active.editor.inner.children[3].className)`, 2000);
  });

  // ---- recursion and the call stack --------------------------------------------------------------------
  async function inFact(p) {
    await p.newFile(MAIN, FACT);
    await bp(p, 5);
    await p.ev("SEE.app.startDebug('start')"); await p.waitState('paused');
    await p.cont();
    p.assert.equal(await p.line(), 5);
  }
  t.test('recursion: several frames of the same function', async (p) => {
    await inFact(p);
    const names = await p.ev("SEE.Debug.frames(SEE.app.vm).filter(f => !f.system).map(f => f.name)");
    p.assert.deepEqual(names, ['fact', 'fact', 'fact', 'fact', 'fact', 'main']);
  });
  t.test('recursion: each frame has its own n', async (p) => {
    await inFact(p);
    const ns = [];
    for (let i = 0; i < 5; i++) ns.push(await p.cval('n', i));
    p.assert.deepEqual(ns, [1, 2, 3, 4, 5]);
  });
  t.test('recursion: the Variables call stack lists every frame', async (p) => {
    await inFact(p);
    await p.showRight('vars');
    const rows = await p.texts('#panel-vars .fr');
    p.assert.equal(rows.length, 6);
    p.assert.match(rows[0], /fact\(\)/);
    p.assert.match(rows[0], /main\.c:5/);
    p.assert.match(rows[1], /main\.c:6/);
    p.assert.match(rows[5], /main\(\)/);
    p.assert.match(rows[5], /main\.c:10/);
    p.assert.match(await p.panelText('vars'), /7 frames/i);
  });
  t.test('recursion: the newest frame is selected in the call stack', async (p) => {
    await inFact(p);
    await p.showRight('vars');
    p.assert.equal(await p.ev("[...document.querySelectorAll('#panel-vars .fr')].findIndex(x => x.classList.contains('sel'))"), 0);
  });
  for (const i of [1, 2, 4]) {
    t.test('recursion: selecting frame ' + i + ' shows its n = ' + (i + 1), async (p) => {
      await inFact(p);
      await p.showRight('vars');
      await clickEl(p, `document.querySelectorAll('#panel-vars .fr')[${i}]`);
      p.assert.equal(await p.ev('SEE.app.frameIndex'), i);
      const row = await p.ev("[...document.querySelectorAll('#panel-vars .vrow')].find(r => r.querySelector('.vn').textContent.replace(/^[▸▾]/, '') === 'n').querySelector('.vv').textContent");
      p.assert.equal(row, String(i + 1));
      p.assert.match(await p.panelText('vars'), /Parameters of fact\(\)/i);
    });
  }
  t.test('recursion: selecting an older frame moves the frame mark to its call line', async (p) => {
    await inFact(p);
    await p.showRight('vars');
    await clickEl(p, "document.querySelectorAll('#panel-vars .fr')[2]");
    p.assert.equal(await frameMark(p), 5);
    p.assert.equal(await execMark(p), null);
    await p.wait(`/\\bframe\\b/.test(SEE.app.active.editor.inner.children[5].className)`, 2000);
  });
  t.test('recursion: selecting main marks the line that called fact', async (p) => {
    await inFact(p);
    await p.showRight('vars');
    await clickEl(p, "document.querySelectorAll('#panel-vars .fr')[5]");
    p.assert.equal(await frameMark(p), 9);
    p.assert.match(await p.panelText('vars'), /Locals of main\(\)/i);
  });
  t.test('recursion: selecting the newest frame again brings the exec mark back', async (p) => {
    await inFact(p);
    await p.showRight('vars');
    await clickEl(p, "document.querySelectorAll('#panel-vars .fr')[3]");
    await clickEl(p, "document.querySelectorAll('#panel-vars .fr')[0]");
    p.assert.equal(await execMark(p), 4);
    p.assert.equal(await frameMark(p), null);
  });
  t.test('recursion: a frame can be selected with the keyboard', async (p) => {
    await inFact(p);
    await p.showRight('vars');
    await p.ev("document.querySelectorAll('#panel-vars .fr')[1].focus()");
    await p.key('Enter');
    p.assert.equal(await p.ev('SEE.app.frameIndex'), 1);
  });
  t.test('recursion: clicking a frame in the memory picture selects it', async (p) => {
    await inFact(p);
    await p.showRight('memory');
    await clickEl(p, "[...document.querySelectorAll('#panel-memory .frame')].find(f => !f.classList.contains('top')).querySelector('.frame-head')");
    p.assert.ok((await p.ev('SEE.app.frameIndex')) > 0);
    p.assert.notEqual(await frameMark(p), null);
  });
  t.test('recursion: the memory picture draws one box per frame', async (p) => {
    await inFact(p);
    await p.showRight('memory');
    p.assert.equal(await p.count('#panel-memory .frame'), 6);
    p.assert.equal(await p.ev("[...document.querySelectorAll('#panel-memory .fname')].filter(x => x.textContent === 'fact()').length"), 5);
  });
  t.test('recursion: stepping resets the selected frame to the newest', async (p) => {
    await inFact(p);
    await p.ev('SEE.app.selectFrame(3)');
    await p.step('over');
    p.assert.equal(await p.ev('SEE.app.frameIndex'), 0);
  });
  t.test('recursion: the result comes out right after continuing', async (p) => {
    await inFact(p);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await p.output(), /^120$/m);
  });
  t.test('deep recursion under the debugger ends in a stack overflow', async (p) => {
    await p.debugProgram(src('int f(int n)', '{', '    return f(n + 1) + 1;', '}', 'int main(void)', '{', '    return f(0);', '}'));
    await p.cont();
    p.assert.equal(await p.state(), 'faulted');
    p.assert.equal(await p.chip(), 'Stack overflow');
    p.assert.match(await p.output(), /Stack overflow: stack overflow: \d+ calls deep/);
  }, { timeout: 40000 });
  t.test('a stack overflow keeps the many frames in the call stack', async (p) => {
    await p.debugProgram(src('int f(int n)', '{', '    return f(n + 1) + 1;', '}', 'int main(void)', '{', '    return f(0);', '}'));
    await p.cont();
    await p.showRight('vars');
    p.assert.ok((await p.ev('SEE.Debug.frames(SEE.app.vm).length')) > 1000);
    p.assert.match(await p.panelText('vars'), /more frames/);
  }, { timeout: 40000 });
  t.test('a stack overflow is shown in the memory picture', async (p) => {
    await p.debugProgram(src('int f(int n)', '{', '    return f(n + 1) + 1;', '}', 'int main(void)', '{', '    return f(0);', '}'));
    await p.cont();
    await p.showRight('memory');
    p.assert.match(await p.memText(), /Stack overflow/);
    p.assert.match(await p.memText(), /more frames of f\(\)/);
  }, { timeout: 40000 });

  // ---- several files -------------------------------------------------------------------------------------
  t.test('stepping into a function in another file opens that file', async (p) => {
    await startMulti(p);
    p.assert.equal(await p.line(), 5);
    await p.step('into');
    p.assert.equal(await p.activePath(), MULTI_DIR + '/util.c');
    p.assert.equal(await p.fnName(), 'twice');
    p.assert.equal(await p.line(), 3);
    p.assert.equal(await execMark(p), 2);
  });
  t.test('stepping out of the other file goes back to main.c', async (p) => {
    await startMulti(p);
    await p.step('into');
    await p.step('out');
    p.assert.equal(await p.activePath(), MULTI_DIR + '/main.c');
    p.assert.equal(await p.line(), 5);
  });
  t.test('stepping over a function in another file stays in main.c', async (p) => {
    await startMulti(p);
    await p.step('over');
    p.assert.equal(await p.activePath(), MULTI_DIR + '/main.c');
    p.assert.equal(await p.cval('v'), 42);
  });
  t.test('a breakpoint in the other file stops there', async (p) => {
    await p.newFile(MULTI_DIR + '/util.c', UTIL);
    await bp(p, 4);
    await startMulti(p);
    await p.cont();
    p.assert.equal(await p.activePath(), MULTI_DIR + '/util.c');
    p.assert.equal(await p.line(), 4);
    p.assert.equal(await p.cval('y'), 42);
  });
  t.test('a tab opens for the other file while stepping', async (p) => {
    await p.ev(`(() => { const d = SEE.app.docByPath(${JSON.stringify(MULTI_DIR + '/util.c')}); if (d) { d.dirty = false; SEE.app.closeDoc(d); } })()`);
    await startMulti(p);
    await p.step('into');
    p.assert.ok((await p.texts('#tabs .tab .tname')).includes('util.c'));
  });
  t.test('the call stack names the file of each frame', async (p) => {
    await startMulti(p);
    await p.step('into');
    await p.showRight('vars');
    const rows = await p.texts('#panel-vars .fr');
    p.assert.match(rows[0], /util\.c:3/);
    p.assert.match(rows[1], /main\.c:5/);
  });
  t.test('selecting the main frame from the other file opens main.c with the frame mark', async (p) => {
    await startMulti(p);
    await p.step('into');
    await p.ev('SEE.app.selectFrame(1)');
    p.assert.equal(await p.activePath(), MULTI_DIR + '/main.c');
    p.assert.equal(await frameMark(p), 4);
  });
}
