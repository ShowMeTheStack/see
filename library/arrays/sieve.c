/*
 * title: Sieve of Eratosthenes
 * level: 2
 * about: Crosses out multiples in an array of flags to list every prime up to 200.
 */
#include <stdio.h>

#define LIMIT 200

int main(void)
{
    /* composite[n] becomes 1 once n is known to have a factor. One char per
       number keeps the table small: 201 bytes on the stack. */
    char composite[LIMIT + 1];
    int n, m, count = 0;

    for (n = 0; n <= LIMIT; n++)
        composite[n] = 0;
    composite[0] = composite[1] = 1;   /* 0 and 1 are not prime */

    /* Only primes up to sqrt(LIMIT) need to cross anything out: a composite
       number below 200 always has a factor no bigger than 14. */
    for (n = 2; n * n <= LIMIT; n++) {
        if (composite[n])
            continue;
        /* Start at n*n: smaller multiples like 2n, 3n were already crossed
           out by the smaller primes 2, 3, ... */
        for (m = n * n; m <= LIMIT; m += n)
            composite[m] = 1;
    }

    for (n = 2; n <= LIMIT; n++) {
        if (!composite[n]) {
            printf("%4d", n);
            if (++count % 10 == 0)
                printf("\n");
        }
    }
    printf("\n%d primes below %d\n", count, LIMIT + 1);
    return 0;
}
