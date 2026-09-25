/*
 * title: A square macro without parentheses
 * level: 2
 * about: Computes areas with #define SQUARE(x) x * x and gets wrong answers for expressions.
 */

/*
 * THE PUZZLE
 * SQUARE(5) is 25, correct. SQUARE(n + 1) with n = 4 should also be
 * 25, and 100 / SQUARE(5) should be 4. The program runs cleanly and
 * prints 9 and 100. A macro is not a function: the preprocessor pastes
 * the argument text in place of x, then the compiler applies its usual
 * precedence rules to the result.
 *
 *   expected:  25  25  4
 *   actual:    25   9  100
 *
 * HOW TO HUNT IT WITH SEE
 * Write out the expansions by hand:
 *     SQUARE(n + 1)     becomes   n + 1 * n + 1     = 4 + 4 + 1
 *     100 / SQUARE(5)   becomes   100 / 5 * 5       = (100 / 5) * 5
 * Debug with F5 and add the expression n + 1 * n + 1 to the Watch
 * panel to check the first. The debugger steps over a macro in a
 * single line, because by the time the program runs the macro has
 * vanished; only the pasted text was compiled.
 */
#include <stdio.h>

#define SQUARE(x) x * x

int main(void)
{
    int n = 4;

    printf("%d\n", SQUARE(5));
    printf("%d\n", SQUARE(n + 1));
    printf("%d\n", 100 / SQUARE(5));
    return 0;
}

/*
 * THE FIX
 *     #define SQUARE(x) ((x) * (x))
 * Parentheses around each use of a parameter, and around the whole
 * body. Even then SQUARE(i++) increments i twice, because the argument
 * is pasted twice. That is the deeper reason C programmers prefer real
 * functions unless a macro is truly needed.
 */
