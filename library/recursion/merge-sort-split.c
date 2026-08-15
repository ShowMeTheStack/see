/*
 * title: Merge sort, watching it split and join
 * level: 3
 * about: Sorts an array with recursive merge sort, printing each split on the way down and each merge on the way up, using one heap buffer.
 */
#include <stdio.h>
#include <stdlib.h>

void show(const char *what, const int *a, int lo, int hi, int depth)
{
    int i;

    printf("%*s%s", depth * 2, "", what);
    for (i = lo; i <= hi; i++)
        printf(" %d", a[i]);
    printf("\n");
}

/* Merge the sorted runs a[lo..mid] and a[mid+1..hi] through tmp. */
void merge(int *a, int *tmp, int lo, int mid, int hi)
{
    int i = lo, j = mid + 1, k = lo;

    while (i <= mid && j <= hi)
        tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];  /* <= keeps it stable */
    while (i <= mid)
        tmp[k++] = a[i++];
    while (j <= hi)
        tmp[k++] = a[j++];
    for (k = lo; k <= hi; k++)
        a[k] = tmp[k];
}

/* Divide and conquer: a run of one is already sorted (the base case);
   anything longer is cut in half, both halves sorted by recursive
   calls, then merged. The depth is about log2(n), so the stack stays
   short, while the work per level is n. */
void sort(int *a, int *tmp, int lo, int hi, int depth)
{
    int mid;

    if (lo >= hi)
        return;
    mid = lo + (hi - lo) / 2;
    show("split", a, lo, hi, depth);
    sort(a, tmp, lo, mid, depth + 1);
    sort(a, tmp, mid + 1, hi, depth + 1);
    merge(a, tmp, lo, mid, hi);
    show("merged", a, lo, hi, depth);
}

int main(void)
{
    int a[10];
    int *tmp;
    int i, n = 10;

    srand(7);
    for (i = 0; i < n; i++)
        a[i] = rand() % 100;

    /* One scratch buffer, allocated once and shared by every call,
       instead of a new one per merge. Every frame of sort holds the
       same tmp pointer: in See they all point at one heap block. */
    tmp = (int *)malloc(n * sizeof *tmp);
    if (tmp == NULL)
        return 1;

    show("start:", a, 0, n - 1, 0);
    sort(a, tmp, 0, n - 1, 0);
    show("sorted:", a, 0, n - 1, 0);
    free(tmp);
    return 0;
}
