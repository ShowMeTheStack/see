/*
 * title: Counting sort of exam marks
 * level: 2
 * about: Sorts marks from 0 to 10 by counting how many of each there are, with no comparisons at all.
 * input: 7 3 10 5 7 7 0 9 3 5 8 6 7 10 4 -1
 */
#include <stdio.h>

#define MAXMARK 10
#define MAXN 100

int main(void)
{
    int marks[MAXN], sorted[MAXN];
    int count[MAXMARK + 1];
    int n = 0, m, i, k, running;

    /* Read marks until a negative number or the end of input. */
    while (n < MAXN && scanf("%d", &m) == 1 && m >= 0) {
        if (m > MAXMARK) {
            printf("ignoring %d, marks go from 0 to %d\n", m, MAXMARK);
            continue;
        }
        marks[n++] = m;
    }

    /* Step 1: count. count[k] is how many students scored k. */
    for (k = 0; k <= MAXMARK; k++)
        count[k] = 0;
    for (i = 0; i < n; i++)
        count[marks[i]]++;

    printf("mark  count  bar\n");
    for (k = 0; k <= MAXMARK; k++) {
        printf("%4d  %5d  ", k, count[k]);
        for (i = 0; i < count[k]; i++)
            putchar('#');
        putchar('\n');
    }

    /*
     * Step 2: turn counts into starting positions. After this loop,
     * count[k] is the index where the first k goes in the output.
     */
    running = 0;
    for (k = 0; k <= MAXMARK; k++) {
        int c = count[k];
        count[k] = running;
        running += c;
    }

    /*
     * Step 3: place each mark. Walking the input from left to right keeps
     * equal keys in their original order, which matters when the keys
     * are attached to records (radix sort relies on this).
     */
    for (i = 0; i < n; i++)
        sorted[count[marks[i]]++] = marks[i];

    printf("sorted:");
    for (i = 0; i < n; i++)
        printf(" %d", sorted[i]);
    printf("\n%d marks sorted without comparing any two of them\n", n);
    return 0;
}
