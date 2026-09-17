/*
 * title: Pascal's triangle and binomial coefficients
 * level: 1
 * about: Builds each row of Pascal's triangle from the row above in a single array and prints it centred.
 */
#include <stdio.h>

#define ROWS 13

int main(void)
{
    long row[ROWS + 1];
    int n, k;

    /* Every number is the sum of the two above it. Using one array and
       updating it from right to left means each new value is made from
       old values that have not been overwritten yet. Watch row in the
       locals panel: one more number appears at the right each time. */
    row[0] = 1;
    for (n = 0; n < ROWS; n++) {
        if (n > 0) {
            row[n] = 1;
            for (k = n - 1; k > 0; k--)
                row[k] = row[k] + row[k - 1];
        }
        /* Indent so the triangle stands centred. */
        printf("%*s", (ROWS - 1 - n) * 3, "");
        for (k = 0; k <= n; k++)
            printf("%6ld", row[k]);
        printf("\n");
    }

    /* The numbers in row n are the binomial coefficients C(n, k): the
       number of ways to choose k things from n. Row 12 says there are
       924 ways to pick 6 people from 12. */
    printf("C(12, 6) = %ld; the row adds up to %ld = 2^12\n", row[6], 4096L);
    return 0;
}
