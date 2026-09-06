/*
 * title: Spying on qsort with a counting comparator
 * level: 2
 * about: Wraps a comparison function in another one that counts calls, to measure how much work qsort and bsearch do on inputs of different sizes.
 */
#include <stdio.h>
#include <stdlib.h>

static long calls = 0;

/* The real comparison. */
int compare_ints(const void *a, const void *b)
{
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

/*
 * The spy has exactly the same type, so qsort accepts it. It counts,
 * then hands the work to whichever comparison it is wrapping.
 */
static int (*wrapped)(const void *, const void *) = compare_ints;

int counting(const void *a, const void *b)
{
    calls++;
    return wrapped(a, b);
}

int main(void)
{
    int sizes[] = { 10, 100, 1000 };
    int *a;
    int s, i, n, key, steps;
    long sort_calls;

    srand(11);
    printf("%6s %12s %16s %16s\n", "n", "qsort calls", "calls per item", "bsearch calls");
    for (s = 0; s < 3; s++) {
        n = sizes[s];
        a = malloc(n * sizeof *a);
        if (a == NULL)
            return 0;
        for (i = 0; i < n; i++)
            a[i] = rand() % 10000;

        calls = 0;
        qsort(a, n, sizeof *a, counting);
        sort_calls = calls;

        /* Look up 100 values that are present, and average the calls. */
        calls = 0;
        for (steps = 0; steps < 100; steps++) {
            key = a[rand() % n];
            if (bsearch(&key, a, n, sizeof *a, counting) == NULL)
                printf("lost %d!\n", key);
        }
        /*
         * Expect qsort to need roughly n * log2(n) comparisons and
         * bsearch about log2(n) for each lookup.
         */
        printf("%6d %12ld %16.1f %16.1f\n", n, sort_calls,
               (double)sort_calls / n, calls / 100.0);
        free(a);
    }
    return 0;
}
