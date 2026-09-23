/* date.h - calendar dates in the Gregorian calendar. */
#ifndef DATE_H
#define DATE_H

struct date {
    int year;
    int month;  /* 1..12 */
    int day;    /* 1..31 */
};

int date_is_leap(int year);
int date_days_in_month(int year, int month);
int date_valid(const struct date *d);
long date_to_days(const struct date *d);
struct date date_from_days(long days);
const char *date_weekday(const struct date *d);
void date_format(const struct date *d, char *out);

#endif
