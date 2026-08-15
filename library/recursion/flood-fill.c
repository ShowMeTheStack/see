/*
 * title: Flood fill on a picture grid
 * level: 3
 * about: Paints connected regions of a small character picture with a recursive four-way flood fill, the way a paint bucket tool works.
 */
#include <stdio.h>

#define ROWS 9
#define COLS 20

char picture[ROWS][COLS + 1] = {
    "....................",
    "..#######.....###...",
    "..#.....#....#...#..",
    "..#..#..#....#...#..",
    "..#.....######...#..",
    "..#######.....###...",
    ".........##.........",
    "...#####...#..####..",
    "...#...#....#.#..#.."
};

int deepest = 0;

/* Paint the cell at (r, c) if it has the old colour, then ask the four
   neighbours to do the same. A cell that is off the grid, a wall, or
   already painted stops the call at once: those are the base cases.
   Painting before recursing is what stops the calls running in circles. */
void fill(int r, int c, char from, char to, int depth)
{
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS)
        return;
    if (picture[r][c] != from)
        return;
    picture[r][c] = to;
    if (depth > deepest)
        deepest = depth;
    fill(r - 1, c, from, to, depth + 1);   /* up */
    fill(r + 1, c, from, to, depth + 1);   /* down */
    fill(r, c - 1, from, to, depth + 1);   /* left */
    fill(r, c + 1, from, to, depth + 1);   /* right */
}

int count(char ch)
{
    int r, c, n = 0;

    for (r = 0; r < ROWS; r++)
        for (c = 0; c < COLS; c++)
            n += picture[r][c] == ch;
    return n;
}

void show(const char *title)
{
    int r;

    printf("%s\n", title);
    for (r = 0; r < ROWS; r++)
        printf("  %s\n", picture[r]);
}

int main(void)
{
    show("before:");

    /* Inside the left box only. Watch the globals view: the picture
       array changes one cell per call, while the stack view shows how
       far the fill has wandered from where it began. */
    deepest = 0;
    fill(3, 3, '.', 'o', 1);
    show("after filling inside the left box:");
    printf("cells painted: %d, deepest recursion: %d\n", count('o'), deepest);

    /* The outside: everything reachable from the corner. */
    deepest = 0;
    fill(0, 0, '.', ' ', 1);
    show("after filling the outside with spaces:");
    printf("deepest recursion: %d\n", deepest);

    /* Recolour a wall: walls are a region too. */
    fill(1, 2, '#', '=', 1);
    show("left box wall recoloured (it touches the middle box):");
    return 0;
}
