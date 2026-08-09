/*
 * title: Swapping two variables
 * level: 1
 * about: Swaps two ints the wrong way, the right way with a third variable, and with arithmetic tricks.
 */
#include <stdio.h>

int main(void)
{
    int a = 3;
    int b = 8;
    int temp;

    printf("start:          a = %d, b = %d\n", a, b);

    /*
     * The wrong way. After a = b both hold 8, and the 3 is gone for good,
     * so b = a just copies 8 back. Step through in See and watch the 3
     * disappear from a's box.
     */
    a = b;
    b = a;
    printf("wrong swap:     a = %d, b = %d\n", a, b);

    /* Start again. */
    a = 3;
    b = 8;

    /* The right way: park one value in a third variable first, like
       swapping the contents of two cups with the help of an empty one. */
    temp = a;
    a = b;
    b = temp;
    printf("with temp:      a = %d, b = %d\n", a, b);

    /*
     * A swap without a third variable, using addition and subtraction.
     * It is a well-known puzzle; it is not faster, it is harder to read,
     * and with big values the sum could overflow. Use temp in real code.
     */
    a = a + b;   /* a holds the sum           */
    b = a - b;   /* sum minus old b = old a   */
    a = a - b;   /* sum minus old a = old b   */
    printf("with + and -:   a = %d, b = %d\n", a, b);

    /* The same idea with exclusive or, which cannot overflow. */
    a = a ^ b;
    b = a ^ b;
    a = a ^ b;
    printf("with ^:         a = %d, b = %d\n", a, b);
    return 0;
}
