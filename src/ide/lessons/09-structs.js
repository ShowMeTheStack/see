// Unit 9: structs, unions, enums and bit-fields.
SEE.Lessons.add({
  id: 'struct-fields', unit: 'Structs', title: 'A struct groups fields',
  blurb: 'struct point keeps x and y side by side in one block of memory.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a struct keeps related values together */
#include <stdio.h>

struct point {
    int x;
    int y;
};

int main(void)
{
    struct point p;
    struct point q = { 3, 4 };

    p.x = 10;
    p.y = 20;
    printf("p at %p, p.x at %p, p.y at %p\\n", (void *)&p, (void *)&p.x, (void *)&p.y);
    printf("sizeof(struct point) = %lu\\n", (unsigned long)sizeof(struct point));
    q = p;      /* the whole struct is copied, field by field */
    printf("q = (%d, %d)\\n", q.x, q.y);
    return 0;
}
`,
  },
  intro: '<p>A <b>struct</b> is a new type made of several named <b>fields</b>. Lines 4 to 7 describe the type <code>struct point</code>: an <code>int x</code> followed by an <code>int y</code>. They make no variable and use no memory.</p><p>Lines 11 and 12 then make two variables of that type. Each one is a single block of memory with room for both fields.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['p', 'q'], line: 12, text: '<p>Line 11 has no initialiser, so there was nothing to run and the debugger stopped at line 12.</p><p>In <code>main</code>\'s frame, <code>p</code> and <code>q</code> are each one box of 8 bytes. They are opened up, so you can see the two fields inside each, <code>x</code> first and <code>y</code> 4 bytes after it. Every field is red: nothing has been stored yet.</p>' },
    { do: 'over', line: 14, check: 'q.x == 3 && q.y == 4', text: '<p><code>{ 3, 4 }</code> on line 12 fills the fields in the order they are declared: <code>q.x</code> gets 3, <code>q.y</code> gets 4.</p><p><code>p</code> is still red.</p>' },
    { do: 'over', line: 15, check: 'p.x == 10', text: '<p>The dot reaches one field: <code>p.x = 10;</code> stored 10 into the first 4 bytes of <code>p</code>. <code>p.y</code> is still red.</p>' },
    { do: 'over', line: 16, check: 'p.y == 20', text: '<p>Now both fields of <code>p</code> are set. A field is an ordinary variable that happens to live inside a bigger one: you can read it, write it and take its address.</p>' },
    { do: 'over', line: 17, show: 'term', output: 'p.x at', check: '(char *)&p.y - (char *)&p.x == 4', text: '<p>Compare the three addresses in the terminal. <code>&amp;p</code> and <code>&amp;p.x</code> are the same: the first field always starts at the start of the struct. <code>&amp;p.y</code> is 4 bytes higher, right after <code>x</code>.</p><p>The same addresses appear next to the fields in the memory picture.</p>' },
    { do: 'over', line: 18, output: 'sizeof(struct point) = 8', text: '<p>The struct is 8 bytes: two 4-byte ints and nothing else. (The next lesson shows a struct whose size is more than the sum of its fields.)</p>' },
    { do: 'over', line: 19, check: 'q.x == 10 && q.y == 20', text: '<p><code>q = p;</code> copied all 8 bytes of <code>p</code> over <code>q</code>. Both fields of <code>q</code> turned yellow.</p><div class="note">You can assign a whole struct with <code>=</code>, pass it to a function and return it. You cannot compare two structs with <code>==</code>: compare the fields one by one.</div>' },
    { do: 'continue', state: 'exited', output: 'q = (10, 20)', text: '<p>The program printed the copy and ended.</p><div class="try">Try it: start again, run to line 18 and change <code>p.x</code> in the memory picture before the copy. Then step and watch the new value arrive in <code>q.x</code>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'struct-padding', unit: 'Structs', title: 'Padding and alignment',
  blurb: 'Why a struct of char, double, char takes 24 bytes, and how reordering makes it 16.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: the compiler adds padding so every field is aligned */
#include <stdio.h>
#include <stddef.h>

struct mixed {
    char c;      /* 1 byte                                 */
    double d;    /* 8 bytes, must start at a multiple of 8 */
    char e;      /* 1 byte                                 */
};

struct sorted {
    double d;    /* biggest field first */
    char c;
    char e;
};

int main(void)
{
    struct mixed m;
    struct sorted s;

    m.c = 'A';
    m.d = 2.5;
    m.e = 'Z';
    s.d = 2.5;
    s.c = 'A';
    s.e = 'Z';
    printf("mixed:  c at %lu, d at %lu, e at %lu, size %lu\\n",
           (unsigned long)offsetof(struct mixed, c), (unsigned long)offsetof(struct mixed, d),
           (unsigned long)offsetof(struct mixed, e), (unsigned long)sizeof m);
    printf("sorted: d at %lu, c at %lu, e at %lu, size %lu\\n",
           (unsigned long)offsetof(struct sorted, d), (unsigned long)offsetof(struct sorted, c),
           (unsigned long)offsetof(struct sorted, e), (unsigned long)sizeof s);
    return 0;
}
`,
  },
  intro: '<p>Fields are kept in the order you declare them, but not always touching. The processor reads a value fastest (on some machines, only) when its address is a multiple of its size: a <code>double</code> wants an address that is a multiple of 8. To get that, the compiler leaves unused <b>padding</b> bytes between fields and at the end.</p><p><code>offsetof(type, field)</code> from <code>&lt;stddef.h&gt;</code> tells you how many bytes from the start of the struct a field begins.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['m', 's'], line: 22, text: '<p>Both structs are in <code>main</code>\'s frame. <code>m</code> is drawn bigger than <code>s</code> even though both hold the same three fields: a <code>char</code>, a <code>double</code> and a <code>char</code>, 10 bytes of data.</p>' },
    { do: { to: 25 }, line: 25, check: "m.c == 'A' && m.e == 'Z'", bytes: 'm', text: '<p>All three fields of <code>m</code> are set. The <b>bytes</b> panel shows its 24 raw bytes:</p><ul><li>byte 0 is <code>c</code> (65, the code of \'A\'),</li><li>bytes 1 to 7 are padding, never written, so they keep whatever was there,</li><li>bytes 8 to 15 are the double <code>d</code>,</li><li>byte 16 is <code>e</code> (90, \'Z\'), and bytes 17 to 23 are more padding.</li></ul>' },
    { do: { to: 28 }, line: 28, check: "s.c == 'A' && s.e == 'Z'", bytes: 's', text: '<p>Now <code>s</code>: the double first at bytes 0 to 7, then <code>c</code> at byte 8 and <code>e</code> at byte 9, with no gap between the two chars because a <code>char</code> may sit at any address. Only bytes 10 to 15 are padding.</p>' },
    { do: 'over', line: 31, show: 'term', output: 'mixed:  c at 0, d at 8, e at 16, size 24', text: '<p><code>offsetof</code> confirms it: in <code>struct mixed</code>, <code>d</code> starts at 8, not at 1. Seven bytes were skipped so that <code>d</code> lands on a multiple of 8.</p>' },
    { do: 'over', line: 34, output: 'sorted: d at 0, c at 8, e at 9, size 16', text: '<p>The same three fields, ordered from biggest to smallest, need only 16 bytes.</p><div class="note">Why 16 and not 10? The size of a struct is rounded up to a multiple of its strictest field, here 8, so that in an <i>array</i> of these structs every element\'s <code>d</code> is still aligned.</div>' },
    { do: { set: ['m.e', "'Q'"] }, check: "m.e == 'Q'", text: '<p>This step changed <code>m.e</code> through the memory picture. Look at the bytes panel: only byte 16 changed. Padding bytes belong to no field, so no assignment ever touches them, and comparing two structs with <code>memcmp</code> is risky: two structs with equal fields can still differ in their padding.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: move <code>char e;</code> in <code>struct mixed</code> to just after <code>char c;</code>, debug again, and predict the offsets and size before you read them. (Answer: c 0, e 1, d 8, size 16.)</div>' },
  ],
});

