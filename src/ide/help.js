// The C reference: every library function (its prototype comes from the real header), the
// keywords, the operators and the headers, with a short explanation and an example.
(function (SEE) {
  'use strict';
  const { h } = SEE.UI;
  const Help = SEE.Help = {};
  let index = null;

  /** {name: {sig, header, text, more, example, kind}} built from the headers plus SEE.RefText */
  function build() {
    if (index) return index;
    index = {};
    const HOME = { NULL: 'stddef.h', size_t: 'stddef.h', wchar_t: 'stddef.h' };
    const put = (name, e) => {
      if (index[name] && index[name].header && HOME[name] && index[name].header === HOME[name]) return;
      if (HOME[name] && e.header !== HOME[name] && index[name]) return;
      index[name] = Object.assign(index[name] || {}, e);
    };
    for (const [hdr, text] of Object.entries(SEE.Headers.files)) {
      const flat = text.replace(/\/\*[\s\S]*?\*\//g, '');
      // #define lines
      for (const line of flat.split('\n')) {
        const d = /^\s*#define\s+([A-Za-z_]\w*)(\([^)]*\))?\s*(.*)$/.exec(line);
        if (d && !d[1].startsWith('__') && d[3].trim() && !(d[1].startsWith('_') && /^_[A-Z_]+_H$/.test(d[1]))) put(d[1], { sig: '#define ' + d[1] + (d[2] || '') + ' ' + d[3].trim(), header: hdr, kind: d[2] ? 'macro' : 'constant' });
      }
      // declarations, split at ; outside braces (so multi-line typedefs stay whole)
      const code = flat.split('\n').filter((l) => !/^\s*#/.test(l)).join(' ');
      let depth = 0, cur = '';
      const stmts = [];
      for (const ch of code) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
        if (ch === ';' && depth === 0) { stmts.push(cur.replace(/\s+/g, ' ').trim()); cur = ''; continue; }
        cur += ch;
      }
      for (const st of stmts) {
        if (!st) continue;
        if (/^typedef\b/.test(st)) {
          const m = /([A-Za-z_]\w*)\s*(\[[^\]]*\])?$/.exec(st);
          if (m && !m[1].startsWith('_')) put(m[1], { sig: st.replace(/\{.*\}/, '{ ... }') + ';', header: hdr, kind: 'type', full: st + ';' });
          continue;
        }
        if (/^struct\s+\w+\s*\{/.test(st)) {
          const m = /^struct\s+(\w+)/.exec(st);
          put(m[1], { sig: 'struct ' + m[1] + ' { ... };', header: hdr, kind: 'type' });
          continue;
        }
        const f = /\b([A-Za-z_]\w*)\s*\(/.exec(st.replace(/^extern\s+/, '').replace(/\(\s*\*\s*signal/, 'signal'));
        if (f && !f[1].startsWith('__')) put(f[1], { sig: st.replace(/^extern\s+/, '') + ';', header: hdr, kind: 'function' });
        else {
          const v = /^extern\s+.*?\b([A-Za-z_]\w*)\s*(\[[^\]]*\])?$/.exec(st);
          if (v && !v[1].startsWith('_')) put(v[1], { sig: st + ';', header: hdr, kind: 'variable' });
        }
      }
    }
    index.signal = Object.assign(index.signal || {}, { sig: 'void (*signal(int sig, void (*func)(int)))(int);', header: 'signal.h', kind: 'function' });
    for (const [k, v] of Object.entries(SEE.RefText || {})) index[k] = Object.assign(index[k] || {}, v);
    return index;
  }
  Help.index = () => build();
  /** A short card for the hover callout */
  Help.brief = function (word) {
    const e = build()[word];
    if (!e) return null;
    return { sig: e.sig || '', text: (e.text || '').split(/(?<=\.)\s/)[0] + (e.header ? '  (' + '<' + e.header + '>' + ')' : '') };
  };

  Help.open = function (app, word) {
    const idx = build();
    const names = Object.keys(idx).sort((a, b) => a.localeCompare(b));
    const groups = new Map();
    for (const n of names) {
      const e = idx[n];
      const g = e.group || (e.header ? '<' + e.header + '>' : e.kind === 'keyword' ? 'Keywords' : 'The language');
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(n);
    }
    const order = [...groups.keys()].sort((a, b) => (a.startsWith('<') - b.startsWith('<')) || a.localeCompare(b));
    const filter = h('input', { type: 'search', placeholder: 'Find: printf, malloc, const, ->, static…', 'aria-label': 'Find in the reference', id: 'refFind' });
    const list = h('div.ref-list');
    const body = h('div.ref-body');
    let cur = word && idx[word] ? word : null;
    const show = (n) => {
      cur = n;
      body.innerHTML = '';
      const e = idx[n];
      if (!e) return;
      body.appendChild(h('h3', { style: { margin: '6px 0' } }, n));
      if (e.header) body.appendChild(h('p.muted', '#include <' + e.header + '>'));
      if (e.sig) body.appendChild(h('div.sig', e.sig));
      if (e.text) for (const para of String(e.text).split(/\n\n+/)) body.appendChild(h('p', para));
      if (e.example) {
        body.appendChild(h('p', h('b', 'Example')));
        body.appendChild(h('pre', e.example));
        const tryIt = h('button.btn', { type: 'button' }, 'Try this example');
        tryIt.addEventListener('click', () => { SEE.UI.closeAllModals(); Help.tryExample(app, n, e.example); });
        body.appendChild(tryIt);
      }
      if (e.see) body.appendChild(h('p.muted', 'See also: ', ...e.see.map((s, i) => { const a = h('a', { href: '#' }, s); a.addEventListener('click', (ev) => { ev.preventDefault(); show(s); render(); }); return [i ? ', ' : '', a]; })));
      if (e.header && !e.text) body.appendChild(h('p.muted', 'Open /usr/include/' + e.header + ' to read the header itself.'));
      for (const r of list.querySelectorAll('.ri')) r.classList.toggle('sel', r.dataset.n === n);
    };
    const render = () => {
      list.innerHTML = '';
      const q = filter.value.trim().toLowerCase();
      for (const g of order) {
        const items = groups.get(g).filter((n) => !q || n.toLowerCase().includes(q) || (idx[n].text || '').toLowerCase().includes(q));
        if (!items.length) continue;
        list.appendChild(h('div.rh', g));
        for (const n of items) {
          const r = h('div.ri' + (n === cur ? '.sel' : ''), { dataset: { n }, tabindex: '0' }, n);
          r.addEventListener('click', () => show(n));
          r.addEventListener('keydown', (e) => { if (e.key === 'Enter') show(n); });
          list.appendChild(r);
        }
      }
    };
    filter.addEventListener('input', () => { render(); const first = list.querySelector('.ri'); if (first && filter.value) show(first.dataset.n); });
    render();
    if (cur) show(cur); else body.appendChild(h('div', h('p', 'Everything in the C89 library, the keywords and the operators. Pick a name on the left or type to search.'), h('p.muted', 'In the editor, F1 opens this page for the word under the cursor, and pointing at a library function shows its prototype.')));
    SEE.UI.modal({ title: 'C reference', wide: true, body: h('div', filter, h('div.ref', { style: { marginTop: '8px' } }, list, body)), buttons: [{ label: 'Close', value: true, primary: true }], onOpen: () => { filter.focus(); const s = list.querySelector('.ri.sel'); if (s) s.scrollIntoView({ block: 'center' }); } });
  };

  Help.tryExample = function (app, name, code) {
    const dir = '/tmp/try-' + name.replace(/[^\w]/g, '_');
    app.vfs.mkdir(dir, { parents: true, exist: true, trusted: true });
    const text = /\bmain\s*\(/.test(code) ? code : '#include <stdio.h>\n\nint main(void)\n{\n' + code.replace(/^/gm, '    ') + '\n    return 0;\n}\n';
    app.vfs.writeText(dir + '/' + 'try.c', text, { trusted: true });
    const d = app.docByPath(dir + '/try.c');
    if (d) { d.editor.setValue(text); d.savedText = text; d.dirty = false; }
    app.openFile(dir + '/try.c');
    app.renderSide();
  };
})(SEE);
