/*
 * title: Knuth-Morris-Pratt string search
 * level: 4
 * about: Builds the KMP failure table for a pattern, then finds every match in linear time, counting comparisons against the naive method.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * fail[j] = length of the longest proper prefix of pat[0..j] that is
 * also a suffix of it. For "ababaca" it is 0 0 1 2 3 0 1.
 * After a mismatch with j characters matched, those j characters are
 * known, so the search can carry on as if fail[j-1] were matched,
 * without moving backwards in the text.
 */
int *build_fail(const char *pat, int m)
{
    int *fail = malloc(m * sizeof *fail);
    int i, k = 0;

    if (fail == NULL)
        return NULL;
    fail[0] = 0;
    for (i = 1; i < m; i++) {
        while (k > 0 && pat[i] != pat[k])
            k = fail[k - 1];        /* fall back to a shorter border */
        if (pat[i] == pat[k])
            k++;
        fail[i] = k;
    }
    return fail;
}

int kmp_search(const char *text, const char *pat, long *cmp, int show)
{
    int n = strlen(text), m = strlen(pat);
    int i, j = 0, found = 0;
    int *fail = build_fail(pat, m);

    if (fail == NULL)
        return 0;
    if (show) {
        printf("failure table for \"%s\":", pat);
        for (i = 0; i < m; i++)
            printf(" %d", fail[i]);
        printf("\n");
    }

    /* i only ever moves forward through the text: at most 2n comparisons. */
    for (i = 0; i < n; i++) {
        for (;;) {
            (*cmp)++;
            if (text[i] == pat[j])
                break;
            if (j == 0)
                break;
            j = fail[j - 1];
        }
        if (text[i] == pat[j]) {
            j++;
            if (j == m) {
                found++;
                if (show)
                    printf("  match at %d\n", i - m + 1);
                j = fail[j - 1];    /* keep going: matches may overlap */
            }
        }
    }
    free(fail);
    return found;
}

long naive_count(const char *text, const char *pat)
{
    int n = strlen(text), m = strlen(pat), s, j;
    long cmp = 0;
    for (s = 0; s + m <= n; s++)
        for (j = 0; j < m; j++) {
            cmp++;
            if (text[s + j] != pat[j])
                break;
        }
    return cmp;
}

int main(void)
{
    const char *t1 = "abababacababacababaca";
    char text[201], pat[21];
    long cmp = 0;
    int i, found;

    found = kmp_search(t1, "ababaca", &cmp, 1);
    printf("%d matches in \"%s\", %ld comparisons\n\n", found, t1, cmp);

    for (i = 0; i < 200; i++)
        text[i] = 'a';
    text[200] = '\0';
    for (i = 0; i < 19; i++)
        pat[i] = 'a';
    pat[19] = 'b';
    pat[20] = '\0';

    cmp = 0;
    kmp_search(text, pat, &cmp, 0);
    printf("200 a's against a^19 b:\n");
    printf("  KMP:   %5ld comparisons\n", cmp);
    printf("  naive: %5ld comparisons\n", naive_count(text, pat));
    return 0;
}
