/*
 * title: Is this sudoku solved?
 * level: 3
 * about: Checks every row, column and 3x3 box of a finished sudoku with a small array of seen-flags, and reports the first rule broken.
 */
#include <stdio.h>

/* Check nine cells given by a starting point and two steps. seen[d] marks
   digit d as used; it is cleared each call, so slot 0 is never touched. */
static int nine_ok(int g[9][9], int r0, int c0, int dr, int dc, int boxMode)
{
    int seen[10] = { 0 };
    int i, r, c, d;
    for (i = 0; i < 9; i++) {
        if (boxMode) {           /* walk a 3x3 box row by row */
            r = r0 + i / 3;
            c = c0 + i % 3;
        } else {                 /* walk a straight line */
            r = r0 + i * dr;
            c = c0 + i * dc;
        }
        d = g[r][c];
        if (d < 1 || d > 9 || seen[d])
            return 0;
        seen[d] = 1;
    }
    return 1;
}

static void check(int g[9][9], const char *name)
{
    int k;
    for (k = 0; k < 9; k++) {
        if (!nine_ok(g, k, 0, 0, 1, 0)) { printf("%s: row %d is wrong\n", name, k + 1); return; }
        if (!nine_ok(g, 0, k, 1, 0, 0)) { printf("%s: column %d is wrong\n", name, k + 1); return; }
        if (!nine_ok(g, k / 3 * 3, k % 3 * 3, 0, 0, 1)) { printf("%s: box %d is wrong\n", name, k + 1); return; }
    }
    printf("%s: solved\n", name);
}

int main(void)
{
    int g[9][9] = {
        { 5, 3, 4, 6, 7, 8, 9, 1, 2 },
        { 6, 7, 2, 1, 9, 5, 3, 4, 8 },
        { 1, 9, 8, 3, 4, 2, 5, 6, 7 },
        { 8, 5, 9, 7, 6, 1, 4, 2, 3 },
        { 4, 2, 6, 8, 5, 3, 7, 9, 1 },
        { 7, 1, 3, 9, 2, 4, 8, 5, 6 },
        { 9, 6, 1, 5, 3, 7, 2, 8, 4 },
        { 2, 8, 7, 4, 1, 9, 6, 3, 5 },
        { 3, 4, 5, 2, 8, 6, 1, 7, 9 }
    };
    int t;

    check(g, "grid as given");

    /* Swap two cells in the same row: the row is still fine (same digits),
       but two columns now hold a repeat. */
    t = g[4][0]; g[4][0] = g[4][1]; g[4][1] = t;
    check(g, "after swapping two cells in row 5");

    /* Undo that swap, then exchange two whole rows that share a band of
       three. Every row, column and box keeps the same digits, so the grid
       is still a valid solution. */
    t = g[4][0]; g[4][0] = g[4][1]; g[4][1] = t;
    {
        int c;
        for (c = 0; c < 9; c++) { t = g[0][c]; g[0][c] = g[1][c]; g[1][c] = t; }
    }
    check(g, "after swapping rows 1 and 2");
    return 0;
}
