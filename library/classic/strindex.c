/*
 * title: Pattern search with strindex
 * level: 2
 * about: The chapter 4 grep: strindex finds where a pattern starts in a line, and every line of a poem containing "ould" is printed.
 */
#include <stdio.h>

/* Return the index of t in s, or -1 if t is not there. For each start
   position i, compare characters while they match; if we reach the end
   of t, every character matched. */
int strindex(const char s[], const char t[])
{
    int i, j, k;

    for (i = 0; s[i] != '\0'; i++) {
        for (j = i, k = 0; t[k] != '\0' && s[j] == t[k]; j++, k++)
            ;
        if (k > 0 && t[k] == '\0')
            return i;
    }
    return -1;
}

/* Exercise 4-1: the rightmost occurrence instead of the leftmost.
   Keep going after a match and remember the last one. */
int strrindex(const char s[], const char t[])
{
    int i, j, k, last = -1;

    for (i = 0; s[i] != '\0'; i++) {
        for (j = i, k = 0; t[k] != '\0' && s[j] == t[k]; j++, k++)
            ;
        if (k > 0 && t[k] == '\0')
            last = i;
    }
    return last;
}

int main(void)
{
    /* The verse from the book (FitzGerald's Omar Khayyam). An array of
       pointers to string literals: each line lives in the string
       literals area, and lines[i] holds its address. */
    const char *lines[4];
    const char *pattern = "ould";
    int i, at, found = 0;

    lines[0] = "Ah Love! could you and I with Fate conspire";
    lines[1] = "To grasp this sorry Scheme of Things entire,";
    lines[2] = "Would not we shatter it to bits -- and then";
    lines[3] = "Re-mould it nearer to the Heart's Desire!";

    for (i = 0; i < 4; i++) {
        if ((at = strindex(lines[i], pattern)) >= 0) {
            printf("%s\n", lines[i]);
            /* Put a caret under the match: at spaces, then ^. */
            printf("%*s^ at %d\n", at, "", at);
            found++;
        }
    }
    printf("%d lines match \"%s\"\n", found, pattern);
    printf("first \"t\" in line 3 at %d, last at %d\n",
           strindex(lines[2], "t"), strrindex(lines[2], "t"));
    return 0;
}
