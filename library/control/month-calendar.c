/*
 * title: Calendar for any month
 * level: 3
 * about: Works out the weekday of the first of a month with Zeller-style arithmetic and prints the month as a grid.
 * input: 2 2024\n7 1969
 */
#include <stdio.h>

int main(void)
{
    static const char *names[] = { "January", "February", "March", "April", "May", "June",
                                   "July", "August", "September", "October", "November", "December" };
    int month, year;
    int y, m, first, days, leap, d, col;

    while (scanf("%d %d", &month, &year) == 2) {
        if (month < 1 || month > 12)
            continue;

        /* Zeller's congruence gives the weekday of the 1st, with 0 meaning
           Saturday; adding 6 before the % 7 shifts it so 0 means Sunday.
           January and February count as months 13 and 14 of the previous
           year, so that the leap day lands at the end of the "year". */
        y = year;
        m = month;
        if (m < 3) {
            m += 12;
            y--;
        }
        first = (1 + (13 * (m + 1)) / 5 + y + y / 4 - y / 100 + y / 400 + 6) % 7;

        leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
        switch (month) {
        case 2:
            days = leap ? 29 : 28;
            break;
        case 4: case 6: case 9: case 11:
            days = 30;
            break;
        default:
            days = 31;
        }

        printf("\n   %s %d\n Su Mo Tu We Th Fr Sa\n", names[month - 1], year);

        /* Leave a blank cell for each weekday before the 1st, then print
           the days, breaking the line after each Saturday. col tracks the
           column we are in, 0 to 6. */
        for (col = 0; col < first; col++)
            printf("   ");
        for (d = 1; d <= days; d++) {
            printf("%3d", d);
            col++;
            if (col == 7) {
                printf("\n");
                col = 0;
            }
        }
        if (col != 0)
            printf("\n");
    }
    return 0;
}
