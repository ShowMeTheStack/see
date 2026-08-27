/*
 * title: Sieve of Eratosthenes sized at run time
 * level: 2
 * about: Reads a limit, gets a zeroed table of that size from calloc, crosses out the multiples of each prime and prints the primes found.
 * input: 120
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    char *composite;
    long limit, i, j;
    int count = 0;

    if (scanf("%ld", &limit) != 1 || limit < 2 || limit > 200000L)
        return 0;

    /*
     * One flag per number, 0 meaning "still possibly prime". calloc's zeros
     * are exactly the starting state the sieve needs. A local array could
     * not be sized by a number read at run time in C89; the heap can.
     */
    composite = calloc(limit + 1, 1);
    if (composite == NULL)
        return 0;

    for (i = 2; i * i <= limit; i++)
        if (!composite[i])
            /* Start at i * i: smaller multiples were crossed out by smaller primes. */
            for (j = i * i; j <= limit; j += i)
                composite[j] = 1;

    for (i = 2; i <= limit; i++)
        if (!composite[i]) {
            printf("%4ld", i);
            if (++count % 10 == 0)
                printf("\n");
        }
    if (count % 10 != 0)
        printf("\n");
    printf("%d primes up to %ld\n", count, limit);

    free(composite);
    return 0;
}
