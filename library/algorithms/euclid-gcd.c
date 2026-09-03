/*
 * title: Euclid's algorithm, step by step
 * level: 1
 * about: Computes the greatest common divisor of pairs of numbers, showing each division, and uses it for the lowest common multiple and to simplify fractions.
 * input: 1071 462\n48 18\n17 5\n270 192
 */
#include <stdio.h>

/*
 * The idea, about 2300 years old: any number that divides both a and b
 * also divides a % b. So gcd(a, b) = gcd(b, a % b), and the numbers
 * shrink quickly until the remainder is 0.
 */
long gcd(long a, long b)
{
    long r;
    while (b != 0) {
        r = a % b;
        printf("  %ld = %ld * %ld + %ld\n", a, a / b, b, r);
        a = b;
        b = r;
    }
    return a;
}

/* The same rule written recursively; See shows one frame per step. */
long gcd_rec(long a, long b)
{
    return b == 0 ? a : gcd_rec(b, a % b);
}

int main(void)
{
    long a, b, g;

    while (scanf("%ld %ld", &a, &b) == 2) {
        printf("gcd(%ld, %ld):\n", a, b);
        g = gcd(a, b);
        printf("  gcd = %ld (recursive version agrees: %ld)\n", g, gcd_rec(a, b));
        /* Divide before multiplying so the product cannot overflow early. */
        printf("  lcm = %ld\n", a / g * b);
        printf("  %ld/%ld simplifies to %ld/%ld\n\n", a, b, a / g, b / g);
    }
    return 0;
}
