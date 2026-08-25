/*
 * title: A 2D array is one long row
 * level: 3
 * about: Shows that int grid[3][4] is twelve ints in a row, walks it with a single pointer, and compares grid + 1 with grid[0] + 1.
 */
#include <stdio.h>

#define ROWS 3
#define COLS 4

int main(void)
{
    int grid[ROWS][COLS];
    int *walk;
    int r, c, k;

    for (r = 0; r < ROWS; r++)
        for (c = 0; c < COLS; c++)
            grid[r][c] = r * 10 + c;

    /*
     * Rows are stored one after another (row-major order): the whole of
     * row 0, then row 1, then row 2. grid[1][0] comes right after grid[0][3].
     */
    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++)
            printf("[%d][%d] %p  ", r, c, (void *)&grid[r][c]);
        printf("\n");
    }

    /* So one int pointer can visit every cell in order. */
    walk = &grid[0][0];
    printf("\nwalking: ");
    for (k = 0; k < ROWS * COLS; k++)
        printf("%d ", walk[k]);
    printf("\n");

    /*
     * grid is an array of rows. grid + 1 skips a whole row (16 bytes);
     * grid[0] + 1 skips one int (4 bytes). Same starting address, different
     * step size, because the pointers have different types.
     */
    printf("grid      = %p\n", (void *)grid);
    printf("grid + 1  = %p  (next row)\n", (void *)(grid + 1));
    printf("grid[0]+1 = %p  (next int)\n", (void *)(grid[0] + 1));
    printf("sizeof grid = %u, sizeof grid[0] = %u, sizeof grid[0][0] = %u\n",
           (unsigned)sizeof grid, (unsigned)sizeof grid[0], (unsigned)sizeof grid[0][0]);

    /* grid[r][c] is the same cell as walk[r * COLS + c]. */
    printf("grid[2][1] = %d, walk[2 * %d + 1] = %d\n", grid[2][1], COLS, walk[2 * COLS + 1]);
    return 0;
}
