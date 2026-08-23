/*
 * title: A const that is new every time round
 * level: 2
 * about: Declares const locals inside a loop body to show that const means "not changed during its life", not "the same value forever".
 */
#include <stdio.h>

int main(void)
{
    int n;

    for (n = 1; n <= 6; n++) {
        /*
         * Each pass through this block creates fresh variables. square
         * and cube get new values every time, but within one pass they
         * cannot be changed. In See, step through and watch them appear
         * with new values on each iteration.
         */
        const int square = n * n;
        const int cube = square * n;
        const int is_even = (n % 2 == 0);

        printf("n=%d  square=%2d  cube=%3d  %s\n", n, square, cube, is_even ? "even" : "odd");

        /* square += 1;   error: assignment of read-only variable 'square' */
    }

    /*
     * The same goes for a const parameter: each call has its own copy,
     * initialised from the argument. const is about not changing a value
     * after it is set, which is why it is so useful for naming a
     * computed result you want to rely on for the rest of a block.
     */
    {
        const double fahrenheit = 98.6;
        const double celsius = (fahrenheit - 32.0) * 5.0 / 9.0;
        printf("%.1f F is %.1f C\n", fahrenheit, celsius);
    }
    return 0;
}
