/*
 * title: Printing a month calendar
 * level: 2
 * about: Reads a month and year, finds the weekday of the first with Zeller's congruence, and prints the month like the Unix cal command.
 * input: 2 2024\n9 1752\n10 2026\n
 */
#include <stdio.h>

static const char *month_names[12] = {
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
};

int is_leap(int y)
{
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}

int days_in_month(int m, int y)
{
    static const int days[12] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    return (m == 2 && is_leap(y)) ? 29 : days[m - 1];
}

/* Zeller's congruence: weekday of a date, 0 = Sunday ... 6 = Saturday.
   January and February count as months 13 and 14 of the year before,
   so the leap day falls at the very end of the counting year. */
int weekday(int d, int m, int y)
{
    int k, j, h;

    if (m < 3) {
        m += 12;
        y--;
    }
    k = y % 100;
    j = y / 100;
    h = (d + 13 * (m + 1) / 5 + k + k / 4 + j / 4 + 5 * j) % 7;
    return (h + 6) % 7;     /* Zeller gives 0 = Saturday; shift it */
}

void print_month(int m, int y)
{
    int first = weekday(1, m, y);
    int n = days_in_month(m, y);
    int d, col;
    char title[40];
    int len, pad;

    /* Centre the title over the 20-character-wide grid. sprintf returns
       how many characters it wrote, which is just what we need. */
    len = sprintf(title, "%s %d", month_names[m - 1], y);
    pad = (20 - len) / 2;
    printf("%*s%s\n", pad, "", title);
    printf("Su Mo Tu We Th Fr Sa\n");

    /* Skip blank cells up to the first day, then fill the grid and
       start a new line after every Saturday. */
    for (col = 0; col < first; col++)
        printf("   ");
    for (d = 1; d <= n; d++) {
        printf("%2d", d);
        col++;
        if (col % 7 == 0)
            printf("\n");
        else if (d < n)
            printf(" ");
    }
    if (col % 7 != 0)
        printf("\n");
    printf("\n");
}

int main(void)
{
    int m, y;

    /* September 1752 looks wrong in the real cal command because Britain
       skipped eleven days that month. This program uses the Gregorian
       calendar throughout, so it prints a normal September. */
    while (scanf("%d %d", &m, &y) == 2 && m >= 1 && m <= 12)
        print_month(m, y);
    return 0;
}
