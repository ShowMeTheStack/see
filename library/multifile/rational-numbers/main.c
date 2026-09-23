/*
 * title: Exact fractions with a rational module
 * level: 2
 * about: Sums the harmonic series and an Egyptian fraction exactly using a fraction module that passes structs by value.
 */

/* See compiles main.c and frac.c separately and links them. Step into
 * frac_add (F11): the stack shows a and b as copies, two longs each. */
#include <stdio.h>
#include "frac.h"

int main(void)
{
    Frac sum, x, three_tenths, tenth;
    int n;

    /* 1 + 1/2 + 1/3 + ... exactly, where a double would round. */
    sum = frac_make(0, 1);
    for (n = 1; n <= 10; n++) {
        sum = frac_add(sum, frac_make(1, n));
        printf("H(%2d) = ", n);
        frac_print(sum);
        printf("\n");
    }

    /* 1/2 + 1/3 + 1/7 + 1/42 is exactly 1. */
    x = frac_add(frac_add(frac_make(1, 2), frac_make(1, 3)), frac_add(frac_make(1, 7), frac_make(1, 42)));
    printf("1/2 + 1/3 + 1/7 + 1/42 = ");
    frac_print(x);
    printf("\n");

    /* 0.1 + 0.2 is famously not 0.3 in floating point; here it is. */
    tenth = frac_make(1, 10);
    three_tenths = frac_add(tenth, frac_make(2, 10));
    printf("1/10 + 2/10 = ");
    frac_print(three_tenths);
    printf(", equal to 3/10: %s\n", frac_cmp(three_tenths, frac_make(3, 10)) == 0 ? "yes" : "no");
    printf("as doubles: 0.1 + 0.2 == 0.3 is %s\n", 0.1 + 0.2 == 0.3 ? "true" : "false");

    printf("(3/4) / (-9/8) = ");
    frac_print(frac_div(frac_make(3, 4), frac_make(-9, 8)));
    printf("\n");
    return 0;
}
