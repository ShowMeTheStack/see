/*
 * title: Temperatures for a week
 * level: 1
 * about: Reads seven daily temperatures, then reports the coldest and hottest day and the average.
 * input: 18 21 17 25 23 19 20
 */
#include <stdio.h>

int main(void)
{
    const char *days[7] = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
    int temp[7];
    int i;
    int lo, hi;     /* indexes, not values: we want to know *which* day */
    long sum = 0;

    for (i = 0; i < 7; i++) {
        if (scanf("%d", &temp[i]) != 1) {
            printf("need seven numbers\n");
            return 0;
        }
    }

    /* Start both guesses at day 0. Starting max at 0 would be wrong for a
       freezing week where every reading is negative. */
    lo = hi = 0;
    for (i = 0; i < 7; i++) {
        if (temp[i] < temp[lo]) lo = i;
        if (temp[i] > temp[hi]) hi = i;
        sum += temp[i];
    }

    for (i = 0; i < 7; i++)
        printf("%s %3d %s\n", days[i], temp[i],
               i == lo ? "<- coldest" : i == hi ? "<- hottest" : "");
    printf("average %.2f\n", sum / 7.0);
    printf("range   %d degrees\n", temp[hi] - temp[lo]);
    return 0;
}
