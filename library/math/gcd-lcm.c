/*
 * title: Euclid's gcd and the lcm
 * level: 1
 * about: Reads pairs of numbers and shows every step of Euclid's algorithm, then the least common multiple.
 * input: 1071 462\n48 180\n17 5\n0 0
 */
#include <stdio.h>

/* Euclid's idea: any number dividing both a and b also divides a % b.
   So gcd(a, b) = gcd(b, a % b), and the numbers shrink quickly until
   the remainder is 0. Each line printed is one turn of the loop. */
long gcd(long a, long b)
{
    long r;

    while (b != 0) {
        r = a % b;
        printf("    %ld = %ld * %ld + %ld\n", a, a / b, b, r);
        a = b;
        b = r;
    }
    return a;
}

/* The recursive form is the same idea, one stack frame per step. Step
   into it (F11) to watch the frames pile up on the stack panel. */
long gcd_recursive(long a, long b)
{
    if (b == 0)
        return a;
    return gcd_recursive(b, a % b);
}

int main(void)
{
    long a, b, g;

    while (scanf("%ld %ld", &a, &b) == 2 && (a != 0 || b != 0)) {
        printf("gcd(%ld, %ld):\n", a, b);
        g = gcd(a, b);
        /* lcm * gcd = a * b. Divide first: a / g * b keeps the
           intermediate value small, where a * b / g might overflow. */
        printf("  gcd = %ld (recursive version agrees: %ld)\n",
               g, gcd_recursive(a, b));
        printf("  lcm = %ld\n", a / g * b);
    }
    return 0;
}
