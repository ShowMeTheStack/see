/*
 * title: Binary search, step by step
 * level: 2
 * about: Halves a sorted range at each step to find a value, printing the shrinking window.
 * input: 37 4 99 2
 */
#include <stdio.h>

#define N 16

static int bsearch_trace(const int *a, int n, int key)
{
    int lo = 0, hi = n - 1, mid;

    while (lo <= hi) {
        /* lo + (hi - lo) / 2 rather than (lo + hi) / 2: the same answer here,
           but it can never overflow when the indexes are huge. */
        mid = lo + (hi - lo) / 2;
        printf("   window [%2d..%2d]  look at a[%2d] = %2d\n", lo, hi, mid, a[mid]);
        if (a[mid] == key)
            return mid;
        if (a[mid] < key)
            lo = mid + 1;   /* key is to the right; throw away the left half */
        else
            hi = mid - 1;   /* key is to the left */
    }
    return -1;              /* the window closed: lo passed hi */
}

int main(void)
{
    int a[N] = { 2, 3, 5, 8, 13, 17, 21, 25, 30, 37, 41, 50, 64, 71, 85, 99 };
    int key, k, at;

    /* 16 elements means at most 5 looks: 16, 8, 4, 2, 1. */
    for (k = 0; k < 4 && scanf("%d", &key) == 1; k++) {
        printf("searching for %d\n", key);
        at = bsearch_trace(a, N, key);
        if (at >= 0)
            printf("   found at index %d\n", at);
        else
            printf("   not present\n");
    }
    return 0;
}
