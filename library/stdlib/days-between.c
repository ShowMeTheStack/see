/*
 * title: Counting days between dates with difftime
 * level: 3
 * about: Converts dates to time_t with mktime, measures the gaps with difftime, adds days by letting mktime normalise out-of-range fields, and finds weekdays.
 */
#include <stdio.h>
#include <string.h>
#include <time.h>

static const char *weekdays[] = {
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
};

/* Noon is used so that a summer time change can never push a date
   across midnight. */
static time_t to_time(int y, int m, int d, struct tm *out)
{
    struct tm t;
    memset(&t, 0, sizeof t);
    t.tm_year = y - 1900;
    t.tm_mon = m - 1;
    t.tm_mday = d;
    t.tm_hour = 12;
    t.tm_isdst = -1;
    if (out != NULL) {
        *out = t;
        return mktime(out);
    }
    return mktime(&t);
}

static void print_date(const struct tm *t)
{
    char buf[40];
    strftime(buf, sizeof buf, "%d %b %Y", t);
    printf("%s (%s)", buf, weekdays[t->tm_wday]);
}

int main(void)
{
    time_t a, b;
    struct tm t;
    double secs;

    /*
     * difftime(later, earlier) gives seconds as a double. time_t is
     * only promised to be an arithmetic type, so subtracting two of
     * them directly is not portable; difftime is.
     */
    a = to_time(1969, 7, 20, NULL);
    b = to_time(2000, 1, 1, NULL);
    secs = difftime(b, a);
    printf("Moon landing to Y2K: %.0f seconds, %.0f days\n", secs, secs / 86400.0);

    a = to_time(2024, 1, 1, NULL);
    b = to_time(2025, 1, 1, NULL);
    printf("days in 2024: %.0f (a leap year)\n", difftime(b, a) / 86400.0);

    /*
     * mktime normalises: day 32 of January becomes 1 February, and
     * month 13 becomes January of the next year. So "add 100 days" is
     * just tm_mday += 100 followed by mktime.
     */
    to_time(2024, 2, 20, &t);
    printf("start: ");
    print_date(&t);
    t.tm_mday += 100;
    mktime(&t);
    printf("\n+100 days: ");
    print_date(&t);
    printf("\n");

    to_time(2023, 2, 29, &t);         /* there was no 29 Feb in 2023 */
    printf("29 Feb 2023 normalises to ");
    print_date(&t);
    printf("\n");

    /* Which weekday was each first of the month in 1989? */
    printf("first of each month in 1989:\n");
    {
        int m;
        for (m = 1; m <= 12; m++) {
            to_time(1989, m, 1, &t);
            printf("  %2d %.3s\n", m, weekdays[t.tm_wday]);
        }
    }
    return 0;
}
