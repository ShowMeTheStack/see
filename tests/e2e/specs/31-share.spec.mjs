// Sharing programs: the Share dialog, share codes and links, opening a shared program, .zip
// downloads, and the dialog for folders from the computer.
const ROOT = '/home/user/s31';
const MAIN = '#include <stdio.h>\n#include "util.h"\nint main(void)\n{\n    printf("twice %d\\n", twice(21));\n    return 0;\n}\n';
const UTIL_C = '#include "util.h"\nint twice(int n)\n{\n    return n * 2;\n}\n';
const UTIL_H = '#ifndef UTIL_H\n#define UTIL_H\nint twice(int n);\n#endif\n';

const put = (p, files) => p.fn((files) => {
  const v = SEE.app.vfs;
  for (const [path, text] of Object.entries(files)) {
    v.mkdir(path.replace(/\/[^/]*$/, ''), { parents: true, exist: true, trusted: true });
    if (text === null) v.mkdir(path, { exist: true, trusted: true });
    else v.writeText(path, text, { trusted: true });
  }
  SEE.app.renderSide();
}, files);
const project = (p, dir = ROOT + '/proj') => put(p, { [dir + '/main.c']: MAIN, [dir + '/util.c']: UTIL_C, [dir + '/util.h']: UTIL_H });
/** Pack {rel: text} in the page; returns the code */
const pack = (p, meta, files) => p.fn(async (meta, files) => {
  const f = {};
  for (const [k, v] of Object.entries(files)) f[k] = new TextEncoder().encode(v);
  return SEE.Share.pack(meta, f);
}, meta, files);
/** Unpack in the page; returns {meta, files: {rel: text}} or {error} */
const unpack = (p, code) => p.fn(async (code) => {
  try {
    const r = await SEE.Share.unpack(code);
    const files = {};
    for (const [k, v] of Object.entries(r.files)) files[k] = new TextDecoder().decode(v);
    return { meta: r.meta, files };
  } catch (e) { return { error: e.message }; }
}, code);
const exists = (p, path) => p.fn((path) => SEE.app.vfs.exists(path), path);
const readText = (p, path) => p.fn((path) => SEE.app.vfs.readText(path), path);
const stubDownload = (p) => p.ev("window.__dl = []; SEE.UI.download = (name, data, type) => { window.__dl.push({ name, type, bytes: Array.from(data) }); }; true");
const stubClipboard = (p, ok = true) => p.ev(`window.__clip = []; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t) => { ${ok ? 'window.__clip.push(t);' : "throw new Error('denied');"} } } }); true`);
/** Parse a zip in node: local headers, central directory, end record */
function parseZip(bytes) {
  const b = Buffer.from(bytes);
  const local = [];
  let o = 0;
  while (b.readUInt32LE(o) === 0x04034b50) {
    const flags = b.readUInt16LE(o + 6), method = b.readUInt16LE(o + 8), crc = b.readUInt32LE(o + 14);
    const csize = b.readUInt32LE(o + 18), size = b.readUInt32LE(o + 22), nlen = b.readUInt16LE(o + 26), xlen = b.readUInt16LE(o + 28);
    const name = b.slice(o + 30, o + 30 + nlen).toString('utf8');
    const data = b.slice(o + 30 + nlen + xlen, o + 30 + nlen + xlen + csize);
    local.push({ offset: o, flags, method, crc, csize, size, name, data });
    o += 30 + nlen + xlen + csize;
  }
  const cdStart = o;
  const central = [];
  while (b.readUInt32LE(o) === 0x02014b50) {
    const nlen = b.readUInt16LE(o + 28);
    central.push({ crc: b.readUInt32LE(o + 16), size: b.readUInt32LE(o + 24), offset: b.readUInt32LE(o + 42), name: b.slice(o + 46, o + 46 + nlen).toString('utf8') });
    o += 46 + nlen;
  }
  const end = { sig: b.readUInt32LE(o), count: b.readUInt16LE(o + 8), total: b.readUInt16LE(o + 10), cdSize: b.readUInt32LE(o + 12), cdOffset: b.readUInt32LE(o + 16), length: b.length - o };
  return { local, central, end, cdStart };
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const x of buf) { c ^= x; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; }
  return (c ^ 0xffffffff) >>> 0;
}
const zipOf = (p, files) => p.fn((files) => { const f = {}; for (const [k, v] of Object.entries(files)) f[k] = new TextEncoder().encode(v); return Array.from(SEE.Zip.create(f)); }, files);

