/*
 * title: Shidoku, a 4x4 sudoku you fill in
 * level: 2
 * about: Lets you fill a 4x4 sudoku one move at a time, rejecting any move that repeats a digit in its row, column or 2x2 box, until the grid is full.
 * input: 1 2 3\n1 3 4\n2 2 1\n1 4 1\n3 1 2\n2 1 3\n2 1 1\n2 4 3\n3 1 4\n3 4 2\n4 1 3\n4 2 2\n4 3 1\n
 */
#include <stdio.h>

static int g[4][4] = {
    { 2, 0, 0, 0 },
    { 0, 4, 2, 0 },
    { 0, 1, 3, 0 },
    { 0, 0, 0, 4 }
};
static int given[4][4];     /* 1 for the starting clues, which cannot change */

/* Why could digit d not go at (r,c)? Returns a short reason, or NULL if
   it is allowed. Returning a string literal is safe: literals live for
   the whole run, unlike a local array. */
static const char *conflict(int r, int c, int d)
{
    int i, j, br = r / 2 * 2, bc = c / 2 * 2;

    for (i = 0; i < 4; i++) {
        if (i != c && g[r][i] == d)
            return "already in that row";
        if (i != r && g[i][c] == d)
            return "already in that column";
    }
    for (i = br; i < br + 2; i++)
        for (j = bc; j < bc + 2; j++)
            if ((i != r || j != c) && g[i][j] == d)
                return "already in that box";
    return NULL;
}

static void show(void)
{
    int r, c;

    for (r = 0; r < 4; r++) {
        if (r == 2)
            printf("----+----\n");
        for (c = 0; c < 4; c++) {
            printf("%c", g[r][c] ? '0' + g[r][c] : '.');
            printf(c == 1 ? " | " : " ");
        }
        printf("\n");
    }
}

static int empty_cells(void)
{
    int r, c, n = 0;

    for (r = 0; r < 4; r++)
        for (c = 0; c < 4; c++)
            if (g[r][c] == 0)
                n++;
    return n;
}

int main(void)
{
    int r, c, d;
    const char *why;

    for (r = 0; r < 4; r++)
        for (c = 0; c < 4; c++)
            given[r][c] = g[r][c] != 0;

    printf("Enter: row col digit (all 1 to 4)\n");
    show();
    while (empty_cells() > 0) {
        if (scanf("%d %d %d", &r, &c, &d) != 3) {
            printf("Stopped with %d cells to go.\n", empty_cells());
            return 0;
        }
        printf("> %d %d %d: ", r, c, d);
        if (r < 1 || r > 4 || c < 1 || c > 4 || d < 1 || d > 4) {
            printf("out of range\n");
            continue;
        }
        r--;
        c--;
        if (given[r][c]) {
            printf("that is a clue, it cannot change\n");
            continue;
        }
        why = conflict(r, c, d);
        if (why != NULL) {
            printf("no - %d is %s\n", d, why);
            continue;
        }
        g[r][c] = d;
        printf("ok\n");
    }
    show();
    printf("Solved!\n");
    return 0;
}
