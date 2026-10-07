// The memory picture (src/ide/memview.js): the empty note, the segments and their address ranges,
// the stack frames, arrays and structs opened up, red and yellow values, const padlocks, the heap
// blocks, the globals and statics, the string literals and the functions list.

// ---- helpers shared by the memory specs ----------------------------------------------------------
const hexn = (s) => parseInt(String(s).replace(/^0x/, ''), 16);

/** Every row of the picture inside a scope: {seg: '.seg.heap'} or {frame: 'main'} or nothing */
function rowsIn(p, scope) {
  return p.fn((scope) => {
    let roots;
    if (scope.frame) roots = [...document.querySelectorAll('#panel-memory .frame')].filter((f) => f.querySelector('.fname').textContent === scope.frame + '()');
    else roots = [...document.querySelectorAll('#panel-memory ' + (scope.seg || '.mem'))];
    const out = [];
    for (const r of roots) {
      for (const c of r.querySelectorAll('.cell')) {
        const q = (s) => c.querySelector(':scope > ' + s);
        const n = q('.n'), v = q('.v'), a = q('.a'), t = q('.t');
        out.push({
          a: a ? a.textContent : '', n: n ? n.textContent.replace(/^[▸▾]/, '') : '', tw: n && n.querySelector('.tw') ? n.querySelector('.tw').textContent : '',
          v: v ? v.textContent : '', t: t ? t.textContent : '', cls: c.className, vcls: v ? v.className : '',
          title: n ? n.title : '', vtitle: v ? v.title : '', d: c.style.getPropertyValue('--d'),
          seg: (c.closest('.seg') || { classList: [] }).classList[1] || '',
        });
      }
    }
    return out;
  }, typeof scope === 'string' ? { seg: scope } : (scope || {}));
}
async function row(p, name, scope) {
  const r = (await rowsIn(p, scope)).find((x) => x.n === name);
  if (!r) throw new Error('no row named ' + name + ' in ' + JSON.stringify(scope || {}));
  return r;
}
async function hasRow(p, name, scope) { return (await rowsIn(p, scope)).some((x) => x.n === name); }
/** Mark one part of a row (by name) so it can be clicked; returns the selector */
async function mark(p, name, part, scope) {
  const ok = await p.fn((name, part, scope) => {
    document.querySelectorAll('[data-e2e]').forEach((e) => e.removeAttribute('data-e2e'));
    let roots;
    if (scope.frame) roots = [...document.querySelectorAll('#panel-memory .frame')].filter((f) => f.querySelector('.fname').textContent === scope.frame + '()');
    else roots = [...document.querySelectorAll('#panel-memory ' + (scope.seg || '.mem'))];
    for (const r of roots) {
      for (const c of r.querySelectorAll('.cell')) {
        const n = c.querySelector(':scope > .n');
        if (n && n.textContent.replace(/^[▸▾]/, '') === name) { const el = part === '.tw' ? n.querySelector('.tw') : c.querySelector(':scope > ' + part); if (!el) return false; el.setAttribute('data-e2e', '1'); return true; }
      }
    }
    return false;
  }, name, part || '.v', typeof scope === 'string' ? { seg: scope } : (scope || {}));
  if (!ok) throw new Error('cannot mark ' + name);
  return '[data-e2e="1"]';
}
async function toLine(p, n, mode = 'over') {
  for (let i = 0; i < 60 && (await p.line()) !== n; i++) {
    await p.step(mode);
    if ((await p.state()) !== 'paused') break;
  }
  p.assert.equal(await p.line(), n, 'reached line ' + n);
}
async function dbg(p, src, line) {
  await p.showRight('memory');
  const st = await p.debugProgram(src);
  p.assert.equal(st, 'paused');
  await p.showRight('memory');
  if (line) await toLine(p, line);
}
async function resetMem(p) {
  await p.ev("(() => { const m = SEE.app.memview; m.opts = { lib: false, arrows: true, addrs: true }; m.saveOpts(); m.open.clear(); m.closed.clear(); SEE.UI.storage.set('memOpen', []); })()");
}
const frameNames = (p) => p.ev("[...document.querySelectorAll('#panel-memory .frame .fname')].map(e => e.textContent)");
const frameClasses = (p) => p.ev("[...document.querySelectorAll('#panel-memory .frame')].map(e => ({ name: e.querySelector('.fname').textContent, sel: e.classList.contains('sel'), top: e.classList.contains('top'), sys: e.classList.contains('sys'), head: e.querySelector('.frame-head').innerText }))");
const segHead = (p, seg) => p.ev(`(() => { const h = document.querySelector('#panel-memory .seg.${seg} > .seg-head'); return h ? { label: h.children[0].textContent, addr: h.querySelector('.addr').textContent } : null; })()`);

