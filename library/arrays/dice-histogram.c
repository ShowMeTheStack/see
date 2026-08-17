/*
 * title: Histogram of two dice
 * level: 2
 * about: Rolls two dice 360 times, tallies the totals in an array of counters and draws a bar chart.
 */
#include <stdio.h>
#include <stdlib.h>

#define ROLLS 360

int main(void)
{
    /* count[t] holds how many times the total t came up. Totals run 2..12,
       so 13 slots are needed; slots 0 and 1 simply stay zero. Using the
       value itself as the index is the whole trick of a histogram. */
    int count[13] = { 0 };
    int i, t, d1, d2, bar;

    srand(2024);   /* fixed seed: the same "random" rolls every run */
    for (i = 0; i < ROLLS; i++) {
        d1 = rand() % 6 + 1;
        d2 = rand() % 6 + 1;
        count[d1 + d2]++;
    }

    printf("total  count  expected  bar (one # per 2 rolls)\n");
    for (t = 2; t <= 12; t++) {
        /* There are 36 equally likely pairs; 6 of them make 7, 1 makes 2. */
        int ways = t <= 7 ? t - 1 : 13 - t;
        printf("%5d  %5d  %8d  ", t, count[t], ROLLS * ways / 36);
        for (bar = 0; bar < count[t] / 2; bar++)
            putchar('#');
        putchar('\n');
    }
    /* Seven should tower over the rest: more pairs add up to it. */
    return 0;
}
