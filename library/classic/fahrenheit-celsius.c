/*
 * title: Fahrenheit to Celsius table
 * level: 1
 * about: Prints the first table from The C Programming Language three ways: with ints, with floats, and with a for loop and symbolic constants.
 */
#include <stdio.h>

/* Symbolic constants: names instead of magic numbers buried in code. */
#define LOWER 0
#define UPPER 300
#define STEP  20

int main(void)
{
    int fahr, celsius;
    float f, c;

    /* Version 1, all integers. 5 * (fahr - 32) / 9 is not the same as
       5 / 9 * (fahr - 32): integer 5 / 9 is 0, which would make every
       Celsius value 0. Multiply first, divide last. */
    printf("ints     ");
    fahr = LOWER;
    while (fahr <= UPPER) {
        celsius = 5 * (fahr - 32) / 9;
        printf("%4d", celsius);
        fahr = fahr + STEP;
    }
    printf("\n");

    /* Version 2, floating point. 5.0 / 9.0 is a real division, and the
       fractions are no longer thrown away. %6.1f means at least six
       characters wide with one digit after the point. */
    printf("%3s %6s\n", "F", "C");
    f = LOWER;
    while (f <= UPPER) {
        c = (5.0f / 9.0f) * (f - 32.0f);
        printf("%3.0f %6.1f\n", f, c);
        f = f + STEP;
    }

    /* Version 3: the same loop as a for statement, backwards, with the
       arithmetic right inside printf. Compact, and still clear. */
    for (fahr = UPPER; fahr >= LOWER; fahr = fahr - 100)
        printf("%3d F is %6.1f C\n", fahr, (5.0 / 9.0) * (fahr - 32));
    return 0;
}
