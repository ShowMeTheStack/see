/*
 * title: Selection sort on names
 * level: 1
 * about: Sorts an array of name pointers by repeatedly selecting the smallest, counting comparisons and swaps.
 */
#include <stdio.h>
#include <string.h>

#define N 8

int main(void)
{
    /*
     * The names themselves are string literals; the array only holds
     * pointers to them. In See's memory picture each cell of names[]
     * is an arrow into the string literal area. Sorting moves the
     * arrows, never the letters.
     */
    const char *names[N] = {
        "Priya", "Tom", "Ana", "Kofi", "Mei", "Lars", "Zoe", "Ben"
    };
    const char *tmp;
    int i, j, min;
    int comparisons = 0, swaps = 0;

    for (i = 0; i < N - 1; i++) {
        /* Find the smallest name in names[i..N-1]. */
        min = i;
        for (j = i + 1; j < N; j++) {
            comparisons++;
            if (strcmp(names[j], names[min]) < 0)
                min = j;
        }
        /*
         * Selection sort makes at most one swap per position, which is
         * why it is a good choice when moving an item is expensive.
         */
        if (min != i) {
            tmp = names[i];
            names[i] = names[min];
            names[min] = tmp;
            swaps++;
        }
        printf("position %d gets %-6s:", i, names[i]);
        for (j = 0; j < N; j++)
            printf(" %s", names[j]);
        printf("\n");
    }

    /*
     * The comparisons never depend on the data: always N*(N-1)/2.
     * Try sorting an already sorted list and the count stays 28.
     */
    printf("comparisons: %d, swaps: %d\n", comparisons, swaps);
    return 0;
}
