/*
 * title: Quicksort, Lomuto against Hoare
 * level: 3
 * about: Sorts the same data with the Lomuto and Hoare partition schemes and compares comparisons, swaps and recursion depth.
 */
#include <stdio.h>
#include <stdlib.h>

#define N 30

static long comparisons, swaps;
static int depth, max_depth;

void swap(int *x, int *y)
{
    int t = *x;
    *x = *y;
    *y = t;
    swaps++;
}

/*
 * Lomuto: the last item is the pivot. Everything smaller is moved to
 * the front; the pivot is then dropped right after them, in its final
 * place.
 */
int lomuto(int a[], int lo, int hi)
{
    int pivot = a[hi];
    int i = lo, j;
    for (j = lo; j < hi; j++) {
        comparisons++;
        if (a[j] < pivot) {
            swap(&a[i], &a[j]);
            i++;
        }
    }
    swap(&a[i], &a[hi]);
    return i;
}

void quick_lomuto(int a[], int lo, int hi)
{
    int p;
    if (lo >= hi)
        return;
    if (++depth > max_depth)
        max_depth = depth;
    p = lomuto(a, lo, hi);
    quick_lomuto(a, lo, p - 1);
    quick_lomuto(a, p + 1, hi);
    depth--;
}

/*
 * Hoare: two fingers start at the ends and walk towards each other,
 * swapping a pair that is on the wrong sides. The pivot does not end in
 * its final place; the split point only says "everything up to here is
 * no bigger than everything after".
 */
int hoare(int a[], int lo, int hi)
{
    int pivot = a[lo + (hi - lo) / 2];
    int i = lo - 1, j = hi + 1;
    for (;;) {
        do { i++; comparisons++; } while (a[i] < pivot);
        do { j--; comparisons++; } while (a[j] > pivot);
        if (i >= j)
            return j;
        swap(&a[i], &a[j]);
    }
}

void quick_hoare(int a[], int lo, int hi)
{
    int p;
    if (lo >= hi)
        return;
    if (++depth > max_depth)
        max_depth = depth;
    p = hoare(a, lo, hi);
    quick_hoare(a, lo, p);
    quick_hoare(a, p + 1, hi);
    depth--;
}

void report(const char *name, int a[])
{
    int i;
    printf("%-7s comparisons %4ld, swaps %4ld, deepest recursion %2d\n",
           name, comparisons, swaps, max_depth);
    for (i = 1; i < N; i++)
        if (a[i - 1] > a[i]) {
            printf("        not sorted at %d!\n", i);
            return;
        }
}

void run(const char *title, int src[])
{
    int a[N];
    int i;

    printf("%s\n", title);

    for (i = 0; i < N; i++) a[i] = src[i];
    comparisons = swaps = 0; depth = max_depth = 0;
    quick_lomuto(a, 0, N - 1);
    report("Lomuto", a);

    for (i = 0; i < N; i++) a[i] = src[i];
    comparisons = swaps = 0; depth = max_depth = 0;
    quick_hoare(a, 0, N - 1);
    report("Hoare", a);
}

int main(void)
{
    int random_data[N], sorted_data[N];
    int i;

    srand(2024);
    for (i = 0; i < N; i++) {
        random_data[i] = rand() % 1000;
        sorted_data[i] = i * 10;
    }

    run("random data:", random_data);

    /*
     * Already sorted input is Lomuto's worst case: the last item is
     * always the maximum, every split is n-1 against 0 and the
     * recursion gets N deep. Most of its "swaps" there swap an item
     * with itself, because i and j move together. Hoare's middle
     * pivot is the true median here, so it stays shallow.
     */
    run("already sorted data:", sorted_data);
    return 0;
}
