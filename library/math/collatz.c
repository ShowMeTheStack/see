/*
 * title: Collatz sequences
 * level: 1
 * about: Follows the halve-or-triple-plus-one rule from a few starting numbers and finds the longest journey below 3000.
 */
#include <stdio.h>

/* Count the steps to reach 1. Nobody has proved that every start gets
   there, but every number ever tried does. The peak is reported
   through a pointer, so the caller gets two answers from one call. */
int collatz_steps(long n, long *peak)
{
    int steps = 0;

    *peak = n;
    while (n != 1) {
        if (n % 2 == 0)
            n = n / 2;
        else
            n = 3 * n + 1;
        if (n > *peak)
            *peak = n;
        steps++;
    }
    return steps;
}

int main(void)
{
    long n, peak, best_start = 1, best_peak = 1;
    int steps, best_steps = 0;

    /* Print one journey in full. 27 is famous: it climbs to 9232
       before falling back to 1, taking 111 steps. */
    n = 27;
    printf("27:");
    while (n != 1) {
        printf(" %ld", n);
        n = (n % 2 == 0) ? n / 2 : 3 * n + 1;
    }
    printf(" 1\n");

    /* Now search. Put a breakpoint inside the if and watch best_start
       change only when a new record falls. */
    for (n = 1; n < 3000; n++) {
        steps = collatz_steps(n, &peak);
        if (steps > best_steps) {
            best_steps = steps;
            best_start = n;
            best_peak = peak;
            printf("new record: %4ld takes %3d steps, peaking at %ld\n",
                   n, steps, peak);
        }
    }
    printf("longest below 3000: %ld with %d steps (peak %ld)\n",
           best_start, best_steps, best_peak);
    return 0;
}
