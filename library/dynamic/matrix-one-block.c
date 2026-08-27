/*
 * title: A matrix in one block
 * level: 2
 * about: Allocates a rows-by-columns matrix as one flat heap block, indexes it as m[r * cols + c], and prints its transpose.
 * input: 3 4
 */
#include <stdio.h>
#include <stdlib.h>

/* One place that knows the layout: row r, column c. */
#define AT(m, cols, r, c) ((m)[(r) * (cols) + (c)])

int main(void)
{
    int rows, cols, r, c;
    int *m, *t;

    if (scanf("%d %d", &rows, &cols) != 2 || rows < 1 || cols < 1)
        return 0;

    /*
     * A single malloc for all the cells: one block, one free, and the cells
     * sit next to each other just like a real 2D array. The size of the
     * matrix is chosen at run time, which a plain array cannot do in C89.
     */
    m = malloc(rows * cols * sizeof *m);
    t = malloc(rows * cols * sizeof *t);
    if (m == NULL || t == NULL) {
        free(m);
        free(t);
        return 0;
    }

    for (r = 0; r < rows; r++)
        for (c = 0; c < cols; c++)
            AT(m, cols, r, c) = r * cols + c + 1;

    /* The transpose has cols rows and rows columns. */
    for (r = 0; r < rows; r++)
        for (c = 0; c < cols; c++)
            AT(t, rows, c, r) = AT(m, cols, r, c);

    printf("matrix %d x %d:\n", rows, cols);
    for (r = 0; r < rows; r++) {
        for (c = 0; c < cols; c++)
            printf("%4d", AT(m, cols, r, c));
        printf("\n");
    }
    printf("transpose %d x %d:\n", cols, rows);
    for (r = 0; r < cols; r++) {
        for (c = 0; c < rows; c++)
            printf("%4d", AT(t, rows, r, c));
        printf("\n");
    }

    /* free(NULL) is allowed and does nothing, which made the error path above simple. */
    free(m);
    free(t);
    return 0;
}
