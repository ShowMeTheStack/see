/*
 * title: A table of month names
 * level: 2
 * about: Keeps month names and lengths in fully const tables and uses them to print a short calendar summary.
 */
#include <stdio.h>

/*
 * const char * const months[] reads: months is an array of const pointers
 * to const char. Neither the letters nor the pointers can change, so a
 * compiler is free to keep the whole table in read-only memory, and gcc
 * does. The letters themselves are string literals, which are read-only
 * in any case: follow the twelve arrows to them in See.
 */
static const char * const months[12] = {
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
};

static const int days_in[12] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };

int is_leap(int y)
{
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}

int days(int month, int year)
{
    if (month == 1 && is_leap(year))
        return 29;
    return days_in[month];
}

int main(void)
{
    int m, total = 0;
    int year = 2024;

    for (m = 0; m < 12; m++) {
        total += days(m, year);
        printf("%-10s %2d days  (%.3s)  day %3d of the year at its end\n",
               months[m], days(m, year), months[m], total);
    }

    /*
     * Both of these are rejected:
     *     months[0] = "Janvier";   error: assignment of read-only location 'months[0]'
     *     months[0][0] = 'j';      error: assignment of read-only location 'months[0][0]'
     */
    printf("%d has %d days\n", year, total);
    return 0;
}
