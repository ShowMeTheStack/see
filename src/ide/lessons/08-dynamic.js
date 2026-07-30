// Unit 8: malloc and free.
SEE.Lessons.add({
  id: 'heap-malloc', unit: 'malloc and free', title: 'malloc gives you a heap block',
  blurb: 'The block is on the heap; the only thing that knows where it is, is a pointer in your stack frame.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: malloc gives you a block on the heap */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *p;
    int i;

    p = malloc(4 * sizeof(int));   /* room for 4 ints on the heap */
    if (p == NULL) {
        printf("out of memory\\n");
        return 1;
    }
    for (i = 0; i < 4; i++)
        p[i] = (i + 1) * 10;
    printf("%d %d\\n", p[0], p[3]);
    free(p);                       /* give the block back */
    return 0;
}
`,
  },
  intro: '<p>Local variables live in a stack frame and disappear when the function returns. Sometimes you need memory that lasts longer, or whose size you only know while the program runs. For that there is the <b>heap</b>.</p><p><code>malloc(n)</code> finds a free block of <code>n</code> bytes on the heap and returns its address. It does not name the block: you keep its address in a pointer.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 10, text: '<p><code>main</code>\'s frame has <code>p</code> and <code>i</code>, both red. The heap is still empty.</p>' },
    { do: 'over', line: 11, check: 'p != 0', text: '<p>The memory picture now has a block on the <b>heap</b>, near <code>0x0804a000</code>: 16 bytes, room for 4 ints of 4 bytes. Its contents are red: <code>malloc</code> does not set them.</p><p><code>p</code>, in <code>main</code>\'s frame on the stack, holds its address. Follow the <b>arrow from the stack to the heap</b>.</p>', expand: ['p'] },
    { do: 'over', line: 15, text: '<p><code>malloc</code> returns <code>NULL</code> when there is no memory left. Always check, as lines 11 to 14 do. Here it succeeded, so the <code>if</code> body was skipped.</p>' },
    { do: { to: 17 }, line: 17, check: 'p[0] == 10 && p[3] == 40', text: '<p>The loop wrote 10, 20, 30, 40 into the block. <code>p[i]</code> works just as on an array: it means "the int <code>i</code> places after the address in <code>p</code>".</p><div class="note">The block has no name of its own. If <code>p</code> were overwritten, nothing would know where the block is any more.</div>' },
    { do: 'over', show: 'term', output: '10 40', text: '<p>Printed the first and last of the four ints.</p>' },
    { do: 'over', line: 19, text: '<p><code>free(p)</code> gave the block back. It is now drawn <b>hatched</b>: freed memory that the program must not use. <code>p</code> still holds the old address; the next lesson looks at that.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended. Every block from <code>malloc</code> was freed, so there is no leak to report.</p><div class="try">Try it: change line 10 to <code>malloc(3 * sizeof(int))</code> and debug again. The loop writes past the end of the block and See stops it.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'heap-free', unit: 'malloc and free', title: 'free and the hatched block',
  blurb: 'free returns a block to the heap; the pointer keeps the old address until you clear it.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: free gives the block back */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    char *name;
    int *nums;

    name = malloc(6);                 /* "Grace" + NUL */
    strcpy(name, "Grace");
    nums = malloc(3 * sizeof(int));
    nums[0] = 1; nums[1] = 2; nums[2] = 3;
    printf("%s %d\\n", name, nums[2]);
    free(name);                       /* the block is given back ... */
    name = NULL;                      /* ... and the pointer forgets it */
    free(nums);
    nums = NULL;
    return 0;
}
`,
  },
  intro: '<p>Every block you get from <code>malloc</code> must be given back with <code>free</code> exactly once, when you no longer need it.</p><p><code>free(p)</code> does not change <code>p</code>: it cannot, since it only gets a copy of the address. Setting the pointer to <code>NULL</code> afterwards is a good habit.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 11, text: '<p>Two pointers in <code>main</code>\'s frame, and an empty heap.</p>' },
    { do: { to: 15 }, line: 15, check: "name[0] == 'G' && nums[2] == 3", text: '<p>Two heap blocks now: 6 bytes holding "Grace" and its NUL, and 12 bytes holding three ints. Two arrows go from the stack down to the heap, one per block.</p>' },
    { do: 'over', show: 'term', output: 'Grace 3', text: '<p>Printed the string and the last int.</p>' },
    { do: 'over', line: 17, check: 'name != 0', text: '<p><code>free(name)</code> returned the first block. It is drawn <b>hatched</b>: it no longer belongs to the program.</p><p>But <code>name</code> still holds its address, and the arrow still points into the hatched block. A pointer like this is called <b>dangling</b>.</p>' },
    { do: 'over', check: 'name == 0', text: '<p><code>name = NULL;</code> cleared the pointer: no arrow any more. Now nobody can use the freed block by mistake, and <code>free(name)</code> again would do nothing, because <code>free(NULL)</code> is allowed and does nothing.</p>' },
    { do: 'over', times: 2, line: 20, check: 'nums == 0', text: '<p>The second block is freed and its pointer cleared. Both blocks are hatched; the stack no longer points into the heap.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended with every block freed.</p><div class="note">The pair <code>free(p); p = NULL;</code> turns many later mistakes into a clean <code>NULL</code> pointer error instead of a silent use of freed memory.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'heap-use-after-free', unit: 'malloc and free', title: 'Use after free',
  blurb: 'Two pointers to one block: free it through one and the other is left dangling.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: using a block after it was freed */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *score;
    int *copy;

    score = malloc(sizeof(int));
    *score = 90;
    copy = score;            /* two pointers, one block */
    free(score);             /* the block is gone; both pointers still hold its address */
    score = NULL;            /* this one is cleared ... */
    printf("%d\\n", *copy);   /* ... but copy still points at the freed block */
    return 0;
}
`,
  },
  intro: '<p>Copying a pointer does not copy the block: it makes a second arrow to the same block. When the block is freed, <b>every</b> pointer to it is left dangling, and clearing one of them does not clear the others.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 10, text: '<p>Two pointers in <code>main</code>\'s frame, both red.</p>' },
    { do: { to: 13 }, line: 13, check: 'copy == score && *copy == 90', text: '<p>One heap block holding 90, and <b>two</b> arrows into it, from <code>score</code> and from <code>copy</code>. They hold the same address.</p>' },
    { do: 'over', check: 'copy == score', text: '<p>The block is freed and hatched. Both arrows still point at it.</p>' },
    { do: 'over', line: 15, check: 'score == 0 && copy != 0', text: '<p><code>score</code> is cleared, but <code>copy</code> still holds the old address: its arrow still ends on the hatched block.</p>' },
    { do: 'over', state: 'faulted', text: '<p>Caught: <i>read heap memory after it was freed (use after free)</i>.</p><p>On a real system this line might print 90, or some other number, or crash. The freed bytes may already be reused by another <code>malloc</code>. That is why use after free is so hard to find without a tool like this.</p>' },
    { do: 'back', state: 'paused', line: 15, text: '<p>Stepped back (F8): the crash is undone and the program is paused at the start of line 15, before the <code>printf</code> runs. Point at <code>copy</code> in the editor: See describes its target as freed heap memory.</p>' },
    { do: { edit: [15, '    copy = NULL;             /* clear every pointer to the block */'] }, text: '<p>The fix: after <code>free</code>, clear <b>every</b> pointer that held that address, or stop using them. Line 15 now clears <code>copy</code> too.</p>' },
    { do: 'start', line: 10, text: '<p>Rebuilt with the new line 15 and started again from the top.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ends cleanly.</p><div class="note">Before freeing a block, ask: which other pointers lead here? Each of them is dangling the moment <code>free</code> returns.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'heap-double-free', unit: 'malloc and free', title: 'Double free',
  blurb: 'Freeing the same block twice corrupts the heap; See stops it at the second free.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: freeing the same block twice */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    char *a;
    char *b;

    a = malloc(16);
    strcpy(a, "shared");
    b = a;                   /* b and a lead to the same block */
    printf("%s %s\\n", a, b);
    free(a);
    free(b);                 /* the same block again */
    return 0;
}
`,
  },
  intro: '<p><code>free</code> may be called once for each block. A second <code>free</code> of the same address is a <b>double free</b>: the heap\'s own bookkeeping gets confused, and on a real system the program may crash much later, somewhere else, or be open to attack.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 11, text: '<p>Two pointers in <code>main</code>\'s frame.</p>' },
    { do: { to: 15 }, line: 15, check: 'a == b', show: 'term', output: 'shared shared', text: '<p>One block, two arrows. It is easy to forget that <code>b</code> is not a block of its own.</p>' },
    { do: 'over', show: 'memory', check: 'a == b', text: '<p>The block is freed through <code>a</code> and drawn hatched. <code>b</code> still points at it.</p>' },
    { do: 'over', state: 'faulted', text: '<p>Caught: <i>double free: the block ... was already freed at line 15</i>.</p><p>From <code>free</code>\'s point of view, <code>b</code> is just an address, and that address was given back already.</p>' },
    { do: { edit: [15, '    free(a); a = NULL; b = NULL;   /* free once, then forget the address everywhere */'] }, state: 'faulted', text: '<p>Line 15 now frees the block and clears both pointers. Line 16 then calls <code>free(NULL)</code>, which is allowed and does nothing.</p>' },
    { do: 'start', line: 11, text: '<p>Rebuilt with the new line 15 and started again from the top.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ends cleanly with the single block freed once.</p><div class="note">Decide which pointer <b>owns</b> each block, and free it through that one only.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'heap-leak', unit: 'malloc and free', title: 'A memory leak',
  blurb: 'Overwrite the only pointer to a block and the block can never be freed.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a block nobody frees */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* returns a heap copy of s: the caller must free it */
char *make_copy(const char *s)
{
    char *p = malloc(strlen(s) + 1);
    strcpy(p, s);
    return p;
}

int main(void)
{
    char *msg;

    msg = make_copy("first");
    printf("%s\\n", msg);
    msg = make_copy("second");   /* the first block's only address is lost */
    printf("%s\\n", msg);
    free(msg);
    return 0;
}
`,
  },
  intro: '<p>A heap block stays until it is freed, even after the function that made it has returned. If the program loses every pointer to a block without freeing it, the block can never be freed: a <b>memory leak</b>.</p><p>One small leak does no harm, but a program that leaks inside a loop slowly uses up all the memory.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 18, text: '<p><code>main</code> has one pointer, <code>msg</code>.</p>' },
    { do: 'into', line: 9, text: '<p>Inside <code>make_copy</code>. Its frame has the parameter <code>s</code>, whose arrow goes to the literal "first" in read-only data, and <code>p</code>.</p>' },
    { do: 'over', check: 'p != 0', text: '<p><code>malloc(strlen(s) + 1)</code> made a 6-byte block: 5 letters and the NUL. The arrow to it comes from <code>make_copy</code>\'s frame.</p>' },
    { do: 'over', check: "p[0] == 'f'", text: '<p><code>strcpy</code> filled the block: it now holds "first" and its NUL.</p>' },
    { do: 'out', text: '<p><code>make_copy</code> returned, and its frame, with <code>p</code>, is gone. The heap block is <b>not</b> gone: heap blocks do not belong to any frame. Its address came back as the return value.</p>' },
    { do: { to: 20 }, line: 20, check: "msg[0] == 'f'", show: 'term', output: 'first', text: '<p><code>msg</code> holds the block\'s address, so there is one arrow from <code>main</code> to it. That arrow is the only way anyone can reach the block.</p>' },
    { do: 'over', show: 'memory', check: "msg[0] == 's'", text: '<p>A second block now holds "second", and <code>msg</code> points at it. Look at the first block: <b>no arrow leads to it</b> any more. Its address was in <code>msg</code>, and line 20 overwrote it.</p><p>It is not hatched, because it was never freed. And now it never can be.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended. <code>free(msg)</code> freed the second block, but the first is still in use.</p><p>Look at the terminal and the <b>Problems</b> list: See reports a <b>memory leak</b>: one block of 6 bytes from <code>malloc</code> at line 9 was never freed.</p>' },
    { text: '<p>The fix is to free the old block before the pointer to it is overwritten: put <code>free(msg);</code> just before line 20.</p><div class="note">For every <code>malloc</code>, know where its <code>free</code> will be. A function that returns a heap block, like <code>make_copy</code>, should say in a comment that the caller must free it.</div><div class="try">Try it: add <code>free(msg);</code> as a new line before line 20, debug to the end, and check that the leak report is gone.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'heap-calloc', unit: 'malloc and free', title: 'calloc zeroes, malloc does not',
  blurb: 'malloc leaves the block as it found it (red); calloc fills it with zeros.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: calloc sets the block to zero, malloc does not */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *m;
    int *c;
    int i;

    m = malloc(4 * sizeof(int));   /* contents: whatever was there before */
    c = calloc(4, sizeof(int));    /* contents: all zero */
    for (i = 0; i < 4; i++)
        m[i] = 0;                  /* malloc'd memory must be set by you */
    printf("%d %d\\n", m[3], c[3]);
    free(m);
    free(c);
    return 0;
}
`,
  },
  intro: '<p><code>malloc(n)</code> gives n bytes and leaves them as they were: they may hold leftovers from earlier use. <code>calloc(count, size)</code> gives <code>count * size</code> bytes and sets every one to zero.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 11, text: '<p>Two pointers in <code>main</code>\'s frame and an empty heap.</p>' },
    { do: 'over', check: 'm != 0', text: '<p>The <code>malloc</code> block is on the heap with its 4 ints shown in <b>red</b>: not set. Reading one now would read whatever happens to be there.</p>', expand: ['m'] },
    { do: 'over', check: 'c[0] == 0 && c[3] == 0', text: '<p>The <code>calloc</code> block\'s 4 ints are all 0, and not red: <code>calloc</code> set every byte.</p>', expand: ['c'] },
    { do: { to: 15 }, line: 15, check: 'm[0] == 0 && m[3] == 0', text: '<p>The loop set each int of the <code>malloc</code> block to 0, one by one. Now both blocks hold the same values, and nothing is red.</p>' },
    { do: 'over', show: 'term', output: '0 0', text: '<p>Both print 0.</p><div class="try">Try it: delete lines 13 and 14 and debug again. See warns that <code>m[3]</code> is read before it was given a value, while <code>c[3]</code> is fine.</div>' },
    { do: 'continue', state: 'exited', text: '<p>Both blocks freed, the program ended.</p><div class="note">Use <code>calloc</code> when you want the block to start at zero. Use <code>malloc</code> when you will fill every byte yourself anyway.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'heap-realloc', unit: 'malloc and free', title: 'realloc grows an array',
  blurb: 'realloc makes a block bigger; it may move it, and then the old address is no longer valid.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a dynamic array that grows with realloc */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *a;
    int *bigger;
    int *other;
    int n = 2, i;
    unsigned long old;

    a = malloc(n * sizeof(int));
    other = malloc(sizeof(int));   /* sits just after a, so a cannot grow in place */
    a[0] = 1;
    a[1] = 2;
    old = (unsigned long)a;        /* keep the old address as a number, to print it */
    bigger = realloc(a, 2 * n * sizeof(int));
    if (bigger == NULL) {          /* on failure, a is still valid */
        free(a);
        free(other);
        return 1;
    }
    a = bigger;
    n = n * 2;
    for (i = 2; i < n; i++)
        a[i] = i + 1;
    printf("old %lx new %lx\\n", old, (unsigned long)a);
    printf("%d %d %d %d\\n", a[0], a[1], a[2], a[3]);
    free(a);
    free(other);
    return 0;
}
`,
  },
  intro: '<p><code>realloc(p, size)</code> changes the size of the block at <code>p</code>. If there is room right after the block, it grows in place. If not, <code>realloc</code> gets a new block, copies the old contents into it, frees the old block and returns the new address.</p><p>So after <code>realloc</code> you must use the address it returns, never the old one.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 10, text: '<p>Three pointers, <code>n</code>, <code>i</code> and <code>old</code> in <code>main</code>\'s frame.</p>' },
    { do: { to: 17 }, line: 17, check: 'a[0] == 1 && a[1] == 2 && other != 0', text: '<p>Two heap blocks: <code>a</code>\'s, with room for 2 ints, and right after it the small block of <code>other</code>. <code>a</code>\'s block has no free space after it to grow into.</p>', expand: ['a'] },
    { do: 'over', check: 'old != 0', text: '<p><code>old</code> keeps the address of <code>a</code>\'s block as a plain number, only so that the program can print it later.</p>' },
    { do: 'over', check: 'bigger != a', text: '<p><code>realloc</code> asked for 16 bytes. It could not grow the block in place, so it <b>moved</b> it: a new block further up the heap, holding a copy of 1 and 2, and the old block is now hatched.</p><p>Look at the two arrows: <code>bigger</code> points at the new block, while <code>a</code> still holds the old address and points into the hatched one.</p>' },
    { do: 'over', line: 24, text: '<p><code>realloc</code> returns <code>NULL</code> when it fails, and then leaves the old block alone. That is why the result goes into <code>bigger</code> first: writing <code>a = realloc(a, ...)</code> would lose the only pointer to the old block on failure.</p>' },
    { do: 'over', check: 'a == bigger', text: '<p>Now <code>a</code> points at the new block too. The dangling address is gone from <code>a</code>.</p>' },
    { do: { to: 28 }, line: 28, check: 'n == 4 && a[2] == 3 && a[3] == 4', text: '<p>The array has 4 ints now: the two copied by <code>realloc</code>, and the two set by the loop.</p>' },
    { do: 'over', show: 'term', output: 'old 804a', text: '<p>The two addresses printed differ: the block moved. Both are near <code>0x0804a000</code>, in the heap.</p>' },
    { do: 'over', output: '1 2 3 4', text: '<p>The contents survived the move: <code>realloc</code> copied 1 and 2 across.</p>' },
    { do: 'continue', state: 'exited', text: '<p>Both blocks freed. The old block was freed by <code>realloc</code> itself: freeing it again would be a double free.</p><div class="note">Grow a dynamic array by doubling, as here, so that <code>realloc</code> runs rarely. And always write the result to a separate pointer first.</div><div class="try">Try it: step back (F8) to line 18 and step over it again, watching the copy appear and the old block turn hatched. Then add <code>a[0] = 7;</code> just before line 24, while <code>a</code> still holds the old address, and debug: See stops the write into the freed block.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'heap-jagged', unit: 'malloc and free', title: 'A jagged array',
  blurb: 'int **rows: one block of row pointers, and one block per row, each a different length.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a jagged array: rows of different lengths */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int **rows;
    int len[3];
    int r, c;

    len[0] = 1; len[1] = 3; len[2] = 2;
    rows = malloc(3 * sizeof(int *));             /* the spine: 3 row pointers */
    for (r = 0; r < 3; r++) {
        rows[r] = malloc(len[r] * sizeof(int));   /* one block per row */
        for (c = 0; c < len[r]; c++)
            rows[r][c] = (r + 1) * 10 + c;
    }
    for (r = 0; r < 3; r++) {
        for (c = 0; c < len[r]; c++)
            printf("%d ", rows[r][c]);
        printf("\\n");
    }
    for (r = 0; r < 3; r++)
        free(rows[r]);        /* free the rows first ... */
    free(rows);               /* ... then the spine that held their addresses */
    return 0;
}
`,
  },
  intro: '<p>A 2D array like <code>int t[3][3]</code> has rows that are all the same length. For rows of different lengths, build it from the heap:</p><ul><li>a block of 3 pointers, the <b>spine</b>, kept in <code>int **rows</code>;</li><li>one block of ints for each row, each as long as that row needs.</li></ul><p><code>rows[r][c]</code> follows two arrows: first to the spine, then from <code>rows[r]</code> to the row.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 11, text: '<p><code>rows</code> is a single pointer in <code>main</code>\'s frame. <code>len</code> will say how long each row is.</p>' },
    { do: { to: 13 }, line: 13, check: 'rows != 0 && len[1] == 3', text: '<p>The spine is on the heap: 12 bytes, room for 3 pointers, all red. One arrow from <code>rows</code> on the stack to the spine.</p>' },
    { do: { to: 15 }, line: 15, check: 'r == 0 && rows[0] != 0', text: '<p>Row 0 has its own block, 1 int long. Now there are two levels of arrows: stack to spine, and <code>rows[0]</code> in the spine to row 0.</p>' },
    { do: { to: 18 }, line: 18, check: 'rows[0][0] == 10 && rows[1][2] == 22 && rows[2][1] == 31', text: '<p>Four heap blocks: the spine and three rows of 1, 3 and 2 ints. Three arrows leave the spine, one for each row.</p><p>The rows are separate blocks, not one piece of memory: <code>rows[1][2]</code> means "go to the spine, take pointer 1, follow it, then take int 2".</p>', expand: ['rows'] },
    { do: { to: 23 }, show: 'term', line: 23, output: '20 21 22', text: '<p>The rows print with their different lengths. The loop must know each row\'s length from <code>len</code>: nothing in a heap block records how many ints it holds.</p>' },
    { do: 'over', times: 2, line: 23, check: 'rows != 0', text: '<p>Row 0 is freed and hatched. The spine is still alive, so <code>rows[1]</code> and <code>rows[2]</code> can still be read to find the other rows.</p>' },
    { do: { to: 25 }, line: 25, check: 'r == 3', text: '<p>All three rows are hatched. Only the spine is still in use.</p><div class="note">Free from the inside out. If the spine were freed first, reading <code>rows[r]</code> to find each row would be a use after free, and without it the rows could never be found again.</div>' },
    { do: 'over', line: 26, text: '<p>The spine is freed too: every block is hatched, and nothing is leaked.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended with no leak.</p><div class="try">Try it: swap the order: put <code>free(rows);</code> before the loop on line 23 and debug. See stops at the first read of <code>rows[r]</code>.</div>' },
  ],
});
