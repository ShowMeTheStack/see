/*
 * title: Binary search, two ways
 * level: 2
 * about: Searches a sorted array by halving the range, once with two tests per step as in the book and once with one, and counts the probes.
 */
#include <stdio.h>

int probes;

/* Find x in v[0] <= v[1] <= ... <= v[n-1]; return its index or -1.
   low and high bound the part of the array where x could still be.
   Each step looks at the middle and throws away the half that cannot
   contain x, so a million elements need only about 20 steps. */
int binsearch(int x, const int v[], int n)
{
    int low = 0, high = n - 1, mid;

    while (low <= high) {
        mid = (low + high) / 2;
        probes++;
        if (x < v[mid])
            high = mid - 1;
        else if (x > v[mid])
            low = mid + 1;
        else
            return mid;     /* found it */
    }
    return -1;
}

/* Exercise 3-1: only one comparison inside the loop. It shrinks the
   range until one element is left and checks for equality at the end. */
int binsearch1(int x, const int v[], int n)
{
    int low = 0, high = n - 1, mid;

    while (low < high) {
        mid = (low + high) / 2;
        probes++;
        if (x <= v[mid])
            high = mid;
        else
            low = mid + 1;
    }
    return (n > 0 && v[low] == x) ? low : -1;
}

int main(void)
{
    int v[50];
    int targets[5];
    int i, at;

    /* The squares 0, 1, 4, 9 ... are sorted, which binary search needs. */
    for (i = 0; i < 50; i++)
        v[i] = i * i;
    targets[0] = 0;
    targets[1] = 49;
    targets[2] = 2401;
    targets[3] = 50;
    targets[4] = 1600;

    for (i = 0; i < 5; i++) {
        probes = 0;
        at = binsearch(targets[i], v, 50);
        printf("%5d: index %3d after %d probes", targets[i], at, probes);
        probes = 0;
        at = binsearch1(targets[i], v, 50);
        printf("   one-test version: index %3d after %d probes\n", at, probes);
    }
    return 0;
}
