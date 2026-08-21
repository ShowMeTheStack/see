/*
 * title: Sorting an array of pointers
 * level: 2
 * about: Sorts pointers to ints instead of the ints themselves, so the original array keeps its order.
 */
#include <stdio.h>

#define N 6

int main(void)
{
    int scores[N];
    int *view[N];       /* an array of six pointers, each aimed at a score */
    int i, j;
    int *t;

    scores[0] = 72; scores[1] = 95; scores[2] = 61;
    scores[3] = 88; scores[4] = 95; scores[5] = 70;

    /* At first view[i] points at scores[i]: six parallel arrows. */
    for (i = 0; i < N; i++)
        view[i] = &scores[i];

    /*
     * Insertion sort on the pointers, comparing the ints they point to.
     * Only arrows move; the numbers stay put. Step through and watch the
     * arrows from view cross over each other in the memory picture.
     */
    for (i = 1; i < N; i++) {
        t = view[i];
        for (j = i; j > 0 && *view[j - 1] < *t; j--)
            view[j] = view[j - 1];
        view[j] = t;
    }

    printf("ranking:  ");
    for (i = 0; i < N; i++)
        printf("%d ", *view[i]);
    printf("\n");

    /* The original order is untouched, and each pointer still knows where its score came from. */
    printf("original: ");
    for (i = 0; i < N; i++)
        printf("%d ", scores[i]);
    printf("\n");

    for (i = 0; i < N; i++)
        printf("place %d: score %d from seat %ld\n", i + 1, *view[i], (long)(view[i] - scores));

    /* A change through a pointer reaches the real score. */
    *view[N - 1] += 5;
    printf("bonus for the last place: scores[%ld] is now %d\n",
           (long)(view[N - 1] - scores), *view[N - 1]);
    return 0;
}
