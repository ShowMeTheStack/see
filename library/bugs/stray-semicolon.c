/*
 * title: A loop with an empty body
 * level: 1
 * about: Sums an array with a for loop that has a stray semicolon after its closing parenthesis.
 * expect: fault
 */

/*
 * THE PUZZLE
 * The indentation says that sum += a[i] is inside the loop. The
 * compiler does not read indentation. Look at the very end of the for
 * line.
 *
 * HOW TO HUNT IT WITH SEE
 * Debug with F5 and press F10 on the for line. The highlight stays on
 * the for line while i climbs from 0 to 5: the loop body is the empty
 * statement ";" and nothing else. Only then does the next line run,
 * once, with i equal to 5. a has five elements, a[0] to a[4], so a[5]
 * is one past the end and See stops the read.
 */
#include <stdio.h>

int main(void)
{
    int a[5];
    int i, sum = 0;

    a[0] = 4;
    a[1] = 8;
    a[2] = 15;
    a[3] = 16;
    a[4] = 23;

    for (i = 0; i < 5; i++);
        sum += a[i];

    printf("sum = %d\n", sum);
    return 0;
}

/*
 * THE FIX
 * Delete the semicolon after the closing parenthesis. The expected sum
 * is 66. Always using braces, even for one-line bodies, makes this
 * slip easier to see:  for (i = 0; i < 5; i++) { sum += a[i]; }
 * The same trap waits after if (...) and while (...).
 */
