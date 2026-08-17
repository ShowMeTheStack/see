/*
 * title: Sorting three colours in one pass
 * level: 3
 * about: Arranges red, white and blue marbles into order with Dijkstra's Dutch national flag partition, showing the three regions as it goes.
 */
#include <stdio.h>

enum { RED, WHITE, BLUE };

static void show(const int *a, int n, int lo, int mid, int hi)
{
    int i;
    const char *letter = "RWB";
    for (i = 0; i < n; i++) {
        /* Brackets mark the part not yet looked at, a[mid..hi]. */
        if (i == mid && mid <= hi) putchar('[');
        putchar(letter[a[i]]);
        if (i == hi && mid <= hi) putchar(']');
    }
    if (mid > hi) printf(" done");
    printf("   lo=%d mid=%d hi=%d\n", lo, mid, hi);
}

int main(void)
{
    int a[14] = { BLUE, RED, WHITE, WHITE, BLUE, RED, RED, BLUE, WHITE, RED, BLUE, WHITE, RED, WHITE };
    int n = 14;
    int lo = 0, mid = 0, hi = n - 1, t;

    /* Rule kept true at every step:
         a[0 .. lo-1]    are RED
         a[lo .. mid-1]  are WHITE
         a[mid .. hi]    not looked at yet (shown in brackets)
         a[hi+1 .. n-1]  are BLUE
       Each step shrinks the unknown part by one, so n steps in all. */
    show(a, n, lo, mid, hi);
    while (mid <= hi) {
        if (a[mid] == RED) {
            t = a[lo]; a[lo] = a[mid]; a[mid] = t;
            lo++; mid++;
        } else if (a[mid] == WHITE) {
            mid++;
        } else {
            /* Do not advance mid: the marble swapped in from hi has not
               been looked at yet. */
            t = a[hi]; a[hi] = a[mid]; a[mid] = t;
            hi--;
        }
        show(a, n, lo, mid, hi);
    }
    return 0;
}
