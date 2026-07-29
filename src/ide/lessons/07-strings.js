// Unit 7: strings, byte by byte.
SEE.Lessons.add({
  id: 'string-bytes', unit: 'Strings', title: 'A string is chars and a NUL',
  blurb: 'C has no string type: a string is a row of chars ended by a zero byte.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a string is chars followed by a NUL byte */
#include <stdio.h>

int main(void)
{
    char word[6] = "hello";   /* 5 letters + 1 NUL = 6 bytes */
    char cut[6];

    cut[0] = 'h';
    cut[1] = 'i';
    cut[2] = '\\0';            /* without this, printf would not know where to stop */
    printf("%s and %s\\n", word, cut);
    word[2] = '\\0';           /* end the string early */
    printf("%s\\n", word);
    printf("%d bytes\\n", (int)sizeof word);
    return 0;
}
`,
  },
  intro: '<p>In C a <b>string</b> is not a type of its own. It is a row of <code>char</code>s in memory, followed by a byte with the value 0, written <code>\'\\0\'</code> and called <b>NUL</b>. Every function that handles strings finds the end by looking for that zero.</p><p>This lesson looks at the bytes themselves.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p><code>word</code> and <code>cut</code> are two arrays of 6 chars in <code>main</code>\'s frame, all red: nothing is in them yet.</p>', expand: ['word', 'cut'] },
    { do: 'over', bytes: 'word', check: "word[0] == 'h' && word[5] == '\\0'", text: '<p>The <b>Bytes</b> view shows the 6 bytes of <code>word</code>: <code>68 65 6c 6c 6f 00</code>. Those are the codes of h, e, l, l, o, and then the 0 that ends the string.</p><p>The text <code>"hello"</code> has 5 letters, but needs 6 bytes. The compiler added the NUL for us.</p>' },
    { do: { to: 11 }, line: 11, check: "cut[1] == 'i'", text: '<p>Lines 9 and 10 put two letters into <code>cut</code>. Its other bytes are still red: nobody has written them.</p><p>At this moment <code>cut</code> is <b>not</b> a string: there is no NUL after "hi", so nothing says where it ends.</p>' },
    { do: 'over', check: "cut[2] == '\\0'", text: '<p>Now <code>cut[2]</code> is 0, and <code>cut</code> holds the string "hi". Bytes 3 to 5 are still red, but that does not matter: reading stops at the NUL.</p>' },
    { do: 'over', show: 'term', output: 'hello and hi', text: '<p><code>printf</code> with <code>%s</code> printed chars one by one from the address it was given, until it met a 0 byte.</p>' },
    { do: 'over', bytes: 'word', check: "word[2] == '\\0' && word[3] == 'l'", text: '<p>Line 13 put a NUL into <code>word[2]</code>. The bytes are now <code>68 65 00 6c 6f 00</code>: the "lo" is still there, but it is after the first NUL.</p>' },
    { do: 'over', output: 'he\n', text: '<p>So the string is now just "he". Everything after the first zero byte is ignored.</p>' },
    { do: 'over', output: '6 bytes', text: '<p><code>sizeof word</code> is still 6: the array did not change size. The length of the <b>string</b> in it is a different thing, decided by where the NUL is.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="note">A string in C is "some chars, then a 0". Forget the 0 and functions like <code>printf</code> keep reading past your array into whatever comes next.</div><div class="try">Try it: change line 11 to <code>cut[2] = \'!\';</code> and debug again. See warns about each byte read before it was set, and then stops <code>printf</code> when it runs off the end of <code>cut</code>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'string-array-vs-pointer', unit: 'Strings', title: 'char s[] versus char *p',
  blurb: 'char s[] = "hi" copies the text onto the stack; char *p = "hi" points into read-only data.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: an array copy versus a pointer to a literal */
#include <stdio.h>

int main(void)
{
    char s[] = "hi";      /* an array of 3 chars on the stack, copied from the literal */
    char *p = "hi";       /* a pointer on the stack, pointing into read-only data */

    s[0] = 'H';           /* fine: s is our own copy */
    printf("%s %s\\n", s, p);
    printf("sizeof s = %d, sizeof p = %d\\n", (int)sizeof s, (int)sizeof p);
    p = s;                /* a pointer can be pointed somewhere else */
    printf("%s %s\\n", s, p);
    return 0;
}
`,
  },
  intro: '<p>Lines 6 and 7 look almost the same, and both print "hi". In memory they are very different.</p><ul><li><code>char s[] = "hi";</code> makes an <b>array</b> of 3 chars in <code>main</code>\'s frame and copies the letters into it.</li><li><code>char *p = "hi";</code> makes a <b>pointer</b> in the frame. The letters stay in the string literal, in read-only data.</li></ul>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>In <code>main</code>\'s frame: <code>s</code>, 3 bytes, and <code>p</code>, 4 bytes (the size of an address). Both red.</p>', expand: ['s'] },
    { do: 'over', check: "s[0] == 'h' && s[2] == '\\0'", text: '<p><code>s</code> now holds <code>h</code>, <code>i</code> and the NUL. These are our own bytes, near <code>0xbfffff00</code> on the stack.</p>' },
    { do: 'over', check: "p[0] == 'h' && p != s", text: '<p><code>p</code> holds an address near <code>0x08048500</code>, and its arrow leaves the stack and ends in <b>read-only data</b>, at the literal <code>"hi"</code>.</p><p>So there are two "hi"s in memory: the literal, and the copy in <code>s</code>. <code>p</code> and <code>s</code> are different addresses.</p>' },
    { do: 'over', check: "s[0] == 'H'", text: '<p><code>s[0] = \'H\';</code> changed our copy. The literal that <code>p</code> points at is untouched. Writing through <code>p</code> instead would crash: the next lesson shows it.</p>' },
    { do: 'over', show: 'term', output: 'Hi hi', text: '<p>The copy says "Hi", the literal still says "hi".</p>' },
    { do: 'over', output: 'sizeof s = 3, sizeof p = 4', text: '<p><code>sizeof s</code> is 3: the whole array. <code>sizeof p</code> is 4: just the pointer, however long the text it points at.</p>' },
    { do: 'over', check: 'p == s', text: '<p><code>p = s;</code> moved <code>p</code>\'s arrow from read-only data to the array on the stack. A pointer can be pointed anywhere.</p><p>An array cannot: <code>s = p;</code> would be the error <i>assignment to expression with array type</i>. The name <code>s</code> always means those same 3 bytes.</p>' },
    { do: 'over', output: 'Hi Hi', text: '<p>Both now print the copy on the stack, because both lead to the same bytes.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">Use <code>char s[] = "..."</code> when you want to change the text. Use <code>const char *p = "..."</code> when you only read it; the <code>const</code> makes the compiler stop any write.</div><div class="try">Try it: step back (F8) to line 9 and look at the two arrows and boxes again.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'string-literal-write', unit: 'Strings', title: 'Writing into a literal',
  blurb: 'A string literal is read-only: writing through a char * that points at one crashes.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a string literal is read-only */
#include <stdio.h>

int main(void)
{
    char copy[] = "cat";
    char *lit = "cat";

    copy[0] = 'b';        /* fine: the array is on the stack */
    printf("%s\\n", copy);
    lit[0] = 'b';         /* compiles, but the literal is in read-only data */
    printf("%s\\n", lit);
    return 0;
}
`,
  },
  intro: '<p>For historical reasons, a string literal in C has type <code>char[]</code>, not <code>const char[]</code>, so the compiler lets you store its address in a plain <code>char *</code> and does not stop you writing through it.</p><p>But the literal itself is in read-only data, and the machine does.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>As in the previous lesson, <code>copy</code> will be an array on the stack and <code>lit</code> a pointer into read-only data.</p>', expand: ['copy'] },
    { do: { to: 9 }, line: 9, check: "lit[0] == 'c' && copy[0] == 'c'", text: '<p><code>lit</code>\'s arrow goes to the literal "cat" in read-only data. <code>copy</code> holds its own "cat".</p>' },
    { do: 'over', check: "copy[0] == 'b'", text: '<p>Writing into <code>copy</code> is fine: it is ordinary stack memory, now "bat".</p>' },
    { do: 'over', show: 'term', output: 'bat', line: 11, text: '<p>Printed "bat". Line 11 is next and writes through <code>lit</code>.</p>' },
    { do: 'over', state: 'faulted', text: '<p><b>Segmentation fault</b>: <i>write to read-only memory (a string literal or other constant data)</i>. The program stops at line 11.</p><p>On a real computer the same thing happens: literals sit in a part of memory the operating system marks read-only.</p>' },
    { do: { edit: [7, '    const char *lit = "cat";'] }, state: 'faulted', text: '<p>The fix is to say what is true: the chars are const. Line 7 now reads <code>const char *lit = "cat";</code>.</p>' },
    { do: 'build', show: 'probs', errors: 'read-only location', state: 'faulted', text: '<p>Now the compiler catches the mistake before the program runs: <i>assignment of read-only location</i> on line 11.</p><div class="note">Always point at a string literal with a <code>const char *</code>. Then a write is a compile error instead of a crash.</div>' },
    { do: { edit: [11, '    lit = copy;           /* point at the copy instead */'] }, state: 'faulted', text: '<p>Line 11 now points <code>lit</code> at the copy instead of writing into the literal. Storing a <code>char *</code> into a <code>const char *</code> is always allowed.</p>' },
    { do: 'start', line: 6, text: '<p>Rebuilt with both changes and started again: no errors.</p>' },
    { do: 'continue', show: 'term', state: 'exited', output: 'bat\nbat', text: '<p>Both lines print "bat", because <code>lit</code> now points at the copy.</p><div class="try">Try it: put the original line 7 back and build. The program builds again with no warning at all, which is why the <code>const</code> habit matters.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'string-strlen', unit: 'Strings', title: 'strlen walks to the NUL',
  blurb: 'strlen counts chars until it finds the zero byte; it knows nothing about the array size.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: strlen walks to the NUL */
#include <stdio.h>
#include <string.h>

/* the same job as strlen, by hand */
int my_strlen(const char *s)
{
    int n = 0;
    while (s[n] != '\\0')
        n++;
    return n;
}

int main(void)
{
    char name[16] = "Ada";
    int a, b;

    a = my_strlen(name);
    b = (int)strlen(name);
    printf("%d %d %d\\n", a, b, (int)sizeof name);
    name[3] = '!';            /* overwrite the NUL ... */
    name[4] = '\\0';           /* ... and put a new one after it */
    printf("%s has %d chars\\n", name, (int)strlen(name));
    return 0;
}
`,
  },
  intro: '<p><code>strlen(s)</code> answers "how many chars come before the first NUL?". It starts at the address it is given and counts, one byte at a time, until it reads a 0.</p><p><code>my_strlen</code> does exactly the same, so you can watch it.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 16, text: '<p><code>name</code> is an array of 16 chars. Line 16 will fill it with "Ada", and because the initialiser is shorter than the array, C fills the rest with zeros.</p>', expand: ['name'] },
    { do: 'over', check: "name[3] == '\\0' && name[15] == '\\0'", text: '<p><code>name</code> holds A, d, a, then 13 zero bytes. Only the first zero matters for the string.</p>' },
    { do: 'into', line: 8, text: '<p>Inside <code>my_strlen</code>. Its <code>s</code> points at <code>name</code> in <code>main</code>\'s frame: the arrow goes down from the new frame.</p><p><code>s</code> is only an address. <code>my_strlen</code> cannot know that the array is 16 bytes long; all it can do is look for the NUL.</p>' },
    { do: 'over', times: 2, line: 10, check: 'n == 0', text: '<p>Line 9 tested <code>s[0]</code>: it is \'A\', not the NUL, so the loop body on line 10 runs next.</p>' },
    { do: 'over', times: 2, line: 10, check: 'n == 1', text: '<p><code>n</code> is 1, and the test found \'d\' at <code>s[1]</code>. Each pass reads one more byte.</p>' },
    { do: { to: 11 }, line: 11, check: "n == 3 && s[n] == '\\0'", text: '<p>At <code>s[3]</code> the test found the NUL and the loop ended. <code>n</code> is 3: three chars before the zero.</p>' },
    { do: 'out', text: '<p>Back in <code>main</code>, with the result of <code>my_strlen</code> about to be stored in <code>a</code>.</p>' },
    { do: { to: 22 }, show: 'term', line: 22, output: '3 3 16', check: 'a == 3 && b == 3', text: '<p>The library\'s <code>strlen</code> agrees: 3. <code>sizeof name</code> is 16, the size of the array, which is a different question.</p>' },
    { do: 'over', times: 2, check: "name[3] == '!' && name[4] == '\\0'", text: '<p>The NUL at <code>name[3]</code> was replaced by \'!\', and a new NUL put at <code>name[4]</code>.</p>' },
    { do: 'over', output: 'Ada! has 4 chars', text: '<p>Now <code>strlen</code> walks one byte further before it finds a zero, and answers 4.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note"><code>strlen</code> does not include the NUL. To hold a string of length n you need n + 1 bytes.</div><div class="try">Try it: start again, stop at line 19 and set <code>name[3]</code> to 33 (the code of \'!\') in the memory picture. Then step into <code>my_strlen</code> and watch it run on to the next zero.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'string-strcpy-overflow', unit: 'Strings', title: 'strcpy and a buffer too small',
  blurb: 'strcpy copies until the NUL, whether or not the destination has room.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: strcpy trusts you to make the buffer big enough */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char big[16];
    char small[4];

    strcpy(big, "elephant");    /* 8 letters + NUL = 9 bytes: fits in 16 */
    printf("%s\\n", big);
    strcpy(small, "cat");       /* 3 letters + NUL = 4 bytes: just fits */
    printf("%s\\n", small);
    strcpy(small, big);         /* 9 bytes into 4: overflow */
    printf("%s\\n", small);
    return 0;
}
`,
  },
  intro: '<p><code>strcpy(dest, src)</code> copies the chars of <code>src</code>, and its NUL, to <code>dest</code>. It stops only at the NUL. It is never told how big <code>dest</code> is.</p><p>If the string does not fit, the extra bytes are written past the end of the array, over whatever is next. That is a <b>buffer overflow</b>, one of the most common and dangerous bugs in C.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 10, text: '<p>Two arrays in <code>main</code>\'s frame, 16 and 4 bytes, all red.</p><p>See leaves a small <b>guard</b> gap just past each array. Writing into it is caught at once, instead of quietly spoiling a neighbour.</p>', expand: ['big', 'small'] },
    { do: 'over', check: "big[7] == 't' && big[8] == '\\0'", text: '<p>9 bytes were copied into <code>big</code>: "elephant" and its NUL. Bytes 9 to 15 are still red.</p>' },
    { do: 'over', show: 'term', output: 'elephant', text: '<p>Printed "elephant": <code>printf</code> read <code>big</code> up to its NUL.</p>' },
    { do: 'over', check: "small[3] == '\\0'", text: '<p>"cat" needs 4 bytes with its NUL, and <code>small</code> has exactly 4. Every byte is used.</p>' },
    { do: 'over', output: 'cat', line: 14, text: '<p>Line 14 copies <code>big</code> into <code>small</code>. <code>strcpy</code> will try to write 9 bytes into a 4-byte array.</p>' },
    { do: 'over', state: 'faulted', text: '<p>Caught: <i>in strcpy(): write just past the end of \'small\' ... (buffer overflow)</i>. The fifth byte would have landed in the guard just past <code>small</code>.</p><p>A real C program has no guard. The bytes would overwrite other variables, or the saved return address of the function, and the program might carry on with wrong data.</p>' },
    { do: { edit: [14, "    strncpy(small, big, sizeof small - 1); small[sizeof small - 1] = '\\0';"] }, state: 'faulted', text: '<p>Line 14 now uses <code>strncpy</code> with a limit: at most <code>sizeof small - 1</code> chars, leaving room for the NUL.</p><p><code>strncpy</code> does not add a NUL when it stops at the limit, so the same line puts one in the last byte.</p>' },
    { do: 'start', line: 10, text: '<p>Rebuilt and started again with the safer copy.</p>' },
    { do: { to: 15 }, line: 15, check: "small[2] == 'e' && small[3] == '\\0'", text: '<p><code>small</code> holds "ele" and a NUL: the string was cut short, but nothing outside the array was touched.</p>' },
    { do: 'continue', show: 'term', state: 'exited', output: 'ele', text: '<p>The program printed the shortened copy and ended normally.</p><div class="note">Before every <code>strcpy</code>, ask: is <code>strlen(src) + 1</code> at most the size of the destination? If you cannot be sure, copy with a limit.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'string-strcmp', unit: 'Strings', title: 'strcmp versus ==',
  blurb: '== on two strings compares their addresses; strcmp compares their letters.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: compare strings with strcmp, not == */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[] = "pear";
    char b[] = "pear";
    char *c = a;
    int same_place, same_text, order;

    same_place = (a == b);           /* compares two addresses */
    same_text = (strcmp(a, b) == 0); /* compares the letters */
    order = strcmp("apple", "pear"); /* negative: apple comes first */
    printf("%d %d %d\\n", same_place, same_text, c == a);
    printf("%d\\n", order < 0);
    return 0;
}
`,
  },
  intro: '<p>When you use an array name in an expression, you get the <b>address</b> of its first element. So <code>a == b</code> asks "are these the same place in memory?", not "do these hold the same text?".</p><p><code>strcmp</code> compares the chars one by one and returns 0 when the strings are equal, a negative number when the first comes earlier in order, and a positive number when it comes later.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 7, text: '<p>Two arrays and one pointer in <code>main</code>\'s frame.</p>', expand: ['a', 'b'] },
    { do: { to: 12 }, line: 12, check: 'c == a', text: '<p><code>a</code> and <code>b</code> both hold "pear", in two different places on the stack: look at their addresses. <code>c</code>\'s arrow goes to <code>a</code>.</p>' },
    { do: 'over', check: 'same_place == 0', text: '<p><code>a == b</code> is 0 (false): two separate arrays never have the same address, whatever they hold.</p>' },
    { do: 'over', check: 'same_text == 1', text: '<p><code>strcmp(a, b)</code> walked both strings, found every char equal up to the NUL, and returned 0. So <code>same_text</code> is 1.</p>' },
    { do: 'over', check: 'order < 0', text: '<p><code>strcmp("apple", "pear")</code> stopped at the first difference: \'a\' against \'p\'. \'a\' has a smaller code, so the result is negative.</p><p>Only the sign is promised, not the exact number.</p>' },
    { do: 'over', show: 'term', output: '0 1 1', text: '<p><code>c == a</code> is 1: <code>c</code> holds the address of <code>a</code>, so they are the same place. Comparing pointers with <code>==</code> is right when "the same place" is the question.</p>' },
    { do: 'continue', state: 'exited', output: '1', text: '<div class="note">To ask "same text?", write <code>strcmp(x, y) == 0</code>. Writing <code>if (strcmp(x, y))</code> means "if they are <b>different</b>", which surprises many people.</div><div class="try">Try it: change <code>b</code> to "peach" and predict <code>same_text</code> and the sign of <code>strcmp(a, b)</code>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'string-array-of-strings', unit: 'Strings', title: 'An array of strings',
  blurb: 'char *names[] holds pointers into read-only data; char names[][8] holds its own copies.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: two ways to keep a list of words */
#include <stdio.h>

int main(void)
{
    char *names[3] = { "Ann", "Bob", "Christina" }; /* 3 pointers to literals */
    char copies[3][8] = { "Ann", "Bob", "Chris" };  /* 3 rows of 8 chars each */
    int i;

    copies[1][0] = 'R';          /* fine: our own copy, now "Rob" */
    names[1] = "Rob";            /* fine: the pointer moves to another literal */
    for (i = 0; i < 3; i++)
        printf("%s / %s\\n", names[i], copies[i]);
    printf("%d %d\\n", (int)sizeof names, (int)sizeof copies);
    return 0;
}
`,
  },
  intro: '<p>A list of words can be kept two ways.</p><ul><li><code>char *names[3]</code>: an array of 3 <b>pointers</b>. Each points at a string literal in read-only data. The words can be any length.</li><li><code>char copies[3][8]</code>: an array of 3 rows of 8 chars. Each row <b>holds</b> a copy of a word. Every row is 8 bytes, so no word may be longer than 7 letters.</li></ul>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>Both arrays are in <code>main</code>\'s frame, still red.</p>', expand: ['names', 'copies'] },
    { do: 'over', check: "names[2][0] == 'C' && names[0] != names[1]", text: '<p><code>names</code> holds three addresses: three arrows leave the stack and end at the literals in read-only data. "Christina" is longer than the others, and that costs nothing here: each element is just a 4-byte pointer.</p>' },
    { do: 'over', check: "copies[2][4] == 's' && copies[0][3] == '\\0'", text: '<p><code>copies</code> is 24 bytes on the stack: three rows of 8. Each row got its word and then zeros to fill the row. There are no arrows: the letters are right here.</p><p>"Christina" would not fit into 8 bytes, which is why the copy is "Chris".</p>' },
    { do: 'over', check: "copies[1][0] == 'R'", text: '<p><code>copies[1][0] = \'R\';</code> changed our own copy to "Rob". The same write through <code>names[1]</code> would try to change the literal "Bob" and crash.</p>' },
    { do: 'over', check: "names[1][0] == 'R'", text: '<p><code>names[1] = "Rob";</code> did not change any letters. It pointed <code>names[1]</code> at a different literal: its arrow moved. "Bob" is still in read-only data.</p>' },
    { do: { to: 14 }, show: 'term', line: 14, output: 'Christina / Chris', text: '<p>The loop printed each pair. <code>names[i]</code> and <code>copies[i]</code> are both the address of a string, so both work with <code>%s</code>.</p>' },
    { do: 'over', output: '12 24', text: '<p><code>sizeof names</code> is 12: three 4-byte pointers, not counting the letters, which live elsewhere. <code>sizeof copies</code> is 24: all the letters are inside.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">Pointers into read-only data are cheap and allow any length, but the words cannot be changed: declare them <code>const char *names[]</code>. Rows of chars can be changed, but each row has a fixed size.</div><div class="try">Try it: add <code>names[0][0] = \'D\';</code> after line 11 and debug. Then make it <code>const char *names[3]</code> and build.</div>' },
  ],
});
