/*
 * title: Sliding window over step counts
 * level: 2
 * about: Finds the best run of k consecutive days and a moving average by sliding a window one step at a time.
 */
#include <stdio.h>

#define DAYS 14
#define K 3

int main(void)
{
    int steps[DAYS] = { 4200, 6100, 3900, 8800, 9100, 7600, 2000,
                        5300, 10400, 9900, 8700, 3100, 4500, 6000 };
    long window;   /* sum of the K values currently inside the window */
    long best;
    int bestStart = 0;
    int i;

    /* Fill the first window the slow way: add up K values. */
    window = 0;
    for (i = 0; i < K; i++)
        window += steps[i];
    best = window;
    printf("days  0..%2d  sum %6ld  average %7.1f\n", K - 1, window, window / (double)K);

    /* Now slide: the value at i enters on the right, the value at i-K
       leaves on the left. Two operations per step instead of K, which is
       the whole point of the technique. Watch 'window' in the locals panel
       change by exactly (new - old) each time. */
    for (i = K; i < DAYS; i++) {
        window += steps[i] - steps[i - K];
        printf("days %2d..%2d  sum %6ld  average %7.1f\n", i - K + 1, i, window, window / (double)K);
        if (window > best) {
            best = window;
            bestStart = i - K + 1;
        }
    }
    printf("best %d-day stretch starts on day %d with %ld steps\n", K, bestStart, best);
    return 0;
}
