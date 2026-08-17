/*
 * title: Reverse an array in place
 * level: 1
 * about: Reverses an array by swapping from both ends towards the middle, printing each step.
 */
#include <stdio.h>

static void show(const int *a, int n)
{
    int i;
    for (i = 0; i < n; i++)
        printf("%3d", a[i]);
    printf("\n");
}

int main(void)
{
    int a[9] = { 10, 20, 30, 40, 50, 60, 70, 80, 90 };
    int n = 9;
    int left = 0;
    int right = n - 1;
    int tmp;

    show(a, n);
    /* Two indexes walk towards each other. When they meet (odd length) or
       cross (even length) every pair has been swapped exactly once.
       Watch left and right in the locals panel close in on each other. */
    while (left < right) {
        tmp = a[left];        /* a swap needs a third box to hold one value */
        a[left] = a[right];
        a[right] = tmp;
        left++;
        right--;
        show(a, n);
    }
    /* The loop ran n/2 = 4 times; the middle element 50 never moved. */
    return 0;
}
