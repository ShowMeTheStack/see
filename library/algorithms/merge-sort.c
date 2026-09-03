/*
 * title: Merge sort with one heap buffer
 * level: 3
 * about: Sorts recursively by splitting in halves and merging through a single malloc'd scratch array, tracing each merge.
 */
#include <stdio.h>
#include <stdlib.h>

static long comparisons = 0;

/*
 * Merge the sorted runs a[lo..mid] and a[mid+1..hi] into tmp, then copy
 * back. One scratch array, allocated once in main, is shared by every
 * call; allocating a fresh one in each call would also work but would
 * churn the heap.
 */
void merge(int a[], int tmp[], int lo, int mid, int hi)
{
    int i = lo, j = mid + 1, k = lo;

    while (i <= mid && j <= hi) {
        comparisons++;
        if (a[i] <= a[j])       /* <= takes from the left first: stable */
            tmp[k++] = a[i++];
        else
            tmp[k++] = a[j++];
    }
    while (i <= mid)
        tmp[k++] = a[i++];
    while (j <= hi)
        tmp[k++] = a[j++];
    for (k = lo; k <= hi; k++)
        a[k] = tmp[k];
}

/*
 * depth is only used for indenting the trace. Step into this function
 * (F11) a few times and watch the call stack grow: the depth never gets
 * past about log2(n) frames, even though there are about 2n calls.
 */
void merge_sort(int a[], int tmp[], int lo, int hi, int depth)
{
    int mid, k;
    if (lo >= hi)
        return;
    mid = lo + (hi - lo) / 2;
    merge_sort(a, tmp, lo, mid, depth + 1);
    merge_sort(a, tmp, mid + 1, hi, depth + 1);
    merge(a, tmp, lo, mid, hi);

    printf("%*smerged [%d..%d]:", depth * 2, "", lo, hi);
    for (k = lo; k <= hi; k++)
        printf(" %d", a[k]);
    printf("\n");
}

int main(void)
{
    int a[] = { 38, 27, 43, 3, 9, 82, 10, 55, 1, 70, 27 };
    int n = sizeof a / sizeof a[0];
    int *tmp;
    int i;

    /* Watch this block appear on the heap: n ints, as big as the array. */
    tmp = malloc(n * sizeof *tmp);
    if (tmp == NULL) {
        printf("out of memory\n");
        return 0;
    }

    merge_sort(a, tmp, 0, n - 1, 0);
    free(tmp);

    printf("sorted:");
    for (i = 0; i < n; i++)
        printf(" %d", a[i]);
    printf("\n%d items, %ld comparisons\n", n, comparisons);
    return 0;
}
