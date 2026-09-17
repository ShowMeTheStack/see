/*
 * title: Continued fractions and 355/113
 * level: 3
 * about: Expands numbers into continued fractions, builds the convergents, and shows why 22/7 and 355/113 are such good approximations to pi.
 */
#include <stdio.h>
#include <math.h>

#define TERMS 8

/* A continued fraction writes x as a0 + 1/(a1 + 1/(a2 + ...)). Take the
   whole part, flip the fractional part over, and repeat. Large terms
   mean the fraction before them was already very close. */
int expand(double x, long a[], int max)
{
    int n = 0;
    double whole;

    while (n < max) {
        whole = floor(x);
        a[n++] = (long)whole;
        x -= whole;
        if (x < 1e-9)            /* (nearly) exact: stop */
            break;
        x = 1.0 / x;
    }
    return n;
}

/* The convergents h/k come from a simple recurrence:
   h(n) = a(n) h(n-1) + h(n-2), and the same for k. Each one is the best
   possible fraction for the size of its denominator. */
void convergents(const char *name, double x)
{
    long a[TERMS];
    long h1 = 1, h2 = 0, k1 = 0, k2 = 1, h, k;
    int n, i;

    n = expand(x, a, TERMS);
    printf("%s = %.12f = [%ld;", name, x, a[0]);
    for (i = 1; i < n; i++)
        printf("%s%ld", i == 1 ? " " : ", ", a[i]);
    printf("]\n");

    for (i = 0; i < n; i++) {
        h = a[i] * h1 + h2;
        k = a[i] * k1 + k2;
        printf("   %8ld / %-8ld = %.12f  error %.1e\n",
               h, k, (double)h / k, fabs((double)h / k - x));
        h2 = h1;
        h1 = h;
        k2 = k1;
        k1 = k;
    }
}

int main(void)
{
    /* The 292 in pi's expansion is huge, so the convergent just before
       it, 355/113, is accurate to 7 digits with only 3-digit numbers.
       Zu Chongzhi found it in the fifth century. */
    convergents("pi", 4.0 * atan(1.0));

    /* The golden ratio is [1; 1, 1, 1, ...], all ones, the slowest
       possible convergence. Its convergents are ratios of Fibonacci
       numbers. */
    convergents("phi", (1.0 + sqrt(5.0)) / 2.0);

    convergents("sqrt 2", sqrt(2.0));

    /* A fraction has a finite expansion: 415/93 = [4; 2, 6, 7]. */
    convergents("415/93", 415.0 / 93.0);
    return 0;
}
