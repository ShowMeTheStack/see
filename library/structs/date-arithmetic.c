/*
 * title: Date arithmetic with a date struct
 * level: 3
 * about: Reads pairs of dates, prints the weekday of each, the number of days between them and the date 100 days later.
 * input: 2000-01-01 2000-03-01\n1969-07-20 2024-02-29\n1999-12-31 2000-01-01\n
 */
#include <stdio.h>

typedef struct {
    int year;
    int month;   /* 1..12 */
    int day;     /* 1..31 */
} Date;

int is_leap(int y)
{
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}

int days_in_month(int y, int m)
{
    /* A static table lives with the globals, not on the stack, and is set up
       once before main runs. */
    static const int len[12] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    if (m == 2 && is_leap(y))
        return 29;
    return len[m - 1];
}

/* The trick behind most date code: turn a date into a single day number,
   do the arithmetic on plain integers, and turn it back. Day 0 here is
   1 January of year 1 in the proleptic Gregorian calendar. */
long to_days(Date d)
{
    long y = d.year - 1;
    long n = y * 365 + y / 4 - y / 100 + y / 400;
    int m;
    for (m = 1; m < d.month; m++)
        n += days_in_month(d.year, m);
    return n + d.day - 1;
}

Date from_days(long n)
{
    Date d;
    d.year = 1;
    /* Skip whole 400-year cycles (146097 days) first so the loop is short. */
    d.year += 400 * (int)(n / 146097);
    n %= 146097;
    while (n >= (is_leap(d.year) ? 366 : 365)) {
        n -= is_leap(d.year) ? 366 : 365;
        d.year++;
    }
    d.month = 1;
    while (n >= days_in_month(d.year, d.month)) {
        n -= days_in_month(d.year, d.month);
        d.month++;
    }
    d.day = (int)n + 1;
    return d;
}

const char *weekday(Date d)
{
    static const char *names[7] = { "Monday", "Tuesday", "Wednesday", "Thursday",
                                    "Friday", "Saturday", "Sunday" };
    /* 1 January 0001 was a Monday in this calendar. */
    return names[to_days(d) % 7];
}

void print_date(Date d)
{
    printf("%04d-%02d-%02d", d.year, d.month, d.day);
}

int main(void)
{
    Date a, b;

    /* scanf can fill struct fields directly: &a.year is the address of one
       int inside the struct. */
    while (scanf("%d-%d-%d %d-%d-%d", &a.year, &a.month, &a.day,
                 &b.year, &b.month, &b.day) == 6) {
        print_date(a);
        printf(" is a %s\n", weekday(a));
        print_date(b);
        printf(" is a %s\n", weekday(b));
        printf("  days between: %ld\n", to_days(b) - to_days(a));
        printf("  100 days after ");
        print_date(a);
        printf(": ");
        print_date(from_days(to_days(a) + 100));
        printf("\n");
    }
    return 0;
}
