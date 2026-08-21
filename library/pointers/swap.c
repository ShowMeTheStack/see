/*
 * title: Why swap needs pointers
 * level: 1
 * about: Compares a swap that receives copies (and fails) with one that receives addresses (and works).
 */
#include <stdio.h>

/*
 * C passes arguments by value: a and b are fresh local variables that
 * start as copies of the caller's numbers. Swapping the copies leaves the
 * originals untouched. Step into this call (F11) and look at the stack:
 * swap_copies has its own a and b, separate from x and y in main.
 */
void swap_copies(int a, int b)
{
    int t = a;
    a = b;
    b = t;
    printf("  inside swap_copies: a = %d, b = %d\n", a, b);
}

/*
 * Here the caller hands over addresses. pa and pb are still copies, but
 * copies of addresses, so *pa and *pb are main's own x and y. In See,
 * the arrows from pa and pb cross the frame boundary into main.
 */
void swap(int *pa, int *pb)
{
    int t = *pa;
    *pa = *pb;
    *pb = t;
}

int main(void)
{
    int x = 3;
    int y = 8;

    printf("start:              x = %d, y = %d\n", x, y);

    swap_copies(x, y);
    printf("after swap_copies:  x = %d, y = %d   (nothing happened)\n", x, y);

    swap(&x, &y);
    printf("after swap:         x = %d, y = %d\n", x, y);

    /* The same function works for any two ints, even array elements. */
    {
        int row[4];
        row[0] = 10; row[1] = 20; row[2] = 30; row[3] = 40;
        swap(&row[0], &row[3]);
        swap(&row[1], &row[2]);
        printf("reversed row:       %d %d %d %d\n", row[0], row[1], row[2], row[3]);
    }
    return 0;
}
