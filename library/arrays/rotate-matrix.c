/*
 * title: Rotate a square grid 90 degrees
 * level: 3
 * about: Rotates a 4x4 picture clockwise in place, first by transpose and mirror, then by four-way ring swaps.
 */
#include <stdio.h>

#define N 4

static void show(char g[N][N], const char *label)
{
    int r, c;
    printf("%s\n", label);
    for (r = 0; r < N; r++) {
        printf("  ");
        for (c = 0; c < N; c++)
            putchar(g[r][c]);
        putchar('\n');
    }
}

/* Method 1: a clockwise turn equals "swap across the main diagonal" then
   "reverse each row". Each step is easy to check on its own. */
static void rotate_two_steps(char g[N][N])
{
    int r, c;
    char t;
    for (r = 0; r < N; r++)
        for (c = r + 1; c < N; c++) {   /* c > r: visit each pair once */
            t = g[r][c]; g[r][c] = g[c][r]; g[c][r] = t;
        }
    for (r = 0; r < N; r++)
        for (c = 0; c < N / 2; c++) {
            t = g[r][c]; g[r][c] = g[r][N - 1 - c]; g[r][N - 1 - c] = t;
        }
}

/* Method 2: move four cells at once around each ring, like turning the
   outer frame of a picture and then the inner frame. */
static void rotate_rings(char g[N][N])
{
    int layer, i, last;
    char t;
    for (layer = 0; layer < N / 2; layer++) {
        last = N - 1 - layer;
        for (i = layer; i < last; i++) {
            int off = i - layer;
            t = g[layer][i];                         /* save top */
            g[layer][i] = g[last - off][layer];      /* left   -> top */
            g[last - off][layer] = g[last][last - off]; /* bottom -> left */
            g[last][last - off] = g[i][last];        /* right  -> bottom */
            g[i][last] = t;                          /* top    -> right */
        }
    }
}

int main(void)
{
    /* Initialised one row at a time; no NUL is stored because each row is
       exactly N chars, so these are not strings, only grids of letters. */
    char g[N][N] = { { 'A', 'B', 'C', 'D' },
                     { 'E', 'F', 'G', 'H' },
                     { 'I', 'J', 'K', 'L' },
                     { 'M', 'N', 'O', 'P' } };

    show(g, "start");
    rotate_two_steps(g);
    show(g, "after transpose + mirror");
    rotate_rings(g);
    show(g, "after one more turn by rings (180 degrees in all)");
    rotate_rings(g);
    rotate_rings(g);
    show(g, "two more turns: back where it began");
    return 0;
}
