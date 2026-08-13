/*
 * title: Testing your functions with a check helper
 * level: 2
 * about: Writes a few small functions and a check function that compares each result with the expected one, counting passes and reporting the line of every failure.
 */
#include <stdio.h>

/* ---- the functions under test ---- */

int reverse_digits(int n)
{
    int r = 0;

    while (n > 0) {
        r = r * 10 + n % 10;
        n /= 10;
    }
    return r;
}

int is_leap(int y)
{
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}

/* Number of 1s in the binary form of n. */
int ones(unsigned int n)
{
    int c = 0;

    for (; n != 0; n >>= 1)
        c += (int)(n & 1u);
    return c;
}

/* A deliberately naive rounding function, to give the tests
   something to catch: it gets negative halves wrong. */
int round_half_up(double x)
{
    return (int)(x + 0.5);
}

/* ---- the tiny test framework ---- */

static int passed = 0, failed = 0;

/* One function does the comparing and reporting, so each test is one
   short line. The macro CHECK fills in the expression's text and line
   number, which a function cannot find out for itself. */
void check(int got, int want, const char *what, int line)
{
    if (got == want) {
        passed++;
        return;
    }
    failed++;
    printf("line %d: %s gave %d, expected %d\n", line, what, got, want);
}

#define CHECK(expr, want) check((expr), (want), #expr, __LINE__)

int main(void)
{
    CHECK(reverse_digits(1234), 4321);
    CHECK(reverse_digits(7), 7);
    CHECK(reverse_digits(1200), 21);      /* trailing zeros vanish */

    CHECK(is_leap(2024), 1);
    CHECK(is_leap(1900), 0);
    CHECK(is_leap(2000), 1);

    CHECK(ones(0u), 0);
    CHECK(ones(255u), 8);
    CHECK(ones(1024u), 1);

    CHECK(round_half_up(2.5), 3);
    CHECK(round_half_up(2.4), 2);
    CHECK(round_half_up(-2.5), -3);       /* this one will fail ... */
    CHECK(round_half_up(-2.4), -2);       /* ... and so will this */

    printf("%d passed, %d failed\n", passed, failed);
    return 0;
}
