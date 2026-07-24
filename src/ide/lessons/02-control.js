// Unit 2: decisions and loops.
SEE.Lessons.add({
  id: 'if-else', unit: 'Decisions and loops', title: 'if, else, and conditions are numbers',
  blurb: 'A condition is just a number: 0 means false, anything else means true.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: choosing which line runs next */
#include <stdio.h>

int main(void)
{
    int age = 15;
    int is_teen;
    int count = 3;

    is_teen = (age >= 13 && age <= 19);   /* a comparison gives 1 or 0 */
    if (age >= 18) {
        printf("adult\\n");
    } else if (is_teen) {
        printf("teenager\\n");
    } else {
        printf("child\\n");
    }
    if (count) {                          /* any value other than 0 is true */
        printf("count is not zero\\n");
    }
    if (count = 0) {                      /* = stores, == compares */
        printf("this never prints\\n");
    }
    printf("count is now %d\\n", count);
    return 0;
}
`,
  },
  intro: '<p><code>if</code> runs a block only when its condition is true. In C there is no special true or false value: a condition is any number, and <b>0 means false</b>, everything else means true.</p><p>The comparison operators <code>&lt; &lt;= &gt; &gt;= == !=</code> give the <code>int</code> 1 when they hold and 0 when they do not.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 6, text: '<p>Three <code>int</code> variables in <code>main</code>\'s frame. Watch the yellow line: in this lesson the interesting thing is <b>which</b> line runs next.</p>' },
    { do: { to: 10 }, line: 10, check: 'age == 15 && count == 3', text: '<p><code>age</code> is 15. Line 10 stores the result of a condition in an ordinary <code>int</code>.</p>' },
    { do: 'over', line: 11, check: 'is_teen == 1', watch: ['age >= 18', 'is_teen'], text: '<p><code>age &gt;= 13</code> is 1 and <code>age &lt;= 19</code> is 1, and <code>&amp;&amp;</code> of two true values is 1. So <code>is_teen</code> is the number 1.</p><p>The Watch panel now shows <code>age &gt;= 18</code>: it is 0, which is false.</p>' },
    { do: 'over', line: 13, text: '<p>The condition on line 11 was 0, so the debugger skipped the block on line 12 and jumped to the <code>else if</code> on line 13.</p>' },
    { do: 'over', line: 14, text: '<p><code>is_teen</code> is 1, which is not 0, so this condition is true and line 14 is next. The final <code>else</code> will be skipped: only one branch of an <code>if</code> / <code>else if</code> / <code>else</code> chain ever runs.</p>' },
    { do: 'over', line: 18, show: 'term', output: 'teenager', text: '<p>After printing, the debugger jumped past the rest of the chain to line 18.</p><p><code>if (count)</code> tests the number 3 directly. 3 is not 0, so it counts as true.</p>' },
    { do: 'over', times: 2, line: 21, output: 'count is not zero', text: '<p>Line 21 has a classic mistake: <code>count = 0</code> with a single <code>=</code>. That is an <b>assignment</b>, not a comparison. It stores 0 in <code>count</code>, and the value of the whole expression is the value stored, 0.</p>' },
    { do: 'over', line: 24, check: 'count == 0', errors: 'suggest parentheses around assignment', text: '<p><code>count</code> turned yellow: it is now 0. And because the value of <code>count = 0</code> is 0, the condition was false and line 22 was skipped.</p><p>See warned about this line when it built the program: the Problems panel says <i>suggest parentheses around assignment used as truth value</i>. If you really mean an assignment there, write <code>if ((count = 0))</code>.</p>' },
    { do: 'continue', state: 'exited', output: 'count is now 0', text: '<div class="note">A condition is a number. Comparisons and <code>&amp;&amp;</code>, <code>||</code>, <code>!</code> give 1 or 0; <code>if</code> treats 0 as false and any other value as true. Use <code>==</code> to compare; <code>=</code> changes the variable.</div><div class="try">Try it: restart, and before line 11 runs click <code>age</code> and set it to 20 or to 8. Step and watch which branch runs.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'switch-fallthrough', unit: 'Decisions and loops', title: 'switch and fall-through',
  blurb: 'switch jumps to a case label, and keeps going until a break.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: switch jumps to a label and falls through */
#include <stdio.h>

int main(void)
{
    int day = 2;
    int points = 0;

    switch (day) {
    case 1:
        printf("Monday\\n");
        break;
    case 2:
        printf("Tuesday\\n");
        /* no break here: falls into case 3 */
    case 3:
        printf("Wednesday\\n");
        points = points + 10;
        break;
    default:
        printf("some other day\\n");
    }
    printf("points = %d\\n", points);
    return 0;
}
`,
  },
  intro: '<p><code>switch</code> compares one whole number with a list of <code>case</code> labels and <b>jumps</b> to the matching one. From there it runs line after line, straight through the following labels, until it meets <code>break</code> or the closing brace.</p><p>Running on into the next case is called <b>fall-through</b>. Sometimes it is wanted; usually a missing <code>break</code> is a bug.</p>',
  steps: [
    { do: 'start', line: 6, text: '<p><code>day</code> will be 2. Before stepping, decide which lines you expect to run.</p>' },
    { do: 'over', times: 2, line: 9, check: 'day == 2 && points == 0', text: '<p>Line 9 is the <code>switch</code>. It looks at the value of <code>day</code>, which is 2.</p>' },
    { do: 'over', line: 14, text: '<p>The debugger jumped straight to line 14, just after <code>case 2:</code>. The lines for <code>case 1</code> were never looked at; a <code>switch</code> does not test the cases one by one like an <code>if</code> chain, it jumps.</p>' },
    { do: 'over', line: 17, show: 'term', output: 'Tuesday', text: '<p>There is no <code>break</code> after line 14, so the program fell through: the label <code>case 3:</code> is just a place to jump to, not a wall. Line 17 runs as well.</p>' },
    { do: 'over', line: 18, output: 'Wednesday', text: '<p>"Wednesday" is printed even though <code>day</code> is 2.</p>' },
    { do: 'over', line: 19, check: 'points == 10', text: '<p><code>points</code> became 10 as part of case 3.</p>' },
    { do: 'over', line: 23, text: '<p><code>break</code> leaves the <code>switch</code> at once, so the <code>default</code> part was skipped and line 23 is next.</p>' },
    { do: 'continue', state: 'exited', output: 'points = 10', text: '<p>The program printed <code>points = 10</code> and ended. One missing <code>break</code> made a Tuesday count as a Wednesday too.</p>' },
    { do: 'start', line: 6, text: '<p>Started again. This time the lesson changes <code>day</code> before the <code>switch</code> looks at it.</p>' },
    { do: 'over', times: 2, line: 9, text: '<p>At the <code>switch</code> again, with <code>day</code> equal to 2.</p>' },
    { do: { set: ['day', '5'] }, check: 'day == 5', text: '<p><code>day</code> is now 5, as if you clicked it in the memory picture and typed 5. No <code>case</code> has the label 5.</p>' },
    { do: 'over', line: 21, text: '<p>With no matching case, the <code>switch</code> jumped to <code>default:</code>, line 21. Without a <code>default</code>, it would have skipped the whole block.</p>' },
    { do: 'continue', state: 'exited', output: 'points = 0', text: '<div class="note">A <code>switch</code> jumps to one label and runs on from there. End each case with <code>break</code> unless you mean it to fall through, and then say so in a comment, as line 15 does.</div><div class="try">Try it: add <code>break;</code> on line 15 and step through again with <code>day</code> equal to 2.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'while-for', unit: 'Decisions and loops', title: 'while and for: watching the counter',
  blurb: 'Two ways to repeat, step by step: test, body, update, test again.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: adding 1 + 2 + ... + 4 twice */
#include <stdio.h>

int main(void)
{
    int i;
    int sum;

    sum = 0;
    i = 1;
    while (i <= 4) {          /* test before each round */
        sum = sum + i;
        i = i + 1;
    }
    printf("while: sum = %d, i = %d\\n", sum, i);

    sum = 0;
    for (i = 1; i <= 4; i++) {   /* start; test; update */
        sum += i;
    }
    printf("for:   sum = %d, i = %d\\n", sum, i);
    return 0;
}
`,
  },
  intro: '<p>A <b>loop</b> runs its body again and again while a condition is true. <code>while (test) body</code> checks the test, runs the body, and goes back to the test.</p><p><code>for (start; test; update) body</code> is the same loop with the three parts written on one line: it runs <code>start</code> once, then test, body, update, test, body, update, until the test is 0.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 9, text: '<p>Two variables: the counter <code>i</code> and the running total <code>sum</code>. Watch both change in the memory picture.</p>' },
    { do: 'over', times: 2, line: 11, check: 'i == 1 && sum == 0', watch: ['i <= 4'], text: '<p><code>i</code> is 1 and <code>sum</code> is 0. The Watch panel shows the loop\'s test, <code>i &lt;= 4</code>, which is 1 (true).</p>' },
    { do: 'over', line: 12, text: '<p>The test was true, so the body runs.</p>' },
    { do: 'over', times: 2, line: 11, check: 'sum == 1 && i == 2', text: '<p>The first round added 1 to <code>sum</code> and moved <code>i</code> to 2. At the closing brace the loop went <b>back</b> to the test on line 11.</p>' },
    { do: 'over', times: 3, line: 11, check: 'sum == 3 && i == 3', text: '<p>Second round: <code>sum</code> is 1 + 2 = 3 and <code>i</code> is 3. Each round is test, line 12, line 13.</p>' },
    { do: 'over', times: 6, line: 11, check: 'sum == 10 && i == 5', text: '<p>Two more rounds. Now <code>i</code> is 5 and <code>i &lt;= 4</code> in the Watch panel is 0. The test on line 11 will fail this time.</p>' },
    { do: 'over', line: 15, text: '<p>The test was false, so the loop ended and the debugger jumped to line 15, after the closing brace.</p><p>Notice that <code>i</code> is 5, one past the last value used in the body. The loop stops only when the test fails.</p>' },
    { do: 'over', show: 'term', output: 'while: sum = 10, i = 5', text: '<p>The <code>while</code> loop added 1 + 2 + 3 + 4.</p>' },
    { do: 'over', times: 2, line: 19, check: 'i == 1 && sum == 0', text: '<p>Line 18 is the <code>for</code>. Its first part, <code>i = 1</code>, ran once, then the test <code>i &lt;= 4</code> passed and the body on line 19 is next.</p>' },
    { do: 'over', times: 2, line: 19, check: 'sum == 1 && i == 2', text: '<p>After the body, the debugger went back to line 18 and ran the <b>update</b> <code>i++</code> (add 1 to <code>i</code>) and then the test. It is back in the body with <code>i</code> equal to 2.</p><p><code>sum += i</code> is short for <code>sum = sum + i</code>.</p>' },
    { do: { to: 21 }, line: 21, check: 'sum == 10 && i == 5', text: '<p>The rest of the rounds ran at once. The <code>for</code> loop ended in exactly the same state as the <code>while</code> loop: <code>sum</code> 10, <code>i</code> 5.</p>' },
    { do: 'continue', state: 'exited', output: 'for:   sum = 10, i = 5', text: '<div class="note">A <code>for</code> loop is a <code>while</code> loop with its start, test and update gathered on one line. The test runs before every round, including the first, and the update runs after every round.</div><div class="try">Try it: restart and press F8 (step back) inside a loop to watch <code>i</code> and <code>sum</code> go back to their earlier values.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'do-while', unit: 'Decisions and loops', title: 'do-while: test at the end',
  blurb: 'A loop whose body always runs at least once.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: keep asking until the answer is in range */
#include <stdio.h>

int main(void)
{
    int n;
    int tries = 0;

    do {
        printf("Pick a number from 1 to 9:\\n");
        if (scanf("%d", &n) != 1) {
            return 1;                /* not a number: give up */
        }
        tries++;
    } while (n < 1 || n > 9);        /* test after the body */

    printf("You picked %d after %d tries.\\n", n, tries);
    return 0;
}
`,
  },
  intro: '<p><code>do body while (test);</code> runs the body <b>first</b> and tests afterwards. So the body always runs at least once.</p><p>That fits asking a question: you must ask before there is an answer to check. Note the semicolon after <code>while (...)</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 7, text: '<p><code>n</code> is red: it has no value yet. A <code>while (n &lt; 1 || n &gt; 9)</code> at the top would test that garbage. A <code>do</code> loop does not test until the body has run.</p>' },
    { do: 'over', times: 3, line: 11, show: 'term', output: 'Pick a number from 1 to 9:', text: '<p>The debugger stopped on <code>do</code> (line 9) and went straight into the body, with no test, and printed the question. Line 11 reads the answer.</p>' },
    { do: 'over', state: 'input', text: '<p>The program waits for input. The lesson types <code>42</code>, which is out of range.</p>' },
    { input: '42\n', line: 14, check: 'n == 42', text: '<p><code>n</code> is 42. <code>scanf</code> returned 1, so the <code>if</code> did not give up.</p>' },
    { do: 'over', times: 2, line: 9, check: 'tries == 1', text: '<p><code>tries</code> is 1. Line 15 tested <code>n &lt; 1 || n &gt; 9</code>: 42 &gt; 9 is true, so the loop went back up to <code>do</code> on line 9 for another round.</p>' },
    { do: 'over', times: 3, state: 'input', text: '<p>The question is asked again, and the program waits.</p>' },
    { input: '7\n', line: 14, check: 'n == 7', text: '<p>This time the lesson typed <code>7</code>, and <code>scanf</code> stored it in <code>n</code>.</p>' },
    { do: 'over', times: 2, line: 17, check: 'tries == 2', text: '<p>7 is in range: <code>n &lt; 1</code> is 0 and <code>n &gt; 9</code> is 0, so the test on line 15 is 0 and the loop ends.</p>' },
    { do: 'continue', state: 'exited', output: 'You picked 7 after 2 tries.', text: '<div class="note">Use <code>do ... while</code> when the body must run once before the test makes sense. <code>while</code> and <code>for</code> test first and may run their body zero times.</div><div class="try">Try it: press F5 and type 0, then 10, then 3 in the terminal.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'break-continue', unit: 'Decisions and loops', title: 'break and continue',
  blurb: 'Leave a loop early, or skip the rest of one round.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: add up numbers, skipping odd ones, stopping at a 0 */
#include <stdio.h>

int main(void)
{
    int nums[7] = { 4, 7, 2, 9, 6, 0, 8 };
    int i;
    int sum = 0;

    for (i = 0; i < 7; i++) {
        if (nums[i] == 0) {
            break;              /* leave the loop now */
        }
        if (nums[i] % 2 != 0) {
            continue;           /* skip to the next round */
        }
        sum += nums[i];
    }
    printf("stopped at i = %d, sum = %d\\n", i, sum);
    return 0;
}
`,
  },
  intro: '<p>Inside a loop, <code>break</code> ends the loop at once and goes to the line after it. <code>continue</code> skips the rest of the body for this round only: in a <code>for</code> loop it jumps to the update (<code>i++</code>) and the test.</p><p>The program adds the even numbers of an array, stopping when it finds a 0.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['nums'], line: 6, text: '<p><code>nums</code> is an array of 7 <code>int</code>s, 28 bytes in <code>main</code>\'s frame. It is opened in the memory picture so you can see each element.</p>' },
    { do: { to: 17 }, line: 17, check: 'i == 0 && nums[i] == 4', watch: ['nums[i]'], text: '<p>Round 0: <code>nums[0]</code> is 4. It is not 0 and not odd, so neither <code>if</code> fired, and line 17 is next. The Watch panel follows <code>nums[i]</code>.</p>' },
    { do: 'over', line: 10, check: 'sum == 4', text: '<p><code>sum</code> is 4. The loop goes back to line 10 for <code>i++</code> and the test.</p>' },
    { do: 'over', times: 3, line: 15, check: 'i == 1 && nums[i] == 7', text: '<p>Round 1: <code>nums[1]</code> is 7. <code>7 % 2</code> is 1, so the test on line 14 is true and <code>continue</code> is next.</p>' },
    { do: 'over', line: 10, check: 'sum == 4', text: '<p><code>continue</code> jumped back to line 10 at once. Line 17 was skipped, so 7 was not added: <code>sum</code> is still 4.</p>' },
    { do: { to: 12 }, line: 12, check: 'i == 5 && sum == 12', text: '<p>The next rounds added 2 and 6 and skipped 9. Now <code>i</code> is 5 and <code>nums[5]</code> is 0, so <code>break</code> is next.</p>' },
    { do: 'over', line: 19, check: 'i == 5', text: '<p><code>break</code> left the loop completely. The update <code>i++</code> did not run, so <code>i</code> is still 5, and the 8 in <code>nums[6]</code> was never looked at.</p>' },
    { do: 'continue', state: 'exited', show: 'term', output: 'stopped at i = 5, sum = 12', text: '<div class="note"><code>break</code>: leave the innermost loop (or <code>switch</code>) now. <code>continue</code>: end this round and go on with the next one. Each affects only the innermost loop it is in.</div><div class="try">Try it: restart, and before the loop reaches it, click <code>nums[5]</code> and set it to 10. How far does the loop get now?</div>' },
  ],
});

SEE.Lessons.add({
  id: 'nested-loops', unit: 'Decisions and loops', title: 'Nested loops and a table',
  blurb: 'A loop inside a loop: the inner one runs all the way through for each round of the outer one.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a small times table */
#include <stdio.h>

int main(void)
{
    int row, col;

    for (row = 1; row <= 3; row++) {
        for (col = 1; col <= 4; col++) {
            printf("%4d", row * col);   /* 4 wide, so columns line up */
        }
        printf("\\n");                   /* end of one row */
    }
    return 0;
}
`,
  },
  intro: '<p>The body of a loop can be another loop. For each value of <code>row</code>, the inner loop runs <code>col</code> from 1 to 4. So line 10 runs 3 times 4 = 12 times in all.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 8, text: '<p>Two counters, <code>row</code> and <code>col</code>, both red.</p>' },
    { do: 'over', times: 2, line: 10, check: 'row == 1 && col == 1', watch: ['row * col'], text: '<p>The outer loop set <code>row</code> to 1, then the inner loop set <code>col</code> to 1. The Watch panel shows <code>row * col</code>, the number about to be printed.</p>' },
    { do: 'over', times: 2, line: 10, check: 'row == 1 && col == 2', text: '<p>One round of the inner loop: print, then back to line 9 for <code>col++</code>. <code>row</code> has not changed; only <code>col</code> moves.</p>' },
    { do: { to: 12 }, line: 12, check: 'row == 1 && col == 5', show: 'term', text: '<p>The inner loop finished: <code>col</code> reached 5 and the test <code>col &lt;= 4</code> failed.</p><p>The terminal is still empty. Output to the terminal is kept in a buffer until a newline is printed, and line 12 prints it.</p>' },
    { do: 'over', line: 8, output: '   1   2   3   4', text: '<p>The first row appears, each number 4 characters wide. The debugger is back at the outer loop on line 8, which will run <code>row++</code> and its test.</p>' },
    { do: 'over', times: 2, line: 10, check: 'row == 2 && col == 1', text: '<p><code>row</code> is 2, and the inner loop <b>started again</b> from <code>col = 1</code>.</p>' },
    { do: { to: 12 }, line: 12, check: 'row == 2 && col == 5', text: '<p>The second row is complete; <code>col</code> has run from 1 to 5 once more.</p>' },
    { do: 'over', output: '   2   4   6   8', text: '<p>The second row is printed: each value is 2 times <code>col</code>.</p>' },
    { do: 'continue', state: 'exited', output: '   3   6   9  12', text: '<div class="note">The inner loop runs completely, from its start to its end, once for every round of the outer loop. The inner counter is reset each time because the inner <code>for</code> runs its <code>col = 1</code> part again.</div><div class="try">Try it: change the 3 on line 8 to 9 and the 4 on line 9 to 9 for a full table.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'off-by-one', unit: 'Decisions and loops', title: 'An off-by-one loop',
  blurb: 'Using <= instead of < walks one element past the end of an array, and See catches it.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: fill an array of 5 squares */
#include <stdio.h>

int main(void)
{
    int sq[5];
    int i;

    for (i = 0; i <= 5; i++) {    /* bug: should be i < 5 */
        sq[i] = i * i;
    }
    printf("last square: %d\\n", sq[4]);
    return 0;
}
`,
  },
  intro: '<p>An array of 5 elements has indexes 0, 1, 2, 3 and 4. There is no <code>sq[5]</code>.</p><p>A loop written with <code>&lt;=</code> where it needed <code>&lt;</code> runs one round too many: an <b>off-by-one</b> error. C itself does not check array indexes, but See does.</p>',
  steps: [
    { do: 'start', show: 'memory', expand: ['sq'], line: 9, text: '<p><code>sq</code> has 5 elements, 20 bytes, all red. Look at the loop test on line 9 before stepping.</p>' },
    { do: 'over', times: 2, line: 9, check: 'i == 0 && sq[0] == 0', text: '<p>Round 0 stored 0 in <code>sq[0]</code>.</p>' },
    { do: { to: 10 }, line: 10, check: 'i == 1', watch: ['i', 'i <= 5'], text: '<p>Round 1 is about to run. The Watch panel shows <code>i</code> and the loop\'s test.</p>' },
    { do: 'over', times: 6, line: 10, check: 'i == 4 && sq[3] == 9', text: '<p>Rounds 1 to 3 filled <code>sq[1]</code>, <code>sq[2]</code> and <code>sq[3]</code>. Now <code>i</code> is 4, the last valid index.</p>' },
    { do: 'over', times: 2, line: 10, check: 'i == 5 && sq[4] == 16', text: '<p><code>sq[4]</code> is 16 and the array is full. But <code>i</code> is now 5, and the test <code>i &lt;= 5</code> is still 1 (true). The loop is about to store into <code>sq[5]</code>, the 4 bytes just past the end of the array.</p>' },
    { do: 'over', state: 'faulted', line: 10, text: '<p>See stopped the program on line 10 with a memory error: <i>write just past the end of \'sq\' (an array of 5 ints, so the last element is sq[4])</i>. On a real machine nothing would stop it; the 4 bytes after the array belong to something else (perhaps <code>i</code>, or the frame\'s saved data), and the program might change them silently and fail much later.</p><div class="note">An array of N elements has indexes 0 to N-1. Loop with <code>for (i = 0; i &lt; N; i++)</code>: start at 0, and use <code>&lt;</code> with the size.</div><div class="try">Try it: change <code>&lt;=</code> to <code>&lt;</code> on line 9 and debug again.</div>' },
  ],
});
