// The example library: hundreds of commented programs in categories. The index is part of the
// page; a program is fetched from library/ when someone opens it, and lands in /library as an
// original (saving it makes a copy of your own).
(function (SEE) {
  'use strict';
  const { h } = SEE.UI;
  const store = SEE.UI.storage;
  const Library = SEE.Library = {};
  const LEVELS = ['', 'first steps', 'getting going', 'confident', 'deep end'];

  Library.index = () => SEE.LibraryIndex || [];
  Library.browse = function (app) {
    const idx = Library.index();
    const cats = (SEE.LibraryCats || []).filter(([k]) => idx.some((e) => e.cat === k));
    let cur = store.get('libCat', cats.length ? cats[0][0] : null);
    if (!cats.some(([k]) => k === cur) && cats.length) cur = cats[0][0];
    const find = h('input', { type: 'search', placeholder: 'Search all ' + idx.length + ' programs', 'aria-label': 'Search the library', id: 'libFind' });
    const catBox = h('div.lib-cats', { role: 'listbox', 'aria-label': 'Categories' });
    const list = h('div.lib-list', { id: 'libList' });
    let close = () => {};
    const renderCats = () => {
      catBox.innerHTML = '';
      for (const [k, name] of cats) {
        const n = idx.filter((e) => e.cat === k).length;
        const c = h('div.lib-cat' + (k === cur && !find.value ? '.sel' : ''), { role: 'option', tabindex: '0', dataset: { cat: k } }, h('span', name), h('span.n', String(n)));
        c.addEventListener('click', () => { cur = k; find.value = ''; store.set('libCat', k); renderCats(); renderList(); });
        c.addEventListener('keydown', (e) => { if (e.key === 'Enter') c.click(); });
        catBox.appendChild(c);
      }
    };
    const renderList = () => {
      list.innerHTML = '';
      const q = find.value.trim().toLowerCase();
      const items = q ? idx.filter((e) => (e.title + ' ' + e.about + ' ' + e.id).toLowerCase().includes(q)) : idx.filter((e) => e.cat === cur);
      for (const e of items.slice(0, 500)) {
        const row = h('div.lib-item', { tabindex: '0', dataset: { id: e.id } }, h('span.lv', LEVELS[e.level] || ''), h('b', e.title), e.dir ? h('span.muted', '  (' + e.files.length + ' files)') : null, h('div.d', e.about));
        const open = () => { close(); Library.open(app, e); };
        row.addEventListener('click', open);
        row.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') open(); });
        list.appendChild(row);
      }
      if (!items.length) list.appendChild(h('div.empty', 'Nothing matches.'));
    };
    find.addEventListener('input', () => { renderCats(); renderList(); });
    renderCats();
    renderList();
    SEE.UI.modal({
      title: 'Example library', wide: true,
      body: h('div', find, h('div.lib', { style: { marginTop: '8px' } }, catBox, h('div.lib-main', list))),
      buttons: [{ label: 'Close', value: true }],
      onOpen: (b, c) => { close = () => c(true); setTimeout(() => find.focus(), 30); },
    });
  };
  Library.openById = function (app, id) {
    const e = Library.index().find((x) => x.id === id);
    if (e) Library.open(app, e); else SEE.UI.toast('No such example: ' + id, 'err');
  };
  /** Fetch the files of an entry (or use the copies already in /library) and open the main file */
  Library.open = async function (app, e) {
    const dir = '/library/' + e.id.replace(/\.c$/, '');
    const v = app.vfs;
    // every program gets a folder of its own, because a folder is built as one program
    const target = (f) => dir + '/' + f;
    try {
      for (const f of e.files) {
        const p = target(f);
        if (v.exists(p)) continue;
        const url = 'library/' + e.cat + '/' + (e.dir ? e.id.split('/')[1] + '/' : '') + f;
        const res = await fetch(url);
        if (!res.ok) throw new Error('could not fetch ' + url + ' (' + res.status + ')');
        const text = await res.text();
        v.mkdir(p.replace(/\/[^/]*$/, ''), { parents: true, exist: true, trusted: true });
        v.writeText(p, text, { trusted: true });
      }
    } catch (err) {
      SEE.UI.toast('Could not load the example: ' + err.message + (location.protocol === 'file:' ? ' (examples are fetched from the web site; open See from its address to use them)' : ''), 'err', 6000);
      return;
    }
    const root = v.entries.get('/library');
    if (root) root.readOnly = true;
    const mainPath = target(e.main);
    if (e.args !== undefined) { app.settings.args = e.args || ''; app.saveSettings(); }
    app.libraryInput = e.input || null;
    for (const f of e.files) if (f !== e.main && /\.(c|h)$/.test(f)) app.openFile(target(f), { noFocus: true });
    app.openFile(mainPath);
    app.expanded.add('/library'); app.expanded.add(('/library/' + e.cat).toLowerCase()); app.expanded.add(dir.toLowerCase());
    app.renderSide();
    app.setStatus(e.title + ': ' + e.about + (e.input ? '  (it reads input: type it in the terminal when it asks)' : ''));
    if (location.protocol !== 'file:') history.replaceState(null, '', '#example=' + encodeURIComponent(e.id));
    if (app.isPhone()) app.setView('code');
  };
})(SEE);
