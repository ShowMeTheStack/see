/*
 * title: Comparing two files line by line
 * level: 3
 * about: Loads two versions of a file into arrays of lines and prints a diff built from their longest common subsequence.
 */
#include <stdio.h>
#include <string.h>

#define MAXL 12
#define W 40

/* Load up to MAXL lines, newline removed. Returns the count. */
static int load(const char *path, char lines[][W])
{
    FILE *fp = fopen(path, "r");
    int n = 0;

    if (fp == NULL) {
        perror(path);
        return 0;
    }
    while (n < MAXL && fgets(lines[n], W, fp) != NULL) {
        lines[n][strcspn(lines[n], "\n")] = '\0';
        n++;
    }
    fclose(fp);
    return n;
}

static void save(const char *path, const char *text)
{
    FILE *fp = fopen(path, "w");

    if (fp == NULL) {
        perror(path);
        return;
    }
    fputs(text, fp);
    fclose(fp);
}

int main(void)
{
    char a[MAXL][W], b[MAXL][W];
    int lcs[MAXL + 1][MAXL + 1];
    int na, nb, i, j;

    save("/tmp/old.txt", "flour\nsugar\neggs\nbutter\nmilk\nvanilla\n");
    save("/tmp/new.txt", "flour\nbrown sugar\neggs\nmilk\nvanilla\nsalt\n");
    na = load("/tmp/old.txt", a);
    nb = load("/tmp/new.txt", b);

    /* lcs[i][j] = length of the longest common subsequence of the
       lines a[i..] and b[j..]. Filled from the bottom-right corner. */
    for (i = na; i >= 0; i--) {
        for (j = nb; j >= 0; j--) {
            if (i == na || j == nb)
                lcs[i][j] = 0;
            else if (strcmp(a[i], b[j]) == 0)
                lcs[i][j] = 1 + lcs[i + 1][j + 1];
            else
                lcs[i][j] = lcs[i + 1][j] > lcs[i][j + 1] ? lcs[i + 1][j] : lcs[i][j + 1];
        }
    }
    printf("%d lines in common\n", lcs[0][0]);

    /* Walk the table from the top-left: equal lines are kept, otherwise
       step in whichever direction keeps the most lines in common. */
    i = 0;
    j = 0;
    while (i < na || j < nb) {
        if (i < na && j < nb && strcmp(a[i], b[j]) == 0) {
            printf("  %s\n", a[i]);
            i++;
            j++;
        } else if (i < na && (j == nb || lcs[i + 1][j] >= lcs[i][j + 1])) {
            printf("- %s\n", a[i]);    /* only in the old file */
            i++;
        } else {
            printf("+ %s\n", b[j]);    /* only in the new file */
            j++;
        }
    }
    return 0;
}
