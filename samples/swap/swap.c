/* swap.c: why swap needs pointers.
   Debug it (F5) and step into both swaps (F11). Watch the frames:
   swap_values gets copies of a and b, swap_pointed gets their addresses. */
#include <stdio.h>

void swap_values(int x, int y)
{
    int t = x;      /* x and y are this frame's own copies */
    x = y;
    y = t;          /* only the copies changed */
}

void swap_pointed(int *x, int *y)
{
    int t = *x;     /* follow the arrows back into main's frame */
    *x = *y;
    *y = t;         /* main's a and b really change */
}

int main(void)
{
    int a = 1, b = 2;

    swap_values(a, b);
    printf("after swap_values:  a = %d, b = %d\n", a, b);
    swap_pointed(&a, &b);
    printf("after swap_pointed: a = %d, b = %d\n", a, b);
    return 0;
}
