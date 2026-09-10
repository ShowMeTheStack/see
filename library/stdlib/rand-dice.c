/*
 * title: Rolling dice with rand and srand
 * level: 1
 * about: Rolls two dice 3600 times from a fixed seed, draws a histogram of the totals, and shows that the same seed always gives the same rolls.
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * rand() returns a number from 0 to RAND_MAX (32767 here). It is not
 * truly random: it is a formula applied to a hidden state, and srand
 * sets that state. The same seed always gives the same sequence, which
 * is perfect for testing and for programs whose output must not change.
 */
static int die(void)
{
    /*
     * Scale with division rather than rand() % 6. The low bits of
     * simple generators are the least random part, and dividing uses
     * the high bits instead.
     */
    return 1 + (int)(rand() / ((RAND_MAX + 1.0) / 6));
}

int main(void)
{
    int counts[13];
    int i, j, total;

    printf("RAND_MAX is %d\n", RAND_MAX);

    srand(2024);
    printf("first five rolls with seed 2024:");
    for (i = 0; i < 5; i++)
        printf(" %d", die());
    srand(2024);
    printf("\nagain with seed 2024:           ");
    for (i = 0; i < 5; i++)
        printf(" %d", die());
    printf("\n");

    for (i = 0; i <= 12; i++)
        counts[i] = 0;
    srand(7);
    for (i = 0; i < 3600; i++) {
        /* Two separate statements, so the order of the two rolls is
           fixed. */
        total = die();
        total += die();
        counts[total]++;
    }

    /*
     * Seven is the most likely total: 6 of the 36 combinations make it,
     * so we expect about 600 of the 3600 rolls. Each # is 10 rolls.
     */
    printf("totals of two dice, 3600 rolls:\n");
    for (i = 2; i <= 12; i++) {
        printf("%3d %4d ", i, counts[i]);
        for (j = 0; j < counts[i] / 10; j++)
            putchar('#');
        putchar('\n');
    }
    return 0;
}
