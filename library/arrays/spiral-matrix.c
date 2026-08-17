/*
 * title: Walking a matrix in a spiral
 * level: 3
 * about: Fills a 5x6 grid with 1, 2, 3... in a clockwise spiral by shrinking four boundaries.
 */
#include <stdio.h>

#define ROWS 5
#define COLS 6

int main(void)
{
    int g[ROWS][COLS];
    /* Four walls. After each side of the spiral is drawn, the wall it ran
       along moves one step inwards. The walk ends when the walls cross. */
    int top = 0, bottom = ROWS - 1, left = 0, right = COLS - 1;
    int r, c, n = 1;

    while (top <= bottom && left <= right) {
        for (c = left; c <= right; c++) g[top][c] = n++;      /* along the top, left to right */
        top++;
        for (r = top; r <= bottom; r++) g[r][right] = n++;    /* down the right side */
        right--;
        if (top <= bottom) {                                  /* a single row may be left */
            for (c = right; c >= left; c--) g[bottom][c] = n++;
            bottom--;
        }
        if (left <= right) {                                  /* a single column may be left */
            for (r = bottom; r >= top; r--) g[r][left] = n++;
            left++;
        }
    }

    /* Every one of the 30 cells was written exactly once. If one were
       missed, See would flag an uninitialised read in the loop below. */
    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++)
            printf("%4d", g[r][c]);
        printf("\n");
    }
    return 0;
}
