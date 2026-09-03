/*
 * title: Sorting race with a comparison scoreboard
 * level: 3
 * about: Runs five sorting algorithms on random, sorted, reversed and nearly sorted data and prints a table of how many comparisons each needed.
 */
#include <stdio.h>
#include <stdlib.h>

#define N 200
#define NSORTS 5
#define NDATA 4

static long cmp_count;

/* Every algorithm compares through this one function, so counting is fair. */
int less(int a, int b)
{
    cmp_count++;
    return a < b;
}

void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }

void bubble(int a[], int n)
{
    int i, j, swapped = 1;
    for (i = 0; i < n - 1 && swapped; i++) {
        swapped = 0;
        for (j = 0; j < n - 1 - i; j++)
            if (less(a[j + 1], a[j])) { swap(&a[j], &a[j + 1]); swapped = 1; }
    }
}

void selection(int a[], int n)
{
    int i, j, m;
    for (i = 0; i < n - 1; i++) {
        m = i;
        for (j = i + 1; j < n; j++)
            if (less(a[j], a[m])) m = j;
        swap(&a[i], &a[m]);
    }
}

void insertion(int a[], int n)
{
    int i, j, key;
    for (i = 1; i < n; i++) {
        key = a[i];
        for (j = i - 1; j >= 0 && less(key, a[j]); j--)
            a[j + 1] = a[j];
        a[j + 1] = key;
    }
}

void merge_rec(int a[], int tmp[], int lo, int hi)
{
    int mid, i, j, k;
    if (hi - lo < 1) return;
    mid = (lo + hi) / 2;
    merge_rec(a, tmp, lo, mid);
    merge_rec(a, tmp, mid + 1, hi);
    i = lo; j = mid + 1; k = lo;
    while (i <= mid && j <= hi)
        tmp[k++] = less(a[j], a[i]) ? a[j++] : a[i++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    for (k = lo; k <= hi; k++) a[k] = tmp[k];
}

void merge(int a[], int n)
{
    int *tmp = malloc(n * sizeof *tmp);
    if (tmp == NULL) return;
    merge_rec(a, tmp, 0, n - 1);
    free(tmp);
}

/* Quicksort with the middle element as pivot (Hoare partition). */
void quick_rec(int a[], int lo, int hi)
{
    int pivot, i, j;
    if (lo >= hi) return;
    pivot = a[(lo + hi) / 2];
    i = lo - 1; j = hi + 1;
    for (;;) {
        do i++; while (less(a[i], pivot));
        do j--; while (less(pivot, a[j]));
        if (i >= j) break;
        swap(&a[i], &a[j]);
    }
    quick_rec(a, lo, j);
    quick_rec(a, j + 1, hi);
}

void quick(int a[], int n) { quick_rec(a, 0, n - 1); }

/* Fill a[] with one of four kinds of test data. */
void make_data(int a[], int kind)
{
    int i;
    srand(99);              /* the same "random" data every time */
    for (i = 0; i < N; i++) {
        switch (kind) {
        case 0: a[i] = rand() % 1000; break;
        case 1: a[i] = i; break;
        case 2: a[i] = N - i; break;
        default: a[i] = i; break;
        }
    }
    if (kind == 3)          /* nearly sorted: a few random swaps */
        for (i = 0; i < 5; i++)
            swap(&a[rand() % N], &a[rand() % N]);
}

int is_sorted(const int a[], int n)
{
    int i;
    for (i = 1; i < n; i++)
        if (a[i] < a[i - 1]) return 0;
    return 1;
}

int main(void)
{
    const char *sort_name[NSORTS] = { "bubble", "selection", "insertion", "merge", "quick" };
    const char *data_name[NDATA] = { "random", "sorted", "reversed", "nearly" };
    int a[N];
    int s, d;

    printf("comparisons to sort %d numbers\n", N);
    printf("%-10s", "");
    for (d = 0; d < NDATA; d++)
        printf("%10s", data_name[d]);
    printf("\n");

    for (s = 0; s < NSORTS; s++) {
        printf("%-10s", sort_name[s]);
        for (d = 0; d < NDATA; d++) {
            make_data(a, d);
            cmp_count = 0;
            /*
             * A switch picks the algorithm. The funcptr category shows
             * the neater way: an array of pointers to the sort functions.
             */
            switch (s) {
            case 0: bubble(a, N); break;
            case 1: selection(a, N); break;
            case 2: insertion(a, N); break;
            case 3: merge(a, N); break;
            default: quick(a, N); break;
            }
            printf("%9ld%c", cmp_count, is_sorted(a, N) ? ' ' : '!');
        }
        printf("\n");
    }
    printf("selection sort does the same work whatever the data;\n");
    printf("bubble and insertion sort love sorted input and hate reversed.\n");
    /*
     * Bubble sort does badly on "nearly" because a small item swapped
     * near the end creeps left only one place per pass (a "turtle").
     */
    printf("bubble sort stumbles on nearly sorted data: small items near\n");
    printf("the end move left only one place per pass.\n");
    return 0;
}
