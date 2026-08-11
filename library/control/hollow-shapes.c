/*
 * title: Hollow box and hollow triangle
 * level: 2
 * about: Prints the outline of a rectangle and of a triangle by deciding cell by cell whether it is on an edge.
 */
#include <stdio.h>

int main(void)
{
    int w = 12, h = 5;
    int r, c;
    int n = 6;

    /* Think of the shape as a grid. Visit every cell (r, c) and ask one
       question: is this cell on the border? If so print '#', if not a
       space. The || chain stops at the first true test. */
    for (r = 0; r < h; r++) {
        for (c = 0; c < w; c++) {
            if (r == 0 || r == h - 1 || c == 0 || c == w - 1)
                putchar('#');
            else
                putchar(' ');
        }
        putchar('\n');
    }
    putchar('\n');

    /* A hollow right triangle: row r has r+1 cells. A cell is on the
       edge if it is the first or last of its row, or in the bottom row. */
    for (r = 0; r < n; r++) {
        for (c = 0; c <= r; c++) {
            if (c == 0 || c == r || r == n - 1)
                putchar('*');
            else
                putchar(' ');
        }
        putchar('\n');
    }
    return 0;
}
