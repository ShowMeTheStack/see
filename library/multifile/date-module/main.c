/*
 * title: A date module with day numbers
 * level: 2
 * about: Reads pairs of dates, checks them, names their weekdays and counts the days between them.
 * input: 1969 7 20  2000 1 1\n2024 2 29  2024 3 1\n2023 2 29  2023 3 1\n1900 1 1  2100 12 31\n
 */

/* See compiles main.c and date.c separately, then links them into one
 * program. main.c never does calendar arithmetic itself. */
#include <stdio.h>
#include "date.h"

int main(void)
{
    struct date a, b, later;
    char sa[16], sb[16], sl[16];
    long gap;

    while (scanf("%d %d %d %d %d %d", &a.year, &a.month, &a.day, &b.year, &b.month, &b.day) == 6) {
        if (!date_valid(&a) || !date_valid(&b)) {
            printf("%d-%d-%d or %d-%d-%d is not a real date\n", a.year, a.month, a.day, b.year, b.month, b.day);
            continue;
        }
        date_format(&a, sa);
        date_format(&b, sb);
        gap = date_to_days(&b) - date_to_days(&a);
        printf("%s (%s) to %s (%s): %ld days\n", sa, date_weekday(&a), sb, date_weekday(&b), gap);
    }

    /* Going the other way: a day number back into a date. */
    a.year = 2000; a.month = 1; a.day = 1;
    later = date_from_days(date_to_days(&a) + 10000);
    date_format(&later, sl);
    printf("10000 days after 1 Jan 2000 is %s, a %s\n", sl, date_weekday(&later));
    return 0;
}
