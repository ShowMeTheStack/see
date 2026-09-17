/*
 * title: How big can an integer get
 * level: 1
 * about: Prints the limits from limits.h for every integer type and works out the same numbers from the bit counts.
 */
#include <stdio.h>
#include <limits.h>

int main(void)
{
    /* limits.h tells you the range of each type on this machine. On
       See's 32-bit machine, char is 8 bits, short 16, int and long 32. */
    printf("%-15s %5s %13s %13s\n", "type", "bytes", "minimum", "maximum");
    printf("%-15s %5d %13d %13d\n", "char", (int)sizeof(char), CHAR_MIN, CHAR_MAX);
    printf("%-15s %5d %13d %13d\n", "signed char", (int)sizeof(signed char), SCHAR_MIN, SCHAR_MAX);
    printf("%-15s %5d %13d %13u\n", "unsigned char", (int)sizeof(unsigned char), 0, (unsigned)UCHAR_MAX);
    printf("%-15s %5d %13d %13d\n", "short", (int)sizeof(short), SHRT_MIN, SHRT_MAX);
    printf("%-15s %5d %13d %13u\n", "unsigned short", (int)sizeof(unsigned short), 0, (unsigned)USHRT_MAX);
    printf("%-15s %5d %13d %13d\n", "int", (int)sizeof(int), INT_MIN, INT_MAX);
    printf("%-15s %5d %13d %13u\n", "unsigned int", (int)sizeof(unsigned int), 0, UINT_MAX);
    printf("%-15s %5d %13ld %13ld\n", "long", (int)sizeof(long), LONG_MIN, LONG_MAX);
    printf("%-15s %5d %13d %13lu\n", "unsigned long", (int)sizeof(unsigned long), 0, ULONG_MAX);
    printf("CHAR_BIT = %d bits in a byte\n\n", CHAR_BIT);

    /* Where do the numbers come from? With n bits an unsigned type
       counts 0 .. 2^n - 1. A signed (two's complement) type gives one
       bit to the sign: -2^(n-1) .. 2^(n-1) - 1. That is why the minimum
       is one bigger in size than the maximum: -128 but only +127. */
    printf("16 bits: unsigned up to %lu, signed %ld .. %ld\n",
           (1UL << 16) - 1, -(1L << 15), (1L << 15) - 1);

    /* Shifting an unsigned all-ones value right is a portable way to
       find the largest signed value without limits.h. */
    printf("~0u >> 1 = %u, the same as INT_MAX\n", ~0u >> 1);

    /* How many decimal digits fit? Every 10 bits buy about 3 digits,
       because 2^10 = 1024 is close to 10^3. 31 bits give 9 safe digits
       (the tenth digit of INT_MAX is only a 2). */
    printf("INT_MAX has %d digits: %d\n", 10, INT_MAX);
    return 0;
}
