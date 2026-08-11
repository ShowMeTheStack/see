/*
 * title: Euclid's greatest common divisor
 * level: 2
 * about: Finds the greatest common divisor of pairs of numbers with Euclid's remainder loop, showing every step.
 * input: 1071 462\n48 18\n17 5\n100 75
 */
#include <stdio.h>

int main(void)
{
    long a, b, r;
    long a0, b0;

    while (scanf("%ld %ld", &a, &b) == 2) {
        a0 = a;
        b0 = b;

        /* Euclid's idea, about 2300 years old: gcd(a, b) = gcd(b, a % b),
           and gcd(a, 0) = a. Each pass replaces the pair by a smaller one,
           so the loop must end. Watch a, b and r shuffle along in the
           locals panel like a conveyor belt. */
        while (b != 0) {
            r = a % b;
            printf("  %ld = %ld * %ld + %ld\n", a, a / b, b, r);
            a = b;
            b = r;
        }
        printf("gcd(%ld, %ld) = %ld, lcm = %ld\n", a0, b0, a, a0 / a * b0);
        /* a0 / a * b0 divides first, so the product never gets bigger
           than it has to. */
    }
    return 0;
}
