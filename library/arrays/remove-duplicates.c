/*
 * title: Squeeze out duplicates
 * level: 2
 * about: Removes repeated values from a sorted array in one pass using a read index and a write index.
 */
#include <stdio.h>

static void show(const char *label, const int *a, int n)
{
    int i;
    printf("%-7s", label);
    for (i = 0; i < n; i++)
        printf("%3d", a[i]);
    printf("   (%d values)\n", n);
}

/* Returns the new length. Nothing is shifted: 'w' marks the end of the
   kept part, and 'r' scouts ahead. Each element is read once, so the work
   grows in step with n rather than n*n. */
static int unique(int *a, int n)
{
    int r, w;
    if (n == 0)
        return 0;
    w = 1;                    /* a[0] is always kept */
    for (r = 1; r < n; r++) {
        if (a[r] != a[w - 1]) /* sorted, so repeats sit next to each other */
            a[w++] = a[r];
    }
    return w;
}

int main(void)
{
    int a[15] = { 1, 1, 2, 3, 3, 3, 4, 7, 7, 8, 9, 9, 9, 9, 12 };
    int n = 15;

    show("before", a, n);
    n = unique(a, n);
    show("after", a, n);
    /* The old values past the new end are still in memory; look at the
       array in See and you will see the stale tail. Only n says where the
       real data stops. */
    return 0;
}
