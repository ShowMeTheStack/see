/*
 * title: Skipping readings with continue
 * level: 2
 * about: Averages sensor readings, using continue to skip bad values and break to stop at a sentinel.
 * input: 21 23 -999 22 150 24 -1 25 0 99
 */
#include <stdio.h>

int main(void)
{
    int value;
    int sum = 0, good = 0, bad = 0;

    /* for (;;) is a loop with no test of its own: it runs until
       something inside it leaves. */
    for (;;) {
        if (scanf("%d", &value) != 1)
            break;          /* input ran out */
        if (value == 0)
            break;          /* 0 is the agreed "end of data" marker */

        /* continue jumps to the end of this pass and starts the next one.
           It keeps the main work below at one level of indentation
           instead of burying it inside an else. */
        if (value < -50 || value > 60) {
            printf("  skipping impossible reading %d\n", value);
            bad++;
            continue;
        }

        sum += value;
        good++;
        printf("reading %d accepted\n", value);
    }

    /* The 99 after the 0 is never read: break left the loop first. */
    if (good > 0)
        printf("%d good, %d bad, average %.2f\n", good, bad, (double)sum / good);
    else
        printf("no good readings\n");
    return 0;
}
