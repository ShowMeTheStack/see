/*
 * title: Merging two sorted lists with three pointers
 * level: 2
 * about: Merges two sorted arrays into a third by advancing whichever input pointer holds the smaller value.
 */
#include <stdio.h>

/*
 * a and b read, out writes. Each pointer moves only forward, so the
 * whole merge touches every element exactly once.
 */
int merge(const int *a, const int *a_end, const int *b, const int *b_end, int *out)
{
    int *start = out;
    while (a < a_end && b < b_end) {
        if (*a <= *b)
            *out++ = *a++;
        else
            *out++ = *b++;
    }
    /* One input is used up; copy whatever is left of the other. */
    while (a < a_end)
        *out++ = *a++;
    while (b < b_end)
        *out++ = *b++;
    return (int)(out - start);
}

int main(void)
{
    int odd[5];
    int sq[4];
    int both[9];
    int i, n;

    for (i = 0; i < 5; i++) odd[i] = 2 * i + 1;    /* 1 3 5 7 9 */
    for (i = 0; i < 4; i++) sq[i] = (i + 1) * (i + 1); /* 1 4 9 16 */

    /*
     * Step into merge and keep an eye on the three arrows: one in odd,
     * one in sq, one in both. Each step exactly one input arrow and the
     * output arrow move.
     */
    n = merge(odd, odd + 5, sq, sq + 4, both);

    printf("merged %d values:", n);
    for (i = 0; i < n; i++)
        printf(" %d", both[i]);
    printf("\n");

    /* The "end" pointers make sub-ranges easy: merge just the middle parts. */
    n = merge(odd + 1, odd + 3, sq + 1, sq + 2, both);
    printf("middles:");
    for (i = 0; i < n; i++)
        printf(" %d", both[i]);
    printf("\n");
    return 0;
}
