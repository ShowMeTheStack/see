/*
 * title: Insertion sort, like sorting cards
 * level: 2
 * about: Reads numbers and inserts each one into the sorted part on its left, counting comparisons and shifts.
 * input: 9\n31 41 59 26 53 58 97 93 23
 */
#include <stdio.h>

#define MAX 50

int main(void)
{
    int a[MAX];
    int n, i, j, key;
    int comparisons = 0, shifts = 0;

    if (scanf("%d", &n) != 1 || n < 1 || n > MAX) {
        printf("expected a count between 1 and %d\n", MAX);
        return 0;
    }
    for (i = 0; i < n; i++)
        if (scanf("%d", &a[i]) != 1)
            a[i] = 0;

    /*
     * a[0..i-1] is always sorted. Take a[i] out into key, slide the
     * bigger items one place to the right, and drop key in the hole.
     * In See, watch key in the frame: it holds the "card in your hand"
     * while the array has one duplicated cell during the shifting.
     */
    for (i = 1; i < n; i++) {
        key = a[i];
        j = i - 1;
        while (j >= 0) {
            comparisons++;
            if (a[j] <= key)
                break;          /* found the place; <= keeps equal items in order (stable) */
            a[j + 1] = a[j];
            shifts++;
            j--;
        }
        a[j + 1] = key;

        printf("insert %3d:", key);
        for (j = 0; j < n; j++)
            printf(j == i ? " %3d |" : " %3d", a[j]);
        printf("\n");
    }

    /*
     * On nearly sorted input insertion sort does almost no work, which is
     * why real libraries use it for short runs inside faster sorts.
     */
    printf("comparisons: %d, shifts: %d\n", comparisons, shifts);
    return 0;
}
