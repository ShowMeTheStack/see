/*
 * title: Exact fractions in lowest terms
 * level: 2
 * about: A small fraction type that adds and multiplies exactly, used to build the harmonic sums 1 + 1/2 + ... + 1/n.
 */
#include <stdio.h>

/* A fraction is just two longs. Passing it by value copies both fields,
   so in the stack panel each call gets its own little pair. */
typedef struct {
    long num;
    long den;
} Fraction;

long gcd(long a, long b)
{
    long r;

    if (a < 0)
        a = -a;
    while (b != 0) {
        r = a % b;
        a = b;
        b = r;
    }
    return a;
}

/* Every fraction we hand back is reduced, and the sign lives in num. */
Fraction make(long num, long den)
{
    Fraction f;
    long g;

    if (den < 0) {
        num = -num;
        den = -den;
    }
    g = gcd(num, den);
    f.num = num / g;
    f.den = den / g;
    return f;
}

/* a/b + c/d. Using the lcm of b and d as the common denominator, and
   dividing before multiplying, keeps the numbers as small as possible,
   which matters because a long here holds only about 2.1 billion. */
Fraction add(Fraction x, Fraction y)
{
    long g = gcd(x.den, y.den);
    long l = x.den / g * y.den;
    return make(x.num * (l / x.den) + y.num * (l / y.den), l);
}

Fraction mul(Fraction x, Fraction y)
{
    /* Cross-cancel first: (a/b)(c/d) with a and d sharing a factor. */
    long g1 = gcd(x.num, y.den);
    long g2 = gcd(y.num, x.den);
    return make((x.num / g1) * (y.num / g2), (x.den / g2) * (y.den / g1));
}

void show(const char *label, Fraction f)
{
    printf("%s%ld/%ld  (about %.6f)\n", label, f.num, f.den,
           (double)f.num / f.den);
}

int main(void)
{
    Fraction h = make(0, 1);
    Fraction p;
    long n;

    for (n = 1; n <= 16; n++) {
        h = add(h, make(1, n));
        printf("H(%2ld) = ", n);
        show("", h);
    }

    /* A product that telescopes: (1 - 1/4)(1 - 1/9)(1 - 1/16)... equals
       (n+1) / 2n, and the fractions stay tiny thanks to cancelling. */
    p = make(1, 1);
    for (n = 2; n <= 12; n++)
        p = mul(p, make(n * n - 1, n * n));
    show("product of (1 - 1/n^2) for n = 2..12 = ", p);
    show("formula (n + 1) / 2n with n = 12      = ", make(13, 24));
    return 0;
}
