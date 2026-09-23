/* bitset.c - number i lives in byte i / 8, at bit i % 8 of that byte.
 * Shifts and masks do the rest:
 *     set:    byte |=  (1 << bit)
 *     clear:  byte &= ~(1 << bit)
 *     test:   byte &   (1 << bit)
 * Unsigned char, so shifting into the top bit is well defined. */
#include <stdlib.h>
#include "bitset.h"

struct bitset {
    unsigned long n;
    unsigned char *bits;
};

Bitset *bitset_new(unsigned long n)
{
    Bitset *b = malloc(sizeof *b);

    if (b == NULL) {
        return NULL;
    }
    b->n = n;
    /* calloc gives zeroed memory: every bit starts clear. */
    b->bits = calloc((n + 7) / 8, 1);
    if (b->bits == NULL) {
        free(b);
        return NULL;
    }
    return b;
}

void bitset_free(Bitset *b)
{
    if (b != NULL) {
        free(b->bits);
        free(b);
    }
}

void bitset_set(Bitset *b, unsigned long i)
{
    b->bits[i / 8] |= (unsigned char)(1u << (i % 8));
}

void bitset_clear(Bitset *b, unsigned long i)
{
    b->bits[i / 8] &= (unsigned char)~(1u << (i % 8));
}

int bitset_test(const Bitset *b, unsigned long i)
{
    return (b->bits[i / 8] >> (i % 8)) & 1;
}

/* Kernighan's trick: v & (v - 1) clears the lowest set bit, so the loop
 * runs once per set bit rather than once per bit. */
unsigned long bitset_count(const Bitset *b)
{
    unsigned long total = 0;
    unsigned long k;
    unsigned v;

    for (k = 0; k < (b->n + 7) / 8; k++) {
        v = b->bits[k];
        while (v != 0) {
            v &= v - 1;
            total++;
        }
    }
    return total;
}

unsigned long bitset_bytes(const Bitset *b)
{
    return (b->n + 7) / 8;
}
