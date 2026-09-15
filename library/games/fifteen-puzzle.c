/*
 * title: The fifteen puzzle, sliding tiles
 * level: 2
 * about: Shuffles a 4x4 sliding puzzle with legal random moves and lets you slide tiles into the gap by typing tile numbers.
 * input: 15\n12\n6\n8\n7\n3\n2\n1\n5\n9\n13\n14\n15\n
 */
#include <stdio.h>
#include <stdlib.h>

#define N 4

static int tile[N][N];      /* 0 is the gap */
static int gap_r, gap_c;

static void show(void)
{
    int r, c;

    for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++) {
            if (tile[r][c])
                printf("%3d", tile[r][c]);
            else
                printf("   ");
        }
        printf("\n");
    }
}

/* Slide the tile at (r,c) into the gap if they are side by side. */
static int slide_from(int r, int c)
{
    int dr = r - gap_r, dc = c - gap_c;

    if (r < 0 || r >= N || c < 0 || c >= N)
        return 0;
    if (dr * dr + dc * dc != 1)     /* exactly one step away */
        return 0;
    tile[gap_r][gap_c] = tile[r][c];
    tile[r][c] = 0;
    gap_r = r;
    gap_c = c;
    return 1;
}

static int solved(void)
{
    int r, c;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            if (tile[r][c] != (r * N + c + 1) % (N * N))
                return 0;
    return 1;
}

int main(void)
{
    static const int dr[4] = { -1, 1, 0, 0 }, dc[4] = { 0, 0, -1, 1 };
    int r, c, k, t, moves = 0, found, last;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            tile[r][c] = (r * N + c + 1) % (N * N);
    gap_r = N - 1;
    gap_c = N - 1;

    /* Shuffle by making random LEGAL slides. Putting the numbers in a
       random order instead would give an unsolvable puzzle half the time
       - Sam Loyd's famous 14-15 prize puzzle was exactly that. */
    srand(15);
    last = -1;
    for (k = 0; k < 12; k++) {
        t = rand() % 4;
        /* t ^ 1 is the opposite direction (0<->1, 2<->3): skip it, or the
           shuffle would keep undoing itself. */
        if (t == (last ^ 1) || !slide_from(gap_r + dr[t], gap_c + dc[t]))
            k--;            /* off the edge or a step back: try again */
        else
            last = t;
    }

    show();
    while (!solved()) {
        printf("slide which tile? ");
        if (scanf("%d", &t) != 1) {
            printf("\nstopped\n");
            return 0;
        }
        printf("%d\n", t);
        /* Find the tile next to the gap with that number. */
        found = 0;
        for (k = 0; k < 4 && !found; k++) {
            r = gap_r + dr[k];
            c = gap_c + dc[k];
            if (r >= 0 && r < N && c >= 0 && c < N && tile[r][c] == t)
                found = slide_from(r, c);
        }
        if (!found) {
            printf("%d is not next to the gap\n", t);
            continue;
        }
        moves++;
        show();
    }
    printf("Solved in %d moves!\n", moves);
    return 0;
}
