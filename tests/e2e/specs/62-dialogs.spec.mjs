// The dialogs: the welcome card, About See, About the author, keyboard shortcuts, settings,
// the memory picture help, the C reference, the example library, the lessons, the guided tours,
// and how every modal dialog closes.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const VERSION = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const MAIN = '/home/user/e2e/main.c';
const PROG = '#include <stdio.h>\nint main(void)\n{\n    int x = 7;\n    printf("%d\\n", x);\n    return 0;\n}\n';

async function reset(p) {
  await p.ev(`(() => {
    SEE.UI.closeMenus(); SEE.UI.closeAllModals();
    if (SEE.Tours) SEE.Tours.stop();
    // a page that has just loaded keeps what its #lesson= link opened
    if (SEE.Lessons && SEE.Lessons.current && performance.now() > 4000) SEE.Lessons.close();
    const a = SEE.app;
    // other files left in the test folder would be built together with main.c
    try { for (const x of a.vfs.list('/home/user/e2e')) if (x.type === 'file' && x.name !== 'main.c') { const d = a.docByPath(x.path); if (d) { d.dirty = false; a.closeDoc(d); } a.vfs.unlink(x.path); } } catch (e) { /* no folder yet */ }
    for (const d of a.docs.slice()) if (d.path.startsWith('/home/user/e2e/') && d.path !== '/home/user/e2e/main.c') { d.dirty = false; a.closeDoc(d); }
    if (a.vm && performance.now() > 4000) a.stop();
    Object.assign(a.settings, { autosave: true, overflow: true, record: true, libFrames: false, fontSize: 14, args: '' });
    a.saveSettings(); a.applyTheme();
  })()`);
  await p.sleep(20);
}
const title = (p) => p.modalTitle();
const modals = (p) => p.count('.modal-back');
async function open(p, expr) { await p.ev(`void (${expr})`); return p.waitModal(); }
const tourCount = (p) => p.ev("(document.querySelector('#tourPop .count') || {}).textContent || ''");

