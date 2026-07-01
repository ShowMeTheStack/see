// Debugger tests: stepping, breakpoints, frames, values, changing values, evaluating, stepping back.
import { load } from './load.mjs';
const SEE = load();
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('FAIL ' + msg); } }
function eq(a, b, msg) { ok(JSON.stringify(a) === JSON.stringify(b), msg + ': got ' + JSON.stringify(a) + ', expected ' + JSON.stringify(b)); }

function start(src, opts) {
  const r = SEE.Build.build([{ path: '/t.c', text: src }], () => null, { debugInternal: true });
  if (!r.ok) throw new Error(r.errors.map((e) => e.message).join('\n'));
  let out = '';
  const marks = [];
  const vm = new SEE.Machine(r.prog, { write: (fd, b) => { out += Buffer.from(b).toString('latin1'); } });
  const dbg = new SEE.Debug.Debugger(vm, { outputMark: () => out.length, outputRewind: (n) => { out = out.slice(0, n); } });
  const go = (mode) => { dbg.resume(mode); let res; for (let i = 0; i < 1000; i++) { res = vm.run(100000); if (res !== 'budget') break; } return res; };
  return { vm, dbg, go, out: () => out, line: () => vm.where().line, fn: () => vm.where().fn, ev: (x, f) => SEE.Debug.evaluate(vm, f || 0, x) };
}

const SRC = `#include <stdio.h>
#include <stdlib.h>
struct pt { int x, y; };
int sq(int n)
{
    int r = n * n;
    return r;
}
int fact(int n)
{
    if (n <= 1)
        return 1;
    return n * fact(n - 1);
}
int main(void)
{
    int a = 3;
    int b = sq(a);
    struct pt p = { 1, 2 };
    int *h = malloc(3 * sizeof(int));
    const int k = 9;
    h[0] = 5; h[1] = 6; h[2] = 7;
    printf("%d %d\\n", a, b);
    a = fact(4);
    printf("%d %d %d\\n", a, p.y, k);
    free(h);
    return 0;
}
`;
{
  const t = start(SRC);
  eq(t.go('start'), 'pause', 'starts paused');
  eq([t.fn(), t.line()], ['main', 17], 'first stop is the first statement of main');
  t.go('over'); eq(t.line(), 18, 'step over to line 18');
  t.go('into'); eq([t.fn(), t.line()], ['sq', 6], 'step into sq');
  eq(t.ev('n').value, 3, 'parameter n is 3');
  const fr = SEE.Debug.frames(t.vm);
  eq(fr.map((f) => f.name), ['sq', 'main', '_start'], 'frames innermost first');
  t.go('out'); eq([t.fn(), t.line()], ['main', 18], 'step out returns to the call line');
  eq([t.dbg.stopInfo.reason, t.dbg.stopInfo.from, t.dbg.stopInfo.value], ['return', 'sq', 9], 'reports the return value');
  t.go('over'); eq(t.line(), 19, 'line 19');
  eq(t.ev('b').value, 9, 'b = sq(3) = 9');
  t.dbg.setBreakpoint('/t.c', 12);
  t.go('run');
  eq([t.fn(), t.line()], ['fact', 12], 'breakpoint in the base case');
  eq(SEE.Debug.frames(t.vm).filter((f) => f.name === 'fact').length, 4, 'four fact frames');
  eq(t.ev('n', 3).value, 4, 'outer fact frame has n = 4');
  eq(t.ev('h[1] + h[2]', 4).value, 13, 'expression in main frame');
  eq(t.ev('p.y * 10', 4).value, 20, 'struct member in main frame');
  // change a value in an outer frame
  SEE.Debug.setValue(t.vm, t.ev('a', 4).type, t.ev('a', 4).addr, '100', 4);
  eq(t.ev('a', 4).value, 100, 'changed a in main');
  let threw = false;
  try { SEE.Debug.setValue(t.vm, t.ev('k', 4).type, t.ev('k', 4).addr, '1', 4); } catch (e) { threw = /const/.test(e.message); }
  ok(threw, 'const k cannot be changed');
  t.ev('h[0] = 50', 4);
  eq(t.ev('h[0]', 4).value, 50, 'assignment from the evaluator');
  // step back over a few statements
  const before = t.line();
  t.dbg.stepBack(1);
  ok(t.line() !== before || t.fn() !== 'fact', 'stepped back');
  t.dbg.clearBreakpoint('/t.c', 12);
  eq(t.go('run'), 'exit', 'runs to the end');
  ok(/^3 9\n24 2 9\n$/.test(t.out()), 'output after changes: ' + JSON.stringify(t.out()));
}
{
  // stepping back restores memory and output
  const t = start(SRC);
  t.go('start');
  while (t.line() !== 24) t.go('over');
  eq(t.out(), '3 9\n', 'first line printed');
  t.go('over');
  eq(t.line(), 25, 'stepped over the recursive call');
  eq(t.ev('a').value, 24, 'a = fact(4)');
  t.dbg.stepBack();
  eq(t.line(), 24, 'back at line 24');
  eq(t.ev('a').value, 3, 'a is 3 again');
  eq(t.out(), '3 9\n', 'output still there');
  t.dbg.stepBack();
  eq(t.line(), 23, 'back to 23');
  eq(t.out(), '', 'printf undone');
  eq(t.ev('h[2]').value, 7, 'h[2] still 7 at 23');
  t.dbg.stepBack();
  eq(t.line(), 22, 'back to the start of line 22');
  ok(SEE.Debug.uninit(t.vm, t.ev('h[0]').addr, 4), 'h[0] not set yet at the start of line 22');
  t.go('stmt');
  eq(t.ev('h[0]').value, 5, 'one statement of line 22 ran');
  t.dbg.stepBackStatement();
  ok(SEE.Debug.uninit(t.vm, t.ev('h[0]').addr, 4), 'and undone');
  eq(t.go('run'), 'exit', 'and forward to the end');
  eq(t.out(), '3 9\n24 2 9\n', 'same output again');
}
{
  // descriptions
  const t = start(SRC);
  t.go('start');
  for (let i = 0; i < 6; i++) t.go('over');
  const h = t.ev('h');
  const d = SEE.Debug.describeAddr(t.vm, h.value + 4);
  ok(/heap block #1/.test(d.text), 'heap description: ' + d.text);
  const pa = t.ev('&p.y');
  eq(SEE.Debug.describeAddr(t.vm, pa.value).text, "'p.y' in main()", 'member description');
  ok(/->/.test(SEE.Debug.show(t.vm, h.type, h.addr)) || /0x/.test(SEE.Debug.show(t.vm, h.type, h.addr)), 'pointer shown');
  const kids = SEE.Debug.children(t.vm, h.type, h.addr);
  eq(kids[0].type.k, 'array', 'heap pointer drills into the whole block');
}
{
  // watchpoint
  const t = start(`int g;
void set(int v) { g = v; }
int main(void) { int i; for (i = 0; i < 5; i++) if (i == 3) set(i * 10); return g; }
`);
  t.go('start');
  t.dbg.addWatchpoint('g');
  t.go('run');
  eq(t.dbg.stopInfo.reason, 'watch', 'watchpoint stops');
  eq(t.ev('g').value, 30, 'g changed to 30');
}
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
