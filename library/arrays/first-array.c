/*
 * title: Five numbers in a row
 * level: 1
 * about: Fills an array of five ints, prints each element with its address, and adds them up.
 */
#include <stdio.h>

int main(void)
{
    /* Five ints side by side in memory. The initialiser fills them in order:
       marks[0] is 72, marks[4] is 90. Watch the stack in See: one block of
       20 bytes appears, split into five 4-byte boxes. */
    int marks[5] = { 72, 85, 64, 98, 90 };
    int i;
    int total = 0;

    for (i = 0; i < 5; i++) {
        /* &marks[i] is the address of box i. Each one is 4 higher than the
           last, because an int takes 4 bytes on this machine. */
        printf("marks[%d] = %3d  lives at %p\n", i, marks[i], (void *)&marks[i]);
        total += marks[i];
    }

    /* The last valid index is 4, not 5. An array of N things runs from 0 to
       N-1, which is why the loop says i < 5 and never i <= 5. */
    printf("total   = %d\n", total);
    printf("average = %d (integer division drops the fraction)\n", total / 5);
    printf("average = %.1f (convert to double first to keep it)\n", (double)total / 5);

    /* Change one element: only that box changes in the stack picture. */
    marks[2] = marks[2] + 10;
    printf("after a regrade, marks[2] = %d\n", marks[2]);
    return 0;
}
