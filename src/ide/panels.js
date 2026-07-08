// Debugger panels: Variables (with the call stack), Watch, Breakpoints and Bytes.
(function (SEE) {
  'use strict';
  const { h, icon } = SEE.UI;
  const { Types, SH, hex } = SEE;
  const D = () => SEE.Debug;
  const store = SEE.UI.storage;
  const short = (a) => '0x' + hex(a);

  // ---- a tree of values that can be opened and edited ----------------------------------------------
  class ValueTree {
    constructor(app, keyPrefix) { this.app = app; this.open = new Set(); this.prefix = keyPrefix; this.prev = new Map(); this.seen = new Map(); }
    begin() { this.seen = new Map(); }
    end() { this.prev = this.seen; }
    row(parent, vm, item, depth) {
      const t = Types.unqual(item.type);
      const key = this.prefix + item.key;
      const agg = Types.isAggregate(t) || (t.k === 'ptr' && D().hasChildren(vm, t, item.addr));
      const isOpen = agg && this.open.has(key);
      const tw = h('span.tw', agg ? (isOpen ? '▾' : '▸') : '');
      if (agg) tw.addEventListener('click', () => { if (isOpen) this.open.delete(key); else this.open.add(key); this.app.renderPanels(); });
      const size = Math.max(Types.sizeof(t), 1);
      const scalar = Types.isScalar(t) || (t.k === 'array' && ['char', 'schar', 'uchar'].includes(t.of.k));
      const uninit = scalar && vm.mem.mapped(item.addr) && D().uninit(vm, item.addr, Math.min(size, 256));
      let text;
      if (item.bits) text = String(D().bitValue(vm, item.bits, item.addr - item.bits.offset));
      else text = D().show(vm, t, item.addr, { noGarbage: true });
      const ro = Types.isConst(item.type);
      const vv = h('span.vv' + (scalar && !ro ? '.edit' : '') + (uninit ? '.uninit' : ''), { title: uninit ? 'Not set yet: whatever was in memory' : ro ? 'const: cannot be changed' : scalar ? 'Click to change' : '' }, text + (ro && scalar ? ' 🔒' : ''));
      const r = h('div.vrow', { style: { paddingLeft: (8 + depth * 12) + 'px' }, title: Types.str(item.type, item.name.replace(/^[.[*]/, '')) + ' at ' + short(item.addr) },
        h('span.vn', tw, item.name), vv, h('span.vt', Types.str(item.type)));
      const sk = item.addr + ':' + Types.str(t);
      if (this.prev.has(sk) && this.prev.get(sk) !== text) r.classList.add('changed');
      this.seen.set(sk, text);
      if (scalar && !ro) vv.addEventListener('click', () => this.edit(vv, item));
      parent.appendChild(r);
      if (isOpen) {
        for (const c of D().children(vm, t, item.addr, { limit: 200 })) {
          if (c.more) { parent.appendChild(h('div.vrow', { style: { paddingLeft: (20 + depth * 12) + 'px' } }, h('span.vn.muted', '… ' + (c.n - c.from) + ' more'), h('span'), h('span'))); continue; }
          this.row(parent, vm, { name: c.name, type: c.type, addr: c.addr, key: item.key + c.name, bits: c.bits }, depth + 1);
        }
      }
    }
    edit(cell, item) {
      if (cell.querySelector('input')) return;
      const vm = this.app.vm;
      const t = Types.unqual(item.type);
      let start = cell.textContent.replace(/ 🔒$/, '');
      if (Types.isScalar(t)) {
        const v = D().read(vm, t, item.addr);
        start = t.k === 'ptr' ? (v ? '0x' + v.toString(16) : 'NULL') : ['char', 'schar', 'uchar'].includes(t.k) ? String(v) : item.bits ? String(D().bitValue(vm, item.bits, item.addr - item.bits.offset)) : Types.isFloat(t) ? D().floatText(v, t.k === 'float') : String(v);
      }
      const input = h('input', { type: 'text', value: start, 'aria-label': 'New value for ' + item.name });
      cell.textContent = '';
      cell.appendChild(input);
      input.focus(); input.select();
      let done = false;
      const finish = (ok) => {
        if (done) return; done = true;
        if (ok) {
          try { D().setValue(vm, item.type, item.addr, input.value, this.app.frameIndex || 0, item.bits); this.app.afterEdit(item.name); } catch (e) { SEE.UI.toast(e.message, 'err', 5000); this.app.renderPanels(); }
        } else this.app.renderPanels();
      };
      input.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); finish(true); } if (e.key === 'Escape') { e.preventDefault(); finish(false); } });
      input.addEventListener('blur', () => finish(true));
    }
  }

  // ---- Variables -----------------------------------------------------------------------------------
  class VarsPanel {
    constructor(app, el) { this.app = app; this.el = el; this.tree = new ValueTree(app, 'v:'); this.showLib = false; }
    render() {
      const app = this.app, vm = app.vm, el = this.el;
      const scroll = el.scrollTop;
      el.innerHTML = '';
      if (!vm) { el.appendChild(h('div.empty', 'Variables show here while the program is paused in the debugger.')); return; }
      const frames = D().frames(vm);
      const sel = Math.min(app.frameIndex || 0, frames.length - 1);
      const box = h('div.vars');
      box.appendChild(h('div.vgroup', h('span', 'Call stack'), h('span', frames.length + ' frame' + (frames.length === 1 ? '' : 's'))));
      const fl = h('div.frames-list');
      frames.forEach((f, i) => {
        if (f.system && !this.app.settings.libFrames) return;
        // very deep recursion: the newest frames and the oldest few, with a count between
        if (frames.length > 80 && i >= 60 && i < frames.length - 6) {
          if (i === 60) fl.appendChild(h('div.fr.sys', h('span', '… ' + (frames.length - 66) + ' more frames …'), h('span')));
          return;
        }
        const r = h('div.fr' + (i === sel ? '.sel' : '') + (f.system ? '.sys' : ''), { tabindex: '0', role: 'button' }, h('span.code', f.name + '()'), h('span.floc', f.where.file.replace(/^.*\//, '') + ':' + f.where.line));
        r.addEventListener('click', () => app.selectFrame(i));
        r.addEventListener('keydown', (e) => { if (e.key === 'Enter') app.selectFrame(i); });
        fl.appendChild(r);
      });
      box.appendChild(fl);
      const fr = frames[sel];
      this.tree.begin();
      if (fr) {
        const params = fr.vars.filter((v) => v.kind === 'param');
        const locals = fr.vars.filter((v) => v.kind === 'local' && !(v.sym && v.sym.temp));
        const statics = fr.vars.filter((v) => v.kind === 'static');
        const group = (title, list) => {
          if (!list.length) return;
          box.appendChild(h('div.vgroup', h('span', title + ' of ' + fr.name + '()')));
          for (const v of list) this.tree.row(box, vm, { name: v.name, type: v.type, addr: v.addr, key: sel + ':' + fr.name + ':' + v.name }, 0);
        };
        group('Parameters', params);
        group('Locals', locals);
        group('Statics', statics);
        if (!params.length && !locals.length && !statics.length) box.appendChild(h('div.empty', fr.name + '() has no variables in scope here.'));
      }
      const globals = vm.prog.globals.filter((g) => !g.system && !g.fn);
      if (globals.length) {
        box.appendChild(h('div.vgroup', h('span', 'Globals')));
        for (const g of globals) this.tree.row(box, vm, { name: g.cname, type: g.type, addr: g.addr, key: 'g:' + g.name }, 0);
      }
      this.tree.end();
      el.appendChild(box);
      el.scrollTop = scroll;
    }
  }

  // ---- Watch ---------------------------------------------------------------------------------------
  class WatchPanel {
    constructor(app, el) {
      this.app = app; this.el = el;
      this.list = store.get('watches', []).map((x) => (typeof x === 'string' ? { expr: x } : x));
      this.tree = new ValueTree(app, 'w:');
    }
    save() { store.set('watches', this.list.map((w) => w.expr)); }
    add(expr) {
      expr = String(expr || '').trim();
      if (!expr) return;
      if (!this.list.some((w) => w.expr === expr)) this.list.push({ expr });
      this.save();
      this.render();
    }
    render() {
      const app = this.app, vm = app.vm, el = this.el;
      el.innerHTML = '';
      const input = h('input', { type: 'text', placeholder: 'a C expression: x, p->next, a[i] * 2', 'aria-label': 'Expression to watch', id: 'watchInput' });
      const addBtn = h('button.btn', { type: 'button' }, 'Watch');
      const add = () => { this.add(input.value); };
      addBtn.addEventListener('click', add);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
      el.appendChild(h('div.watch-add', input, addBtn));
      if (!this.list.length) el.appendChild(h('div.empty', 'Type an expression and press Enter. It is worked out again every time the program stops. The eye button stops the program whenever that memory changes.'));
      this.tree.begin();
      this.list.forEach((w, i) => {
        let val, err = null, r = null;
        if (vm) {
          try { r = D().evaluate(vm, app.frameIndex || 0, w.expr); val = r.bits ? String(r.value) : r.lv ? D().show(vm, r.type, r.addr, { noGarbage: true }) : Types.isScalar(r.type) ? D().scalarText(vm, Types.unqual(r.type), r.value) : String(r.value); } catch (e) { err = e.message; }
        } else err = 'not running';
        const wpOn = !!(app.dbg && app.dbg.watchpoints.some((x) => x.expr === w.expr));
        const eye = h('button.ibtn' + (wpOn ? '.on' : ''), { type: 'button', title: wpOn ? 'Stop watching for changes' : 'Stop the program when this changes (a watchpoint)', 'aria-label': 'Watchpoint' }, icon('eye'));
        eye.addEventListener('click', () => app.toggleWatchpoint(w.expr));
        const del = h('button.ibtn', { type: 'button', title: 'Remove', 'aria-label': 'Remove watch' }, icon('x'));
        del.addEventListener('click', () => { this.list.splice(i, 1); this.save(); if (wpOn) app.toggleWatchpoint(w.expr); this.render(); });
        const row = h('div.wrow', h('span.we', w.expr), err ? h('span.wv.err', err) : h('span.wv', val), h('span.wtools', eye, del));
        el.appendChild(row);
        if (r && r.lv && (Types.isAggregate(Types.unqual(r.type)) || Types.unqual(r.type).k === 'ptr')) {
          const sub = h('div.vars');
          const k = 'w' + i;
          this.tree.open.add(this.tree.prefix + k);
          for (const c of D().children(vm, r.type, r.addr, { limit: 50 })) {
            if (c.more) continue;
            this.tree.row(sub, vm, { name: c.name, type: c.type, addr: c.addr, key: k + c.name, bits: c.bits }, 1);
          }
          el.appendChild(sub);
        }
      });
      this.tree.end();
    }
  }

  // ---- Breakpoints ---------------------------------------------------------------------------------
  class BreakPanel {
    constructor(app, el) { this.app = app; this.el = el; }
    render() {
      const app = this.app, el = this.el;
      el.innerHTML = '';
      const all = [];
      for (const [path, m] of app.breakpoints) for (const [line, bp] of m) all.push({ path, line, bp });
      all.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : a.line - b.line));
      if (!all.length) { el.appendChild(h('div.empty', 'No breakpoints. Click in the margin left of a line number to add one; the program stops there when you Debug.')); return; }
      const clear = h('button.btn', { type: 'button' }, 'Remove all');
      clear.addEventListener('click', () => app.clearBreakpoints());
      el.appendChild(h('div.watch-add', h('span.grow.muted', all.length + ' breakpoint' + (all.length === 1 ? '' : 's')), clear));
      for (const { path, line, bp } of all) {
        const on = h('input', { type: 'checkbox', checked: !bp.disabled, 'aria-label': 'Enabled' });
        on.addEventListener('change', () => { bp.disabled = !on.checked; app.breakpointsChanged(path); });
        const cond = h('input', { type: 'text', value: bp.cond || '', placeholder: 'only when… (e.g. i == 5)', 'aria-label': 'Condition' });
        cond.addEventListener('change', () => { bp.cond = cond.value.trim(); app.breakpointsChanged(path); });
        const loc = h('span.bploc', path.replace(/^.*\//, '') + ':' + (line + 1), h('span.muted', '  ' + (app.lineText(path, line) || '').trim().slice(0, 40)));
        loc.addEventListener('click', () => app.goto(path, line));
        const del = h('button.ibtn', { type: 'button', title: 'Remove', 'aria-label': 'Remove breakpoint' }, icon('x'));
        del.addEventListener('click', () => app.toggleBreakpoint(path, line));
        el.appendChild(h('div.bprow', on, loc, cond, del));
      }
    }
  }

  // ---- Bytes ---------------------------------------------------------------------------------------
  class BytesPanel {
    constructor(app, el) { this.app = app; this.el = el; this.addr = null; this.sel = null; }
    goTo(text) {
      const vm = this.app.vm;
      if (!vm) return;
      text = String(text).trim();
      let a = null;
      if (/^0x[0-9a-f]+$/i.test(text)) a = parseInt(text, 16);
      else {
        try {
          // a variable shows where it is; any other value (p + 1, &x, a pointer's contents) is taken as an address
          const r = D().evaluate(vm, this.app.frameIndex || 0, text);
          a = r.lv ? r.addr : r.value;
        } catch (e) { SEE.UI.toast(e.message, 'err'); return; }
      }
      this.addr = (a & ~15) >>> 0;
      this.sel = a >>> 0;
      this.render();
    }
    render() {
      const app = this.app, vm = app.vm, el = this.el;
      el.innerHTML = '';
      const input = h('input', { type: 'text', placeholder: 'address or variable: 0xbffff000, buf, &x, p', 'aria-label': 'Address', id: 'bytesAddr' });
      const go = h('button.btn', { type: 'button' }, 'Show');
      go.addEventListener('click', () => this.goTo(input.value));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.goTo(input.value); });
      const up = h('button.btn', { type: 'button', title: '256 bytes lower' }, '−256');
      const down = h('button.btn', { type: 'button', title: '256 bytes higher' }, '+256');
      up.addEventListener('click', () => { if (this.addr !== null) { this.addr = (this.addr - 256) >>> 0; this.render(); } });
      down.addEventListener('click', () => { if (this.addr !== null) { this.addr = (this.addr + 256) >>> 0; this.render(); } });
      el.appendChild(h('div.hex-bar', input, go, up, down));
      if (!vm) { el.appendChild(h('div.empty', 'Raw bytes show here while a program is paused. Each byte is coloured by what it is: red not set yet, purple read-only, struck out freed, shaded heap bookkeeping or guard.')); return; }
      if (this.addr === null) {
        const fr = D().frames(vm)[app.frameIndex || 0];
        const first = fr && fr.vars.find((v) => v.kind !== 'static');
        this.addr = ((first ? first.addr : vm.SP) & ~15) >>> 0;
      }
      const box = h('div.hex');
      const info = h('div.hex-info.muted', 'Point at a byte to see what it belongs to and which line last wrote it.');
      for (let r = 0; r < 16; r++) {
        const base = (this.addr + r * 16) >>> 0;
        const row = h('div.hex-row', h('span.ha', short(base) + '  '));
        let asc = '';
        for (let c = 0; c < 16; c++) {
          const a = (base + c) >>> 0;
          const v = vm.mem.peek(1, a);
          const st = vm.mem.shadow(a);
          const b = h('b.s' + st + (this.sel === a ? '.sel' : ''), v === null ? '··' : v.toString(16).padStart(2, '0'));
          b.addEventListener('mouseenter', () => { info.textContent = this.describe(vm, a, v, st); });
          b.addEventListener('click', () => { this.sel = a; info.textContent = this.describe(vm, a, v, st); this.render(); });
          row.appendChild(b);
          row.appendChild(document.createTextNode(c === 7 ? '  ' : ' '));
          asc += v === null ? ' ' : v >= 32 && v < 127 ? String.fromCharCode(v) : '.';
        }
        row.appendChild(h('span.asc', ' ' + asc));
        box.appendChild(row);
      }
      el.appendChild(box);
      el.appendChild(info);
    }
    describe(vm, a, v, st) {
      const w = vm.describeAddr(a);
      const gid = vm.mem.lastWriter(a);
      const s = gid ? vm.stmtById(gid) : null;
      return short(a) + ' = ' + (v === null ? 'unmapped' : '0x' + v.toString(16).padStart(2, '0') + ' (' + v + ')') + ' · ' + SEE.SH_NAMES[st] + (w ? ' · ' + w.text : '') +
        (s ? (s.debugger ? ' · changed from the debugger' : ' · last written by line ' + s.line + ' in ' + s.fnName + '()') : '');
    }
  }

  SEE.Panels = { ValueTree, VarsPanel, WatchPanel, BreakPanel, BytesPanel };
})(SEE);
