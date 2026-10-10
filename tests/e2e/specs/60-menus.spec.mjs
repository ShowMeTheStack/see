// The menu bar, the Learn and Help buttons, and the keyboard shortcuts: every menu opens by
// click and by Alt+letter, its items carry the right labels, shortcuts and disabled states,
// arrow keys and Escape work, and every item does its job.

const PROG = `#include <stdio.h>
int square(int n)
{
    int r = n * n;
    return r;
}
int main(void)
{
    int x = 7;
    int y = square(x);
    printf("%d\\n", y);
    return 0;
}
`;
const LOOP = 'int main(void)\n{\n    int i = 0;\n    for (;;) {\n        i++;\n    }\n    return 0;\n}\n';
const READS = '#include <stdio.h>\nint main(void)\n{\n    int n = 0;\n    scanf("%d", &n);\n    printf("got %d\\n", n);\n    return 0;\n}\n';
const ARGS = '#include <stdio.h>\nint main(int argc, char *argv[])\n{\n    printf("argc=%d last=%s\\n", argc, argv[argc - 1]);\n    return 0;\n}\n';
const MAIN = '/home/user/e2e/main.c';

const MENUS = ['File', 'Edit', 'View', 'Build', 'Debug', 'Learn', 'Help'];
const LABELS = {
  File: ['New file…', 'New project…', 'Open…', 'Open a shared program…', 'Save', 'Save as…', 'Save all', 'Close', 'Share this project as a link…', 'Download this file', 'Download this project as .zip', 'Bring files from your computer…', 'Use a folder from your computer…', 'Settings…'],
  Edit: ['Undo', 'Redo', 'Find…', 'Replace…', 'Go to line…', 'Comment or uncomment lines', 'Indent', 'Unindent'],
  View: ['Files', 'Memory and debugger', 'Memory picture', 'Variables and call stack', 'Watch', 'Breakpoints', 'Bytes', 'Terminal', 'Problems', 'Light (Motif)', 'Dark (Midnight)', 'Follow the system', 'Terminal: plain', 'Terminal: green phosphor', 'Terminal: amber', 'Bigger code', 'Smaller code'],
  Build: ['Build', 'Run', 'Run with arguments…', 'Stop', 'Show the preprocessed file', 'Show what the linker made', 'Check for integer overflow'],
  Debug: ['Debug', 'Pause', 'Stop', 'Step over', 'Step into', 'Step out', 'One statement', 'Step back', 'Step back one statement', 'Run to the cursor', 'Animate (step by itself)', 'Toggle breakpoint', 'Remove all breakpoints', 'Watch an expression…', 'Keep a history to step back'],
  Learn: ['Lessons…', 'Guided tours…', 'Example library…', 'Welcome'],
  Help: ['C reference…', 'Keyboard shortcuts', 'What the colours in memory mean', 'About See', 'About the author'],
};
const SHORTCUTS = {
  File: { 'New file…': 'Ctrl+N', 'Open…': 'Ctrl+O', Save: 'Ctrl+S', Close: 'Ctrl+W' },
  Edit: { Undo: 'Ctrl+Z', Redo: 'Ctrl+Y', 'Find…': 'Ctrl+F', 'Replace…': 'Ctrl+H', 'Go to line…': 'Ctrl+G', 'Comment or uncomment lines': 'Ctrl+/', Indent: 'Tab', Unindent: 'Shift+Tab' },
  View: { 'Bigger code': 'Ctrl+=', 'Smaller code': 'Ctrl+-' },
  Build: { Build: 'Ctrl+B', Run: 'Ctrl+F5', Stop: 'Shift+F5' },
  Debug: { Debug: 'F5', Stop: 'Shift+F5', 'Step over': 'F10', 'Step into': 'F11', 'Step out': 'Shift+F11', 'One statement': 'Ctrl+F11', 'Step back': 'F8', 'Step back one statement': 'Shift+F8', 'Run to the cursor': 'Ctrl+F10', 'Toggle breakpoint': 'F9' },
  Learn: {},
  Help: { 'C reference…': 'F1' },
};

async function reset(p) {
  await p.ev(`(() => {
    SEE.UI.closeMenus(); SEE.UI.closeAllModals();
    if (SEE.Tours) SEE.Tours.stop();
    if (SEE.Lessons && SEE.Lessons.current) SEE.Lessons.close();
    const a = SEE.app;
    // other files left in the test folder would be built together with main.c
    try { for (const x of a.vfs.list('/home/user/e2e')) if (x.type === 'file' && x.name !== 'main.c') { const d = a.docByPath(x.path); if (d) { d.dirty = false; a.closeDoc(d); } a.vfs.unlink(x.path); } } catch (e) { /* no folder yet */ }
    for (const d of a.docs.slice()) if (d.path.startsWith('/home/user/e2e/') && d.path !== '/home/user/e2e/main.c') { d.dirty = false; a.closeDoc(d); }
    if (a.vm) a.stop();
    a.stopAnimate();
    a.clearBreakpoints();
    Object.assign(a.settings, { side: true, right: true, record: true, overflow: true, fontSize: 14, theme: 'auto', term: 'plain', args: '' });
    a.saveSettings(); a.applyTheme(); a.applyLayout();
    if (window.__realDownload) { SEE.UI.download = window.__realDownload; window.__realDownload = null; }
    if (window.__realPick) { SEE.UI.pickFiles = window.__realPick; window.__realPick = null; }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  })()`);
  await p.sleep(30);
}

/** Click the menu item whose label is exactly `label` in the open menu */
async function pick(p, label) {
  const r = await p.fn((label) => {
    const e = [...document.querySelectorAll('.menu-pop .menu-item')].find((x) => x.children[0].innerText === label);
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return [b.left + b.width / 2, b.top + b.height / 2];
  }, label);
  if (!r) throw new Error('no menu item ' + label);
  await p.clickAt(r[0], r[1]);
  await p.sleep(80);
}
async function choose(p, menu, label) { await p.menu(menu); await pick(p, label); }
async function items(p, menu) { await p.menu(menu); const it = await p.menuItems(); await p.closeMenus(); return it; }
const byLabel = (list) => Object.fromEntries(list.map((x) => [x.label, x]));
async function noDocs(p) {
  await p.ev('(() => { for (const d of SEE.app.docs.slice()) { d.dirty = false; SEE.app.closeDoc(d); } })()');
  await p.wait('SEE.app.docs.length === 0 && !SEE.app.active');
}
async function startLoop(p) {
  await p.newFile(MAIN, LOOP);
  await p.ev('SEE.app.run()');
  await p.wait('SEE.app.running === true');
}
async function focusEditor(p) { await p.ev('SEE.app.active.editor.focus()'); await p.sleep(20); }
async function cursorAt(p, line, col) { await p.ev(`SEE.app.active.editor.setCursor(${line}, ${col || 0})`); await p.sleep(20); }
const activeItem = (p) => p.ev("(document.querySelector('.menu-pop .menu-item.active') || {children: [{innerText: ''}]}).children[0].innerText");
const openMenuIndex = (p) => p.ev('SEE.app.menuOpen === undefined ? null : SEE.app.menuOpen');

