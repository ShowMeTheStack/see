#include <stdio.h>
#include "board.h"

void board_clear(Board *b)
{
    int i;
    for (i = 0; i < 9; i++) {
        b->cell[i] = EMPTY;
    }
}

int board_place(Board *b, int square, char mark)
{
    if (square < 1 || square > 9 || b->cell[square - 1] != EMPTY) {
        return 0;
    }
    b->cell[square - 1] = mark;
    return 1;
}

void board_undo(Board *b, int square)
{
    b->cell[square - 1] = EMPTY;
}

char board_at(const Board *b, int square)
{
    return b->cell[square - 1];
}

/* Empty squares show their number, so the player knows what to type. */
void board_print(const Board *b)
{
    int r, c;
    char ch;

    for (r = 0; r < 3; r++) {
        printf(" ");
        for (c = 0; c < 3; c++) {
            ch = b->cell[r * 3 + c];
            printf(" %c ", ch == EMPTY ? '1' + r * 3 + c : ch);
            if (c < 2) {
                printf("|");
            }
        }
        printf("\n");
        if (r < 2) {
            printf(" ---+---+---\n");
        }
    }
}
