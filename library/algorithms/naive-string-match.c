/*
 * title: Naive string matching
 * level: 2
 * about: Slides a pattern along a text one place at a time, reporting every match and counting character comparisons, including a bad case.
 */
#include <stdio.h>
#include <string.h>

/*
 * Try every shift s. At each one compare pattern and text character by
 * character until a mismatch or the end of the pattern. Returns the
 * number of matches and adds the comparisons made to *cmp.
 */
int naive_search(const char *text, const char *pat, long *cmp, int show)
{
    int n = strlen(text), m = strlen(pat);
    int s, j, found = 0;

    for (s = 0; s + m <= n; s++) {
        j = 0;
        while (j < m) {
            (*cmp)++;
            if (text[s + j] != pat[j])
                break;
            j++;
        }
        if (j == m) {
            found++;
            if (show) {
                /* Draw the pattern under the text at the shift where it matched. */
                printf("  %s\n  %*s%s  match at %d\n", text, s, "", pat, s);
            }
        }
    }
    return found;
}

int main(void)
{
    char text[64], pat[16];
    long cmp;
    int found, i;

    cmp = 0;
    found = naive_search("abracadabra, abracadabra!", "abra", &cmp, 1);
    printf("%d matches, %ld comparisons\n\n", found, cmp);

    /*
     * The bad case: text aaaa...a and pattern aaa...ab. At every shift
     * the pattern matches almost to the end before failing, so the work
     * is about n*m. KMP (kmp.c) avoids re-reading those characters.
     */
    for (i = 0; i < 60; i++)
        text[i] = 'a';
    text[60] = '\0';
    for (i = 0; i < 9; i++)
        pat[i] = 'a';
    pat[9] = 'b';
    pat[10] = '\0';

    cmp = 0;
    found = naive_search(text, pat, &cmp, 0);
    printf("60 a's, pattern \"%s\": %d matches, %ld comparisons\n", pat, found, cmp);
    printf("that is %ld comparisons per text character\n", cmp / 60);
    return 0;
}
