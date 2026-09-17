/*
 * title: The date of Easter
 * level: 2
 * about: Works out Western Easter Sunday for any year with the Gregorian computus, using nothing but integer division and remainders.
 * input: 1961 2000 2024 2025 2038 2285
 */
#include <stdio.h>

/* The "anonymous Gregorian algorithm" (Meeus, Jones, Butcher). Easter is
   the first Sunday after the first full moon on or after 21 March, with
   the moon worked out by the church tables, not by astronomy. Each
   letter below is one piece of that reckoning. */
void easter(int year, int *month, int *day)
{
    int a = year % 19;          /* position in the 19-year moon cycle */
    int b = year / 100;         /* century */
    int c = year % 100;         /* year within the century */
    int d = b / 4, e = b % 4;   /* leap century corrections */
    int f = (b + 8) / 25;
    int g = (b - f + 1) / 3;    /* moon drift correction */
    int h = (19 * a + b - d - g + 15) % 30;   /* days to the full moon */
    int i = c / 4, k = c % 4;
    int l = (32 + 2 * e + 2 * i - h - k) % 7; /* days on to Sunday */
    int m = (a + 11 * h + 22 * l) / 451;      /* rare edge case fix */

    *month = (h + l - 7 * m + 114) / 31;
    *day = (h + l - 7 * m + 114) % 31 + 1;
}

int main(void)
{
    int year, month, day;

    /* month and day are filled in by easter() through pointers. In the
       debugger, step into easter and see that its month and day
       parameters hold the addresses of main's variables. */
    while (scanf("%d", &year) == 1) {
        easter(year, &month, &day);
        printf("Easter %d: %s %d\n", year, month == 3 ? "March" : "April", day);
    }

    /* It can fall from 22 March to 25 April. */
    printf("earliest possible 22 March, latest 25 April\n");
    return 0;
}
