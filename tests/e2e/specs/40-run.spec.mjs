// Building and running: the Build log, Problems, compile errors and warnings, exit statuses,
// run-time crashes and warnings, leaks, Stop, arguments, the C library, and the Build menu tools.
const H = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const dirOf = (name) => '/home/user/r40/' + slug(name);

async function buildIn(p, name, src) {
  await p.newFile(dirOf(name) + '/main.c', src);
  await p.build();
  return (await p.problems()).join('\n');
}
async function runIn(p, name, src, opts = {}) {
  return p.runProgram(src, Object.assign({ path: dirOf(name) + '/main.c' }, opts));
}
const faultText = (p) => p.ev("SEE.app.vm && SEE.app.vm.fault ? SEE.app.vm.fault.title + ': ' + SEE.app.vm.fault.msg : ''");
const logText = (p) => p.ev("SEE.app.buildLog");

// ---- compile errors: [name, source, expected message, line] -------------------------------------------
const ERRORS = [
  ['an undeclared variable', 'int main(void) { return x; }', "'x' undeclared (first use in this function)", 1],
  ['an undeclared variable on a later line', 'int main(void)\n{\n    int a = 1;\n    return a + missing;\n}\n', "'missing' undeclared", 4],
  ['a missing semicolon', 'int main(void) { int a = 1\n return a; }', "expected ';' before 'return'", 1],
  ['a missing semicolon after a struct', 'struct P { int x; }\nint main(void) { return 0; }', 'two or more data types in declaration specifiers', 2],
  ['an assignment to a const variable', 'int main(void) { const int k = 1; k = 2; return k; }', "assignment of read-only variable 'k'", 1],
  ['a write through a pointer to const', 'int main(void) { const char *s = "a"; *s = 98; return 0; }', "assignment of read-only location '*s'", 1],
  ['an assignment to a const pointer', 'int main(void) { int a; int * const p = &a; p = 0; return 0; }', "assignment of read-only variable 'p'", 1],
  ['too few arguments', 'int add(int a, int b) { return a + b; }\nint main(void) { return add(1); }', "too few arguments to function 'add'", 2],
  ['too many arguments', 'int add(int a, int b) { return a + b; }\nint main(void) { return add(1, 2, 3); }', "too many arguments to function 'add'", 2],
  ['a member that does not exist', 'struct P { int x; };\nint main(void) { struct P p; p.y = 1; return 0; }', "'struct P' has no member named 'y'", 2],
  ['-> on a struct', 'struct P { int x; };\nint main(void) { struct P p; p->x = 1; return 0; }', "invalid type argument of '->' (have 'struct P'); did you mean '.'?", 2],
  ['. on a pointer', 'struct P { int x; };\nint main(void) { struct P q, *p = &q; p.x = 1; return 0; }', "request for member 'x' in something not a structure or union; did you mean '->'?", 2],
  ['incompatible types in an initialization', 'struct P { int x; };\nint main(void) { struct P p; int i = p; return i; }', "incompatible types in initialization (cannot convert 'struct P' to 'int')", 2],
  ['break outside a loop', 'int main(void) { break; return 0; }', 'break statement not within loop or switch', 1],
  ['continue outside a loop', 'int main(void) { continue; return 0; }', 'continue statement not within a loop', 1],
  ['a declaration in a for loop (C99)', 'int main(void) { int s = 0; for (int i = 0; i < 3; i++) s += i; return s; }', "'for' loop initial declarations are only allowed in C99", 1],
  ['a designated struct initializer (C99)', 'struct P { int x, y; };\nint main(void) { struct P p = { .y = 2 }; return p.y; }', 'designated initializers ([2] = x, .name = x) came with C99', 2],
  ['a designated array initializer (C99)', 'int main(void) { int a[3] = { [1] = 5 }; return a[1]; }', 'designated initializers ([2] = x, .name = x) came with C99', 1],
  ['long long (C99)', 'int main(void) { long long x = 1; return (int)x; }', "'long long' is not part of C89", 1],
  ['bool without a header', 'int main(void) { bool b = 1; return b; }', "'bool' undeclared", 1],
  ['inline (C99)', 'inline int f(void) { return 1; }\nint main(void) { return f(); }', "expected declaration specifiers before 'inline'", 1],
  ['a variable-length array (C99)', 'int main(void) { int n = 3; int a[n]; a[0] = 0; return a[0]; }', 'array size is not an integer constant', 1],
  ['a function defined twice', 'int f(void) { return 1; }\nint f(void) { return 2; }\nint main(void) { return f(); }', "redefinition of 'f' (previous declaration at line 1)", 2],
  ['a local declared twice', 'int main(void) { int a; int a; return 0; }', "redeclaration of 'a' (previous declaration at line 1)", 1],
  ['conflicting types', 'int f(int);\ndouble f(int x) { return x; }\nint main(void) { return 0; }', "conflicting types for 'f' (previous declaration at line 1)", 2],
  ['an undefined reference', 'int helper(int);\nint main(void) { return helper(2); }', "undefined reference to 'helper'", 2],
  ['a call to a function never declared', 'int main(void) { return nosuch(1); }', "undefined reference to 'nosuch' (it was never declared either", 1],
  ['a program with no main', 'int f(void) { return 1; }', "undefined reference to 'main' (every C program needs a function called main)", 0],
  ['an #include that is missing', '#include "missing.h"\nint main(void) { return 0; }', 'missing.h: No such file or directory', 1],
  ['a macro given too few arguments', '#define ADD(a, b) ((a) + (b))\nint main(void) { return ADD(1); }', 'macro "ADD" requires 2 arguments, but only 1 given', 2],
  ['an unterminated string', 'int main(void) { char *s = "abc; return 0; }', 'missing terminating " character', 1],
  ['an unterminated comment', 'int main(void) { return 0; } /* never ends', 'unterminated comment', 1],
  ['using a void value', 'void f(void) {}\nint main(void) { int x = f(); return x; }', 'void value not ignored as it ought to be', 2],
  ['a goto to a missing label', 'int main(void) { goto nowhere; return 0; }', "label 'nowhere' used but not defined", 1],
  ['a duplicate case value', 'int main(void) { int x = 1; switch (x) { case 1: break; case 1: break; } return 0; }', 'duplicate case value', 1],
  ['a case outside a switch', 'int main(void) { case 1: return 0; }', 'case label not within a switch statement', 1],
  ['a negative array size', 'int main(void) { int a[-1]; return 0; }', "size of array 'a' is negative", 1],
  ['subscripting an int', 'int main(void) { int a = 1; return a[0]; }', 'subscripted value is neither array nor pointer', 1],
  ['dereferencing an int', 'int main(void) { int a = 1; return *a; }', "invalid type argument of unary '*' (have 'int')", 1],
  ['taking the address of a value', 'int main(void) { int *p = &(1 + 2); return 0; }', "lvalue required as unary '&' operand", 1],
  ['assigning to a constant', 'int main(void) { int a; 3 = a; return 0; }', 'lvalue required as left operand of assignment', 1],
  ['calling a variable', 'int main(void) { int a = 1; return a(); }', "called object 'a' is not a function", 1],
  ['an unknown type name', 'int main(void) { foo x; return 0; }', "'foo' undeclared", 1],
  ['an incomplete struct variable', 'struct Q;\nint main(void) { struct Q q; return 0; }', "storage size of 'q' isn't known", 2],
  ['assigning to an array', 'int main(void) { int a[2], b[2]; a = b; return 0; }', 'assignment to expression with array type', 1],
  ['a missing closing brace', 'int main(void) { return 0; ', "expected '}' at end of input", 1],
  ['an extra parenthesis', 'int main(void) { return (1 + 2)); }', "expected ';' after return value", 1],
];

