/*
 * title: The smallest and largest values
 * level: 2
 * about: Prints the ranges of the integer types from limits.h and of float and double from float.h, then works out the int range from its size.
 */
#include <stdio.h>
#include <limits.h>
#include <float.h>

int main(void)
{
    unsigned long bits;
    unsigned long umax;
    int i;

    /*
     * limits.h names the ranges so programs never have to guess them. The
     * values depend on the machine; these are for See's 32-bit target.
     */
    printf("char   %12d to %d (CHAR_BIT = %d bits)\n", CHAR_MIN, CHAR_MAX, CHAR_BIT);
    printf("uchar  %12d to %u\n", 0, (unsigned)UCHAR_MAX);
    printf("short  %12d to %d\n", SHRT_MIN, SHRT_MAX);
    printf("ushort %12d to %u\n", 0, (unsigned)USHRT_MAX);
    printf("int    %12d to %d\n", INT_MIN, INT_MAX);
    printf("uint   %12d to %u\n", 0, UINT_MAX);
    printf("long   %12ld to %ld\n", LONG_MIN, LONG_MAX);
    printf("ulong  %12d to %lu\n", 0, ULONG_MAX);

    /*
     * Why is the negative side one bigger? With n bits there are 2^n
     * patterns. Zero takes one of them from the non-negative half, so a
     * signed type has one more negative value than positive ones.
     */

    /* The same limits worked out from sizeof: an unsigned type with b bits
       goes up to 2^b - 1. The loop builds 2^b - 1 one bit at a time. */
    bits = sizeof(unsigned short) * CHAR_BIT;
    umax = 0;
    for (i = 0; i < (int)bits; i++) {
        umax = umax * 2 + 1;
    }
    printf("\nunsigned short has %lu bits, so its largest value is %lu\n", bits, umax);

    /*
     * Floating types trade exactness for range. FLT_MAX is huge, but only
     * about FLT_DIG decimal digits of any number are kept.
     */
    printf("\nfloat  up to %e, %d digits, smallest normal %e\n", FLT_MAX, FLT_DIG, FLT_MIN);
    printf("double up to %e, %d digits, smallest normal %e\n", DBL_MAX, DBL_DIG, DBL_MIN);
    return 0;
}
