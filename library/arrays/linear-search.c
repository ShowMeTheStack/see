/*
 * title: Find a locker number
 * level: 1
 * about: Searches an unsorted array from the front for each number typed, counting the comparisons.
 * input: 42 7 100 -1
 */
#include <stdio.h>

/* Returns the index of key, or -1 if it is not there. -1 can never be a
   real index, so it makes a safe "not found" signal. */
static int find(const int *a, int n, int key, int *steps)
{
    int i;
    *steps = 0;
    for (i = 0; i < n; i++) {
        (*steps)++;
        if (a[i] == key)
            return i;      /* stop at the first match */
    }
    return -1;
}

int main(void)
{
    int lockers[12] = { 15, 3, 88, 42, 61, 7, 29, 50, 73, 12, 94, 36 };
    int key, at, steps;

    /* Read until the user types a negative number. */
    while (scanf("%d", &key) == 1 && key >= 0) {
        at = find(lockers, 12, key, &steps);
        if (at >= 0)
            printf("%3d found at index %2d after %2d comparisons\n", key, at, steps);
        else
            printf("%3d not here; checked all %d lockers\n", key, steps);
    }
    /* A miss always costs the full 12 comparisons. Sorting the array first
       would let a binary search answer in about 4. */
    return 0;
}
