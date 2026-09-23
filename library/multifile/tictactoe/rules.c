/* rules.c - all the game knowledge lives here. The eight winning lines are
 * a table, so checking for a win is one loop rather than eight ifs. */
#include "rules.h"

static const int lines[8][3] = {
    {1, 2, 3}, {4, 5, 6}, {7, 8, 9},    /* rows */
    {1, 4, 7}, {2, 5, 8}, {3, 6, 9},    /* columns */
    {1, 5, 9}, {3, 5, 7}                /* diagonals */
};

char rules_winner(const Board *b)
{
    int i;
    char a;

    for (i = 0; i < 8; i++) {
        a = board_at(b, lines[i][0]);
        if (a != EMPTY && a == board_at(b, lines[i][1]) && a == board_at(b, lines[i][2])) {
            return a;
        }
    }
    return EMPTY;
}

int rules_full(const Board *b)
{
    int s;
    for (s = 1; s <= 9; s++) {
        if (board_at(b, s) == EMPTY) {
            return 0;
        }
    }
    return 1;
}

/* Try mark on every free square; return the first that wins, else 0.
 * It really places the mark and takes it back: watch the board in See. */
static int find_win(Board *b, char mark)
{
    int s;
    char w;

    for (s = 1; s <= 9; s++) {
        if (board_place(b, s, mark)) {
            w = rules_winner(b);
            board_undo(b, s);
            if (w == mark) {
                return s;
            }
        }
    }
    return 0;
}

/* A simple, decent strategy: win if possible, else block, else take the
 * centre, else a corner, else anything. */
int rules_best_move(Board *b, char me, char them)
{
    static const int prefer[9] = { 5, 1, 3, 7, 9, 2, 4, 6, 8 };
    int s, i;

    s = find_win(b, me);
    if (s) {
        return s;
    }
    s = find_win(b, them);
    if (s) {
        return s;
    }
    for (i = 0; i < 9; i++) {
        if (board_at(b, prefer[i]) == EMPTY) {
            return prefer[i];
        }
    }
    return 0;
}
