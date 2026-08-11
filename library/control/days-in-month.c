/*
 * title: Days in a month with fall-through
 * level: 2
 * about: Groups months that share a length by letting several case labels fall through to one statement.
 * input: 1 2 4 9 12 2
 */
#include <stdio.h>

int main(void)
{
    int month;
    int days;
    int febs = 0;  /* how many times February has been asked for */

    while (scanf("%d", &month) == 1) {
        /* Several labels in a row with nothing between them all lead to
           the same code. This is the friendly kind of fall-through. */
        switch (month) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            days = 31;
            break;
        case 4: case 6: case 9: case 11:
            days = 30;
            break;
        case 2:
            febs++;
            /* Pretend the first February asked about is in a leap year and
               the second is not, just to vary the output. */
            days = (febs == 1) ? 29 : 28;
            break;
        default:
            days = 0;
            break;
        }
        if (days == 0)
            printf("month %d does not exist\n", month);
        else
            printf("month %2d has %d days\n", month, days);
    }
    return 0;
}
