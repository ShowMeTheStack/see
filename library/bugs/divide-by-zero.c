/*
 * title: Average of no numbers
 * level: 1
 * about: Reads scores until -1 and prints their average, without handling the case of no scores at all.
 * input: -1
 * expect: fault
 */

/*
 * THE PUZZLE
 * Try it in your head with the input "70 80 -1": count is 2, sum is
 * 150, average 75. Now the actual input is just "-1". What is count
 * when the division runs?
 *
 * HOW TO HUNT IT WITH SEE
 * See stops at the division with "integer division by zero". Look at
 * count and sum in the frame. Change the input in the input box to
 * "70 80 -1" and run again to see the program work. Integer division
 * by zero has no sensible answer, so the processor raises an exception
 * (SIGFPE, "floating point exception", a historical name even for
 * integers).
 */
#include <stdio.h>

int main(void)
{
    int score;
    int sum = 0;
    int count = 0;

    printf("Enter scores, -1 to finish:\n");
    while (scanf("%d", &score) == 1 && score != -1) {
        sum += score;
        count++;
    }

    printf("%d scores, average %d\n", count, sum / count);
    return 0;
}

/*
 * THE FIX
 *     if (count == 0)
 *         printf("no scores entered\n");
 *     else
 *         printf("%d scores, average %d\n", count, sum / count);
 * Every division by a value that came from outside the program needs
 * this question asked: can it be zero?
 */
