/*
 * title: Primes with break
 * level: 2
 * about: Finds the primes below 60 by trial division, using break to stop testing a number as soon as a divisor turns up.
 */
#include <stdio.h>

int main(void)
{
    int n, d;
    int is_prime;
    int tests = 0;   /* how many divisions were actually done */
    int count = 0;

    for (n = 2; n < 60; n++) {
        is_prime = 1;

        /* Only divisors up to the square root matter: if n = a * b, one of
           a and b is at most sqrt(n). Writing d * d <= n avoids floating
           point altogether. */
        for (d = 2; d * d <= n; d++) {
            tests++;
            if (n % d == 0) {
                is_prime = 0;
                /* One divisor is enough to know n is not prime. break
                   leaves the inner loop only; the outer loop carries on
                   with the next n. */
                break;
            }
        }
        if (is_prime) {
            printf("%3d", n);
            count++;
            if (count % 10 == 0)
                printf("\n");
        }
    }
    printf("\n%d primes, %d trial divisions\n", count, tests);
    return 0;
}
