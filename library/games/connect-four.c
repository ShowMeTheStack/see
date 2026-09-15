/*
 * title: Connect four with gravity
 * level: 3
 * about: Drops discs into a 6x7 grid against a computer that takes a winning column, blocks yours, or plays near the middle; wins are found by counting outward from the last disc.
 * input: 4\n9\n6\n5\n7\n
 */
#include <stdio.h>

#define ROWS 6
#define COLS 7

static char grid[ROWS][COLS];   /* row 0 is the top */

static void show(void)
{
    int r, c;

    for (r = 0; r < ROWS; r++) {
        printf("|");
        for (c = 0; c < COLS; c++)
            printf("%c", grid[r][c]);
        printf("|\n");
    }
    printf("+-------+\n 1234567\n");
}

/* Gravity: the disc falls to the lowest empty row. Returns that row,
   or -1 if the column is full. */
static int drop(int c, char who)
{
    int r;

    for (r = ROWS - 1; r >= 0; r--) {
        if (grid[r][c] == ' ') {
            grid[r][c] = who;
            return r;
        }
    }
    return -1;
}

static void undrop(int c)
{
    int r;

    for (r = 0; r < ROWS; r++) {
        if (grid[r][c] != ' ') {
            grid[r][c] = ' ';
            return;
        }
    }
}

/* Count discs like (r,c) in direction (dr,dc), not counting (r,c). */
static int run(int r, int c, int dr, int dc)
{
    int n = 0;
    char who = grid[r][c];

    r += dr;
    c += dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] == who) {
        n++;
        r += dr;
        c += dc;
    }
    return n;
}

/* Only the newest disc can have made a new line of four, so look in
   four directions through it: each line is "count one way + count the
   other way + the disc itself". */
static int wins_at(int r, int c)
{
    static const int dir[4][2] = { { 0, 1 }, { 1, 0 }, { 1, 1 }, { 1, -1 } };
    int d;

    for (d = 0; d < 4; d++)
        if (1 + run(r, c, dir[d][0], dir[d][1]) + run(r, c, -dir[d][0], -dir[d][1]) >= 4)
            return 1;
    return 0;
}

/* Try a move, see if it wins, take it back. */
static int would_win(int c, char who)
{
    int r = drop(c, who), w;

    if (r < 0)
        return 0;
    w = wins_at(r, c);
    undrop(c);
    return w;
}

static int computer(void)
{
    static const int order[COLS] = { 3, 2, 4, 1, 5, 0, 6 };
    int c;

    for (c = 0; c < COLS; c++)
        if (would_win(c, 'O'))
            return c;
    for (c = 0; c < COLS; c++)
        if (would_win(c, 'X'))
            return c;
    for (c = 0; c < COLS; c++)
        if (grid[0][order[c]] == ' ')
            return order[c];
    return -1;
}

int main(void)
{
    int r, c, moves = 0, col;

    for (r = 0; r < ROWS; r++)
        for (c = 0; c < COLS; c++)
            grid[r][c] = ' ';

    show();
    while (moves < ROWS * COLS) {
        printf("Your column (1-7): ");
        if (scanf("%d", &col) != 1) {
            printf("\nNo more moves.\n");
            return 0;
        }
        printf("%d\n", col);
        if (col < 1 || col > COLS || (r = drop(col - 1, 'X')) < 0) {
            printf("You cannot play there.\n");
            continue;
        }
        moves++;
        if (wins_at(r, col - 1)) {
            show();
            printf("Four in a row - you win!\n");
            return 0;
        }
        c = computer();
        r = drop(c, 'O');
        moves++;
        printf("Computer drops into column %d.\n", c + 1);
        show();
        if (wins_at(r, c)) {
            printf("The computer connects four.\n");
            return 0;
        }
    }
    printf("The board is full: a draw.\n");
    return 0;
}
