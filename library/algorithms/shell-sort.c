/*
 * title: Shell sort with shrinking gaps
 * level: 2
 * about: Sorts with insertion sort over shrinking gaps (Knuth's 1, 4, 13, 40) and compares the cost with plain insertion sort.
 */
#include <stdio.h>
#include <stdlib.h>

#define N 40

static long comparisons;

/*
 * An insertion sort that only looks at items gap apart. With gap 1 it
 * is ordinary insertion sort. Large gaps move far-away items a long
 * way in one step, so by the time gap is 1 there is little left to do.
 */
void gap_insertion(int a[], int n, int gap)
{
    int i, j, key;
    for (i = gap; i < n; i++) {
        key = a[i];
        j = i - gap;
        while (j >= 0) {
            comparisons++;
            if (a[j] <= key)
                break;
            a[j + gap] = a[j];
            j -= gap;
        }
        a[j + gap] = key;
    }
}

void print_row(int a[], int n)
{
    int i;
    for (i = 0; i < n; i++)
        printf("%d%c", a[i], i == n - 1 ? '\n' : ' ');
}

int main(void)
{
    int a[N], b[N];
    int i, gap;
    long shell_cost, insertion_cost;

    srand(7);
    for (i = 0; i < N; i++)
        a[i] = b[i] = rand() % 100;

    printf("before: ");
    print_row(a, N);

    /* Find the largest gap in 1, 4, 13, 40, ... that is smaller than N. */
    gap = 1;
    while (gap < N / 3)
        gap = 3 * gap + 1;

    comparisons = 0;
    for (; gap >= 1; gap /= 3) {
        gap_insertion(a, N, gap);
        printf("after gap %2d, comparisons so far %ld\n", gap, comparisons);
    }
    shell_cost = comparisons;

    /* The same data, sorted with gap 1 only, for comparison. */
    comparisons = 0;
    gap_insertion(b, N, 1);
    insertion_cost = comparisons;

    printf("after:  ");
    print_row(a, N);
    printf("shell sort: %ld comparisons, plain insertion sort: %ld\n",
           shell_cost, insertion_cost);
    return 0;
}
