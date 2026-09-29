// The code editor: typing, the gutter, C colouring, indenting, comments, find and replace, go to
// line, code size, hover cards, the context menus, breakpoints and the marks a build or the
// debugger puts on lines.
const FILE = '/home/user/ed/main.c';
const ed = (body) => `(() => { const e = SEE.app.active.editor; ${body} })()`;

/** Open a file with this text, focus the editor and put the caret at (line, col) */
async function open(p, text, line = 0, col = 0, path = FILE) {
  await p.newFile(path, text);
  await p.ev(ed(`e.setCursor(${line}, ${col}); e.render();`));
  await p.sleep(30);
}
const cursor = (p) => p.ev(ed('return e.cursor();'));
const select = (p, s, en) => p.ev(ed(`e.ta.focus(); e.ta.setSelectionRange(${s}, ${en}); e.updateCursor();`));
const selection = (p) => p.ev(ed('return [e.ta.selectionStart, e.ta.selectionEnd];'));
/** [class, text] of every coloured piece of a line */
const spans = (p, line) => p.ev(ed(`e.render(); return [...e.hl.children[${line}].querySelectorAll('span')].map(s => [s.className, s.textContent]);`));
const has = (list, cls, text) => list.some(([c, t]) => c === cls && t === text);
const lineCls = (p, line) => p.ev(ed(`e.render(); return e.hl.children[${line}].className;`));
const gutterCls = (p, line) => p.ev(ed(`e.render(); return e.inner.children[${line}].className;`));
const bps = (p, path = FILE) => p.ev(`[...(SEE.app.breakpoints.get(${JSON.stringify(path)}) || new Map())].map(([l, b]) => [l, b.cond, b.disabled])`);

async function wordPoint(p, line, col) {
  return p.ev(ed(`e.revealLine(${line}); const r = e.ta.getBoundingClientRect(); return [r.left + e.padLeft + (${col} + 0.5) * e.charWidth - e.ta.scrollLeft, r.top + e.padTop + (${line} + 0.5) * e.lineHeight - e.ta.scrollTop];`));
}
async function gutterPoint(p, line) {
  return p.ev(ed(`e.render(); const g = e.inner.children[${line}]; const r = g.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];`));
}
async function clickGutter(p, line, button = 'left') { const [x, y] = await gutterPoint(p, line); await p.clickAt(x, y, { button }); }
/** Rest the mouse over a column of a line; resolves once the editor has reported the hover */
async function hoverAt(p, line, col) {
  await p.ev("SEE.app.callout.hide(); window.__hov = 0; if (!SEE.app.active.editor.__hovHook) { SEE.app.active.editor.__hovHook = true; SEE.app.active.editor.on('hover', () => { window.__hov++; }); }");
  await p.mouse('mouseMoved', 2, 2);
  const [x, y] = await wordPoint(p, line, col);
  await p.mouse('mouseMoved', x, y);
  await p.wait('window.__hov > 0', 3000);
  await p.sleep(40);
}
async function rightClickWord(p, line, col) { const [x, y] = await wordPoint(p, line, col); await p.clickAt(x, y, { button: 'right' }); await p.sleep(40); }
async function pickMenu(p, label) {
  const ok = await p.ev(`(() => { const e = [...document.querySelectorAll('.menu-pop .menu-item')].find(x => x.children[0].innerText === ${JSON.stringify(label)}); if (!e) return false; e.click(); return true; })()`);
  p.assert.ok(ok, 'menu item ' + label);
  await p.sleep(80);
}
async function menuPick(p, menu, label) { await p.menu(menu); await pickMenu(p, label); }
const labels = async (p) => (await p.menuItems()).map((x) => x.label);

const LOOP = '#include <stdio.h>\nint main(void)\n{\n    int i;\n    int s = 0;\n    for (i = 0; i < 10; i++)\n        s += i;\n    printf("%d\\n", s);\n    return 0;\n}\n';
const TWO = '#include <stdio.h>\nint twice(int n)\n{\n    int r = n * 2;\n    return r;\n}\nint main(void)\n{\n    int a = 4;\n    int b = twice(a);\n    printf("%d\\n", b);\n    return 0;\n}\n';

