/*
 * title: A total that starts from rubbish
 * level: 1
 * about: Adds up five test marks into a total that was never set to zero.
 * expect: runtime
 */

/*
 * THE PUZZLE
 * The marks are fine, the loop is fine, the division is fine. And yet
 * the average is nonsense. What is in total before the first +=?
 *
 * HOW TO HUNT IT WITH SEE
 * Debug with F5 and look at main's frame: total is drawn in red, which
 * means "not set yet"; the number shown is just leftover bits. A local
 * variable in C starts with whatever bytes were left in that part of
 * the stack. Step through the loop (F10) and See warns on the first
 * total += marks[i] that it is reading a variable before it was given
 * a value. The program carries on, which is exactly the danger:
 * nothing crashes, the answer is just wrong.
 */
#include <stdio.h>

int main(void)
{
    int marks[5];
    int total;
    int i;

    marks[0] = 72;
    marks[1] = 85;
    marks[2] = 64;
    marks[3] = 90;
    marks[4] = 78;

    for (i = 0; i < 5; i++)
        total += marks[i];

    printf("total   %d\n", total);
    printf("average %d\n", total / 5);
    return 0;
}

/*
 * THE FIX
 *     int total = 0;
 * The expected output is total 389 and average 77. Global and static
 * variables start at zero; locals (automatic variables) do not.
 */
