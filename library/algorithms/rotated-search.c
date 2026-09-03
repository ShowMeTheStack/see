/*
 * title: Searching a rotated sorted array
 * level: 3
 * about: Finds the rotation point of a sorted array that has been turned around, then searches it in logarithmic time.
 * input: 3 18 25 1 40
 */
#include <stdio.h>

/*
 * The array was sorted from 1 to 39, then rotated so it starts at 18.
 * The smallest item is where the "step down" is. Binary search finds it:
 * if a[mid] > a[hi], the step is somewhere to the right of mid.
 */
int find_rotation(const int a[], int n)
{
    int lo = 0, hi = n - 1, mid;
    while (lo < hi) {
        mid = lo + (hi - lo) / 2;
        if (a[mid] > a[hi])
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}

/*
 * Search the rotated array by searching the "logical" sorted array:
 * logical index k lives at physical index (k + rot) % n. The usual
 * binary search runs on k and translates on every probe.
 */
int search(const int a[], int n, int rot, int key)
{
    int lo = 0, hi = n - 1, k, p;
    while (lo <= hi) {
        k = lo + (hi - lo) / 2;
        p = (k + rot) % n;
        printf("  logical %2d -> a[%2d] = %d\n", k, p, a[p]);
        if (a[p] == key)
            return p;
        if (a[p] < key)
            lo = k + 1;
        else
            hi = k - 1;
    }
    return -1;
}

int main(void)
{
    int a[] = { 18, 19, 21, 25, 28, 31, 39, 1, 3, 5, 8, 11, 12, 15 };
    int n = sizeof a / sizeof a[0];
    int rot, key, at;

    rot = find_rotation(a, n);
    printf("smallest item a[%d] = %d, so the array was rotated by %d\n\n", rot, a[rot], rot);

    while (scanf("%d", &key) == 1) {
        printf("search %d:\n", key);
        at = search(a, n, rot, key);
        if (at >= 0)
            printf("  found at index %d\n", at);
        else
            printf("  not present\n");
    }
    return 0;
}
