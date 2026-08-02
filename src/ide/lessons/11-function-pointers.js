// Unit 11: function pointers.
SEE.Lessons.add({
  id: 'fn-address', unit: 'Function pointers', title: 'A function has an address',
  blurb: 'Functions live in the code segment, and their names stand for their addresses.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a function lives in memory too, in the code segment */
#include <stdio.h>

int square(int x)
{
    return x * x;
}

int cube(int x)
{
    return x * x * x;
}

int main(void)
{
    int local = 5;

    printf("square is at %p\\n", (void *)square);
    printf("cube   is at %p\\n", (void *)cube);
    printf("main   is at %p\\n", (void *)main);
    printf("local  is at %p\\n", (void *)&local);
    printf("square(local) = %d\\n", square(local));
    return 0;
}
`,
  },
  intro: '<p>When a program runs, its compiled instructions are in memory too, in the <b>code segment</b>. Every function starts at some address there.</p><p>In an expression, the name of a function on its own (without brackets after it) means that address, just as the name of an array means the address of its first element.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 16, text: '<p>Look at the bottom of the memory picture: the <b>code</b> area lists the functions of the program, <code>square</code>, <code>cube</code> and <code>main</code>, each with its starting address near <code>0x08048400</code>. That is far below the stack (near <code>0xbfffff00</code>) and below the heap.</p>' },
    { do: 'over', line: 18, check: 'local == 5', text: '<p><code>local</code> is in <code>main</code>\'s frame, on the stack, as usual.</p>' },
    { do: 'over', line: 19, show: 'term', output: 'square is at 0x', text: '<p><code>(void *)square</code> turned the function\'s address into a plain pointer so <code>%p</code> could print it. Compare it with the address shown for <code>square</code> in the code list.</p>' },
    { do: 'over', times: 2, line: 21, output: 'main   is at 0x', text: '<p><code>cube</code> comes after <code>square</code> and <code>main</code> after <code>cube</code>: the functions are laid out in the order they are written. The gaps are the sizes of their compiled code.</p>' },
    { do: 'over', line: 22, output: 'local  is at 0xbf', text: '<p>The address of a variable on the stack starts with <code>0xbf</code>; the functions are near <code>0x0804</code>. Code and data live in different parts of the same address space.</p>' },
    { do: 'into', line: 6, check: 'x == 5', text: '<p>A call <code>square(local)</code> means: make a frame, put the argument in it, and jump to the address of <code>square</code>. The frame is on the stack; the instructions being run are in the code segment.</p>' },
    { do: 'continue', state: 'exited', output: 'square(local) = 25', text: '<p>The program ended.</p><div class="note">Strictly, C89 does not promise that a function address fits in a <code>void *</code>; the cast is fine on this machine and on PCs, and it is the usual way to print one. The next lesson keeps function addresses in variables of their own proper type.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'fn-pointer-call', unit: 'Function pointers', title: 'Calling through a pointer',
  blurb: 'int (*op)(int, int) holds the address of add or mul, and op(6, 7) calls whichever it holds.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a variable that holds the address of a function */
#include <stdio.h>

int add(int a, int b)
{
    return a + b;
}

int mul(int a, int b)
{
    return a * b;
}

int main(void)
{
    int (*op)(int, int);     /* op: pointer to a function (int, int) returning int */
    int r;

    op = add;                /* the name of a function is its address */
    r = op(6, 7);
    printf("add: %d\\n", r);
    op = &mul;               /* the & is allowed but not needed */
    r = (*op)(6, 7);         /* so is the * when calling */
    printf("mul: %d\\n", r);
    return 0;
}
`,
  },
  intro: '<p>Line 16 reads from the name outwards: <code>op</code> is a pointer (<code>*op</code>) to a function taking <code>(int, int)</code> and returning <code>int</code>.</p><p>The brackets around <code>*op</code> matter. Without them, <code>int *op(int, int);</code> would declare a <i>function</i> called <code>op</code> that returns an <code>int *</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 19, text: '<p><code>op</code> is a 4-byte variable in <code>main</code>\'s frame, red for now. Like any pointer it will hold an address, but this one will be the address of code.</p>' },
    { do: 'over', line: 20, check: 'op == add', text: '<p><code>op = add;</code> stored the address of <code>add</code>. In the memory picture, <code>op</code>\'s arrow leaves the stack and points at <code>add</code> in the code list.</p>' },
    { do: 'into', line: 6, check: 'a == 6 && b == 7', text: '<p><b>Step into</b> on <code>op(6, 7)</code> landed in <code>add</code>: the call went wherever <code>op</code> pointed. A frame for <code>add</code> holds <code>a</code> = 6 and <code>b</code> = 7.</p>' },
    { do: { to: 21 }, line: 21, check: 'r == 13', text: '<p>Back in <code>main</code>, <code>r</code> is 13.</p>' },
    { do: 'over', line: 22, show: 'term', output: 'add: 13', text: '<p>The same line 20 would call a different function if <code>op</code> held a different address. That is the whole point of a function pointer: the choice of function is made at run time.</p>' },
    { do: 'over', line: 23, check: 'op == mul', text: '<p><code>op = &amp;mul;</code> means exactly the same as <code>op = mul;</code>. The arrow now points at <code>mul</code>.</p>' },
    { do: 'into', line: 11, check: 'a == 6 && b == 7', text: '<p>The same arguments, but now the call went to <code>mul</code>. <code>(*op)(6, 7)</code> and <code>op(6, 7)</code> are the same call; the older style with <code>*</code> reminds the reader that <code>op</code> is a pointer.</p>' },
    { do: 'continue', state: 'exited', output: 'mul: 42', text: '<p>6 &times; 7 = 42.</p><div class="try">Try it: start again, stop at line 20 and in the memory picture change <code>op</code> to the address shown for <code>mul</code>. Then step: <code>add:</code> will print 42.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'fn-table', unit: 'Function pointers', title: 'A table of functions',
  blurb: 'An array of function pointers turns a menu choice straight into a call.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: an array of function pointers as a menu */
#include <stdio.h>

void say_hello(void) { printf("hello\\n"); }
void say_time(void)  { printf("it is late\\n"); }
void say_bye(void)   { printf("goodbye\\n"); }

int main(void)
{
    void (*menu[3])(void);     /* menu: an array of 3 pointers to functions */
    int choice;

    menu[0] = say_hello;
    menu[1] = say_time;
    menu[2] = say_bye;
    printf("choose 0, 1 or 2: ");
    if (scanf("%d", &choice) == 1 && choice >= 0 && choice < 3)
        menu[choice]();        /* one line calls any of them */
    else
        printf("no such choice\\n");
    return 0;
}
`,
  },
  intro: '<p>Read line 10 from the name: <code>menu</code> is an array of 3 (<code>menu[3]</code>) pointers (<code>*</code>) to functions taking nothing and returning nothing (<code>void (...)(void)</code>).</p><p>Such an array is called a <b>dispatch table</b>. Instead of a long <code>if</code> or <code>switch</code>, the number chosen picks the function directly.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['menu'], line: 13, text: '<p><code>menu</code> is 12 bytes in <code>main</code>\'s frame: three 4-byte slots, all red.</p>' },
    { do: { to: 16 }, line: 16, check: 'menu[0] == say_hello && menu[1] == say_time && menu[2] == say_bye', text: '<p>Each slot now holds the address of one function. Three arrows go from the stack to the code list.</p>' },
    { do: 'over', line: 17, text: '<p>The prompt was printed. The next line reads a number.</p>' },
    { do: 'over', input: '1\n', line: 18, show: 'term', check: 'choice == 1', text: '<p>The answer typed was 1. It passed the range check: never index a table with a number you have not checked.</p>' },
    { do: 'into', line: 5, text: '<p><code>menu[choice]()</code> took slot 1, found the address of <code>say_time</code>, and called it. Step into landed on line 5.</p>' },
    { do: 'continue', state: 'exited', output: 'it is late', text: '<p>The program printed the message of the chosen function and ended.</p>' },
    { do: 'start', line: 13, text: '<p>Once more from the beginning, this time with a bad choice.</p>' },
    { do: { to: 17 }, line: 17, text: '<p>Stopped before the <code>scanf</code> again.</p>' },
    { do: 'over', input: '7\n', line: 20, check: 'choice == 7', text: '<p>7 is outside 0 to 2, so the <code>else</code> runs. Without the check, <code>menu[7]</code> would read past the array and call whatever address happened to be there.</p>' },
    { do: 'continue', state: 'exited', output: 'no such choice', text: '<p>The program ended.</p><div class="try">Try it: add a fourth function, make the array <code>menu[4]</code> and the check <code>choice &lt; 4</code>. The call on line 18 does not change at all.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'qsort-callback', unit: 'Function pointers', title: 'qsort and a callback',
  blurb: 'qsort sorts any array because you hand it a function that compares two elements.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: qsort calls your comparison function */
#include <stdio.h>
#include <stdlib.h>

int calls = 0;

int by_value(const void *a, const void *b)
{
    int x = *(const int *)a;   /* qsort passes the addresses of two elements */
    int y = *(const int *)b;
    calls++;
    if (x < y) return -1;      /* negative: x goes first */
    if (x > y) return 1;       /* positive: y goes first */
    return 0;
}

int main(void)
{
    int a[5] = { 42, 7, 19, 3, 25 };
    int i;

    qsort(a, 5, sizeof a[0], by_value);
    for (i = 0; i < 5; i++)
        printf("%d ", a[i]);
    printf("\\n%d comparisons\\n", calls);
    return 0;
}
`,
  },
  intro: '<p><code>qsort</code> from <code>&lt;stdlib.h&gt;</code> can sort an array of anything. It does not know your element type, so you give it the element size and a <b>comparison function</b>. It calls that function back each time it needs to know which of two elements comes first. Such a function is a <b>callback</b>.</p><p>The comparator gets two <code>const void *</code>: addresses of elements, type unknown. It must turn them back into <code>const int *</code> before reading.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['a'], line: 19, text: '<p><code>a</code> is five red ints in <code>main</code>\'s frame. <code>calls</code> is a global, already 0.</p>' },
    { do: 'over', line: 22, check: 'a[0] == 42 && a[4] == 25', text: '<p>The array holds 42, 7, 19, 3, 25. Line 22 passes <code>by_value</code> without brackets: its address, not a call.</p>' },
    { do: { to: 9 }, line: 9, check: 'calls == 0', text: '<p>Stepping into <code>qsort</code> would only show library code, which See hides. Instead, this step ran to line 9, inside the comparator, like a breakpoint.</p><p>Look at the stack: <code>main</code>, then <code>qsort</code>\'s frame (library code), then <code>by_value</code>. <code>qsort</code> called our function. <code>a</code> and <code>b</code> point into <code>main</code>\'s array.</p>' },
    { do: 'over', times: 2, line: 11, check: 'x == *(const int *)a && y == *(const int *)b', text: '<p><code>x</code> and <code>y</code> are copies of the two elements <code>qsort</code> asked about. Follow the arrows from <code>a</code> and <code>b</code> to see which elements they are.</p>' },
    { do: 'over', line: 12, check: 'calls == 1', text: '<p>The first comparison. The return value tells <code>qsort</code> the order: negative if <code>x</code> belongs first, positive if <code>y</code> does, zero if they are equal.</p>' },
    { do: { to: 9 }, line: 9, check: 'calls == 1', text: '<p><code>qsort</code> has called <code>by_value</code> again with another pair. Between calls it may have moved elements: watch <code>a</code> in <code>main</code>\'s frame change as you go.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: '3 7 19 25 42', text: '<p>Sorted, smallest first. The last line says how many times <code>qsort</code> needed to call the comparator.</p>' },
    { do: { edit: [12, '    if (x < y) return 1;       /* now bigger first */'] }, text: '<p>Line 12 changed: when <code>x &lt; y</code> the comparator now says "y goes first".</p>' },
    { do: { edit: [13, '    if (x > y) return -1;'] }, text: '<p>And line 13: when <code>x &gt; y</code>, "x goes first". The comparator now describes the reverse order.</p>' },
    { do: 'start', line: 19, text: '<p>The program was built again with the new comparator. <code>main</code> and <code>qsort</code> did not change at all.</p>' },
    { do: 'continue', state: 'exited', output: '42 25 19 7 3', text: '<p>Biggest first. The sorting algorithm is the same; only the callback changed.</p><div class="note">A common shortcut is <code>return x - y;</code>. It can overflow for very large or very negative ints, giving the wrong sign. The two comparisons used here are always safe.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'fn-typedef', unit: 'Function pointers', title: 'typedef and returning a function',
  blurb: 'typedef gives a function pointer type a short name, and a function can return one.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: typedef names a function pointer type; a function can return one */
#include <stdio.h>

typedef int (*binop)(int, int);   /* binop: pointer to a function (int, int) returning int */

int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }

binop pick(char sign)             /* returns a function pointer */
{
    if (sign == '-')
        return sub;
    return add;
}

/* the same function without the typedef:  int (*pick(char sign))(int, int) */

int main(void)
{
    binop f;
    int r;

    f = pick('-');
    r = f(10, 4);
    printf("10 - 4 = %d\\n", r);
    r = pick('+')(10, 4);          /* call the returned pointer at once */
    printf("10 + 4 = %d\\n", r);
    return 0;
}
`,
  },
  intro: '<p>Function pointer declarations get hard to read quickly. <code>typedef</code> on line 4 makes <code>binop</code> a name for the type "pointer to a function taking two ints and returning int". Write the declaration as if declaring a variable, put <code>typedef</code> in front, and the variable name becomes a type name.</p><p>With it, a function that <i>returns</i> such a pointer is easy to write (line 9). Line 16 shows the same declaration without the typedef.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 23, text: '<p><code>f</code> is a <code>binop</code>: a 4-byte function pointer in <code>main</code>\'s frame, not set yet.</p>' },
    { do: 'into', line: 11, check: "sign == '-'", text: '<p><code>pick</code> got the character <code>\'-\'</code>. It will decide which function to hand back.</p>' },
    { do: 'over', line: 12, text: '<p>The sign is <code>\'-\'</code>, so line 12 runs: <code>return sub;</code> returns the address of <code>sub</code>, not a call to it.</p>' },
    { do: { to: 24 }, line: 24, check: 'f == sub', text: '<p>Back in <code>main</code>, <code>f</code> holds the address of <code>sub</code>: its arrow points at <code>sub</code> in the code list.</p>' },
    { do: 'into', line: 7, check: 'a == 10 && b == 4', text: '<p>Calling <code>f(10, 4)</code> landed in <code>sub</code>.</p>' },
    { do: { to: 25 }, line: 25, check: 'r == 6', text: '<p>10 &minus; 4 = 6. The frame of <code>sub</code> is gone; <code>f</code> still points at it.</p>' },
    { do: 'over', line: 26, show: 'term', output: '10 - 4 = 6', text: '<p>Line 26 does both at once: <code>pick(\'+\')</code> returns a function pointer, and the <code>(10, 4)</code> after it calls that pointer.</p>' },
    { do: 'into', line: 11, check: "sign == '+'", text: '<p>The first call on line 26 is <code>pick</code>, with <code>\'+\'</code> this time.</p>' },
    { do: 'continue', state: 'exited', output: '10 + 4 = 14', text: '<p><code>pick</code> returned <code>add</code>, which was called straight away.</p><div class="try">Try it: delete the typedef and write <code>pick</code>\'s first line as on line 16, and <code>f</code> as <code>int (*f)(int, int);</code>. It still builds; compare how readable the two versions are.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'fn-in-struct', unit: 'Function pointers', title: 'A struct with function members',
  blurb: 'Each shape carries a pointer to its own area function: a tiny object.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a struct with a function pointer: a tiny object */
#include <stdio.h>

struct shape {
    const char *name;
    double w, h;
    double (*area)(const struct shape *s);   /* each shape knows how */
};

double rect_area(const struct shape *s) { return s->w * s->h; }
double tri_area(const struct shape *s)  { return s->w * s->h / 2; }

int main(void)
{
    struct shape shapes[2];
    int i;

    shapes[0].name = "rectangle";
    shapes[0].w = 4;
    shapes[0].h = 3;
    shapes[0].area = rect_area;
    shapes[1].name = "triangle";
    shapes[1].w = 4;
    shapes[1].h = 3;
    shapes[1].area = tri_area;
    for (i = 0; i < 2; i++)
        printf("%s: %.1f\\n", shapes[i].name, shapes[i].area(&shapes[i]));
    return 0;
}
`,
  },
  intro: '<p>A struct can hold function pointers next to its data. Then the data carries the code that works on it: <code>shapes[i].area(&amp;shapes[i])</code> calls the right area function for each shape without any <code>if</code>.</p><p>This is the idea behind objects and methods in languages like C++ and Java, written out by hand.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['shapes'], line: 18, text: '<p><code>shapes</code> is two structs. Each has a <code>name</code> pointer, two doubles and the function pointer <code>area</code>: 4 + 8 + 8 + 4 = 24 bytes of fields, but 32 in all, because each double must start at a multiple of 8, so 4 padding bytes follow <code>name</code> and 4 more end the struct.</p>' },
    { do: { to: 22 }, line: 22, check: 'shapes[0].area == rect_area && shapes[0].w == 4', text: '<p>The first shape is filled in. It has two arrows going out of the stack:</p><ul><li><code>name</code> to the string literal <code>"rectangle"</code> in read-only data,</li><li><code>area</code> to <code>rect_area</code> in the code list.</li></ul>' },
    { do: { to: 26 }, line: 26, check: 'shapes[1].area == tri_area', text: '<p>The second shape has the same sizes but its <code>area</code> arrow goes to <code>tri_area</code>.</p>' },
    { do: 'over', line: 27, check: 'i == 0', text: '<p>The loop body calls <code>shapes[i].area</code>, passing the address of the shape itself, so the function can read <code>w</code> and <code>h</code>.</p>' },
    { do: 'into', line: 10, check: 's->w == 4 && s->h == 3', text: '<p>For <code>i == 0</code> the call went to <code>rect_area</code>. Its <code>s</code> points back down at <code>shapes[0]</code> in <code>main</code>\'s frame. In C++ this hidden argument is called <code>this</code>.</p>' },
    { do: { to: 27 }, line: 27, show: 'term', output: 'rectangle: 12.0', check: 'i == 1', text: '<p>4 &times; 3 = 12 for the rectangle. Now <code>i</code> is 1.</p>' },
    { do: 'into', line: 11, check: 's->w == 4 && s->h == 3', text: '<p>The same line 27, the same expression, but this time it reached <code>tri_area</code>, because that is what <code>shapes[1].area</code> holds.</p>' },
    { do: 'continue', state: 'exited', output: 'triangle: 6.0', text: '<p>Half of 4 &times; 3 is 6.</p><div class="try">Try it: start again, run to line 26 and change <code>shapes[1].area</code> in the memory picture to the address of <code>rect_area</code>. The triangle will then report 12.0.</div>' },
  ],
});
