/*
 * title: Copying arrays by wrapping them in a struct
 * level: 1
 * about: Shows that arrays cannot be assigned but a struct containing an array can, and uses that to save and restore a game board.
 */
#include <stdio.h>

/* You cannot write board_a = board_b when they are plain arrays. Put the
   array in a struct, though, and assignment copies all of it, byte for
   byte. Passing and returning by value copies it too. */
struct board {
    char cell[3][3];
};

void print_board(const char *title, struct board b)
{
    int r;
    printf("%s\n", title);
    for (r = 0; r < 3; r++)
        printf("  %c|%c|%c\n", b.cell[r][0], b.cell[r][1], b.cell[r][2]);
}

struct board empty_board(void)
{
    struct board b;
    int r, c;
    for (r = 0; r < 3; r++)
        for (c = 0; c < 3; c++)
            b.cell[r][c] = '.';
    return b;      /* the whole 9-byte array travels back to the caller */
}

int main(void)
{
    struct board game = empty_board();
    struct board saved;

    game.cell[1][1] = 'X';
    game.cell[0][2] = 'O';
    print_board("game so far:", game);

    /* Take a snapshot. In the memory picture, saved is now a second,
       independent copy; the two boxes do not point at each other. */
    saved = game;

    game.cell[0][0] = 'X';
    game.cell[2][2] = 'O';
    print_board("after two more moves:", game);

    /* Undo by copying the snapshot back. */
    game = saved;
    print_board("after undo:", game);

    printf("sizeof(struct board) = %d\n", (int)sizeof(struct board));
    return 0;
}
