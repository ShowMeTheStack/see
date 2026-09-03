/*
 * title: First and last occurrence by binary search
 * level: 2
 * about: Finds where a run of equal values starts and ends in a sorted array, and so counts them in logarithmic time.
 */
#include <stdio.h>

/*
 * lower_bound: the first index whose value is >= key.
 * upper_bound: the first index whose value is >  key.
 * Both work on the half-open range [lo, hi) and never stop early on a
 * match: they keep squeezing until lo == hi. That is what makes them
 * find the edge of a run instead of some random member of it.
 */
int lower_bound(const int a[], int n, int key)
{
    int lo = 0, hi = n, mid;
    while (lo < hi) {
        mid = lo + (hi - lo) / 2;
        if (a[mid] < key)
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}

int upper_bound(const int a[], int n, int key)
{
    int lo = 0, hi = n, mid;
    while (lo < hi) {
        mid = lo + (hi - lo) / 2;
        if (a[mid] <= key)      /* the only difference: <= instead of < */
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}

int main(void)
{
    int a[] = { 1, 2, 2, 4, 4, 4, 4, 4, 7, 7, 9, 12, 12, 12, 15 };
    int n = sizeof a / sizeof a[0];
    int keys[] = { 4, 7, 12, 1, 15, 5, 0, 20 };
    int nk = sizeof keys / sizeof keys[0];
    int i, first, last;

    printf("index:");
    for (i = 0; i < n; i++)
        printf(" %2d", i);
    printf("\nvalue:");
    for (i = 0; i < n; i++)
        printf(" %2d", a[i]);
    printf("\n\n");

    for (i = 0; i < nk; i++) {
        first = lower_bound(a, n, keys[i]);
        last = upper_bound(a, n, keys[i]) - 1;
        if (first <= last)
            printf("%2d: first at %2d, last at %2d, appears %d time%s\n",
                   keys[i], first, last, last - first + 1,
                   last == first ? "" : "s");
        else
            /*
             * When the key is missing, lower_bound still tells you
             * something useful: where it would have to be inserted.
             */
            printf("%2d: absent, would be inserted at index %d\n", keys[i], first);
    }
    return 0;
}