export default function (t) {
  t.beforeEach(async (p) => {
    await p.closeModals();
    await p.closeMenus();
    await p.ev(`(async () => {
      const a = SEE.app;
      if (a.vm) a.stop();
      for (const d of a.docs.slice()) { d.dirty = false; await a.closeDoc(d); }
      for (const x of ['${ROOT}', '/home/user/shared']) { try { a.vfs.rmdir(x, { recursive: true, trusted: true }); } catch (e) {} }
      a.vfs.mkdir('${ROOT}', { parents: true, trusted: true });
      a.renderSide();
      document.querySelectorAll('.toast').forEach(t => t.remove());
      return true;
    })()`);
  });

  // ---- the Share dialog ---------------------------------------------------------------------------------
  t.test('the Share toolbar button shares the project of the open file', async (p) => {
    await project(p);
    await p.ev(`SEE.app.openFile('${ROOT}/proj/main.c')`);
    await p.click('#tbShare');
    p.assert.equal(await p.waitModal(), 'Share proj');
    p.assert.match(await p.modalText(), /these 3 files/);
  });
  t.test('File > Share this project opens the Share dialog', async (p) => {
    await project(p);
    await p.ev(`SEE.app.openFile('${ROOT}/proj/util.c')`);
    await p.menu('File', 'Share this project as a link');
    p.assert.equal(await p.waitModal(), 'Share proj');
  });
  t.test('Share this project is greyed out with no file open', async (p) => {
    await p.menu('File');
    const it = (await p.menuItems()).find((x) => /Share this project/.test(x.label));
    p.assert.equal(it.disabled, true);
    await p.closeMenus();
  });
  t.test('the Share dialog has a link field and a code field', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    p.assert.ok(await p.visible('#shareLink'));
    p.assert.ok(await p.visible('#shareCode'));
    p.assert.equal(await p.attr('#shareLink', 'readonly'), '');
    p.assert.equal(await p.attr('#shareCode', 'readonly'), '');
    p.assert.match(await p.modalText(), /Link[\s\S]*Or this code \(paste it into Open a shared program\)/);
  });
  t.test('the link is this page with #share= and the code', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    const link = await p.ev("document.getElementById('shareLink').value");
    const code = await p.ev("document.getElementById('shareCode').value");
    p.assert.match(code, /^SEE1\.[zr][A-Za-z0-9_-]+$/);
    p.assert.equal(link, await p.ev('location.origin + location.pathname') + '#share=' + code);
  });
  t.test('the Share dialog shows the size of the link in KB', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    const link = await p.ev("document.getElementById('shareLink').value");
    p.assert.equal(await p.text('.modal-back:last-child .hint'), (link.length / 1024).toFixed(1) + ' KB');
  });
  t.test('a bigger project makes a longer link', async (p) => {
    await project(p);
    const len = async () => {
      await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
      await p.waitModal();
      const n = await p.ev("document.getElementById('shareLink').value.length");
      await p.closeModals();
      return n;
    };
    const small = await len();
    let big = '';
    for (let i = 0; i < 400; i++) big += `int f${i}(void) { return ${i * 7919 % 1000}; }\n`;
    await put(p, { [ROOT + '/proj/more.c']: big });
    p.assert.ok((await len()) > small + 1000);
  });
  t.test('the code in the dialog unpacks to the files of the project', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    const r = await unpack(p, await p.ev("document.getElementById('shareCode').value"));
    p.assert.deepEqual(r.files, { 'main.c': MAIN, 'util.c': UTIL_C, 'util.h': UTIL_H });
    p.assert.equal(r.meta.name, 'proj');
    p.assert.equal(r.meta.lang, 'c89');
  });
  t.test('the shared main file is the file that was open', async (p) => {
    await project(p);
    await p.ev(`SEE.app.openFile('${ROOT}/proj/util.c')`);
    await p.click('#tbShare');
    await p.waitModal();
    const r = await unpack(p, await p.ev("document.getElementById('shareCode').value"));
    p.assert.equal(r.meta.main, 'util.c');
  });
  t.test('sharing one file says this program and names it after the file', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj/util.c'), true)`);
    p.assert.equal(await p.waitModal(), 'Share util');
    p.assert.match(await p.modalText(), /this program/);
    const r = await unpack(p, await p.ev("document.getElementById('shareCode').value"));
    p.assert.deepEqual(Object.keys(r.files), ['util.c']);
    p.assert.equal(r.meta.main, 'util.c');
  });
  t.test('unsaved changes in an open file are shared', async (p) => {
    await project(p);
    await p.ev(`SEE.app.openFile('${ROOT}/proj/main.c')`);
    await p.setCode('/* edited */\n');
    await p.click('#tbShare');
    await p.waitModal();
    const r = await unpack(p, await p.ev("document.getElementById('shareCode').value"));
    p.assert.equal(r.files['main.c'], '/* edited */\n');
  });
  t.test('files in subfolders are shared with their folder in the name', async (p) => {
    await put(p, { [ROOT + '/deep/main.c']: MAIN, [ROOT + '/deep/lib/util.c']: UTIL_C });
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/deep'), true)`);
    await p.waitModal();
    const r = await unpack(p, await p.ev("document.getElementById('shareCode').value"));
    p.assert.deepEqual(Object.keys(r.files).sort(), ['lib/util.c', 'main.c']);
  });
  t.test('the link is selected when the dialog opens', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    await p.sleep(60);
    p.assert.equal(await p.ev("document.activeElement.id"), 'shareLink');
    p.assert.equal(await p.ev("(() => { const l = document.getElementById('shareLink'); return l.selectionEnd - l.selectionStart === l.value.length; })()"), true);
  });
  t.test('Copy link puts the link on the clipboard', async (p) => {
    await stubClipboard(p);
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    await p.modalButton('Copy link');
    await p.waitToast(/Link copied/);
    p.assert.deepEqual(await p.ev('window.__clip'), [await p.ev("document.getElementById('shareLink').value")]);
    p.assert.ok(await p.modalOpen(), 'the dialog stays open');
  });
  t.test('Copy code puts the code on the clipboard', async (p) => {
    await stubClipboard(p);
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    await p.modalButton('Copy code');
    await p.waitToast(/Code copied/);
    p.assert.deepEqual(await p.ev('window.__clip'), [await p.ev("document.getElementById('shareCode').value")]);
  });
  t.test('when copying is refused the dialog says to copy by hand', async (p) => {
    await stubClipboard(p, false);
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    await p.modalButton('Copy link');
    await p.waitToast(/Select it and copy it yourself/);
  });
  t.test('Close shuts the Share dialog', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    await p.modalButton('Close');
    p.assert.equal(await p.modalOpen(), false);
  });
  t.test('Escape shuts the Share dialog', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    await p.key('Escape');
    await p.waitGone('.modal-back', 2000);
  });
  t.test('the Share dialog says nothing is uploaded', async (p) => {
    await project(p);
    await p.ev(`(SEE.Files.shareDialog(SEE.app, '${ROOT}/proj'), true)`);
    await p.waitModal();
    p.assert.match(await p.modalText(), /Everything is inside the link itself; nothing is uploaded\./);
  });

  // ---- share codes -----------------------------------------------------------------------------------------
  t.test('a packed code is compressed and URL safe', async (p) => {
    const code = await pack(p, { name: 'x' }, { 'a.c': 'int a;\n'.repeat(50) });
    p.assert.match(code, /^SEE1\.z[A-Za-z0-9_-]+$/);
    p.assert.ok(code.length < 'int a;\n'.repeat(50).length);
  });
  t.test('pack then unpack gives back the same files and meta', async (p) => {
    const files = { 'main.c': MAIN, 'util.c': UTIL_C, 'util.h': UTIL_H, 'data/in.txt': '1 2 3\n' };
    const meta = { name: 'proj', main: 'main.c', lang: 'c89' };
    const r = await unpack(p, await pack(p, meta, files));
    p.assert.deepEqual(r.files, files);
    p.assert.deepEqual(r.meta, meta);
  });
  t.test('binary bytes survive a round trip', async (p) => {
    const ok = await p.ev(`(async () => {
      const bytes = new Uint8Array(256); for (let i = 0; i < 256; i++) bytes[i] = i;
      const r = await SEE.Share.unpack(await SEE.Share.pack({ name: 'b' }, { 'all.bin': bytes }));
      return r.files['all.bin'].length === 256 && r.files['all.bin'].every((x, i) => x === i);
    })()`);
    p.assert.equal(ok, true);
  });
  t.test('non-ASCII names and text survive a round trip', async (p) => {
    const files = { 'café/naïve.c': '/* größe — ünïcode ✓ */\n' };
    const r = await unpack(p, await pack(p, { name: 'ünï' }, files));
    p.assert.deepEqual(r.files, files);
    p.assert.equal(r.meta.name, 'ünï');
  });
  t.test('an empty file survives a round trip', async (p) => {
    const r = await unpack(p, await pack(p, { name: 'e' }, { 'empty.c': '' }));
    p.assert.deepEqual(r.files, { 'empty.c': '' });
  });
  t.test('unpack takes a whole link', async (p) => {
    const code = await pack(p, { name: 'l' }, { 'a.c': 'x' });
    const r = await unpack(p, 'https://example.org/see/index.html#share=' + code);
    p.assert.deepEqual(r.files, { 'a.c': 'x' });
  });
  t.test('unpack ignores spaces and new lines around the code', async (p) => {
    const code = await pack(p, { name: 'l' }, { 'a.c': 'x' });
    const r = await unpack(p, '\n   ' + code + '  \n');
    p.assert.deepEqual(r.files, { 'a.c': 'x' });
  });
  t.test('unpack reads an uncompressed SEE1.r code', async (p) => {
    const code = await p.ev(`'SEE1.r' + btoa(JSON.stringify({ v: 1, meta: { name: 'raw' }, files: { 'r.c': btoa('raw text').replace(/=+$/, '') } })).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')`);
    const r = await unpack(p, code);
    p.assert.deepEqual(r.files, { 'r.c': 'raw text' });
    p.assert.equal(r.meta.name, 'raw');
  });
  const rawCode = (obj) => 'SEE1.r' + Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64 = (s) => Buffer.from(s).toString('base64').replace(/=+$/, '');
  const BAD = [
    ['plain words', 'hello there', /does not look like a See share code/],
    ['an empty string', '', /does not look like a See share code/],
    ['a code from another program', 'XYZ1.zabcdef', /does not look like a See share code/],
    ['a code cut short', null, /damaged or incomplete/],
    ['a code with garbage inside', 'SEE1.zAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', /damaged or incomplete/],
    ['a raw code that is not JSON', 'SEE1.r' + b64('not json'), /damaged or incomplete/],
    ['a newer version', rawCode({ v: 2, files: { 'a.c': b64('x') } }), /Unsupported share code version/],
    ['a code without files', rawCode({ v: 1, meta: {} }), /Unsupported share code version/],
    ['a code with no files in it', rawCode({ v: 1, meta: {}, files: {} }), /has no files in it/],
    ['a path that climbs out with ..', rawCode({ v: 1, files: { '../evil.c': b64('x') } }), /Unsafe path in share code: \.\.\/evil\.c/],
    ['a path with .. in the middle', rawCode({ v: 1, files: { 'a/../../evil.c': b64('x') } }), /Unsafe path/],
    ['an absolute path', rawCode({ v: 1, files: { '/etc/passwd': b64('x') } }), /Unsafe path/],
    ['a drive letter path', rawCode({ v: 1, files: { 'C:/evil.c': b64('x') } }), /Unsafe path/],
    ['a backslash path', rawCode({ v: 1, files: { '\\evil.c': b64('x') } }), /Unsafe path/],
  ];
  for (const [what, code, re] of BAD) {
    t.test(`unpack refuses ${what}`, async (p) => {
      let c = code;
      if (c === null) { const full = await pack(p, { name: 'cut' }, { 'a.c': MAIN + UTIL_C }); c = full.slice(0, Math.floor(full.length / 2)); }
      const r = await unpack(p, c);
      p.assert.ok(r.error, 'should fail');
      p.assert.match(r.error, re);
    });
  }

  // ---- links opened in a fresh page --------------------------------------------------------------------------
  const sharedPage = async (p, meta, files) => {
    const code = await pack(p, meta, files);
    await p.fresh({ hash: 'share=' + code });
    await p.wait('SEE.app.vfs.exists("/home/user/shared")', 5000);
    return code;
  };
  t.test('a share link puts the files in /home/user/shared/<name>', async (p) => {
    await sharedPage(p, { name: 'twice', main: 'main.c', lang: 'c89' }, { 'main.c': MAIN, 'util.c': UTIL_C, 'util.h': UTIL_H });
    p.assert.deepEqual(await p.ev("SEE.app.vfs.list('/home/user/shared/twice').map(x => x.name)"), ['main.c', 'util.c', 'util.h']);
    p.assert.equal(await readText(p, '/home/user/shared/twice/util.h'), UTIL_H);
  }, { timeout: 40000 });
  t.test('a share link opens the main file', async (p) => {
    await sharedPage(p, { name: 'twice', main: 'util.c' }, { 'main.c': MAIN, 'util.c': UTIL_C, 'util.h': UTIL_H });
    await p.wait("SEE.app.active && SEE.app.active.path === '/home/user/shared/twice/util.c'", 3000);
    p.assert.equal(await p.code(), UTIL_C);
  }, { timeout: 40000 });
  t.test('a share link without a main opens the first text file', async (p) => {
    await sharedPage(p, { name: 'nomain' }, { 'pic.png': 'xx', 'readme.txt': 'read me\n' });
    await p.wait("SEE.app.active && SEE.app.active.path === '/home/user/shared/nomain/readme.txt'", 3000);
  }, { timeout: 40000 });
  t.test('a share link removes #share= from the address', async (p) => {
    await sharedPage(p, { name: 'h' }, { 'a.c': 'x' });
    await p.wait("!location.hash.includes('share=')", 3000);
  }, { timeout: 40000 });
  t.test('a share link says where the copy went', async (p) => {
    await sharedPage(p, { name: 'told' }, { 'a.c': 'x' });
    await p.waitToast(/Opened your copy in \/home\/user\/shared\/told/);
  }, { timeout: 40000 });
  t.test('a share link unfolds its folder in the tree', async (p) => {
    await sharedPage(p, { name: 'shown', main: 'main.c' }, { 'main.c': MAIN });
    await p.wait("!!document.querySelector('#sideBody .trow[data-path=\"/home/user/shared/shown/main.c\"]')", 3000);
  }, { timeout: 40000 });
  t.test('a share link keeps subfolders', async (p) => {
    await sharedPage(p, { name: 'nest', main: 'main.c' }, { 'main.c': MAIN, 'src/util.c': UTIL_C });
    p.assert.equal(await readText(p, '/home/user/shared/nest/src/util.c'), UTIL_C);
  }, { timeout: 40000 });
  t.test('the program from a share link builds and runs', async (p) => {
    await sharedPage(p, { name: 'runs', main: 'main.c' }, { 'main.c': MAIN, 'util.c': UTIL_C, 'util.h': UTIL_H });
    await p.wait("SEE.app.active && SEE.app.active.path === '/home/user/shared/runs/main.c'", 3000);
    await p.ev('SEE.app.run()');
    await p.waitState('exited');
    p.assert.match(await p.output(), /twice 42/);
  }, { timeout: 40000 });
  t.test('a share link on a first visit skips the welcome', async (p) => {
    const code = await pack(p, { name: 'first' }, { 'a.c': 'x' });
    await p.fresh({ hash: 'share=' + code, firstRun: true });
    await p.sleep(800);
    p.assert.equal(await p.modalOpen(), false);
    p.assert.equal(await p.exists('#tourPop'), false);
    p.assert.ok(await exists(p, '/home/user/shared/first/a.c'));
  }, { timeout: 40000 });
  t.test('a damaged share link shows an error and keeps the page working', async (p) => {
    await p.fresh({ hash: 'share=SEE1.zAAAA' });
    await p.waitToast(/damaged or incomplete/);
    p.assert.equal(await exists(p, '/home/user/shared'), false);
    p.assert.ok(await p.visible('#tbRun'));
  }, { timeout: 40000 });
  t.test('a name with odd characters becomes a safe folder name', async (p) => {
    await p.ev(`(async () => SEE.Files.importShare(SEE.app, await SEE.Share.pack({ name: 'a:b*c?' }, { 'x.c': new TextEncoder().encode('x') })))()`);
    await p.wait("SEE.app.vfs.exists('/home/user/shared/a_b_c_/x.c')", 3000);
  });
  t.test('a share with no name lands in /home/user/shared/shared', async (p) => {
    await p.ev(`(async () => SEE.Files.importShare(SEE.app, await SEE.Share.pack({}, { 'x.c': new TextEncoder().encode('x') })))()`);
    await p.wait("SEE.app.vfs.exists('/home/user/shared/shared/x.c')", 3000);
  });
  t.test('opening the same share twice makes name-2', async (p) => {
    const code = await pack(p, { name: 'twin', main: 'a.c' }, { 'a.c': 'one' });
    await p.fn((c) => SEE.Files.importShare(SEE.app, c), code);
    await p.fn((c) => SEE.Files.importShare(SEE.app, c), code);
    await p.wait("SEE.app.vfs.exists('/home/user/shared/twin-2/a.c')", 3000);
    p.assert.ok(await exists(p, '/home/user/shared/twin/a.c'));
    p.assert.equal(await p.activePath(), '/home/user/shared/twin-2/a.c');
  });

  // ---- Open a shared program --------------------------------------------------------------------------------
  t.test('File > Open a shared program shows a box for the code', async (p) => {
    await p.menu('File', 'Open a shared program');
    p.assert.equal(await p.waitModal(), 'Open a shared program');
    p.assert.ok(await p.visible('#importCode'));
    p.assert.equal(await p.attr('#importCode', 'placeholder'), 'Paste a See link or share code here');
  });
  t.test('a pasted code opens the program', async (p) => {
    const code = await pack(p, { name: 'pasted', main: 'main.c' }, { 'main.c': MAIN, 'util.c': UTIL_C, 'util.h': UTIL_H });
    await p.menu('File', 'Open a shared program');
    await p.waitModal();
    await p.modalInput(code);
    await p.modalButton('Open');
    await p.wait("SEE.app.active && SEE.app.active.path === '/home/user/shared/pasted/main.c'", 3000);
    p.assert.equal(await readText(p, '/home/user/shared/pasted/util.c'), UTIL_C);
    await p.waitToast(/Opened your copy/);
  });
  t.test('a pasted link opens the program', async (p) => {
    const code = await pack(p, { name: 'linked', main: 'a.c' }, { 'a.c': 'int x;\n' });
    await p.menu('File', 'Open a shared program');
    await p.waitModal();
    await p.modalInput('https://see.example/#share=' + code);
    await p.modalButton('Open');
    await p.wait("SEE.app.active && SEE.app.active.path === '/home/user/shared/linked/a.c'", 3000);
  });
  t.test('a code typed into the box opens the program', async (p) => {
    const code = await pack(p, { name: 'typed', main: 'a.c' }, { 'a.c': 'x' });
    await p.menu('File', 'Open a shared program');
    await p.waitModal();
    await p.insertText(code);
    await p.modalButton('Open');
    await p.wait("SEE.app.vfs.exists('/home/user/shared/typed/a.c')", 3000);
  });
  t.test('Cancel in Open a shared program does nothing', async (p) => {
    const code = await pack(p, { name: 'nope' }, { 'a.c': 'x' });
    await p.menu('File', 'Open a shared program');
    await p.waitModal();
    await p.modalInput(code);
    await p.modalButton('Cancel');
    await p.sleep(150);
    p.assert.equal(await exists(p, '/home/user/shared/nope'), false);
  });
  t.test('Open with an empty box does nothing', async (p) => {
    await p.menu('File', 'Open a shared program');
    await p.waitModal();
    await p.modalButton('Open');
    await p.sleep(150);
    p.assert.equal(await p.modalOpen(), false);
    p.assert.equal(await p.count('.toast.err'), 0);
  });
  for (const [what, code, re] of [
    ['words', 'please open this', /does not look like a See share code/],
    ['a link without a code', 'https://see.example/#share=', /does not look like a See share code/],
    ['a damaged code', 'SEE1.zAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', /damaged or incomplete/],
    ['an unsafe code', rawCode({ v: 1, files: { '../x.c': b64('x') } }), /Unsafe path/],
    ['an empty code', rawCode({ v: 1, files: {} }), /has no files in it/],
    ['a future version', rawCode({ v: 9, files: { 'a.c': b64('x') } }), /Unsupported share code version/],
  ]) {
    t.test(`pasting ${what} shows an error toast`, async (p) => {
      await p.menu('File', 'Open a shared program');
      await p.waitModal();
      await p.modalInput(code);
      await p.modalButton('Open');
      await p.waitToast(re);
      p.assert.ok(await p.exists('.toast.err'));
      p.assert.equal(await exists(p, '/home/user/shared'), false);
    });
  }

  // ---- .zip downloads ----------------------------------------------------------------------------------------
  t.test('File > Download this project as .zip hands over folder.zip', async (p) => {
    await stubDownload(p);
    await project(p);
    await p.ev(`SEE.app.openFile('${ROOT}/proj/main.c')`);
    await p.menu('File', 'Download this project as .zip');
    const dl = await p.ev('window.__dl');
    p.assert.equal(dl.length, 1);
    p.assert.equal(dl[0].name, 'proj.zip');
    p.assert.equal(dl[0].type, 'application/zip');
  });
  t.test('the project zip has a local file header for every file', async (p) => {
    await stubDownload(p);
    await project(p);
    await p.ev(`SEE.Files.downloadZip(SEE.app, '${ROOT}/proj')`);
    const z = parseZip((await p.ev('window.__dl'))[0].bytes);
    p.assert.deepEqual(z.local.map((x) => x.name).sort(), ['main.c', 'util.c', 'util.h']);
    for (const x of z.local) {
      p.assert.equal(x.method, 0, 'stored');
      p.assert.equal(x.size, x.csize);
      p.assert.equal(x.flags & 0x0800, 0x0800, 'UTF-8 names');
    }
  });
  t.test('the zip entries hold the exact file contents and checksums', async (p) => {
    await stubDownload(p);
    await project(p);
    await p.ev(`SEE.Files.downloadZip(SEE.app, '${ROOT}/proj')`);
    const z = parseZip((await p.ev('window.__dl'))[0].bytes);
    const want = { 'main.c': MAIN, 'util.c': UTIL_C, 'util.h': UTIL_H };
    for (const x of z.local) {
      p.assert.equal(x.data.toString('utf8'), want[x.name]);
      p.assert.equal(x.crc, crc32(x.data));
      p.assert.equal(x.size, Buffer.byteLength(want[x.name]));
    }
  });
  t.test('the zip central directory matches the local headers', async (p) => {
    const z = parseZip(await zipOf(p, { 'a.c': 'aaa', 'b/c.h': 'cc', 'd.txt': '' }));
    p.assert.equal(z.central.length, 3);
    z.central.forEach((c, i) => {
      p.assert.equal(c.name, z.local[i].name);
      p.assert.equal(c.offset, z.local[i].offset);
      p.assert.equal(c.crc, z.local[i].crc);
      p.assert.equal(c.size, z.local[i].size);
    });
  });
  t.test('the zip end record counts the entries and points at the directory', async (p) => {
    const z = parseZip(await zipOf(p, { 'a.c': 'aaa', 'b.c': 'bb' }));
    p.assert.equal(z.end.sig, 0x06054b50);
    p.assert.equal(z.end.count, 2);
    p.assert.equal(z.end.total, 2);
    p.assert.equal(z.end.cdOffset, z.cdStart);
    p.assert.equal(z.end.cdSize, 2 * 46 + 6);
    p.assert.equal(z.end.length, 22);
  });
  t.test('a zip of nothing is just an end record', async (p) => {
    const bytes = await zipOf(p, {});
    p.assert.equal(bytes.length, 22);
    p.assert.equal(Buffer.from(bytes).readUInt32LE(0), 0x06054b50);
  });
  t.test('the zip keeps subfolders as paths with slashes', async (p) => {
    await stubDownload(p);
    await put(p, { [ROOT + '/tree/main.c']: MAIN, [ROOT + '/tree/lib/util.c']: UTIL_C, [ROOT + '/tree/lib/inc/util.h']: UTIL_H });
    await p.ev(`SEE.Files.downloadZip(SEE.app, '${ROOT}/tree')`);
    const z = parseZip((await p.ev('window.__dl'))[0].bytes);
    p.assert.deepEqual(z.local.map((x) => x.name).sort(), ['lib/inc/util.h', 'lib/util.c', 'main.c']);
  });
  t.test('the zip of a project carries unsaved editor text', async (p) => {
    await stubDownload(p);
    await project(p);
    await p.ev(`SEE.app.openFile('${ROOT}/proj/util.c')`);
    await p.setCode('/* newer */\n');
    await p.ev(`SEE.Files.downloadZip(SEE.app, '${ROOT}/proj')`);
    const z = parseZip((await p.ev('window.__dl'))[0].bytes);
    p.assert.equal(z.local.find((x) => x.name === 'util.c').data.toString(), '/* newer */\n');
  });
  t.test('the zip keeps non-ASCII names in UTF-8', async (p) => {
    const z = parseZip(await zipOf(p, { 'naïve.c': 'x' }));
    p.assert.equal(z.local[0].name, 'naïve.c');
  });
  t.test('SEE.Zip.crc32 gives the standard check value', async (p) => {
    p.assert.equal(await p.ev("SEE.Zip.crc32(new TextEncoder().encode('123456789'))"), 0xcbf43926);
    p.assert.equal(await p.ev('SEE.Zip.crc32(new Uint8Array(0))'), 0);
  });
  t.test('the zip of an example folder holds its files', async (p) => {
    await stubDownload(p);
    await p.ev("SEE.Files.downloadZip(SEE.app, '/examples/stack-module')");
    const dl = (await p.ev('window.__dl'))[0];
    p.assert.equal(dl.name, 'stack-module.zip');
    const z = parseZip(dl.bytes);
    p.assert.deepEqual(z.local.map((x) => x.name).sort(), ['main.c', 'stack.c', 'stack.h']);
    p.assert.equal(z.local.find((x) => x.name === 'stack.h').data.toString(), await p.ev("SEE.SampleFiles['stack-module/stack.h']"));
  });

  // ---- folders from the computer -----------------------------------------------------------------------------
  t.test('without showDirectoryPicker the mount button explains it cannot', async (p) => {
    await p.ev('window.showDirectoryPicker = undefined; true');
    await p.click('#fMount');
    p.assert.equal(await p.waitModal(), 'Folders from your computer');
    p.assert.match(await p.modalText(), /This browser cannot open folders from your computer\. Chrome and Edge on a desktop can\./);
    p.assert.match(await p.modalText(), /upload button/);
    await p.modalButton('OK');
    p.assert.equal(await p.modalOpen(), false);
    await p.ev('delete window.showDirectoryPicker; true');
  });
  t.test('without showDirectoryPicker File > Use a folder shows the same message', async (p) => {
    await p.ev('window.showDirectoryPicker = undefined; true');
    await p.menu('File', 'Use a folder from your computer');
    p.assert.equal(await p.waitModal(), 'Folders from your computer');
    await p.key('Enter');
    await p.waitGone('.modal-back', 2000);
    await p.ev('delete window.showDirectoryPicker; true');
  });
  const fakePicker = (name) => p0 => p0.ev(`window.__picked = 0; window.showDirectoryPicker = async (o) => { window.__picked++; window.__pickMode = o && o.mode; const file = (n, t) => ({ kind: 'file', name: n, getFile: async () => new File([t], n) }); return { kind: 'directory', name: ${JSON.stringify(name)}, entries: async function* () { yield ['hello.c', file('hello.c', 'int main(void) { return 3; }\\n')]; yield ['.hidden', file('.hidden', 'x')]; } }; }; true`);
  t.test('with showDirectoryPicker the mount dialog offers three modes', async (p) => {
    await fakePicker('disk')(p);
    await p.click('#fMount');
    p.assert.equal(await p.waitModal(), 'Use a folder from your computer');
    p.assert.deepEqual(await p.texts('.modal-back:last-child .modal-foot button'), ['Cancel', 'Read only', 'Ask me before each change', 'Let them write']);
    await p.modalButton('Cancel');
    p.assert.equal(await p.ev('window.__picked'), 0);
    await p.ev('delete window.showDirectoryPicker; true');
  });
  t.test('a folder mounted read only shows under /mnt with its tag', async (p) => {
    await fakePicker('mydisk')(p);
    await p.click('#fMount');
    await p.waitModal();
    await p.modalButton('Read only');
    await p.waitToast(/Mounted at \/mnt\/mydisk/);
    p.assert.equal(await p.ev('window.__pickMode'), 'read');
    p.assert.equal(await p.text('#sideBody .trow[data-path="/mnt/mydisk"] .tag'), 'read only');
    p.assert.ok(await p.exists('#sideBody .trow[data-path="/mnt/mydisk/hello.c"]'));
    p.assert.equal(await exists(p, '/mnt/mydisk/.hidden'), false);
    p.assert.equal(await p.ev("SEE.app.vfs.canWrite('/mnt/mydisk/hello.c')"), 'no');
    await p.ev("SEE.app.vfs.unmount('/mnt/mydisk'); SEE.app.renderSide(); delete window.showDirectoryPicker; true");
  });
  t.test('a mounted folder cannot be renamed and can be let go', async (p) => {
    await fakePicker('letgo')(p);
    await p.click('#fMount');
    await p.waitModal();
    await p.modalButton('Let them write');
    await p.waitToast(/Mounted at \/mnt\/letgo/);
    p.assert.equal(await p.text('#sideBody .trow[data-path="/mnt/letgo"] .tag'), 'can write');
    await p.rightClick('#sideBody .trow[data-path="/mnt/letgo"]');
    const items = await p.menuItems();
    p.assert.equal(items.find((x) => x.label === 'Rename…').disabled, true);
    p.assert.equal(items.find((x) => x.label === 'Delete').disabled, true);
    await p.click('.menu-pop .menu-item', 'Stop using this folder');
    await p.sleep(80);
    p.assert.equal(await exists(p, '/mnt/letgo'), false);
    p.assert.equal(await p.exists('#sideBody .trow[data-path="/mnt"]'), false);
    await p.ev('delete window.showDirectoryPicker; true');
  });
}