export default function (t) {
  t.beforeEach(async (p) => {
    await p.ev('SEE.app.stop(); SEE.UI.closeAllModals(); SEE.UI.closeMenus(); SEE.app.callout.hide(); SEE.app.clearBreakpoints(); SEE.app.settings.fontSize = 14; delete SEE.app.settings.tabSize; delete SEE.app.settings.autoIndent; SEE.app.applyTheme(); SEE.app.problems = []; SEE.app.applyDiagnosticsAll();');
  });

  // ---- typing --------------------------------------------------------------------------------------
  t.test('typing puts the text into an empty file', async (p) => {
    await open(p, '');
    await p.type('int x;');
    p.assert.equal(await p.code(), 'int x;');
  });
  t.test('typing marks the document as changed', async (p) => {
    await open(p, 'int x;\n', 0, 6);
    p.assert.equal(await p.ev('SEE.app.active.dirty'), false);
    await p.type(' ');
    p.assert.equal(await p.ev('SEE.app.active.dirty'), true);
  });
  t.test('typing in the middle of a line inserts there', async (p) => {
    await open(p, 'int x;\n', 0, 5);
    await p.type('yz');
    p.assert.equal(await p.code(), 'int xyz;\n');
  });
  t.test('Backspace deletes the character before the caret', async (p) => {
    await open(p, 'int xy;\n', 0, 6);
    await p.key('Backspace');
    p.assert.equal(await p.code(), 'int x;\n');
  });
  t.test('Delete removes the character after the caret', async (p) => {
    await open(p, 'int xy;\n', 0, 5);
    await p.key('Delete');
    p.assert.equal(await p.code(), 'int x;\n');
  });
  t.test('typed text appears coloured in the highlight layer', async (p) => {
    await open(p, '');
    await p.type('return 1;');
    const s = await spans(p, 0);
    p.assert.ok(has(s, 'c-kw', 'return'), JSON.stringify(s));
    p.assert.ok(has(s, 'c-num', '1'));
  });
  t.test('the highlight layer shows exactly the text of the editor', async (p) => {
    const src = '#include <stdio.h>\n/* a < b && c > d */\nint main(void) { char *s = "<b>&amp;</b>"; return s[0] == \'<\'; }\n';
    await open(p, src);
    const shown = await p.ev(ed("e.render(); return [...e.hl.children].map(x => x.textContent).join('\\n');"));
    p.assert.equal(shown.replace(/ $/gm, ''), src.replace(/ $/gm, ''));
  });
  t.test('Enter keeps the indentation of the line', async (p) => {
    await open(p, '    int x;', 0, 10);
    await p.key('Enter');
    p.assert.equal(await p.code(), '    int x;\n    ');
  });
  t.test('Enter after an opening brace indents one level more', async (p) => {
    await open(p, 'int main(void) {', 0, 16);
    await p.key('Enter');
    p.assert.equal(await p.code(), 'int main(void) {\n    ');
  });
  t.test('Enter after an indented brace indents relative to it', async (p) => {
    await open(p, '    if (x) {', 0, 12);
    await p.key('Enter');
    p.assert.equal(await p.code(), '    if (x) {\n        ');
  });
  t.test('Enter after a brace followed by a comment still indents', async (p) => {
    await open(p, 'while (1) { /* forever */', 0, 25);
    await p.key('Enter');
    p.assert.equal(await p.code(), 'while (1) { /* forever */\n    ');
  });
  t.test('Enter after a line without a brace does not add indentation', async (p) => {
    await open(p, 'int x;', 0, 6);
    await p.key('Enter');
    p.assert.equal(await p.code(), 'int x;\n');
  });
  t.test('typing a block line by line indents each line', async (p) => {
    await open(p, '');
    await p.type('int f(void) {\nreturn 1;');
    p.assert.equal(await p.code(), 'int f(void) {\n    return 1;');
  });
  t.test('the auto-indent setting turned off keeps only the indentation', async (p) => {
    await p.ev('SEE.app.settings.autoIndent = false');
    await open(p, 'int main(void) {', 0, 16);
    await p.key('Enter');
    p.assert.equal(await p.code(), 'int main(void) {\n');
  });
  t.test('the tab size setting changes the auto-indent width', async (p) => {
    await p.ev('SEE.app.settings.tabSize = 2');
    await open(p, 'int main(void) {', 0, 16);
    await p.key('Enter');
    p.assert.equal(await p.code(), 'int main(void) {\n  ');
  });
  t.test('Home goes to the first non-space, then to the start of the line', async (p) => {
    await open(p, '    int x;', 0, 8);
    await p.key('Home');
    p.assert.deepEqual(await cursor(p), { line: 0, col: 4 });
    await p.key('Home');
    p.assert.deepEqual(await cursor(p), { line: 0, col: 0 });
    await p.key('Home');
    p.assert.deepEqual(await cursor(p), { line: 0, col: 4 });
  });
  t.test('Edit > Undo takes back typing and Redo puts it back', async (p) => {
    await open(p, 'int x;', 0, 6);
    await p.insertText(' int y;');
    p.assert.equal(await p.code(), 'int x; int y;');
    await menuPick(p, 'Edit', 'Undo');
    p.assert.equal(await p.code(), 'int x;');
    await menuPick(p, 'Edit', 'Redo');
    p.assert.equal(await p.code(), 'int x; int y;');
  });
  t.test('the status bar shows the line and column of the caret', async (p) => {
    await open(p, 'int a;\nint bb;\n', 1, 3);
    await p.key('ArrowRight');
    p.assert.match(await p.text('#stPos'), /Ln 2, Col 5/);
    await p.key('ArrowUp');
    p.assert.match(await p.text('#stPos'), /Ln 1, Col 5/);
  });
  t.test('Ctrl+D duplicates the line the caret is on', async (p) => {
    await open(p, 'int a;\nint b;\n', 0, 2);
    await p.key('d', { ctrl: true });
    p.assert.equal(await p.code(), 'int a;\nint a;\nint b;\n');
  });
  t.test('Ctrl+D keeps the indentation and leaves the caret on the copy', async (p) => {
    await open(p, '{\n    x = 1;\n}', 1, 5);
    await p.key('d', { ctrl: true });
    p.assert.equal(await p.code(), '{\n    x = 1;\n    x = 1;\n}');
    p.assert.equal((await cursor(p)).line, 2);
  });
  t.test('Ctrl+D on the last line without a newline adds a line', async (p) => {
    await open(p, 'int z;', 0, 0);
    await p.key('d', { ctrl: true });
    await p.key('d', { ctrl: true });
    p.assert.equal(await p.code(), 'int z;\nint z;\nint z;');
  });

  // ---- line numbers and gutter ----------------------------------------------------------------------
  t.test('the gutter numbers every line from 1', async (p) => {
    await open(p, 'a\nb\nc\nd\ne');
    p.assert.deepEqual(await p.ev(ed("e.render(); return [...e.inner.children].map(x => x.textContent);")), ['1', '2', '3', '4', '5']);
  });
  t.test('the gutter gains a number when Enter adds a line', async (p) => {
    await open(p, 'int x;', 0, 6);
    await p.key('Enter');
    await p.key('Enter');
    p.assert.equal(await p.ev(ed('e.render(); return e.inner.children.length;')), 3);
  });
  t.test('the gutter loses numbers when lines are deleted', async (p) => {
    await open(p, 'a\nb\nc\n', 0, 0);
    await select(p, 0, 6);
    await p.key('Backspace');
    p.assert.equal(await p.ev(ed('e.render(); return e.inner.children.length;')), 1);
  });
  t.test('the gutter widens when the file reaches four-digit line numbers', async (p) => {
    await open(p, 'x\n'.repeat(500));
    const w1 = (await p.ev(ed('e.render(); return e.gutter.getBoundingClientRect().width;')));
    await open(p, 'x\n'.repeat(1200));
    const w2 = (await p.ev(ed('e.render(); return e.gutter.getBoundingClientRect().width;')));
    p.assert.ok(w2 > w1, w1 + ' < ' + w2);
  });
  t.test('each line number sits level with its line of code', async (p) => {
    await open(p, 'int a;\nint b;\nint c;\nint d;\n');
    const d = await p.ev(ed("e.render(); return [0,1,2,3].map(i => Math.abs(e.inner.children[i].getBoundingClientRect().top - e.hl.children[i].getBoundingClientRect().top));"));
    for (const x of d) p.assert.ok(x < 2, JSON.stringify(d));
  });
  t.test('the gutter scrolls together with the code', async (p) => {
    await open(p, 'int x;\n'.repeat(300));
    await p.ev(ed('e.ta.scrollTop = 900; e.syncScroll();'));
    p.assert.equal(await p.ev(ed('return e.inner.style.transform;')), 'translateY(-900px)');
    p.assert.equal(await p.ev(ed('return e.hl.scrollTop;')), await p.ev(ed('return e.ta.scrollTop;')));
  });
  t.test('the caret line is highlighted while the editor has focus', async (p) => {
    await open(p, 'a\nb\nc\n', 1, 0);
    p.assert.match(await lineCls(p, 1), /curline/);
    p.assert.doesNotMatch(await lineCls(p, 0), /curline/);
  });
  t.test('Go to a line far down scrolls it into view', async (p) => {
    await open(p, 'int x;\n'.repeat(400));
    await p.ev(ed('e.setCursor(350, 0);'));
    const r = await p.ev(ed('e.render(); const a = e.hl.children[350].getBoundingClientRect(); const b = e.ta.getBoundingClientRect(); return a.top >= b.top && a.bottom <= b.bottom;'));
    p.assert.ok(r);
  });

  // ---- C colouring --------------------------------------------------------------------------------
  const KWS = {
    'choosing and looping': ['if', 'else', 'while', 'for', 'do', 'switch', 'case', 'default'],
    'jumping': ['return', 'break', 'continue', 'goto'],
    'building types': ['struct', 'union', 'enum', 'typedef', 'sizeof'],
    'storage and qualifiers': ['static', 'extern', 'const', 'volatile', 'register', 'auto'],
  };
  for (const [group, words] of Object.entries(KWS)) {
    t.test(`keywords for ${group} are coloured as keywords`, async (p) => {
      await open(p, words.map((w) => `    ${w} x;`).join('\n') + '\n');
      for (let i = 0; i < words.length; i++) p.assert.ok(has(await spans(p, i), 'c-kw', words[i]), words[i]);
    });
  }
  const TYS = { 'basic types': ['int', 'char', 'double', 'float', 'void'], 'type modifiers': ['long', 'short', 'unsigned', 'signed'], 'library types': ['size_t', 'FILE', 'time_t'] };
  for (const [group, words] of Object.entries(TYS)) {
    t.test(`${group} are coloured as types`, async (p) => {
      await open(p, words.map((w) => `${w} v;`).join('\n') + '\n');
      for (let i = 0; i < words.length; i++) p.assert.ok(has(await spans(p, i), 'c-type', words[i]), words[i]);
    });
  }
  t.test('identifiers that contain a keyword are not coloured', async (p) => {
    await open(p, 'integer = iffy + format + returned;\n');
    const s = await spans(p, 0);
    p.assert.ok(!s.some(([c]) => c === 'c-kw' || c === 'c-type'), JSON.stringify(s));
  });
  const LITS = {
    strings: [['char *s = "hello, world";', '"hello, world"'], ['s = "say \\"hi\\"";', '"say \\"hi\\""'], ['s = "";', '""']],
    'char constants': [["c = 'a';", "'a'"], ["c = '\\n';", "'\\n'"], ["c = '\\'';", "'\\''"]],
    numbers: [['n = 42;', '42'], ['n = 0x1F;', '0x1F'], ['d = 3.14;', '3.14'], ['d = 1e10;', '1e10'], ['n = 10UL;', '10UL'], ['d = .5;', '.5'], ['f = 2.5f;', '2.5f']],
    comments: [['x = 1; /* set x */', '/* set x */'], ['x = 1; // set x', '// set x']],
    'function names': [['puts("x");', 'puts'], ['n = strlen (s);', 'strlen']],
    constants: [['p = NULL;', 'NULL'], ['if (c == EOF) return;', 'EOF'], ['n = MAXLEN;', 'MAXLEN']],
    operators: [['n = a + b;', '+'], ['n = a % b;', '%'], ['p = &n;', '&']],
    punctuation: [['n = 1;', ';'], ['f(a, b);', ','], ['a[0] = 1;', '[']],
  };
  const LCLS = { strings: 'c-str', 'char constants': 'c-chr', numbers: 'c-num', comments: 'c-com', 'function names': 'c-fn', constants: 'c-const', operators: 'c-op', punctuation: 'c-punc' };
  for (const [what, cases] of Object.entries(LITS)) {
    t.test(`colouring of ${what} uses ${LCLS[what]}`, async (p) => {
      await open(p, cases.map((c) => c[0]).join('\n') + '\n');
      for (let i = 0; i < cases.length; i++) {
        const s = await spans(p, i);
        p.assert.ok(has(s, LCLS[what], cases[i][1]), cases[i][0] + ' ' + JSON.stringify(s));
      }
    });
  }
  t.test('words inside a string are not coloured as keywords', async (p) => {
    await open(p, 's = "if int while";\n');
    const s = await spans(p, 0);
    p.assert.ok(!s.some(([c]) => c === 'c-kw' || c === 'c-type'), JSON.stringify(s));
  });
  t.test('a comment marker inside a string does not start a comment', async (p) => {
    await open(p, 's = "/* no */"; int x;\n');
    const s = await spans(p, 0);
    p.assert.ok(has(s, 'c-str', '"/* no */"'));
    p.assert.ok(has(s, 'c-type', 'int'));
    p.assert.ok(!s.some(([c]) => c === 'c-com'));
  });
  t.test('keywords inside a comment are not coloured', async (p) => {
    await open(p, '/* return int while */\n');
    p.assert.deepEqual(await spans(p, 0), [['c-com', '/* return int while */']]);
  });
  t.test('a comment over several lines is coloured on every line', async (p) => {
    await open(p, 'int a; /* starts\n   int inside;\n   ends */ int b;\nint c;\n');
    const s0 = await spans(p, 0), s1 = await spans(p, 1), s2 = await spans(p, 2), s3 = await spans(p, 3);
    p.assert.ok(has(s0, 'c-com', '/* starts'));
    p.assert.deepEqual(s1, [['c-com', '   int inside;']]);
    p.assert.ok(has(s2, 'c-com', '   ends */'));
    p.assert.ok(has(s2, 'c-type', 'int'), 'code after */ is coloured again');
    p.assert.ok(has(s3, 'c-type', 'int'));
  });
  t.test('typing /* colours the lines below as a comment until */', async (p) => {
    await open(p, 'int a;\nint b;\nint c;\n', 0, 0);
    await p.type('/*');
    p.assert.deepEqual(await spans(p, 1), [['c-com', 'int b;']]);
    await p.ev(ed('e.setCursor(1, 6);'));
    await p.type('*/');
    p.assert.ok(has(await spans(p, 2), 'c-type', 'int'));
  });
  t.test('a #include line colours the directive and the header name', async (p) => {
    await open(p, '#include <stdio.h>\n');
    const s = await spans(p, 0);
    p.assert.ok(has(s, 'c-pp', '#include'));
    p.assert.ok(has(s, 'c-str', '<stdio.h>'));
  });
  t.test('a #include with quotes colours the file name as a string', async (p) => {
    await open(p, '#include "stack.h"\n');
    const s = await spans(p, 0);
    p.assert.ok(has(s, 'c-pp', '#include'));
    p.assert.ok(has(s, 'c-str', '"stack.h"'));
  });
  t.test('a #define line colours the directive, the name and the value', async (p) => {
    await open(p, '#define MAX 100\n');
    const s = await spans(p, 0);
    p.assert.ok(has(s, 'c-pp', '#define'));
    p.assert.ok(has(s, 'c-const', 'MAX'));
    p.assert.ok(has(s, 'c-num', '100'));
  });
  t.test('an indented preprocessor line with spaces after # is a directive', async (p) => {
    await open(p, '  #  ifdef DEBUG\n');
    const s = await spans(p, 0);
    p.assert.ok(s.some(([c, x]) => c === 'c-pp' && /#\s*ifdef/.test(x)), JSON.stringify(s));
  });
  t.test('a # inside a line of code is not a directive', async (p) => {
    await open(p, 'x = 1; # oops\n');
    p.assert.ok(!(await spans(p, 0)).some(([c]) => c === 'c-pp'));
  });

  // ---- Tab and Shift+Tab ------------------------------------------------------------------------------
  t.test('Tab inserts four spaces at the caret', async (p) => {
    await open(p, 'x;', 0, 0);
    await p.key('Tab');
    p.assert.equal(await p.code(), '    x;');
  });
  t.test('Tab follows the tab size setting', async (p) => {
    await p.ev('SEE.app.settings.tabSize = 2');
    await open(p, 'x;', 0, 0);
    await p.key('Tab');
    p.assert.equal(await p.code(), '  x;');
  });
  t.test('Tab with several lines selected indents each of them', async (p) => {
    await open(p, 'a;\nb;\nc;\n');
    await select(p, 0, 7);
    await p.key('Tab');
    p.assert.equal(await p.code(), '    a;\n    b;\n    c;\n');
  });
  t.test('Tab over a selection leaves empty lines empty', async (p) => {
    await open(p, 'a;\n\nb;');
    await select(p, 0, 7);
    await p.key('Tab');
    p.assert.equal(await p.code(), '    a;\n\n    b;');
  });
  t.test('Tab over a selection keeps the lines selected', async (p) => {
    await open(p, 'a;\nb;\nc;');
    await select(p, 0, 4);
    await p.key('Tab');
    p.assert.deepEqual(await selection(p), [0, 13]);
  });
  t.test('Shift+Tab unindents the caret line', async (p) => {
    await open(p, '        x;', 0, 9);
    await p.key('Tab', { shift: true });
    p.assert.equal(await p.code(), '    x;');
  });
  t.test('Shift+Tab unindents every selected line by one level', async (p) => {
    await open(p, '    a;\n        b;\nc;');
    await select(p, 0, 22);
    await p.key('Tab', { shift: true });
    p.assert.equal(await p.code(), 'a;\n    b;\nc;');
  });
  t.test('Shift+Tab removes what little indentation there is', async (p) => {
    await open(p, '  x;', 0, 3);
    await p.key('Tab', { shift: true });
    p.assert.equal(await p.code(), 'x;');
  });
  t.test('Escape then Tab leaves the editor without indenting', async (p) => {
    await open(p, 'x;', 0, 0);
    await p.key('Escape');
    await p.key('Tab');
    p.assert.equal(await p.code(), 'x;');
    p.assert.notEqual(await p.ev('document.activeElement === SEE.app.active.editor.ta'), true);
  });
  t.test('Edit > Indent and Unindent work on the selected lines', async (p) => {
    await open(p, 'a;\nb;');
    await select(p, 0, 5);
    await menuPick(p, 'Edit', 'Indent');
    p.assert.equal(await p.code(), '    a;\n    b;');
    await select(p, 0, 13);
    await menuPick(p, 'Edit', 'Unindent');
    p.assert.equal(await p.code(), 'a;\nb;');
  });

  // ---- comment toggling -----------------------------------------------------------------------------
  t.test('Ctrl+/ in the editor wraps the line in /* */', async (p) => {
    await open(p, 'x = 1;', 0, 0);
    await p.key('/', { ctrl: true });
    p.assert.equal(await p.code(), '/* x = 1; */');
  });
  t.test('Ctrl+/ in the editor twice takes the comment off again', async (p) => {
    await open(p, 'x = 1;', 0, 0);
    await p.key('/', { ctrl: true });
    p.assert.equal(await p.code(), '/* x = 1; */');
    await p.key('/', { ctrl: true });
    p.assert.equal(await p.code(), 'x = 1;');
  });
  t.test('Edit > Comment wraps the caret line in /* */', async (p) => {
    await open(p, 'x = 1;\ny = 2;', 0, 2);
    await menuPick(p, 'Edit', 'Comment or uncomment lines');
    p.assert.equal(await p.code(), '/* x = 1; */\ny = 2;');
  });
  t.test('commenting a commented line takes the comment off', async (p) => {
    await open(p, '/* x = 1; */', 0, 4);
    await menuPick(p, 'Edit', 'Comment or uncomment lines');
    p.assert.equal(await p.code(), 'x = 1;');
  });
  t.test('commenting keeps the indentation outside the comment', async (p) => {
    await open(p, '    x = 1;', 0, 6);
    await p.ev(ed('e.toggleComment();'));
    p.assert.equal(await p.code(), '    /* x = 1; */');
    await p.ev(ed('e.toggleComment();'));
    p.assert.equal(await p.code(), '    x = 1;');
  });
  t.test('commenting several selected lines wraps each of them', async (p) => {
    await open(p, 'a = 1;\nb = 2;\nc = 3;\nd = 4;');
    await select(p, 0, 20);
    await p.ev(ed('e.toggleComment();'));
    p.assert.equal(await p.code(), '/* a = 1; */\n/* b = 2; */\n/* c = 3; */\nd = 4;');
  });
  t.test('uncommenting several selected lines unwraps each of them', async (p) => {
    await open(p, '/* a = 1; */\n/* b = 2; */\nc = 3;');
    await select(p, 0, 20);
    await p.ev(ed('e.toggleComment();'));
    p.assert.equal(await p.code(), 'a = 1;\nb = 2;\nc = 3;');
  });
  t.test('commenting lines leaves blank lines alone', async (p) => {
    await open(p, 'a;\n\nb;');
    await select(p, 0, 7);
    await p.ev(ed('e.toggleComment();'));
    p.assert.equal(await p.code(), '/* a; */\n\n/* b; */');
  });
  t.test('a selection with some commented lines comments all of them', async (p) => {
    await open(p, '/* a; */\nb;');
    await select(p, 0, 11);
    await p.ev(ed('e.toggleComment();'));
    p.assert.equal(await p.code(), '/* /* a; */ */\n/* b; */');
  });
  t.test('after commenting, the lines stay selected', async (p) => {
    await open(p, 'a;\nb;');
    await select(p, 0, 5);
    await p.ev(ed('e.toggleComment();'));
    p.assert.deepEqual(await selection(p), [0, 17]);
  });
  t.test('Ctrl+/ with the focus outside the editor comments the caret line', async (p) => {
    await open(p, 'x = 1;', 0, 0);
    await p.ev('SEE.app.active.editor.ta.blur(); document.body.focus();');
    await p.key('/', { ctrl: true });
    p.assert.equal(await p.code(), '/* x = 1; */');
  });
  t.test('a commented line is coloured as a comment', async (p) => {
    await open(p, 'int x;', 0, 0);
    await p.ev(ed('e.toggleComment();'));
    p.assert.deepEqual(await spans(p, 0), [['c-com', '/* int x; */']]);
  });

  // ---- find and replace --------------------------------------------------------------------------------
  t.test('Ctrl+F opens the Find dialog', async (p) => {
    await open(p, 'int x;', 0, 0);
    await p.key('f', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Find');
    p.assert.deepEqual(await p.texts('.modal-back:last-child .modal-foot button'), ['Close', 'Find next']);
  });
  t.test('Edit > Find… opens the Find dialog', async (p) => {
    await open(p, 'int x;', 0, 0);
    await menuPick(p, 'Edit', 'Find…');
    p.assert.equal(await p.waitModal(), 'Find');
  });
  t.test('the Find dialog starts with the selected text', async (p) => {
    await open(p, 'int count = 0;');
    await select(p, 4, 9);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    p.assert.equal(await p.ev("document.querySelector('.modal-back:last-child input').value"), 'count');
  });
  t.test('Find next selects the next match after the caret', async (p) => {
    await open(p, 'int a; int b; int c;', 0, 5);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    await p.modalInput('int');
    await p.modalButton('Find next');
    p.assert.deepEqual(await selection(p), [7, 10]);
  });
  t.test('Enter in the Find dialog finds the next match', async (p) => {
    await open(p, 'aa\nbb\nfoo\n', 0, 0);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    await p.modalInput('foo');
    await p.key('Enter');
    await p.wait('!document.querySelector(".modal-back")');
    p.assert.deepEqual(await selection(p), [6, 9]);
    p.assert.equal((await cursor(p)).line, 2);
  });
  t.test('Find next wraps around to the first match', async (p) => {
    await open(p, 'int a; int b;', 0, 12);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    await p.modalInput('int');
    await p.modalButton('Find next');
    p.assert.deepEqual(await selection(p), [0, 3]);
  });
  t.test('Find ignores upper and lower case', async (p) => {
    await open(p, 'x = 1;\nTOTAL = 2;', 0, 0);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    await p.modalInput('total');
    await p.modalButton('Find next');
    p.assert.deepEqual(await selection(p), [7, 12]);
  });
  t.test('Find shows a toast when nothing matches', async (p) => {
    await open(p, 'int x;', 0, 0);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    await p.modalInput('zebra');
    await p.modalButton('Find next');
    await p.waitToast(/not found/);
  });
  t.test('Find with nothing matching leaves the caret where it was', async (p) => {
    await open(p, 'int x;', 0, 2);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    await p.modalInput('zebra');
    await p.modalButton('Find next');
    p.assert.deepEqual(await selection(p), [2, 2]);
  });
  t.test('Close in the Find dialog does not move the caret', async (p) => {
    await open(p, 'int x; int y;', 0, 1);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    await p.modalInput('int');
    await p.modalButton('Close');
    p.assert.equal(await p.modalOpen(), false);
    p.assert.deepEqual(await selection(p), [1, 1]);
  });
  t.test('Escape closes the Find dialog', async (p) => {
    await open(p, 'int x;', 0, 0);
    await p.key('f', { ctrl: true });
    await p.waitModal();
    await p.key('Escape');
    await p.wait('!document.querySelector(".modal-back")');
  });
  t.test('Ctrl+H opens the Replace dialog with two fields', async (p) => {
    await open(p, 'int x;', 0, 0);
    await p.key('h', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Replace');
    p.assert.equal(await p.count('.modal-back:last-child input'), 2);
    p.assert.deepEqual(await p.texts('.modal-back:last-child .modal-foot button'), ['Close', 'Replace all', 'Find next']);
  });
  t.test('Replace all replaces every match and says how many', async (p) => {
    await open(p, 'int n = 1;\nn = n + n;\n', 0, 0);
    await menuPick(p, 'Edit', 'Replace…');
    await p.waitModal();
    await p.modalInput('n');
    await p.modalInput('count', 1);
    await p.modalButton('Replace all');
    p.assert.equal(await p.code(), 'icountt count = 1;\ncount = count + count;\n');
    await p.waitToast(/5 replaced/);
  });
  t.test('Replace all of a word that is not there says 0 replaced', async (p) => {
    await open(p, 'int x;', 0, 0);
    await p.key('h', { ctrl: true });
    await p.waitModal();
    await p.modalInput('zebra');
    await p.modalInput('y', 1);
    await p.modalButton('Replace all');
    p.assert.equal(await p.code(), 'int x;');
    await p.waitToast(/0 replaced/);
  });
  t.test('Replace all can be undone in one step', async (p) => {
    await open(p, 'a a a', 0, 0);
    await p.key('h', { ctrl: true });
    await p.waitModal();
    await p.modalInput('a');
    await p.modalInput('b', 1);
    await p.modalButton('Replace all');
    p.assert.equal(await p.code(), 'b b b');
    await menuPick(p, 'Edit', 'Undo');
    p.assert.equal(await p.code(), 'a a a');
  });
  t.test('Replace all marks the document as changed', async (p) => {
    await open(p, 'old', 0, 0);
    await p.key('h', { ctrl: true });
    await p.waitModal();
    await p.modalInput('old');
    await p.modalInput('new', 1);
    await p.modalButton('Replace all');
    p.assert.equal(await p.ev('SEE.app.active.dirty'), true);
  });

  // ---- go to line ---------------------------------------------------------------------------------------
  t.test('Ctrl+G opens Go to line with the current line filled in', async (p) => {
    await open(p, 'a\nb\nc\nd\n', 2, 0);
    await p.key('g', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Go to line');
    p.assert.equal(await p.ev("document.querySelector('.modal-back:last-child input').value"), '3');
    p.assert.match(await p.modalText(), /1 to 5/);
  });
  t.test('Go to line moves the caret to the start of that line', async (p) => {
    await open(p, 'a\nbb\nccc\ndddd\n', 0, 0);
    await p.key('g', { ctrl: true });
    await p.waitModal();
    await p.modalInput('4');
    await p.key('Enter');
    await p.wait('!document.querySelector(".modal-back")');
    p.assert.deepEqual(await cursor(p), { line: 3, col: 0 });
  });
  t.test('Edit > Go to line… works the same', async (p) => {
    await open(p, 'a\nb\nc\n', 0, 0);
    await menuPick(p, 'Edit', 'Go to line…');
    await p.waitModal();
    await p.modalInput('2');
    await p.modalButton('OK');
    p.assert.deepEqual(await cursor(p), { line: 1, col: 0 });
  });
  t.test('Cancel in Go to line leaves the caret alone', async (p) => {
    await open(p, 'a\nb\nc\n', 1, 1);
    await p.key('g', { ctrl: true });
    await p.waitModal();
    await p.modalInput('3');
    await p.modalButton('Cancel');
    p.assert.deepEqual(await cursor(p), { line: 1, col: 1 });
  });
  t.test('Go to line ignores text that is not a number', async (p) => {
    await open(p, 'a\nb\nc\n', 1, 0);
    await p.key('g', { ctrl: true });
    await p.waitModal();
    await p.modalInput('abc');
    await p.key('Enter');
    p.assert.deepEqual(await cursor(p), { line: 1, col: 0 });
  });

  // ---- code size ----------------------------------------------------------------------------------------
  t.test('Ctrl+= makes the code bigger', async (p) => {
    await open(p, 'int x;', 0, 0);
    await p.key('=', { ctrl: true });
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 15);
    p.assert.equal(await p.ev("document.documentElement.style.getPropertyValue('--code-size')"), '15px');
  });
  t.test('Ctrl+- makes the code smaller', async (p) => {
    await open(p, 'int x;', 0, 0);
    await p.key('-', { ctrl: true });
    await p.key('-', { ctrl: true });
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 12);
    p.assert.equal(await p.ev("document.documentElement.style.getPropertyValue('--code-size')"), '12px');
  });
  t.test('bigger code makes taller lines in the editor', async (p) => {
    await open(p, 'int x;\nint y;', 0, 0);
    const h1 = await p.ev(ed('return e.lineHeight;'));
    for (let i = 0; i < 4; i++) await p.key('=', { ctrl: true });
    const h2 = await p.ev(ed('return e.lineHeight;'));
    p.assert.ok(h2 > h1, h1 + ' -> ' + h2);
  });
  t.test('the code size stops at 26 and at 10', async (p) => {
    await p.ev('SEE.app.settings.fontSize = 25; SEE.app.applyTheme()');
    await p.key('=', { ctrl: true });
    await p.key('=', { ctrl: true });
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 26);
    await p.ev('SEE.app.settings.fontSize = 11; SEE.app.applyTheme()');
    await p.key('-', { ctrl: true });
    await p.key('-', { ctrl: true });
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 10);
  });
  t.test('the code size is remembered in the settings', async (p) => {
    await p.key('=', { ctrl: true });
    p.assert.equal(await p.ev("JSON.parse(localStorage.getItem('see.settings')).fontSize"), 15);
  });
  t.test('View > Bigger code and Smaller code change the size', async (p) => {
    await menuPick(p, 'View', 'Bigger code');
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 15);
    await menuPick(p, 'View', 'Smaller code');
    await menuPick(p, 'View', 'Smaller code');
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 13);
  });

  // ---- hover cards ---------------------------------------------------------------------------------------
  const HOVER = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\nint main(void)\n{\n    int count = 3;\n    char *p = malloc(10);\n    printf("%d\\n", (int)strlen("ab"));\n    /* printf here */\n    free(p);\n    return count;\n}\n';
  for (const [fn, line, col, sig] of [['printf', 7, 6, /printf\(const char \*format/], ['malloc', 6, 16, /malloc\(size_t/], ['strlen', 7, 25, /strlen\(const char \*/], ['free', 9, 5, /free\(void \*/]]) {
    t.test(`pointing at ${fn} when nothing runs shows its reference card`, async (p) => {
      await open(p, HOVER);
      await hoverAt(p, line, col);
      await p.wait("!!document.querySelector('.callout')", 3000);
      p.assert.equal(await p.text('.callout .co-head'), fn);
      p.assert.match(await p.text('.callout .co-meta'), sig);
    });
  }
  t.test('pointing at a plain variable when nothing runs shows no card', async (p) => {
    await open(p, HOVER);
    await hoverAt(p, 5, 9);
    p.assert.equal(await p.exists('.callout'), false);
  });
  t.test('pointing at a library name inside a comment shows no card', async (p) => {
    await open(p, HOVER);
    await hoverAt(p, 8, 8);
    p.assert.equal(await p.exists('.callout'), false);
  });
  t.test('the reference card links to the C reference', async (p) => {
    await open(p, HOVER);
    await hoverAt(p, 6, 16);
    await p.wait("!!document.querySelector('.callout')", 3000);
    await p.click('.callout .co-note a');
    p.assert.equal(await p.waitModal(), 'C reference');
    p.assert.equal(await p.exists('.callout'), false);
  });
  t.test('the reference card closes with its close button', async (p) => {
    await open(p, HOVER);
    await hoverAt(p, 7, 6);
    await p.wait("!!document.querySelector('.callout')", 3000);
    await p.click('.callout .co-head button');
    p.assert.equal(await p.exists('.callout'), false);
  });
  t.test('the reference card goes away when the mouse leaves the code', async (p) => {
    await open(p, HOVER);
    await hoverAt(p, 7, 6);
    await p.wait("!!document.querySelector('.callout')", 3000);
    await p.hover('#tbRun');
    await p.waitGone('.callout', 3000);
  });

  // ---- context menu ---------------------------------------------------------------------------------------
  t.test('right-clicking a library function offers watch, look up, run to and breakpoint', async (p) => {
    await open(p, HOVER);
    await rightClickWord(p, 7, 6);
    p.assert.deepEqual(await labels(p), ['Watch printf', 'Look up printf', 'Run to this line', 'Toggle breakpoint here']);
  });
  t.test('right-clicking a variable has no look-up item', async (p) => {
    await open(p, HOVER);
    await rightClickWord(p, 5, 9);
    p.assert.deepEqual(await labels(p), ['Watch count', 'Run to this line', 'Toggle breakpoint here']);
  });
  t.test('right-clicking a member chain watches the whole chain', async (p) => {
    await open(p, 'int f(struct node *n) { return n->next->val; }\n');
    await rightClickWord(p, 0, 41);
    p.assert.equal((await labels(p))[0], 'Watch n->next->val');
  });
  t.test('right-clicking on spaces offers only run to and breakpoint', async (p) => {
    await open(p, 'int x;\n        y = 1;\n');
    await rightClickWord(p, 1, 2);
    p.assert.deepEqual(await labels(p), ['Run to this line', 'Toggle breakpoint here']);
  });
  t.test('the context menu Watch item adds a watch and shows the Watch panel', async (p) => {
    await open(p, HOVER);
    await p.ev('SEE.app.watchPanel.list.length = 0');
    await rightClickWord(p, 5, 9);
    await pickMenu(p, 'Watch count');
    p.assert.ok(await p.ev("SEE.app.watchPanel.list.some(w => w.expr === 'count')"));
    p.assert.ok(await p.ev("document.getElementById('tab-watch').classList.contains('active')"));
    await p.ev('SEE.app.watchPanel.list.length = 0; SEE.app.watchPanel.render()');
  });
  t.test('the context menu Look up item opens the reference', async (p) => {
    await open(p, HOVER);
    await rightClickWord(p, 6, 16);
    await pickMenu(p, 'Look up malloc');
    p.assert.equal(await p.waitModal(), 'C reference');
  });
  t.test('the context menu sets and clears a breakpoint on that line', async (p) => {
    await open(p, LOOP);
    await rightClickWord(p, 4, 9);
    await pickMenu(p, 'Toggle breakpoint here');
    p.assert.deepEqual(await bps(p), [[4, '', false]]);
    await rightClickWord(p, 4, 9);
    await pickMenu(p, 'Toggle breakpoint here');
    p.assert.deepEqual(await bps(p), []);
  });
  t.test('the context menu Run to this line stops on that line', async (p) => {
    await open(p, LOOP);
    await rightClickWord(p, 7, 6);
    await pickMenu(p, 'Run to this line');
    await p.waitState('paused');
    await p.wait('SEE.app.vm.where().line === 8');
    p.assert.equal(await p.cval('s'), 45);
  });
  t.test('while debugging the context menu can show the bytes of a variable', async (p) => {
    await p.debugProgram(LOOP, { path: FILE });
    await rightClickWord(p, 4, 8);
    const l = await labels(p);
    p.assert.ok(l.includes('Show the bytes of s'), JSON.stringify(l));
    await pickMenu(p, 'Show the bytes of s');
    p.assert.ok(await p.ev("document.getElementById('tab-bytes').classList.contains('active')"));
  });

  // ---- breakpoints ----------------------------------------------------------------------------------------
  t.test('clicking the gutter sets a breakpoint on that line', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    p.assert.deepEqual(await bps(p), [[6, '', false]]);
    p.assert.match(await gutterCls(p, 6), /\bbp\b/);
    p.assert.match(await lineCls(p, 6), /bpline/);
  });
  t.test('clicking the gutter again removes the breakpoint', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    await clickGutter(p, 6);
    p.assert.deepEqual(await bps(p), []);
    p.assert.doesNotMatch(await gutterCls(p, 6), /\bbp\b/);
  });
  t.test('clicking the gutter does not move the caret', async (p) => {
    await open(p, LOOP, 2, 0);
    await clickGutter(p, 6);
    p.assert.equal((await cursor(p)).line, 2);
  });
  t.test('F9 toggles a breakpoint on the caret line', async (p) => {
    await open(p, LOOP, 5, 4);
    await p.key('F9');
    p.assert.deepEqual(await bps(p), [[5, '', false]]);
    await p.key('F9');
    p.assert.deepEqual(await bps(p), []);
  });
  t.test('Debug > Toggle breakpoint sets one on the caret line', async (p) => {
    await open(p, LOOP, 4, 0);
    await menuPick(p, 'Debug', 'Toggle breakpoint');
    p.assert.deepEqual(await bps(p), [[4, '', false]]);
  });
  t.test('Debug > Remove all breakpoints clears every one', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 4);
    await clickGutter(p, 6);
    await menuPick(p, 'Debug', 'Remove all breakpoints');
    p.assert.deepEqual(await bps(p), []);
    p.assert.equal(await p.ev(ed('e.render(); return e.inner.querySelectorAll(".bp").length;')), 0);
  });
  t.test('breakpoints are remembered in storage', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    p.assert.deepEqual(await p.ev(`JSON.parse(localStorage.getItem('see.breakpoints'))[${JSON.stringify(FILE)}].map(x => x[0])`), [6]);
  });
  t.test('the program stops at a breakpoint set in the gutter', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 7);
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await p.cont();
    p.assert.equal(await p.line(), 8);
    p.assert.match(await p.status(), /Breakpoint at line 8/);
  });
  t.test('right-clicking the gutter offers to add a breakpoint', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6, 'right');
    p.assert.deepEqual(await labels(p), ['Add breakpoint', 'Stop only when…', 'Run to this line']);
    await pickMenu(p, 'Add breakpoint');
    p.assert.deepEqual(await bps(p), [[6, '', false]]);
  });
  t.test('the gutter menu of a breakpoint offers remove and disable', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    await clickGutter(p, 6, 'right');
    p.assert.deepEqual(await labels(p), ['Remove breakpoint', 'Stop only when…', 'Disable', 'Run to this line']);
    await pickMenu(p, 'Remove breakpoint');
    p.assert.deepEqual(await bps(p), []);
  });
  t.test('Stop only when… makes a conditional breakpoint', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6, 'right');
    await pickMenu(p, 'Stop only when…');
    p.assert.equal(await p.waitModal(), 'Stop only when…');
    p.assert.match(await p.modalText(), /Stop at line 7 only when/);
    await p.modalInput('i == 5');
    await p.key('Enter');
    p.assert.deepEqual(await bps(p), [[6, 'i == 5', false]]);
    p.assert.match(await gutterCls(p, 6), /bp cond/);
  });
  t.test('a conditional breakpoint stops only when its condition is true', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6, 'right');
    await pickMenu(p, 'Stop only when…');
    await p.waitModal();
    await p.modalInput('i == 5');
    await p.key('Enter');
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await p.cont();
    p.assert.equal(await p.line(), 7);
    p.assert.equal(await p.cval('i'), 5);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
  });
  t.test('the condition dialog shows the condition already set', async (p) => {
    await open(p, LOOP);
    await p.ev(`SEE.app.breakpoints.set(${JSON.stringify(FILE)}, new Map([[6, { cond: 'i > 2', disabled: false }]])); SEE.app.breakpointsChanged(${JSON.stringify(FILE)})`);
    await clickGutter(p, 6, 'right');
    await pickMenu(p, 'Stop only when…');
    await p.waitModal();
    p.assert.equal(await p.ev("document.querySelector('.modal-back:last-child input').value"), 'i > 2');
  });
  t.test('an empty condition makes an ordinary breakpoint', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6, 'right');
    await pickMenu(p, 'Stop only when…');
    await p.waitModal();
    await p.key('Enter');
    p.assert.deepEqual(await bps(p), [[6, '', false]]);
    p.assert.doesNotMatch(await gutterCls(p, 6), /cond/);
  });
  t.test('cancelling the condition dialog adds nothing', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6, 'right');
    await pickMenu(p, 'Stop only when…');
    await p.waitModal();
    await p.modalInput('i == 1');
    await p.modalButton('Cancel');
    p.assert.deepEqual(await bps(p), []);
  });
  t.test('a disabled breakpoint is drawn hollow and does not stop the program', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    await clickGutter(p, 6, 'right');
    await pickMenu(p, 'Disable');
    p.assert.deepEqual(await bps(p), [[6, '', true]]);
    p.assert.match(await gutterCls(p, 6), /disabled/);
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
  });
  t.test('a disabled breakpoint can be enabled again from the gutter menu', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    await clickGutter(p, 6, 'right');
    await pickMenu(p, 'Disable');
    await clickGutter(p, 6, 'right');
    await pickMenu(p, 'Enable');
    p.assert.deepEqual(await bps(p), [[6, '', false]]);
  });
  t.test('the gutter menu Run to this line stops there', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 8, 'right');
    await pickMenu(p, 'Run to this line');
    await p.waitState('paused');
    await p.wait('SEE.app.vm.where().line === 9');
    p.assert.deepEqual(await bps(p), []);
  });
  t.test('a breakpoint moves down when Enter adds a line above it', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    await p.ev(ed('e.setCursor(0, 18);'));
    await p.key('Enter');
    p.assert.deepEqual(await bps(p), [[7, '', false]]);
    p.assert.match(await gutterCls(p, 7), /\bbp\b/);
    p.assert.equal(await p.ev(ed('return e.getLine(7);')), '        s += i;');
  });
  t.test('a breakpoint moves down by the number of lines pasted above it', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    await p.ev(ed('e.setCursor(4, 14);'));
    await p.insertText('\n    int u;\n    int v;');
    p.assert.deepEqual(await bps(p), [[8, '', false]]);
  });
  t.test('a breakpoint moves up when a line above it is deleted', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    await select(p, await p.ev(ed('return e.lineStart(3);')), await p.ev(ed('return e.lineStart(4);')));
    await p.key('Backspace');
    p.assert.deepEqual(await bps(p), [[5, '', false]]);
    p.assert.equal(await p.ev(ed('return e.getLine(5);')), '        s += i;');
  });
  t.test('a breakpoint stays put when lines are added below it', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 6);
    await p.ev(ed('e.setCursor(7, 22);'));
    await p.key('Enter');
    p.assert.deepEqual(await bps(p), [[6, '', false]]);
  });
  t.test('a moved breakpoint still stops on its statement', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 7);
    await p.ev(ed('e.setCursor(1, 0);'));
    await p.type('/* a note */\n');
    p.assert.deepEqual(await bps(p), [[8, '', false]]);
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await p.cont();
    p.assert.equal(await p.line(), 9);
    p.assert.match(await p.ev(ed('return e.getLine(8);')), /printf/);
  });

  // ---- build marks ------------------------------------------------------------------------------------
  t.test('a build error marks its line with errline', async (p) => {
    await open(p, 'int main(void)\n{\n    int x = 1;\n    return y;\n}\n');
    await p.build();
    p.assert.match(await lineCls(p, 3), /errline/);
    p.assert.match(await gutterCls(p, 3), /\berr\b/);
    p.assert.doesNotMatch(await lineCls(p, 2), /errline/);
  });
  t.test('a build warning marks its line with warnline', async (p) => {
    await open(p, '#define N 1\n#define N 2\nint main(void)\n{\n    return N - 2;\n}\n');
    await p.build();
    p.assert.match((await p.problems()).join('\n'), /warning: "N" redefined @2/);
    p.assert.match(await lineCls(p, 1), /warnline/);
    p.assert.match(await gutterCls(p, 1), /\bwarn\b/);
  });
  t.test('every line with an error is marked', async (p) => {
    await open(p, 'int main(void)\n{\n    a = 1;\n    int k;\n    b = 2;\n    return 0;\n}\n');
    await p.build();
    const marked = await p.ev(ed('e.render(); return [...e.hl.children].map((x, i) => x.classList.contains("errline") ? i : -1).filter(i => i >= 0);'));
    p.assert.ok(marked.includes(2), JSON.stringify(marked));
  });
  t.test('a clean build clears the error marks', async (p) => {
    await open(p, 'int main(void)\n{\n    return y;\n}\n');
    await p.build();
    p.assert.match(await lineCls(p, 2), /errline/);
    await p.setCode('int main(void)\n{\n    return 0;\n}\n');
    await p.build();
    p.assert.equal(await p.ev(ed('e.render(); return e.hl.querySelectorAll(".errline, .warnline").length;')), 0);
  });
  t.test('adding a line clears the build marks', async (p) => {
    await open(p, 'int main(void)\n{\n    return y;\n}\n');
    await p.build();
    await p.ev(ed('e.setCursor(1, 1);'));
    await p.key('Enter');
    p.assert.equal(await p.ev(ed('e.render(); return e.hl.querySelectorAll(".errline").length;')), 0);
  });
  t.test('an error in another file of the project marks that file', async (p) => {
    await p.newFile('/home/user/ed2/util.c', 'int util(void)\n{\n    return zz;\n}\n');
    await open(p, 'int util(void);\nint main(void)\n{\n    return util();\n}\n', 0, 0, '/home/user/ed2/main.c');
    await p.build();
    p.assert.equal(await p.activePath(), '/home/user/ed2/util.c');
    p.assert.match(await lineCls(p, 2), /errline/);
  });
  t.test('a crash marks the line where it happened', async (p) => {
    await open(p, 'int main(void)\n{\n    int *q = 0;\n    *q = 5;\n    return 0;\n}\n');
    await p.ev('SEE.app.run()');
    await p.settle();
    p.assert.equal(await p.state(), 'faulted');
    p.assert.match(await lineCls(p, 3), /errline/);
  });

  // ---- the execution mark ----------------------------------------------------------------------------
  t.test('starting the debugger marks the first line of main', async (p) => {
    await p.debugProgram(LOOP, { path: FILE });
    p.assert.match(await lineCls(p, 4), /\bexec\b/);
    p.assert.match(await gutterCls(p, 4), /\bexec\b/);
    p.assert.equal(await p.ev(ed('e.render(); return e.hl.querySelectorAll(".exec").length;')), 1);
  });
  t.test('stepping moves the exec mark to the next line', async (p) => {
    await p.debugProgram(LOOP, { path: FILE });
    await p.step('over');
    p.assert.match(await lineCls(p, 5), /\bexec\b/);
    p.assert.doesNotMatch(await lineCls(p, 4), /\bexec\b/);
  });
  t.test('the exec line is not drawn as the caret line', async (p) => {
    await p.debugProgram(LOOP, { path: FILE });
    await p.ev(ed('e.setCursor(4, 0);'));
    p.assert.doesNotMatch(await lineCls(p, 4), /curline/);
  });
  t.test('stepping back moves the exec mark back', async (p) => {
    await p.debugProgram(LOOP, { path: FILE });
    await p.step('over', 2);
    await p.back();
    p.assert.match(await lineCls(p, 5), /\bexec\b/);
  });
  t.test('stopping the program removes the exec mark', async (p) => {
    await p.debugProgram(LOOP, { path: FILE });
    await p.stopProgram();
    p.assert.equal(await p.ev(ed('e.render(); return e.hl.querySelectorAll(".exec").length;')), 0);
  });
  t.test('the exec mark goes when the program ends', async (p) => {
    await p.debugProgram(LOOP, { path: FILE });
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.equal(await p.ev(ed('e.render(); return e.hl.querySelectorAll(".exec").length;')), 0);
  });
  t.test('stepping into a function moves the exec mark into it', async (p) => {
    await p.debugProgram(TWO, { path: FILE });
    await p.step('over');
    await p.step('into');
    p.assert.equal(await p.fnName(), 'twice');
    p.assert.match(await lineCls(p, 3), /\bexec\b/);
  });
  t.test('choosing the caller frame marks its line as a frame line', async (p) => {
    await p.debugProgram(TWO, { path: FILE });
    await p.step('over');
    await p.step('into');
    await p.ev('SEE.app.selectFrame(1)');
    p.assert.match(await lineCls(p, 9), /\bframe\b/);
    p.assert.match(await gutterCls(p, 9), /\bframe\b/);
    await p.ev('SEE.app.selectFrame(0)');
    p.assert.match(await lineCls(p, 3), /\bexec\b/);
  });
  t.test('stepping into a function in another file opens that file with the mark', async (p) => {
    await p.newFile('/home/user/ed3/twice.c', 'int twice(int n)\n{\n    return n * 2;\n}\n');
    await p.debugProgram('int twice(int n);\nint main(void)\n{\n    int b = twice(3);\n    return b;\n}\n', { path: '/home/user/ed3/main.c' });
    await p.step('into');
    p.assert.equal(await p.activePath(), '/home/user/ed3/twice.c');
    p.assert.match(await lineCls(p, 2), /\bexec\b/);
  });
  t.test('a breakpoint line with the exec mark shows both', async (p) => {
    await open(p, LOOP);
    await clickGutter(p, 7);
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await p.cont();
    const g = await gutterCls(p, 7);
    p.assert.match(g, /\bbp\b/);
    p.assert.match(g, /\bexec\b/);
  });
}