export default function (t) {
  t.beforeEach(reset);

  // ---- the welcome card ----------------------------------------------------------------------------------
  t.test('the welcome card shows on a first visit', async (p) => {
    p.assert.equal(await p.waitModal(4000), 'Welcome to See');
    p.assert.match(await p.modalText(), /C, step by step, down to the byte\./);
    p.assert.equal(await p.count('.modal .choices .choice'), 4);
    p.assert.deepEqual(await p.texts('.modal .choice b'), ['Take the tour', 'Start the lessons', 'Open an example', 'Just write C']);
    p.assert.equal(await p.ev("JSON.parse(localStorage.getItem('see.settings')).firstRun"), false);
  }, { fresh: { firstRun: true } });
  t.test('the welcome card does not come back on the next visit', async (p) => {
    await p.waitModal(4000);
    await p.closeModals();
    await p.reload();
    await p.sleep(700);
    p.assert.equal(await p.modalOpen(), false);
  }, { fresh: { firstRun: true } });
  t.test('no welcome card once firstRun is off', async (p) => {
    await p.sleep(700);
    p.assert.equal(await p.modalOpen(), false);
  }, { fresh: true });
  t.test('#notour skips the welcome card', async (p) => {
    await p.sleep(700);
    p.assert.equal(await p.modalOpen(), false);
  }, { fresh: { firstRun: true, hash: 'notour' } });
  t.test('welcome: Take the tour starts the first tour', async (p) => {
    await p.waitModal(4000);
    await p.click('#wTour');
    await p.wait("!!document.getElementById('tourPop')", 10000);
    p.assert.equal(await p.modalOpen(), false);
    p.assert.equal(await p.ev("SEE.Tours.current.tour.id"), 'welcome');
    p.assert.match(await tourCount(p), /^1 of \d+$/);
  }, { fresh: { firstRun: true } });
  t.test('welcome: Start the lessons opens the lessons', async (p) => {
    await p.waitModal(4000);
    await p.click('#wLessons');
    await p.wait("document.querySelector('.modal-head') && document.querySelector('.modal-head').innerText === 'Lessons'");
    p.assert.equal(await modals(p), 1);
  }, { fresh: { firstRun: true } });
  t.test('welcome: Open an example opens the library', async (p) => {
    await p.waitModal(4000);
    await p.click('#wLibrary');
    await p.wait("document.querySelector('.modal-head') && document.querySelector('.modal-head').innerText === 'Example library'");
    p.assert.equal(await modals(p), 1);
  }, { fresh: { firstRun: true } });
  t.test('welcome: Just write C puts the cursor in hello.c', async (p) => {
    await p.waitModal(4000);
    await p.click('#wWrite');
    await p.wait('!document.querySelector(".modal-back")');
    await p.wait('document.activeElement === SEE.app.active.editor.ta', 2000);
    p.assert.equal(await p.activePath(), '/home/user/hello/hello.c');
  }, { fresh: { firstRun: true } });
  t.test('welcome: About the author opens the author card', async (p) => {
    await p.waitModal(4000);
    await p.click('#welcomeAuthor');
    await p.wait("document.querySelector('.modal-head') && document.querySelector('.modal-head').innerText === 'About the author'");
    p.assert.equal(await modals(p), 1);
  }, { fresh: { firstRun: true } });
  t.test('welcome: Close closes it and nothing else starts', async (p) => {
    await p.waitModal(4000);
    await p.modalButton('Close');
    p.assert.equal(await p.modalOpen(), false);
    p.assert.equal(await p.exists('#tourPop'), false);
  }, { fresh: { firstRun: true } });
  t.test('an #example= link skips the welcome card', async (p) => {
    await p.wait("SEE.app.active && SEE.app.active.path === '/library/basics/bits-and-masks/bits-and-masks.c'", 8000);
    await p.sleep(600);
    p.assert.equal(await p.modalOpen(), false);
  }, { fresh: { firstRun: true, hash: 'example=basics%2Fbits-and-masks' } });

  // ---- About See and About the author ---------------------------------------------------------------------
  t.test('About See names the version', async (p) => {
    p.assert.equal(await open(p, 'SEE.app.aboutDialog()'), 'About See');
    const txt = await p.modalText();
    p.assert.ok(txt.includes('See ' + VERSION + ' is a C89 workbench'), txt);
    p.assert.ok(!txt.includes('@@'), 'no template left');
  });
  t.test('About See says where files live and the licence', async (p) => {
    await open(p, 'SEE.app.aboutDialog()');
    const txt = await p.modalText();
    p.assert.match(txt, /Nothing you write leaves your computer/);
    p.assert.match(txt, /GNU General Public License, version 3/);
    p.assert.match(txt, /must credit the original author/);
  });
  t.test('About See links to About the author', async (p) => {
    await open(p, 'SEE.app.aboutDialog()');
    await p.click('.modal a', 'About the author');
    await p.wait("document.querySelector('.modal-head') && document.querySelector('.modal-head').innerText === 'About the author'");
    p.assert.equal(await modals(p), 1, 'About See closed first');
  });
  t.test('About See closes with OK', async (p) => {
    await open(p, 'SEE.app.aboutDialog()');
    await p.modalButton('OK');
    p.assert.equal(await p.modalOpen(), false);
  });
  t.test('About the author shows the photo', async (p) => {
    p.assert.equal(await open(p, 'SEE.authorDialog()'), 'About the author');
    p.assert.equal(await p.attr('.author-photo img', 'alt'), 'Photo of Jyotiprakash Mishra');
    p.assert.match(await p.attr('.author-photo img', 'src'), /^data:image\/png;base64,[A-Za-z0-9+/]{100}/);
    await p.wait("document.querySelector('.author-photo img').complete");
    p.assert.ok(await p.ev("document.querySelector('.author-photo img').naturalWidth > 0"), 'the photo decodes');
    const r = await p.rect('.author-photo img');
    p.assert.ok(r.w > 0 && r.h > 0);
  });
  t.test('About the author shows the name, roles and numbers', async (p) => {
    await open(p, 'SEE.authorDialog()');
    p.assert.equal(await p.text('.author-name'), 'Jyotiprakash Mishra');
    p.assert.equal(await p.count('.author-role'), 3);
    p.assert.match((await p.texts('.author-role')).join('\n'), /Assistant Professor of Computer Science, KIIT/);
    p.assert.equal(await p.count('.author-nums > div'), 5);
    p.assert.match(await p.text('.author-nums'), /16 years of experience/);
  });
  t.test('About the author has its sections', async (p) => {
    await open(p, 'SEE.authorDialog()');
    p.assert.deepEqual(await p.texts('.author-sec-t'), ['Education', 'Work', 'Books', 'Other things I made']);
    p.assert.equal(await p.ev("document.querySelectorAll('.author-sec')[0].querySelectorAll('.author-row').length"), 3);
    p.assert.equal(await p.ev("document.querySelectorAll('.author-sec')[1].querySelectorAll('.author-row').length"), 5);
    p.assert.equal(await p.ev("document.querySelectorAll('.author-sec')[2].querySelectorAll('.author-row').length"), 2);
  });
  t.test('About the author links open in a new tab', async (p) => {
    await open(p, 'SEE.authorDialog()');
    const links = await p.ev("[...document.querySelectorAll('.author a')].map(a => ({ t: a.innerText, h: a.getAttribute('href'), tg: a.target, rel: a.rel }))");
    p.assert.equal(links.length, 11);
    for (const l of links) { p.assert.equal(l.tg, '_blank', l.t); p.assert.equal(l.rel, 'noopener', l.t); p.assert.match(l.h, /^(https:\/\/|mailto:)/, l.t); }
    p.assert.ok(links.some((l) => l.h === 'mailto:mail@jyotiprakash.org'));
    p.assert.ok(links.some((l) => l.h === 'https://github.com/ShowMeTheStack'));
    p.assert.ok(links.some((l) => l.t === 'Baysik' && l.h === 'https://baysik.jyotiprakash.org'));
  });
  t.test('About the author ends with the closing line', async (p) => {
    await open(p, 'SEE.authorDialog()');
    const last = await p.ev("[...document.querySelectorAll('.author > p')].pop().innerText");
    p.assert.match(last, /^I have taught C for years/);
    p.assert.match(last, /If it helps someone finally see it, I would love to hear about it\.$/);
  });
  t.test('About the author is a wide dialog that closes with Enter', async (p) => {
    await open(p, 'SEE.authorDialog()');
    p.assert.ok(await p.ev("document.querySelector('.modal').classList.contains('wide')"));
    await p.key('Enter');
    await p.waitGone('.modal-back');
  });

  // ---- Keyboard shortcuts ----------------------------------------------------------------------------------
  t.test('Keyboard shortcuts lists every shortcut', async (p) => {
    p.assert.equal(await open(p, 'SEE.app.shortcutsDialog()'), 'Keyboard shortcuts');
    const keys = await p.texts('.modal kbd');
    p.assert.equal(keys.length, 21);
    for (const k of ['F5', 'Ctrl+F5', 'Shift+F5', 'F10', 'F11', 'Shift+F11', 'Ctrl+F11', 'F8', 'Shift+F8', 'Ctrl+F10', 'F9', 'Ctrl+B', 'Ctrl+S', 'Ctrl+N', 'Ctrl+O', 'Ctrl+F', 'Ctrl+G', 'Ctrl+/', 'F1', 'Ctrl+D']) p.assert.ok(keys.includes(k), k);
  });
  t.test('Keyboard shortcuts says what each key does', async (p) => {
    await open(p, 'SEE.app.shortcutsDialog()');
    const rows = Object.fromEntries(await p.ev("[...document.querySelectorAll('.modal tr')].map(r => [r.cells[0].innerText, r.cells[1].innerText])"));
    p.assert.equal(rows.F10, 'Step over');
    p.assert.equal(rows.F11, 'Step into');
    p.assert.equal(rows['Shift+F5'], 'Stop');
    p.assert.equal(rows.F1, 'C reference');
    p.assert.equal(rows['Ctrl+D'], 'In the terminal: end of input');
  });
  t.test('Keyboard shortcuts closes with OK', async (p) => {
    await open(p, 'SEE.app.shortcutsDialog()');
    await p.modalButton('OK');
    p.assert.equal(await p.modalOpen(), false);
  });

  // ---- Settings ---------------------------------------------------------------------------------------------
  const CHECKS = [['autosave', 'Save my files by themselves'], ['overflow', 'Warn when a signed integer overflows'], ['record', 'Keep a history while debugging'], ['libFrames', "Show the C library's own functions"]];
  CHECKS.forEach(([key, label], i) => {
    t.test(`Settings: "${label}" changes ${key}`, async (p) => {
      p.assert.equal(await open(p, 'SEE.app.settingsDialog()'), 'Settings');
      const before = await p.ev(`SEE.app.settings.${key}`);
      p.assert.equal(await p.ev(`document.querySelectorAll('.modal input[type=checkbox]')[${i}].checked`), before);
      p.assert.ok((await p.ev(`document.querySelectorAll('.modal input[type=checkbox]')[${i}].parentElement.innerText`)).startsWith(label));
      await p.ev(`document.querySelectorAll('.modal input[type=checkbox]')[${i}].scrollIntoView()`);
      const r = await p.ev(`(() => { const b = document.querySelectorAll('.modal input[type=checkbox]')[${i}].getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; })()`);
      await p.clickAt(r[0], r[1]);
      p.assert.equal(await p.ev(`SEE.app.settings.${key}`), !before);
      p.assert.equal(await p.ev(`JSON.parse(localStorage.getItem('see.settings')).${key}`), !before);
      await p.clickAt(r[0], r[1]);
      p.assert.equal(await p.ev(`SEE.app.settings.${key}`), before);
    });
  });
  t.test('Settings: the code size field changes the code size', async (p) => {
    await open(p, 'SEE.app.settingsDialog()');
    p.assert.equal(await p.ev("document.querySelector('.modal input[type=number]').value"), '14');
    await p.ev("(() => { const i = document.querySelector('.modal input[type=number]'); i.value = '18'; i.dispatchEvent(new Event('change')); })()");
    p.assert.equal(await p.ev('SEE.app.settings.fontSize'), 18);
    p.assert.equal(await p.ev("document.documentElement.style.getPropertyValue('--code-size')"), '18px');
    p.assert.equal(await p.ev("JSON.parse(localStorage.getItem('see.settings')).fontSize"), 18);
  });
  t.test('Settings: the code size is kept between 10 and 26', async (p) => {
    await open(p, 'SEE.app.settingsDialog()');
    const set = (v) => p.ev(`(() => { const i = document.querySelector('.modal input[type=number]'); i.value = ${JSON.stringify(v)}; i.dispatchEvent(new Event('change')); return SEE.app.settings.fontSize; })()`);
    p.assert.equal(await set('40'), 26);
    p.assert.equal(await set('3'), 10);
    p.assert.equal(await set(''), 14);
  });
  t.test('Settings: the arguments field sets argv for the next run', async (p) => {
    await open(p, 'SEE.app.settingsDialog()');
    await p.modalInput('alpha beta');
    await p.ev("document.querySelector('.modal input[type=text]').dispatchEvent(new Event('change'))");
    p.assert.equal(await p.ev('SEE.app.settings.args'), 'alpha beta');
    await p.closeModals();
    await p.runProgram('#include <stdio.h>\nint main(int argc, char **argv)\n{\n    printf("n=%d %s\\n", argc, argv[2]);\n    return 0;\n}\n');
    p.assert.match(await p.output(), /n=3 beta/);
  });
  t.test('Settings are remembered after a reload', async (p) => {
    await open(p, 'SEE.app.settingsDialog()');
    await p.ev("document.querySelectorAll('.modal input[type=checkbox]').forEach(c => c.click())");
    await p.ev("(() => { const i = document.querySelector('.modal input[type=number]'); i.value = '16'; i.dispatchEvent(new Event('change')); })()");
    await p.closeModals();
    await p.reload();
    p.assert.deepEqual(await p.ev('[SEE.app.settings.autosave, SEE.app.settings.overflow, SEE.app.settings.record, SEE.app.settings.libFrames, SEE.app.settings.fontSize]'), [false, false, false, true, 16]);
    await open(p, 'SEE.app.settingsDialog()');
    p.assert.deepEqual(await p.ev("[...document.querySelectorAll('.modal input[type=checkbox]')].map(c => c.checked)"), [false, false, false, true]);
    p.assert.equal(await p.ev("document.querySelector('.modal input[type=number]').value"), '16');
  }, { fresh: true });
  t.test('Settings: with autosave off a changed file is not saved by itself', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.setCode(PROG.replace('7', '9'));
    await open(p, 'SEE.app.settingsDialog()');
    await p.ev("document.querySelectorAll('.modal input[type=checkbox]')[0].click()");
    await p.closeModals();
    await p.ev('SEE.app.autosaveAll()');
    p.assert.ok(await p.ev('SEE.app.active.dirty'));
    p.assert.match(await p.ev(`SEE.app.vfs.readText('${MAIN}')`), /x = 7/);
    await p.ev('SEE.app.settings.autosave = true; SEE.app.autosaveAll()');
    p.assert.match(await p.ev(`SEE.app.vfs.readText('${MAIN}')`), /x = 9/);
  });
  t.test('Settings: turning off the history stops step back', async (p) => {
    await open(p, 'SEE.app.settingsDialog()');
    await p.ev("document.querySelectorAll('.modal input[type=checkbox]')[2].click()");
    await p.closeModals();
    await p.debugProgram(PROG);
    await p.step('over');
    p.assert.equal(await p.ev('SEE.app.canBack()'), false);
    p.assert.ok(await p.ev("document.getElementById('tbBack').disabled"));
    await p.stopProgram();
  });
  t.test('Settings closes with Close', async (p) => {
    await open(p, 'SEE.app.settingsDialog()');
    await p.modalButton('Close');
    p.assert.equal(await p.modalOpen(), false);
  });

  // ---- Reading the memory picture ----------------------------------------------------------------------------
  t.test('Reading the memory picture explains the stack, heap and colours', async (p) => {
    p.assert.equal(await open(p, 'SEE.app.memoryHelp()'), 'Reading the memory picture');
    p.assert.equal(await p.count('.modal-body p'), 4);
    const txt = await p.modalText();
    p.assert.match(txt, /The left column is the stack/);
    p.assert.match(txt, /the heap \(every malloc block/);
    p.assert.match(txt, /Red values have not been set yet/);
    p.assert.match(txt, /Click a value to change it/);
    p.assert.ok(await p.ev("document.querySelector('.modal').classList.contains('wide')"));
  });
  t.test('Reading the memory picture closes with OK', async (p) => {
    await open(p, 'SEE.app.memoryHelp()');
    await p.modalButton('OK');
    p.assert.equal(await p.modalOpen(), false);
  });

  // ---- the C reference -------------------------------------------------------------------------------------
  t.test('the reference opens with the search box focused', async (p) => {
    p.assert.equal(await open(p, "SEE.app.showReference('')"), 'C reference');
    await p.wait("document.activeElement && document.activeElement.id === 'refFind'", 2000);
    p.assert.match(await p.text('.ref-body'), /Pick a name on the left or type to search/);
  });
  t.test('the reference groups its entries', async (p) => {
    await open(p, "SEE.app.showReference('')");
    const groups = await p.ev("[...document.querySelectorAll('.ref-list .rh')].map(e => e.textContent)");
    for (const g of ['Keywords', '<stdio.h>', '<stdlib.h>', '<string.h>']) p.assert.ok(groups.includes(g), g + ' in ' + groups.join(', '));
    const firstHeader = groups.findIndex((g) => g.startsWith('<'));
    p.assert.ok(firstHeader > 0 && groups.slice(firstHeader).every((g) => g.startsWith('<')), 'headers come after the language groups');
    p.assert.deepEqual(groups.slice(firstHeader), groups.slice(firstHeader).slice().sort((a, b) => a.localeCompare(b)));
  });
  t.test('every entry of the reference is listed', async (p) => {
    await open(p, "SEE.app.showReference('')");
    p.assert.equal(await p.count('.ref-list .ri'), await p.ev('Object.keys(SEE.Help.index()).length'));
  });
  t.test('searching the reference narrows the list and shows the first match', async (p) => {
    await open(p, "SEE.app.showReference('')");
    await p.type('malloc');
    const names = await p.ev("[...document.querySelectorAll('.ref-list .ri')].map(r => r.dataset.n)");
    p.assert.ok(names.includes('malloc'));
    p.assert.ok(names.length < 40, 'narrowed to ' + names.length);
    p.assert.equal(await p.text('.ref-body h3'), names[0]);
  });
  t.test('searching the reference for nonsense lists nothing', async (p) => {
    await open(p, "SEE.app.showReference('')");
    await p.type('qqzzxxnothing');
    p.assert.equal(await p.count('.ref-list .ri'), 0);
    p.assert.equal(await p.count('.ref-list .rh'), 0);
  });
  t.test('clearing the reference search lists everything again', async (p) => {
    await open(p, "SEE.app.showReference('')");
    await p.type('strl');
    const few = await p.count('.ref-list .ri');
    await p.ev("(() => { const f = document.getElementById('refFind'); f.value = ''; f.dispatchEvent(new Event('input')); })()");
    p.assert.ok((await p.count('.ref-list .ri')) > few);
  });
  t.test('clicking an entry shows it', async (p) => {
    await open(p, "SEE.app.showReference('')");
    await p.click('.ref-list .ri[data-n="strlen"]');
    p.assert.equal(await p.text('.ref-body h3'), 'strlen');
    p.assert.equal(await p.text('.ref-body p.muted'), '#include <string.h>');
    p.assert.match(await p.text('.ref-body .sig'), /size_t strlen\(const char \*/);
    p.assert.ok(await p.exists('.ref-list .ri.sel[data-n="strlen"]'));
    p.assert.equal(await p.count('.ref-list .ri.sel'), 1);
  });
  t.test('Enter on an entry shows it', async (p) => {
    await open(p, "SEE.app.showReference('')");
    await p.ev("document.querySelector('.ref-list .ri[data-n=\"fopen\"]').focus()");
    await p.key('Enter');
    p.assert.equal(await p.text('.ref-body h3'), 'fopen');
  });
  t.test('the reference opens at a given word with it selected', async (p) => {
    await open(p, "SEE.app.showReference('qsort')");
    p.assert.equal(await p.text('.ref-body h3'), 'qsort');
    p.assert.ok(await p.exists('.ref-list .ri.sel[data-n="qsort"]'));
    await p.wait("(() => { const s = document.querySelector('.ref-list .ri.sel').getBoundingClientRect(), l = document.querySelector('.ref-list').getBoundingClientRect(); return s.top >= l.top && s.bottom <= l.bottom; })()", 2000);
  });
  t.test('a see-also link goes to the other entry', async (p) => {
    const pair = await p.ev("(() => { const i = SEE.Help.index(); const e = Object.entries(i).find(([n, x]) => x.see && x.see.length && i[x.see[0]] && x.see[0] !== n); return e ? [e[0], e[1].see[0]] : null; })()");
    p.assert.ok(pair, 'an entry with see-also links');
    await open(p, `SEE.app.showReference(${JSON.stringify(pair[0])})`);
    p.assert.match(await p.text('.ref-body'), /See also:/);
    await p.click('.ref-body p.muted a', pair[1]);
    p.assert.equal(await p.text('.ref-body h3'), pair[1]);
    p.assert.ok(await p.exists(`.ref-list .ri.sel[data-n="${pair[1]}"]`));
  });
  t.test('Try this example opens the example as a /tmp/try- file', async (p) => {
    await open(p, "SEE.app.showReference('strcpy')");
    await p.click('.ref-body button', 'Try this example');
    await p.wait("SEE.app.active && SEE.app.active.path === '/tmp/try-strcpy/try.c'");
    p.assert.equal(await p.modalOpen(), false);
    p.assert.ok(await p.ev("SEE.app.vfs.exists('/tmp/try-strcpy/try.c')"));
    p.assert.match(await p.code(), /strcpy/);
    p.assert.match(await p.code(), /int main/);
    const st = await p.runProgram(await p.code(), { path: '/tmp/try-strcpy/try.c' });
    p.assert.equal(st, 'exited');
  });
  t.test('Try this example twice gives the same file again', async (p) => {
    await open(p, "SEE.app.showReference('abs')");
    if (!(await p.exists('.ref-body button'))) return;
    await p.click('.ref-body button', 'Try this example');
    await p.wait("SEE.app.active && SEE.app.active.path === '/tmp/try-abs/try.c'");
    const n = await p.ev('SEE.app.docs.length');
    await open(p, "SEE.app.showReference('abs')");
    await p.click('.ref-body button', 'Try this example');
    await p.wait("SEE.app.active.path === '/tmp/try-abs/try.c'");
    p.assert.equal(await p.ev('SEE.app.docs.length'), n);
  });
  t.test('an entry with only a prototype points at the header', async (p) => {
    const name = await p.ev("(() => { const e = Object.entries(SEE.Help.index()).find(([n, x]) => x.header && !x.text); return e ? e[0] : null; })()");
    if (!name) return;
    await open(p, `SEE.app.showReference(${JSON.stringify(name)})`);
    p.assert.match(await p.text('.ref-body'), /Open \/usr\/include\/\S+\.h to read the header itself\./);
  });
  t.test('the reference closes with Close', async (p) => {
    await open(p, "SEE.app.showReference('')");
    await p.modalButton('Close');
    p.assert.equal(await p.modalOpen(), false);
  });

  // ---- the example library -------------------------------------------------------------------------------------
  t.test('the library lists its categories with counts', async (p) => {
    p.assert.equal(await open(p, 'SEE.Library.browse(SEE.app)'), 'Example library');
    const cats = await p.ev("[...document.querySelectorAll('.lib-cat')].map(c => [c.dataset.cat, +c.querySelector('.n').innerText])");
    const want = await p.ev('SEE.LibraryCats.filter(([k]) => SEE.LibraryIndex.some(e => e.cat === k)).map(([k]) => [k, SEE.LibraryIndex.filter(e => e.cat === k).length])');
    p.assert.deepEqual(cats, want);
    p.assert.equal(cats.reduce((a, c) => a + c[1], 0), await p.ev('SEE.LibraryIndex.length'));
  });
  t.test('the library search box says how many programs there are', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    p.assert.equal(await p.attr('#libFind', 'placeholder'), 'Search all ' + (await p.ev('SEE.LibraryIndex.length')) + ' programs');
    await p.wait("document.activeElement && document.activeElement.id === 'libFind'", 2000);
  });
  t.test('picking a library category lists its programs and is remembered', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.click('.lib-cat[data-cat="pointers"]');
    p.assert.ok(await p.exists('.lib-cat.sel[data-cat="pointers"]'));
    const ids = await p.ev("[...document.querySelectorAll('#libList .lib-item')].map(r => r.dataset.id)");
    p.assert.equal(ids.length, await p.ev("SEE.LibraryIndex.filter(e => e.cat === 'pointers').length"));
    p.assert.ok(ids.every((id) => id.startsWith('pointers/')));
    await p.closeModals();
    await open(p, 'SEE.Library.browse(SEE.app)');
    p.assert.ok(await p.exists('.lib-cat.sel[data-cat="pointers"]'));
  });
  t.test('searching the library looks in every category', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.type('linked list');
    const ids = await p.ev("[...document.querySelectorAll('#libList .lib-item')].map(r => r.dataset.id)");
    p.assert.ok(ids.length > 0);
    p.assert.ok(new Set(ids.map((i) => i.split('/')[0])).size >= 1);
    p.assert.equal(await p.count('.lib-cat.sel'), 0, 'no category is picked while searching');
    const want = await p.ev("SEE.LibraryIndex.filter(e => (e.title + ' ' + e.about + ' ' + e.id).toLowerCase().includes('linked list')).length");
    p.assert.equal(ids.length, want);
  });
  t.test('searching the library for nonsense says nothing matches', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.type('zzqqxxnothing');
    p.assert.equal(await p.count('#libList .lib-item'), 0);
    p.assert.equal(await p.text('#libList .empty'), 'Nothing matches.');
  });
  t.test('library programs show their level', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.click('.lib-cat[data-cat="basics"]');
    const rows = await p.ev("[...document.querySelectorAll('#libList .lib-item')].map(r => [r.dataset.id, r.querySelector('.lv').innerText])");
    const levels = ['', 'first steps', 'getting going', 'confident', 'deep end'];
    for (const [id, lv] of rows) {
      const want = await p.ev(`SEE.LibraryIndex.find(e => e.id === ${JSON.stringify(id)}).level`);
      p.assert.equal(lv, levels[want] || '', id);
    }
    p.assert.ok(rows.some((r) => r[1]), 'some levels are named');
  });
  t.test('a library program with several files says how many', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.click('.lib-cat[data-cat="functions"]');
    p.assert.match(await p.text('#libList .lib-item[data-id="functions/dice-module"]'), /\(3 files\)/);
  });
  t.test('opening a library program fetches it into /library and opens it', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.click('.lib-cat[data-cat="basics"]');
    await p.click('#libList .lib-item[data-id="basics/bits-and-masks"]');
    await p.wait("SEE.app.active && SEE.app.active.path === '/library/basics/bits-and-masks/bits-and-masks.c'", 8000);
    p.assert.equal(await p.modalOpen(), false);
    p.assert.ok(await p.ev("SEE.app.vfs.exists('/library/basics/bits-and-masks/bits-and-masks.c')"));
    p.assert.equal(await p.ev('location.hash'), '#example=basics%2Fbits-and-masks');
    p.assert.match(await p.status(), /^Bits, masks and shifts: /);
    p.assert.equal(await p.text('#tabs .tab.active .tro'), 'read-only');
    await p.ev("SEE.app.run()");
    await p.settle(20000);
    p.assert.equal(await p.state(), 'exited');
  });
  t.test('opening a library program with several files opens them all', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.type('dice-module');
    await p.click('#libList .lib-item[data-id="functions/dice-module"]');
    await p.wait("SEE.app.active && SEE.app.active.path === '/library/functions/dice-module/main.c'", 8000);
    for (const f of ['main.c', 'rng.c', 'rng.h']) {
      p.assert.ok(await p.ev(`SEE.app.vfs.exists('/library/functions/dice-module/${f}')`), f);
      p.assert.ok(await p.ev(`!!SEE.app.docByPath('/library/functions/dice-module/${f}')`), f + ' open');
    }
  });
  t.test('Enter on a library program opens it', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.click('.lib-cat[data-cat="basics"]');
    await p.ev("document.querySelector('#libList .lib-item').focus()");
    const id = await p.ev("document.querySelector('#libList .lib-item').dataset.id");
    await p.key('Enter');
    await p.wait(`SEE.app.active && SEE.app.active.path.startsWith('/library/${id}/')`, 8000);
  });
  t.test('a library program that takes arguments sets them', async (p) => {
    await p.ev("SEE.Library.openById(SEE.app, 'classic/echo')");
    await p.wait("SEE.app.active && SEE.app.active.path.startsWith('/library/classic/echo/')", 8000);
    p.assert.equal(await p.ev('SEE.app.settings.args'), await p.ev("SEE.LibraryIndex.find(e => e.id === 'classic/echo').args"));
  });
  t.test('an unknown library id says so', async (p) => {
    await p.ev("SEE.Library.openById(SEE.app, 'nope/never')");
    await p.waitToast(/No such example: nope\/never/);
  });
  t.test('an #example= link opens that program', async (p) => {
    await p.wait("SEE.app.active && SEE.app.active.path === '/library/functions/dice-module/main.c'", 8000);
    p.assert.equal(await p.modalOpen(), false);
  }, { fresh: { hash: 'example=functions%2Fdice-module' } });
  t.test('the library closes with Close', async (p) => {
    await open(p, 'SEE.Library.browse(SEE.app)');
    await p.modalButton('Close');
    p.assert.equal(await p.modalOpen(), false);
  });

  // ---- the lessons --------------------------------------------------------------------------------------------
  t.test('the lessons dialog lists the units in order', async (p) => {
    p.assert.equal(await open(p, 'SEE.Lessons.browse(SEE.app)'), 'Lessons');
    const units = await p.texts('.modal-body h3');
    const want = await p.ev('SEE.Lessons.units.map((u, i) => (i + 1) + ". " + u)');
    p.assert.deepEqual(units, want);
    p.assert.equal(units[0], '1. First steps');
  });
  t.test('the lessons dialog lists every lesson with its steps', async (p) => {
    await open(p, 'SEE.Lessons.browse(SEE.app)');
    p.assert.equal(await p.count('.modal .list-row'), await p.ev('SEE.Lessons.list.length'));
    p.assert.equal(await p.text('.modal .list-row[data-id="hello"] b'), 'Hello, memory');
    p.assert.match(await p.text('.modal .list-row[data-id="hello"]'), new RegExp((await p.ev("SEE.Lessons.byId('hello').steps.length")) + ' steps'));
  });
  t.test('opening a lesson shows the lesson card', async (p) => {
    await open(p, 'SEE.Lessons.browse(SEE.app)');
    await p.click('.modal .list-row[data-id="hello"]');
    await p.wait("!!document.getElementById('lessonCard')", 4000);
    p.assert.equal(await p.modalOpen(), false);
    p.assert.match(await p.text('#lessonCard .lesson-head'), /Hello, memory\s+First steps/);
    p.assert.equal(await p.text('#lessonNext'), 'Start');
    p.assert.ok(await p.ev("document.getElementById('lessonBack').disabled"));
    p.assert.equal(await p.activePath(), '/lessons/hello/main.c');
    p.assert.equal(await p.ev('location.hash'), '#lesson=hello');
    p.assert.equal(await p.attr('#lessonCard', 'aria-label'), 'Lesson');
  });
  t.test('Enter on a lesson row opens it', async (p) => {
    await open(p, 'SEE.Lessons.browse(SEE.app)');
    await p.ev("document.querySelector('.modal .list-row[data-id=\"hello\"]').focus()");
    await p.key('Enter');
    await p.wait("!!document.getElementById('lessonCard')", 4000);
  });
  t.test('the lesson Next button steps through the lesson', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.wait("!!document.getElementById('lessonNext')");
    const n = await p.ev("SEE.Lessons.byId('hello').steps.length");
    await p.click('#lessonNext');
    await p.wait("/Step 1 of/.test(document.querySelector('#lessonCard .lesson-nav').innerText) && !document.getElementById('lessonNext').disabled", 15000);
    p.assert.match(await p.text('#lessonCard .lesson-nav'), new RegExp('Step 1 of ' + n));
    p.assert.equal(await p.text('#lessonNext'), 'Next');
    p.assert.ok(!(await p.ev("document.getElementById('lessonBack').disabled")));
    p.assert.ok((await p.text('#lessonText')).length > 20);
  });
  t.test('the lesson Back button goes back a step', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.ev('SEE.Lessons.go(SEE.Lessons.current, 1)');
    await p.wait("SEE.Lessons.current.i === 1 && !SEE.Lessons.current.busy", 15000);
    const text2 = await p.text('#lessonText');
    await p.click('#lessonBack');
    await p.wait("SEE.Lessons.current.i === 0 && !SEE.Lessons.current.busy", 15000);
    p.assert.match(await p.text('#lessonCard .lesson-nav'), /Step 1 of/);
    p.assert.notEqual(await p.text('#lessonText'), text2);
  });
  t.test('the lesson Again button goes back to the start', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.ev('SEE.Lessons.go(SEE.Lessons.current, 1)');
    await p.wait("SEE.Lessons.current.i === 1 && !SEE.Lessons.current.busy", 15000);
    await p.click('#lessonRestart');
    await p.wait("SEE.Lessons.current.i === -1 && !SEE.Lessons.current.busy", 15000);
    p.assert.equal(await p.text('#lessonNext'), 'Start');
    p.assert.match(await p.text('#lessonCard .lesson-nav'), /\d+ steps/);
    p.assert.equal(await p.state(), 'none');
  });
  t.test('the lesson fold button folds and unfolds the card', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.wait("!!document.getElementById('lessonCard')");
    await p.click('#lessonCard .lesson-head button[aria-label="Fold the lesson"]');
    p.assert.ok(await p.ev("document.getElementById('lessonCard').classList.contains('folded')"));
    p.assert.equal(await p.visible('#lessonText'), false);
    p.assert.equal(await p.visible('#lessonNext'), false);
    await p.click('#lessonCard .lesson-head button[aria-label="Fold the lesson"]');
    p.assert.ok(await p.visible('#lessonText'));
  });
  t.test('the lesson close button removes the card', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.wait("!!document.getElementById('lessonCard')");
    await p.click('#lessonClose');
    p.assert.equal(await p.exists('#lessonCard'), false);
    p.assert.equal(await p.ev('SEE.Lessons.current'), null);
    p.assert.equal(await p.ev('location.hash'), '');
  });
  t.test('finishing a lesson puts a checkmark by it', async (p) => {
    await p.ev("localStorage.removeItem('see.lessonsDone')");
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    const n = await p.ev("SEE.Lessons.byId('hello').steps.length");
    await p.ev(`SEE.Lessons.go(SEE.Lessons.current, ${n - 1})`);
    await p.wait(`SEE.Lessons.current.i === ${n - 1} && !SEE.Lessons.current.busy`, 30000);
    p.assert.equal(await p.text('#lessonNext'), 'Finish');
    await p.click('#lessonNext');
    await p.wait("/Well done\\./.test(document.getElementById('lessonCard').innerText)");
    p.assert.deepEqual(await p.ev("JSON.parse(localStorage.getItem('see.lessonsDone'))"), ['hello']);
    await open(p, 'SEE.Lessons.browse(SEE.app)');
    p.assert.equal(await p.ev("document.querySelector('.modal .list-row[data-id=\"hello\"]').children[0].innerText"), '✓');
    p.assert.equal(await p.ev("[...document.querySelectorAll('.modal .list-row')].filter(r => r.children[0].innerText === '✓').length"), 1);
  }, { timeout: 60000 });
  t.test('the finished card offers the next lesson', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.ev('SEE.Lessons.finish(SEE.Lessons.current)');
    const next = await p.ev("SEE.Lessons.list[SEE.Lessons.list.indexOf(SEE.Lessons.byId('hello')) + 1]");
    p.assert.equal(await p.text('#lessonNextLesson'), 'Next lesson: ' + next.title);
    await p.click('#lessonNextLesson');
    await p.wait(`SEE.Lessons.current && SEE.Lessons.current.l.id === ${JSON.stringify(next.id)}`);
    p.assert.equal(await p.ev('location.hash'), '#lesson=' + encodeURIComponent(next.id));
  });
  t.test('the finished card can open all the lessons', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.ev('SEE.Lessons.finish(SEE.Lessons.current)');
    await p.click('#lessonCard .lesson-nav button', 'All lessons');
    p.assert.equal(await p.waitModal(), 'Lessons');
  });
  t.test('a #lesson= link opens the lesson', async (p) => {
    await p.wait("!!document.getElementById('lessonCard')", 8000);
    p.assert.equal(await p.ev('SEE.Lessons.current.l.id'), 'hello');
    p.assert.equal(await p.activePath(), '/lessons/hello/main.c');
    p.assert.equal(await p.modalOpen(), false);
  }, { fresh: { firstRun: true, hash: 'lesson=hello' } });
  t.test('an unknown #lesson= says so', async (p) => {
    await p.waitToast(/No such lesson: nothere/);
    p.assert.equal(await p.exists('#lessonCard'), false);
  }, { fresh: { hash: 'lesson=nothere' } });

  // ---- guided tours -----------------------------------------------------------------------------------------
  t.test('the tours dialog lists every tour', async (p) => {
    p.assert.equal(await open(p, 'SEE.Tours.menu(SEE.app)'), 'Guided tours');
    const rows = await p.texts('.modal .list-row b');
    p.assert.deepEqual(rows, await p.ev('SEE.Tours.list.map(t => t.title)'));
    p.assert.equal(rows.length, 4);
    p.assert.match(await p.modalText(), /Breakpoints, conditions, watches/);
  });
  for (const id of ['welcome', 'debugger', 'files', 'memory']) {
    t.test(`the tours dialog starts the ${id} tour`, async (p) => {
      await open(p, 'SEE.Tours.menu(SEE.app)');
      const t0 = await p.ev(`SEE.Tours.list.find(t => t.id === ${JSON.stringify(id)}).title`);
      await p.click('.modal .list-row', t0);
      await p.wait("!!document.getElementById('tourPop')", 15000);
      p.assert.equal(await p.modalOpen(), false);
      p.assert.equal(await p.ev('SEE.Tours.current.tour.id'), id);
      p.assert.match(await tourCount(p), /^1 of \d+$/);
      p.assert.equal(await p.attr('#tourPop', 'aria-label'), t0);
    }, { timeout: 30000 });
  }
  t.test('the × button ends a tour', async (p) => {
    await p.ev("SEE.Tours.start(SEE.app, 'memory')");
    await p.wait("!!document.getElementById('tourPop')", 15000);
    p.assert.equal(await p.attr('#tourPop .th button', 'aria-label'), 'End the tour');
    await p.click('#tourPop .th button');
    p.assert.equal(await p.exists('#tourPop'), false);
    p.assert.equal(await p.exists('.tour-ring'), false);
    p.assert.equal(await p.ev('SEE.Tours.current'), null);
  });
  t.test('tour Back and Next move between steps', async (p) => {
    await p.ev("SEE.Tours.start(SEE.app, 'memory')");
    await p.wait("!!document.getElementById('tourPop')", 15000);
    p.assert.ok(await p.ev("document.getElementById('tourBack').disabled"));
    await p.click('#tourNext');
    await p.wait("document.querySelector('#tourPop .count').textContent.startsWith('2 of')", 15000);
    p.assert.ok(!(await p.ev("document.getElementById('tourBack').disabled")));
    await p.click('#tourBack');
    await p.wait("document.querySelector('#tourPop .count').textContent.startsWith('1 of')", 15000);
  }, { timeout: 40000 });
  t.test('starting a lesson ends a tour', async (p) => {
    await p.ev("SEE.Tours.start(SEE.app, 'memory')");
    await p.wait("!!document.getElementById('tourPop')", 15000);
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.waitGone('#tourPop');
  });

  // ---- how modal dialogs close ------------------------------------------------------------------------------
  const DIALOGS = [
    ['About See', 'SEE.app.aboutDialog()'], ['About the author', 'SEE.authorDialog()'], ['Keyboard shortcuts', 'SEE.app.shortcutsDialog()'],
    ['Settings', 'SEE.app.settingsDialog()'], ['Reading the memory picture', 'SEE.app.memoryHelp()'], ['C reference', "SEE.app.showReference('')"],
    ['Example library', 'SEE.Library.browse(SEE.app)'], ['Lessons', 'SEE.Lessons.browse(SEE.app)'], ['Guided tours', 'SEE.Tours.menu(SEE.app)'], ['Welcome to See', 'SEE.app.welcome()'],
    ['Open a file', 'SEE.Files.openDialog(SEE.app)'], ['New file', 'SEE.Files.newFile(SEE.app)'],
  ];
  for (const [name, expr] of DIALOGS) {
    t.test(`${name} closes with Escape`, async (p) => {
      p.assert.equal(await open(p, expr), name);
      await p.key('Escape');
      await p.waitGone('.modal-back', 2000);
    });
    t.test(`${name} closes when the backdrop is clicked`, async (p) => {
      p.assert.equal(await open(p, expr), name);
      await p.clickAt(4, 4);
      await p.waitGone('.modal-back', 2000);
    });
  }
  t.test('a click inside the dialog does not close it', async (p) => {
    await open(p, 'SEE.app.aboutDialog()');
    await p.click('.modal-body');
    p.assert.equal(await p.modalOpen(), true);
  });
  t.test('dialogs are modal and labelled', async (p) => {
    await open(p, 'SEE.app.shortcutsDialog()');
    p.assert.equal(await p.attr('.modal', 'role'), 'dialog');
    p.assert.equal(await p.attr('.modal', 'aria-modal'), 'true');
    p.assert.equal(await p.attr('.modal', 'aria-label'), 'Keyboard shortcuts');
    const r = await p.rect('.modal-back');
    p.assert.ok(r.w >= 1399 && r.h >= 899, 'the backdrop covers the page');
  });
  t.test('Tab keeps the focus inside a dialog', async (p) => {
    await open(p, 'SEE.app.settingsDialog()');
    for (let i = 0; i < 12; i++) {
      await p.key('Tab');
      p.assert.ok(await p.ev("document.querySelector('.modal').contains(document.activeElement)"), 'focus inside after ' + (i + 1) + ' tabs');
    }
  });
  t.test('closing a dialog gives the focus back', async (p) => {
    await p.ev("document.getElementById('tbNew').focus()");
    await open(p, 'SEE.app.shortcutsDialog()');
    await p.key('Escape');
    await p.waitGone('.modal-back');
    p.assert.equal(await p.ev('document.activeElement.id'), 'tbNew');
  });
  t.test('Escape in a prompt cancels it', async (p) => {
    await p.newFile(MAIN, PROG);
    const n = await p.ev('SEE.app.docs.length');
    await open(p, 'SEE.Files.newFile(SEE.app)');
    await p.key('Escape');
    await p.waitGone('.modal-back');
    p.assert.equal(await p.ev('SEE.app.docs.length'), n);
  });
  t.test('Escape closes only the top dialog', async (p) => {
    await open(p, 'SEE.app.aboutDialog()');
    await p.ev('SEE.app.shortcutsDialog()');
    await p.wait("document.querySelectorAll('.modal-back').length === 2");
    await p.key('Escape');
    await p.wait("document.querySelectorAll('.modal-back').length === 1");
    p.assert.equal(await title(p), 'About See');
  });
}
