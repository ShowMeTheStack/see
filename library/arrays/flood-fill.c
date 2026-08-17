/*
 * title: Flood fill a paint bucket
 * level: 4
 * about: Fills a closed region of a text picture recursively, like a paint bucket tool, and counts how deep the recursion went.
 */
#include <stdio.h>
#include <string.h>

#define H 9
#define W 16

/* The starting picture, kept as read-only string literals. */
static const char *start[H] = {
    "................",
    "..#######.......",
    "..#.....#..###..",
    "..#.###.#..#.#..",
    "..#.#.#.####.#..",
    "..#.###......#..",
    "..#..........#..",
    "..############..",
    "................"
};

/* The picture being painted: a global 2D array, so every level of the
   recursion reaches the same cells. Each row has room for its NUL. */
static char pic[H][W + 1];

static int depth = 0, deepest = 0, painted = 0;

/* Paint (r, c) and spread to its four neighbours. The checks at the top
   are the whole stopping rule: off the picture, a wall, or already painted.
   Step into this function a few times (F11) and watch the call stack grow
   one frame per cell; deepest records how tall it got. */
static void fill(int r, int c, char from, char to)
{
    if (r < 0 || r >= H || c < 0 || c >= W)
        return;
    if (pic[r][c] != from)
        return;
    pic[r][c] = to;
    painted++;
    depth++;
    if (depth > deepest)
        deepest = depth;
    fill(r - 1, c, from, to);
    fill(r + 1, c, from, to);
    fill(r, c - 1, from, to);
    fill(r, c + 1, from, to);
    depth--;
}

static void show(void)
{
    int r;
    for (r = 0; r < H; r++)
        printf("  %s\n", pic[r]);
}

int main(void)
{
    int r;
    for (r = 0; r < H; r++)
        strcpy(pic[r], start[r]);   /* copy the literals into writable memory */
    show();
    /* Paint inside the big shape. The small box at (4,5) has its own wall,
       so the paint flows around it but never in. */
    fill(3, 3, '.', 'o');
    printf("painted %d cells, recursion %d calls deep\n", painted, deepest);
    show();
    /* A second bucket on the tiny hole in the middle. */
    painted = deepest = 0;
    fill(4, 5, '.', '@');
    printf("painted %d cell\n", painted);
    show();
    return 0;
}
