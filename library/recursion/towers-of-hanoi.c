/*
 * title: Towers of Hanoi
 * level: 2
 * about: Solves the Towers of Hanoi recursively and draws the three pegs after every move.
 */
#include <stdio.h>

#define DISCS 4

/* The pegs are three small stacks of disc sizes. height[p] is how many
   discs peg p holds. */
int peg[3][DISCS];
int height[3];
int moves = 0;

void show(void)
{
    int level, p, w;

    for (level = DISCS - 1; level >= 0; level--) {
        for (p = 0; p < 3; p++) {
            w = level < height[p] ? peg[p][level] : 0;
            printf("  %*s%.*s|%.*s%*s", DISCS - w, "", w, "####", w, "####", DISCS - w, "");
        }
        printf("\n");
    }
    printf("------A----------B----------C-----\n");
}

void move_disc(int from, int to)
{
    int disc = peg[from][--height[from]];

    peg[to][height[to]++] = disc;
    moves++;
    printf("move %d: disc %d from %c to %c\n", moves, disc, 'A' + from, 'A' + to);
    show();
}

/* To move n discs from 'from' to 'to':
   1. move the top n-1 out of the way onto the spare peg,
   2. move the biggest disc across,
   3. move the n-1 back on top of it.
   Steps 1 and 3 are the same problem, only smaller. Look at the call
   stack in See: each frame has its own n, from and to, and the roles
   of the pegs swap at every level. */
void hanoi(int n, int from, int to, int spare)
{
    if (n == 0)
        return;
    hanoi(n - 1, from, spare, to);
    move_disc(from, to);
    hanoi(n - 1, spare, to, from);
}

int main(void)
{
    int i;

    for (i = 0; i < DISCS; i++)
        peg[0][i] = DISCS - i;   /* biggest at the bottom */
    height[0] = DISCS;
    height[1] = height[2] = 0;

    show();
    hanoi(DISCS, 0, 2, 1);
    printf("%d discs moved in %d moves (2^%d - 1)\n", DISCS, moves, DISCS);
    return 0;
}
