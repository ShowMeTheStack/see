/*
 * title: Looking at the bytes of an int
 * level: 3
 * about: Reads an int and a double byte by byte through an unsigned char pointer, showing little-endian order.
 */
#include <stdio.h>

/* Any object may be inspected as an array of unsigned char; that is always allowed. */
void dump(const char *label, const void *obj, size_t size)
{
    const unsigned char *b = obj;
    size_t i;
    printf("%-10s", label);
    for (i = 0; i < size; i++)
        printf(" %02x", b[i]);
    printf("\n");
}

int main(void)
{
    int n = 0x12345678;
    int minus = -1;
    double half = 0.5;
    unsigned char *b;

    /*
     * This machine is little-endian: the least significant byte is stored
     * first, at the lowest address. So 0x12345678 is laid out 78 56 34 12.
     * Hover over n in the memory picture to see the same four bytes.
     */
    dump("n", &n, sizeof n);
    dump("-1", &minus, sizeof minus);
    dump("0.5", &half, sizeof half);

    /* Change one byte in the middle of n through a char pointer. */
    b = (unsigned char *)&n;
    b[1] = 0xAB;                 /* the second lowest byte: 0x56 becomes 0xAB */
    printf("after b[1] = 0xAB: n = 0x%x\n", (unsigned)n);

    /* A quick endianness test that works on any machine. */
    {
        int one = 1;
        printf("this machine is %s-endian\n",
               *(unsigned char *)&one == 1 ? "little" : "big");
    }
    return 0;
}
