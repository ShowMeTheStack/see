// Unit 13: where things live.
SEE.Lessons.add({
  id: 'memory-map', unit: 'Where things live', title: 'The map of memory',
  blurb: 'Code, read-only data, .data, .bss, heap and stack: one variable in each, and their addresses.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: one thing in each part of memory */
#include <stdio.h>
#include <stdlib.h>

const int days = 7;                    /* read-only data */
int score = 50;                        /* .data: has a starting value */
int lives;                             /* .bss: no starting value, so zero */

int main(void)
{
    int local = 1;                     /* stack: in main's frame */
    const char *word = "map";          /* word on the stack, "map" in read-only data */
    int *box = malloc(sizeof(int));    /* box on the stack, the block on the heap */

    *box = 99;
    printf("read-only  %p %p\\n", (void *)&days, (void *)word);
    printf("data       %p\\n", (void *)&score);
    printf("bss        %p\\n", (void *)&lives);
    printf("heap       %p\\n", (void *)box);
    printf("stack      %p\\n", (void *)&local);
    free(box);
    return 0;
}
`,
  },
  intro: '<p>A running program\'s memory is split into areas, each for one kind of thing. From low addresses to high:</p><ul><li><b>text</b>: the machine code of the functions</li><li><b>read-only data</b>: string literals and <code>const</code> globals</li><li><b>.data</b>: globals with a starting value</li><li><b>.bss</b>: globals without one, which start as zero</li><li><b>heap</b>: blocks from <code>malloc</code>, growing up</li><li><b>stack</b>: one frame per function call, near the top, growing down</li></ul>',
  steps: [
    { do: 'start', show: 'memory', line: 11, check: 'score == 50 && lives == 0 && days == 7', text: '<p>Read the memory picture from top to bottom. The <b>stack</b> holds <code>main</code>\'s frame with <code>local</code>, <code>word</code> and <code>box</code>, at addresses near <code>0xbfffff00</code>, still red.</p><p>Below it is the box <b>Globals and statics</b> with <code>score</code> (in .data) and <code>lives</code> (in .bss): point at a row to see which area it is in. Lower again is <b>read-only data</b> with <code>days</code>, which has a padlock. All of these are at addresses starting <code>0x0804</code>. They already have their values: globals are ready before <code>main</code> starts.</p>' },
    { do: 'over', line: 12, check: 'local == 1', text: '<p><code>local</code> is set. The stack is at the top of the address space; the program\'s own areas are far below, around <code>0x08048000</code>, where a 32-bit Linux program is loaded.</p>' },
    { do: 'over', line: 13, check: "word[0] == 'm'", text: '<p><code>word</code> is a pointer on the stack. Follow its arrow down to the read-only data area: the four bytes <code>m a p \\0</code> were put there by the compiler, next to <code>days</code>, and they never move.</p>' },
    { do: 'over', line: 15, check: 'box != 0', text: '<p><code>malloc</code> gave a block on the <b>heap</b>, which starts just above the globals, near <code>0x0804a000</code>. The pointer <code>box</code> is in <code>main</code>\'s frame; the block it points at is not in any frame.</p>' },
    { do: 'over', line: 16, check: '*box == 99', text: '<p>The block holds 99 now. So the four variables here live in four different places: <code>days</code> in read-only data, <code>score</code> in .data, <code>lives</code> in .bss, the block in the heap; and <code>local</code>, <code>word</code> and <code>box</code> on the stack.</p>' },
    { do: { to: 21 }, line: 21, show: 'term', output: 'stack      0xbf', text: '<p>The printed addresses go up from read-only data to .data, .bss and the heap, and then jump to the stack at <code>0xbf...</code>. The gap between the heap and the stack is free space that both can grow into.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The Build log (in the panel at the bottom) lists the areas the linker made, with their start and end addresses and sizes.</p><div class="try">Try it: open the <b>Run</b> menu and choose <b>Show what the linker made</b>. It lists every function and global with its address and area, the C library\'s ones too.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'data-bss', unit: 'Where things live', title: 'Globals in .data and .bss',
  blurb: 'A global with a starting value is stored in the program file; one without is just zeros.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: globals with and without a starting value */
#include <stdio.h>

int primes[4] = { 2, 3, 5, 7 };   /* .data: these 16 bytes are stored in the program */
double rate = 0.5;                /* .data */
int big[1000];                    /* .bss: only the size is stored; it starts as zeros */
int hits;                         /* .bss too */

int main(void)
{
    int i;
    int sum = 0;

    for (i = 0; i < 4; i++)
        sum += primes[i];
    big[999] = sum;
    hits++;
    printf("sum %d, big[0] %d, big[999] %d, hits %d\\n", sum, big[0], big[999], hits);
    return 0;
}
`,
  },
  intro: '<p>A global that has a starting value, like <code>int primes[4] = { 2, 3, 5, 7 };</code>, goes in the <b>.data</b> area. Its bytes are written into the program file, and loading the program copies them into memory.</p><p>A global without one goes in <b>.bss</b>. C promises it starts as zero, so the file only needs to say how big .bss is: 4000 bytes of zeros take no room in the file.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 12, expand: ['primes'], check: 'primes[3] == 7 && hits == 0 && big[0] == 0', text: '<p><code>main</code> has not run a single line, yet <code>primes</code> already holds 2, 3, 5, 7 and <code>rate</code> holds 0.5. <code>big</code> and <code>hits</code> are 0.</p><p>None of the globals are red. Only <code>i</code> and <code>sum</code> in <code>main</code>\'s frame are: a local gets no starting value, a global always does.</p>' },
    { do: 'over', bytes: 'primes', text: '<p>The bytes view shows the 16 bytes of <code>primes</code>: <code>02 00 00 00</code>, <code>03 00 00 00</code> and so on. The lowest byte of each int comes first (little-endian). These are the bytes that were stored in the program file.</p>' },
    { do: { to: 16 }, line: 16, check: 'sum == 17', text: '<p>The loop added the four primes: 17. Reading a global is no different from reading a local; only where it lives differs.</p>' },
    { do: 'over', line: 17, check: 'big[999] == 17', text: '<p><code>big[999]</code> is the last of a thousand ints, 3996 bytes after <code>big[0]</code>. Every other element is still 0.</p>' },
    { do: 'over', line: 18, check: 'hits == 1', text: '<p><code>hits++</code> worked from a known 0. For a local that would be a bug; for a global, starting at zero is guaranteed.</p>' },
    { do: 'over', show: 'term', output: 'sum 17, big[0] 0, big[999] 17, hits 1', text: '<p>The output shows the zeros C promised.</p>' },
    { do: 'continue', state: 'exited', text: '<p>In the Build log, compare the sizes of .data and .bss: .bss is the bigger one because of <code>big</code>, but only .data has to be stored byte by byte.</p><div class="note"><code>int x = 0;</code> at file level usually goes to .bss too: its starting value is zero anyway.</div><div class="try">Try it: change line 6 to <code>int big[1000] = { 1 };</code> and build. Now <code>big</code> has a starting value and moves to .data, which grows by 4000 bytes.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'static-local-storage', unit: 'Where things live', title: 'static locals live with the globals',
  blurb: 'A static local is made once, before main, and keeps its value between calls.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a static local lives with the globals, not in the frame */
#include <stdio.h>

int total = 0;                 /* a global, to compare with */

int ticket(void)
{
    static int next = 100;     /* made once, before main; keeps its value */
    int copy = 0;              /* made again in every call's frame */

    next++;
    copy++;
    total++;
    return next;
}

int main(void)
{
    int a, b, c;

    a = ticket();
    b = ticket();
    c = ticket();
    printf("%d %d %d, total %d\\n", a, b, c, total);
    return 0;
}
`,
  },
  intro: '<p>A variable declared inside a function with <code>static</code> can only be <b>named</b> inside that function, like any local. But it is <b>stored</b> like a global: in .data or .bss, made once before <code>main</code> starts, and never removed.</p><p>Its <code>= 100</code> is a starting value, not a line that runs at every call.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 21, check: 'total == 0', text: '<p>Look at the box <b>Globals and statics</b> in the memory picture: next to <code>total</code> there is <code>ticket.next</code>, the static local of <code>ticket</code>, already 100. <code>ticket</code> has not been called yet, but its static local exists.</p>' },
    { do: 'into', line: 9, check: 'next == 100', text: '<p>Inside <code>ticket</code>. Its frame on the stack holds only <code>copy</code>, in red. <code>next</code> is not in the frame: it stays down with the globals.</p><p>The debugger did not stop on line 8. There is nothing to run there: the 100 was put in place when the program was loaded.</p>' },
    { do: 'over', times: 3, line: 13, check: 'next == 101 && copy == 1', text: '<p>Both went up by one: <code>next</code> to 101, <code>copy</code> from 0 to 1.</p>' },
    { do: 'out', line: 21, text: '<p>Back in <code>main</code>. The frame of <code>ticket</code> is gone, and with it <code>copy</code>. <code>next</code> is still there with 101.</p>' },
    { do: 'over', line: 22, check: 'a == 101', text: '<p><code>a</code> got 101, the value <code>ticket</code> returned. Now the second call.</p>' },
    { do: 'into', line: 9, check: 'next == 101', text: '<p>The second call. A new frame, probably at the same address as last time, and a <code>copy</code> that is red again: it is a brand new variable.</p><p><code>next</code> is still 101. Line 8 does not set it back to 100.</p>' },
    { do: { to: 14 }, line: 14, check: 'next == 102 && copy == 1', text: '<p><code>next</code> is 102, but <code>copy</code> is only 1 again: it started from 0 in this call, as in every call.</p>' },
    { do: 'out', line: 22, text: '<p>Back in <code>main</code>, where <code>b</code> is about to get 102.</p>' },
    { do: { to: 24 }, line: 24, check: 'c == 103 && total == 3', text: '<p>The third call gave 103. <code>next</code> counts calls just like the global <code>total</code> does; the difference is only who can see the name. No other function can write <code>next</code>.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: '101 102 103, total 3', text: '<p>Use a static local when a function needs to remember something between calls, and nothing else should touch it.</p><div class="try">Try it: remove <code>static</code> from line 8 and run again. Every call now makes a new <code>next</code> with 100, and every ticket is 101.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'read-only-data', unit: 'Where things live', title: 'String literals and const globals',
  blurb: 'Literals and const globals sit in read-only data; a char array made from a literal is a copy you may change.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: what lives in read-only data */
#include <stdio.h>

const int max_users = 3;           /* const global: read-only data */
const char banner[] = "WELCOME";   /* const array: read-only data */
char title[] = "draft";            /* not const: .data, so it can change */

int main(void)
{
    const char *p = "hello";       /* p on the stack, "hello" in read-only data */
    char local[] = "hello";        /* a copy of the letters, on the stack */
    char *bad = (char *)"oops";    /* the cast hides the danger */

    local[0] = 'J';
    title[0] = 'D';
    printf("%s %s %s %s %d\\n", p, local, title, banner, max_users);
    bad[0] = 'O';                  /* a write to read-only data */
    return 0;
}
`,
  },
  intro: '<p>A string literal like <code>"hello"</code> is an array of chars that the compiler places in <b>read-only data</b>. So are globals declared <code>const</code>. The program can read them, but a write there makes the program crash.</p><p>A <code>char</code> array initialised from a literal is different: it is a separate copy of the letters, wherever the array lives.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 10, text: '<p>Down in read-only data are <code>max_users</code> and <code>banner</code>, with padlocks. <code>title</code> is in .data with no padlock: the same kind of letters, but not const.</p><p>The literals <code>"hello"</code> and <code>"oops"</code> are in read-only data already too: the compiler put them there.</p>' },
    { do: { to: 14 }, line: 14, expand: ['local'], check: "p[0] == 'h' && local[0] == 'h'", text: '<p>Two "hello"s now. <code>p</code> is a 4-byte pointer whose arrow goes down to the literal in read-only data. <code>local</code> is 6 bytes inside <code>main</code>\'s frame: line 11 copied the letters and the NUL into it.</p>' },
    { bytes: 'local', line: 14, text: '<p>The bytes view shows <code>local</code>: <code>68 65 6c 6c 6f 00</code>, which is h, e, l, l, o and the NUL. The same bytes as the literal, but at a stack address.</p>' },
    { do: 'over', line: 15, check: "local[0] == 'J' && p[0] == 'h'", text: '<p><code>local</code> is "Jello" now. The literal that <code>p</code> points at is untouched: they were never the same memory.</p>' },
    { do: 'over', line: 16, check: "title[0] == 'D'", text: '<p><code>title</code> is a global in .data and not const, so it can change: "Draft".</p>' },
    { do: 'over', line: 17, show: 'term', output: 'hello Jello Draft WELCOME 3', text: '<p>All five printed. Line 17 is the mistake: <code>bad</code> points at the literal "oops", and the cast on line 12 told the compiler to forget that it was <code>const</code>.</p>' },
    { do: 'over', state: 'faulted', text: '<p>The program crashed: a <b>write to read-only memory</b>. The compiler let it through because of the cast, but the memory itself refuses the write. On a real system this is a segmentation fault too.</p><div class="note">Point a <code>const char *</code> at a literal. If you need to change the letters, copy them into a <code>char</code> array first, as line 11 does.</div><div class="try">Try it: take the cast <code>(char *)</code> out of line 12 and build. There is still no warning: for historical reasons a literal\'s type in C is plain <code>char[]</code>, not <code>const char[]</code>, so nothing stops <code>char *</code> pointing at it. Only <code>const</code> on your pointers protects you.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'stack-and-heap-growth', unit: 'Where things live', title: 'The stack grows down, the heap grows up',
  blurb: 'Each new frame sits below the last; each new malloc block above the last.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: the stack grows down, the heap grows up */
#include <stdio.h>
#include <stdlib.h>

void dive(int depth)
{
    int here = depth;              /* one of these in every frame */

    printf("depth %d: here is at %p\\n", depth, (void *)&here);
    if (depth < 3)
        dive(depth + 1);
}

int main(void)
{
    char *a;
    char *b;
    char *c;

    a = malloc(16);
    b = malloc(16);
    c = malloc(16);
    printf("heap: %p %p %p\\n", (void *)a, (void *)b, (void *)c);
    dive(1);
    free(a);
    free(b);
    free(c);
    return 0;
}
`,
  },
  intro: '<p>The heap and the stack share the big empty space between the globals and the top of memory. The heap starts low and grows <b>up</b>, towards higher addresses. The stack starts at the top and grows <b>down</b>.</p><p>This program makes three heap blocks, then calls a function that calls itself, and prints the addresses as it goes.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 20, text: '<p><code>main</code>\'s frame holds three pointers, red for now. The heap is empty.</p>' },
    { do: 'over', times: 3, line: 23, check: 'a < b && b < c', text: '<p>Three blocks in the heap. Each one is at a higher address than the one before: the heap grows up.</p><p>They are a little more than 16 bytes apart: <code>malloc</code> keeps a small header in front of each block to remember its size.</p>' },
    { do: 'over', line: 24, show: 'term', output: 'heap: 0x804a', text: '<p>The addresses start near <code>0x0804a000</code>, just above the globals.</p>' },
    { do: 'into', line: 7, check: 'depth == 1', show: 'memory', text: '<p>A frame for <code>dive</code> appears <b>below</b> <code>main</code>\'s frame: at lower addresses.</p>' },
    { do: { to: 7 }, line: 7, check: 'depth == 2', text: '<p><code>dive</code> called itself. A second <code>dive</code> frame, lower again, with its own <code>depth</code> and its own <code>here</code>. The first one is still there above it, waiting at line 11.</p>' },
    { do: { to: 7 }, line: 7, check: 'depth == 3', text: '<p>Three <code>dive</code> frames, each below the last. Each call needs the same number of bytes, so the frames are evenly spaced.</p>' },
    { do: 'over', times: 2, line: 10, show: 'term', output: 'depth 3: here is at 0xbf', check: 'here == 3', text: '<p>Compare the three addresses printed for <code>here</code>: each is smaller than the one before. The stack grows down.</p><p>This call will not call again: <code>depth < 3</code> is false.</p>' },
    { do: 'out', times: 3, line: 24, text: '<p>Three steps out: the frames are removed bottom first, the reverse of the order they were made, and we are back in <code>main</code>.</p>' },
    { do: { to: 28 }, line: 28, check: 'a != 0', text: '<p>The three blocks are freed (hatched in the picture). The pointers still hold the old addresses; the blocks are just no longer the program\'s to use.</p>' },
    { do: 'continue', state: 'exited', text: '<p>If the stack and heap ever met, the program would be out of memory. In practice the stack is limited to a fixed size, and very deep recursion runs out first: that is a <b>stack overflow</b>.</p><div class="try">Try it: change the 3 on line 10 to 30 and debug again. Watch the stack fill downwards.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'frame-layout', unit: 'Where things live', title: 'Inside a stack frame',
  blurb: 'Arguments above, then the return address and saved frame pointer, then the locals below.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: what one call puts on the stack */
#include <stdio.h>

int add(int a, int b)
{
    int sum;
    int twice;

    sum = a + b;
    twice = sum * 2;
    return twice;
}

int main(void)
{
    int r;

    r = add(0x11, 0x22);
    printf("%d\\n", r);
    return 0;
}
`,
  },
  intro: '<p>A call to a function builds its frame in four parts, from high addresses to low:</p><ul><li>the <b>arguments</b>, pushed by the caller</li><li>the <b>return address</b>: where in the caller to carry on afterwards</li><li>the caller\'s <b>saved frame pointer</b>, so its frame can be found again</li><li>the <b>locals</b> of the new function</li></ul><p>This lesson looks at those bytes one by one. The arguments are written in hex, 0x11 and 0x22, so they are easy to spot.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 18, text: '<p>Only <code>main</code>\'s frame so far, with <code>r</code>.</p>' },
    { do: 'into', line: 9, check: 'a == 0x11 && b == 0x22', text: '<p>The call built <code>add</code>\'s frame. In the memory picture it shows the parameters <code>a</code> and <code>b</code>, the two locals, and between them the frame\'s links.</p><p>The locals are red: nothing has been stored in them.</p>' },
    { bytes: 'twice', line: 9, check: '&b == &a + 1', text: '<p>The bytes view starts at <code>twice</code>, the lowest address in the frame, and goes up 4 bytes at a time:</p><ul><li><code>twice</code>, then <code>sum</code>: the locals, still junk</li><li>the <b>saved frame pointer</b>: an address near <code>0xbfff...</code>, where <code>main</code>\'s frame is</li><li>the <b>return address</b>: an address near <code>0x0804...</code>, a place inside <code>main</code>\'s code</li><li><code>a</code> = <code>11 00 00 00</code>, then <code>b</code> = <code>22 00 00 00</code></li></ul>' },
    { line: 9, check: '(char *)&a - (char *)&sum == 12', text: '<p><code>a</code> is 12 bytes above <code>sum</code>: 4 for <code>sum</code> itself, then 4 for the saved frame pointer and 4 for the return address.</p><p>The arguments are the caller\'s writing, and the locals are the function\'s; the two links in between are what the call and the function\'s first instructions put there.</p>' },
    { do: 'over', line: 10, check: 'sum == 0x33', text: '<p><code>sum</code> is 0x33, which is 51. In the bytes view its 4 bytes turned yellow: <code>33 00 00 00</code>.</p>' },
    { do: 'over', line: 11, check: 'twice == 0x66', text: '<p><code>twice</code> is 0x66, which is 102: <code>66 00 00 00</code> at the lowest address of the frame.</p>' },
    { do: 'out', line: 18, text: '<p>The return read the saved frame pointer to find <code>main</code>\'s frame again, and the return address to know where in <code>main</code> to carry on. Then the whole frame was given back: those bytes belong to no one now.</p>' },
    { do: 'over', line: 19, check: 'r == 102', text: '<p>The result, 102, has been stored in <code>r</code>.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: '102', text: '<div class="note">A write past the end of a local array runs <b>upwards</b>, into the saved frame pointer and then the return address. That is why such a bug can make a function "return" somewhere strange. The unit on bugs comes back to this.</div><div class="try">Try it: debug again, step into <code>add</code> and change <code>a</code> in the memory picture. Watch its 4 bytes change in the bytes view.</div>' },
  ],
});
