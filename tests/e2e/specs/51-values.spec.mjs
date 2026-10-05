// Values while paused: the Variables panel, changing values there and in the memory picture, the
// Watch panel and watchpoints, the hover callout in the editor, and the Bytes panel.
const DIR = '/home/user/e2e';
const MAIN = DIR + '/main.c';
const src = (...lines) => lines.join('\n') + '\n';

const VARS = src(
  '#include <stdio.h>',                  // 1
  '#include <stdlib.h>',                 // 2
  'struct pt { int x; int y; };',        // 3
  'struct flags { unsigned lo : 3; unsigned hi : 5; };', // 4
  'int g = 7;',                          // 5
  'double gd = 1.5;',                    // 6
  'int f(int a, int b)',                 // 7
  '{',                                   // 8
  '    static int calls = 0;',           // 9
  '    int sum = a + b;',                // 10
  '    calls++;',                        // 11
  '    return sum;',                     // 12
  '}',                                   // 13
  'int main(void)',                      // 14
  '{',                                   // 15
  '    int x = 5;',                      // 16
  "    char c = 'q';",                   // 17
  '    double d = 2.5;',                 // 18
  '    int arr[4] = {1, 2, 3, 4};',      // 19
  '    struct pt pt = {3, 4};',          // 20
  '    struct flags fl;',                // 21
  '    char name[8] = "hi";',            // 22
  '    int *p = (int *)malloc(4 * sizeof(int));', // 23
  '    int *q = &x;',                    // 24
  '    const int k = 9;',                // 25
  '    int late;',                       // 26
  '    fl.lo = 5; fl.hi = 17;',          // 27
  '    p[0] = 10; p[1] = 20; p[2] = 30; p[3] = 40;', // 28
  '    late = f(x, 1);',                 // 29
  '    printf("%d %c %g %d %d %s %d %d %d\\n", x, c, d, arr[0], pt.x, name, *q, k, late);', // 30
  '    free(p);',                        // 31
  '    return 0;',                       // 32
  '}');                                  // 33

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
  '    int r = fact(4);',        // 10
  '    printf("%d\\n", r);',     // 11
  '    return 0;',               // 12
  '}');                          // 13

const FACT2 = src(
  '#include <stdio.h>',          // 1
  'int fact(int n)',             // 2
  '{',                           // 3
  '    int r;',                  // 4
  '    if (n <= 1)',             // 5
  '        return 1;',           // 6
  '    r = fact(n - 1);',        // 7
  '    return n * r;',           // 8
  '}',                           // 9
  'int main(void)',              // 10
  '{',                           // 11
  '    int r = fact(4);',        // 12
  '    printf("%d\\n", r);',     // 13
  '    return 0;',               // 14
  '}');                          // 15

const LIST = src(
  '#include <stdlib.h>',                         // 1
  'struct node { int v; struct node *next; };',  // 2
  'int main(void)',                              // 3
  '{',                                           // 4
  '    int a[3] = {4, 5, 6};',                   // 5
  '    struct node *n = (struct node *)malloc(sizeof(struct node));', // 6
  '    int *pa = a;',                            // 7
  '    n->v = 11;',                              // 8
  '    n->next = 0;',                            // 9
  '    a[1] = 50;',                              // 10
  '    a[2] = 60;',                              // 11
  '    free(n);',                                // 12
  '    return 0;',                               // 13
  '}');                                          // 14

const WP = src(
  'int g = 0;',             // 1
  'void bump(void)',        // 2
  '{',                      // 3
  '    g = g + 1;',         // 4
  '}',                      // 5
  'int main(void)',         // 6
  '{',                      // 7
  '    int x = 0;',         // 8
  '    int y = 0;',         // 9
  '    y = 1;',             // 10
  '    y = 2;',             // 11
  '    x = 5;',             // 12
  '    y = 3;',             // 13
  '    bump();',            // 14
  '    y = 4;',             // 15
  '    x = 5;',             // 16
  '    x = 6;',             // 17
  '    return x + y;',      // 18
  '}');                     // 19

async function clean(p) {
  await p.ev(`(() => { const a = SEE.app; if (a.vm) a.stop(); a.stopAnimate(); a.updateUI(); a.clearBreakpoints(); a.watchPanel.list = []; a.watchPanel.save(); a.settings.record = true; a.settings.libFrames = false; SEE.UI.closeAllModals(); SEE.UI.closeMenus(); a.callout.hide(); a.bytesPanel.addr = null; a.varsPanel.tree.open.clear(); a.watchPanel.tree.open.clear(); a.memview.open.clear(); a.memview.closed.clear(); a.bytesPanel.sel = null; a.memview.opts.types = false; a.memview.opts.addrs = true; a.memview.opts.lib = false; document.querySelectorAll('.toast').forEach((t) => t.remove()); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); })()`);
  await p.sleep(20);
}
/** Debug the VARS program up to a line (1-based), paused there */
async function runTo(p, text, line1) {
  await p.debugProgram(text);
  if (line1) {
    await p.ev(`SEE.app.active.editor.setCursor(${line1 - 1}, 0)`);
    await p.ev('SEE.app.runToCursor()');
    await p.wait(`SEE.app.vm && !SEE.app.running && SEE.app.vm.state === 'paused' && SEE.app.vm.where().line === ${line1}`, 8000);
  }
}
const bp = (p, line1) => p.ev(`SEE.app.toggleBreakpoint(SEE.app.active.path, ${line1 - 1})`);
async function clickEl(p, expr) {
  const sel = await p.ev(`(() => { const e = (${expr}); if (!e) return null; document.querySelectorAll('[data-e2e]').forEach((x) => x.removeAttribute('data-e2e')); e.setAttribute('data-e2e', '1'); return '[data-e2e="1"]'; })()`);
  if (!sel) throw new Error('no element for ' + expr);
  await p.click(sel);
}
async function hoverEl(p, expr) {
  const sel = await p.ev(`(() => { const e = (${expr}); if (!e) return null; document.querySelectorAll('[data-e2e]').forEach((x) => x.removeAttribute('data-e2e')); e.setAttribute('data-e2e', '1'); return '[data-e2e="1"]'; })()`);
  if (!sel) throw new Error('no element for ' + expr);
  await p.hover(sel);
}
// a row of the Variables panel (or any value tree) by its name
const VROW = (name, root = '#panel-vars') => `[...document.querySelectorAll(${JSON.stringify(root + ' .vrow')})].find((r) => r.querySelector('.vn') && r.querySelector('.vn').textContent.replace(/^[▸▾]/, '') === ${JSON.stringify(name)})`;
const vtext = (p, name, root) => p.ev(`(() => { const r = ${VROW(name, root)}; return r ? r.querySelector('.vv').textContent : null; })()`);
const vcls = (p, name, root) => p.ev(`(() => { const r = ${VROW(name, root)}; return r ? r.querySelector('.vv').className : null; })()`);
// a cell of the memory picture by its name
const MCELL = (name) => `[...document.querySelectorAll('#panel-memory .cell')].find((r) => r.querySelector('.n') && r.querySelector('.n').textContent.replace(/^[▸▾]/, '') === ${JSON.stringify(name)})`;
const mtext = (p, name) => p.ev(`(() => { const r = ${MCELL(name)}; return r ? r.querySelector('.v').textContent : null; })()`);

