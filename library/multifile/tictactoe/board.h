/* board.h - the 3x3 grid and nothing else: no rules, no strategy. */
#ifndef BOARD_H
#define BOARD_H

#define EMPTY ' '

typedef struct {
    char cell[9];   /* squares 1..9 are cell[0]..cell[8], row by row */
} Board;

void board_clear(Board *b);
int board_place(Board *b, int square, char mark);   /* square is 1..9 */
void board_undo(Board *b, int square);
char board_at(const Board *b, int square);
void board_print(const Board *b);

#endif
