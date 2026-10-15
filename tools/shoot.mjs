// Screenshots for the README: node tools/shoot.mjs [name ...]
// Each shot loads a fresh page, sets up a program, drives the studio and captures the window
// (or a part of it) into docs/images/<name>.png.
import { launch } from './cdp.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (n) => join(root, 'docs/images', n + '.png');
const only = process.argv.slice(2);
const W = 1440, H = 900;

const LIST = `#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

void push(struct node **head, int value)
{
    struct node *n = malloc(sizeof *n);
    n->value = value;
    n->next = *head;
    *head = n;
}

int main(void)
{
    struct node *head = NULL;
    const char *title = "a list";
    int i;

    for (i = 1; i <= 4; i++)
        push(&head, i * 10);
    printf("%s: %d %d\\n", title, head->value, head->next->value);
    return 0;
}
`;

async function page(b, opts = {}) {
  await b.send('Emulation.setDeviceMetricsOverride', { width: opts.w || W, height: opts.h || H, deviceScaleFactor: opts.scale || 1, mobile: !!opts.mobile });
  await b.send('Emulation.setTouchEmulationEnabled', { enabled: !!opts.mobile, maxTouchPoints: 5 });
  await b.send('Storage.clearDataForOrigin', { origin: b.url.replace(/\/$/, ''), storageTypes: 'all' }).catch(() => {});
  await b.send('Page.navigate', { url: 'about:blank' });   // a hash-only change would not load the page again
  await b.sleep(100);
  await b.goto('index.html#notour');
  await b.waitFor('window.__seeReady === true', 20000);
  await b.eval(`SEE.app.setTheme(${JSON.stringify(opts.theme || 'light')})`);
  await b.eval("SEE.app.memview.opts.types = false; SEE.app.memview.saveOpts();");
  await b.sleep(150);
}
const file = (b, path, text) => b.eval(`(() => { const v = SEE.app.vfs; const P = ${JSON.stringify(path)}; v.mkdir(P.replace(/\\/[^/]*$/, ''), { parents: true, exist: true, trusted: true }); v.writeText(P, ${JSON.stringify(text)}, { trusted: true }); const d = SEE.app.docByPath(P); if (d) { d.editor.setValue(v.readText(P)); d.savedText = d.editor.getValue(); d.dirty = false; } SEE.app.openFile(P); SEE.app.renderSide(); })()`);
const settle = (b) => b.waitFor("!SEE.app.running && SEE.app.vm && SEE.app.vm.state !== 'running'", 20000);
const debug = async (b) => { await b.eval("SEE.app.startDebug('start')"); await settle(b); };
const step = async (b, mode, n) => { for (let i = 0; i < (n || 1); i++) { await b.eval(`SEE.app.step(${JSON.stringify(mode)})`); await settle(b); } };
const to = async (b, path, line) => { await b.eval(`(() => { const a = SEE.app; a.dbg.tempBreak = a.dbg.setBreakpoint(${JSON.stringify(path)}, ${line}, { temp: true }); a.resume('run'); })()`); await settle(b); };
const closeExtras = (b) => b.eval("(() => { for (const d of SEE.app.docs.slice()) if (d !== SEE.app.active) { d.dirty = false; SEE.app.closeDoc(d); } })()");
async function shot(b, name, clip) {
  await b.sleep(350);
  const params = { format: 'png' };
  if (clip) {
    const r = typeof clip === 'string' ? await b.eval(`(() => { const r = document.querySelector(${JSON.stringify(clip)}).getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; })()`) : clip;
    params.clip = Object.assign({ scale: 1 }, r);
  }
  const r = await b.send('Page.captureScreenshot', params);
  writeFileSync(out(name), Buffer.from(r.data, 'base64'));
  console.log('wrote ' + name);
}

