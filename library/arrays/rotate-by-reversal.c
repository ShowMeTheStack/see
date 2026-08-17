/*
 * title: Rotate an array with three reversals
 * level: 2
 * about: Rotates an array left by k places in place, using the reverse-reverse-reverse trick, and compares it with the naive method.
 */
#include <stdio.h>

static void show(const char *label, const int *a, int n)
{
    int i;
    printf("%-22s", label);
    for (i = 0; i < n; i++)
        printf("%3d", a[i]);
    printf("\n");
}

/* Reverse a[lo..hi], both ends included. */
static void reverse(int *a, int lo, int hi)
{
    int t;
    while (lo < hi) {
        t = a[lo]; a[lo] = a[hi]; a[hi] = t;
        lo++; hi--;
    }
}

/* Naive: shift everything left by one, k times. k*n moves in all. */
static void rotate_slow(int *a, int n, int k)
{
    int i, first;
    while (k-- > 0) {
        first = a[0];
        for (i = 0; i < n - 1; i++)
            a[i] = a[i + 1];
        a[n - 1] = first;
    }
}

int main(void)
{
    int a[10] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int b[10] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int n = 10, k = 3;

    show("start", a, n);
    /* Think of the array as two blocks, X = first k, Y = the rest. We want
       Y X. Reversing X and Y separately, then the whole thing, gives it:
       rev(rev(X) rev(Y)) = Y X.  About 2n swaps, no extra array. */
    reverse(a, 0, k - 1);
    show("reverse first 3", a, n);
    reverse(a, k, n - 1);
    show("reverse the other 7", a, n);
    reverse(a, 0, n - 1);
    show("reverse it all", a, n);

    rotate_slow(b, n, k);
    show("naive method agrees", b, n);
    return 0;
}
