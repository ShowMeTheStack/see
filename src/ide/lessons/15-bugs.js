// Unit 15: bugs and how to catch them.
SEE.Lessons.add({
  id: 'uninitialised', unit: 'Bugs and how to catch them', title: 'Reading a variable before setting it',
  blurb: 'A local starts with whatever was in its memory; See shows it red and warns when it is read.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a counter that was never set to zero */
#include <stdio.h>

int main(void)
{
    int count;                 /* no starting value */
    int sum = 0;
    int i;

    for (i = 0; i < 3; i++) {
        count++;               /* count + 1, but count was never set */
        sum += i;
    }
    printf("count %d, sum %d\\n", count, sum);
    return 0;
}
`,
  },
  intro: '<p>A local variable gets memory in its function\'s frame, but no value. Its bytes hold whatever the last user of that memory left there. Reading it is a bug that may go unnoticed for years, because the leftover value is often 0.</p><p>See tracks which bytes have been written. Unset bytes are drawn <b>red</b>, and reading them adds a <b>runtime warning</b> to the Problems panel.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 7, text: '<p><code>count</code>, <code>sum</code> and <code>i</code> are all red. Point at <code>count</code> in the memory picture: it shows a value, because 4 bytes always hold <i>some</i> number, but nothing in this program put it there.</p>' },
    { do: 'over', times: 2, line: 11, check: 'sum == 0 && i == 0', text: '<p><code>sum</code> and <code>i</code> are set, and no longer red. <code>count</code> still is. Line 11 is about to read it.</p>' },
    { do: 'over', line: 12, show: 'probs', text: '<p>The Problems panel now has a runtime warning on line 11: <i>reading \'count\' in main() before it was given a value</i>. The program did not stop: in C this is not an error the machine notices, only a wrong answer.</p><p><code>count</code> is no longer red, because <code>count++</code> wrote it. But what it wrote was junk plus 1.</p>' },
    { do: { set: ['count', '1000'] }, check: 'count == 1000', show: 'memory', text: '<p>To see how much the leftover value matters, this step set <code>count</code> to 1000, as if the memory had held 999 before. Nothing in the program would notice.</p>' },
    { do: { to: 14 }, line: 14, check: 'count == 1002 && sum == 3', text: '<p>The loop finished. <code>sum</code> is right, 3, because it started at 0. <code>count</code> is 1002: it counted three times, but from the wrong start.</p>' },
    { do: 'over', show: 'term', output: 'count 1002, sum 3', text: '<p>A wrong answer, and no crash to point at it.</p>' },
    { do: { edit: [6, '    int count = 0;             /* fixed: a known start */'] }, text: '<p>The fix is to give <code>count</code> a value where it is declared. This step changed line 6.</p>' },
    { do: 'start', line: 6, text: '<p>Built again. Now line 6 has code to run: it stores 0 into <code>count</code>, so the debugger stops there first.</p>' },
    { do: 'continue', state: 'exited', output: 'count 3, sum 3', text: '<p>Three, as it should be, and no warning in the Problems panel.</p><div class="note">Globals and static locals always start at 0. Locals and <code>malloc</code> blocks do not: set them before you read them.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'signed-overflow', unit: 'Bugs and how to catch them', title: 'Signed integer overflow',
  blurb: 'An int has a largest value; going past it is undefined, while unsigned wraps around by rule.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: an int has 32 bits, and going past the top is undefined */
#include <stdio.h>
#include <limits.h>

int main(void)
{
    int big = INT_MAX - 3;
    unsigned int u = UINT_MAX;
    int i;

    for (i = 0; i < 4; i++)
        big = big + 1;           /* the fourth +1 goes past INT_MAX */
    u = u + 1;                   /* unsigned: wraps to 0, and that is allowed */
    printf("big %d, u %u\\n", big, u);
    printf("INT_MAX is %d\\n", INT_MAX);
    return 0;
}
`,
  },
  intro: '<p>An <code>int</code> here has 32 bits, so its values run from <code>INT_MIN</code> (-2147483648) to <code>INT_MAX</code> (2147483647), both from <code>&lt;limits.h&gt;</code>. If a calculation on <code>int</code>s gives a result outside that range, C says the behaviour is <b>undefined</b>: anything may happen.</p><p>Unsigned types are different: their arithmetic is defined to wrap around. See warns when a signed calculation overflows.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 7, text: '<p>Two variables near the top of their ranges are about to be set.</p>' },
    { do: 'over', times: 2, line: 11, check: 'big == 2147483644 && u == 4294967295', text: '<p><code>big</code> is <code>INT_MAX - 3</code>, 2147483644. <code>u</code> is <code>UINT_MAX</code>, 4294967295: all 32 bits set.</p>' },
    { do: 'over', times: 6, line: 11, check: 'big == 2147483647 && i == 2', text: '<p>Three turns of the loop: <code>big</code> is exactly <code>INT_MAX</code> now. No problem yet: it fits.</p>' },
    { do: 'over', line: 12, check: 'i == 3', text: '<p>The fourth turn. Line 12 will compute 2147483647 + 1, which no <code>int</code> can hold.</p>' },
    { do: 'over', line: 11, check: 'big < 0', show: 'probs', text: '<p>The Problems panel shows a runtime warning: <i>signed integer overflow: 2147483647 + 1 does not fit in an int</i>.</p><p><code>big</code> is now -2147483648. The machine wrapped around to the bottom of the range, but C does not promise that: a compiler may assume overflow never happens and change the code accordingly, so a program can behave differently with optimisation on.</p>' },
    { do: 'over', times: 2, line: 14, check: 'u == 0', show: 'memory', text: '<p><code>u</code> went from <code>UINT_MAX</code> to 0. For <code>unsigned</code> that is the rule: the arithmetic is done modulo 2 to the 32. No warning, because nothing went wrong.</p>' },
    { do: 'over', show: 'term', output: 'big -2147483648, u 0', text: '<p>The printed values: a large positive count that became negative. In a real program that might be a size, a balance or a time.</p>' },
    { do: 'continue', state: 'exited', output: 'INT_MAX is 2147483647', text: '<div class="note">Check before you add: <code>if (big > INT_MAX - 1)</code> tests whether <code>big + 1</code> would overflow, without doing the overflowing addition. Or use a wider or unsigned type when the values can be large.</div><div class="try">Try it: the check can be switched off in the <b>Run</b> menu: <b>Check for integer overflow</b>. Run again without it and the program prints the same thing, silently.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'dangling-pointer', unit: 'Bugs and how to catch them', title: 'A pointer to a local that is gone',
  blurb: 'Returning the address of a local gives a pointer into a frame that no longer exists.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: returning the address of a local variable */
#include <stdio.h>

int *make_counter(void)
{
    int count = 42;            /* lives in make_counter's frame */
    return &count;             /* the frame is gone after the return */
}

int main(void)
{
    int *p;
    int value;

    p = make_counter();
    value = *p;                /* reads memory that belongs to no one */
    printf("%d\\n", value);
    return 0;
}
`,
  },
  intro: '<p>A local variable lives in its function\'s frame, and the frame is removed when the function returns. A pointer to that local still holds the address, but nothing lives there any more: it is a <b>dangling pointer</b>.</p><p>This lesson starts with a build, because the compiler can spot this one.</p>',
  steps: [
    { do: 'build', show: 'probs', errors: "returns address of local variable 'count'", text: '<p>A warning, not an error: the program still builds. The compiler sees that line 7 returns the address of <code>count</code>, which stops existing at that moment.</p><p>Warnings like this one are worth reading every time.</p>' },
    { do: 'start', show: 'memory', line: 15, text: '<p><code>main</code>\'s frame has <code>p</code> and <code>value</code>, both red.</p>' },
    { do: 'into', line: 6, text: '<p>A frame for <code>make_counter</code> below <code>main</code>\'s, with <code>count</code> in it. Note its address.</p>' },
    { do: 'over', line: 7, check: 'count == 42', text: '<p><code>count</code> is 42, at an address in <code>make_counter</code>\'s frame.</p>' },
    { do: 'out', line: 15, text: '<p>The function returned the address of <code>count</code>, and its frame was removed from the stack. The memory is still there, but it belongs to no frame now.</p>' },
    { do: 'over', line: 16, check: 'p != 0', text: '<p><code>p</code> holds the old address of <code>count</code>. Its arrow goes below the bottom of the stack, to memory no function owns.</p><p>On a real machine those bytes would probably still say 42 for a while, until the next call reuses them. A program that works "by luck" like that is the worst kind of bug.</p>' },
    { do: 'over', state: 'faulted', text: '<p>See stops the program at the read on line 16: <i>stack memory of a function that has already returned (a dangling pointer to a local variable)</i>.</p>' },
    { state: 'faulted', do: { edit: [6, '    static int count = 42;     /* static: lives with the globals */'] }, text: '<p>One fix is <code>static</code>: then <code>count</code> lives with the globals for the whole run, and its address stays good after the return. Other fixes: let the caller pass in a pointer to its own variable, or <code>malloc</code> the memory and have the caller free it.</p>' },
    { do: 'start', line: 15, text: '<p>Built again, without the warning this time.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: '42', text: '<p>The pointer now points at <code>count</code> in the globals area, which lasts as long as the program.</p><div class="note">Never keep the address of a local after its function has returned.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'stack-smashing', unit: 'Bugs and how to catch them', title: 'Stack smashing',
  blurb: 'A copy that runs past an array in a frame overwrites the saved frame pointer and the return address.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a copy that runs past the end of an array inside a struct */
#include <stdio.h>

struct person {
    char name[8];              /* room for 7 letters and the '\\0' */
    int age;
};

void greet(const char *who)
{
    struct person p;
    int i;

    p.age = 30;
    for (i = 0; who[i] != '\\0'; i++)     /* no check against the size */
        p.name[i] = who[i];
    p.name[i] = '\\0';
    printf("%s is %d\\n", p.name, p.age);
}

int main(void)
{
    greet("Ada");
    greet("Maximilian Smith");
    printf("done\\n");
    return 0;
}
`,
  },
  intro: '<p>Locals sit just below the saved frame pointer and the return address. A write past the end of a local array goes <b>up</b> in memory, over whatever is next: other locals, then those two links. When the function returns, it jumps to a ruined return address.</p><p>Real compilers put a secret value, a <b>canary</b>, next to the links and check it before returning. See checks the links themselves.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 23, text: '<p>The first call copies "Ada", which fits easily.</p>' },
    { do: 'over', line: 24, show: 'term', output: 'Ada is 30', text: '<p>Fine. The second name, "Maximilian Smith", has 16 letters, but <code>name</code> has room for 7 and the NUL.</p>' },
    { do: 'into', line: 14, show: 'memory', expand: ['p'], text: '<p>In <code>greet</code>\'s frame, <code>p</code> is 12 bytes: <code>name</code> (8) then <code>age</code> (4). Right above <code>p</code> are the saved frame pointer and the return address.</p>' },
    { do: 'over', line: 15, bytes: 'p', check: 'p.age == 30', text: '<p>The bytes view starts at <code>p</code>: 8 bytes of <code>name</code> (junk), then <code>1e 00 00 00</code> for <code>age</code> 30, then the saved frame pointer (<code>..ff ff bf</code>) and the return address (<code>..04 08</code>).</p>' },
    { do: { to: 17 }, line: 17, check: 'i == 16 && p.age != 30', text: '<p>The loop copied all 16 letters. The bytes view shows them running through <code>name</code> ("Maximili"), then over <code>age</code> ("an S"), then over the saved frame pointer ("mith"). <code>p.age</code> is now four letters read as an int.</p><p>See did not stop: inside one struct there is no gap to catch the overrun.</p>' },
    { do: 'over', line: 18, text: '<p>The NUL went to <code>name[16]</code>: the lowest byte of the return address, which is now 0. One wrong byte is enough to send the return somewhere else.</p>' },
    { do: 'over', output: 'Maximilian Smith is', text: '<p><code>printf</code> printed the whole long name, and an <code>age</code> that is just four letters read as an int.</p><p>The damage has not shown yet. It will when <code>greet</code> tries to return.</p>' },
    { do: 'continue', state: 'faulted', text: '<p><b>Stack smashing detected</b>: <code>greet</code>\'s return address was overwritten. On a real machine, the return would jump to an address made of letters. Attackers use exactly this, choosing the bytes so that the return goes where they want.</p>' },
    { state: 'faulted', do: { edit: [15, '    for (i = 0; who[i] != \'\\0\' && i < 7; i++)   /* at most 7 letters */'] }, text: '<p>The fix: stop at 7 letters, so that the NUL goes into <code>name[7]</code>, the last byte. Use the size of the array, not the length of the input, to decide when to stop.</p>' },
    { do: 'start', line: 23, text: '<p>Built again with the bounded loop.</p>' },
    { do: 'continue', state: 'exited', output: 'Maximil is 30', text: '<p>The name is cut short, but <code>age</code>, the frame pointer and the return address are untouched, and the program ends normally.</p><div class="note">See puts a small guard gap after every plain local array, so <code>char name[8];</code> on its own would be caught at the first byte past its end. Inside a struct there is no gap, which is why this copy got all the way to the return address.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'step-back-after-crash', unit: 'Bugs and how to catch them', title: 'Stepping back from a crash',
  blurb: 'The crash is on one line and the mistake on another: step back to find where the bad value came from.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: the crash is on one line, the mistake on another */
#include <stdio.h>
#include <string.h>

struct item {
    char name[12];
    int price;
};

struct item shop[3] = { { "bread", 2 }, { "milk", 1 }, { "cheese", 5 } };

struct item *find(const char *name)
{
    int i;

    for (i = 0; i < 3; i++)
        if (strcmp(shop[i].name, name) == 0)
            return &shop[i];
    return NULL;                         /* not found */
}

int main(void)
{
    struct item *a;
    struct item *b;
    int total;

    a = find("milk");
    b = find("butter");
    total = a->price + b->price;
    printf("total %d\\n", total);
    return 0;
}
`,
  },
  intro: '<p>A crash tells you where the program died, not where it went wrong. The bad value was usually made earlier.</p><p>See records every step while debugging, so after a crash you can <b>step back</b> (F8) through the lines that led to it, and watch the memory return to how it was.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 28, text: '<p>The program looks up two items and adds their prices. Instead of stepping, run it straight to the end.</p>' },
    { do: 'continue', state: 'faulted', line: 30, text: '<p>A crash on line 30: a <b>NULL pointer dereference</b>. Line 30 uses two pointers, <code>a</code> and <code>b</code>. In the memory picture, <code>b</code> is 0 and has no arrow.</p><p>So the question is not "what is wrong with line 30?" but "how did <code>b</code> become NULL?".</p>' },
    { do: 'back', line: 30, check: 'b == 0', text: '<p><b>Step back</b> (F8) undid the crash: the program is alive again, paused at the start of line 30, before it ran. <code>b</code> is already 0 here, so the mistake happened earlier.</p>' },
    { do: 'back', line: 29, text: '<p>One more step back: the start of line 29, before <code>b</code> was set. <code>b</code> is red again in the memory picture.</p>' },
    { do: 'over', line: 30, check: 'b == 0 && a != 0', text: '<p>Forwards over line 29: <code>b</code> became 0. So line 29 is where the NULL came from: <code>find("butter")</code> returned it. <code>a</code>, from line 28, is fine and points at <code>shop[1]</code>.</p>' },
    { do: 'back', line: 29, text: '<p>Back again to before line 29, to look inside that call.</p>' },
    { do: 'into', line: 16, check: 'name[0] == \'b\'', text: '<p>Into <code>find</code> with <code>"butter"</code>. Now step forwards and watch why it fails.</p>' },
    { do: { to: 19 }, line: 19, check: 'i == 3', text: '<p>The loop compared <code>"butter"</code> with each of the three names in <code>shop</code>, and none matched. <code>i</code> is 3, and line 19 returns <code>NULL</code>, as <code>find</code> was written to do for a name it does not know.</p>' },
    { do: 'out', line: 29, text: '<p>Back in <code>main</code>, with NULL on its way into <code>b</code>.</p>' },
    { do: 'over', line: 30, check: 'b == 0', text: '<p>So <code>find</code> did its job. The mistake is on line 30, which uses <code>b</code> without asking whether <code>find</code> found anything.</p>' },
    { do: { edit: [30, '    total = a->price + (b != NULL ? b->price : 0);'] }, text: '<p>The fix: check the pointer before following it. This step changed line 30 to count a missing item as 0.</p>' },
    { do: 'start', line: 28, text: '<p>Built again with the check on line 30. Nothing else changed.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: 'total 1', text: '<p>No crash: milk costs 1 and butter is not sold here.</p><div class="note">After a crash, do not stare at the crashing line alone. Step back to where the bad value was made.</div><div class="try">Try it: run to the crash again and press F8 several times. Each step back restores the memory as it was, and the terminal output with it.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'watchpoint', unit: 'Bugs and how to catch them', title: 'Who changed this value? Watchpoints',
  blurb: 'Watch an expression, and switch on its eye to stop whenever its memory changes.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: something takes too much from balance */
#include <stdio.h>

int balance = 100;
int fees = 0;

void charge(int *account, int amount)
{
    *account = *account - amount;
}

int main(void)
{
    int day;

    for (day = 1; day <= 10; day++) {
        if (day == 3)
            charge(&balance, 30);      /* rent */
        if (day == 7)
            charge(&balance, 2);       /* a fee: should go on fees */
    }
    printf("balance %d, fees %d\\n", balance, fees);
    return 0;
}
`,
  },
  intro: '<p>The balance should end at 70 and the fees at 2. It does not. In a big program, many lines could have changed <code>balance</code>, and through pointers too, so searching the code for its name is not enough.</p><p>A <b>watchpoint</b> asks the debugger to stop whenever a piece of memory changes, whoever changes it.</p>',
  steps: [
    { do: 'start', show: 'watch', line: 16, watch: ['balance', 'fees'], text: '<p>The <b>Watch</b> panel now has two expressions, <code>balance</code> and <code>fees</code>. Their values are worked out again every time the program stops.</p><p>Next to each one is an <b>eye</b> button. Clicking the eye turns the expression into a <b>watchpoint</b>: the program stops just after any write that changes that memory.</p>' },
    { do: { to: 10 }, line: 10, check: 'balance == 70 && amount == 30', text: '<p>This is where the watchpoint on <code>balance</code> stops the first time: just after line 9 wrote it, from 100 to 70. Line 9 never says <code>balance</code>; it writes through the pointer <code>account</code>, and the watchpoint still catches it, because it watches the memory, not the name.</p>' },
    { do: 'out', line: 18, check: 'day == 3', text: '<p>The call stack shows who called <code>charge</code>: <code>main</code>, on line 18, with <code>day</code> 3. That is the rent, and it is right.</p>' },
    { do: { to: 10 }, line: 10, check: 'balance == 68 && amount == 2', text: '<p>The watchpoint stops again: <code>balance</code> went from 70 to 68. A 2 taken from the balance is the fee.</p>' },
    { do: 'out', line: 20, check: 'day == 7 && fees == 0', text: '<p>The caller is line 20, on day 7: <code>charge(&balance, 2)</code>. The comment says the fee should go on <code>fees</code>, and <code>fees</code> in the Watch panel is still 0. That is the bug.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: 'balance 68, fees 0', text: '<p>No more changes: those two writes were the only ones.</p>' },
    { do: { edit: [20, '            charge(&fees, -2);         /* a fee: added to fees */'] }, text: '<p>The fix: charge the fee to <code>fees</code>. Since <code>charge</code> subtracts, a fee that should add up is passed as -2.</p>' },
    { do: 'start', line: 16, text: '<p>Built again. The Watch panel keeps its expressions between runs.</p>' },
    { do: 'continue', state: 'exited', output: 'balance 70, fees 2', text: '<p>Right this time.</p><div class="try">Try it: debug again (F5), click the eye next to <code>balance</code> in the Watch panel, then press Continue (F5) a few times. The program stops just after each change, the old and new values are shown, and the call stack tells you who did it.</div>' },
  ],
});
