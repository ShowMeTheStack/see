/*
 * title: Conversions between number types
 * level: 2
 * about: Shows what happens when ints, chars and doubles meet in one expression, when a double is stored in an int, and how casts take control.
 */
#include <stdio.h>

int main(void)
{
    int i = 7;
    double d = 2.75;
    char c = 'a';
    int truncated;
    int negative;
    double mixed;
    double average;
    int total = 10;
    int count = 4;
    short small;

    /*
     * When an int and a double meet in +, -, * or /, the int is first
     * converted to double, and the result is a double. The "wider" type
     * always wins.
     */
    mixed = i + d;
    printf("int 7 + double 2.75 = %f\n", mixed);

    /* A char used in arithmetic becomes an int first (code 97 for 'a'). */
    printf("'a' + 1 = %d\n", c + 1);

    /*
     * Storing a double in an int drops the fraction. It does not round:
     * 2.75 becomes 2, and -2.75 becomes -2 (toward zero).
     */
    truncated = d;
    negative = -d;
    printf("int from 2.75 = %d, from -2.75 = %d\n", truncated, negative);

    /* To round to the nearest whole number, add a half before cutting. */
    printf("2.75 rounded = %d\n", (int)(d + 0.5));

    /*
     * The average of ints. total / count would be 2, because both are
     * ints. Casting one of them makes the division happen in double.
     */
    average = (double)total / count;
    printf("average of total 10 over 4 = %.2f (without a cast: %d)\n",
           average, total / count);

    /*
     * Storing a big int in a short keeps only the low 16 bits. 70000 is
     * 0x11170; the low two bytes are 0x1170, which is 4464.
     */
    small = (short)70000;
    printf("(short)70000 = %d\n", small);
    return 0;
}
