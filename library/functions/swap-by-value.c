/*
 * title: Why swap(a, b) does not swap
 * level: 1
 * about: Tries to swap two numbers with a by-value function, fails, then succeeds by passing their addresses.
 */
#include <stdio.h>

/* C passes every argument by value: the function gets its own copies.
   x and y below are brand new variables in swap_copies' frame, filled
   with the values of the caller's a and b. */
void swap_copies(int x, int y)
{
    int t;

    t = x;
    x = y;
    y = t;
    /* Pause here in See: x and y are swapped, but look one frame down
       at main - a and b have not moved at all. */
    printf("  inside swap_copies: x = %d, y = %d\n", x, y);
}

/* To change the caller's variables, pass their addresses instead.
   px and py are still copies, but copies of addresses, and following
   an address leads back into main's frame. */
void swap_through_pointers(int *px, int *py)
{
    int t;

    t = *px;
    *px = *py;   /* step over this (F10) and watch a change in main's frame */
    *py = t;
}

int main(void)
{
    int a = 3;
    int b = 7;

    printf("before:              a = %d, b = %d\n", a, b);

    swap_copies(a, b);
    printf("after swap_copies:   a = %d, b = %d\n", a, b);

    /* &a is the address of a. In the memory picture, px and py are
       drawn as arrows from swap_through_pointers' frame into main's. */
    swap_through_pointers(&a, &b);
    printf("after swap_through:  a = %d, b = %d\n", a, b);
    return 0;
}
