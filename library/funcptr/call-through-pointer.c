/*
 * title: Calling a function through a pointer
 * level: 1
 * about: Stores the addresses of three small functions in one pointer variable in turn and calls each through it.
 */
#include <stdio.h>

int twice(int x)  { return 2 * x; }
int square(int x) { return x * x; }
int negate(int x) { return -x; }

int main(void)
{
    /*
     * Read the declaration from the name outwards:
     *   f            f is
     *   (*f)         a pointer
     *   (*f)(int)    to a function taking an int
     *   int (*f)(int)  and returning an int.
     * The brackets around *f matter: int *f(int) would declare a
     * function returning a pointer to int.
     */
    int (*f)(int);
    int x = 7;

    /*
     * A function's name, used on its own, turns into its address, just
     * as an array name turns into the address of its first element.
     * So "f = twice" and "f = &twice" mean the same thing.
     * In See's frame, watch f: its value is the address of the code.
     */
    f = twice;
    printf("twice(%d)  = %d\n", x, f(x));

    f = &square;
    printf("square(%d) = %d\n", x, (*f)(x));   /* (*f)(x) and f(x) are the same call */

    f = negate;
    printf("negate(%d) = %d\n", x, f(x));

    /* Pointers to functions can be compared like any other pointers. */
    if (f == negate)
        printf("f now points at negate\n");

    /* Applying them one after another: f decides what happens. */
    f = square;
    x = f(f(2));
    printf("square(square(2)) = %d\n", x);
    return 0;
}
