// Smoke tests: the studio loads, a program builds and runs, the debugger pauses and steps.
export default function (t) {
  t.test('the studio loads with every main area', async (p) => {
    for (const id of ['#toolbar', '#menubar', '#side', '#editors', '#bottom', '#right', '#tbRun', '#tbDebug']) p.assert.ok(await p.visible(id), id);
    p.assert.equal(await p.state(), 'none');
  });
  t.test('hello.c is open on a first visit', async (p) => {
    p.assert.equal(await p.activePath(), '/home/user/hello/hello.c');
    p.assert.match(await p.code(), /int main\(void\)/);
  });
  t.test('Run prints the output and the exit status', async (p) => {
    const st = await p.runProgram('#include <stdio.h>\nint main(void) { printf("six times seven is %d\\n", 6 * 7); return 0; }\n');
    p.assert.equal(st, 'exited');
    p.assert.match(await p.output(), /six times seven is 42/);
    p.assert.match(await p.output(), /exited with status 0/);
  });
  t.test('F5 stops at the first line of main', async (p) => {
    await p.newFile('/home/user/e2e/main.c', '#include <stdio.h>\nint main(void)\n{\n    int x = 1;\n    x = x + 1;\n    printf("%d\\n", x);\n    return 0;\n}\n');
    await p.key('F5');
    await p.waitState('paused');
    p.assert.equal(await p.line(), 4);
    await p.key('F10');
    await p.settle();
    p.assert.equal(await p.line(), 5);
    p.assert.equal(await p.cval('x'), 1);
    await p.stopProgram();
  });
  t.test('a build error lands in Problems', async (p) => {
    await p.newFile('/home/user/e2e/main.c', 'int main(void) { return y; }\n');
    await p.build();
    p.assert.match((await p.problems()).join('\n'), /'y' undeclared/);
    p.assert.ok(await p.visible('#panel-probs'));
  });
}