const SHOTS = {
  async overview(b) {
    await page(b);
    await file(b, '/home/user/list/list.c', LIST);
    await closeExtras(b);
    await debug(b);
    await to(b, '/home/user/list/list.c', 25);
    await b.eval("SEE.app.showRight('memory')");
    await shot(b, 'overview');
  },
  async dark(b) {
    await page(b, { theme: 'dark' });
    await file(b, '/home/user/list/list.c', LIST);
    await closeExtras(b);
    await debug(b);
    await to(b, '/home/user/list/list.c', 13);
    await step(b, 'over', 2);
    await shot(b, 'dark');
  },
  async jagged(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/jagged/jagged.c')");
    await closeExtras(b);
    await debug(b);
    await to(b, '/examples/jagged/jagged.c', 18);
    await shot(b, 'memory-jagged', '#right');
  },
  async strings(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/strings/where.c')");
    await closeExtras(b);
    await debug(b);
    await to(b, '/examples/strings/where.c', 20);
    await b.eval("SEE.app.memview.forceOpen = new Set(['local']); SEE.app.renderPanels()");
    await shot(b, 'strings');
  },
  async recursion(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/hanoi/hanoi.c')");
    await closeExtras(b);
    await debug(b);
    await step(b, 'into', 7);
    await b.eval("SEE.app.selectFrame(2)");
    await b.eval("SEE.app.showRight('vars')");
    await shot(b, 'recursion');
  },
  async fault(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/off-by-one/bug.c')");
    await closeExtras(b);
    await debug(b);
    await b.eval("SEE.app.resume('run')");
    await settle(b);
    await b.eval("SEE.app.memview.forceOpen = new Set(['scores']); SEE.app.renderPanels()");
    await shot(b, 'fault');
  },
  async stepback(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/off-by-one/bug.c')");
    await closeExtras(b);
    await debug(b);
    await b.eval("SEE.app.resume('run')");
    await settle(b);
    await b.eval('SEE.app.stepBack()');
    await b.eval('SEE.app.stepBack()');
    await b.eval("SEE.app.memview.forceOpen = new Set(['scores']); SEE.app.renderPanels()");
    await shot(b, 'stepback');
  },
  async callout(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/swap/swap.c')");
    await closeExtras(b);
    await debug(b);
    await to(b, '/examples/swap/swap.c', 16);
    // point at *x on line 16
    const pos = await b.eval("(() => { const e = SEE.app.active.editor; const r = e.ta.getBoundingClientRect(); return [r.left + e.padLeft + e.charWidth * 14.5 - e.ta.scrollLeft, r.top + e.padTop + e.lineHeight * 15.5 - e.ta.scrollTop]; })()");
    await b.eval('(() => { const a = SEE.app; const d = a.active; a.callout.showFor(d, { line: 15, col: 5, text: d.editor.getLine(15) }, ' + pos[0] + ', ' + pos[1] + '); })()');
    await b.waitFor("!!document.querySelector('.callout')", 5000);
    await b.eval("document.querySelector('.callout .vv.edit') && document.querySelector('.callout .vv.edit').click()");
    await shot(b, 'callout');
  },
  async watch(b) {
    await page(b);
    await file(b, '/home/user/list/list.c', LIST);
    await closeExtras(b);
    await debug(b);
    await b.eval("['head', 'head->next', 'i * 10', 'title[2]'].forEach(w => SEE.app.watchPanel.add(w)); SEE.app.showRight('watch')");
    await to(b, '/home/user/list/list.c', 25);
    await b.eval("SEE.app.toggleWatchpoint('head')");
    await shot(b, 'watch');
  },
  async bytes(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/padding/padding.c')");
    await closeExtras(b);
    await debug(b);
    await to(b, '/examples/padding/padding.c', 28);
    await b.eval("SEE.app.showRight('bytes'); SEE.app.bytesPanel.goTo('&s')");
    await b.eval("(() => { const b = document.querySelectorAll('.hex-row b')[9]; b.dispatchEvent(new MouseEvent('mouseenter')); })()");
    await shot(b, 'bytes');
  },
  async problems(b) {
    await page(b);
    await file(b, '/home/user/oops/oops.c', '#include <stdio.h>\n\nint main(void)\n{\n    const int limit = 10;\n    char *name = "Ada";\n    int count;\n    limit = 20;\n    if (count = 3)\n        printf("%d %s\\n", name, count);\n    return 0;\n}\n');
    await closeExtras(b);
    await b.eval('SEE.app.build()');
    await b.eval("SEE.app.showBottom('probs')");
    await shot(b, 'problems');
  },
  async lesson(b) {
    await page(b);
    await b.eval("SEE.Lessons.start(SEE.app, 'const-pointers')");
    await b.eval("SEE.Lessons.go(SEE.Lessons.current, 1)");
    await b.waitFor('!SEE.Lessons.current.busy', 20000);
    await shot(b, 'lesson');
  },
  async lessons(b) {
    await page(b);
    await b.eval('void SEE.Lessons.browse(SEE.app)');
    await shot(b, 'lessons-list');
  },
  async library(b) {
    await page(b);
    await b.eval('SEE.Library.browse(SEE.app)');
    await b.eval("document.querySelector('.lib-cat[data-cat=datastruct]').click()");
    await shot(b, 'library');
  },
  async reference(b) {
    await page(b);
    await b.eval("SEE.Help.open(SEE.app, 'printf')");
    await shot(b, 'reference');
  },
  async welcome(b) {
    await page(b);
    await b.eval('SEE.Tours.welcome(SEE.app)');
    await shot(b, 'welcome');
  },
  async tour(b) {
    await page(b);
    await b.eval("SEE.Tours.start(SEE.app, 'welcome')");
    for (let i = 0; i < 6; i++) { await b.waitFor(`document.querySelector('#tourPop .count') && document.querySelector('#tourPop .count').textContent.startsWith('${i + 1} of')`, 15000); if (i < 5) await b.eval("document.getElementById('tourNext').click()"); }
    await shot(b, 'tour');
  },
  async files(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/stack-module/main.c'); SEE.app.openFile('/examples/stack-module/stack.h'); SEE.app.openFile('/usr/include/stdio.h')");
    await b.eval("['/examples', '/examples/stack-module', '/usr', '/usr/include'].forEach(p => SEE.app.expanded.add(p)); SEE.app.renderSide()");
    await b.eval("SEE.app.openFile('/examples/stack-module/stack.c')");
    await b.eval('SEE.app.build()');
    await b.eval("SEE.app.showBottom('log')");
    await shot(b, 'files');
  },
  async input(b) {
    await page(b);
    await b.eval("SEE.app.setTerm('phosphor')");
    await b.eval("SEE.app.openFile('/examples/calculator/calc.c')");
    await closeExtras(b);
    await b.eval('SEE.app.run()');
    await settle(b);
    await b.eval("SEE.app.terminal.send('6 * 7'); ");
    await settle(b);
    await b.eval("SEE.app.terminal.send('2.5 / 0.5')");
    await settle(b);
    await shot(b, 'terminal');
  },
  async funcptr(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/calculator/calc.c')");
    await closeExtras(b);
    await debug(b);
    await b.eval("SEE.app.memview.opts.lib = false; SEE.app.memview.forceOpen = new Set(['ops']); SEE.app.renderPanels()");
    await shot(b, 'funcptr', '#right');
  },
  async linkmap(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/stack-module/main.c')");
    await b.eval('SEE.app.showLinkMap()');
    await shot(b, 'linkmap');
  },
  async share(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/swap/swap.c')");
    await b.eval("void SEE.Files.shareDialog(SEE.app, '/examples/swap')");
    await b.waitFor("!!document.getElementById('shareLink')", 5000);
    await shot(b, 'share');
  },
  async author(b) {
    await page(b);
    await b.eval('void SEE.authorDialog()');
    await shot(b, 'author');
  },
  async phone(b) {
    const shots = [];
    for (const v of ['code', 'memory', 'run']) {
      await page(b, { w: 390, h: 844, mobile: true, scale: 2 });
      await b.eval("SEE.app.openFile('/examples/jagged/jagged.c')");
      await closeExtras(b);
      await debug(b);
      await to(b, '/examples/jagged/jagged.c', 18);
      if (v === 'run') { await b.eval("SEE.app.resume('run')"); await settle(b); }
      await b.eval(`SEE.app.setView(${JSON.stringify(v)})`);
      await b.sleep(400);
      const r = await b.send('Page.captureScreenshot', { format: 'png' });
      shots.push(Buffer.from(r.data, 'base64'));
    }
    // three phone screens side by side
    const { execFileSync } = await import('node:child_process');
    const tmp = shots.map((s, i) => { const p = join(root, 'docs/images', '.phone' + i + '.png'); writeFileSync(p, s); return p; });
    execFileSync('python3', ['-c', `
import sys
from PIL import Image
ims=[Image.open(p) for p in sys.argv[1:4]]
w=sum(i.width for i in ims)+40; h=max(i.height for i in ims)
o=Image.new('RGB',(w,h),(174,178,195))
x=0
for i in ims:
    o.paste(i,(x,0)); x+=i.width+20
o=o.resize((o.width//2,o.height//2), Image.LANCZOS)
o.save(sys.argv[4])
`, ...tmp, out('phone')]);
    for (const p of tmp) (await import('node:fs')).rmSync(p);
    console.log('wrote phone');
  },
  async tablet(b) {
    await page(b, { w: 1180, h: 820 });
    await b.eval("SEE.app.openFile('/examples/linked-list/list.c')");
    await closeExtras(b);
    await debug(b);
    await to(b, '/examples/linked-list/list.c', 38);
    await shot(b, 'tablet');
  },
  async preprocessed(b) {
    await page(b);
    await b.eval("SEE.app.openFile('/examples/const/const.c')");
    await b.eval('SEE.app.showPreprocessed()');
    await shot(b, 'preprocessed');
  },
};

const b = await launch({ width: W, height: H });
try {
  for (const [name, fn] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(name)) continue;
    try { await fn(b); } catch (e) { console.log('FAILED ' + name + ': ' + e.message); }
    const ex = b.logs.filter((l) => l.type === 'exception');
    if (ex.length) { console.log('page exceptions in ' + name + ': ' + ex.map((x) => x.text).join(' | ')); b.logs.length = 0; }
  }
} finally { await b.close(); }
