/*
 * title: FizzBuzz, two ways
 * level: 1
 * about: Prints the FizzBuzz sequence to 30 first with an if/else chain and then with a switch on a remainder.
 */
#include <stdio.h>

int main(void)
{
    int i;

    /* Way 1. Test the "both" case first: 15 is divisible by 3 too, so if
       the % 3 test came first, 15 would wrongly print just Fizz. */
    for (i = 1; i <= 15; i++) {
        if (i % 15 == 0)
            printf("FizzBuzz");
        else if (i % 3 == 0)
            printf("Fizz");
        else if (i % 5 == 0)
            printf("Buzz");
        else
            printf("%d", i);
        printf(i < 15 ? " " : "\n");
    }

    /* Way 2. The pattern repeats every 15 numbers, so switch on i % 15.
       The fall-through lists every remainder that gives the same word. */
    for (i = 16; i <= 30; i++) {
        switch (i % 15) {
        case 0:
            printf("FizzBuzz");
            break;
        case 3: case 6: case 9: case 12:
            printf("Fizz");
            break;
        case 5: case 10:
            printf("Buzz");
            break;
        default:
            printf("%d", i);
        }
        printf(i < 30 ? " " : "\n");
    }
    return 0;
}
