/*
 * title: Sudoku by recursive backtracking
 * level: 4
 * about: Solves a 9x9 sudoku by filling the first empty cell with each legal digit in turn and recursing, undoing the guess when it leads nowhere.
 */
#include <stdio.h>

/* 0 means an empty cell. */
int grid[9][9] = {
    {5,3,0, 0,7,0, 0,0,0},
    {6,0,0, 1,9,5, 0,0,0},
    {0,9,8, 0,0,0, 0,6,0},
    {8,0,0, 0,6,0, 0,0,3},
    {4,0,0, 8,0,3, 0,0,1},
    {7,0,0, 0,2,0, 0,0,6},
    {0,6,0, 0,0,0, 2,8,0},
    {0,0,0, 4,1,9, 0,0,5},
    {0,0,0, 0,8,0, 0,7,9}
};

long guesses = 0, undos = 0;
int max_depth = 0;

/* May digit d go at (r, c)? Not if it already appears in that row,
   that column, or that 3x3 box. */
int allowed(int r, int c, int d)
{
    int i, br = r / 3 * 3, bc = c / 3 * 3;

    for (i = 0; i < 9; i++) {
        if (grid[r][i] == d || grid[i][c] == d)
            return 0;
        if (grid[br + i / 3][bc + i % 3] == d)
            return 0;
    }
    return 1;
}

/* Find the next empty cell at or after position pos (0..80). Fill it
   with each allowed digit and recurse to the next. If no digit works,
   return 0 so the caller tries its next digit instead. The depth of
   the stack equals the number of cells filled so far by guessing. */
int solve(int pos, int depth)
{
    int r, c, d;

    while (pos < 81 && grid[pos / 9][pos % 9] != 0)
        pos++;
    if (pos == 81)
        return 1;                 /* no empty cell left: solved */
    if (depth > max_depth)
        max_depth = depth;
    r = pos / 9;
    c = pos % 9;
    for (d = 1; d <= 9; d++) {
        if (!allowed(r, c, d))
            continue;
        grid[r][c] = d;           /* guess */
        guesses++;
        if (solve(pos + 1, depth + 1))
            return 1;
        grid[r][c] = 0;           /* that guess failed further on: undo */
        undos++;
    }
    return 0;
}

void print(void)
{
    int r, c;

    for (r = 0; r < 9; r++) {
        if (r % 3 == 0)
            printf("+-------+-------+-------+\n");
        for (c = 0; c < 9; c++) {
            if (c % 3 == 0)
                printf("| ");
            printf("%c ", grid[r][c] ? '0' + grid[r][c] : '.');
        }
        printf("|\n");
    }
    printf("+-------+-------+-------+\n");
}

int main(void)
{
    print();
    /* The grid is a global, so the globals view shows the digits being
       written and rubbed out as the search runs. */
    if (solve(0, 1)) {
        printf("solved with %ld guesses, %ld of them undone, stack %d deep\n",
               guesses, undos, max_depth);
        print();
    } else
        printf("no solution\n");
    return 0;
}
