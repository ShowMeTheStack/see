// The welcome card and the guided tours: a tour points at parts of the studio one by one and can
// drive the debugger, so the explanation and the memory picture move together.
(function (SEE) {
  'use strict';
  const { h } = SEE.UI;
  const Tours = SEE.Tours = {};
  Tours.list = [];
  Tours.add = (t) => { Tours.list.push(t); };

  Tours.welcome = function (app) {
    const go = (fn) => () => { SEE.UI.closeAllModals(); setTimeout(fn, 60); };
    const choice = (title, text, fn, id) => { const b = h('button.choice', { type: 'button', id }, h('b', title), h('span', text)); b.addEventListener('click', go(fn)); return b; };
    SEE.UI.modal({
      title: 'Welcome to See', wide: true,
      body: h('div.welcome',
        h('h2', 'C, step by step, down to the byte.'),
        h('p', 'See compiles and runs C89 right here in the browser, on a simulated 32-bit machine. Step through your program one line at a time and watch every frame on the stack, every block on the heap and every pointer, at real addresses. Change any value while it is paused, or step backwards to see what a line did.'),
        h('div.choices',
          choice('Take the tour', 'Two minutes: build, run, step, and read the memory picture.', () => Tours.start(app, 'welcome'), 'wTour'),
          choice('Start the lessons', 'From the first printf to pointers to pointers, with the memory drawn at every step.', () => SEE.Lessons && SEE.Lessons.browse(app), 'wLessons'),
          choice('Open an example', 'Hundreds of commented programs, from games to linked lists.', () => SEE.Library && SEE.Library.browse(app), 'wLibrary'),
          choice('Just write C', 'hello.c is open. F5 starts it in the debugger.', () => { if (app.active) app.active.editor.focus(); }, 'wWrite')),
        h('p.muted', 'Made by Jyotiprakash Mishra. ', (() => { const a = h('a', { href: '#', id: 'welcomeAuthor' }, 'About the author'); a.addEventListener('click', (e) => { e.preventDefault(); SEE.UI.closeAllModals(); setTimeout(() => SEE.authorDialog(), 60); }); return a; })())),
      buttons: [{ label: 'Close', value: true }],
    });
  };

  Tours.menu = function (app) {
    if (!Tours.list.length) { SEE.UI.toast('No tours yet', 'err'); return; }
    const box = h('div');
    for (const t of Tours.list) {
      const row = h('div.list-row.clickable', h('div.grow', h('b', t.title), h('div.muted', t.blurb || '')));
      row.addEventListener('click', () => { SEE.UI.closeAllModals(); setTimeout(() => Tours.start(app, t.id), 60); });
      box.appendChild(row);
    }
    SEE.UI.modal({ title: 'Guided tours', wide: true, body: box, buttons: [{ label: 'Close', value: true }] });
  };

  Tours.start = async function (app, id) {
    const t = Tours.list.find((x) => x.id === id);
    if (!t) { SEE.UI.toast('No such tour: ' + id, 'err'); return; }
    Tours.stop();
    const state = { app, i: 0, tour: t };
    Tours.current = state;
    if (t.setup) await t.setup(app);
    Tours.show(state);
  };
  Tours.stop = function () {
    if (Tours.current) { if (Tours.current.pop) Tours.current.pop.remove(); if (Tours.current.ring) Tours.current.ring.remove(); }
    Tours.current = null;
  };
  Tours.show = async function (state) {
    const { app, tour } = state;
    const step = tour.steps[state.i];
    if (!step) { Tours.stop(); return; }
    if (step.before) { try { await step.before(app); } catch (e) { /* keep going */ } }
    await new Promise((r) => setTimeout(r, step.wait || 120));
    if (state.pop) state.pop.remove();
    if (state.ring) state.ring.remove();
    const target = step.target ? (typeof step.target === 'function' ? step.target(app) : document.querySelector(step.target)) : null;
    const pop = h('div.tour-pop', { role: 'dialog', 'aria-label': tour.title, id: 'tourPop' });
    const close = h('button.ibtn', { type: 'button', 'aria-label': 'End the tour', title: 'End the tour', style: { color: 'inherit' } }, '×');
    close.addEventListener('click', () => Tours.stop());
    const back = h('button.btn', { type: 'button', disabled: state.i === 0, id: 'tourBack' }, 'Back');
    const next = h('button.btn.primary', { type: 'button', id: 'tourNext' }, state.i === tour.steps.length - 1 ? 'Done' : 'Next');
    back.addEventListener('click', () => { state.i = Math.max(0, state.i - 1); Tours.show(state); });
    next.addEventListener('click', () => { if (state.i === tour.steps.length - 1) { Tours.stop(); if (tour.done) tour.done(app); return; } state.i++; Tours.show(state); });
    const body = h('div.tb');
    body.innerHTML = step.html;
    pop.append(h('div.th', h('span', step.title || tour.title), close), body, h('div.tf', h('span.count', (state.i + 1) + ' of ' + tour.steps.length), back, next));
    document.body.appendChild(pop);
    state.pop = pop;
    const W = window.innerWidth, H = window.innerHeight;
    if (W < 600) {
      // a phone: the card spans the width, above or below the highlighted part
      pop.style.width = (W - 16) + 'px';
      pop.style.left = '8px';
    }
    if (target && target.getBoundingClientRect().width) {
      const r = target.getBoundingClientRect();
      const ring = h('div.tour-ring');
      Object.assign(ring.style, { left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px' });
      document.body.appendChild(ring);
      state.ring = ring;
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      if (W < 600) {
        const below = r.bottom + 10, above = r.top - ph - 10;
        let y = below + ph <= H - 8 ? below : above >= 8 ? above : H - ph - 8;
        pop.style.top = Math.max(8, y) + 'px';
        next.focus();
        return;
      }
      let x = r.right + 14, y = r.top;
      if (x + pw > W - 8) x = r.left - pw - 14;
      if (x < 8) { x = Math.min(Math.max(8, r.left), W - pw - 8); y = r.bottom + 12; if (y + ph > H - 8) y = Math.max(8, r.top - ph - 12); }
      y = Math.min(Math.max(8, y), H - ph - 8);
      x = Math.min(Math.max(8, x), W - pw - 8);
      pop.style.left = x + 'px'; pop.style.top = y + 'px';
    } else {
      pop.style.left = Math.max(8, (W - pop.offsetWidth) / 2) + 'px';
      pop.style.top = Math.max(8, (H - pop.offsetHeight) / 3) + 'px';
    }
    next.focus();
  };
})(SEE);
