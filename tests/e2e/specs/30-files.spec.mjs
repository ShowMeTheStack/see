// The Files panel: the tree, folding, selection, the context menus, protections, the Open dialog,
// /usr/include, /examples and projects made of several files.
const ROOT = '/home/user/f30';
const row = (path) => `#sideBody .trow[data-path="${path}"]`;
const HEADERS = ['assert.h', 'ctype.h', 'errno.h', 'float.h', 'limits.h', 'locale.h', 'math.h', 'setjmp.h', 'signal.h', 'stdarg.h', 'stddef.h', 'stdio.h', 'stdlib.h', 'string.h', 'time.h'];
const HELLO = (s) => `#include <stdio.h>\nint main(void)\n{\n    printf("${s}\\n");\n    return 0;\n}\n`;

/** Write files without opening them; {path: text} */
const put = (p, files) => p.fn((files) => {
  const v = SEE.app.vfs;
  for (const [path, text] of Object.entries(files)) {
    v.mkdir(path.replace(/\/[^/]*$/, ''), { parents: true, exist: true, trusted: true });
    if (text === null) v.mkdir(path, { exist: true, trusted: true });
    else v.writeText(path, text, { trusted: true });
  }
  SEE.app.renderSide();
}, files);
/** Unfold every folder above a path so its row is in the tree */
const reveal = (p, path, self) => p.fn((path, self) => {
  const a = SEE.app;
  const segs = path.split('/').filter(Boolean);
  let cur = '';
  for (let i = 0; i < segs.length - (self ? 0 : 1); i++) { cur += '/' + segs[i]; a.expanded.add(cur.toLowerCase()); }
  a.renderSide();
}, path, !!self);
const fold = (p, path) => p.fn((path) => { SEE.app.expanded.delete(path.toLowerCase()); SEE.app.renderSide(); }, path);
const exists = (p, path) => p.fn((path) => SEE.app.vfs.exists(path), path);
const readText = (p, path) => p.fn((path) => SEE.app.vfs.readText(path), path);
const isOpen = (p, path) => p.fn((path) => !!SEE.app.docByPath(path), path);
async function ctx(p, path, label) {
  await reveal(p, path);
  await p.rightClick(row(path));
  await p.wait("!!document.querySelector('.menu-pop')", 3000);
  if (label !== undefined) { await p.click('.menu-pop .menu-item', label); await p.sleep(100); }
}
async function menuState(p, path) {
  await ctx(p, path);
  const items = await p.menuItems();
  await p.closeMenus();
  const out = {};
  for (const it of items) out[it.label] = it.disabled;
  return out;
}
async function answer(p, value) {
  await p.waitModal();
  await p.modalInput(value);
  await p.modalButton('OK');
  await p.sleep(80);
}
/** Replace SEE.UI.download with a recorder; downloads land in window.__dl */
const stubDownload = (p) => p.ev("window.__dl = []; SEE.UI.download = (name, data, type) => { window.__dl.push({ name, type, text: typeof data === 'string' ? data : new TextDecoder().decode(data), size: data.length }); }; true");

