// Unit 6: const, every way round.
SEE.Lessons.add({
  id: 'const-pointers', unit: 'const', title: 'Pointer to const, const pointer',
  blurb: 'const char *p, char *const p and const char *const p: which part is locked.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: where the const goes decides what is locked */
#include <stdio.h>

int main(void)
{
    char a[] = "cat";
    char b[] = "dog";

    const char *p = a;        /* pointer to const char: *p is locked, p is not */
    char *const q = a;        /* const pointer to char: q is locked, *q is not  */
    const char *const r = a;  /* both locked */

    p = b;                    /* fine: p may point somewhere else  */
    /* *p = 'h';                 error: cannot change a char through p */

    *q = 'b';                 /* fine: a becomes "bat" */
    /* q = b;                    error: q itself cannot change */

    printf("%s %s %s %s\\n", a, p, q, r);
    return 0;
}
`,
  },
  intro: '<p>Read a declaration from the name outwards: <code>p</code> is a pointer to a <code>const char</code>; <code>q</code> is a <code>const</code> pointer to a <code>char</code>.</p><p>The <code>const</code> applies to what is just left of it (or, when nothing is, to what is just right).</p>',
  steps: [
    { do: 'start', show: 'memory', text: '<p>Two arrays on the stack, <code>a</code> and <code>b</code>, each 4 bytes: three letters and the NUL that ends a string.</p><p>Below them in <code>main</code>\'s frame are the three pointers, still red because nothing has been stored in them.</p>', expand: ['a', 'b'] },
    { do: { to: 13 }, line: 13, check: 'p == a && q == a && r == a', text: '<p>All three pointers now hold the same address, the start of <code>a</code>. Follow the arrows in the memory picture.</p><p>The const changes nothing about what is stored. It only changes what the <b>compiler</b> lets you write.</p>' },
    { do: 'over', check: 'p == b', text: '<p><code>p = b;</code> is allowed: <code>p</code> itself is an ordinary variable. Its arrow now goes to <code>b</code>.</p><p>What is locked is the <b>char it points at</b>: <code>*p = \'h\';</code> would be the error <i>assignment of read-only location \'*p\'</i>. Take the comment marks off line 14 and build (Ctrl+B) to see it.</p>' },
    { do: 'over', check: "a[0] == 'b'", text: '<p><code>*q = \'b\';</code> changed the first letter of <code>a</code> through <code>q</code>: <code>a</code> is now "bat".</p><p>But <code>q = b;</code> on line 17 would be <i>assignment of read-only variable \'q\'</i>: the pointer is locked to <code>a</code> forever.</p>' },
    { do: 'over', show: 'term', output: 'bat dog bat bat', text: '<p><code>a</code> is "bat", <code>p</code> points at "dog", and <code>q</code> and <code>r</code> both still point at <code>a</code>.</p><p>In the memory picture, the pointers show a padlock only when the pointer itself is const: try clicking <code>q</code>\'s value, then <code>p</code>\'s.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">A trick to remember it: read right to left. <code>const char *p</code>: "p is a pointer to char that is const". <code>char *const q</code>: "q is a const pointer to char".</div><div class="try">Try it: uncomment line 14 or line 17 and build. Read the error, then put the comment back.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'const-variable', unit: 'const', title: 'A const variable',
  blurb: 'A const variable gets its value once, and the compiler refuses any later assignment.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a const variable cannot be assigned */
#include <stdio.h>

int main(void)
{
    const int days = 7;       /* gets its value here, and never again */
    int weeks = 3;
    int total;

    total = days * weeks;
    /* days = 8; */
    printf("%d days in %d weeks\\n", total, weeks);
    return 0;
}
`,
  },
  intro: '<p><code>const</code> in front of a type means "this object must not be changed after it is made". A <code>const</code> variable must be given its value where it is declared, because there is no later moment when assigning it is allowed.</p><p>This lesson shows where such a variable lives, and what the compiler says when you try to change it.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p><code>main</code>\'s frame holds <code>days</code>, <code>weeks</code> and <code>total</code>, 4 bytes each, all red because nothing has run yet.</p><p><code>days</code> is an ordinary local variable on the <b>stack</b>, like the other two. Its <code>const</code> is a rule the compiler enforces, not a different kind of memory. The padlock beside it in the memory picture marks it as const.</p>' },
    { do: 'over', line: 7, check: 'days == 7', text: '<p>Line 6 is the one and only time <code>days</code> gets a value: the <b>initialiser</b> <code>= 7</code>. An initialiser is not an assignment, so it is allowed on a const variable.</p>' },
    { do: { to: 12 }, line: 12, check: 'total == 21 && weeks == 3', text: '<p>Reading a const variable is fine: line 10 read <code>days</code> and <code>weeks</code> and stored 21 in <code>total</code>.</p><p>Line 11 is a comment. It holds the assignment the compiler would refuse.</p>' },
    { do: { edit: [11, '    days = 8;'] }, text: '<p>This step took the comment marks off line 11, so the code now tries to assign 8 to <code>days</code>. The editor shows the changed line.</p><p>Nothing has been built yet: the running program is still the old one.</p>' },
    { do: 'build', show: 'probs', errors: "assignment of read-only variable 'days'", text: '<p>The build stops with the error <i>assignment of read-only variable \'days\'</i>, pointing at line 11.</p><div class="note">"Read-only" is the compiler\'s word for const. The check happens when the program is <b>compiled</b>: a program that assigns a const variable never gets as far as running.</div>' },
    { do: { edit: [11, '    /* days = 8; */'] }, text: '<p>The comment marks are back on line 11, so the program is as it was. A build now succeeds again.</p>' },
    { do: 'start', line: 6, text: '<p>Built and started again with the line commented out. The frame is fresh, and every value is red once more.</p>' },
    { do: 'continue', show: 'term', state: 'exited', output: '21 days in 3 weeks', text: '<p>The program printed <code>21 days in 3 weeks</code> and ended.</p><div class="note">Use <code>const</code> for any value that should not change after it is set: it documents your intent, and the compiler holds you to it.</div><div class="try">Try it: make <code>weeks</code> const too and build. Then add <code>weeks++;</code> after line 10 and read the error: <i>increment of read-only variable</i>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'const-globals', unit: 'const', title: 'const globals live in read-only data',
  blurb: 'A const global is placed next to the string literals, where nothing may write.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: where globals live */
#include <stdio.h>

const int max_score = 100;          /* read-only data */
const int levels[3] = { 10, 50, 90 }; /* read-only data too */
int best = 42;                      /* .data: a global with a starting value */
int tries;                          /* .bss: no starting value, so it starts at 0 */

int main(void)
{
    const int bonus = 5;            /* a const local: still on the stack */
    int score;

    score = 80 + bonus;
    tries = tries + 1;
    if (score > best)
        best = score;
    printf("level %d: %d of %d (try %d)\\n", levels[2], best, max_score, tries);
    return 0;
}
`,
  },
  intro: '<p>Globals are not on the stack: they exist for the whole run of the program, in fixed areas of memory. Which area depends on how the global is declared.</p><ul><li><b>.data</b>: globals with a starting value.</li><li><b>.bss</b>: globals without one; C sets them to zero.</li><li><b>read-only data</b>: string literals and <code>const</code> globals.</li></ul>',
  steps: [
    { do: 'start', show: 'memory', line: 11, check: 'best == 42 && tries == 0 && max_score == 100', text: '<p>Look below the stack in the memory picture. The globals already have their values before <code>main</code> runs a single line: <code>best</code> is 42 in <b>.data</b>, <code>tries</code> is 0 in <b>.bss</b>.</p><p><code>max_score</code> and the array <code>levels</code> are in <b>read-only data</b>, next to the string literal used by <code>printf</code>, at addresses near <code>0x08048500</code>. They show a padlock.</p>', expand: ['levels'] },
    { do: 'over', line: 14, check: 'bonus == 5', text: '<p><code>bonus</code> is const too, but it is a local, so it lives in <code>main</code>\'s frame on the stack, near <code>0xbfffff00</code>.</p><div class="note">A const local is protected only by the compiler. A const global is protected by the compiler <b>and</b> by its place in memory: the read-only area cannot be written at all while the program runs.</div>' },
    { do: 'over', check: 'score == 85', text: '<p><code>score</code> is 85. Reading a const value, local or global, is always fine.</p>' },
    { do: 'over', check: 'tries == 1', text: '<p><code>tries</code> in .bss went from 0 to 1. Globals in .data and .bss are ordinary writable memory.</p>' },
    { do: { to: 18 }, line: 18, check: 'best == 85', text: '<p>85 is more than 42, so line 17 stored 85 into <code>best</code>. It turns yellow in the globals part of the picture.</p>' },
    { do: 'over', show: 'term', output: 'level 90: 85 of 100 (try 1)', text: '<p><code>printf</code> read <code>levels[2]</code> and <code>max_score</code> from read-only data. Reading is all that area allows.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: add <code>max_score = 50;</code> inside <code>main</code> and build: the compiler refuses. The lesson "Casting const away" shows what happens when a cast tricks the compiler into writing there anyway.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'const-right-to-left', unit: 'const', title: 'Reading declarations right to left',
  blurb: 'const char *const *pp: read from the name outwards, one word at a time.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: reading declarations from right to left */
#include <stdio.h>

int main(void)
{
    char word[] = "sun";
    const char *names[2];        /* names: array of 2 pointers to const char */
    const char *const *pp;      /* pp: pointer to const pointer to const char */
    char *const fixed = word;   /* fixed: const pointer to char */

    names[0] = "moon";
    names[1] = word;
    pp = names;                 /* fine: pp itself is not const */
    /* *pp = word; */           /* error: the pointer pp points at is const */
    /* **pp = 'S'; */           /* error: the char at the end is const */
    pp = pp + 1;                /* pp moves on to names[1] */
    fixed[0] = 'S';             /* fine: the chars of word are not const */
    printf("%s %s %s\\n", *pp, fixed, names[0]);
    return 0;
}
`,
  },
  intro: '<p>Start at the name and read outwards, right to left, saying each piece: <code>*</code> is "pointer to", <code>const</code> is "const", and the type at the far left is what you end at.</p><p><code>const char *const *pp</code>: "pp is a pointer to a const pointer to a char that is const". Each <code>const</code> locks the thing just left of it, or the type next to it when it comes first.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p><code>word</code> will hold a copy of "sun" on the stack. <code>names</code> is an array of two pointers, and <code>pp</code> is one pointer: all still red.</p><p><code>fixed</code> is initialised on line 9. It must be, because <code>fixed</code> is const and cannot be assigned later.</p>', expand: ['word', 'names'] },
    { do: { to: 13 }, line: 13, check: 'fixed == word && names[1] == word', text: '<p><code>names[0]</code> points into read-only data at the literal "moon"; <code>names[1]</code> and <code>fixed</code> both point at <code>word</code>. Follow the arrows.</p><p>Storing <code>word</code>, a <code>char *</code>, into <code>names[1]</code>, a <code>const char *</code>, is fine: adding a const is always allowed.</p>' },
    { do: 'over', check: 'pp == names', text: '<p><code>pp</code> now points at <code>names[0]</code>. Its type, read right to left, says which steps along the arrows are locked:</p><ul><li><code>pp</code> itself: not const, so it may move.</li><li><code>*pp</code> (a pointer in <code>names</code>): const.</li><li><code>**pp</code> (a char): const.</li></ul>' },
    { do: { edit: [14, '    *pp = word;'] }, text: '<p>Line 14 now tries to change <code>*pp</code>, the pointer that <code>pp</code> points at.</p>' },
    { do: 'build', show: 'probs', errors: 'read-only location', text: '<p>Refused: <i>assignment of read-only location \'*pp\'</i>. The middle <code>const</code> in <code>const char *const *pp</code> locks the pointer that <code>pp</code> points at, when reached through <code>pp</code>.</p><p>Note that <code>names[0] = word;</code> would be fine: <code>names</code> itself is not const. The lock belongs to the path through <code>pp</code>.</p>' },
    { do: { edit: [14, '    /* *pp = word; */'] }, text: '<p>Line 14 is a comment again, so that error is gone.</p>' },
    { do: { edit: [15, "    **pp = 'S';"] }, text: '<p>Line 15 now tries to change the char at the end of the chain, two arrows away.</p>' },
    { do: 'build', show: 'probs', errors: 'read-only location', text: '<p>Refused again: <i>assignment of read-only location</i>. The first <code>const</code>, the one by <code>char</code>, locks the chars.</p>' },
    { do: { edit: [15, "    /* **pp = 'S'; */"] }, text: '<p>Line 15 is a comment again, so the program builds.</p>' },
    { do: 'start', line: 6, text: '<p>Started again from the top with the original code: both lines are comments, so it builds without errors.</p>' },
    { do: { to: 18 }, line: 18, check: 'pp == names + 1 && word[0] == \'S\'', text: '<p><code>pp</code> moved on to <code>names[1]</code>: its arrow now ends on the second slot. <code>fixed[0] = \'S\';</code> changed <code>word</code> to "Sun": <code>fixed</code> is a const pointer, but the chars it points at are not const.</p>' },
    { do: 'continue', show: 'term', state: 'exited', output: 'Sun Sun moon', text: '<p><code>*pp</code> is <code>names[1]</code>, which points at <code>word</code>; <code>fixed</code> points at <code>word</code> too; <code>names[0]</code> is still "moon".</p><div class="note">Right to left: <code>char *const fixed</code> is "fixed is a const pointer to char". <code>const char *names[2]</code> is "names is an array of 2 pointers to char that is const".</div><div class="try">Try it: add <code>fixed = names[0];</code> and build. Which const does it break?</div>' },
  ],
});

