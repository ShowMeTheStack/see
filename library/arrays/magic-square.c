/*
 * title: Building a magic square
 * level: 3
 * about: Fills an odd-sized square with the Siamese method and then proves every row, column and diagonal has the same sum.
 */
#include <stdio.h>

#define N 5

int main(void)
{
    int sq[N][N] = { { 0 } };
    int r, c, k, nr, nc;
    int target = N * (N * N + 1) / 2;   /* 65 for N = 5 */
    int sum, ok = 1;

    /* Siamese method: start in the middle of the top row. For each next
       number, move up one and right one, wrapping around the edges.
       If that cell is taken, drop down one instead. */
    r = 0;
    c = N / 2;
    for (k = 1; k <= N * N; k++) {
        sq[r][c] = k;
        nr = (r - 1 + N) % N;   /* + N keeps the remainder non-negative */
        nc = (c + 1) % N;
        if (sq[nr][nc] != 0) {
            nr = (r + 1) % N;
            nc = c;
        }
        r = nr;
        c = nc;
    }

    for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++)
            printf("%4d", sq[r][c]);
        printf("\n");
    }

    /* Check it rather than trust it. */
    for (r = 0; r < N; r++) {
        for (sum = 0, c = 0; c < N; c++) sum += sq[r][c];
        if (sum != target) { printf("row %d sums to %d\n", r, sum); ok = 0; }
    }
    for (c = 0; c < N; c++) {
        for (sum = 0, r = 0; r < N; r++) sum += sq[r][c];
        if (sum != target) { printf("column %d sums to %d\n", c, sum); ok = 0; }
    }
    for (sum = 0, k = 0; k < N; k++) sum += sq[k][k];
    if (sum != target) ok = 0;
    for (sum = 0, k = 0; k < N; k++) sum += sq[k][N - 1 - k];
    if (sum != target) ok = 0;

    printf("every line sums to %d: %s\n", target, ok ? "yes" : "no");
    return 0;
}
