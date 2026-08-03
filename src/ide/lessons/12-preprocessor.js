// Unit 12: the preprocessor and many files.
SEE.Lessons.add({
  id: 'macros', unit: 'The preprocessor and many files', title: '#define and macro arguments',
  blurb: 'A macro is pasted in as text, so a SQUARE without parentheses gives the wrong answer.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a macro is text pasted in before the compiler sees the code */
#include <stdio.h>

#define SIZE 4
#define SQUARE(x) x * x               /* wrong: no parentheses */
#define GOOD_SQUARE(x) ((x) * (x))    /* right: around x and around it all */

int main(void)
{
    int sq[SIZE];
    int i;
    int bad;
    int good;

    for (i = 0; i < SIZE; i++)
        sq[i] = GOOD_SQUARE(i);
    bad = SQUARE(i + 1);
    good = GOOD_SQUARE(i + 1);
    printf("SQUARE(i + 1) = %d\\n", bad);
    printf("GOOD_SQUARE(i + 1) = %d\\n", good);
    printf("36 / SQUARE(3) = %d\\n", 36 / SQUARE(3));
    printf("36 / GOOD_SQUARE(3) = %d\\n", 36 / GOOD_SQUARE(3));
    return 0;
}
`,
  },
  intro: '<p>Before the compiler reads a single line, the <b>preprocessor</b> runs over the file. It handles every line that starts with <code>#</code>: it pastes in header files and replaces each <b>macro</b> name with the text it was defined as.</p><p>The preprocessor knows nothing about C: it swaps text for text. This lesson shows why that matters for a macro that takes an argument.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 15, expand: ['sq'], text: '<p>Line 10 says <code>int sq[SIZE];</code>, but the compiler never saw the word <code>SIZE</code>. The preprocessor replaced it with <code>4</code> first, so the compiler read <code>int sq[4];</code>. The memory picture shows four red <code>int</code>s.</p><p>A macro has no type, no address and no place in memory. Look for <code>SIZE</code> in the memory picture: it is not there.</p>' },
    { do: { to: 17 }, line: 17, check: 'i == 4 && sq[3] == 9', text: '<p>The loop filled <code>sq</code> with 0, 1, 4, 9 using <code>GOOD_SQUARE(i)</code>, which the preprocessor turned into <code>((i) * (i))</code> each time round.</p><p><code>i</code> is now 4, so on line 17 we expect <code>SQUARE(i + 1)</code> to be 5 times 5, which is 25.</p>' },
    { do: 'over', check: 'bad == 9', text: '<p><code>bad</code> is 9, not 25. The preprocessor put <code>i + 1</code> in place of each <code>x</code>, word for word:</p><p><code>SQUARE(i + 1)</code> became <code>i + 1 * i + 1</code>. Multiplication binds tighter than addition, so C worked out <code>i + (1 * i) + 1</code>, which is 4 + 4 + 1.</p>' },
    { do: 'over', check: 'good == 25', text: '<p><code>GOOD_SQUARE(i + 1)</code> became <code>((i + 1) * (i + 1))</code>. The parentheses around each <code>x</code> keep the argument together, so the answer is 25.</p><div class="note">Put parentheses around every use of a macro argument, and around the whole body.</div>' },
    { do: 'over', show: 'term', output: 'SQUARE(i + 1) = 9', text: '<p>The terminal shows the wrong answer the program computed. The compiler gave no warning: after the text was pasted in, <code>i + 1 * i + 1</code> is perfectly good C.</p>' },
    { do: 'over', line: 21, output: 'GOOD_SQUARE(i + 1) = 25', text: '<p>The good macro printed 25.</p><p>Line 21 shows the other half of the rule. <code>36 / SQUARE(3)</code> becomes <code>36 / 3 * 3</code>. Division and multiplication have the same rank and go left to right, so that is <code>(36 / 3) * 3</code>, which is 36, not 4.</p>' },
    { do: 'over', output: '36 / SQUARE(3) = 36', text: '<p>36, as predicted. The parentheses around each <code>x</code> are not enough on their own: the whole body also needs parentheses, so that nothing outside the macro can split it.</p>' },
    { do: 'over', output: '36 / GOOD_SQUARE(3) = 4', text: '<p><code>36 / ((3) * (3))</code> is 4. <code>GOOD_SQUARE</code> is right in both cases.</p><div class="try">Try it: open the <b>Run</b> menu and choose <b>Show the preprocessed file</b>. It shows the code exactly as the compiler gets it, with every macro replaced.</div>' },
    { do: { edit: [5, '#define SQUARE(x) ((x) * (x))       /* fixed */'] }, text: '<p>This step changed line 5 in the editor so that <code>SQUARE</code> has the parentheses too. The next step builds the program again and runs it.</p>' },
    { do: 'start', line: 15, text: '<p>A new build: the preprocessor ran again with the new line 5, so every use of <code>SQUARE</code> now gets the parentheses.</p>' },
    { do: 'continue', state: 'exited', output: 'SQUARE(i + 1) = 25', show: 'term', text: '<p>Now both macros give 25 and 4.</p><div class="note">A macro argument that has a side effect is still a trap: <code>GOOD_SQUARE(i++)</code> becomes <code>((i++) * (i++))</code> and changes <code>i</code> twice. A function does not have that problem.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'conditional-compilation', unit: 'The preprocessor and many files', title: '#if and #ifdef',
  blurb: 'Lines the preprocessor leaves out are never compiled: switch code on and off with one #define.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: the preprocessor decides which lines the compiler sees */
#include <stdio.h>

#define DEBUG 1
#define VERSION 2

int main(void)
{
    int sum = 0;
    int i;

    for (i = 1; i <= 4; i++) {
        sum += i;
#ifdef DEBUG
        printf("debug: i = %d, sum = %d\\n", i, sum);
#endif
    }
#if VERSION >= 2
    printf("version 2: the sum is %d\\n", sum);
#else
    printf("version 1: %d\\n", sum);
#endif
    return 0;
}
`,
  },
  intro: '<p><code>#ifdef NAME</code> keeps the lines up to <code>#endif</code> only when <code>NAME</code> is defined. <code>#if</code> works out a whole-number expression and keeps its lines when it is not 0; <code>#else</code> gives the other choice.</p><p>Lines that are left out are removed before the compiler reads the file. They are not skipped at run time: they are simply not in the program.</p>',
  steps: [
    { do: 'start', line: 9, text: '<p><code>DEBUG</code> is defined on line 4 and <code>VERSION</code> is 2, so the compiler got lines 15 and 19 but never saw line 21.</p><p>Line 21 is not even checked for mistakes: you could write anything there and the build would still succeed.</p>' },
    { do: { to: 15 }, line: 15, check: 'i == 1 && sum == 1', text: '<p>The debugger can stop on line 15 because that line is part of the program. The <code>#ifdef</code> and <code>#endif</code> lines themselves leave nothing behind.</p>' },
    { do: 'over', show: 'term', output: 'debug: i = 1, sum = 1', text: '<p>The debug line printed. This is a common use of <code>#ifdef</code>: extra printing while you work on a program, which you can switch off with one line.</p>' },
    { do: 'continue', state: 'exited', output: 'version 2: the sum is 10', text: '<p>Four debug lines, then the version 2 message. The <code>#if VERSION >= 2</code> on line 18 was worked out by the preprocessor, before the program ever ran.</p>' },
    { do: { edit: [4, '#define DEBUG 0'] }, text: '<p>This step changed line 4 to <code>#define DEBUG 0</code>. Does that switch the debug lines off?</p>' },
    { do: 'run', show: 'term', state: 'exited', output: 'debug: i = 4, sum = 10', text: '<p>No: the debug lines are still printed. <code>#ifdef DEBUG</code> only asks whether <code>DEBUG</code> is defined at all, and it is, as 0.</p><p>To test the value you would write <code>#if DEBUG</code>. To switch an <code>#ifdef</code> off, remove the <code>#define</code>.</p>' },
    { do: { edit: [4, '/* #define DEBUG 1 */'] }, text: '<p>Line 4 is now a comment, so <code>DEBUG</code> is not defined at all.</p>' },
    { do: { edit: [5, '#define VERSION 1'] }, text: '<p>And line 5 now sets <code>VERSION</code> to 1, so <code>#if VERSION >= 2</code> is false and the <code>#else</code> part, line 21, is the one kept.</p>' },
    { do: 'start', line: 9, text: '<p>The program was built again from the changed lines.</p>' },
    { do: 'over', times: 3, line: 12, check: 'i == 1 && sum == 1', text: '<p>Three steps: line 9, line 12, line 13, and back to line 12 for the next turn of the loop. The debugger never stopped on line 15: it is no longer in the program.</p>' },
    { do: { to: 21 }, line: 21, check: 'sum == 10', text: '<p>Run to line 21: the version 1 line is the one that is compiled now, and line 19 is the one that is gone.</p>' },
    { do: 'continue', state: 'exited', output: 'version 1: 10', text: '<p>The same source file made a different program.</p><div class="try">Try it: put <code>#if 0</code> above a few lines and <code>#endif</code> below them. It is a quick way to switch off code, and unlike <code>/* */</code> it still works when the lines already contain comments.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'two-files', unit: 'The preprocessor and many files', title: 'A program in two .c files',
  blurb: 'main.c calls functions that live in stats.c; stats.h tells main.c what they look like.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: uses the functions of stats.c through stats.h */
#include <stdio.h>
#include "stats.h"

int main(void)
{
    int marks[5] = { 7, 9, 4, 10, 8 };
    int total;
    double mean;

    total = sum(marks, 5);
    mean = average(marks, 5);
    printf("total %d, average %.1f\\n", total, mean);
    return 0;
}
`,
    'stats.h': `/* stats.h: what stats.c offers, for any file that wants to use it */
int sum(const int *a, int n);
double average(const int *a, int n);
`,
    'stats.c': `/* stats.c: the code behind stats.h */
#include "stats.h"

int sum(const int *a, int n)
{
    int i;
    int s = 0;

    for (i = 0; i < n; i++)
        s += a[i];
    return s;
}

double average(const int *a, int n)
{
    return (double)sum(a, n) / n;
}
`,
  },
  intro: '<p>A bigger program is split into several <code>.c</code> files. Each one is compiled on its own into an <b>object file</b>, and then the <b>linker</b> joins the object files into one program, connecting each call to the function it names.</p><p>See builds <b>every <code>.c</code> file in the folder</b> together. The Build log shows the command: <code>cc -std=c89 main.c stats.c</code>. A <code>.h</code> file is never compiled on its own: it is pasted into the <code>.c</code> files that <code>#include</code> it.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 7, text: '<p>Look at the tabs: <code>main.c</code>, <code>stats.h</code> and <code>stats.c</code>. When main.c was compiled, line 3 pasted in stats.h, so the compiler knew that <code>sum</code> takes a pointer and an int and gives back an int, though the code of <code>sum</code> was in another file.</p><p>In the memory picture, the code area lists <code>main</code>, <code>sum</code> and <code>average</code> together: the linker put both files into one program.</p>' },
    { do: 'over', times: 1, line: 11, check: 'marks[4] == 8', text: '<p>The array is filled. Now line 11 calls <code>sum</code>, whose code is in stats.c.</p>' },
    { do: 'into', line: 7, check: 'n == 5', text: '<p><b>Step into</b> (F11) went across to <b>stats.c</b>: the editor opened it, and the yellow line is line 7 there. A new frame for <code>sum</code> sits on the stack below <code>main</code>\'s.</p><p>Files make no difference at run time: a call is a call, and the arrow from <code>a</code> still goes to <code>marks</code> in <code>main</code>\'s frame.</p>' },
    { do: 'out', line: 11, text: '<p><b>Step out</b> (Shift+F11) finished <code>sum</code> and came back to line 11 of main.c, with the result on its way to <code>total</code>.</p>' },
    { do: 'over', line: 12, check: 'total == 38', text: '<p><code>total</code> is 38: 7 + 9 + 4 + 10 + 8.</p>' },
    { do: 'into', line: 16, check: 'n == 5', text: '<p>Into <code>average</code>, also in stats.c. It calls <code>sum</code> again: functions in the same file can call each other, and stats.c includes its own header too, so the compiler checks that the code matches the declarations.</p>' },
    { do: 'into', line: 7, text: '<p>Now there are three frames: <code>main</code>, then <code>average</code>, then <code>sum</code> at the bottom. The call stack does not care which file each function came from.</p>' },
    { do: 'out', times: 2, line: 12, text: '<p>Two steps out: back through <code>average</code> to line 12 of <code>main</code>.</p>' },
    { do: 'over', line: 13, check: 'mean > 7.5 && mean < 7.7', text: '<p><code>mean</code> is 7.6. The cast to <code>double</code> on line 16 of stats.c made the division keep its fraction.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: 'total 38, average 7.6', text: '<p>One program, built from two files.</p><div class="note">The header holds <b>declarations</b> (what a function looks like); one .c file holds the <b>definition</b> (its code). Every file that uses the function includes the header.</div><div class="try">Try it: delete the <code>#include "stats.h"</code> line in main.c and build (Ctrl+B). The compiler no longer knows what <code>sum</code> is when it reaches line 11.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'extern-static', unit: 'The preprocessor and many files', title: 'extern and static',
  blurb: 'One definition, many declarations: what the linker says when there are two, or none.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: uses count through the extern declaration in counter.h */
#include <stdio.h>
#include "counter.h"

static int steps = 100;    /* a different steps: static names stay in their file */

int main(void)
{
    bump();
    bump();
    printf("count %d, steps here %d\\n", count, steps);
    return 0;
}
`,
    'counter.h': `/* counter.h: declarations only, no memory is made here */
extern int count;          /* count exists, in some .c file */
void bump(void);
`,
    'counter.c': `/* counter.c: the one definition of count */
#include "counter.h"

int count = 0;             /* the definition: memory for count is made here */
static int steps = 0;      /* static: private to this file */

void bump(void)
{
    steps++;
    count += 10;
}
`,
  },
  intro: '<p>A <b>definition</b> makes the variable: it gets memory. A <b>declaration</b> with <code>extern</code> only says "this variable exists somewhere; here is its type". A program may declare a global many times but must define it exactly once.</p><p><code>static</code> on a global does the opposite of sharing: the name is private to its own .c file, and the linker never sees it.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 9, check: 'count == 0 && steps == 100', text: '<p>Look at the globals in the memory picture. There is one <code>count</code>, and there are <b>two</b> variables called <code>steps</code>, each with its own address: one from main.c with 100, one from counter.c with 0.</p><p>Each <code>static</code> name belongs to its own file, so the two never clash.</p>' },
    { do: 'over', times: 2, line: 11, check: 'count == 20 && steps == 100', text: '<p>Two calls to <code>bump</code> added 10 to <code>count</code> each time. main.c reads the same <code>count</code>: its <code>extern</code> declaration in counter.h pointed it at the one definition in counter.c.</p><p>The <code>steps</code> that main.c sees is still 100. <code>bump</code> changed the other one.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: 'count 20, steps here 100', text: '<p>This is the usual pattern: the <code>extern</code> declaration in the header, the definition in exactly one .c file.</p><p>The next steps break each half of that rule and show what the linker says.</p>' },
    { do: { edit: [6, 'int count = 5;             /* a second definition of count */'] }, text: '<p>This step wrote a new line 6 in <b>main.c</b>: <code>int count = 5;</code>. With a starting value and no <code>extern</code>, that is a definition, and counter.c already has one.</p>' },
    { do: 'build', show: 'probs', errors: "multiple definition of 'count'", text: '<p>Each file compiled without complaint: inside main.c, the <code>extern</code> declaration from the header and the definition on line 6 agree. But the <b>linker</b> found two variables called <code>count</code>, one from main.c and one from counter.c. It cannot know which one each use means, so it stops: <i>multiple definition of \'count\'</i>.</p><div class="note">The same happens when a header defines a variable instead of declaring it, since every file that includes the header gets a copy. A header should only declare.</div>' },
    { do: { edit: [6, ''] }, text: '<p>Line 6 of main.c is empty again, so counter.c holds the only definition.</p>' },
    { do: { edit: [4, '/* int count = 0; */'], file: 'counter.c' }, text: '<p>Now the other mistake: line 4 of <b>counter.c</b>, the one definition, is turned into a comment. Every file still declares <code>count</code>, but no file makes it.</p>' },
    { do: 'build', show: 'probs', errors: "undefined reference to 'count'", text: '<p>Again the files compile: a declaration is all the compiler needs to write code that uses <code>count</code>. But when the linker tries to connect those uses to a real variable, there is none: <i>undefined reference to \'count\'</i>.</p><p>The same message comes when a function is declared and called but never written.</p>' },
    { do: { edit: [4, 'int count = 0;             /* the definition: memory for count is made here */'], file: 'counter.c' }, text: '<p>Line 4 of counter.c is the definition again.</p>' },
    { do: 'start', line: 9, check: 'count == 0', text: '<p>The program builds and links: one definition of <code>count</code>, and declarations wherever it is used.</p>' },
    { do: 'continue', state: 'exited', output: 'count 20, steps here 100', text: '<p>Back to the working program.</p><div class="try">Try it: remove <code>static</code> from line 5 of main.c <b>and</b> from line 5 of counter.c, then build. Now both files define a global <code>steps</code> that the linker can see, and you get <i>multiple definition of \'steps\'</i>. Take either <code>static</code> away alone and it still builds: a static name is invisible to the other file.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'include-guards', unit: 'The preprocessor and many files', title: 'Include guards',
  blurb: 'A header included twice defines its struct twice; #ifndef around it makes the second copy empty.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: gets point.h twice, once directly and once through shapes.h */
#include <stdio.h>
#include "point.h"
#include "shapes.h"

int main(void)
{
    struct point p;
    struct rect r;

    p.x = 2;
    p.y = 3;
    r.corner = p;
    r.w = 10;
    r.h = 4;
    printf("corner (%d,%d), %d by %d\\n", r.corner.x, r.corner.y, r.w, r.h);
    return 0;
}
`,
    'point.h': `/* point.h: a type that several files need */
/* #ifndef POINT_H */
/* #define POINT_H */

struct point {
    int x;
    int y;
};

/* #endif */
`,
    'shapes.h': `/* shapes.h: needs struct point, so it includes point.h itself */
#ifndef SHAPES_H
#define SHAPES_H
#include "point.h"

struct rect {
    struct point corner;
    int w;
    int h;
};

#endif
`,
  },
  intro: '<p>A header often includes other headers. Then one .c file can end up with the same header pasted in twice, and anything the header <b>defines</b>, like a <code>struct</code>, is defined twice.</p><p>The cure is an <b>include guard</b>: three preprocessor lines around the whole header. This lesson starts by building, to see the problem first.</p>',
  steps: [
    { do: 'build', show: 'probs', errors: "redefinition of 'struct point'", text: '<p>The build fails with <i>redefinition of \'struct point\'</i>. main.c includes <code>point.h</code> on line 3, then <code>shapes.h</code> on line 4, and shapes.h includes point.h again. After the preprocessor, main.c contains <code>struct point { ... };</code> twice, and C allows a struct to be defined only once in a file.</p><p>The guard lines in point.h are there, but they are commented out.</p>' },
    { do: { edit: [2, '#ifndef POINT_H'], file: 'point.h' }, text: '<p>Line 2 of point.h: <code>#ifndef POINT_H</code> keeps everything up to <code>#endif</code> only if <code>POINT_H</code> is not defined yet.</p>' },
    { do: { edit: [3, '#define POINT_H'], file: 'point.h' }, text: '<p>Line 3: the first time through, the header defines <code>POINT_H</code>. The name is a made-up one, usually the file name in capitals; it only has to be different for each header.</p>' },
    { do: { edit: [10, '#endif'], file: 'point.h' }, text: '<p>Line 10 closes the guard. Now the second time point.h is pasted in, <code>POINT_H</code> is already defined, and the whole body is left out. shapes.h already had the same three lines.</p>' },
    { do: 'start', show: 'memory', line: 11, text: '<p>It builds. main.c still includes point.h twice, but the second copy is empty, so <code>struct point</code> is defined once.</p><p>In the memory picture, <code>p</code> is 8 bytes (two ints) and <code>r</code> is 16: a whole <code>struct point</code> inside it, then <code>w</code> and <code>h</code>.</p>', expand: ['p', 'r'] },
    { do: 'over', times: 2, line: 13, check: 'p.x == 2 && p.y == 3', text: '<p><code>p</code> is (2, 3): <code>x</code> at the lower address, <code>y</code> 4 bytes above it, in the order the struct declares them.</p>' },
    { do: 'over', line: 14, check: 'r.corner.x == 2 && r.corner.y == 3', text: '<p><code>r.corner = p;</code> copied all 8 bytes of <code>p</code> into the start of <code>r</code>. Structs of the same type can be assigned as a whole.</p>' },
    { do: 'over', times: 2, line: 16, check: 'r.w == 10 && r.h == 4', text: '<p>The rest of <code>r</code> is filled in.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: 'corner (2,3), 10 by 4', text: '<p>Every header you write should have a guard, even one that seems too small to need it: you cannot know who will include it, or how many times.</p><div class="try">Try it: open the <b>Run</b> menu and choose <b>Show the preprocessed file</b> while main.c is open. You can see where each header was pasted in, and that point.h appears only once.</div>' },
  ],
});
