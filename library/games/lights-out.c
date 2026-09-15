/*
 * title: Lights out
 * level: 2
 * about: Pressing a light on a 5x5 board flips it and its four neighbours; the puzzle is built by scrambling a dark board, so it can always be solved.
 * input: 1 1\n1 1\n7 2\n4 2\n2 4\n5 5\n3 3\n
 */
#include <stdio.h>

#define N 5

static int light[N][N];

/* Flip one light if it is on the board. x ^= 1 turns 0 into 1 and 1
   into 0: exclusive or with 1 is a toggle. */
static void flip(int r, int c)
{
    if (r >= 0 && r < N && c >= 0 && c < N)
        light[r][c] ^= 1;
}

static void press(int r, int c)
{
    flip(r, c);
    flip(r - 1, c);
    flip(r + 1, c);
    flip(r, c - 1);
    flip(r, c + 1);
}

static int lit(void)
{
    int r, c, n = 0;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            n += light[r][c];
    return n;
}

static void show(void)
{
    int r, c;

    printf("  1 2 3 4 5\n");
    for (r = 0; r < N; r++) {
        printf("%d", r + 1);
        for (c = 0; c < N; c++)
            printf(" %c", light[r][c] ? 'O' : '.');
        printf("\n");
    }
}

int main(void)
{
    int r, c, presses = 0;

    /* Scramble by pressing four squares. Pressing is its own undo and the
       order of presses does not matter, so pressing the same four again
       - in any order - switches everything off. */
    press(2, 2);
    press(3, 1);
    press(1, 3);
    press(4, 4);

    printf("Turn all the lights off. Press with: row col\n");
    show();
    while (lit() > 0) {
        if (scanf("%d %d", &r, &c) != 2) {
            printf("Gave up with %d lights on.\n", lit());
            return 0;
        }
        if (r < 1 || r > N || c < 1 || c > N) {
            printf("No light at %d %d.\n", r, c);
            continue;
        }
        press(r - 1, c - 1);
        presses++;
        printf("press %d %d -> %d lit\n", r, c, lit());
        show();
    }
    printf("All dark in %d presses.\n", presses);
    return 0;
}
