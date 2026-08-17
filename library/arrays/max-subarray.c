/*
 * title: Best run of profits (Kadane)
 * level: 3
 * about: Finds the stretch of days with the largest total profit in one pass, tracking where that stretch starts and ends.
 */
#include <stdio.h>

int main(void)
{
    /* A shop's daily profit; negative days are losses. */
    int p[12] = { -3, 4, -1, 2, 1, -5, 4, -2, 6, -1, -7, 3 };
    int n = 12;
    int here = 0, hereStart = 0;   /* best run that ends today */
    int best = p[0], bestStart = 0, bestEnd = 0;
    int i;

    /* The idea: a run that ends today is either "today alone" or "the best
       run ending yesterday, plus today". If yesterday's run is negative it
       can only drag today down, so start afresh. One pass, no inner loop. */
    printf("day profit  run-ending-here  best-so-far\n");
    for (i = 0; i < n; i++) {
        if (here <= 0) {
            here = p[i];
            hereStart = i;
        } else {
            here += p[i];
        }
        if (here > best) {
            best = here;
            bestStart = hereStart;
            bestEnd = i;
        }
        printf("%3d %6d  %15d  %11d\n", i, p[i], here, best);
    }
    printf("best stretch: days %d to %d, total %d\n", bestStart, bestEnd, best);

    /* Check by brute force over every (start, end) pair: n*n/2 sums. */
    {
        int s, e, sum, brute = p[0];
        for (s = 0; s < n; s++)
            for (sum = 0, e = s; e < n; e++) {
                sum += p[e];
                if (sum > brute) brute = sum;
            }
        printf("brute force agrees: %s\n", brute == best ? "yes" : "no");
    }
    return 0;
}
