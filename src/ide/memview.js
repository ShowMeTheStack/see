// The memory picture: every frame on the stack, every heap block, the globals, the string literals
// and the functions, at their real addresses, with an arrow for every pointer. Values can be changed
// in place, and anything made of parts can be opened up.
(function (SEE) {
  'use strict';
  const { h, icon } = SEE.UI;
  const { Types, SH, MEM, hex } = SEE;
  const D = () => SEE.Debug;
  const store = SEE.UI.storage;

  const isCharT = (t) => ['char', 'schar', 'uchar'].includes(Types.unqual(t).k);
  const short = (a) => '0x' + hex(a);

  class MemView {
    constructor(app, el) {
      this.app = app;
      this.el = el;
      this.open = new Set(store.get('memOpen', []));
      this.closed = new Set();
      this.opts = Object.assign({ lib: false, arrows: true, addrs: true }, store.get('memOpts', {}));
      this.prev = new Map();     // address key -> text, to mark what changed since the last stop
      this.el.addEventListener('scroll', () => this.positionSvg());
    }
    saveOpts() { store.set('memOpts', this.opts); }

    // ---- top level -------------------------------------------------------------------------------
    render() {
      const app = this.app;
      const vm = app.vm;
      const el = this.el;
      const scroll = el.scrollTop, scrollL = el.scrollLeft;
      el.innerHTML = '';
      if (!vm) {
        el.appendChild(h('div.mem-note',
          h('p', h('b', 'The memory picture'), ' appears here while a program runs under the debugger.'),
          h('p', 'Press ', h('b', 'Debug'), ' (F5) to start at the first line of main, then step with F10 (over) and F11 (into). ',
            'You will see each function\'s frame on the stack, every malloc block on the heap, the globals, the string literals and the code, at their real addresses, with an arrow for every pointer.'),
          h('p', 'Click any value to change it. Click ▸ to open up an array or a struct.')));
        return;
      }
      this.vm = vm;
      this.cellIndex = [];       // [{lo, hi, el, depth}]
      this.pointers = [];        // [{el, value, bad}]
      this.blockTypes = new Map();
      this.seen = new Map();
      const root = h('div.mem' + (this.opts.types ? '' : '.no-types') + (this.opts.addrs ? '' : '.no-addrs'));
      this.root = root;
      root.appendChild(this.toolbar());
      const st = app.stopInfo || {};
      if (vm.state === 'faulted' && vm.fault) root.appendChild(this.faultBox(vm.fault));
      if (vm.state === 'exited') root.appendChild(h('div.ret-box', 'The program has ended with exit status ' + vm.exitCode + '. ', this.leakText(vm)));
      if (st.reason === 'return' && vm.state === 'paused') {
        const rt = Types.unqual(st.type);
        let v = st.value;
        let text = rt.k === 'void' ? 'nothing (void)' : Types.isScalar(rt) ? D().scalarText(vm, rt, v) : 'a ' + Types.str(rt);
        root.appendChild(h('div.ret-box', st.from + '() returned ' + text));
      }
      const cols = h('div.mem-cols');
      const left = h('div.mem-col'), right = h('div.mem-col');
      cols.append(left, right);
      root.appendChild(cols);
      // stack first, so pointers there give heap blocks their types
      left.appendChild(this.stackSeg(vm));
      const globals = this.globalsSeg(vm);   // before the heap: global pointers give blocks their types too
      right.appendChild(this.heapSeg(vm));
      right.appendChild(globals);
      right.appendChild(this.roSeg(vm));
      right.appendChild(this.textSeg(vm));
      root.appendChild(h('div.legend', h('span.lg-stack', 'stack'), h('span.lg-heap', 'heap'), h('span.lg-data', 'data and bss'), h('span.lg-ro', 'read-only data'), h('span.lg-text', 'code'),
        h('span', { style: { color: 'var(--m-uninit)' } }, 'red: not set yet'), h('span', '🔒 const')));
      el.appendChild(root);
      el.scrollTop = scroll; el.scrollLeft = scrollL;
      this.prev = this.seen;
      requestAnimationFrame(() => this.drawArrows());
    }

    toolbar() {
      const chk = (key, label, title) => {
        const c = h('input', { type: 'checkbox', checked: !!this.opts[key] });
        c.addEventListener('change', () => { this.opts[key] = c.checked; this.saveOpts(); this.render(); });
        return h('label', { title }, c, label);
      };
      return h('div.mem-bar', chk('arrows', 'arrows', 'Draw an arrow from each pointer to what it points at'), chk('lib', 'library frames', 'Show the C library\'s own frames and globals (like _start and the FILE table)'),
        chk('addrs', 'addresses', 'Show the address of every value'), chk('types', 'types', 'Show the type of every value (pointing at a row always shows it)'));
    }

    faultBox(f) {
      return h('div.fault-box', h('b', f.title + ': '), f.msg, f.at && f.at.line ? h('div.muted', 'at line ' + f.at.line + (f.at.fn ? ' in ' + f.at.fn + '()' : '')) : null);
    }
    leakText(vm) {
      if (!vm.libc) return '';
      const l = vm.libc.leaks();
      if (!l.length) return 'Every malloc block was freed.';
      const bytes = l.reduce((a, b) => a + b.size, 0);
      return l.length + ' heap block' + (l.length === 1 ? ' was' : 's were') + ' never freed (' + bytes + ' bytes): a memory leak.';
    }

    // ---- stack ---------------------------------------------------------------------------------------
    stackSeg(vm) {
      const seg = h('div.seg.stack');
      seg.appendChild(h('div.seg-head', h('span', 'Stack ↓'), h('span.addr', short(MEM.STACK_TOP))));
      const all = D().frames(vm);   // innermost first
      const shown = this.opts.lib ? all : all.filter((f) => !f.system);
      const sel = this.app.frameIndex || 0;
      // outermost at the top: the stack grows down towards the heap
      const list = shown.slice().reverse();
      let skip = null;
      if (list.length > 40) skip = { from: 3, to: list.length - 30 };
      list.forEach((fr, i) => {
        if (skip && i >= skip.from && i < skip.to) {
          if (i === skip.from) seg.appendChild(h('div.gap', '… ' + (skip.to - skip.from) + ' more frames of ' + list[skip.from].name + '() and others …'));
          return;
        }
        seg.appendChild(this.frameBox(vm, fr, all.indexOf(fr), sel));
      });
      if (!shown.length) seg.appendChild(h('div.gap', 'no frames'));
      const used = MEM.STACK_TOP - vm.SP;
      seg.appendChild(h('div.gap', { title: 'The stack may grow down to ' + short(MEM.STACK_LO) + '; past that is a stack overflow' }, 'stack pointer ' + short(vm.SP) + ' · ' + used.toLocaleString() + ' bytes in use · ' + Math.round((vm.SP - MEM.STACK_LO) / 1024) + ' KB left'));
      return seg;
    }

    frameBox(vm, fr, fi, sel) {
      const box = h('div.frame' + (fi === sel ? '.sel' : '') + (fi === 0 ? '.top' : '') + (fr.system ? '.sys' : ''));
      const head = h('div.frame-head', { title: 'Frame of ' + fr.name + '(): click to look at it' },
        h('span', h('span.fname', fr.name + '()'), ' ', h('span.fline', 'line ' + fr.where.line)), h('span.fline.code', 'fp ' + short(fr.fp)));
      head.addEventListener('click', () => this.app.selectFrame(fi));
      box.appendChild(head);
      const cells = h('div.cells');
      const rows = [];
      for (const v of fr.vars) {
        if (v.kind === 'static') continue;
        if (v.sym && v.sym.temp && !this.opts.lib) continue;
        rows.push({ addr: v.addr, v });
      }
      rows.push({ addr: fr.fp + 4, link: 'return to', value: vm.mem.peek(5, fr.fp + 4), fnAddr: true });
      rows.push({ addr: fr.fp, link: 'saved fp', value: vm.mem.peek(5, fr.fp) });
      rows.sort((a, b) => b.addr - a.addr);
      const key = 'f' + fi + ':' + fr.name;
      for (const r of rows) {
        if (r.link) {
          const sh = vm.mem.shadow(r.addr);
          let txt = short(r.value);
          if (r.fnAddr) { const w = vm.describeAddr(r.value); txt += w && w.fn ? ' (in ' + w.fn.name + ')' : ''; }
          const cell = h('div.cell.link', { title: r.link === 'return to' ? 'Where ' + fr.name + '() goes back to when it returns' : 'The frame pointer of the caller, restored on return' },
            h('span.a', this.opts.addrs ? short(r.addr) : ''), h('span.n', r.link), h('span.v', txt + (sh !== SH.CONTROL ? '' : '')), h('span.t', ''));
          spreadTitle(cell);
          cells.appendChild(cell);
          this.index(r.addr, 4, cell, 0);
          continue;
        }
        const v = r.v;
        const label = v.name + (v.kind === 'param' ? '' : '');
        this.valueRows(cells, vm, { name: label, type: v.type, addr: v.addr, key: key + ':' + v.name, kind: v.kind, title: (v.kind === 'param' ? 'a parameter of ' : 'a local variable of ') + fr.name + '()' }, 0);
        if (v.guard) {
          const size = Math.max(Types.sizeof(v.type), 1);
          if (this.opts.lib) cells.appendChild(h('div.cell.guard', h('span.a', this.opts.addrs ? short(v.addr + size) : ''), h('span.n', '(guard)'), h('span.v', '4 bytes kept free past ' + v.name), h('span.t', '')));
        }
      }
      box.appendChild(cells);
      return box;
    }

    // ---- a value and its parts -----------------------------------------------------------------------
    /** item: {name, type, addr, key, kind, bits} */
    valueRows(parent, vm, item, depth) {
      const t = Types.unqual(item.type);
      const agg = Types.isAggregate(t);
      const k = item.key;
      const small = (t.k === 'array' && (t.n || 0) <= 16 && !isCharT(t.of)) || (Types.isSU(t) && (Types.def(t).members || []).length <= 8);
      const forced = depth === 0 && this.forceOpen && this.forceOpen.has(item.name);
      const isOpen = agg && (this.open.has(k) || forced || (small && !this.closed.has(k) && depth < 2));
      const size = Math.max(Types.sizeof(t), 1);
      const row = h('div.cell' + (depth ? '.sub' : ''), { style: depth ? '--d: ' + depth : null });
      const tw = h('span.tw', agg ? (isOpen ? '▾' : '▸') : '');
      if (agg) tw.addEventListener('click', (e) => { e.stopPropagation(); if (forced) this.forceOpen.delete(item.name); this.toggle(k, isOpen); });
      const nameCell = h('span.n', tw, item.name);
      const vcell = this.valueCell(vm, item, t);
      row.append(h('span.a', this.opts.addrs ? short(item.addr) : ''), nameCell, vcell, h('span.t', { title: Types.str(item.type) }, typeShort(item.type)));
      row.title = (item.path || item.name) + ': ' + Types.str(item.type) + ' at ' + short(item.addr) + ' (' + size + ' byte' + (size === 1 ? '' : 's') + ')' + (item.title ? ', ' + item.title : '') + this.writerText(vm, item.addr);
      spreadTitle(row);
      parent.appendChild(row);
      this.index(item.addr, size, row, depth);
      const text = vcell.textContent;
      const sk = item.addr + ':' + Types.str(t);
      if (this.prev.has(sk) && this.prev.get(sk) !== text && !agg) row.classList.add('changed');
      this.seen.set(sk, text);
      if (isOpen) {
        for (const c of D().children(vm, t, item.addr, { limit: 64 })) {
          if (c.more) { parent.appendChild(h('div.cell.sub', { style: { '--d': depth + 1 } }, h('span.a', ''), h('span.n', '…'), h('span.v', (c.n - c.from) + ' more'), h('span.t', ''))); continue; }
          this.valueRows(parent, vm, { name: c.name, path: (item.path || item.name) + c.name, type: c.type, addr: c.addr, key: k + c.name, bits: c.bits }, depth + 1);
        }
      }
    }

    valueCell(vm, item, t) {
      const size = Math.max(Types.sizeof(t), 1);
      let text;
      let cls = 'span.v';
      if (item.bits) text = String(D().bitValue(vm, item.bits, item.addr - item.bits.offset));
      else if (Types.isSU(t)) text = Types.str(t);
      else if (t.k === 'array') text = isCharT(t.of) ? D().show(vm, t, item.addr) : t.n + ' × ' + Types.str(t.of);
      else if (t.k === 'ptr') { const pv = D().read(vm, t, item.addr); text = pv ? short(pv) : 'NULL'; }
      else text = D().show(vm, t, item.addr, { noGarbage: true });
      const scalar = Types.isScalar(t) || (t.k === 'array' && isCharT(t.of));
      const uninit = scalar && D().uninit(vm, item.addr, Math.min(size, 256));
      if (uninit) cls += '.uninit';
      const ro = Types.isConst(item.type) || vm.mem.shadow(item.addr) === SH.RODATA;
      if (scalar) cls += ro ? '.ro' : '.edit';
      if (t.k === 'ptr') cls += '.ptr';
      const v = h(cls, text);
      if (uninit) v.title = 'Not set yet: this is whatever was left in memory there';
      if (t.k === 'ptr') {
        const p = D().read(vm, t, item.addr);
        v.title = D().show(vm, t, item.addr) + (p ? '\npoints at ' + ((vm.describeAddr(p) || {}).text || 'nothing known') : '');
        const dot = h('span.dot');
        v.appendChild(dot);
        if (!p) dot.classList.add('null');
        else {
          const st = vm.mem.shadow(p);
          const bad = st === SH.NONE || st === SH.FREED || uninit;
          if (bad) dot.classList.add('bad');
          this.pointers.push({ el: dot, from: v, value: p, bad, type: t });
          if (!bad && t.to.k !== 'void' && t.to.k !== 'func' && Types.isComplete(t.to)) this.noteBlockType(vm, p, t.to);
        }
      }
      if (scalar && !ro && !item.noEdit) {
        v.addEventListener('click', (e) => { e.stopPropagation(); this.edit(v, item, t); });
      } else if (ro) v.title = 'const: the program cannot change this, so neither can the debugger';
      return v;
    }
    writerText(vm, addr) {
      const gid = vm.mem.lastWriter(addr);
      if (!gid) return '';
      const s = vm.stmtById(gid);
      if (!s) return '';
      if (s.debugger) return '\nlast changed from the debugger';
      return '\nlast written by line ' + s.line + ' in ' + s.fnName + '()';
    }
    toggle(k, isOpen) {
      if (isOpen) { this.open.delete(k); this.closed.add(k); } else { this.open.add(k); this.closed.delete(k); }
      store.set('memOpen', [...this.open].slice(-300));
      this.render();
    }
    edit(cell, item, t) {
      if (cell.querySelector('input')) return;
      const vm = this.vm;
      let start = cell.textContent;
      if (t.k === 'array') start = '"' + (vm.mem.cstr ? safeStr(vm, item.addr, t.n) : '') + '"';
      else if (Types.isScalar(t)) {
        const v = D().read(vm, t, item.addr);
        start = t.k === 'ptr' ? (v ? '0x' + v.toString(16) : 'NULL') : isCharT(t) ? (v >= 32 && v < 127 && v !== 39 && v !== 92 ? "'" + String.fromCharCode(v) + "'" : String(v)) : String(item.bits ? D().bitValue(vm, item.bits, item.addr - item.bits.offset) : Types.isFloat(t) ? D().floatText(v, t.k === 'float') : v);
      }
      const input = h('input', { type: 'text', value: start, 'aria-label': 'New value for ' + item.name });
      cell.textContent = '';
      cell.appendChild(input);
      input.focus();
      input.select();
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        if (ok) {
          try {
            D().setValue(vm, item.type, item.addr, input.value, this.app.frameIndex || 0, item.bits);
            this.app.afterEdit(item.name);
          } catch (e) { SEE.UI.toast(e.message, 'err', 5000); this.render(); }
        } else this.render();
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); finish(true); }
        if (e.key === 'Escape') { e.preventDefault(); finish(false); }
        e.stopPropagation();
      });
      input.addEventListener('blur', () => finish(true));
    }

    index(addr, size, el, depth) { this.cellIndex.push({ lo: addr, hi: addr + size, el, depth }); }
    noteBlockType(vm, p, t) {
      if (!vm.libc) return;
      const i = vm.libc.findBlock(p);
      if (i < 0) return;
      if (!this.blockTypes.has(p)) this.blockTypes.set(p, t);
    }

    // ---- heap ---------------------------------------------------------------------------------------
    heapSeg(vm) {
      const seg = h('div.seg.heap');
      const m = vm.mem;
      seg.appendChild(h('div.seg-head', h('span', 'Heap ↑ (malloc)'), h('span.addr', short(m.heapLo) + ' – ' + short(m.brk))));
      const blocks = vm.libc ? vm.libc.blocks : [];
      if (!blocks.length) { seg.appendChild(h('div.gap', 'nothing allocated yet')); return seg; }
      // types for blocks come from pointers to them; pointers inside blocks can type other blocks
      const order = blocks.slice().sort((a, b) => b.addr - a.addr);
      const holder = h('div');
      const draw = () => {
        holder.innerHTML = '';
        for (const b of order) holder.appendChild(this.blockBox(vm, b));
      };
      let before = -1;
      for (let round = 0; round < 6 && before !== this.blockTypes.size; round++) {
        before = this.blockTypes.size;
        const save = { cells: this.cellIndex.length, ptrs: this.pointers.length };
        draw();
        if (before !== this.blockTypes.size) { this.cellIndex.length = save.cells; this.pointers.length = save.ptrs; }
      }
      seg.appendChild(holder);
      return seg;
    }
    blockBox(vm, b) {
      const exited = vm.state === 'exited';
      const box = h('div.blk' + (b.free ? '.freed' : '') + (!b.free && exited ? '.leak' : ''));
      const site = b.site ? 'line ' + b.site.line + (b.site.fn ? ' in ' + b.site.fn + '()' : '') : '';
      box.appendChild(h('div.blk-head', h('span', b.free ? 'free (was block #' + b.id + ')' : 'block #' + b.id + ' · ' + b.size + ' byte' + (b.size === 1 ? '' : 's')),
        h('span', b.free ? (b.freedAt ? 'freed at line ' + b.freedAt.line : '') : (b.by + ' at ' + site) + (exited ? ' · never freed' : ''))));
      if (this.opts.lib) box.appendChild(h('div.hdr', short(b.addr - 8) + '  header: size ' + vm.mem.peek(5, b.addr - 8) + ', tag 0x' + hex(vm.mem.peek(5, b.addr - 4))));
      const cells = h('div.cells');
      if (b.free) {
        cells.appendChild(h('div.cell', h('span.a', this.opts.addrs ? short(b.addr) : ''), h('span.n', ''), h('span.v', b.cap + ' bytes ready for the next malloc'), h('span.t', '')));
        this.index(b.addr, b.cap, cells.lastChild, 0);
        box.appendChild(cells);
        return box;
      }
      const t = this.blockTypes.get(b.addr);
      const es = t ? Types.sizeof(t) : 0;
      let type;
      if (t && es && b.size % es === 0 && b.size / es > 1) type = Types.array(t, b.size / es);
      else if (t && es && b.size === es) type = t;
      else if (t && es && b.size > es) type = Types.array(t, Math.floor(b.size / es));
      else type = Types.array(Types.T.uchar, b.size || 1);
      if (!t && b.size > 0) {
        // no typed pointer here: maybe it is a string
        const first = vm.mem.peek(1, b.addr);
        if (first !== null && first >= 32 && first < 127) type = Types.array(Types.T.char, b.size);
      }
      this.valueRows(cells, vm, { name: t ? (type.k === 'array' ? '[' + type.n + ']' : '*') : 'bytes', type, addr: b.addr, key: 'h' + b.id, title: 'heap block #' + b.id }, 0);
      box.appendChild(cells);
      return box;
    }

    // ---- globals, read-only data, code ---------------------------------------------------------------
    globalsSeg(vm) {
      const seg = h('div.seg.data');
      const [, , data, bss] = vm.prog.segments;
      seg.appendChild(h('div.seg-head', h('span', 'Globals and statics (.data, .bss)'), h('span.addr', short(data.lo) + ' – ' + short(bss.hi))));
      const cells = h('div.cells');
      const list = vm.prog.globals.filter((g) => (g.section === 'data' || g.section === 'bss') && (this.opts.lib || !g.system)).sort((a, b) => b.addr - a.addr);
      for (const g of list) this.valueRows(cells, vm, { name: (g.fn ? g.fn + '.' : '') + g.cname, type: g.type, addr: g.addr, key: 'g:' + g.name, title: (g.section === 'bss' ? 'in .bss (zero at start)' : 'in .data') + (g.isStatic ? ', static' : '') }, 0);
      if (!list.length) cells.appendChild(h('div.cell', h('span.a', ''), h('span.n', ''), h('span.v.muted', 'no global variables'), h('span.t', '')));
      seg.appendChild(cells);
      return seg;
    }
    roSeg(vm) {
      const seg = h('div.seg.ro');
      const ro = vm.prog.segments[1];
      seg.appendChild(h('div.seg-head', h('span', 'Read-only data (.rodata)'), h('span.addr', short(ro.lo))));
      const cells = h('div.cells');
      const consts = vm.prog.globals.filter((g) => g.section === 'rodata' && (this.opts.lib || !g.system));
      for (const g of consts) this.valueRows(cells, vm, { name: g.cname, type: g.type, addr: g.addr, key: 'g:' + g.name, title: 'a const global in .rodata' }, 0);
      const strs = vm.prog.strings.filter((s) => this.opts.lib || !/\/usr\/lib\//.test(s.unit)).sort((a, b) => b.addr - a.addr);
      for (const s of strs.slice(0, 200)) {
        const row = h('div.cell', { title: 'string literal from line ' + s.lit.pos.line + ' of ' + s.unit + ': it lives here for the whole run and cannot be changed' },
          h('span.a', this.opts.addrs ? short(s.addr) : ''), h('span.n', 'line ' + s.lit.pos.line), h('span.v.ro', D().quoteBytes(s.lit.bytes.slice(0, -1), 48)), h('span.t', 'char[' + s.size + ']'));
        spreadTitle(row);
        cells.appendChild(row);
        this.index(s.addr, s.size, row, 0);
      }
      if (!consts.length && !strs.length) cells.appendChild(h('div.cell', h('span.a', ''), h('span.n', ''), h('span.v.muted', 'no string literals'), h('span.t', '')));
      seg.appendChild(cells);
      return seg;
    }
    textSeg(vm) {
      const seg = h('div.seg.text.fnlist');
      const tx = vm.prog.segments[0];
      seg.appendChild(h('div.seg-head', h('span', 'Code (.text)'), h('span.addr', short(tx.lo))));
      const cells = h('div.cells');
      const cur = new Set(D().frames(vm).map((f) => f.fn));
      for (const f of vm.prog.functions.slice().sort((a, b) => b.addr - a.addr)) {
        if (f.system && !this.opts.lib) continue;
        const row = h('div.cell' + (cur.has(f) ? '.target' : ''), { title: Types.str(f.type, f.name) + (f.system ? ' (C library)' : '') }, h('span.a', short(f.addr)), h('span.n', f.name + '()'), h('span.v.muted', f.unitFile.replace(/^.*\//, '') + ':' + f.pos.line), h('span.t', ''));
        spreadTitle(row);
        cells.appendChild(row);
        this.index(f.addr, f.size, row, 0);
      }
      const nat = vm.prog.natives.filter((n) => this.opts.lib || !n.name.startsWith('__'));
      if (nat.length) {
        const row = h('div.cell', h('span.a', short(nat[0].addr)), h('span.n', 'library'), h('span.v.muted', nat.map((n) => n.name).join(', ')), h('span.t', ''));
        cells.appendChild(row);
        for (const n of nat) this.index(n.addr, 16, row, 0);
      }
      seg.appendChild(cells);
      return seg;
    }

    // ---- arrows ----------------------------------------------------------------------------------------
    target(p) {
      let best = null;
      for (const c of this.cellIndex) {
        if (p >= c.lo && p < c.hi && (!best || (c.hi - c.lo) < (best.hi - best.lo) || ((c.hi - c.lo) === (best.hi - best.lo) && c.depth > best.depth))) best = c;
      }
      return best;
    }
    positionSvg() { /* the svg scrolls with the content; nothing to do */ }
    drawArrows() {
      if (!this.root || !this.opts.arrows) return;
      const old = this.root.querySelector('svg.mem-svg');
      if (old) old.remove();
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'mem-svg');
      const rb = this.root.getBoundingClientRect();
      svg.setAttribute('width', this.root.scrollWidth);
      svg.setAttribute('height', this.root.scrollHeight);
      for (const p of this.pointers) {
        const t = this.target(p.value);
        if (!t || !t.el.isConnected || !p.el.isConnected) continue;
        const a = p.el.getBoundingClientRect();
        const b = rectOf(t.el);
        if (!a.width || !b.width) continue;
        const x1 = a.left + a.width / 2 - rb.left, y1 = a.top + a.height / 2 - rb.top;
        const toRight = b.left > a.right;
        let x2, y2 = b.top + Math.min(b.height / 2, 9) - rb.top;
        let c1x, c2x;
        if (toRight) { x2 = b.left - rb.left; c1x = x1 + Math.max(30, (x2 - x1) / 2); c2x = x2 - Math.max(30, (x2 - x1) / 2); }
        else {
          // same column: loop out to the right, inside the picture's margin
          x2 = b.right - rb.left;
          const out = Math.min(this.root.scrollWidth - 3, Math.max(x1, x2) + 14 + Math.min(30, Math.abs(y2 - y1) / 8));
          c1x = out; c2x = out;
        }
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', `M${x1},${y1} C${c1x},${y1} ${c2x},${y2} ${x2},${y2}`);
        if (p.bad) path.setAttribute('class', 'bad');
        svg.appendChild(path);
        const head = document.createElementNS(NS, 'path');
        const dir = toRight ? 1 : -1;
        head.setAttribute('d', `M${x2},${y2} l${-6 * dir},-4 l0,8 z`);
        head.setAttribute('class', 'head' + (p.bad ? ' bad' : ''));
        svg.appendChild(head);
        const hl = (on) => { path.classList.toggle('hl', on); t.el.classList.toggle('target', on); };
        p.from.addEventListener('mouseenter', () => hl(true));
        p.from.addEventListener('mouseleave', () => hl(false));
      }
      this.root.appendChild(svg);
    }
  }

  /** Rows are display: contents, so their box is the union of their cells */
  function rectOf(el) {
    const r = el.getBoundingClientRect();
    if (r.width || !el.children.length) return r;
    let l = Infinity, t = Infinity, rr = -Infinity, bb = -Infinity;
    for (const c of el.children) {
      const x = c.getBoundingClientRect();
      if (!x.width && !x.height) continue;
      l = Math.min(l, x.left); t = Math.min(t, x.top); rr = Math.max(rr, x.right); bb = Math.max(bb, x.bottom);
    }
    if (l === Infinity) return r;
    return { left: l, top: t, right: rr, bottom: bb, width: rr - l, height: bb - t };
  }
  /** Tooltips go on the cells: a display: contents row has no box of its own to point at */
  function spreadTitle(row) {
    if (!row.title) return;
    for (const c of row.children) if (!c.title) c.title = row.title;
    row.removeAttribute('title');
  }

  function typeShort(t) {
    const s = Types.str(t);
    return s.length > 22 ? s.slice(0, 20) + '…' : s;
  }
  function safeStr(vm, addr, n) {
    let s = '';
    for (let i = 0; i < n; i++) { const c = vm.mem.peek(1, addr + i); if (!c) break; s += D().charText(c, '"'); }
    return s;
  }

  SEE.MemView = MemView;
})(SEE);
