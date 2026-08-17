/*
 * title: An array that grows on the heap
 * level: 3
 * about: Reads numbers of unknown count into a malloc'd array that doubles its capacity with realloc whenever it fills up.
 * input: 5 8 13 21 34 55 89 144 233 377 610
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *a = NULL;   /* the array lives on the heap; only the pointer is on the stack */
    int len = 0;     /* how many slots are in use */
    int cap = 0;     /* how many slots are paid for */
    int x, i;
    long sum = 0;

    while (scanf("%d", &x) == 1) {
        if (len == cap) {
            /* Doubling, rather than adding one slot at a time, means the
               copying done by realloc averages out to a constant cost per
               element. Step over the realloc (F10) and watch the heap: the
               old block disappears and a bigger one takes its place. */
            int newcap = cap ? cap * 2 : 2;
            int *bigger = realloc(a, newcap * sizeof *a);
            if (bigger == NULL) {
                /* Assigning straight to a would lose the old block if
                   realloc failed; the temporary keeps it safe to free. */
                free(a);
                printf("out of memory\n");
                return 0;
            }
            printf("grow: %d -> %d slots, block now at %p\n", cap, newcap, (void *)bigger);
            a = bigger;
            cap = newcap;
        }
        a[len++] = x;
    }

    for (i = 0; i < len; i++)
        sum += a[i];
    printf("read %d numbers into %d slots, sum %ld\n", len, cap, sum);
    printf("last three: %d %d %d\n", a[len - 3], a[len - 2], a[len - 1]);

    free(a);   /* one malloc'd block, one free; See reports any leak at exit */
    return 0;
}
