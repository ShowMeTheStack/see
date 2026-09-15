/*
 * title: Sudoku solver with backtracking
 * level: 4
 * about: Reads a puzzle from stdin (0 for blanks), solves it by trying digits in the first empty cell and backing up on contradictions, using bit masks for fast checks.
 * input: 530070000\n600195000\n098000060\n800060003\n400803001\n700020006\n060000280\n000419005\n000080079\n
 */
#include <stdio.h>

static int grid[9][9];

/* used_row[r] has bit d set when digit d already appears in row r; the
   same for columns and the nine 3x3 boxes. Checking a digit is then one
   AND instead of scanning 27 cells. */
static int used_row[9], used_col[9], used_box[9];
static long tries = 0;

#define BOX(r, c) ((r) / 3 * 3 + (c) / 3)

static void place(int r, int c, int d)
{
    grid[r][c] = d;
    used_row[r] |= 1 << d;
    used_col[c] |= 1 << d;
    used_box[BOX(r, c)] |= 1 << d;
}

static void unplace(int r, int c, int d)
{
    grid[r][c] = 0;
    used_row[r] &= ~(1 << d);
    used_col[c] &= ~(1 << d);
    used_box[BOX(r, c)] &= ~(1 << d);
}

/* Solve from cell number pos (0..80) onwards. Each level of recursion
   fills one empty cell, so the stack is never deeper than the number of
   blanks. Set a breakpoint on unplace to catch the solver changing its
   mind. */
static int solve(int pos)
{
    int r, c, d, used;

    while (pos < 81 && grid[pos / 9][pos % 9] != 0)
        pos++;
    if (pos == 81)
        return 1;           /* no blanks left: solved */
    r = pos / 9;
    c = pos % 9;
    used = used_row[r] | used_col[c] | used_box[BOX(r, c)];
    for (d = 1; d <= 9; d++) {
        if (used & (1 << d))
            continue;
        tries++;
        place(r, c, d);
        if (solve(pos + 1))
            return 1;
        unplace(r, c, d);
    }
    return 0;               /* nothing fits: the caller must try again */
}

static void show(void)
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
    char line[16];
    int r, c, d, ok = 1;

    for (r = 0; r < 9; r++) {
        if (scanf("%15s", line) != 1) {
            printf("need 9 rows\n");
            return 0;
        }
        for (c = 0; c < 9; c++) {
            d = line[c] - '0';
            if (d < 0 || d > 9) {
                printf("bad digit in row %d\n", r + 1);
                return 0;
            }
            if (d) {
                /* A clue that clashes with an earlier one means no
                   solution can exist. */
                if ((used_row[r] | used_col[c] | used_box[BOX(r, c)]) & (1 << d))
                    ok = 0;
                place(r, c, d);
            }
        }
    }
    printf("puzzle:\n");
    show();
    if (ok && solve(0)) {
        printf("solved after placing %ld digits:\n", tries);
        show();
    } else {
        printf("no solution\n");
    }
    return 0;
}
