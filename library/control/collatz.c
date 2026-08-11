/*
 * title: Collatz hailstones
 * level: 2
 * about: Follows the 3n+1 sequence from several starting numbers and reports the length and highest point of each.
 */
#include <stdio.h>

int main(void)
{
    static const long starts[] = { 6, 7, 27, 97 };
    int k;
    long n;
    long peak;
    int steps;

    for (k = 0; k < 4; k++) {
        n = starts[k];
        peak = n;
        steps = 0;

        /* Nobody has ever proved this loop ends for every starting
           number. It has for every number anyone has tried. That makes
           while the honest choice: we cannot say in advance how many
           passes there will be, unlike a for loop counting to a limit. */
        while (n != 1) {
            if (n % 2 == 0)
                n = n / 2;
            else
                n = 3 * n + 1;
            if (n > peak)
                peak = n;
            steps++;
            if (k < 2)
                printf("%ld ", n);   /* show the short ones in full */
        }
        if (k < 2)
            printf("\n");
        printf("start %3ld: %3d steps, highest point %ld\n", starts[k], steps, peak);
    }
    return 0;
}
