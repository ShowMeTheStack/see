/*
 * title: Pascal's triangle in a 2D array
 * level: 2
 * about: Builds twelve rows of Pascal's triangle where each entry is the sum of the two above it, then reads off a binomial coefficient.
 */
#include <stdio.h>

#define ROWS 12

int main(void)
{
    /* Only the lower-left triangle is used; the rest stays 0 from the
       initialiser, which is handy because p[r-1][c] past the end of the
       previous row then reads as 0. */
    long p[ROWS][ROWS] = { { 0 } };
    int r, c;

    for (r = 0; r < ROWS; r++) {
        p[r][0] = 1;
        for (c = 1; c <= r; c++)
            p[r][c] = p[r - 1][c - 1] + p[r - 1][c];
    }

    for (r = 0; r < ROWS; r++) {
        /* Indent each row so the triangle is centred. %*s prints an empty
           string padded to the given width. */
        printf("%*s", (ROWS - 1 - r) * 3, "");
        for (c = 0; c <= r; c++)
            printf("%6ld", p[r][c]);
        printf("\n");
    }
    /* Row n, column k is "n choose k": the ways to pick k things from n. */
    printf("\nways to choose 4 toppings from 11: p[11][4] = %ld\n", p[11][4]);
    return 0;
}
