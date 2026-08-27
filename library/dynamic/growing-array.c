/*
 * title: A growing array that moves
 * level: 2
 * about: Reads numbers of unknown count into an array that doubles its capacity with realloc, printing the block's address each time it grows.
 * input: 4 8 15 16 23 42 7 11 99 3 5 60 1 2 77 18 90
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *items = NULL;
    int count = 0, capacity = 0;
    int value, i;
    long sum = 0;

    while (scanf("%d", &value) == 1) {
        if (count == capacity) {
            /*
             * Full: double the capacity. realloc may grow the block where it
             * stands or move it somewhere bigger, copying the old contents.
             * Keep the result in a temporary: if realloc fails it returns
             * NULL and the old block is still ours to free. realloc(NULL, n)
             * behaves like malloc(n), so the very first growth needs no
             * special case.
             */
            int newcap = capacity == 0 ? 2 : capacity * 2;
            int *bigger = realloc(items, newcap * sizeof *items);
            if (bigger == NULL) {
                free(items);
                return 0;
            }
            if (items == NULL)
                printf("first block, %d slots, at %p\n", newcap, (void *)bigger);
            else if (bigger != items)
                printf("grew %2d -> %2d slots, block moved %p -> %p\n",
                       capacity, newcap, (void *)items, (void *)bigger);
            else
                printf("grew %2d -> %2d slots in place at %p\n",
                       capacity, newcap, (void *)bigger);
            items = bigger;
            capacity = newcap;
        }
        items[count++] = value;
    }

    /*
     * Doubling means the copying work stays small on average: 17 numbers
     * needed only five reallocs. Watch the heap panel: each old block is
     * freed as its contents move to the new one.
     */
    for (i = 0; i < count; i++)
        sum += items[i];
    printf("%d numbers in %d slots, sum %ld\n", count, capacity, sum);

    free(items);
    return 0;
}
