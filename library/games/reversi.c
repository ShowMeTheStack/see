/*
 * title: Reversi on a 6x6 board
 * level: 4
 * about: Plays reversi (Othello) against a greedy computer; one direction table drives move checking, flipping and the list of legal moves, and passes are handled when a side is stuck.
 * input: f6\nd5\nc2\ne6\nf3\na3\nb5\na1\nb1\nc5\na5\ne4\ne2\nf5\ne5\ne1\nb4\nb6\n
 */
#include <stdio.h>
#include <ctype.h>

#define N 6
#define EMPTY '.'

static char board[N][N];

/* The eight directions as (row step, column step) pairs. Every rule of
   the game is "walk in each of these directions and see what you meet". */
static const int dirs[8][2] = {
    { -1, -1 }, { -1, 0 }, { -1, 1 }, { 0, -1 },
    { 0, 1 }, { 1, -1 }, { 1, 0 }, { 1, 1 }
};

static int on_board(int r, int c)
{
    return r >= 0 && r < N && c >= 0 && c < N;
}

/* How many discs would placing `me` at (r,c) flip? If doit is set, flip
   them as well. A direction counts only if it runs over one or more
   opponent discs and then reaches one of mine. */
static int flips(int r, int c, char me, int doit)
{
    char them = me == 'X' ? 'O' : 'X';
    int d, k, rr, cc, run, total = 0;

    if (board[r][c] != EMPTY)
        return 0;
    for (d = 0; d < 8; d++) {
        rr = r + dirs[d][0];
        cc = c + dirs[d][1];
        run = 0;
        while (on_board(rr, cc) && board[rr][cc] == them) {
            rr += dirs[d][0];
            cc += dirs[d][1];
            run++;
        }
        if (run > 0 && on_board(rr, cc) && board[rr][cc] == me) {
            total += run;
            if (doit)
                for (k = 1; k <= run; k++)
                    board[r + k * dirs[d][0]][c + k * dirs[d][1]] = me;
        }
    }
    if (doit && total > 0)
        board[r][c] = me;
    return total;
}

static int has_move(char me)
{
    int r, c;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            if (flips(r, c, me, 0) > 0)
                return 1;
    return 0;
}

static void show(void)
{
    int r, c, x = 0, o = 0;

    printf("  a b c d e f\n");
    for (r = 0; r < N; r++) {
        printf("%d", r + 1);
        for (c = 0; c < N; c++) {
            printf(" %c", board[r][c]);
            x += board[r][c] == 'X';
            o += board[r][c] == 'O';
        }
        printf("\n");
    }
    printf("X %d  O %d\n", x, o);
}

static void list_moves(char me)
{
    int r, c;

    printf("legal:");
    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            if (flips(r, c, me, 0) > 0)
                printf(" %c%d", 'a' + c, r + 1);
    printf("\n");
}

/* Greedy: take the move that flips the most discs right now. Corners
   are worth a lot in real play, so they get a bonus. */
static void computer(void)
{
    int r, c, n, best = -1, br = 0, bc = 0;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++) {
            n = flips(r, c, 'O', 0);
            if (n == 0)
                continue;
            if ((r == 0 || r == N - 1) && (c == 0 || c == N - 1))
                n += 10;
            if (n > best) {
                best = n;
                br = r;
                bc = c;
            }
        }
    printf("Computer plays %c%d and flips %d.\n", 'a' + bc, br + 1, flips(br, bc, 'O', 1));
}

int main(void)
{
    char move[8];
    int r, c, n, x, o;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            board[r][c] = EMPTY;
    board[2][2] = board[3][3] = 'O';
    board[2][3] = board[3][2] = 'X';

    show();
    while (has_move('X') || has_move('O')) {
        if (!has_move('X')) {
            printf("You have no move and must pass.\n");
        } else {
            list_moves('X');
            if (scanf("%7s", move) != 1) {
                printf("stopped\n");
                return 0;
            }
            c = tolower((unsigned char)move[0]) - 'a';
            r = move[1] - '1';
            if (!on_board(r, c) || move[2] != '\0' || (n = flips(r, c, 'X', 1)) == 0) {
                printf("%s is not a legal move.\n", move);
                continue;
            }
            printf("You play %s and flip %d.\n", move, n);
        }
        if (has_move('O'))
            computer();
        else
            printf("The computer has no move and passes.\n");
        show();
    }

    x = o = 0;
    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++) {
            x += board[r][c] == 'X';
            o += board[r][c] == 'O';
        }
    printf("Game over: X %d, O %d. %s\n", x, o,
           x > o ? "You win!" : x < o ? "The computer wins." : "A draw.");
    return 0;
}
