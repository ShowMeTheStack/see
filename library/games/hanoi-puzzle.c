/*
 * title: Towers of Hanoi, played by hand
 * level: 2
 * about: You move disks between three pegs kept as array stacks, the program refuses a big disk on a small one, and counts your moves against the best possible 2^n - 1.
 * input: 1 3\n1 3\n1 2\n3 2\n1 3\n2 2\n2 1\n2 3\n1 3\n
 */
#include <stdio.h>

#define DISKS 3

/* Each peg is a little stack: disk sizes from the bottom up, and a
   height. The top disk is peg[p][height[p] - 1]. */
static int peg[3][DISKS];
static int height[3];

static void show(void)
{
    int level, p;

    for (level = DISKS - 1; level >= 0; level--) {
        for (p = 0; p < 3; p++) {
            if (level < height[p])
                printf("   [%d]   ", peg[p][level]);
            else
                printf("    |    ");
        }
        printf("\n");
    }
    printf("  peg 1    peg 2    peg 3\n");
}

int main(void)
{
    int from, to, d, moves = 0;

    for (d = 0; d < DISKS; d++)
        peg[0][d] = DISKS - d;      /* biggest at the bottom */
    height[0] = DISKS;

    printf("Move all disks to peg 3. Type: from to\n");
    show();
    while (height[2] < DISKS) {
        if (scanf("%d %d", &from, &to) != 2) {
            printf("stopped\n");
            return 0;
        }
        printf("move %d -> %d: ", from, to);
        from--;
        to--;
        if (from < 0 || from > 2 || to < 0 || to > 2 || from == to) {
            printf("no such move\n");
            continue;
        }
        if (height[from] == 0) {
            printf("peg %d is empty\n", from + 1);
            continue;
        }
        d = peg[from][height[from] - 1];
        if (height[to] > 0 && peg[to][height[to] - 1] < d) {
            printf("disk %d cannot sit on disk %d\n", d, peg[to][height[to] - 1]);
            continue;
        }
        /* pop from one stack, push onto the other */
        height[from]--;
        peg[to][height[to]++] = d;
        moves++;
        printf("ok\n");
        show();
    }
    printf("Done in %d moves; the minimum is %d.\n", moves, (1 << DISKS) - 1);
    return 0;
}
