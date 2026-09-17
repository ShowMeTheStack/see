/*
 * title: Bit tricks on unsigned ints
 * level: 3
 * about: Counts set bits, tests for powers of two, isolates the lowest bit, reverses all 32 bits and prints each result in binary.
 */
#include <stdio.h>

/* Show all 32 bits, with a space every 8 so bytes are easy to see. */
void binary(unsigned long x)
{
    int i;

    for (i = 31; i >= 0; i--) {
        putchar((x >> i) & 1UL ? '1' : '0');
        if (i % 8 == 0 && i > 0)
            putchar(' ');
    }
}

/* x & (x - 1) clears the lowest 1 bit: subtracting 1 turns the lowest 1
   into 0 and the zeros below it into 1s, then & wipes them all out. So
   the loop runs once per set bit, not 32 times. (Kernighan's trick.) */
int popcount(unsigned long x)
{
    int n = 0;

    while (x != 0) {
        x &= x - 1;
        n++;
    }
    return n;
}

/* A power of two has exactly one bit set, so clearing the lowest bit
   must leave nothing. Zero is excluded by hand. */
int is_power_of_two(unsigned long x)
{
    return x != 0 && (x & (x - 1)) == 0;
}

/* Reverse 32 bits by swapping halves, then quarters, then bytes, nibbles,
   pairs and single bits: five steps instead of 32. Each mask picks out
   every other block of the current size. */
unsigned long reverse_bits(unsigned long x)
{
    x = ((x >> 1) & 0x55555555UL) | ((x & 0x55555555UL) << 1);
    x = ((x >> 2) & 0x33333333UL) | ((x & 0x33333333UL) << 2);
    x = ((x >> 4) & 0x0F0F0F0FUL) | ((x & 0x0F0F0F0FUL) << 4);
    x = ((x >> 8) & 0x00FF00FFUL) | ((x & 0x00FF00FFUL) << 8);
    x = ((x >> 16) & 0x0000FFFFUL) | ((x & 0x0000FFFFUL) << 16);
    return x & 0xFFFFFFFFUL;
}

/* Smallest power of two that is >= x: smear the top bit downwards so
   every bit below it is 1, then add one. */
unsigned long round_up_pow2(unsigned long x)
{
    x--;
    x |= x >> 1;
    x |= x >> 2;
    x |= x >> 4;
    x |= x >> 8;
    x |= x >> 16;
    return x + 1;
}

int main(void)
{
    unsigned long samples[6];
    unsigned long x;
    int i;

    samples[0] = 1;
    samples[1] = 12;
    samples[2] = 64;
    samples[3] = 1000;
    samples[4] = 0x80000000UL;
    samples[5] = 0xDEADBEEFUL;

    for (i = 0; i < 6; i++) {
        x = samples[i];
        printf("x        = %10lu  ", x);
        binary(x);
        printf("\n  bits set %d, power of two: %s\n",
               popcount(x), is_power_of_two(x) ? "yes" : "no");
        /* x & -x keeps only the lowest set bit. For unsigned numbers
           -x means 2^32 - x, which is ~x + 1. */
        printf("  lowest   %10lu  ", x & (~x + 1));
        binary(x & (~x + 1));
        printf("\n  reversed %10lu  ", reverse_bits(x));
        binary(reverse_bits(x));
        printf("\n");
    }
    printf("round up to a power of two: 5 -> %lu, 64 -> %lu, 1000 -> %lu\n",
           round_up_pow2(5), round_up_pow2(64), round_up_pow2(1000));

    /* Swapping two variables with xor, no temporary needed. Clever,
       but a plain temporary is clearer and just as fast. */
    {
        unsigned a = 6, b = 9;
        a ^= b;
        b ^= a;
        a ^= b;
        printf("xor swap: a = %u, b = %u\n", a, b);
    }
    return 0;
}
