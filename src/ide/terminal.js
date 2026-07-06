// The terminal: what the program prints (stdout, and stderr in red), and a line for typing its input.
// The transcript can be cut back to an earlier length, so stepping backwards un-prints output too.
(function (SEE) {
  'use strict';
  const { h, icon } = SEE.UI;

  class Terminal {
    constructor(app, el) {
      this.app = app;
      this.items = [];           // [{cls, text}]
      this.length = 0;           // characters in the transcript
      this.dec = { 1: new TextDecoder('utf-8'), 2: new TextDecoder('utf-8') };
      this.out = h('div.term-out', { tabindex: '0', 'aria-live': 'polite', 'aria-label': 'Program output', id: 'termOut' });
      this.prompt = h('span.prompt', '›');
      this.input = h('input', { type: 'text', id: 'termInput', 'aria-label': 'Type input for the program', placeholder: 'input for the program (Enter sends a line)', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off' });
      this.eofBtn = h('button.ibtn', { type: 'button', title: 'End of input (Ctrl+D): scanf and getchar get EOF', id: 'termEof' }, 'EOF');
      this.clearBtn = h('button.ibtn', { type: 'button', title: 'Clear the terminal', 'aria-label': 'Clear' }, icon('clear'));
      this.root = h('div.term', this.out, h('div.term-in', this.prompt, this.input, this.eofBtn, this.clearBtn));
      el.appendChild(this.root);
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); this.send(this.input.value); this.input.value = ''; }
        else if ((e.key === 'd' || e.key === 'D') && e.ctrlKey) { e.preventDefault(); this.eof(); }
        if (!/^F\d+$/.test(e.key)) e.stopPropagation();   // F5, F10 and friends still drive the debugger
      });
      this.eofBtn.addEventListener('click', () => this.eof());
      this.clearBtn.addEventListener('click', () => this.clear());
      this.out.addEventListener('click', () => { if (!window.getSelection().toString()) this.input.focus(); });
      this.pending = '';
      this.flushTimer = null;
    }
    /** Text that printf has written into stdout's buffer but that has not reached the screen yet */
    setPending(text) {
      if (!this.pendingEl) {
        this.pendingEl = h('span.pending', { title: "Printed, but still waiting in stdout's buffer. C sends it to the screen at the next \\n, when the buffer is full, on fflush(stdout), when the program reads input, or when it ends." });
      }
      this.pendingEl.textContent = text || '';
      if (text) { this.out.appendChild(this.pendingEl); this.out.scrollTop = this.out.scrollHeight; }
      else if (this.pendingEl.parentNode) this.pendingEl.remove();
    }
    /** A position in the transcript: how many pieces, and how long the last one was */
    mark() { const n = this.items.length; return { i: n, len: n ? this.items[n - 1].text.length : 0 }; }
    rewind(n) {
      if (typeof n !== 'object') return;
      if (n.i > this.items.length) return;
      if (n.i === this.items.length && (!n.i || this.items[n.i - 1].text.length === n.len)) return;   // nothing printed since
      this.items.length = n.i;
      if (n.i > 0 && this.items[n.i - 1]) this.items[n.i - 1].text = this.items[n.i - 1].text.slice(0, n.len);
      this.length = this.items.reduce((a, x) => a + x.text.length, 0);
      this.redraw();
    }
    redraw() {
      this.out.innerHTML = '';
      for (const it of this.items) { it.node = this.node(it); this.out.appendChild(it.node); }
      if (this.pendingEl && this.pendingEl.textContent) this.out.appendChild(this.pendingEl);
      this.out.scrollTop = this.out.scrollHeight;
    }
    node(it) { return it.cls ? h('span.' + it.cls.split(' ').join('.'), it.text) : document.createTextNode(it.text); }
    add(text, cls) {
      if (!text) return;
      cls = cls || '';
      const last = this.items[this.items.length - 1];
      // text of the same kind joins the last piece, so a long run stays one node and stays fast
      if (last && last.cls === cls && last.text.length < 20000) {
        last.text += text;
        if (last.node) last.node.textContent = last.text;
      } else {
        const it = { text, cls };
        it.node = this.node(it);
        this.items.push(it);
        if (this.pendingEl && this.pendingEl.parentNode) this.out.insertBefore(it.node, this.pendingEl);
        else this.out.appendChild(it.node);
      }
      this.length += text.length;
      if (this.length > 2000000) this.trim();
      if (!this.scrollQueued) {
        this.scrollQueued = true;
        requestAnimationFrame(() => { this.scrollQueued = false; this.out.scrollTop = this.out.scrollHeight; });
      }
    }
    /** Keep the last part of a very long transcript */
    trim() {
      while (this.length > 1000000 && this.items.length > 1) { this.length -= this.items[0].text.length; this.items.shift(); }
      this.redraw();
    }
    /** bytes from the program on fd 1 or 2 */
    write(fd, bytes) {
      const text = this.dec[fd === 2 ? 2 : 1].decode(bytes, { stream: true });
      this.add(text, fd === 2 ? 'err' : '');
    }
    note(text, kind) { this.add((this.endsWithNewline() ? '' : '\n') + text + '\n', 'note' + (kind ? ' ' + kind : '')); }
    endsWithNewline() { const last = this.items[this.items.length - 1]; return !last || /\n$/.test(last.text); }
    text() { return this.items.map((x) => x.text).join(''); }
    clear() { this.items = []; this.length = 0; this.out.innerHTML = ''; }
    send(line) {
      const app = this.app;
      this.add(line + '\n', 'in');
      app.feedInput(line + '\n');
    }
    eof() {
      this.add('^D\n', 'in');
      this.app.feedEOF();
    }
    setWaiting(on) {
      this.root.classList.toggle('waiting', !!on);
      this.prompt.textContent = on ? 'stdin ›' : '›';
      if (on && !this.app.isPhone()) this.input.focus();
    }
  }

  SEE.Terminal = Terminal;
})(SEE);
