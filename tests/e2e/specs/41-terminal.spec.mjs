// The terminal: stdout and stderr, typing input, EOF, stdout's buffer, clearing, styles, long and UTF-8 output.
const H = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const pathOf = (name) => '/home/user/t41/' + slug(name) + '/main.c';
const run = (p, name, src, opts = {}) => p.runProgram(src, Object.assign({ path: pathOf(name) }, opts));
const debug = (p, name, src) => p.debugProgram(src, { path: pathOf(name) });
const items = (p) => p.ev('SEE.app.terminal.items.map(i => [i.cls, i.text])');
/** Program output and echoed input with runs of the same class joined (stderr arrives byte by byte) */
const runs = async (p) => {
  const out = [];
  for (const [c, x] of await items(p)) {
    if (/note/.test(c)) continue;
    if (out.length && out[out.length - 1][0] === c) out[out.length - 1][1] += x; else out.push([c, x]);
  }
  return out;
};
/** Program output only: no notes, no echoed input */
const progOut = (p) => p.ev("SEE.app.terminal.items.filter(i => !/note|in/.test(i.cls)).map(i => i.text).join('')");
async function typeLine(p, text) {
  await p.click('#termInput');
  await p.insertText(text);
  await p.key('Enter');
  await p.sleep(40);
}

const ECHO = H + 'int main(void)\n{\n    char line[128];\n    while (fgets(line, sizeof line, stdin) != NULL)\n        printf("got [%.*s]\\n", (int)strlen(line) - 1, line);\n    printf("done\\n");\n    return 0;\n}\n';
const COUNT = H + 'int main(void)\n{\n    int c, n = 0;\n    while ((c = getchar()) != EOF) n++;\n    printf("count=%d eof=%d\\n", n, c == EOF);\n    return 0;\n}\n';
const SCANF_EOF = H + 'int main(void)\n{\n    int n = 7, r;\n    r = scanf("%d", &n);\n    printf("r=%d n=%d\\n", r, n);\n    return 0;\n}\n';

