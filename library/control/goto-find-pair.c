/*
 * title: Leaving nested loops with goto
 * level: 3
 * about: Searches a grid for two neighbouring cells with a given sum and jumps out of both loops with goto when found.
 * input: 17
 */
#include <stdio.h>

#define ROWS 4
#define COLS 5

int main(void)
{
    static int grid[ROWS][COLS] = {
        {  3,  8,  1,  9,  4 },
        {  7,  2,  6,  5, 11 },
        { 12,  5,  3,  8,  2 },
        {  1, 10,  9,  7,  6 }
    };
    int target;
    int r, c;

    scanf("%d", &target);

    /* We want the first cell whose right-hand neighbour adds up to the
       target. break would only leave the inner loop, and the outer loop
       would keep going. Options are a "found" flag tested in both loop
       conditions, or one goto. A forward goto out of nested loops is the
       one use of goto most C programmers agree is clean. */
    for (r = 0; r < ROWS; r++) {
        for (c = 0; c + 1 < COLS; c++) {
            printf("trying [%d][%d]+[%d][%d] = %d\n",
                   r, c, r, c + 1, grid[r][c] + grid[r][c + 1]);
            if (grid[r][c] + grid[r][c + 1] == target)
                goto found;
        }
    }
    printf("no neighbours add up to %d\n", target);
    return 0;

found:
    /* r and c still hold the values they had at the moment of the jump.
       In See, grid is in the globals area (it is static); watch which
       cells r and c pick out. */
    printf("found: %d + %d = %d at row %d, columns %d and %d\n",
           grid[r][c], grid[r][c + 1], target, r, c, c + 1);
    return 0;
}
