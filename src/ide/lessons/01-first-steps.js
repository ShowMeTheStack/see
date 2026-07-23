// Unit 1: first steps.
SEE.Lessons.add({
  id: 'hello', unit: 'First steps', title: 'Hello, memory',
  blurb: 'Your first program, and the first look at where its variables live.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: the first program */
#include <stdio.h>

int main(void)
{
    int apples = 3;
    int pears = 4;
    int total;

    total = apples + pears;
    printf("%d apples and %d pears make %d pieces of fruit\\n", apples, pears, total);
    return 0;
}
`,
  },
  intro: '<p>Every C program starts in a function called <code>main</code>. This one keeps three whole numbers, adds two of them and prints the result.</p><p>Press <b>Start</b>: See builds the program and stops just before the first line of <code>main</code> runs.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>The yellow line is the next one to run. Nothing has run yet.</p><p>On the right is the <b>memory picture</b>. The blue box is the <b>stack</b>, and in it is <code>main</code>\'s <b>frame</b>: the space this call of <code>main</code> gets for its variables. <code>apples</code>, <code>pears</code> and <code>total</code> each have 4 bytes, at addresses near <code>0xbfffff70</code>.</p><p>Their values are red: they have not been given a value, so they hold whatever was left in that memory.</p>' },
    { do: 'over', line: 7, check: 'apples == 3', text: '<p><b>Step over</b> (F10) ran line 6. <code>apples</code> is now 3, shown in yellow because it just changed.</p><p>Point at <code>apples</code> in the editor to see its value, type and address.</p>' },
    { do: 'over', line: 10, check: 'pears == 4', text: '<p>Line 7 set <code>pears</code>. Line 8 only declared <code>total</code>, so there was nothing to run and the debugger went straight to line 10.</p><p><code>total</code> is still red: declaring a variable does not give it a value in C.</p>' },
    { do: 'over', line: 11, check: 'total == 7', text: '<p><code>total = apples + pears;</code> read both values, added them, and stored 7 into the 4 bytes of <code>total</code>.</p>' },
    { do: { set: ['apples', '10'] }, check: 'apples == 10', text: '<p>The debugger can change memory too. This step set <code>apples</code> to 10, just as if you clicked its value in the memory picture and typed 10.</p><p><code>total</code> does not change: it was worked out on line 10 and C does not go back to recompute it.</p>' },
    { do: 'over', show: 'term', output: '10 apples and 4 pears make 7 pieces of fruit', text: '<p>Look at the terminal: the program printed <code>10 apples and 4 pears make 7</code>. That is the changed <code>apples</code>, but the old <code>total</code>.</p><p><code>printf</code> fills in each <code>%d</code> with the next number after the format string.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program returned 0 from <code>main</code>, which means "all went well", and ended.</p><div class="try">Try it: change the numbers in the code, press <b>F5</b> to debug it again and step with <b>F10</b>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'types-sizes', unit: 'First steps', title: 'Types and their sizes',
  blurb: 'char, short, int, long, float and double: how many bytes each one takes, and what those bytes hold.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: every type has a size in bytes */
#include <stdio.h>

int main(void)
{
    char c = 'A';
    short s = 1000;
    int i = 258;          /* 258 = 1 * 256 + 2 */
    long n = 70000L;
    float f = 1.5f;
    double d = 2.25;

    printf("char %d, short %d, int %d\\n",
           (int)sizeof c, (int)sizeof s, (int)sizeof i);
    printf("long %d, float %d, double %d\\n",
           (int)sizeof n, (int)sizeof f, (int)sizeof d);
    i = i + 256;
    printf("i is now %d\\n", i);
    return 0;
}
`,
  },
  intro: '<p>A variable is a few bytes of memory with a <b>type</b>. The type says how many bytes there are and how to read them: as a whole number, as a letter, or as a number with a fraction.</p><p><code>sizeof</code> tells you the size in bytes of a type or a variable. This program prints the sizes, and the debugger shows the bytes themselves.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>All six variables are in <code>main</code>\'s frame, all red because none has been set yet.</p><p>Look at the widths of the boxes: <code>c</code> is narrow (1 byte), <code>s</code> a little wider (2 bytes), <code>i</code>, <code>n</code> and <code>f</code> take 4 bytes, and <code>d</code> takes 8.</p>' },
    { do: { to: 13 }, line: 13, check: "c == 'A' && s == 1000 && i == 258 && n == 70000", text: '<p>Lines 6 to 11 gave every variable its value. Notice <code>70000L</code> on line 9: the <code>L</code> makes the constant a <code>long</code>, to match <code>n</code>.</p><p>Likewise <code>1.5f</code> is a <code>float</code> constant; <code>2.25</code> without a letter is a <code>double</code>.</p>' },
    { do: 'over', show: 'term', output: 'char 1, short 2, int 4', text: '<p><code>sizeof c</code> is 1, <code>sizeof s</code> is 2 and <code>sizeof i</code> is 4. A <code>char</code> is always exactly 1 byte; the others can differ between machines, and these are the sizes on the machine See imitates.</p><p><code>sizeof</code> gives an unsigned number of type <code>size_t</code>, so the program casts it with <code>(int)</code> to match <code>%d</code>.</p>' },
    { do: 'over', output: 'long 4, float 4, double 8', text: '<p>On this machine a <code>long</code> is 4 bytes, the same as an <code>int</code>. C only promises that a <code>long</code> is at least 32 bits and never smaller than an <code>int</code>. A <code>double</code> is 8 bytes and keeps about 15 significant digits; a <code>float</code> keeps about 6.</p>' },
    { bytes: 'i', line: 17, check: 'i == 258 && *(unsigned char *)&i == 2', text: '<p>The <b>Bytes</b> panel now shows the 4 bytes of <code>i</code>, one byte per box: <code>02 01 00 00</code>.</p><p>258 is 1 times 256 plus 2, so the number has the byte 2 and the byte 1. The machine stores the <b>least significant byte first</b> (at the lowest address). This order is called <b>little-endian</b>.</p>' },
    { do: 'over', bytes: 'i', check: 'i == 514 && ((unsigned char *)&i)[1] == 2', text: '<p><code>i = i + 256;</code> made <code>i</code> 514, which is 2 times 256 plus 2. In the Bytes panel only the second byte changed: <code>02 02 00 00</code>.</p><div class="try">Try it: click <code>i</code> in the memory picture and set it to 65536. Which byte becomes 1?</div>' },
    { do: 'continue', state: 'exited', output: 'i is now 514', text: '<div class="note">The type of a variable decides two things: how many bytes it takes (<code>sizeof</code>) and how those bytes are read. The same 4 bytes <code>02 02 00 00</code> read as an <code>int</code> are 514; read as a <code>float</code> they would be a tiny number near zero.</div><div class="try">Try it: add a line that prints <code>(int)sizeof(double)</code> and check it says 8.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'printf-formats', unit: 'First steps', title: 'printf and its formats',
  blurb: '%d, %c, %x, %f, %s and field widths, and what %d does with a char.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: one value, many ways to print it */
#include <stdio.h>

int main(void)
{
    char letter = 'A';
    int n = 42;
    double price = 3.5;

    printf("[%d]\\n", n);            /* decimal */
    printf("[%5d]\\n", n);           /* at least 5 wide, on the right */
    printf("[%-5d]\\n", n);          /* at least 5 wide, on the left */
    printf("[%x]\\n", n);            /* hexadecimal */
    printf("[%c] [%d]\\n", letter, letter);
    printf("[%f] [%.2f]\\n", price, price);
    printf("[%s] [%%]\\n", "text");
    return 0;
}
`,
  },
  intro: '<p><code>printf</code> prints its first argument, the <b>format string</b>, and replaces each <code>%</code> code in it with the next argument. The letter after <code>%</code> says how to write that argument.</p><p>The format must match the argument: <code>%d</code> for an <code>int</code>, <code>%f</code> for a <code>double</code>, <code>%c</code> for a character, <code>%s</code> for a string.</p>',
  steps: [
    { do: 'start', line: 6, text: '<p>Three variables: a <code>char</code>, an <code>int</code> and a <code>double</code>. The program prints them several ways. Keep the terminal in view.</p>' },
    { do: { to: 10 }, line: 10, check: "letter == 'A' && n == 42", show: 'term', text: '<p>The variables are set. Each <code>printf</code> below puts square brackets around what it prints, so you can see exactly where the spaces are.</p>' },
    { do: 'over', output: '[42]', text: '<p><code>%d</code> writes an <code>int</code> in decimal: <code>[42]</code>. It uses as many characters as the number needs and no more.</p>' },
    { do: 'over', times: 2, output: '[   42]\n[42   ]', text: '<p>A number between <code>%</code> and <code>d</code> is a <b>minimum width</b>. <code>%5d</code> pads on the left with spaces to 5 characters, so numbers line up in columns. A minus, <code>%-5d</code>, pads on the right instead.</p>' },
    { do: 'over', output: '[2a]', text: '<p><code>%x</code> writes the same number in hexadecimal (base 16): 42 is 2 times 16 plus 10, and the digit for 10 is <code>a</code>.</p><p>The memory picture and the Bytes panel use hexadecimal too, which is why addresses look like <code>0xbfffff70</code>.</p>' },
    { do: 'over', output: '[A] [65]', text: '<p>The same <code>letter</code> printed twice. <code>%c</code> writes the character <code>A</code>. <code>%d</code> writes <b>65</b>.</p><p>A <code>char</code> is a small whole number. 65 is the code of the letter A in ASCII, the table of character codes. <code>%c</code> looks the number up in that table; <code>%d</code> just writes the number.</p>' },
    { do: 'over', output: '[3.500000] [3.50]', text: '<p><code>%f</code> writes a <code>double</code> with 6 digits after the point. <code>%.2f</code> asks for 2 digits, which is how you print money or measurements.</p>' },
    { do: 'over', output: '[text] [%]', text: '<p><code>%s</code> writes a string, the characters up to the NUL that ends it. To print a percent sign itself, write <code>%%</code>.</p>' },
    { do: { edit: [15, '    printf("[%d]\\n", price);'] }, text: '<p>Line 15 has been changed to pass a <code>double</code> to <code>%d</code>, which expects an <code>int</code>. The format and the argument no longer match.</p>' },
    { do: 'build', show: 'probs', errors: "format '%d' expects argument of type 'int'", text: '<p>The <b>Problems</b> panel shows a <b>warning</b>, not an error: <i>format \'%d\' expects argument of type \'int\', but argument 2 has type \'double\'</i>. The program still builds, and many compilers say nothing at all, so read the format strings yourself.</p>' },
    { do: 'start', line: 6, text: '<p>The changed program is built and started again, warning and all.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: '[0]', text: '<p>Line 15 printed <code>[0]</code>, not 3.5. <code>printf</code> trusts the format: it read the argument as if it were an <code>int</code>, and the bytes of a <code>double</code> read that way mean something else entirely. No crash warns you; the output is just wrong.</p>' },
    { do: { edit: [15, '    printf("[%f] [%.2f]\\n", price, price);'] }, text: '<p>Line 15 is back as it was.</p><div class="note">Each <code>%</code> code consumes one argument, in order, and must match its type. <code>%d</code> on a <code>char</code> is fine and shows the character\'s code, because a <code>char</code> is promoted to an <code>int</code> when it is passed to <code>printf</code>. <code>%d</code> on a <code>double</code> is not.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'scanf-input', unit: 'First steps', title: 'Reading input with scanf',
  blurb: 'scanf reads what you type into a variable whose address you give it.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: read two numbers and add them */
#include <stdio.h>

int main(void)
{
    int a;
    int b;
    int got;

    printf("Type two whole numbers:\\n");
    got = scanf("%d %d", &a, &b);
    if (got != 2) {
        printf("That was not two numbers.\\n");
        return 1;
    }
    printf("%d + %d = %d\\n", a, b, a + b);
    return 0;
}
`,
  },
  intro: '<p><code>scanf</code> is the reverse of <code>printf</code>: it reads characters typed on the keyboard, turns them into values with the same <code>%</code> codes, and stores them in your variables.</p><p>To store into a variable, <code>scanf</code> needs to know <b>where</b> it is, so you pass its address with <code>&amp;</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 10, text: '<p><code>a</code>, <code>b</code> and <code>got</code> are in <code>main</code>\'s frame, all red. Lines 6 to 8 only declare them, so the first line to run is 10.</p>' },
    { do: 'over', line: 11, show: 'term', output: 'Type two whole numbers:', text: '<p>The question is in the terminal. Now line 11 calls <code>scanf</code>.</p><p><code>&amp;a</code> is the address of <code>a</code>, the number shown next to it in the memory picture. Point at <code>&amp;a</code> in the editor to see it.</p>' },
    { do: 'over', state: 'input', text: '<p>The program is waiting: <code>scanf</code> has nothing to read yet. In See you type into the terminal and press Enter.</p><p>The lesson will type <code>12 30</code> for you in the next step.</p>' },
    { input: '12 30\n', line: 12, check: 'a == 12 && b == 30 && got == 2', text: '<p><code>scanf</code> read <code>12</code>, skipped the space (the space in <code>"%d %d"</code> skips any spaces and newlines), read <code>30</code>, and stored them at the two addresses. Both turn yellow.</p><p>It returned 2, the number of values it stored, into <code>got</code>.</p>' },
    { do: 'over', line: 16, text: '<p><code>got</code> is 2, so the <code>if</code> on line 12 skipped its block. Checking what <code>scanf</code> returns is how a program notices bad input.</p>' },
    { do: 'over', output: '12 + 30 = 42', text: '<p>The sum is printed: <code>a + b</code> was worked out inside the call and passed to the third <code>%d</code>.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program returned 0 and ended normally. Now the same program with input it cannot read.</p>' },
    { do: 'start', line: 10, text: '<p>Started again from the top, with <code>a</code>, <code>b</code> and <code>got</code> red once more.</p>' },
    { do: 'over', times: 2, input: 'seven\n', line: 12, check: 'got == 0', text: '<p>This time the input was <code>seven</code>. <code>%d</code> cannot read a number from the letter <code>s</code>, so <code>scanf</code> stopped at once and returned 0. <code>a</code> and <code>b</code> are still red: nothing was stored in them.</p>' },
    { do: 'over', line: 13, text: '<p>This time <code>got != 2</code> is true, so the debugger went into the block on line 13.</p>' },
    { do: 'continue', state: 'exited', output: 'That was not two numbers.', text: '<div class="note">Give <code>scanf</code> the address of each variable (<code>&amp;a</code>, not <code>a</code>) and check the number it returns. Without the check, the program would have printed the leftover garbage in <code>a</code> and <code>b</code>.</div><div class="try">Try it: press F5 and type your own numbers in the terminal, or type just one number and then a letter.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'division', unit: 'First steps', title: 'Division, remainder and double',
  blurb: 'Why 7 / 2 is 3, what % gives, and how to get 3.5.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: dividing whole numbers */
#include <stdio.h>

int main(void)
{
    int a = 7;
    int b = 2;
    int q, r;
    double x, y, z;

    q = a / b;              /* whole-number division: drops the fraction */
    r = a % b;              /* remainder of that division */
    x = a / b;              /* still whole-number division, then made double */
    y = (double)a / b;      /* a becomes 7.0 first, so the division is real */
    z = a / 2.0;            /* 2.0 is a double, so a is converted too */
    printf("q=%d r=%d\\n", q, r);
    printf("x=%f y=%f z=%f\\n", x, y, z);
    printf("check: %d\\n", q * b + r);
    return 0;
}
`,
  },
  intro: '<p>When both sides of <code>/</code> are whole numbers, C does <b>whole-number division</b>: the answer is a whole number and the fraction is thrown away. <code>%</code> gives the remainder.</p><p>To divide with fractions, at least one side must be a <code>double</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>Two <code>int</code> variables to divide, two to hold the results, and three <code>double</code> variables (8 bytes each).</p>' },
    { do: { to: 11 }, line: 11, check: 'a == 7 && b == 2', text: '<p><code>a</code> is 7 and <code>b</code> is 2. Before reading on, decide what you think <code>7 / 2</code> gives.</p>' },
    { do: 'over', check: 'q == 3', text: '<p><code>q</code> is <b>3</b>, not 3.5. Both <code>a</code> and <code>b</code> are <code>int</code>, so the division is done on whole numbers and the .5 is dropped (not rounded: 9 / 5 is 1 too).</p>' },
    { do: 'over', check: 'r == 1', text: '<p><code>r</code> is 1: 7 divided by 2 is 3 with 1 left over. <code>%</code> works only on whole numbers. <code>n % 2</code> is 0 for even numbers and 1 for odd ones, which is a common use.</p>' },
    { do: 'over', check: 'x == 3.0', text: '<p><code>x</code> is a <code>double</code>, but it holds <b>3.0</b>. The right side, <code>a / b</code>, was worked out first as whole numbers (3) and only then converted to <code>double</code> to be stored. The type of the variable on the left does not change how the right side is computed.</p>' },
    { do: 'over', check: 'y == 3.5', text: '<p><code>(double)a</code> is a <b>cast</b>: it makes a <code>double</code> copy of the value of <code>a</code>, 7.0. Now one side is a <code>double</code>, so <code>b</code> is converted too and the division keeps the fraction: 3.5.</p><p>The cast does not change <code>a</code> itself; it is still the <code>int</code> 7.</p>' },
    { do: 'over', check: 'z == 3.5', text: '<p><code>2.0</code> is a <code>double</code> constant, so this division is real division as well. Writing <code>2.0</code> instead of <code>2</code> is the usual way to ask for it.</p>' },
    { do: 'over', times: 2, show: 'term', output: 'x=3.000000 y=3.500000 z=3.500000', text: '<p>The terminal shows all five results.</p>' },
    { do: 'over', output: 'check: 7', text: '<p>For whole numbers, <code>(a / b) * b + a % b</code> always gives back <code>a</code>: 3 times 2 plus 1 is 7.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">An operator looks at the types of its two operands, not at where the result goes. <code>int / int</code> is whole-number division; if either side is a <code>double</code>, the other is converted and the division keeps the fraction.</div><div class="try">Try it: set <code>b</code> to 0 in the memory picture before line 11 runs and see what dividing by zero does.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'char-ascii', unit: 'First steps', title: 'A char is a small number',
  blurb: 'Letters are stored as their ASCII codes, so you can do arithmetic on them.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: characters are numbers */
#include <stdio.h>

int main(void)
{
    char c = 'A';
    char next;
    char lower;
    char digit = '7';
    int value;

    next = c + 1;               /* the code after 'A' */
    lower = c + ('a' - 'A');    /* lower-case letters are 32 further on */
    value = digit - '0';        /* the digit's code minus the code of '0' */
    printf("%c %c %c\\n", c, next, lower);
    printf("codes: %d %d %d\\n", c, next, lower);
    printf("'7' is code %d and value %d\\n", digit, value);
    return 0;
}
`,
  },
  intro: '<p>The computer stores only numbers. A character is stored as its <b>code</b>: in ASCII, <code>\'A\'</code> is 65, <code>\'B\'</code> is 66, <code>\'a\'</code> is 97 and the digit <code>\'0\'</code> is 48.</p><p>A <code>char</code> is a 1-byte whole number that holds such a code. Writing <code>\'A\'</code> in C is just another way to write 65.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>Four <code>char</code> variables of 1 byte each, and one <code>int</code>.</p>' },
    { do: 'over', check: 'c == 65', bytes: 'c', text: '<p><code>c</code> holds the letter A. The memory picture shows it as <code>\'A\'</code>, but the Bytes panel shows the byte itself: <code>41</code> in hexadecimal, which is 65.</p><p>The check for this step was <code>c == 65</code>, and it is true: <code>\'A\'</code> and <code>65</code> are the same value.</p>' },
    { do: { to: 12 }, line: 12, check: "digit == '7'", text: '<p><code>digit</code> holds the <b>character</b> 7, whose code is 55. That is not the number 7.</p>' },
    { do: 'over', check: "next == 'B'", text: '<p><code>c + 1</code> is 65 + 1 = 66, the code of <code>\'B\'</code>. The letters A to Z have codes one after another, so adding 1 moves to the next letter.</p>' },
    { do: 'over', check: "lower == 'a'", text: '<p><code>\'a\' - \'A\'</code> is 97 - 65 = 32. Every lower-case letter is 32 codes after its capital, so adding 32 turns <code>\'A\'</code> into <code>\'a\'</code>.</p>' },
    { do: 'over', check: 'value == 7', text: '<p>The digits <code>\'0\'</code> to <code>\'9\'</code> also have codes in a row, 48 to 57. Subtracting <code>\'0\'</code> turns the character <code>\'7\'</code> (55) into the number 7 (55 - 48). This is how programs turn typed digits into numbers.</p>' },
    { do: 'over', show: 'term', output: 'A B a', text: '<p><code>%c</code> prints each value as a character.</p>' },
    { do: 'over', output: 'codes: 65 66 97', text: '<p><code>%d</code> prints the same three values as numbers.</p>' },
    { do: 'over', output: "'7' is code 55 and value 7", text: '<p>The character <code>\'7\'</code> and the number 7 are different values, 55 and 7.</p>' },
    { do: { set: ['c', '90'] }, check: "c == 'Z'", text: '<p>The debugger set <code>c</code> to 90. The memory picture shows it as <code>\'Z\'</code>: 90 is the code of Z. Typing a number or a character into a <code>char</code> stores the same kind of thing.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note">A <code>char</code> is a whole number of one byte. <code>\'A\'</code> is its code, 65. Whether you see a letter or a number depends only on how you print it: <code>%c</code> or <code>%d</code>.</div><div class="try">Try it: change line 6 to <code>char c = \'Y\';</code> and run. What does <code>next</code> print after Z?</div>' },
  ],
});

