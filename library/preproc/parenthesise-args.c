/*
 * title: Why macro arguments need parentheses
 * level: 2
 * about: Compares careless and careful versions of the same macros and prints the wrong answers the careless ones give.
 */
#include <stdio.h>

/*
 * Each pair below means the same thing to a human. The BAD versions
 * forget that the preprocessor substitutes text, not values.
 */
#define BAD_SQUARE(x)    x * x
#define GOOD_SQUARE(x)   ((x) * (x))

#define BAD_DOUBLE(x)    (x) + (x)
#define GOOD_DOUBLE(x)   ((x) + (x))

#define BAD_HALF(x)      (x / 2)
#define GOOD_HALF(x)     ((x) / 2)

#define BAD_NEG(x)       -x
#define GOOD_NEG(x)      (-(x))

static void row(const char *what, int bad, int good)
{
    printf("%-22s bad %4d   good %4d  %s\n", what, bad, good,
           bad == good ? "" : "<- different");
}

int main(void)
{
    int a = 3, b = 4;

    /*
     * BAD_SQUARE(a + 1) becomes  a + 1 * a + 1  which is 3 + 3 + 1 = 7.
     * Multiplication binds tighter than addition, so the "square"
     * never happens to the whole argument.
     */
    row("SQUARE(a + 1)", BAD_SQUARE(a + 1), GOOD_SQUARE(a + 1));

    /*
     * Here the arguments are fine but the body is not wrapped:
     * 10 * BAD_DOUBLE(a) becomes 10 * (a) + (a) = 33, not 60.
     */
    row("10 * DOUBLE(a)", 10 * BAD_DOUBLE(a), 10 * GOOD_DOUBLE(a));

    /* BAD_HALF(a + b) is (a + b / 2) = 3 + 2 = 5, not 7 / 2 = 3. */
    row("HALF(a + b)", BAD_HALF(a + b), GOOD_HALF(a + b));

    /* BAD_NEG(a - b) is -a - b = -7, but -(a - b) is 1. */
    row("NEG(a - b)", BAD_NEG(a - b), GOOD_NEG(a - b));

    /* With a plain variable both versions agree, which is exactly why
       the bug hides so well in testing. */
    row("SQUARE(b)", BAD_SQUARE(b), GOOD_SQUARE(b));

    /*
     * The rule: put brackets round every use of a parameter, and round
     * the whole body. It costs nothing, since the compiler throws the
     * extra brackets away.
     */
    return 0;
}
