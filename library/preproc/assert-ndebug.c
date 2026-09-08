/*
 * title: assert and the NDEBUG switch
 * level: 2
 * about: Guards an integer square root with assert, then shows how defining NDEBUG and re-including assert.h turns the checks off.
 */
#include <stdio.h>

/*
 * assert(cond) checks a condition you believe is always true. If it
 * is ever false, the program prints the condition, the file and the
 * line, and stops at once with abort(). It is for catching mistakes
 * in the program, not for handling bad input from users.
 *
 * If NDEBUG is defined when <assert.h> is included, assert(cond)
 * expands to nothing, so the checks cost nothing in a finished
 * program. assert.h is the one standard header designed to be
 * included again with a different NDEBUG setting, so this file can
 * show both behaviours.
 */
#include <assert.h>

/* Integer square root by binary search: the largest r with r*r <= n. */
static int isqrt(int n)
{
    int lo = 0, hi = 46341, mid;   /* 46341 squared is just past INT_MAX */

    assert(n >= 0);                /* a negative n is a caller's bug */

    while (hi - lo > 1) {
        mid = lo + (hi - lo) / 2;
        if (mid * mid <= n)
            lo = mid;
        else
            hi = mid;
    }

    /* The answer must satisfy its own definition. These two asserts
       document what isqrt promises, and test it on every call. */
    assert(lo * lo <= n);
    assert((lo + 1) * (lo + 1) > n);
    return lo;
}

/*
 * Now switch the checks off for the rest of the file. Real programs
 * set NDEBUG once, from the build settings, rather than half way down.
 */
#define NDEBUG
#include <assert.h>

static int counted = 0;

/* Not static: once the assert below vanishes nothing calls this, and
   the compiler would warn about an unused static function. */
int count_call(void)
{
    counted++;
    return 1;
}

int main(void)
{
    int tests[6];
    int i;

    tests[0] = 0; tests[1] = 1; tests[2] = 15;
    tests[3] = 16; tests[4] = 99999; tests[5] = 2000000000;

    for (i = 0; i < 6; i++)
        printf("isqrt(%d) = %d\n", tests[i], isqrt(tests[i]));

    /*
     * With NDEBUG defined, this assert is gone completely, including
     * the call inside it. That is why an assert must never contain
     * work the program needs: in a release build it is not done.
     */
    assert(count_call());
    printf("count_call ran %d times under NDEBUG\n", counted);

    /*
     * Try it: change tests[2] to -15 and run. The first assert in isqrt
     * fires, because that one was compiled before NDEBUG was defined.
     */
    return 0;
}
