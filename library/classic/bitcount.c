/*
 * title: getbits, setbits, invert, rightrot and bitcount
 * level: 3
 * about: The bit-fiddling functions of chapter 2, each printed in binary so the moving bits can be seen.
 */
#include <stdio.h>

/* Print the low 16 bits; that is enough to see what each function does. */
void bits(unsigned x)
{
    int i;

    for (i = 15; i >= 0; i--) {
        putchar((x >> i) & 1u ? '1' : '0');
        if (i == 8)
            putchar(' ');
    }
}

/* The n bits that end at position p (counting from 0 at the right),
   moved down to the right end. ~(~0 << n) is a mask of n ones. */
unsigned getbits(unsigned x, int p, int n)
{
    return (x >> (p + 1 - n)) & ~(~0u << n);
}

/* Exercise 2-6: x with the n bits ending at p replaced by the
   rightmost n bits of y. */
unsigned setbits(unsigned x, int p, int n, unsigned y)
{
    unsigned mask = ~(~0u << n) << (p + 1 - n);
    return (x & ~mask) | ((y << (p + 1 - n)) & mask);
}

/* Exercise 2-7: flip the n bits ending at p; xor with 1 flips a bit. */
unsigned invert(unsigned x, int p, int n)
{
    return x ^ (~(~0u << n) << (p + 1 - n));
}

/* Exercise 2-8: rotate right by n; bits falling off the right end come
   back in at the left. An unsigned int has 32 bits here. */
unsigned rightrot(unsigned x, int n)
{
    int w = (int)(sizeof x * 8);

    n %= w;
    if (n == 0)
        return x;
    return (x >> n) | (x << (w - n));
}

/* bitcount from section 2.10. Exercise 2-9 points out that x &= (x-1)
   deletes the rightmost 1 bit, giving the faster version below. */
int bitcount(unsigned x)
{
    int b;

    for (b = 0; x != 0; x >>= 1)
        if (x & 01)
            b++;
    return b;
}

int bitcount_fast(unsigned x)
{
    int b;

    for (b = 0; x != 0; x &= x - 1)
        b++;
    return b;
}

int main(void)
{
    unsigned x = 0xB6A5u;     /* 1011 0110 1010 0101 */
    unsigned r;

    printf("x                       ");
    bits(x);
    printf("\ngetbits(x, 7, 4)        ");
    bits(getbits(x, 7, 4));
    printf("   the 4 bits ending at bit 7\n");
    printf("setbits(x, 7, 4, 0)     ");
    bits(setbits(x, 7, 4, 0u));
    printf("\ninvert(x, 11, 8)        ");
    bits(invert(x, 11, 8));
    printf("\n");

    r = rightrot(x, 4);
    printf("rightrot(x, 4) = %08X: the low hex digit 5 moved to the top\n", r);
    printf("bitcount: %d, fast version: %d\n", bitcount(x), bitcount_fast(x));
    return 0;
}
