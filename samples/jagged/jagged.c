/* jagged.c: a triangle of numbers with rows of different lengths.
   rows lives on the stack; it points to an array of row pointers on the heap,
   and each of those points to its own block. Step and watch the arrows appear. */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int n = 5, i, j;
    int **rows = malloc(n * sizeof *rows);    /* n pointers, one per row */

    for (i = 0; i < n; i++) {
        rows[i] = malloc((i + 1) * sizeof **rows);    /* row i holds i + 1 numbers */
        for (j = 0; j <= i; j++)
            rows[i][j] = (j == 0 || j == i) ? 1 : rows[i - 1][j - 1] + rows[i - 1][j];
    }
    for (i = 0; i < n; i++) {
        for (j = 0; j <= i; j++)
            printf("%d ", rows[i][j]);
        printf("\n");
    }
    for (i = 0; i < n; i++)
        free(rows[i]);     /* the rows first ... */
    free(rows);            /* ... then the array that pointed at them */
    return 0;
}
