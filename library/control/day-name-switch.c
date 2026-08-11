/*
 * title: Day number to day name
 * level: 1
 * about: Uses a switch to turn day numbers 1 to 7 into names, with a default for bad numbers.
 * input: 1 3 7 0 5 9 6
 */
#include <stdio.h>

int main(void)
{
    int day;

    while (scanf("%d", &day) == 1) {
        printf("%d is ", day);

        /* switch jumps straight to the case label that matches the value.
           Each case ends with break, which leaves the switch. Without it
           the program would carry on into the next case. */
        switch (day) {
        case 1: printf("Monday");    break;
        case 2: printf("Tuesday");   break;
        case 3: printf("Wednesday"); break;
        case 4: printf("Thursday");  break;
        case 5: printf("Friday");    break;
        case 6: printf("Saturday");  break;
        case 7: printf("Sunday");    break;
        default:
            /* No label matched. default can sit anywhere in the switch,
               but the bottom is where readers expect it. */
            printf("not a day of the week");
            break;
        }
        printf("\n");
    }
    return 0;
}
