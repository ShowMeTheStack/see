/*
 * title: A glider on a wrap-around Life board
 * level: 2
 * about: Runs Conway's Game of Life on an 8x8 board whose edges wrap, swapping two grids through pointers, until a glider travels all the way round and home.
 * input: 32 4\n
 */
#include <stdio.h>

#define N 8

static char a[N][N], b[N][N];

/* cur and nxt point at whole rows of N chars: char (*)[N]. After each
   generation they swap, so the two arrays take turns being "now" and
   "next" and nothing is ever copied. Watch the two arrows trade places. */
static char (*cur)[N] = a;
static char (*nxt)[N] = b;

static int neighbours(int r, int c)
{
    int dr, dc, n = 0;

    for (dr = -1; dr <= 1; dr++)
        for (dc = -1; dc <= 1; dc++)
            if (dr || dc)
                /* + N before % N keeps -1 from staying negative: the
                   row above row 0 is row N-1. That is the wrap-around. */
                n += cur[(r + dr + N) % N][(c + dc + N) % N];
    return n;
}

static void step(void)
{
    char (*t)[N];
    int r, c, n;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++) {
            n = neighbours(r, c);
            /* Born with exactly 3, survives with 2 or 3, else dies. */
            nxt[r][c] = (char)(n == 3 || (n == 2 && cur[r][c]));
        }
    t = cur;
    cur = nxt;
    nxt = t;
}

static void show(int gen)
{
    int r, c;

    printf("generation %d\n", gen);
    for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++)
            printf("%c", cur[r][c] ? '#' : '.');
        printf("\n");
    }
}

int main(void)
{
    char start[N][N];
    int gens, every, g, r, c, home;

    /* The glider:  .#.
                    ..#
                    ###   it moves one square down-right every 4 steps. */
    cur[0][1] = 1;
    cur[1][2] = 1;
    cur[2][0] = cur[2][1] = cur[2][2] = 1;
    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            start[r][c] = cur[r][c];

    /* How many generations to run, and how often to print one. */
    if (scanf("%d %d", &gens, &every) != 2 || gens < 0 || every < 1) {
        gens = 32;
        every = 4;
    }
    show(0);
    for (g = 1; g <= gens; g++) {
        step();
        if (g % every == 0)
            show(g);
    }

    home = 1;
    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            if (cur[r][c] != start[r][c])
                home = 0;
    if (home)
        printf("Back to the start after %d generations: 8 moves of one\n"
               "square, 4 generations each, take it once round the board.\n", gens);
    else
        printf("After %d generations the glider is still travelling.\n", gens);
    return 0;
}
