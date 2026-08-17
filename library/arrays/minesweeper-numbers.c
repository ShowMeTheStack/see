/*
 * title: Minesweeper clue numbers
 * level: 3
 * about: Takes a grid of mines and works out the number shown in every safe square, using a border of padding to avoid edge checks.
 */
#include <stdio.h>
#include <string.h>

#define H 6
#define W 8

int main(void)
{
    /* The field as strings, one per row. Each literal has W letters and a
       NUL, so a row needs W + 1 chars. */
    const char field[H][W + 1] = {
        "*.......",
        "....*...",
        "..*.....",
        ".....**.",
        "........",
        "*......*"
    };
    /* A count grid two bigger in each direction. Mine (r, c) lives at
       (r+1, c+1), so every neighbour of a real square exists, even at the
       corners. A few wasted bytes buy code with no edge tests at all. */
    int mines[H + 2][W + 2];
    int r, c, dr, dc, n;

    memset(mines, 0, sizeof mines);
    for (r = 0; r < H; r++)
        for (c = 0; c < W; c++)
            mines[r + 1][c + 1] = field[r][c] == '*';

    for (r = 1; r <= H; r++) {
        for (c = 1; c <= W; c++) {
            if (mines[r][c]) {
                putchar('*');
                continue;
            }
            n = 0;
            for (dr = -1; dr <= 1; dr++)
                for (dc = -1; dc <= 1; dc++)
                    n += mines[r + dr][c + dc];   /* the centre is 0, so no need to skip it */
            putchar(n ? '0' + n : '.');
        }
        putchar('\n');
    }
    return 0;
}
