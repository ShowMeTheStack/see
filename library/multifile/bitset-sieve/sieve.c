/* sieve.c - the Sieve of Eratosthenes, using the bitset as its table.
 * A bit is set when the number is known to be composite. */
#include <stddef.h>
#include "sieve.h"

Bitset *sieve_primes(unsigned long limit)
{
    Bitset *composite = bitset_new(limit + 1);
    unsigned long p, m;

    if (composite == NULL) {
        return NULL;
    }
    bitset_set(composite, 0);
    bitset_set(composite, 1);
    /* Start crossing out at p*p: smaller multiples were done by smaller primes. */
    for (p = 2; p * p <= limit; p++) {
        if (!bitset_test(composite, p)) {
            for (m = p * p; m <= limit; m += p) {
                bitset_set(composite, m);
            }
        }
    }
    return composite;
}
