// More of the memory picture (src/ide/memview.js): the arrows for pointers and hovering them, the
// toolbar checkboxes, selecting frames, changing values in place, the fault / returned / exit boxes,
// deep recursion, redrawing after Back, and the picture on a phone-sized screen.

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

const STEPS0 = `#include <stdio.h>
int main(void)
{
    int x = 1;
    x = x + 1;
    printf("%d\\n", x);
    return 0;
}
`;
/** Every arrow of the picture as {from, to, toSeg, toA, bad}: where its tail dot and its head land */
function arrows(p) {
  return p.fn(() => {
    const root = document.querySelector('#panel-memory .mem');
    const svg = root && root.querySelector('svg.mem-svg');
    if (!svg) return null;
    const rb = root.getBoundingClientRect();
    const rectOf = (el) => {
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      for (const c of el.children) { const x = c.getBoundingClientRect(); if (!x.width && !x.height) continue; l = Math.min(l, x.left); t = Math.min(t, x.top); r = Math.max(r, x.right); b = Math.max(b, x.bottom); }
      return { l, t, r, b };
    };
    const name = (c) => { const n = c.querySelector(':scope > .n'); return n ? n.textContent.replace(/^[▸▾]/, '') : ''; };
    const cells = [...root.querySelectorAll('.cell')].map((c) => ({ c, r: rectOf(c) }));
    const dots = [...root.querySelectorAll('.dot')].map((d) => { const r = d.getBoundingClientRect(); return { d, x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const out = [];
    const paths = [...svg.querySelectorAll('path')];
    for (let i = 0; i < paths.length; i += 2) {
      const n = paths[i].getAttribute('d').match(/-?\d+(\.\d+)?(e-?\d+)?/g).map(Number);
      const x1 = rb.left + n[0], y1 = rb.top + n[1], x2 = rb.left + n[6], y2 = rb.top + n[7];
      const dot = dots.find((d) => Math.abs(d.x - x1) < 2 && Math.abs(d.y - y1) < 2);
      let best = null;
      for (const c of cells) {
        if (x2 >= c.r.l - 2 && x2 <= c.r.r + 2 && y2 >= c.r.t - 1 && y2 <= c.r.b + 1) {
          const area = (c.r.r - c.r.l) * (c.r.b - c.r.t);
          if (!best || area < best.area) best = { c: c.c, area };
        }
      }
      const fromCell = dot && dot.d.closest('.cell');
      out.push({
        from: fromCell ? name(fromCell) : null, fromSeg: fromCell ? fromCell.closest('.seg').classList[1] : null,
        to: best ? name(best.c) : null, toSeg: best ? best.c.closest('.seg').classList[1] : null,
        toA: best && best.c.querySelector(':scope > .a') ? best.c.querySelector(':scope > .a').textContent : null,
        toV: best && best.c.querySelector(':scope > .v') ? best.c.querySelector(':scope > .v').textContent : null,
        bad: paths[i].classList.contains('bad'), headBad: paths[i + 1].classList.contains('bad'),
      });
    }
    return out;
  });
}
async function waitArrows(p) {
  await p.wait("!!document.querySelector('#panel-memory svg.mem-svg')", 3000);
  return arrows(p);
}
const arrowFrom = async (p, from) => (await waitArrows(p)).filter((a) => a.from === from);

const PTRS = `#include <stdio.h>
#include <stdlib.h>
int gv = 7;
int main(void)
{
    int x = 1;
    int arr[6] = {10, 11, 12, 13, 14, 15};
    int *px = &x;
    int *pm = &arr[3];
    int *pg = &gv;
    const char *ps = "hi there";
    int *ph = malloc(3 * sizeof(int));
    int *pn = NULL;
    int **pp = &px;
    int *dang = malloc(sizeof(int));
    free(dang);
    printf("%d\\n", *px);
    return 0;
}
`;
const LIST = `#include <stdlib.h>
struct node { int v; struct node *next; };
int main(void)
{
    struct node *head = NULL;
    int i;
    for (i = 0; i < 4; i++) {
        struct node *n = malloc(sizeof(struct node));
        n->v = i;
        n->next = head;
        head = n;
    }
    return 0;
}
`;
const ADD = `#include <stdio.h>
#include <stdlib.h>
int add(int a, int b)
{
    int s = a + b;
    return s;
}
int main(void)
{
    int x = 1;
    int y = 2;
    char name[6] = "hello";
    double d = 1.5;
    char ch = 'a';
    int *q = &x;
    int u = add(x, y);
    x = x + 1;
    printf("%d %d %s %f %c %d\\n", x, u, name, d, ch, *q);
    return 0;
}
`;
const recProg = (n) => `#include <stdio.h>
int rec(int n)
{
    if (n == 0) { int *q = 0; return *q; }
    return rec(n - 1) + 1;
}
int main(void)
{
    printf("%d\\n", rec(${n}));
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

  // ---- arrows --------------------------------------------------------------------------------------
  t.test('a pointer to a local gets an arrow to that local', async (p) => {
    await dbg(p, PTRS, 17);
    const a = await arrowFrom(p, 'px');
    p.assert.equal(a.length, 1);
    p.assert.deepEqual([a[0].to, a[0].toSeg, a[0].bad], ['x', 'stack', false]);
    await p.stopProgram();
  });
  t.test('a pointer into the middle of an open array lands on that element', async (p) => {
    await dbg(p, PTRS, 17);
    const a = (await arrowFrom(p, 'pm'))[0];
    p.assert.equal(a.to, '[3]');
    p.assert.equal(a.toV, '13');
    p.assert.equal(hexn(a.toA), hexn((await row(p, 'pm', { frame: 'main' })).v));
    await p.stopProgram();
  });
  t.test('when the array is closed the arrow lands on the array row', async (p) => {
    await dbg(p, PTRS, 17);
    await p.click(await mark(p, 'arr', '.tw', { frame: 'main' }));
    const a = (await arrowFrom(p, 'pm'))[0];
    p.assert.equal(a.to, 'arr');
    await p.stopProgram();
  });
  t.test('a pointer to a global gets an arrow into the globals', async (p) => {
    await dbg(p, PTRS, 17);
    const a = (await arrowFrom(p, 'pg'))[0];
    p.assert.deepEqual([a.to, a.toSeg], ['gv', 'data']);
    await p.stopProgram();
  });
  t.test('a pointer to a string literal gets an arrow to the literal', async (p) => {
    await dbg(p, PTRS, 17);
    const a = (await arrowFrom(p, 'ps'))[0];
    p.assert.deepEqual([a.to, a.toSeg, a.toV], ['line 11', 'ro', '"hi there"']);
    await p.stopProgram();
  });
  t.test('a pointer to a heap block gets an arrow to the start of the block', async (p) => {
    await dbg(p, PTRS, 17);
    const a = (await arrowFrom(p, 'ph'))[0];
    p.assert.deepEqual([a.to, a.toSeg, a.bad], ['[0]', 'heap', false]);
    p.assert.equal(hexn(a.toA), hexn((await row(p, 'ph', { frame: 'main' })).v));
    await p.stopProgram();
  });
  t.test('a NULL pointer has no arrow and a flat dot', async (p) => {
    await dbg(p, PTRS, 17);
    p.assert.equal((await arrowFrom(p, 'pn')).length, 0);
    const r = await row(p, 'pn', { frame: 'main' });
    p.assert.equal(r.v, 'NULL');
    await mark(p, 'pn', '.v', { frame: 'main' });
    p.assert.ok(await p.ev("document.querySelector('[data-e2e] .dot').classList.contains('null')"));
    await p.stopProgram();
  });
  t.test('a dangling pointer after free has a red, dashed arrow to the freed block', async (p) => {
    await dbg(p, PTRS, 17);
    const a = (await arrowFrom(p, 'dang'))[0];
    p.assert.ok(a);
    p.assert.equal(a.bad, true);
    p.assert.equal(a.headBad, true);
    p.assert.equal(a.toSeg, 'heap');
    const dash = await p.ev("getComputedStyle(document.querySelector('#panel-memory svg path.bad')).strokeDasharray");
    p.assert.notEqual(dash, 'none');
    await mark(p, 'dang', '.v', { frame: 'main' });
    p.assert.ok(await p.ev("document.querySelector('[data-e2e] .dot').classList.contains('bad')"));
    await p.stopProgram();
  });
  t.test('the same pointer is good before the free and bad after it', async (p) => {
    await dbg(p, PTRS, 16);
    p.assert.equal((await arrowFrom(p, 'dang'))[0].bad, false);
    await p.step('over');
    p.assert.equal((await arrowFrom(p, 'dang'))[0].bad, true);
    await p.stopProgram();
  });
  t.test('a bad arrow is drawn in a different colour from a good one', async (p) => {
    await dbg(p, PTRS, 17);
    await waitArrows(p);
    const c = await p.ev("[getComputedStyle(document.querySelector('#panel-memory svg path.bad')).stroke, getComputedStyle(document.querySelector('#panel-memory svg path:not(.bad):not(.head)')).stroke]");
    p.assert.notEqual(c[0], c[1]);
    await p.stopProgram();
  });
  t.test('a pointer to a pointer gives two arrows: pp to px and px to x', async (p) => {
    await dbg(p, PTRS, 17);
    const all = await waitArrows(p);
    p.assert.deepEqual(all.filter((a) => a.from === 'pp').map((a) => a.to), ['px']);
    p.assert.deepEqual(all.filter((a) => a.from === 'px').map((a) => a.to), ['x']);
    await p.stopProgram();
  });
  t.test('every non-NULL pointer of the program has exactly one arrow', async (p) => {
    await dbg(p, PTRS, 17);
    const all = await waitArrows(p);
    p.assert.deepEqual(all.map((a) => a.from).sort(), ['dang', 'pg', 'ph', 'pm', 'pp', 'ps', 'px']);
    p.assert.equal(await p.count('#panel-memory svg path.head'), 7);
    await p.stopProgram();
  });
  t.test('a linked list of 4 nodes gives a chain of arrows through the heap', async (p) => {
    await dbg(p, LIST, 13);
    const all = await waitArrows(p);
    const head = all.filter((a) => a.from === 'head');
    p.assert.equal(head.length, 1);
    p.assert.equal(head[0].toSeg, 'heap');
    const nexts = all.filter((a) => a.from === '.next');
    p.assert.equal(nexts.length, 3);
    for (const a of nexts) p.assert.equal(a.toSeg, 'heap');
    p.assert.equal(new Set(nexts.map((a) => a.toA)).size, 3);
    p.assert.equal(await p.count('#panel-memory .seg.heap .blk'), 4);
    await p.stopProgram();
  });
  t.test('the list chain visits the nodes 3, 2, 1, 0 and ends in NULL', async (p) => {
    await dbg(p, LIST, 13);
    const all = await waitArrows(p);
    const heap = await rowsIn(p, '.seg.heap');
    const valueAt = (a) => { const i = heap.findIndex((r) => r.a === a && r.n === '.v'); return heap[i].v; };
    const nextOf = (a) => { const i = heap.findIndex((r) => r.a === a && r.n === '.v'); return heap[i + 1]; };
    let at = all.find((a) => a.from === 'head').toA;
    const seen = [];
    for (let k = 0; k < 4; k++) {
      seen.push(valueAt(at));
      const nx = nextOf(at);
      if (nx.v === 'NULL') break;
      at = '0x' + nx.v.replace(/^0x/, '');
    }
    p.assert.deepEqual(seen, ['3', '2', '1', '0']);
    p.assert.equal(heap.filter((r) => r.n === '.next' && r.v === 'NULL').length, 1);
    await p.stopProgram();
  });
  t.test('the list nodes are typed as struct node because pointers point at them', async (p) => {
    await dbg(p, LIST, 13);
    const heap = await rowsIn(p, '.seg.heap');
    p.assert.equal(heap.filter((r) => r.n === '*' && r.v === 'struct node').length, 4);
    await p.stopProgram();
  });
  t.test('a pointer to a struct member lands on that member', async (p) => {
    const src = '#include <stdio.h>\nstruct pt { int x; int y; };\nint main(void)\n{\n    struct pt v = {1, 2};\n    int *py = &v.y;\n    printf("%d\\n", *py);\n    return 0;\n}\n';
    await dbg(p, src, 7);
    const a = (await arrowFrom(p, 'py'))[0];
    p.assert.deepEqual([a.to, a.toV], ['.y', '2']);
    await p.stopProgram();
  });
  t.test('a pointer into the middle of a literal lands on the literal', async (p) => {
    const src = '#include <stdio.h>\nint main(void)\n{\n    const char *w = "abcdef";\n    const char *mid = w + 3;\n    printf("%s\\n", mid);\n    return 0;\n}\n';
    await dbg(p, src, 6);
    const a = (await arrowFrom(p, 'mid'))[0];
    p.assert.deepEqual([a.to, a.toSeg], ['line 4', 'ro']);
    await p.stopProgram();
  });
  t.test('a function pointer gets an arrow to the function in the code list', async (p) => {
    const src = '#include <stdio.h>\nint twice(int v) { return v * 2; }\nint main(void)\n{\n    int (*fp)(int) = twice;\n    printf("%d\\n", fp(4));\n    return 0;\n}\n';
    await dbg(p, src, 6);
    const a = (await arrowFrom(p, 'fp'))[0];
    p.assert.deepEqual([a.to, a.toSeg], ['twice()', 'text']);
    await p.stopProgram();
  });
  t.test('a pointer\'s tooltip says what it points at', async (p) => {
    await dbg(p, PTRS, 17);
    p.assert.match((await row(p, 'px', { frame: 'main' })).vtitle, /points at .*x/);
    p.assert.match((await row(p, 'pg', { frame: 'main' })).vtitle, /points at global 'gv'/);
    await p.stopProgram();
  });
  t.test('a new pointer gets its arrow after the step that sets it', async (p) => {
    await dbg(p, PTRS, 8);
    const before = (await arrowFrom(p, 'px')).length;
    await p.step('over');
    p.assert.equal((await arrowFrom(p, 'px')).length, 1);
    p.assert.ok(before === 0 || (await arrowFrom(p, 'px'))[0].to === 'x');
    await p.stopProgram();
  });
  t.test('the arrows layer does not catch the mouse', async (p) => {
    await dbg(p, PTRS, 17);
    await waitArrows(p);
    p.assert.equal(await p.ev("getComputedStyle(document.querySelector('#panel-memory svg.mem-svg')).pointerEvents"), 'none');
    await p.stopProgram();
  });

  // ---- hovering a pointer ------------------------------------------------------------------------------
  t.test('hovering a pointer highlights its arrow and its target', async (p) => {
    await dbg(p, PTRS, 17);
    await waitArrows(p);
    await p.hover(await mark(p, 'px', '.v', { frame: 'main' }));
    p.assert.equal(await p.count('#panel-memory svg path.hl'), 1);
    p.assert.ok((await row(p, 'x', { frame: 'main' })).cls.includes('target'));
    await p.stopProgram();
  });
  t.test('moving the mouse away removes the highlight', async (p) => {
    await dbg(p, PTRS, 17);
    await waitArrows(p);
    await p.hover(await mark(p, 'px', '.v', { frame: 'main' }));
    await p.hover('#panel-memory .legend');
    p.assert.equal(await p.count('#panel-memory svg path.hl'), 0);
    p.assert.ok(!(await row(p, 'x', { frame: 'main' })).cls.includes('target'));
    await p.stopProgram();
  });
  t.test('hovering a pointer to a pointer highlights the pointer it points at', async (p) => {
    await dbg(p, PTRS, 17);
    await waitArrows(p);
    await p.hover(await mark(p, 'pp', '.v', { frame: 'main' }));
    p.assert.ok((await row(p, 'px', { frame: 'main' })).cls.includes('target'));
    p.assert.ok(!(await row(p, 'x', { frame: 'main' })).cls.includes('target'));
    await p.stopProgram();
  });
  t.test('hovering a heap pointer highlights the block element', async (p) => {
    await dbg(p, PTRS, 17);
    await waitArrows(p);
    await p.hover(await mark(p, 'ph', '.v', { frame: 'main' }));
    const hl = (await rowsIn(p, '.seg.heap')).filter((r) => r.cls.includes('target')).map((r) => r.n);
    p.assert.deepEqual(hl, ['[0]']);
    await p.stopProgram();
  });
  t.test('a highlighted arrow is drawn thicker', async (p) => {
    await dbg(p, PTRS, 17);
    await waitArrows(p);
    await p.hover(await mark(p, 'pg', '.v', { frame: 'main' }));
    const w = await p.ev("[parseFloat(getComputedStyle(document.querySelector('#panel-memory svg path.hl')).strokeWidth), parseFloat(getComputedStyle(document.querySelector('#panel-memory svg path:not(.hl):not(.head)')).strokeWidth)]");
    p.assert.ok(w[0] > w[1]);
    await p.stopProgram();
  });

  // ---- the toolbar -------------------------------------------------------------------------------------
  const boxes = (p) => p.ev("[...document.querySelectorAll('#panel-memory .mem-bar label')].map(l => ({ label: l.textContent, on: l.querySelector('input').checked, title: l.title }))");
  const clickBox = (p, label) => p.click('#panel-memory .mem-bar label', label);
  t.test('the toolbar has four checkboxes: arrows, library frames, addresses, types', async (p) => {
    await dbg(p, STEPS0);
    p.assert.deepEqual((await boxes(p)).map((b) => b.label), ['arrows', 'library frames', 'addresses', 'types']);
    await p.stopProgram();
  });
  t.test('by default arrows and addresses are on, library frames and types are off', async (p) => {
    await dbg(p, STEPS0);
    p.assert.deepEqual((await boxes(p)).map((b) => b.on), [true, false, true, false]);
    await p.stopProgram();
  });
  t.test('each checkbox explains itself in a tooltip', async (p) => {
    await dbg(p, STEPS0);
    const tt = (await boxes(p)).map((b) => b.title);
    p.assert.match(tt[0], /arrow from each pointer/);
    p.assert.match(tt[1], /_start and the FILE table/);
    p.assert.match(tt[2], /address of every value/);
    p.assert.match(tt[3], /type of every value/);
    await p.stopProgram();
  });
  t.test('turning arrows off removes every arrow but keeps the dots', async (p) => {
    await dbg(p, PTRS, 17);
    await waitArrows(p);
    await clickBox(p, 'arrows');
    await p.sleep(80);
    p.assert.equal(await p.count('#panel-memory svg.mem-svg'), 0);
    p.assert.ok((await p.count('#panel-memory .dot')) >= 7);
    p.assert.equal(await p.ev('SEE.app.memview.opts.arrows'), false);
    await p.stopProgram();
  });
  t.test('turning arrows back on draws them again', async (p) => {
    await dbg(p, PTRS, 17);
    await clickBox(p, 'arrows');
    await clickBox(p, 'arrows');
    p.assert.equal((await waitArrows(p)).length, 7);
    await p.stopProgram();
  });
  t.test('with arrows off they stay off after a step', async (p) => {
    await dbg(p, PTRS, 16);
    await clickBox(p, 'arrows');
    await p.step('over');
    await p.sleep(80);
    p.assert.equal(await p.count('#panel-memory svg.mem-svg'), 0);
    await p.stopProgram();
  });
  t.test('library frames shows _start above main, dimmed as a system frame', async (p) => {
    await dbg(p, STEPS0);
    p.assert.deepEqual(await frameNames(p), ['main()']);
    await clickBox(p, 'library frames');
    const fc = await frameClasses(p);
    p.assert.deepEqual(fc.map((f) => f.name), ['_start()', 'main()']);
    p.assert.deepEqual(fc.map((f) => f.sys), [true, false]);
    p.assert.ok(parseFloat(await p.ev("getComputedStyle(document.querySelector('#panel-memory .frame.sys')).opacity")) < 1);
    await p.stopProgram();
  });
  t.test('library frames shows the FILE table and the other library globals', async (p) => {
    await dbg(p, STEPS0);
    p.assert.ok(!(await hasRow(p, '_iob', '.seg.data')));
    await clickBox(p, 'library frames');
    const names = (await rowsIn(p, '.seg.data')).map((r) => r.n);
    for (const n of ['_iob', 'errno']) p.assert.ok(names.includes(n), n + ' in ' + names.join(','));
    p.assert.match((await row(p, '_iob', '.seg.data')).v, /× struct _iobuf$/);
    await p.stopProgram();
  });
  t.test('library frames lists the library functions in the code segment', async (p) => {
    await dbg(p, STEPS0);
    p.assert.ok(!(await hasRow(p, '_start()', '.seg.text')));
    await clickBox(p, 'library frames');
    p.assert.ok(await hasRow(p, '_start()', '.seg.text'));
    p.assert.ok((await row(p, '_start()', '.seg.text')).title.includes('(C library)'));
    await p.stopProgram();
  });
  t.test('library frames shows each heap block\'s header', async (p) => {
    await dbg(p, PTRS, 17);
    p.assert.equal(await p.count('#panel-memory .blk .hdr'), 0);
    await clickBox(p, 'library frames');
    const hdr = await p.texts('#panel-memory .blk .hdr');
    p.assert.ok(hdr.length >= 2);
    p.assert.match(hdr[0], /^0x[0-9a-f]{8}\s+header: size \d+, tag 0x[0-9a-f]+$/);
    await p.stopProgram();
  });
  t.test('turning library frames off hides _start again', async (p) => {
    await dbg(p, STEPS0);
    await clickBox(p, 'library frames');
    await clickBox(p, 'library frames');
    p.assert.deepEqual(await frameNames(p), ['main()']);
    await p.stopProgram();
  });
  t.test('turning addresses off hides the address column', async (p) => {
    await dbg(p, PTRS, 17);
    await clickBox(p, 'addresses');
    p.assert.ok(await p.exists('#panel-memory .mem.no-addrs'));
    const rs = await rowsIn(p, { frame: 'main' });
    p.assert.ok(rs.every((r) => r.a === ''));
    p.assert.equal(await p.ev("[...document.querySelectorAll('#panel-memory .frame .cell .a')].filter(a => a.getBoundingClientRect().width > 0).length"), 0);
    await p.stopProgram();
  });
  t.test('with addresses off the code list still shows function addresses', async (p) => {
    await dbg(p, PTRS, 17);
    await clickBox(p, 'addresses');
    p.assert.match((await row(p, 'main()', '.seg.text')).a, /^0x[0-9a-f]{8}$/);
    await p.stopProgram();
  });
  t.test('with addresses off the arrows still find their targets', async (p) => {
    await dbg(p, PTRS, 17);
    await clickBox(p, 'addresses');
    const all = await waitArrows(p);
    p.assert.equal(all.length, 7);
    p.assert.equal(all.find((a) => a.from === 'px').to, 'x');
    await p.stopProgram();
  });
  t.test('turning types on shows the type column', async (p) => {
    await dbg(p, PTRS, 17);
    p.assert.ok(await p.exists('#panel-memory .mem.no-types'));
    p.assert.equal(await p.ev("[...document.querySelectorAll('#panel-memory .frame .cell .t')].filter(a => a.getBoundingClientRect().width > 0).length"), 0);
    await clickBox(p, 'types');
    p.assert.ok(!(await p.exists('#panel-memory .mem.no-types')));
    p.assert.ok((await p.ev("[...document.querySelectorAll('#panel-memory .frame .cell .t')].filter(a => a.getBoundingClientRect().width > 0).length")) > 0);
    p.assert.equal((await row(p, 'pp', { frame: 'main' })).t, 'int **');
    await p.stopProgram();
  });
  t.test('a long type name is shortened with an ellipsis and given in full in its tooltip', async (p) => {
    const src = '#include <stdio.h>\nstruct a_rather_long_struct_name { int v; };\nint main(void)\n{\n    struct a_rather_long_struct_name w = {1};\n    printf("%d\\n", w.v);\n    return 0;\n}\n';
    await dbg(p, src, 6);
    await clickBox(p, 'types');
    await mark(p, 'w', '.t', { frame: 'main' });
    p.assert.match(await p.text('[data-e2e]'), /…$/);
    p.assert.equal(await p.attr('[data-e2e]', 'title'), 'struct a_rather_long_struct_name');
    await p.stopProgram();
  });
  for (const [label, key, value] of [['arrows', 'arrows', false], ['library frames', 'lib', true], ['addresses', 'addrs', false], ['types', 'types', true]]) {
    t.test(`the "${label}" choice is remembered after a reload`, async (p) => {
      await dbg(p, STEPS0);
      await clickBox(p, label);
      p.assert.equal((await p.ev("JSON.parse(localStorage.getItem('see.memOpts'))"))[key], value);
      await p.stopProgram();
      await p.reload();
      p.assert.equal(await p.ev(`SEE.app.memview.opts[${JSON.stringify(key)}]`), value);
      await dbg(p, STEPS0);
      const b = (await boxes(p)).find((x) => x.label === label);
      p.assert.equal(b.on, value);
      await p.stopProgram();
      await resetMem(p);
    });
  }

  // ---- selecting a frame ---------------------------------------------------------------------------
  t.test('clicking a caller\'s frame header selects that frame', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    p.assert.equal(await p.fnName(), 'add');
    await p.click('#panel-memory .frame-head', 'main()');
    p.assert.equal(await p.ev('SEE.app.frameIndex'), 1);
    p.assert.deepEqual((await frameClasses(p)).map((f) => [f.name, f.sel, f.top]), [['main()', true, false], ['add()', false, true]]);
    await p.stopProgram();
  });
  t.test('clicking the top frame header selects it again', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.click('#panel-memory .frame-head', 'main()');
    await p.click('#panel-memory .frame-head', 'add()');
    p.assert.equal(await p.ev('SEE.app.frameIndex'), 0);
    p.assert.deepEqual((await frameClasses(p)).map((f) => f.sel), [false, true]);
    await p.stopProgram();
  });
  t.test('switching frames redraws the picture', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.ev("window.__oldMem = document.querySelector('#panel-memory .mem')");
    await p.click('#panel-memory .frame-head', 'main()');
    p.assert.equal(await p.ev('window.__oldMem.isConnected'), false);
    p.assert.ok(await p.exists('#panel-memory .mem'));
    await p.stopProgram();
  });
  t.test('a selected caller frame shows its line in the editor', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.click('#panel-memory .frame-head', 'main()');
    p.assert.equal(await p.ev('SEE.app.active.editor.marks.frame'), 15);
    await p.stopProgram();
  });
  t.test('expressions are evaluated in the selected frame', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.click('#panel-memory .frame-head', 'main()');
    p.assert.equal(await p.cval('x'), 1);
    p.assert.equal(await p.cval('y'), 2);
    await p.stopProgram();
  });
  t.test('the next step selects the top frame again', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.click('#panel-memory .frame-head', 'main()');
    await p.step('over');
    p.assert.equal(await p.ev('SEE.app.frameIndex'), 0);
    p.assert.deepEqual((await frameClasses(p)).map((f) => f.sel), [false, true]);
    await p.stopProgram();
  });
  t.test('selecting a frame in the Variables call stack outlines it in the picture', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.ev('SEE.app.selectFrame(1)');
    await p.showRight('memory');
    p.assert.deepEqual((await frameClasses(p)).map((f) => f.sel), [true, false]);
    await p.stopProgram();
  });

  // ---- changing values in place --------------------------------------------------------------------
  t.test('clicking a value opens an editor holding the current value', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'x', '.v', { frame: 'main' }));
    p.assert.equal(await p.count('#panel-memory .v input'), 1);
    p.assert.equal(await p.ev("document.querySelector('#panel-memory .v input').value"), '1');
    p.assert.equal(await p.ev("document.activeElement === document.querySelector('#panel-memory .v input')"), true);
    p.assert.equal(await p.attr('#panel-memory .v input', 'aria-label'), 'New value for x');
    await p.key('Escape');
    await p.stopProgram();
  });
  t.test('typing a new value and Enter changes it', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'x', '.v', { frame: 'main' }));
    await p.type('42');
    await p.key('Enter');
    p.assert.equal(await p.cval('x'), 42);
    p.assert.equal((await row(p, 'x', { frame: 'main' })).v, '42');
    p.assert.equal(await p.count('#panel-memory .v input'), 0);
    await p.stopProgram();
  });
  t.test('a change says so in the status bar', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'x', '.v', { frame: 'main' }));
    await p.type('9');
    await p.key('Enter');
    p.assert.match(await p.status(), /Changed x\. The program carries on with the new value\./);
    await p.stopProgram();
  });
  t.test('Escape cancels the change', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'x', '.v', { frame: 'main' }));
    await p.type('77');
    await p.key('Escape');
    p.assert.equal(await p.cval('x'), 1);
    p.assert.equal((await row(p, 'x', { frame: 'main' })).v, '1');
    p.assert.equal(await p.count('#panel-memory .v input'), 0);
    await p.stopProgram();
  });
  t.test('invalid text gives an error toast and leaves the value alone', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'x', '.v', { frame: 'main' }));
    await p.type('nosuchname');
    await p.key('Enter');
    await p.wait("[...document.querySelectorAll('.toast')].some(t => /nosuchname/.test(t.innerText))", 3000);
    p.assert.equal(await p.cval('x'), 1);
    p.assert.equal((await row(p, 'x', { frame: 'main' })).v, '1');
    await p.stopProgram();
  });
  t.test('a string that does not fit a char array is refused with a toast', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'name', '.v', { frame: 'main' }));
    p.assert.equal(await p.ev("document.querySelector('#panel-memory .v input').value"), '"hello"');
    await p.ev("document.querySelector('#panel-memory .v input').value = '\"much too long\"'");
    await p.key('Enter');
    await p.waitToast(/the array holds 6 chars/);
    p.assert.equal((await row(p, 'name', { frame: 'main' })).v, '"hello"');
    await p.stopProgram();
  });
  t.test('a char array takes a new string in quotes', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'name', '.v', { frame: 'main' }));
    await p.ev("document.querySelector('#panel-memory .v input').value = '\"hey\"'");
    await p.key('Enter');
    p.assert.equal((await row(p, 'name', { frame: 'main' })).v, '"hey"');
    await p.stopProgram();
  });
  t.test('a double takes a decimal value', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'd', '.v', { frame: 'main' }));
    p.assert.equal(await p.ev("document.querySelector('#panel-memory .v input').value"), '1.5');
    await p.type('3.25');
    await p.key('Enter');
    p.assert.equal(await p.cval('d'), 3.25);
    p.assert.equal((await row(p, 'd', { frame: 'main' })).v, '3.25');
    await p.stopProgram();
  });
  t.test('a char takes a character literal', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'ch', '.v', { frame: 'main' }));
    p.assert.equal(await p.ev("document.querySelector('#panel-memory .v input').value"), "'a'");
    await p.ev("document.querySelector('#panel-memory .v input').value = \"'Z'\"");
    await p.key('Enter');
    p.assert.equal(await p.cval('ch'), 90);
    await p.stopProgram();
  });
  t.test('a value can be set from a C expression', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'x', '.v', { frame: 'main' }));
    await p.ev("document.querySelector('#panel-memory .v input').value = 'y * 10 + 3'");
    await p.key('Enter');
    p.assert.equal(await p.cval('x'), 23);
    await p.stopProgram();
  });
  t.test('setting a pointer to NULL removes its arrow', async (p) => {
    // setValue documents NULL as accepted, but the expression evaluator has no NULL ("'NULL' undeclared"),
    // so typing NULL (or pressing Enter on a NULL pointer, whose editor starts with "NULL") gives an error toast
    await dbg(p, ADD, 16);
    p.assert.equal((await arrowFrom(p, 'q')).length, 1);
    await p.click(await mark(p, 'q', '.v', { frame: 'main' }));
    await p.ev("document.querySelector('#panel-memory .v input').value = 'NULL'");
    await p.key('Enter');
    p.assert.equal((await row(p, 'q', { frame: 'main' })).v, 'NULL');
    p.assert.equal((await arrowFrom(p, 'q')).length, 0);
    await p.stopProgram();
  });
  t.test('setting a pointer to 0 makes it NULL and removes its arrow', async (p) => {
    await dbg(p, ADD, 16);
    p.assert.equal((await arrowFrom(p, 'q')).length, 1);
    await p.click(await mark(p, 'q', '.v', { frame: 'main' }));
    await p.ev("document.querySelector('#panel-memory .v input').value = '0'");
    await p.key('Enter');
    p.assert.equal((await row(p, 'q', { frame: 'main' })).v, 'NULL');
    p.assert.equal((await arrowFrom(p, 'q')).length, 0);
    await mark(p, 'q', '.v', { frame: 'main' });
    p.assert.ok(await p.ev("document.querySelector('[data-e2e] .dot').classList.contains('null')"));
    await p.stopProgram();
  });
  t.test('pointing a pointer somewhere else moves its arrow', async (p) => {
    await dbg(p, ADD, 16);
    p.assert.equal((await arrowFrom(p, 'q'))[0].to, 'x');
    await p.click(await mark(p, 'q', '.v', { frame: 'main' }));
    await p.ev("document.querySelector('#panel-memory .v input').value = '&y'");
    await p.key('Enter');
    p.assert.equal((await arrowFrom(p, 'q'))[0].to, 'y');
    await p.stopProgram();
  });
  t.test('a changed value is yellow and its tooltip says the debugger changed it', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'y', '.v', { frame: 'main' }));
    await p.type('5');
    await p.key('Enter');
    const r = await row(p, 'y', { frame: 'main' });
    p.assert.ok(r.cls.includes('changed'));
    p.assert.match(r.title, /last changed from the debugger/);
    await p.stopProgram();
  });
  t.test('the program carries on with the changed value', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'x', '.v', { frame: 'main' }));
    await p.type('10');
    await p.key('Enter');
    await p.step('over');
    p.assert.equal(await p.cval('u'), 12);
    await p.step('over');
    p.assert.equal(await p.cval('x'), 11);
    await p.stopProgram();
  });
  t.test('leaving the editor by clicking elsewhere keeps the new value', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'x', '.v', { frame: 'main' }));
    await p.type('8');
    await p.click('#panel-memory .legend');
    p.assert.equal(await p.cval('x'), 8);
    await p.stopProgram();
  });
  t.test('a heap element can be changed in place', async (p) => {
    await dbg(p, PTRS, 17);
    const heap = await rowsIn(p, '.seg.heap');
    p.assert.ok(heap.some((r) => r.n === '[1]'));
    await p.click(await mark(p, '[1]', '.v', '.seg.heap'));
    await p.type('55');
    await p.key('Enter');
    p.assert.equal(await p.cval('ph[1]'), 55);
    await p.stopProgram();
  });
  t.test('a global can be changed in place', async (p) => {
    await dbg(p, PTRS, 17);
    await p.click(await mark(p, 'gv', '.v', '.seg.data'));
    await p.type('70');
    await p.key('Enter');
    p.assert.equal(await p.cval('gv'), 70);
    p.assert.equal((await row(p, 'gv', '.seg.data')).v, '70');
    await p.stopProgram();
  });
  t.test('an array or struct row is not editable as a whole', async (p) => {
    await dbg(p, PTRS, 17);
    await p.click(await mark(p, 'arr', '.v', { frame: 'main' }));
    p.assert.equal(await p.count('#panel-memory .v input'), 0);
    await p.stopProgram();
  });
  t.test('the link rows (return to, saved fp) are not editable', async (p) => {
    await dbg(p, ADD, 16);
    await p.click(await mark(p, 'return to', '.v', { frame: 'main' }));
    p.assert.equal(await p.count('#panel-memory .v input'), 0);
    await p.stopProgram();
  });
  t.test('a local of a selected caller frame can be changed', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.click('#panel-memory .frame-head', 'main()');
    await p.click(await mark(p, 'y', '.v', { frame: 'main' }));
    await p.type('6');
    await p.key('Enter');
    p.assert.equal(await p.cval('y', 1), 6);
    await p.stopProgram();
  });
  t.test('changing a parameter changes what the function computes', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.click(await mark(p, 'b', '.v', { frame: 'add' }));
    await p.type('100');
    await p.key('Enter');
    await p.step('out');
    await p.step('over');
    p.assert.equal(await p.cval('u'), 101);
    await p.stopProgram();
  });

  // ---- the fault, returned and exit boxes ------------------------------------------------------------
  t.test('after a crash the fault box says what happened and where', async (p) => {
    await dbg(p, recProg(2));
    await p.cont();
    p.assert.equal(await p.state(), 'faulted');
    const fb = await p.text('#panel-memory .fault-box');
    p.assert.match(fb, /^Segmentation fault: NULL pointer dereference/);
    p.assert.match(fb, /at line 4 in rec\(\)/);
    p.assert.equal(await p.text('#panel-memory .fault-box b'), 'Segmentation fault: ');
    await p.stopProgram();
  });
  t.test('a crash brings the memory picture to the front', async (p) => {
    await dbg(p, recProg(2));
    await p.showRight('vars');
    await p.cont();
    p.assert.equal(await p.ev('SEE.app.rightTab'), 'memory');
    p.assert.ok(await p.visible('#panel-memory .fault-box'));
    await p.stopProgram();
  });
  t.test('after a crash the picture still shows the frames at the moment of the fault', async (p) => {
    await dbg(p, recProg(2));
    await p.cont();
    p.assert.deepEqual(await frameNames(p), ['main()', 'rec()', 'rec()', 'rec()']);
    const n = (await rowsIn(p, { frame: 'rec' })).filter((r) => r.n === 'n').map((r) => r.v);
    p.assert.deepEqual(n, ['2', '1', '0']);
    await p.stopProgram();
  });
  t.test('a double free shows a fault box naming the line of the first free', async (p) => {
    const src = '#include <stdlib.h>\nint main(void)\n{\n    int *a = malloc(4);\n    free(a);\n    free(a);\n    return 0;\n}\n';
    await dbg(p, src);
    await p.cont();
    p.assert.equal(await p.state(), 'faulted');
    const fb = await p.text('#panel-memory .fault-box');
    p.assert.match(fb, /double free/);
    p.assert.match(fb, /already freed at line 5/);
    p.assert.match(fb, /at line 6 in main\(\)/);
    await p.stopProgram();
  });
  t.test('dividing by zero shows a fault box with the fault title', async (p) => {
    const src = '#include <stdio.h>\nint main(void)\n{\n    int z = 0;\n    int r = 10 / z;\n    printf("%d\\n", r);\n    return 0;\n}\n';
    await dbg(p, src);
    await p.cont();
    p.assert.equal(await p.state(), 'faulted');
    const title = await p.ev('SEE.app.vm.fault.title');
    p.assert.ok((await p.text('#panel-memory .fault-box')).startsWith(title + ': '));
    p.assert.match(await p.text('#panel-memory .fault-box'), /at line 5 in main\(\)/);
    await p.stopProgram();
  });
  t.test('a paused program has no fault box', async (p) => {
    await dbg(p, recProg(2));
    p.assert.equal(await p.count('#panel-memory .fault-box'), 0);
    await p.stopProgram();
  });
  t.test('after step out a box says what the function returned', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.step('out');
    p.assert.equal(await p.text('#panel-memory .ret-box'), 'add() returned 3');
    await p.stopProgram();
  });
  t.test('the returned box goes away after the next step', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    await p.step('out');
    await p.step('over');
    p.assert.equal(await p.count('#panel-memory .ret-box'), 0);
    await p.stopProgram();
  });
  t.test('a void function "returned nothing (void)"', async (p) => {
    const src = '#include <stdio.h>\nint hits;\nvoid hit(void)\n{\n    hits++;\n}\nint main(void)\n{\n    hit();\n    printf("%d\\n", hits);\n    return 0;\n}\n';
    await dbg(p, src, 9);
    await p.step('into');
    await p.step('out');
    p.assert.equal(await p.text('#panel-memory .ret-box'), 'hit() returned nothing (void)');
    await p.stopProgram();
  });
  t.test('a double function shows its returned value', async (p) => {
    const src = '#include <stdio.h>\ndouble half(int v)\n{\n    return v / 2.0;\n}\nint main(void)\n{\n    double h = half(5);\n    printf("%f\\n", h);\n    return 0;\n}\n';
    await dbg(p, src, 8);
    await p.step('into');
    await p.step('out');
    p.assert.equal(await p.text('#panel-memory .ret-box'), 'half() returned 2.5');
    await p.stopProgram();
  });
  t.test('a function returning a struct says it returned a struct', async (p) => {
    const src = '#include <stdio.h>\nstruct pt { int x; int y; };\nstruct pt mk(int a)\n{\n    struct pt r;\n    r.x = a;\n    r.y = a + 1;\n    return r;\n}\nint main(void)\n{\n    struct pt v = mk(3);\n    printf("%d\\n", v.y);\n    return 0;\n}\n';
    await dbg(p, src, 12);
    await p.step('into');
    await p.step('out');
    p.assert.equal(await p.text('#panel-memory .ret-box'), 'mk() returned a struct pt');
    await p.stopProgram();
  });
  t.test('when the program ends the exit box gives the status and the leak sentence', async (p) => {
    await dbg(p, '#include <stdlib.h>\nint main(void)\n{\n    char *s = malloc(8);\n    int *t = malloc(12);\n    free(t);\n    return 0;\n}\n');
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.equal(await p.text('#panel-memory .ret-box'), 'The program has ended with exit status 0. 1 heap block was never freed (8 bytes): a memory leak.');
    await p.stopProgram();
  });
  t.test('two leaked blocks are counted with their total size', async (p) => {
    await dbg(p, '#include <stdlib.h>\nint main(void)\n{\n    char *s = malloc(8);\n    int *t = malloc(12);\n    return 0;\n}\n');
    await p.cont();
    p.assert.match(await p.text('#panel-memory .ret-box'), /2 heap blocks were never freed \(20 bytes\): a memory leak\.$/);
    await p.stopProgram();
  });
  t.test('when every block was freed the exit box says so', async (p) => {
    await dbg(p, '#include <stdlib.h>\nint main(void)\n{\n    int *t = malloc(12);\n    free(t);\n    return 0;\n}\n');
    await p.cont();
    p.assert.equal(await p.text('#panel-memory .ret-box'), 'The program has ended with exit status 0. Every malloc block was freed.');
    await p.stopProgram();
  });
  t.test('the exit box shows a non-zero exit status', async (p) => {
    await dbg(p, 'int main(void)\n{\n    int r = 3;\n    return r;\n}\n');
    await p.cont();
    p.assert.match(await p.text('#panel-memory .ret-box'), /^The program has ended with exit status 3\./);
    await p.stopProgram();
  });
  t.test('after the end the stack has no frames left', async (p) => {
    await dbg(p, 'int main(void)\n{\n    int r = 3;\n    return r;\n}\n');
    await p.cont();
    p.assert.equal(await p.count('#panel-memory .frame'), 0);
    p.assert.match(await p.text('#panel-memory .seg.stack'), /no frames/);
    await p.stopProgram();
  });

  // ---- deep recursion -------------------------------------------------------------------------------
  t.test('very deep recursion collapses the middle frames into one line', async (p) => {
    await dbg(p, recProg(50));
    await p.cont();
    p.assert.equal(await p.count('#panel-memory .frame'), 33);
    const gaps = await p.texts('#panel-memory .seg.stack > .gap');
    p.assert.equal(gaps[0], '… 19 more frames of rec() and others …');
    await p.stopProgram();
  });
  t.test('the collapsed stack keeps main and the first calls at the top and the innermost at the bottom', async (p) => {
    await dbg(p, recProg(50));
    await p.cont();
    const fc = await frameClasses(p);
    p.assert.deepEqual(fc.slice(0, 3).map((f) => f.name), ['main()', 'rec()', 'rec()']);
    p.assert.equal(fc[fc.length - 1].top, true);
    const ns = (await rowsIn(p, { frame: 'rec' })).filter((r) => r.n === 'n').map((r) => r.v);
    p.assert.deepEqual(ns.slice(0, 2), ['50', '49']);
    p.assert.equal(ns[ns.length - 1], '0');
    await p.stopProgram();
  });
  t.test('the gap line sits between the third frame and the rest', async (p) => {
    await dbg(p, recProg(50));
    await p.cont();
    const order = await p.ev("[...document.querySelector('#panel-memory .seg.stack').children].map(c => c.className.split(' ')[0])");
    p.assert.deepEqual(order.slice(0, 5), ['seg-head', 'frame', 'frame', 'frame', 'gap']);
    await p.stopProgram();
  });
  t.test('40 frames are all shown without a gap', async (p) => {
    await dbg(p, recProg(38));
    await p.cont();
    p.assert.equal(await p.count('#panel-memory .frame'), 40);
    p.assert.equal(await p.count('#panel-memory .seg.stack > .gap'), 1);
    await p.stopProgram();
  });
  t.test('41 frames collapse 8 of them', async (p) => {
    await dbg(p, recProg(39));
    await p.cont();
    p.assert.equal(await p.count('#panel-memory .frame'), 33);
    p.assert.equal((await p.texts('#panel-memory .seg.stack > .gap'))[0], '… 8 more frames of rec() and others …');
    await p.stopProgram();
  });

  // ---- redrawing after Back --------------------------------------------------------------------------
  t.test('stepping back redraws the old value', async (p) => {
    await dbg(p, ADD, 17);
    await p.step('over');
    p.assert.equal((await row(p, 'x', { frame: 'main' })).v, '2');
    await p.back();
    p.assert.equal(await p.line(), 17);
    p.assert.equal((await row(p, 'x', { frame: 'main' })).v, '1');
    await p.stopProgram();
  });
  t.test('stepping back draws a new picture', async (p) => {
    await dbg(p, ADD, 17);
    await p.step('over');
    await p.ev("window.__oldMem = document.querySelector('#panel-memory .mem')");
    await p.back();
    p.assert.equal(await p.ev('window.__oldMem.isConnected'), false);
    p.assert.ok(await p.exists('#panel-memory .mem .seg.stack'));
    await p.stopProgram();
  });
  t.test('stepping back over a malloc takes its block off the heap', async (p) => {
    await dbg(p, PTRS, 12);
    await p.step('over');
    p.assert.equal(await p.count('#panel-memory .blk'), 1);
    await p.back();
    p.assert.equal(await p.count('#panel-memory .blk'), 0);
    p.assert.match(await p.text('#panel-memory .seg.heap'), /nothing allocated yet/);
    await p.stopProgram();
  });
  t.test('stepping back out of a call removes the callee frame', async (p) => {
    await dbg(p, ADD, 16);
    await p.step('into');
    p.assert.equal(await p.count('#panel-memory .frame'), 2);
    await p.back();
    p.assert.equal(await p.fnName(), 'main');
    p.assert.deepEqual(await frameNames(p), ['main()']);
    await p.stopProgram();
  });
  t.test('stepping back over a free makes the block live again', async (p) => {
    await dbg(p, PTRS, 16);
    await p.step('over');
    p.assert.equal(await p.count('#panel-memory .blk.freed'), 1);
    await p.back();
    p.assert.equal(await p.count('#panel-memory .blk.freed'), 0);
    p.assert.equal((await arrowFrom(p, 'dang'))[0].bad, false);
    await p.stopProgram();
  });
  t.test('stepping back from the end removes the exit box and brings main\'s frame back', async (p) => {
    await dbg(p, ADD);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.equal(await p.count('#panel-memory .ret-box'), 1);
    await p.back();
    p.assert.equal(await p.state(), 'paused');
    if (await p.fnName() !== 'main') await p.back();
    p.assert.deepEqual(await frameNames(p), ['main()']);
    p.assert.equal(await p.count('#panel-memory .ret-box'), 0);
    await p.stopProgram();
  });
  t.test('arrows are drawn again after stepping back', async (p) => {
    await dbg(p, PTRS, 17);
    await p.step('over');
    await p.back();
    p.assert.equal((await waitArrows(p)).length, 7);
    await p.stopProgram();
  });

  // ---- a phone-sized screen --------------------------------------------------------------------------
  const PHONE = { width: 390, height: 800, mobile: true, touch: true };
  t.test('on a phone the segments are in a single column', async (p) => {
    await dbg(p, PTRS, 17);
    const cols = await p.ev("getComputedStyle(document.querySelector('#panel-memory .mem-cols')).gridTemplateColumns");
    p.assert.equal(cols.trim().split(/\s+/).length, 1, cols);
    const s = await p.rect('#panel-memory .seg.stack');
    const h = await p.rect('#panel-memory .seg.heap');
    p.assert.ok(h.y >= s.bottom - 1, 'heap below stack');
    p.assert.ok(Math.abs(h.x - s.x) < 2, 'same left edge');
    await p.stopProgram();
  }, { fresh: PHONE });
  t.test('on a phone the memory view does not scroll the page sideways', async (p) => {
    await dbg(p, PTRS, 17);
    p.assert.equal(await p.ev("document.getElementById('app').getAttribute('data-view')"), 'memory');
    p.assert.ok(await p.visible('#panel-memory .mem'));
    p.assert.ok(await p.noHScroll());
    const r = await p.rect('#panel-memory .mem');
    p.assert.ok(r.w <= 390, 'picture fits: ' + r.w);
    await p.stopProgram();
  }, { fresh: PHONE });
  t.test('on a phone the Memory tab of the bottom bar shows the picture', async (p) => {
    await p.debugProgram(PTRS);
    await p.click('#mview-code');
    p.assert.ok(!(await p.visible('#panel-memory')));
    await p.click('#mview-memory');
    p.assert.ok(await p.visible('#panel-memory .seg.stack'));
    p.assert.ok(await p.noHScroll());
    await p.stopProgram();
  }, { fresh: PHONE });
  t.test('on a phone the arrows are still drawn', async (p) => {
    await dbg(p, PTRS, 17);
    const all = await waitArrows(p);
    p.assert.equal(all.length, 7);
    p.assert.equal(all.find((a) => a.from === 'px').to, 'x');
    await p.stopProgram();
  }, { fresh: PHONE });
}