// ---- programs ----------------------------------------------------------------------------------------
const MAIN = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
struct pt { int x; int y; };
struct box { struct pt a; struct pt b; char tag[4]; };
int g = 5;
int zero;
const int K = 9;
int add(int a, int b)
{
    static int calls = 0;
    int s = a + b;
    calls++;
    return s;
}
int main(void)
{
    int arr[5] = {1, 2, 3, 4, 5};
    char name[6] = "hello";
    double d[2] = {1.5, 2.5};
    struct pt p = {3, 4};
    struct box bx;
    struct pt ps[3];
    int *ip = &arr[2];
    int *hp = malloc(5 * sizeof(int));
    char *s = malloc(8);
    const char *lit = "literal";
    int u;
    strcpy(s, "abc");
    u = add(1, 2);
    free(hp);
    printf("%d %d\\n", u, g);
    return 0;
}
`;
const CALL3 = `#include <stdio.h>
int g2(int z)
{
    int w = z * 2;
    return w;
}
int f1(int y)
{
    int v = g2(y + 1);
    return v;
}
int main(void)
{
    int r = f1(3);
    printf("%d\\n", r);
    return 0;
}
`;
const STEPS = `#include <stdio.h>
int main(void)
{
    int x = 1;
    int y = 10;
    const int c = 3;
    x = x + 1;
    y = y + 0;
    x = x + c;
    printf("%d %d\\n", x, y);
    return 0;
}
`;
const arrProg = (decl, init) => `#include <stdio.h>
struct pt { int x; int y; };
int main(void)
{
    ${decl} = ${init};
    printf("done\\n");
    return 0;
}
`;

export default function (t) {
  t.beforeEach(async (p) => {
    if (await p.ev('!!SEE.app.vm')) await p.stopProgram();
    await p.closeModals();
    await resetMem(p);
    await p.showRight('memory');
  });

  // ---- before running ---------------------------------------------------------------------------------
  t.test('before running, the memory panel shows the empty-state note', async (p) => {
    p.assert.ok(await p.exists('#panel-memory .mem-note'));
    p.assert.match(await p.memText(), /The memory picture appears here while a program runs under the debugger/);
  });
  t.test('the empty-state note explains F5, F10 and F11', async (p) => {
    const tx = await p.memText();
    p.assert.match(tx, /\(F5\)/);
    p.assert.match(tx, /F10 \(over\)/);
    p.assert.match(tx, /F11 \(into\)/);
  });
  t.test('the empty-state note says values can be clicked and ▸ opens arrays and structs', async (p) => {
    p.assert.match(await p.memText(), /Click any value to change it\. Click ▸ to open up an array or a struct\./);
  });
  t.test('the empty-state note has no toolbar, segments or arrows', async (p) => {
    p.assert.equal(await p.count('#panel-memory .mem-bar'), 0);
    p.assert.equal(await p.count('#panel-memory .seg'), 0);
    p.assert.equal(await p.count('#panel-memory svg'), 0);
  });
  t.test('a plain Run (not the debugger) that ended leaves the picture of the ended program, not the note', async (p) => {
    const st = await p.runProgram('#include <stdio.h>\nint main(void) { printf("x\\n"); return 0; }\n');
    p.assert.equal(st, 'exited');
    await p.showRight('memory');
    p.assert.ok(await p.exists('#panel-memory .mem'));
    p.assert.match(await p.text('#panel-memory .ret-box'), /exit status 0/);
  });
  t.test('stopping the program brings the empty-state note back', async (p) => {
    await dbg(p, STEPS);
    p.assert.ok(await p.exists('#panel-memory .mem'));
    await p.stopProgram();
    p.assert.ok(await p.exists('#panel-memory .mem-note'));
    p.assert.equal(await p.count('#panel-memory .seg'), 0);
  });
  t.test('View > Memory picture brings the memory tab to the front', async (p) => {
    await p.showRight('vars');
    p.assert.ok(!(await p.visible('#panel-memory')));
    await p.menu('View', 'Memory picture');
    p.assert.ok(await p.visible('#panel-memory'));
    p.assert.equal(await p.ev('SEE.app.rightTab'), 'memory');
  });
  t.test('starting the debugger replaces the note with the picture', async (p) => {
    await dbg(p, STEPS);
    p.assert.ok(!(await p.exists('#panel-memory .mem-note')));
    p.assert.equal(await p.count('#panel-memory .mem-bar'), 1);
    p.assert.equal(await p.count('#panel-memory .seg'), 5);
    await p.stopProgram();
  });

  // ---- segments ---------------------------------------------------------------------------------------
  for (const [seg, label] of [['stack', 'Stack ↓'], ['heap', 'Heap ↑ (malloc)'], ['data', 'Globals and statics (.data, .bss)'], ['ro', 'Read-only data (.rodata)'], ['text', 'Code (.text)']]) {
    t.test(`the ${seg} segment is drawn with the heading "${label}"`, async (p) => {
      await dbg(p, MAIN);
      const h = await segHead(p, seg);
      p.assert.ok(h, seg + ' present');
      p.assert.equal(h.label, label);
      p.assert.match(h.addr, /^0x[0-9a-f]{8}/);
      await p.stopProgram();
    });
  }
  t.test('the stack heading shows the top of the stack, 0xc0000000', async (p) => {
    await dbg(p, MAIN);
    p.assert.equal((await segHead(p, 'stack')).addr, '0xc0000000');
    p.assert.equal(await p.ev('SEE.MEM.STACK_TOP'), 0xc0000000);
    await p.stopProgram();
  });
  t.test('the heap heading shows the range from the heap start to the break', async (p) => {
    await dbg(p, MAIN, 30);
    const h = await segHead(p, 'heap');
    const [lo, hi] = h.addr.split(' – ').map(hexn);
    p.assert.equal(lo, await p.ev('SEE.app.vm.mem.heapLo'));
    p.assert.equal(hi, await p.ev('SEE.app.vm.mem.brk'));
    p.assert.ok(hi > lo);
    await p.stopProgram();
  });
  t.test('the globals heading spans .data to the end of .bss', async (p) => {
    await dbg(p, MAIN);
    const [lo, hi] = (await segHead(p, 'data')).addr.split(' – ').map(hexn);
    p.assert.equal(lo, await p.ev('SEE.app.vm.prog.segments[2].lo'));
    p.assert.equal(hi, await p.ev('SEE.app.vm.prog.segments[3].hi'));
    await p.stopProgram();
  });
  t.test('the read-only data heading shows the start of .rodata', async (p) => {
    await dbg(p, MAIN);
    p.assert.equal(hexn((await segHead(p, 'ro')).addr), await p.ev('SEE.app.vm.prog.segments[1].lo'));
    await p.stopProgram();
  });
  t.test('the code heading shows the start of .text', async (p) => {
    await dbg(p, MAIN);
    p.assert.equal(hexn((await segHead(p, 'text')).addr), await p.ev('SEE.app.vm.prog.segments[0].lo'));
    await p.stopProgram();
  });
  t.test('the segments lie in memory order: code, read-only data, globals, heap, stack', async (p) => {
    await dbg(p, MAIN, 30);
    const a = [];
    for (const s of ['text', 'ro', 'data', 'heap']) a.push(hexn((await segHead(p, s)).addr.split(' – ')[0]));
    a.push(hexn((await segHead(p, 'stack')).addr));
    for (let i = 1; i < a.length; i++) p.assert.ok(a[i] > a[i - 1], 'segment ' + i + ' above the one before');
    await p.stopProgram();
  });
  t.test('the stack is in the left column and the other segments are in the right column, heap first', async (p) => {
    await dbg(p, MAIN);
    const cols = await p.ev("[...document.querySelectorAll('#panel-memory .mem-col')].map(c => [...c.children].map(s => s.classList[1]))");
    p.assert.deepEqual(cols, [['stack'], ['heap', 'data', 'ro', 'text']]);
    await p.stopProgram();
  });
  t.test('the legend names every segment colour, red for not set and the padlock for const', async (p) => {
    await dbg(p, MAIN);
    const lg = await p.texts('#panel-memory .legend span');
    p.assert.deepEqual(lg, ['stack', 'heap', 'data and bss', 'read-only data', 'code', 'red: not set yet', '🔒 const']);
    await p.stopProgram();
  });
  t.test('each segment has its own background colour', async (p) => {
    await dbg(p, MAIN);
    const bg = await p.ev("['stack','heap','data','ro','text'].map(s => getComputedStyle(document.querySelector('#panel-memory .seg.' + s)).backgroundColor)");
    p.assert.equal(new Set(bg).size, 5);
    await p.stopProgram();
  });
  t.test('the stack pointer line shows SP, the bytes in use and what is left', async (p) => {
    await dbg(p, MAIN);
    const sp = await p.ev('SEE.app.vm.SP');
    const tx = await p.ev("[...document.querySelectorAll('#panel-memory .seg.stack > .gap')].pop().textContent");
    p.assert.ok(tx.includes('stack pointer 0x' + sp.toString(16).padStart(8, '0')), tx);
    p.assert.ok(tx.includes((0xc0000000 - sp).toLocaleString() + ' bytes in use'), tx);
    p.assert.match(tx, /\d+ KB left$/);
    await p.stopProgram();
  });
  t.test('the stack pointer line has a tooltip about the stack limit', async (p) => {
    await dbg(p, MAIN);
    const title = await p.ev("[...document.querySelectorAll('#panel-memory .seg.stack > .gap')].pop().title");
    p.assert.match(title, /The stack may grow down to 0x[0-9a-f]+; past that is a stack overflow/);
    await p.stopProgram();
  });
  t.test('before any malloc the heap says "nothing allocated yet"', async (p) => {
    await dbg(p, MAIN);
    p.assert.match(await p.text('#panel-memory .seg.heap'), /nothing allocated yet/);
    p.assert.equal(await p.count('#panel-memory .blk'), 0);
    await p.stopProgram();
  });
  t.test('the heap range grows after a malloc', async (p) => {
    await dbg(p, MAIN, 25);
    const before = (await segHead(p, 'heap')).addr.split(' – ').map(hexn);
    await p.step('over');
    const after = (await segHead(p, 'heap')).addr.split(' – ').map(hexn);
    p.assert.equal(after[0], before[0]);
    p.assert.ok(after[1] > before[1]);
    await p.stopProgram();
  });

  // ---- stack frames -----------------------------------------------------------------------------------
  t.test('at the start there is one frame box, for main', async (p) => {
    await dbg(p, MAIN);
    p.assert.deepEqual(await frameNames(p), ['main()']);
    await p.stopProgram();
  });
  t.test('stepping into a call adds a frame below the caller: outermost at the top', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    p.assert.equal(await p.fnName(), 'add');
    p.assert.deepEqual(await frameNames(p), ['main()', 'add()']);
    await p.stopProgram();
  });
  t.test('three nested calls give three frames in call order', async (p) => {
    await dbg(p, CALL3, 14);
    await p.step('into');
    await toLine(p, 9);
    await p.step('into');
    p.assert.equal(await p.fnName(), 'g2');
    p.assert.deepEqual(await frameNames(p), ['main()', 'f1()', 'g2()']);
    await p.stopProgram();
  });
  t.test('only the innermost frame is marked as the top frame', async (p) => {
    await dbg(p, CALL3, 14);
    await p.step('into'); await toLine(p, 9); await p.step('into');
    const fc = await frameClasses(p);
    p.assert.deepEqual(fc.map((f) => f.top), [false, false, true]);
    await p.stopProgram();
  });
  t.test('the selected frame is outlined, and it is the top frame after a step', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const fc = await frameClasses(p);
    p.assert.deepEqual(fc.map((f) => f.sel), [false, true]);
    const outline = await p.ev("getComputedStyle(document.querySelector('#panel-memory .frame.sel')).outlineStyle");
    p.assert.equal(outline, 'solid');
    const other = await p.ev("getComputedStyle(document.querySelector('#panel-memory .frame:not(.sel)')).outlineStyle");
    p.assert.equal(other, 'none');
    await p.stopProgram();
  });
  t.test('the top frame head is highlighted differently from the others', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const bgs = await p.ev("[...document.querySelectorAll('#panel-memory .frame > .frame-head')].map(e => getComputedStyle(e).backgroundColor)");
    p.assert.equal(bgs.length, 2);
    p.assert.notEqual(bgs[0], bgs[1]);
    await p.stopProgram();
  });
  t.test('a frame head shows the function name and its current line', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const fc = await frameClasses(p);
    p.assert.match(fc[1].head, new RegExp('add\\(\\) line ' + (await p.line())));
    p.assert.match(fc[0].head, /main\(\) line 30/);
    await p.stopProgram();
  });
  t.test('a frame head shows its frame pointer', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const fps = await p.ev('SEE.Debug.frames(SEE.app.vm).map(f => f.fp)');
    const fc = await frameClasses(p);
    p.assert.ok(fc[1].head.includes('fp 0x' + fps[0].toString(16).padStart(8, '0')), fc[1].head);
    p.assert.ok(fc[0].head.includes('fp 0x' + fps[1].toString(16).padStart(8, '0')), fc[0].head);
    await p.stopProgram();
  });
  t.test('the frame head tooltip invites a click', async (p) => {
    await dbg(p, MAIN);
    p.assert.equal(await p.attr('#panel-memory .frame-head', 'title'), 'Frame of main(): click to look at it');
    await p.stopProgram();
  });
  t.test('every frame has a "return to" row and a "saved fp" row', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    for (const f of ['main', 'add']) {
      const rs = await rowsIn(p, { frame: f });
      p.assert.equal(rs.filter((r) => r.n === 'return to').length, 1, f);
      p.assert.equal(rs.filter((r) => r.n === 'saved fp').length, 1, f);
      p.assert.ok(rs.find((r) => r.n === 'return to').cls.includes('link'));
    }
    await p.stopProgram();
  });
  t.test('a called function returns into its caller: "return to … (in main)"', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    p.assert.match((await row(p, 'return to', { frame: 'add' })).v, /^0x[0-9a-f]{8} \(in main\)$/);
    await p.stopProgram();
  });
  t.test('main returns into _start', async (p) => {
    await dbg(p, MAIN);
    p.assert.match((await row(p, 'return to', { frame: 'main' })).v, /\(in _start\)$/);
    await p.stopProgram();
  });
  t.test('the saved fp of a callee is its caller\'s frame pointer', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const fps = await p.ev('SEE.Debug.frames(SEE.app.vm).map(f => f.fp)');
    p.assert.equal(hexn((await row(p, 'saved fp', { frame: 'add' })).v), fps[1]);
    await p.stopProgram();
  });
  t.test('"saved fp" sits at fp and "return to" at fp + 4', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const fp = await p.ev('SEE.Debug.frames(SEE.app.vm)[0].fp');
    p.assert.equal(hexn((await row(p, 'saved fp', { frame: 'add' })).a), fp);
    p.assert.equal(hexn((await row(p, 'return to', { frame: 'add' })).a), fp + 4);
    await p.stopProgram();
  });
  t.test('the link rows explain themselves in a tooltip', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    p.assert.equal((await row(p, 'return to', { frame: 'add' })).title, 'Where add() goes back to when it returns');
    p.assert.equal((await row(p, 'saved fp', { frame: 'add' })).title, 'The frame pointer of the caller, restored on return');
    await p.stopProgram();
  });
  t.test('parameters sit above the return address and locals below the saved fp', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const names = (await rowsIn(p, { frame: 'add' })).map((r) => r.n);
    p.assert.deepEqual(names, ['b', 'a', 'return to', 'saved fp', 's']);
    await p.stopProgram();
  });
  t.test('parameter addresses are above fp, local addresses below it', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const fp = await p.ev('SEE.Debug.frames(SEE.app.vm)[0].fp');
    p.assert.ok(hexn((await row(p, 'a', { frame: 'add' })).a) > fp + 4);
    p.assert.ok(hexn((await row(p, 'b', { frame: 'add' })).a) > hexn((await row(p, 'a', { frame: 'add' })).a));
    p.assert.ok(hexn((await row(p, 's', { frame: 'add' })).a) < fp);
    await p.stopProgram();
  });
  t.test('parameter rows say "parameter" and local rows say "local variable" in their tooltip', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    p.assert.match((await row(p, 'a', { frame: 'add' })).title, /^a: int at 0x[0-9a-f]+ \(4 bytes\), a parameter of add\(\)/);
    p.assert.match((await row(p, 's', { frame: 'add' })).title, /^s: int at .*, a local variable of add\(\)/);
    await p.stopProgram();
  });
  t.test('the rows of every frame go from high addresses to low', async (p) => {
    await dbg(p, CALL3, 14);
    await p.step('into'); await toLine(p, 9); await p.step('into');
    for (const f of ['main', 'f1', 'g2']) {
      const a = (await rowsIn(p, { frame: f })).filter((r) => !r.cls.includes('sub')).map((r) => hexn(r.a));
      for (let i = 1; i < a.length; i++) p.assert.ok(a[i] < a[i - 1], f + ' row ' + i);
    }
    await p.stopProgram();
  });
  t.test('parameter values are the arguments of the call', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    p.assert.equal((await row(p, 'a', { frame: 'add' })).v, '1');
    p.assert.equal((await row(p, 'b', { frame: 'add' })).v, '2');
    await p.stopProgram();
  });
  t.test('a function-level static is not drawn inside the frame', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    p.assert.ok(!(await hasRow(p, 'calls', { frame: 'add' })));
    p.assert.ok(await hasRow(p, 'add.calls', '.seg.data'));
    await p.stopProgram();
  });
  t.test('the callee frame lies below its caller in memory', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    const fps = await p.ev('SEE.Debug.frames(SEE.app.vm).map(f => f.fp)');
    p.assert.ok(fps[0] < fps[1]);
    await p.stopProgram();
  });
  t.test('when a function returns its frame box goes away', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    p.assert.equal(await p.count('#panel-memory .frame'), 2);
    await p.step('out');
    p.assert.equal(await p.count('#panel-memory .frame'), 1);
    p.assert.deepEqual(await frameNames(p), ['main()']);
    await p.stopProgram();
  });

  // ---- arrays ------------------------------------------------------------------------------------------
  t.test('a small int array is open from the start with one row per element', async (p) => {
    await dbg(p, MAIN, 30);
    const r = await row(p, 'arr', { frame: 'main' });
    p.assert.equal(r.tw, '▾');
    p.assert.equal(r.v, '5 × int');
    const subs = (await rowsIn(p, { frame: 'main' })).filter((x) => /^\[\d\]$/.test(x.n) && x.cls.includes('sub')).slice(0, 5);
    p.assert.deepEqual(subs.map((x) => x.n), ['[0]', '[1]', '[2]', '[3]', '[4]']);
    p.assert.deepEqual(subs.map((x) => x.v), ['1', '2', '3', '4', '5']);
    await p.stopProgram();
  });
  t.test('int array elements are 4 bytes apart and [0] is at the array address', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'arr');
    const base = hexn(rs[i].a);
    const el = rs.slice(i + 1, i + 6).map((x) => hexn(x.a));
    p.assert.deepEqual(el, [0, 4, 8, 12, 16].map((o) => base + o));
    p.assert.equal(base, await p.cval('&arr[0]'));
    await p.stopProgram();
  });
  t.test('a char array is closed and shows its text', async (p) => {
    await dbg(p, MAIN, 30);
    const r = await row(p, 'name', { frame: 'main' });
    p.assert.equal(r.tw, '▸');
    p.assert.equal(r.v, '"hello"');
    await p.stopProgram();
  });
  t.test('opening a char array shows its elements 1 byte apart', async (p) => {
    await dbg(p, MAIN, 30);
    await p.click(await mark(p, 'name', '.tw', { frame: 'main' }));
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'name');
    p.assert.equal(rs[i].tw, '▾');
    const base = hexn(rs[i].a);
    const el = rs.slice(i + 1, i + 7);
    p.assert.deepEqual(el.map((x) => x.n), ['[0]', '[1]', '[2]', '[3]', '[4]', '[5]']);
    p.assert.deepEqual(el.map((x) => hexn(x.a) - base), [0, 1, 2, 3, 4, 5]);
    p.assert.match(el[0].v, /h/);
    await p.stopProgram();
  });
  t.test('double array elements are 8 bytes apart', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'd');
    p.assert.equal(rs[i].v, '2 × double');
    p.assert.equal(hexn(rs[i + 2].a) - hexn(rs[i + 1].a), 8);
    p.assert.deepEqual([rs[i + 1].v, rs[i + 2].v], ['1.5', '2.5']);
    await p.stopProgram();
  });
  for (const [type, size, init] of [['short', 2, '{1, 2, 3}'], ['long', 4, '{1, 2, 3}'], ['float', 4, '{1.0f, 2.0f, 3.0f}'], ['unsigned char', 1, '{1, 2, 3}'],
    ['unsigned short', 2, '{1, 2, 3}'], ['double', 8, '{1.0, 2.0, 3.0}'], ['int *', 4, '{0, 0, 0}'], ['struct pt', 8, '{{1, 2}, {3, 4}, {5, 6}}']]) {
    t.test(`elements of a ${type} array are ${size} bytes apart`, async (p) => {
      const decl = type.endsWith('*') ? type + 'a[3]' : type + ' a[3]';
      await dbg(p, arrProg(decl, init), 6);
      const r = await row(p, 'a', { frame: 'main' });
      if (r.tw === '▸') await p.click(await mark(p, 'a', '.tw', { frame: 'main' }));
      const rs = (await rowsIn(p, { frame: 'main' })).filter((x) => /^\[\d\]$/.test(x.n) && x.cls.includes('sub'));
      p.assert.equal(rs.length, 3);
      p.assert.equal(hexn(rs[1].a) - hexn(rs[0].a), size);
      p.assert.equal(hexn(rs[2].a) - hexn(rs[1].a), size);
      p.assert.equal(hexn(rs[0].a), await p.cval('&a[0]'));
      await p.stopProgram();
    });
  }
  t.test('an array tooltip gives its declaration, address and size in bytes', async (p) => {
    await dbg(p, MAIN, 30);
    const r = await row(p, 'arr', { frame: 'main' });
    p.assert.match(r.title, /^arr: int\[5\] at 0x[0-9a-f]{8} \(20 bytes\), a local variable of main\(\)/);
    await p.stopProgram();
  });
  t.test('clicking ▾ closes an open array and ▸ opens it again', async (p) => {
    await dbg(p, MAIN, 30);
    await p.click(await mark(p, 'arr', '.tw', { frame: 'main' }));
    let rs = await rowsIn(p, { frame: 'main' });
    let i = rs.findIndex((x) => x.n === 'arr');
    p.assert.equal(rs[i].tw, '▸');
    p.assert.ok(!rs[i + 1].cls.includes('sub'));
    await p.click(await mark(p, 'arr', '.tw', { frame: 'main' }));
    rs = await rowsIn(p, { frame: 'main' });
    i = rs.findIndex((x) => x.n === 'arr');
    p.assert.equal(rs[i].tw, '▾');
    p.assert.equal(rs[i + 1].n, '[0]');
    await p.stopProgram();
  });
  t.test('a closed array stays closed after the next step', async (p) => {
    await dbg(p, MAIN, 29);
    await p.click(await mark(p, 'arr', '.tw', { frame: 'main' }));
    await p.step('over');
    p.assert.equal((await row(p, 'arr', { frame: 'main' })).tw, '▸');
    await p.stopProgram();
  });
  t.test('an opened char array stays open after the next step and is remembered in storage', async (p) => {
    await dbg(p, MAIN, 29);
    await p.click(await mark(p, 'name', '.tw', { frame: 'main' }));
    await p.step('over');
    p.assert.equal((await row(p, 'name', { frame: 'main' })).tw, '▾');
    const saved = await p.ev("JSON.parse(localStorage.getItem('see.memOpen'))");
    p.assert.ok(saved.some((k) => /:name$/.test(k)), JSON.stringify(saved));
    await p.stopProgram();
  });
  t.test('an int array of 40 starts closed and opens to 40 element rows', async (p) => {
    await dbg(p, arrProg('int big[40]', '{1, 2, 3}'), 6);
    const r = await row(p, 'big', { frame: 'main' });
    p.assert.equal(r.tw, '▸');
    p.assert.equal(r.v, '40 × int');
    await p.click(await mark(p, 'big', '.tw', { frame: 'main' }));
    const subs = (await rowsIn(p, { frame: 'main' })).filter((x) => x.cls.includes('sub'));
    p.assert.equal(subs.length, 40);
    p.assert.equal(subs[39].n, '[39]');
    p.assert.equal(hexn(subs[39].a) - hexn(subs[0].a), 39 * 4);
    await p.stopProgram();
  });
  t.test('an array of 100 opens to 64 rows and a "… 36 more" row', async (p) => {
    await dbg(p, arrProg('int big[100]', '{1}'), 6);
    await p.click(await mark(p, 'big', '.tw', { frame: 'main' }));
    const subs = (await rowsIn(p, { frame: 'main' })).filter((x) => x.cls.includes('sub'));
    p.assert.equal(subs.filter((x) => /^\[\d+\]$/.test(x.n)).length, 64);
    const more = subs.find((x) => x.n === '…');
    p.assert.ok(more);
    p.assert.equal(more.v, '36 more');
    await p.stopProgram();
  });
  t.test('a two-dimensional array opens row by row, rows 12 bytes apart and elements 4 apart', async (p) => {
    await dbg(p, arrProg('int m[2][3]', '{{1, 2, 3}, {4, 5, 6}}'), 6);
    const rs = await rowsIn(p, { frame: 'main' });
    const top = rs.filter((x) => x.v === '3 × int');
    p.assert.deepEqual(top.map((x) => x.n), ['[0]', '[1]']);
    p.assert.equal(top[0].v, '3 × int');
    p.assert.equal(hexn(top[1].a) - hexn(top[0].a), 12);
    const inner = rs.filter((x) => x.cls.includes('sub') && x.v !== '3 × int');
    p.assert.equal(inner.length, 6);
    p.assert.equal(hexn(inner[1].a) - hexn(inner[0].a), 4);
    p.assert.deepEqual(inner.map((x) => x.v), ['1', '2', '3', '4', '5', '6']);
    await p.stopProgram();
  });

  // ---- structs -----------------------------------------------------------------------------------------
  t.test('a small struct is open and shows its members', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'p');
    p.assert.equal(rs[i].v, 'struct pt');
    p.assert.equal(rs[i].tw, '▾');
    p.assert.deepEqual(rs.slice(i + 1, i + 3).map((x) => [x.n, x.v]), [['.x', '3'], ['.y', '4']]);
    await p.stopProgram();
  });
  t.test('struct members are drawn at their offsets: .x at +0 and .y at +4', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'p');
    p.assert.equal(hexn(rs[i + 1].a), hexn(rs[i].a));
    p.assert.equal(hexn(rs[i + 2].a), hexn(rs[i].a) + 4);
    await p.stopProgram();
  });
  t.test('a struct with mixed members puts each one at its real offset', async (p) => {
    const src = '#include <stdio.h>\nstruct mix { char c; int i; double d; short s; };\nint main(void)\n{\n    struct mix m = {1, 2, 3.0, 4};\n    printf("%d\\n", m.i);\n    return 0;\n}\n';
    await dbg(p, src, 6);
    for (const mb of ['c', 'i', 'd', 's']) p.assert.equal(hexn((await row(p, '.' + mb, { frame: 'main' })).a), await p.cval('(int)&m.' + mb) >>> 0, mb);
    p.assert.equal(hexn((await row(p, '.i', { frame: 'main' })).a) - hexn((await row(p, 'm', { frame: 'main' })).a), 4);
    p.assert.match((await row(p, 'm', { frame: 'main' })).title, new RegExp('\\(' + (await p.cval('sizeof m')) + ' bytes\\)'));
    await p.stopProgram();
  });
  t.test('a nested struct opens into its inner structs and their members', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'bx');
    p.assert.equal(rs[i].v, 'struct box');
    const names = rs.slice(i + 1, i + 8).map((x) => x.n);
    p.assert.deepEqual(names, ['.a', '.x', '.y', '.b', '.x', '.y', '.tag']);
    await p.stopProgram();
  });
  t.test('nested members are indented one level deeper than their struct', async (p) => {
    // the depth is set as style {'--d': n} through Object.assign(el.style, ...), which ignores custom
    // properties, so every nested row gets the default indent of one level
    await dbg(p, MAIN, 30);
    const pad = await p.ev("[...document.querySelectorAll('#panel-memory .cell.sub')].map(c => parseFloat(getComputedStyle(c.querySelector('.n')).paddingLeft))");
    p.assert.ok(Math.max(...pad) > Math.min(...pad));
    await p.stopProgram();
  });
  t.test('a nested member is at the address C gives it (bx.b.y)', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'bx');
    p.assert.equal(hexn(rs[i + 6].a), await p.cval('(int)&bx.b.y') >>> 0);
    p.assert.equal(hexn(rs[i + 4].a) - hexn(rs[i].a), 8);
    await p.stopProgram();
  });
  t.test('an array of structs opens into structs 8 bytes apart, each with its members', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'ps');
    p.assert.equal(rs[i].v, '3 × struct pt');
    const els = rs.slice(i + 1).filter((x) => x.v === 'struct pt').slice(0, 3);
    p.assert.deepEqual(els.map((x) => x.n), ['[0]', '[1]', '[2]']);
    p.assert.equal(hexn(els[1].a) - hexn(els[0].a), 8);
    p.assert.equal(hexn(els[2].a), await p.cval('(int)&ps[2]') >>> 0);
    const ys = rs.slice(i + 1, i + 10).filter((x) => x.n === '.y');
    p.assert.equal(ys.length, 3);
    p.assert.equal(hexn(ys[2].a), await p.cval('(int)&ps[2].y') >>> 0);
    await p.stopProgram();
  });
  t.test('a struct with more than 8 members starts closed and opens on ▸', async (p) => {
    const src = '#include <stdio.h>\nstruct big { int a, b, c, d, e, f, g, h, i; };\nint main(void)\n{\n    struct big w = {1, 2, 3, 4, 5, 6, 7, 8, 9};\n    printf("%d\\n", w.i);\n    return 0;\n}\n';
    await dbg(p, src, 6);
    p.assert.equal((await row(p, 'w', { frame: 'main' })).tw, '▸');
    await p.click(await mark(p, 'w', '.tw', { frame: 'main' }));
    const subs = (await rowsIn(p, { frame: 'main' })).filter((x) => x.cls.includes('sub'));
    p.assert.equal(subs.length, 9);
    p.assert.equal(subs[8].n, '.i');
    p.assert.equal(subs[8].v, '9');
    p.assert.equal(hexn(subs[8].a) - hexn(subs[0].a), 32);
    await p.stopProgram();
  });
  t.test('the members of a union all share its address', async (p) => {
    const src = '#include <stdio.h>\nunion num { int i; char c; short s; };\nint main(void)\n{\n    union num n;\n    n.i = 65;\n    printf("%d\\n", n.i);\n    return 0;\n}\n';
    await dbg(p, src, 7);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'n');
    p.assert.equal(rs[i].v, 'union num');
    const subs = rs.slice(i + 1, i + 4);
    p.assert.deepEqual(subs.map((x) => x.n), ['.i', '.c', '.s']);
    for (const s of subs) p.assert.equal(s.a, rs[i].a);
    await p.stopProgram();
  });
  t.test('a member tooltip names the struct it is part of', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'p');
    p.assert.match(rs[i + 1].title, /^p\.x: int at 0x[0-9a-f]{8} \(4 bytes\)/);
    await p.stopProgram();
  });
  t.test('an element tooltip names the array and the element type', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'arr');
    p.assert.match(rs[i + 1].title, /^arr\[0\]: int at/);
    await p.stopProgram();
  });

  // ---- red: not set yet --------------------------------------------------------------------------------
  t.test('a local that was never set is red', async (p) => {
    await dbg(p, MAIN, 30);
    p.assert.ok((await row(p, 'u', { frame: 'main' })).vcls.includes('uninit'));
    await p.stopProgram();
  });
  t.test('a red value explains itself in its tooltip', async (p) => {
    await dbg(p, MAIN, 30);
    p.assert.equal((await row(p, 'u', { frame: 'main' })).vtitle, 'Not set yet: this is whatever was left in memory there');
    await p.stopProgram();
  });
  t.test('the red of a value that is not set matches the legend', async (p) => {
    await dbg(p, MAIN, 30);
    await mark(p, 'u', '.v', { frame: 'main' });
    const c = await p.ev("getComputedStyle(document.querySelector('[data-e2e]')).color");
    const lg = await p.ev("getComputedStyle([...document.querySelectorAll('#panel-memory .legend span')].find(s => /red/.test(s.textContent))).color");
    p.assert.equal(c, lg);
    await mark(p, 'g', '.v', '.seg.data');
    p.assert.notEqual(await p.ev("getComputedStyle(document.querySelector('[data-e2e]')).color"), lg);
    await p.stopProgram();
  });
  t.test('a value stops being red once it is assigned', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('over');
    const r = await row(p, 'u', { frame: 'main' });
    p.assert.ok(!r.vcls.includes('uninit'));
    p.assert.equal(r.v, '3');
    p.assert.equal(r.vtitle.includes('Not set yet'), false);
    await p.stopProgram();
  });
  t.test('initialised locals are not red', async (p) => {
    await dbg(p, MAIN, 30);
    for (const n of ['ip', 'hp', 's', 'lit']) p.assert.ok(!(await row(p, n, { frame: 'main' })).vcls.includes('uninit'), n);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'arr');
    for (const r of rs.slice(i + 1, i + 6)) p.assert.ok(!r.vcls.includes('uninit'));
    await p.stopProgram();
  });
  t.test('the members of a struct that was never set are red', async (p) => {
    await dbg(p, MAIN, 30);
    const rs = await rowsIn(p, { frame: 'main' });
    const i = rs.findIndex((x) => x.n === 'ps');
    const members = rs.slice(i + 1, i + 10).filter((x) => x.n === '.x' || x.n === '.y');
    p.assert.equal(members.length, 6);
    for (const m of members) p.assert.ok(m.vcls.includes('uninit'), m.n + ' ' + m.a);
    await p.stopProgram();
  });
  t.test('locals declared later are red at the first line of main', async (p) => {
    await dbg(p, MAIN);
    for (const n of ['ip', 'hp', 's', 'lit', 'u']) p.assert.ok((await row(p, n, { frame: 'main' })).vcls.includes('uninit'), n);
    await p.stopProgram();
  });
  t.test('a pointer that was never set has a red (bad) dot', async (p) => {
    await dbg(p, '#include <stdlib.h>\nint main(void)\n{\n    int *m = malloc(4);\n    free(m);\n    return 0;\n}\n');
    p.assert.ok((await row(p, 'm', { frame: 'main' })).vcls.includes('uninit'));
    p.assert.notEqual((await row(p, 'm', { frame: 'main' })).v, 'NULL');
    await mark(p, 'm', '.v', { frame: 'main' });
    p.assert.ok(await p.ev("document.querySelector('[data-e2e] .dot').classList.contains('bad')"));
    await p.stopProgram();
  });
  t.test('malloc memory is red, calloc memory is not', async (p) => {
    const src = '#include <stdlib.h>\nint main(void)\n{\n    int *m = malloc(3 * sizeof(int));\n    int *c = calloc(3, sizeof(int));\n    free(m);\n    free(c);\n    return 0;\n}\n';
    await dbg(p, src, 6);
    const heap = await rowsIn(p, '.seg.heap');
    const els = heap.filter((x) => /^\[\d\]$/.test(x.n) && x.cls.includes('sub'));
    p.assert.equal(els.length, 6);
    const mAddr = await p.cval('(int)m') >>> 0;
    for (const e of els) {
      const inM = hexn(e.a) >= mAddr && hexn(e.a) < mAddr + 12;
      p.assert.equal(e.vcls.includes('uninit'), inM, e.a);
    }
    await p.stopProgram();
  });
  t.test('globals in .bss start at zero and are not red', async (p) => {
    await dbg(p, MAIN);
    const r = await row(p, 'zero', '.seg.data');
    p.assert.equal(r.v, '0');
    p.assert.ok(!r.vcls.includes('uninit'));
    await p.stopProgram();
  });

  // ---- yellow: changed since the last stop ---------------------------------------------------------
  t.test('a value changed by the last step is yellow', async (p) => {
    await dbg(p, STEPS, 7);
    await p.step('over');
    const r = await row(p, 'x', { frame: 'main' });
    p.assert.equal(r.v, '2');
    p.assert.ok(r.cls.includes('changed'));
    await p.stopProgram();
  });
  t.test('values the step did not change are not yellow', async (p) => {
    await dbg(p, STEPS, 7);
    await p.step('over');
    p.assert.ok(!(await row(p, 'y', { frame: 'main' })).cls.includes('changed'));
    p.assert.ok(!(await row(p, 'c', { frame: 'main' })).cls.includes('changed'));
    await p.stopProgram();
  });
  t.test('a yellow mark lasts only until the next step', async (p) => {
    await dbg(p, STEPS, 7);
    await p.step('over');
    p.assert.ok((await row(p, 'x', { frame: 'main' })).cls.includes('changed'));
    await p.step('over');
    p.assert.ok(!(await row(p, 'x', { frame: 'main' })).cls.includes('changed'));
    await p.stopProgram();
  });
  t.test('storing the same value again does not mark it yellow', async (p) => {
    await dbg(p, STEPS, 8);
    await p.step('over');
    p.assert.ok(!(await row(p, 'y', { frame: 'main' })).cls.includes('changed'));
    await p.stopProgram();
  });
  t.test('the yellow uses the changed colour on the value cell', async (p) => {
    await dbg(p, STEPS, 7);
    await p.step('over');
    await mark(p, 'x', '.v', { frame: 'main' });
    const changed = await p.ev("getComputedStyle(document.documentElement).getPropertyValue('--m-changed').trim()");
    p.assert.ok(changed.length > 0);
    p.assert.equal(await p.ev("document.querySelector('[data-e2e]').parentElement.classList.contains('changed')"), true);
    await p.stopProgram();
  });
  t.test('only the array element that changed turns yellow, not the array row', async (p) => {
    const src = '#include <stdio.h>\nint main(void)\n{\n    int a[4] = {1, 2, 3, 4};\n    a[2] = 30;\n    printf("%d\\n", a[2]);\n    return 0;\n}\n';
    await dbg(p, src, 5);
    await p.step('over');
    const rs = await rowsIn(p, { frame: 'main' });
    const changed = rs.filter((x) => x.cls.includes('changed')).map((x) => x.n);
    p.assert.deepEqual(changed, ['[2]']);
    await p.stopProgram();
  });
  t.test('a struct member written through a pointer in another function is yellow after stepping over', async (p) => {
    const src = '#include <stdio.h>\nstruct pt { int x; int y; };\nvoid bump(struct pt *q) { q->y = q->y + 5; }\nint main(void)\n{\n    struct pt v = {1, 2};\n    bump(&v);\n    printf("%d\\n", v.y);\n    return 0;\n}\n';
    await dbg(p, src, 7);
    await p.step('over');
    const rs = await rowsIn(p, { frame: 'main' });
    p.assert.deepEqual(rs.filter((x) => x.cls.includes('changed')).map((x) => x.n), ['.y']);
    await p.stopProgram();
  });
  t.test('the tooltip tells which line last wrote a value', async (p) => {
    await dbg(p, STEPS, 8);
    p.assert.match((await row(p, 'x', { frame: 'main' })).title, /last written by line 7 in main\(\)/);
    await p.stopProgram();
  });

  // ---- const and the padlock --------------------------------------------------------------------------
  const padlock = (p) => p.ev("getComputedStyle(document.querySelector('[data-e2e]'), '::after').content");
  t.test('a const local has a padlock', async (p) => {
    await dbg(p, STEPS, 7);
    const r = await row(p, 'c', { frame: 'main' });
    p.assert.ok(r.vcls.includes('ro'));
    await mark(p, 'c', '.v', { frame: 'main' });
    p.assert.match(await padlock(p), /🔒/);
    await p.stopProgram();
  });
  t.test('a plain local has no padlock', async (p) => {
    await dbg(p, STEPS, 7);
    await mark(p, 'x', '.v', { frame: 'main' });
    p.assert.ok(!/🔒/.test(await padlock(p)));
    p.assert.ok((await row(p, 'x', { frame: 'main' })).vcls.includes('edit'));
    await p.stopProgram();
  });
  t.test('a const global lives in read-only data with a padlock', async (p) => {
    await dbg(p, MAIN);
    const r = await row(p, 'K', '.seg.ro');
    p.assert.equal(r.v, '9');
    p.assert.ok(r.vcls.includes('ro'));
    p.assert.ok(!(await hasRow(p, 'K', '.seg.data')));
    await mark(p, 'K', '.v', '.seg.ro');
    p.assert.match(await padlock(p), /🔒/);
    await p.stopProgram();
  });
  t.test('every string literal row has a padlock', async (p) => {
    await dbg(p, MAIN);
    const lits = (await rowsIn(p, '.seg.ro')).filter((x) => /^line \d+$/.test(x.n));
    p.assert.ok(lits.length >= 3);
    for (const l of lits) p.assert.ok(l.vcls.includes('ro'), l.n);
    await mark(p, lits[0].n, '.v', '.seg.ro');
    p.assert.match(await padlock(p), /🔒/);
    await p.stopProgram();
  });
  t.test('a const value tells why it cannot be changed', async (p) => {
    await dbg(p, STEPS, 7);
    p.assert.equal((await row(p, 'c', { frame: 'main' })).vtitle, 'const: the program cannot change this, so neither can the debugger');
    await p.stopProgram();
  });
  t.test('clicking a const value does not open an editor', async (p) => {
    await dbg(p, STEPS, 7);
    await p.click(await mark(p, 'c', '.v', { frame: 'main' }));
    p.assert.equal(await p.count('#panel-memory .v input'), 0);
    p.assert.equal(await p.cval('c'), 3);
    await p.stopProgram();
  });
  t.test('a pointer to const chars is itself editable: only what it points at is const', async (p) => {
    await dbg(p, MAIN, 30);
    const r = await row(p, 'lit', { frame: 'main' });
    p.assert.ok(r.vcls.includes('edit'));
    p.assert.ok(!r.vcls.includes(' ro'));
    await p.stopProgram();
  });

  // ---- heap blocks ---------------------------------------------------------------------------------
  const blockHeads = (p) => p.ev("[...document.querySelectorAll('#panel-memory .blk')].map(b => ({ cls: b.className, l: b.querySelector('.blk-head').children[0].textContent, r: b.querySelector('.blk-head').children[1].textContent }))");
  t.test('a heap block shows its number and size', async (p) => {
    await dbg(p, MAIN, 30);
    const bh = await blockHeads(p);
    p.assert.deepEqual(bh.map((b) => b.l), ['block #2 · 8 bytes', 'block #1 · 20 bytes']);
    await p.stopProgram();
  });
  t.test('a heap block shows the line and function that made it', async (p) => {
    await dbg(p, MAIN, 30);
    const bh = await blockHeads(p);
    p.assert.deepEqual(bh.map((b) => b.r), ['malloc at line 26 in main()', 'malloc at line 25 in main()']);
    await p.stopProgram();
  });
  t.test('a calloc block is labelled with calloc', async (p) => {
    const src = '#include <stdlib.h>\nint main(void)\n{\n    int *a = calloc(4, sizeof(int));\n    char *b = malloc(2);\n    free(a);\n    free(b);\n    return 0;\n}\n';
    await dbg(p, src, 6);
    const r = (await blockHeads(p)).map((b) => b.l + ' / ' + b.r);
    p.assert.deepEqual(r, ['block #2 · 2 bytes / malloc at line 5 in main()', 'block #1 · 16 bytes / calloc at line 4 in main()']);
    await p.stopProgram();
  });
  t.test('a block made in another function names that function', async (p) => {
    const src = '#include <stdlib.h>\nint *make(int n)\n{\n    return malloc(n * sizeof(int));\n}\nint main(void)\n{\n    int *q = make(3);\n    free(q);\n    return 0;\n}\n';
    await dbg(p, src, 9);
    p.assert.equal((await blockHeads(p))[0].r, 'malloc at line 4 in make()');
    await p.stopProgram();
  });
  t.test('an int pointer to 5 ints types its block as [5]', async (p) => {
    await dbg(p, MAIN, 30);
    const heap = await rowsIn(p, '.seg.heap');
    const r = heap.find((x) => x.n === '[5]');
    p.assert.ok(r, JSON.stringify(heap.map((x) => x.n)));
    p.assert.equal(r.v, '5 × int');
    p.assert.equal(hexn(r.a), await p.cval('(int)hp') >>> 0);
    const els = heap.filter((x) => /^\[\d\]$/.test(x.n) && x.cls.includes('sub'));
    p.assert.equal(els.length, 5);
    p.assert.equal(hexn(els[1].a) - hexn(els[0].a), 4);
    await p.stopProgram();
  });
  t.test('a char pointer to text shows its block as a string', async (p) => {
    await dbg(p, MAIN, 30);
    const r = (await rowsIn(p, '.seg.heap')).find((x) => x.n === '[8]');
    p.assert.ok(r);
    p.assert.equal(r.v, '"abc"');
    p.assert.equal(hexn(r.a), await p.cval('(int)s') >>> 0);
    await p.stopProgram();
  });
  t.test('a pointer to one struct shows its block as that struct with members', async (p) => {
    const src = '#include <stdlib.h>\nstruct pt { int x; int y; };\nint main(void)\n{\n    struct pt *q = malloc(sizeof(struct pt));\n    q->x = 7;\n    q->y = 8;\n    free(q);\n    return 0;\n}\n';
    await dbg(p, src, 8);
    const heap = await rowsIn(p, '.seg.heap');
    p.assert.deepEqual(heap.map((x) => [x.n, x.v]), [['*', 'struct pt'], ['.x', '7'], ['.y', '8']]);
    await p.stopProgram();
  });
  t.test('a block only pointed at in its middle is shown as plain bytes', async (p) => {
    const src = '#include <stdlib.h>\nint main(void)\n{\n    int *q = malloc(5 * sizeof(int));\n    q = q + 2;\n    *q = 1;\n    return 0;\n}\n';
    await dbg(p, src, 7);
    const heap = await rowsIn(p, '.seg.heap');
    p.assert.equal(heap[0].n, 'bytes');
    p.assert.ok(!heap.some((x) => x.n === '[5]'));
    await p.stopProgram();
  });
  t.test('an untyped block holding text is shown as a string', async (p) => {
    const src = '#include <stdlib.h>\n#include <string.h>\nint main(void)\n{\n    void *v = malloc(16);\n    strcpy(v, "text");\n    free(v);\n    return 0;\n}\n';
    await dbg(p, src, 7);
    const heap = await rowsIn(p, '.seg.heap');
    p.assert.equal(heap[0].n, 'bytes');
    p.assert.equal(heap[0].v, '"text"');
    await p.stopProgram();
  });
  t.test('a global pointer types the block it points at', async (p) => {
    const src = '#include <stdlib.h>\ndouble *gp;\nint main(void)\n{\n    gp = malloc(3 * sizeof(double));\n    gp[0] = 1.5;\n    return 0;\n}\n';
    await dbg(p, src, 7);
    const heap = await rowsIn(p, '.seg.heap');
    p.assert.equal(heap[0].n, '[3]');
    p.assert.equal(heap[0].v, '3 × double');
    p.assert.equal(heap[1].v, '1.5');
    await p.stopProgram();
  });
  t.test('heap blocks are listed from the highest address down', async (p) => {
    await dbg(p, MAIN, 30);
    const a = (await rowsIn(p, '.seg.heap')).filter((x) => !x.cls.includes('sub')).map((x) => hexn(x.a));
    p.assert.equal(a.length, 2);
    p.assert.ok(a[0] > a[1]);
    await p.stopProgram();
  });
  t.test('a block appears right after the malloc line is stepped over', async (p) => {
    await dbg(p, MAIN, 25);
    p.assert.equal(await p.count('#panel-memory .blk'), 0);
    await p.step('over');
    p.assert.equal(await p.count('#panel-memory .blk'), 1);
    await p.step('over');
    p.assert.equal(await p.count('#panel-memory .blk'), 2);
    await p.stopProgram();
  });
  t.test('a freed block is hatched and labelled with the line that freed it', async (p) => {
    await dbg(p, MAIN, 32);
    const bh = await blockHeads(p);
    const fr = bh.find((b) => b.cls.includes('freed'));
    p.assert.ok(fr, JSON.stringify(bh));
    p.assert.equal(fr.l, 'free (was block #1)');
    p.assert.equal(fr.r, 'freed at line 31');
    const bg = await p.ev("getComputedStyle(document.querySelector('#panel-memory .blk.freed')).backgroundImage");
    p.assert.match(bg, /repeating-linear-gradient/);
    await p.stopProgram();
  });
  t.test('a freed block says how many bytes are ready for the next malloc', async (p) => {
    await dbg(p, MAIN, 32);
    const tx = await p.text('#panel-memory .blk.freed .cells');
    p.assert.match(tx, /\d+ bytes ready for the next malloc/);
    p.assert.ok(parseInt(tx.match(/(\d+) bytes ready/)[1], 10) >= 20);
    await p.stopProgram();
  });
  t.test('a freed block is no longer typed or opened', async (p) => {
    await dbg(p, MAIN, 32);
    p.assert.ok(!(await hasRow(p, '[5]', '.seg.heap')));
    p.assert.equal(await p.count('#panel-memory .blk.freed .cell.sub'), 0);
    await p.stopProgram();
  });
  t.test('blocks still allocated when the program ends are marked as never freed', async (p) => {
    await dbg(p, MAIN);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    const bh = await blockHeads(p);
    const leak = bh.filter((b) => b.cls.includes('leak'));
    p.assert.equal(leak.length, 1);
    p.assert.equal(leak[0].l, 'block #2 · 8 bytes');
    p.assert.match(leak[0].r, /malloc at line 26 in main\(\) · never freed$/);
    await p.stopProgram();
  });
  t.test('a leaked block head is coloured as a warning', async (p) => {
    await dbg(p, MAIN);
    await p.cont();
    const bgs = await p.ev("[...document.querySelectorAll('#panel-memory .blk')].map(b => getComputedStyle(b.querySelector('.blk-head')).backgroundColor + '|' + b.className)");
    const leak = bgs.find((x) => x.includes('leak')).split('|')[0];
    const freed = bgs.find((x) => x.includes('freed')).split('|')[0];
    p.assert.notEqual(leak, freed);
    await p.stopProgram();
  });
  t.test('freed blocks are not marked as leaks at exit', async (p) => {
    await dbg(p, MAIN);
    await p.cont();
    const fr = (await blockHeads(p)).find((b) => b.cls.includes('freed'));
    p.assert.ok(!fr.cls.includes('leak'));
    p.assert.ok(!fr.r.includes('never freed'));
    await p.stopProgram();
  });
  t.test('a paused program has no blocks marked as leaks yet', async (p) => {
    await dbg(p, MAIN, 30);
    p.assert.equal(await p.count('#panel-memory .blk.leak'), 0);
    p.assert.ok(!(await p.text('#panel-memory .seg.heap')).includes('never freed'));
    await p.stopProgram();
  });

  // ---- globals and statics ----------------------------------------------------------------------------
  t.test('an initialised global is in .data with its value', async (p) => {
    await dbg(p, MAIN);
    const r = await row(p, 'g', '.seg.data');
    p.assert.equal(r.v, '5');
    p.assert.match(r.title, /^g: int at 0x[0-9a-f]{8} \(4 bytes\), in \.data/);
    await p.stopProgram();
  });
  t.test('a global with no initialiser is in .bss, zero at start', async (p) => {
    await dbg(p, MAIN);
    p.assert.match((await row(p, 'zero', '.seg.data')).title, /^zero: int at .*, in \.bss \(zero at start\)/);
    await p.stopProgram();
  });
  t.test('a static inside a function is labelled with its function', async (p) => {
    await dbg(p, MAIN);
    const r = await row(p, 'add.calls', '.seg.data');
    p.assert.equal(r.v, '0');
    p.assert.match(r.title, /^add\.calls: int at .*, static/);
    await p.stopProgram();
  });
  t.test('a function static changes when the function runs', async (p) => {
    await dbg(p, MAIN, 31);
    p.assert.equal((await row(p, 'add.calls', '.seg.data')).v, '1');
    await p.stopProgram();
  });
  t.test('a file-level static is labelled static but has no function prefix', async (p) => {
    const src = '#include <stdio.h>\nstatic int counter = 2;\nint plain = 3;\nint main(void)\n{\n    counter++;\n    printf("%d %d\\n", counter, plain);\n    return 0;\n}\n';
    await dbg(p, src);
    p.assert.match((await row(p, 'counter', '.seg.data')).title, /^counter: int at .*, in \.data, static/);
    p.assert.ok(!(await row(p, 'plain', '.seg.data')).title.includes('static'));
    await p.stopProgram();
  });
  t.test('statics of the same name in two functions are told apart', async (p) => {
    const src = '#include <stdio.h>\nint f(void) { static int n = 1; return n++; }\nint h(void) { static int n = 10; return n++; }\nint main(void)\n{\n    printf("%d %d\\n", f(), h());\n    return 0;\n}\n';
    await dbg(p, src);
    p.assert.equal((await row(p, 'f.n', '.seg.data')).v, '1');
    p.assert.equal((await row(p, 'h.n', '.seg.data')).v, '10');
    await p.stopProgram();
  });
  t.test('a program without globals says "no global variables"', async (p) => {
    await dbg(p, STEPS);
    p.assert.match(await p.text('#panel-memory .seg.data'), /no global variables/);
    await p.stopProgram();
  });
  t.test('globals are listed from the highest address down', async (p) => {
    await dbg(p, MAIN);
    const a = (await rowsIn(p, '.seg.data')).map((x) => hexn(x.a));
    p.assert.ok(a.length >= 3);
    for (let i = 1; i < a.length; i++) p.assert.ok(a[i] < a[i - 1]);
    await p.stopProgram();
  });
  t.test('global addresses are the ones C gives them', async (p) => {
    await dbg(p, MAIN);
    p.assert.equal(hexn((await row(p, 'g', '.seg.data')).a), await p.cval('(int)&g') >>> 0);
    p.assert.equal(hexn((await row(p, 'zero', '.seg.data')).a), await p.cval('(int)&zero') >>> 0);
    await p.stopProgram();
  });
  t.test('a global array opens into its elements', async (p) => {
    const src = '#include <stdio.h>\nint garr[3] = {7, 8, 9};\nint main(void)\n{\n    printf("%d\\n", garr[1]);\n    return 0;\n}\n';
    await dbg(p, src);
    const rs = await rowsIn(p, '.seg.data');
    p.assert.equal(rs[0].n, 'garr');
    p.assert.deepEqual(rs.slice(1).map((x) => x.v), ['7', '8', '9']);
    await p.stopProgram();
  });
  t.test('a global changed by a step is yellow', async (p) => {
    const src = '#include <stdio.h>\nint counter;\nint main(void)\n{\n    counter = 4;\n    printf("%d\\n", counter);\n    return 0;\n}\n';
    await dbg(p, src, 5);
    await p.step('over');
    const r = await row(p, 'counter', '.seg.data');
    p.assert.equal(r.v, '4');
    p.assert.ok(r.cls.includes('changed'));
    await p.stopProgram();
  });

  // ---- string literals ---------------------------------------------------------------------------------
  t.test('each string literal is listed with the line it comes from', async (p) => {
    await dbg(p, MAIN);
    const lits = (await rowsIn(p, '.seg.ro')).filter((x) => /^line /.test(x.n));
    const m = Object.fromEntries(lits.map((x) => [x.n, x.v]));
    p.assert.equal(m['line 27'], '"literal"');
    p.assert.equal(m['line 29'], '"abc"');
    p.assert.equal(m['line 32'], '"%d %d\\n"');
    await p.stopProgram();
  });
  t.test('a string literal row gives its size including the NUL', async (p) => {
    await dbg(p, MAIN);
    p.assert.equal((await row(p, 'line 27', '.seg.ro')).t, 'char[8]');
    p.assert.equal((await row(p, 'line 29', '.seg.ro')).t, 'char[4]');
    await p.stopProgram();
  });
  t.test('a string literal tooltip says where it comes from and that it cannot change', async (p) => {
    await dbg(p, MAIN);
    p.assert.match((await row(p, 'line 27', '.seg.ro')).title, /^string literal from line 27 of .*main\.c: it lives here for the whole run and cannot be changed$/);
    await p.stopProgram();
  });
  t.test('a pointer to a literal holds the literal\'s address', async (p) => {
    await dbg(p, MAIN, 30);
    p.assert.equal(hexn((await row(p, 'line 27', '.seg.ro')).a), hexn((await row(p, 'lit', { frame: 'main' })).v));
    await p.stopProgram();
  });
  t.test('string literals are listed from the highest address down', async (p) => {
    await dbg(p, MAIN);
    const a = (await rowsIn(p, '.seg.ro')).filter((x) => /^line /.test(x.n)).map((x) => hexn(x.a));
    for (let i = 1; i < a.length; i++) p.assert.ok(a[i] < a[i - 1]);
    await p.stopProgram();
  });
  t.test('a program without literals or const globals says "no string literals"', async (p) => {
    await dbg(p, 'int main(void)\n{\n    int a = 1;\n    return a - 1;\n}\n');
    p.assert.match(await p.text('#panel-memory .seg.ro'), /no string literals/);
    await p.stopProgram();
  });
  t.test('the C library\'s own literals are hidden', async (p) => {
    await dbg(p, MAIN);
    const titles = (await rowsIn(p, '.seg.ro')).map((x) => x.title);
    p.assert.ok(!titles.some((x) => /\/usr\/lib\//.test(x)));
    await p.stopProgram();
  });

  // ---- functions -------------------------------------------------------------------------------------
  t.test('the code segment lists every function with its address', async (p) => {
    await dbg(p, MAIN);
    const rs = (await rowsIn(p, '.seg.text')).filter((x) => x.n.endsWith('()'));
    p.assert.deepEqual(rs.map((x) => x.n), ['main()', 'add()']);
    const addrs = await p.ev("Object.fromEntries(SEE.app.vm.prog.functions.map(f => [f.name, f.addr]))");
    for (const r of rs) p.assert.equal(hexn(r.a), addrs[r.n.slice(0, -2)]);
    await p.stopProgram();
  });
  t.test('a function row shows its file and line', async (p) => {
    await dbg(p, MAIN);
    p.assert.equal((await row(p, 'main()', '.seg.text')).v, 'main.c:16');
    p.assert.equal((await row(p, 'add()', '.seg.text')).v, 'main.c:9');
    await p.stopProgram();
  });
  t.test('a function row tooltip gives its type', async (p) => {
    await dbg(p, MAIN);
    p.assert.match((await row(p, 'add()', '.seg.text')).title, /int add\(int,? ?int\)|int add\(int a, int b\)/);
    await p.stopProgram();
  });
  t.test('only main is highlighted while main runs', async (p) => {
    await dbg(p, MAIN);
    p.assert.ok((await row(p, 'main()', '.seg.text')).cls.includes('target'));
    p.assert.ok(!(await row(p, 'add()', '.seg.text')).cls.includes('target'));
    await p.stopProgram();
  });
  t.test('inside a call both the caller and the callee are highlighted', async (p) => {
    await dbg(p, MAIN, 30);
    await p.step('into');
    p.assert.ok((await row(p, 'main()', '.seg.text')).cls.includes('target'));
    p.assert.ok((await row(p, 'add()', '.seg.text')).cls.includes('target'));
    await p.step('out');
    p.assert.ok(!(await row(p, 'add()', '.seg.text')).cls.includes('target'));
    await p.stopProgram();
  });
  t.test('the library row lists the C functions the program uses', async (p) => {
    await dbg(p, MAIN);
    p.assert.equal((await row(p, 'library', '.seg.text')).v, 'free, malloc, printf, strcpy');
    await p.stopProgram();
  });
  t.test('functions are listed from the highest address down', async (p) => {
    await dbg(p, CALL3);
    const a = (await rowsIn(p, '.seg.text')).filter((x) => x.n.endsWith('()')).map((x) => hexn(x.a));
    p.assert.equal(a.length, 3);
    for (let i = 1; i < a.length; i++) p.assert.ok(a[i] < a[i - 1]);
    await p.stopProgram();
  });
  t.test('the return address of a frame lies inside its caller\'s code', async (p) => {
    await dbg(p, CALL3, 14);
    await p.step('into');
    const ret = hexn((await row(p, 'return to', { frame: 'f1' })).v);
    const m = await p.ev("(() => { const f = SEE.app.vm.prog.functions.find(f => f.name === 'main'); return [f.addr, f.size]; })()");
    p.assert.ok(ret > m[0] && ret < m[0] + m[1]);
    await p.stopProgram();
  });
}