// ---- warnings: the program still builds ---------------------------------------------------------------
const WARNINGS = [
  ['a // comment', 'int main(void) { // hi\n return 0; }', '// comments are not part of C89 (they came with C99)', 1],
  ['mixed declarations and code', 'int main(void) { int a = 1; a++; int b = 2; return a + b; }', 'ISO C90 forbids mixed declarations and code', 1],
  ['an implicit declaration', 'int main(void) { printf("hi\\n"); return 0; }', "implicit declaration of function 'printf'", 1],
  ['an unused variable', 'int main(void) { int unused; return 0; }', "unused variable 'unused'", 1],
  ['printf %d given a string', H + 'int main(void) { printf("%d\\n", "x"); return 0; }', "format '%d' expects argument of type 'int', but argument 2 has type 'char *'", 4],
  ['printf %s given an int', H + 'int main(void) { printf("%s\\n", 5); return 0; }', "format '%s' expects argument of type 'char *', but argument 2 has type 'int'", 4],
  ['printf %f given an int', H + 'int main(void) { printf("%f\\n", 5); return 0; }', "format '%f' expects argument of type 'double', but argument 2 has type 'int'", 4],
  ['printf with too few arguments', H + 'int main(void) { printf("%d %d\\n", 5); return 0; }', "format '%d' expects a matching argument", 4],
  ['scanf without &', H + 'int main(void) { int n; scanf("%d", n); return n; }', "format '%d' expects argument of type 'int *', but argument 2 has type 'int' (did you forget the &?)", 4],
  ['scanf %d given a double *', H + 'int main(void) { double d; scanf("%d", &d); return 0; }', "format '%d' expects argument of type 'int *', but argument 2 has type 'double *'", 4],
  ['discarding const', H + 'int main(void) { const char *s = "a"; char *t = s; return t[0]; }', "initialization discards 'const' qualifier from pointer target type", 4],
  ['= in a condition', 'int main(void) { int a = 1; if (a = 2) return 1; return 0; }', 'suggest parentheses around assignment used as truth value', 1],
  ['comparing with a string literal', H + 'int main(void) { char *s = "a"; if (s == "a") return 1; return 0; }', 'comparison with string literal compares addresses, not the text (use strcmp)', 4],
  ['control reaching the end of a function', 'int f(int x) { if (x) return 1; }\nint main(void) { return f(1); }', "control reaches end of non-void function 'f'", 1],
  ['unsigned >= 0', 'int main(void) { unsigned u = 3; if (u >= 0) return 1; return 0; }', 'comparison of unsigned expression >= 0 is always true', 1],
  ['unsigned < 0', 'int main(void) { unsigned u = 3; if (u < 0) return 1; return 0; }', 'comparison of unsigned expression < 0 is always false', 1],
  ['returning the address of a local', 'int *f(void) { int a = 1; return &a; }\nint main(void) { f(); return 0; }', "function returns address of local variable 'a'", 1],
  ['a return value in a void function', 'void f(void) { return 1; }\nint main(void) { f(); return 0; }', "'return' with a value, in function returning void", 1],
  ['a pointer from an integer', 'int main(void) { int *p = 5; return p == 0; }', 'initialization makes pointer from integer without a cast', 1],
  ['an integer from a pointer', 'int main(void) { int a; int *p = &a; int b = p; return b != 0; }', 'initialization makes integer from pointer without a cast', 1],
  ['== as a statement', 'int main(void) { int a = 1; a == 2; return 0; }', 'statement with no effect (did you mean = instead of ==?)', 1],
  ['a constant too big for a char', 'int main(void) { char c = 300; return c; }', 'overflow in implicit constant conversion', 1],
  ['an empty if body', 'int main(void) { int a = 1; if (a); return 0; }', "suggest braces around empty body in an 'if' statement", 1],
];

// ---- run-time crashes: [name, source, title, message part, line] ----------------------------------------
const FAULTS = [
  ['a NULL pointer write', H + 'int main(void)\n{\n    int *p = NULL;\n    *p = 5;\n    return 0;\n}\n', 'Segmentation fault', 'NULL pointer dereference', 7],
  ['a NULL pointer read', H + 'int main(void)\n{\n    int *p = NULL;\n    return *p;\n}\n', 'Segmentation fault', 'NULL pointer dereference', 7],
  ['a stack array overflow', H + 'int main(void)\n{\n    int a[4];\n    int i;\n    for (i = 0; i <= 4; i++) a[i] = i;\n    return a[0];\n}\n', 'Memory error', "write just past the end of 'a' (an array of 4 ints, so the last element is a[3]) in main() (buffer overflow)", 8],
  ['a stack array read past the end', H + 'int main(void)\n{\n    int a[4] = {1, 2, 3, 4};\n    int i = 4;\n    return a[i];\n}\n', 'Memory error', "read just past the end of 'a'", 8],
  ['a heap overflow', H + 'int main(void)\n{\n    int *p = malloc(4 * sizeof(int));\n    int *q = malloc(16);\n    p[4] = 1;\n    free(p);\n    free(q);\n    return 0;\n}\n', 'Memory error', 'write to the header of heap block #2 (the allocator keeps the size here): the access ran past the end of the block before it (heap buffer overflow)', 8],
  ['a strcpy past a heap block', H + 'int main(void)\n{\n    char *s = malloc(5);\n    strcpy(s, "hello");\n    return 0;\n}\n', 'Memory error', 'in strcpy(): write just past the end of heap block #1 (5 bytes from malloc at line 6) (buffer overflow)', 7],
  ['a use after free', H + 'int main(void)\n{\n    int *p = malloc(sizeof(int));\n    free(p);\n    *p = 3;\n    return 0;\n}\n', 'Memory error', 'after it was freed (use after free)', 8],
  ['a double free', H + 'int main(void)\n{\n    int *p = malloc(8);\n    free(p);\n    free(p);\n    return 0;\n}\n', 'Memory error', 'in free(): double free: the block at 0x0804a008 was already freed at line 7', 8],
  ['a division by zero', H + 'int main(void)\n{\n    int z = 0;\n    int a = 10 / z;\n    return a;\n}\n', 'Floating point exception', 'integer division by zero', 7],
  ['a remainder by zero', H + 'int main(void)\n{\n    int z = 0;\n    return 10 % z;\n}\n', 'Floating point exception', 'integer division by zero (in %)', 7],
  ['a stack overflow', H + 'int f(int n)\n{\n    return f(n + 1) + 1;\n}\nint main(void)\n{\n    return f(0);\n}\n', 'Stack overflow', 'calls deep (is a recursive function missing its base case?)', 6],
  ['a write to a string literal', H + 'int main(void)\n{\n    char *s = "hello";\n    s[0] = 72;\n    return 0;\n}\n', 'Segmentation fault', 'write to read-only memory at 0x', 7],
  ['a dangling pointer to a local', H + 'int *f(void)\n{\n    int a = 1;\n    int *p = &a;\n    return p;\n}\nint main(void)\n{\n    int *q = f();\n    return *q;\n}\n', 'Segmentation fault', 'stack memory of a function that has already returned (a dangling pointer to a local variable)', 13],
  ['a free of a stack address', H + 'int main(void)\n{\n    int a = 1;\n    free(&a);\n    return 0;\n}\n', 'Memory error', 'a stack address: only memory from malloc, calloc or realloc can be freed', 7],
  ['a free of the middle of a block', H + 'int main(void)\n{\n    char *p = malloc(8);\n    free(p + 1);\n    return 0;\n}\n', 'Memory error', 'which points into the middle of a block', 7],
  ['a strcpy into a small array', H + 'int main(void)\n{\n    char b[4];\n    strcpy(b, "too long");\n    return 0;\n}\n', 'Memory error', "in strcpy(): write just past the end of 'b'", 7],
];

