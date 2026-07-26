// Unit 4: arrays.
SEE.Lessons.add({
  id: 'array-side-by-side', unit: 'Arrays', title: 'Elements side by side',
  blurb: 'An array is a row of equal boxes with no gaps: int elements sit 4 bytes apart.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: an array is elements side by side */
#include <stdio.h>

int main(void)
{
    int marks[4];     /* four ints in one block of 16 bytes */
    int one = 7;      /* an ordinary int, for comparison    */

    marks[0] = 10;
    marks[1] = 20;
    marks[2] = 30;
    marks[3] = 40;

    printf("marks[0] at %p, marks[1] at %p\\n", (void *)&marks[0], (void *)&marks[1]);
    printf("sizeof marks = %u, sizeof marks[0] = %u\\n", (unsigned)sizeof marks, (unsigned)sizeof marks[0]);
    printf("so marks has %u elements, and one = %d\\n", (unsigned)(sizeof marks / sizeof marks[0]), one);
    return 0;
}
`,
  },
  intro: '<p>An <b>array</b> is several variables of the same type, stored one right after another in a single block of memory. They share one name and are told apart by a number, the <b>index</b>, which starts at 0.</p><p><code>int marks[4];</code> asks for four <code>int</code>s: <code>marks[0]</code>, <code>marks[1]</code>, <code>marks[2]</code> and <code>marks[3]</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['marks'], line: 7, text: '<p>Line 6 only declares the array, so there is nothing to run there; the debugger stops at line 7.</p><p>In <code>main</code>\'s frame, <code>marks</code> is one box of 16 bytes. It has been opened so you can see the four elements inside. All four are red: an array declared inside a function is not set to anything.</p>' },
    { do: 'over', line: 9, check: 'one == 7', text: '<p><code>one</code> is an ordinary <code>int</code>: 4 bytes, now holding 7. Each element of <code>marks</code> is exactly the same kind of box, 4 bytes holding one <code>int</code>.</p>' },
    { do: 'over', line: 10, check: 'marks[0] == 10', text: '<p><code>marks[0] = 10;</code> stored 10 in the first element. Only that element turned yellow; the other three are still red.</p><p>Point at each element in the memory picture and read its address. They go up by 4 each time, because an <code>int</code> takes 4 bytes and there is no gap between elements.</p>' },
    { do: { to: 14 }, line: 14, check: 'marks[1] == 20 && marks[2] == 30 && marks[3] == 40', text: '<p>All four elements are set now: 10, 20, 30, 40, in increasing addresses.</p><div class="note">The address of <code>marks[i]</code> is the address of <code>marks[0]</code> plus <code>i * sizeof(int)</code>. That simple sum is why indexing an array is fast: the computer does not search, it calculates.</div>', watch: ['&marks[0]', '&marks[1]', '&marks[3]'] },
    { do: 'over', show: 'term', line: 15, output: 'marks[0] at 0x', text: '<p>The program printed two addresses with <code>%p</code>. Compare their last digits: they differ by 4. The watch panel shows the same addresses, and <code>&marks[3]</code> is 12 bytes past <code>&marks[0]</code>.</p>' },
    { do: 'over', line: 16, output: 'sizeof marks = 16, sizeof marks[0] = 4', text: '<p><code>sizeof marks</code> is the size of the whole array: 4 elements of 4 bytes, 16 bytes. <code>sizeof marks[0]</code> is the size of one element.</p>' },
    { do: 'over', output: 'so marks has 4 elements', text: '<p>Dividing one by the other gives the number of elements: 16 / 4 = 4. This trick, <code>sizeof a / sizeof a[0]</code>, works whenever the compiler can see the array itself, as here. A later lesson shows where it stops working.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: change line 6 to <code>char marks[4];</code>, debug again and look at the addresses: now they go up by 1, because a <code>char</code> is 1 byte.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'array-loop', unit: 'Arrays', title: 'Indexing in a loop',
  blurb: 'The index can be any int expression, so a for loop can visit every element.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: fill an array with a loop, then print it */
#include <stdio.h>

#define N 5

int main(void)
{
    int sq[N];      /* N squares: sq[0] .. sq[N - 1] */
    int i;

    for (i = 0; i < N; i++) {
        sq[i] = i * i;
    }

    for (i = 0; i < N; i++) {
        printf("sq[%d] = %d\\n", i, sq[i]);
    }
    return 0;
}
`,
  },
  intro: '<p>The number in the square brackets does not have to be a constant. <code>sq[i]</code> means "the element whose index is the current value of <code>i</code>", so one line inside a loop can reach every element in turn.</p><p>The loop runs <code>i</code> from 0 while <code>i &lt; N</code>: that is 0, 1, 2, 3, 4, exactly the five valid indexes.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['sq'], line: 11, text: '<p><code>sq</code> has 5 elements, all red. <code>N</code> is not a variable: <code>#define N 5</code> made the preprocessor replace every <code>N</code> with 5 before the compiler saw the code, so it does not appear in the memory picture.</p>' },
    { do: 'over', line: 12, check: 'i == 0', text: '<p>The loop set <code>i</code> to 0 and checked <code>0 &lt; 5</code>. Line 12 is next, and with <code>i</code> equal to 0 it will write to <code>sq[0]</code>.</p>' },
    { do: 'over', check: 'sq[0] == 0', text: '<p><code>sq[0]</code> is now 0 (0 times 0). It is yellow because it just changed; the rest of the array is still red.</p>' },
    { do: { to: 12 }, line: 12, check: 'i == 1', text: '<p>The <code>i++</code> part of the loop ran and the test passed again, so we are back at line 12 with <code>i</code> equal to 1. This time the same line will write to <code>sq[1]</code>, the next 4 bytes along.</p>' },
    { do: 'over', check: 'sq[1] == 1', text: '<p><code>sq[1]</code> is 1. The same line of code reached a different element because <code>i</code> changed.</p><div class="try">Try it: click <code>i</code> in the memory picture and set it to 3, then step once. Line 12 writes <code>sq[3] = 9</code> and skips <code>sq[2]</code>, which stays red.</div>' },
    { do: { to: 15 }, line: 15, check: 'sq[2] == 4 && sq[3] == 9 && sq[4] == 16 && i == 5', text: '<p>The first loop is done. <code>i</code> is 5: the test <code>5 &lt; 5</code> failed and the loop stopped, so <code>sq[5]</code> was never touched. Good, because there is no <code>sq[5]</code>.</p><p>All five elements hold their squares: 0, 1, 4, 9, 16.</p>' },
    { do: { set: ['sq[2]', '100'] }, check: 'sq[2] == 100', text: '<p>This step changed <code>sq[2]</code> to 100, as if you had clicked it in the memory picture. The second loop only reads the array, so it will print whatever is there now.</p>' },
    { do: 'continue', show: 'term', state: 'exited', output: 'sq[2] = 100', text: '<p>The second loop printed each element, including the changed <code>sq[2] = 100</code>.</p><div class="note">For an array of N elements the valid indexes are 0 to N - 1. The usual loop is <code>for (i = 0; i &lt; N; i++)</code>: start at 0, use <code>&lt;</code>, not <code>&lt;=</code>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'array-past-end', unit: 'Arrays', title: 'One past the end',
  blurb: 'Writing a[4] in an array of 4 is a classic bug. See catches it at the guard.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: one step too far */
#include <stdio.h>

int main(void)
{
    int before = 1;
    int a[4];
    int after = 2;
    int i;

    for (i = 0; i <= 4; i++) {   /* <= is the mistake: a[4] does not exist */
        a[i] = 100 + i;
    }
    printf("before = %d, after = %d, a[3] = %d\\n", before, after, a[3]);
    return 0;
}
`,
  },
  intro: '<p>C does not check indexes. <code>a[4]</code> in an array of 4 elements simply means "the 4 bytes just after <code>a[3]</code>", and a real C program will happily write there, over whatever happens to live next door. The bug may show up much later, or never, or only on another computer.</p><p>See puts a small <b>guard</b> zone after every array and stops the program the moment anything touches it.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['a'], line: 6, text: '<p><code>before</code>, the four elements of <code>a</code>, and <code>after</code> sit near each other in <code>main</code>\'s frame. The loop on line 11 uses <code>&lt;=</code>, so it will run with <code>i</code> equal to 0, 1, 2, 3 and also 4.</p>' },
    { do: { to: 12 }, line: 12, check: 'i == 0', text: '<p>First time round: <code>i</code> is 0 and line 12 will write <code>a[0]</code>.</p>' },
    { do: 'over', times: 6, line: 12, check: 'i == 3 && a[2] == 102', text: '<p>A few steps later <code>i</code> is 3 and line 12 is about to write <code>a[3]</code>, the last real element. So far everything is legal.</p>' },
    { do: 'over', check: 'a[3] == 103', text: '<p><code>a[3]</code> is 103. The array is full.</p>' },
    { do: { to: 12 }, line: 12, check: 'i == 4', text: '<p>The test <code>4 &lt;= 4</code> was true, so the loop goes round once more. Line 12 is about to write <code>a[4]</code>: 4 elements of 4 bytes past the start of <code>a</code>, which is the first byte after the array.</p>' },
    { do: 'over', state: 'faulted', text: '<p>See stopped the program with a <b>memory error</b>: a write just past the end of <code>a</code>. Look at the message: it names the array, its size, and the last valid element, <code>a[3]</code>.</p><p>The bytes after an array are marked as a guard. A normal compiler has no such guard, and the write would have landed silently on some other variable or on the saved data the function needs to return.</p>' },
    { do: { edit: [11, '    for (i = 0; i < 4; i++) {    /* < stops at a[3] */'] }, state: 'faulted', text: '<p>The fix is on line 11: <code>i &lt; 4</code> instead of <code>i &lt;= 4</code>. This step changed that line in the editor.</p>' },
    { do: 'start', line: 6, text: '<p>Started again with the fixed code. The memory picture is fresh: the old run is gone.</p>' },
    { do: 'continue', show: 'term', state: 'exited', output: 'before = 1, after = 2, a[3] = 103', text: '<p>Now the loop stops after <code>a[3]</code>, the neighbours are untouched and the program ends normally.</p><div class="note">An array of N elements has indexes 0 to N - 1. Index N is "one past the end": you may compute its address (<code>&a[4]</code>, useful as a stop marker) but never read or write the element.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'array-decay', unit: 'Arrays', title: 'Arrays given to functions',
  blurb: 'Pass an array and the function receives a pointer: sizeof tells the truth.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: an array passed to a function becomes a pointer */
#include <stdio.h>

int total(int v[], int n)      /* int v[] here means exactly int *v */
{
    int s = 0;
    int i;

    printf("inside:  sizeof v = %u\\n", (unsigned)sizeof v);
    for (i = 0; i < n; i++)
        s += v[i];
    return s;
}

int main(void)
{
    int nums[5] = { 3, 1, 4, 1, 5 };
    int t;

    printf("outside: sizeof nums = %u\\n", (unsigned)sizeof nums);
    t = total(nums, sizeof nums / sizeof nums[0]);
    printf("total = %d\\n", t);
    return 0;
}
`,
  },
  intro: '<p>C never copies a whole array into a function. When you write an array\'s name in an expression, as in <code>total(nums, 5)</code>, it turns into the address of its first element. This is called <b>decay</b>: the array decays to a pointer.</p><p>So the parameter <code>int v[]</code> is not an array at all. The compiler reads it as <code>int *v</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['nums'], line: 17, text: '<p><code>main</code>\'s frame holds <code>nums</code>, five ints, 20 bytes, and <code>t</code>.</p>' },
    { do: 'over', line: 20, check: 'nums[4] == 5', text: '<p>The initialiser filled all five elements: 3, 1, 4, 1, 5.</p>' },
    { do: 'over', show: 'term', line: 21, output: 'outside: sizeof nums = 20', text: '<p>In <code>main</code>, where <code>nums</code> was declared, <code>sizeof nums</code> is 20: the whole array.</p>' },
    { do: 'into', show: 'memory', line: 6, check: 'n == 5 && v[0] == 3 && v[4] == 5', text: '<p>Step into <code>total</code>. A new frame sits on top of <code>main</code>\'s. Look at <code>v</code> in it: not five boxes, but one 4-byte box holding an address, with an arrow into <code>main</code>\'s <code>nums</code>.</p><p>That arrow is the whole story: <code>total</code> did not get a copy of the numbers, only where to find them.</p>' },
    { do: { to: 10 }, line: 10, show: 'term', output: 'inside:  sizeof v = 4', text: '<p>Inside the function <code>sizeof v</code> is 4, the size of a pointer, not 20. The <code>sizeof a / sizeof a[0]</code> trick would give 1 here, which is wrong.</p><div class="note">This is why functions that take an array also take its length, like <code>n</code> here: once the array has decayed, the length is lost.</div>' },
    { do: { set: ['v[0]', '13'] }, show: 'memory', check: 'v[0] == 13', text: '<p>This step changed <code>v[0]</code> to 13. Look at <code>main</code>\'s frame: <code>nums[0]</code> turned yellow and is 13. <code>v[0]</code> and <code>nums[0]</code> are the same 4 bytes, reached two ways.</p>' },
    { do: 'out', line: 21, text: '<p><b>Step out</b> ran the rest of <code>total</code> and came back to line 21 in <code>main</code>, with the return value about to be stored in <code>t</code>. The frame of <code>total</code> is gone.</p>' },
    { do: 'over', check: 't == 24 && nums[0] == 13', text: '<p><code>t</code> is 24: 13 + 1 + 4 + 1 + 5. The change made through the pointer is still in <code>nums</code>, because it was made in <code>nums</code>.</p>' },
    { do: 'continue', state: 'exited', output: 'total = 24', text: '<p>The program printed the total and ended.</p><div class="try">Try it: change line 4 to <code>int total(int *v, int n)</code> and debug again. Nothing changes: the two spellings mean the same thing in a parameter list.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'array-2d', unit: 'Arrays', title: 'Two-dimensional arrays',
  blurb: 'int grid[2][3] is two rows of three ints, stored row after row with no gaps.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a two-dimensional array is rows laid end to end */
#include <stdio.h>

int main(void)
{
    int grid[2][3];          /* 2 rows, each an array of 3 ints */
    int r, c;
    int *flat;

    for (r = 0; r < 2; r++)
        for (c = 0; c < 3; c++)
            grid[r][c] = 10 * r + c;

    printf("sizeof grid = %u, sizeof grid[0] = %u\\n", (unsigned)sizeof grid, (unsigned)sizeof grid[0]);
    flat = &grid[0][0];      /* walk the same memory as one row of 6 */
    printf("flat[3] = %d, the same int as grid[1][0]\\n", flat[3]);
    return 0;
}
`,
  },
  intro: '<p><code>int grid[2][3]</code> is an array of 2 elements, and each element is itself an array of 3 ints. So <code>grid[1]</code> is a whole row and <code>grid[1][2]</code> is one int in it.</p><p>Memory is a single line of bytes, so the rows have to go somewhere along it. C puts row 0 first, then row 1 right after it: <b>row-major order</b>.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['grid'], line: 10, text: '<p><code>grid</code> is 24 bytes: 2 rows of 3 ints of 4 bytes. Opened, it shows <code>grid[0]</code> and <code>grid[1]</code>, each a row of 3.</p>' },
    { do: { to: 14 }, line: 14, check: 'grid[0][2] == 2 && grid[1][0] == 10 && grid[1][2] == 12', text: '<p>The nested loops filled the grid: row 0 holds 0, 1, 2 and row 1 holds 10, 11, 12. The outer loop picks the row, the inner loop walks along it.</p>', watch: ['&grid[0][2]', '&grid[1][0]'] },
    { do: 'over', show: 'term', line: 15, output: 'sizeof grid = 24, sizeof grid[0] = 12', text: '<p><code>sizeof grid</code> is the whole thing, 24 bytes. <code>sizeof grid[0]</code> is one row, 12 bytes. So <code>sizeof grid / sizeof grid[0]</code> is the number of rows.</p>' },
    { do: 'over', bytes: 'grid', line: 16, check: 'flat == &grid[0][0]', text: '<p>The <b>Bytes</b> panel shows the raw memory of <code>grid</code>, 24 bytes in a row. Each int is 4 bytes with the low byte first (this machine is little-endian): <code>00 00 00 00</code>, <code>01 00 00 00</code>, <code>02 00 00 00</code>, then <code>0a 00 00 00</code> for 10, and so on.</p><p>There is no gap and no marker between the rows. In the watch panel, <code>&grid[1][0]</code> is exactly 4 bytes after <code>&grid[0][2]</code>.</p>' },
    { do: 'over', show: 'term', output: 'flat[3] = 10', text: '<p><code>flat</code> is a plain <code>int *</code> to the first int. <code>flat[3]</code> is the fourth int along, which is the first int of row 1: <code>grid[1][0]</code>, 10.</p><div class="note">The address of <code>grid[r][c]</code> is the start of <code>grid</code> plus <code>(r * 3 + c) * 4</code>. The compiler needs the row length, 3, to work that out, which is why a function parameter must say <code>int g[][3]</code>: only the first size may be left out.</div>' },
    { do: { set: ['grid[1][1]', '99'] }, check: 'flat[4] == 99', text: '<p>This step set <code>grid[1][1]</code> to 99. Through <code>flat</code> the same int is <code>flat[4]</code>, since 1 * 3 + 1 = 4. Look at the Bytes panel: the fifth group of 4 bytes is now <code>63 00 00 00</code>.</p>', bytes: 'grid' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: change the size to <code>int grid[3][2]</code> and the loop limits to match. The same six numbers are stored in a different shape, and the Bytes panel shows how the rows now break every 8 bytes.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'array-chars', unit: 'Arrays', title: 'Arrays of char and the NUL',
  blurb: 'A string is a char array that ends in a 0 byte; the array can be longer than the string.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a string is an array of char ending in '\\0' */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char word[8];          /* room for 7 letters and the NUL */
    char hi[] = "hi";      /* size 3: 'h', 'i', '\\0' */

    word[0] = 'C';
    word[1] = 'a';
    word[2] = 't';
    word[3] = '\\0';        /* the end marker: a byte with value 0 */

    printf("%s: strlen %u, sizeof %u\\n", word, (unsigned)strlen(word), (unsigned)sizeof word);
    printf("%s: strlen %u, sizeof %u\\n", hi, (unsigned)strlen(hi), (unsigned)sizeof hi);
    word[3] = 's';
    word[4] = '\\0';
    printf("%s\\n", word);
    word[1] = '\\0';
    printf("%s\\n", word);
    return 0;
}
`,
  },
  intro: '<p>C has no separate string type. A string is a run of <code>char</code>s in an array, ended by a byte whose value is 0, written <code>\'\\0\'</code> and called the <b>NUL</b>. Every function that handles strings, like <code>printf</code> with <code>%s</code> and <code>strlen</code>, walks along until it meets that 0.</p><p>The array is the room; the string is what is in it up to the NUL.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['word', 'hi'], line: 8, text: '<p><code>word</code> has 8 chars, all red. <code>hi</code> is not set yet either: line 8 will copy <code>"hi"</code> into it when it runs.</p>' },
    { do: 'over', line: 10, check: "hi[0] == 'h' && hi[2] == '\\0' && sizeof hi == 3", text: '<p><code>char hi[] = "hi";</code> left the size empty, so the compiler counted: two letters and the NUL, 3 bytes. The memory picture shows <code>\'h\'</code>, <code>\'i\'</code> and <code>\'\\0\'</code>.</p><p>This is a copy in <code>main</code>\'s frame, so you may change its letters.</p>' },
    { do: { to: 15 }, line: 15, check: "word[0] == 'C' && word[3] == '\\0'", bytes: 'word', text: '<p><code>word</code> now starts with <code>C a t \\0</code>. In the Bytes panel these are <code>43 61 74 00</code>: each char is its character code, and the NUL really is the number 0. The last four bytes of <code>word</code> are still unset.</p>' },
    { do: 'over', show: 'term', line: 16, output: 'Cat: strlen 3, sizeof 8', text: '<p><code>strlen</code> counts letters up to the NUL: 3. <code>sizeof</code> is the size of the array: 8. They answer different questions.</p>' },
    { do: 'over', line: 17, output: 'hi: strlen 2, sizeof 3', text: '<p>For <code>hi</code> the array is just big enough: 2 letters plus the NUL.</p>' },
    { do: { to: 19 }, line: 19, check: "word[3] == 's' && word[4] == '\\0'", text: '<p>Line 17 put an <code>s</code> where the NUL was, and line 18 put a new NUL one place further on. Moving the NUL is how a string grows: the room was already there.</p>', bytes: 'word' },
    { do: 'over', line: 20, output: 'Cats', text: '<p><code>printf</code> printed <code>Cats</code> and stopped at the NUL in <code>word[4]</code>.</p>' },
    { do: 'over', line: 21, check: "word[1] == '\\0' && word[2] == 't'", text: '<p><code>word[1] = \'\\0\';</code> put an end marker after the <code>C</code>. The letters <code>t</code> and <code>s</code> are still in memory, but no string function will ever look past the first NUL.</p>' },
    { do: 'over', output: 'C\n', text: '<p>So <code>printf</code> printed only <code>C</code>.</p><div class="note">Always leave room for the NUL. A word of 7 letters needs <code>char w[8]</code>. If the NUL is missing, <code>printf</code> and <code>strlen</code> keep walking into whatever comes after the array.</div>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: debug again, stop at line 15 and set <code>word[3]</code> to 65 (the code for <code>A</code>) in the memory picture. With the NUL gone, <code>%s</code> keeps going past the letters into bytes that were never set, and prints whatever it finds there.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'array-init', unit: 'Arrays', title: 'Initialisers and the missing zeros',
  blurb: 'A brace list sets the first elements; every element it leaves out becomes 0.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: initialisers, and the zeros C adds for you */
#include <stdio.h>

int g[4];                      /* a global: all zero without asking */

int main(void)
{
    int full[4] = { 1, 2, 3, 4 };
    int part[4] = { 5, 6 };    /* part[2] and part[3] become 0 */
    int zero[4] = { 0 };       /* the usual way to clear an array */
    int sized[] = { 7, 8, 9 }; /* the list sets the size: 3 */
    char name[6] = "ab";       /* 'a', 'b', then four zero bytes */
    int none[4];               /* no initialiser: nothing is set */

    printf("%d %d %d %d\\n", part[0], part[1], part[2], part[3]);
    printf("sized has %u elements\\n", (unsigned)(sizeof sized / sizeof sized[0]));
    printf("g[3] = %d, zero[3] = %d, full[3] = %d\\n", g[3], zero[3], full[3]);
    none[0] = name[1];
    return none[0] - 'b';
}
`,
  },
  intro: '<p>An array can be given values where it is declared, with a list in braces. The rules are short:</p><ul><li>Values go to the elements in order, from index 0.</li><li>If the list is shorter than the array, <b>every remaining element is set to 0</b>.</li><li>If the size is left empty, the list decides it.</li><li>With no list at all, a local array is not set, but a global one is all zeros.</li></ul>',
  steps: [
    { do: 'start', show: 'memory', expand: ['g', 'full', 'part'], line: 8, text: '<p>Look at the globals area of the memory picture: <code>g</code> lives there, not in <code>main</code>\'s frame, and its four ints are already 0. Globals and <code>static</code> variables are always zeroed before <code>main</code> starts.</p><p>Everything in <code>main</code>\'s frame is still red.</p>' },
    { do: 'over', line: 9, check: 'full[0] == 1 && full[3] == 4', text: '<p><code>full</code> got one value per element: 1, 2, 3, 4.</p>' },
    { do: 'over', line: 10, check: 'part[0] == 5 && part[1] == 6 && part[2] == 0 && part[3] == 0', text: '<p><code>part</code> had only two values in its list. The first two elements are 5 and 6, and the other two are 0, not red: the compiler filled them in.</p>' },
    { do: 'over', line: 11, expand: ['zero'], check: 'zero[0] == 0 && zero[3] == 0', text: '<p><code>{ 0 }</code> gives the first element 0 and, by the same rule, all the others too. It is the standard way to start with a clean array.</p><div class="note">Note what <code>{ 1 }</code> would do: the first element 1 and the rest 0. It does not set every element to 1.</div>' },
    { do: 'over', line: 12, expand: ['sized'], check: 'sized[2] == 9 && sizeof sized == 12', text: '<p><code>sized</code> had its size left out, so the three values made it an array of 3 ints, 12 bytes.</p>' },
    { do: 'over', line: 15, expand: ['name', 'none'], check: "name[1] == 'b' && name[2] == '\\0' && name[5] == '\\0'", text: '<p>A string literal is also an initialiser for a char array. <code>name</code> has 6 bytes: <code>\'a\'</code>, <code>\'b\'</code>, and then four zero bytes, the NUL plus the padding of the same rule.</p><p><code>none</code> has no initialiser, so its four ints are still red: they hold whatever was in that stack memory before.</p>' },
    { do: 'over', show: 'term', output: '5 6 0 0', text: '<p>The printed values confirm what the memory picture showed.</p>' },
    { do: { to: 18 }, line: 18, output: 'g[3] = 0, zero[3] = 0, full[3] = 4', text: '<p><code>sized</code> has 3 elements, and the zeros in <code>g</code> and <code>zero</code> came from two different rules: global storage is always zeroed, and a partial list zeroes the rest.</p>' },
    { do: { edit: [8, '    int full[4] = { 1, 2, 3, 4, 5 };'] }, text: '<p>What if the list is too long? This step changed line 8 to give five values to an array of four.</p>' },
    { do: 'build', show: 'probs', errors: 'excess elements in array initializer', text: '<p>The compiler reports <i>excess elements in array initializer</i>. The fifth value has nowhere to go and is thrown away. Always read the Problems panel: this is a real mistake even though it is only a warning.</p>' },
    { do: { edit: [8, '    int full[4] = { 1, 2, 3, 4 };'] }, text: '<p>Line 8 is put back as it was.</p><div class="try">Try it: make <code>name</code> <code>char name[2] = "ab";</code>. C89 allows it (there is exactly room for the letters, so no NUL is stored), and <code>name</code> is then not a string. Step to line 15 and look at its bytes.</div>' },
  ],
});
