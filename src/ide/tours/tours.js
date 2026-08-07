// The guided tours. Each step points at one part of the studio; some steps also drive the
// debugger so the memory picture changes while the tour explains it.
(function (SEE) {
  'use strict';
  const T = SEE.Tours;
  const until = (cond, ms) => new Promise((resolve) => { const t0 = Date.now(); const tick = () => { if (cond() || Date.now() - t0 > (ms || 8000)) resolve(); else setTimeout(tick, 30); }; tick(); });
  const paused = (app) => until(() => app.vm && !app.running && app.vm.state !== 'running');
  /** Open a fresh copy of the starter program, so every tour starts from the same place */
  const fresh = (app, name) => {
    const dir = '/tmp/tour-' + name;
    app.vfs.mkdir(dir, { parents: true, exist: true, trusted: true });
    app.vfs.writeText(dir + '/hello.c', SEE.Samples.starter(), { trusted: true });
    const d = app.docByPath(dir + '/hello.c');
    if (d) { d.editor.setValue(SEE.Samples.starter()); d.savedText = d.editor.getValue(); d.dirty = false; }
    app.stop();
    app.openFile(dir + '/hello.c');
    if (app.isPhone()) app.setView('code');
  };
  const view = (app, v) => { if (app.isPhone()) app.setView(v); };

  T.add({
    id: 'welcome', title: 'A first look', blurb: 'Build, run, step through a program and read the memory picture.',
    setup: (app) => fresh(app, 'welcome'),
    steps: [
      { target: '.editors', title: 'The editor', html: '<p>This is <code>hello.c</code>, a small program. Every <b>.c</b> file in a folder is built together into one program, so a folder is a project.</p><p>The code is C89, the C of the classic books: comments in <code>/* */</code>, declarations at the top of a block.</p>', before: (app) => view(app, 'code') },
      { target: '#tbRun', title: 'Run', html: '<p><b>Run</b> (Ctrl+F5) builds the program and runs it at full speed. Its output appears in the terminal below.</p>', before: async (app) => { app.run(); await until(() => app.vm && app.vm.state === 'exited'); } },
      { target: '#termOut', title: 'The terminal', html: '<p>The program printed its line here and ended with status 0. If it reads input with <code>scanf</code> or <code>getchar</code>, you type it on the line at the bottom.</p>', before: (app) => { view(app, 'run'); app.showBottom('term'); } },
      { target: '#tbDebug', title: 'Debug', html: '<p><b>Debug</b> (F5) builds it and stops before the first line of <code>main</code> runs. The yellow line in the editor is the next one to run.</p>', before: async (app) => { app.startDebug('start'); await paused(app); view(app, 'code'); } },
      { target: '#right', title: 'The memory picture', html: '<p>Here is the program\'s memory. Left: the <b>stack</b>, with a <b>frame</b> for <code>main</code> holding its variables at their real addresses (near <code>0xbfffff70</code>).</p><p>Right: the heap, the globals, the read-only data (string literals) and the code.</p><p>Red values have not been set yet.</p>', before: (app) => { app.showRight('memory'); view(app, 'memory'); } },
      { target: '#tbOver', title: 'Step over', html: '<p><b>Over</b> (F10) runs one line. Watch <code>x</code> become 7 and turn yellow: yellow means it just changed.</p>', before: async (app) => { app.step('over'); await paused(app); } },
      { target: '#tbInto', title: 'Step into', html: '<p><b>Into</b> (F11) follows a call. The program is now inside <code>square</code>, and a new frame sits below <code>main</code>\'s on the stack, with the parameter <code>n</code>, the <b>return address</b> and the caller\'s saved frame pointer.</p>', before: async (app) => { app.step('into'); await paused(app); view(app, 'memory'); } },
      { target: '#tbOut', title: 'Step out', html: '<p><b>Out</b> (Shift+F11) finishes the function. The frame of <code>square</code> is gone and the box at the top says what it returned.</p>', before: async (app) => { app.step('out'); await paused(app); } },
      { target: '#right', title: 'Pointers and the heap', html: '<p>A few more steps: <code>numbers</code> holds the address of a block of three ints on the heap. The blue arrow goes from the pointer to the block; <code>who</code> points at the string "world" in read-only data.</p><p>Click any value to change it. Point at a row to see its type, size and which line last wrote it.</p>', before: async (app) => { for (let k = 0; k < 6; k++) { app.step('over'); await paused(app); } view(app, 'memory'); } },
      { target: '#tbBack', title: 'Step back', html: '<p><b>Back</b> (F8) undoes a line: memory, output and all. Use it to see exactly what a line did, or to walk back from a crash to its cause.</p>', before: async (app) => { app.stepBack(); await paused(app); } },
      { target: '#menuLearn', title: 'Learn more', html: '<p>The <b>Learn</b> menu has the lessons (from <code>printf</code> to pointers to pointers, each walked through in the debugger), more tours and a library of hundreds of commented programs. <b>Help</b> has the C reference.</p>', before: (app) => { if (app.isPhone()) app.setView('code'); } },
    ],
    done: (app) => app.stop(),
  });

  T.add({
    id: 'debugger', title: 'The debugger in depth', blurb: 'Breakpoints, conditions, watches, watchpoints, the call stack and changing values.',
    setup: (app) => fresh(app, 'debugger'),
    steps: [
      { target: (app) => app.active && app.active.editor.gutter, title: 'Breakpoints', html: '<p>Click left of a line number to set a <b>breakpoint</b> (F9 does it on the cursor line). Debug stops there. Right-click it to make it stop only when a condition is true, like <code>i == 5</code>.</p>', before: (app) => { view(app, 'code'); app.toggleBreakpoint(app.active.path, 9); } },
      { target: '#tbDebug', title: 'Continue to it', html: '<p>F5 starts the program and runs it to the breakpoint inside <code>square</code>.</p>', before: async (app) => { app.startDebug('run'); await paused(app); } },
      { target: '#tab-vars', title: 'Variables and the call stack', html: '<p>The <b>Variables</b> panel lists the frames on the stack, newest first. Click <code>main</code> to look at its variables while <code>square</code> is running; the editor marks where <code>main</code> is waiting.</p>', before: (app) => { app.showRight('vars'); app.selectFrame(1); view(app, 'memory'); } },
      { target: '#tab-watch', title: 'Watch', html: '<p>The <b>Watch</b> panel keeps C expressions, worked out again at every stop: <code>x * 2</code>, <code>numbers[1]</code>, <code>p-&gt;next</code>. The eye button makes a <b>watchpoint</b>: the program stops whenever that memory changes, wherever the change comes from.</p>', before: (app) => { app.selectFrame(0); app.watchPanel.add('n * 10'); app.showRight('watch'); } },
      { target: '#tab-bytes', title: 'Bytes', html: '<p><b>Bytes</b> shows raw memory. Each byte is coloured by what it is, and pointing at one says which variable it belongs to and which line last wrote it.</p>', before: (app) => { app.showRight('bytes'); app.bytesPanel.goTo('&n'); } },
      { target: '#tab-bps', title: 'All the breakpoints', html: '<p>The <b>Breakpoints</b> panel lists them all, with their conditions. Uncheck one to keep it but skip it.</p>', before: (app) => { app.showRight('bps'); } },
      { target: '.editors', title: 'Hover', html: '<p>While the program is paused, point at a variable in the editor (or a chain like <code>p-&gt;next-&gt;v</code>). A card shows its value, type and address, and you can change it right there.</p>', before: (app) => { app.clearBreakpoints(); app.showRight('memory'); view(app, 'code'); } },
    ],
    done: (app) => { app.stop(); app.clearBreakpoints(); },
  });

  T.add({
    id: 'files', title: 'Files, projects and sharing', blurb: 'Projects in folders, headers, the examples, sharing a link, and folders from your computer.',
    steps: [
      { target: '#side', title: 'Files', html: '<p>Your files live in this browser, under <code>/home/user</code>. A <b>project</b> is a folder: every .c file in it is compiled, and they are linked together. Headers (.h) next to them are found by <code>#include "name.h"</code>.</p>', before: (app) => view(app, 'files') },
      { target: '#side', title: 'Originals and system files', html: '<p><code>/examples</code>, <code>/library</code> and <code>/lessons</code> hold originals: change one and saving makes a copy of your own. <code>/usr/include</code> has the real C89 headers this compiler uses; open <code>stdio.h</code> to read it.</p>' },
      { target: '#tbShare', title: 'Share', html: '<p><b>Share</b> packs the whole project into a link. Everything is inside the link itself; nothing is uploaded. Whoever opens it gets their own copy.</p>' },
      { target: '#sideTools', title: 'Bring files in', html: '<p>These buttons make a new file or folder, bring files from your computer, or use a whole folder from your computer (in Chrome and Edge), with a choice of read only, ask first, or let programs write there.</p>' },
    ],
  });

  T.add({
    id: 'memory', title: 'Reading the memory picture', blurb: 'Stack, heap, globals, read-only data and code: what each part shows.',
    setup: (app) => fresh(app, 'memory'),
    steps: [
      { target: '#right', title: 'The address space', html: '<p>A 32-bit program sees one long row of bytes, from address <code>0x00000000</code> to <code>0xffffffff</code>. See lays it out like a real Unix machine: code at <code>0x08048000</code>, then read-only data, data, bss and the heap above it, and the stack at the top, below <code>0xc0000000</code>, growing down.</p>', before: async (app) => { app.startDebug('start'); await paused(app); app.showRight('memory'); view(app, 'memory'); } },
      { target: '.seg.stack', title: 'The stack', html: '<p>Each call gets a <b>frame</b>. The newest frame is at the bottom (the stack grows down). In a frame: the arguments (higher addresses), the <b>return address</b> (where to go back to), the caller\'s <b>saved frame pointer</b>, then the local variables.</p>' },
      { target: '.seg.heap', title: 'The heap', html: '<p>Every <code>malloc</code> makes a numbered block here, labelled with the line that made it. A freed block is hatched; a block nobody freed is reported as a leak when the program ends.</p>', before: async (app) => { for (let k = 0; k < 5; k++) { app.step('over'); await paused(app); } } },
      { target: '.seg.data', title: 'Globals', html: '<p>Global variables and <code>static</code> locals live here for the whole run: in <b>.data</b> when they start with a value, in <b>.bss</b> (all zero) when they do not.</p>' },
      { target: '.seg.ro', title: 'Read-only data', html: '<p>String literals and <code>const</code> globals. Writing to them is a crash. Note how <code>char greeting[] = "hello"</code> copied its text onto the stack instead.</p>' },
      { target: '.seg.text', title: 'Code', html: '<p>The functions, at their addresses. A function pointer holds one of these addresses; a return address points into the middle of one.</p>' },
      { target: '.mem-bar', title: 'Options', html: '<p>Show or hide the arrows, the addresses and the types, and the C library\'s own frames and globals (like the FILE table behind <code>stdin</code> and <code>stdout</code>).</p>', before: () => {} },
    ],
    done: (app) => app.stop(),
  });
})(SEE);
