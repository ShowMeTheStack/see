// Documents: tabs, saving, Save as, Save all, autosave, closing changed files, the read-only
// originals, the session after a reload, new files and projects, the title and stale-code notice.
const U = Date.now().toString(36);
let n = 0;
/** A fresh folder in /home/user for one test */
const dir = () => `/home/user/doc${U}-${++n}`;
const J = JSON.stringify;
const MAIN = '#include <stdio.h>\nint main(void)\n{\n    printf("hi\\n");\n    return 0;\n}\n';
const LOOP = '#include <stdio.h>\nint main(void)\n{\n    int i;\n    int s = 0;\n    for (i = 0; i < 3; i++)\n        s += i;\n    printf("%d\\n", s);\n    return 0;\n}\n';

const tabNames = (p) => p.texts('#tabs .tab .tname');
const disk = (p, path) => p.ev(`SEE.app.vfs.exists(${J(path)}) ? SEE.app.vfs.readText(${J(path)}) : null`);
const exists = (p, path) => p.ev(`SEE.app.vfs.exists(${J(path)})`);
const doc = (p, path) => p.ev(`(() => { const d = SEE.app.docByPath(${J(path)}); return d ? { path: d.path, dirty: d.dirty, text: d.editor.getValue() } : null; })()`);
/** Change the active file's text the way typing does */
async function edit(p, text) {
  await p.ev('(() => { const e = SEE.app.active.editor; e.setCursor(0, 0); })()');
  await p.insertText(text);
}
async function button(p, label) {
  const ok = await p.ev(`(() => { const b = [...document.querySelectorAll('.modal-back:last-child .modal-foot button')].find(x => x.innerText.trim() === ${J(label)}); if (!b) return false; b.click(); return true; })()`);
  p.assert.ok(ok, 'dialog button ' + label + ' in: ' + await p.modalText());
  await p.sleep(120);
}
const buttons = (p) => p.texts('.modal-back:last-child .modal-foot button');
const inputValue = (p) => p.ev("(document.querySelector('.modal-back:last-child input[type=text]') || {}).value");
async function pick(p, menu, label) {
  await p.menu(menu);
  const ok = await p.ev(`(() => { const e = [...document.querySelectorAll('.menu-pop .menu-item')].find(x => x.children[0].innerText === ${J(label)}); if (!e) return false; e.click(); return true; })()`);
  p.assert.ok(ok, 'menu item ' + label);
  await p.sleep(120);
}
async function clickTab(p, name, opts = {}) {
  const [x, y] = await p.ev(`(() => { const t = [...document.querySelectorAll('#tabs .tab')].find(e => e.querySelector('.tname').innerText === ${J(name)}); const r = (${opts.close ? "t.querySelector('.tclose')" : 't'}).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  await p.clickAt(x, y, { button: opts.button || 'left' });
  await p.sleep(80);
}
const closeActive = (p) => p.ev('void SEE.app.closeDoc(SEE.app.active)');
async function closeAndAnswer(p, label) {
  await closeActive(p);
  await p.waitModal();
  await button(p, label);
}

export default function (t) {
  t.beforeEach(async (p) => {
    await p.ev(`(() => { SEE.app.stop(); SEE.UI.closeAllModals(); SEE.UI.closeMenus(); SEE.app.clearBreakpoints(); SEE.app.settings.autosave = false; history.replaceState(null, '', location.pathname);
      for (const d of SEE.app.docs.slice()) { d.dirty = false; SEE.app.closeDoc(d); } })()`);
    await p.sleep(30);
  });

  // ---- tabs ------------------------------------------------------------------------------------------
  t.test('opening a file adds a tab named after it', async (p) => {
    const f = dir();
    await p.newFile(f + '/alpha.c', MAIN);
    p.assert.deepEqual(await tabNames(p), ['alpha.c']);
  });
  t.test('opening an open file again does not add a second tab', async (p) => {
    const f = dir();
    await p.newFile(f + '/alpha.c', MAIN);
    await p.ev(`SEE.app.openFile(${J(f + '/alpha.c')})`);
    await p.ev(`SEE.app.openFile(${J(f + '/ALPHA.C')})`);
    p.assert.deepEqual(await tabNames(p), ['alpha.c']);
  });
  t.test('the active tab is marked active and selected', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', MAIN);
    await p.newFile(f + '/two.c', MAIN);
    p.assert.deepEqual(await p.ev("[...document.querySelectorAll('#tabs .tab')].map(t => [t.classList.contains('active'), t.getAttribute('aria-selected')])"), [[false, 'false'], [true, 'true']]);
  });
  t.test('clicking a tab shows that file in the editor', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', 'int one;\n');
    await p.newFile(f + '/two.c', 'int two;\n');
    await clickTab(p, 'one.c');
    p.assert.equal(await p.activePath(), f + '/one.c');
    p.assert.equal(await p.ev("SEE.app.docs.filter(d => d.editor.root.style.display !== 'none').map(d => d.name).join()"), 'one.c');
    p.assert.ok(await p.ev('document.activeElement === SEE.app.active.editor.ta'));
  });
  t.test('Enter on a focused tab switches to it', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', 'int one;\n');
    await p.newFile(f + '/two.c', 'int two;\n');
    await p.ev("document.querySelector('#tabs .tab').focus()");
    await p.key('Enter');
    p.assert.equal(await p.activePath(), f + '/one.c');
  });
  t.test('the × button closes a tab', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', MAIN);
    await p.newFile(f + '/two.c', MAIN);
    await clickTab(p, 'two.c', { close: true });
    p.assert.deepEqual(await tabNames(p), ['one.c']);
    p.assert.equal(await p.modalOpen(), false);
  });
  t.test('a middle click closes a tab', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', MAIN);
    await p.newFile(f + '/two.c', MAIN);
    await clickTab(p, 'one.c', { button: 'middle' });
    p.assert.deepEqual(await tabNames(p), ['two.c']);
  });
  t.test('File > Close closes the active tab', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', MAIN);
    await p.newFile(f + '/two.c', MAIN);
    await pick(p, 'File', 'Close');
    p.assert.deepEqual(await tabNames(p), ['one.c']);
  });
  t.test('Ctrl+Alt+W closes the active tab', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', MAIN);
    await p.newFile(f + '/two.c', MAIN);
    await p.key('w', { ctrl: true, alt: true });
    p.assert.deepEqual(await tabNames(p), ['one.c']);
  });
  t.test('closing the active tab shows the tab to its left', async (p) => {
    const f = dir();
    for (const x of ['a1.c', 'a2.c', 'a3.c']) await p.newFile(f + '/' + x, MAIN);
    await clickTab(p, 'a2.c');
    await closeActive(p);
    p.assert.equal(await p.activePath(), f + '/a1.c');
  });
  t.test('closing the first tab shows the next one', async (p) => {
    const f = dir();
    for (const x of ['a1.c', 'a2.c']) await p.newFile(f + '/' + x, MAIN);
    await clickTab(p, 'a1.c');
    await closeActive(p);
    p.assert.equal(await p.activePath(), f + '/a2.c');
  });
  t.test('closing a tab that is not active keeps the active one', async (p) => {
    const f = dir();
    for (const x of ['a1.c', 'a2.c', 'a3.c']) await p.newFile(f + '/' + x, MAIN);
    await clickTab(p, 'a1.c', { close: true });
    p.assert.equal(await p.activePath(), f + '/a3.c');
  });
  t.test('with every tab closed the editor says no file is open', async (p) => {
    p.assert.deepEqual(await tabNames(p), []);
    p.assert.match(await p.text('.empty-editor'), /No file open/);
    p.assert.deepEqual(await p.texts('.empty-editor button'), ['New file', 'Example library']);
    p.assert.ok(await p.ev("document.getElementById('tbSave').disabled"));
  });
  t.test('the New file button of the empty editor asks for a name', async (p) => {
    await p.click('.empty-editor button', 'New file');
    p.assert.equal(await p.waitModal(), 'New file');
  });
  t.test('a changed file shows the changed mark on its tab', async (p) => {
    await p.newFile(dir() + '/m.c', MAIN);
    p.assert.equal(await p.exists('#tabs .tab.dirty'), false);
    await edit(p, '/* x */');
    p.assert.equal(await p.exists('#tabs .tab.dirty'), true);
  });
  t.test('saving takes the changed mark away', async (p) => {
    await p.newFile(dir() + '/m.c', MAIN);
    await edit(p, '/* x */');
    await p.key('s', { ctrl: true });
    p.assert.equal(await p.exists('#tabs .tab.dirty'), false);
  });
  t.test('undoing back to the saved text takes the changed mark away', async (p) => {
    await p.newFile(dir() + '/m.c', MAIN);
    await edit(p, '/* x */');
    await pick(p, 'Edit', 'Undo');
    p.assert.equal(await p.code(), MAIN);
    p.assert.equal(await p.exists('#tabs .tab.dirty'), false);
  });
  t.test('two open files with the same name show their folders', async (p) => {
    const a = dir(), b = dir();
    await p.newFile(a + '/main.c', MAIN);
    await p.newFile(b + '/main.c', MAIN);
    p.assert.deepEqual(await tabNames(p), ['main.c · ' + a.replace(/^.*\//, ''), 'main.c · ' + b.replace(/^.*\//, '')]);
  });
  t.test('closing one of two same-named files gives the other its plain name', async (p) => {
    const a = dir(), b = dir();
    await p.newFile(a + '/main.c', MAIN);
    await p.newFile(b + '/main.c', MAIN);
    await closeActive(p);
    p.assert.deepEqual(await tabNames(p), ['main.c']);
  });
  t.test('a tab shows the whole path when pointed at', async (p) => {
    const f = dir();
    await p.newFile(f + '/m.c', MAIN);
    p.assert.equal(await p.attr('#tabs .tab', 'title'), f + '/m.c');
  });

  // ---- saving ----------------------------------------------------------------------------------------
  t.test('Ctrl+S writes the text to the disk and says so', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await edit(p, '/* saved */');
    await p.key('s', { ctrl: true });
    p.assert.equal(await disk(p, f), '/* saved */' + MAIN);
    p.assert.equal(await p.status(), 'Saved ' + f);
  });
  t.test('the Save button on the toolbar saves', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await edit(p, '/* tb */');
    await p.click('#tbSave');
    p.assert.equal(await disk(p, f), '/* tb */' + MAIN);
  });
  t.test('File > Save saves', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await edit(p, '/* menu */');
    await pick(p, 'File', 'Save');
    p.assert.equal(await disk(p, f), '/* menu */' + MAIN);
  });
  t.test('Save as with a new name saves next to the file under that name', async (p) => {
    const f = dir();
    await p.newFile(f + '/m.c', MAIN);
    await edit(p, '/* v2 */');
    await pick(p, 'File', 'Save as…');
    p.assert.equal(await p.waitModal(), 'Save as');
    p.assert.equal(await inputValue(p), f + '/m.c');
    await p.modalInput('other.c');
    await button(p, 'OK');
    p.assert.equal(await disk(p, f + '/other.c'), '/* v2 */' + MAIN);
    p.assert.equal(await disk(p, f + '/m.c'), MAIN);
    p.assert.equal(await p.activePath(), f + '/other.c');
    p.assert.deepEqual(await tabNames(p), ['other.c']);
    await p.waitToast(/Saved .*other\.c/);
  });
  t.test('Save as adds .c to a name without an extension', async (p) => {
    const f = dir();
    await p.newFile(f + '/m.c', MAIN);
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await p.modalInput('plain');
    await p.key('Enter');
    await p.wait(`SEE.app.vfs.exists(${J(f + '/plain.c')})`);
    p.assert.equal(await p.activePath(), f + '/plain.c');
  });
  t.test('Save as with a path saves into that folder, making it', async (p) => {
    const f = dir(), g = dir();
    await p.newFile(f + '/m.c', MAIN);
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await p.modalInput(g + '/deep/moved.c');
    await p.key('Enter');
    await p.wait(`SEE.app.vfs.exists(${J(g + '/deep/moved.c')})`);
    p.assert.equal(await p.activePath(), g + '/deep/moved.c');
  });
  t.test('Save as onto an existing file asks before replacing it', async (p) => {
    const f = dir();
    await p.newFile(f + '/target.c', 'int old;\n');
    await p.newFile(f + '/m.c', MAIN);
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await p.modalInput('target.c');
    await p.key('Enter');
    await p.wait("document.querySelector('.modal-back:last-child .modal-head') && document.querySelector('.modal-back:last-child .modal-head').innerText === 'Replace?'");
    p.assert.match(await p.modalText(), /target\.c already exists/);
    await button(p, 'Replace');
    p.assert.equal(await disk(p, f + '/target.c'), MAIN);
    p.assert.deepEqual(await tabNames(p), ['target.c']);
  });
  t.test('saying Cancel to Replace? leaves both files as they were', async (p) => {
    const f = dir();
    await p.newFile(f + '/target.c', 'int old;\n');
    await p.newFile(f + '/m.c', MAIN);
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await p.modalInput('target.c');
    await p.key('Enter');
    await p.wait("document.querySelector('.modal-back:last-child .modal-head') && document.querySelector('.modal-back:last-child .modal-head').innerText === 'Replace?'");
    await button(p, 'Cancel');
    p.assert.equal(await disk(p, f + '/target.c'), 'int old;\n');
    p.assert.equal(await p.activePath(), f + '/m.c');
  });
  t.test('Save as onto a file open in another tab closes that tab', async (p) => {
    const f = dir();
    await p.newFile(f + '/target.c', 'int old;\n');
    await p.newFile(f + '/m.c', MAIN);
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await p.modalInput('target.c');
    await p.key('Enter');
    await p.wait("document.querySelector('.modal-back:last-child .modal-head') && document.querySelector('.modal-back:last-child .modal-head').innerText === 'Replace?'");
    await button(p, 'Replace');
    p.assert.deepEqual(await tabNames(p), ['target.c']);
    p.assert.equal(await p.code(), MAIN);
  });
  t.test('cancelling Save as changes nothing', async (p) => {
    const f = dir();
    await p.newFile(f + '/m.c', MAIN);
    await edit(p, '/* x */');
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await button(p, 'Cancel');
    p.assert.equal(await p.activePath(), f + '/m.c');
    p.assert.equal(await disk(p, f + '/m.c'), MAIN);
    p.assert.equal((await doc(p, f + '/m.c')).dirty, true);
  });
  t.test('Save as into /examples is refused', async (p) => {
    const f = dir();
    await p.newFile(f + '/m.c', MAIN);
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await p.modalInput('/examples/mine.c');
    await p.key('Enter');
    await p.waitToast(/outside \/examples/);
    p.assert.equal(await exists(p, '/examples/mine.c'), false);
    p.assert.equal(await p.activePath(), f + '/m.c');
  });
  t.test('Save as takes the breakpoints along to the new name', async (p) => {
    const f = dir();
    await p.newFile(f + '/m.c', LOOP);
    await p.ev(`SEE.app.toggleBreakpoint(${J(f + '/m.c')}, 6)`);
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await p.modalInput('n.c');
    await p.key('Enter');
    await p.wait(`SEE.app.vfs.exists(${J(f + '/n.c')})`);
    p.assert.deepEqual(await p.ev(`[...SEE.app.breakpoints.get(${J(f + '/n.c')}).keys()]`), [6]);
  });
  t.test('Save all saves every changed file and says so', async (p) => {
    const f = dir();
    await p.newFile(f + '/a.c', 'int a;\n');
    await edit(p, '/* A */');
    await p.newFile(f + '/b.c', 'int b;\n');
    await edit(p, '/* B */');
    await pick(p, 'File', 'Save all');
    p.assert.equal(await disk(p, f + '/a.c'), '/* A */int a;\n');
    p.assert.equal(await disk(p, f + '/b.c'), '/* B */int b;\n');
    p.assert.equal(await p.count('#tabs .tab.dirty'), 0);
    p.assert.equal(await p.status(), 'Saved everything');
  });
  t.test('Save all leaves a changed original alone', async (p) => {
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await edit(p, '/* mine */');
    await p.ev('SEE.app.saveAll()');
    p.assert.equal((await doc(p, '/examples/swap/swap.c')).dirty, true);
    p.assert.doesNotMatch(await disk(p, '/examples/swap/swap.c'), /mine/);
  });

  // ---- autosave -------------------------------------------------------------------------------------
  t.test('with autosave on, a changed file is saved by itself', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await p.ev('SEE.app.settings.autosave = true');
    await edit(p, '/* auto */');
    await p.wait(`SEE.app.vfs.readText(${J(f)}).startsWith('/* auto */')`, 6000);
    p.assert.equal(await p.exists('#tabs .tab.dirty'), false);
  });
  t.test('with autosave on, building saves the changed files first', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await p.ev('SEE.app.settings.autosave = true');
    await edit(p, '/* b */');
    await p.build();
    p.assert.equal(await disk(p, f), '/* b */' + MAIN);
  });
  t.test('with autosave off, building leaves the file on disk unchanged', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await edit(p, '/* b */');
    await p.build();
    p.assert.equal(await disk(p, f), MAIN);
    p.assert.equal(await p.exists('#tabs .tab.dirty'), true);
  });
  t.test('the Settings dialog turns autosave off and remembers it', async (p) => {
    await p.ev('SEE.app.settings.autosave = true; SEE.app.saveSettings()');
    await pick(p, 'File', 'Settings…');
    p.assert.equal(await p.waitModal(), 'Settings');
    await p.click('.modal-back:last-child label', 'Save my files by themselves');
    p.assert.equal(await p.ev('SEE.app.settings.autosave'), false);
    p.assert.equal(await p.ev("JSON.parse(localStorage.getItem('see.settings')).autosave"), false);
    await p.click('.modal-back:last-child label', 'Save my files by themselves');
    p.assert.equal(await p.ev('SEE.app.settings.autosave'), true);
  });
  t.test('autosave never writes into an original', async (p) => {
    await p.ev("SEE.app.openFile('/examples/hanoi/hanoi.c')");
    await p.ev('SEE.app.settings.autosave = true');
    await edit(p, '/* mine */');
    await p.ev('SEE.app.autosaveAll()');
    p.assert.doesNotMatch(await disk(p, '/examples/hanoi/hanoi.c'), /mine/);
    p.assert.equal((await doc(p, '/examples/hanoi/hanoi.c')).dirty, true);
  });

  // ---- closing a changed file ------------------------------------------------------------------------
  t.test('closing a changed file asks whether to save it', async (p) => {
    await p.newFile(dir() + '/m.c', MAIN);
    await edit(p, '/* x */');
    await closeActive(p);
    p.assert.equal(await p.waitModal(), 'Save changes?');
    p.assert.match(await p.modalText(), /Save the changes to m\.c\?/);
    p.assert.deepEqual(await buttons(p), ['Cancel', "Don't save", 'Save as…', 'Save']);
  });
  t.test('Save in the close dialog saves and closes', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await edit(p, '/* x */');
    await closeAndAnswer(p, 'Save');
    p.assert.equal(await disk(p, f), '/* x */' + MAIN);
    p.assert.deepEqual(await tabNames(p), []);
  });
  t.test("Don't save closes and keeps the file on disk as it was", async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await edit(p, '/* x */');
    await closeAndAnswer(p, "Don't save");
    p.assert.equal(await disk(p, f), MAIN);
    p.assert.deepEqual(await tabNames(p), []);
  });
  t.test('Cancel in the close dialog keeps the file open and changed', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await edit(p, '/* x */');
    await closeAndAnswer(p, 'Cancel');
    p.assert.deepEqual(await tabNames(p), ['m.c']);
    p.assert.equal((await doc(p, f)).dirty, true);
    p.assert.equal(await p.code(), '/* x */' + MAIN);
  });
  t.test('Escape in the close dialog cancels', async (p) => {
    const f = dir() + '/m.c';
    await p.newFile(f, MAIN);
    await edit(p, '/* x */');
    await closeActive(p);
    await p.waitModal();
    await p.key('Escape');
    await p.wait('!document.querySelector(".modal-back")');
    p.assert.deepEqual(await tabNames(p), ['m.c']);
  });
  t.test('Save as… in the close dialog saves under a new name and closes', async (p) => {
    const f = dir();
    await p.newFile(f + '/m.c', MAIN);
    await edit(p, '/* x */');
    await closeAndAnswer(p, 'Save as…');
    await p.wait("document.querySelector('.modal-back:last-child .modal-head').innerText === 'Save as'");
    await p.modalInput('kept.c');
    await p.key('Enter');
    await p.wait('SEE.app.docs.length === 0');
    p.assert.equal(await disk(p, f + '/kept.c'), '/* x */' + MAIN);
    p.assert.equal(await disk(p, f + '/m.c'), MAIN);
  });
  t.test('the × of a changed tab asks before closing', async (p) => {
    await p.newFile(dir() + '/m.c', MAIN);
    await edit(p, '/* x */');
    await clickTab(p, 'm.c', { close: true });
    p.assert.equal(await p.waitModal(), 'Save changes?');
  });
  t.test('a middle click on a changed tab asks before closing', async (p) => {
    await p.newFile(dir() + '/m.c', MAIN);
    await edit(p, '/* x */');
    await clickTab(p, 'm.c', { button: 'middle' });
    p.assert.equal(await p.waitModal(), 'Save changes?');
  });
  t.test('closing a changed original offers to keep a copy', async (p) => {
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await edit(p, '/* x */');
    await closeActive(p);
    p.assert.equal(await p.waitModal(), 'Keep your changes?');
    p.assert.match(await p.modalText(), /one of the originals/);
    p.assert.deepEqual(await buttons(p), ['Cancel', 'Throw them away', 'Save my copy…']);
  });
  t.test('Throw them away closes the original without changing it', async (p) => {
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await edit(p, '/* x */');
    await closeAndAnswer(p, 'Throw them away');
    p.assert.deepEqual(await tabNames(p), []);
    p.assert.doesNotMatch(await disk(p, '/examples/swap/swap.c'), /\/\* x \*\//);
  });
  t.test('Save my copy… on closing an original saves the project as a copy', async (p) => {
    const g = dir();
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await edit(p, '/* x */');
    await closeAndAnswer(p, 'Save my copy…');
    await p.wait("document.querySelector('.modal-back:last-child .modal-head').innerText === 'Save your own copy'");
    await p.modalInput(g);
    await p.key('Enter');
    await p.wait(`SEE.app.vfs.exists(${J(g + '/swap.c')})`);
    p.assert.match(await disk(p, g + '/swap.c'), /^\/\* x \*\//);
  });

  // ---- originals --------------------------------------------------------------------------------------
  t.test('a file from /examples has a read-only label on its tab', async (p) => {
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    p.assert.equal(await p.text('#tabs .tab .tro'), 'read-only');
  });
  t.test('a file from /lessons has a read-only label on its tab', async (p) => {
    await p.ev("SEE.Lessons.install(SEE.app, SEE.Lessons.byId('hello')); SEE.app.openFile('/lessons/hello/main.c')");
    p.assert.equal(await p.activePath(), '/lessons/hello/main.c');
    p.assert.equal(await p.text('#tabs .tab .tro'), 'read-only');
  });
  t.test('a file from /library has a read-only label on its tab', async (p) => {
    await p.ev("void SEE.Library.openById(SEE.app, 'basics/bits-and-masks')");
    await p.wait("SEE.app.active && SEE.app.active.path === '/library/basics/bits-and-masks/bits-and-masks.c'", 8000);
    p.assert.equal(await p.text('#tabs .tab .tro'), 'read-only');
  });
  t.test('your own file has no read-only label', async (p) => {
    await p.newFile(dir() + '/m.c', MAIN);
    p.assert.equal(await p.exists('#tabs .tab .tro'), false);
  });
  t.test('saving an original asks for a folder for your own copy', async (p) => {
    await p.ev("SEE.app.openFile('/examples/stack-module/main.c')");
    await edit(p, '/* x */');
    await p.key('s', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Save your own copy');
    p.assert.match(await inputValue(p), /^\/home\/user\/stack-module(-\d+)?$/);
    p.assert.match(await p.modalText(), /This is an original/);
  });
  t.test('the copy of an original holds every file of its project', async (p) => {
    const g = dir();
    await p.ev("SEE.app.openFile('/examples/stack-module/main.c')");
    await edit(p, '/* mine */');
    await p.key('s', { ctrl: true });
    await p.waitModal();
    await p.modalInput(g);
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(g + '/main.c')}`);
    p.assert.deepEqual(await p.ev(`SEE.app.vfs.list(${J(g)}).map(x => x.name).sort()`), ['main.c', 'stack.c', 'stack.h']);
    p.assert.equal(await disk(p, g + '/stack.c'), await disk(p, '/examples/stack-module/stack.c'));
    p.assert.match(await disk(p, g + '/main.c'), /^\/\* mine \*\//);
    p.assert.doesNotMatch(await disk(p, '/examples/stack-module/main.c'), /mine/);
    await p.waitToast(/Your copy is in/);
  });
  t.test('the copy opens in place of the original', async (p) => {
    const g = dir();
    await p.ev("SEE.app.openFile('/examples/stack-module/stack.c'); SEE.app.openFile('/examples/stack-module/main.c')");
    await edit(p, '/* mine */');
    await p.key('s', { ctrl: true });
    await p.waitModal();
    await p.modalInput(g);
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(g + '/main.c')}`);
    const paths = await p.ev('SEE.app.docs.map(d => d.path).sort()');
    p.assert.deepEqual(paths, [g + '/main.c', g + '/stack.c']);
    p.assert.equal(await p.exists('#tabs .tab .tro'), false);
    p.assert.equal(await p.count('#tabs .tab.dirty'), 0);
  });
  t.test('the copy can be built and run', async (p) => {
    const g = dir();
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await edit(p, '/* mine */');
    await p.key('s', { ctrl: true });
    await p.waitModal();
    await p.modalInput(g);
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(g + '/swap.c')}`);
    await p.ev('SEE.app.run()');
    await p.settle();
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await p.output(), new RegExp('Running ' + g));
  });
  t.test('the default copy folder skips a name already taken', async (p) => {
    await p.ev("SEE.app.vfs.mkdir('/home/user/padding', { exist: true }); SEE.app.openFile('/examples/padding/padding.c')");
    await edit(p, '/* x */');
    await p.key('s', { ctrl: true });
    await p.waitModal();
    p.assert.match(await inputValue(p), /^\/home\/user\/padding-\d+$/);
  });
  t.test('a relative copy folder name goes into /home/user', async (p) => {
    const name = 'rel' + U + '-' + (++n);
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await edit(p, '/* x */');
    await p.key('s', { ctrl: true });
    await p.waitModal();
    await p.modalInput(name);
    await p.key('Enter');
    await p.wait(`SEE.app.vfs.exists('/home/user/${name}/swap.c')`);
  });
  t.test('cancelling the copy keeps the original open and changed', async (p) => {
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await edit(p, '/* x */');
    await p.key('s', { ctrl: true });
    await p.waitModal();
    await button(p, 'Cancel');
    p.assert.equal(await p.activePath(), '/examples/swap/swap.c');
    p.assert.equal((await doc(p, '/examples/swap/swap.c')).dirty, true);
  });
  t.test('a copy into /examples is refused', async (p) => {
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await edit(p, '/* x */');
    await p.key('s', { ctrl: true });
    await p.waitModal();
    await p.modalInput('/examples/swap2');
    await p.key('Enter');
    await p.waitToast(/outside \/examples/);
    p.assert.equal(await exists(p, '/examples/swap2'), false);
    p.assert.equal(await p.activePath(), '/examples/swap/swap.c');
  });
  t.test('the copy takes the breakpoints of the original along', async (p) => {
    const g = dir();
    await p.ev("SEE.app.openFile('/examples/swap/swap.c'); SEE.app.toggleBreakpoint('/examples/swap/swap.c', 3)");
    await edit(p, '\n');
    await p.key('s', { ctrl: true });
    await p.waitModal();
    await p.modalInput(g);
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(g + '/swap.c')}`);
    p.assert.deepEqual(await p.ev(`[...(SEE.app.breakpoints.get(${J(g + '/swap.c')}) || new Map()).keys()]`), [4]);
    p.assert.equal(await p.ev("SEE.app.breakpoints.has('/examples/swap/swap.c')"), false);
  });
  t.test('saving a lesson file makes a copy of the lesson', async (p) => {
    const g = dir();
    await p.ev("SEE.Lessons.install(SEE.app, SEE.Lessons.byId('hello')); SEE.app.openFile('/lessons/hello/main.c')");
    await edit(p, '/* mine */');
    await p.key('s', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Save your own copy');
    p.assert.match(await inputValue(p), /^\/home\/user\/hello/);
    await p.modalInput(g);
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(g + '/main.c')}`);
    p.assert.match(await disk(p, g + '/main.c'), /^\/\* mine \*\//);
  });
  t.test('saving a library file makes a copy of the example', async (p) => {
    const g = dir();
    await p.ev("void SEE.Library.openById(SEE.app, 'basics/bits-and-masks')");
    await p.wait("SEE.app.active && SEE.app.active.path === '/library/basics/bits-and-masks/bits-and-masks.c'", 8000);
    await edit(p, '/* mine */');
    await p.key('s', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Save your own copy');
    p.assert.match(await inputValue(p), /^\/home\/user\/bits-and-masks/);
    await p.modalInput(g);
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(g + '/bits-and-masks.c')}`);
    p.assert.doesNotMatch(await disk(p, '/library/basics/bits-and-masks/bits-and-masks.c'), /mine/);
  });
  t.test('Save as from an original offers a name in /home/user', async (p) => {
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    p.assert.equal(await inputValue(p), '/home/user/swap.c');
  });

  // ---- the session ---------------------------------------------------------------------------------
  t.test('a reload opens the same files again', async (p) => {
    const f = dir();
    await p.newFile(f + '/s1.c', MAIN);
    await p.newFile(f + '/s2.c', MAIN);
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await p.ev('SEE.app.vfs.flushNow && SEE.app.vfs.flushNow()');
    await p.sleep(150);
    await p.reload();
    p.assert.deepEqual(await tabNames(p), ['s1.c', 's2.c', 'swap.c'], JSON.stringify(await tabNames(p)));
  });
  t.test('a reload shows the file that was active', async (p) => {
    const f = dir();
    await p.newFile(f + '/s1.c', MAIN);
    await p.newFile(f + '/s2.c', MAIN);
    await clickTab(p, 's1.c');
    await p.ev('SEE.app.vfs.flushNow && SEE.app.vfs.flushNow()');
    await p.sleep(150);
    await p.reload();
    p.assert.equal(await p.activePath(), f + '/s1.c');
    p.assert.equal(await p.text('#docTitle'), '— ' + f + '/s1.c');
  });
  t.test('a closed file is not opened again by a reload', async (p) => {
    const f = dir();
    await p.newFile(f + '/s1.c', MAIN);
    await p.newFile(f + '/s2.c', MAIN);
    await closeActive(p);
    await p.ev('SEE.app.vfs.flushNow && SEE.app.vfs.flushNow()');
    await p.sleep(150);
    await p.reload();
    p.assert.deepEqual(await tabNames(p), ['s1.c']);
  });
  t.test('a file deleted from the disk is left out after a reload', async (p) => {
    const f = dir();
    await p.newFile(f + '/s1.c', MAIN);
    await p.newFile(f + '/gone.c', MAIN);
    await p.ev(`SEE.app.vfs.unlink(${J(f + '/gone.c')})`);
    await p.ev('SEE.app.vfs.flushNow && SEE.app.vfs.flushNow()');
    await p.sleep(150);
    await p.reload();
    p.assert.deepEqual(await tabNames(p), ['s1.c']);
  });
  t.test('changes are saved on the way out when autosave is on', async (p) => {
    const f = dir() + '/s.c';
    await p.newFile(f, MAIN);
    await p.ev('SEE.app.settings.autosave = true; SEE.app.saveSettings()');
    await edit(p, '/* kept */');
    await p.reload();
    p.assert.equal(await p.code(), '/* kept */' + MAIN);
    p.assert.equal(await p.exists('#tabs .tab.dirty'), false);
  });

  // ---- new file -------------------------------------------------------------------------------------
  t.test('Ctrl+N asks for the name of a new file, untitled.c by default', async (p) => {
    const f = dir();
    await p.newFile(f + '/main.c', MAIN);
    await p.key('n', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'New file');
    p.assert.equal(await inputValue(p), 'untitled.c');
    p.assert.match(await p.modalText(), new RegExp('It goes in ' + f));
  });
  t.test('the default new file name counts up when untitled.c exists', async (p) => {
    const f = dir();
    await p.newFile(f + '/untitled.c', MAIN);
    await p.ev('void SEE.Files.newFile(SEE.app)');
    await p.waitModal();
    p.assert.equal(await inputValue(p), 'untitled2.c');
  });
  t.test('a new .c file in an empty folder starts as a small program', async (p) => {
    const f = dir();
    await p.ev(`void SEE.Files.newFile(SEE.app, ${J(f)})`);
    await p.waitModal();
    await p.modalInput('first.c');
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(f + '/first.c')}`);
    p.assert.match(await p.code(), /^\/\* first\.c \*\/\n#include <stdio\.h>[\s\S]*int main\(void\)[\s\S]*hello from first/);
    p.assert.equal(await exists(p, f + '/first.c'), true);
    await p.wait('SEE.app.active.editor.cursor().line === 5');
  });
  t.test('a new file name without an extension gets .c', async (p) => {
    const f = dir();
    await p.ev(`void SEE.Files.newFile(SEE.app, ${J(f)})`);
    await p.waitModal();
    await p.modalInput('noext');
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(f + '/noext.c')}`);
  });
  t.test('a new .h file starts with an include guard', async (p) => {
    const f = dir();
    await p.ev(`void SEE.Files.newFile(SEE.app, ${J(f)})`);
    await p.waitModal();
    await p.modalInput('my-list.h');
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(f + '/my-list.h')}`);
    p.assert.equal(await p.code(), '/* my-list.h */\n#ifndef MY_LIST_H\n#define MY_LIST_H\n\n\n\n#endif\n');
  });
  t.test('a new .h file puts the caret on the empty line between the guards', async (p) => {
    const f = dir();
    await p.ev(`void SEE.Files.newFile(SEE.app, ${J(f)})`);
    await p.waitModal();
    await p.modalInput('guard.h');
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(f + '/guard.h')}`);
    await p.wait('SEE.app.active.editor.cursor().line === 3');
  });
  t.test('a new .c file next to a main() has no main of its own', async (p) => {
    const f = dir();
    await p.newFile(f + '/main.c', MAIN);
    await p.ev('void SEE.Files.newFile(SEE.app)');
    await p.waitModal();
    await p.modalInput('helper.c');
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(f + '/helper.c')}`);
    p.assert.equal(await p.code(), '/* helper.c */\n#include <stdio.h>\n\n');
  });
  t.test('cancelling New file makes nothing', async (p) => {
    const f = dir();
    await p.newFile(f + '/main.c', MAIN);
    await p.key('n', { ctrl: true });
    await p.waitModal();
    await button(p, 'Cancel');
    p.assert.equal(await exists(p, f + '/untitled.c'), false);
    p.assert.deepEqual(await tabNames(p), ['main.c']);
  });
  t.test('a new file with a path makes its folder', async (p) => {
    const f = dir();
    await p.ev('void SEE.Files.newFile(SEE.app)');
    await p.waitModal();
    await p.modalInput(f + '/sub/deep.c');
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === ${J(f + '/sub/deep.c')}`);
    p.assert.ok(await p.ev(`SEE.app.vfs.isDir(${J(f + '/sub')})`));
  });
  t.test('a new file inside /examples is refused', async (p) => {
    await p.ev('void SEE.Files.newFile(SEE.app)');
    await p.waitModal();
    await p.modalInput('/examples/nope.c');
    await p.key('Enter');
    await p.waitToast(/Could not make that file/);
    p.assert.equal(await exists(p, '/examples/nope.c'), false);
  });
  t.test('a new file with the name of an existing file opens it unchanged', async (p) => {
    const f = dir();
    await p.newFile(f + '/keep.c', 'int keep;\n');
    await p.ev('void SEE.Files.newFile(SEE.app)');
    await p.waitModal();
    await p.modalInput('keep.c');
    await p.key('Enter');
    await p.sleep(100);
    p.assert.equal(await disk(p, f + '/keep.c'), 'int keep;\n');
    p.assert.equal(await p.activePath(), f + '/keep.c');
  });
  t.test('the New button and File > New file… ask for a name too', async (p) => {
    await p.newFile(dir() + '/main.c', MAIN);
    await p.click('#tbNew');
    p.assert.equal(await p.waitModal(), 'New file');
    await p.closeModals();
    await pick(p, 'File', 'New file…');
    p.assert.equal(await p.waitModal(), 'New file');
  });
  t.test('a new file next to an original goes to /home/user', async (p) => {
    await p.ev("SEE.app.openFile('/examples/swap/swap.c')");
    await p.key('n', { ctrl: true });
    await p.waitModal();
    p.assert.match(await p.modalText(), /It goes in \/home\/user\./);
  });

  // ---- new project ----------------------------------------------------------------------------------
  t.test('File > New project… asks for a project name', async (p) => {
    await pick(p, 'File', 'New project…');
    p.assert.equal(await p.waitModal(), 'New project');
    p.assert.equal(await inputValue(p), 'myproject');
  });
  t.test('a new project is a folder in /home/user with main.c open', async (p) => {
    const name = 'proj' + U + '-' + (++n);
    await p.ev('void SEE.Files.newProject(SEE.app)');
    await p.waitModal();
    await p.modalInput(name);
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === '/home/user/${name}/main.c'`);
    p.assert.match(await p.code(), /int main\(void\)/);
    p.assert.ok(await p.ev(`SEE.app.expanded.has('/home/user/${name}')`));
  });
  t.test('a new project builds and runs straight away', async (p) => {
    const name = 'proj' + U + '-' + (++n);
    await p.ev('void SEE.Files.newProject(SEE.app)');
    await p.waitModal();
    await p.modalInput(name);
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === '/home/user/${name}/main.c'`);
    await p.ev('SEE.app.run()');
    await p.settle();
    p.assert.match(await p.output(), /hello from main/);
  });
  t.test('a project name that is taken is refused', async (p) => {
    const name = 'proj' + U + '-' + (++n);
    await p.ev(`SEE.app.vfs.mkdir('/home/user/${name}', { exist: true })`);
    await p.ev('void SEE.Files.newProject(SEE.app)');
    await p.waitModal();
    await p.modalInput(name);
    await p.key('Enter');
    await p.waitToast(/already exists/);
    p.assert.equal(await exists(p, `/home/user/${name}/main.c`), false);
  });
  t.test('slashes in a project name become underscores', async (p) => {
    const name = 'pr' + U + '-' + (++n);
    await p.ev('void SEE.Files.newProject(SEE.app)');
    await p.waitModal();
    await p.modalInput(name + '/x');
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path === '/home/user/${name}_x/main.c'`);
  });
  t.test('cancelling New project makes nothing', async (p) => {
    const before = await p.ev("SEE.app.vfs.list('/home/user').length");
    await p.ev('void SEE.Files.newProject(SEE.app)');
    await p.waitModal();
    await button(p, 'Cancel');
    p.assert.equal(await p.ev("SEE.app.vfs.list('/home/user').length"), before);
  });

  // ---- the title ------------------------------------------------------------------------------------
  t.test('the title bar shows the path of the active file', async (p) => {
    const f = dir() + '/titled.c';
    await p.newFile(f, MAIN);
    p.assert.equal(await p.text('#docTitle'), '— ' + f);
    p.assert.ok(await p.visible('#docTitle'));
  });
  t.test('the title follows the tab that is chosen', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', MAIN);
    await p.newFile(f + '/two.c', MAIN);
    await clickTab(p, 'one.c');
    p.assert.equal(await p.text('#docTitle'), '— ' + f + '/one.c');
  });
  t.test('the title is empty with no file open', async (p) => {
    p.assert.equal(await p.ev("document.getElementById('docTitle').textContent"), '');
  });
  t.test('the title follows Save as', async (p) => {
    const f = dir();
    await p.newFile(f + '/one.c', MAIN);
    await p.ev('void SEE.app.saveAs()');
    await p.waitModal();
    await p.modalInput('renamed.c');
    await p.key('Enter');
    await p.wait(`document.getElementById('docTitle').textContent === ${J('— ' + f + '/renamed.c')}`);
  });

  // ---- editing while a program runs -------------------------------------------------------------------
  const STALE = /You changed the code: the running program is the old version/;
  t.test('editing the program while it is paused says the running copy is old', async (p) => {
    await p.debugProgram(LOOP, { path: dir() + '/main.c' });
    await edit(p, '/* new */');
    p.assert.match(await p.status(), STALE);
  });
  t.test('the stale-code message comes once per run', async (p) => {
    await p.debugProgram(LOOP, { path: dir() + '/main.c' });
    await edit(p, '/* a */');
    await p.ev("SEE.app.setStatus('something else')");
    await edit(p, '/* b */');
    p.assert.equal(await p.status(), 'something else');
  });
  t.test('the stale-code message comes again after starting again', async (p) => {
    const f = dir() + '/main.c';
    await p.debugProgram(LOOP, { path: f });
    await edit(p, '/* a */');
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await edit(p, '/* b */');
    p.assert.match(await p.status(), STALE);
  });
  t.test('editing a file that is not part of the program says nothing', async (p) => {
    const f = dir();
    await p.debugProgram(LOOP, { path: f + '/main.c' });
    await p.newFile(dir() + '/notes.c', 'int x;\n');
    await p.ev("SEE.app.setStatus('before')");
    await edit(p, '/* n */');
    p.assert.equal(await p.status(), 'before');
  });
  t.test('editing the program while it waits for input says the running copy is old', async (p) => {
    await p.runProgram('#include <stdio.h>\nint main(void)\n{\n    int x;\n    scanf("%d", &x);\n    printf("%d\\n", x);\n    return 0;\n}\n', { path: dir() + '/main.c' });
    p.assert.equal(await p.state(), 'input');
    await edit(p, '/* new */');
    p.assert.match(await p.status(), STALE);
  });
  t.test('editing when nothing runs gives no stale-code message', async (p) => {
    await p.newFile(dir() + '/main.c', LOOP);
    await p.ev("SEE.app.setStatus('idle')");
    await edit(p, '/* x */');
    p.assert.equal(await p.status(), 'idle');
  });
}
