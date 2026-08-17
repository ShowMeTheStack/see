/*
 * title: Class register with parallel arrays
 * level: 1
 * about: Keeps names, ages and scores in three arrays that share an index, then prints a report.
 * input: 4\nAsha 12 88\nBen 13 72\nChloe 12 95\nDev 14 64\n
 */
#include <stdio.h>

#define MAX 10

int main(void)
{
    /* Three arrays, one per column of the register. Student i is
       name[i], age[i] and score[i]: the index ties them together.
       A struct would hold one student in one place; this older style is
       still common and easy to see in the memory picture. */
    char name[MAX][16];
    int age[MAX];
    int score[MAX];
    int n, i, best = 0;
    long total = 0;

    if (scanf("%d", &n) != 1 || n < 1 || n > MAX) {
        printf("bad count\n");
        return 0;
    }
    for (i = 0; i < n; i++) {
        /* %15s: at most 15 letters, leaving room for the NUL in 16 bytes. */
        if (scanf("%15s %d %d", name[i], &age[i], &score[i]) != 3) {
            printf("bad line %d\n", i + 1);
            return 0;
        }
    }

    printf("%-8s %4s %6s\n", "name", "age", "score");
    for (i = 0; i < n; i++) {
        printf("%-8s %4d %6d\n", name[i], age[i], score[i]);
        total += score[i];
        if (score[i] > score[best])
            best = i;
    }
    /* best is one index, and it unlocks every column for that student. */
    printf("top: %s, age %d, with %d\n", name[best], age[best], score[best]);
    printf("class average: %.1f\n", (double)total / n);
    return 0;
}
