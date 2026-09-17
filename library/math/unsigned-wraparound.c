/*
 * title: Wraparound put to work
 * level: 3
 * about: Uses the guaranteed modulo-2^32 behaviour of unsigned ints on purpose, for a hash, a random number generator, a byte checksum and a timer that rolls over.
 */
#include <stdio.h>
#include <limits.h>

/* For unsigned types C promises that arithmetic is done modulo 2^bits:
   whatever does not fit simply falls off the top. Signed overflow has no
   such promise (See warns about it), so every trick below uses unsigned
   types only. */

/* djb2, a string hash: h = h * 33 + c. The multiplications overflow
   after a few characters, and that is exactly what mixes the bits. */
unsigned long djb2(const char *s)
{
    unsigned long h = 5381;

    while (*s != '\0')
        h = (h * 33 + (unsigned char)*s++) & 0xFFFFFFFFUL;
    return h;
}

/* A linear congruential generator, the same kind as many rand()s:
   next = state * a + c, modulo 2^32 for free. The constants are the
   ones from Numerical Recipes. state is static, so it survives between
   calls: find it among the globals. */
static unsigned long state = 1;

unsigned long lcg(void)
{
    state = (state * 1664525UL + 1013904223UL) & 0xFFFFFFFFUL;
    return state;
}

/* An 8-bit checksum: add the bytes in an unsigned char, which keeps only
   the sum modulo 256. Sending the two's complement of it lets the
   receiver check that everything adds up to 0. */
unsigned char checksum(const unsigned char *data, int n)
{
    unsigned char sum = 0;
    int i;

    for (i = 0; i < n; i++)
        sum = (unsigned char)(sum + data[i]);
    return sum;
}

int main(void)
{
    const char *words[4];
    unsigned char packet[6];
    unsigned char sum;
    unsigned int before, after;
    unsigned int i;

    words[0] = "a";
    words[1] = "ab";
    words[2] = "wraparound";
    words[3] = "wraparounc";
    for (i = 0; i < 4; i++)
        printf("djb2(\"%s\") = %lu\n", words[i], djb2(words[i]));

    printf("generator:");
    for (i = 0; i < 5; i++)
        printf(" %lu", lcg() >> 16);    /* the top bits are the best ones */
    printf("\n");

    packet[0] = 200;
    packet[1] = 100;
    packet[2] = 7;
    packet[3] = 250;
    packet[4] = 33;
    sum = checksum(packet, 5);
    packet[5] = (unsigned char)(0 - sum);  /* negation, modulo 256 */
    printf("bytes add to %u mod 256; with the check byte %u they add to %u\n",
           (unsigned)sum, (unsigned)packet[5], (unsigned)checksum(packet, 6));

    /* A free-running 32-bit tick counter rolls over every 2^32 ticks.
       Subtracting old from new still gives the right elapsed time,
       because the subtraction wraps the same way the counter did. */
    before = UINT_MAX - 5;
    after = before + 12;              /* wrapped past 0 */
    printf("before %u, after %u, elapsed %u\n", before, after, after - before);

    /* The one trap: an unsigned counter can never be below 0, so
       for (i = 5; i >= 0; i--) loops for ever. Test before decrementing. */
    printf("countdown:");
    for (i = 5; i-- > 0; )
        printf(" %u", i);
    printf("\n");
    return 0;
}
