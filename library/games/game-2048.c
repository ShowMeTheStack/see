/*
 * title: 2048 sliding and merging
 * level: 3
 * about: Plays 2048 on a 4x4 grid from w, a, s, d moves, using one slide-and-merge routine for all four directions by walking each line through pointers.
 * input: a\na\nw\na\na\nd\ns\na\nw\na\ns\nd\na\n
 */
#include <stdio.h>
#include <stdlib.h>

#define N 4

static int board[N][N];
static long score = 0;

/* Slide one line of four towards line[0], merging equal neighbours once.
   The line is given as four POINTERS into the board, so the same code
   works on a row read left-to-right, a column read bottom-to-top, and so
   on. Returns 1 if anything moved. */
static int slide(int *line[N])
{
    int out[N] = { 0, 0, 0, 0 };
    int n = 0, i, moved = 0, merged_last = 0;

    for (i = 0; i < N; i++) {
        int v = *line[i];
        if (v == 0)
            continue;
        /* Merge with the previous tile only if it is equal and was not
           itself made by a merge this move: 2 2 4 becomes 4 4, not 8. */
        if (n > 0 && out[n - 1] == v && !merged_last) {
            out[n - 1] *= 2;
            score += out[n - 1];
            merged_last = 1;
        } else {
            out[n++] = v;
            merged_last = 0;
        }
    }
    for (i = 0; i < N; i++) {
        if (*line[i] != out[i])
            moved = 1;
        *line[i] = out[i];
    }
    return moved;
}

static int move(char dir)
{
    int *line[N];
    int k, i, moved = 0;

    for (k = 0; k < N; k++) {
        for (i = 0; i < N; i++) {
            switch (dir) {
            case 'a': line[i] = &board[k][i]; break;            /* left  */
            case 'd': line[i] = &board[k][N - 1 - i]; break;    /* right */
            case 'w': line[i] = &board[i][k]; break;            /* up    */
            default:  line[i] = &board[N - 1 - i][k]; break;    /* down  */
            }
        }
        moved |= slide(line);
    }
    return moved;
}

/* Put a 2 (or, one time in ten, a 4) on a random empty square. */
static void add_tile(void)
{
    int empty[N * N];
    int r, c, n = 0, pick;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            if (board[r][c] == 0)
                empty[n++] = r * N + c;
    if (n == 0)
        return;
    pick = empty[rand() % n];
    board[pick / N][pick % N] = rand() % 10 == 0 ? 4 : 2;
}

static void show(void)
{
    int r, c;

    for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++) {
            if (board[r][c])
                printf("%5d", board[r][c]);
            else
                printf("    .");
        }
        printf("\n");
    }
    printf("score %ld\n", score);
}

int main(void)
{
    char cmd;
    int best, r, c;

    srand(2048);
    add_tile();
    add_tile();
    show();
    while (scanf(" %c", &cmd) == 1) {
        if (cmd != 'w' && cmd != 'a' && cmd != 's' && cmd != 'd')
            continue;
        printf("\nmove %c\n", cmd);
        /* A move that changes nothing does not earn a new tile. */
        if (move(cmd))
            add_tile();
        else
            printf("(nothing moved)\n");
        show();
    }
    best = 0;
    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            if (board[r][c] > best)
                best = board[r][c];
    printf("biggest tile %d\n", best);
    return 0;
}
