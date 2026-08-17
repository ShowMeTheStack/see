/*
 * title: Conway's Game of Life
 * level: 3
 * about: Runs a glider and a blinker on a 10x12 board for eight generations, printing each one as text.
 */
#include <stdio.h>
#include <string.h>

#define H 10
#define W 12

/* Count the live neighbours of (r, c). Cells beyond the edge count as dead,
   so the test r+dr >= 0 etc. keeps every read inside the array. */
static int neighbours(char b[H][W], int r, int c)
{
    int dr, dc, rr, cc, n = 0;
    for (dr = -1; dr <= 1; dr++)
        for (dc = -1; dc <= 1; dc++) {
            if (dr == 0 && dc == 0)
                continue;          /* a cell is not its own neighbour */
            rr = r + dr;
            cc = c + dc;
            if (rr >= 0 && rr < H && cc >= 0 && cc < W && b[rr][cc])
                n++;
        }
    return n;
}

/* The new generation must be built in a second board. Updating in place
   would let cells already changed this turn affect their neighbours. */
static void step(char cur[H][W], char next[H][W])
{
    int r, c, n;
    for (r = 0; r < H; r++)
        for (c = 0; c < W; c++) {
            n = neighbours(cur, r, c);
            next[r][c] = (char)(n == 3 || (n == 2 && cur[r][c]));
        }
}

static void print(char b[H][W], int gen)
{
    int r, c;
    printf("generation %d\n", gen);
    for (r = 0; r < H; r++) {
        for (c = 0; c < W; c++)
            putchar(b[r][c] ? '#' : '.');
        putchar('\n');
    }
}

int main(void)
{
    char a[H][W], b[H][W];
    int gen;

    memset(a, 0, sizeof a);   /* sizeof a is 120: the whole board */
    /* glider, top left: it crawls one cell down and right every 4 turns */
    a[0][1] = 1;
    a[1][2] = 1;
    a[2][0] = a[2][1] = a[2][2] = 1;
    /* blinker, right side: flips between across and down */
    a[5][8] = a[5][9] = a[5][10] = 1;

    for (gen = 0; gen < 8; gen++) {
        if (gen % 4 == 0)
            print(a, gen);
        step(a, b);
        /* Copy the new board back. Both boards live in main's frame; look
           at the stack picture to see two 120-byte blocks side by side. */
        memcpy(a, b, sizeof a);
    }
    print(a, gen);
    return 0;
}
