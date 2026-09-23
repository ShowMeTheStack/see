/*
 * title: Prime sieve on a bitset module
 * level: 3
 * about: Finds the primes below 2000 with a sieve that stores one bit per number in an opaque bitset.
 */

/* Three .c files: bitset.c, sieve.c and main.c. See compiles each one and
 * links them together. Open the heap panel after the sieve: 2001 numbers
 * fit in 251 bytes. Watch the bytes for 0..7 first: 0 and 1 are composite
 * and 4 and 6 get crossed out, so byte 0 becomes binary 01010011 = 0x53. */
#include <stdio.h>
#include "bitset.h"
#include "sieve.h"

#define LIMIT 2000UL

int main(void)
{
    Bitset *comp = sieve_primes(LIMIT);
    unsigned long i, primes, twins = 0;
    int shown = 0;

    if (comp == NULL) {
        return 1;
    }
    primes = (LIMIT + 1) - bitset_count(comp);
    printf("%lu primes up to %lu, stored in %lu bytes\n", primes, LIMIT, bitset_bytes(comp));

    printf("the first 20:");
    for (i = 0; i <= LIMIT && shown < 20; i++) {
        if (!bitset_test(comp, i)) {
            printf(" %lu", i);
            shown++;
        }
    }
    printf("\n");

    /* Twin primes: p and p + 2 both prime. */
    for (i = 3; i + 2 <= LIMIT; i += 2) {
        if (!bitset_test(comp, i) && !bitset_test(comp, i + 2)) {
            twins++;
        }
    }
    printf("twin prime pairs: %lu\n", twins);

    printf("the last few:");
    for (i = LIMIT; i > LIMIT - 60; i--) {
        if (!bitset_test(comp, i)) {
            printf(" %lu", i);
        }
    }
    printf("\n");

    bitset_free(comp);
    return 0;
}
