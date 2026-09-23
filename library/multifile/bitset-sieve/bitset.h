/* bitset.h - a set of small non-negative ints, one bit per number. */
#ifndef BITSET_H
#define BITSET_H

typedef struct bitset Bitset;   /* opaque: see bitset.c */

Bitset *bitset_new(unsigned long n);       /* holds 0 .. n-1, all clear */
void bitset_free(Bitset *b);
void bitset_set(Bitset *b, unsigned long i);
void bitset_clear(Bitset *b, unsigned long i);
int bitset_test(const Bitset *b, unsigned long i);
unsigned long bitset_count(const Bitset *b);
unsigned long bitset_bytes(const Bitset *b);

#endif