export default function (t) {
  t.beforeEach(async (p) => {
    await p.closeModals();
    await p.closeMenus();
    await p.ev(`(async () => {
      const a = SEE.app;
      if (a.vm) a.stop();
      for (const d of a.docs.slice()) { d.dirty = false; await a.closeDoc(d); }
      for (const x of ['${ROOT}', '/home/user/shared', '/home/user/zz30']) { try { a.vfs.rmdir(x, { recursive: true, trusted: true }); } catch (e) {} }
      for (const x of a.vfs.list('/home/user')) if (/^(swap|untitled|my folder)/i.test(x.name)) { try { x.type === 'dir' ? a.vfs.rmdir(x.path, { recursive: true }) : a.vfs.unlink(x.path); } catch (e) {} }
      a.vfs.mkdir('${ROOT}', { parents: true, trusted: true });
      a.clearBreakpoints();
      a.expanded = new Set(['/home', '/home/user', '${ROOT.toLowerCase()}']);
      a.selectedPath = null;
      a.renderSide();
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      return true;
    })()`);
    await p.sleep(30);
  });

  // ---- the tree --------------------------------------------------------------------------------------
  for (const dir of ['/home', '/examples', '/tmp', '/usr']) {
    t.test(`the tree shows ${dir} at the top level`, async (p) => {
      p.assert.ok(await p.exists(row(dir)), dir + ' row');
      p.assert.equal(await p.ev(`document.querySelector('${row(dir)}').style.paddingLeft`), '8px');
    });
  }
  for (const [dir, tag] of [['/examples', 'originals'], ['/usr', 'system'], ['/tmp', 'scratch']]) {
    t.test(`${dir} carries the tag "${tag}"`, async (p) => {
      p.assert.equal(await p.text(row(dir) + ' .tag'), tag);
    });
  }
  t.test('/home and /home/user carry no tag', async (p) => {
    p.assert.equal(await p.exists(row('/home') + ' .tag'), false);
    p.assert.equal(await p.exists(row('/home/user') + ' .tag'), false);
  });
  t.test('the tree is an ARIA tree labelled Files', async (p) => {
    p.assert.equal(await p.attr('#sideBody .tree', 'role'), 'tree');
    p.assert.equal(await p.attr('#sideBody .tree', 'aria-label'), 'Files');
    p.assert.equal(await p.attr(row('/tmp'), 'role'), 'treeitem');
  });
  t.test('a folder row has aria-expanded and a file row does not', async (p) => {
    await put(p, { [ROOT + '/a.c']: HELLO('a') });
    p.assert.equal(await p.attr(row(ROOT), 'aria-expanded'), 'true');
    p.assert.equal(await p.attr(row('/tmp'), 'aria-expanded'), 'false');
    p.assert.equal(await p.attr(row(ROOT + '/a.c'), 'aria-expanded'), null);
  });
  t.test('folders come before files, each in name order', async (p) => {
    await put(p, { [ROOT + '/b.c']: '', [ROOT + '/a.c']: '', [ROOT + '/zdir']: null, [ROOT + '/adir']: null, [ROOT + '/file10.c']: '', [ROOT + '/file9.c']: '' });
    const names = await p.ev(`[...document.querySelectorAll('#sideBody .trow')].filter(r => r.dataset.path.startsWith('${ROOT}/')).map(r => r.dataset.path.slice(${ROOT.length + 1}))`);
    p.assert.deepEqual(names, ['adir', 'zdir', 'a.c', 'b.c', 'file9.c', 'file10.c']);
  });
  t.test('rows indent by 16px for each level', async (p) => {
    await put(p, { [ROOT + '/x.c']: '' });
    p.assert.equal(await p.ev(`document.querySelector('${row(ROOT)}').style.paddingLeft`), '40px');
    p.assert.equal(await p.ev(`document.querySelector('${row(ROOT + '/x.c')}').style.paddingLeft`), '56px');
  });
  t.test('a row shows its full path as its title', async (p) => {
    await put(p, { [ROOT + '/titled.c']: '' });
    p.assert.equal(await p.attr(row(ROOT + '/titled.c'), 'title'), ROOT + '/titled.c');
  });
  t.test('a file open in an editor has the open class in the tree', async (p) => {
    await put(p, { [ROOT + '/o.c']: HELLO('o'), [ROOT + '/n.c']: '' });
    await p.ev(`SEE.app.openFile('${ROOT}/o.c'); SEE.app.renderSide()`);
    p.assert.ok(await p.exists(row(ROOT + '/o.c') + '.open'));
    p.assert.equal(await p.exists(row(ROOT + '/n.c') + '.open'), false);
  });
  for (const [id, title] of [['fNew', 'New program'], ['fNewFolder', 'New folder'], ['fImport', 'Bring files from your computer'], ['fMount', 'Use a folder from your computer']]) {
    t.test(`the Files toolbar has the ${title} button`, async (p) => {
      p.assert.ok(await p.visible('#' + id));
      p.assert.equal(await p.attr('#' + id, 'title'), title);
    });
  }

  // ---- folding ---------------------------------------------------------------------------------------
  t.test('clicking a folded folder unfolds it', async (p) => {
    await put(p, { [ROOT + '/sub/in.c']: '' });
    p.assert.equal(await p.exists(row(ROOT + '/sub/in.c')), false);
    await p.click(row(ROOT + '/sub'));
    p.assert.ok(await p.exists(row(ROOT + '/sub/in.c')));
    p.assert.equal(await p.attr(row(ROOT + '/sub'), 'aria-expanded'), 'true');
    p.assert.equal(await p.text(row(ROOT + '/sub') + ' .twisty'), '▾');
  });
  t.test('clicking an unfolded folder folds it', async (p) => {
    await put(p, { [ROOT + '/sub/in.c']: '' });
    await reveal(p, ROOT + '/sub/in.c');
    p.assert.ok(await p.exists(row(ROOT + '/sub/in.c')));
    await p.click(row(ROOT + '/sub'));
    p.assert.equal(await p.exists(row(ROOT + '/sub/in.c')), false);
    p.assert.equal(await p.text(row(ROOT + '/sub') + ' .twisty'), '▸');
  });
  t.test('ArrowRight unfolds a folder and keeps focus on it', async (p) => {
    await put(p, { [ROOT + '/k/in.c']: '' });
    await p.ev(`document.querySelector('${row(ROOT + '/k')}').focus()`);
    await p.key('ArrowRight');
    p.assert.ok(await p.exists(row(ROOT + '/k/in.c')));
    p.assert.equal(await p.ev('document.activeElement.dataset.path'), ROOT + '/k');
  });
  t.test('ArrowLeft folds an open folder', async (p) => {
    await put(p, { [ROOT + '/k/in.c']: '' });
    await reveal(p, ROOT + '/k/in.c');
    await p.ev(`document.querySelector('${row(ROOT + '/k')}').focus()`);
    await p.key('ArrowLeft');
    p.assert.equal(await p.exists(row(ROOT + '/k/in.c')), false);
    p.assert.equal(await p.ev('document.activeElement.dataset.path'), ROOT + '/k');
  });
  t.test('ArrowLeft on a folded folder leaves it folded', async (p) => {
    await put(p, { [ROOT + '/k/in.c']: '' });
    await p.ev(`document.querySelector('${row(ROOT + '/k')}').focus()`);
    await p.key('ArrowLeft');
    p.assert.equal(await p.attr(row(ROOT + '/k'), 'aria-expanded'), 'false');
  });
  t.test('Enter on a folder row unfolds it and Enter again folds it', async (p) => {
    await put(p, { [ROOT + '/e/in.c']: '' });
    await p.ev(`document.querySelector('${row(ROOT + '/e')}').focus()`);
    await p.key('Enter');
    p.assert.ok(await p.exists(row(ROOT + '/e/in.c')));
    await p.ev(`document.querySelector('${row(ROOT + '/e')}').focus()`);
    await p.key('Enter');
    p.assert.equal(await p.exists(row(ROOT + '/e/in.c')), false);
  });
  t.test('unfolded folders are remembered in storage', async (p) => {
    await put(p, { [ROOT + '/mem/in.c']: '' });
    await p.click(row(ROOT + '/mem'));
    const saved = await p.ev("JSON.parse(localStorage.getItem('see.expanded'))");
    p.assert.ok(saved.includes(ROOT.toLowerCase() + '/mem'));
  });
  t.test('unfolded folders stay unfolded after a reload', async (p) => {
    await put(p, { [ROOT + '/keep/in.c']: HELLO('k') });
    await p.click(row(ROOT + '/keep'));
    await p.ev('SEE.app.vfs.flushNow && SEE.app.vfs.flushNow()');
    await p.sleep(150);
    await p.reload();
    await p.wait(`!!document.querySelector('${row(ROOT + '/keep/in.c')}')`, 5000);
  });
  t.test('unfolding /usr shows include and lib', async (p) => {
    await fold(p, '/usr');
    await p.click(row('/usr'));
    p.assert.ok(await p.exists(row('/usr/include')));
    p.assert.ok(await p.exists(row('/usr/lib')));
    await fold(p, '/usr');
  });

  // ---- selection ------------------------------------------------------------------------------------------
  t.test('clicking a row selects it', async (p) => {
    await put(p, { [ROOT + '/s.c']: '' });
    await p.click(row(ROOT + '/s.c'));
    p.assert.equal(await p.ev('SEE.app.selectedPath'), ROOT + '/s.c');
    await p.wait(`!!document.querySelector('${row(ROOT + '/s.c')}.sel')`, 2000);
  });
  t.test('selecting another row moves the highlight', async (p) => {
    await put(p, { [ROOT + '/s1']: null, [ROOT + '/s2']: null });
    await p.click(row(ROOT + '/s1'));
    await p.click(row(ROOT + '/s2'));
    p.assert.equal(await p.count('#sideBody .trow.sel'), 1);
    p.assert.ok(await p.exists(row(ROOT + '/s2') + '.sel'));
  });
  t.test('the New program button puts the file in the selected folder', async (p) => {
    await put(p, { [ROOT + '/target']: null });
    await p.click(row(ROOT + '/target'));
    await p.click('#fNew');
    await p.waitModal();
    p.assert.match(await p.modalText(), new RegExp('It goes in ' + ROOT + '/target'));
    await answer(p, 'made.c');
    p.assert.ok(await exists(p, ROOT + '/target/made.c'));
    p.assert.equal(await p.activePath(), ROOT + '/target/made.c');
  });
  t.test('with /usr selected a new file goes next to the open file instead', async (p) => {
    await p.newFile(ROOT + '/here.c', HELLO('h'));
    await p.click(row('/usr'));
    await fold(p, '/usr');
    p.assert.equal(await p.ev('SEE.Files.currentDir(SEE.app)'), ROOT);
  });
  t.test('with nothing selected and nothing open new files go to /home/user', async (p) => {
    p.assert.equal(await p.ev('SEE.Files.currentDir(SEE.app)'), '/home/user');
  });

  // ---- opening files ----------------------------------------------------------------------------------------
  for (const name of ['prog.c', 'defs.h', 'notes.txt', 'data.csv', 'Makefile']) {
    t.test(`clicking ${name} opens it in an editor`, async (p) => {
      await put(p, { [ROOT + '/' + name]: 'content of ' + name + '\n' });
      await p.click(row(ROOT + '/' + name));
      await p.wait(`SEE.app.active && SEE.app.active.path === '${ROOT}/${name}'`, 3000);
      p.assert.equal(await p.code(), 'content of ' + name + '\n');
      p.assert.ok(await p.exists('#tabs .tab.active'));
    });
  }
  t.test('clicking a binary file does not open it', async (p) => {
    await put(p, { [ROOT + '/pic.png']: 'xx' });
    await p.click(row(ROOT + '/pic.png'));
    p.assert.equal(await isOpen(p, ROOT + '/pic.png'), false);
  });
  t.test('clicking a file that is already open switches to its tab without a second tab', async (p) => {
    await put(p, { [ROOT + '/one.c']: HELLO('1'), [ROOT + '/two.c']: HELLO('2') });
    await p.click(row(ROOT + '/one.c'));
    await p.click(row(ROOT + '/two.c'));
    await p.click(row(ROOT + '/one.c'));
    p.assert.equal(await p.activePath(), ROOT + '/one.c');
    p.assert.equal(await p.ev('SEE.app.docs.length'), 2);
  });
  t.test('Enter on a file row opens it', async (p) => {
    await put(p, { [ROOT + '/enter.c']: HELLO('e') });
    await p.ev(`document.querySelector('${row(ROOT + '/enter.c')}').focus()`);
    await p.key('Enter');
    p.assert.equal(await p.activePath(), ROOT + '/enter.c');
  });
  t.test('the window title shows the open file path', async (p) => {
    await put(p, { [ROOT + '/ttl.c']: HELLO('t') });
    await p.click(row(ROOT + '/ttl.c'));
    p.assert.equal(await p.text('#docTitle'), '— ' + ROOT + '/ttl.c');
  });

  // ---- the context menus ---------------------------------------------------------------------------------------
  t.test('the menu of a file lists every action', async (p) => {
    await put(p, { [ROOT + '/m.c']: HELLO('m') });
    await ctx(p, ROOT + '/m.c');
    const labels = (await p.menuItems()).map((x) => x.label);
    p.assert.deepEqual(labels, ['Open', 'Run its folder', 'Debug its folder', 'Share as a link…', 'Download', 'Duplicate', 'Rename…', 'Delete']);
    p.assert.ok((await p.menuItems()).every((x) => !x.disabled));
  });
  t.test('the menu of a folder lists every action', async (p) => {
    await put(p, { [ROOT + '/d/m.c']: HELLO('m') });
    await ctx(p, ROOT + '/d');
    const labels = (await p.menuItems()).map((x) => x.label);
    p.assert.deepEqual(labels, ['New file here', 'New folder here', 'Bring files here from your computer', 'Share this folder as a link…', 'Download as .zip', 'Rename…', 'Delete']);
  });
  t.test('Escape closes the file menu', async (p) => {
    await put(p, { [ROOT + '/m.c']: '' });
    await ctx(p, ROOT + '/m.c');
    await p.key('Escape');
    await p.waitGone('.menu-pop', 2000);
  });
  t.test('Open in the file menu opens the file', async (p) => {
    await put(p, { [ROOT + '/op.c']: HELLO('op') });
    await ctx(p, ROOT + '/op.c', 'Open');
    p.assert.equal(await p.activePath(), ROOT + '/op.c');
  });
  t.test('Run its folder runs the program the file belongs to', async (p) => {
    await put(p, { [ROOT + '/run/main.c']: HELLO('ran from the menu') });
    await ctx(p, ROOT + '/run/main.c', 'Run its folder');
    await p.waitOutput(/ran from the menu/);
    await p.waitOutput(/exited with status 0/);
    p.assert.equal(await p.activePath(), ROOT + '/run/main.c');
  });
  t.test('Debug its folder pauses at the first line of main', async (p) => {
    await put(p, { [ROOT + '/dbg/main.c']: '#include <stdio.h>\nint main(void)\n{\n    int x = 3;\n    printf("%d\\n", x);\n    return 0;\n}\n' });
    await ctx(p, ROOT + '/dbg/main.c', 'Debug its folder');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 4);
    await p.stopProgram();
  });
  t.test('Share as a link opens the Share dialog for that file', async (p) => {
    await put(p, { [ROOT + '/sh.c']: HELLO('s') });
    await ctx(p, ROOT + '/sh.c', 'Share as a link');
    p.assert.equal(await p.waitModal(), 'Share sh');
    p.assert.match(await p.modalText(), /this program/);
    await p.closeModals();
  });
  t.test('Download hands over the file under its own name', async (p) => {
    await stubDownload(p);
    await put(p, { [ROOT + '/dl.c']: 'int main(void) { return 0; }\n' });
    await ctx(p, ROOT + '/dl.c', 'Download');
    const dl = await p.ev('window.__dl');
    p.assert.equal(dl.length, 1);
    p.assert.equal(dl[0].name, 'dl.c');
    p.assert.equal(dl[0].text, 'int main(void) { return 0; }\n');
  });
  t.test('Download of a changed open file saves it and hands over the new text', async (p) => {
    await stubDownload(p);
    await p.newFile(ROOT + '/dirty.c', 'old\n');
    await p.setCode('new text\n');
    await ctx(p, ROOT + '/dirty.c', 'Download');
    const dl = await p.ev('window.__dl');
    p.assert.equal(dl[0].text, 'new text\n');
    p.assert.equal(await readText(p, ROOT + '/dirty.c'), 'new text\n');
  });
  t.test('Duplicate makes name-2.c next to the file and opens it', async (p) => {
    await put(p, { [ROOT + '/name.c']: HELLO('dup') });
    await ctx(p, ROOT + '/name.c', 'Duplicate');
    p.assert.ok(await exists(p, ROOT + '/name-2.c'));
    p.assert.equal(await readText(p, ROOT + '/name-2.c'), HELLO('dup'));
    p.assert.equal(await p.activePath(), ROOT + '/name-2.c');
  });
  t.test('Duplicate twice makes name-2.c then name-3.c', async (p) => {
    await put(p, { [ROOT + '/name.c']: HELLO('dup') });
    await ctx(p, ROOT + '/name.c', 'Duplicate');
    await ctx(p, ROOT + '/name.c', 'Duplicate');
    p.assert.ok(await exists(p, ROOT + '/name-3.c'));
  });
  t.test('Duplicate copies the unsaved text of an open file', async (p) => {
    await p.newFile(ROOT + '/u.c', 'saved\n');
    await p.setCode('unsaved\n');
    await ctx(p, ROOT + '/u.c', 'Duplicate');
    p.assert.equal(await readText(p, ROOT + '/u-2.c'), 'unsaved\n');
    p.assert.equal(await readText(p, ROOT + '/u.c'), 'saved\n');
  });
  t.test('Duplicate of a file with no extension adds -2 to its name', async (p) => {
    await put(p, { [ROOT + '/README']: 'r\n' });
    await ctx(p, ROOT + '/README', 'Duplicate');
    p.assert.ok(await exists(p, ROOT + '/README-2'));
  });
  t.test('Duplicate of an example makes your own copy in /home/user', async (p) => {
    await ctx(p, '/examples/swap/swap.c', 'Duplicate');
    p.assert.ok(await exists(p, '/home/user/swap-2.c'));
    p.assert.equal(await p.activePath(), '/home/user/swap-2.c');
    p.assert.equal(await readText(p, '/home/user/swap-2.c'), await readText(p, '/examples/swap/swap.c'));
  });
  t.test('Rename in the file menu renames the file', async (p) => {
    await put(p, { [ROOT + '/old.c']: 'x\n' });
    await ctx(p, ROOT + '/old.c', 'Rename');
    p.assert.equal(await p.waitModal(), 'Rename');
    await answer(p, 'new.c');
    p.assert.ok(await exists(p, ROOT + '/new.c'));
    p.assert.equal(await exists(p, ROOT + '/old.c'), false);
    p.assert.ok(await p.exists(row(ROOT + '/new.c')));
  });
  t.test('the Rename prompt starts with the old name', async (p) => {
    await put(p, { [ROOT + '/start.c']: 'x\n' });
    await ctx(p, ROOT + '/start.c', 'Rename');
    await p.waitModal();
    p.assert.equal(await p.ev("document.querySelector('.modal-back:last-child input').value"), 'start.c');
    await p.closeModals();
  });
  t.test('F2 on a row renames it', async (p) => {
    await put(p, { [ROOT + '/f2.c']: 'x\n' });
    await p.ev(`document.querySelector('${row(ROOT + '/f2.c')}').focus()`);
    await p.key('F2');
    await answer(p, 'f2b.c');
    p.assert.ok(await exists(p, ROOT + '/f2b.c'));
  });
  t.test('cancelling Rename leaves the file alone', async (p) => {
    await put(p, { [ROOT + '/keep.c']: 'x\n' });
    await ctx(p, ROOT + '/keep.c', 'Rename');
    await p.waitModal();
    await p.modalButton('Cancel');
    p.assert.ok(await exists(p, ROOT + '/keep.c'));
  });
  t.test('Rename onto a name already there gives an error', async (p) => {
    await put(p, { [ROOT + '/a.c']: 'a\n', [ROOT + '/b.c']: 'b\n' });
    await ctx(p, ROOT + '/a.c', 'Rename');
    await answer(p, 'b.c');
    await p.waitToast(/Could not rename/);
    p.assert.equal(await readText(p, ROOT + '/b.c'), 'b\n');
    p.assert.ok(await exists(p, ROOT + '/a.c'));
  });
  t.test('Delete in the file menu asks first and then deletes', async (p) => {
    await put(p, { [ROOT + '/gone.c']: 'x\n' });
    await ctx(p, ROOT + '/gone.c', 'Delete');
    p.assert.equal(await p.waitModal(), 'Delete?');
    p.assert.match(await p.modalText(), new RegExp('Delete ' + ROOT + '/gone.c\\?'));
    await p.modalButton('Delete');
    p.assert.equal(await exists(p, ROOT + '/gone.c'), false);
    p.assert.equal(await p.exists(row(ROOT + '/gone.c')), false);
  });
  t.test('cancelling Delete keeps the file', async (p) => {
    await put(p, { [ROOT + '/stay.c']: 'x\n' });
    await ctx(p, ROOT + '/stay.c', 'Delete');
    await p.waitModal();
    await p.modalButton('Cancel');
    p.assert.ok(await exists(p, ROOT + '/stay.c'));
  });
  t.test('the Delete key on a row deletes after asking', async (p) => {
    await put(p, { [ROOT + '/delkey.c']: 'x\n' });
    await p.ev(`document.querySelector('${row(ROOT + '/delkey.c')}').focus()`);
    await p.key('Delete');
    await p.waitModal();
    await p.modalButton('Delete');
    p.assert.equal(await exists(p, ROOT + '/delkey.c'), false);
  });
  t.test('Delete closes the tab of an open file', async (p) => {
    await p.newFile(ROOT + '/tabgone.c', HELLO('t'));
    await ctx(p, ROOT + '/tabgone.c', 'Delete');
    await p.waitModal();
    await p.modalButton('Delete');
    p.assert.equal(await isOpen(p, ROOT + '/tabgone.c'), false);
  });
  t.test('New file here offers untitled.c in that folder', async (p) => {
    await put(p, { [ROOT + '/nf']: null });
    await ctx(p, ROOT + '/nf', 'New file here');
    p.assert.equal(await p.waitModal(), 'New file');
    p.assert.equal(await p.ev("document.querySelector('.modal-back:last-child input').value"), 'untitled.c');
    p.assert.match(await p.modalText(), new RegExp('It goes in ' + ROOT + '/nf'));
    await p.modalButton('OK');
    await p.sleep(80);
    p.assert.ok(await exists(p, ROOT + '/nf/untitled.c'));
    p.assert.match(await readText(p, ROOT + '/nf/untitled.c'), /int main\(void\)/);
    p.assert.equal(await p.activePath(), ROOT + '/nf/untitled.c');
  });
  t.test('New file here offers untitled2.c when untitled.c is taken', async (p) => {
    await put(p, { [ROOT + '/nf/untitled.c']: '' });
    await ctx(p, ROOT + '/nf', 'New file here');
    await p.waitModal();
    p.assert.equal(await p.ev("document.querySelector('.modal-back:last-child input').value"), 'untitled2.c');
    await p.closeModals();
  });
  t.test('a new file named without an extension becomes a .c file', async (p) => {
    await put(p, { [ROOT + '/nf']: null });
    await ctx(p, ROOT + '/nf', 'New file here');
    await answer(p, 'plain');
    p.assert.ok(await exists(p, ROOT + '/nf/plain.c'));
  });
  t.test('a new .h file starts with an include guard', async (p) => {
    await put(p, { [ROOT + '/nf']: null });
    await ctx(p, ROOT + '/nf', 'New file here');
    await answer(p, 'my-list.h');
    const text = await readText(p, ROOT + '/nf/my-list.h');
    p.assert.match(text, /#ifndef MY_LIST_H\n#define MY_LIST_H/);
    p.assert.match(text, /#endif/);
  });
  t.test('a new .c file next to a main has no main of its own', async (p) => {
    await put(p, { [ROOT + '/nf/main.c']: HELLO('m') });
    await ctx(p, ROOT + '/nf', 'New file here');
    await answer(p, 'extra.c');
    const text = await readText(p, ROOT + '/nf/extra.c');
    p.assert.doesNotMatch(text, /main/);
    p.assert.match(text, /#include <stdio.h>/);
  });
  t.test('New folder here makes a folder inside and unfolds it', async (p) => {
    await put(p, { [ROOT + '/nd']: null });
    await ctx(p, ROOT + '/nd', 'New folder here');
    p.assert.equal(await p.waitModal(), 'New folder');
    await answer(p, 'inner');
    p.assert.ok(await p.fn((x) => SEE.app.vfs.isDir(x), ROOT + '/nd/inner'));
    p.assert.ok(await p.exists(row(ROOT + '/nd/inner')));
    p.assert.equal(await p.attr(row(ROOT + '/nd/inner'), 'aria-expanded'), 'true');
  });
  t.test('Share this folder counts the files in it', async (p) => {
    await put(p, { [ROOT + '/sf/a.c']: HELLO('a'), [ROOT + '/sf/b.c']: '', [ROOT + '/sf/c.h']: '' });
    await ctx(p, ROOT + '/sf', 'Share this folder');
    p.assert.equal(await p.waitModal(), 'Share sf');
    p.assert.match(await p.modalText(), /these 3 files/);
    await p.closeModals();
  });
  t.test('Download as .zip hands over folder.zip', async (p) => {
    await stubDownload(p);
    await put(p, { [ROOT + '/zf/a.c']: 'aaa', [ROOT + '/zf/b.c']: 'bbbb' });
    await ctx(p, ROOT + '/zf', 'Download as .zip');
    const dl = await p.ev('window.__dl');
    p.assert.equal(dl[0].name, 'zf.zip');
    p.assert.equal(dl[0].type, 'application/zip');
    p.assert.equal(dl[0].size, 2 * 30 + 2 * 46 + 22 + 2 * 3 + 7 + 2 * 3);
  });
  t.test('Download as .zip of an empty folder says it is empty', async (p) => {
    await stubDownload(p);
    await put(p, { [ROOT + '/empty']: null });
    await ctx(p, ROOT + '/empty', 'Download as .zip');
    await p.waitToast(/That folder is empty/);
    p.assert.equal(await p.ev('window.__dl.length'), 0);
  });
  t.test('Share of an empty folder says there is nothing to share', async (p) => {
    await put(p, { [ROOT + '/empty']: null });
    await ctx(p, ROOT + '/empty', 'Share this folder');
    await p.waitToast(/Nothing to share there/);
    p.assert.equal(await p.modalOpen(), false);
  });
  t.test('Bring files here puts picked files in the folder', async (p) => {
    await put(p, { [ROOT + '/imp']: null });
    await p.ev("SEE.UI.pickFiles = async () => [new File(['int x;\\n'], 'brought.c'), new File(['abc'], 'data.txt')]; true");
    await ctx(p, ROOT + '/imp', 'Bring files here');
    await p.waitToast(/Brought in 2 files/);
    p.assert.equal(await readText(p, ROOT + '/imp/brought.c'), 'int x;\n');
    p.assert.equal(await readText(p, ROOT + '/imp/data.txt'), 'abc');
    p.assert.equal(await p.activePath(), ROOT + '/imp/data.txt');
  });
  t.test('Rename on a folder moves everything inside it', async (p) => {
    await put(p, { [ROOT + '/rf/a.c']: 'a', [ROOT + '/rf/sub/b.c']: 'b' });
    await ctx(p, ROOT + '/rf', 'Rename');
    await answer(p, 'rf2');
    p.assert.equal(await readText(p, ROOT + '/rf2/a.c'), 'a');
    p.assert.equal(await readText(p, ROOT + '/rf2/sub/b.c'), 'b');
    p.assert.equal(await exists(p, ROOT + '/rf'), false);
  });
  t.test('Delete on a folder warns about everything in it', async (p) => {
    await put(p, { [ROOT + '/df/a.c']: 'a', [ROOT + '/df/sub/b.c']: 'b' });
    await ctx(p, ROOT + '/df', 'Delete');
    await p.waitModal();
    p.assert.match(await p.modalText(), /and everything in it/);
    await p.modalButton('Delete');
    p.assert.equal(await exists(p, ROOT + '/df'), false);
    p.assert.equal(await exists(p, ROOT + '/df/sub/b.c'), false);
  });

  // ---- protections ----------------------------------------------------------------------------------------
  for (const dir of ['/home', '/home/user', '/tmp', '/usr', '/examples']) {
    t.test(`Rename and Delete are greyed out for ${dir}`, async (p) => {
      const m = await menuState(p, dir);
      p.assert.equal(m['Rename…'], true);
      p.assert.equal(m['Delete'], true);
      p.assert.equal(m['Share this folder as a link…'], false);
    });
    t.test(`${dir} cannot be renamed even when asked directly`, async (p) => {
      await p.ev(`SEE.Files.rename(SEE.app, '${dir}')`);
      await p.waitToast(/kept safe and cannot be renamed/);
      p.assert.equal(await p.modalOpen(), false);
      p.assert.ok(await exists(p, dir));
    });
    t.test(`${dir} cannot be deleted even when asked directly`, async (p) => {
      await p.ev(`SEE.Files.remove(SEE.app, '${dir}')`);
      await p.waitToast(/kept safe and cannot be deleted/);
      p.assert.equal(await p.modalOpen(), false);
      p.assert.ok(await exists(p, dir));
    });
  }
  for (const [dir, off] of [['/usr', true], ['/examples', true], ['/tmp', false], ['/home/user', false]]) {
    t.test(`New file here is ${off ? 'greyed out' : 'allowed'} for ${dir}`, async (p) => {
      const m = await menuState(p, dir);
      p.assert.equal(m['New file here'], off);
      p.assert.equal(m['New folder here'], off);
    });
  }
  t.test('a file inside /examples cannot be renamed or deleted from its menu', async (p) => {
    const m = await menuState(p, '/examples/hanoi/hanoi.c');
    p.assert.equal(m['Rename…'], true);
    p.assert.equal(m['Delete'], true);
    p.assert.equal(m['Duplicate'], false);
  });
  t.test('a header in /usr/include cannot be renamed or deleted', async (p) => {
    const m = await menuState(p, '/usr/include/stdio.h');
    p.assert.equal(m['Rename…'], true);
    p.assert.equal(m['Delete'], true);
    await fold(p, '/usr');
  });
  t.test('the Delete key on /tmp only shows a message', async (p) => {
    await p.ev(`document.querySelector('${row('/tmp')}').focus()`);
    await p.key('Delete');
    await p.waitToast(/kept safe/);
    p.assert.ok(await exists(p, '/tmp'));
  });
  t.test('F2 on /home/user only shows a message', async (p) => {
    await p.ev(`document.querySelector('${row('/home/user')}').focus()`);
    await p.key('F2');
    await p.waitToast(/kept safe and cannot be renamed/);
    p.assert.equal(await p.modalOpen(), false);
  });
  t.test('a program cannot write inside /examples or /usr', async (p) => {
    const r = await p.ev(`(() => { const out = []; for (const f of ['/examples/x.c', '/usr/include/x.h']) { try { SEE.app.vfs.writeText(f, 'x'); out.push('wrote'); } catch (e) { out.push(e.code); } } return out; })()`);
    p.assert.deepEqual(r, ['EACCES', 'EACCES']);
  });
  t.test('a new file typed with a path into /examples is refused', async (p) => {
    await p.click('#fNew');
    await answer(p, '/examples/mine.c');
    await p.waitToast(/Could not make that file/);
    p.assert.equal(await exists(p, '/examples/mine.c'), false);
  });

  // ---- new folders ------------------------------------------------------------------------------------------
  t.test('the New folder button makes a folder in the selected folder', async (p) => {
    await p.click(row(ROOT));
    await reveal(p, ROOT, true);
    await p.click('#fNewFolder');
    await p.waitModal();
    p.assert.equal(await p.ev("document.querySelector('.modal-back:last-child input').value"), 'my folder');
    await answer(p, 'tbdir');
    p.assert.ok(await p.fn((x) => SEE.app.vfs.isDir(x), ROOT + '/tbdir'));
  });
  t.test('a folder name already taken gives an error', async (p) => {
    await put(p, { [ROOT + '/taken']: null });
    await ctx(p, ROOT, 'New folder here');
    await answer(p, 'taken');
    await p.waitToast(/Could not make the folder/);
  });
  t.test('cancelling New folder makes nothing', async (p) => {
    const before = await p.ev(`SEE.app.vfs.list('${ROOT}').length`);
    await ctx(p, ROOT, 'New folder here');
    await p.waitModal();
    await p.modalButton('Cancel');
    p.assert.equal(await p.ev(`SEE.app.vfs.list('${ROOT}').length`), before);
  });
  t.test('a folder name with a bad character is refused', async (p) => {
    await ctx(p, ROOT, 'New folder here');
    await answer(p, 'a|b');
    await p.waitToast(/Could not make the folder/);
  });

  // ---- renaming open files ---------------------------------------------------------------------------------
  t.test('renaming an open file renames its tab', async (p) => {
    await p.newFile(ROOT + '/tabbed.c', HELLO('t'));
    await ctx(p, ROOT + '/tabbed.c', 'Rename');
    await answer(p, 'moved.c');
    p.assert.equal(await p.activePath(), ROOT + '/moved.c');
    p.assert.deepEqual(await p.texts('#tabs .tab .tname'), ['moved.c']);
    p.assert.equal(await p.attr('#tabs .tab', 'title'), ROOT + '/moved.c');
    p.assert.equal(await p.code(), HELLO('t'));
  });
  t.test('renaming an open file carries its breakpoints along', async (p) => {
    await p.newFile(ROOT + '/bp.c', '#include <stdio.h>\nint main(void)\n{\n    int a = 1;\n    a++;\n    printf("%d\\n", a);\n    return 0;\n}\n');
    await p.ev(`SEE.app.toggleBreakpoint('${ROOT}/bp.c', 4)`);
    await ctx(p, ROOT + '/bp.c', 'Rename');
    await answer(p, 'bp2.c');
    p.assert.deepEqual(await p.ev('[...SEE.app.breakpoints.keys()]'), [ROOT + '/bp2.c']);
    p.assert.deepEqual(await p.ev(`[...SEE.app.breakpoints.get('${ROOT}/bp2.c').keys()]`), [4]);
    p.assert.ok(JSON.parse(await p.ev("localStorage.getItem('see.breakpoints')"))[ROOT + '/bp2.c']);
  });
  t.test('a breakpoint still stops the program after its file was renamed', async (p) => {
    await p.newFile(ROOT + '/bpr/main.c', '#include <stdio.h>\nint main(void)\n{\n    int a = 1;\n    a++;\n    printf("%d\\n", a);\n    return 0;\n}\n');
    await p.ev(`SEE.app.toggleBreakpoint('${ROOT}/bpr/main.c', 5)`);
    await ctx(p, ROOT + '/bpr/main.c', 'Rename');
    await answer(p, 'prog.c');
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await p.cont();
    p.assert.equal(await p.state(), 'paused');
    p.assert.equal(await p.line(), 6);
    p.assert.equal(await p.cval('a'), 2);
    await p.stopProgram();
  });
  t.test('renaming a folder moves the open files and breakpoints inside it', async (p) => {
    await p.newFile(ROOT + '/proj/main.c', HELLO('p'));
    await p.ev(`SEE.app.toggleBreakpoint('${ROOT}/proj/main.c', 4)`);
    await ctx(p, ROOT + '/proj', 'Rename');
    await answer(p, 'proj2');
    p.assert.equal(await p.activePath(), ROOT + '/proj2/main.c');
    p.assert.deepEqual(await p.ev('[...SEE.app.breakpoints.keys()]'), [ROOT + '/proj2/main.c']);
  });
  t.test('the renamed file stays marked open in the tree', async (p) => {
    await p.newFile(ROOT + '/mark.c', HELLO('m'));
    await ctx(p, ROOT + '/mark.c', 'Rename');
    await answer(p, 'mark2.c');
    await p.ev('SEE.app.renderSide()');
    p.assert.ok(await p.exists(row(ROOT + '/mark2.c') + '.open'));
  });
  t.test('changes made before renaming an open file stay in its editor', async (p) => {
    await p.newFile(ROOT + '/chg.c', 'one\n');
    await p.setCode('two\n');
    await ctx(p, ROOT + '/chg.c', 'Rename');
    await answer(p, 'chg2.c');
    p.assert.equal(await p.code(), 'two\n');
    p.assert.equal(await p.ev('SEE.app.active.dirty'), true);
  });

  // ---- deleting folders with open files ---------------------------------------------------------------------
  t.test('deleting a folder closes the tabs of the files in it', async (p) => {
    await p.newFile(ROOT + '/del/a.c', HELLO('a'));
    await p.newFile(ROOT + '/del/sub/b.c', HELLO('b'));
    await p.newFile(ROOT + '/other.c', HELLO('o'));
    await ctx(p, ROOT + '/del', 'Delete');
    await p.waitModal();
    await p.modalButton('Delete');
    p.assert.deepEqual(await p.ev('SEE.app.docs.map(d => d.path)'), [ROOT + '/other.c']);
    p.assert.equal(await exists(p, ROOT + '/del'), false);
  });
  t.test('deleting a folder closes a changed file in it without asking to save', async (p) => {
    await p.newFile(ROOT + '/del/a.c', HELLO('a'));
    await p.setCode('changed\n');
    await ctx(p, ROOT + '/del', 'Delete');
    await p.waitModal();
    await p.modalButton('Delete');
    await p.sleep(100);
    p.assert.equal(await p.modalOpen(), false);
    p.assert.equal(await p.ev('SEE.app.docs.length'), 0);
    p.assert.equal(await exists(p, ROOT + '/del/a.c'), false);
  });
  t.test('after deleting every open file the editor says no file is open', async (p) => {
    await p.newFile(ROOT + '/del/a.c', HELLO('a'));
    await ctx(p, ROOT + '/del', 'Delete');
    await p.waitModal();
    await p.modalButton('Delete');
    p.assert.ok(await p.visible('.empty-editor'));
    p.assert.match(await p.text('.empty-editor'), /No file open/);
  });

  // ---- /usr/include --------------------------------------------------------------------------------------------
  t.test('/usr/include holds the 15 standard headers', async (p) => {
    await reveal(p, '/usr/include/x', false);
    const names = await p.ev(`[...document.querySelectorAll('#sideBody .trow')].map(r => r.dataset.path).filter(x => x.startsWith('/usr/include/')).map(x => x.slice(13))`);
    p.assert.deepEqual(names, HEADERS);
    await fold(p, '/usr');
  });
  t.test('/usr/lib holds libc.c', async (p) => {
    p.assert.ok(await exists(p, '/usr/lib/libc.c'));
    p.assert.ok((await readText(p, '/usr/lib/libc.c')).length > 100);
  });
  t.test('the system folder answers no to writing', async (p) => {
    p.assert.equal(await p.ev("SEE.app.vfs.canWrite('/usr/include/stdio.h')"), 'no');
    p.assert.equal(await p.ev("SEE.app.vfs.canWrite('/home/user/x.c')"), 'yes');
  });
  for (const hname of HEADERS) {
    t.test(`<${hname}> opens read-only from the tree`, async (p) => {
      await reveal(p, '/usr/include/' + hname);
      await p.click(row('/usr/include/' + hname));
      await p.wait(`SEE.app.active && SEE.app.active.path === '/usr/include/${hname}'`, 3000);
      p.assert.equal(await p.code(), await p.ev(`SEE.Headers.files['${hname}']`));
      p.assert.equal(await p.text('#tabs .tab.active .tro'), 'read-only');
      await fold(p, '/usr');
    });
  }

  // ---- /examples -------------------------------------------------------------------------------------------------
  const EXAMPLES = [
    ['swap', 'swap/swap.c', null, /after swap_pointed: a = \d+, b = \d+/, 'exited'],
    ['strings', 'strings/where.c', null, /addresses: /, 'exited'],
    ['const', 'const/const.c', null, /n=5 m=2 \*p=2 \*q=5 \*r=5 limit=10/, 'exited'],
    ['jagged', 'jagged/jagged.c', null, /\d+ \d+/, 'exited'],
    ['linked-list', 'linked-list/list.c', null, /-> NULL/, 'exited'],
    ['hanoi', 'hanoi/hanoi.c', null, /move disc 1 from [A-C] to [A-C][\s\S]*\d+ moves/, 'exited'],
    ['calculator', 'calculator/calc.c', '6 * 7\n10 / 4\n', /6 \* 7 = 42[\s\S]*10 \/ 4 = 2\.5/, 'exited'],
    ['stack-module', 'stack-module/main.c', null, /size 3\npopped 3\npopped 2\npopped 1/, 'exited'],
    ['notes', 'notes/notes.c', null, /1\. buy milk\n2\. learn pointers\n3\. call home/, 'exited'],
    ['off-by-one', 'off-by-one/bug.c', null, null, 'faulted'],
    ['guess', 'guess/guess.c', Array.from({ length: 100 }, (_, i) => i + 1).join('\n') + '\n', /yes! \d+ tries/, 'exited'],
    ['padding', 'padding/padding.c', null, /sizeof\(struct sample\) = \d+\noffsets: c 0, d \d+, s \d+/, 'exited'],
  ];
  t.test('/examples holds the twelve sample projects', async (p) => {
    const names = await p.ev("SEE.app.vfs.list('/examples').filter(x => x.type === 'dir').map(x => x.name)");
    p.assert.deepEqual(names.slice().sort(), EXAMPLES.map((x) => x[0]).sort());
  });
  t.test('every sample file on disk matches the original', async (p) => {
    const bad = await p.ev("Object.entries(SEE.SampleFiles).filter(([k, v]) => SEE.app.vfs.readText('/examples/' + k) !== v).map(x => x[0])");
    p.assert.deepEqual(bad, []);
  });
  t.test('stack-module holds main.c, stack.c and stack.h', async (p) => {
    p.assert.deepEqual(await p.ev("SEE.app.vfs.list('/examples/stack-module').map(x => x.name)"), ['main.c', 'stack.c', 'stack.h']);
  });
  t.test('an example opens with the read-only mark on its tab', async (p) => {
    await reveal(p, '/examples/hanoi/hanoi.c');
    await p.click(row('/examples/hanoi/hanoi.c'));
    await p.wait("SEE.app.active && SEE.app.active.path === '/examples/hanoi/hanoi.c'", 3000);
    p.assert.ok(await p.exists('#tabs .tab.active .tro'));
  });
  for (const [name, file, input, re, end] of EXAMPLES) {
    t.test(`the ${name} example runs`, async (p) => {
      await p.ev(`SEE.app.openFile('/examples/${file}')`);
      await p.ev('SEE.app.run()');
      if (input) {
        await p.waitState('input');
        await p.ev(`SEE.app.feedInput(${JSON.stringify(input)})`);
        if (name === 'calculator') { await p.waitOutput(/10 \/ 4 = 2\.5/); await p.ev('SEE.app.feedEOF()'); }
      }
      await p.waitState(end === 'faulted' ? ['faulted', 'exited'] : [end]);
      p.assert.equal(await p.state(), end);
      if (re) p.assert.match(await p.output(), re);
      if (end === 'exited') p.assert.match(await p.output(), /exited with status 0/);
      p.assert.deepEqual((await p.problems()).filter((x) => /^error/.test(x)), []);
      await p.stopProgram();
    }, { timeout: 40000 });
  }
  t.test('the notes example leaves its file in /tmp', async (p) => {
    await p.ev("SEE.app.openFile('/examples/notes/notes.c')");
    await p.ev('SEE.app.run()');
    await p.waitState('exited');
    p.assert.equal(await readText(p, '/tmp/notes.txt'), 'buy milk\nlearn pointers\ncall home\n');
  });

  // ---- the Open dialog ---------------------------------------------------------------------------------------------
  const openRows = (p) => p.texts('.modal-back:last-child .list-row .code');
  t.test('Ctrl+O opens the Open a file dialog', async (p) => {
    await p.key('o', { ctrl: true });
    p.assert.equal(await p.waitModal(), 'Open a file');
    p.assert.ok((await openRows(p)).length > 20);
    await p.closeModals();
  });
  t.test('the Open toolbar button opens the dialog', async (p) => {
    await p.click('#tbOpen');
    p.assert.equal(await p.waitModal(), 'Open a file');
    await p.closeModals();
  });
  t.test('File > Open opens the dialog', async (p) => {
    await p.menu('File', 'Open…');
    p.assert.equal(await p.waitModal(), 'Open a file');
    await p.closeModals();
  });
  t.test('the Open dialog puts the filter box in focus', async (p) => {
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.wait("document.activeElement && document.activeElement.getAttribute('aria-label') === 'Find a file'", 2000);
    await p.closeModals();
  });
  t.test('the Open dialog lists files under /usr last', async (p) => {
    await p.key('o', { ctrl: true });
    await p.waitModal();
    const rows = await openRows(p);
    const firstUsr = rows.findIndex((x) => x.startsWith('/usr'));
    p.assert.ok(firstUsr > 0);
    p.assert.ok(rows.slice(firstUsr).every((x) => x.startsWith('/usr')));
    await p.closeModals();
  });
  t.test('typing in the Open dialog narrows the list', async (p) => {
    await put(p, { [ROOT + '/findme-one.c']: '', [ROOT + '/findme-two.h']: '' });
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.type('findme');
    p.assert.deepEqual(await openRows(p), [ROOT + '/findme-one.c', ROOT + '/findme-two.h']);
    await p.closeModals();
  });
  t.test('the Open filter ignores case', async (p) => {
    await put(p, { [ROOT + '/MixedCase.c']: '' });
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.modalInput('mixedcase');
    p.assert.deepEqual(await openRows(p), [ROOT + '/MixedCase.c']);
    await p.closeModals();
  });
  t.test('a filter that matches nothing says so', async (p) => {
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.modalInput('no-such-file-anywhere');
    p.assert.match(await p.modalText(), /Nothing matches\./);
    await p.closeModals();
  });
  t.test('Enter in the Open filter opens the first match', async (p) => {
    await put(p, { [ROOT + '/entered.c']: HELLO('x') });
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.type('entered.c');
    await p.key('Enter');
    await p.wait('!document.querySelector(".modal-back")', 2000);
    p.assert.equal(await p.activePath(), ROOT + '/entered.c');
  });
  t.test('clicking a row in the Open dialog opens that file', async (p) => {
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.modalInput('stack.h');
    await p.click('.modal-back:last-child .list-row', '/examples/stack-module/stack.h');
    await p.wait('!document.querySelector(".modal-back")', 2000);
    p.assert.equal(await p.activePath(), '/examples/stack-module/stack.h');
  });
  t.test('Escape closes the Open dialog without opening anything', async (p) => {
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.key('Escape');
    await p.wait('!document.querySelector(".modal-back")', 2000);
    p.assert.equal(await p.ev('SEE.app.docs.length'), 0);
  });
  t.test('the Open dialog lists only text files', async (p) => {
    await put(p, { [ROOT + '/image.png']: 'x', [ROOT + '/text.txt']: 'x' });
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.modalInput(ROOT);
    p.assert.deepEqual(await openRows(p), [ROOT + '/text.txt']);
    await p.closeModals();
  });
  t.test('From my computer in the Open dialog brings a file in', async (p) => {
    await p.click(row(ROOT));
    await reveal(p, ROOT, true);
    await p.ev("SEE.UI.pickFiles = async () => [new File(['hi'], 'fromdisk.txt')]; true");
    await p.key('o', { ctrl: true });
    await p.waitModal();
    await p.modalButton('From my computer');
    await p.waitToast(/Brought in 1 file\b/);
    p.assert.equal(await readText(p, ROOT + '/fromdisk.txt'), 'hi');
  });

  // ---- disk usage note --------------------------------------------------------------------------------------------
  t.test('the Files panel says where files live and how much is used', async (p) => {
    const note = await p.text('#sideBody .side-note');
    p.assert.match(note, /Your files live in this browser\. \d+ KB used\. Right-click/);
  });
  t.test('the disk usage grows when a large file is written', async (p) => {
    const kb = async () => +(/(\d+) KB used/.exec(await p.text('#sideBody .side-note'))[1]);
    const before = await kb();
    await put(p, { [ROOT + '/big.txt']: 'x'.repeat(100 * 1024) });
    const after = await kb();
    p.assert.ok(after - before >= 99 && after - before <= 101, before + ' -> ' + after);
  });

  // ---- keyboard in the tree -----------------------------------------------------------------------------------------
  t.test('ArrowDown moves focus to the next row', async (p) => {
    await put(p, { [ROOT + '/k1.c']: '', [ROOT + '/k2.c']: '' });
    await p.ev(`document.querySelector('${row(ROOT + '/k1.c')}').focus()`);
    await p.key('ArrowDown');
    p.assert.equal(await p.ev('document.activeElement.dataset.path'), ROOT + '/k2.c');
  });
  t.test('ArrowUp moves focus to the row above', async (p) => {
    await put(p, { [ROOT + '/k1.c']: '', [ROOT + '/k2.c']: '' });
    await p.ev(`document.querySelector('${row(ROOT + '/k2.c')}').focus()`);
    await p.key('ArrowUp');
    p.assert.equal(await p.ev('document.activeElement.dataset.path'), ROOT + '/k1.c');
  });
  t.test('Home goes to the first row and End to the last', async (p) => {
    await p.ev(`document.querySelector('${row('/tmp')}').focus()`);
    await p.key('Home');
    const first = await p.ev("document.querySelector('#sideBody .trow').dataset.path");
    p.assert.equal(await p.ev('document.activeElement.dataset.path'), first);
    await p.key('End');
    const last = await p.ev("[...document.querySelectorAll('#sideBody .trow')].pop().dataset.path");
    p.assert.equal(await p.ev('document.activeElement.dataset.path'), last);
  });
  t.test('ArrowUp on the first row stays there', async (p) => {
    await p.ev("document.querySelector('#sideBody .trow').focus()");
    const first = await p.ev('document.activeElement.dataset.path');
    await p.key('ArrowUp');
    p.assert.equal(await p.ev('document.activeElement.dataset.path'), first);
  });
  t.test('ArrowRight then ArrowDown steps into a folder', async (p) => {
    await put(p, { [ROOT + '/kd/child.c']: '' });
    await p.ev(`document.querySelector('${row(ROOT + '/kd')}').focus()`);
    await p.key('ArrowRight');
    await p.key('ArrowDown');
    p.assert.equal(await p.ev('document.activeElement.dataset.path'), ROOT + '/kd/child.c');
  });
  t.test('walking the tree with the keyboard and Enter opens a file', async (p) => {
    await put(p, { [ROOT + '/kw/walk.c']: HELLO('w') });
    await p.ev(`document.querySelector('${row(ROOT)}').focus()`);
    await p.key('ArrowDown');
    await p.key('ArrowRight');
    await p.key('ArrowDown');
    await p.key('Enter');
    p.assert.equal(await p.activePath(), ROOT + '/kw/walk.c');
  });
  t.test('tree rows can be reached with Tab', async (p) => {
    p.assert.equal(await p.attr(row('/tmp'), 'tabindex'), '0');
  });

  // ---- projects of several files -------------------------------------------------------------------------------------------
  const PROJ = {
    [ROOT + '/calc/main.c']: '#include <stdio.h>\n#include "ops.h"\nint main(void)\n{\n    printf("sum %d prod %d\\n", add(3, 4), mul(3, 4));\n    return 0;\n}\n',
    [ROOT + '/calc/ops.c']: '#include "ops.h"\nint add(int a, int b)\n{\n    return a + b;\n}\nint mul(int a, int b)\n{\n    return a * b;\n}\n',
    [ROOT + '/calc/ops.h']: '#ifndef OPS_H\n#define OPS_H\nint add(int a, int b);\nint mul(int a, int b);\n#endif\n',
  };
  t.test('a folder with two .c files and a .h builds as one program', async (p) => {
    await put(p, PROJ);
    await p.ev(`SEE.app.openFile('${ROOT}/calc/main.c')`);
    await p.ev('SEE.app.run()');
    await p.waitState('exited');
    p.assert.match(await p.output(), /sum 7 prod 12/);
    p.assert.deepEqual(await p.ev('SEE.app.projectFiles().files.map(f => f.path)'), [ROOT + '/calc/main.c', ROOT + '/calc/ops.c']);
  });
  t.test('running from the second .c file runs the same program', async (p) => {
    await put(p, PROJ);
    await reveal(p, ROOT + '/calc/ops.c');
    await ctx(p, ROOT + '/calc/ops.c', 'Run its folder');
    await p.waitState('exited');
    p.assert.match(await p.output(), /sum 7 prod 12/);
  });
  t.test('running from the header runs the program of its folder', async (p) => {
    await put(p, PROJ);
    await ctx(p, ROOT + '/calc/ops.h', 'Run its folder');
    await p.waitState('exited');
    p.assert.match(await p.output(), /sum 7 prod 12/);
  });
  t.test('stepping into a function in the other file opens that file', async (p) => {
    await put(p, PROJ);
    await p.ev(`SEE.app.openFile('${ROOT}/calc/main.c')`);
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    await p.step('into');
    p.assert.ok(['add', 'mul'].includes(await p.fnName()));
    p.assert.equal(await p.activePath(), ROOT + '/calc/ops.c');
    await p.stopProgram();
  });
  t.test('without the second .c file the program does not link', async (p) => {
    const files = Object.assign({}, PROJ);
    delete files[ROOT + '/calc/ops.c'];
    await put(p, files);
    await p.ev(`SEE.app.openFile('${ROOT}/calc/main.c')`);
    await p.build();
    await p.wait('SEE.app.problems.length > 0', 8000);
    p.assert.match((await p.problems()).join('\n'), /add|mul/);
  });
}