async function expandVar(p, name) {
  await clickEl(p, `(${VROW(name)}).querySelector('.tw')`);
}
/** Click a value in the Variables panel, type a new one and press Enter */
async function editVar(p, name, value, root = '#panel-vars') {
  await clickEl(p, `(${VROW(name, root)}).querySelector('.vv')`);
  await p.wait(`!!(${VROW(name, root)}) && !!(${VROW(name, root)}).querySelector('input')`, 2000);
  await p.ev(`(() => { const i = (${VROW(name, root)}).querySelector('input'); i.select(); })()`);
  await p.insertText(value);
  await p.key('Enter');
  await p.sleep(40);
}
async function editMem(p, name, value) {
  await clickEl(p, `(${MCELL(name)}).querySelector('.v')`);
  await p.wait(`!!(${MCELL(name)}).querySelector('input')`, 2000);
  await p.ev(`(${MCELL(name)}).querySelector('input').select()`);
  await p.insertText(value);
  await p.key('Enter');
  await p.sleep(40);
}
/** Move the mouse over a word in the active editor: line 1-based, col 0-based */
async function hoverWord(p, line1, col) {
  await p.ev(`(() => { const e = SEE.app.active.editor; const top = (${line1 - 1}) * e.lineHeight; if (top < e.ta.scrollTop || top + 2 * e.lineHeight > e.ta.scrollTop + e.ta.clientHeight) { e.ta.scrollTop = Math.max(0, top - e.ta.clientHeight / 2); e.ta.dispatchEvent(new Event('scroll')); } })()`);
  await p.sleep(40);
  const xy = await p.ev(`(() => { const e = SEE.app.active.editor; const r = e.ta.getBoundingClientRect(); return [r.left + e.padLeft + (${col} + 0.5) * e.charWidth - e.ta.scrollLeft, r.top + e.padTop + (${line1 - 1} + 0.5) * e.lineHeight - e.ta.scrollTop]; })()`);
  await p.mouse('mouseMoved', xy[0] - 3, xy[1]);
  await p.mouse('mouseMoved', xy[0], xy[1]);
  return xy;
}
async function hoverName(p, line1, word) {
  const col = await p.ev(`SEE.app.active.editor.getLine(${line1 - 1}).search(new RegExp('\\\\b' + ${JSON.stringify(word)} + '\\\\b'))`);
  if (col < 0) throw new Error(word + ' not on line ' + line1);
  const xy = await hoverWord(p, line1, col + Math.floor(word.length / 2));
  await p.wait("!!document.querySelector('.callout')", 3000);
  return xy;
}
const calloutText = (p) => p.ev("(document.querySelector('.callout') || {}).innerText || ''");
async function addWatch(p, expr) {
  await p.showRight('watch');
  await p.click('#watchInput');
  await p.insertText(expr);
  await p.key('Enter');
  await p.sleep(30);
}
const WROW = (expr) => `[...document.querySelectorAll('#panel-watch .wrow')].find((r) => r.querySelector('.we').textContent === ${JSON.stringify(expr)})`;
const wval = (p, expr) => p.ev(`(() => { const r = ${WROW(expr)}; return r ? r.querySelector('.wv').textContent : null; })()`);
const werr = (p, expr) => p.ev(`(() => { const r = ${WROW(expr)}; return r ? r.querySelector('.wv').classList.contains('err') : null; })()`);

