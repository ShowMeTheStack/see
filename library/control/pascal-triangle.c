/*
 * title: Pascal's triangle in one row
 * level: 3
 * about: Prints Pascal's triangle by updating a single array in place, right to left, for each new row.
 * input: 12
 */
#include <stdio.h>

#define MAXROWS 16

int main(void)
{
    long row[MAXROWS];
    int n, i, j, pad;

    scanf("%d", &n);
    if (n < 1 || n > MAXROWS)
        n = 10;

    /* Each number is the sum of the two above it. Rather than keep the
       whole triangle, keep one row and turn it into the next one.
       The inner loop runs from right to left on purpose: row[j-1] must
       still hold the OLD value when row[j] is computed. Run it left to
       right and you would add values that have already been updated.
       Watch the array in the stack frame: one new 1 appears at the right
       end every pass, and the middle values grow. */
    for (i = 0; i < n; i++) {
        row[i] = 1;
        for (j = i - 1; j > 0; j--)
            row[j] = row[j] + row[j - 1];

        /* Indent so that the triangle is centred: each cell is 4 wide,
           so each row starts 2 columns further left than the one above. */
        for (pad = 0; pad < (n - 1 - i) * 2; pad++)
            putchar(' ');
        for (j = 0; j <= i; j++)
            printf("%4ld", row[j]);
        putchar('\n');
    }
    return 0;
}