export default function (t) {
  // ---- stdout and stderr ------------------------------------------------------------------------------
  t.test('stdout text appears in the terminal', async (p) => {
    await run(p, 'stdout', H + 'int main(void)\n{\n    printf("hello, terminal\\n");\n    puts("from puts");\n    putchar(\'!\');\n    putchar(\'\\n\');\n    return 0;\n}\n');
    p.assert.equal(await progOut(p), 'hello, terminal\nfrom puts\n!\n');
    p.assert.match(await p.text('#termOut'), /hello, terminal/);
  });
  t.test('stdout text is plain, without a class', async (p) => {
    await run(p, 'stdoutplain', H + 'int main(void) { printf("plain\\n"); return 0; }\n');
    p.assert.deepEqual(await runs(p), [['', 'plain\n']]);
  });
  t.test('stderr text has the err class', async (p) => {
    await run(p, 'stderr', H + 'int main(void)\n{\n    fprintf(stderr, "this went wrong\\n");\n    return 1;\n}\n');
    p.assert.deepEqual(await runs(p), [['err', 'this went wrong\n']]);
    p.assert.equal((await p.texts('#termOut .err')).join(''), 'this went wrong\n');
  });
  t.test('stderr is drawn in a different colour from stdout', async (p) => {
    await run(p, 'stderrcolour', H + 'int main(void)\n{\n    printf("out\\n");\n    fprintf(stderr, "err\\n");\n    return 0;\n}\n');
    const [a, b] = await p.ev("[getComputedStyle(document.getElementById('termOut')).color, getComputedStyle(document.querySelector('#termOut .err')).color]");
    p.assert.notEqual(a, b);
  });
  t.test('stdout and stderr interleave in the order they were written', async (p) => {
    await run(p, 'interleave', H + 'int main(void)\n{\n    printf("one\\n");\n    fprintf(stderr, "two\\n");\n    printf("three\\n");\n    fputs("four\\n", stderr);\n    return 0;\n}\n');
    p.assert.deepEqual(await runs(p), [['', 'one\n'], ['err', 'two\n'], ['', 'three\n'], ['err', 'four\n']]);
  });
  t.test('stderr is not buffered: it shows before a line of stdout ends', async (p) => {
    await run(p, 'stderrunbuf', H + 'int main(void)\n{\n    printf("start ");\n    fprintf(stderr, "E");\n    printf("end\\n");\n    return 0;\n}\n');
    p.assert.equal(await progOut(p), 'Estart end\n');
  });
  t.test('perror writes to stderr', async (p) => {
    await run(p, 'perror', H + 'int main(void)\n{\n    FILE *f = fopen("/tmp/t41/none/x.txt", "r");\n    if (!f) perror("fopen");\n    return 0;\n}\n');
    const r = await runs(p);
    p.assert.equal(r.length, 1);
    p.assert.equal(r[0][0], 'err');
    p.assert.match(r[0][1], /^fopen: .+\n$/);
  });
  t.test('the exit note follows the output on its own line', async (p) => {
    await run(p, 'notenl', H + 'int main(void) { printf("no newline at the end"); return 0; }\n');
    p.assert.match(await p.output(), /no newline at the end\nProgram exited with status 0\.\n$/);
  });
  t.test('notes are drawn as notes, not program output', async (p) => {
    await run(p, 'notes', 'int main(void) { return 0; }\n');
    p.assert.ok(await p.count('#termOut .note') >= 2);
    p.assert.match(await p.text('#termOut .note'), /^Running /);
  });
  t.test('a new run clears the previous output', async (p) => {
    await run(p, 'newrun1', H + 'int main(void) { printf("first run\\n"); return 0; }\n');
    await run(p, 'newrun2', H + 'int main(void) { printf("second run\\n"); return 0; }\n');
    const out = await p.output();
    p.assert.doesNotMatch(out, /first run/);
    p.assert.match(out, /second run/);
  });
  for (const [what, fmt, args, want] of [
    ['integers', '%d %i %5d|%-5d|', '-3, 42, 7, 8', '-3 42     7|8    |'],
    ['unsigned, hex and octal', '%u %x %X %o %#x', '3000000000u, 255, 255, 8, 16', '3000000000 ff FF 10 0x10'],
    ['floating point', '%.2f %e %g', '3.14159, 1234.5, 0.0001', '3.14 1.234500e+03 0.0001'],
    ['characters and strings', '%c%c [%s] [%6s] [%-6s] [%.2s]', "'o', 'k', \"str\", \"ab\", \"ab\", \"xyz\"", 'ok [str] [    ab] [ab    ] [xy]'],
    ['a percent sign and long', '100%% %ld', '123456789L', '100% 123456789'],
  ]) {
    t.test('printf prints ' + what, async (p) => {
      await run(p, 'printf-' + what, H + 'int main(void)\n{\n    printf("' + fmt + '\\n", ' + args + ');\n    return 0;\n}\n');
      p.assert.equal(await progOut(p), want + '\n');
    });
  }

  // ---- input ---------------------------------------------------------------------------------------------
  const ASK = H + 'int main(void)\n{\n    char name[32];\n    printf("Name? ");\n    scanf("%31s", name);\n    printf("Hello, %s!\\n", name);\n    return 0;\n}\n';
  t.test('a program waiting for input shows the stdin prompt', async (p) => {
    const st = await run(p, 'stdinprompt', ASK);
    p.assert.equal(st, 'input');
    p.assert.equal(await p.text('.term-in .prompt'), 'stdin ›');
    await p.stopProgram();
  });
  t.test('the terminal gets the waiting class while the program waits', async (p) => {
    await run(p, 'waitingclass', ASK);
    p.assert.ok(await p.exists('.term.waiting'));
    p.assert.equal(await p.chip(), 'Waiting for input');
    p.assert.match(await p.status(), /reading from stdin/);
    await p.stopProgram();
    p.assert.equal(await p.exists('.term.waiting'), false);
    p.assert.equal(await p.text('.term-in .prompt'), '›');
  });
  t.test('the input line gets the focus when the program waits', async (p) => {
    await run(p, 'focus', ASK);
    await p.wait("document.activeElement && document.activeElement.id === 'termInput'", 2000);
    await p.stopProgram();
  });
  t.test('a prompt without a newline is shown before the program waits', async (p) => {
    await run(p, 'promptflush', ASK);
    p.assert.equal(await progOut(p), 'Name? ');
    await p.stopProgram();
  });
  t.test('a line typed in the terminal reaches scanf', async (p) => {
    await run(p, 'typed', ASK);
    await p.click('#termInput');
    await p.type('Ada\n');
    await p.waitState('exited');
    p.assert.match(await progOut(p), /Name\? Hello, Ada!\n/);
  });
  t.test('typed input is echoed with the in class', async (p) => {
    await run(p, 'echoin', ASK);
    await typeLine(p, 'Grace');
    await p.waitState('exited');
    const it = (await items(p)).find((x) => x[0] === 'in');
    p.assert.deepEqual(it, ['in', 'Grace\n']);
    p.assert.equal(await p.text('#termOut .in'), 'Grace\n');
  });
  t.test('the input line is emptied after Enter', async (p) => {
    await run(p, 'inputempty', ASK);
    await typeLine(p, 'Linus');
    p.assert.equal(await p.ev("document.getElementById('termInput').value"), '');
    await p.settle();
  });
  t.test('the waiting class goes away once the input arrives', async (p) => {
    await run(p, 'waitgone', ASK);
    await typeLine(p, 'Ken');
    await p.waitState('exited');
    p.assert.equal(await p.exists('.term.waiting'), false);
  });
  t.test('several lines of input, typed one at a time', async (p) => {
    await run(p, 'severallines', ECHO);
    for (const w of ['first', 'second line', 'third']) {
      await p.waitState('input');
      await typeLine(p, w);
    }
    await p.waitState('input');
    await p.click('#termEof');
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'got [first]\ngot [second line]\ngot [third]\ndone\n');
  });
  t.test('numbers read by scanf in a loop are summed', async (p) => {
    await run(p, 'sumloop', H + 'int main(void)\n{\n    int x, sum = 0, n = 0;\n    while (scanf("%d", &x) == 1) { sum += x; n++; }\n    printf("n=%d sum=%d\\n", n, sum);\n    return 0;\n}\n');
    await typeLine(p, '1 2 3');
    await p.waitState('input');
    await typeLine(p, '4');
    await p.waitState('input');
    await p.key('d', { ctrl: true });
    await p.waitState('exited');
    p.assert.match(await progOut(p), /n=4 sum=10/);
  });
  t.test('two values on one line fill two scanf calls', async (p) => {
    await run(p, 'twovalues', H + 'int main(void)\n{\n    int a, b;\n    printf("a? ");\n    scanf("%d", &a);\n    printf("b? ");\n    scanf("%d", &b);\n    printf("%d\\n", a * b);\n    return 0;\n}\n');
    await typeLine(p, '6 7');
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'a? b? 42\n');
  });
  t.test('input typed before the program asks is kept for it (type-ahead)', async (p) => {
    await debug(p, 'typeahead', H + 'int main(void)\n{\n    int a = 0, b = 0;\n    scanf("%d %d", &a, &b);\n    printf("sum=%d\\n", a + b);\n    return 0;\n}\n');
    p.assert.equal(await p.state(), 'paused');
    await typeLine(p, '20 22');
    p.assert.equal(await p.state(), 'paused');
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await progOut(p), /sum=42/);
  });
  t.test('type-ahead lines are read one after another', async (p) => {
    await debug(p, 'typeahead2', ECHO);
    await typeLine(p, 'alpha');
    await typeLine(p, 'beta');
    await p.ev('SEE.app.feedEOF()');
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.equal(await progOut(p), 'got [alpha]\ngot [beta]\ndone\n');
  });
  t.test('type-ahead while a program is busy is read when it asks', async (p) => {
    await run(p, 'typeaheadbusy', H + 'int main(void)\n{\n    volatile long i;\n    int n = 0;\n    for (i = 0; i < 3000000; i++) ;\n    scanf("%d", &n);\n    printf("n=%d\\n", n);\n    return 0;\n}\n', { wait: false });
    await typeLine(p, '99');
    await p.waitState(['exited', 'input'], 20000);
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await progOut(p), /n=99/);
  });
  t.test('typing with no program running says so', async (p) => {
    await p.ev('SEE.app.stop()');
    await p.ev('SEE.app.terminal.clear()');
    await typeLine(p, 'hello?');
    p.assert.match(await p.output(), /\(no program is running\)/);
  });
  t.test('fgets keeps the newline and gets the whole line with spaces', async (p) => {
    await run(p, 'fgetsnl', H + 'int main(void)\n{\n    char b[64];\n    fgets(b, sizeof b, stdin);\n    printf("%d [%s]\\n", (int)strlen(b), b);\n    return 0;\n}\n');
    await typeLine(p, 'two words');
    await p.waitState('exited');
    p.assert.equal(await progOut(p), '10 [two words\n]\n');
  });
  t.test('getchar reads typed characters one by one', async (p) => {
    await run(p, 'getcharseq', H + 'int main(void)\n{\n    int a = getchar(), b = getchar(), c = getchar();\n    printf("%c%c%c %d\\n", c, b, a, c);\n    return 0;\n}\n');
    await typeLine(p, 'xyz');
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'zyx 122\n');
  });

  // ---- EOF -----------------------------------------------------------------------------------------------
  t.test('the EOF button ends the input: getchar returns EOF', async (p) => {
    await run(p, 'eofbtn', COUNT);
    await typeLine(p, 'abc');
    await p.waitState('input');
    await p.click('#termEof');
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'count=4 eof=1\n');
  });
  t.test('the EOF button echoes ^D', async (p) => {
    await run(p, 'eofecho', COUNT);
    await p.click('#termEof');
    await p.waitState('exited');
    const it = (await items(p)).find((x) => x[1] === '^D\n');
    p.assert.deepEqual(it, ['in', '^D\n']);
  });
  t.test('Ctrl+D in the input line ends the input', async (p) => {
    await run(p, 'ctrld', COUNT);
    await typeLine(p, 'hi');
    await p.waitState('input');
    await p.key('d', { ctrl: true });
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'count=3 eof=1\n');
    p.assert.match(await p.output(), /\^D\n/);
  });
  t.test('scanf returns -1 at the end of the input', async (p) => {
    await run(p, 'scanfeof', SCANF_EOF);
    await p.click('#termEof');
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'r=-1 n=7\n');
  });
  t.test('scanf returns -1 after Ctrl+D', async (p) => {
    await run(p, 'scanfctrld', SCANF_EOF);
    await p.click('#termInput');
    await p.key('d', { ctrl: true });
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'r=-1 n=7\n');
  });
  t.test('scanf returns 0 when the input does not match', async (p) => {
    await run(p, 'scanfzero', SCANF_EOF);
    await typeLine(p, 'abc');
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'r=0 n=7\n');
  });
  t.test('fgets returns NULL at EOF', async (p) => {
    await run(p, 'fgetsnull', ECHO);
    await p.key('d', { ctrl: true });
    await p.waitState('exited');
    p.assert.equal(await progOut(p), 'done\n');
  });
  t.test('EOF given before the program reads is seen when it reads', async (p) => {
    await debug(p, 'eofahead', COUNT);
    await p.click('#termEof');
    await p.cont();
    p.assert.equal(await p.state(), 'exited');
    p.assert.equal(await progOut(p), 'count=0 eof=1\n');
  });
  t.test('the EOF button has a tooltip that explains it', async (p) => {
    p.assert.match(await p.attr('#termEof', 'title'), /End of input \(Ctrl\+D\)/);
  });

  // ---- gets -----------------------------------------------------------------------------------------------
  t.test('gets reads a line and warns in the terminal', async (p) => {
    await run(p, 'gets', H + 'int main(void)\n{\n    char b[32];\n    gets(b);\n    printf("[%s]\\n", b);\n    return 0;\n}\n');
    await typeLine(p, 'unsafe line');
    await p.waitState('exited');
    const out = await p.output();
    p.assert.match(out, /warning: gets\(\) cannot know how big the buffer is, and was removed from C later for that reason; use fgets\(\)/);
    p.assert.match(out, /\[unsafe line\]/);
    p.assert.ok(await p.exists('#termOut .note.bad'));
  });
  t.test('the gets warning is in Problems too', async (p) => {
    await run(p, 'getsprob', H + 'int main(void)\n{\n    char b[32];\n    gets(b);\n    return 0;\n}\n');
    await typeLine(p, 'x');
    await p.waitState('exited');
    p.assert.ok((await p.problems()).some((x) => /^runtime: gets\(\) cannot know/.test(x)));
  });

  // ---- stdout's buffer --------------------------------------------------------------------------------------
  const PEND = H + 'int main(void)\n{\n    printf("abc");\n    printf("def");\n    printf("\\n");\n    printf("xyz\\n");\n    return 0;\n}\n';
  t.test('unflushed printf text is shown dimmed while paused', async (p) => {
    await debug(p, 'pending', PEND);
    p.assert.equal(await p.line(), 6);
    await p.step('over');
    p.assert.equal(await p.text('#termOut .pending'), 'abc');
    p.assert.equal(await progOut(p), '');
    p.assert.equal(await p.ev("getComputedStyle(document.querySelector('#termOut .pending')).opacity"), '0.5');
    await p.stopProgram();
  });
  t.test('the pending text grows with each printf', async (p) => {
    await debug(p, 'pendinggrow', PEND);
    await p.step('over', 2);
    p.assert.equal(await p.text('#termOut .pending'), 'abcdef');
    await p.stopProgram();
  });
  t.test('the pending text is gone after a newline and the line is printed', async (p) => {
    await debug(p, 'pendinggone', PEND);
    await p.step('over', 3);
    p.assert.equal(await p.exists('#termOut .pending'), false);
    p.assert.equal(await progOut(p), 'abcdef\n');
    await p.stopProgram();
  });
  t.test('the pending text explains the buffer in its tooltip', async (p) => {
    await debug(p, 'pendingtip', PEND);
    await p.step('over');
    p.assert.match(await p.attr('#termOut .pending', 'title'), /still waiting in stdout's buffer/);
    await p.stopProgram();
  });
  t.test('stepping back un-prints the pending text', async (p) => {
    await debug(p, 'pendingback', PEND);
    await p.step('over');
    p.assert.equal(await p.text('#termOut .pending'), 'abc');
    await p.back();
    p.assert.equal(await p.exists('#termOut .pending'), false);
    await p.cont();
    p.assert.equal(await progOut(p), 'abcdef\nxyz\n');
  });
  t.test('Stop removes the pending text', async (p) => {
    await debug(p, 'pendingstop', PEND);
    await p.step('over');
    await p.stopProgram();
    p.assert.equal(await p.exists('#termOut .pending'), false);
  });
  const FFL = H + 'int main(void)\n{\n    printf("now");\n    fflush(stdout);\n    printf(" later");\n    printf("\\n");\n    return 0;\n}\n';
  t.test('fflush(stdout) sends the text to the screen at once', async (p) => {
    await debug(p, 'fflush', FFL);
    await p.step('over', 2);
    p.assert.equal(await progOut(p), 'now');
    p.assert.equal(await p.exists('#termOut .pending'), false);
    await p.step('over');
    p.assert.equal(await p.text('#termOut .pending'), ' later');
    await p.cont();
    p.assert.equal(await progOut(p), 'now later\n');
  });
  t.test('setbuf(stdout, NULL) makes stdout unbuffered', async (p) => {
    await debug(p, 'setbuf', H + 'int main(void)\n{\n    setbuf(stdout, NULL);\n    printf("at once");\n    printf("\\n");\n    return 0;\n}\n');
    await p.step('over', 2);
    p.assert.equal(await progOut(p), 'at once');
    p.assert.equal(await p.exists('#termOut .pending'), false);
    await p.stopProgram();
  });
  t.test('reading input flushes the pending prompt', async (p) => {
    await debug(p, 'readflush', ASK);
    p.assert.equal(await p.line(), 7);
    await p.step('over');
    p.assert.equal(await p.text('#termOut .pending'), 'Name? ');
    await p.step('over');
    await p.waitState('input');
    p.assert.equal(await progOut(p), 'Name? ');
    p.assert.equal(await p.exists('#termOut .pending'), false);
    await p.stopProgram();
  });
  t.test('buffered output still reaches the screen when the program ends', async (p) => {
    await run(p, 'flushatexit', H + 'int main(void) { printf("no newline"); return 0; }\n');
    p.assert.equal(await progOut(p), 'no newline');
  });
  t.test('a crash notes the buffered output that was lost', async (p) => {
    const st = await run(p, 'lost', H + 'int main(void)\n{\n    int *p = NULL;\n    printf("before");\n    *p = 1;\n    return 0;\n}\n');
    p.assert.equal(st, 'faulted');
    const out = await p.output();
    p.assert.match(out, /\(6 bytes printed to stdout were still in its buffer and were lost: "before"\. End lines with \\n or call fflush\(stdout\)\.\)/);
    p.assert.equal(await progOut(p), '');
  });
  t.test('a crash after a newline loses nothing', async (p) => {
    await run(p, 'notlost', H + 'int main(void)\n{\n    int *p = NULL;\n    printf("before\\n");\n    *p = 1;\n    return 0;\n}\n');
    const out = await p.output();
    p.assert.doesNotMatch(out, /were lost/);
    p.assert.equal(await progOut(p), 'before\n');
  });
  t.test('a crash after fflush loses nothing', async (p) => {
    await run(p, 'flushedcrash', H + 'int main(void)\n{\n    int *p = NULL;\n    printf("saved");\n    fflush(stdout);\n    *p = 1;\n    return 0;\n}\n');
    p.assert.doesNotMatch(await p.output(), /were lost/);
    p.assert.equal(await progOut(p), 'saved');
  });
  t.test('the lost-output note comes before the crash message', async (p) => {
    await run(p, 'lostorder', H + 'int main(void)\n{\n    int z = 0;\n    printf("partial");\n    return 1 / z;\n}\n');
    p.assert.match(await p.output(), /were lost: "partial"[\s\S]*\nFloating point exception: integer division by zero/);
  });

  // ---- clearing -------------------------------------------------------------------------------------------
  t.test('the clear button empties the terminal', async (p) => {
    await run(p, 'clear', H + 'int main(void) { printf("to be cleared\\n"); return 0; }\n');
    p.assert.match(await p.output(), /to be cleared/);
    await p.click('.term-in button[aria-label="Clear"]');
    p.assert.equal(await p.output(), '');
    p.assert.equal(await p.ev("document.getElementById('termOut').childNodes.length"), 0);
  });
  t.test('output after clearing appears in the empty terminal', async (p) => {
    await run(p, 'clearthen', ECHO);
    await p.click('.term-in button[aria-label="Clear"]');
    await typeLine(p, 'fresh');
    await p.waitState('input');
    p.assert.equal(await p.output(), 'fresh\ngot [fresh]\n');
    await p.stopProgram();
  });
  t.test('clearing keeps the program waiting for input', async (p) => {
    await run(p, 'clearwait', ASK);
    await p.click('.term-in button[aria-label="Clear"]');
    p.assert.equal(await p.state(), 'input');
    p.assert.ok(await p.exists('.term.waiting'));
    await p.stopProgram();
  });

  // ---- terminal styles ----------------------------------------------------------------------------------
  const STYLES = [['plain', 'Terminal: plain'], ['phosphor', 'Terminal: green phosphor'], ['amber', 'Terminal: amber']];
  for (const [key, label] of STYLES) {
    t.test('View > ' + label + ' sets the terminal style', async (p) => {
      try {
        await p.menu('View', label);
        p.assert.equal(await p.ev('document.documentElement.dataset.term'), key);
        p.assert.equal(await p.ev('SEE.app.settings.term'), key);
        await p.menu('View');
        const items = await p.menuItems();
        await p.closeMenus();
        for (const [, l] of STYLES) p.assert.equal(items.find((x) => x.label === l).checked, l === label, l);
      } finally {
        await p.ev("SEE.app.setTerm('plain')");
      }
    });
  }
  t.test('the green phosphor style has a green text on black', async (p) => {
    try {
      await p.menu('View', 'Terminal: green phosphor');
      const [bg, fg] = await p.ev("[getComputedStyle(document.querySelector('.term')).backgroundColor, getComputedStyle(document.querySelector('.term')).color]");
      p.assert.equal(bg, 'rgb(3, 8, 3)');
      p.assert.equal(fg, 'rgb(89, 255, 122)');
    } finally { await p.ev("SEE.app.setTerm('plain')"); }
  });
  t.test('the amber style has amber text', async (p) => {
    try {
      await p.menu('View', 'Terminal: amber');
      p.assert.equal(await p.ev("getComputedStyle(document.querySelector('.term')).color"), 'rgb(255, 176, 0)');
      p.assert.equal(await p.ev("getComputedStyle(document.querySelector('.term')).backgroundColor"), 'rgb(10, 6, 0)');
    } finally { await p.ev("SEE.app.setTerm('plain')"); }
  });
  t.test('the plain style differs from phosphor and amber', async (p) => {
    const colours = {};
    try {
      for (const [key, label] of STYLES) {
        await p.menu('View', label);
        colours[key] = await p.ev("getComputedStyle(document.querySelector('.term')).color");
      }
    } finally { await p.ev("SEE.app.setTerm('plain')"); }
    p.assert.notEqual(colours.plain, colours.phosphor);
    p.assert.notEqual(colours.plain, colours.amber);
  });
  t.test('in phosphor style stderr is yellow', async (p) => {
    try {
      await p.ev("SEE.app.setTerm('phosphor')");
      await run(p, 'phosphorerr', H + 'int main(void) { fprintf(stderr, "warn\\n"); return 0; }\n');
      p.assert.equal(await p.ev("getComputedStyle(document.querySelector('#termOut .err')).color"), 'rgb(255, 209, 102)');
    } finally { await p.ev("SEE.app.setTerm('plain')"); }
  });
  t.test('the terminal style is remembered after a reload', async (p) => {
    try {
      await p.menu('View', 'Terminal: amber');
      await p.ev('SEE.app.autosaveAll()');
      await p.reload();
      p.assert.equal(await p.ev('document.documentElement.dataset.term'), 'amber');
    } finally { await p.ev("SEE.app.setTerm('plain')"); }
  });

  // ---- long output -------------------------------------------------------------------------------------------
  t.test('thousands of lines of output all arrive', async (p) => {
    const t0 = Date.now();
    const st = await run(p, 'long', H + 'int main(void)\n{\n    int i;\n    for (i = 0; i < 5000; i++) printf("line %d\\n", i);\n    return 0;\n}\n', { timeout: 30000 });
    p.assert.equal(st, 'exited');
    p.assert.ok(Date.now() - t0 < 15000, 'took ' + (Date.now() - t0) + 'ms');
    const out = await progOut(p);
    p.assert.equal(out.split('\n').length, 5001);
    p.assert.match(out, /^line 0\nline 1\n/);
    p.assert.match(out, /line 4999\n$/);
  }, { timeout: 40000 });
  t.test('long output scrolls the terminal to the end', async (p) => {
    await run(p, 'longscroll', H + 'int main(void)\n{\n    int i;\n    for (i = 0; i < 2000; i++) printf("row %d\\n", i);\n    return 0;\n}\n');
    p.assert.ok(await p.ev("(() => { const o = document.getElementById('termOut'); return o.scrollHeight > o.clientHeight && o.scrollTop + o.clientHeight >= o.scrollHeight - 30; })()"));
  });
  t.test('the page answers while a program prints thousands of lines', async (p) => {
    await run(p, 'responsive', H + 'int main(void)\n{\n    int i;\n    for (i = 0; i < 4000; i++) printf("tick %d\\n", i);\n    return 0;\n}\n', { wait: false });
    let worst = 0, seen = 0;
    while ((await p.state()) === 'running') {
      const t0 = Date.now();
      await p.ev('1 + 1');
      worst = Math.max(worst, Date.now() - t0);
      seen++;
      await p.sleep(50);
    }
    p.assert.ok(worst < 500, 'page took ' + worst + 'ms to answer');
    p.assert.equal(await p.state(), 'exited');
    p.assert.match(await progOut(p), /tick 3999\n$/);
  }, { timeout: 40000 });
  t.test('a program that prints without end can be stopped', async (p) => {
    // bug: with endless output the page soon stops answering (see the next test), so Stop cannot be pressed
    await run(p, 'endless', H + 'int main(void)\n{\n    long i;\n    for (i = 0; ; i++) printf("tick %ld\\n", i);\n    return 0;\n}\n', { wait: false });
    await p.sleep(1500);
    await p.click('#tbStop');
    p.assert.equal(await p.state(), 'none');
    p.assert.match(await p.output(), /tick \d+\n[\s\S]*Stopped\./);
  });
  t.test('ten thousand lines print in reasonable time', async (p) => {
    // bug: every terminal write reads scrollTop/scrollHeight right after appending a node, forcing a layout of the
    // whole transcript, so printing slows down with its length: 10000 lines take ~45s, 20000 ~200s, and past
    // 20000 lines (the trim and full redraw) the page stops answering, so Stop cannot be pressed
    const t0 = Date.now();
    await run(p, 'tenthousand', H + 'int main(void)\n{\n    int i;\n    for (i = 0; i < 10000; i++) printf("line %d\\n", i);\n    return 0;\n}\n', { timeout: 20000 });
    p.assert.equal(await p.state(), 'exited');
    p.assert.ok(Date.now() - t0 < 15000, 'took ' + (Date.now() - t0) + 'ms');
  }, { timeout: 40000 });
  t.test('a huge transcript is trimmed to keep the newest output', async (p) => {
    // about 2.4 MB of text: past the terminal's limit, so the oldest output goes
    await run(p, 'trim', H + 'int main(void)\n{\n    long i;\n    for (i = 0; i < 200000; i++) printf("number %ld\\n", i);\n    return 0;\n}\n', { timeout: 60000 });
    const len = await p.ev('SEE.app.terminal.length');
    p.assert.ok(len <= 2000000, 'length ' + len);
    const out = await p.output();
    p.assert.match(out, /number 199999\n/);
    p.assert.doesNotMatch(out, /^number 0\n/m);
  }, { timeout: 90000 });
  t.test('a line longer than the terminal wraps instead of scrolling sideways', async (p) => {
    await run(p, 'longline', H + 'int main(void)\n{\n    int i;\n    for (i = 0; i < 400; i++) putchar(\'a\' + i % 26);\n    putchar(\'\\n\');\n    return 0;\n}\n');
    p.assert.ok(await p.ev("(() => { const o = document.getElementById('termOut'); return o.scrollWidth <= o.clientWidth + 1; })()"));
  });

  // ---- UTF-8 ---------------------------------------------------------------------------------------------------
  for (const [what, esc, want] of [
    ['an accented letter', '\\xc3\\xa9t\\xc3\\xa9', 'été'],
    ['a check mark', '\\xe2\\x9c\\x93 done', '✓ done'],
    ['Greek letters', '\\xce\\xb1\\xce\\xb2\\xce\\xb3', 'αβγ'],
    ['Japanese', '\\xe6\\x97\\xa5\\xe6\\x9c\\xac', '日本'],
    ['an emoji', '\\xf0\\x9f\\x99\\x82', '🙂'],
  ]) {
    t.test('UTF-8 bytes print as ' + what, async (p) => {
      await run(p, 'utf8-' + what, H + 'int main(void)\n{\n    printf("' + esc + '\\n");\n    return 0;\n}\n');
      p.assert.equal(await progOut(p), want + '\n');
      p.assert.ok((await p.text('#termOut')).includes(want));
    });
  }
  t.test('a UTF-8 character written one byte at a time prints whole', async (p) => {
    await run(p, 'utf8bytes', H + 'int main(void)\n{\n    fputc(0xe2, stdout); fflush(stdout);\n    fputc(0x82, stdout); fflush(stdout);\n    fputc(0xac, stdout); fflush(stdout);\n    putchar(\'\\n\');\n    return 0;\n}\n');
    p.assert.equal(await progOut(p), '€\n');
  });
  t.test('UTF-8 typed in the terminal is echoed back', async (p) => {
    await run(p, 'utf8in', ECHO);
    await typeLine(p, 'naïve café ✓');
    await p.waitState('input');
    p.assert.match(await progOut(p), /got \[naïve café ✓\]/);
    await p.stopProgram();
  });
  t.test('UTF-8 input is counted in bytes by strlen', async (p) => {
    await run(p, 'utf8len', H + 'int main(void)\n{\n    char b[64];\n    fgets(b, sizeof b, stdin);\n    printf("%d\\n", (int)strlen(b) - 1);\n    return 0;\n}\n');
    await typeLine(p, 'é€');
    await p.waitState('exited');
    p.assert.equal(await progOut(p), '5\n');
  });
  t.test('a UTF-8 file is read and printed correctly', async (p) => {
    await p.ev("SEE.app.vfs.writeText('/tmp/t41-utf8.txt', 'Grüße, мир\\n', { trusted: true })");
    await run(p, 'utf8file', H + 'int main(void)\n{\n    char b[64];\n    FILE *f = fopen("/tmp/t41-utf8.txt", "r");\n    fgets(b, sizeof b, f);\n    fclose(f);\n    fputs(b, stdout);\n    return 0;\n}\n');
    p.assert.equal(await progOut(p), 'Grüße, мир\n');
  });
  t.test('UTF-8 on stderr prints correctly', async (p) => {
    await run(p, 'utf8err', H + 'int main(void)\n{\n    fprintf(stderr, "\\xc2\\xa1" "error!\\n");\n    return 0;\n}\n');
    p.assert.equal((await p.texts('#termOut .err')).join(''), '¡error!\n');
  });
  t.test('non-ASCII text written in a string literal prints as typed', async (p) => {
    // bug: the lexer stores each UTF-16 code unit of a literal as one byte (charCodeAt & 255), so "é" becomes 0xE9 and "✓" 0x13
    await run(p, 'utf8literal', H + 'int main(void)\n{\n    printf("café ✓\\n");\n    printf("%d\\n", (int)strlen("é"));\n    return 0;\n}\n');
    p.assert.equal(await progOut(p), 'café ✓\n2\n');
  });
}