SEE.Lessons.add({
  id: 'const-params', unit: 'const', title: 'const parameters are a promise',
  blurb: 'A const char * parameter promises not to change your string; passing a const string to a char * does not compile cleanly.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: const in a parameter is a promise */
#include <stdio.h>

/* count promises not to change the string it is given */
int count(const char *s, char c)
{
    int n = 0;
    while (*s != '\\0') {
        if (*s == c)
            n++;
        s++;                /* fine: only the chars are const */
    }
    return n;
}

/* shout makes no such promise: it changes the letters */
void shout(char *s)
{
    while (*s != '\\0') {
        if (*s >= 'a' && *s <= 'z')
            *s = *s - 'a' + 'A';
        s++;
    }
}

int main(void)
{
    char word[] = "banana";
    const char *title = "papaya";
    int a;

    a = count(word, 'a');   /* char * into const char *: fine */
    shout(word);            /* char * into char *: fine */
    /* shout(title); */     /* const char * into char *: warning */
    printf("%d %s %s\\n", a, word, title);
    return 0;
}
`,
  },
  intro: '<p>When a parameter is <code>const char *</code>, the function promises the caller: "I will only read your string." The compiler holds the function to it.</p><p>The promise goes one way. Giving a function more freedom than it needs is fine; taking the const away is not.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 28, text: '<p><code>word</code> is a copy of "banana" on the stack; <code>title</code> will point at the literal "papaya" in read-only data.</p>', expand: ['word'] },
    { do: { to: 32 }, line: 32, check: 'title[0] == \'p\'', text: '<p>About to call <code>count</code> with <code>word</code>, a <code>char *</code>. The parameter is a <code>const char *</code>: a const is added on the way in, which is always allowed.</p>' },
    { do: 'into', line: 7, text: '<p>Inside <code>count</code>, a new frame sits on top of <code>main</code>\'s. Its <code>s</code> holds the address of <code>word</code>: the arrow crosses from one frame to the other.</p><p>Inside here, <code>*s = \'x\';</code> would not compile, because <code>s</code> points to const chars.</p>' },
    { do: { to: 13 }, line: 13, check: 'n == 3 && *s == \'\\0\'', text: '<p><code>s++</code> moved <code>s</code> along the string until it reached the NUL; <code>n</code> counted three letters a. <code>s</code> could move because <code>s</code> itself is not const.</p>' },
    { do: 'out', text: '<p>Back in <code>main</code>. <code>count</code>\'s frame is gone.</p>' },
    { do: { to: 35 }, line: 35, check: 'a == 3 && word[0] == \'B\'', text: '<p>Line 34 is only a comment, so the debugger stopped at line 35. <code>shout(word)</code> changed the letters of <code>word</code> to "BANANA". That is fine: <code>word</code> is a <code>char</code> array, and <code>shout</code> asked for a plain <code>char *</code>.</p>' },
    { do: { edit: [34, '    shout(title);'] }, text: '<p>Line 34 now passes <code>title</code>, a <code>const char *</code>, to <code>shout</code>, which wants a <code>char *</code> and may write through it.</p>' },
    { do: 'build', show: 'probs', errors: "discards 'const'", text: '<p>The compiler warns: <i>passing argument discards \'const\' qualifier from pointer target type</i>. It is a warning, not an error, so the program still builds, but the promise is broken: <code>title</code> said "read only" and <code>shout</code> will write.</p>' },
    { do: 'run', show: 'term', state: 'faulted', text: '<p>Run, and it crashes inside <code>shout</code> on line 21: <code>title</code> points at the literal "papaya" in read-only data, and the write is refused.</p><div class="note">Treat "discards const" warnings as errors. They mean some code is about to change something that was meant to stay unchanged.</div>' },
    { do: { edit: [34, '    /* shout(title); */'] }, state: 'faulted', text: '<p>Line 34 is a comment again. The crashed run stays on screen until the program is started again.</p>' },
    { do: 'start', line: 28, text: '<p>Rebuilt without the bad call and started from the top.</p>' },
    { do: 'continue', state: 'exited', output: '3 BANANA papaya', text: '<p>3 letters a, the shouted <code>word</code>, and the untouched <code>title</code>.</p><div class="try">Try it: change the parameter of <code>count</code> to plain <code>char *s</code>, then call <code>count(title, \'a\')</code>. Now <code>count</code> cannot accept a const string without a warning, even though it never writes. Using const for parameters you only read makes your functions usable with more arguments.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'const-cast-away', unit: 'const', title: 'Casting const away',
  blurb: 'A cast can silence the compiler, but a const object in read-only data still cannot be written.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: casting const away does not make memory writable */
#include <stdio.h>

const int answer = 42;          /* in read-only data */

int main(void)
{
    const int local = 7;        /* on the stack: const only to the compiler */
    int *p;

    p = (int *)&local;          /* the cast removes the const */
    *p = 8;                     /* undefined behaviour: here it happens to work */
    printf("local is now %d\\n", local);
    p = (int *)&answer;
    *p = 43;                    /* read-only data: the program crashes */
    printf("answer is now %d\\n", answer);
    return 0;
}
`,
  },
  intro: '<p><code>&amp;local</code> has type <code>const int *</code>. Writing <code>(int *)</code> in front of it is a <b>cast</b>: it tells the compiler to treat the address as a plain <code>int *</code>, and the compiler stops complaining.</p><p>The C standard says that changing a const object this way is <b>undefined behaviour</b>: anything may happen. This lesson shows the two things that really do happen.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 8, text: '<p><code>answer</code> is in read-only data, near the string literals. <code>local</code> and <code>p</code> are in <code>main</code>\'s frame on the stack.</p>' },
    { do: { to: 12 }, line: 12, check: 'local == 7 && p == &local', text: '<p><code>p</code> holds the address of <code>local</code>: an arrow from <code>p</code> to <code>local</code>, inside the same frame. Without the cast, line 11 would get the warning <i>assignment discards \'const\' qualifier</i>.</p>' },
    { do: 'over', check: 'local == 8', text: '<p>The write went through and <code>local</code> is 8 in the memory picture. The stack is ordinary writable memory, and the const on <code>local</code> existed only in the compiler.</p><p>This "works" here, but a compiler may assume a const never changes and keep using 7, so do not rely on it.</p>' },
    { do: 'over', show: 'term', output: 'local is now 8', text: '<p>The program printed the changed value.</p>' },
    { do: 'over', line: 15, check: 'p == &answer', text: '<p>Now <code>p</code> points at <code>answer</code>: the arrow goes from the stack down into read-only data.</p>' },
    { do: 'over', state: 'faulted', text: '<p>The program stopped with a <b>segmentation fault</b>: <i>write to read-only memory</i>. Read-only data is protected by the machine itself, so no cast can make it writable.</p><div class="note">A cast changes what the compiler believes, not what the memory is. Casting const away is safe only when the object was not const to begin with, for example a <code>char</code> array passed through a <code>const char *</code>.</div>' },
    { do: 'back', state: 'paused', text: '<p>Even after a crash you can step back (F8) to look at the state just before it: <code>p</code> still points at <code>answer</code>, which still holds 42.</p><div class="try">Try it: remove the <code>(int *)</code> cast on line 14 and build. Read the warning the cast was hiding.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'const-typedef', unit: 'const', title: 'const with a typedef',
  blurb: 'typedef char *str; const str s makes s a const pointer, not a pointer to const chars.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: const and a typedef for a pointer */
#include <stdio.h>

typedef char *str;              /* str means "pointer to char" */

int main(void)
{
    char a[] = "pen";
    char b[] = "ink";
    const str s = a;            /* NOT const char *: it means char *const */
    const char *t = a;          /* pointer to const char */

    s[0] = 'h';                 /* allowed: the chars are not const */
    t = b;                      /* allowed: t itself is not const */
    /* s = b; */                /* error: s itself is const */
    printf("%s %s %s\\n", a, s, t);
    return 0;
}
`,
  },
  intro: '<p>A <code>typedef</code> gives a type a new name. It is not text replacement: <code>str</code> is one whole type, "pointer to char".</p><p>So <code>const str s</code> means "s is a const str", that is, a <b>const pointer to char</b>. It is <i>not</i> the same as <code>const char *s</code>, which is what the text <code>const char *</code> would suggest.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 8, text: '<p>Two arrays on the stack, <code>a</code> and <code>b</code>, and two pointers <code>s</code> and <code>t</code>.</p>', expand: ['a', 'b'] },
    { do: { to: 13 }, line: 13, check: 's == a && t == a', text: '<p>Both <code>s</code> and <code>t</code> point at <code>a</code>. Look at the memory picture: <code>s</code> has the padlock, because <code>s</code> itself is const. <code>t</code> has none: it is a plain pointer, to chars it promises not to change.</p>' },
    { do: 'over', check: "a[0] == 'h'", text: '<p><code>s[0] = \'h\';</code> was allowed and <code>a</code> is now "hen". Through <code>s</code> the chars are not const at all.</p><p>Through <code>t</code> they are: <code>t[0] = \'h\';</code> would be refused.</p>' },
    { do: 'over', check: 't == b', text: '<p><code>t = b;</code> was allowed: <code>t</code>\'s arrow moved to <code>b</code>.</p>' },
    { do: { edit: [15, '    s = b;'] }, text: '<p>Line 15 now tries to point <code>s</code> somewhere else.</p>' },
    { do: 'build', show: 'probs', errors: "read-only variable 's'", text: '<p><i>assignment of read-only variable \'s\'</i>: the const went onto the pointer <code>s</code>, because <code>str</code> already is the whole pointer type.</p><div class="note">To get a pointer to const chars with a typedef, the const must be inside the typedef: <code>typedef const char *cstr;</code>. This is one reason many programmers avoid hiding a <code>*</code> inside a typedef.</div>' },
    { do: { edit: [15, '    /* s = b; */'] }, text: '<p>Line 15 is a comment again, so the program builds.</p>' },
    { do: 'start', line: 8, text: '<p>Rebuilt and started from the top.</p>' },
    { do: 'continue', show: 'term', state: 'exited', output: 'hen hen ink', text: '<p><code>a</code> and <code>s</code> show "hen"; <code>t</code> shows "ink".</p><div class="try">Try it: write <code>str const s = a;</code> on line 10. It means exactly the same: right to left, "s is a const str".</div>' },
  ],
});
