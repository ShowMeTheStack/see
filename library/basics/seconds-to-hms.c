/*
 * title: Seconds into hours, minutes and seconds
 * level: 1
 * about: Splits a count of seconds into days, hours, minutes and seconds using / and %.
 * input: 200000
 */
#include <stdio.h>

/* Named constants make the arithmetic below read like the sentence it is. */
#define SECONDS_PER_MINUTE 60
#define SECONDS_PER_HOUR   (60 * SECONDS_PER_MINUTE)
#define SECONDS_PER_DAY    (24 * SECONDS_PER_HOUR)

int main(void)
{
    long total;
    long rest;
    long days, hours, minutes, seconds;

    printf("How many seconds? ");
    scanf("%ld", &total);
    printf("%ld\n", total);

    /*
     * The pattern repeats for each unit: / tells how many whole units fit,
     * % tells what is left for the smaller units. Watch rest shrink on the
     * stack as you step through.
     */
    rest = total;
    days = rest / SECONDS_PER_DAY;
    rest = rest % SECONDS_PER_DAY;

    hours = rest / SECONDS_PER_HOUR;
    rest = rest % SECONDS_PER_HOUR;

    minutes = rest / SECONDS_PER_MINUTE;
    seconds = rest % SECONDS_PER_MINUTE;

    printf("%ld seconds is %ld days, %ld hours, %ld minutes and %ld seconds\n",
           total, days, hours, minutes, seconds);

    /* %02ld pads to two digits with zeros, the way clocks show time. */
    printf("as a clock: %ldd %02ld:%02ld:%02ld\n", days, hours, minutes, seconds);
    return 0;
}
