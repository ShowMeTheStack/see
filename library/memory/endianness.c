/*
 * title: Little-endian: looking at the bytes of an int
 * level: 2
 * about: Stores 0x11223344 in an int and reads it back one byte at a time through an unsigned char pointer to reveal the byte order.
 */
#include <stdio.h>

int main(void)
{
    unsigned long word = 0x11223344UL;
    unsigned char *byte = (unsigned char *)&word;
    unsigned int i;
    int one = 1;

    /*
     * Any object can be looked at as an array of unsigned char: that is the
     * one pointer conversion C always allows for reading raw bytes.
     */
    printf("value 0x%08lx is stored as:\n", word);
    for (i = 0; i < sizeof word; i++)
        printf("  address %p : 0x%02x\n", (void *)(byte + i), byte[i]);

    /*
     * The lowest address holds 0x44, the least significant byte. That is
     * "little-endian": the little end comes first. A big-endian machine
     * would show 11 22 33 44 in that order.
     */
    if (*(unsigned char *)&one == 1)
        printf("this machine is little-endian\n");
    else
        printf("this machine is big-endian\n");

    /* Change one byte and watch the whole value change in the watch panel. */
    byte[3] = 0xAA;
    printf("after byte[3] = 0xAA the value is 0x%08lx\n", word);
    return 0;
}
