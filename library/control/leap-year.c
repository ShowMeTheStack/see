/*
 * title: Is it a leap year?
 * level: 1
 * about: Decides whether each of several years is a leap year using the Gregorian rules.
 * input: 2024 1900 2000 2023 2100 1600
 */
#include <stdio.h>

int main(void)
{
    int year;
    int leap;

    /* scanf returns how many items it read. When the input runs out it
       returns EOF (or 0), and the loop stops by itself. */
    while (scanf("%d", &year) == 1) {
        /* The rule, as a teacher would say it:
             every 4th year is a leap year,
             except every 100th year,
             except every 400th year, which is a leap year after all.
           Nested ifs follow the sentence word for word. */
        if (year % 4 == 0) {
            if (year % 100 == 0) {
                if (year % 400 == 0)
                    leap = 1;
                else
                    leap = 0;
            } else {
                leap = 1;
            }
        } else {
            leap = 0;
        }

        printf("%d: %s", year, leap ? "leap year" : "ordinary year");

        /* The same rule squeezed into one expression. && binds tighter
           than ||, so this reads (div by 4 and not by 100) or (div by 400).
           Both versions must always agree. */
        if (leap == ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0))
            printf("  (one-line test agrees)\n");
        else
            printf("  (one-line test DISAGREES)\n");
    }
    return 0;
}
