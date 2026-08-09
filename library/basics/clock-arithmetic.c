/*
 * title: Clock arithmetic with %
 * level: 2
 * about: Reads pairs of hh:mm times and works out the minutes from the first to the second, wrapping past midnight with the remainder operator.
 * input: 09:15 17:45\n22:30 06:10\n23:59 00:00\n12:00 12:00
 */
#include <stdio.h>

#define MINUTES_PER_DAY (24 * 60)

int main(void)
{
    int h1, m1, h2, m2;
    int start, end;
    int diff;
    int later;

    /* "%d:%d" matches the colon in the input and throws it away. */
    while (scanf("%d:%d %d:%d", &h1, &m1, &h2, &m2) == 4) {
        /* Count everything in minutes after midnight: one number per time
           is much easier to work with than two. */
        start = h1 * 60 + m1;
        end = h2 * 60 + m2;

        /*
         * end - start is negative when the second time is after midnight,
         * as for 22:30 to 06:10. % with a negative left side gives a
         * negative remainder in C, so first add a whole day to make the
         * difference positive, then take % to bring it back under a day.
         */
        diff = (end - start + MINUTES_PER_DAY) % MINUTES_PER_DAY;

        printf("%02d:%02d to %02d:%02d is %2d h %02d min (%d minutes)\n",
               h1, m1, h2, m2, diff / 60, diff % 60, diff);
    }

    /*
     * The same trick moves forward round the clock: 20:00 plus 9 hours
     * is not 29:00 but 05:00.
     */
    later = (20 * 60 + 9 * 60) % MINUTES_PER_DAY;
    printf("20:00 plus 9 hours is %02d:%02d\n", later / 60, later % 60);
    return 0;
}
