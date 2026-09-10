/*
 * title: The sizes of things in limits.h and float.h
 * level: 1
 * about: Prints the range of every integer type and the precision of float and double on this 32-bit machine, and shows what those limits mean in practice.
 */
#include <stdio.h>
#include <limits.h>
#include <float.h>

int main(void)
{
    float f;
    double d;
    int i;

    printf("integer types (%d bits in a char):\n", CHAR_BIT);
    printf("  %-15s %2d bytes  %11d to %d\n", "signed char", (int)sizeof(signed char), SCHAR_MIN, SCHAR_MAX);
    printf("  %-15s %2d bytes  %11d to %d\n", "unsigned char", (int)sizeof(unsigned char), 0, UCHAR_MAX);
    printf("  %-15s %2d bytes  %11d to %d  (plain char is %s here)\n", "char", (int)sizeof(char),
           CHAR_MIN, CHAR_MAX, CHAR_MIN < 0 ? "signed" : "unsigned");
    printf("  %-15s %2d bytes  %11d to %d\n", "short", (int)sizeof(short), SHRT_MIN, SHRT_MAX);
    printf("  %-15s %2d bytes  %11d to %u\n", "unsigned short", (int)sizeof(unsigned short), 0, (unsigned)USHRT_MAX);
    printf("  %-15s %2d bytes  %11d to %d\n", "int", (int)sizeof(int), INT_MIN, INT_MAX);
    printf("  %-15s %2d bytes  %11d to %u\n", "unsigned int", (int)sizeof(unsigned int), 0, UINT_MAX);
    printf("  %-15s %2d bytes  %11ld to %ld\n", "long", (int)sizeof(long), LONG_MIN, LONG_MAX);
    printf("  %-15s %2d bytes  %11d to %lu\n", "unsigned long", (int)sizeof(unsigned long), 0, ULONG_MAX);

    printf("floating types:\n");
    printf("  float:  %d bytes, %d decimal digits, max %e, epsilon %e\n",
           (int)sizeof(float), FLT_DIG, FLT_MAX, FLT_EPSILON);
    printf("  double: %d bytes, %d decimal digits, max %e, epsilon %e\n",
           (int)sizeof(double), DBL_DIG, DBL_MAX, DBL_EPSILON);
    printf("  smallest normal double: %e\n", DBL_MIN);
    printf("  %d bits of mantissa in a double, base %d\n", DBL_MANT_DIG, FLT_RADIX);

    /*
     * What the digits mean: a float keeps about 6 significant digits, so
     * 16777217 (2 to the 24th, plus 1) cannot be stored and rounds.
     */
    f = 16777217.0f;
    d = 16777217.0;
    printf("16777217 as float: %.1f, as double: %.1f\n", f, d);

    /*
     * Epsilon is the gap between 1.0 and the next value up. Adding
     * anything much smaller to 1.0 changes nothing at all.
     */
    d = 1.0 + DBL_EPSILON;
    printf("1 + DBL_EPSILON %s 1\n", d > 1.0 ? "is bigger than" : "equals");
    d = 1.0 + DBL_EPSILON / 4;
    printf("1 + DBL_EPSILON/4 %s 1\n", d > 1.0 ? "is bigger than" : "equals");

    /* Unsigned arithmetic wraps round, by definition, never overflows. */
    i = 0;
    printf("UINT_MAX + 1 = %u, and 0u - 1 = %u\n", UINT_MAX + 1u, (unsigned)i - 1u);
    return 0;
}
