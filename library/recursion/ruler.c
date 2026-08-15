/*
 * title: Drawing a ruler by halves
 * level: 2
 * about: Draws the tick marks of a ruler recursively, the middle mark longest and each half a smaller copy of the whole, and shows the same pattern sideways.
 */
#include <stdio.h>

#define LEN 32

char marks[LEN + 1];    /* the height of the tick at each position */
int calls = 0;

/* Mark the middle of [lo, hi] with height h, then do the same to each
   half with height h - 1. Height 0 is the base case: nothing to draw.
   The order of the two calls does not matter, because each half is
   independent: a sign the problem divides cleanly. */
void ruler(int lo, int hi, int h)
{
    int mid = (lo + hi) / 2;

    calls++;
    if (h == 0)
        return;
    marks[mid] = (char)h;
    ruler(lo, mid, h - 1);
    ruler(mid, hi, h - 1);
}

/* The same pattern printed as text, top to bottom: print the upper
   half, then the middle line, then the lower half. In-order, like
   walking a tree. */
void sideways(int h)
{
    int i;

    if (h == 0)
        return;
    sideways(h - 1);
    for (i = 0; i < h; i++)
        putchar('-');
    putchar('\n');
    sideways(h - 1);
}

int main(void)
{
    int i, row;

    for (i = 0; i <= LEN; i++)
        marks[i] = 0;
    marks[0] = marks[LEN] = 6;      /* the two ends */
    ruler(0, LEN, 5);

    /* Draw the ticks hanging down from the edge, tallest first. */
    for (i = 0; i <= LEN; i++)
        putchar('_');
    putchar('\n');
    for (row = 1; row <= 6; row++) {
        for (i = 0; i <= LEN; i++)
            putchar(marks[i] >= 7 - row ? '|' : ' ');
        putchar('\n');
    }
    printf("0               1/2             1\n");
    printf("%d calls to ruler\n\n", calls);

    sideways(4);
    return 0;
}
