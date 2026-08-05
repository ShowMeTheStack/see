// Unit 14: the standard library.
SEE.Lessons.add({
  id: 'files', unit: 'The standard library', title: 'Files: fopen, fprintf, fgets',
  blurb: 'Write a file in /tmp, read it back line by line, and see the FILE that describes each one.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: write a file, then read it back */
#include <stdio.h>

int main(void)
{
    FILE *out;
    FILE *in;
    char line[32];
    int n = 0;

    out = fopen("/tmp/shopping.txt", "w");    /* "w": make it new and empty */
    if (out == NULL) {
        perror("/tmp/shopping.txt");
        return 1;
    }
    fprintf(out, "%d apples\\n", 6);
    fprintf(out, "%d pears\\n", 4);
    fclose(out);                              /* write out what is left, let go */

    in = fopen("/tmp/shopping.txt", "r");     /* "r": read from the start */
    if (in == NULL) {
        perror("/tmp/shopping.txt");
        return 1;
    }
    while (fgets(line, sizeof line, in) != NULL) {
        n++;
        printf("line %d: %s", n, line);
    }
    fclose(in);
    return 0;
}
`,
  },
  intro: '<p>A file is reached through a <code>FILE *</code>, a pointer to a structure the C library keeps for each open file. <code>fopen</code> opens a file and gives you that pointer, or <code>NULL</code> when it cannot. <code>fprintf</code> works like <code>printf</code> but writes to the file, <code>fgets</code> reads one line, and <code>fclose</code> finishes with it.</p><p><code>/tmp</code> is a scratch folder in See\'s file panel, a safe place to make files.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 9, text: '<p>Two <code>FILE</code> pointers, <code>out</code> and <code>in</code>, and a 32-byte <code>line</code> to read into. All red.</p>' },
    { do: 'over', times: 2, line: 12, check: 'out != 0', text: '<p><code>fopen</code> made <code>/tmp/shopping.txt</code>, empty, and returned a pointer. Its arrow goes to a <code>FILE</code> in the C library\'s own globals, which the memory picture hides at first.</p><div class="try">Try it: tick <b>library frames</b> at the top of the memory picture. The C library\'s globals appear, among them <code>_iob</code>, the table of <code>FILE</code> structures: [0] is stdin, [1] stdout, [2] stderr, and the next free one is <code>out</code>\'s.</div>' },
    { do: 'over', line: 16, text: '<p><code>out</code> is not NULL, so the error lines are skipped. Always check: <code>fopen</code> fails when the folder is missing or you may not write there, and using a NULL <code>FILE *</code> crashes.</p>' },
    { do: 'over', times: 2, line: 18, text: '<p>Two lines written with <code>fprintf</code>. The terminal shows nothing: the text went to the file. In the <code>FILE</code> structure, <code>_cnt</code> counts the bytes waiting in the library\'s buffer and <code>_pos</code> is the position in the file.</p>' },
    { do: 'over', line: 20, text: '<p><code>fclose</code> wrote the buffered bytes into the file and marked the <code>FILE</code> as closed. Open <code>/tmp</code> in the file panel: <code>shopping.txt</code> is there, and you can open it in the editor.</p>' },
    { do: 'over', times: 2, line: 25, check: 'in != 0', text: '<p>Opened again, this time for reading. The library may well use the same <code>FILE</code> slot that <code>out</code> had, since that one is free again.</p>' },
    { do: 'over', line: 26, check: "line[0] == '6' && line[8] == '\\n' && line[9] == '\\0'", expand: ['line'], text: '<p><code>fgets</code> read one line into <code>line</code>: <code>6 apples</code>, the newline, and then a NUL. It stops after the newline, or when the array is full: <code>sizeof line</code> tells it there are 32 bytes, so it never writes past the end.</p>' },
    { do: 'over', times: 2, line: 25, output: 'line 1: 6 apples', text: '<p>The line printed. <code>printf</code> has no <code>\\n</code> of its own: the newline came from the file.</p>' },
    { do: { to: 29 }, line: 29, output: 'line 2: 4 pears', check: 'n == 2', text: '<p>After the second line, <code>fgets</code> found the end of the file and returned NULL, which ended the loop. The bytes of <code>line</code> still hold "4 pears": NULL from <code>fgets</code> leaves them as they were.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The file stays in <code>/tmp</code> after the program ends.</p><div class="try">Try it: change the <code>"w"</code> on line 11 to <code>"a"</code> (append) and run the program twice. Each run adds two lines at the end instead of starting the file again.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'errno-perror', unit: 'The standard library', title: 'errno and perror',
  blurb: 'When a library call fails it says so in its return value, and says why in errno.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: when a library call fails, errno says why */
#include <stdio.h>
#include <errno.h>
#include <string.h>

int main(void)
{
    FILE *f;
    int saved;

    errno = 0;
    f = fopen("/no/such/folder/list.txt", "r");
    saved = errno;              /* copy it at once: the next call may change it */
    if (f == NULL) {
        printf("fopen gave NULL, errno is %d\\n", saved);
        printf("strerror says: %s\\n", strerror(saved));
        perror("list.txt");
    }
    return 0;
}
`,
  },
  intro: '<p>Library functions report failure in their return value: <code>fopen</code> returns <code>NULL</code>, many others return <code>-1</code> or <code>EOF</code>. To say <b>why</b>, they also store a number in the global <code>errno</code>, declared in <code>&lt;errno.h&gt;</code>.</p><p><code>strerror(n)</code> turns the number into a message, and <code>perror("text")</code> prints your text, a colon, and the message for the current <code>errno</code>, on stderr.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 11, text: '<p>This program opens a file in a folder that does not exist, on purpose.</p>' },
    { do: 'over', line: 12, check: 'errno == 0', text: '<p><code>errno</code> is a global like any other, so the debugger can show it; type <code>errno</code> into the Watch panel to follow it. Setting it to 0 first is a good habit: a successful call does not have to clear it.</p>', watch: ['errno'] },
    { do: 'over', line: 13, check: 'f == 0 && errno == 2', show: 'watch', text: '<p><code>fopen</code> returned NULL, and <code>errno</code> became 2. On Linux, 2 is <code>ENOENT</code>, "no such file or directory". Each error has a name like this in <code>&lt;errno.h&gt;</code>.</p>' },
    { do: 'over', line: 14, check: 'saved == 2', text: '<p>The number is copied into <code>saved</code> straight away. Any later library call, even a <code>printf</code>, is allowed to change <code>errno</code>.</p>' },
    { do: 'over', times: 2, line: 16, show: 'term', output: 'errno is 2', text: '<p>The raw number is not much use to a person reading it.</p>' },
    { do: 'over', line: 17, output: 'strerror says: No such file or directory', text: '<p><code>strerror</code> gave the message that goes with 2.</p>' },
    { do: 'over', output: 'list.txt: No such file or directory', text: '<p><code>perror</code> did the same in one call: your text, a colon, the message. Its output goes to stderr, the stream for errors, so it still reaches the screen when normal output is sent to a file.</p><div class="note">Check the return value first, and only then look at <code>errno</code>. <code>errno</code> alone does not tell you that a call failed.</div>' },
    { do: 'continue', state: 'exited', text: '<p>The program handled the failure and ended normally.</p><div class="try">Try it: change the file name on line 12 to <code>"/tmp"</code>, which is a folder, and run again. <code>errno</code> is now a different number with a different message.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'stdarg', unit: 'The standard library', title: 'Variadic functions with stdarg.h',
  blurb: 'A function that takes any number of arguments, and the va_list that walks along them on the stack.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a function that takes any number of ints */
#include <stdio.h>
#include <stdarg.h>

int total(int count, ...)
{
    va_list ap;
    int sum = 0;
    int i;

    va_start(ap, count);           /* ap points just past count */
    for (i = 0; i < count; i++)
        sum += va_arg(ap, int);    /* read an int there, move ap on by 4 */
    va_end(ap);
    return sum;
}

int main(void)
{
    int t;

    t = total(3, 10, 20, 30);
    printf("total %d\\n", t);
    printf("total %d\\n", total(5, 1, 2, 3, 4, 5));
    return 0;
}
`,
  },
  intro: '<p><code>printf</code> takes any number of arguments. Your own functions can too: write <code>...</code> after the last named parameter. Inside, <code>&lt;stdarg.h&gt;</code> gives a <code>va_list</code> and three macros to step through the extra arguments.</p><p>The function cannot ask how many arguments there are or what types they have. It must be told, here by <code>count</code>; <code>printf</code> learns it from the format string.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 22, text: '<p>Line 22 calls <code>total</code> with four ints: the count, 3, and then 10, 20 and 30.</p>' },
    { do: 'into', line: 8, check: 'count == 3', text: '<p>In <code>total</code>\'s frame the memory picture names only <code>count</code>: the compiler has no names for the rest. But the caller pushed all four arguments, one after another, each 4 bytes above the last.</p>' },
    { line: 8, bytes: 'count', text: '<p>The bytes view starts at <code>count</code>: <code>03 00 00 00</code>, then <code>0a 00 00 00</code> (10), <code>14 00 00 00</code> (20) and <code>1e 00 00 00</code> (30). The unnamed arguments are right there, just above <code>count</code>.</p>' },
    { do: 'over', times: 2, line: 12, check: 'ap == (char *)&count + 4', text: '<p><code>va_start(ap, count)</code> set <code>ap</code> to the address just past <code>count</code>: the first unnamed argument. In See, a <code>va_list</code> is simply a <code>char *</code>, and its arrow goes to the 10.</p>' },
    { do: 'over', line: 13, text: '<p>Now <code>va_arg(ap, int)</code> on line 13 will read an <code>int</code> where <code>ap</code> points, and move <code>ap</code> on by the size of an <code>int</code>.</p>' },
    { do: 'over', line: 12, check: 'sum == 10 && ap == (char *)&count + 8', text: '<p><code>sum</code> is 10, and <code>ap</code> is 4 bytes further on, pointing at the 20. Watch its arrow move along the arguments.</p>' },
    { do: { to: 14 }, line: 14, check: 'sum == 60 && ap == (char *)&count + 16', text: '<p>Three ints read: 60. <code>ap</code> now points past the last argument. If <code>count</code> had said 4, <code>va_arg</code> would have read whatever was there, and nothing would have stopped it.</p>' },
    { do: 'out', line: 22, text: '<p>Back in <code>main</code> with the result.</p>' },
    { do: 'over', line: 23, check: 't == 60', text: '<p><code>t</code> is 60.</p><div class="note">The type you give <code>va_arg</code> must match what was passed. A <code>char</code> or <code>short</code> argument arrives as an <code>int</code>, and a <code>float</code> as a <code>double</code>, so <code>va_arg(ap, char)</code> and <code>va_arg(ap, float)</code> are always wrong.</div>' },
    { do: 'continue', state: 'exited', show: 'term', output: 'total 15', text: '<p>The second call passed six ints and got 15.</p><div class="try">Try it: change the 3 on line 22 to 4 and debug again. <code>va_arg</code> reads a fourth value from the stack that was never an argument.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'setjmp-longjmp', unit: 'The standard library', title: 'setjmp and longjmp',
  blurb: 'longjmp jumps back to a saved setjmp, throwing away every frame in between.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: longjmp jumps back to a setjmp, over every frame between */
#include <stdio.h>
#include <setjmp.h>

jmp_buf on_error;                  /* where to come back to */
int bad_value = 0;

void check(int value)
{
    if (value < 0) {
        bad_value = value;
        longjmp(on_error, 1);      /* never returns */
    }
    printf("%d is fine\\n", value);
}

void process(int a, int b)
{
    check(a);
    check(b);
    printf("processed both\\n");
}

int main(void)
{
    if (setjmp(on_error) == 0) {   /* 0 the first time */
        process(5, -7);
        printf("not reached\\n");
    } else {                       /* here again after the longjmp */
        printf("came back: %d is not allowed\\n", bad_value);
    }
    return 0;
}
`,
  },
  intro: '<p><code>setjmp(buf)</code> saves "where we are" in a <code>jmp_buf</code>: which frame is running, the stack and frame pointers, and the place in the code. It returns 0.</p><p>Later, <code>longjmp(buf, 1)</code> goes back there from any depth of calls. All the frames in between are dropped, and <code>setjmp</code> appears to return a second time, now with 1. C uses this where other languages throw an exception.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 26, expand: ['on_error'], check: 'on_error[0] == 0', text: '<p><code>on_error</code> is a global <code>jmp_buf</code>, an array of 6 ints, all 0 for now.</p>' },
    { do: 'over', line: 27, check: 'on_error[0] != 0', text: '<p><code>setjmp</code> filled <code>on_error</code> and returned 0, so we are in the first branch. The numbers in the array include addresses: a stack address near <code>0xbfff...</code> for <code>main</code>\'s frame, and a code address for the place to come back to.</p>' },
    { do: 'into', line: 19, check: 'a == 5 && b == -7', text: '<p>Into <code>process</code>, a frame below <code>main</code>\'s. It checks both of its arguments.</p>' },
    { do: 'over', line: 20, show: 'term', output: '5 is fine', text: '<p>5 passed the check: <code>check(5)</code> printed and returned normally.</p>' },
    { do: 'into', line: 10, check: 'value == -7', show: 'memory', text: '<p>Three frames now: <code>main</code>, <code>process</code>, <code>check</code>. <code>value</code> is -7, so <code>check</code> is about to give up.</p>' },
    { do: 'over', times: 2, line: 12, check: 'bad_value == -7', text: '<p>The bad value is kept in a global, and line 12 is next. Look at the stack before you step: three frames.</p>' },
    { do: 'over', line: 30, text: '<p><code>longjmp</code> did not return to <code>check</code>. The frames of <code>check</code> and <code>process</code> are gone, and we are back in <code>main</code>, on the <code>else</code> side: <code>setjmp</code> returned again, this time with 1.</p><p>Line 20, the rest of <code>process</code> and line 28 never ran.</p>' },
    { do: 'over', show: 'term', output: 'came back: -7 is not allowed', text: '<p>The program recovered at the place that knew what to do about the error.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">The jump only works back to a function that is still running. If the function that called <code>setjmp</code> has returned, its frame is gone and <code>longjmp</code> to it is undefined. Local variables of that function that were changed after <code>setjmp</code> may also not keep their new values unless they are declared <code>volatile</code>; that is why this program keeps <code>bad_value</code> in a global.</div><div class="try">Try it: change the -7 on line 27 to 7 and run. Both checks pass, and "processed both" and "not reached" are printed.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'qsort-bsearch', unit: 'The standard library', title: 'qsort and bsearch',
  blurb: 'Sort any array with qsort and a comparison function, then find things fast with bsearch.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: sort an array with qsort, then search it with bsearch */
#include <stdio.h>
#include <stdlib.h>

int cmp_int(const void *a, const void *b)
{
    int x = *(const int *)a;
    int y = *(const int *)b;

    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
}

int main(void)
{
    int v[6] = { 42, 7, 19, 3, 88, 25 };
    int key = 19;
    int *found;
    int i;

    qsort(v, 6, sizeof v[0], cmp_int);
    for (i = 0; i < 6; i++)
        printf("%d ", v[i]);
    printf("\\n");
    found = bsearch(&key, v, 6, sizeof v[0], cmp_int);
    if (found != NULL)
        printf("found %d at index %d\\n", *found, (int)(found - v));
    key = 50;
    found = bsearch(&key, v, 6, sizeof v[0], cmp_int);
    printf("50 is %s\\n", found == NULL ? "not there" : "there");
    return 0;
}
`,
  },
  intro: '<p><code>qsort</code> sorts an array of anything. It does not know the element type, so you tell it the start, the number of elements, the size of one, and a <b>comparison function</b> that gets pointers to two elements and returns less than 0, 0, or more than 0.</p><p><code>bsearch</code> finds an element in a <b>sorted</b> array by halving the range each time, using the same comparison.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 17, text: '<p>Six ints in no order, about to go into <code>v</code>.</p>' },
    { do: 'over', times: 2, line: 22, expand: ['v'], check: 'v[0] == 42 && key == 19', text: '<p><code>v</code> holds 42, 7, 19, 3, 88, 25. Line 22 passes <code>qsort</code> the array, 6, the 4 bytes of one int, and the name <code>cmp_int</code>, which is a pointer to that function.</p>' },
    { do: 'into', line: 7, text: '<p>Step into went through <code>qsort</code> (part of the C library) and stopped in <code>cmp_int</code>, called by <code>qsort</code>. <code>a</code> and <code>b</code> are <code>const void *</code>: follow their arrows to two elements of <code>v</code>.</p><p>A <code>void *</code> cannot be read directly, so lines 7 and 8 first turn each into a <code>const int *</code>.</p>' },
    { do: 'over', times: 2, line: 10, text: '<p><code>x</code> and <code>y</code> hold the two values. The function returns -1, 1 or 0. Writing <code>return x - y;</code> looks shorter, but it can overflow when the numbers are far apart, and then the sign is wrong.</p>' },
    { do: { to: 23 }, line: 23, check: 'v[0] == 3 && v[1] == 7 && v[2] == 19 && v[5] == 88', text: '<p><code>qsort</code> called <code>cmp_int</code> many times and moved the elements as the answers told it. <code>v</code> is now 3, 7, 19, 25, 42, 88.</p>' },
    { do: { to: 26 }, line: 26, show: 'term', output: '3 7 19 25 42 88', text: '<p>The sorted array printed. Now <code>bsearch</code> looks for <code>key</code>. It takes a pointer to the key, so it can compare it with the same function as the elements.</p>' },
    { do: 'over', line: 27, check: 'found == &v[2]', show: 'memory', text: '<p><code>found</code> points <b>into</b> the array, at <code>v[2]</code>: follow its arrow. It does not return the index; <code>found - v</code> works it out by pointer subtraction.</p>' },
    { do: 'over', line: 28, text: '<p><code>found</code> is not NULL, so line 28 prints.</p>' },
    { do: 'over', line: 29, output: 'found 19 at index 2', text: '<p>19 is at index 2: <code>found - v</code> counts elements, not bytes.</p>' },
    { do: { to: 31 }, line: 31, check: 'found == 0', text: '<p>50 is not in the array, so <code>bsearch</code> returned NULL. With 6 elements it needed at most 3 comparisons to be sure; with a million, about 20.</p>' },
    { do: 'continue', state: 'exited', output: '50 is not there', text: '<div class="note"><code>bsearch</code> only works on an array sorted with the same order as its comparison. On an unsorted array it can miss an element that is there.</div><div class="try">Try it: change line 10 to <code>if (x < y) return 1;</code> and line 11 to <code>if (x > y) return -1;</code>. The array is sorted from big to small.</div>' },
  ],
});
