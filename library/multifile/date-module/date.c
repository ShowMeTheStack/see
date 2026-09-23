/* date.c - the trick is to turn a date into a single day number. Then
 * "days between" is a subtraction and "add 100 days" is an addition. */
#include <stdio.h>
#include "date.h"

static const int month_len[12] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
static const char *month_name[12] = {
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
};
static const char *day_name[7] = {
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
};

int date_is_leap(int year)
{
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

int date_days_in_month(int year, int month)
{
    if (month == 2 && date_is_leap(year)) {
        return 29;
    }
    return month_len[month - 1];
}

int date_valid(const struct date *d)
{
    return d->year >= 1 && d->month >= 1 && d->month <= 12 &&
           d->day >= 1 && d->day <= date_days_in_month(d->year, d->month);
}

/* Days since 1 January of year 1 (day 0 is that date, a Monday). */
long date_to_days(const struct date *d)
{
    long y = d->year - 1;
    long days = y * 365 + y / 4 - y / 100 + y / 400;
    int m;

    for (m = 1; m < d->month; m++) {
        days += date_days_in_month(d->year, m);
    }
    return days + d->day - 1;
}

struct date date_from_days(long days)
{
    struct date d;
    int len;

    /* Skip 400-year blocks first (146097 days each), then single years. */
    d.year = 1 + (int)(days / 146097) * 400;
    days %= 146097;
    while (days >= (len = date_is_leap(d.year) ? 366 : 365)) {
        days -= len;
        d.year++;
    }
    d.month = 1;
    while (days >= (len = date_days_in_month(d.year, d.month))) {
        days -= len;
        d.month++;
    }
    d.day = (int)days + 1;
    return d;
}

const char *date_weekday(const struct date *d)
{
    return day_name[date_to_days(d) % 7];
}

/* out must have room for at least 12 chars, e.g. "29 Feb 2024". */
void date_format(const struct date *d, char *out)
{
    sprintf(out, "%d %s %d", d->day, month_name[d->month - 1], d->year);
}
