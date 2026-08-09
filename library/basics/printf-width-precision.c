/*
 * title: Widths, precision and flags in printf
 * level: 2
 * about: Lines up numbers in columns with field widths, the - 0 + and space flags, precision, and a width taken from an argument with *.
 */
#include <stdio.h>

int main(void)
{
    int values[4];
    double money[4];
    int i;
    int width;

    values[0] = 7;   values[1] = -42;  values[2] = 1500;  values[3] = 0;
    money[0] = 3.5;  money[1] = 120.0; money[2] = 0.125;  money[3] = 99.999;

    /*
     * A number between % and the conversion letter is the minimum field
     * width. The value is padded on the left with spaces, so numbers of
     * different lengths end at the same column: perfect for tables.
     * Brackets are printed around each field so you can see its edges.
     */
    printf("%%6d      %%-6d     %%06d     %%+d  %% d\n");
    for (i = 0; i < 4; i++) {
        /* - pads on the right instead (left-justify).
           0 pads with zeros instead of spaces.
           + always prints a sign, even for positive numbers.
           a space prints a space where a + would go, so columns stay even. */
        printf("[%6d] [%-6d] [%06d] [%+d] [% d]\n",
               values[i], values[i], values[i], values[i], values[i]);
    }

    /*
     * For %f the number after a dot is the precision: digits after the
     * decimal point. The value is rounded, not cut off: 99.999 with two
     * digits becomes 100.00.
     */
    printf("\n[%%8.2f]   [%%.0f]  [%%.3e]\n");
    for (i = 0; i < 4; i++) {
        printf("[%8.2f] [%.0f] [%.3e]\n", money[i], money[i], money[i]);
    }

    /* For %s, the precision is the largest number of characters to print. */
    printf("\n[%.4s] is the start of [%s]\n", "Kernighan", "Kernighan");

    /*
     * A * in place of the width means: take the width from the next int
     * argument. This lets the program decide the width while it runs.
     */
    for (width = 1; width <= 5; width++) {
        printf("[%*d]\n", width, width);
    }
    return 0;
}
