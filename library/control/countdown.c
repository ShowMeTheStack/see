/*
 * title: Rocket countdown
 * level: 1
 * about: Counts down from ten with a while loop, then launches.
 */
#include <stdio.h>

int main(void)
{
    int n = 10;

    /* A while loop checks its condition before every pass, including the
       first. Watch n in the locals panel shrink by one each time round. */
    while (n > 0) {
        printf("%d...\n", n);
        n--;  /* forget this line and the loop never ends */
    }

    /* When the loop finishes, n is exactly 0: the first value that made
       the condition false. */
    printf("Lift off! (n is now %d)\n", n);
    return 0;
}