SEE.Lessons.add({
  id: 'define-const', unit: 'First steps', title: '#define and const int',
  blurb: 'Two ways to name a fixed number: a text replacement, or a variable you may not change.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: naming fixed numbers */
#include <stdio.h>

#define WEEKS 4                 /* the preprocessor replaces WEEKS with 4 */
const int days_per_week = 7;    /* a real variable, but read-only */

int main(void)
{
    const int hours = 24;       /* read-only, in main's frame */
    int days;
    int total;

    days = WEEKS * days_per_week;
    total = days * hours;
    /* hours = 25; */
    printf("%d weeks = %d days = %d hours\\n", WEEKS, days, total);
    return 0;
}
`,
  },
  intro: '<p>Good programs give names to fixed numbers instead of scattering 7 and 24 through the code. C has two ways.</p><p><code>#define WEEKS 4</code> tells the <b>preprocessor</b> to replace the word <code>WEEKS</code> with <code>4</code> before the compiler even sees the code. <code>const int</code> makes a real variable, with an address and bytes in memory, that the compiler will not let you change.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 9, text: '<p>Look for each name in the memory picture.</p><ul><li><code>days_per_week</code> is a global, and because it is <code>const</code> it is in the <b>read-only data</b> area, with a padlock.</li><li><code>hours</code> is in <code>main</code>\'s frame, also with a padlock.</li><li><code>WEEKS</code> is nowhere: it is not a variable. By the time the program runs, it is just the number 4 written into line 13.</li></ul>' },
    { do: 'over', line: 13, check: 'hours == 24', text: '<p><code>hours</code> was given its value when it was created. A <code>const</code> variable must get its value in its declaration, because no later line may assign to it.</p>' },
    { do: 'over', line: 14, check: 'days == 28', text: '<p><code>WEEKS * days_per_week</code> was really <code>4 * days_per_week</code>: the 4 came from the program text, the 7 was read from memory.</p><div class="try">Try it: point at <code>days_per_week</code> in the editor to see its address, near the code and the string literals, far from the stack.</div>' },
    { do: 'over', line: 16, check: 'total == 672', text: '<p>28 days times 24 hours is 672. Line 15 is only a comment, so the debugger went on to line 16.</p>' },
    { do: 'over', show: 'term', output: '4 weeks = 28 days = 672 hours', text: '<p>The answer is printed. <code>WEEKS</code> in the <code>printf</code> is just 4.</p>' },
    { do: { edit: [15, '    hours = 25;'] }, text: '<p>Line 15 now tries to change <code>hours</code>. The next step builds the program to see what the compiler says.</p>' },
    { do: 'build', show: 'probs', errors: 'read-only', text: '<p>The <b>Problems</b> panel shows an error on line 15: <code>hours</code> is read-only. The compiler refuses the program, so it never runs.</p><p>This is the point of <code>const</code>: a mistake is caught before the program runs.</p>' },
    { do: { edit: [15, '    /* hours = 25; */'] }, text: '<p>Line 15 is a comment again. <code>#define</code> has one more difference: <code>WEEKS = 5;</code> would become <code>4 = 5;</code>, which is also an error, but a confusing one, since the compiler never sees the name.</p>' },
    { do: 'start', line: 9, text: '<p>With the line commented out again, the program builds and starts without a problem.</p>' },
    { do: 'continue', state: 'exited', text: '<div class="note"><code>#define</code> is text replacement: no type, no memory, no address. <code>const int</code> is a real variable with a type and an address that the compiler keeps you from changing. A <code>const</code> global lives in read-only data; a <code>const</code> local lives in the frame like any other local.</div>' },
  ],
});
