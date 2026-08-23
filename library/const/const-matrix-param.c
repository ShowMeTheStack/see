/*
 * title: const and two-dimensional arrays
 * level: 3
 * about: Passes a game board to read-only helpers and meets the C rule that int (*)[3] does not quietly become const int (*)[3].
 */
#include <stdio.h>

#define N 3

/*
 * The natural signature for a read-only board would be
 *     int winner(const char board[N][N]);
 * that is, a pointer to arrays of const char. But in C89 the const
 * belongs to the elements of the row, not to the row pointer, and the
 * automatic "add const" conversion only works one level deep. Passing a
 * plain char[N][N] then warns:
 *     passing argument from incompatible pointer type
 *     ('char (*)[3]' to 'const char (*)[3]')
 * Two clean ways out are shown here.
 */

/* Way 1: take a pointer to the first char and do the row arithmetic yourself. */
char at(const char *cells, int r, int c)
{
    return cells[r * N + c];
}

int line(const char *cells, int r0, int c0, int dr, int dc)
{
    char first = at(cells, r0, c0);
    int k;
    if (first == '.')
        return 0;
    for (k = 1; k < N; k++)
        if (at(cells, r0 + k * dr, c0 + k * dc) != first)
            return 0;
    return first;
}

char winner(const char *cells)
{
    int i, w;
    for (i = 0; i < N; i++) {
        if ((w = line(cells, i, 0, 0, 1)) != 0) return (char)w;   /* rows */
        if ((w = line(cells, 0, i, 1, 0)) != 0) return (char)w;   /* columns */
    }
    if ((w = line(cells, 0, 0, 1, 1)) != 0) return (char)w;
    if ((w = line(cells, 0, N - 1, 1, -1)) != 0) return (char)w;
    return 0;
}

/* Way 2: keep the 2D type and add the const with an explicit cast at the call. */
void show(const char (*b)[N])
{
    int r, c;
    for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++)
            printf(" %c", b[r][c]);
        printf("\n");
    }
}

int main(void)
{
    char board[N][N];
    int moves[7][2];
    int i, r, c;
    char w;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            board[r][c] = '.';

    moves[0][0] = 1; moves[0][1] = 1;   /* X */
    moves[1][0] = 0; moves[1][1] = 0;   /* O */
    moves[2][0] = 0; moves[2][1] = 2;   /* X */
    moves[3][0] = 2; moves[3][1] = 2;   /* O */
    moves[4][0] = 1; moves[4][1] = 0;   /* X */
    moves[5][0] = 1; moves[5][1] = 2;   /* O */
    moves[6][0] = 2; moves[6][1] = 0;   /* X completes the other diagonal */

    for (i = 0; i < 7; i++) {
        board[moves[i][0]][moves[i][1]] = (i % 2 == 0) ? 'X' : 'O';
        w = winner(&board[0][0]);
        if (w != 0) {
            printf("move %d: %c wins\n", i + 1, w);
            break;
        }
    }
    if (i == 7)
        printf("no winner after 7 moves\n");

    show((const char (*)[N])board);
    return 0;
}
