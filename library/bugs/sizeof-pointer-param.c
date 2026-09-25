/*
 * title: sizeof on an array parameter
 * level: 2
 * about: Clears each row of a noughts-and-crosses board with memset(row, '.', sizeof row) inside a function.
 * expect: fault
 */

/*
 * THE PUZZLE
 * clear_row() is declared to take char row[3], and memset fills
 * sizeof row bytes. In main, sizeof board[0] would be 3. Inside
 * clear_row, is row really an array?
 *
 * HOW TO HUNT IT WITH SEE
 * Step into clear_row (F11) and look at its frame: row is a 4-byte
 * pointer with an arrow into main's board, not a 3-byte array. In a
 * parameter list, "char row[3]" is just another way to write
 * "char *row", and the 3 is ignored. So sizeof row is 4.
 * Now watch the memory picture as you step over each memset: clearing
 * row 0 also writes a '.' into the first box of row 1; row 1 spills
 * into row 2; nobody notices, because those boxes are cleared anyway.
 * Row 2 spills past the end of the whole board, and See stops it.
 * The first two overruns are just as wrong; they are simply hidden.
 */
#include <stdio.h>
#include <string.h>

static void clear_row(char row[3])
{
    memset(row, '.', sizeof row);
}

int main(void)
{
    char board[3][3];
    int r, c;

    for (r = 0; r < 3; r++)
        clear_row(board[r]);
    board[1][1] = 'X';

    for (r = 0; r < 3; r++) {
        for (c = 0; c < 3; c++)
            putchar(board[r][c]);
        putchar('\n');
    }
    return 0;
}

/*
 * THE FIX
 * Pass the length, or use a size the function knows for itself:
 *
 *     static void clear_row(char *row, size_t n) { memset(row, '.', n); }
 *     ...
 *     clear_row(board[r], sizeof board[r]);
 *
 * sizeof gives the size of an array only where the array itself is in
 * scope. Once it has been passed to a function, all that arrives is a
 * pointer.
 */
