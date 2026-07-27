// Unit 5: pointers.
SEE.Lessons.add({
  id: 'ptr-address', unit: 'Pointers', title: '& and *: a pointer holds an address',
  blurb: 'A pointer is a variable whose value is an address; * follows the arrow.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a pointer holds an address */
#include <stdio.h>

int main(void)
{
    int n = 42;
    int *p;            /* p can hold the address of an int */

    p = &n;            /* & gives the address of n */
    printf("n is %d, and lives at %p\\n", n, (void *)&n);
    printf("p holds %p, and *p is %d\\n", (void *)p, *p);
    printf("sizeof n = %u, sizeof p = %u\\n", (unsigned)sizeof n, (unsigned)sizeof p);
    return 0;
}
`,
  },
  intro: '<p>Every variable lives at an <b>address</b>, a number that says where its bytes are in memory. A <b>pointer</b> is a variable that holds such a number.</p><ul><li><code>&amp;n</code> means "the address of <code>n</code>".</li><li><code>*p</code> means "the thing at the address in <code>p</code>": follow the pointer.</li></ul><p>In a declaration, <code>int *p;</code> reads "<code>*p</code> is an int", so <code>p</code> is a pointer to an int.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p><code>main</code>\'s frame has two boxes: <code>n</code> and <code>p</code>. Both are 4 bytes and both are red. Point at <code>n</code> to read its address, a number near <code>0xbfffff70</code>.</p>' },
    { do: 'over', line: 9, check: 'n == 42', text: '<p><code>n</code> holds 42. <code>p</code> is still red: an unset pointer holds a random address, and following it would be a serious bug.</p>' },
    { do: 'over', line: 10, check: 'p == &n && *p == 42', watch: ['&n', 'p', '*p'], text: '<p><code>p = &amp;n;</code> stored the address of <code>n</code> in <code>p</code>. In the memory picture <code>p</code> now has an <b>arrow</b> that ends at <code>n</code>. The arrow is just a drawing of the number inside <code>p</code>.</p><p>In the watch panel, <code>&amp;n</code> and <code>p</code> are the same number, and <code>*p</code> is 42: the int found at that address.</p>' },
    { do: 'over', times: 2, show: 'term', line: 12, output: 'and *p is 42', text: '<p>Both lines printed the same address: once as <code>&amp;n</code>, once as the value of <code>p</code>. <code>%p</code> prints a pointer; it wants a <code>void *</code>, hence the casts.</p>' },
    { do: 'over', output: 'sizeof n = 4, sizeof p = 4', text: '<p>On this machine a pointer is 4 bytes, the same as an int. That is a coincidence of this machine: on most 64-bit computers today a pointer is 8 bytes. A pointer to <code>char</code> or to a huge struct is the same size: it only holds an address.</p>' },
    { do: { set: ['n', '7'] }, check: '*p == 7', text: '<p>This step changed <code>n</code> to 7. The watch panel shows <code>*p</code> as 7 too, without touching <code>p</code>: <code>*p</code> is not a copy of <code>n</code>, it <i>is</i> <code>n</code>, reached by its address.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="note"><code>&amp;</code> and <code>*</code> undo each other: <code>*&amp;n</code> is <code>n</code>, and <code>&amp;*p</code> is <code>p</code>.</div><div class="try">Try it: add <code>*p</code> or <code>*&amp;n</code> to the watch panel and step through again.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-write-through', unit: 'Pointers', title: 'Changing a variable through a pointer',
  blurb: '*p = value stores into whatever variable p points at.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: change a variable through a pointer */
#include <stdio.h>

int main(void)
{
    int score = 10;
    int bonus = 0;
    int *p = &score;

    *p = 25;           /* store 25 where p points: into score */
    *p = *p + 5;       /* read score through p, add 5, store it back */
    p = &bonus;        /* now point somewhere else */
    *p = 7;            /* this changes bonus, not score */
    printf("score = %d, bonus = %d\\n", score, bonus);
    return 0;
}
`,
  },
  intro: '<p><code>*p</code> can stand on the left of <code>=</code>. Then it does not read the int at the address, it writes there. Which variable changes depends on where <code>p</code> points at that moment.</p><p>Keep two things apart: changing <code>p</code> (where the arrow goes) and changing <code>*p</code> (what is at the end of the arrow).</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>Three variables in <code>main</code>\'s frame, all red for now.</p>' },
    { do: { to: 10 }, line: 10, check: 'p == &score', text: '<p><code>int *p = &amp;score;</code> declared <code>p</code> and gave it the address of <code>score</code> straight away. Follow the arrow from <code>p</code>: it ends at <code>score</code>.</p>' },
    { do: 'over', line: 11, check: 'score == 25', text: '<p><code>*p = 25;</code> wrote 25 into <code>score</code>. Look at what turned yellow: <code>score</code>, not <code>p</code>. The pointer itself did not change.</p>' },
    { do: 'over', line: 12, check: 'score == 30', text: '<p><code>*p = *p + 5;</code> read 25 through the pointer, added 5, and wrote 30 back. It is exactly <code>score = score + 5;</code> said another way.</p>' },
    { do: 'over', line: 13, check: 'p == &bonus && score == 30', text: '<p><code>p = &amp;bonus;</code> has no star, so it changes the pointer: now <code>p</code> is yellow and its arrow has moved to <code>bonus</code>. <code>score</code> keeps its 30.</p>' },
    { do: 'over', line: 14, check: 'bonus == 7 && score == 30', text: '<p>The same kind of line as before, <code>*p = 7;</code>, but this time it changed <code>bonus</code>, because that is where the arrow goes now.</p><div class="try">Try it: press F8 to step back, click <code>p</code> in the memory picture and type the address of <code>score</code> (point at <code>score</code> to read it). Step again and <code>score</code> becomes 7.</div>' },
    { do: 'continue', show: 'term', state: 'exited', output: 'score = 30, bonus = 7', text: '<p>The program printed both values and ended.</p><div class="note"><code>p = ...</code> changes where the pointer points. <code>*p = ...</code> changes the variable it points at.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-swap', unit: 'Pointers', title: 'Swap with pointers',
  blurb: 'Why swap(x, y) cannot work in C, and why swap(&x, &y) can.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: swap needs the addresses of the variables */
#include <stdio.h>

void swap_copies(int a, int b)   /* gets copies: changes are lost */
{
    int t = a;
    a = b;
    b = t;
}

void swap(int *a, int *b)        /* gets addresses: changes stick */
{
    int t = *a;
    *a = *b;
    *b = t;
}

int main(void)
{
    int x = 1, y = 2;

    swap_copies(x, y);
    printf("after swap_copies: x = %d, y = %d\\n", x, y);
    swap(&x, &y);
    printf("after swap: x = %d, y = %d\\n", x, y);
    return 0;
}
`,
  },
  intro: '<p>C passes arguments <b>by value</b>: a function receives copies of the values, in its own frame. Whatever it does to those copies stays in its frame and vanishes when it returns.</p><p>To let a function change the caller\'s variables, give it their addresses.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 20, text: '<p><code>main</code>\'s frame holds <code>x</code> and <code>y</code>.</p>' },
    { do: 'over', line: 22, check: 'x == 1 && y == 2', text: '<p><code>x</code> is 1 and <code>y</code> is 2.</p>' },
    { do: 'into', line: 6, check: 'a == 1 && b == 2', text: '<p>Inside <code>swap_copies</code>. Its frame sits above <code>main</code>\'s and has its own <code>a</code> and <code>b</code>: copies of 1 and 2. No arrows lead back to <code>main</code>.</p>' },
    { do: { to: 9 }, line: 9, check: 'a == 2 && b == 1', text: '<p>The swap worked, but on the copies: <code>a</code> is 2 and <code>b</code> is 1 in this frame. <code>main</code>\'s <code>x</code> and <code>y</code> below have not changed.</p>' },
    { do: { to: 24 }, show: 'term', line: 24, output: 'after swap_copies: x = 1, y = 2', text: '<p>The frame of <code>swap_copies</code> is gone, and the swapped copies with it. <code>x</code> and <code>y</code> are unchanged.</p>' },
    { do: 'into', show: 'memory', line: 13, check: '*a == 1 && *b == 2', text: '<p>Inside <code>swap</code>. This frame also has an <code>a</code> and a <code>b</code>, but they hold <b>addresses</b>: two arrows go down into <code>main</code>\'s frame, one to <code>x</code> and one to <code>y</code>.</p><p>The pointers are copies too, but a copy of an address still leads to the same place.</p>' },
    { do: 'over', line: 14, check: 't == 1', text: '<p><code>t = *a;</code> followed the first arrow and saved <code>x</code>\'s value, 1, in <code>t</code>.</p>' },
    { do: 'over', line: 15, check: '*a == 2', text: '<p><code>*a = *b;</code> read <code>y</code> through <code>b</code> and wrote it into <code>x</code> through <code>a</code>. Look down at <code>main</code>\'s frame: <code>x</code> is yellow and now 2.</p>' },
    { do: 'over', line: 16, check: '*b == 1', text: '<p><code>*b = t;</code> put the saved 1 into <code>y</code>. Both of <code>main</code>\'s variables have changed, though <code>swap</code> never named them.</p>' },
    { do: 'out', line: 24, text: '<p>Back in <code>main</code>. The frame of <code>swap</code> is gone, and this time the change stays, because it was made in <code>main</code>\'s own memory.</p>' },
    { do: 'over', times: 2, line: 26, check: 'x == 2 && y == 1', show: 'term', output: 'after swap: x = 2, y = 1', text: '<p><code>x</code> is 2 and <code>y</code> is 1.</p><div class="note">This is why <code>scanf("%d", &amp;n)</code> needs the <code>&amp;</code>: <code>scanf</code> has to store into your variable, so it needs its address.</div>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: change line 24 to <code>swap(&amp;x, &amp;x);</code>. Both pointers lead to <code>x</code>; step through and watch what happens.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-arith', unit: 'Pointers', title: 'Pointer arithmetic',
  blurb: 'p + 1 moves by the size of what p points at: 4 for int, 1 for char, more for a struct.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: p + 1 moves by the size of what p points at */
#include <stdio.h>

struct point { int x; int y; int z; };   /* 12 bytes */

int main(void)
{
    int nums[3] = { 10, 20, 30 };
    char text[4] = "abc";
    struct point pts[2];
    int *ip = nums;
    char *cp = text;
    struct point *sp = pts;

    ip = ip + 1;
    cp = cp + 1;
    sp = sp + 1;
    printf("int moved %d bytes, char %d, struct point %d\\n",
           (int)((char *)ip - (char *)nums), (int)(cp - text), (int)((char *)sp - (char *)pts));
    printf("*ip = %d, *cp = %c\\n", *ip, *cp);
    return 0;
}
`,
  },
  intro: '<p>Adding 1 to a pointer does not add 1 to the address. It moves the pointer to the <b>next element</b> of the type it points at. For an <code>int *</code> the address goes up by 4, for a <code>char *</code> by 1, for a pointer to a 12-byte struct by 12.</p><p>That is what makes pointers useful for walking along arrays.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 8, text: '<p>Three arrays of different element types and a pointer of the matching type for each.</p>' },
    { do: { to: 15 }, line: 15, expand: ['nums', 'text'], check: 'ip == &nums[0] && cp == &text[0] && sp == &pts[0]', watch: ['ip', 'cp', 'sp'], text: '<p>Each pointer starts at element 0 of its array: an array name used as a value is the address of its first element. Follow the three arrows.</p><p>The watch panel shows the three addresses as numbers. Note them.</p>' },
    { do: 'over', line: 16, check: 'ip == &nums[1] && *ip == 20', text: '<p><code>ip + 1</code>: the address in <code>ip</code> went up by 4, the size of an <code>int</code>. Its arrow now ends at <code>nums[1]</code>.</p>' },
    { do: 'over', line: 17, check: "cp == &text[1] && *cp == 'b'", text: '<p><code>cp + 1</code>: up by 1, the size of a <code>char</code>. It points at <code>text[1]</code>, the letter <code>b</code>.</p>' },
    { do: 'over', line: 18, check: 'sp == &pts[1]', text: '<p><code>sp + 1</code>: up by 12, the size of <code>struct point</code>, to <code>pts[1]</code>. The same <code>+ 1</code> on three lines moved three different distances.</p><div class="note">The rule: <code>p + n</code> is the address in <code>p</code> plus <code>n * sizeof *p</code>. The compiler multiplies for you.</div>' },
    { do: 'over', show: 'term', line: 20, output: 'int moved 4 bytes, char 1, struct point 12', text: '<p>To measure in bytes, the program turned both pointers into <code>char *</code> before subtracting, because the difference of two <code>char *</code> counts single bytes.</p>' },
    { do: 'over', output: '*ip = 20, *cp = b', text: '<p>Following the moved pointers gives the second element of each array.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: add a <code>double d;</code> member to <code>struct point</code> and debug again. <code>sp + 1</code> moves further, by the new <code>sizeof(struct point)</code>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-and-arrays', unit: 'Pointers', title: 'Pointers and arrays',
  blurb: 'a[i] is defined as *(a + i), so p[i] works on pointers and even i[a] works.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a[i] is just *(a + i) */
#include <stdio.h>

int main(void)
{
    int a[4] = { 5, 6, 7, 8 };
    int *p = a;          /* the same as p = &a[0] */
    int i = 2;

    printf("a[i] = %d, *(a + i) = %d\\n", a[i], *(a + i));
    printf("p[i] = %d, *(p + i) = %d\\n", p[i], *(p + i));
    printf("i[a] = %d (odd, but legal)\\n", i[a]);
    p++;                 /* a pointer can move; an array name cannot */
    printf("now p[0] = %d and p[-1] = %d\\n", p[0], p[-1]);
    /* a++;  error: an array is not a variable you can change */
    printf("sizeof a = %u, sizeof p = %u\\n", (unsigned)sizeof a, (unsigned)sizeof p);
    return 0;
}
`,
  },
  intro: '<p>The C standard defines the square brackets in terms of pointers: <code>E1[E2]</code> means <code>*((E1) + (E2))</code>. When <code>a</code> is an array, it first decays to the address of <code>a[0]</code>, then pointer arithmetic moves <code>i</code> elements along, then <code>*</code> follows.</p><p>So brackets work just as well on a pointer, and since addition does not care about order, <code>i[a]</code> is <code>*(i + a)</code>, the same element.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['a'], line: 6, text: '<p>An array of four ints, a pointer, and an index.</p>' },
    { do: { to: 10 }, line: 10, check: 'p == &a[0] && i == 2', watch: ['a + i', '*(a + i)', 'p + i'], text: '<p><code>p</code> points at <code>a[0]</code>. In the watch panel, <code>a + i</code> and <code>p + i</code> are the same address, 8 bytes past the start, and <code>*(a + i)</code> is 7.</p>' },
    { do: 'over', show: 'term', line: 11, output: 'a[i] = 7, *(a + i) = 7', text: '<p>Both spellings reached <code>a[2]</code>. The compiler turns the first into the second.</p>' },
    { do: 'over', line: 12, output: 'p[i] = 7, *(p + i) = 7', text: '<p>With the pointer it is the same: <code>p[i]</code> works because <code>p</code> holds the address of <code>a[0]</code>.</p>' },
    { do: 'over', line: 13, output: 'i[a] = 7', text: '<p><code>i[a]</code> is <code>*(i + a)</code>, which is <code>*(a + i)</code>. Nobody writes it in real code, but it proves the brackets are only arithmetic.</p>' },
    { do: 'over', show: 'memory', line: 14, check: 'p == &a[1] && p[-1] == 5', text: '<p><code>p++</code> moved the pointer one int along. Its arrow now ends at <code>a[1]</code>, so <code>p[0]</code> is <code>a[1]</code>, and <code>p[-1]</code>, one element back, is <code>a[0]</code>. A negative index is fine as long as it stays inside the array.</p>' },
    { do: 'over', show: 'term', line: 16, output: 'now p[0] = 6 and p[-1] = 5', text: '<p>The printed values agree with the memory picture: 6 and 5.</p>' },
    { do: 'over', output: 'sizeof a = 16, sizeof p = 4', text: '<p>Here the two differ. <code>a</code> is the array: 16 bytes. <code>p</code> is one pointer: 4 bytes. An array is not a pointer; it only turns into one when used as a value.</p>' },
    { do: { edit: [15, '    a++;'] }, text: '<p>Line 15 had a commented-out <code>a++;</code>. This step made it real code.</p>' },
    { do: 'build', show: 'probs', errors: 'array type', text: '<p>The build fails: <i>assignment to expression with array type</i>. The name <code>a</code> is the array itself, fixed in place in the frame. There is nothing to move. <code>p</code> is a separate variable holding an address, so it can.</p>' },
    { do: { edit: [15, '    /* a++;  error: an array is not a variable you can change */'] }, text: '<p>Line 15 is back to a comment.</p><div class="note">Two different things share the bracket notation: an array, which owns its elements, and a pointer, which only knows where some elements are.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-to-ptr', unit: 'Pointers', title: 'Pointer to pointer',
  blurb: 'int **pp holds the address of an int *: two arrows to follow.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a pointer to a pointer */
#include <stdio.h>

void aim(int **where, int *target)
{
    *where = target;     /* changes the caller's pointer */
}

int main(void)
{
    int a = 1, b = 2;
    int *p = &a;
    int **pp = &p;       /* pp holds the address of p */

    **pp = 10;           /* follow two arrows: changes a */
    *pp = &b;            /* follow one arrow: changes p */
    **pp = 20;           /* now this changes b */
    aim(&p, &a);
    printf("a = %d, b = %d, *p = %d\\n", a, b, *p);
    return 0;
}
`,
  },
  intro: '<p>A pointer is a variable, so it has an address too, and that address can be kept in another pointer. <code>int **pp</code> reads "<code>**pp</code> is an int": <code>pp</code> points at an <code>int *</code>, which points at an int.</p><p><code>*pp</code> follows one arrow and gives the <code>int *</code>; <code>**pp</code> follows both and gives the int.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 11, text: '<p><code>main</code>\'s frame: two ints, one pointer to int, one pointer to pointer to int.</p>' },
    { do: { to: 15 }, line: 15, check: 'p == &a && pp == &p && **pp == 1', watch: ['pp', '*pp', '**pp'], text: '<p>Now there is a chain of <b>two arrows</b>: from <code>pp</code> to <code>p</code>, and from <code>p</code> to <code>a</code>.</p><p>In the watch panel: <code>pp</code> is the address of <code>p</code>; <code>*pp</code> is what <code>p</code> holds, the address of <code>a</code>; <code>**pp</code> is <code>a</code>\'s value, 1.</p>' },
    { do: 'over', line: 16, check: 'a == 10', text: '<p><code>**pp = 10;</code> followed both arrows and stored into <code>a</code>. Neither pointer changed.</p>' },
    { do: 'over', line: 17, check: 'p == &b', text: '<p><code>*pp = &amp;b;</code> followed only the first arrow and stored there, into <code>p</code>. <code>p</code> is yellow and its arrow swung over to <code>b</code>; <code>pp</code> still points at <code>p</code>.</p>' },
    { do: 'over', line: 18, check: 'b == 20 && a == 10', text: '<p>The same statement as line 15 now lands in <code>b</code>, because the second arrow moved.</p>' },
    { do: 'into', line: 6, check: '**where == 20', text: '<p>The main use of <code>**</code>: letting a function change the caller\'s <b>pointer</b>. <code>aim</code>\'s frame holds <code>where</code>, an arrow down to <code>main</code>\'s <code>p</code>, and <code>target</code>, an arrow to <code>main</code>\'s <code>a</code>.</p>' },
    { do: 'over', line: 7, check: '*where == target', text: '<p><code>*where = target;</code> wrote the address of <code>a</code> into <code>main</code>\'s <code>p</code>. Look down: <code>p</code>\'s arrow points at <code>a</code> again.</p><div class="note">To change an int in the caller, pass an <code>int *</code>. To change an <code>int *</code> in the caller, pass an <code>int **</code>. One more star each time.</div>' },
    { do: 'out', line: 18, text: '<p>Back in <code>main</code> at the end of the call on line 18.</p>' },
    { do: 'continue', show: 'term', state: 'exited', output: 'a = 10, b = 20, *p = 10', text: '<p><code>p</code> was redirected by <code>aim</code>, so <code>*p</code> is <code>a</code>, 10.</p><div class="try">Try it: change line 18 to <code>aim(pp, &amp;b);</code>. <code>pp</code> already holds <code>&amp;p</code>, so it does the same job.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-difference', unit: 'Pointers', title: 'Pointer difference and comparison',
  blurb: 'Subtracting two pointers counts elements; < and > tell which comes first.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: subtracting and comparing pointers */
#include <stdio.h>
#include <stddef.h>

int main(void)
{
    int a[6] = { 3, 9, 4, 7, 1, 8 };
    int *first = &a[0];
    int *last = &a[5];
    int *end = a + 6;        /* one past the end: may be computed, not read */
    int *best = first;
    int *p;
    ptrdiff_t n;

    n = last - first;        /* counts elements, not bytes */
    printf("last - first = %d elements\\n", (int)n);
    printf("in bytes: %d\\n", (int)((char *)last - (char *)first));
    for (p = first; p < end; p++) {   /* is p still inside the array? */
        if (*p > *best)
            best = p;
    }
    printf("largest is %d, at index %d\\n", *best, (int)(best - first));
    return 0;
}
`,
  },
  intro: '<p>Two pointers into the same array can be subtracted. The answer is the number of <b>elements</b> between them, not bytes: the compiler divides the byte distance by the element size. Its type is <code>ptrdiff_t</code>, from <code>&lt;stddef.h&gt;</code>.</p><p>They can also be compared with <code>&lt;</code>, <code>&gt;</code>, <code>==</code>: the one with the lower address comes earlier in the array. Both only make sense for pointers into the same array (or one past its end).</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['a'], line: 7, text: '<p>An array of six ints and four pointers into it.</p>' },
    { do: { to: 15 }, line: 15, check: 'last == &a[5] && end == &a[0] + 6', text: '<p>Follow the arrows: <code>first</code> and <code>best</code> to <code>a[0]</code>, <code>last</code> to <code>a[5]</code>. <code>end</code> points just past <code>a[5]</code>, at the guard after the array. Computing that address is allowed and useful; reading <code>*end</code> would be the error from the Arrays unit.</p>' },
    { do: 'over', line: 16, check: 'n == 5', text: '<p><code>n</code> is 5: there are five steps of one int from <code>a[0]</code> to <code>a[5]</code>.</p>' },
    { do: 'over', times: 2, show: 'term', line: 18, output: 'in bytes: 20', text: '<p>The byte distance is 20, five ints of 4 bytes. Converting to <code>char *</code> first makes each step one byte.</p>' },
    { do: { to: 19 }, line: 19, check: 'p == first', text: '<p>The loop walks with a pointer instead of an index. <code>p &lt; end</code> asks "is <code>p</code> still before the end?". Each <code>p++</code> moves one int.</p>' },
    { do: { to: 22 }, show: 'memory', line: 22, check: 'p == end && best == &a[1]', text: '<p>The loop is over: <code>p</code> equals <code>end</code>, so <code>p &lt; end</code> became false. <code>best</code> was moved each time <code>*p</code> was larger than <code>*best</code>; its arrow ends at <code>a[1]</code>, the 9.</p>' },
    { do: 'over', show: 'term', output: 'largest is 9, at index 1', text: '<p><code>best - first</code> turned the pointer back into an index: 1.</p><div class="note">Pointer + int gives a pointer. Pointer - pointer gives an int (a count of elements). Pointer + pointer is not allowed: it means nothing.</div>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: set <code>a[4]</code> to 50 in the memory picture just after Start, and step to the end. <code>best - first</code> becomes 4.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-null', unit: 'Pointers', title: 'NULL',
  blurb: 'NULL means "points at nothing". Following it stops the program.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: NULL, the pointer to nothing */
#include <stdio.h>
#include <stdlib.h>

int *find(int *a, int n, int want)
{
    int i;
    for (i = 0; i < n; i++)
        if (a[i] == want)
            return &a[i];
    return NULL;             /* not found: point at nothing */
}

int main(void)
{
    int a[3] = { 4, 8, 15 };
    int *hit;

    hit = find(a, 3, 8);
    if (hit != NULL)
        printf("found %d at index %d\\n", *hit, (int)(hit - a));
    hit = find(a, 3, 16);
    printf("searching for 16...\\n");
    printf("found %d\\n", *hit);   /* no check: hit may be NULL */
    return 0;
}
`,
  },
  intro: '<p><code>NULL</code> is a pointer value that points at no object. Functions return it to say "nothing": not found, no memory, end of list. It is address 0, and the first page of memory is never mapped, so following a NULL pointer crashes the program at once.</p><p>Every pointer that might be NULL must be tested before <code>*</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 16, text: '<p><code>main</code> has an array and a pointer <code>hit</code>.</p>' },
    { do: { to: 20 }, line: 20, check: 'hit == &a[1]', text: '<p><code>find</code> found 8 and returned the address of <code>a[1]</code>. <code>hit</code>\'s arrow ends there.</p>' },
    { do: 'over', times: 2, show: 'term', line: 22, output: 'found 8 at index 1', text: '<p>The test on line 20 passed, so line 21 followed the pointer safely.</p>' },
    { do: 'into', show: 'memory', line: 8, text: '<p>Inside <code>find</code> again, looking for 16. <code>a</code> in this frame is a pointer to <code>main</code>\'s array.</p>' },
    { do: { to: 11 }, line: 11, check: 'i == 3', text: '<p>The loop checked all three elements and found no 16. Line 11 will return <code>NULL</code>.</p>' },
    { do: 'out', line: 22, text: '<p>Back in <code>main</code>, with the result about to be stored.</p>' },
    { do: 'over', line: 23, check: 'hit == 0', text: '<p><code>hit</code> is now <code>0x00000000</code>, NULL. The memory picture draws no arrow from it: there is nothing to point at.</p>' },
    { do: 'over', line: 24, text: '<p>Line 24 is about to do <code>*hit</code> without checking.</p>' },
    { do: 'over', state: 'faulted', text: '<p>The program stopped with a <b>segmentation fault</b>: <i>NULL pointer dereference</i>. A real computer does the same: address 0 belongs to no one, and the operating system ends the program.</p><p>Note what did not happen: <code>printf</code> printed nothing for this line. The crash came while working out its arguments.</p>' },
    { do: { edit: [24, '    if (hit != NULL) printf("found %d\\n", *hit); else printf("16 is not there\\n");'] }, state: 'faulted', text: '<p>The fix is a test, like the one on line 20. This step rewrote line 24.</p>' },
    { do: 'run', show: 'term', state: 'exited', output: '16 is not there', text: '<p>Run at full speed, the program now ends normally.</p><div class="note">NULL is the only pointer value you can test for. An unset pointer (red in the memory picture) holds some random address, and no test can tell it apart from a good one. So give pointers a value when you declare them, NULL if nothing else.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-void', unit: 'Pointers', title: 'void pointers and casting',
  blurb: 'void * holds any address; to use it, convert it to a real pointer type.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: void pointers and a byte-by-byte copy */
#include <stdio.h>

void copy_bytes(void *dst, const void *src, unsigned n)
{
    unsigned char *d = dst;              /* void * converts without a cast */
    const unsigned char *s = src;
    unsigned i;

    for (i = 0; i < n; i++)
        d[i] = s[i];                      /* one byte at a time */
}

int main(void)
{
    int from[2] = { 258, -1 };
    int to[2] = { 0, 0 };
    double x = 1.5, y = 0.0;
    void *v = &x;

    copy_bytes(to, from, sizeof from);
    copy_bytes(&y, &x, sizeof x);
    printf("to = %d %d, y = %g\\n", to[0], to[1], y);
    printf("through v: %g\\n", *(double *)v);   /* cast, then follow */
    return 0;
}
`,
  },
  intro: '<p>A <code>void *</code> is an address with no type attached. Any object pointer converts to <code>void *</code> and back without a cast, which is how <code>memcpy</code>, <code>malloc</code> and <code>qsort</code> accept anything.</p><p>The price: you cannot follow a <code>void *</code> or do arithmetic on it, because the compiler does not know how many bytes are there. You must turn it into a real pointer type first.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 16, text: '<p><code>main</code> has two small int arrays, two doubles and a <code>void *</code>.</p>' },
    { do: { to: 21 }, line: 21, expand: ['from', 'to'], check: 'v == &x', bytes: 'from', text: '<p>The Bytes panel shows <code>from</code>: 258 is <code>02 01 00 00</code> (258 = 256 + 2, low byte first) and -1 is <code>ff ff ff ff</code>.</p><p><code>v</code> holds the address of <code>x</code>. The memory picture still draws its arrow, but C does not know it points at a <code>double</code>.</p>' },
    { do: 'into', line: 6, check: 'n == 8', text: '<p>Inside <code>copy_bytes</code>. <code>dst</code> and <code>src</code> are <code>void *</code>: arrows into <code>main</code>\'s <code>to</code> and <code>from</code>. <code>n</code> is 8, the size of <code>from</code> in bytes.</p>' },
    { do: { to: 10 }, line: 10, check: '(void *)d == dst', text: '<p><code>d</code> and <code>s</code> hold the same addresses as <code>dst</code> and <code>src</code>, but as <code>unsigned char *</code>: now each step is one byte and <code>d[i]</code> is a byte that can be read and written.</p>' },
    { do: 'over', times: 2, check: 'd[0] == 2', text: '<p>One byte copied, <code>02</code>. Look at <code>main</code>\'s <code>to[0]</code>: it is already 2, since its other bytes are still 0.</p>' },
    { do: 'out', line: 21, show: 'memory', text: '<p>The rest of the copy ran and we are back in <code>main</code>.</p>' },
    { do: 'over', line: 22, check: 'to[0] == 258 && to[1] == -1', text: '<p>Eight bytes copied one by one, and <code>to</code> holds the same two ints as <code>from</code>. The function never knew they were ints.</p>' },
    { do: 'over', line: 23, check: 'y == 1.5', text: '<p>The same function copied the 8 bytes of a <code>double</code>. It works on any object because it only ever sees bytes.</p>' },
    { do: 'over', times: 2, show: 'term', output: 'through v: 1.5', text: '<p><code>*(double *)v</code>: the cast says "treat this address as a <code>double *</code>", and then <code>*</code> can read 8 bytes as a double.</p>' },
    { do: { edit: [24, '    printf("through v: %g\\n", *v);'] }, text: '<p>Without the cast, line 24 would follow a <code>void *</code>. This step removed the cast.</p>' },
    { do: 'build', show: 'probs', errors: 'void', text: '<p>The build fails: <code>*v</code> has type <code>void</code>, which is no value at all. The compiler refuses to guess a size.</p>' },
    { do: { edit: [24, '    printf("through v: %g\\n", *(double *)v);   /* cast, then follow */'] }, text: '<p>Line 24 is back as it was.</p><div class="note">A cast does not change any bytes; it changes how the compiler reads them. Casting to the wrong type, say <code>*(int *)v</code> here, compiles fine and reads half of the double as an int.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'ptr-array-of', unit: 'Pointers', title: 'Pointer to array, array of pointers',
  blurb: 'int (*p)[3] is one pointer to a row of 3; int *q[3] is three pointers.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: int (*p)[3] versus int *q[3] */
#include <stdio.h>

int main(void)
{
    int grid[2][3] = { { 1, 2, 3 }, { 4, 5, 6 } };
    int x = 7, y = 8, z = 9;
    int (*p)[3];        /* ONE pointer, to an array of 3 ints */
    int *q[3];          /* an array of THREE pointers to int  */

    p = grid;           /* grid decays to &grid[0], a pointer to a row */
    q[0] = &x;
    q[1] = &y;
    q[2] = &z;
    printf("sizeof p = %u, sizeof q = %u\\n", (unsigned)sizeof p, (unsigned)sizeof q);
    p++;                /* moves a whole row: 12 bytes */
    printf("(*p)[0] = %d, p[0][2] = %d\\n", (*p)[0], p[0][2]);
    printf("*q[1] = %d\\n", *q[1]);
    return 0;
}
`,
  },
  intro: '<p>The brackets <code>[]</code> bind tighter than <code>*</code>. So <code>int *q[3]</code> is "<code>q</code> is an array of 3, of <code>int *</code>". To say "pointer to an array" you need parentheses: <code>int (*p)[3]</code> is "<code>p</code> is a pointer, to an array of 3 ints".</p><p>Read from the name outwards, taking the parentheses first.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['grid', 'q'], line: 6, text: '<p>In <code>main</code>\'s frame, <code>p</code> is one 4-byte box. <code>q</code> is an array of three 4-byte boxes. Both are red.</p>' },
    { do: { to: 12 }, line: 12, check: 'p == grid', text: '<p><code>p = grid;</code>: <code>grid</code> is an array of 2 rows, so it decays to the address of its first element, which is a row. That is exactly the type of <code>p</code>. Its arrow ends at <code>grid[0]</code>.</p>' },
    { do: { to: 15 }, line: 15, check: 'q[0] == &x && *q[2] == 9', text: '<p>The three elements of <code>q</code> each have an arrow: to <code>x</code>, <code>y</code> and <code>z</code>. The ints are separate variables, not a row; an array of pointers can point at things anywhere.</p>' },
    { do: 'over', show: 'term', line: 16, output: 'sizeof p = 4, sizeof q = 12', text: '<p><code>p</code> is one pointer, 4 bytes. <code>q</code> is three pointers, 12 bytes.</p>' },
    { do: 'over', show: 'memory', line: 17, check: 'p == &grid[1] && (*p)[0] == 4', text: '<p><code>p++</code> moved by <code>sizeof *p</code>, which is the size of a whole row of 3 ints: 12 bytes. The arrow now ends at <code>grid[1]</code>.</p>' },
    { do: 'over', show: 'term', line: 18, output: '(*p)[0] = 4, p[0][2] = 6', text: '<p><code>*p</code> is the row; <code>(*p)[0]</code> is its first int. <code>p[0][2]</code> means the same as <code>(*p)[2]</code>. Without parentheses, <code>*p[0]</code> would also work here, but <code>*p[1]</code> would mean <code>*(p[1])</code>, the row after: precedence matters.</p>' },
    { do: 'over', output: '*q[1] = 8', text: '<p><code>*q[1]</code> is <code>*(q[1])</code>: take element 1 of <code>q</code>, then follow it to <code>y</code>.</p><div class="note"><code>int (*p)[3]</code> is what a 2D array decays to, and it is the type of a parameter written <code>int g[][3]</code>. <code>int *q[3]</code> is how jagged tables are built, such as the <code>argv</code> of <code>main</code>.</div>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: change line 8 to <code>int *p[3];</code> and build. The compiler now complains about line 11, because an array of pointers cannot be assigned at all.</div>' },
  ],
});
