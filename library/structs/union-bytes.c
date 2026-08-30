/*
 * title: Looking at the bytes of a float with a union
 * level: 3
 * about: Overlays a float, an unsigned long and four bytes in one union to take IEEE 754 numbers apart into sign, exponent and fraction.
 */
#include <stdio.h>

/* All three members share the same 4 bytes. Write the float, then read the
   same bits back as an integer or as single bytes. In the memory picture
   there is only one 4-byte box, whichever member you look through. */
union view {
    float f;
    unsigned long bits;          /* long is 4 bytes on this machine */
    unsigned char byte[4];
};

void dissect(float x)
{
    union view v;
    unsigned long sign, exponent, fraction;
    int i;

    v.f = x;
    sign = v.bits >> 31;
    exponent = (v.bits >> 23) & 0xFFUL;
    fraction = v.bits & 0x7FFFFFUL;

    printf("%12g  bits %08lx  bytes", x, v.bits);
    /* Little-endian: byte[0] is the LOW end of the number, so the bytes
       appear in the opposite order to the hex digits above. */
    for (i = 0; i < 4; i++)
        printf(" %02x", v.byte[i]);
    printf("  sign %lu exp %3lu (2^%-4d) frac %06lx\n", sign, exponent,
           (int)exponent - 127, fraction);
}

int main(void)
{
    union view v;

    dissect(1.0f);
    dissect(-2.0f);
    dissect(0.5f);
    dissect(0.1f);
    dissect(3.14159f);
    dissect(1e10f);
    dissect(0.0f);

    /* Going the other way: build a float straight from its bits. Exponent
       128 with a zero fraction means 2 to the power 1, so this is 2.0. */
    v.bits = (128UL << 23);
    printf("bits %08lx read as a float: %g\n", v.bits, v.f);

    /* Add one to the bits and the float moves to the very next representable
       number, the smallest step possible near 2.0. */
    v.bits += 1;
    printf("next float after 2.0:     %.9g\n", v.f);
    printf("sizeof(union view) = %d\n", (int)sizeof v);
    return 0;
}
