/*
 * title: Formatting dates with mktime and strftime
 * level: 3
 * about: Builds fixed dates with mktime, which also works out the weekday, and prints them in many styles with strftime.
 */
#include <stdio.h>
#include <string.h>
#include <time.h>

/*
 * A struct tm holds a date in pieces. Its fields are counted in
 * slightly odd ways that trip everyone up once:
 *   tm_year  years since 1900, so 2024 is 124
 *   tm_mon   0 to 11, so March is 2
 *   tm_mday  1 to 31, the only one counted from 1
 *   tm_wday  0 to 6 from Sunday, tm_yday 0 to 365: filled in by mktime
 */
static struct tm make_date(int year, int month, int day, int hour, int min)
{
    struct tm t;
    memset(&t, 0, sizeof t);
    t.tm_year = year - 1900;
    t.tm_mon = month - 1;
    t.tm_mday = day;
    t.tm_hour = hour;
    t.tm_min = min;
    t.tm_isdst = -1;     /* -1: let the library decide about summer time */
    mktime(&t);          /* fills in tm_wday and tm_yday */
    return t;
}

int main(void)
{
    struct tm moon, launch;
    char buf[80];
    const char *formats[7];
    int i;

    /* Only fixed dates are printed, so the output never changes. */
    moon = make_date(1969, 7, 20, 20, 17);
    launch = make_date(1989, 12, 14, 9, 30);

    formats[0] = "%Y-%m-%d %H:%M";             /* ISO style, sorts nicely */
    formats[1] = "%d/%m/%y";                   /* day first, short year */
    formats[2] = "%A %d %B %Y";                /* names spelled out */
    formats[3] = "%a %b %d, %I:%M %p";         /* 12-hour clock */
    formats[4] = "day %j of the year";         /* day of year, 001-366 */
    formats[5] = "week %U, weekday %w";        /* week number, 0 = Sunday */
    formats[6] = "%c";                         /* the locale's full style */

    printf("Moon landing:\n");
    for (i = 0; i < 7; i++) {
        strftime(buf, sizeof buf, formats[i], &moon);
        printf("  %-22s %s\n", formats[i], buf);
    }

    /*
     * strftime returns the number of characters written, or 0 when the
     * buffer is too small, so check it when space is tight.
     */
    printf("ANSI C approved:\n");
    i = (int)strftime(buf, sizeof buf, "%A, %d %B %Y", &launch);
    printf("  %s (%d characters)\n", buf, i);
    i = (int)strftime(buf, 10, "%A, %d %B %Y", &launch);
    printf("  into a 10-byte buffer: returned %d, so it did not fit\n", i);

    /* asctime gives one fixed format, with a newline at the end. */
    printf("asctime: %s", asctime(&moon));
    return 0;
}
