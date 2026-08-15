/*
 * title: Sierpinski triangle from three smaller copies
 * level: 3
 * about: Draws the Sierpinski triangle on a character canvas by recursively drawing three half-size triangles inside each triangle.
 */
#include <stdio.h>

#define ORDER 4
#define H (1 << ORDER)           /* 16 rows */
#define W (2 * H)                /* 32 columns plus a terminator */

char canvas[H][W + 1];
int drawn = 0;

/* A triangle of a given order with its top tip at (row, col):
   order 0 is a single small "/\" tile. Anything bigger is three
   triangles of the order below: one on top, two side by side under it.
   Nothing is ever drawn except at order 0; the shape appears purely
   from where the recursion puts the tiles. */
void triangle(int order, int row, int col)
{
    int half;

    if (order == 0) {
        canvas[row][col - 1] = '/';
        canvas[row][col] = '\\';
        drawn++;
        return;
    }
    half = 1 << (order - 1);                     /* height of a sub-triangle */
    triangle(order - 1, row, col);               /* top */
    triangle(order - 1, row + half, col - half); /* bottom left */
    triangle(order - 1, row + half, col + half); /* bottom right */
}

int main(void)
{
    int r, c;

    for (r = 0; r < H; r++) {
        for (c = 0; c < W; c++)
            canvas[r][c] = ' ';
        canvas[r][W] = '\0';
    }

    /* The tip sits in the middle of the top row. */
    triangle(ORDER, 0, H);

    for (r = 0; r < H; r++)
        printf("%s\n", canvas[r]);
    printf("%d tiles drawn: 3^%d\n", drawn, ORDER);
    return 0;
}
