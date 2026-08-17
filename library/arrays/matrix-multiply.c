/*
 * title: Multiplying two matrices
 * level: 2
 * about: Multiplies a 2x3 matrix by a 3x4 matrix with the classic triple loop and prints the working for one cell.
 */
#include <stdio.h>

#define R 2
#define M 3
#define C 4

int main(void)
{
    /* A two-dimensional array is rows of rows: a[1] is the whole second row,
       and the rows sit one after another in memory. */
    int a[R][M] = { { 1, 2, 3 },
                    { 4, 5, 6 } };
    int b[M][C] = { { 7, 8, 9, 10 },
                    { 11, 12, 13, 14 },
                    { 15, 16, 17, 18 } };
    int c[R][C];
    int i, j, k;

    /* Cell c[i][j] is row i of a "dotted" with column j of b. The inner
       dimension M must match: a has M columns and b has M rows. */
    for (i = 0; i < R; i++) {
        for (j = 0; j < C; j++) {
            c[i][j] = 0;
            for (k = 0; k < M; k++)
                c[i][j] += a[i][k] * b[k][j];
        }
    }

    printf("c[1][2] = ");
    for (k = 0; k < M; k++)
        printf("%s%d*%d", k ? " + " : "", a[1][k], b[k][2]);
    printf(" = %d\n\n", c[1][2]);

    for (i = 0; i < R; i++) {
        for (j = 0; j < C; j++)
            printf("%5d", c[i][j]);
        printf("\n");
    }
    return 0;
}
