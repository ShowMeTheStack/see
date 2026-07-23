// Lessons: each one is a small program and a walk through it. Every step explains one thing and
// moves the debugger (start, step over, into, run to a line, change a value), so the words, the
// code and the memory picture move together. The lesson card sits above the memory picture.
(function (SEE) {
  'use strict';
  const { h, icon } = SEE.UI;
  const store = SEE.UI.storage;
  const Lessons = SEE.Lessons = { list: [], units: [] };

  Lessons.add = function (l) {
    if (Lessons.list.some((x) => x.id === l.id)) return;
    Lessons.list.push(l);
    if (!Lessons.units.includes(l.unit)) Lessons.units.push(l.unit);
  };
  Lessons.byId = (id) => Lessons.list.find((l) => l.id === id) || null;
  const done = () => new Set(store.get('lessonsDone', []));
  const markDone = (id) => { const d = done(); d.add(id); store.set('lessonsDone', [...d]); };

  Lessons.browse = function (app) {
    const d = done();
    const box = h('div', { style: { maxHeight: '64vh', overflow: 'auto' } });
    box.appendChild(h('p', 'Each lesson is a short program and a walk through it, one step at a time, with the memory picture drawn as it runs. Press Next to move on; you can change the code or any value along the way.'));
    Lessons.units.forEach((u, ui) => {
      box.appendChild(h('h3', { style: { margin: '12px 0 4px' } }, (ui + 1) + '. ' + u));
      for (const l of Lessons.list.filter((x) => x.unit === u)) {
        const row = h('div.list-row.clickable', { dataset: { id: l.id }, tabindex: '0' }, h('span', { style: { width: '18px' } }, d.has(l.id) ? '✓' : ''), h('div.grow', h('b', l.title), l.blurb ? h('div.muted', l.blurb) : null), h('span.muted', l.steps.length + ' steps'));
        const go = () => { SEE.UI.closeAllModals(); setTimeout(() => Lessons.start(app, l.id), 60); };
        row.addEventListener('click', go);
        row.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
        box.appendChild(row);
      }
    });
    SEE.UI.modal({ title: 'Lessons', wide: true, body: box, buttons: [{ label: 'Close', value: true }] });
  };
  Lessons.startById = (app, id) => Lessons.start(app, id);

  /** Put the lesson's files in /lessons/<id> and open the main one */
  Lessons.install = function (app, l) {
    const dir = '/lessons/' + l.id;
    const v = app.vfs;
    v.mkdir(dir, { parents: true, exist: true, trusted: true });
    for (const [name, text] of Object.entries(l.files)) {
      const p = dir + '/' + name;
      let old = null;
      try { old = v.exists(p) ? v.readText(p) : null; } catch (e) { old = null; }
      if (old !== text) v.writeText(p, text, { trusted: true });
      const od = app.docByPath(p);
      if (od && (od.editor.getValue() !== text)) { od.editor.setValue(text); od.savedText = text; od.dirty = false; }
    }
    const root = v.entries.get('/lessons');
    if (root) root.readOnly = true;
    return dir;
  };

  Lessons.start = async function (app, id) {
    const l = Lessons.byId(id);
    if (!l) { SEE.UI.toast('No such lesson: ' + id, 'err'); return; }
    if (SEE.Tours) SEE.Tours.stop();
    app.stop();
    const dir = Lessons.install(app, l);
    const main = l.main || Object.keys(l.files).find((f) => /\.c$/.test(f));
    for (const f of Object.keys(l.files).filter((x) => x !== main)) app.openFile(dir + '/' + f, { noFocus: true });
    app.openFile(dir + '/' + main);
    app.expanded.add('/lessons'); app.expanded.add(dir.toLowerCase());
    app.renderSide();
    const st = { app, l, i: -1, dir, busy: false };
    Lessons.current = st;
    location.hash = 'lesson=' + encodeURIComponent(id);
    Lessons.render(st);
  };
  Lessons.close = function () {
    const st = Lessons.current;
    Lessons.current = null;
    const card = document.getElementById('lessonCard');
    if (card) card.remove();
    const mini = document.getElementById('lessonMini');
    if (mini) mini.remove();
    if (st && location.hash.startsWith('#lesson=')) history.replaceState(null, '', location.pathname + location.search);
    if (st) st.app.memview.forceOpen = new Set();
  };

  Lessons.render = function (st) {
    const { app, l } = st;
    let card = document.getElementById('lessonCard');
    if (!card) {
      card = h('div.lesson-card#lessonCard', { role: 'region', 'aria-label': 'Lesson' });
      const right = document.getElementById('right');
      right.insertBefore(card, right.firstChild);
      if (!app.settings.right) { app.settings.right = true; app.applyLayout(); }
    }
    card.innerHTML = '';
    const step = st.i >= 0 ? l.steps[st.i] : null;
    const close = h('button.ibtn', { type: 'button', title: 'Close the lesson', 'aria-label': 'Close the lesson', id: 'lessonClose' }, icon('x'));
    close.addEventListener('click', () => Lessons.close());
    const min = h('button.ibtn', { type: 'button', title: 'Fold the lesson', 'aria-label': 'Fold the lesson' }, icon('min'));
    min.addEventListener('click', () => card.classList.toggle('folded'));
    card.appendChild(h('div.lesson-head', h('span', h('b', l.title), h('span.muted', '  ' + l.unit)), h('span', min, close)));
    const body = h('div.lesson-pane', { id: 'lessonText' });
    body.innerHTML = step ? step.text : (l.intro || '<p>' + SEE.escapeHtml(l.blurb || '') + '</p><p>Press <b>Start</b> to begin.</p>');
    card.appendChild(body);
    const back = h('button.btn', { type: 'button', id: 'lessonBack', disabled: st.i < 0 }, 'Back');
    const last = st.i === l.steps.length - 1;
    const next = h('button.btn.primary', { type: 'button', id: 'lessonNext' }, st.i < 0 ? 'Start' : last ? 'Finish' : 'Next');
    const restart = h('button.btn', { type: 'button', id: 'lessonRestart', title: 'Start this lesson again' }, 'Again');
    back.addEventListener('click', () => Lessons.go(st, st.i - 1));
    next.addEventListener('click', () => { if (last) { markDone(l.id); Lessons.finish(st); } else Lessons.go(st, st.i + 1); });
    restart.addEventListener('click', () => Lessons.go(st, -1));
    const pos = h('span.grow', st.i < 0 ? l.steps.length + ' steps' : 'Step ' + (st.i + 1) + ' of ' + l.steps.length);
    card.appendChild(h('div.lesson-nav', back, restart, pos, next));
    if (st.busy) { next.disabled = true; back.disabled = true; }
    // on a phone the card lives in the Memory view; a small bar keeps Next at hand everywhere else
    let mini = document.getElementById('lessonMini');
    if (!mini) { mini = h('div.lesson-mini#lessonMini'); document.getElementById('app').insertBefore(mini, document.getElementById('mobilebar')); }
    mini.innerHTML = '';
    const read = h('button.btn', { type: 'button', id: 'lessonMiniRead' }, 'Read');
    read.addEventListener('click', () => app.setView('memory'));
    const mnext = h('button.btn.primary', { type: 'button', id: 'lessonMiniNext', disabled: st.busy }, st.i < 0 ? 'Start' : last ? 'Finish' : 'Next');
    mnext.addEventListener('click', () => next.click());
    mini.append(h('span.grow', h('b', l.title), ' · ' + (st.i < 0 ? 'ready' : 'step ' + (st.i + 1) + ' of ' + l.steps.length)), read, mnext);
    body.querySelectorAll('code[data-goto]').forEach((c) => c.addEventListener('click', () => app.goto(st.dir + '/' + (c.dataset.file || l.main || 'main.c'), +c.dataset.goto - 1)));
    if (!app.isPhone()) next.focus({ preventScroll: true });
  };

  Lessons.finish = function (st) {
    const { app, l } = st;
    const i = Lessons.list.indexOf(l);
    const nextL = Lessons.list[i + 1];
    const card = document.getElementById('lessonCard');
    if (!card) return;
    const body = card.querySelector('.lesson-pane');
    body.innerHTML = '<h3>Well done.</h3><p>That was <b>' + SEE.escapeHtml(l.title) + '</b>. The program is still here to play with: change it, build it, step through it again.</p>';
    const nav = card.querySelector('.lesson-nav');
    nav.innerHTML = '';
    const again = h('button.btn', { type: 'button' }, 'Again');
    again.addEventListener('click', () => Lessons.go(st, -1));
    const all = h('button.btn', { type: 'button' }, 'All lessons');
    all.addEventListener('click', () => Lessons.browse(app));
    nav.append(again, all, h('span.grow'));
    if (nextL) {
      const n = h('button.btn.primary', { type: 'button', id: 'lessonNextLesson' }, 'Next lesson: ' + nextL.title);
      n.addEventListener('click', () => Lessons.start(app, nextL.id));
      nav.appendChild(n);
    }
  };

  /** Go to step i: from the start, or onward from the current step */
  Lessons.go = async function (st, i) {
    if (st.busy) return;
    const { app, l } = st;
    st.busy = true;
    Lessons.render(st);
    try {
      if (i < 0 || i <= st.i) Lessons.install(app, l);
      if (i < 0) { app.stop(); app.terminal.clear(); st.i = -1; }
      else if (i <= st.i) {
        // going back: replay from the beginning without pausing on the way
        app.stop();
        app.terminal.clear();
        app.memview.forceOpen = new Set();
        st.i = -1;
        for (let k = 0; k < i; k++) { await Lessons.perform(st, l.steps[k], true); st.i = k; }
        await Lessons.perform(st, l.steps[i], false);
        st.i = i;
      } else {
        for (let k = st.i + 1; k <= i; k++) { await Lessons.perform(st, l.steps[k], k < i); st.i = k; }
      }
    } catch (e) {
      SEE.UI.toast('The lesson could not do that step: ' + e.message, 'err', 5000);
    }
    st.busy = false;
    if (Lessons.current === st) Lessons.render(st);
  };

  /** Wait for the machine to stop (paused, waiting for input, ended) */
  function settle(app, ms) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        const vm = app.vm;
        if (!vm || !app.running || Date.now() - t0 > (ms || 20000)) { resolve(); return; }
        setTimeout(tick, 20);
      };
      tick();
    });
  }

  Lessons.perform = async function (st, step, quiet) {
    const { app } = st;
    const act = step.do;
    const vm = () => app.vm;
    const ensure = async () => {
      if (!vm() || vm().state === 'exited' || vm().state === 'faulted' || !app.dbg) {
        if (!app.startDebug('start')) throw new Error('the program did not build');
        await settle(app);
      }
    };
    if (step.input && vm() && vm().libc) { /* given below once running */ }
    if (act && typeof act === 'object' && act.edit) {
      // change one line of the lesson's code in the editor (the original file stays as it was)
      const [line, text] = act.edit;
      const d = app.openFile(st.dir + '/' + (act.file || st.l.main || 'main.c'), { noFocus: quiet });
      if (d) {
        const lines = d.editor.getValue().split('\n');
        lines[line - 1] = text;
        d.editor.setValue(lines.join('\n'));
        d.dirty = d.editor.getValue() !== d.savedText;
        app.renderTabs();
        if (!quiet) d.editor.flashLine(line - 1);
      }
    }
    if (act === 'start' || act === 'restart') { app.stop(); app.terminal.clear(); if (!app.startDebug('start')) throw new Error('the program did not build'); await settle(app); }
    else if (act === 'build') { app.stop(); app.build(); if (!quiet) app.showBottom('probs'); }
    else if (act === 'run') { app.stop(); app.run(); await settle(app); }
    else if (act === 'over' || act === 'into' || act === 'out' || act === 'stmt') {
      await ensure();
      const n = step.times || 1;
      for (let k = 0; k < n; k++) { if (vm().state !== 'paused') break; app.step(act); await settle(app); }
    } else if (act === 'continue') { await ensure(); if (vm().state === 'paused') { app.resume('run'); await settle(app); } }
    else if (act === 'back') { const n = step.times || 1; for (let k = 0; k < n; k++) app.stepBack(); }
    else if (act && typeof act === 'object' && act.to !== undefined) {
      await ensure();
      const file = st.dir + '/' + (act.file || st.l.main || 'main.c');
      if (vm().state === 'paused') {
        app.dbg.tempBreak = app.dbg.setBreakpoint(file, act.to, { temp: true });
        app.resume('run');
        await settle(app);
      }
    } else if (act && typeof act === 'object' && act.set) {
      await ensure();
      const [expr, value] = act.set;
      const r = SEE.Debug.evaluate(vm(), 0, expr);
      SEE.Debug.setValue(vm(), r.type, r.addr, value, 0, r.bits);
      app.afterEdit(expr);
    }
    if (step.input && vm() && vm().libc) {
      app.terminal.add(step.input, 'in');
      app.feedInput(step.input);
      await settle(app);
    }
    if (step.watch) for (const w of [].concat(step.watch)) app.watchPanel.add(w);
    if (step.expand) { app.memview.forceOpen = new Set([...(app.memview.forceOpen || []), ...[].concat(step.expand)]); }
    if (step.show && !quiet) {
      if (['term', 'probs', 'log'].includes(step.show)) app.showBottom(step.show); else app.showRight(step.show);
    }
    if (step.bytes && !quiet && vm()) { app.showRight('bytes'); app.bytesPanel.goTo(step.bytes); }
    if (!quiet) app.renderPanels();
  };

  /** For tests: walk a whole lesson and report what each step's check says */
  Lessons.selfTest = async function (app, id) {
    await Lessons.start(app, id);
    const st = Lessons.current;
    const out = [];
    for (let i = 0; i < st.l.steps.length; i++) {
      await Lessons.go(st, i);
      const s = st.l.steps[i];
      let ok = true, msg = '';
      if (s.check) {
        try { const r = SEE.Debug.evaluate(app.vm, 0, s.check); ok = !!r.value; if (!ok) msg = s.check + ' is false'; } catch (e) { ok = false; msg = s.check + ': ' + e.message; }
      }
      if (s.line && app.vm) { const w = app.vm.where().line; if (w !== s.line) { ok = false; msg += ' line ' + w + ' (expected ' + s.line + ')'; } }
      if (s.state && app.vm && app.vm.state !== s.state) { ok = false; msg += ' state ' + app.vm.state + ' (expected ' + s.state + ')'; }
      if (s.output && !app.terminal.text().includes(s.output)) { ok = false; msg += ' output lacks ' + JSON.stringify(s.output); }
      if (s.errors && !app.problems.some((p) => p.msg.includes(s.errors))) { ok = false; msg += ' no problem mentions ' + JSON.stringify(s.errors); }
      out.push({ i, ok, msg });
    }
    return out;
  };
})(SEE);
