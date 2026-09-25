/*
 * title: Squares table that writes one too many
 * level: 1
 * about: Fills an array with the squares of 0 to 9 and prints them, but the loop runs once too often.
 * expect: fault
 */

/*
 * THE PUZZLE
 * The table has room for ten squares. The loop is meant to fill sq[0]
 * to sq[9]. Read the for line slowly and count how many times its body
 * runs. Then count how many boxes sq has.
 *
 * HOW TO HUNT IT WITH SEE
 * Run it. See stops on the line that does the damage and names the
 * array. Look at i in the stack frame: what value is it? Press F8 a
 * few times to step backwards and watch the earlier passes fill the
 * boxes of sq one by one in the memory picture. On a real machine the
 * extra write would land on whatever happens to sit next to sq (often
 * another local, or the saved return address) and the program might
 * carry on as if nothing had happened. See keeps a guard around every
 * array, so the very first byte past the end is caught.
 */
#include <stdio.h>

#define N 10

int main(void)
{
    int sq[N];
    int i;

    for (i = 0; i <= N; i++) {
        sq[i] = i * i;
    }

    for (i = 0; i < N; i++) {
        printf("%2d squared is %3d\n", i, sq[i]);
    }
    return 0;
}

/*
 * THE FIX
 * An array of N elements has indexes 0 to N-1, so the loop condition
 * must be i < N, not i <= N. The habit worth building: when a loop
 * walks an array, write "i < size" and nothing else, so that the
 * shape of the line tells you it is right before you read it.
 */
