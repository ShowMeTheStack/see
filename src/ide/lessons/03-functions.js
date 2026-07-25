// Unit 3: functions and the stack.
SEE.Lessons.add({
  id: 'call-frame', unit: 'Functions and the stack', title: 'A call creates a frame',
  blurb: 'Step into a function and watch its frame appear on the stack below main.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: calling a function */
#include <stdio.h>

int square(int x)
{
    int result;

    result = x * x;
    return result;
}

int main(void)
{
    int a = 5;
    int b;

    b = square(a);
    printf("%d squared is %d\\n", a, b);
    return 0;
}
`,
  },
  intro: '<p>A <b>function</b> is a named piece of code you can call. <code>square</code> takes one <code>int</code>, called its <b>parameter</b> <code>x</code>, and gives back <code>x * x</code>.</p><p>Each time a function is called, it gets a new <b>frame</b> on the stack: room for its parameters and local variables, plus two words the machine needs to get back to the caller.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 14, text: '<p>The program begins in <code>main</code>, not at the top of the file. The stack has one frame, <code>main()</code>, holding <code>a</code> and <code>b</code>.</p><p>Look at the two extra rows in the frame: <b>return to</b> and <b>saved fp</b>. Even <code>main</code> was called by something, and these say how to go back to it.</p>' },
    { do: 'over', line: 17, check: 'a == 5', text: '<p><code>a</code> is 5. Line 17 calls <code>square(a)</code>. Pressing F10 (step over) would run the whole call in one go. To go inside it, use <b>Step into</b> (F11).</p>' },
    { do: 'into', line: 8, check: 'x == 5', text: '<p>The debugger is inside <code>square</code>, and the stack has a second frame, <code>square()</code>, drawn <b>below</b> <code>main()</code> at lower addresses: the stack grows down.</p><ul><li><code>x</code> is the parameter. It already holds 5, copied from <code>a</code> when the call was made.</li><li><code>result</code> is a local, red because it has no value yet.</li><li><b>return to</b> holds an address in the code of <code>main</code>: where to go on when <code>square</code> returns.</li><li><b>saved fp</b> holds <code>main</code>\'s frame pointer, the <code>fp</code> shown in the head of <code>main</code>\'s frame, so it can be restored on return.</li></ul>' },
    { do: 'over', line: 9, check: 'result == 25', text: '<p><code>result</code> is 25. It lives in <code>square</code>\'s frame; <code>main</code> cannot see it by name.</p><div class="try">Try it: in the Variables panel, click <code>main()</code> in the call stack list. The panel shows <code>main</code>\'s variables while the program stays paused in <code>square</code>.</div>' },
    { do: 'over', line: 17, text: '<p><code>return result;</code> sent the value 25 back and the frame of <code>square</code> is gone: the stack holds only <code>main()</code> again. The machine used <b>return to</b> to find its way back to line 17 and <b>saved fp</b> to find <code>main</code>\'s frame.</p><p>Line 17 is not finished yet: the returned value still has to be stored in <code>b</code>.</p>' },
    { do: 'over', line: 18, check: 'b == 25', text: '<p><code>b</code> is 25. The memory that held <code>x</code> and <code>result</code> is still there below <code>main</code>\'s frame, but it belongs to no one now and the next call will reuse it.</p>' },
    { do: 'over', show: 'term', output: '5 squared is 25', text: '<p>The result is printed. <code>printf</code> is a function too: stepping over it ran its whole call, frame and all, in one go.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">A call pushes a frame (parameters, locals, return address, saved frame pointer). A return pops it and goes back to the return address. Step into (F11) follows a call; Step over (F10) runs it in one go; Step out (Shift+F11) finishes the current function.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'args-copies', unit: 'Functions and the stack', title: 'Arguments are copies',
  blurb: 'Changing a parameter changes the function\'s own copy, never the caller\'s variable.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a function gets copies of its arguments */
#include <stdio.h>

void add_ten(int n)
{
    n = n + 10;                  /* changes add_ten's own n */
    printf("inside:  n = %d\\n", n);
}

int main(void)
{
    int score = 5;

    add_ten(score);
    printf("outside: score = %d\\n", score);
    return 0;
}
`,
  },
  intro: '<p>When you call <code>add_ten(score)</code>, C works out the value of <code>score</code> and copies that value into the parameter <code>n</code>, in the new frame. This is called <b>pass by value</b>, and it is the only way C passes arguments.</p><p>So what happens to <code>score</code> when the function changes <code>n</code>?</p>',
  steps: [
    { do: 'start', show: 'memory', line: 12, text: '<p><code>main</code>\'s frame holds <code>score</code>.</p>' },
    { do: 'over', line: 14, check: 'score == 5', text: '<p><code>score</code> is 5. Note its address in the memory picture.</p>' },
    { do: 'into', line: 6, check: 'n == 5', text: '<p>A new frame for <code>add_ten</code>, below <code>main</code>\'s. <code>n</code> holds 5, but it is a <b>different box</b> at a different, lower address. Only the value was copied.</p>' },
    { do: 'over', line: 7, check: 'n == 15', text: '<p><code>n</code> is now 15 and yellow. Look up at <code>main</code>\'s frame: <code>score</code> is still 5. Nothing connects the two boxes.</p>' },
    { do: { set: ['n', '99'] }, check: 'n == 99', text: '<p>The debugger set <code>n</code> to 99, as you could by clicking it. Again only <code>add_ten</code>\'s frame changes.</p>' },
    { do: 'over', show: 'term', output: 'inside:  n = 99', text: '<p>Inside the function, <code>n</code> is 99.</p>' },
    { do: 'out', line: 14, check: 'score == 5', text: '<p><b>Step out</b> (Shift+F11) ran to the end of <code>add_ten</code> and returned to the line that called it, line 14. The frame of <code>add_ten</code>, with <code>n</code> in it, is gone. <code>score</code> is 5, as it always was.</p>' },
    { do: 'over', line: 15, check: 'score == 5', text: '<p>Line 14 had nothing left to do, since <code>add_ten</code> returns no value (its return type is <code>void</code>). Line 15 prints <code>score</code> next.</p>' },
    { do: 'continue', state: 'exited', output: 'outside: score = 5', text: '<div class="note">Arguments are copied into the new frame. A function can change its parameters freely; the caller\'s variables do not change. To let a function change a caller\'s variable, you pass the variable\'s <b>address</b>, as <code>scanf</code> needs <code>&amp;x</code>. That is the subject of the pointers unit.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'return-values', unit: 'Functions and the stack', title: 'Return values',
  blurb: 'return ends a function at once and hands one value back to the expression that called it.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: the biggest of three numbers */
#include <stdio.h>

int max2(int a, int b)
{
    if (a > b) {
        return a;           /* leaves the function here */
    }
    return b;
}

int main(void)
{
    int x = 4, y = 9, z = 7;
    int big;

    big = max2(max2(x, y), z);
    printf("biggest: %d\\n", big);
    max2(1, 2);             /* the value returned is thrown away */
    return 0;
}
`,
  },
  intro: '<p>A function that returns an <code>int</code> gives one value back with <code>return</code>. The call <code>max2(x, y)</code> is an expression: it can be stored, printed, or passed straight into another call.</p><p><code>return</code> also ends the function at once, even if lines follow it.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 14, text: '<p>Line 17 calls <code>max2</code> twice, one call inside the other. The inner call must finish first, because its answer is the first argument of the outer one.</p>' },
    { do: { to: 17 }, line: 17, check: 'x == 4 && y == 9 && z == 7', text: '<p>The three numbers are set. Now step into line 17.</p>' },
    { do: 'into', line: 6, check: 'a == 4 && b == 9', text: '<p>This is the <b>inner</b> call, <code>max2(x, y)</code>: <code>a</code> is 4 and <code>b</code> is 9. The outer call has not started yet; it is still waiting for this one\'s answer.</p>' },
    { do: 'over', line: 9, text: '<p><code>a &gt; b</code> is 0, so line 7 was skipped and the debugger is on <code>return b;</code>.</p>' },
    { do: 'over', line: 17, text: '<p>The inner call returned 9 and its frame is gone. The debugger is back on line 17, which is only half done.</p>' },
    { do: 'into', line: 6, check: 'a == 9 && b == 7', text: '<p>The <b>outer</b> call, <code>max2(9, z)</code>. Its <code>a</code> is the value the inner call returned. This is a brand new frame, at the same addresses the inner call\'s frame used a moment ago.</p>' },
    { do: 'over', line: 7, text: '<p><code>9 &gt; 7</code> is 1, so line 7 runs next.</p>' },
    { do: 'over', line: 17, text: '<p><code>return a;</code> ended the function at once: line 9 never ran in this call. The value 9 goes back to line 17.</p>' },
    { do: 'over', line: 18, check: 'big == 9', text: '<p>The value of the outer call was stored in <code>big</code>: 9, the biggest of the three.</p>' },
    { do: 'over', times: 2, line: 20, show: 'term', output: 'biggest: 9', text: '<p>Line 19 called <code>max2(1, 2)</code> and did nothing with the 2 it returned. That is allowed in C: a returned value can be ignored.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note"><code>return value;</code> does two things: it ends the function, and it makes the call expression equal to that value. Calls can be nested; the innermost runs first.</div><div class="try">Try it: delete line 9 and build. What does See say about a function that can reach its end without returning a value?</div>' },
  ],
});

SEE.Lessons.add({
  id: 'scope-lifetime', unit: 'Functions and the stack', title: 'Scope and lifetime',
  blurb: 'A variable declared inside braces exists only inside them.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: where a name can be used, and for how long */
#include <stdio.h>

int main(void)
{
    int total = 0;
    int i;

    for (i = 1; i <= 3; i++) {
        int doubled;             /* only inside these braces */
        doubled = i * 2;
        total += doubled;
    }
    printf("total = %d\\n", total);
    {
        int total = 100;         /* a new total that hides the outer one */
        printf("inner total = %d\\n", total);
    }
    printf("outer total = %d\\n", total);
    return 0;
}
`,
  },
  intro: '<p>The <b>scope</b> of a name is the part of the program where it can be used: from its declaration to the end of the braces <code>{ }</code> it was declared in. The <b>lifetime</b> of a local variable is the time it exists while the program runs.</p><p>In C89, a block may declare variables at its start, before any statements.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p><code>main</code>\'s frame. Look at what it holds before the loop starts.</p>' },
    { do: { to: 11 }, line: 11, check: 'i == 1 && total == 0', text: '<p>Inside the loop body, <code>doubled</code> is in scope: the Variables panel lists it and the memory picture shows it in <code>main</code>\'s frame. It is red: a block variable without an initialiser starts with no value each time the block is entered.</p>' },
    { do: 'over', times: 2, line: 9, check: 'total == 2', text: '<p><code>doubled</code> was 2 and was added to <code>total</code>. At the closing brace on line 13 the block ended and the loop went back to line 9.</p>' },
    { do: { to: 14 }, line: 14, check: 'total == 12', text: '<p>The loop has finished: 2 + 4 + 6 = 12. The debugger is outside the braces now, so <code>doubled</code> is out of scope. Its name cannot be used on this line.</p><div class="try">Try it: add <code>doubled</code> as a watch expression now. See cannot find it here.</div>' },
    { do: 'over', line: 16, output: 'total = 12', text: '<p>Line 15 opens a plain block, just braces with no <code>if</code> or loop. Line 16 declares a second variable also called <code>total</code>.</p>' },
    { do: 'over', line: 17, check: 'total == 100', text: '<p>Inside this block, the name <code>total</code> means the <b>inner</b> one, which is 100. The outer <code>total</code> still exists and still holds 12; it is only hidden. The memory picture shows both, at different addresses.</p>' },
    { do: 'over', line: 19, check: 'total == 12', output: 'inner total = 100', text: '<p>The block ended, and <code>total</code> means the outer variable again: 12.</p>' },
    { do: { edit: [14, '    printf("doubled = %d\\n", doubled);'] }, text: '<p>Line 14 has been changed to use <code>doubled</code> outside its block.</p>' },
    { do: 'build', show: 'probs', errors: 'doubled', text: '<p>The compiler rejects it: outside the braces of the loop the name <code>doubled</code> is not declared. Scope is checked when the program is compiled, before it runs.</p>' },
    { do: { edit: [14, '    printf("total = %d\\n", total);'] }, text: '<p>Line 14 is back as it was.</p><div class="note">Declare a variable in the smallest block that needs it. Its name can be used only inside that block, and its storage is only reserved while the block runs. Reusing a name in an inner block hides the outer one, which is legal but easy to misread.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'static-locals', unit: 'Functions and the stack', title: 'static locals',
  blurb: 'A static local keeps its value between calls, because it does not live on the stack.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a function that counts its own calls */
#include <stdio.h>

int counter(void)
{
    static int calls = 0;   /* one variable for the whole run, set to 0 once */
    int fresh = 0;          /* a new variable on every call */

    calls++;
    fresh++;
    return calls;
}

int main(void)
{
    int a, b, c;

    a = counter();
    b = counter();
    c = counter();
    printf("%d %d %d\\n", a, b, c);
    return 0;
}
`,
  },
  intro: '<p>An ordinary local variable lives in the function\'s frame, so it is made fresh on each call and lost on return.</p><p>A local declared <code>static</code> is different. Its name is still only usable inside the function, but the variable itself is made once, before <code>main</code> starts, and lives with the global variables until the program ends.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 18, text: '<p>Look at the memory picture above the stack, in <b>Globals and statics</b>: there is already a variable <code>counter.calls</code>, holding 0. <code>counter</code> has not been called yet, but its static variable exists.</p>' },
    { do: 'into', line: 7, check: 'calls == 0', text: '<p>Inside the first call. The frame of <code>counter</code> holds only <code>fresh</code> (red for now), the return address and the saved frame pointer. <code>calls</code> is not in the frame.</p><p>The debugger skipped line 6: a static\'s initialiser is not a statement that runs on each call. It was applied once, when the program was loaded. Line 7 is different: it sets <code>fresh</code> to 0 on every call.</p>' },
    { do: 'over', times: 3, line: 11, check: 'calls == 1 && fresh == 1', text: '<p>Both went up by 1. <code>calls</code> changed up in the globals area; <code>fresh</code> changed in the frame.</p>' },
    { do: 'out', line: 18, text: '<p>The call returned to line 18. Its frame, with <code>fresh</code>, is gone. <code>counter.calls</code> is still there in Globals and statics, holding 1.</p>' },
    { do: 'over', line: 19, check: 'a == 1', text: '<p>The value returned by the first call, 1, has been stored in <code>a</code>.</p>' },
    { do: 'into', line: 7, check: 'calls == 1', text: '<p>The second call, in a new frame. <code>calls</code> is already 1: the value the first call left.</p>' },
    { do: 'over', line: 9, check: 'calls == 1 && fresh == 0', text: '<p><code>fresh</code> is 0 again: it is a new variable in a new frame, set by line 7 on every call.</p>' },
    { do: { to: 21 }, line: 21, check: 'a == 1 && b == 2 && c == 3', text: '<p>The third call returned 3. Each call made a fresh <code>fresh</code>, but all three shared one <code>calls</code>.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: '1 2 3', text: '<div class="note"><code>static</code> on a local changes its <b>lifetime</b> (the whole run, stored with the globals in .data or .bss) but not its <b>scope</b> (only <code>counter</code> can use the name).</div><div class="try">Try it: remove the word <code>static</code> from line 6 and run again. What does it print now?</div>' },
  ],
});

SEE.Lessons.add({
  id: 'recursion-frames', unit: 'Functions and the stack', title: 'Recursion: many frames',
  blurb: 'A function that calls itself gets a new frame for every call, each with its own n.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: factorial, 4! = 4 * 3 * 2 * 1 */
#include <stdio.h>

int fact(int n)
{
    int r;

    if (n <= 1) {
        return 1;           /* base case: stops the calls */
    }
    r = n * fact(n - 1);    /* the call waits here for a smaller answer */
    return r;
}

int main(void)
{
    int x;

    x = fact(4);
    printf("4! = %d\\n", x);
    return 0;
}
`,
  },
  intro: '<p>A <b>recursive</b> function calls itself. <code>fact(4)</code> needs <code>fact(3)</code>, which needs <code>fact(2)</code>, which needs <code>fact(1)</code>, which answers 1 straight away: the <b>base case</b>.</p><p>Each call is a separate call with a separate frame, so each has its own <code>n</code> and its own <code>r</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 19, text: '<p>Only <code>main</code>\'s frame so far.</p>' },
    { do: 'into', line: 8, check: 'n == 4', text: '<p>The first call, <code>fact(4)</code>. Its frame is below <code>main</code>\'s, with <code>n</code> 4 and <code>r</code> red.</p>' },
    { do: 'over', line: 11, text: '<p><code>4 &lt;= 1</code> is false, so line 11 is next. It must call <code>fact(3)</code> before it can multiply.</p>' },
    { do: 'into', line: 8, check: 'n == 3', text: '<p>A second <code>fact()</code> frame, below the first. This <code>n</code> is 3. The first call\'s <code>n</code> is still 4: look at the frame above. The same name, two boxes.</p>' },
    { do: 'over', line: 11, text: '<p>Again not the base case, so this call too must wait on line 11 for a smaller one.</p>' },
    { do: 'into', line: 8, check: 'n == 2', text: '<p>The third frame: <code>n</code> is 2.</p>' },
    { do: 'over', line: 11, text: '<p>Still not the base case: one more call.</p>' },
    { do: 'into', line: 8, check: 'n == 1', show: 'vars', text: '<p>Four <code>fact()</code> frames plus <code>main</code>\'s. The <b>Variables</b> panel lists them under <b>Call stack</b>, newest first.</p><div class="try">Try it: click each <code>fact()</code> line in the call stack list in turn. The panel shows that call\'s <code>n</code>: 1, 2, 3, 4. Each older call is paused on line 11, waiting for an answer. Click the top one again before going on.</div>' },
    { do: 'over', line: 9, text: '<p><code>1 &lt;= 1</code> is true: this is the base case, and no further call is made.</p>' },
    { do: 'over', line: 11, check: 'n == 2', show: 'memory', text: '<p><code>fact(1)</code> returned 1 and its frame is gone. The debugger is back in the call where <code>n</code> is 2, on line 11, which can now finish: <code>2 * 1</code>.</p>' },
    { do: 'over', line: 12, check: 'r == 2', text: '<p><code>r</code> is 2 in this frame.</p>' },
    { do: 'out', line: 11, check: 'n == 3', text: '<p><b>Step out</b> returned 2 to the call where <code>n</code> is 3. It is about to work out <code>3 * 2</code>.</p>' },
    { do: 'out', line: 11, check: 'n == 4', text: '<p>Another step out: <code>fact(3)</code> returned 6, and the first call, with <code>n</code> 4, is about to work out <code>4 * 6</code>.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: '4! = 24', text: '<div class="note">Every call of a recursive function gets its own frame with its own parameters and locals. The calls go down until the base case, then the answers come back up, one frame at a time, in the reverse order.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'stack-overflow', unit: 'Functions and the stack', title: 'Stack overflow',
  blurb: 'Recursion without a base case makes frames until the stack runs out.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: 1 + 2 + ... + n, with the base case forgotten */
#include <stdio.h>

int sum_to(int n)
{
    int scratch[250];       /* 1000 bytes in every frame */

    /* missing: if (n == 0) return 0; */
    scratch[0] = n;
    return scratch[0] + sum_to(n - 1);
}

int main(void)
{
    int s;

    s = sum_to(3);
    printf("sum = %d\\n", s);
    return 0;
}
`,
  },
  intro: '<p><code>sum_to(3)</code> should be 3 + 2 + 1. But nothing in <code>sum_to</code> ever stops calling: after <code>sum_to(1)</code> comes <code>sum_to(0)</code>, then <code>sum_to(-1)</code>, and on and on.</p><p>Every call takes another frame, and the stack is only so big. Here each frame also holds an array of 250 <code>int</code>s, so each call uses about 1000 bytes of stack.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 17, text: '<p>Only <code>main</code>\'s frame so far.</p>' },
    { do: 'into', line: 9, check: 'n == 3', text: '<p>The first call: <code>n</code> is 3. The frame of <code>sum_to</code> is large, because <code>scratch</code> takes 1000 bytes of it. Look at the addresses: the frame head\'s <code>fp</code> is about 1000 below <code>main</code>\'s.</p>' },
    { do: 'into', times: 6, line: 9, check: 'n == 0', text: '<p>Three more calls: <code>n</code> is now 0, and four <code>sum_to()</code> frames sit below <code>main</code>\'s. This is where a base case should have stopped the calls.</p>' },
    { do: 'into', times: 4, line: 9, check: 'n == -2', text: '<p>But the calls go on into negative numbers. Each new frame is about 1000 bytes lower in memory than the one before.</p>' },
    { do: 'continue', state: 'faulted', line: 10, text: '<p>The program ran at full speed and See stopped it with a <b>Stack overflow</b>: about a thousand calls deep, the frames reached the end of the 1 MB set aside for the stack.</p><p>On a real system this usually ends with "Segmentation fault" and no further explanation.</p><div class="note">Every recursive function needs a base case that is certain to be reached. Here <code>if (n == 0) return 0;</code> on line 8 would fix it.</div><div class="try">Try it: replace the comment on line 8 with <code>if (n == 0) return 0;</code> and debug again.</div>' },
  ],
});
