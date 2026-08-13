/*
 * title: A function that sets itself up on its first call
 * level: 3
 * about: Answers "is n prime?" from a sieve table that the function builds the first time it is called and reuses on every later call.
 */
#include <stdio.h>

#define LIMIT 10000

/* The table and the "ready" flag are static locals: nobody else can
   touch them, yet they survive between calls. The first call pays for
   building the sieve; every later call is a single array lookup.
   In See they sit with the globals; watch ready flip from 0 to 1. */
int is_prime(int n)
{
    static char composite[LIMIT + 1];   /* statics start as all zeros */
    static int ready = 0;
    static int builds = 0;
    int i, j;

    if (!ready) {
        builds++;
        printf("(building the sieve, build number %d)\n", builds);
        composite[0] = composite[1] = 1;
        for (i = 2; i * i <= LIMIT; i++)
            if (!composite[i])
                for (j = i * i; j <= LIMIT; j += i)
                    composite[j] = 1;
        ready = 1;
    }
    if (n < 0 || n > LIMIT)
        return -1;                      /* outside the table: unknown */
    return !composite[n];
}

/* Counting calls with a static as well, to show how many lookups the
   one-off setup is shared between. */
int lookups(void)
{
    static int calls = 0;

    return ++calls;
}

int main(void)
{
    int n, count = 0, last = 0;

    printf("97 prime? %d\n", is_prime(97));      /* the first call builds */
    printf("91 prime? %d\n", is_prime(91));      /* later ones just look */

    for (n = 2; n <= LIMIT; n++) {
        lookups();
        if (is_prime(n)) {
            count++;
            last = n;
        }
    }
    printf("%d primes up to %d, the largest is %d\n", count, LIMIT, last);
    printf("%d lookups shared one sieve\n", lookups() - 1);
    printf("20000 prime? %d (beyond the table)\n", is_prime(20000));
    return 0;
}
