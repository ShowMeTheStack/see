// The hover callout in the editor. While a program is paused, pointing at a variable (or a chain
// like p->next->v or a[i]) shows its value; the callout stays open when the mouse moves into it, and
// values in the newest frame can be changed right there. Older frames are changed from the
// Variables panel or the memory picture. When nothing runs, library names show their reference.
(function (SEE) {
  'use strict';
  const { h, icon } = SEE.UI;
  const { Types, hex } = SEE;

  class Callout {
    constructor(app) {
      this.app = app;
      this.el = null;
      this.hideTimer = null;
      this.tree = new SEE.Panels.ValueTree(app, 'c:');
      // edits from the callout are made in the newest frame, then everything is drawn again
      this.tree.app = { get vm() { return app.vm; }, frameIndex: 0, afterEdit: (n) => { app.afterEdit(n); this.refresh(); }, renderPanels: () => this.refresh() };
    }
    showFor(doc, pos, x, y) {
      const line = doc.editor.lines()[pos.line] || '';
      const w = SEE.CLang.wordAt(line, pos.col);
      if (!w || inComment(doc, pos.line, w.start)) { this.scheduleHide(300); return; }
      const key = doc.path + ':' + pos.line + ':' + w.start + ':' + w.expr;
      if (this.el && this.key === key) { this.cancelHide(); return; }
      const vm = this.app.vm;
      const live = vm && (vm.state === 'paused' || vm.state === 'faulted' || vm.state === 'exited' || vm.state === 'input');
      if (live && !SEE.CLang.KW.has(w.word)) {
        const found = this.find(vm, w.expr, w.word, doc.path, pos.line);
        if (found) { this.open(key, x, y, found); return; }
      }
      if (SEE.Help && SEE.Help.brief) {
        const b = SEE.Help.brief(w.word);
        if (b) { this.openHelp(key, x, y, w.word, b); return; }
      }
      this.scheduleHide(300);
    }
    /** Look the expression up in the newest frame; if that fails, in the frame of the function this line is in */
    find(vm, expr, word, path, line) {
      const frames = SEE.Debug.frames(vm);
      const tryIn = (fi) => {
        for (const e of [expr, word]) {
          try {
            const r = SEE.Debug.evaluate(vm, fi, e);
            if (r && r.type.k !== 'func') return { r, fi, expr: e };
          } catch (err) { /* not here */ }
        }
        return null;
      };
      const here = frames.findIndex((f) => !f.system && f.where.file === path && f.fn.pos.line - 1 <= line && f.fn.endPos.line - 1 >= line);
      if (here > 0) { const f = tryIn(here); if (f) return f; }
      return tryIn(0);
    }
    open(key, x, y, found) {
      this.hide();
      this.key = key;
      this.found = found;
      this.el = h('div.callout', { role: 'dialog', 'aria-label': 'Value of ' + found.expr });
      document.body.appendChild(this.el);
      this.refresh();
      this.place(x, y);
      this.bindHover();
    }
    refresh() {
      if (!this.el || !this.found) return;
      const vm = this.app.vm;
      const { fi, expr } = this.found;
      let r;
      try { r = SEE.Debug.evaluate(vm, fi, expr); } catch (e) { this.hide(); return; }
      const frames = SEE.Debug.frames(vm);
      const fr = frames[fi];
      this.el.innerHTML = '';
      const close = h('button.ibtn', { type: 'button', title: 'Close', 'aria-label': 'Close' }, icon('x'));
      close.addEventListener('click', () => this.hide());
      this.el.appendChild(h('div.co-head', h('code', expr), close));
      const t = r.type;
      this.el.appendChild(h('div.co-meta', Types.str(t) + (r.lv ? ' at 0x' + hex(r.addr) + ' · ' + Math.max(Types.sizeof(t), 1) + ' bytes' : '') + (fr ? ' · in ' + fr.name + '()' : '')));
      const box = h('div.vars');
      if (r.lv) {
        const editable = fi === 0;
        const item = { name: expr, type: editable ? t : Types.qual(t, Types.Q_CONST), addr: r.addr, key: expr, bits: r.bits };
        this.tree.open.add('c:' + expr);
        this.tree.begin();
        this.tree.row(box, vm, item, 0);
        this.tree.end();
        if (!editable && !Types.isConst(t)) {
          // shown read-only here: the value belongs to an older frame
          box.querySelectorAll('.vv').forEach((v) => { v.title = 'This copy belongs to ' + fr.name + '() further down the stack. Change it from the Variables panel or the memory picture.'; });
        }
      } else {
        box.appendChild(h('div.vrow', h('span.vn', expr), h('span.vv', Types.isScalar(t) ? SEE.Debug.scalarText(vm, Types.unqual(t), r.value) : String(r.value)), h('span.vt', Types.str(t))));
      }
      this.el.appendChild(box);
      const w = r.lv ? SEE.Debug.describeAddr(vm, r.addr) : null;
      const gid = r.lv ? vm.mem.lastWriter(r.addr) : 0;
      const s = gid ? vm.stmtById(gid) : null;
      const notes = [];
      if (w && w.kind === 'heap') notes.push('On the heap: ' + w.text + '.');
      if (s && !s.debugger) notes.push('Last written by line ' + s.line + ' in ' + s.fnName + '().');
      if (fi > 0) notes.push('This is ' + fr.name + '()\'s copy, ' + fi + ' frame' + (fi === 1 ? '' : 's') + ' down the stack. Change it from the Variables panel or the memory picture.');
      else if (r.lv && !Types.isConst(t)) notes.push('Click the value to change it.');
      if (notes.length) this.el.appendChild(h('div.co-note', notes.join(' ')));
    }
    openHelp(key, x, y, word, brief) {
      this.hide();
      this.key = key;
      this.found = null;
      this.el = h('div.callout', { role: 'dialog', 'aria-label': 'About ' + word });
      const close = h('button.ibtn', { type: 'button', title: 'Close', 'aria-label': 'Close' }, icon('x'));
      close.addEventListener('click', () => this.hide());
      const more = h('a', { href: '#' }, 'More in the reference');
      more.addEventListener('click', (e) => { e.preventDefault(); this.hide(); this.app.showReference(word); });
      this.el.append(h('div.co-head', h('code', word), close), h('div.co-meta', brief.sig), h('div', { style: { padding: '6px 8px' } }, brief.text), h('div.co-note', more));
      document.body.appendChild(this.el);
      this.place(x, y);
      this.bindHover();
    }
    place(x, y) {
      const r = { width: this.el.offsetWidth, height: this.el.offsetHeight };
      const left = Math.min(x + 6, window.innerWidth - r.width - 8);
      let top = y + 18;
      if (top + r.height > window.innerHeight - 8) top = Math.max(8, y - r.height - 10);
      this.el.style.left = Math.max(8, left) + 'px';
      this.el.style.top = top + 'px';
    }
    bindHover() {
      this.el.addEventListener('mouseenter', () => this.cancelHide());
      this.el.addEventListener('mouseleave', () => { if (!this.el.contains(document.activeElement)) this.scheduleHide(400); });
      this.el.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hide(); });
    }
    scheduleHide(ms) {
      this.cancelHide();
      this.hideTimer = setTimeout(() => {
        if (this.el && (this.el.matches(':hover') || this.el.contains(document.activeElement))) return;
        this.hide();
      }, ms);
    }
    cancelHide() { if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; } }
    hide() { this.cancelHide(); if (this.el) { this.el.remove(); this.el = null; this.key = null; } }
    isOpen() { return !!this.el; }
  }

  function inComment(doc, line, col) {
    const lines = doc.editor.lines();
    let st = 0;
    for (let i = 0; i < line; i++) st = SEE.CLang.depthAfter(lines[i], st);
    const before = lines[line].slice(0, col);
    return SEE.CLang.depthAfter(before, st) === 1 || /\/\/|"[^"]*$/.test(before.replace(/"[^"]*"/g, ''));
  }

  SEE.Callout = Callout;
})(SEE);
