/*
 * title: Four star triangles
 * level: 1
 * about: Draws four right-angled triangles of stars, each turned a different way, with nested loops.
 */
#include <stdio.h>

#define N 5

int main(void)
{
    int i, j;

    /* The trick with every star pattern: for line i, work out how many
       spaces and how many stars it needs, as formulas in i. Then one loop
       prints the spaces and another prints the stars. */

    printf("Line i has i stars:\n");
    for (i = 1; i <= N; i++) {
        for (j = 1; j <= i; j++)
            putchar('*');
        putchar('\n');
    }

    printf("Line i has N-i+1 stars:\n");
    for (i = 1; i <= N; i++) {
        for (j = 1; j <= N - i + 1; j++)
            putchar('*');
        putchar('\n');
    }

    printf("N-i spaces, then i stars:\n");
    for (i = 1; i <= N; i++) {
        for (j = 1; j <= N - i; j++)
            putchar(' ');
        for (j = 1; j <= i; j++)
            putchar('*');
        putchar('\n');
    }

    printf("i-1 spaces, then N-i+1 stars:\n");
    for (i = 1; i <= N; i++) {
        for (j = 1; j < i; j++)
            putchar(' ');
        for (j = 1; j <= N - i + 1; j++)
            putchar('*');
        putchar('\n');
    }
    return 0;
}
