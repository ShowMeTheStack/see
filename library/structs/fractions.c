/*
 * title: Exact arithmetic with fractions
 * level: 2
 * about: Adds, subtracts, multiplies and divides fractions kept in lowest terms, then sums 1/1 + 1/2 + ... + 1/10 exactly.
 */
#include <stdio.h>
#include <stdlib.h>

/* A fraction is a numerator over a denominator. The rule this program keeps
   is: the denominator is always positive and the pair has no common factor.
   Every function that builds a fraction goes through reduce() to keep it. */
typedef struct {
    long num;
    long den;
} Fraction;

long gcd(long a, long b)
{
    /* Euclid's algorithm: gcd(a, b) = gcd(b, a mod b). */
    a = labs(a);
    b = labs(b);
    while (b != 0) {
        long t = a % b;
        a = b;
        b = t;
    }
    return a;
}

Fraction reduce(long n, long d)
{
    Fraction f;
    long g;
    if (d < 0) {           /* move the sign up to the numerator */
        n = -n;
        d = -d;
    }
    g = gcd(n, d);
    if (g == 0)
        g = 1;
    f.num = n / g;
    f.den = d / g;
    return f;
}

/* Each operation takes two fractions by value and returns a new one, just like
   ints. The struct is only 8 bytes, so copying is cheap. */
Fraction add(Fraction a, Fraction b) { return reduce(a.num * b.den + b.num * a.den, a.den * b.den); }
Fraction sub(Fraction a, Fraction b) { return reduce(a.num * b.den - b.num * a.den, a.den * b.den); }
Fraction mul(Fraction a, Fraction b) { return reduce(a.num * b.num, a.den * b.den); }
Fraction divide(Fraction a, Fraction b) { return reduce(a.num * b.den, a.den * b.num); }

void print(Fraction f)
{
    if (f.den == 1)
        printf("%ld", f.num);
    else
        printf("%ld/%ld", f.num, f.den);
}

void show(const char *op, Fraction a, Fraction b, Fraction r)
{
    print(a);
    printf(" %s ", op);
    print(b);
    printf(" = ");
    print(r);
    printf("\n");
}

int main(void)
{
    Fraction a = reduce(3, 4);
    Fraction b = reduce(-10, -12);   /* reduce turns this into 5/6 */
    Fraction sum;
    int k;

    show("+", a, b, add(a, b));
    show("-", a, b, sub(a, b));
    show("*", a, b, mul(a, b));
    show("/", a, b, divide(a, b));

    /* The harmonic numbers. A double would give 2.928968..., but the fraction
       is exact. Watch sum's two fields in the locals panel grow on each pass. */
    sum = reduce(0, 1);
    for (k = 1; k <= 10; k++) {
        sum = add(sum, reduce(1, k));
        printf("H(%d) = ", k);
        print(sum);
        printf("  (%.6f)\n", (double)sum.num / sum.den);
    }
    return 0;
}