export default function (t) {
  t.beforeEach(reset);

  // ---- opening ---------------------------------------------------------------------------------------
  MENUS.forEach((name, i) => {
    t.test(`the ${name} menu opens by click`, async (p) => {
      await p.click('#menu' + name);
      await p.wait("!!document.querySelector('.menu-pop')", 2000);
      p.assert.equal(await p.count('.menu-pop'), 1);
      p.assert.ok(await p.ev(`document.getElementById('menu${name}').classList.contains('open')`));
      p.assert.equal(await openMenuIndex(p), i);
      const pop = await p.rect('.menu-pop');
      const btn = await p.rect('#menu' + name);
      p.assert.ok(Math.abs(pop.y - btn.bottom) < 3, 'the menu drops down under its button');
      p.assert.ok(Math.abs(pop.x - btn.x) < 3, 'the menu lines up with its button');
      p.assert.equal(await p.attr('.menu-pop', 'role'), 'menu');
    });
    t.test(`the ${name} menu opens with Alt+${name[0]}`, async (p) => {
      await p.key(name[0].toLowerCase(), { alt: true });
      await p.wait("!!document.querySelector('.menu-pop')", 2000);
      p.assert.equal(await openMenuIndex(p), i);
      p.assert.ok(await p.ev(`document.getElementById('menu${name}').classList.contains('open')`));
      p.assert.equal((await p.menuItems())[0].label, LABELS[name][0]);
    });
    t.test(`the ${name} menu lists its items`, async (p) => {
      const it = await items(p, name);
      p.assert.deepEqual(it.map((x) => x.label), LABELS[name]);
      p.assert.equal(await p.ev("document.querySelectorAll('.menu-pop').length"), 0);
    });
    t.test(`the ${name} menu shows its keyboard shortcuts`, async (p) => {
      const it = await items(p, name);
      for (const x of it) p.assert.equal(x.sc, SHORTCUTS[name][x.label] || '', 'shortcut of ' + x.label);
    });
  });
  t.test('the underlined letter of each menu is its Alt key', async (p) => {
    p.assert.deepEqual(await p.texts('#menubar .mtop u'), MENUS.map((m) => m[0]));
    for (const m of MENUS) p.assert.equal(await p.attr('#menu' + m, 'aria-haspopup'), 'true');
  });
  t.test('menu separators split the File menu into groups', async (p) => {
    await p.menu('File');
    p.assert.equal(await p.count('.menu-pop .menu-sep'), 3);
  });
  t.test('the menu items carry the menuitem role', async (p) => {
    await p.menu('Debug');
    p.assert.equal(await p.ev("[...document.querySelectorAll('.menu-pop .menu-item')].every(e => e.getAttribute('role') === 'menuitem')"), true);
  });

  // ---- disabled states --------------------------------------------------------------------------------
  t.test('with no file open the file items are disabled', async (p) => {
    await noDocs(p);
    const f = byLabel(await items(p, 'File'));
    for (const l of ['Save', 'Save as…', 'Close', 'Share this project as a link…', 'Download this file', 'Download this project as .zip']) p.assert.ok(f[l].disabled, l);
    for (const l of ['New file…', 'New project…', 'Open…', 'Open a shared program…', 'Save all', 'Settings…']) p.assert.ok(!f[l].disabled, l);
  });
  t.test('with no file open every Edit item is disabled', async (p) => {
    await noDocs(p);
    const e = await items(p, 'Edit');
    p.assert.ok(e.every((x) => x.disabled), JSON.stringify(e));
  });
  t.test('with no file open Build and Debug cannot start anything', async (p) => {
    await noDocs(p);
    const b = byLabel(await items(p, 'Build'));
    for (const l of ['Build', 'Run', 'Run with arguments…', 'Stop', 'Show the preprocessed file', 'Show what the linker made']) p.assert.ok(b[l].disabled, l);
    p.assert.ok(!b['Check for integer overflow'].disabled);
    const d = byLabel(await items(p, 'Debug'));
    for (const l of ['Debug', 'Pause', 'Stop', 'Step over', 'Step into', 'Step out', 'One statement', 'Step back', 'Run to the cursor', 'Animate (step by itself)', 'Toggle breakpoint']) p.assert.ok(d[l].disabled, l);
    for (const l of ['Remove all breakpoints', 'Watch an expression…', 'Keep a history to step back']) p.assert.ok(!d[l].disabled, l);
  });
  t.test('with no file open the toolbar disables Build, Run, Debug and Save', async (p) => {
    await noDocs(p);
    for (const id of ['tbBuild', 'tbRun', 'tbDebug', 'tbSave', 'tbOver', 'tbInto', 'tbOut', 'tbBack', 'tbStop', 'tbPause']) p.assert.ok(await p.ev(`document.getElementById('${id}').disabled`), id);
    p.assert.ok(!(await p.ev("document.getElementById('tbNew').disabled")));
  });
  t.test('when nothing runs Pause, Stop, Step out and Step back are disabled', async (p) => {
    await p.newFile(MAIN, PROG);
    const d = byLabel(await items(p, 'Debug'));
    for (const l of ['Pause', 'Stop', 'Step out', 'Step back', 'Step back one statement']) p.assert.ok(d[l].disabled, l);
    for (const l of ['Debug', 'Step over', 'Step into', 'One statement', 'Run to the cursor', 'Animate (step by itself)', 'Toggle breakpoint']) p.assert.ok(!d[l].disabled, l);
    const b = byLabel(await items(p, 'Build'));
    p.assert.ok(b.Stop.disabled);
    p.assert.ok(!b.Build.disabled && !b.Run.disabled && !b['Run with arguments…'].disabled);
  });
  t.test('when paused the Debug item reads Continue and Step out is enabled', async (p) => {
    await p.debugProgram(PROG);
    const d = byLabel(await items(p, 'Debug'));
    p.assert.ok(d.Continue && !d.Continue.disabled, 'Continue');
    p.assert.ok(!d['Step out'].disabled && !d.Stop.disabled && !d['Step over'].disabled);
    p.assert.ok(d.Pause.disabled, 'Pause while paused');
    await p.stopProgram();
  });
  t.test('when paused after a step, Step back is enabled', async (p) => {
    await p.debugProgram(PROG);
    await p.step('over');
    const d = byLabel(await items(p, 'Debug'));
    p.assert.ok(!d['Step back'].disabled && !d['Step back one statement'].disabled);
    await p.stopProgram();
  });
  t.test('when paused Build and Run stay enabled and Stop is enabled', async (p) => {
    await p.debugProgram(PROG);
    const b = byLabel(await items(p, 'Build'));
    p.assert.ok(!b.Build.disabled && !b.Run.disabled && !b.Stop.disabled);
    await p.stopProgram();
  });
  t.test('while running only Pause and Stop are live in Debug', async (p) => {
    await startLoop(p);
    const d = byLabel(await items(p, 'Debug'));
    for (const l of ['Debug', 'Step over', 'Step into', 'Step out', 'One statement', 'Step back']) p.assert.ok(d[l].disabled, l);
    p.assert.ok(!d.Pause.disabled && !d.Stop.disabled);
    await p.stopProgram();
  });
  t.test('while running Build and Run are disabled and Stop is enabled', async (p) => {
    await startLoop(p);
    const b = byLabel(await items(p, 'Build'));
    p.assert.ok(b.Build.disabled && b.Run.disabled);
    p.assert.ok(!b.Stop.disabled);
    await p.stopProgram();
  });
  t.test('while running the toolbar shows Pause and Stop enabled, Run disabled', async (p) => {
    await startLoop(p);
    p.assert.ok(!(await p.ev("document.getElementById('tbPause').disabled")));
    p.assert.ok(!(await p.ev("document.getElementById('tbStop').disabled")));
    p.assert.ok(await p.ev("document.getElementById('tbRun').disabled"));
    p.assert.ok(await p.ev("document.getElementById('tbBuild').disabled"));
    await p.stopProgram();
  });
  t.test('while waiting for input Stop is enabled and Step out matches the toolbar', async (p) => {
    await p.newFile(MAIN, READS);
    await p.ev('SEE.app.run()');
    await p.waitState('input');
    const d = byLabel(await items(p, 'Debug'));
    p.assert.ok(!d.Stop.disabled, 'Stop');
    p.assert.equal(d['Step out'].disabled, await p.ev("document.getElementById('tbOut').disabled"), 'Step out as on the toolbar');
    p.assert.ok(d.Pause.disabled, 'Pause');
    await p.stopProgram();
  });
  t.test('after the program ends the debugger can still step back', async (p) => {
    await p.debugProgram(PROG);
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    const d = byLabel(await items(p, 'Debug'));
    p.assert.ok(d.Debug && !d.Debug.disabled, 'Debug again');
    p.assert.ok(!d['Step back'].disabled && !d.Stop.disabled);
    p.assert.ok(d['Step out'].disabled);
    await p.stopProgram();
  });
  t.test('a .h file cannot be preprocessed on its own', async (p) => {
    await p.newFile('/home/user/e2e/defs.h', '#define N 3\n');
    const b = byLabel(await items(p, 'Build'));
    p.assert.ok(b['Show the preprocessed file'].disabled);
    p.assert.ok(!b['Show what the linker made'].disabled);
  });
  t.test('checked items show the current settings', async (p) => {
    let v = byLabel(await items(p, 'View'));
    p.assert.ok(v.Files.checked && v['Memory and debugger'].checked && v['Follow the system'].checked && v['Terminal: plain'].checked);
    p.assert.ok(!v['Light (Motif)'].checked && !v['Dark (Midnight)'].checked && !v['Terminal: amber'].checked);
    await p.ev("SEE.app.setTheme('dark'); SEE.app.setTerm('amber')");
    v = byLabel(await items(p, 'View'));
    p.assert.ok(v['Dark (Midnight)'].checked && !v['Follow the system'].checked && v['Terminal: amber'].checked && !v['Terminal: plain'].checked);
    const b = byLabel(await items(p, 'Build'));
    p.assert.ok(b['Check for integer overflow'].checked);
    const d = byLabel(await items(p, 'Debug'));
    p.assert.ok(d['Keep a history to step back'].checked);
  });

  // ---- keyboard and mouse inside menus ------------------------------------------------------------------
  t.test('a menu opened by click puts the first item under the keyboard', async (p) => {
    await p.menu('File');
    p.assert.equal(await activeItem(p), 'New file…');
  });
  t.test('ArrowDown moves to the next item', async (p) => {
    await p.menu('File');
    await p.key('ArrowDown');
    p.assert.equal(await activeItem(p), 'New project…');
    await p.key('ArrowDown');
    p.assert.equal(await activeItem(p), 'Open…');
  });
  t.test('ArrowUp from the first item wraps to the last', async (p) => {
    await p.menu('Help');
    await p.key('ArrowUp');
    p.assert.equal(await activeItem(p), 'About the author');
    await p.key('ArrowUp');
    p.assert.equal(await activeItem(p), 'About See');
  });
  t.test('ArrowDown from the last item wraps to the first', async (p) => {
    await p.menu('Learn');
    for (let i = 0; i < 4; i++) await p.key('ArrowDown');
    p.assert.equal(await activeItem(p), 'Lessons…');
  });
  t.test('arrow keys skip disabled items', async (p) => {
    await noDocs(p);
    await p.menu('File');
    for (let i = 0; i < 4; i++) await p.key('ArrowDown');
    p.assert.equal(await activeItem(p), 'Save all');
    await p.key('ArrowDown');
    p.assert.equal(await activeItem(p), 'Bring files from your computer…');
  });
  t.test('ArrowRight moves to the next menu', async (p) => {
    await p.menu('File');
    await p.key('ArrowRight');
    p.assert.equal(await openMenuIndex(p), 1);
    p.assert.equal((await p.menuItems())[0].label, 'Undo');
    p.assert.ok(!(await p.ev("document.getElementById('menuFile').classList.contains('open')")));
    p.assert.ok(await p.ev("document.getElementById('menuEdit').classList.contains('open')"));
  });
  t.test('ArrowLeft moves to the previous menu', async (p) => {
    await p.menu('Build');
    await p.key('ArrowLeft');
    p.assert.equal(await openMenuIndex(p), 2);
    p.assert.equal((await p.menuItems())[0].label, 'Files');
  });
  t.test('ArrowLeft on File wraps to Help', async (p) => {
    await p.menu('File');
    await p.key('ArrowLeft');
    p.assert.equal(await openMenuIndex(p), 6);
    p.assert.equal((await p.menuItems())[0].label, 'C reference…');
  });
  t.test('ArrowRight on Help wraps to File', async (p) => {
    await p.key('h', { alt: true });
    await p.key('ArrowRight');
    p.assert.equal(await openMenuIndex(p), 0);
    p.assert.equal(await p.count('.menu-pop'), 1);
  });
  t.test('walking the whole menu bar with ArrowRight visits every menu once', async (p) => {
    await p.menu('File');
    const seen = [];
    for (let i = 0; i < 7; i++) { seen.push(await openMenuIndex(p)); await p.key('ArrowRight'); }
    p.assert.deepEqual(seen, [0, 1, 2, 3, 4, 5, 6]);
    p.assert.equal(await openMenuIndex(p), 0);
  });
  t.test('Enter runs the item under the keyboard', async (p) => {
    await p.menu('Help');
    await p.key('ArrowDown');
    await p.key('Enter');
    p.assert.equal(await p.waitModal(), 'Keyboard shortcuts');
    p.assert.equal(await p.count('.menu-pop'), 0);
  });
  t.test('Escape closes the menu', async (p) => {
    await p.menu('View');
    await p.key('Escape');
    p.assert.equal(await p.count('.menu-pop'), 0);
    p.assert.ok(!(await p.ev("document.getElementById('menuView').classList.contains('open')")));
    p.assert.equal(await openMenuIndex(p), null);
  });
  t.test('Escape closes a menu opened with Alt+letter', async (p) => {
    await p.key('d', { alt: true });
    p.assert.equal(await p.count('.menu-pop'), 1);
    await p.key('Escape');
    p.assert.equal(await p.count('.menu-pop'), 0);
  });
  t.test('clicking outside closes the menu without running anything', async (p) => {
    await p.menu('Help');
    await p.click('#statusbar');
    p.assert.equal(await p.count('.menu-pop'), 0);
    p.assert.equal(await p.modalOpen(), false);
  });
  t.test('moving the mouse to another menu title switches menus', async (p) => {
    await p.menu('File');
    await p.hover('#menuDebug');
    await p.wait('SEE.app.menuOpen === 4', 2000);
    p.assert.equal(await p.count('.menu-pop'), 1);
    p.assert.equal((await p.menuItems())[0].label, 'Debug');
  });
  t.test('hovering a menu title with no menu open does not open it', async (p) => {
    await p.hover('#menuEdit');
    p.assert.equal(await p.count('.menu-pop'), 0);
  });
  t.test('clicking a disabled item keeps the menu open and does nothing', async (p) => {
    await noDocs(p);
    await p.menu('Edit');
    await pick(p, 'Find…');
    p.assert.equal(await p.count('.menu-pop'), 1, 'menu stays open on a disabled item');
    p.assert.equal(await p.modalOpen(), false);
  });
  t.test('Alt+letter does nothing while a dialog is open', async (p) => {
    await p.ev('SEE.app.aboutDialog()');
    await p.waitModal();
    await p.key('f', { alt: true });
    p.assert.equal(await p.count('.menu-pop'), 0);
  });
  t.test('opening a second menu by click closes the first', async (p) => {
    await p.menu('File');
    await p.closeMenus();
    await p.menu('Help');
    p.assert.equal(await p.count('.menu-pop'), 1);
    p.assert.ok(!(await p.ev("document.getElementById('menuFile').classList.contains('open')")));
  });

  // ---- File: every item -------------------------------------------------------------------------------
  t.test('File > New file… asks for a name and opens the new file', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev("(() => { const v = SEE.app.vfs; for (const n of ['untitled.c', 'untitled2.c', 'fresh1.c']) if (v.exists('/home/user/e2e/' + n)) v.unlink('/home/user/e2e/' + n); })()").catch(() => {});
    await choose(p, 'File', 'New file…');
    p.assert.equal(await p.waitModal(), 'New file');
    await p.modalInput('fresh1.c');
    await p.modalButton('OK');
    await p.wait("SEE.app.active && SEE.app.active.path === '/home/user/e2e/fresh1.c'");
    p.assert.ok(await p.ev("SEE.app.vfs.exists('/home/user/e2e/fresh1.c')"));
    p.assert.match(await p.code(), /fresh1\.c/);
  });
  t.test('File > New project… makes a folder with main.c', async (p) => {
    const name = 'proj' + Date.now() % 100000;
    await choose(p, 'File', 'New project…');
    p.assert.equal(await p.waitModal(), 'New project');
    await p.modalInput(name);
    await p.modalButton('OK');
    await p.wait(`SEE.app.active && SEE.app.active.path === '/home/user/${name}/main.c'`);
    p.assert.ok(await p.ev(`SEE.app.vfs.exists('/home/user/${name}/main.c')`));
  });
  t.test('File > Open… lists files and opens the one clicked', async (p) => {
    await p.newFile('/home/user/e2e/pickme.c', 'int pickme;\n');
    await p.newFile(MAIN, PROG);
    await choose(p, 'File', 'Open…');
    p.assert.equal(await p.waitModal(), 'Open a file');
    await p.type('pickme');
    await p.click('.modal .list-row', '/home/user/e2e/pickme.c');
    await p.wait("SEE.app.active.path === '/home/user/e2e/pickme.c'");
    p.assert.equal(await p.modalOpen(), false);
  });
  t.test('File > Open a shared program… asks for a link or code', async (p) => {
    await choose(p, 'File', 'Open a shared program…');
    p.assert.equal(await p.waitModal(), 'Open a shared program');
    p.assert.ok(await p.exists('#importCode'));
  });
  t.test('File > Save writes the editor text to the disk', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.setCode(PROG.replace('7', '8'));
    p.assert.ok(await p.ev('SEE.app.active.dirty'));
    await choose(p, 'File', 'Save');
    await p.wait('!SEE.app.active.dirty');
    p.assert.match(await p.ev(`SEE.app.vfs.readText('${MAIN}')`), /int x = 8;/);
    p.assert.match(await p.status(), /Saved \/home\/user\/e2e\/main.c/);
  });
  t.test('File > Save as… saves under a new name', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev("SEE.app.vfs.exists('/home/user/e2e/copy1.c') && SEE.app.vfs.unlink('/home/user/e2e/copy1.c')").catch(() => {});
    await choose(p, 'File', 'Save as…');
    p.assert.equal(await p.waitModal(), 'Save as');
    await p.modalInput('copy1.c');
    await p.modalButton('OK');
    await p.wait("SEE.app.active.path === '/home/user/e2e/copy1.c'");
    p.assert.ok(await p.ev("SEE.app.vfs.exists('/home/user/e2e/copy1.c')"));
  });
  t.test('File > Save all saves every changed file', async (p) => {
    await p.newFile('/home/user/e2e/a.c', 'int a;\n');
    await p.setCode('int a = 1;\n');
    await p.newFile('/home/user/e2e/b.c', 'int b;\n');
    await p.setCode('int b = 2;\n');
    await choose(p, 'File', 'Save all');
    await p.wait('SEE.app.docs.every(d => !d.dirty)');
    p.assert.equal(await p.ev("SEE.app.vfs.readText('/home/user/e2e/a.c')"), 'int a = 1;\n');
    p.assert.equal(await p.ev("SEE.app.vfs.readText('/home/user/e2e/b.c')"), 'int b = 2;\n');
    p.assert.match(await p.status(), /Saved everything/);
    await p.ev("SEE.app.vfs.unlink('/home/user/e2e/a.c'); SEE.app.vfs.unlink('/home/user/e2e/b.c')").catch(() => {});
  });
  t.test('File > Close closes the active file', async (p) => {
    await p.newFile('/home/user/e2e/closeme.c', 'int c;\n');
    await choose(p, 'File', 'Close');
    await p.wait("!SEE.app.docByPath('/home/user/e2e/closeme.c')");
    p.assert.ok(!(await p.texts('#tabs .tab .tname')).includes('closeme.c'));
  });
  t.test('File > Share this project as a link… shows a #share= link', async (p) => {
    await p.newFile(MAIN, PROG);
    await choose(p, 'File', 'Share this project as a link…');
    p.assert.equal(await p.waitModal(), 'Share e2e');
    p.assert.match(await p.ev("document.getElementById('shareLink').value"), /#share=/);
  });
  t.test('File > Download this file hands over the file', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev('window.__realDownload = SEE.UI.download; window.__dl = []; SEE.UI.download = (n, d, t) => window.__dl.push({ n, len: d.length, t })');
    await choose(p, 'File', 'Download this file');
    await p.wait('window.__dl.length === 1');
    const d = await p.ev('window.__dl[0]');
    p.assert.equal(d.n, 'main.c');
    p.assert.equal(d.len, PROG.length);
  });
  t.test('File > Download this project as .zip hands over a zip', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev('window.__realDownload = SEE.UI.download; window.__dl = []; SEE.UI.download = (n, d, t) => window.__dl.push({ n, t, pk: d[0] === 0x50 && d[1] === 0x4b })');
    await choose(p, 'File', 'Download this project as .zip');
    await p.wait('window.__dl.length === 1');
    const d = await p.ev('window.__dl[0]');
    p.assert.equal(d.n, 'e2e.zip');
    p.assert.equal(d.t, 'application/zip');
    p.assert.ok(d.pk, 'starts with PK');
  });
  t.test('File > Bring files from your computer… copies picked files in', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev("SEE.app.vfs.exists('/home/user/e2e/brought.c') && SEE.app.vfs.unlink('/home/user/e2e/brought.c')").catch(() => {});
    await p.ev("window.__realPick = SEE.UI.pickFiles; SEE.UI.pickFiles = () => Promise.resolve([new File(['int brought = 1;\\n'], 'brought.c')])");
    await choose(p, 'File', 'Bring files from your computer…');
    await p.wait("SEE.app.vfs.exists('/home/user/e2e/brought.c')");
    await p.waitToast(/Brought in 1 file/);
    await p.wait("SEE.app.active.path === '/home/user/e2e/brought.c'");
    await p.ev("SEE.app.closeDoc(SEE.app.active); SEE.app.vfs.unlink('/home/user/e2e/brought.c')");
  });
  t.test('File > Use a folder from your computer… explains folders', async (p) => {
    await choose(p, 'File', 'Use a folder from your computer…');
    const title = await p.waitModal();
    p.assert.match(title, /folder/i);
    p.assert.match(await p.modalText(), /computer/);
  });
  t.test('File > Settings… opens the settings', async (p) => {
    await choose(p, 'File', 'Settings…');
    p.assert.equal(await p.waitModal(), 'Settings');
  });

  // ---- Edit ------------------------------------------------------------------------------------------
  t.test('Edit > Undo takes back the last change', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 0, 0);
    await p.insertText('/* added */');
    p.assert.match(await p.code(), /^\/\* added \*\//);
    await choose(p, 'Edit', 'Undo');
    await p.wait("!SEE.app.active.editor.getValue().includes('added')");
  });
  t.test('Edit > Redo puts it back', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 0, 0);
    await p.insertText('/* again */');
    await choose(p, 'Edit', 'Undo');
    await p.wait("!SEE.app.active.editor.getValue().includes('again')");
    await choose(p, 'Edit', 'Redo');
    await p.wait("SEE.app.active.editor.getValue().includes('again')");
  });
  t.test('Edit > Find… selects the next match', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 0, 0);
    await choose(p, 'Edit', 'Find…');
    p.assert.equal(await p.waitModal(), 'Find');
    await p.modalInput('square');
    await p.modalButton('Find next');
    const sel = await p.ev('(() => { const ta = SEE.app.active.editor.ta; return ta.value.slice(ta.selectionStart, ta.selectionEnd); })()');
    p.assert.equal(sel, 'square');
  });
  t.test('Edit > Replace… replaces every match', async (p) => {
    await p.newFile(MAIN, PROG);
    await choose(p, 'Edit', 'Replace…');
    p.assert.equal(await p.waitModal(), 'Replace');
    await p.modalInput('square', 0);
    await p.modalInput('sq', 1);
    await p.modalButton('Replace all');
    await p.waitToast(/2 replaced/);
    p.assert.ok(!(await p.code()).includes('square'));
    p.assert.equal((await p.code()).match(/\bsq\b/g).length, 2);
  });
  t.test('Edit > Go to line… moves the cursor', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 0, 0);
    await choose(p, 'Edit', 'Go to line…');
    p.assert.equal(await p.waitModal(), 'Go to line');
    await p.modalInput('11');
    await p.modalButton('OK');
    await p.wait('SEE.app.active.editor.cursor().line === 10');
  });
  t.test('Edit > Comment or uncomment lines wraps the line in /* */', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 8, 4);
    await choose(p, 'Edit', 'Comment or uncomment lines');
    await p.wait("SEE.app.active.editor.getLine(8) === '    /* int x = 7; */'");
    await choose(p, 'Edit', 'Comment or uncomment lines');
    await p.wait("SEE.app.active.editor.getLine(8) === '    int x = 7;'");
  });
  t.test('Edit > Indent adds four spaces', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 8, 4);
    await choose(p, 'Edit', 'Indent');
    await p.wait("SEE.app.active.editor.getLine(8) === '        int x = 7;'");
  });
  t.test('Edit > Unindent takes four spaces away', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 8, 4);
    await choose(p, 'Edit', 'Unindent');
    await p.wait("SEE.app.active.editor.getLine(8) === 'int x = 7;'");
  });

  // ---- View ------------------------------------------------------------------------------------------
  t.test('View > Files hides and shows the Files panel', async (p) => {
    await choose(p, 'View', 'Files');
    p.assert.ok(await p.ev("document.getElementById('app').classList.contains('no-side')"));
    p.assert.equal(await p.visible('#side'), false);
    await choose(p, 'View', 'Files');
    p.assert.ok(await p.visible('#side'));
  });
  t.test('View > Memory and debugger hides and shows the right area', async (p) => {
    await choose(p, 'View', 'Memory and debugger');
    p.assert.equal(await p.visible('#right'), false);
    p.assert.equal(await p.ev('SEE.app.settings.right'), false);
    await choose(p, 'View', 'Memory and debugger');
    p.assert.ok(await p.visible('#right'));
  });
  for (const [label, tab] of [['Memory picture', 'memory'], ['Variables and call stack', 'vars'], ['Watch', 'watch'], ['Breakpoints', 'bps'], ['Bytes', 'bytes']]) {
    t.test(`View > ${label} shows its panel`, async (p) => {
      await p.showRight(tab === 'memory' ? 'vars' : 'memory');
      await choose(p, 'View', label);
      p.assert.equal(await p.ev('SEE.app.rightTab'), tab);
      p.assert.ok(await p.visible('#panel-' + tab));
      p.assert.equal(await p.attr('#tab-' + tab, 'aria-selected'), 'true');
    });
  }
  for (const [label, tab] of [['Terminal', 'term'], ['Problems', 'probs']]) {
    t.test(`View > ${label} shows its bottom panel`, async (p) => {
      await p.showBottom(tab === 'term' ? 'log' : 'term');
      await choose(p, 'View', label);
      p.assert.equal(await p.ev('SEE.app.bottomTab'), tab);
      p.assert.ok(await p.visible('#panel-' + tab));
    });
  }
  t.test('View > Memory picture brings back a hidden right area', async (p) => {
    await p.ev('SEE.app.settings.right = false; SEE.app.applyLayout()');
    p.assert.equal(await p.visible('#right'), false);
    await choose(p, 'View', 'Memory picture');
    p.assert.ok(await p.visible('#right'));
  });
  for (const [label, theme, want] of [['Light (Motif)', 'light', 'light'], ['Dark (Midnight)', 'dark', 'dark']]) {
    t.test(`View > ${label} switches the theme`, async (p) => {
      await p.ev(`SEE.app.setTheme('${want === 'dark' ? 'light' : 'dark'}')`);
      await choose(p, 'View', label);
      p.assert.equal(await p.ev('SEE.app.settings.theme'), theme);
      p.assert.equal(await p.ev('document.documentElement.dataset.theme'), want);
    });
  }
  t.test('View > Follow the system goes back to the system theme', async (p) => {
    await p.ev("SEE.app.setTheme('light')");
    await choose(p, 'View', 'Follow the system');
    p.assert.equal(await p.ev('SEE.app.settings.theme'), 'auto');
    const sys = await p.ev("matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'");
    p.assert.equal(await p.ev('document.documentElement.dataset.theme'), sys);
  });
  for (const [label, term] of [['Terminal: plain', 'plain'], ['Terminal: green phosphor', 'phosphor'], ['Terminal: amber', 'amber']]) {
    t.test(`View > ${label} sets the terminal style`, async (p) => {
      await p.ev(`SEE.app.setTerm('${term === 'plain' ? 'amber' : 'plain'}')`);
      await choose(p, 'View', label);
      p.assert.equal(await p.ev('document.documentElement.dataset.term'), term);
      p.assert.equal(await p.ev('SEE.app.settings.term'), term);
    });
  }
  t.test('View > Bigger code makes the code bigger', async (p) => {
    await choose(p, 'View', 'Bigger code');
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 15);
    p.assert.equal(await p.ev("document.documentElement.style.getPropertyValue('--code-size')"), '15px');
  });
  t.test('View > Smaller code makes the code smaller', async (p) => {
    await choose(p, 'View', 'Smaller code');
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 13);
    p.assert.equal(await p.ev("document.documentElement.style.getPropertyValue('--code-size')"), '13px');
  });
  t.test('code size stops at 10 and 26', async (p) => {
    for (let i = 0; i < 6; i++) await p.ev('SEE.app.zoomCode(-1)');
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 10);
    await choose(p, 'View', 'Smaller code');
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 10);
    for (let i = 0; i < 20; i++) await p.ev('SEE.app.zoomCode(1)');
    await choose(p, 'View', 'Bigger code');
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 26);
  });

  // ---- Build -----------------------------------------------------------------------------------------
  t.test('Build > Build compiles and fills the build log', async (p) => {
    await p.newFile(MAIN, PROG);
    await choose(p, 'Build', 'Build');
    await p.wait("/Build finished/.test(SEE.app.buildLog)");
    p.assert.match(await p.status(), /Built main.c/);
    p.assert.equal(await p.state(), 'none');
  });
  t.test('Build > Run runs the program to the end', async (p) => {
    await p.newFile(MAIN, PROG);
    await choose(p, 'Build', 'Run');
    await p.waitState('exited');
    p.assert.match(await p.output(), /^49$/m);
    p.assert.match(await p.chip(), /Exited \(0\)/);
  });
  t.test('Build > Run with arguments… passes them to main', async (p) => {
    await p.newFile(MAIN, ARGS);
    await choose(p, 'Build', 'Run with arguments…');
    p.assert.equal(await p.waitModal(), 'Run with arguments');
    await p.modalInput('one "two three"');
    await p.modalButton('OK');
    await p.waitState('exited');
    p.assert.match(await p.output(), /argc=3 last=two three/);
    p.assert.equal(await p.ev('SEE.app.settings.args'), 'one "two three"');
  });
  t.test('Build > Stop stops a running program', async (p) => {
    await startLoop(p);
    await choose(p, 'Build', 'Stop');
    await p.wait('!SEE.app.vm');
    p.assert.match(await p.output(), /Stopped\./);
    p.assert.equal(await p.chip(), 'Stopped');
  });
  t.test('Build > Show the preprocessed file opens the .i file', async (p) => {
    await p.newFile(MAIN, '#define TWICE(x) ((x) * 2)\nint main(void)\n{\n    return TWICE(21);\n}\n');
    await choose(p, 'Build', 'Show the preprocessed file');
    await p.wait("SEE.app.active.path === '/tmp/main.i'");
    const c = await p.code();
    p.assert.match(c, /after the preprocessor/);
    p.assert.match(c, /\(\s*\(\s*21\s*\)\s*\*\s*2\s*\)/);
    p.assert.ok(!c.includes('TWICE'));
  });
  t.test('Build > Show what the linker made opens the link map', async (p) => {
    await p.newFile(MAIN, PROG);
    await choose(p, 'Build', 'Show what the linker made');
    await p.wait("SEE.app.active.path === '/tmp/linkmap.txt'");
    const c = await p.code();
    p.assert.match(c, /What the linker made of \/home\/user\/e2e/);
    p.assert.match(c, /square/);
    p.assert.match(c, /printf\s+\(C library\)/);
  });
  t.test('Build > Check for integer overflow toggles the check', async (p) => {
    await choose(p, 'Build', 'Check for integer overflow');
    p.assert.equal(await p.ev('SEE.app.settings.overflow'), false);
    p.assert.ok(!byLabel(await items(p, 'Build'))['Check for integer overflow'].checked);
    await choose(p, 'Build', 'Check for integer overflow');
    p.assert.equal(await p.ev('SEE.app.settings.overflow'), true);
  });

  // ---- Debug -----------------------------------------------------------------------------------------
  t.test('Debug > Debug stops at the first line of main', async (p) => {
    await p.newFile(MAIN, PROG);
    await choose(p, 'Debug', 'Debug');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
    p.assert.match(await p.status(), /Ready at the first line of main/);
    await p.stopProgram();
  });
  t.test('Debug > Continue runs on to the end', async (p) => {
    await p.debugProgram(PROG);
    await choose(p, 'Debug', 'Continue');
    await p.waitState('exited');
    p.assert.match(await p.output(), /^49$/m);
    await p.stopProgram();
  });
  t.test('Debug > Pause stops a running program where it is', async (p) => {
    await startLoop(p);
    await choose(p, 'Debug', 'Pause');
    await p.waitState('paused');
    p.assert.ok([4, 5].includes(await p.line()), 'paused in the loop at line ' + (await p.line()));
    await p.stopProgram();
  });
  t.test('Debug > Stop ends the debugging session', async (p) => {
    await p.debugProgram(PROG);
    await choose(p, 'Debug', 'Stop');
    await p.wait('!SEE.app.vm');
    p.assert.equal(await p.state(), 'none');
  });
  t.test('Debug > Step over runs one line', async (p) => {
    await p.debugProgram(PROG);
    await choose(p, 'Debug', 'Step over');
    await p.settle();
    p.assert.equal(await p.line(), 10);
    p.assert.equal(await p.cval('x'), 7);
    await p.stopProgram();
  });
  t.test('Debug > Step over with nothing running starts the debugger', async (p) => {
    await p.newFile(MAIN, PROG);
    await choose(p, 'Debug', 'Step over');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
    await p.stopProgram();
  });
  t.test('Debug > Step into follows the call', async (p) => {
    await p.debugProgram(PROG);
    await p.step('over');
    await choose(p, 'Debug', 'Step into');
    await p.settle();
    p.assert.equal(await p.fnName(), 'square');
    p.assert.equal(await p.line(), 4);
    await p.stopProgram();
  });
  t.test('Debug > Step out finishes the function', async (p) => {
    await p.debugProgram(PROG);
    await p.step('over');
    await p.step('into');
    await choose(p, 'Debug', 'Step out');
    await p.settle();
    p.assert.equal(await p.fnName(), 'main');
    await p.stopProgram();
  });
  t.test('Debug > One statement runs a single statement', async (p) => {
    await p.debugProgram(PROG);
    await choose(p, 'Debug', 'One statement');
    await p.settle();
    p.assert.equal(await p.line(), 10);
    await p.stopProgram();
  });
  t.test('Debug > Step back undoes a line', async (p) => {
    await p.debugProgram(PROG);
    await p.step('over');
    p.assert.equal(await p.line(), 10);
    await choose(p, 'Debug', 'Step back');
    await p.wait('SEE.app.vm.where().line === 9');
    p.assert.equal(await p.chip(), 'Paused (went back)');
    await p.stopProgram();
  });
  t.test('Debug > Step back one statement undoes a statement', async (p) => {
    await p.debugProgram(PROG);
    await p.step('over', 2);
    p.assert.equal(await p.line(), 11);
    await choose(p, 'Debug', 'Step back one statement');
    await p.wait('SEE.app.vm.where().line < 11');
    p.assert.match(await p.status(), /Stepped back/);
    await p.stopProgram();
  });
  t.test('Debug > Run to the cursor stops at the cursor line', async (p) => {
    await p.debugProgram(PROG);
    await cursorAt(p, 10, 4);
    await choose(p, 'Debug', 'Run to the cursor');
    await p.wait("SEE.app.vm && SEE.app.vm.state === 'paused' && SEE.app.vm.where().line === 11 && !SEE.app.running");
    p.assert.equal(await p.cval('y'), 49);
    await p.stopProgram();
  });
  t.test('Debug > Run to the cursor with nothing running starts and runs there', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 11, 4);
    await choose(p, 'Debug', 'Run to the cursor');
    await p.wait("SEE.app.vm && SEE.app.vm.state === 'paused' && SEE.app.vm.where().line === 12 && !SEE.app.running");
    await p.stopProgram();
  });
  t.test('Debug > Animate while paused steps by itself and the item turns into Stop animating', async (p) => {
    await p.debugProgram(PROG);
    await p.ev('SEE.app.settings.speed = 1');
    await choose(p, 'Debug', 'Animate (step by itself)');
    p.assert.ok(await p.ev('SEE.app.animating'));
    await p.wait('SEE.app.vm && SEE.app.vm.where().line >= 10', 8000);
    p.assert.ok(await p.ev("document.getElementById('tbAnim').classList.contains('on')"));
    const d = byLabel(await items(p, 'Debug'));
    p.assert.ok(d['Stop animating'], 'Stop animating item');
    await choose(p, 'Debug', 'Stop animating');
    p.assert.equal(await p.ev('!!SEE.app.animating'), false);
    p.assert.ok(!(await p.ev("document.getElementById('tbAnim').classList.contains('on')")));
    await p.ev('SEE.app.settings.speed = 3');
    await p.stopProgram();
  });
  t.test('Debug > Animate with nothing running starts and keeps stepping', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev('SEE.app.settings.speed = 1');
    await choose(p, 'Debug', 'Animate (step by itself)');
    await p.waitState('paused');
    p.assert.ok(await p.ev('SEE.app.animating'), 'still animating after the start');
    await p.wait('SEE.app.vm && SEE.app.vm.where().line >= 10', 5000);
    await p.ev('SEE.app.settings.speed = 3');
    await p.stopProgram();
  });
  t.test('Debug > Toggle breakpoint sets one on the cursor line', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 10, 0);
    await choose(p, 'Debug', 'Toggle breakpoint');
    p.assert.ok(await p.ev(`SEE.app.breakpoints.get('${MAIN}').has(10)`));
    await choose(p, 'Debug', 'Toggle breakpoint');
    p.assert.ok(!(await p.ev(`SEE.app.breakpoints.has('${MAIN}')`)));
  });
  t.test('Debug > Remove all breakpoints clears every file', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev(`SEE.app.toggleBreakpoint('${MAIN}', 3); SEE.app.toggleBreakpoint('${MAIN}', 9); SEE.app.toggleBreakpoint('/home/user/hello/hello.c', 2)`);
    p.assert.equal(await p.ev('SEE.app.breakpoints.size'), 2);
    await choose(p, 'Debug', 'Remove all breakpoints');
    p.assert.equal(await p.ev('SEE.app.breakpoints.size'), 0);
  });
  t.test('Debug > Watch an expression… focuses the watch box', async (p) => {
    await choose(p, 'Debug', 'Watch an expression…');
    await p.wait("SEE.app.rightTab === 'watch' && document.activeElement && document.activeElement.id === 'watchInput'", 3000);
  });
  t.test('Debug > Keep a history to step back toggles recording', async (p) => {
    await choose(p, 'Debug', 'Keep a history to step back');
    p.assert.equal(await p.ev('SEE.app.settings.record'), false);
    await p.debugProgram(PROG);
    await p.step('over');
    p.assert.equal(await p.ev('SEE.app.canBack()'), false);
    await p.key('F8');
    await p.waitToast(/Keep a history/);
    await p.stopProgram();
    await choose(p, 'Debug', 'Keep a history to step back');
    p.assert.equal(await p.ev('SEE.app.settings.record'), true);
  });

  // ---- Learn and Help --------------------------------------------------------------------------------
  for (const [label, title] of [['Lessons…', 'Lessons'], ['Guided tours…', 'Guided tours'], ['Example library…', 'Example library'], ['Welcome', 'Welcome to See']]) {
    t.test(`Learn > ${label} opens ${title}`, async (p) => {
      await choose(p, 'Learn', label);
      p.assert.equal(await p.waitModal(), title);
    });
  }
  for (const [label, title] of [['C reference…', 'C reference'], ['Keyboard shortcuts', 'Keyboard shortcuts'], ['What the colours in memory mean', 'Reading the memory picture'], ['About See', 'About See'], ['About the author', 'About the author']]) {
    t.test(`Help > ${label} opens ${title}`, async (p) => {
      await choose(p, 'Help', label);
      p.assert.equal(await p.waitModal(), title);
    });
  }

  // ---- the Learn toolbar button and the Help button ---------------------------------------------------
  t.test('the Learn button opens the Learn menu under itself', async (p) => {
    await p.click('#tbLearn');
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    p.assert.deepEqual((await p.menuItems()).map((x) => x.label), LABELS.Learn);
    const pop = await p.rect('.menu-pop'), b = await p.rect('#tbLearn');
    p.assert.ok(Math.abs(pop.y - b.bottom) < 3 && Math.abs(pop.x - b.x) < 3, JSON.stringify([pop, b]));
  });
  t.test('the Learn button menu opens the example library', async (p) => {
    await p.click('#tbLearn');
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    await pick(p, 'Example library…');
    p.assert.equal(await p.waitModal(), 'Example library');
  });
  t.test('the Learn button menu works from the keyboard and closes with Escape', async (p) => {
    await p.click('#tbLearn');
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    p.assert.equal(await activeItem(p), 'Lessons…');
    await p.key('ArrowDown');
    p.assert.equal(await activeItem(p), 'Guided tours…');
    await p.key('Escape');
    p.assert.equal(await p.count('.menu-pop'), 0);
  });
  t.test('the Learn button menu Enter opens the tours', async (p) => {
    await p.click('#tbLearn');
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    await p.key('ArrowDown');
    await p.key('Enter');
    p.assert.equal(await p.waitModal(), 'Guided tours');
  });
  t.test('the Help button in the title bar opens the Help menu', async (p) => {
    p.assert.equal(await p.attr('#btnHelpTop', 'aria-label'), 'Help');
    await p.click('#btnHelpTop');
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    p.assert.deepEqual((await p.menuItems()).map((x) => x.label), LABELS.Help);
    p.assert.ok(await p.ev("document.getElementById('btnHelpTop').classList.contains('open')"));
    const pop = await p.rect('.menu-pop');
    p.assert.ok(pop.right <= 1400 && pop.x > 1000, 'the menu sits at the right edge: ' + JSON.stringify(pop));
  });
  t.test('the Help button menu opens About See', async (p) => {
    await p.click('#btnHelpTop');
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    await pick(p, 'About See');
    p.assert.equal(await p.waitModal(), 'About See');
  });
  t.test('the Help button menu stays put on ArrowRight and closes with Escape', async (p) => {
    await p.click('#btnHelpTop');
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    await p.key('ArrowRight');
    p.assert.equal(await p.count('.menu-pop'), 1);
    p.assert.equal((await p.menuItems())[0].label, 'C reference…');
    await p.key('Escape');
    p.assert.equal(await p.count('.menu-pop'), 0);
    p.assert.ok(!(await p.ev("document.getElementById('btnHelpTop').classList.contains('open')")));
  });

  // ---- keyboard shortcuts -----------------------------------------------------------------------------
  t.test('F5 starts the debugger at main', async (p) => {
    await p.newFile(MAIN, PROG);
    await focusEditor(p);
    await p.key('F5');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
    p.assert.equal(await p.ev("document.querySelector('#tbDebug .lbl').textContent"), 'Continue');
    await p.stopProgram();
  });
  t.test('F5 while paused continues', async (p) => {
    await p.debugProgram(PROG);
    await p.key('F5');
    await p.waitState('exited');
    p.assert.match(await p.output(), /^49$/m);
    await p.stopProgram();
  });
  t.test('F5 while paused runs on to a breakpoint', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev(`SEE.app.toggleBreakpoint('${MAIN}', 3)`);
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await p.key('F5');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 4);
    p.assert.match(await p.status(), /Breakpoint at line 4 in square/);
    await p.stopProgram();
  });
  t.test('Ctrl+F5 runs at full speed', async (p) => {
    await p.newFile(MAIN, PROG);
    await focusEditor(p);
    await p.key('F5', { ctrl: true });
    await p.waitState('exited');
    p.assert.equal(await p.ev('SEE.app.dbg'), null);
    p.assert.match(await p.output(), /Running/);
  });
  t.test('Shift+F5 stops the program', async (p) => {
    await startLoop(p);
    await p.key('F5', { shift: true });
    await p.wait('!SEE.app.vm');
    p.assert.equal(await p.chip(), 'Stopped');
  });
  t.test('F9 toggles a breakpoint on the cursor line', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 9, 4);
    await p.key('F9');
    p.assert.ok(await p.ev(`SEE.app.breakpoints.get('${MAIN}').has(9)`));
    p.assert.ok(await p.ev(`JSON.parse(localStorage.getItem('see.breakpoints'))['${MAIN}'].some(x => x[0] === 9)`));
    await p.key('F9');
    p.assert.ok(!(await p.ev(`SEE.app.breakpoints.has('${MAIN}')`)));
  });
  t.test('F10 steps over', async (p) => {
    await p.debugProgram(PROG);
    await p.key('F10');
    await p.settle();
    p.assert.equal(await p.line(), 10);
    await p.key('F10');
    await p.settle();
    p.assert.equal(await p.line(), 11);
    p.assert.equal(await p.cval('y'), 49);
    await p.stopProgram();
  });
  t.test('F10 with nothing running starts the debugger', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.key('F10');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 9);
    await p.stopProgram();
  });
  t.test('F11 steps into a call', async (p) => {
    await p.debugProgram(PROG);
    await p.step('over');
    await p.key('F11');
    await p.settle();
    p.assert.equal(await p.fnName(), 'square');
    p.assert.equal(await p.cval('n'), 7);
    await p.stopProgram();
  });
  t.test('Shift+F11 steps out of a function', async (p) => {
    await p.debugProgram(PROG);
    await p.step('over');
    await p.step('into');
    await p.key('F11', { shift: true });
    await p.settle();
    p.assert.equal(await p.fnName(), 'main');
    p.assert.match(await p.status(), /square\(\) returned/);
    await p.stopProgram();
  });
  t.test('Ctrl+F11 runs one statement', async (p) => {
    await p.debugProgram('int main(void)\n{\n    int a = 1; int b = 2;\n    return a + b;\n}\n');
    p.assert.equal(await p.line(), 3);
    await p.key('F11', { ctrl: true });
    await p.settle();
    p.assert.equal(await p.cval('a'), 1);
    p.assert.equal(await p.line(), 3, 'still on the line, at its second statement');
    await p.stopProgram();
  });
  t.test('F8 steps back a line', async (p) => {
    await p.debugProgram(PROG);
    await p.step('over', 2);
    await p.key('F8');
    await p.wait('SEE.app.vm.where().line === 10');
    await p.key('F8');
    await p.wait('SEE.app.vm.where().line === 9');
    await p.stopProgram();
  });
  t.test('Shift+F8 steps back one statement', async (p) => {
    await p.debugProgram('int main(void)\n{\n    int a = 1; int b = 2;\n    return a + b;\n}\n');
    await p.step('stmt', 2);
    const before = await p.ev('SEE.app.vm.steps');
    await p.key('F8', { shift: true });
    await p.wait(`SEE.app.vm.steps < ${before}`);
    p.assert.equal(await p.chip(), 'Paused (went back)');
    await p.stopProgram();
  });
  t.test('Ctrl+F10 runs to the cursor', async (p) => {
    await p.debugProgram(PROG);
    await cursorAt(p, 11, 0);
    await p.key('F10', { ctrl: true });
    await p.wait("SEE.app.vm && SEE.app.vm.state === 'paused' && SEE.app.vm.where().line === 12 && !SEE.app.running");
    p.assert.match(await p.output(), /^49$/m);
    await p.stopProgram();
  });
  t.test('Ctrl+B builds', async (p) => {
    await p.newFile(MAIN, 'int main(void) { return zz; }\n');
    await focusEditor(p);
    await p.key('b', { ctrl: true });
    await p.wait('SEE.app.problems.length > 0');
    p.assert.match((await p.problems()).join('\n'), /'zz' undeclared/);
    p.assert.equal(await p.ev('SEE.app.bottomTab'), 'probs');
  });
  t.test('Ctrl+S saves the file', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.setCode(PROG.replace('int x = 7', 'int x = 70'));
    await focusEditor(p);
    await p.key('s', { ctrl: true });
    await p.wait('!SEE.app.active.dirty');
    p.assert.match(await p.ev(`SEE.app.vfs.readText('${MAIN}')`), /int x = 70;/);
  });
  t.test('Ctrl+N asks for a new file name', async (p) => {
    await p.newFile(MAIN, PROG);
    await focusEditor(p);
    await p.key('n', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'New file');
    p.assert.match(await p.ev("document.querySelector('.modal input').value"), /^untitled\d*\.c$/);
  });
  t.test('Ctrl+O opens the file chooser', async (p) => {
    await focusEditor(p);
    await p.key('o', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Open a file');
  });
  t.test('Ctrl+F opens Find with the selection in it', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev('(() => { const e = SEE.app.active.editor; e.setCursor(1, 4, 6); })()');
    await p.key('f', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Find');
    p.assert.equal(await p.ev("document.querySelector('.modal input').value"), 'square');
  });
  t.test('Ctrl+H opens Replace', async (p) => {
    await p.newFile(MAIN, PROG);
    await focusEditor(p);
    await p.key('h', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Replace');
    p.assert.equal(await p.count('.modal input[type=text]'), 2);
  });
  t.test('Ctrl+G opens Go to line', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 4, 0);
    await p.key('g', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Go to line');
    p.assert.equal(await p.ev("document.querySelector('.modal input').value"), '5');
    p.assert.match(await p.modalText(), /1 to 14/);
  });
  t.test('Ctrl+/ comments the line from outside the editor', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 8, 4);
    await p.ev('SEE.app.active.editor.ta.blur()');
    await p.key('/', { ctrl: true });
    await p.wait("SEE.app.active.editor.getLine(8) === '    /* int x = 7; */'");
  });
  t.test('Ctrl+/ comments the line in the editor', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 8, 4);
    await p.key('/', { ctrl: true });
    await p.wait("SEE.app.active.editor.getLine(8) === '    /* int x = 7; */'", 2000);
    await p.key('/', { ctrl: true });
    await p.wait("SEE.app.active.editor.getLine(8) === '    int x = 7;'", 2000);
  });
  t.test('Ctrl+= makes the code bigger', async (p) => {
    await p.newFile(MAIN, PROG);
    await focusEditor(p);
    await p.key('=', { ctrl: true });
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 15);
    p.assert.equal(await p.ev("JSON.parse(localStorage.getItem('see.settings')).fontSize"), 15);
  });
  t.test('Ctrl+- makes the code smaller', async (p) => {
    await p.newFile(MAIN, PROG);
    await focusEditor(p);
    await p.key('-', { ctrl: true });
    await p.key('-', { ctrl: true });
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 12);
  });
  t.test('F1 on a word opens the reference at it', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 10, 7);
    await p.key('F1');
    p.assert.equal(await p.waitModal(), 'C reference');
    await p.wait("!!document.querySelector('.ref-body h3')");
    p.assert.equal(await p.text('.ref-body h3'), 'printf');
    p.assert.ok(await p.exists('.ref-list .ri.sel[data-n="printf"]'));
  });
  t.test('F1 on a keyword opens the reference at the keyword', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 11, 8);
    await p.key('F1');
    await p.waitModal();
    await p.wait("!!document.querySelector('.ref-body h3')");
    p.assert.equal(await p.text('.ref-body h3'), 'return');
  });
  t.test('F1 away from a word opens the reference start page', async (p) => {
    await p.newFile(MAIN, PROG);
    await cursorAt(p, 2, 0);
    await p.key('F1');
    p.assert.equal(await p.waitModal(), 'C reference');
    p.assert.match(await p.text('.ref-body'), /Everything in the C89 library/);
  });
  t.test('shortcuts are ignored while a dialog is open', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev('SEE.app.shortcutsDialog()');
    await p.waitModal();
    await p.key('F5');
    await p.sleep(150);
    p.assert.equal(await p.state(), 'none');
  });
  t.test('typing in the terminal does not trigger Ctrl+B', async (p) => {
    await p.newFile(MAIN, READS);
    await p.ev("document.getElementById('termInput').focus()");
    await p.key('b', { ctrl: true });
    await p.sleep(100);
    p.assert.equal(await p.ev('SEE.app.buildLog'), '');
  }, { fresh: true });
}
