/*
 * title: Greatest common divisor and fractions
 * level: 1
 * about: Uses Euclid's gcd and an lcm built on it to reduce fractions and add them.
 */
#include <stdio.h>

/* Euclid's idea: gcd(a, b) = gcd(b, a mod b), and gcd(a, 0) = a.
   The remainders shrink quickly, so the loop is short. */
int gcd(int a, int b)
{
    int r;

    while (b != 0) {
        r = a % b;
        a = b;      /* a and b are this function's own copies, */
        b = r;      /* so changing them cannot disturb the caller */
    }
    return a;
}

/* Dividing before multiplying keeps the numbers small. */
int lcm(int a, int b)
{
    return a / gcd(a, b) * b;
}

/* Prints n/d in lowest terms. */
void print_fraction(int n, int d)
{
    int g = gcd(n, d);

    printf("%d/%d", n / g, d / g);
}

/* a/b + c/d over the least common denominator. */
void add_fractions(int a, int b, int c, int d)
{
    int den = lcm(b, d);
    int num = a * (den / b) + c * (den / d);

    printf("%d/%d + %d/%d = ", a, b, c, d);
    print_fraction(num, den);
    printf("\n");
}

int main(void)
{
    printf("gcd(48, 36) = %d\n", gcd(48, 36));
    printf("gcd(17, 5)  = %d\n", gcd(17, 5));
    printf("lcm(4, 6)   = %d\n", lcm(4, 6));

    printf("18/24 reduces to ");
    print_fraction(18, 24);
    printf("\n");

    /* Step into add_fractions: it calls lcm, which calls gcd, so three
       frames sit above main at the deepest point. */
    add_fractions(1, 6, 1, 4);
    add_fractions(3, 10, 2, 15);
    add_fractions(1, 2, 1, 2);
    return 0;
}