export default function (t) {
  // ---- Build -------------------------------------------------------------------------------------------
  t.test('Ctrl+B builds and says so in the status bar', async (p) => {
    await p.newFile(dirOf('ctrlb') + '/main.c', H + 'int main(void) { printf("x\\n"); return 0; }\n');
    await p.click('#editors');
    await p.key('b', { ctrl: true });
    await p.wait("/Build finished/.test(SEE.app.buildLog)");
    p.assert.match(await p.status(), /^Built main\.c/);
    p.assert.equal((await p.problems()).length, 0);
  });
  t.test('the toolbar Build button builds', async (p) => {
    await p.newFile(dirOf('tbbuild') + '/main.c', 'int main(void) { return 0; }\n');
    await p.ev("SEE.app.buildLog = ''");
    await p.click('#tbBuild');
    p.assert.match(await logText(p), /Build finished/);
  });
  t.test('Build in the Build menu builds', async (p) => {
    await p.newFile(dirOf('menubuild') + '/main.c', 'int main(void) { return 0; }\n');
    await p.ev("SEE.app.buildLog = ''");
    await p.menu('Build', 'Build');
    p.assert.match(await logText(p), /Build finished/);
  });
  t.test('the Build log starts with the compiler command and folder', async (p) => {
    await buildIn(p, 'logcmd', 'int main(void) { return 0; }\n');
    p.assert.match(await logText(p), /^cc -std=c89 main\.c {3}\(in \/home\/user\/r40\/logcmd\)/);
  });
  t.test('the Build log counts your functions and the C library ones', async (p) => {
    await buildIn(p, 'logcount', H + 'int sq(int x) { return x * x; }\nint cube(int x) { return x * sq(x); }\nint main(void) { printf("%d\\n", cube(2)); return 0; }\n');
    p.assert.match(await logText(p), /Linked 3 functions of yours and \d+ from the C library\./);
  });
  t.test('the Build log says function, singular, for one', async (p) => {
    await buildIn(p, 'logone', 'int main(void) { return 0; }\n');
    p.assert.match(await logText(p), /Linked 1 function of yours/);
  });
  for (const seg of ['text', 'rodata', 'data', 'bss']) {
    t.test(`the Build log lists the ${seg} segment with its addresses and size`, async (p) => {
      await buildIn(p, 'logseg-' + seg, 'int g = 1;\nint z;\nchar *s = "hi";\nint main(void) { return g + z; }\n');
      const log = await logText(p);
      const m = new RegExp('  ' + seg + '\\s+0x([0-9a-f]{8}) - 0x([0-9a-f]{8})  (\\d+) bytes').exec(log);
      p.assert.ok(m, log);
      p.assert.equal(parseInt(m[2], 16) - parseInt(m[1], 16), +m[3]);
    });
  }
  t.test('the Build log says where the heap starts and the stack ends', async (p) => {
    await buildIn(p, 'logheap', 'int main(void) { return 0; }\n');
    const log = await logText(p);
    p.assert.match(log, /heap {4}starts at 0x[0-9a-f]{8}/);
    p.assert.match(log, /stack {3}ends at 0x[0-9a-f]{8} and grows down/);
  });
  t.test('the Build log ends with the time and no errors or warnings', async (p) => {
    await buildIn(p, 'logend', 'int main(void) { return 0; }\n');
    p.assert.match(await logText(p), /Build finished in \d+ ms: 0 errors, 0 warnings\.\n$/);
  });
  t.test('the Build log counts warnings', async (p) => {
    await buildIn(p, 'logwarn', 'int main(void) { int a; int b; return 0; }\n');
    p.assert.match(await logText(p), /Build finished in \d+ ms: 0 errors, 2 warnings\./);
  });
  t.test('a failed build says so in the Build log with the error line', async (p) => {
    await buildIn(p, 'logfail', 'int main(void)\n{\n    return y;\n}\n');
    const log = await logText(p);
    p.assert.match(log, /main\.c:3:\d+: error: 'y' undeclared/);
    p.assert.match(log, /Build failed in \d+ ms: 1 error, 0 warnings\./);
    p.assert.doesNotMatch(log, /Linked/);
  });
  t.test('the Build log tab shows the log text', async (p) => {
    await buildIn(p, 'logtab', 'int main(void) { return 0; }\n');
    await p.click('#tab-log');
    p.assert.ok(await p.visible('#panel-log pre.buildlog'));
    p.assert.match(await p.text('#panel-log pre.buildlog'), /Build finished/);
  });
  t.test('a build of two files names both in the log', async (p) => {
    const d = dirOf('twofiles');
    await p.newFile(d + '/util.c', 'int twice(int x) { return 2 * x; }\n');
    await p.newFile(d + '/main.c', 'int twice(int x);\nint main(void) { return twice(2); }\n');
    await p.build();
    const log = await logText(p);
    p.assert.match(log, /^cc -std=c89 .*main\.c/);
    p.assert.match(log.split('\n')[0], /util\.c/);
    p.assert.match(log, /Linked 2 functions of yours/);
  });
  t.test('a failed build shows Build failed on the chip and in the status bar', async (p) => {
    await buildIn(p, 'chipfail', 'int main(void) { return y; }\n');
    p.assert.equal(await p.chip(), 'Build failed');
    p.assert.match(await p.status(), /Build failed: 'y' undeclared/);
  });
  t.test('a clean build says the compiler is happy in Problems', async (p) => {
    await buildIn(p, 'happy', 'int main(void) { return 0; }\n');
    await p.showBottom('probs');
    p.assert.match(await p.panelText('probs'), /No problems: the compiler is happy/);
    p.assert.equal(await p.count('#tab-probs .badge'), 0);
  });

  // ---- Problems --------------------------------------------------------------------------------------------
  t.test('errors open Problems with a red badge counting them', async (p) => {
    await p.newFile(dirOf('badge-err') + '/other.c', 'int other(void) { return b; }\n');
    await buildIn(p, 'badge-err', 'int main(void)\n{\n    a = 1;\n    return 0;\n}\n');
    p.assert.ok(await p.visible('#panel-probs'));
    p.assert.equal(await p.text('#tab-probs .badge'), '2');
    p.assert.equal(await p.ev("document.querySelector('#tab-probs .badge').classList.contains('warn')"), false);
  });
  t.test('warnings only give a warning badge counting them', async (p) => {
    await buildIn(p, 'badge-warn', 'int main(void) { int a; int b; int c; return 0; }\n');
    p.assert.equal(await p.text('#tab-probs .badge'), '3');
    p.assert.ok(await p.exists('#tab-probs .badge.warn'));
  });
  t.test('a build with warnings shows the Problems panel', async (p) => {
    await p.showBottom('term');
    await buildIn(p, 'warnshow', 'int main(void) { int a; return 0; }\n');
    p.assert.ok(await p.visible('#panel-probs'));
    p.assert.match(await p.status(), /with 1 warning$/);
  });
  t.test('the badge counts errors, not warnings, when there are both', async (p) => {
    await p.newFile(dirOf('badge-both') + '/other.c', 'int other(void) { int u; int v; return 0; }\n');
    await buildIn(p, 'badge-both', 'int main(void) { return nope; }\n');
    p.assert.equal((await p.problems()).length, 3);
    p.assert.equal(await p.text('#tab-probs .badge'), '1');
  });
  t.test('error rows have the error kind, message and location', async (p) => {
    await buildIn(p, 'rowerr', 'int main(void)\n{\n    return zz;\n}\n');
    const row = await p.ev("(() => { const r = document.querySelector('#panel-probs .prob.error'); return [r.querySelector('.kind').textContent, r.querySelector('.msg').innerText, r.querySelector('.loc').innerText]; })()");
    p.assert.equal(row[0], 'error');
    p.assert.match(row[1], /'zz' undeclared/);
    p.assert.match(row[2], /^main\.c:3:\d+$/);
  });
  t.test('warning rows have the warning kind and class', async (p) => {
    await buildIn(p, 'rowwarn', 'int main(void)\n{\n    int w;\n    return 0;\n}\n');
    const row = await p.ev("(() => { const r = document.querySelector('#panel-probs .prob.warning'); return [r.querySelector('.kind').textContent, r.querySelector('.msg').innerText, r.querySelector('.loc').innerText]; })()");
    p.assert.equal(row[0], 'warning');
    p.assert.equal(row[1], "unused variable 'w'");
    p.assert.match(row[2], /^main\.c:3:/);
  });
  t.test('errors are listed before warnings', async (p) => {
    await p.newFile(dirOf('order') + '/a.c', 'int other(void) { int w; return 0; }\n');
    await buildIn(p, 'order', 'int main(void) { return nope; }\n');
    const kinds = await p.ev("[...document.querySelectorAll('#panel-probs .prob .kind')].map(e => e.textContent)");
    p.assert.deepEqual(kinds, ['error', 'warning']);
  });
  t.test('a failed build jumps to the first error line', async (p) => {
    await buildIn(p, 'jumpfirst', 'int main(void)\n{\n    int a = 1;\n    a = a + 1;\n    return q;\n}\n');
    p.assert.equal(await p.ev('SEE.app.active.editor.cursor().line'), 4);
  });
  t.test('double-clicking an error opens its file at its line', async (p) => {
    const d = dirOf('dblerr');
    await p.newFile(d + '/notes.txt', 'some notes\n');
    await p.newFile(d + '/main.c', 'int main(void)\n{\n    int a = 1;\n    a++;\n    return b;\n}\n');
    await p.build();
    await p.ev(`SEE.app.openFile(${JSON.stringify(d + '/notes.txt')})`);
    p.assert.match(await p.activePath(), /notes\.txt$/);
    await p.dblclick('#panel-probs .prob', "'b' undeclared");
    await p.sleep(60);
    p.assert.equal(await p.activePath(), d + '/main.c');
    p.assert.equal(await p.ev('SEE.app.active.editor.cursor().line'), 4);
  });
  t.test('double-clicking a warning moves the cursor to its line', async (p) => {
    await buildIn(p, 'dblwarn', 'int main(void)\n{\n    int a = 1;\n    a++;\n    {\n        int lonely;\n    }\n    return a;\n}\n');
    await p.ev('SEE.app.active.editor.setCursor(0, 0)');
    await p.dblclick('#panel-probs .prob', 'lonely');
    await p.sleep(60);
    p.assert.equal(await p.ev('SEE.app.active.editor.cursor().line'), 5);
  });
  t.test('Enter on a focused problem row jumps to its line', async (p) => {
    await buildIn(p, 'enterrow', 'int main(void)\n{\n    int a;\n    return 0;\n}\n');
    await p.ev('SEE.app.active.editor.setCursor(0, 0)');
    await p.ev("document.querySelector('#panel-probs .prob').focus()");
    await p.key('Enter');
    await p.sleep(60);
    p.assert.equal(await p.ev('SEE.app.active.editor.cursor().line'), 2);
  });
  t.test('double-clicking an error in another file of the project opens that file', async (p) => {
    const d = dirOf('otherfile');
    await p.newFile(d + '/util.c', 'int helper(void)\n{\n    int unused_here;\n    return 1;\n}\n');
    await p.newFile(d + '/main.c', 'int helper(void);\nint main(void) { return helper(); }\n');
    await p.build();
    await p.dblclick('#panel-probs .prob', 'unused_here');
    await p.sleep(60);
    p.assert.equal(await p.activePath(), d + '/util.c');
    p.assert.equal(await p.ev('SEE.app.active.editor.cursor().line'), 2);
  });
  t.test('an error in a header file opens the header', async (p) => {
    const d = dirOf('hdrerr');
    await p.newFile(d + '/bad.h', '/* a header with a mistake */\nint broken(void) { return nothere; }\n');
    await p.newFile(d + '/main.c', '#include "bad.h"\nint main(void) { return broken(); }\n');
    await p.build();
    p.assert.match((await p.problems()).join('\n'), /'nothere' undeclared .* @2/);
    p.assert.equal(await p.activePath(), d + '/bad.h');
    p.assert.equal(await p.ev('SEE.app.active.editor.cursor().line'), 1);
    p.assert.match(await p.text('#panel-probs .prob .loc'), /^bad\.h:2/);
  });
  t.test('double-clicking a header error after moving away opens the header again', async (p) => {
    const d = dirOf('hdrerr2');
    await p.newFile(d + '/defs.h', 'int x = ;\n');
    await p.newFile(d + '/main.c', '#include "defs.h"\nint main(void) { return 0; }\n');
    await p.build();
    await p.ev(`SEE.app.openFile(${JSON.stringify(d + '/main.c')})`);
    await p.dblclick('#panel-probs .prob.error');
    await p.sleep(60);
    p.assert.equal(await p.activePath(), d + '/defs.h');
  });
  t.test('a fixed program clears Problems on the next build', async (p) => {
    await buildIn(p, 'fixit', 'int main(void) { return y; }\n');
    p.assert.equal((await p.problems()).length, 1);
    await p.setCode('int main(void) { return 0; }\n');
    await p.build();
    p.assert.equal((await p.problems()).length, 0);
    p.assert.equal(await p.count('#tab-probs .badge'), 0);
  });

  // ---- compile errors ------------------------------------------------------------------------------------
  for (const [name, src, msg, line] of ERRORS) {
    t.test('compile error: ' + name, async (p) => {
      const probs = await buildIn(p, 'err-' + name, src);
      const want = 'error: ' + msg;
      p.assert.ok(probs.includes(want), 'expected ' + JSON.stringify(want) + ' in\n' + probs);
      if (line) p.assert.ok(probs.split('\n').some((x) => x.includes(want) && x.endsWith('@' + line)), 'wrong line in ' + probs);
      p.assert.equal(await p.chip(), 'Build failed');
    });
  }
  t.test('link error: multiple definition of a variable in two files', async (p) => {
    const d = dirOf('multidef');
    await p.newFile(d + '/shared.h', 'int counter;\n');
    await p.newFile(d + '/b.c', '#include "shared.h"\nint bump(void) { return ++counter; }\n');
    await p.newFile(d + '/a.c', '#include "shared.h"\nint main(void) { return counter; }\n');
    await p.build();
    const probs = (await p.problems()).join('\n');
    p.assert.match(probs, /error: multiple definition of 'counter' \(first defined in .*\.c\); a header should declare it with 'extern'/);
  });
  t.test('link error: multiple definition of a function in two files', async (p) => {
    const d = dirOf('multifn');
    await p.newFile(d + '/b.c', 'int twice(int x) { return x + x; }\n');
    await p.newFile(d + '/a.c', 'int twice(int x) { return 2 * x; }\nint main(void) { return twice(1); }\n');
    await p.build();
    p.assert.match((await p.problems()).join('\n'), /error: multiple definition of 'twice' \(first defined in/);
  });
  t.test('link error: undefined reference to a function misspelt in the other file', async (p) => {
    const d = dirOf('undefref2');
    await p.newFile(d + '/util.c', 'int helpr(int x) { return x; }\n');
    await p.newFile(d + '/main.c', 'int helper(int x);\nint main(void) { return helper(1); }\n');
    await p.build();
    const probs = (await p.problems()).join('\n');
    p.assert.match(probs, /error: undefined reference to 'helper' @2/);
  });
  t.test('link error: a name that is a function in one file and a variable in another', async (p) => {
    const d = dirOf('kindclash');
    await p.newFile(d + '/b.c', 'int thing = 3;\n');
    await p.newFile(d + '/a.c', 'int thing(void) { return 1; }\nint main(void) { return thing(); }\n');
    await p.build();
    p.assert.match((await p.problems()).join('\n'), /'thing' is a function in one file and a variable in another/);
  });
  t.test('the C99 // comment is only a warning but for (int ...) is an error', async (p) => {
    let probs = await buildIn(p, 'c99mix', 'int main(void)\n{\n    int i, s = 0; // fine-ish\n    for (i = 0; i < 3; i++) s += i;\n    return s;\n}\n');
    p.assert.match(probs, /^warning: \/\/ comments are not part of C89 .* @3$/);
    p.assert.match(await logText(p), /Build finished/);
    await p.setCode('int main(void)\n{\n    int s = 0; // fine-ish\n    for (int i = 0; i < 3; i++) s += i;\n    return s;\n}\n');
    await p.build();
    probs = (await p.problems()).join('\n');
    p.assert.match(probs, /error: 'for' loop initial declarations are only allowed in C99 @4/);
    p.assert.match(await logText(p), /Build failed/);
  });

  // ---- warnings ------------------------------------------------------------------------------------------
  for (const [name, src, msg, line] of WARNINGS) {
    t.test('warning: ' + name, async (p) => {
      const probs = await buildIn(p, 'warn-' + name, src);
      const want = 'warning: ' + msg;
      p.assert.ok(probs.includes(want), 'expected ' + JSON.stringify(want) + ' in\n' + probs);
      p.assert.ok(probs.split('\n').some((x) => x.includes(want) && x.endsWith('@' + line)), 'wrong line in ' + probs);
      p.assert.ok(!/^error/m.test(probs), 'unexpected error: ' + probs);
      p.assert.match(await logText(p), /Build finished/);
    });
  }
  t.test('a warning does not stop the program from running', async (p) => {
    const st = await runIn(p, 'warnrun', H + 'int main(void) { int unused; printf("still runs\\n"); return 0; }\n');
    p.assert.equal(st, 'exited');
    p.assert.match(await p.output(), /still runs/);
    p.assert.match((await p.problems()).join('\n'), /unused variable 'unused'/);
  });

  // ---- Run and exit statuses -------------------------------------------------------------------------
  t.test('Ctrl+F5 runs the program', async (p) => {
    await p.newFile(dirOf('ctrlf5') + '/main.c', H + 'int main(void) { printf("from ctrl f5\\n"); return 0; }\n');
    await p.click('#editors');
    await p.key('F5', { ctrl: true });
    await p.waitState('exited');
    p.assert.match(await p.output(), /from ctrl f5/);
    p.assert.equal(await p.ev('!!SEE.app.dbg'), false);
  });
  t.test('the toolbar Run button runs the program', async (p) => {
    await p.newFile(dirOf('tbrun') + '/main.c', H + 'int main(void) { printf("toolbar run\\n"); return 0; }\n');
    await p.click('#tbRun');
    await p.waitState('exited');
    p.assert.match(await p.output(), /toolbar run/);
  });
  t.test('Run in the Build menu runs the program', async (p) => {
    await p.newFile(dirOf('menurun') + '/main.c', H + 'int main(void) { printf("menu run\\n"); return 0; }\n');
    await p.menu('Build', 'Run');
    await p.waitState('exited');
    p.assert.match(await p.output(), /menu run/);
  });
  t.test('the terminal starts with a Running note naming the folder', async (p) => {
    await runIn(p, 'runnote', 'int main(void) { return 0; }\n');
    p.assert.match(await p.output(), /^Running \/home\/user\/r40\/runnote/);
  });
  t.test('Run shows the terminal', async (p) => {
    await p.showBottom('log');
    await runIn(p, 'runterm', 'int main(void) { return 0; }\n');
    p.assert.ok(await p.visible('#panel-term'));
  });
  t.test('return 0 exits with status 0, in green', async (p) => {
    await runIn(p, 'ret0', 'int main(void) { return 0; }\n');
    p.assert.match(await p.output(), /Program exited with status 0\./);
    p.assert.ok(await p.exists('#termOut .note.good'));
    p.assert.equal(await p.chip(), 'Exited (0)');
  });
  for (const [what, body, code] of [['return 3', 'return 3;', 3], ['exit(2)', 'exit(2);', 2], ['exit(EXIT_FAILURE)', 'exit(EXIT_FAILURE);', 1], ['return 255', 'return 255;', 255], ['exit from a function', 'quit(7); return 0;', 7]]) {
    t.test(`${what} exits with status ${code}`, async (p) => {
      const st = await runIn(p, 'status-' + what, H + 'void quit(int c) { exit(c); }\nint main(void)\n{\n    ' + body + '\n}\n');
      p.assert.equal(st, 'exited');
      p.assert.equal(await p.ev('SEE.app.vm.exitCode'), code);
      p.assert.match(await p.output(), new RegExp('Program exited with status ' + code + '\\.'));
      p.assert.equal(await p.chip(), 'Exited (' + code + ')');
      p.assert.ok(await p.exists('#termOut .note.bad'));
    });
  }
  t.test('abort shows Aborted', async (p) => {
    const st = await runIn(p, 'abort', H + 'int main(void)\n{\n    printf("about to abort\\n");\n    abort();\n    return 0;\n}\n');
    p.assert.equal(st, 'faulted');
    p.assert.match(await p.output(), /about to abort\n/);
    p.assert.match(await p.output(), /Aborted: abort\(\) was called/);
    p.assert.equal(await p.chip(), 'Aborted');
  });
  t.test('a failed assert prints the assertion and aborts', async (p) => {
    const st = await runIn(p, 'assert', H + '#include <assert.h>\nint main(void)\n{\n    int x = 1;\n    assert(x == 2);\n    return 0;\n}\n');
    p.assert.equal(st, 'faulted');
    p.assert.match(await p.output(), /Assertion failed: x == 2, file .*main\.c, line 8/);
    p.assert.match(await p.output(), /Aborted/);
  });
  t.test('Run does not start when the build fails', async (p) => {
    await p.ev('SEE.app.stop()');
    await runIn(p, 'runfail', 'int main(void) { return nope; }\n');
    p.assert.equal(await p.state(), 'none');
    p.assert.ok(await p.visible('#panel-probs'));
  });

  // ---- run-time crashes ------------------------------------------------------------------------------
  for (const [name, src, title, msg, line] of FAULTS) {
    t.test('crash: ' + name + ' stops with the right title and message', async (p) => {
      const st = await runIn(p, 'fault-' + name, src);
      p.assert.equal(st, 'faulted');
      const f = await faultText(p);
      p.assert.ok(f.startsWith(title + ': '), f);
      p.assert.ok(f.includes(msg), f + ' lacks ' + msg);
      p.assert.equal(await p.ev('SEE.app.vm.fault.at.line'), line);
      p.assert.equal(await p.chip(), title);
    });
    t.test('crash: ' + name + ' is reported in the terminal and in Problems', async (p) => {
      await runIn(p, 'faultp-' + name, src);
      const out = await p.output();
      p.assert.ok(out.includes(title + ': '), out);
      p.assert.ok(out.includes(msg), out);
      p.assert.match(out, new RegExp('\\(line ' + line + ' in \\w+\\(\\)\\)'));
      p.assert.ok(await p.exists('#termOut .note.bad'));
      const probs = (await p.problems()).join('\n');
      p.assert.ok(probs.split('\n').some((x) => x.startsWith('runtime: ' + title + ': ') && x.includes(msg) && x.endsWith('@' + line)), probs);
      await p.showBottom('probs');
      p.assert.match(await p.text('#panel-probs .prob .kind'), /run time/i);
    });
  }
  t.test('a crash marks its line in the editor and shows the memory picture', async (p) => {
    await runIn(p, 'faultmark', H + 'int main(void)\n{\n    int *p = NULL;\n    *p = 5;\n    return 0;\n}\n');
    p.assert.equal(await p.ev("document.getElementById('panel-memory').style.display"), '');
    p.assert.match(await p.status(), /Segmentation fault at line 7/);
  });
  t.test('SIGTERM raised without a handler stops the program', async (p) => {
    const st = await runIn(p, 'sigterm', H + '#include <signal.h>\nint main(void)\n{\n    raise(SIGTERM);\n    return 0;\n}\n');
    p.assert.equal(st, 'faulted');
    p.assert.match(await faultText(p), /the program was stopped by signal SIGTERM/);
  });

  // ---- run-time warnings -------------------------------------------------------------------------------
  t.test('reading an uninitialised variable warns in the terminal and Problems', async (p) => {
    const st = await runIn(p, 'uninit', H + 'int main(void)\n{\n    int x;\n    int y = x + 1;\n    printf("%d\\n", y > 0);\n    return 0;\n}\n');
    p.assert.equal(st, 'exited');
    p.assert.match(await p.output(), /warning: reading 'x' in main\(\) before it was given a value \(line 7\)/);
    p.assert.ok((await p.problems()).includes("runtime: reading 'x' in main() before it was given a value @7"));
  });
  t.test('signed overflow warns and the value wraps', async (p) => {
    const st = await runIn(p, 'signedov', H + '#include <limits.h>\nint main(void)\n{\n    int x = INT_MAX;\n    x = x + 1;\n    printf("%d\\n", x);\n    return 0;\n}\n');
    p.assert.equal(st, 'exited');
    const out = await p.output();
    p.assert.match(out, /warning: signed integer overflow: 2147483647 \+ 1 does not fit in an int/);
    p.assert.match(out, /-2147483648\n/);
    p.assert.match((await p.problems()).join('\n'), /runtime: signed integer overflow.* @8/);
  });
  t.test('the signed overflow warning names the line of the overflowing statement', async (p) => {
    await runIn(p, 'signedovline', 'int main(void)\n{\n    int x = 2147483647;\n    int y = 0;\n    y = 5;\n    x = x + 1;\n    return y;\n}\n');
    p.assert.match((await p.problems()).join('\n'), /runtime: signed integer overflow.* @6/);
    p.assert.match(await p.output(), /signed integer overflow.*\(line 6\)/);
  });

  t.test('unsigned wrap-around is not an overflow warning', async (p) => {
    await runIn(p, 'unsignedwrap', H + 'int main(void)\n{\n    unsigned u = 0;\n    u = u - 1;\n    printf("%u\\n", u);\n    return 0;\n}\n');
    const out = await p.output();
    p.assert.match(out, /4294967295/);
    p.assert.doesNotMatch(out, /overflow/);
  });
  t.test('the overflow check can be turned off in the Build menu', async (p) => {
    await p.newFile(dirOf('ovoff') + '/main.c', H + '#include <limits.h>\nint main(void)\n{\n    int x = INT_MAX;\n    x = x + 1;\n    printf("%d\\n", x);\n    return 0;\n}\n');
    await p.menu('Build');
    const item = (await p.menuItems()).find((x) => x.label === 'Check for integer overflow');
    p.assert.equal(item.checked, true);
    await p.click('.menu-pop .menu-item', 'Check for integer overflow');
    await p.sleep(80);
    try {
      p.assert.equal(await p.ev('SEE.app.settings.overflow'), false);
      await p.ev('SEE.app.run()');
      await p.waitState('exited');
      const out = await p.output();
      p.assert.match(out, /-2147483648/);
      p.assert.doesNotMatch(out, /signed integer overflow/);
      p.assert.ok(!(await p.problems()).some((x) => /overflow/.test(x)));
      await p.menu('Build');
      p.assert.equal((await p.menuItems()).find((x) => x.label === 'Check for integer overflow').checked, false);
      await p.closeMenus();
    } finally {
      await p.ev('SEE.app.settings.overflow = true; SEE.app.saveSettings()');
    }
  });
  t.test('the gets warning appears when gets is called', async (p) => {
    await runIn(p, 'getswarn', H + 'int main(void)\n{\n    char b[16];\n    gets(b);\n    printf("[%s]\\n", b);\n    return 0;\n}\n', { input: 'abc\n' });
    p.assert.match(await p.output(), /warning: gets\(\) cannot know how big the buffer is/);
    p.assert.match(await p.output(), /\[abc\]/);
  });

  // ---- leaks -------------------------------------------------------------------------------------------
  const LEAK = H + 'int main(void)\n{\n    char *p = malloc(10);\n    char *q = malloc(20);\n    p[0] = 0;\n    q[0] = 0;\n    return 0;\n}\n';
  t.test('the leak report at exit counts the blocks and bytes', async (p) => {
    await runIn(p, 'leak', LEAK);
    p.assert.match(await p.output(), /Memory leak: 2 heap blocks \(30 bytes\) never freed: #1 \(10 bytes, malloc at line 6\), #2 \(20 bytes, malloc at line 7\)/);
  });
  t.test('the leaked blocks are listed in Problems', async (p) => {
    await runIn(p, 'leakprobs', LEAK);
    const probs = await p.problems();
    p.assert.ok(probs.includes('runtime: memory leak: block #1 (10 bytes) from malloc was never freed @6'), probs.join('\n'));
    p.assert.ok(probs.includes('runtime: memory leak: block #2 (20 bytes) from malloc was never freed @7'));
  });
  t.test('one leaked block is reported in the singular', async (p) => {
    await runIn(p, 'leakone', H + 'int main(void)\n{\n    int *a = calloc(3, sizeof(int));\n    return a[0];\n}\n');
    p.assert.match(await p.output(), /Memory leak: 1 heap block \(12 bytes\) never freed: #1 \(12 bytes, calloc at line 6\)/);
  });
  t.test('a program that frees everything reports no leak', async (p) => {
    await runIn(p, 'noleak', H + 'int main(void)\n{\n    char *p = malloc(10);\n    p = realloc(p, 40);\n    free(p);\n    return 0;\n}\n');
    p.assert.doesNotMatch(await p.output(), /Memory leak/);
  });
  t.test('more than four leaks are shortened with an ellipsis', async (p) => {
    await runIn(p, 'leakmany', H + 'int main(void)\n{\n    int i;\n    for (i = 0; i < 6; i++) malloc(4);\n    return 0;\n}\n');
    p.assert.match(await p.output(), /Memory leak: 6 heap blocks \(24 bytes\) never freed: .*#4 \(4 bytes, malloc at line 7\), …/);
  });

  // ---- Stop --------------------------------------------------------------------------------------------
  const LOOP = 'int main(void)\n{\n    volatile int i = 0;\n    for (;;) i++;\n    return 0;\n}\n';
  t.test('the Stop button stops a program that never ends', async (p) => {
    await runIn(p, 'stopbtn', LOOP, { wait: false });
    await p.sleep(150);
    p.assert.equal(await p.state(), 'running');
    p.assert.equal(await p.ev("document.getElementById('tbStop').disabled"), false);
    await p.click('#tbStop');
    p.assert.equal(await p.state(), 'none');
    p.assert.match(await p.output(), /Stopped\.\n$/);
    p.assert.equal(await p.chip(), 'Stopped');
    p.assert.equal(await p.status(), 'Program stopped.');
  });
  t.test('Shift+F5 stops a running program', async (p) => {
    await runIn(p, 'stopkey', LOOP, { wait: false });
    await p.sleep(100);
    await p.key('F5', { shift: true });
    p.assert.equal(await p.state(), 'none');
    p.assert.match(await p.output(), /Stopped\./);
  });
  t.test('Stop in the Build menu stops a running program', async (p) => {
    await runIn(p, 'stopmenu', LOOP, { wait: false });
    await p.sleep(100);
    await p.menu('Build', 'Stop');
    p.assert.equal(await p.state(), 'none');
  });
  t.test('Stop flushes what the program printed before it was stopped', async (p) => {
    await runIn(p, 'stopflush', H + 'int main(void)\n{\n    volatile int i = 0;\n    printf("partial");\n    for (;;) i++;\n    return 0;\n}\n', { wait: false });
    await p.sleep(120);
    await p.click('#tbStop');
    p.assert.match(await p.output(), /partial\nStopped\./);
  });
  t.test('Stop is disabled when nothing runs', async (p) => {
    await p.ev('SEE.app.stop()');
    await p.ev('SEE.app.updateUI()');
    p.assert.equal(await p.ev("document.getElementById('tbStop').disabled"), true);
  });
  t.test('Run is disabled while a program runs', async (p) => {
    await runIn(p, 'rundisabled', LOOP, { wait: false });
    await p.sleep(100);
    p.assert.equal(await p.ev("document.getElementById('tbRun').disabled"), true);
    await p.stopProgram();
    p.assert.equal(await p.ev("document.getElementById('tbRun').disabled"), false);
  });

  // ---- Run with arguments ------------------------------------------------------------------------------
  const ARGV = H + 'int main(int argc, char *argv[])\n{\n    int i;\n    printf("argc=%d\\n", argc);\n    for (i = 0; i < argc; i++) printf("argv[%d]=[%s]\\n", i, argv[i]);\n    return 0;\n}\n';
  t.test('Run with arguments passes the words to main', async (p) => {
    await p.newFile(dirOf('args') + '/main.c', ARGV);
    try {
      await p.menu('Build', 'Run with arguments…');
      p.assert.equal(await p.waitModal(), 'Run with arguments');
      await p.modalInput('one "two words" 3');
      await p.modalButton('OK');
      await p.waitState('exited');
      const out = await p.output();
      p.assert.match(out, /argc=4/);
      p.assert.match(out, /argv\[0\]=\[args\]/);
      p.assert.match(out, /argv\[1\]=\[one\]/);
      p.assert.match(out, /argv\[2\]=\[two words\]/);
      p.assert.match(out, /argv\[3\]=\[3\]/);
      p.assert.match(out, /arguments: one "two words" 3/);
    } finally {
      await p.ev("SEE.app.settings.args = ''; SEE.app.saveSettings()");
    }
  });
  t.test('the arguments are remembered for the next Run', async (p) => {
    await p.newFile(dirOf('argskeep') + '/main.c', ARGV);
    try {
      await p.menu('Build', 'Run with arguments…');
      await p.waitModal();
      await p.modalInput('alpha beta');
      await p.modalButton('OK');
      await p.waitState('exited');
      await p.ev('SEE.app.run()');
      await p.waitState('exited');
      p.assert.match(await p.output(), /argc=3[\s\S]*\[alpha\][\s\S]*\[beta\]/);
      await p.menu('Build', 'Run with arguments…');
      await p.waitModal();
      p.assert.equal(await p.ev("document.querySelector('.modal-back:last-child .modal input').value"), 'alpha beta');
      await p.modalButton('Cancel');
    } finally {
      await p.ev("SEE.app.settings.args = ''; SEE.app.saveSettings()");
    }
  });
  t.test('Cancel in Run with arguments does not run', async (p) => {
    await p.ev('SEE.app.stop()');
    await p.newFile(dirOf('argscancel') + '/main.c', ARGV);
    await p.menu('Build', 'Run with arguments…');
    await p.waitModal();
    await p.modalButton('Cancel');
    await p.sleep(100);
    p.assert.equal(await p.state(), 'none');
  });
  t.test('arguments from the settings arrive in argv, quoted ones whole', async (p) => {
    try {
      await p.ev(`SEE.app.settings.args = 'one "two words" 3'`);
      await runIn(p, 'argset', ARGV);
      const out = await p.output();
      p.assert.match(out, /argc=4/);
      p.assert.match(out, /argv\[0\]=\[argset\]/);
      p.assert.match(out, /argv\[1\]=\[one\]/);
      p.assert.match(out, /argv\[2\]=\[two words\]/);
      p.assert.match(out, /argv\[3\]=\[3\]/);
      p.assert.match(out, /arguments: one "two words" 3/);
    } finally {
      await p.ev("SEE.app.settings.args = ''; SEE.app.saveSettings()");
    }
  });
  t.test('without arguments argc is 1 and argv[0] is the folder name', async (p) => {
    await runIn(p, 'noargs', ARGV);
    const out = await p.output();
    p.assert.match(out, /argc=1\n/);
    p.assert.match(out, /argv\[0\]=\[noargs\]/);
  });

  // ---- the C library -------------------------------------------------------------------------------------
  t.test('a file written in /tmp is read back by the program', async (p) => {
    await runIn(p, 'tmpfile', H + 'int main(void)\n{\n    FILE *f = fopen("/tmp/e2e40.txt", "w");\n    char line[64];\n    fprintf(f, "alpha %d\\n", 7);\n    fclose(f);\n    f = fopen("/tmp/e2e40.txt", "r");\n    fgets(line, sizeof line, f);\n    fclose(f);\n    printf("read: %s", line);\n    return 0;\n}\n');
    p.assert.match(await p.output(), /read: alpha 7\n/);
    p.assert.equal(await p.ev("SEE.app.vfs.readText('/tmp/e2e40.txt')"), 'alpha 7\n');
  });
  t.test('a file appended to in /tmp keeps both lines', async (p) => {
    await p.ev("SEE.app.vfs.writeText('/tmp/e2e40-app.txt', 'first\\n', { trusted: true })");
    await runIn(p, 'tmpappend', H + 'int main(void)\n{\n    FILE *f = fopen("/tmp/e2e40-app.txt", "a");\n    fputs("second\\n", f);\n    fclose(f);\n    return 0;\n}\n');
    p.assert.equal(await p.ev("SEE.app.vfs.readText('/tmp/e2e40-app.txt')"), 'first\nsecond\n');
  });
  t.test('a file the IDE wrote is read by fscanf', async (p) => {
    await p.ev("SEE.app.vfs.writeText('/tmp/e2e40-nums.txt', '4 5 6\\n', { trusted: true })");
    await runIn(p, 'fscanf', H + 'int main(void)\n{\n    FILE *f = fopen("/tmp/e2e40-nums.txt", "r");\n    int a, b, c, n;\n    n = fscanf(f, "%d %d %d", &a, &b, &c);\n    fclose(f);\n    printf("n=%d sum=%d\\n", n, a + b + c);\n    return 0;\n}\n');
    p.assert.match(await p.output(), /n=3 sum=15/);
  });
  t.test('fopen of a missing file returns NULL', async (p) => {
    await runIn(p, 'fopennull', H + 'int main(void)\n{\n    FILE *f = fopen("/tmp/no/such/file.txt", "r");\n    printf("%s\\n", f == NULL ? "null" : "open");\n    return 0;\n}\n');
    p.assert.match(await p.output(), /null\n/);
  });
  t.test('time gives the current time', async (p) => {
    await runIn(p, 'time', H + '#include <time.h>\nint main(void)\n{\n    time_t t = time(NULL);\n    struct tm *tm = localtime(&t);\n    printf("%d %d\\n", t > 1000000000, tm->tm_year + 1900 >= 2024);\n    return 0;\n}\n');
    p.assert.match(await p.output(), /1 1\n/);
  });
  t.test('rand repeats after srand with the same seed', async (p) => {
    await runIn(p, 'rand', H + 'int main(void)\n{\n    int a, b, c;\n    srand(42); a = rand(); b = rand();\n    srand(42); c = rand();\n    printf("%d %d %d %d\\n", a == c, a != b, RAND_MAX >= 32767, a >= 0 && a <= RAND_MAX);\n    return 0;\n}\n');
    p.assert.match(await p.output(), /1 1 1 1\n/);
  });
  t.test('qsort sorts with a comparison function', async (p) => {
    await runIn(p, 'qsort', H + 'int cmp(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }\nint main(void)\n{\n    int v[6] = {5, 3, 9, 1, 7, 2};\n    int i;\n    qsort(v, 6, sizeof(int), cmp);\n    for (i = 0; i < 6; i++) printf("%d ", v[i]);\n    printf("\\n");\n    return 0;\n}\n');
    p.assert.match(await p.output(), /1 2 3 5 7 9 \n/);
  });
  t.test('qsort and bsearch work on strings', async (p) => {
    await runIn(p, 'bsearch', H + 'int cmp(const void *a, const void *b) { return strcmp(*(char * const *)a, *(char * const *)b); }\nint main(void)\n{\n    char *w[4] = {"pear", "apple", "fig", "kiwi"};\n    char *key = "kiwi";\n    char **hit;\n    qsort(w, 4, sizeof w[0], cmp);\n    hit = bsearch(&key, w, 4, sizeof w[0], cmp);\n    printf("%s %s %s %s at %d\\n", w[0], w[1], w[2], w[3], (int)(hit - w));\n    return 0;\n}\n');
    p.assert.match(await p.output(), /apple fig kiwi pear at 2\n/);
  });
  t.test('setjmp and longjmp jump back', async (p) => {
    await runIn(p, 'setjmp', H + '#include <setjmp.h>\njmp_buf env;\nvoid f(int n) { if (n > 2) longjmp(env, n); f(n + 1); }\nint main(void)\n{\n    int r = setjmp(env);\n    if (r == 0) { f(0); printf("not here\\n"); }\n    else printf("jumped %d\\n", r);\n    return 0;\n}\n');
    const out = await p.output();
    p.assert.match(out, /jumped 3\n/);
    p.assert.doesNotMatch(out, /not here/);
  });
  t.test('signal and raise call the handler', async (p) => {
    await runIn(p, 'signal', H + '#include <signal.h>\nvoid h(int s) { printf("caught %d\\n", s); }\nint main(void)\n{\n    signal(SIGINT, h);\n    raise(SIGINT);\n    printf("after\\n");\n    return 0;\n}\n');
    p.assert.match(await p.output(), /caught 2\nafter\n/);
  });
  t.test('atexit functions run in reverse order after main', async (p) => {
    await runIn(p, 'atexit', H + 'void a(void) { printf("a\\n"); }\nvoid b(void) { printf("b\\n"); }\nint main(void)\n{\n    atexit(a);\n    atexit(b);\n    printf("main\\n");\n    return 0;\n}\n');
    p.assert.match(await p.output(), /main\nb\na\n/);
  });
  t.test('string and math functions give the right results', async (p) => {
    await runIn(p, 'strmath', H + '#include <math.h>\n#include <ctype.h>\nint main(void)\n{\n    char b[32];\n    strcpy(b, "abc");\n    strcat(b, "def");\n    printf("%s %d %d %.3f %c %d\\n", b, (int)strlen(b), strcmp("a", "b") < 0, sqrt(2.0), toupper(\'q\'), atoi("123") + 1);\n    return 0;\n}\n');
    p.assert.match(await p.output(), /abcdef 6 1 1\.414 Q 124\n/);
  });
  t.test('sprintf and sscanf round-trip values', async (p) => {
    await runIn(p, 'sprintf', H + 'int main(void)\n{\n    char b[64];\n    int a; double d; char w[8];\n    sprintf(b, "%d %.2f %s", 42, 3.5, "hey");\n    sscanf(b, "%d %lf %7s", &a, &d, w);\n    printf("[%s] %d %.1f %s\\n", b, a, d, w);\n    return 0;\n}\n');
    p.assert.match(await p.output(), /\[42 3\.50 hey\] 42 3\.5 hey\n/);
  });

  // ---- Show the preprocessed file / what the linker made -------------------------------------------------
  t.test('Show the preprocessed file opens the .i file with macros replaced', async (p) => {
    await p.newFile(dirOf('pp') + '/main.c', '#include <stdio.h>\n#define SQ(x) ((x) * (x))\n#define LIMIT 10\nint main(void)\n{\n    /* a comment */\n    printf("%d\\n", SQ(LIMIT));\n    return 0;\n}\n');
    await p.menu('Build', 'Show the preprocessed file');
    await p.wait("SEE.app.active && SEE.app.active.path === '/tmp/main.i'");
    const code = await p.code();
    p.assert.match(code, /^\/\* main\.c after the preprocessor/);
    p.assert.match(code, /\(\(10\) \* \(10\)\)|\(\(10\)\*\(10\)\)/);
    p.assert.doesNotMatch(code, /SQ\(|LIMIT|a comment/);
    p.assert.match(code, /printf/);
    p.assert.ok(await p.ev("SEE.app.vfs.exists('/tmp/main.i')"));
  });
  t.test('the preprocessed file pastes in the included header', async (p) => {
    await p.newFile(dirOf('pphdr') + '/mine.h', 'int from_my_header(int value);\n');
    await p.newFile(dirOf('pphdr') + '/main.c', '#include "mine.h"\nint main(void) { return from_my_header(1); }\n');
    await p.menu('Build', 'Show the preprocessed file');
    await p.wait("SEE.app.active && SEE.app.active.path === '/tmp/main.i'");
    p.assert.match(await p.code(), /int from_my_header \(int value\);|int from_my_header\(int value\);/);
  });
  t.test('#if 0 blocks are gone from the preprocessed file', async (p) => {
    await p.newFile(dirOf('ppif') + '/main.c', '#if 0\nint hidden_away;\n#endif\n#ifdef NOTDEF\nint also_hidden;\n#else\nint shown_here;\n#endif\nint main(void) { return 0; }\n');
    await p.menu('Build', 'Show the preprocessed file');
    await p.wait("SEE.app.active && SEE.app.active.path === '/tmp/main.i'");
    const code = await p.code();
    p.assert.doesNotMatch(code, /hidden_away|also_hidden/);
    p.assert.match(code, /shown_here/);
  });
  t.test('Show the preprocessed file is disabled for a file that is not .c', async (p) => {
    await p.newFile(dirOf('ppdis') + '/notes.txt', 'hello\n');
    await p.menu('Build');
    p.assert.equal((await p.menuItems()).find((x) => x.label === 'Show the preprocessed file').disabled, true);
    await p.closeMenus();
  });
  t.test('Show what the linker made lists segments, functions, objects and strings', async (p) => {
    await p.newFile(dirOf('linkmap') + '/main.c', H + 'int counter = 5;\nchar buffer[16];\nint helper(void) { return counter; }\nint main(void) { printf("hello\\n"); return helper(); }\n');
    await p.menu('Build', 'Show what the linker made');
    await p.wait("SEE.app.active && SEE.app.active.path === '/tmp/linkmap.txt'");
    const s = await p.code();
    p.assert.match(s, /^\/\* What the linker made of \/home\/user\/r40\/linkmap \*\//);
    for (const seg of ['text', 'rodata', 'data', 'bss']) p.assert.match(s, new RegExp('^' + seg + ' +0x[0-9a-f]{8} - 0x[0-9a-f]{8}$', 'm'));
    p.assert.match(s, /Functions \(\.text\)/);
    p.assert.match(s, /0x[0-9a-f]{8} {2}main {3}\/home\/user\/r40\/linkmap\/main\.c/);
    p.assert.match(s, /0x[0-9a-f]{8} {2}helper /);
    p.assert.match(s, /printf {3}\(C library\)/);
    p.assert.match(s, /Objects\n[\s\S]*data +counter {2}int/);
    p.assert.match(s, /bss +buffer {2}char ?\[16\]/);
    p.assert.match(s, /String literals \(\.rodata\)\n[\s\S]*"hello\\n"/);
  });
  t.test('Show what the linker made does nothing but report when the build fails', async (p) => {
    await p.newFile(dirOf('linkfail') + '/main.c', 'int main(void) { return nope; }\n');
    await p.menu('Build', 'Show what the linker made');
    await p.sleep(100);
    p.assert.equal(await p.activePath(), dirOf('linkfail') + '/main.c');
    p.assert.match((await p.problems()).join('\n'), /'nope' undeclared/);
  });

  // ---- Build menu state ------------------------------------------------------------------------------------
  t.test('the Build menu lists its items and shortcuts', async (p) => {
    await p.newFile(dirOf('menulist') + '/main.c', 'int main(void) { return 0; }\n');
    await p.ev('SEE.app.stop()');
    await p.menu('Build');
    const items = await p.menuItems();
    await p.closeMenus();
    const get = (l) => items.find((x) => x.label === l);
    p.assert.equal(get('Build').sc, 'Ctrl+B');
    p.assert.equal(get('Run').sc, 'Ctrl+F5');
    p.assert.equal(get('Stop').sc, 'Shift+F5');
    p.assert.equal(get('Stop').disabled, true);
    p.assert.ok(get('Run with arguments…'));
    p.assert.ok(get('Show what the linker made'));
  });
  t.test('Build and Run are disabled in the menu while a program runs', async (p) => {
    await runIn(p, 'menudisabled', LOOP, { wait: false });
    await p.sleep(100);
    await p.menu('Build');
    const items = await p.menuItems();
    await p.closeMenus();
    p.assert.equal(items.find((x) => x.label === 'Build').disabled, true);
    p.assert.equal(items.find((x) => x.label === 'Run').disabled, true);
    p.assert.equal(items.find((x) => x.label === 'Stop').disabled, false);
    await p.stopProgram();
  });
}
