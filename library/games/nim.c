/*
 * title: Nim and the XOR trick
 * level: 2
 * about: Plays Nim on three heaps against a computer that aims for a zero XOR of the heap sizes - and loses to a player who knows the same trick.
 * input: 4 1\n1 1\n2 1\n1 1\n1 1\n3 1\n3 1\n3 1\n3 1\n3 1\n
 */
#include <stdio.h>

#define HEAPS 3

static int heap[HEAPS] = { 3, 5, 7 };

static void show(void)
{
    int h, k;

    for (h = 0; h < HEAPS; h++) {
        printf("  heap %d: ", h + 1);
        for (k = 0; k < heap[h]; k++)
            printf("| ");
        printf("(%d)\n", heap[h]);
    }
}

static int total(void)
{
    return heap[0] + heap[1] + heap[2];
}

/* The nim-sum is the XOR of all heap sizes. A position with nim-sum 0 is
   lost for the player about to move: whatever they do, the other player
   can make it 0 again, and the empty board (all 0) has nim-sum 0.
   So the computer looks for a move that leaves nim-sum 0. */
static void computer(void)
{
    int x = heap[0] ^ heap[1] ^ heap[2];
    int h, target;

    if (x != 0) {
        for (h = 0; h < HEAPS; h++) {
            target = heap[h] ^ x;       /* what this heap would need to be */
            if (target < heap[h]) {
                printf("Computer takes %d from heap %d (nim-sum was %d).\n",
                       heap[h] - target, h + 1, x);
                heap[h] = target;
                return;
            }
        }
    }
    /* Losing position: take one from the biggest heap and hope. */
    h = 0;
    if (heap[1] > heap[h]) h = 1;
    if (heap[2] > heap[h]) h = 2;
    heap[h]--;
    printf("Computer takes 1 from heap %d (and is worried).\n", h + 1);
}

int main(void)
{
    int h, n;

    printf("Take any number from one heap. Whoever takes the last one wins.\n");
    show();
    while (total() > 0) {
        printf("Your move (heap count): ");
        if (scanf("%d %d", &h, &n) != 2) {
            printf("\nNo more moves.\n");
            return 0;
        }
        printf("%d %d\n", h, n);
        if (h < 1 || h > HEAPS || n < 1 || n > heap[h - 1]) {
            printf("You cannot take %d from heap %d.\n", n, h);
            continue;
        }
        heap[h - 1] -= n;
        if (total() == 0) {
            printf("You took the last one. You win!\n");
            return 0;
        }
        computer();
        show();
    }
    printf("The computer took the last one and wins.\n");
    return 0;
}
