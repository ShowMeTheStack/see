/*
 * title: Where floating point goes wrong
 * level: 3
 * about: Shows lost additions, non-associative sums, catastrophic cancellation and Kahan summation, and compares doubles with a relative epsilon.
 */
#include <stdio.h>
#include <float.h>
#include <math.h>

/* Equal "enough": the gap is tiny compared with the numbers themselves.
   A fixed tolerance like 1e-9 is wrong for very big or very small
   values, so scale it by the larger magnitude. */
int nearly_equal(double a, double b, double ulps)
{
    double scale = fabs(a) > fabs(b) ? fabs(a) : fabs(b);
    return fabs(a - b) <= ulps * DBL_EPSILON * scale;
}

int main(void)
{
    double naive = 0.0, kahan = 0.0, comp = 0.0, y, t, x;
    float f = 16777216.0f;     /* 2^24 */
    int i;

    /* 1. A double has 53 bits of mantissa, about 16 decimal digits.
       DBL_EPSILON is the gap between 1.0 and the next double, so adding
       a quarter of it to 1.0 changes nothing at all. */
    printf("1 + eps/4 == 1 ? %s\n", 1.0 + DBL_EPSILON / 4 == 1.0 ? "yes" : "no");

    /* A float has 24 bits, so above 2^24 it cannot even count in ones. */
    printf("float: 16777216 + 1 = %.1f\n", (double)(f + 1.0f));

    /* 2. Order matters: floating point addition is not associative. */
    printf("(1e16 + 1) - 1e16 = %g, but (1e16 - 1e16) + 1 = %g\n",
           (1e16 + 1.0) - 1e16, (1e16 - 1e16) + 1.0);

    /* 3. Adding many small numbers to a big total loses their low
       digits each time. Kahan's compensated sum keeps the lost part in
       comp and feeds it back in on the next step. Watch comp in the
       locals panel: it holds the crumbs the plain sum dropped. */
    for (i = 0; i < 100000; i++) {
        naive += 0.1;
        y = 0.1 - comp;
        t = kahan + y;
        comp = (t - kahan) - y;   /* algebraically 0, really the error */
        kahan = t;
    }
    printf("100000 x 0.1: plain sum %.10f, Kahan sum %.10f\n", naive, kahan);

    /* 4. Catastrophic cancellation. (1 - cos x) / x^2 tends to 0.5 as x
       gets small, but 1 - cos x subtracts two nearly equal numbers and
       the correct digits cancel away. The identity
       1 - cos x = 2 sin^2(x/2) avoids the subtraction. */
    printf("%8s %22s %22s\n", "x", "(1 - cos x) / x^2", "2 sin^2(x/2) / x^2");
    for (x = 1e-3; x > 1e-9; x /= 100.0)
        printf("%8.0e %22.15f %22.15f\n", x,
               (1.0 - cos(x)) / (x * x),
               2.0 * sin(x / 2) * sin(x / 2) / (x * x));

    /* 5. So never test doubles with ==; ask whether they are close
       relative to their size. */
    printf("0.1 + 0.2 == 0.3 ? %s; nearly_equal ? %s\n",
           0.1 + 0.2 == 0.3 ? "yes" : "no",
           nearly_equal(0.1 + 0.2, 0.3, 4.0) ? "yes" : "no");
    printf("1e300 * 10 / 10 nearly 1e300 ? %s\n",
           nearly_equal(1e300 * 10.0 / 10.0, 1e300, 4.0) ? "yes" : "no");
    return 0;
}
