/*
 * title: Binary search on the answer
 * level: 3
 * about: Finds the smallest truck capacity that delivers all parcels in a given number of days, and an integer square root, by bisecting over possible answers.
 */
#include <stdio.h>

/*
 * Days needed to ship the parcels in order, if each day's load may not
 * exceed cap. Greedy: keep loading today's truck until the next parcel
 * would not fit.
 */
int days_needed(const int w[], int n, int cap)
{
    int days = 1, load = 0, i;
    for (i = 0; i < n; i++) {
        if (load + w[i] > cap) {
            days++;
            load = 0;
        }
        load += w[i];
    }
    return days;
}

/*
 * The trick: we are not searching an array, we are searching the range
 * of possible capacities. "Can it be done with capacity c?" is false
 * for small c and true for every c above some threshold, a monotone
 * yes/no question, so binary search finds the threshold.
 */
int min_capacity(const int w[], int n, int days)
{
    int lo = 0, hi = 0, mid, i;
    for (i = 0; i < n; i++) {
        if (w[i] > lo) lo = w[i];   /* must carry the heaviest parcel */
        hi += w[i];                 /* one day carries everything */
    }
    while (lo < hi) {
        mid = lo + (hi - lo) / 2;
        printf("  try capacity %3d: %d days\n", mid, days_needed(w, n, mid));
        if (days_needed(w, n, mid) <= days)
            hi = mid;               /* works; maybe something smaller works too */
        else
            lo = mid + 1;           /* too small */
    }
    return lo;
}

/* The same idea: the largest r with r*r <= x. */
long isqrt(long x)
{
    long lo = 0, hi = x < 46340 ? x : 46340, mid;   /* 46340^2 still fits in a long */
    while (lo < hi) {
        mid = lo + (hi - lo + 1) / 2;   /* round up, or lo = mid could loop forever */
        if (mid * mid <= x)
            lo = mid;
        else
            hi = mid - 1;
    }
    return lo;
}

int main(void)
{
    int parcels[] = { 3, 2, 2, 4, 1, 4, 7, 5, 1, 6 };
    int n = sizeof parcels / sizeof parcels[0];
    int days = 4, cap;
    long xs[] = { 0, 1, 15, 16, 17, 1000000, 2147395600L };
    int i;

    printf("parcels must ship in order within %d days\n", days);
    cap = min_capacity(parcels, n, days);
    printf("smallest capacity: %d (takes %d days)\n\n", cap, days_needed(parcels, n, cap));

    for (i = 0; i < (int)(sizeof xs / sizeof xs[0]); i++)
        printf("isqrt(%ld) = %ld\n", xs[i], isqrt(xs[i]));
    return 0;
}
