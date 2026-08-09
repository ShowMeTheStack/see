/*
 * title: Unsigned numbers wrap around
 * level: 3
 * about: Shows that unsigned arithmetic counts modulo 2 to the 32, why 0 - 1 is a huge number, and the trap of comparing signed with unsigned.
 */
#include <stdio.h>
#include <limits.h>

int main(void)
{
    unsigned int u = 0;
    unsigned int big = UINT_MAX;
    unsigned char byte = 250;
    int i;
    int negative = -1;

    /*
     * An unsigned int has 32 bits and no sign, so it holds 0 to
     * 4294967295. Its arithmetic is defined to wrap: going below 0 lands
     * at the top, going above the top lands back at 0, like a car's
     * odometer. (Signed ints are different: overflowing them is an error,
     * and See warns when it happens.)
     */
    u = u - 1;
    printf("0u - 1       = %u (hex %x)\n", u, u);

    big = big + 1;
    printf("UINT_MAX + 1 = %u\n", big);

    /* An unsigned char has 8 bits, 0 to 255. Watch its box on the stack
       go 253, 254, 255, 0, 1 ... as the loop runs. */
    printf("unsigned char counting up from 250:");
    for (i = 0; i < 10; i++) {
        printf(" %d", byte);
        byte++;
    }
    printf("\n");

    /*
     * The same 32 bits, read two ways. -1 is stored as all ones; read as
     * unsigned, all ones is the largest number there is.
     */
    printf("-1 seen as unsigned = %u\n", (unsigned)negative);

    /*
     * The trap: when a signed and an unsigned int are compared, the signed
     * one is converted to unsigned first. So -1 < 1u is false: -1 becomes
     * 4294967295. Compilers warn about such comparisons; here the
     * conversion is written out as a cast to show what really happens.
     */
    if ((unsigned)negative < 1u) {
        printf("-1 < 1u\n");
    } else {
        printf("(unsigned)-1 < 1u is false: %u is not less than 1\n", (unsigned)negative);
    }
    return 0;
}
