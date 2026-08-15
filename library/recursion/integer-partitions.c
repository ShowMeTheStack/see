/*
 * title: Ways to split a number into parts
 * level: 3
 * about: Lists every way to write a number as a sum of positive parts in non-increasing order, and counts partitions for larger numbers.
 */
#include <stdio.h>

/* parts[] holds the sum being built; len is how many parts so far.
   The recursion shares one array, each level writing one slot. */
int parts[20];
int len = 0;
int listed = 0;

/* Write n as a sum of parts, none bigger than max. Choosing the next
   part p (from max down to 1) leaves n - p to split with parts no
   bigger than p, which keeps every sum in decreasing order, so each
   partition appears once. */
void partitions(int n, int max)
{
    int p, i;

    if (n == 0) {
        listed++;
        printf("  ");
        for (i = 0; i < len; i++)
            printf(i ? " + %d" : "%d", parts[i]);
        printf("\n");
        return;
    }
    for (p = (n < max ? n : max); p >= 1; p--) {
        parts[len++] = p;     /* choose p ... */
        partitions(n - p, p);
        len--;                /* ... and take it back */
    }
}

/* Counting needs no list: count(n, max) is the number of partitions of
   n with parts at most max. Either the largest part is max, or every
   part is at most max - 1. */
long count(int n, int max)
{
    if (n == 0)
        return 1;
    if (n < 0 || max == 0)
        return 0;
    return count(n - max, max) + count(n, max - 1);
}

int main(void)
{
    int n;

    printf("the partitions of 6:\n");
    partitions(6, 6);
    printf("%d of them\n\n", listed);

    for (n = 1; n <= 30; n += (n < 10 ? 1 : 5))
        printf("p(%2d) = %ld\n", n, count(n, n));
    return 0;
}
