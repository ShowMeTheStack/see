/* frac.c - Fracs are small (8 bytes), so they are passed and returned by
 * value, like ints. No pointers, no heap, nothing to free. */
#include <stdio.h>
#include "frac.h"

/* Euclid's algorithm, the oldest algorithm still in daily use. */
static long gcd(long a, long b)
{
    long t;

    if (a < 0) a = -a;
    if (b < 0) b = -b;
    while (b != 0) {
        t = a % b;
        a = b;
        b = t;
    }
    return a;
}

Frac frac_make(long num, long den)
{
    Frac f;
    long g;

    if (den < 0) {
        num = -num;
        den = -den;
    }
    g = gcd(num, den);
    if (g == 0) {
        g = 1;
    }
    f.num = num / g;
    f.den = den / g;
    return f;
}

/* Dividing by the gcd of the denominators first keeps the numbers small,
 * which matters when a long has only 32 bits. */
Frac frac_add(Frac a, Frac b)
{
    long g = gcd(a.den, b.den);
    return frac_make(a.num * (b.den / g) + b.num * (a.den / g), a.den / g * b.den);
}

Frac frac_sub(Frac a, Frac b)
{
    b.num = -b.num;     /* b is our own copy; the caller's is untouched */
    return frac_add(a, b);
}

Frac frac_mul(Frac a, Frac b)
{
    long g1 = gcd(a.num, b.den);
    long g2 = gcd(b.num, a.den);

    if (g1 == 0) g1 = 1;
    if (g2 == 0) g2 = 1;
    return frac_make((a.num / g1) * (b.num / g2), (a.den / g2) * (b.den / g1));
}

Frac frac_div(Frac a, Frac b)
{
    return frac_mul(a, frac_make(b.den, b.num));
}

int frac_cmp(Frac a, Frac b)
{
    Frac d = frac_sub(a, b);
    return (d.num > 0) - (d.num < 0);
}

void frac_print(Frac f)
{
    if (f.den == 1) {
        printf("%ld", f.num);
    } else {
        printf("%ld/%ld", f.num, f.den);
    }
}
