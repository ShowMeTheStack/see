/*
 * title: Pascal's triangle as a jagged array
 * level: 2
 * about: Builds Pascal's triangle with an int ** where row r is its own heap block of r + 1 ints, then frees each row and the row table.
 * input: 7
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int **rows;
    int n, r, c;

    if (scanf("%d", &n) != 1 || n < 1 || n > 20)
        return 0;

    /* First a table of n row pointers... */
    rows = malloc(n * sizeof *rows);
    if (rows == NULL)
        return 0;

    for (r = 0; r < n; r++) {
        /*
         * ...then one block per row, each a different length. In the heap
         * panel the blocks get wider row by row, and the table holds an
         * arrow to each one.
         */
        rows[r] = malloc((r + 1) * sizeof *rows[r]);
        if (rows[r] == NULL) {
            while (r-- > 0)
                free(rows[r]);
            free(rows);
            return 0;
        }
        rows[r][0] = rows[r][r] = 1;
        for (c = 1; c < r; c++)
            rows[r][c] = rows[r - 1][c - 1] + rows[r - 1][c];
    }

    for (r = 0; r < n; r++) {
        printf("%*s", (n - r - 1) * 2, "");
        for (c = 0; c <= r; c++)
            printf("%4d", rows[r][c]);
        printf("\n");
    }

    /*
     * Free in the reverse order of building: the rows first, while we can
     * still read their addresses from the table, then the table itself.
     * Freeing rows first the other way round would lose the addresses.
     */
    for (r = 0; r < n; r++)
        free(rows[r]);
    free(rows);
    return 0;
}
