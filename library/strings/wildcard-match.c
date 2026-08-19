/*
 * title: Matching * and ? wildcards
 * level: 4
 * about: Matches file names against patterns like *.c and data??.txt with a short recursive function, and counts the calls it makes.
 */
#include <stdio.h>

static int calls;

/* ? matches any one character; * matches any run, including none.
   Each call looks at the first character of the pattern and recurses on
   what is left. Step into a match against "*.c" (F11) and watch the call
   stack: each frame's p and s are arrows a little further along the same
   two strings. Nothing is copied. */
static int match(const char *p, const char *s)
{
    calls++;
    if (*p == '\0')
        return *s == '\0';            /* pattern used up: text must be too */
    if (*p == '*') {
        /* Either the star matches nothing (skip it), or it swallows one
           more character of the text and stays in play. */
        if (match(p + 1, s))
            return 1;
        return *s != '\0' && match(p, s + 1);
    }
    if (*s == '\0')
        return 0;                     /* text used up but pattern is not */
    if (*p == '?' || *p == *s)
        return match(p + 1, s + 1);
    return 0;
}

int main(void)
{
    const char *names[6] = { "main.c", "util.h", "data01.txt", "data7.txt", "notes", "a.c.bak" };
    const char *pats[5] = { "*.c", "*.?", "data??.txt", "*a*", "*" };
    int i, j;

    printf("%-12s", "");
    for (j = 0; j < 5; j++)
        printf("%-11s", pats[j]);
    printf("\n");
    for (i = 0; i < 6; i++) {
        printf("%-12s", names[i]);
        for (j = 0; j < 5; j++)
            printf("%-11s", match(pats[j], names[i]) ? "yes" : "-");
        printf("\n");
    }

    /* Several stars can make the work grow quickly, because each one can
       try every split of the text. */
    /* The result is stored first: C does not fix the order in which
       printf's arguments are worked out, so passing match(...) and calls
       in the same call could print calls before match had run. */
    calls = 0;
    i = match("*a*a*a*b", "aaaaaaaaaa");
    printf("\"*a*a*a*b\" vs \"aaaaaaaaaa\": %s after %d calls\n",
           i ? "match" : "no match", calls);
    return 0;
}