SEE.Lessons.add({
  id: 'struct-pass', unit: 'Structs', title: 'By value or by pointer',
  blurb: 'Passing a struct copies every byte into the new frame; passing its address copies 4.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: passing a struct copies every byte of it */
#include <stdio.h>

struct big {
    int id;
    int marks[4];
};

void bump_copy(struct big b)        /* gets its own copy of all 20 bytes */
{
    b.marks[0] = 100;
}

void bump_real(struct big *p)       /* gets only an address */
{
    p->marks[0] = 100;
}

int main(void)
{
    struct big s = { 7, { 50, 60, 70, 80 } };

    bump_copy(s);
    printf("after bump_copy: %d\\n", s.marks[0]);
    bump_real(&s);
    printf("after bump_real: %d\\n", s.marks[0]);
    return 0;
}
`,
  },
  intro: '<p>In C every argument is passed <b>by value</b>: the function gets a copy. For a struct that means a copy of every field, including whole arrays inside it.</p><p>To let a function change the caller\'s struct (and to avoid copying a big one), pass its address instead. Compare the two frames in the memory picture.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['s'], line: 21, text: '<p><code>s</code> is a 20-byte struct in <code>main</code>\'s frame: an <code>int id</code> and an array of four <code>int</code>s.</p>' },
    { do: 'over', line: 23, check: 's.id == 7 && s.marks[3] == 80', text: '<p>The nested braces on line 21 fill <code>id</code> with 7 and the array with 50, 60, 70, 80.</p>' },
    { do: 'into', line: 11, expand: ['b'], check: 'b.id == 7 && b.marks[0] == 50', text: '<p>A new frame for <code>bump_copy</code> sits on top of <code>main</code>\'s. Its parameter <code>b</code> is a whole 20-byte struct: all five ints were copied from <code>s</code> into it when the call was made.</p><p>There is no arrow from <code>b</code> to <code>s</code>. They are two separate blocks of memory that happen to hold the same values.</p>' },
    { do: 'over', line: 12, check: 'b.marks[0] == 100', text: '<p><code>b.marks[0]</code> is now 100, but only in the copy. <code>s.marks[0]</code>, down in <code>main</code>\'s frame, is still 50.</p>' },
    { do: { to: 24 }, line: 24, check: 's.marks[0] == 50', text: '<p><code>bump_copy</code> returned and its frame, with the copy and its 100, is gone. <code>s</code> was never touched.</p>' },
    { do: 'over', line: 25, show: 'term', output: 'after bump_copy: 50', text: '<p>The terminal agrees: 50. A function that receives a struct by value can do what it likes with its copy; the caller never sees it.</p>' },
    { do: 'into', line: 16, check: 'p->marks[0] == 50', text: '<p>The frame of <code>bump_real</code> is small: <code>p</code> is one 4-byte pointer holding the address of <code>s</code>. Follow its arrow down into <code>main</code>\'s frame.</p><p><code>p-&gt;marks[0]</code> means "the struct <code>p</code> points to, its field <code>marks</code>, element 0".</p>' },
    { do: 'over', line: 17, check: 'p->marks[0] == 100', text: '<p>The write went through the pointer, so the yellow 100 is in <code>main</code>\'s <code>s</code>, not in this frame.</p>' },
    { do: { to: 26 }, line: 26, check: 's.marks[0] == 100', text: '<p>Back in <code>main</code>, <code>s.marks[0]</code> is 100.</p><div class="note">Pass a pointer when the function must change the struct, or when the struct is big. Pass <code>const struct big *</code> when the function only reads it: no copy, and the compiler stops accidental writes.</div>' },
    { do: 'continue', state: 'exited', output: 'after bump_real: 100', text: '<p>Two calls, two different results, and the memory picture showed why.</p><div class="try">Try it: step back (F8) into <code>bump_copy</code> and point at <code>&amp;b</code> and at <code>&amp;s</code> in the watch panel: two different addresses.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'struct-array-arrow', unit: 'Structs', title: 'Arrays of structs and ->',
  blurb: 'A row of structs back to back, and a pointer that walks over them with ->.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: an array of structs, and -> to reach a field through a pointer */
#include <stdio.h>

struct pupil {
    char name[8];
    int score;
};

int main(void)
{
    struct pupil team[3] = { { "Ana", 71 }, { "Ben", 64 }, { "Cy", 88 } };
    struct pupil *best = &team[0];
    int i;

    for (i = 1; i < 3; i++) {
        if (team[i].score > best->score)   /* best->score is (*best).score */
            best = &team[i];
    }
    best->score = best->score + 5;          /* a bonus, through the pointer */
    printf("%s wins with %d\\n", best->name, (*best).score);
    printf("each pupil takes %lu bytes\\n", (unsigned long)sizeof team[0]);
    return 0;
}
`,
  },
  intro: '<p>An array can hold structs just as it holds ints: <code>team</code> is three <code>struct pupil</code>s one after another.</p><p>When you have a <b>pointer</b> to a struct, <code>p-&gt;field</code> reaches a field. It is short for <code>(*p).field</code>; the brackets are needed because <code>.</code> binds tighter than <code>*</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['team'], line: 11, text: '<p><code>team</code> is one block of 36 bytes: three structs of 12 bytes each (an 8-char name and a 4-byte int).</p>' },
    { do: 'over', line: 12, check: 'team[2].score == 88', text: '<p>Each inner pair of braces filled one struct. The names were copied into the <code>name</code> arrays; the unused chars after each name are zero.</p><p><code>team[1].name</code> is "Ben"; <code>team[1].score</code> is 64.</p>' },
    { do: 'over', line: 15, check: 'best == &team[0]', text: '<p><code>best</code> holds the address of <code>team[0]</code>: its arrow points at the first struct in the array.</p>' },
    { do: { to: 17 }, line: 17, check: 'i == 2', text: '<p>For <code>i == 1</code> Ben\'s 64 was not more than <code>best-&gt;score</code> (Ana\'s 71), so line 17 was skipped. Now <code>i</code> is 2 and Cy\'s 88 is bigger.</p>' },
    { do: 'over', check: 'best == &team[2]', text: '<p>The arrow from <code>best</code> moved to <code>team[2]</code>. Nothing was copied: <code>best</code> only stores where Cy\'s struct is.</p>' },
    { do: { to: 19 }, line: 19, check: 'i == 3', text: '<p>The loop is over. <code>best</code> still points at <code>team[2]</code>.</p>' },
    { do: 'over', line: 20, check: 'team[2].score == 93', text: '<p><code>best-&gt;score = best-&gt;score + 5;</code> changed <code>team[2].score</code> to 93: the yellow value is inside the array, because that is where <code>best</code> points.</p>' },
    { do: 'over', show: 'term', output: 'Cy wins with 93', text: '<p><code>best-&gt;name</code> and <code>(*best).score</code> read the same struct two ways. Use <code>-&gt;</code>; it is easier to read.</p>' },
    { do: 'over', output: 'each pupil takes 12 bytes', text: '<p><code>sizeof team[0]</code> is 12, so <code>&amp;team[1]</code> is 12 bytes after <code>&amp;team[0]</code>, and <code>best + 1</code> would move a pointer forward by one whole struct.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: start again, stop at line 15 and change <code>team[1].score</code> to 99 in the memory picture. Run on and see who wins.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'struct-nested', unit: 'Structs', title: 'A struct inside a struct',
  blurb: 'struct person holds a whole struct date, and also a pointer to another one.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a struct inside a struct */
#include <stdio.h>

struct date {
    int day;
    int month;
    int year;
};

struct person {
    char initial;
    struct date born;          /* a whole struct date lives inside */
    struct date *next_visit;   /* only the address of one */
};

int main(void)
{
    struct date visit = { 3, 11, 2025 };
    struct person me;

    me.initial = 'J';
    me.born.day = 14;
    me.born.month = 2;
    me.born.year = 2010;
    me.next_visit = &visit;
    me.next_visit->day = 4;    /* changes visit, not me */
    printf("%c born %d/%d/%d, visit on day %d\\n",
           me.initial, me.born.day, me.born.month, me.born.year, visit.day);
    printf("sizeof(struct person) = %lu\\n", (unsigned long)sizeof(struct person));
    return 0;
}
`,
  },
  intro: '<p>A field can itself be a struct. <code>struct person</code> contains a complete <code>struct date</code> called <code>born</code>: its three ints are stored inside <code>me</code>.</p><p>Its other field, <code>next_visit</code>, is only a pointer to a <code>struct date</code> that lives somewhere else.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['me', 'me.born', 'visit'], line: 18, text: '<p>Open <code>me</code> in the memory picture: <code>initial</code>, then the box <code>born</code> with <code>day</code>, <code>month</code> and <code>year</code> nested inside it, then the pointer <code>next_visit</code>.</p>' },
    { do: 'over', line: 21, check: 'visit.year == 2025', text: '<p><code>visit</code> is a separate <code>struct date</code>, set to 3/11/2025.</p>' },
    { do: { to: 25 }, line: 25, check: 'me.born.year == 2010', text: '<p>Two dots reach a field of a field: <code>me.born.day</code> is "the <code>day</code> of the <code>born</code> of <code>me</code>".</p><p>Point at <code>me.born</code>: it starts 4 bytes into <code>me</code>, because after the 1-byte <code>initial</code> come 3 padding bytes so the ints are aligned.</p>' },
    { do: 'over', line: 26, check: 'me.next_visit == &visit', text: '<p>An arrow now goes from <code>me.next_visit</code> to <code>visit</code>. The date of birth is <i>inside</i> <code>me</code>; the visit date is only <i>pointed to</i>.</p>' },
    { do: 'over', line: 27, check: 'visit.day == 4', text: '<p><code>me.next_visit-&gt;day = 4;</code> used a dot to reach the pointer field, then <code>-&gt;</code> to follow it. The yellow 4 is in <code>visit</code>, outside <code>me</code>.</p>' },
    { do: 'over', line: 29, show: 'term', output: 'J born 14/2/2010, visit on day 4', text: '<p>The <code>printf</code> on lines 27 and 28 is one statement, so one step ran both lines.</p>' },
    { do: 'over', line: 30, output: 'sizeof(struct person) = 20', text: '<p>20 bytes: <code>initial</code> (1) + padding (3) + <code>born</code> (12) + <code>next_visit</code> (4). The pointed-to <code>visit</code> is not counted: a pointer field is always just the size of an address.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">Copying <code>me</code> with <code>=</code> would copy <code>born</code> completely, but copy only the <i>address</i> in <code>next_visit</code>: both copies would point at the same <code>visit</code>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'unions', unit: 'Structs', title: 'Unions share the same bytes',
  blurb: 'Write an int into a union, then read the same four bytes as chars or as a float.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a union keeps all its members in the same bytes */
#include <stdio.h>

union view {
    int i;
    float f;
    unsigned char b[4];
};

int main(void)
{
    union view v;

    v.i = 258;                 /* 258 = 0x00000102 */
    printf("as int %d, bytes %d %d %d %d\\n", v.i, v.b[0], v.b[1], v.b[2], v.b[3]);
    v.f = 1.0f;                /* now the same 4 bytes hold a float */
    printf("as float %f, as int 0x%x\\n", v.f, (unsigned)v.i);
    printf("bytes %d %d %d %d, size %lu\\n", v.b[0], v.b[1], v.b[2], v.b[3], (unsigned long)sizeof v);
    return 0;
}
`,
  },
  intro: '<p>A <b>union</b> looks like a struct, but all its members start at the same address. <code>union view</code> is not 12 bytes but 4: <code>i</code>, <code>f</code> and <code>b</code> are three ways of reading the same 4 bytes.</p><p>Writing one member overwrites the others. Unions save space when only one member is in use at a time, and they let you look at the bytes behind a value.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['v'], line: 14, text: '<p><code>v</code> is a single 4-byte box. Open it: the three members are listed, and all three have the same address.</p>' },
    { do: 'over', line: 15, bytes: 'v', check: 'v.b[0] == 2 && v.b[1] == 1 && v.b[2] == 0', text: '<p><code>v.i = 258;</code> stored the int 258, which is <code>0x00000102</code>.</p><p>The bytes panel shows the 4 bytes in address order: <code>02 01 00 00</code>. The <b>lowest</b> byte comes first. This machine is <b>little-endian</b>, like most PCs and phones.</p>' },
    { do: 'over', line: 16, show: 'term', output: 'as int 258, bytes 2 1 0 0', text: '<p>Reading <code>v.b[0]</code> to <code>v.b[3]</code> read the bytes of the int one at a time. Nothing was converted: the same bits, a different type.</p>' },
    { do: 'over', line: 17, check: 'v.i == 1065353216', bytes: 'v', text: '<p><code>v.f = 1.0f;</code> wrote a float into the same bytes. The int 258 is gone. In the memory picture, <code>v.i</code> also changed, to 1065353216.</p><p>A float is stored as sign, exponent and fraction bits. For 1.0 those bits are <code>0x3f800000</code>: bytes <code>00 00 80 3f</code>.</p>' },
    { do: 'over', line: 18, output: 'as float 1.000000, as int 0x3f800000', text: '<p>Read as a float, the bytes mean 1.0. Read as an int, the same bits mean <code>0x3f800000</code>.</p>' },
    { do: 'over', line: 19, output: 'bytes 0 0 128 63, size 4', text: '<p>128 is <code>0x80</code> and 63 is <code>0x3f</code>. And <code>sizeof v</code> is 4: the size of the biggest member, not the sum.</p>' },
    { do: { set: ['v.b[3]', '64'] }, check: 'v.f == 4.0', text: '<p>This step set the top byte, <code>v.b[3]</code>, to 64 (<code>0x40</code>). The bytes are now <code>00 00 80 40</code>, the float <code>0x40800000</code>: the exponent bits went up by 2, which multiplies the value by 4, and <code>v.f</code> is now 4.0. Look at <code>v.f</code> in the memory picture.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">The C standard says to read the member you last wrote. Reading another member shows the raw bytes as that type; it is how you study how values are stored, but the result depends on the machine.</div><div class="try">Try it: start again, step to line 15 and set <code>v.b[1]</code> to 0. What is <code>v.i</code> now?</div>' },
  ],
});

