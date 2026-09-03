/*
 * title: Bubble sort with an early exit
 * level: 1
 * about: Sorts ten numbers by swapping neighbours, printing each pass and counting comparisons and swaps.
 */
#include <stdio.h>

#define N 10

/* Print the array on one line, with a label in front. */
void show(const char *label, int a[], int n)
{
    int i;
    printf("%-9s", label);
    for (i = 0; i < n; i++)
        printf(" %3d", a[i]);
    printf("\n");
}

int main(void)
{
    int a[N] = { 42, 7, 19, 3, 88, 25, 61, 7, 14, 50 };
    int pass, i, tmp;
    int swapped;
    long comparisons = 0, swaps = 0;
    char label[16];

    show("start", a, N);

    /*
     * Each pass walks from the left and swaps any pair that is out of order.
     * The biggest value still unsorted "bubbles" to the right end, so after
     * pass k the last k cells are final and the inner loop can stop earlier.
     */
    for (pass = 1; pass < N; pass++) {
        swapped = 0;
        for (i = 0; i < N - pass; i++) {
            comparisons++;
            if (a[i] > a[i + 1]) {
                /* Watch a[i] and a[i+1] change places in the stack frame. */
                tmp = a[i];
                a[i] = a[i + 1];
                a[i + 1] = tmp;
                swaps++;
                swapped = 1;
            }
        }
        sprintf(label, "pass %d", pass);
        show(label, a, N);

        /*
         * A pass with no swaps proves the array is sorted. Without this
         * test bubble sort always does all N-1 passes, even on sorted data.
         */
        if (!swapped) {
            printf("no swaps in pass %d, so the array is already sorted\n", pass);
            break;
        }
    }

    printf("comparisons: %ld, swaps: %ld\n", comparisons, swaps);
    printf("the worst case for %d items would be %d comparisons\n", N, N * (N - 1) / 2);
    return 0;
}
