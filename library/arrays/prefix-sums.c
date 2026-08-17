/*
 * title: Prefix sums for range totals
 * level: 2
 * about: Builds a running-total array once so that any range sum is answered with one subtraction.
 * input: 0 6\n2 4\n5 5\n3 9\n
 */
#include <stdio.h>

#define N 10

int main(void)
{
    /* Daily rainfall in millimetres for ten days. */
    int rain[N] = { 4, 0, 12, 7, 0, 3, 18, 5, 0, 9 };
    /* pre[i] is the sum of rain[0] .. rain[i-1]. It has one more slot than
       rain, and pre[0] = 0 means "the sum of nothing". That extra slot is
       what makes every query a plain pre[b+1] - pre[a] with no special case. */
    int pre[N + 1];
    int i, a, b;

    pre[0] = 0;
    for (i = 0; i < N; i++)
        pre[i + 1] = pre[i] + rain[i];

    printf("day  ");
    for (i = 0; i < N; i++) printf("%4d", i);
    printf("\nrain ");
    for (i = 0; i < N; i++) printf("%4d", rain[i]);
    printf("\npre  ");
    for (i = 0; i <= N; i++) printf("%4d", pre[i]);
    printf("\n\n");

    /* Each query costs two array reads, however long the range is. A loop
       over the range would cost up to N additions per query. */
    while (scanf("%d %d", &a, &b) == 2) {
        if (a < 0 || b >= N || a > b) {
            printf("days %d..%d: not a valid range\n", a, b);
            continue;
        }
        printf("days %d..%d: pre[%d] - pre[%d] = %d - %d = %d mm\n",
               a, b, b + 1, a, pre[b + 1], pre[a], pre[b + 1] - pre[a]);
    }
    return 0;
}
