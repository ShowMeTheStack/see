/*
 * title: An error macro that reports file and line
 * level: 2
 * about: Validates a list of dates with a CHECK macro that prints the source line of each failed test using __FILE__ and __LINE__.
 */
#include <stdio.h>

/*
 * __FILE__ and __LINE__ are built-in macros. The preprocessor replaces
 * them with the current file name (a string) and line number (an int)
 * at the place where they are written.
 *
 * Inside a function, __LINE__ would always be the line of that
 * function. Inside a macro, it is the line where the macro is USED,
 * because the macro is expanded right there. That is the whole trick.
 */
#define FAIL(msg) report_error(__FILE__, __LINE__, msg)

/* CHECK evaluates a condition; when false it reports and returns 0
   from the function it is used in. */
#define CHECK(cond, msg)              \
    do {                              \
        if (!(cond)) {                \
            FAIL(msg);                \
            return 0;                 \
        }                             \
    } while (0)

static int errors = 0;

static void report_error(const char *file, int line, const char *msg)
{
    errors++;
    printf("  %s:%d: %s\n", file, line, msg);
}

static int days_in_month(int m, int y)
{
    static const int days[12] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    int leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    return m == 2 && leap ? 29 : days[m - 1];
}

/* Returns 1 for a valid date. Each CHECK names its own line. */
static int valid_date(int d, int m, int y)
{
    CHECK(y >= 1583, "year before the Gregorian calendar");
    CHECK(m >= 1 && m <= 12, "month out of range");
    CHECK(d >= 1, "day must be at least 1");
    CHECK(d <= days_in_month(m, y), "too many days for that month");
    return 1;
}

int main(void)
{
    int dates[6][3];
    int i;

    dates[0][0] = 29; dates[0][1] = 2;  dates[0][2] = 2024;
    dates[1][0] = 29; dates[1][1] = 2;  dates[1][2] = 1900;
    dates[2][0] = 31; dates[2][1] = 4;  dates[2][2] = 2023;
    dates[3][0] = 15; dates[3][1] = 13; dates[3][2] = 2023;
    dates[4][0] = 1;  dates[4][1] = 1;  dates[4][2] = 1200;
    dates[5][0] = 31; dates[5][1] = 12; dates[5][2] = 1999;

    for (i = 0; i < 6; i++) {
        printf("%02d/%02d/%04d\n", dates[i][0], dates[i][1], dates[i][2]);
        if (valid_date(dates[i][0], dates[i][1], dates[i][2]))
            printf("  ok\n");
    }

    printf("%d errors; this summary is on line %d of %s\n", errors, __LINE__, __FILE__);
    return 0;
}
