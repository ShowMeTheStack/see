/*
 * title: Big functions built from tiny ones
 * level: 1
 * about: Writes one-line helpers like max2, clamp and sign, then builds larger answers by calling them from each other.
 */
#include <stdio.h>

/* Each helper is so short it is obviously right. Bigger ones are made
   by calling smaller ones, so they are obviously right too. */

int max2(int a, int b)
{
    return a > b ? a : b;
}

int min2(int a, int b)
{
    return a < b ? a : b;
}

/* max3 reuses max2 twice instead of repeating the comparisons. */
int max3(int a, int b, int c)
{
    return max2(max2(a, b), c);
}

int abs_value(int x)
{
    return x < 0 ? -x : x;
}

/* -1, 0 or +1. Comparisons give 1 or 0, so their difference works. */
int sign(int x)
{
    return (x > 0) - (x < 0);
}

/* Keep x inside [lo, hi]: no lower than lo, no higher than hi. */
int clamp(int x, int lo, int hi)
{
    return min2(max2(x, lo), hi);
}

/* Distance between two numbers on the number line. */
int distance(int a, int b)
{
    return abs_value(a - b);
}

/* Which of a and b is nearer to target? Built from distance. */
int nearer(int target, int a, int b)
{
    return distance(target, a) <= distance(target, b) ? a : b;
}

int main(void)
{
    int t;

    printf("max3(4, 19, 7)    = %d\n", max3(4, 19, 7));
    printf("sign(-8), sign(0), sign(5) = %d, %d, %d\n", sign(-8), sign(0), sign(5));
    printf("distance(-3, 4)   = %d\n", distance(-3, 4));

    /* clamp calls max2 and min2. Press F11 on this line and step
       through: each little frame appears and vanishes in turn. */
    for (t = -20; t <= 140; t += 40)
        printf("volume %4d clamped to 0..100 is %3d\n", t, clamp(t, 0, 100));

    printf("nearer to 10: 6 or 13? %d\n", nearer(10, 6, 13));
    printf("nearer to 10: 7 or 13? %d (a tie goes to the first)\n", nearer(10, 7, 13));
    return 0;
}
