/*
 * title: One job, three loops
 * level: 1
 * about: Adds up 1 to 10 with a while loop, a for loop and a do-while loop, then shows where they differ.
 */
#include <stdio.h>

int main(void)
{
    int i, sum;

    /* while: set up, test, body, step. The four parts are spread out. */
    i = 1;
    sum = 0;
    while (i <= 10) {
        sum += i;
        i++;
    }
    printf("while:    sum = %d, i ended at %d\n", sum, i);

    /* for: the same four parts, gathered on one line. for (a; b; c) body
       behaves exactly like  a; while (b) { body c; }  */
    sum = 0;
    for (i = 1; i <= 10; i++)
        sum += i;
    printf("for:      sum = %d, i ended at %d\n", sum, i);

    /* do-while: the test comes after the body. */
    i = 1;
    sum = 0;
    do {
        sum += i;
        i++;
    } while (i <= 10);
    printf("do-while: sum = %d, i ended at %d\n", sum, i);

    /* Where they differ: start with a condition that is false at once.
       while and for run their body zero times; do-while runs it once. */
    i = 100;
    sum = 0;
    while (i <= 10) {
        sum += i;
        i++;
    }
    printf("start at 100, while:    sum = %d\n", sum);
    i = 100;
    sum = 0;
    do {
        sum += i;
        i++;
    } while (i <= 10);
    printf("start at 100, do-while: sum = %d\n", sum);
    return 0;
}
