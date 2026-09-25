/*
 * title: A function that forgets to return
 * level: 2
 * about: Picks the larger of two scores with a function that has no return on one of its paths.
 * expect: runtime warning
 */

/*
 * THE PUZZLE
 * larger() returns a when a is bigger and b when b is bigger. What
 * does it return when the two are equal? Follow the code: neither if
 * is true, and control falls off the closing brace.
 *
 * HOW TO HUNT IT WITH SEE
 * Build it (Ctrl+B) first: the compiler already warns "control reaches
 * end of non-void function 'larger'". Then run it and read the run-time
 * warning: See reports that larger ended without a
 * return statement and its caller got a meaningless value. Debug with
 * F5, step into the third call (F11), and watch the highlight skip
 * both returns and land on the closing brace. Back in main, best holds
 * whatever happened to be in the register that carries return values.
 */
#include <stdio.h>

static int larger(int a, int b)
{
    if (a > b)
        return a;
    if (b > a)
        return b;
}

int main(void)
{
    int round1[3], round2[3];
    int i, best;

    round1[0] = 14; round2[0] = 9;
    round1[1] = 7;  round2[1] = 12;
    round1[2] = 10; round2[2] = 10;

    for (i = 0; i < 3; i++) {
        best = larger(round1[i], round2[i]);
        printf("round %d: best score %d\n", i + 1, best);
    }
    return 0;
}

/*
 * THE FIX
 * Make sure every path ends in a return; often the simplest way is to
 * let the last case be the fall-back:
 *
 *     if (a > b)
 *         return a;
 *     return b;
 *
 * gcc -Wall warns "control reaches end of non-void function" for this.
 */
