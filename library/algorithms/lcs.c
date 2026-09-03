/*
 * title: Longest common subsequence table
 * level: 3
 * about: Fills the dynamic-programming table for two strings, prints it, and walks back through it to recover one longest common subsequence.
 */
#include <stdio.h>
#include <string.h>

#define MAX 16

/*
 * L[i][j] is the length of the LCS of the first i letters of x and the
 * first j letters of y. Row 0 and column 0 stand for an empty prefix,
 * so they are all zero. The table is a global 2D array; in See's
 * globals it is one long block of (MAX+1)*(MAX+1) ints, row after row.
 */
int L[MAX + 1][MAX + 1];

int main(void)
{
    const char *x = "AGGTABQ";
    const char *y = "GXTXAYBQ";
    int m = strlen(x), n = strlen(y);
    int i, j, k;
    char out[MAX + 1];

    for (i = 0; i <= m; i++) {
        for (j = 0; j <= n; j++) {
            if (i == 0 || j == 0)
                L[i][j] = 0;
            else if (x[i - 1] == y[j - 1])
                /* the letters match: extend the LCS of both shorter prefixes */
                L[i][j] = L[i - 1][j - 1] + 1;
            else
                /* they don't: drop the last letter of one string or the other */
                L[i][j] = L[i - 1][j] > L[i][j - 1] ? L[i - 1][j] : L[i][j - 1];
        }
    }

    printf("      ");
    for (j = 0; j < n; j++)
        printf(" %c", y[j]);
    printf("\n");
    for (i = 0; i <= m; i++) {
        printf("%c ", i == 0 ? ' ' : x[i - 1]);
        for (j = 0; j <= n; j++)
            printf(" %d", L[i][j]);
        printf("\n");
    }

    /*
     * Walk back from the bottom-right corner. A diagonal step on a match
     * contributes a letter; otherwise move towards the larger neighbour.
     * The letters come out last first, so fill out[] from its end.
     */
    k = L[m][n];
    out[k] = '\0';
    i = m;
    j = n;
    while (i > 0 && j > 0) {
        if (x[i - 1] == y[j - 1]) {
            out[--k] = x[i - 1];
            i--;
            j--;
        } else if (L[i - 1][j] >= L[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    printf("LCS of \"%s\" and \"%s\" is \"%s\", length %d\n", x, y, out, L[m][n]);
    return 0;
}
