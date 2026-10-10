// The layout: themes, terminal styles, hiding panels, splitters, panel tabs, the sizes the studio
// works at (desktop, tablet, phones), the phone view bar, touch targets, the status bar and the
// labels and roles that screen readers use.

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
const MAIN = '/home/user/e2e/main.c';
const PHONES = [[390, 844], [360, 740]];
const SIZES = [[1400, 900, false], [1024, 768, false], [820, 1180, true], [390, 844, true], [360, 740, true]];
const sizeOpts = ([w, h, touch]) => ({ width: w, height: h, mobile: w < 700, touch });

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
    a.clearBreakpoints();
    Object.assign(a.settings, { side: true, right: true, record: true, overflow: true, fontSize: 14, theme: 'auto', term: 'plain', args: '' });
    a.saveSettings(); a.applyTheme(); a.applyLayout();
  })()`);
  await p.sleep(20);
}
async function systemScheme(p, value) {
  await p.b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value }] });
  await p.sleep(60);
}
/** Drag with the mouse button held: press at (x0, y0), move to (x1, y1) in a few steps, release */
async function drag(p, sel, dx, dy) {
  const [x0, y0] = await p.center(sel);
  const x1 = x0 + dx, y1 = y0 + dy;
  await p.b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0, y: y0 });
  await p.b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x0, y: y0, button: 'left', buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 4; i++) await p.b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + (dx * i) / 4, y: y0 + (dy * i) / 4, button: 'left', buttons: 1 });
  await p.b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x1, y: y1, button: 'left', buttons: 0, clickCount: 1 });
  await p.sleep(60);
}
const width = (p, id) => p.ev(`document.getElementById('${id}').getBoundingClientRect().width`);
const height = (p, id) => p.ev(`document.getElementById('${id}').getBoundingClientRect().height`);
const theme = (p) => p.ev('document.documentElement.dataset.theme');
const view = (p) => p.ev("document.getElementById('app').dataset.view || null");
const activeMobile = (p) => p.ev("[...document.querySelectorAll('#mobilebar button.active')].map(b => b.id)");
const sunIcon = (p) => p.ev("document.querySelector('#btnTheme svg').innerHTML.includes('r=\"3.5\"')");

export default function (t) {
  t.beforeEach(reset);

  // ---- the theme toggle -------------------------------------------------------------------------------
  t.test('the theme button switches between light and dark', async (p) => {
    await p.ev("SEE.app.setTheme('light')");
    await p.click('#btnTheme');
    p.assert.equal(await theme(p), 'dark');
    p.assert.equal(await p.ev('SEE.app.settings.theme'), 'dark');
    await p.click('#btnTheme');
    p.assert.equal(await theme(p), 'light');
    p.assert.equal(await p.ev('SEE.app.settings.theme'), 'light');
  });
  t.test('the theme button shows a sun in dark and a moon in light', async (p) => {
    await p.ev("SEE.app.setTheme('dark')");
    p.assert.equal(await sunIcon(p), true);
    await p.click('#btnTheme');
    p.assert.equal(await theme(p), 'light');
    p.assert.equal(await sunIcon(p), false);
    p.assert.ok(await p.ev("document.querySelector('#btnTheme svg path').getAttribute('d').startsWith('M15.5 12.5')"), 'moon');
    p.assert.equal(await p.count('#btnTheme svg'), 1);
  });
  t.test('the theme button from Follow the system picks the opposite of what shows', async (p) => {
    const before = await theme(p);
    await p.click('#btnTheme');
    p.assert.equal(await theme(p), before === 'dark' ? 'light' : 'dark');
    p.assert.notEqual(await p.ev('SEE.app.settings.theme'), 'auto');
  });
  t.test('the chosen theme is remembered after a reload', async (p) => {
    await p.ev("SEE.app.setTheme('light')");
    await p.click('#btnTheme');
    await p.reload();
    p.assert.equal(await theme(p), 'dark');
    p.assert.equal(await p.ev('SEE.app.settings.theme'), 'dark');
    p.assert.equal(await sunIcon(p), true);
    await p.click('#btnTheme');
    await p.reload();
    p.assert.equal(await theme(p), 'light');
  }, { fresh: true });
  t.test('the theme changes the colours of the page', async (p) => {
    await p.ev("SEE.app.setTheme('light')");
    const light = await p.ev('getComputedStyle(document.body).backgroundColor');
    await p.ev("SEE.app.setTheme('dark')");
    const dark = await p.ev('getComputedStyle(document.body).backgroundColor');
    p.assert.notEqual(light, dark);
    p.assert.equal(await p.ev("getComputedStyle(document.documentElement).colorScheme"), 'dark');
  });
  t.test('the theme sets the browser colour for the title bar', async (p) => {
    await p.ev("SEE.app.setTheme('dark')");
    p.assert.equal(await p.ev("document.querySelector('meta[name=theme-color]').content"), '#2b2f3b');
    await p.ev("SEE.app.setTheme('light')");
    p.assert.equal(await p.ev("document.querySelector('meta[name=theme-color]').content"), '#aeb2c3');
  });
  t.test('the theme button has a label for screen readers', async (p) => {
    p.assert.equal(await p.attr('#btnTheme', 'aria-label'), 'Light or dark');
    p.assert.equal(await p.attr('#btnTheme', 'title'), 'Light or dark');
    p.assert.equal(await p.attr('#btnTheme svg', 'aria-hidden'), 'true');
  });

  // ---- View menu themes and following the system --------------------------------------------------------
  t.test('Follow the system shows light when the system is light', async (p) => {
    await systemScheme(p, 'light');
    await p.menu('View', 'Follow the system');
    p.assert.equal(await theme(p), 'light');
    await systemScheme(p, '');
  });
  t.test('Follow the system shows dark when the system is dark', async (p) => {
    await systemScheme(p, 'dark');
    await p.menu('View', 'Follow the system');
    p.assert.equal(await theme(p), 'dark');
    await systemScheme(p, '');
  });
  t.test('Follow the system changes with the system while the page is open', async (p) => {
    await systemScheme(p, 'light');
    await p.ev("SEE.app.setTheme('auto')");
    p.assert.equal(await theme(p), 'light');
    await systemScheme(p, 'dark');
    await p.wait("document.documentElement.dataset.theme === 'dark'", 2000);
    await systemScheme(p, 'light');
    await p.wait("document.documentElement.dataset.theme === 'light'", 2000);
    await systemScheme(p, '');
  });
  t.test('a chosen theme ignores the system', async (p) => {
    await systemScheme(p, 'light');
    await p.menu('View', 'Dark (Midnight)');
    p.assert.equal(await theme(p), 'dark');
    await systemScheme(p, 'dark');
    await systemScheme(p, 'light');
    p.assert.equal(await theme(p), 'dark');
    await systemScheme(p, '');
  });
  t.test('View > Light (Motif) is remembered after a reload', async (p) => {
    await p.menu('View', 'Light (Motif)');
    await p.reload();
    p.assert.equal(await theme(p), 'light');
    await p.menu('View');
    const it = await p.menuItems();
    p.assert.ok(it.find((x) => x.label === 'Light (Motif)').checked);
  }, { fresh: true });
  t.test('View > Follow the system is remembered after a reload', async (p) => {
    await p.ev("SEE.app.setTheme('dark')");
    await systemScheme(p, 'light');
    await p.menu('View', 'Follow the system');
    await p.reload();
    p.assert.equal(await p.ev('SEE.app.settings.theme'), 'auto');
    p.assert.equal(await theme(p), 'light');
    await systemScheme(p, '');
  }, { fresh: true });

  // ---- terminal styles -----------------------------------------------------------------------------------
  for (const [label, term, bg] of [['Terminal: green phosphor', 'phosphor', 'rgb(3, 8, 3)'], ['Terminal: amber', 'amber', 'rgb(10, 6, 0)']]) {
    t.test(`${label} recolours the terminal`, async (p) => {
      await p.showBottom('term');
      const plain = await p.ev("getComputedStyle(document.querySelector('.term')).backgroundColor");
      await p.menu('View', label);
      p.assert.equal(await p.ev('document.documentElement.dataset.term'), term);
      p.assert.equal(await p.ev("getComputedStyle(document.querySelector('.term')).backgroundColor"), bg);
      p.assert.notEqual(plain, bg);
    });
  }
  t.test('Terminal: plain goes back to the theme colours', async (p) => {
    await p.ev("SEE.app.setTheme('light')");
    await p.showBottom('term');
    const plain = await p.ev("getComputedStyle(document.querySelector('.term')).backgroundColor");
    await p.ev("SEE.app.setTerm('amber')");
    await p.menu('View', 'Terminal: plain');
    p.assert.equal(await p.ev("getComputedStyle(document.querySelector('.term')).backgroundColor"), plain);
  });
  t.test('the terminal style is remembered after a reload', async (p) => {
    await p.menu('View', 'Terminal: green phosphor');
    await p.reload();
    p.assert.equal(await p.ev('document.documentElement.dataset.term'), 'phosphor');
    p.assert.equal(await p.ev('SEE.app.settings.term'), 'phosphor');
  }, { fresh: true });
  t.test('the terminal style survives a theme change', async (p) => {
    await p.ev("SEE.app.setTerm('amber')");
    await p.click('#btnTheme');
    await p.click('#btnTheme');
    p.assert.equal(await p.ev('document.documentElement.dataset.term'), 'amber');
  });

  // ---- hiding and showing panels ----------------------------------------------------------------------------
  t.test('hiding the Files panel gives the editor the room', async (p) => {
    const before = await width(p, 'center');
    await p.menu('View', 'Files');
    p.assert.equal(await p.visible('#side'), false);
    p.assert.equal(await p.visible('#splitSide'), false);
    p.assert.ok((await width(p, 'center')) > before + 150);
    await p.menu('View', 'Files');
    p.assert.ok(await p.visible('#side'));
    p.assert.ok(await p.visible('#splitSide'));
    p.assert.ok(Math.abs((await width(p, 'center')) - before) < 2);
  });
  t.test('hiding the debugger area gives the editor the room', async (p) => {
    const before = await width(p, 'center');
    await p.menu('View', 'Memory and debugger');
    p.assert.equal(await p.visible('#right'), false);
    p.assert.equal(await p.visible('#splitRight'), false);
    p.assert.ok((await width(p, 'center')) > before + 250);
    await p.menu('View', 'Memory and debugger');
    p.assert.ok(await p.visible('#right'));
  });
  t.test('a hidden Files panel stays hidden after a reload', async (p) => {
    await p.menu('View', 'Files');
    await p.reload();
    p.assert.ok(await p.ev("document.getElementById('app').classList.contains('no-side')"));
    p.assert.equal(await p.visible('#side'), false);
    await p.menu('View', 'Files');
    await p.reload();
    p.assert.ok(await p.visible('#side'));
  }, { fresh: true });
  t.test('a hidden debugger area is saved in the settings', async (p) => {
    await p.menu('View', 'Memory and debugger');
    p.assert.equal(await p.ev("JSON.parse(localStorage.getItem('see.settings')).right"), false);
    p.assert.ok(await p.ev("document.getElementById('app').classList.contains('no-right')"));
  });
  t.test('a hidden debugger area stays hidden after a reload', async (p) => {
    // on start-up buildPanels() calls showRight(), which turns settings.right back on
    await p.menu('View', 'Memory and debugger');
    await p.reload();
    p.assert.ok(await p.ev("document.getElementById('app').classList.contains('no-right')"));
    p.assert.equal(await p.visible('#right'), false);
  }, { fresh: true });
  t.test('a failing program brings the hidden debugger area back', async (p) => {
    await p.ev('SEE.app.settings.right = false; SEE.app.applyLayout()');
    await p.runProgram('int main(void)\n{\n    int *q = 0;\n    return *q;\n}\n');
    p.assert.equal(await p.state(), 'faulted');
    p.assert.ok(await p.visible('#right'));
    p.assert.equal(await p.ev('SEE.app.rightTab'), 'memory');
  });
  t.test('hiding both side areas leaves the editor the whole width', async (p) => {
    await p.menu('View', 'Files');
    await p.menu('View', 'Memory and debugger');
    const w = await width(p, 'center');
    p.assert.ok(w >= 1390, 'center ' + w);
  });

  // ---- splitters ------------------------------------------------------------------------------------------
  t.test('dragging the Files splitter resizes the Files panel', async (p) => {
    const w0 = await width(p, 'side');
    await drag(p, '#splitSide', 90, 0);
    const w1 = await width(p, 'side');
    p.assert.ok(Math.abs(w1 - (w0 + 90)) <= 4, `${w0} -> ${w1}`);
  }, { fresh: true });
  t.test('the Files panel stops at 140 and 480 pixels', async (p) => {
    await drag(p, '#splitSide', -400, 0);
    p.assert.equal(await width(p, 'side'), 140);
    await drag(p, '#splitSide', 700, 0);
    p.assert.equal(await width(p, 'side'), 480);
  }, { fresh: true });
  t.test('dragging the debugger splitter resizes the right area', async (p) => {
    const w0 = await width(p, 'right');
    await drag(p, '#splitRight', 120, 0);
    const w1 = await width(p, 'right');
    p.assert.ok(Math.abs(w1 - (w0 - 120)) <= 4, `${w0} -> ${w1}`);
  }, { fresh: true });
  t.test('the right area stops at 280 pixels and leaves the editor room', async (p) => {
    await drag(p, '#splitRight', 800, 0);
    p.assert.equal(await width(p, 'right'), 280);
    await drag(p, '#splitRight', -1200, 0);
    const work = await width(p, 'work');
    p.assert.ok(Math.abs((await width(p, 'right')) - (work - 380)) <= 1);
  }, { fresh: true });
  t.test('dragging the terminal splitter resizes the bottom area', async (p) => {
    const h0 = await height(p, 'bottom');
    await drag(p, '#splitBottom', 0, -100);
    const h1 = await height(p, 'bottom');
    p.assert.ok(Math.abs(h1 - (h0 + 100)) <= 4, `${h0} -> ${h1}`);
  }, { fresh: true });
  t.test('the bottom area stops at 80 pixels', async (p) => {
    await drag(p, '#splitBottom', 0, 900);
    p.assert.equal(await height(p, 'bottom'), 80);
  }, { fresh: true });
  t.test('a splitter shows it is being dragged', async (p) => {
    const [x, y] = await p.center('#splitSide');
    await p.b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await p.b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
    await p.b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + 10, y, button: 'left', buttons: 1 });
    p.assert.ok(await p.ev("document.getElementById('splitSide').classList.contains('dragging')"));
    p.assert.ok(await p.ev("document.body.classList.contains('resizing')"));
    await p.b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + 10, y, button: 'left', buttons: 0, clickCount: 1 });
    await p.sleep(40);
    p.assert.ok(!(await p.ev("document.getElementById('splitSide').classList.contains('dragging')")));
    p.assert.ok(!(await p.ev("document.body.classList.contains('resizing')")));
  }, { fresh: true });
  t.test('splitter sizes are remembered after a reload', async (p) => {
    await drag(p, '#splitSide', 60, 0);
    await drag(p, '#splitRight', 100, 0);
    await drag(p, '#splitBottom', 0, -70);
    const before = [await width(p, 'side'), await width(p, 'right'), await height(p, 'bottom')];
    const saved = await p.ev("JSON.parse(localStorage.getItem('see.sizes'))");
    p.assert.deepEqual([saved.side, saved.right, saved.bottom].map(Math.round), before.map(Math.round));
    await p.reload();
    const after = [await width(p, 'side'), await width(p, 'right'), await height(p, 'bottom')];
    p.assert.deepEqual(after.map(Math.round), before.map(Math.round));
  }, { fresh: true });
  t.test('splitters are separators with an orientation and a label', async (p) => {
    for (const [id, o, l] of [['splitSide', 'vertical', 'Resize files'], ['splitRight', 'vertical', 'Resize debugger'], ['splitBottom', 'horizontal', 'Resize terminal']]) {
      p.assert.equal(await p.attr('#' + id, 'role'), 'separator');
      p.assert.equal(await p.attr('#' + id, 'aria-orientation'), o);
      p.assert.equal(await p.attr('#' + id, 'aria-label'), l);
    }
  });

  // ---- panel tabs -----------------------------------------------------------------------------------------
  for (const k of ['term', 'probs', 'log']) {
    t.test(`the bottom tab ${k} switches the bottom panel`, async (p) => {
      await p.showBottom(k === 'term' ? 'log' : 'term');
      await p.click('#tab-' + k);
      p.assert.equal(await p.ev('SEE.app.bottomTab'), k);
      p.assert.ok(await p.ev(`document.getElementById('tab-${k}').classList.contains('active')`));
      p.assert.equal(await p.attr('#tab-' + k, 'aria-selected'), 'true');
      p.assert.ok(await p.visible('#panel-' + k));
      for (const o of ['term', 'probs', 'log'].filter((x) => x !== k)) {
        p.assert.equal(await p.visible('#panel-' + o), false, o + ' hidden');
        p.assert.equal(await p.attr('#tab-' + o, 'aria-selected'), 'false');
      }
    });
  }
  for (const k of ['memory', 'vars', 'watch', 'bps', 'bytes']) {
    t.test(`the right tab ${k} switches the right panel`, async (p) => {
      await p.showRight(k === 'memory' ? 'vars' : 'memory');
      await p.click('#tab-' + k);
      p.assert.equal(await p.ev('SEE.app.rightTab'), k);
      p.assert.ok(await p.visible('#panel-' + k));
      p.assert.equal(await p.count('#rightTabs .ptab.active'), 1);
      p.assert.equal(await p.ev("document.querySelector('#rightTabs .ptab.active').id"), 'tab-' + k);
      const shown = await p.ev("[...document.querySelectorAll('#rightBody > .panel')].filter(x => x.style.display !== 'none').map(x => x.id)");
      p.assert.deepEqual(shown, ['panel-' + k]);
    });
  }
  t.test('the bottom tab is remembered after a reload', async (p) => {
    await p.click('#tab-log');
    await p.reload();
    p.assert.equal(await p.ev('SEE.app.bottomTab'), 'log');
    p.assert.ok(await p.visible('#panel-log'));
    p.assert.match(await p.panelText('log'), /Nothing built yet/);
  }, { fresh: true });
  t.test('the right tab is remembered after a reload', async (p) => {
    await p.click('#tab-bps');
    await p.reload();
    p.assert.equal(await p.ev('SEE.app.rightTab'), 'bps');
    p.assert.ok(await p.visible('#panel-bps'));
    p.assert.ok(await p.ev("document.getElementById('tab-bps').classList.contains('active')"));
  }, { fresh: true });
  t.test('the Problems tab shows a badge with the error count', async (p) => {
    await p.newFile(MAIN, 'int main(void)\n{\n    return a + b;\n}\n');
    await p.build();
    const errs = await p.ev("SEE.app.problems.filter(x => x.kind === 'error').length");
    p.assert.ok(errs >= 1);
    p.assert.equal(await p.text('#tab-probs .badge'), String(errs));
    p.assert.equal(await p.ev('SEE.app.bottomTab'), 'probs');
    await p.newFile(MAIN, PROG);
    await p.build();
    p.assert.equal(await p.exists('#tab-probs .badge'), false);
  });
  t.test('the Build log tab shows what the last build did', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.build();
    await p.click('#tab-log');
    const log = await p.panelText('log');
    p.assert.match(log, /cc -std=c89 main.c/);
    p.assert.match(log, /Build finished in \d+ ms: 0 errors, 0 warnings/);
  });

  // ---- sizes: desktop, tablet and phones --------------------------------------------------------------------
  for (const s of SIZES) {
    const [w, h] = s;
    t.test(`no horizontal page scroll at ${w}x${h}`, async (p) => {
      p.assert.ok(await p.noHScroll(), `scrollWidth ${await p.ev('document.documentElement.scrollWidth')}`);
      p.assert.equal(await p.ev('innerWidth'), w);
      const r = await p.rect('#app');
      p.assert.ok(r.right <= w + 1 && r.bottom <= h + 1, JSON.stringify(r));
    }, { fresh: sizeOpts(s) });
    t.test(`the toolbar fits or scrolls at ${w}x${h}`, async (p) => {
      const m = await p.ev("(() => { const t = document.getElementById('toolbar'); return { sw: t.scrollWidth, cw: t.clientWidth, ox: getComputedStyle(t).overflowX }; })()");
      if (w >= 1400) p.assert.ok(m.sw <= m.cw + 1, 'fits: ' + JSON.stringify(m));
      if (m.sw > m.cw + 1) {
        p.assert.ok(['auto', 'scroll'].includes(m.ox), JSON.stringify(m));
        await p.ev("document.getElementById('toolbar').scrollLeft = 10000");
        p.assert.ok((await p.ev("document.getElementById('toolbar').scrollLeft")) > 0, 'it scrolls');
        p.assert.ok(await p.visible('#tbLearn'), 'the last button can be reached');
        await p.ev("document.getElementById('toolbar').scrollLeft = 0");
      }
      p.assert.ok(await p.visible('#tbRun'));
      p.assert.ok(await p.noHScroll());
    }, { fresh: sizeOpts(s) });
    t.test(`the right parts show at ${w}x${h}`, async (p) => {
      const phone = w <= 720;
      p.assert.equal(await p.visible('#menubar'), !phone, 'menu bar');
      p.assert.equal(await p.visible('#mobilebar'), phone, 'view bar');
      p.assert.ok(await p.visible('#toolbar'));
      p.assert.ok(await p.visible('#statusbar'));
      p.assert.ok(await p.visible('#editors'));
      p.assert.equal(await p.visible('#side'), !phone, 'files');
      p.assert.equal(await p.visible('#right'), !phone, 'memory');
      p.assert.equal(await p.ev('SEE.app.isPhone()'), phone);
      if (!phone) p.assert.ok((await width(p, 'center')) >= 200, 'the editor keeps some width');
    }, { fresh: sizeOpts(s) });
  }
  t.test('the tablet narrows the side areas', async (p) => {
    p.assert.equal(await width(p, 'right'), 380);
    p.assert.equal(await width(p, 'side'), 190);
  }, { fresh: { width: 820, height: 1180, touch: true } });
  t.test('a dialog fits on a phone screen', async (p) => {
    await p.ev('SEE.Library.browse(SEE.app)');
    await p.waitModal();
    const r = await p.rect('.modal');
    p.assert.ok(r.x >= 0 && r.right <= 390 && r.bottom <= 844, JSON.stringify(r));
    p.assert.ok(await p.noHScroll());
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('a landscape phone counts as a phone', async (p) => {
    p.assert.equal(await p.ev('SEE.app.isPhone()'), true);
    p.assert.ok(await p.visible('#mobilebar'));
    p.assert.ok(await p.noHScroll());
  }, { fresh: { width: 844, height: 390, mobile: true, touch: true } });
  t.test('shrinking the window to phone size switches to the phone layout', async (p) => {
    p.assert.equal(await view(p), null);
    await p.viewport(390, 844, { mobile: true, touch: true });
    await p.wait("document.getElementById('app').dataset.view === 'code'", 2000);
    p.assert.ok(await p.visible('#mobilebar'));
    await p.viewport(1400, 900);
    await p.wait("!document.getElementById('app').dataset.view", 2000);
    p.assert.ok(await p.visible('#menubar'));
  }, { fresh: true });

  // ---- the phone view bar ------------------------------------------------------------------------------------
  for (const [w, h] of PHONES) {
    const ph = { width: w, height: h, mobile: true, touch: true };
    t.test(`the view bar has Files, Code, Run and Memory at ${w}x${h}`, async (p) => {
      p.assert.deepEqual((await p.texts('#mobilebar button')).map((x) => x.trim()), ['Files', 'Code', 'Run', 'Memory']);
      p.assert.equal(await view(p), 'code');
      p.assert.deepEqual(await activeMobile(p), ['mview-code']);
    }, { fresh: ph });
    for (const [k, shows, hides] of [['files', '#side', '#editors'], ['code', '#editors', '#bottom'], ['run', '#bottom', '#editors'], ['memory', '#right', '#editors']]) {
      t.test(`the ${k} view button shows its view at ${w}x${h}`, async (p) => {
        if (k === 'code') await p.tap('#mview-run');
        await p.tap('#mview-' + k);
        p.assert.equal(await view(p), k);
        p.assert.deepEqual(await activeMobile(p), ['mview-' + k]);
        p.assert.ok(await p.visible(shows), shows + ' shows');
        p.assert.equal(await p.visible(hides), false, hides + ' hides');
        const r = await p.rect(shows);
        p.assert.ok(r.w >= w - 2, 'it takes the whole width: ' + r.w);
        p.assert.ok(await p.noHScroll());
      }, { fresh: ph });
    }
    t.test(`debugging on a phone keeps the code view at ${w}x${h}`, async (p) => {
      await p.newFile(MAIN, PROG);
      await p.tap('#mview-code');
      await p.tap('#tbDebug');
      await p.waitState('paused');
      p.assert.equal(await view(p), 'code');
      await p.tap('#tbOver');
      await p.settle();
      p.assert.equal(await p.line(), 10);
      p.assert.equal(await view(p), 'code');
      p.assert.ok(await p.exists('.ed .exec, .exec-line, [class*=exec]'));
      await p.stopProgram();
    }, { fresh: ph });
  }
  t.test('debugging from the Files view on a phone shows the code', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.tap('#mview-files');
    await p.ev("SEE.app.startDebug('start')");
    await p.waitState('paused');
    p.assert.equal(await view(p), 'code');
    await p.stopProgram();
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('running on a phone shows the terminal', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.tap('#mview-code');
    await p.tap('#tbRun');
    await p.waitState('exited');
    p.assert.equal(await view(p), 'run');
    p.assert.ok(await p.visible('#panel-term'));
    p.assert.match(await p.output(), /^49$/m);
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('a program waiting for input on a phone shows the terminal', async (p) => {
    await p.newFile(MAIN, '#include <stdio.h>\nint main(void)\n{\n    int n;\n    scanf("%d", &n);\n    return n;\n}\n');
    await p.ev("SEE.app.startDebug('run')");
    await p.waitState('input');
    p.assert.equal(await view(p), 'run');
    await p.stopProgram();
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('a crash on a phone shows the line in the code view', async (p) => {
    await p.newFile(MAIN, 'int main(void)\n{\n    int *q = 0;\n    return *q;\n}\n');
    await p.tap('#mview-memory');
    await p.ev('SEE.app.run()');
    await p.waitState('faulted');
    p.assert.equal(await view(p), 'code');
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('opening a debugger panel on a phone shows the Memory view', async (p) => {
    await p.ev("SEE.app.showRight('watch')");
    p.assert.equal(await view(p), 'memory');
    p.assert.ok(await p.visible('#panel-watch'));
    await p.ev("SEE.app.showBottom('probs')");
    p.assert.equal(await view(p), 'run');
    p.assert.ok(await p.visible('#panel-probs'));
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('a build error on a phone can be tapped to go to its line', async (p) => {
    await p.newFile(MAIN, 'int main(void)\n{\n    return nope;\n}\n');
    await p.build();
    p.assert.equal(await view(p), 'code', 'the build jumps to the first error');
    await p.tap('#mview-run');
    await p.tap('#panel-probs .prob.error');
    p.assert.equal(await view(p), 'code');
    p.assert.equal(await p.ev('SEE.app.active.editor.cursor().line'), 2);
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });

  // ---- the lesson bar on a phone ---------------------------------------------------------------------------------
  t.test('a lesson on a phone shows the lesson bar in the code view', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.wait("!!document.getElementById('lessonMini')");
    p.assert.ok(await p.visible('#lessonMini'));
    p.assert.match(await p.text('#lessonMini'), /Hello, memory · ready/);
    p.assert.equal(await p.text('#lessonMiniNext'), 'Start');
    p.assert.equal(await p.visible('#lessonCard'), false, 'the card waits in the Memory view');
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('the lesson bar Next button moves the lesson on', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.wait("!!document.getElementById('lessonMiniNext')");
    await p.tap('#lessonMiniNext');
    await p.wait("/step 1 of/.test(document.getElementById('lessonMini').innerText) && !document.getElementById('lessonMiniNext').disabled", 15000);
    p.assert.equal(await p.text('#lessonMiniNext'), 'Next');
    // the step may move to the Memory view, where the card's own Next button takes over
    await p.tap((await p.visible('#lessonMiniNext')) ? '#lessonMiniNext' : '#lessonNext');
    await p.wait("/Step 2 of/.test(document.querySelector('#lessonCard .lesson-nav').innerText) && !document.getElementById('lessonNext').disabled", 15000);
    p.assert.match(await p.ev("document.getElementById('lessonMini').innerText"), /step 2 of/);
    p.assert.ok(await p.noHScroll());
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('the lesson bar Read button shows the lesson card', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.wait("!!document.getElementById('lessonMiniRead')");
    await p.tap('#lessonMiniRead');
    p.assert.equal(await view(p), 'memory');
    p.assert.ok(await p.visible('#lessonCard'));
    p.assert.equal(await p.visible('#lessonMini'), false, 'the bar hides where the card shows');
    p.assert.ok(await p.visible('#lessonNext'));
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('the lesson bar shows in the Run view and goes away when the lesson closes', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.wait("!!document.getElementById('lessonMini')");
    await p.tap('#mview-run');
    p.assert.ok(await p.visible('#lessonMini'));
    await p.ev('SEE.Lessons.close()');
    p.assert.equal(await p.exists('#lessonMini'), false);
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('the lesson bar is hidden on a desktop', async (p) => {
    await p.ev("SEE.Lessons.start(SEE.app, 'hello')");
    await p.wait("!!document.getElementById('lessonCard')");
    p.assert.equal(await p.visible('#lessonMini'), false);
    p.assert.ok(await p.visible('#lessonCard'));
  }, { fresh: true });

  // ---- touch targets -------------------------------------------------------------------------------------------
  for (const [w, h] of PHONES) {
    t.test(`touch targets are at least 34px at ${w}x${h}`, async (p) => {
      p.assert.ok(await p.ev("matchMedia('(pointer: coarse)').matches"), 'coarse pointer');
      const small = await p.ev(`[...document.querySelectorAll('#toolbar .tbtn, .titlebar .ibtn, #mobilebar button, #sideTools button, .pane-tools .ibtn')]
        .filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return { id: e.id || e.className, w: r.width, h: r.height }; })
        .filter(r => r.w < 34 || r.h < 34)`);
      p.assert.deepEqual(small, []);
      p.assert.ok((await p.rect('#mview-code')).h >= 44);
    }, { fresh: { width: w, height: h, mobile: true, touch: true } });
  }
  t.test('menu items are taller on a touch screen', async (p) => {
    await p.click('#tbLearn');
    await p.wait("!!document.querySelector('.menu-pop')", 2000);
    const hgt = await p.ev("document.querySelector('.menu-pop .menu-item').getBoundingClientRect().height");
    p.assert.ok(hgt >= 34, 'menu item ' + hgt);
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });
  t.test('title bar buttons are at least 34px on a touch tablet', async (p) => {
    p.assert.ok(await p.ev("matchMedia('(pointer: coarse)').matches"));
    for (const id of ['#btnTheme', '#btnHelpTop']) {
      const r = await p.rect(id);
      p.assert.ok(r.w >= 34 && r.h >= 34, id + ' ' + JSON.stringify(r));
    }
  }, { fresh: { width: 820, height: 1180, touch: true } });
  t.test('toolbar labels hide on a phone, leaving the icons', async (p) => {
    p.assert.equal(await p.visible('#tbRun .lbl'), false);
    p.assert.ok(await p.visible('#tbRun svg'));
    p.assert.equal(await p.visible('#menubar'), false);
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });

  // ---- the status bar -------------------------------------------------------------------------------------------
  t.test('the status bar starts Ready', async (p) => {
    p.assert.equal(await p.text('#stState'), 'Ready');
    p.assert.equal(await p.chip(), 'Ready');
  }, { fresh: true });
  t.test('the status bar shows the cursor position', async (p) => {
    await p.newFile(MAIN, PROG);
    await p.ev('SEE.app.active.editor.setCursor(0, 0)');
    p.assert.equal(await p.text('#stPos'), 'Ln 1, Col 1');
    await p.ev('SEE.app.active.editor.setCursor(9, 8)');
    p.assert.equal(await p.text('#stPos'), 'Ln 10, Col 9');
  });
  t.test('the status bar follows the debugger', async (p) => {
    await p.debugProgram(PROG);
    p.assert.equal(await p.text('#stState'), 'Paused');
    p.assert.match(await p.status(), /Ready at the first line of main/);
    await p.step('over');
    p.assert.match(await p.text('#stPos'), /statements run · Ln \d+, Col \d+/);
    p.assert.match(await p.status(), /Paused at line 10 in main\(\)/);
    await p.cont();
    p.assert.equal(await p.text('#stState'), 'Exited (0)');
    p.assert.match(await p.status(), /Program exited with status 0\. You can still step back/);
    await p.stopProgram();
    p.assert.equal(await p.text('#stState'), 'Stopped');
    p.assert.equal(await p.status(), 'Program stopped.');
  });
  t.test('the status bar reports a failed build', async (p) => {
    await p.newFile(MAIN, 'int main(void) { return q; }\n');
    await p.build();
    p.assert.equal(await p.text('#stState'), 'Build failed');
    p.assert.match(await p.status(), /^Build failed: 'q' undeclared/);
  });
  t.test('the status bar reports a crash', async (p) => {
    await p.runProgram('int main(void)\n{\n    int *q;\n    q = 0;\n    *q = 5;\n    return 0;\n}\n');
    p.assert.match(await p.status(), /^Segmentation fault at line 5: the memory picture shows the state/);
    p.assert.ok(await p.ev("document.getElementById('stateChip').classList.contains('fault')"));
    p.assert.equal(await p.text('#stState'), await p.chip());
  });
  t.test('the status bar names the crashing line right after a declaration', async (p) => {
    // at full speed the crash is put on line 3 (the declaration); the debugger puts it on line 4
    await p.runProgram('int main(void)\n{\n    int *q = 0;\n    return *q;\n}\n');
    p.assert.match(await p.status(), /at line 4:/);
  });
  t.test('the cursor position hides on a phone', async (p) => {
    p.assert.equal(await p.visible('#stPos'), false);
    p.assert.ok(await p.visible('#stState'));
  }, { fresh: { width: 390, height: 844, mobile: true, touch: true } });

  // ---- labels and roles ------------------------------------------------------------------------------------------
  t.test('every toolbar button has a label that matches its tooltip', async (p) => {
    // the Debug button's tooltip changes with the state; its label stays general
    const bad = await p.ev("[...document.querySelectorAll('#toolbar button')].filter(b => !b.getAttribute('aria-label') || (b.id !== 'tbDebug' && b.getAttribute('aria-label') !== b.title)).map(b => b.id)");
    p.assert.deepEqual(bad, [], JSON.stringify(bad));
    p.assert.equal(await p.count('#toolbar button'), 15);
    p.assert.equal(await p.attr('#tbSpeed', 'aria-label'), 'Animation speed');
    p.assert.equal(await p.ev("[...document.querySelectorAll('#toolbar button svg')].every(s => s.getAttribute('aria-hidden') === 'true')"), true);
  });
  t.test('toolbar buttons say their shortcut in their label', async (p) => {
    for (const [id, re] of [['tbNew', /Ctrl\+N/], ['tbOpen', /Ctrl\+O/], ['tbSave', /Ctrl\+S/], ['tbBuild', /Ctrl\+B/], ['tbRun', /Ctrl\+F5/], ['tbDebug', /F5/], ['tbOver', /F10/], ['tbInto', /F11/], ['tbOut', /Shift\+F11/], ['tbBack', /F8/], ['tbStop', /Shift\+F5/]]) {
      p.assert.match(await p.attr('#' + id, 'aria-label'), re, id);
    }
  });
  t.test('the Debug button label changes to Continue while paused', async (p) => {
    await p.debugProgram(PROG);
    p.assert.match(await p.attr('#tbDebug', 'title'), /^Continue to the next breakpoint/);
    p.assert.equal(await p.text('#tbDebug .lbl'), 'Continue');
    await p.stopProgram();
    p.assert.match(await p.attr('#tbDebug', 'title'), /^Start in the debugger/);
    p.assert.equal(await p.text('#tbDebug .lbl'), 'Debug');
  });
  t.test('the toolbar, menu bar and view bar have roles and names', async (p) => {
    p.assert.equal(await p.attr('#toolbar', 'role'), 'toolbar');
    p.assert.equal(await p.attr('#toolbar', 'aria-label'), 'Tools');
    p.assert.equal(await p.attr('#menubar', 'role'), 'menubar');
    p.assert.equal(await p.attr('#menubar', 'aria-label'), 'Menu');
    p.assert.equal(await p.attr('#mobilebar', 'aria-label'), 'Views');
    p.assert.equal(await p.ev("[...document.querySelectorAll('#menubar .mtop')].every(b => b.getAttribute('role') === 'menuitem')"), true);
  });
  t.test('panel tabs are tabs that control their panels', async (p) => {
    for (const list of ['#bottomTabs', '#rightTabs']) {
      p.assert.equal(await p.attr(list, 'role'), 'tablist');
      const bad = await p.ev(`[...document.querySelectorAll('${list} .ptab')].filter(t => { const pn = document.getElementById(t.getAttribute('aria-controls')); return t.getAttribute('role') !== 'tab' || !pn || pn.getAttribute('role') !== 'tabpanel'; }).map(t => t.id)`);
      p.assert.deepEqual(bad, []);
      p.assert.equal(await p.ev(`[...document.querySelectorAll('${list} .ptab')].filter(t => t.getAttribute('aria-selected') === 'true').length`), 1);
    }
    p.assert.equal(await p.attr('#bottomTabs', 'aria-label'), 'Output');
    p.assert.equal(await p.attr('#rightTabs', 'aria-label'), 'Debugger');
  });
  t.test('editor tabs are tabs with a labelled close button', async (p) => {
    await p.newFile(MAIN, PROG);
    p.assert.equal(await p.attr('#tabs', 'role'), 'tablist');
    p.assert.equal(await p.attr('#tabs .tab.active', 'role'), 'tab');
    p.assert.equal(await p.attr('#tabs .tab.active', 'aria-selected'), 'true');
    p.assert.equal(await p.attr('#tabs .tab.active .tclose', 'aria-label'), 'Close main.c');
    p.assert.equal(await p.ev("[...document.querySelectorAll('#tabs .tab')].filter(t => t.getAttribute('aria-selected') === 'true').length"), 1);
  });
  t.test('the Files panel and debugger area are labelled regions', async (p) => {
    p.assert.equal(await p.attr('#side', 'aria-label'), 'Files');
    p.assert.equal(await p.attr('#right', 'aria-label'), 'Memory and debugger');
    p.assert.equal(await p.ev("document.getElementById('side').tagName"), 'ASIDE');
    p.assert.equal(await p.attr('#termOut', 'aria-label'), 'Program output');
    p.assert.equal(await p.attr('#termInput', 'aria-label'), 'Type input for the program');
  });
}
