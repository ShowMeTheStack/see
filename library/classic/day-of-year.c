/*
 * title: day_of_year and month_day
 * level: 2
 * about: Converts between month-and-day and day-of-the-year with a two-dimensional table that has one row for ordinary years and one for leap years.
 * input: 2024 3 1\n2023 3 1\n2024 12 31\n2023 13 1\n2024 60\n2023 60\n2023 365\n
 */
#include <stdio.h>

/* Row 0 is an ordinary year, row 1 a leap year. Column 0 is a dummy so
   that month 1 is at column 1. It is a char array because the numbers
   are small: 2 rows of 13 bytes. Look at it in the globals panel: the
   two rows sit back to back in memory, 26 bytes in all. */
static char daytab[2][13] = {
    {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31},
    {0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}
};

/* A comparison is 0 or 1, so leap can be used directly as a row index. */
int is_leap(int year)
{
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

/* Day of the year from month and day; -1 if the date is impossible
   (exercise 5-8 asks for the checks). */
int day_of_year(int year, int month, int day)
{
    int i, leap = is_leap(year);

    if (month < 1 || month > 12 || day < 1 || day > daytab[leap][month])
        return -1;
    for (i = 1; i < month; i++)
        day += daytab[leap][i];
    return day;
}

/* Month and day from the day of the year, both returned through
   pointers. Returns 0 if yearday is out of range. */
int month_day(int year, int yearday, int *pmonth, int *pday)
{
    int i, leap = is_leap(year);

    if (yearday < 1 || yearday > (leap ? 366 : 365))
        return 0;
    for (i = 1; yearday > daytab[leap][i]; i++)
        yearday -= daytab[leap][i];
    *pmonth = i;
    *pday = yearday;
    return 1;
}

int main(void)
{
    char line[80];
    int a, b, c, n, month, day;

    /* Three numbers: year month day. Two numbers: year yearday. sscanf
       tells us how many it found. */
    while (fgets(line, sizeof line, stdin) != NULL) {
        n = sscanf(line, "%d %d %d", &a, &b, &c);
        if (n == 3) {
            int d = day_of_year(a, b, c);
            if (d < 0)
                printf("%d-%02d-%02d is not a real date\n", a, b, c);
            else
                printf("%d-%02d-%02d is day %d\n", a, b, c, d);
        } else if (n == 2) {
            if (month_day(a, b, &month, &day))
                printf("day %d of %d is %d-%02d-%02d\n", b, a, a, month, day);
            else
                printf("%d has no day %d\n", a, b);
        }
    }
    return 0;
}
