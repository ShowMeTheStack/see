/* bug.c: find the bug.
   Run it: See stops it with a memory error. Then debug it (F5), run to the
   crash, and look at which element of scores the loop was writing.
   Can you fix the loop condition? */
#include <stdio.h>

int main(void)
{
    int scores[5];
    int i, total = 0;

    for (i = 0; i <= 5; i++)       /* the bug: <= runs once too many */
        scores[i] = i * 10;
    for (i = 0; i < 5; i++)
        total += scores[i];
    printf("total %d\n", total);
    return 0;
}
