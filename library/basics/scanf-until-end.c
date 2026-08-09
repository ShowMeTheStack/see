/*
 * title: Reading numbers until the input ends
 * level: 2
 * about: Uses scanf's return value to read any number of values, stopping cleanly at the end of input or at something that is not a number.
 * input: 12 7 30\n-4 15\n8 end 99
 */
#include <stdio.h>

int main(void)
{
    int value;
    int count = 0;
    long sum = 0;
    int smallest = 0, largest = 0;
    int got;
    char word[32];

    /*
     * scanf returns how many values it stored. With one %d that is 1 when
     * a number was read, 0 when the next thing in the input is not a
     * number, and EOF (a negative number) when there is no input left.
     * Testing for == 1 handles both ways of stopping.
     *
     * Spaces and newlines between numbers do not matter: %d skips them.
     */
    while ((got = scanf("%d", &value)) == 1) {
        if (count == 0) {
            smallest = value;
            largest = value;
        } else {
            if (value < smallest) smallest = value;
            if (value > largest) largest = value;
        }
        sum += value;
        count++;
        printf("read %3d   running total %4ld\n", value, sum);
    }

    /*
     * Here got tells us why the loop stopped. When it is 0, the text that
     * stopped scanf is still waiting in the input, so it can be read as a
     * word. %31s stops after 31 characters, leaving room for the zero byte.
     */
    if (got == 0 && scanf("%31s", word) == 1) {
        printf("stopped at \"%s\", which is not a number\n", word);
    } else {
        printf("stopped at the end of the input\n");
    }

    if (count > 0) {
        printf("%d numbers, sum %ld, smallest %d, largest %d, mean %.2f\n",
               count, sum, smallest, largest, (double)sum / count);
    }
    return 0;
}