export default function (t) {
  t.beforeEach(clean);

  // ---- the Variables panel -----------------------------------------------------------------------------
  t.test('Variables: empty while nothing runs', async (p) => {
    await p.showRight('vars');
    p.assert.match(await p.panelText('vars'), /Variables show here while the program is paused/);
  });
  t.test('Variables: groups for parameters, locals, statics and globals', async (p) => {
    await p.newFile(MAIN, VARS);
    await bp(p, 11);
    await runTo(p, VARS);
    await p.cont();
    await p.showRight('vars');
    const groups = await p.ev("[...document.querySelectorAll('#panel-vars .vgroup')].map((g) => g.textContent)");
    p.assert.ok(groups.some((g) => /Parameters of f\(\)/.test(g)), groups.join('|'));
    p.assert.ok(groups.some((g) => /Locals of f\(\)/.test(g)));
    p.assert.ok(groups.some((g) => /Statics of f\(\)/.test(g)));
    p.assert.ok(groups.some((g) => /^Globals/.test(g)));
    p.assert.equal(groups.findIndex((g) => /^Parameters/.test(g)) < groups.findIndex((g) => /^Locals/.test(g)), true);
  });
  t.test('Variables: parameters show their values', async (p) => {
    await p.newFile(MAIN, VARS);
    await bp(p, 11);
    await runTo(p, VARS);
    await p.cont();
    await p.showRight('vars');
    p.assert.equal(await vtext(p, 'a'), '5');
    p.assert.equal(await vtext(p, 'b'), '1');
    p.assert.equal(await vtext(p, 'sum'), '6');
  });
  t.test('Variables: a static local shows its value', async (p) => {
    await p.newFile(MAIN, VARS);
    await bp(p, 12);
    await runTo(p, VARS);
    await p.cont();
    await p.showRight('vars');
    p.assert.equal(await vtext(p, 'calls'), '1');
  });
  t.test('Variables: globals show in every frame', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    p.assert.equal(await vtext(p, 'g'), '7');
    p.assert.equal(await vtext(p, 'gd'), '1.5');
  });
  t.test('Variables: main has no parameter group', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    p.assert.doesNotMatch(await p.panelText('vars'), /Parameters of main/i);
    p.assert.match(await p.panelText('vars'), /Locals of main\(\)/i);
  });
  const SHOWN = [['x', '5'], ['c', "113 'q'"], ['d', '2.5'], ['name', '"hi"'], ['k', '9 🔒'], ['arr', '{1, 2, 3, 4}'], ['pt', '{x=3, y=4}']];
  for (const [name, text] of SHOWN) {
    t.test('Variables: ' + name + ' shows as ' + text, async (p) => {
      await runTo(p, VARS, 29);
      await p.showRight('vars');
      p.assert.equal(await vtext(p, name), text);
    });
  }
  t.test('Variables: each row shows its type', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    const ty = {};
    for (const n of ['x', 'c', 'd', 'arr', 'pt', 'p', 'name']) ty[n] = (await p.ev(`(${VROW(n)}).querySelector('.vt').textContent`)).replace(/ \[/, '[');
    p.assert.deepEqual(ty, { x: 'int', c: 'char', d: 'double', arr: 'int[4]', pt: 'struct pt', p: 'int *', name: 'char[8]' });
  });
  t.test('Variables: a variable not set yet is red', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    p.assert.match(await vcls(p, 'late'), /uninit/);
    p.assert.doesNotMatch(await vcls(p, 'x'), /uninit/);
  });
  t.test('Variables: a value that just changed is marked', async (p) => {
    await runTo(p, VARS, 28);
    await p.showRight('vars');
    await p.step('over');
    await p.step('over');
    p.assert.ok(await p.ev(`(${VROW('late')}).classList.contains('changed')`));
    p.assert.equal(await p.ev(`(${VROW('x')}).classList.contains('changed')`), false);
  });
  t.test('Variables: expanding an array shows its elements', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'arr');
    for (let i = 0; i < 4; i++) p.assert.equal(await vtext(p, '[' + i + ']'), String(i + 1));
    p.assert.equal(await p.ev(`(${VROW('arr')}).querySelector('.tw').textContent`), '▾');
  });
  t.test('Variables: an expanded array closes again', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'arr');
    await expandVar(p, 'arr');
    p.assert.equal(await vtext(p, '[0]'), null);
  });
  t.test('Variables: expanding a struct shows its members', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'pt');
    p.assert.equal(await vtext(p, '.x'), '3');
    p.assert.equal(await vtext(p, '.y'), '4');
  });
  t.test('Variables: expanding a struct of bit-fields shows each field', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'fl');
    p.assert.equal(await vtext(p, '.lo'), '5');
    p.assert.equal(await vtext(p, '.hi'), '17');
  });
  t.test('Variables: a pointer to a heap block opens to the whole block', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    p.assert.match(await vtext(p, 'p'), /^0x[0-9a-f]+ -> heap #1$/);
    await expandVar(p, 'p');
    p.assert.equal(await p.ev(`(${VROW('*')}).querySelector('.vt').textContent`), 'int[4]');
    await expandVar(p, '*');
    p.assert.deepEqual([await vtext(p, '[0]'), await vtext(p, '[3]')], ['10', '40']);
  });
  t.test('Variables: a pointer to a local opens to that local', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    p.assert.match(await vtext(p, 'q'), /-> x$/);
    await expandVar(p, 'q');
    p.assert.equal(await vtext(p, '*'), '5');
  });
  t.test('Variables: a pointer to a struct on the heap opens to its members', async (p) => {
    await runTo(p, LIST, 10);
    await p.showRight('vars');
    await expandVar(p, 'n');
    await expandVar(p, '*');
    p.assert.equal(await vtext(p, '.v'), '11');
    p.assert.equal(await vtext(p, '.next'), 'NULL');
  });
  t.test('Variables: a NULL pointer cannot be opened', async (p) => {
    await runTo(p, LIST, 10);
    await p.showRight('vars');
    await expandVar(p, 'n');
    await expandVar(p, '*');
    p.assert.equal(await p.ev(`(${VROW('.next')}).querySelector('.tw').textContent`), '');
  });
  t.test('Variables: the open rows stay open after a step', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'arr');
    await p.step('over');
    p.assert.equal(await vtext(p, '[2]'), '3');
  });
  t.test('Variables: pointing at a row tells its type and address', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    p.assert.match(await p.ev(`(${VROW('x')}).title`), /^int x at 0x[0-9a-f]{8}$/);
  });

  // ---- changing values in the Variables panel ----------------------------------------------------------
  const EDITS = [
    ['an int', 'x', '42', 'x', 42],
    ['a negative int', 'x', '-17', 'x', -17],
    ['an int in hex', 'x', '0x1f', 'x', 31],
    ['an int from an expression', 'x', 'x * 3 + 1', 'x', 16],
    ["a char given as 'A'", 'c', "'A'", 'c', 65],
    ['a char given as 65', 'c', '65', 'c', 65],
    ["a char given as '\\n'", 'c', "'\\n'", 'c', 10],
    ['a double', 'd', '3.25', 'd', 3.25],
    ['a double from an int', 'd', '7', 'd', 7],
    ['a global', 'g', '100', 'g', 100],
    ['a global double', 'gd', '-0.5', 'gd', -0.5],
  ];
  for (const [what, name, input, expr, want] of EDITS) {
    t.test('Variables: change ' + what, async (p) => {
      await runTo(p, VARS, 29);
      await p.showRight('vars');
      await editVar(p, name, input);
      p.assert.equal(await p.cval(expr), want);
    });
  }
  t.test('Variables: change a pointer given as 0x…', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    const ax = await p.ev("SEE.Debug.evaluate(SEE.app.vm, 0, '&x').value");
    const ag = await p.ev("SEE.Debug.evaluate(SEE.app.vm, 0, '&g').value");
    p.assert.equal(await p.cval('q'), ax);
    await editVar(p, 'q', '0x' + ag.toString(16));
    p.assert.equal(await p.cval('q'), ag);
    p.assert.equal(await p.cval('*q'), 7);
    p.assert.match(await vtext(p, 'q'), /-> g$/);
  });
  t.test('Variables: change a pointer given as &name', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'q', '&g');
    p.assert.equal(await p.cval('*q'), 7);
  });
  t.test('Variables: change a pointer to 0 makes it NULL', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'q', '0');
    p.assert.equal(await p.cval('q'), 0);
    p.assert.equal(await vtext(p, 'q'), 'NULL');
  });
  t.test('Variables: change a pointer given as NULL', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'q', 'NULL');
    p.assert.equal(await p.cval('q'), 0);
  });
  t.test('Variables: change a char array given as "text"', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'name', '"text"');
    p.assert.equal(await vtext(p, 'name'), '"text"');
    p.assert.equal(await p.cval('name[3]'), 't'.charCodeAt(0));
    p.assert.equal(await p.cval('name[4]'), 0);
  });
  t.test('Variables: a string too long for the array is refused', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'name', '"far too long"');
    await p.waitToast(/holds 8 chars/);
    p.assert.equal(await vtext(p, 'name'), '"hi"');
  });
  t.test('Variables: change a bit-field', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'fl');
    await editVar(p, '.hi', '9');
    p.assert.equal(await p.cval('fl.hi'), 9);
    p.assert.equal(await p.cval('fl.lo'), 5);
  });
  t.test('Variables: a bit-field keeps only its bits', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'fl');
    await editVar(p, '.lo', '9');
    p.assert.equal(await p.cval('fl.lo'), 1);
    p.assert.equal(await p.cval('fl.hi'), 17);
  });
  t.test('Variables: change an array element', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'arr');
    await editVar(p, '[2]', '33');
    p.assert.equal(await p.cval('arr[2]'), 33);
  });
  t.test('Variables: change a struct member', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'pt');
    await editVar(p, '.y', '-4');
    p.assert.equal(await p.cval('pt.y'), -4);
  });
  t.test('Variables: change an element of a heap block through a pointer', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await expandVar(p, 'p');
    await expandVar(p, '*');
    await editVar(p, '[1]', '21');
    p.assert.equal(await p.cval('p[1]'), 21);
  });
  t.test('Variables: the changed value is what the program then uses', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'x', '100');
    await p.cont();
    p.assert.match(await p.output(), /^100 q 2\.5 1 3 hi 100 9 101$/m);
  });
  t.test('Variables: the status bar says a value was changed', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'x', '1');
    p.assert.match(await p.status(), /Changed x\. The program carries on with the new value\./);
  });
  t.test('Variables: setting a value that was not set takes away the red', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'late', '3');
    p.assert.doesNotMatch(await vcls(p, 'late'), /uninit/);
    p.assert.equal(await vtext(p, 'late'), '3');
  });
  t.test('Variables: Escape cancels an edit', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await clickEl(p, `(${VROW('x')}).querySelector('.vv')`);
    await p.wait(`!!(${VROW('x')}).querySelector('input')`, 2000);
    await p.insertText('99');
    await p.key('Escape');
    p.assert.equal(await p.cval('x'), 5);
    p.assert.equal(await vtext(p, 'x'), '5');
  });
  t.test('Variables: the edit box starts with the current value', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await clickEl(p, `(${VROW('d')}).querySelector('.vv')`);
    p.assert.equal(await p.ev(`(${VROW('d')}).querySelector('input').value`), '2.5');
    await p.key('Escape');
  });
  t.test('Variables: a value that is not C is refused with a message', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'x', 'nosuchname');
    await p.waitToast(/nosuchname/);
    p.assert.equal(await p.cval('x'), 5);
  });
  t.test('Variables: a pointer cannot hold a double', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await editVar(p, 'q', '1.5');
    await p.waitToast(/pointer cannot hold a floating value/);
  });
  t.test('Variables: change a value in an older frame of a recursion', async (p) => {
    await p.newFile(MAIN, FACT);
    await bp(p, 5);
    await runTo(p, FACT);
    await p.cont();
    await p.showRight('vars');
    await clickEl(p, "document.querySelectorAll('#panel-vars .fr')[2]");
    p.assert.equal(await vtext(p, 'n'), '3');
    await editVar(p, 'n', '10');
    p.assert.equal(await p.cval('n', 2), 10);
    p.assert.equal(await p.cval('n', 0), 1);
    p.assert.equal(await p.cval('n', 1), 2);
  });
  t.test('Variables: a change in an older frame changes the result', async (p) => {
    await p.newFile(MAIN, FACT2);
    await bp(p, 6);
    await runTo(p, FACT2);
    await p.cont();
    await p.showRight('vars');
    await clickEl(p, "document.querySelectorAll('#panel-vars .fr')[2]");
    await editVar(p, 'n', '10');
    await bp(p, 6);
    await p.cont();
    p.assert.match(await p.output(), /^80$/m);   // 4 * 10 * 2 * 1
  });
  t.test('Variables: a const value is shown with a padlock and cannot be clicked', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    p.assert.doesNotMatch(await vcls(p, 'k'), /\bedit\b/);
    p.assert.match(await p.ev(`(${VROW('k')}).querySelector('.vv').title`), /const/);
    await clickEl(p, `(${VROW('k')}).querySelector('.vv')`);
    p.assert.equal(await p.ev(`!!(${VROW('k')}).querySelector('input')`), false);
  });
  t.test('Variables: changing a const value is refused with a toast about const', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('vars');
    await p.ev(`(() => { const r = ${VROW('k')}; const v = SEE.Debug.frames(SEE.app.vm)[0].vars.find((x) => x.name === 'k'); SEE.app.varsPanel.tree.edit(r.querySelector('.vv'), { name: 'k', type: v.type, addr: v.addr }); })()`);
    await p.insertText('1');
    await p.key('Enter');
    await p.waitToast(/const/);
    p.assert.equal(await p.cval('k'), 9);
  });
  t.test('the debugger refuses to change a const directly', async (p) => {
    await runTo(p, VARS, 29);
    const msg = await p.ev("(() => { const v = SEE.Debug.frames(SEE.app.vm)[0].vars.find((x) => x.name === 'k'); try { SEE.Debug.setValue(SEE.app.vm, v.type, v.addr, '1', 0); return 'changed'; } catch (e) { return e.message; } })()");
    p.assert.match(msg, /const/);
  });

  // ---- changing values in the memory picture -------------------------------------------------------------
  const MEMEDITS = [
    ['an int', 'x', '77', 'x', 77],
    ["a char given as 'A'", 'c', "'A'", 'c', 65],
    ['a char given as 65', 'c', '66', 'c', 66],
    ['a double', 'd', '-1.25', 'd', -1.25],
    ['a global', 'g', '8', 'g', 8],
    ['an array element', '[1]', '22', 'arr[1]', 22],
    ['a struct member', '.x', '-3', 'pt.x', -3],
    ['a bit-field', '.hi', '30', 'fl.hi', 30],
  ];
  for (const [what, name, input, expr, want] of MEMEDITS) {
    t.test('memory picture: change ' + what, async (p) => {
      await runTo(p, VARS, 29);
      await p.showRight('memory');
      await editMem(p, name, input);
      p.assert.equal(await p.cval(expr), want);
      p.assert.notEqual(await mtext(p, name), null);
    });
  }
  t.test('memory picture: change a pointer given as 0x…', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    const ag = await p.ev("SEE.Debug.evaluate(SEE.app.vm, 0, '&g').value");
    await editMem(p, 'q', '0x' + ag.toString(16));
    p.assert.equal(await p.cval('q'), ag);
    p.assert.equal(await mtext(p, 'q'), '0x' + ag.toString(16).padStart(8, '0'));
  });
  t.test('memory picture: a pointer edit box starts with 0x…', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    await clickEl(p, `(${MCELL('q')}).querySelector('.v')`);
    p.assert.match(await p.ev(`(${MCELL('q')}).querySelector('input').value`), /^0x[0-9a-f]+$/);
    await p.key('Escape');
  });
  t.test("memory picture: a char edit box starts with the char in quotes", async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    await clickEl(p, `(${MCELL('c')}).querySelector('.v')`);
    p.assert.equal(await p.ev(`(${MCELL('c')}).querySelector('input').value`), "'q'");
    await p.key('Escape');
  });
  t.test('memory picture: change a pointer to 0 shows NULL', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    await editMem(p, 'q', '0');
    p.assert.equal(await mtext(p, 'q'), 'NULL');
  });
  t.test('memory picture: change a pointer given as NULL', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    await editMem(p, 'q', 'NULL');
    p.assert.equal(await p.cval('q'), 0);
  });
  t.test('memory picture: change a char array given as "text"', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    await editMem(p, 'name', '"abc"');
    p.assert.equal(await mtext(p, 'name'), '"abc"');
    p.assert.equal(await p.cval('name[2]'), 99);
  });
  t.test('memory picture: a char array edit box starts with the string in quotes', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    await clickEl(p, `(${MCELL('name')}).querySelector('.v')`);
    p.assert.equal(await p.ev(`(${MCELL('name')}).querySelector('input').value`), '"hi"');
    await p.key('Escape');
  });
  t.test('memory picture: a const value is read-only', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    p.assert.match(await p.ev(`(${MCELL('k')}).querySelector('.v').className`), /\bro\b/);
    p.assert.match(await p.ev(`(${MCELL('k')}).querySelector('.v').title`), /const/);
    await clickEl(p, `(${MCELL('k')}).querySelector('.v')`);
    p.assert.equal(await p.ev(`!!(${MCELL('k')}).querySelector('input')`), false);
  });
  t.test('memory picture: a value changed is marked as last changed from the debugger', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    await editMem(p, 'x', '1');
    p.assert.match(await p.ev(`(${MCELL('x')}).querySelector('.v').title || (${MCELL('x')}).querySelector('.n').title`), /last changed from the debugger/);
  });
  t.test('memory picture: change a value in an older frame of a recursion', async (p) => {
    await p.newFile(MAIN, FACT);
    await bp(p, 5);
    await runTo(p, FACT);
    await p.cont();
    await p.showRight('memory');
    await p.ev('SEE.app.selectFrame(1)');
    // the frame boxes go from the oldest (main) at the top to the newest at the bottom
    await clickEl(p, "[...document.querySelectorAll('#panel-memory .frame')][3].querySelector('.cell .v.edit')");
    await p.ev("document.querySelector('#panel-memory .frame input').select()");
    await p.insertText('6');
    await p.key('Enter');
    p.assert.equal(await p.cval('n', 1), 6);
    p.assert.equal(await p.cval('n', 0), 1);
  });
  t.test('memory picture: change a heap element', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('memory');
    await clickEl(p, "[...document.querySelectorAll('#panel-memory .blk .cell')].find((c) => c.querySelector('.n').textContent === '[2]').querySelector('.v')");
    await p.ev("document.querySelector('#panel-memory .blk input').select()");
    await p.insertText('-30');
    await p.key('Enter');
    p.assert.equal(await p.cval('p[2]'), -30);
  });

  // ---- the Watch panel -------------------------------------------------------------------------------
  t.test('Watch: the panel explains itself when empty', async (p) => {
    await p.showRight('watch');
    p.assert.match(await p.panelText('watch'), /Type an expression and press Enter/);
  });
  t.test('Watch: an expression added while nothing runs says not running', async (p) => {
    await addWatch(p, 'x');
    p.assert.equal(await wval(p, 'x'), 'not running');
    p.assert.equal(await werr(p, 'x'), true);
  });
  t.test('Watch: the Watch button adds the expression', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('watch');
    await p.click('#watchInput');
    await p.insertText('x');
    await p.click('#panel-watch .watch-add button');
    p.assert.equal(await wval(p, 'x'), '5');
  });
  t.test('Watch: the same expression is not added twice', async (p) => {
    await addWatch(p, 'x');
    await addWatch(p, 'x');
    p.assert.equal(await p.count('#panel-watch .wrow'), 1);
  });
  const WATCHES = [
    ['x', '5'], ['x + 1', '6'], ['x * 2 - 3', '7'], ['arr[2]', '3'], ['arr[1] + arr[3]', '6'], ['pt.y', '4'], ['*q', '5'], ['q == &x', '1'],
    ['p[3]', '40'], ['*p', '10'], ['*(p + 1)', '20'], ['(char)65', "65 'A'"], ['(double)x / 2', '2.5'], ['(int)d', '2'], ['x / 2', '2'], ['x % 3', '2'],
    ['g', '7'], ['c', "113 'q'"], ['name', '"hi"'], ['name[1]', "105 'i'"], ['sizeof(struct pt)', '8'], ['k', '9'], ['fl.hi', '17'], ['-x', '-5'], ['x > 3 && g < 10', '1'],
  ];
  for (const [expr, val] of WATCHES) {
    t.test('Watch: ' + expr + ' is ' + val, async (p) => {
      await runTo(p, VARS, 29);
      await addWatch(p, expr);
      p.assert.equal(await wval(p, expr), val);
      p.assert.equal(await werr(p, expr), false);
    });
  }
  t.test('Watch: p->v and p->next through a struct pointer', async (p) => {
    await runTo(p, LIST, 10);
    await addWatch(p, 'n->v');
    await addWatch(p, 'n->next');
    p.assert.equal(await wval(p, 'n->v'), '11');
    p.assert.equal(await wval(p, 'n->next'), 'NULL');
  });
  t.test('Watch: (*n).v is the same as n->v', async (p) => {
    await runTo(p, LIST, 10);
    await addWatch(p, '(*n).v');
    p.assert.equal(await wval(p, '(*n).v'), '11');
  });
  t.test('Watch: a pointer into an array indexes it', async (p) => {
    await runTo(p, LIST, 10);
    await addWatch(p, 'pa[2]');
    await addWatch(p, '*(pa + 1)');
    p.assert.equal(await wval(p, 'pa[2]'), '6');
    p.assert.equal(await wval(p, '*(pa + 1)'), '5');
  });
  t.test('Watch: values update at each stop', async (p) => {
    await runTo(p, LIST, 10);
    await addWatch(p, 'a[1]');
    await addWatch(p, 'a[2]');
    p.assert.equal(await wval(p, 'a[1]'), '5');
    await p.step('over');
    p.assert.equal(await wval(p, 'a[1]'), '50');
    p.assert.equal(await wval(p, 'a[2]'), '6');
    await p.step('over');
    p.assert.equal(await wval(p, 'a[2]'), '60');
  });
  t.test('Watch: a value updates after it is changed in the Variables panel', async (p) => {
    await runTo(p, VARS, 29);
    await addWatch(p, 'x * 10');
    await p.showRight('vars');
    await editVar(p, 'x', '3');
    await p.showRight('watch');
    p.assert.equal(await wval(p, 'x * 10'), '30');
  });
  t.test('Watch: a name not in scope shows an error', async (p) => {
    await runTo(p, VARS, 29);
    await addWatch(p, 'sum');
    p.assert.equal(await werr(p, 'sum'), true);
    p.assert.match(await wval(p, 'sum'), /sum/);
  });
  t.test('Watch: a name comes into scope inside a function', async (p) => {
    await p.newFile(MAIN, VARS);
    await bp(p, 12);
    await runTo(p, VARS);
    await addWatch(p, 'sum');
    p.assert.equal(await werr(p, 'sum'), true);
    await p.cont();
    p.assert.equal(await werr(p, 'sum'), false);
    p.assert.equal(await wval(p, 'sum'), '6');
  });
  t.test('Watch: a NULL pointer dereferenced shows an error', async (p) => {
    await runTo(p, LIST, 10);
    await addWatch(p, 'n->next->v');
    p.assert.equal(await werr(p, 'n->next->v'), true);
    p.assert.match(await wval(p, 'n->next->v'), /NULL/);
  });
  t.test('Watch: a function call is refused', async (p) => {
    await runTo(p, VARS, 29);
    await addWatch(p, 'f(1, 2)');
    p.assert.equal(await werr(p, 'f(1, 2)'), true);
    p.assert.match(await wval(p, 'f(1, 2)'), /function calls are not run/);
  });
  t.test('Watch: division by zero is an error, not a crash', async (p) => {
    await runTo(p, VARS, 29);
    await addWatch(p, 'x / 0');
    p.assert.match(await wval(p, 'x / 0'), /division by zero/);
  });
  t.test('Watch: an aggregate opens to its parts', async (p) => {
    await runTo(p, VARS, 29);
    await addWatch(p, 'pt');
    p.assert.equal(await vtext(p, '.x', '#panel-watch'), '3');
    p.assert.equal(await vtext(p, '.y', '#panel-watch'), '4');
  });
  t.test('Watch: a pointer opens to what it points at', async (p) => {
    await runTo(p, VARS, 29);
    await addWatch(p, 'q');
    p.assert.equal(await vtext(p, '*', '#panel-watch'), '5');
  });
  t.test('Watch: the remove button takes a watch away', async (p) => {
    await addWatch(p, 'x');
    await addWatch(p, 'g');
    await p.click('#panel-watch .wrow button[aria-label="Remove watch"]');
    p.assert.equal(await p.count('#panel-watch .wrow'), 1);
    p.assert.equal(await p.ev("document.querySelector('#panel-watch .we').textContent"), 'g');
  });
  t.test('Watch: the list is kept after a reload', async (p) => {
    await addWatch(p, 'x + g');
    await p.reload();
    p.assert.deepEqual(await p.ev('SEE.app.watchPanel.list.map((w) => w.expr)'), ['x + g']);
  });
  t.test('Watch: Debug > Watch an expression focuses the input', async (p) => {
    await p.menu('Debug', 'Watch an expression');
    await p.wait("document.activeElement && document.activeElement.id === 'watchInput'", 2000);
  });
  t.test('Watch: values follow the selected frame', async (p) => {
    await p.newFile(MAIN, FACT);
    await bp(p, 5);
    await runTo(p, FACT);
    await p.cont();
    await addWatch(p, 'n');
    p.assert.equal(await wval(p, 'n'), '1');
    await p.ev('SEE.app.selectFrame(3)');
    p.assert.equal(await wval(p, 'n'), '4');
  });

  // ---- watchpoints ------------------------------------------------------------------------------------
  t.test('Watchpoint: the eye button needs a running program', async (p) => {
    await addWatch(p, 'x');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.waitToast(/Start the program in the debugger first/);
  });
  t.test('Watchpoint: the eye button turns on and says so', async (p) => {
    await runTo(p, WP, 10);
    await addWatch(p, 'x');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.waitToast(/The program stops when x changes/);
    p.assert.match(await p.ev("document.querySelector('#panel-watch button[aria-label=\"Watchpoint\"]').className"), /\bon\b/);
    p.assert.equal(await p.ev('SEE.app.dbg.watchpoints.length'), 1);
  });
  t.test('Watchpoint: stops when the memory changes', async (p) => {
    await runTo(p, WP, 10);
    await addWatch(p, 'x');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.cont();
    p.assert.equal(await p.state(), 'paused');
    p.assert.equal(await p.cval('x'), 5);
    p.assert.equal(await p.line(), 13);
  });
  t.test('Watchpoint: the status names what changed', async (p) => {
    await runTo(p, WP, 10);
    await addWatch(p, 'x');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.cont();
    p.assert.match(await p.status(), /^x changed \(line 13\)$/);
  });
  t.test('Watchpoint: writing the same value again does not stop', async (p) => {
    await runTo(p, WP, 10);
    await addWatch(p, 'x');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.cont();
    await p.cont();
    p.assert.equal(await p.cval('x'), 6);
    p.assert.equal(await p.line(), 18);
  });
  t.test('Watchpoint: a global changed inside a function', async (p) => {
    await runTo(p, WP, 10);
    await addWatch(p, 'g');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.cont();
    p.assert.equal(await p.cval('g'), 1);
    p.assert.match(await p.status(), /g changed/);
  });
  t.test('Watchpoint: an array element', async (p) => {
    await runTo(p, LIST, 9);
    await addWatch(p, 'a[2]');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.cont();
    p.assert.equal(await p.line(), 12);
    p.assert.equal(await p.cval('a[2]'), 60);
  });
  t.test('Watchpoint: a heap value through a pointer', async (p) => {
    await runTo(p, LIST, 8);
    await addWatch(p, 'n->v');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.cont();
    p.assert.equal(await p.line(), 9);
    p.assert.match(await p.status(), /n->v changed/);
  });
  t.test('Watchpoint: the eye button again turns it off', async (p) => {
    await runTo(p, WP, 10);
    await addWatch(p, 'x');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    p.assert.equal(await p.ev('SEE.app.dbg.watchpoints.length'), 0);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
  });
  t.test('Watchpoint: removing the watch removes the watchpoint', async (p) => {
    await runTo(p, WP, 10);
    await addWatch(p, 'x');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.click('#panel-watch button[aria-label="Remove watch"]');
    p.assert.equal(await p.ev('SEE.app.dbg.watchpoints.length'), 0);
  });
  t.test('Watchpoint: something not in memory cannot be watched', async (p) => {
    await runTo(p, WP, 10);
    await addWatch(p, 'x + 1');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    await p.waitToast(/not something stored in memory/);
  });
  t.test('Watchpoint: a watchpoint and a breakpoint together', async (p) => {
    await p.newFile(MAIN, WP);
    await bp(p, 15);
    await runTo(p, WP, 10);
    await addWatch(p, 'y');
    await p.click('#panel-watch button[aria-label="Watchpoint"]');
    const lines = [];
    for (let i = 0; i < 4; i++) { await p.cont(); lines.push(await p.line()); }
    p.assert.deepEqual(lines, [11, 12, 14, 15]);
  });

  // ---- the hover callout --------------------------------------------------------------------------------
  t.test('callout: pointing at a variable shows its value, type and address', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 16, 'x');
    const txt = await calloutText(p);
    p.assert.match(txt, /\bx\b/);
    p.assert.match(txt, /int at 0x[0-9a-f]{8} · 4 bytes · in main\(\)/);
    p.assert.match(await p.ev("document.querySelector('.callout .vv').textContent"), /^5$/);
  });
  t.test('callout: a double shows its value and size', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 18, 'd');
    p.assert.match(await calloutText(p), /double at 0x[0-9a-f]+ · 8 bytes/);
    p.assert.equal(await p.ev("document.querySelector('.callout .vv').textContent"), '2.5');
  });
  t.test('callout: a struct member chain like pt.x', async (p) => {
    await runTo(p, VARS, 31);
    await hoverName(p, 30, 'x');   // the first x on the line is the plain x
    p.assert.match(await calloutText(p), /\b5\b/);
  });
  t.test('callout: says which line last wrote the value', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 16, 'x');
    p.assert.match(await calloutText(p), /Last written by line 16 in main\(\)/);
  });
  t.test('callout: a heap block says it is on the heap', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 28, 'p');
    await p.wait("/^p\\b/.test(document.querySelector('.callout .co-head').innerText)", 2000);
    p.assert.match(await calloutText(p), /int \*/);
  });
  t.test('callout: a value in the newest frame can be changed there', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 16, 'x');
    p.assert.match(await calloutText(p), /Click the value to change it/);
    await p.hover('.callout .vv.edit');
    await p.click('.callout .vv.edit');
    await p.wait("!!document.querySelector('.callout input')", 2000);
    await p.ev("document.querySelector('.callout input').select()");
    await p.insertText('64');
    await p.key('Enter');
    p.assert.equal(await p.cval('x'), 64);
    p.assert.equal(await p.ev("(document.querySelector('.callout .vv') || {}).textContent"), '64');
  });
  t.test('callout: an older frame\'s copy is read-only with a note', async (p) => {
    await p.newFile(MAIN, VARS);
    await bp(p, 11);
    await runTo(p, VARS);
    await p.cont();
    p.assert.equal(await p.fnName(), 'f');
    await hoverName(p, 16, 'x');
    const txt = await calloutText(p);
    p.assert.match(txt, /This is main\(\)'s copy, 1 frame down the stack/);
    p.assert.match(txt, /Change it from the Variables panel or the memory picture/);
    p.assert.equal(await p.count('.callout .vv.edit'), 0);
  });
  t.test('callout: a recursive parameter in the newest frame', async (p) => {
    await p.newFile(MAIN, FACT);
    await bp(p, 5);
    await runTo(p, FACT);
    await p.cont();
    await hoverName(p, 4, 'n');
    p.assert.equal(await p.ev("document.querySelector('.callout .vv').textContent"), '1');
    p.assert.match(await calloutText(p), /in fact\(\)/);
  });
  t.test('callout: closes with Escape', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 16, 'x');
    await p.key('Escape');
    p.assert.equal(await p.exists('.callout'), false);
  });
  t.test('callout: closes when the mouse leaves', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 16, 'x');
    const r = await p.rect('#toolbar');
    await p.mouse('mouseMoved', r.x + 5, r.y + r.h / 2);
    await p.waitGone('.callout', 3000);
  });
  t.test('callout: stays open while the mouse is in it', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 16, 'x');
    await p.hover('.callout .co-head');
    await p.sleep(200);
    await p.hover('.callout .co-meta');
    await p.sleep(200);
    p.assert.equal(await p.exists('.callout'), true);
  });
  t.test('callout: the close button closes it', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 16, 'x');
    await p.click('.callout button[aria-label="Close"]');
    p.assert.equal(await p.exists('.callout'), false);
  });
  t.test('callout: a step closes it', async (p) => {
    await runTo(p, VARS, 29);
    await hoverName(p, 16, 'x');
    await p.step('over');
    p.assert.equal(await p.exists('.callout'), false);
  });
  t.test('callout: a word in a comment shows nothing', async (p) => {
    await runTo(p, src('int main(void)', '{', '    int x = 1; /* x here */', '    x++;', '    return x;', '}'), 4);
    const col = await p.ev("SEE.app.active.editor.getLine(2).indexOf('x here')");
    await hoverWord(p, 3, col);
    await p.sleep(450);
    p.assert.equal(await p.exists('.callout'), false);
  });
  t.test('callout: library names show their reference when nothing runs', async (p) => {
    await p.newFile(MAIN, VARS);
    await hoverName(p, 31, 'free');
    p.assert.match(await calloutText(p), /More in the reference/);
  });

  // ---- the Bytes panel ----------------------------------------------------------------------------------
  t.test('Bytes: explains itself while nothing runs', async (p) => {
    await p.showRight('bytes');
    p.assert.match(await p.panelText('bytes'), /Raw bytes show here while a program is paused/);
  });
  t.test('Bytes: shows 16 rows of 16 bytes', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    p.assert.equal(await p.count('#panel-bytes .hex-row'), 16);
    p.assert.equal(await p.ev("document.querySelector('#panel-bytes .hex-row').querySelectorAll('b').length"), 16);
  });
  t.test('Bytes: go to a variable selects its first byte', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    const ax = await p.ev("SEE.Debug.evaluate(SEE.app.vm, 0, '&x').value");
    await p.click('#bytesAddr');
    await p.insertText('x');
    await p.key('Enter');
    p.assert.equal(await p.ev("SEE.app.bytesPanel.sel"), ax);
    p.assert.equal(await p.text('#panel-bytes .hex-row .ha'), '0x' + ((ax & ~15) >>> 0).toString(16).padStart(8, '0') + '  ');
    p.assert.equal(await p.text('#panel-bytes b.sel'), '05');
  });
  t.test('Bytes: the Show button goes to the typed place', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.click('#bytesAddr');
    await p.insertText('g');
    await p.click('#panel-bytes .hex-bar button', 'Show');
    p.assert.equal(await p.text('#panel-bytes b.sel'), '07');
  });
  t.test('Bytes: go to an address', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    const ag = await p.ev("SEE.Debug.evaluate(SEE.app.vm, 0, '&g').value");
    await p.click('#bytesAddr');
    await p.insertText('0x' + ag.toString(16));
    await p.key('Enter');
    p.assert.equal(await p.ev('SEE.app.bytesPanel.sel'), ag);
  });
  t.test('Bytes: a pointer variable shows where the pointer itself is', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('p')");
    p.assert.equal(await p.ev('SEE.app.bytesPanel.sel'), await p.ev("SEE.Debug.evaluate(SEE.app.vm, 0, '&p').value"));
  });
  t.test('Bytes: *p goes to where the pointer points', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.click('#bytesAddr');
    await p.insertText('*p');
    await p.key('Enter');
    p.assert.equal(await p.ev('SEE.app.bytesPanel.sel'), await p.cval('p'));
    p.assert.equal(await p.text('#panel-bytes b.sel'), '0a');
  });
  t.test('Bytes: a string shows in the text column', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('name')");
    p.assert.match(await p.panelText('bytes'), /hi/);
  });
  t.test('Bytes: +256 and −256 move the view', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('g')");
    const a0 = await p.ev('SEE.app.bytesPanel.addr');
    await p.click('#panel-bytes .hex-bar button', '+256');
    p.assert.equal(await p.ev('SEE.app.bytesPanel.addr'), a0 + 256);
    p.assert.equal(await p.text('#panel-bytes .hex-row .ha'), '0x' + (a0 + 256).toString(16).padStart(8, '0') + '  ');
    await p.click('#panel-bytes .hex-bar button', '−256');
    await p.click('#panel-bytes .hex-bar button', '−256');
    p.assert.equal(await p.ev('SEE.app.bytesPanel.addr'), a0 - 256);
  });
  t.test('Bytes: an unknown name gives a message', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('nosuch')");
    await p.waitToast(/nosuch/);
  });
  t.test('Bytes: bytes are coloured by what they are', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('late')");
    p.assert.match(await p.ev("document.querySelector('#panel-bytes b.sel').className"), /\bs3\b/);
    await p.ev("SEE.app.bytesPanel.goTo('x')");
    p.assert.match(await p.ev("document.querySelector('#panel-bytes b.sel').className"), /\bs4\b/);
    const [c3, c4] = await p.ev("(() => { const a = document.querySelector('#panel-bytes b.s3'), b = document.querySelector('#panel-bytes b.s4'); return [a ? getComputedStyle(a).color + getComputedStyle(a).backgroundColor : 'none', b ? getComputedStyle(b).color + getComputedStyle(b).backgroundColor : 'none']; })()");
    p.assert.notEqual(c3, c4);
  });
  t.test('Bytes: read-only bytes of a string literal', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    const lit = await p.ev("SEE.app.vm.prog.strings[0].addr");
    await p.ev(`SEE.app.bytesPanel.goTo('0x' + (${lit}).toString(16))`);
    p.assert.match(await p.ev("document.querySelector('#panel-bytes b.sel').className"), /\bs2\b/);
  });
  t.test('Bytes: heap header bytes before a block', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    const a = await p.cval('p');
    await p.ev(`SEE.app.bytesPanel.goTo('0x' + (${a - 4}).toString(16))`);
    p.assert.match(await p.ev("document.querySelector('#panel-bytes b.sel').className"), /\bs5\b/);
  });
  t.test('Bytes: freed heap bytes', async (p) => {
    await runTo(p, VARS, 32);
    await p.showRight('bytes');
    const a = await p.ev("SEE.app.vm.libc.blocks[0].addr");
    await p.ev(`SEE.app.bytesPanel.goTo('0x' + (${a}).toString(16))`);
    p.assert.match(await p.ev("document.querySelector('#panel-bytes b.sel').className"), /\bs7\b/);
  });
  t.test('Bytes: the info names the variable and the line that last wrote it', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('x')");
    await p.hover('#panel-bytes b.sel');
    const info = await p.text('#panel-bytes .hex-info');
    p.assert.match(info, /= 0x05 \(5\)/);
    p.assert.match(info, /initialised/);
    p.assert.match(info, /'x' in main\(\)/);
    p.assert.match(info, /last written by line 16 in main\(\)/);
  });
  t.test('Bytes: the info names an array element', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('&arr[2]')");
    await p.hover('#panel-bytes b.sel');
    p.assert.match(await p.text('#panel-bytes .hex-info'), /'arr\[2\]' in main\(\)/);
  });
  t.test('Bytes: the info names a heap block', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('p + 1')");
    await p.hover('#panel-bytes b.sel');
    const info = await p.text('#panel-bytes .hex-info');
    p.assert.match(info, /byte 4 of heap block #1/);
    p.assert.match(info, /last written by line 28 in main\(\)/);
  });
  t.test('Bytes: a value changed from the debugger says so', async (p) => {
    await runTo(p, VARS, 29);
    await p.ev("(() => { const v = SEE.Debug.frames(SEE.app.vm)[0].vars.find((x) => x.name === 'x'); SEE.Debug.setValue(SEE.app.vm, v.type, v.addr, '3', 0); })()");
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('x')");
    await p.hover('#panel-bytes b.sel');
    p.assert.match(await p.text('#panel-bytes .hex-info'), /changed from the debugger/);
  });
  t.test('Bytes: clicking a byte selects it', async (p) => {
    await runTo(p, VARS, 29);
    await p.showRight('bytes');
    await p.ev("SEE.app.bytesPanel.goTo('x')");
    const sel = await p.ev('SEE.app.bytesPanel.sel');
    await clickEl(p, "[...document.querySelectorAll('#panel-bytes b')].find((b) => !b.classList.contains('sel') && b.parentNode === document.querySelector('#panel-bytes b.sel').parentNode)");
    p.assert.notEqual(await p.ev('SEE.app.bytesPanel.sel'), sel);
  });
  t.test('Bytes: Show the bytes of from the editor menu', async (p) => {
    await runTo(p, VARS, 29);
    const col = await p.ev("SEE.app.active.editor.getLine(15).indexOf('x')");
    await p.ev("(() => { const e = SEE.app.active.editor; e.ta.scrollTop = 0; e.ta.dispatchEvent(new Event('scroll')); })()");
    await p.sleep(40);
    const xy = await p.ev(`(() => { const e = SEE.app.active.editor; const r = e.ta.getBoundingClientRect(); return [r.left + e.padLeft + (${col} + 0.5) * e.charWidth - e.ta.scrollLeft, r.top + e.padTop + 15.5 * e.lineHeight - e.ta.scrollTop]; })()`);
    await p.clickAt(xy[0], xy[1], { button: 'right' });
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    await p.click('.menu-pop .menu-item', 'Show the bytes of x');
    p.assert.equal(await p.ev("SEE.app.rightTab"), 'bytes');
    p.assert.equal(await p.text('#panel-bytes b.sel'), '05');
  });
}
