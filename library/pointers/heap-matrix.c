/*
 * title: A 2D table on the heap with int **
 * level: 3
 * about: Builds a triangle of Pascal numbers as an array of row pointers, each row its own heap block of a different length.
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * rows is an int **: it points at a heap array of int *, and each of
 * those points at a heap array of ints. Unlike int m[R][C], the rows can
 * have different lengths and need not be next to each other.
 */
int **make_triangle(int n)
{
    int **rows;
    int r, c;

    rows = malloc(n * sizeof *rows);
    if (rows == NULL)
        return NULL;
    for (r = 0; r < n; r++) {
        rows[r] = malloc((r + 1) * sizeof *rows[r]);   /* row r has r+1 numbers */
        if (rows[r] == NULL) {
            while (--r >= 0)
                free(rows[r]);
            free(rows);
            return NULL;
        }
        rows[r][0] = rows[r][r] = 1;
        for (c = 1; c < r; c++)
            rows[r][c] = rows[r - 1][c - 1] + rows[r - 1][c];
    }
    return rows;
}

/* Free the rows first, then the array that held them; the other way round would read freed memory. */
void free_triangle(int **rows, int n)
{
    int r;
    for (r = 0; r < n; r++)
        free(rows[r]);
    free(rows);
}

int main(void)
{
    int n = 7;
    int **t;
    int r, c;

    /*
     * Step over make_triangle and open the heap view: one block of seven
     * pointers, and seven row blocks of 4, 8, 12 ... 28 bytes.
     */
    t = make_triangle(n);
    if (t == NULL)
        return 0;

    for (r = 0; r < n; r++) {
        printf("%*s", (n - 1 - r) * 2, "");
        for (c = 0; c <= r; c++)
            printf("%4d", t[r][c]);
        printf("\n");
    }

    /* t[r][c] is *(*(t + r) + c): follow t to the row pointer, then into the row. */
    printf("t[6][3] = %d = %d\n", t[6][3], *(*(t + 6) + 3));

    free_triangle(t, n);
    return 0;
}
