/*
 * title: The bytes inside an int
 * level: 4
 * about: Looks at the four bytes of an int, a negative int and a float through an unsigned char pointer, showing little-endian order and two's complement.
 */
#include <stdio.h>

/* Prints the bytes at address p, lowest address first. Any object can be
   read as an array of unsigned char; that is how C lets you see raw memory. */
static void show_bytes(const char *label, const void *p, int size)
{
    const unsigned char *byte = (const unsigned char *)p;
    int i;

    printf("%-12s", label);
    for (i = 0; i < size; i++) {
        printf(" %02x", byte[i]);
    }
    printf("\n");
}

int main(void)
{
    int n = 0x12345678;
    int minus_one = -1;
    int minus_two = -2;
    float f = 1.0f;
    unsigned char *first;

    /*
     * The machine is little-endian: the least significant byte is stored
     * at the lowest address. So 0x12345678 appears in memory as 78 56 34
     * 12, back to front compared with how we write it. Hover over n in
     * See's stack panel and look at the bytes it shows.
     */
    show_bytes("0x12345678", &n, (int)sizeof n);

    /*
     * Negative numbers use two's complement: -1 is all ones, and -2 is
     * all ones except the lowest bit. Adding 1 to all ones carries all the
     * way out and gives 0, which is exactly what -1 + 1 should be.
     */
    show_bytes("-1", &minus_one, (int)sizeof minus_one);
    show_bytes("-2", &minus_two, (int)sizeof minus_two);

    /*
     * A float's bytes have nothing to do with the integer 1: they hold a
     * sign bit, an exponent and a fraction (IEEE 754). 1.0f is 0x3f800000.
     */
    show_bytes("1.0f", &f, (int)sizeof f);

    /*
     * The classic endianness test: point at the first byte of an int that
     * holds 1. On a little-endian machine that byte is 1.
     */
    n = 1;
    first = (unsigned char *)&n;
    printf("\nfirst byte of the int 1 is %d, so this machine is %s-endian\n",
           *first, *first == 1 ? "little" : "big");

    /* A pointer to a byte can also change a byte. This sets the second
       lowest byte, which is worth 256. */
    first[1] = 2;
    printf("after setting byte 1 to 2, n = %d (1 + 2 * 256)\n", n);
    return 0;
}