SEE.Lessons.add({
  id: 'enums-bitfields', unit: 'Structs', title: 'Enums and bit-fields',
  blurb: 'enum names are plain ints; bit-fields pack several small numbers into one int.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: enum gives names to ints; bit-fields pack small values into one int */
#include <stdio.h>

enum colour { RED, GREEN, BLUE = 10, VIOLET };

struct flags {
    unsigned int visible : 1;    /* 1 bit: 0 or 1   */
    unsigned int layer   : 3;    /* 3 bits: 0 to 7  */
    unsigned int speed   : 4;    /* 4 bits: 0 to 15 */
};

int main(void)
{
    enum colour c = GREEN;
    struct flags f;
    unsigned int n = 9;

    printf("RED %d GREEN %d BLUE %d VIOLET %d\\n", RED, GREEN, BLUE, VIOLET);
    c = VIOLET;
    c = c + 1;                   /* allowed: an enum is just an int */
    f.visible = 1;
    f.layer = 5;
    f.speed = n;
    f.layer = n;                 /* too big for 3 bits: only 9 & 7 = 1 is kept */
    printf("c = %d, layer %u, speed %u, size %lu\\n", (int)c, (unsigned)f.layer, (unsigned)f.speed, (unsigned long)sizeof f);
    return 0;
}
`,
  },
  intro: '<p><code>enum colour</code> gives names to int constants. They count up from 0 unless you give a value: here <code>RED</code> is 0, <code>GREEN</code> 1, <code>BLUE</code> 10 and <code>VIOLET</code> 11.</p><p>A <b>bit-field</b> is a struct field with a width in bits after a colon. <code>struct flags</code> keeps three small numbers in 8 bits of a single <code>unsigned int</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['f'], line: 14, text: '<p><code>c</code> is a 4-byte variable, like an <code>int</code>. <code>f</code> is also only 4 bytes even though it has three fields.</p>' },
    { do: { to: 18 }, line: 18, check: 'c == 1 && n == 9', text: '<p><code>c</code> holds 1. The memory picture shows the number; the name <code>GREEN</code> is only a label the compiler knows.</p>' },
    { do: 'over', line: 19, show: 'term', output: 'RED 0 GREEN 1 BLUE 10 VIOLET 11', text: '<p>The names print as plain numbers. After <code>BLUE = 10</code>, counting carries on from 10, so <code>VIOLET</code> is 11.</p>' },
    { do: 'over', line: 20, check: 'c == 11', text: '<p><code>c = VIOLET;</code> stored 11.</p>' },
    { do: 'over', line: 21, check: 'c == 12', text: '<p><code>c + 1</code> is 12. No colour has that value, but C does not check: an enum variable is an int with a nicer name, and any int can go in it.</p>' },
    { do: { to: 24 }, line: 24, check: 'f.visible == 1 && f.layer == 5 && f.speed == 9', bytes: 'f', text: '<p>Three fields set. In the bytes panel they all sit in the first byte, <code>0x9b</code>:</p><ul><li>bit 0 is <code>visible</code> = 1,</li><li>bits 1 to 3 are <code>layer</code> = 5 (binary 101),</li><li>bits 4 to 7 are <code>speed</code> = 9 (binary 1001).</li></ul><p>1 + 5&times;2 + 9&times;16 = 155 = <code>0x9b</code>.</p>' },
    { do: 'over', line: 25, check: 'f.layer == 1 && f.speed == 9', text: '<p><code>f.layer = n;</code> tried to store 9 (binary 1001) in 3 bits. Only the low 3 bits, 001, fit, so <code>layer</code> is 1. No error, no warning at run time: the extra bit is simply lost.</p>' },
    { do: 'over', line: 26, output: 'c = 12, layer 1, speed 9, size 4', text: '<p>All three fields together take one 4-byte <code>unsigned int</code>.</p><div class="note">You cannot take the address of a bit-field (<code>&amp;f.layer</code> is an error): it does not start on a byte boundary. How bits are laid out is up to the compiler, so bit-fields are for saving space, not for matching an exact file format.</div>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: start again, run to line 24 and set <code>f.speed</code> to 15 in the memory picture. Watch byte 0 in the bytes panel become <code>0xfb</code>.</div>' },
  ],
});
