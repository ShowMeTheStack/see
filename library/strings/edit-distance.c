/*
 * title: Edit distance between two words
 * level: 4
 * about: Computes the fewest insertions, deletions and substitutions to turn one word into another with a dynamic-programming table, then lists the edits.
 */
#include <stdio.h>
#include <string.h>

#define MAXW 16

static int min3(int a, int b, int c)
{
    int m = a < b ? a : b;
    return m < c ? m : c;
}

static void distance(const char *a, const char *b)
{
    /* d[i][j] = edits to turn the first i letters of a into the first j
       letters of b. Row 0 and column 0 are the easy cases: build from
       nothing by inserting, or reduce to nothing by deleting. */
    int d[MAXW + 1][MAXW + 1];
    int n = (int)strlen(a), m = (int)strlen(b);
    int i, j, cost;
    char ops[2 * MAXW + 1];
    int k = 0;

    for (i = 0; i <= n; i++) d[i][0] = i;
    for (j = 0; j <= m; j++) d[0][j] = j;
    for (i = 1; i <= n; i++)
        for (j = 1; j <= m; j++) {
            cost = a[i - 1] == b[j - 1] ? 0 : 1;
            d[i][j] = min3(d[i - 1][j] + 1,          /* delete a's letter */
                           d[i][j - 1] + 1,          /* insert b's letter */
                           d[i - 1][j - 1] + cost);  /* keep or substitute */
        }

    printf("%s -> %s: distance %d\n", a, b, d[n][m]);
    printf("       ");
    for (j = 0; j < m; j++) printf("%3c", b[j]);
    printf("\n");
    for (i = 0; i <= n; i++) {
        printf("   %c", i ? a[i - 1] : ' ');
        for (j = 0; j <= m; j++) printf("%3d", d[i][j]);
        printf("\n");
    }

    /* Walk back from the bottom-right corner, each time stepping to the
       neighbour that produced this cell. The moves come out in reverse. */
    i = n; j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && d[i][j] == d[i - 1][j - 1] + (a[i - 1] != b[j - 1])) {
            ops[k++] = a[i - 1] == b[j - 1] ? '=' : 'S';
            i--; j--;
        } else if (i > 0 && d[i][j] == d[i - 1][j] + 1) {
            ops[k++] = 'D';
            i--;
        } else {
            ops[k++] = 'I';
            j--;
        }
    }
    printf("   edits: ");
    while (k > 0)
        putchar(ops[--k]);
    printf("   (= keep, S substitute, D delete, I insert)\n\n");
}

int main(void)
{
    distance("kitten", "sitting");
    distance("sunday", "saturday");
    distance("flaw", "lawn");
    return 0;
}
