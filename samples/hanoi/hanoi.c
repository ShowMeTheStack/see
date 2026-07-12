/* hanoi.c: the towers of Hanoi.
   Step into the recursion (F11) and watch a new frame for every call;
   the Variables panel lists them all, and each has its own n, from, to and via. */
#include <stdio.h>

static int moves;

void hanoi(int n, char from, char to, char via)
{
    if (n == 0)
        return;
    hanoi(n - 1, from, via, to);
    moves++;
    printf("move disc %d from %c to %c\n", n, from, to);
    hanoi(n - 1, via, to, from);
}

int main(void)
{
    hanoi(3, 'A', 'C', 'B');
    printf("%d moves\n", moves);
    return 0;
}
