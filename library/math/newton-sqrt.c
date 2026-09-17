/*
 * title: Square roots by Newton's method
 * level: 2
 * about: Finds square roots by repeatedly averaging a guess with n divided by the guess, printing each better guess.
 */
#include <stdio.h>
#include <math.h>

/* If g is too big, n / g is too small, and the other way round. Their
   average is a better guess than either. Newton's method says this
   roughly doubles the number of correct digits on every step. */
double newton_sqrt(double n, int verbose)
{
    double g = n > 1.0 ? n : 1.0;   /* any positive start works */
    double next;
    int step = 0;

    if (n == 0.0)
        return 0.0;
    for (;;) {
        next = (g + n / g) / 2.0;
        step++;
        if (verbose)
            printf("  step %d: %.15f\n", step, next);
        /* Stop when the guess no longer moves. Asking for exact
           equality with a double is risky, so we stop when the change
           is tiny compared with the size of the answer. */
        if (fabs(next - g) <= 1e-15 * next)
            break;
        g = next;
    }
    return next;
}

/* The same trick works on whole numbers with integer division, and it
   gives floor(sqrt(n)) with no floating point at all. */
long isqrt(long n)
{
    long x, y;

    if (n < 2)
        return n;
    /* Start above the root. n / 2 + 1 is, and unlike (n + 1) / 2 it
       cannot overflow when n is the largest long. */
    x = n / 2 + 1;
    y = (x + n / x) / 2;
    while (y < x) {
        x = y;
        y = (x + n / x) / 2;
    }
    return x;
}

int main(void)
{
    double tests[4];
    int i;

    tests[0] = 2.0;
    tests[1] = 10.0;
    tests[2] = 0.25;
    tests[3] = 1e6;

    printf("square root of 2, watching the digits settle:\n");
    newton_sqrt(2.0, 1);

    for (i = 0; i < 4; i++)
        printf("sqrt(%g): newton %.12f, library %.12f\n",
               tests[i], newton_sqrt(tests[i], 0), sqrt(tests[i]));

    printf("integer square roots: isqrt(99) = %ld, isqrt(100) = %ld, "
           "isqrt(2147483647) = %ld\n", isqrt(99), isqrt(100), isqrt(2147483647L));
    return 0;
}
