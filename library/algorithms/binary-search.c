/*
 * title: Binary search, guess by guess
 * level: 1
 * about: Looks up several numbers in a sorted array, printing every probe so you can see the range halve.
 * input: 37 4 96 50
 */
#include <stdio.h>

#define N 16

/*
 * Returns the index of key in a[0..n-1], or -1. The search keeps the
 * invariant "if key is anywhere, it is in a[lo..hi]" and halves that
 * range on every probe.
 */
int binary_search(const int a[], int n, int key)
{
    int lo = 0, hi = n - 1, mid;
    int probes = 0;

    while (lo <= hi) {
        /*
         * lo + (hi - lo) / 2 instead of (lo + hi) / 2: the same value,
         * but lo + hi can overflow when the array is huge. A famous bug
         * that sat in real libraries for years.
         */
        mid = lo + (hi - lo) / 2;
        probes++;
        printf("  probe %d: range [%2d..%2d], a[%2d] = %2d", probes, lo, hi, mid, a[mid]);
        if (a[mid] == key) {
            printf("  found\n");
            return mid;
        }
        if (a[mid] < key) {
            printf("  too small, go right\n");
            lo = mid + 1;
        } else {
            printf("  too big, go left\n");
            hi = mid - 1;
        }
    }
    printf("  range is empty after %d probes\n", probes);
    return -1;
}

int main(void)
{
    int a[N] = { 2, 5, 8, 12, 16, 23, 37, 38, 41, 50, 56, 62, 72, 77, 91, 96 };
    int key, at;

    /* 16 items: never more than 5 probes, because 2 to the 5th is 32 > 16. */
    while (scanf("%d", &key) == 1) {
        printf("looking for %d\n", key);
        at = binary_search(a, N, key);
        if (at >= 0)
            printf("%d is at index %d\n\n", key, at);
        else
            printf("%d is not in the array\n\n", key);
    }
    return 0;
}
