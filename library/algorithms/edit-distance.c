/*
 * title: Edit distance with the edits spelled out
 * level: 3
 * about: Computes the Levenshtein distance between pairs of words and lists the inserts, deletes and substitutions that achieve it.
 * input: kitten sitting\nsunday saturday\nflaw lawn\nintention execution
 */
#include <stdio.h>
#include <string.h>

#define MAX 32

static int d[MAX + 1][MAX + 1];

int min3(int a, int b, int c)
{
    int m = a < b ? a : b;
    return m < c ? m : c;
}

/*
 * d[i][j] = fewest edits turning the first i letters of a into the first
 * j letters of b. Turning a prefix into the empty string takes i deletes
 * (column 0); building a prefix from nothing takes j inserts (row 0).
 */
int distance(const char *a, const char *b)
{
    int m = strlen(a), n = strlen(b);
    int i, j, cost;

    for (i = 0; i <= m; i++) d[i][0] = i;
    for (j = 0; j <= n; j++) d[0][j] = j;

    for (i = 1; i <= m; i++)
        for (j = 1; j <= n; j++) {
            cost = a[i - 1] == b[j - 1] ? 0 : 1;
            d[i][j] = min3(d[i - 1][j] + 1,         /* delete a[i-1] */
                           d[i][j - 1] + 1,         /* insert b[j-1] */
                           d[i - 1][j - 1] + cost); /* keep or substitute */
        }
    return d[m][n];
}

/*
 * Recover the edits by walking back from d[m][n]. Recursion makes them
 * come out in left-to-right order: recurse first, print afterwards.
 */
void explain(const char *a, const char *b, int i, int j)
{
    if (i == 0 && j == 0)
        return;
    if (i > 0 && j > 0 && a[i - 1] == b[j - 1] && d[i][j] == d[i - 1][j - 1]) {
        explain(a, b, i - 1, j - 1);
    } else if (i > 0 && j > 0 && d[i][j] == d[i - 1][j - 1] + 1) {
        explain(a, b, i - 1, j - 1);
        printf("    substitute '%c' -> '%c'\n", a[i - 1], b[j - 1]);
    } else if (i > 0 && d[i][j] == d[i - 1][j] + 1) {
        explain(a, b, i - 1, j);
        printf("    delete '%c'\n", a[i - 1]);
    } else {
        explain(a, b, i, j - 1);
        printf("    insert '%c'\n", b[j - 1]);
    }
}

int main(void)
{
    char a[MAX + 1], b[MAX + 1];

    /* %32s stops at 32 characters so the words can never overflow a and b. */
    while (scanf("%32s %32s", a, b) == 2) {
        printf("%s -> %s: distance %d\n", a, b, distance(a, b));
        explain(a, b, strlen(a), strlen(b));
    }
    return 0;
}
