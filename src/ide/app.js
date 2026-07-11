// The studio: files and editors, building, running and debugging, and the panels around them.
(function (SEE) {
  'use strict';
  const { h, icon } = SEE.UI;
  const store = SEE.UI.storage;
  const PROTECTED = /^\/(examples|library|lessons|usr)(\/|$)/i;
  const isC = (p) => /\.c$/i.test(p);
  const isSource = (p) => /\.(c|h|txt|in|dat|csv|md)$/i.test(p) || !/\.[^/]+$/.test(p);
  const DEFAULTS = { theme: 'auto', term: 'plain', fontSize: 14, autosave: true, firstRun: true, overflow: true, record: true, args: '', libFrames: false, speed: 3, side: true, right: true };
  const SPEEDS = [1200, 700, 400, 220, 110, 50, 15];
  const SLICE = 30000;

  class App {
    constructor() {
      SEE.app = this;
      this.settings = Object.assign({}, DEFAULTS, store.get('settings', {}));
      this.docs = [];
      this.active = null;
      this.breakpoints = new Map();
      for (const [p, m] of Object.entries(store.get('breakpoints', {}))) this.breakpoints.set(p, new Map(m));
      this.expanded = new Set(store.get('expanded', ['/home', '/home/user', '/examples']));
      this.vfs = new SEE.VFS();
      this.vm = null;
      this.dbg = null;
      this.frameIndex = 0;
      this.problems = [];
      this.buildLog = '';
      this.applyTheme();
      try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (this.settings.theme === 'auto') this.applyTheme(); }); } catch (e) { /* old browsers */ }
      this.buildMenus();
      this.buildToolbar();
      this.buildPanels();
      this.buildMobile();
      this.callout = new SEE.Callout(this);
      this.bindSplitters();
      this.bindKeys();
      this.applyLayout();
      this.built = true;
      this.renderTabs();
      this.updateUI();
      window.addEventListener('beforeunload', (e) => {
        this.autosaveAll();
        if (this.docs.some((d) => d.dirty)) { e.preventDefault(); e.returnValue = ''; }
      });
      window.addEventListener('resize', () => { this.applyLayout(); this.memview.drawArrows(); });
      setInterval(() => this.autosaveAll(), 4000);
      this.init();
    }

    async init() {
      try { await this.vfs.persist('see-disk'); } catch (e) { /* private mode: memory only */ }
      for (const d of ['/home', '/home/user', '/tmp']) this.vfs.mkdir(d, { exist: true, trusted: true });
      this.installSystem();
      if (SEE.Samples) SEE.Samples.install(this);
      this.restoreSession();
      this.renderSide();
      this.renderProblems();
      const hash = location.hash;
      if (/#share=/.test(hash)) SEE.Files.importShare(this, hash);
      else if (/#lesson=/.test(hash) && SEE.Lessons) SEE.Lessons.startById(this, decodeURIComponent(hash.split('=')[1]));
      else if (/#example=/.test(hash) && SEE.Library) SEE.Library.openById(this, decodeURIComponent(hash.split('=')[1]));
      window.__seeReady = true;
      if (this.settings.firstRun && !/#notour|#share=|#lesson=|#example=/.test(hash)) {
        this.settings.firstRun = false;
        this.saveSettings();
        setTimeout(() => this.welcome(), 500);
      }
    }

    /** The standard headers, readable under /usr/include */
    installSystem() {
      const v = this.vfs;
      v.mkdir('/usr/include', { parents: true, exist: true, trusted: true });
      for (const [name, text] of Object.entries(SEE.Headers.files)) v.writeText('/usr/include/' + name, text, { trusted: true });
      v.mkdir('/usr/lib', { parents: true, exist: true, trusted: true });
      v.writeText('/usr/lib/libc.c', SEE.Headers.libc, { trusted: true });
      v.entries.get('/usr').readOnly = true;
    }

    // ---- settings and theme -----------------------------------------------------------------------
    saveSettings() { store.set('settings', this.settings); }
    applyTheme() {
      let t = this.settings.theme;
      if (t === 'auto') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
      document.documentElement.dataset.term = this.settings.term;
      document.documentElement.style.setProperty('--code-size', this.settings.fontSize + 'px');
      const meta = document.querySelector('meta[name=theme-color]');
      if (meta) meta.content = t === 'dark' ? '#2b2f3b' : '#aeb2c3';
      const b = document.getElementById('btnTheme');
      if (b) { b.innerHTML = ''; b.appendChild(icon(t === 'dark' ? 'sun' : 'moon')); }
      for (const d of this.docs || []) d.editor.render();
    }
    setTheme(t) { this.settings.theme = t; this.saveSettings(); this.applyTheme(); }
    toggleTheme() { this.setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); }
    zoomCode(dir) { this.settings.fontSize = SEE.clamp(this.settings.fontSize + dir, 10, 26); this.saveSettings(); this.applyTheme(); }

    // ---- menus and toolbar --------------------------------------------------------------------------
    buildMenus() {
      const bar = document.getElementById('menubar');
      const menus = [['File', 'F'], ['Edit', 'E'], ['View', 'V'], ['Build', 'B'], ['Debug', 'D'], ['Learn', 'L'], ['Help', 'H']];
      this.menuBtns = [];
      menus.forEach(([name], i) => {
        const b = h('button.mtop', { type: 'button', role: 'menuitem', 'aria-haspopup': 'true', id: 'menu' + name }, h('u', name[0]), name.slice(1));
        b.addEventListener('click', () => this.openMenu(i));
        b.addEventListener('mouseenter', () => { if (this.menuOpen !== undefined && this.menuOpen !== null && this.menuOpen !== i) this.openMenu(i); });
        bar.appendChild(b);
        this.menuBtns.push(b);
      });
      document.getElementById('btnTheme').addEventListener('click', () => this.toggleTheme());
      const hb = document.getElementById('btnHelpTop');
      hb.appendChild(icon('help'));
      hb.addEventListener('click', (e) => this.openMenu(6, hb));
    }
    menuItems(i) {
      const vm = this.vm;
      const paused = !!(vm && vm.state === 'paused');
      const running = this.running;
      const dbg = !!this.dbg;
      const a = this.active;
      switch (i) {
        case 0: return [
          { label: 'New file…', sc: 'Ctrl+N', action: () => SEE.Files.newFile(this) },
          { label: 'New project…', action: () => SEE.Files.newProject(this) },
          { label: 'Open…', sc: 'Ctrl+O', action: () => SEE.Files.openDialog(this) },
          { label: 'Open a shared program…', action: () => SEE.Files.importDialog(this) },
          { sep: true },
          { label: 'Save', sc: 'Ctrl+S', action: () => this.save(), disabled: !a },
          { label: 'Save as…', action: () => this.saveAs(a), disabled: !a },
          { label: 'Save all', action: () => this.saveAll() },
          { label: 'Close', sc: 'Ctrl+W', action: () => a && this.closeDoc(a), disabled: !a },
          { sep: true },
          { label: 'Share this project as a link…', action: () => a && SEE.Files.shareDialog(this, this.projectDir()), disabled: !a },
          { label: 'Download this file', action: () => a && SEE.Files.download(this, a.path), disabled: !a },
          { label: 'Download this project as .zip', action: () => a && SEE.Files.downloadZip(this, this.projectDir()), disabled: !a },
          { label: 'Bring files from your computer…', action: () => SEE.Files.importFiles(this) },
          { label: 'Use a folder from your computer…', action: () => SEE.Files.mountDialog(this) },
          { sep: true },
          { label: 'Settings…', action: () => this.settingsDialog() },
        ];
        case 1: return [
          { label: 'Undo', sc: 'Ctrl+Z', action: () => { a && a.editor.focus(); document.execCommand('undo'); }, disabled: !a },
          { label: 'Redo', sc: 'Ctrl+Y', action: () => { a && a.editor.focus(); document.execCommand('redo'); }, disabled: !a },
          { sep: true },
          { label: 'Find…', sc: 'Ctrl+F', action: () => this.findDialog(false), disabled: !a },
          { label: 'Replace…', sc: 'Ctrl+H', action: () => this.findDialog(true), disabled: !a },
          { label: 'Go to line…', sc: 'Ctrl+G', action: () => this.gotoLineDialog(), disabled: !a },
          { sep: true },
          { label: 'Comment or uncomment lines', sc: 'Ctrl+/', action: () => a && a.editor.toggleComment(), disabled: !a },
          { label: 'Indent', sc: 'Tab', action: () => a && a.editor.indentSelection(1), disabled: !a },
          { label: 'Unindent', sc: 'Shift+Tab', action: () => a && a.editor.indentSelection(-1), disabled: !a },
        ];
        case 2: return [
          { label: 'Files', checked: this.settings.side, action: () => { this.settings.side = !this.settings.side; this.saveSettings(); this.applyLayout(); } },
          { label: 'Memory and debugger', checked: this.settings.right, action: () => { this.settings.right = !this.settings.right; this.saveSettings(); this.applyLayout(); } },
          { sep: true },
          { label: 'Memory picture', action: () => this.showRight('memory') },
          { label: 'Variables and call stack', action: () => this.showRight('vars') },
          { label: 'Watch', action: () => this.showRight('watch') },
          { label: 'Breakpoints', action: () => this.showRight('bps') },
          { label: 'Bytes', action: () => this.showRight('bytes') },
          { label: 'Terminal', action: () => this.showBottom('term') },
          { label: 'Problems', action: () => this.showBottom('probs') },
          { sep: true },
          { label: 'Light (Motif)', checked: this.settings.theme === 'light', action: () => this.setTheme('light') },
          { label: 'Dark (Midnight)', checked: this.settings.theme === 'dark', action: () => this.setTheme('dark') },
          { label: 'Follow the system', checked: this.settings.theme === 'auto', action: () => this.setTheme('auto') },
          { sep: true },
          { label: 'Terminal: plain', checked: this.settings.term === 'plain', action: () => this.setTerm('plain') },
          { label: 'Terminal: green phosphor', checked: this.settings.term === 'phosphor', action: () => this.setTerm('phosphor') },
          { label: 'Terminal: amber', checked: this.settings.term === 'amber', action: () => this.setTerm('amber') },
          { sep: true },
          { label: 'Bigger code', sc: 'Ctrl+=', action: () => this.zoomCode(1) },
          { label: 'Smaller code', sc: 'Ctrl+-', action: () => this.zoomCode(-1) },
        ];
        case 3: return [
          { label: 'Build', sc: 'Ctrl+B', action: () => this.build(), disabled: !a || running },
          { label: 'Run', sc: 'Ctrl+F5', action: () => this.run(), disabled: !a || running },
          { label: 'Run with arguments…', action: () => this.argsDialog(), disabled: !a },
          { label: 'Stop', sc: 'Shift+F5', action: () => this.stop(), disabled: !vm },
          { sep: true },
          { label: 'Show the preprocessed file', action: () => this.showPreprocessed(), disabled: !a || !isC(a.path) },
          { label: 'Show what the linker made', action: () => this.showLinkMap(), disabled: !a },
          { label: 'Check for integer overflow', checked: this.settings.overflow, action: () => { this.settings.overflow = !this.settings.overflow; this.saveSettings(); } },
        ];
        case 4: return [
          { label: dbg && paused ? 'Continue' : 'Debug', sc: 'F5', action: () => this.debugOrContinue(), disabled: !a || (running && !paused) },
          { label: 'Pause', action: () => this.pause(), disabled: !running },
          { label: 'Stop', sc: 'Shift+F5', action: () => this.stop(), disabled: !vm },
          { sep: true },
          { label: 'Step over', sc: 'F10', action: () => this.step('over'), disabled: !a || (running && !paused) },
          { label: 'Step into', sc: 'F11', action: () => this.step('into'), disabled: !a || (running && !paused) },
          { label: 'Step out', sc: 'Shift+F11', action: () => this.step('out'), disabled: !paused },
          { label: 'One statement', sc: 'Ctrl+F11', action: () => this.step('stmt'), disabled: !a || (running && !paused) },
          { label: 'Step back', sc: 'F8', action: () => this.stepBack(), disabled: !this.canBack() },
          { label: 'Step back one statement', sc: 'Shift+F8', action: () => this.stepBack(true), disabled: !this.canBack() },
          { label: 'Run to the cursor', sc: 'Ctrl+F10', action: () => this.runToCursor(), disabled: !a },
          { label: this.animating ? 'Stop animating' : 'Animate (step by itself)', action: () => this.toggleAnimate(), disabled: !a },
          { sep: true },
          { label: 'Toggle breakpoint', sc: 'F9', action: () => a && this.toggleBreakpoint(a.path, a.editor.cursor().line), disabled: !a },
          { label: 'Remove all breakpoints', action: () => this.clearBreakpoints() },
          { label: 'Watch an expression…', action: () => { this.showRight('watch'); setTimeout(() => { const w = document.getElementById('watchInput'); if (w) w.focus(); }, 50); } },
          { label: 'Keep a history to step back', checked: this.settings.record, action: () => { this.settings.record = !this.settings.record; this.saveSettings(); } },
        ];
        case 5: return [
          { label: 'Lessons…', action: () => SEE.Lessons && SEE.Lessons.browse(this) },
          { label: 'Guided tours…', action: () => SEE.Tours && SEE.Tours.menu(this) },
          { label: 'Example library…', action: () => SEE.Library && SEE.Library.browse(this) },
          { sep: true },
          { label: 'Welcome', action: () => this.welcome() },
        ];
        case 6: return [
          { label: 'C reference…', sc: 'F1', action: () => this.showReference('') },
          { label: 'Keyboard shortcuts', action: () => this.shortcutsDialog() },
          { label: 'What the colours in memory mean', action: () => this.memoryHelp() },
          { sep: true },
          { label: 'About See', action: () => this.aboutDialog() },
          { label: 'About the author', action: () => SEE.authorDialog && SEE.authorDialog() },
        ];
      }
      return [];
    }
    openMenu(i, anchor) {
      const b = anchor || this.menuBtns[i];
      SEE.UI.closeMenus();
      this.menuBtns.forEach((x) => x.classList.remove('open'));
      b.classList.add('open');
      this.menuOpen = i;
      const r = b.getBoundingClientRect();
      SEE.UI.showMenu(this.menuItems(i), anchor ? r.right - 220 : r.left, r.bottom, {
        anchor: b, keyboard: true,
        onClose: () => { b.classList.remove('open'); if (this.menuOpen === i) this.menuOpen = null; },
        onArrow: (d) => { if (!anchor) this.openMenu((i + d + this.menuBtns.length) % this.menuBtns.length); },
      });
    }

    buildToolbar() {
      const tb = document.getElementById('toolbar');
      const btn = (id, ic, label, title, fn, primary) => {
        const b = h('button.tbtn' + (primary ? '.primary' : ''), { type: 'button', id, title, 'aria-label': title }, icon(ic), h('span.lbl', label));
        b.addEventListener('click', fn);
        tb.appendChild(b);
        return b;
      };
      const sep = () => tb.appendChild(h('span.sep'));
      this.tb = {};
      this.tb.newf = btn('tbNew', 'newFile', 'New', 'New file (Ctrl+N)', () => SEE.Files.newFile(this));
      this.tb.open = btn('tbOpen', 'folderOpen', 'Open', 'Open a file (Ctrl+O)', () => SEE.Files.openDialog(this));
      this.tb.save = btn('tbSave', 'save', 'Save', 'Save (Ctrl+S)', () => this.save());
      sep();
      this.tb.build = btn('tbBuild', 'build', 'Build', 'Compile and link (Ctrl+B)', () => this.build());
      this.tb.run = btn('tbRun', 'run', 'Run', 'Run at full speed (Ctrl+F5)', () => this.run(), true);
      this.tb.debug = btn('tbDebug', 'bug', 'Debug', 'Start in the debugger, or continue (F5)', () => this.debugOrContinue());
      sep();
      this.tb.pause = btn('tbPause', 'pause', 'Pause', 'Pause', () => this.pause());
      this.tb.over = btn('tbOver', 'stepOver', 'Over', 'Step over: the next line here (F10)', () => this.step('over'));
      this.tb.into = btn('tbInto', 'stepInto', 'Into', 'Step into: follow calls (F11)', () => this.step('into'));
      this.tb.out = btn('tbOut', 'stepOut', 'Out', 'Step out: finish this function (Shift+F11)', () => this.step('out'));
      this.tb.back = btn('tbBack', 'stepBack', 'Back', 'Step back one line, undoing it (F8)', () => this.stepBack());
      this.tb.stop = btn('tbStop', 'stop', 'Stop', 'Stop the program (Shift+F5)', () => this.stop());
      sep();
      this.tb.anim = btn('tbAnim', 'speed', 'Animate', 'Step by itself, one line at a time', () => this.toggleAnimate());
      const speed = h('input', { type: 'range', min: '0', max: String(SPEEDS.length - 1), value: String(this.settings.speed), title: 'Animation speed', 'aria-label': 'Animation speed', style: { width: '70px' }, id: 'tbSpeed' });
      speed.addEventListener('input', () => { this.settings.speed = +speed.value; this.saveSettings(); });
      tb.appendChild(speed);
      sep();
      this.tb.share = btn('tbShare', 'share', 'Share', 'Share this project as a link', () => this.active && SEE.Files.shareDialog(this, this.projectDir()));
      this.tb.learn = btn('tbLearn', 'learn', 'Learn', 'Lessons, tours and the example library', (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        SEE.UI.showMenu(this.menuItems(5), r.left, r.bottom, { anchor: e.currentTarget, keyboard: true });
      });
      this.chip = h('span.chip', { id: 'stateChip' }, 'Ready');
      tb.appendChild(this.chip);
    }

    // ---- panels --------------------------------------------------------------------------------------
    buildPanels() {
      const bt = document.getElementById('bottomTabs'), bb = document.getElementById('bottomBody');
      const rt = document.getElementById('rightTabs'), rb = document.getElementById('rightBody');
      const mk = (tabs, body, key, label, ic, store_) => {
        const tab = h('button.ptab', { type: 'button', role: 'tab', id: 'tab-' + key, 'aria-controls': 'panel-' + key }, ic ? icon(ic) : null, h('span', label));
        const panel = h('div.panel', { id: 'panel-' + key, role: 'tabpanel' });
        body.appendChild(panel);
        tabs.appendChild(tab);
        store_[key] = { tab, panel };
        return { tab, panel };
      };
      this.bottom = {};
      this.right = {};
      mk(bt, bb, 'term', 'Terminal', 'terminal', this.bottom).tab.addEventListener('click', () => this.showBottom('term'));
      mk(bt, bb, 'probs', 'Problems', 'bug', this.bottom).tab.addEventListener('click', () => this.showBottom('probs'));
      mk(bt, bb, 'log', 'Build log', 'build', this.bottom).tab.addEventListener('click', () => this.showBottom('log'));
      this.terminal = new SEE.Terminal(this, this.bottom.term.panel);
      mk(rt, rb, 'memory', 'Memory', 'chip', this.right).tab.addEventListener('click', () => this.showRight('memory'));
      mk(rt, rb, 'vars', 'Variables', 'vars', this.right).tab.addEventListener('click', () => this.showRight('vars'));
      mk(rt, rb, 'watch', 'Watch', 'eye', this.right).tab.addEventListener('click', () => this.showRight('watch'));
      mk(rt, rb, 'bps', 'Breakpoints', 'bp', this.right).tab.addEventListener('click', () => this.showRight('bps'));
      mk(rt, rb, 'bytes', 'Bytes', 'hexIcon', this.right).tab.addEventListener('click', () => this.showRight('bytes'));
      this.memview = new SEE.MemView(this, this.right.memory.panel);
      this.varsPanel = new SEE.Panels.VarsPanel(this, this.right.vars.panel);
      this.watchPanel = new SEE.Panels.WatchPanel(this, this.right.watch.panel);
      this.bpPanel = new SEE.Panels.BreakPanel(this, this.right.bps.panel);
      this.bytesPanel = new SEE.Panels.BytesPanel(this, this.right.bytes.panel);
      this.showBottom(store.get('bottomTab', 'term'));
      this.showRight(store.get('rightTab', 'memory'));
    }
    showBottom(k) {
      if (!this.bottom[k]) k = 'term';
      this.bottomTab = k;
      store.set('bottomTab', k);
      for (const [key, x] of Object.entries(this.bottom)) { x.tab.classList.toggle('active', key === k); x.tab.setAttribute('aria-selected', String(key === k)); x.panel.style.display = key === k ? '' : 'none'; }
      if (k === 'probs') this.renderProblems();
      if (k === 'log') this.renderLog();
      if (this.built && this.isPhone() && this.view !== 'run') this.setView('run');
    }
    showRight(k) {
      if (!this.right[k]) k = 'memory';
      this.rightTab = k;
      store.set('rightTab', k);
      for (const [key, x] of Object.entries(this.right)) { x.tab.classList.toggle('active', key === k); x.tab.setAttribute('aria-selected', String(key === k)); x.panel.style.display = key === k ? '' : 'none'; }
      if (this.built && !this.settings.right && !this.isPhone()) { this.settings.right = true; this.saveSettings(); this.applyLayout(); }
      if (this.built && this.isPhone() && this.view !== 'memory') this.setView('memory');
      this.renderPanels();
    }
    /** Redraw the debugger panel that is showing */
    renderPanels() {
      switch (this.rightTab) {
        case 'memory': this.memview.render(); break;
        case 'vars': this.varsPanel.render(); break;
        case 'watch': this.watchPanel.render(); break;
        case 'bps': this.bpPanel.render(); break;
        case 'bytes': this.bytesPanel.render(); break;
      }
    }
    setTerm(t) { this.settings.term = t; this.saveSettings(); this.applyTheme(); }

    applyLayout() {
      const app = document.getElementById('app');
      app.classList.toggle('no-side', !this.settings.side);
      app.classList.toggle('no-right', !this.settings.right);
      const w = store.get('sizes', {});
      if (w.side) document.getElementById('side').style.width = w.side + 'px';
      if (w.right) document.getElementById('right').style.width = w.right + 'px';
      if (w.bottom) document.getElementById('bottom').style.height = w.bottom + 'px';
      if (this.isPhone()) { if (!this.view) this.setView('code'); } else app.removeAttribute('data-view');
      if (!this.isPhone()) this.view = null;
    }
    bindSplitters() {
      const sizes = store.get('sizes', {});
      const save = () => store.set('sizes', sizes);
      SEE.UI.splitter(document.getElementById('splitSide'), (e) => {
        const w = SEE.clamp(e.clientX - document.getElementById('work').getBoundingClientRect().left, 140, 480);
        document.getElementById('side').style.width = w + 'px'; sizes.side = w;
      }, save);
      SEE.UI.splitter(document.getElementById('splitRight'), (e) => {
        const r = document.getElementById('work').getBoundingClientRect();
        const w = SEE.clamp(r.right - e.clientX, 280, r.width - 380);
        document.getElementById('right').style.width = w + 'px'; sizes.right = w;
      }, () => { save(); this.memview.drawArrows(); });
      SEE.UI.splitter(document.getElementById('splitBottom'), (e) => {
        const r = document.getElementById('center').getBoundingClientRect();
        const hh = SEE.clamp(r.bottom - e.clientY, 80, r.height - 120);
        document.getElementById('bottom').style.height = hh + 'px'; sizes.bottom = hh;
      }, save);
    }
    buildMobile() {
      const bar = document.getElementById('mobilebar');
      this.mtabs = {};
      for (const [k, ic, label] of [['files', 'folder', 'Files'], ['code', 'edit', 'Code'], ['run', 'terminal', 'Run'], ['memory', 'chip', 'Memory']]) {
        const b = h('button', { type: 'button', id: 'mview-' + k }, icon(ic), h('span', label));
        b.addEventListener('click', () => this.setView(k));
        bar.appendChild(b);
        this.mtabs[k] = b;
      }
    }
    isPhone() { return window.innerWidth <= 720 || (window.innerHeight <= 500 && window.innerWidth <= 920); }
    setView(v) {
      if (!this.mtabs) return;
      this.view = v;
      document.getElementById('app').dataset.view = v;
      for (const [k, b] of Object.entries(this.mtabs)) b.classList.toggle('active', k === v);
      if (v === 'memory') this.renderPanels();
      if (v === 'code' && this.active) this.active.editor.render();
    }

    // ---- side: files --------------------------------------------------------------------------------
    renderSide() { SEE.Files.render(this, document.getElementById('sideBody'), document.getElementById('sideTools')); }
    renderSideSoon() { clearTimeout(this.sideTimer); this.sideTimer = setTimeout(() => this.renderSide(), 300); }

    // ---- documents --------------------------------------------------------------------------------------
    isProtected(path) { return PROTECTED.test(path || ''); }
    docByPath(p) { if (!p) return null; const k = p.toLowerCase(); return this.docs.find((d) => d.path.toLowerCase() === k) || null; }
    openFile(path, opts) {
      opts = opts || {};
      let display;
      try { display = this.vfs.abs(path); } catch (e) { return null; }
      let d = this.docByPath(display);
      if (!d) {
        let text = '';
        if (this.vfs.exists(display)) {
          if (!this.vfs.isReady(display)) { this.vfs.load(display).then(() => this.openFile(display, opts)); return null; }
          try { text = this.vfs.readText(display).replace(/\r\n?/g, '\n'); } catch (e) { SEE.UI.toast(e.message, 'err'); return null; }
        }
        d = this.createDoc(display, text);
      }
      if (!opts.noFocus || !this.active) this.activate(d); else this.renderTabs();
      if (opts.line !== undefined) setTimeout(() => { d.editor.setCursor(opts.line, opts.col || 0); d.editor.revealLine(opts.line); d.editor.flashLine(opts.line); }, 0);
      return d;
    }
    createDoc(path, text) {
      const editor = new SEE.Editor(document.getElementById('editors'), { lang: SEE.CLang, settings: this.settings });
      editor.setValue(text);
      const d = { path, editor, dirty: false, savedText: text, name: path.replace(/^.*\//, '') };
      editor.on('change', () => { d.dirty = editor.getValue() !== d.savedText; this.renderTabs(); editor.setError(null); this.sourceChanged(d); });
      editor.on('cursor', () => this.updateStatus());
      editor.on('gutter', (line) => this.toggleBreakpoint(d.path, line));
      editor.on('gutterContext', (line, e) => this.gutterMenu(d, line, e));
      editor.on('bpsShifted', (map) => { this.breakpoints.set(d.path, new Map(map)); this.breakpointsChanged(d.path); });
      editor.on('hover', (pos, x, y) => this.callout.showFor(d, pos, x, y));
      editor.on('hoverOut', () => this.callout.scheduleHide(450));
      editor.on('context', (pos, e) => this.editorMenu(d, pos, e));
      editor.setBreakpoints(this.breakpoints.get(path) || new Map());
      this.docs.push(d);
      this.applyDiagnostics(d);
      return d;
    }
    activate(d) {
      this.active = d;
      for (const x of this.docs) x.editor.show(x === d);
      this.renderTabs();
      this.updateUI();
      this.saveSession();
      this.renderSideSoon();
    }
    renderTabs() {
      const tabs = document.getElementById('tabs');
      tabs.innerHTML = '';
      const counts = new Map();
      for (const d of this.docs) counts.set(d.name, (counts.get(d.name) || 0) + 1);
      for (const d of this.docs) {
        // two tabs with the same name say which folder each is in
        const label = counts.get(d.name) > 1 ? d.name + ' · ' + (d.path.replace(/\/[^/]*$/, '').replace(/^.*\//, '') || '/') : d.name;
        const x = h('button.tclose', { type: 'button', title: 'Close', 'aria-label': 'Close ' + d.name }, '×');
        const t = h('div.tab' + (d === this.active ? '.active' : '') + (d.dirty ? '.dirty' : ''), { role: 'tab', tabindex: '0', title: d.path, 'aria-selected': String(d === this.active) },
          h('span.tname', label), this.isProtected(d.path) ? h('span.tro', { title: 'An original: saving makes your own copy' }, 'read-only') : null, x);
        t.addEventListener('click', (e) => { if (e.target === x) { this.closeDoc(d); return; } this.activate(d); d.editor.focus(); });
        t.addEventListener('keydown', (e) => { if (e.key === 'Enter') { this.activate(d); d.editor.focus(); } });
        t.addEventListener('auxclick', (e) => { if (e.button === 1) this.closeDoc(d); });
        tabs.appendChild(t);
      }
      const editors = document.getElementById('editors');
      let empty = editors.querySelector('.empty-editor');
      if (!this.docs.length) {
        if (!empty) {
          const nb = h('button.btn.primary', { type: 'button' }, 'New file');
          nb.addEventListener('click', () => SEE.Files.newFile(this));
          const lb = h('button.btn', { type: 'button' }, 'Example library');
          lb.addEventListener('click', () => SEE.Library && SEE.Library.browse(this));
          empty = h('div.empty-editor', h('div', h('p', 'No file open.'), h('p', nb, ' ', lb)));
          editors.appendChild(empty);
        }
      } else if (empty) empty.remove();
      document.getElementById('docTitle').textContent = this.active ? '— ' + this.active.path : '';
    }
    async closeDoc(d) {
      if (d.dirty) {
        let r;
        if (this.isProtected(d.path)) {
          r = await SEE.UI.modal({
            title: 'Keep your changes?',
            body: h('div', h('p', 'You changed ' + d.name + ', which is one of the originals. The original stays as it was.'), h('p', 'Save your version as a file of your own?')),
            buttons: [{ label: 'Cancel', value: 'cancel' }, { label: 'Throw them away', value: 'no' }, { label: 'Save my copy…', value: 'copy', primary: true }],
            cancelValue: 'cancel',
          });
          if (r === 'cancel') return false;
          if (r === 'copy' && !(await this.saveCopy(d))) return false;
        } else {
          r = await SEE.UI.modal({
            title: 'Save changes?', body: h('p', 'Save the changes to ' + d.name + '?'),
            buttons: [{ label: 'Cancel', value: 'cancel' }, { label: "Don't save", value: 'no' }, { label: 'Save as…', value: 'as' }, { label: 'Save', value: 'yes', primary: true }],
            cancelValue: 'cancel',
          });
          if (r === 'cancel') return false;
          if (r === 'yes' && !this.saveDoc(d)) return false;
          if (r === 'as' && !(await this.saveAs(d))) return false;
        }
      }
      const i = this.docs.indexOf(d);
      if (i < 0) return true;
      this.docs.splice(i, 1);
      d.editor.destroy();
      if (this.active === d) this.active = this.docs[Math.max(0, i - 1)] || null;
      if (this.active) this.activate(this.active); else { this.renderTabs(); this.updateUI(); this.saveSession(); }
      return true;
    }
    saveSession() { store.set('session', { open: this.docs.map((d) => d.path), active: this.active ? this.active.path : null }); }
    restoreSession() {
      const s = store.get('session', null);
      if (s && s.open && s.open.length) {
        for (const p of s.open) if (this.vfs.exists(p)) this.openFile(p, { noFocus: true });
        const a = s.active && this.docByPath(s.active);
        if (a) this.activate(a); else if (this.docs.length) this.activate(this.docs[0]);
      }
      if (!this.docs.length) {
        const start = '/home/user/hello/hello.c';
        if (!this.vfs.exists(start)) {
          this.vfs.mkdir('/home/user/hello', { parents: true, exist: true, trusted: true });
          this.vfs.writeText(start, SEE.Samples ? SEE.Samples.starter() : '#include <stdio.h>\n\nint main(void)\n{\n    printf("hello, world\\n");\n    return 0;\n}\n', { trusted: true });
        }
        this.expanded.add('/home/user/hello');
        this.openFile(start);
      }
    }
    saveDoc(d) {
      if (this.isProtected(d.path)) return false;
      try {
        const dir = d.path.replace(/\/[^/]*$/, '') || '/';
        if (!this.vfs.exists(dir)) this.vfs.mkdir(dir, { parents: true, trusted: true });
        this.vfs.writeText(d.path, d.editor.getValue(), { trusted: this.vfs.canWrite(d.path) !== 'no' });
        d.savedText = d.editor.getValue();
        d.dirty = false;
        this.renderTabs();
        return true;
      } catch (e) {
        SEE.UI.toast('Could not save ' + d.name + ': ' + e.message, 'err');
        return false;
      }
    }
    async save() {
      const d = this.active;
      if (!d) return;
      if (this.isProtected(d.path)) { await this.saveCopy(d); return; }
      if (this.saveDoc(d)) this.setStatus('Saved ' + d.path);
    }
    saveAll() { for (const d of this.docs) if (d.dirty && !this.isProtected(d.path)) this.saveDoc(d); this.setStatus('Saved everything'); }
    autosaveAll() {
      if (!this.settings.autosave) return;
      for (const d of this.docs) if (d.dirty && !this.isProtected(d.path) && this.vfs.exists(d.path.replace(/\/[^/]*$/, '') || '/') && !/^\/mnt\//i.test(d.path)) this.saveDoc(d);
    }
    /** An original was changed: save the whole project folder as the user's own copy */
    async saveCopy(d) {
      const dir = this.projectDir(d);
      const stem = dir.replace(/^.*\//, '') || d.name.replace(/\.[^.]*$/, '');
      let n = 1, def;
      do { def = '/home/user/' + stem + (n > 1 ? '-' + n : ''); n++; } while (this.vfs.exists(def));
      const name = await SEE.UI.prompt('Save your own copy', 'Folder for your copy', def, { hint: 'This is an original, so your version goes into a folder of your own, with the other files of the project next to it.' });
      if (!name) return false;
      let target = name.trim();
      if (!target.startsWith('/')) target = '/home/user/' + target;
      if (this.isProtected(target)) { SEE.UI.toast('Pick a folder outside /examples, /library, /lessons and /usr', 'err', 5000); return false; }
      try {
        this.vfs.mkdir(target, { parents: true, exist: true });
        for (const x of this.vfs.list(dir)) {
          if (x.type !== 'file') continue;
          const od = this.docByPath(x.path);
          this.vfs.writeFile(target + '/' + x.name, od ? SEE.utf8(od.editor.getValue()) : this.vfs.readFile(x.path));
        }
      } catch (e) { SEE.UI.toast('Could not copy: ' + e.message, 'err'); return false; }
      // the open originals go back to how they were; their copies open instead
      const was = this.active;
      for (const od of this.docs.slice()) {
        if (this.projectDir(od) !== dir) continue;
        const np = target + '/' + od.name;
        const bps = this.breakpoints.get(od.path);
        if (bps && bps.size) { this.breakpoints.set(np, new Map(bps)); this.breakpoints.delete(od.path); }
        od.dirty = false;
        const keep = od === was;
        await this.closeDoc(od);
        const nd = this.openFile(np, { noFocus: !keep });
        if (nd) this.breakpointsChanged(np);
      }
      this.expanded.add(target.toLowerCase());
      this.renderSide();
      SEE.UI.toast('Your copy is in ' + target, 'ok', 4000);
      return true;
    }
    async saveAs(d, opts) {
      d = d || this.active;
      opts = opts || {};
      if (!d) return false;
      const name = await SEE.UI.prompt(opts.title || 'Save as', 'Name', opts.def || (this.isProtected(d.path) ? '/home/user/' + d.name : d.path), { hint: 'A name like list.c saves next to the current file; a path like /home/user/lists/list.c picks the folder.' });
      if (!name) return false;
      let p = name.trim();
      if (!/\.[^/.]+$/.test(p)) p += '.c';
      if (!p.startsWith('/')) p = (this.isProtected(d.path) ? '/home/user' : d.path.replace(/\/[^/]*$/, '')) + '/' + p;
      let disp;
      try { disp = this.vfs.abs(p); } catch (e) { SEE.UI.toast('That is not a usable file name', 'err'); return false; }
      if (this.isProtected(disp)) { SEE.UI.toast('Pick a folder outside /examples, /library, /lessons and /usr', 'err', 5000); return false; }
      if (this.vfs.exists(disp) && disp.toLowerCase() !== d.path.toLowerCase()) {
        if (!(await SEE.UI.confirm('Replace?', SEE.escapeHtml(disp) + ' already exists. Replace it?', 'Replace'))) return false;
      }
      const other = this.docByPath(disp);
      if (other && other !== d) { other.dirty = false; await this.closeDoc(other); }
      const old = d.path;
      d.path = disp; d.name = disp.replace(/^.*\//, '');
      if (!this.saveDoc(d)) { d.path = old; d.name = old.replace(/^.*\//, ''); return false; }
      const bps = this.breakpoints.get(old);
      if (bps && bps.size) { this.breakpoints.set(d.path, new Map(bps)); if (this.isProtected(old)) this.breakpoints.delete(old); this.breakpointsChanged(d.path); }
      this.activate(d);
      SEE.UI.toast('Saved ' + d.path, 'ok');
      this.renderSide();
      return true;
    }
    lineText(path, line) {
      const d = this.docByPath(path);
      if (d) return d.editor.getLine(line);
      try { return this.vfs.readText(path).split('\n')[line] || ''; } catch (e) { return ''; }
    }
    sourceChanged(d) {
      // editing the program while it runs: the running copy no longer matches the text
      if (this.vm && !this.staleWarned && this.prog && this.prog.units.some((u) => u.file.toLowerCase() === d.path.toLowerCase())) {
        this.staleWarned = true;
        this.setStatus('You changed the code: the running program is the old version until you build again.');
      }
    }

    // ---- the project: which files make the program ----------------------------------------------------
    projectDir(d) {
      d = d || this.active;
      if (!d) return '/home/user';
      return d.path.replace(/\/[^/]*$/, '') || '/';
    }
    /** All .c files in the active file's folder are compiled together */
    projectFiles() {
      const dir = this.projectDir();
      const files = [];
      let list = [];
      try { list = this.vfs.list(dir); } catch (e) { list = []; }
      const seen = new Set();
      for (const x of list) {
        if (x.type !== 'file' || !isC(x.name)) continue;
        seen.add(x.path.toLowerCase());
        files.push({ path: x.path, text: this.textOf(x.path) });
      }
      // an open file that was never saved still belongs to its folder
      for (const d of this.docs) if (isC(d.path) && this.projectDir(d) === dir && !seen.has(d.path.toLowerCase())) files.push({ path: d.path, text: d.editor.getValue() });
      files.sort((a, b) => (a.path < b.path ? -1 : 1));
      return { dir, files };
    }
    textOf(path) {
      const d = this.docByPath(path);
      if (d) return d.editor.getValue();
      try { return this.vfs.readText(path); } catch (e) { return null; }
    }

    // ---- build -----------------------------------------------------------------------------------------
    build(quiet) {
      if (!this.active) { SEE.UI.toast('Open a C file first', 'err'); return null; }
      this.autosaveAll();
      const { dir, files } = this.projectFiles();
      if (!files.length) { SEE.UI.toast('There is no .c file in ' + dir, 'err'); return null; }
      const t0 = performance.now();
      const res = SEE.Build.build(files, (p) => { const t = this.textOf(p); return t === null ? null : t; }, { now: new Date() });
      const ms = Math.round(performance.now() - t0);
      const fmt = (e) => ({ kind: e.kind, msg: e.message, file: e.pos ? e.pos.file : null, line: e.pos ? e.pos.line : 0, col: e.pos ? e.pos.col : 0 });
      this.problems = res.errors.map(fmt).concat(res.warnings.map(fmt));
      const names = files.map((f) => f.path.replace(/^.*\//, ''));
      let log = 'cc -std=c89 ' + names.join(' ') + '   (in ' + dir + ')\n';
      for (const p of this.problems) log += (p.file ? p.file.replace(/^.*\//, '') + ':' + p.line + ':' + p.col + ': ' : '') + p.kind + ': ' + p.msg + '\n';
      if (res.ok) {
        const pr = res.prog;
        log += '\nLinked ' + pr.functions.filter((f) => !f.system).length + ' function' + (pr.functions.filter((f) => !f.system).length === 1 ? '' : 's') + ' of yours and ' + pr.natives.length + ' from the C library.\n';
        for (const s of pr.segments) log += '  ' + s.name.padEnd(7) + ' 0x' + SEE.hex(s.lo) + ' - 0x' + SEE.hex(s.hi) + '  ' + (s.hi - s.lo) + ' bytes\n';
        log += '  heap    starts at 0x' + SEE.hex(pr.heapStart) + '\n  stack   ends at 0x' + SEE.hex(SEE.MEM.STACK_TOP) + ' and grows down\n';
      }
      log += '\n' + (res.ok ? 'Build finished' : 'Build failed') + ' in ' + ms + ' ms: ' + res.errors.length + ' error' + (res.errors.length === 1 ? '' : 's') + ', ' + res.warnings.length + ' warning' + (res.warnings.length === 1 ? '' : 's') + '.\n';
      this.buildLog = log;
      this.applyDiagnosticsAll();
      this.renderProblems();
      this.renderLog();
      if (!res.ok) {
        this.showBottom('probs');
        const first = this.problems.find((p) => p.kind === 'error');
        if (first && first.file) this.gotoProblem(first);
        this.setStatus('Build failed: ' + (first ? first.msg : ''));
        this.setChip('Build failed', 'fault');
        return null;
      }
      if (!quiet) {
        this.setStatus('Built ' + names.join(', ') + (res.warnings.length ? ' with ' + res.warnings.length + ' warning' + (res.warnings.length === 1 ? '' : 's') : ''));
        if (res.warnings.length) this.showBottom('probs');
      }
      this.prog = res.prog;
      this.progDir = dir;
      return res.prog;
    }
    applyDiagnosticsAll() { for (const d of this.docs) this.applyDiagnostics(d); }
    applyDiagnostics(d) {
      const m = new Map();
      for (const p of this.problems || []) {
        if (!p.file || p.file.toLowerCase() !== d.path.toLowerCase() || !p.line) continue;
        const l = p.line - 1;
        if (m.get(l) !== 'error') m.set(l, p.kind);
      }
      d.editor.setDiagnostics(m);
    }
    renderProblems() {
      const el = this.bottom.probs.panel;
      el.innerHTML = '';
      const tab = this.bottom.probs.tab;
      const old = tab.querySelector('.badge');
      if (old) old.remove();
      const errs = this.problems.filter((p) => p.kind === 'error').length;
      const warns = this.problems.filter((p) => p.kind !== 'error').length;
      if (errs) tab.appendChild(h('span.badge', String(errs)));
      else if (warns) tab.appendChild(h('span.badge.warn', String(warns)));
      if (!this.problems.length) { el.appendChild(h('div.empty', this.buildLog ? 'No problems: the compiler is happy.' : 'Build (Ctrl+B) to check your program. Errors and warnings show up here; double-click one to jump to its line.')); return; }
      const list = h('div.probs');
      for (const p of this.problems) {
        const row = h('div.prob.' + (p.kind === 'error' ? 'error' : p.kind === 'note' ? 'note' : 'warning'), { tabindex: '0', title: 'Double-click to go to the line' },
          h('span.kind', p.kind === 'runtime' ? 'run time' : p.kind), h('span.msg', p.msg), h('span.loc', p.file ? p.file.replace(/^.*\//, '') + ':' + p.line + (p.col ? ':' + p.col : '') : ''));
        row.addEventListener('dblclick', () => this.gotoProblem(p));
        row.addEventListener('click', () => { if (this.isPhone() || matchMedia('(pointer: coarse)').matches) this.gotoProblem(p); });
        row.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.gotoProblem(p); });
        list.appendChild(row);
      }
      el.appendChild(list);
    }
    renderLog() { const el = this.bottom.log.panel; el.innerHTML = ''; el.appendChild(h('pre.buildlog', this.buildLog || 'Nothing built yet.')); }
    gotoProblem(p) {
      if (!p.file) return;
      if (/^\/usr\//.test(p.file) && !this.vfs.exists(p.file)) return;
      const d = this.openFile(p.file, { line: Math.max(0, p.line - 1), col: Math.max(0, (p.col || 1) - 1) });
      if (d && this.isPhone()) this.setView('code');
      if (d) setTimeout(() => d.editor.focus(), 10);
    }
    goto(path, line) { const d = this.openFile(path, { line }); if (d && this.isPhone()) this.setView('code'); }

    // ---- running -----------------------------------------------------------------------------------------
    newMachine(prog) {
      this.disposeMachine();
      const args = (this.settings.args || '').match(/"[^"]*"|\S+/g) || [];
      const argv = [this.projectDir().replace(/^.*\//, '') || 'a.out'].concat(args.map((a) => a.replace(/^"|"$/g, '')));
      const vm = new SEE.Machine(prog, {
        write: (fd, b) => this.terminal.write(fd, b),
        vfs: this.vfs, cwd: this.progDir, argv, checkOverflow: this.settings.overflow,
        allowWrite: () => true,
      });
      vm.on('warning', (w) => this.runtimeWarning(w));
      this.vm = vm;
      this.frameIndex = 0;
      this.stopInfo = null;
      this.staleWarned = false;
      this.problems = this.problems.filter((p) => p.kind !== 'runtime');
      return vm;
    }
    disposeMachine() {
      this.stopAnimate();
      if (this.terminal) this.terminal.setPending('');
      this.running = false;
      clearTimeout(this.pumpTimer);
      this.vm = null;
      this.dbg = null;
      this.clearExecMarks();
      this.callout.hide();
    }
    runtimeWarning(w) {
      const at = w.at || {};
      this.problems.push({ kind: 'runtime', msg: w.msg, file: at.file, line: at.line, col: 0 });
      this.renderProblemsSoon();
      if (this.problems.filter((p) => p.kind === 'runtime').length <= 5) this.terminal.note('warning: ' + w.msg + (at.line ? ' (line ' + at.line + ')' : ''), 'bad');
    }
    renderProblemsSoon() { clearTimeout(this.probTimer); this.probTimer = setTimeout(() => this.renderProblems(), 200); }
    startTerminal(how) {
      this.terminal.clear();
      this.terminal.note(how + ' ' + (this.vm.prog.main ? (this.progDir || '') : '') + (this.settings.args ? '   arguments: ' + this.settings.args : ''));
      const keep = this.view;
      this.showBottom('term');
      // on a phone, debugging keeps the code in view; running shows the terminal
      if (this.isPhone() && how === 'Debugging' && keep && keep !== 'run') this.setView(keep === 'files' ? 'code' : keep);
    }
    run() {
      if (this.running) return;
      const prog = this.build(true);
      if (!prog) return;
      const vm = this.newMachine(prog);
      this.startTerminal('Running');
      this.mode = 'run';
      vm.debug = false;
      this.running = true;
      this.setChip('Running', 'running');
      this.updateUI();
      this.pump();
    }
    /** Start in the debugger, paused at the first line of main; or continue when paused */
    debugOrContinue() {
      if (this.vm && this.dbg && (this.vm.state === 'paused')) { this.resume('run'); return; }
      if (this.vm && this.running) return;
      this.startDebug('start');
    }
    startDebug(firstMode, after) {
      const prog = this.build(true);
      if (!prog) return false;
      const vm = this.newMachine(prog);
      this.attachDebugger(vm, true);
      this.startTerminal('Debugging');
      this.mode = 'debug';
      this.afterStart = after || null;
      this.resume(firstMode || 'start');
      return true;
    }
    attachDebugger(vm, record) {
      const dbg = new SEE.Debug.Debugger(vm, { record: record && this.settings.record, intoLibrary: !!this.settings.libFrames, outputMark: () => this.terminal.mark(), outputRewind: (n) => this.terminal.rewind(n) });
      this.dbg = dbg;
      this.syncBreakpoints();
      for (const w of this.watchPanel.list) if (w.wp) { try { dbg.addWatchpoint(w.expr); } catch (e) { /* not in scope yet */ } }
      return dbg;
    }
    resume(mode) {
      const vm = this.vm;
      if (!vm || !this.dbg) return;
      if (vm.state === 'exited' || vm.state === 'faulted') return;
      this.dbg.resume(mode);
      this.terminal.setPending('');
      this.callout.hide();
      this.clearExecMarks();
      this.running = true;
      this.setChip(mode === 'run' ? 'Running' : 'Stepping', 'running');
      this.updateUI();
      this.pump();
    }
    pump() {
      clearTimeout(this.pumpTimer);
      const vm = this.vm;
      if (!vm || !this.running) return;
      const t0 = performance.now();
      let r;
      do { r = vm.run(SLICE); } while (r === 'budget' && performance.now() - t0 < 14);
      if (r === 'budget') { this.pumpTimer = setTimeout(() => this.pump(), 0); this.updateStatusSoon(); return; }
      this.running = false;
      if (r === 'input') { this.waitInput(); return; }
      if (r === 'pause') { this.onStop(); return; }
      if (r === 'exit') { this.onExit(); return; }
      if (r === 'fault') { this.onFault(); return; }
    }
    waitInput() {
      this.terminal.setWaiting(true);
      this.setChip('Waiting for input', 'paused');
      this.setStatus('The program is reading from stdin: type a line in the terminal and press Enter (or EOF to end the input).');
      this.updateUI();
      if (this.isPhone()) this.setView('run');
    }
    feedInput(text) {
      const vm = this.vm;
      if (!vm || !vm.libc) { this.terminal.note('(no program is running)'); return; }
      for (const b of SEE.utf8(text)) vm.libc.input.push(b);
      if (vm.state === 'input') this.continueAfterInput();
    }
    feedEOF() {
      const vm = this.vm;
      if (!vm || !vm.libc) return;
      vm.libc.inputEOF = true;
      if (vm.state === 'input') this.continueAfterInput();
    }
    continueAfterInput() {
      this.terminal.setWaiting(false);
      this.running = true;
      this.setChip(this.dbg && this.dbg.mode !== 'run' ? 'Stepping' : 'Running', 'running');
      this.updateUI();
      this.pump();
    }
    pause() {
      const vm = this.vm;
      if (!vm || !this.running) return;
      if (!this.dbg) this.attachDebugger(vm, false);
      vm.debug = true;
      this.dbg.pause();
      this.stopAnimate();
    }
    stop() {
      if (!this.vm) return;
      const was = this.vm;
      if (was.libc) was.libc.flushAll();
      this.terminal.note('Stopped.');
      this.disposeMachine();
      this.terminal.setWaiting(false);
      this.setChip('Stopped', '');
      this.setStatus('Program stopped.');
      this.updateUI();
      this.renderPanels();
    }
    step(mode) {
      const vm = this.vm;
      if (vm && this.dbg && vm.state === 'paused') { this.resume(mode); return; }
      if (vm && this.running) return;
      // not started: start in the debugger, paused at main
      this.startDebug('start');
    }
    canBack() { return !!(this.dbg && this.dbg.recording && this.vm && !this.running && this.dbg.history.length > 1); }
    stepBack(stmt) {
      if (!this.canBack()) { if (this.dbg && !this.dbg.recording) SEE.UI.toast('Stepping back needs the history: turn on Debug > Keep a history to step back, then start again', 'err', 5000); return; }
      const ok = stmt ? this.dbg.stepBackStatement() : this.dbg.stepBack();
      if (!ok) { SEE.UI.toast('Cannot go back further', 'err'); return; }
      this.terminal.setWaiting(false);
      this.problems = this.problems.filter((p) => p.kind !== 'runtime' || true);
      this.stopInfo = { reason: 'back' };
      this.onStop(true);
    }
    runToCursor() {
      const d = this.active;
      if (!d) return;
      const line = d.editor.cursor().line;
      const go = () => {
        this.dbg.tempBreak = this.dbg.setBreakpoint(d.path, line + 1, { temp: true });
        this.resume('run');
      };
      if (this.vm && this.dbg && this.vm.state === 'paused') go();
      else if (!this.running) this.startDebug('start', go);   // stop at main first, then run on to the line
    }

    /** Show what is still in stdout's buffer, dimmed, while the program is stopped */
    showPending() {
      const vm = this.vm;
      const buf = vm && vm.libc && vm.libc.stdout ? vm.libc.stdout.buf : [];
      this.terminal.setPending(buf.length && vm.state !== 'exited' ? SEE.unutf8(Uint8Array.from(buf)) : '');
    }
    onStop(back) {
      const vm = this.vm, dbg = this.dbg;
      if (!vm) return;
      this.terminal.setWaiting(false);
      this.showPending();
      if (dbg.tempBreak) { dbg.clearBreakpoint(dbg.tempBreak.file, dbg.tempBreak.line); dbg.tempBreak = null; }
      this.stopInfo = dbg.stopInfo || { reason: 'pause' };
      this.frameIndex = 0;
      const w = vm.where();
      const st = this.stopInfo;
      let msg = 'Paused at line ' + w.line + ' in ' + w.fn + '()';
      if (st.reason === 'breakpoint') msg = 'Breakpoint at line ' + w.line + ' in ' + w.fn + '()';
      else if (st.reason === 'watch') msg = st.hits.map((x) => x.w.expr + ' changed').join(', ') + ' (line ' + w.line + ')';
      else if (st.reason === 'return') msg = st.from + '() returned; back in ' + w.fn + '() at line ' + w.line;
      else if (st.reason === 'back') msg = 'Stepped back to line ' + w.line + ' in ' + w.fn + '()';
      else if (st.longLine) msg = 'Line ' + w.line + ' was still running after 200,000 statements (a loop on one line?), so the step stopped here. Step again to carry on.';
      else if (st.reason === 'start') msg = 'Ready at the first line of main. Step with F10 (over) or F11 (into).';
      this.setStatus(msg);
      this.setChip(back ? 'Paused (went back)' : 'Paused', 'paused');
      this.showExec();
      this.renderPanels();
      this.updateUI();
      if (this.afterStart) { const f = this.afterStart; this.afterStart = null; f(); }
      if (this.animating) this.scheduleAnimate();
    }
    onExit() {
      const vm = this.vm;
      this.terminal.setWaiting(false);
      const code = vm.exitCode;
      const leaks = vm.libc ? vm.libc.leaks() : [];
      this.terminal.note('Program exited with status ' + code + '.', code === 0 ? 'good' : 'bad');
      if (leaks.length) {
        const bytes = leaks.reduce((a, b) => a + b.size, 0);
        this.terminal.note('Memory leak: ' + leaks.length + ' heap block' + (leaks.length === 1 ? '' : 's') + ' (' + bytes + ' bytes) never freed: ' + leaks.slice(0, 4).map((b) => '#' + b.id + ' (' + b.size + ' bytes, ' + b.by + ' at line ' + (b.site ? b.site.line : '?') + ')').join(', ') + (leaks.length > 4 ? ', …' : ''), 'bad');
        for (const b of leaks.slice(0, 20)) this.problems.push({ kind: 'runtime', msg: 'memory leak: block #' + b.id + ' (' + b.size + ' bytes) from ' + b.by + ' was never freed', file: b.site && b.site.file, line: b.site ? b.site.line : 0, col: 0 });
        this.renderProblems();
      }
      this.setChip('Exited (' + code + ')', code === 0 ? '' : 'fault');
      this.setStatus('Program exited with status ' + code + (this.dbg && this.dbg.recording ? '. You can still step back (F8) to look at what happened.' : '.'));
      this.stopAnimate();
      this.clearExecMarks();
      this.renderPanels();
      this.updateUI();
    }
    onFault() {
      const vm = this.vm;
      const f = vm.fault;
      this.terminal.setWaiting(false);
      if (vm.libc && vm.libc.stdout && vm.libc.stdout.buf.length) {
        const lost = SEE.unutf8(Uint8Array.from(vm.libc.stdout.buf));
        this.terminal.note('(' + vm.libc.stdout.buf.length + ' bytes printed to stdout were still in its buffer and were lost: ' + JSON.stringify(lost.slice(0, 60)) + '. End lines with \\n or call fflush(stdout).)');
      }
      this.terminal.note(f.title + ': ' + f.msg + (f.at && f.at.line ? '  (line ' + f.at.line + ' in ' + f.at.fn + '())' : ''), 'bad');
      this.problems.push({ kind: 'runtime', msg: f.title + ': ' + f.msg, file: f.at && f.at.file, line: f.at ? f.at.line : 0, col: 0 });
      this.renderProblems();
      this.stopInfo = { reason: 'fault' };
      this.frameIndex = 0;
      this.setChip(f.title, 'fault');
      this.setStatus(f.title + ' at line ' + (f.at ? f.at.line : '?') + ': the memory picture shows the state at the moment it happened' + (this.dbg && this.dbg.recording ? ', and F8 steps back.' : '.'));
      this.stopAnimate();
      this.showExec(true);
      if (this.isPhone()) this.setView('code'); else this.showRight('memory');
      this.renderPanels();
      this.updateUI();
    }

    // ---- animation: stepping by itself ---------------------------------------------------------------
    toggleAnimate() {
      if (this.animating) { this.stopAnimate(); this.updateUI(); return; }
      if (this.vm && this.dbg && this.vm.state === 'paused') { this.animating = true; this.scheduleAnimate(); }
      else if (!this.running) { this.startDebug('start'); this.animating = true; if (this.vm && this.vm.state === 'paused') this.scheduleAnimate(); }
      this.updateUI();
    }
    scheduleAnimate() {
      clearTimeout(this.animTimer);
      this.animTimer = setTimeout(() => {
        if (!this.animating || !this.vm || this.vm.state !== 'paused') return;
        this.resume('into');
      }, SPEEDS[this.settings.speed] || 300);
    }
    stopAnimate() { this.animating = false; clearTimeout(this.animTimer); }

    // ---- breakpoints -----------------------------------------------------------------------------------
    toggleBreakpoint(path, line) {
      let m = this.breakpoints.get(path);
      if (!m) { m = new Map(); this.breakpoints.set(path, m); }
      if (m.has(line)) m.delete(line); else m.set(line, { cond: '', disabled: false });
      this.breakpointsChanged(path);
    }
    breakpointsChanged(path) {
      const m = this.breakpoints.get(path);
      if (m && !m.size) this.breakpoints.delete(path);
      const out = {};
      for (const [p, mm] of this.breakpoints) out[p] = [...mm];
      store.set('breakpoints', out);
      const d = this.docByPath(path);
      if (d) d.editor.setBreakpoints(this.breakpoints.get(path) || new Map());
      this.syncBreakpoints();
      if (this.rightTab === 'bps') this.bpPanel.render();
    }
    clearBreakpoints() { const paths = [...this.breakpoints.keys()]; this.breakpoints.clear(); paths.forEach((p) => this.breakpointsChanged(p)); }
    syncBreakpoints() {
      const dbg = this.dbg;
      if (!dbg) return;
      const temp = dbg.tempBreak;
      dbg.breakpoints.clear();
      for (const [path, m] of this.breakpoints) for (const [line, bp] of m) dbg.breakpoints.set(path + ':' + (line + 1), { file: path, line: line + 1, cond: bp.cond, enabled: !bp.disabled, hits: 0 });
      if (temp) dbg.breakpoints.set(temp.file + ':' + temp.line, temp);
      dbg.resolveAll();
    }
    async gutterMenu(d, line, e) {
      const m = this.breakpoints.get(d.path);
      const bp = m && m.get(line);
      SEE.UI.showMenu([
        { label: bp ? 'Remove breakpoint' : 'Add breakpoint', action: () => this.toggleBreakpoint(d.path, line) },
        { label: 'Stop only when…', action: () => this.conditionDialog(d.path, line) },
        bp ? { label: bp.disabled ? 'Enable' : 'Disable', action: () => { bp.disabled = !bp.disabled; this.breakpointsChanged(d.path); } } : null,
        { sep: true },
        { label: 'Run to this line', action: () => { d.editor.setCursor(line, 0); this.runToCursor(); } },
      ].filter(Boolean), e.clientX, e.clientY);
    }
    async conditionDialog(path, line) {
      const m = this.breakpoints.get(path);
      const cur = m && m.get(line);
      const v = await SEE.UI.prompt('Stop only when…', 'Stop at line ' + (line + 1) + ' only when this C expression is true (leave empty to always stop):', cur ? cur.cond : '', { hint: 'Examples:  i == 5    n < 2    p == NULL    strcmp(name, "x") is not allowed (no calls)' });
      if (v === null || v === undefined) return;
      let mm = this.breakpoints.get(path);
      if (!mm) { mm = new Map(); this.breakpoints.set(path, mm); }
      mm.set(line, { cond: v.trim(), disabled: false });
      this.breakpointsChanged(path);
    }
    toggleWatchpoint(expr) {
      const w = this.watchPanel.list.find((x) => x.expr === expr);
      if (!this.dbg || !this.vm) { SEE.UI.toast('Start the program in the debugger first (F5): a watchpoint watches memory that only exists while it runs', 'err', 5000); return; }
      const existing = this.dbg.watchpoints.find((x) => x.expr === expr);
      if (existing) { this.dbg.removeWatchpoint(existing); if (w) w.wp = false; }
      else {
        try { this.dbg.addWatchpoint(expr, this.frameIndex); if (w) w.wp = true; SEE.UI.toast('The program stops when ' + expr + ' changes', 'ok'); } catch (e) { SEE.UI.toast(e.message, 'err', 5000); }
      }
      this.watchPanel.render();
    }

    // ---- where the program is ----------------------------------------------------------------------------
    showExec(fault) {
      this.clearExecMarks();
      const vm = this.vm;
      if (!vm) return;
      const frames = SEE.Debug.frames(vm);
      const fr = frames[this.frameIndex] || frames[0];
      if (!fr) return;
      let target = fr;
      if (fr.system && !this.settings.libFrames) target = frames.find((f) => !f.system) || fr;
      const d = this.openFile(target.where.file, { noFocus: false });
      if (!d) return;
      if (target === frames[0] || (frames[0].system && target === frames.find((f) => !f.system))) d.editor.setExec(target.where.line - 1);
      else d.editor.setFrame(target.where.line - 1);
      if (fault) d.editor.setError(target.where.line - 1);
      this.updateStatus();
    }
    clearExecMarks() { for (const d of this.docs) { d.editor.setExec(null); d.editor.setFrame(null); d.editor.setError(null); } }
    selectFrame(i) {
      this.frameIndex = i;
      this.showExec();
      this.renderPanels();
      this.callout.hide();
    }
    afterEdit(name) {
      this.setStatus('Changed ' + (name || 'a value') + '. The program carries on with the new value.');
      this.renderPanels();
      if (this.callout.isOpen()) this.callout.refresh();
    }

    // ---- editor menus and dialogs ----------------------------------------------------------------------
    editorMenu(d, pos, e) {
      const vm = this.vm;
      const items = [];
      if (pos) {
        const w = SEE.CLang.wordAt(pos.text, pos.col);
        if (w) {
          items.push({ label: 'Watch ' + w.expr, action: () => { this.watchPanel.add(w.expr); this.showRight('watch'); } });
          if (vm) items.push({ label: 'Show the bytes of ' + w.expr, action: () => { this.showRight('bytes'); this.bytesPanel.goTo(w.expr); } });
          if (SEE.Help && SEE.Help.brief(w.word)) items.push({ label: 'Look up ' + w.word, action: () => this.showReference(w.word) });
          items.push({ sep: true });
        }
        items.push({ label: 'Run to this line', action: () => { d.editor.setCursor(pos.line, 0); this.runToCursor(); } });
        items.push({ label: 'Toggle breakpoint here', action: () => this.toggleBreakpoint(d.path, pos.line) });
      }
      if (!items.length) return;
      e.preventDefault();
      SEE.UI.showMenu(items, e.clientX, e.clientY);
    }
    async findDialog(replace) {
      const d = this.active;
      if (!d) return;
      const q = h('input', { type: 'text', 'aria-label': 'Find', value: d.editor.ta.value.slice(d.editor.ta.selectionStart, d.editor.ta.selectionEnd) });
      const r = h('input', { type: 'text', 'aria-label': 'Replace with' });
      const body = h('div', h('label', 'Find'), q, replace ? h('label', 'Replace with') : null, replace ? r : null);
      const v = await SEE.UI.modal({
        title: replace ? 'Replace' : 'Find', body,
        buttons: [{ label: 'Close', value: null }].concat(replace ? [{ label: 'Replace all', value: 'all' }] : []).concat([{ label: 'Find next', value: 'next', primary: true }]),
        enterValue: 'next',
      });
      if (!v || !q.value) return;
      if (v === 'all') { const n = d.editor.replaceAll(q.value, r.value, {}); SEE.UI.toast(n + ' replaced', 'ok'); return; }
      const found = d.editor.find(q.value, {}, d.editor.ta.selectionEnd);
      if (!found || !found.count) SEE.UI.toast('Not found', 'err');
    }
    async gotoLineDialog() {
      const d = this.active;
      if (!d) return;
      const v = await SEE.UI.prompt('Go to line', 'Line number (1 to ' + d.editor.lineCount() + ')', String(d.editor.cursor().line + 1));
      const n = parseInt(v, 10);
      if (!n) return;
      d.editor.setCursor(n - 1, 0);
      d.editor.revealLine(n - 1);
      d.editor.focus();
    }
    async argsDialog() {
      const v = await SEE.UI.prompt('Run with arguments', 'Command-line arguments (they arrive in main as argv[1], argv[2], …)', this.settings.args || '', { hint: 'Separate them with spaces; put "quotes" around one that has spaces in it.' });
      if (v === null || v === undefined) return;
      this.settings.args = v;
      this.saveSettings();
      this.run();
    }
    showPreprocessed() {
      const d = this.active;
      if (!d) return;
      try {
        const pp = SEE.Cpp.preprocess(d.editor.getValue(), d.path, { read: (p) => (p.startsWith('/usr/include/') ? SEE.Headers.files[p.slice(13)] : this.textOf(p)), dirname: SEE.Build.dirname, join: SEE.Build.join, sysdirs: ['/usr/include/'] });
        const name = '/tmp/' + d.name.replace(/\.c$/i, '') + '.i';
        this.vfs.writeText(name, '/* ' + d.name + ' after the preprocessor: #include files pasted in, macros replaced, comments gone */\n' + SEE.Cpp.render(pp.tokens), { trusted: true });
        const od = this.docByPath(name);
        if (od) { od.editor.setValue(this.vfs.readText(name)); od.savedText = od.editor.getValue(); od.dirty = false; }
        this.openFile(name);
      } catch (e) { SEE.UI.toast(e.message, 'err', 5000); }
    }
    showLinkMap() {
      const prog = this.build(true);
      if (!prog) return;
      let s = '/* What the linker made of ' + this.projectDir() + ' */\n\n';
      for (const sg of prog.segments) s += sg.name.padEnd(8) + '0x' + SEE.hex(sg.lo) + ' - 0x' + SEE.hex(sg.hi) + '\n';
      s += '\nFunctions (.text)\n';
      for (const f of prog.functions) s += '  0x' + SEE.hex(f.addr) + '  ' + f.name + (f.system ? '   (C library)' : '   ' + f.unitFile) + '\n';
      for (const n of prog.natives) s += '  0x' + SEE.hex(n.addr) + '  ' + n.name + '   (C library)\n';
      s += '\nObjects\n';
      for (const g of prog.globals) s += '  0x' + SEE.hex(g.addr) + '  ' + g.section.padEnd(7) + g.name + '  ' + SEE.Types.str(g.type) + (g.system ? '   (C library)' : '') + '\n';
      s += '\nString literals (.rodata)\n';
      for (const x of prog.strings) s += '  0x' + SEE.hex(x.addr) + '  ' + SEE.Debug.quoteBytes(x.lit.bytes.slice(0, -1), 50) + '\n';
      const name = '/tmp/linkmap.txt';
      this.vfs.writeText(name, s, { trusted: true });
      const od = this.docByPath(name);
      if (od) { od.editor.setValue(s); od.savedText = s; od.dirty = false; }
      this.openFile(name);
    }
    showReference(word) { if (SEE.Help) SEE.Help.open(this, word); }
    settingsDialog() {
      const s = this.settings;
      const chk = (key, label) => { const c = h('input', { type: 'checkbox', checked: !!s[key] }); c.addEventListener('change', () => { s[key] = c.checked; this.saveSettings(); }); return h('label', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, c, label); };
      const fs = h('input', { type: 'number', min: '10', max: '26', value: String(s.fontSize) });
      fs.addEventListener('change', () => { s.fontSize = SEE.clamp(+fs.value || 14, 10, 26); this.saveSettings(); this.applyTheme(); });
      const args = h('input', { type: 'text', value: s.args || '' });
      args.addEventListener('change', () => { s.args = args.value; this.saveSettings(); });
      SEE.UI.modal({
        title: 'Settings',
        body: h('div', chk('autosave', 'Save my files by themselves'), chk('overflow', 'Warn when a signed integer overflows'), chk('record', 'Keep a history while debugging, so I can step back'),
          chk('libFrames', 'Show the C library\'s own functions when stepping and in the call stack'), h('label', 'Code size'), fs, h('label', 'Arguments for main (argv)'), args),
        buttons: [{ label: 'Close', value: true, primary: true }],
      });
    }
    shortcutsDialog() {
      const rows = [['F5', 'Debug: start paused at main, or continue'], ['Ctrl+F5', 'Run at full speed'], ['Shift+F5', 'Stop'], ['F10', 'Step over'], ['F11', 'Step into'], ['Shift+F11', 'Step out'], ['Ctrl+F11', 'One statement'],
        ['F8', 'Step back a line'], ['Shift+F8', 'Step back a statement'], ['Ctrl+F10', 'Run to the cursor'], ['F9', 'Breakpoint on this line'], ['Ctrl+B', 'Build'], ['Ctrl+S', 'Save'], ['Ctrl+N', 'New file'], ['Ctrl+O', 'Open'],
        ['Ctrl+F', 'Find'], ['Ctrl+G', 'Go to line'], ['Ctrl+/', 'Comment lines'], ['Ctrl+= / Ctrl+-', 'Code size'], ['F1', 'C reference'], ['Ctrl+D', 'In the terminal: end of input']];
      SEE.UI.modal({ title: 'Keyboard shortcuts', body: h('table', { style: { width: '100%' } }, ...rows.map(([k, v]) => h('tr', h('td', { style: { padding: '2px 10px 2px 0', whiteSpace: 'nowrap' } }, h('kbd', k)), h('td', v)))), buttons: [{ label: 'OK', value: true, primary: true }] });
    }
    memoryHelp() {
      SEE.UI.modal({
        title: 'Reading the memory picture', wide: true,
        body: h('div',
          h('p', 'The left column is the stack. The function that started first (main) is at the top, near the high addresses; every call adds a frame below it, because the stack grows down. A frame holds the arguments (above), the return address and the saved frame pointer (the links back to the caller), then the local variables (below).'),
          h('p', 'The right column holds the rest, from high addresses to low: the heap (every malloc block, with its number and the line that made it; freed blocks are hatched), the globals and statics (.data when they start with a value, .bss when they start as zero), the read-only data (string literals and const globals) and the code.'),
          h('p', 'Red values have not been set yet: they are whatever was left in that memory. Yellow values just changed. A padlock means const. Blue arrows go from a pointer to what it points at; red dashed arrows point at memory that is no longer valid (freed, or a frame that has returned).'),
          h('p', 'Click a value to change it. Click ▸ to open an array or a struct. Point at a row to see its exact type, its size and the line that last wrote it.')),
        buttons: [{ label: 'OK', value: true, primary: true }],
      });
    }
    aboutDialog() {
      const more = h('a', { href: '#' }, 'About the author');
      more.addEventListener('click', (e) => { e.preventDefault(); SEE.UI.closeAllModals(); setTimeout(() => SEE.authorDialog && SEE.authorDialog(), 50); });
      SEE.UI.modal({
        title: 'About See',
        body: h('div',
          h('p', h('b', 'See'), ' @@VERSION@@ is a C89 workbench that runs entirely in your browser: a compiler, a linker, a 32-bit machine with a real stack and heap, the whole C89 library, and a debugger that shows memory as it is.'),
          h('p', 'Nothing you write leaves your computer. Your files live in this browser.'),
          h('p', 'Free software under the GNU General Public License, version 3. Derived works must credit the original author.'),
          h('p', more)),
        buttons: [{ label: 'OK', value: true, primary: true }],
      });
    }
    welcome() {
      if (SEE.Tours && SEE.Tours.welcome) { SEE.Tours.welcome(this); return; }
    }

    // ---- keys ------------------------------------------------------------------------------------------
    bindKeys() {
      document.addEventListener('keydown', (e) => {
        if (SEE.UI.anyModalOpen()) return;
        const k = e.key, ctrl = e.ctrlKey || e.metaKey;
        const inTerm = e.target && e.target.id === 'termInput';
        const fire = (fn) => { e.preventDefault(); fn(); };
        if (k === 'F5' && e.shiftKey) return fire(() => this.stop());
        if (k === 'F5' && ctrl) return fire(() => this.run());
        if (k === 'F5') return fire(() => this.debugOrContinue());
        if (k === 'F10' && ctrl) return fire(() => this.runToCursor());
        if (k === 'F10') return fire(() => this.step('over'));
        if (k === 'F11' && e.shiftKey) return fire(() => this.step('out'));
        if (k === 'F11' && ctrl) return fire(() => this.step('stmt'));
        if (k === 'F11') return fire(() => this.step('into'));
        if (k === 'F8') return fire(() => this.stepBack(e.shiftKey));
        if (k === 'F9' && this.active) return fire(() => this.toggleBreakpoint(this.active.path, this.active.editor.cursor().line));
        if (k === 'F1') return fire(() => { const a = this.active; let w = ''; if (a) { const c = a.editor.cursor(); const ww = SEE.CLang.wordAt(a.editor.getLine(c.line), Math.max(0, c.col - 1)); if (ww) w = ww.word; } this.showReference(w); });
        if (inTerm) return;
        if (ctrl && (k === 'b' || k === 'B')) return fire(() => this.build());
        if (ctrl && (k === 's' || k === 'S')) return fire(() => this.save());
        if (ctrl && (k === 'o' || k === 'O')) return fire(() => SEE.Files.openDialog(this));
        if (ctrl && e.altKey && (k === 'n' || k === 'N')) return fire(() => SEE.Files.newFile(this));
        if (ctrl && (k === 'n' || k === 'N') && !e.shiftKey) return fire(() => SEE.Files.newFile(this));
        if (ctrl && (k === 'f' || k === 'F')) return fire(() => this.findDialog(false));
        if (ctrl && (k === 'h' || k === 'H')) return fire(() => this.findDialog(true));
        if (ctrl && (k === 'g' || k === 'G')) return fire(() => this.gotoLineDialog());
        if (ctrl && k === '/' && !(this.active && e.target === this.active.editor.ta)) return fire(() => this.active && this.active.editor.toggleComment());   // the editor handles its own
        if (ctrl && (k === '=' || k === '+')) return fire(() => this.zoomCode(1));
        if (ctrl && k === '-') return fire(() => this.zoomCode(-1));
        if (ctrl && (k === 'w' || k === 'W') && e.altKey) return fire(() => this.active && this.closeDoc(this.active));
        if (k === 'Escape') { this.callout.hide(); }
        if (e.altKey && !ctrl && /^[fevbdlh]$/i.test(k)) {
          const i = 'fevbdlh'.indexOf(k.toLowerCase());
          if (i >= 0) return fire(() => this.openMenu(i));
        }
      });
    }

    // ---- status ------------------------------------------------------------------------------------------
    setStatus(msg) { this.statusMsg = msg; document.getElementById('statusMsg').textContent = msg || ''; }
    setChip(text, cls) {
      this.chip.textContent = text;
      this.chip.className = 'chip' + (cls ? ' ' + cls : '');
      const st = document.getElementById('stState');
      st.textContent = text;
    }
    updateStatusSoon() { if (!this.stTimer) this.stTimer = setTimeout(() => { this.stTimer = null; this.updateStatus(); }, 250); }
    updateStatus() {
      const a = this.active;
      const pos = a ? a.editor.cursor() : null;
      const vm = this.vm;
      document.getElementById('stPos').textContent = (vm ? vm.steps.toLocaleString() + ' statements run · ' : '') + (pos ? 'Ln ' + (pos.line + 1) + ', Col ' + (pos.col + 1) : '');
    }
    updateUI() {
      const vm = this.vm;
      const a = !!this.active;
      const paused = !!(vm && vm.state === 'paused');
      const waiting = !!(vm && vm.state === 'input');
      const live = !!(vm && (this.running || paused || waiting));
      const tb = this.tb;
      tb.build.disabled = !a || this.running;
      tb.run.disabled = !a || this.running;
      tb.debug.disabled = !a || (this.running && !paused);
      tb.debug.querySelector('.lbl').textContent = this.dbg && paused ? 'Continue' : 'Debug';
      tb.debug.title = this.dbg && paused ? 'Continue to the next breakpoint (F5)' : 'Start in the debugger, paused at main (F5)';
      tb.pause.disabled = !this.running;
      tb.over.disabled = !a || this.running;
      tb.into.disabled = !a || this.running;
      tb.out.disabled = !paused;
      tb.back.disabled = !this.canBack();
      tb.stop.disabled = !live;
      tb.save.disabled = !a;
      tb.anim.classList.toggle('on', !!this.animating);
      this.updateStatus();
    }
  }

  SEE.App = App;
  if (SEE.isBrowser) {
    const start = () => { try { new App(); } catch (e) { document.body.innerHTML = '<pre style="padding:20px;white-space:pre-wrap">See could not start: ' + SEE.escapeHtml(e.stack || e.message) + '</pre>'; throw e; } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  }
})(SEE);
