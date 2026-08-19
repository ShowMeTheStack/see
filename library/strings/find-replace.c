/*
 * title: Find and replace into a new string
 * level: 3
 * about: Replaces every occurrence of a word in a sentence, measuring first so it can malloc exactly the right size for the result.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Returns a new heap string, which the caller must free, or NULL. Two
   passes: count the matches to work out the final size, then build it.
   Measuring first is what makes the result exactly as big as needed. */
static char *replace_all(const char *text, const char *from, const char *to)
{
    size_t flen = strlen(from), tlen = strlen(to);
    size_t count = 0;
    const char *p;
    char *result, *out;

    if (flen == 0)
        return NULL;     /* an empty pattern would match everywhere */

    for (p = text; (p = strstr(p, from)) != NULL; p += flen)
        count++;

    /* Old length, minus what goes, plus what comes, plus the NUL. */
    result = malloc(strlen(text) - count * flen + count * tlen + 1);
    if (result == NULL)
        return NULL;

    out = result;
    while ((p = strstr(text, from)) != NULL) {
        memcpy(out, text, p - text);   /* the part before the match */
        out += p - text;
        memcpy(out, to, tlen);         /* the replacement */
        out += tlen;
        text = p + flen;               /* carry on after the match */
    }
    strcpy(out, text);                 /* the tail, and the NUL */
    return result;
}

static void demo(const char *text, const char *from, const char *to)
{
    /* Step over replace_all (F10) and a new block appears on the heap,
       sized to fit. The free below makes it disappear again. */
    char *r = replace_all(text, from, to);
    if (r == NULL) {
        printf("nothing to do\n");
        return;
    }
    printf("\"%s\" -> \"%s\"  (%lu bytes)\n", from, to, (unsigned long)strlen(r) + 1);
    printf("  %s\n", r);
    free(r);
}

int main(void)
{
    const char *s = "the cat sat on the mat with the other cat";

    printf("  %s\n", s);
    demo(s, "cat", "dog");
    /* Watch "other" in the next one: plain text search has no idea what a
       word is, so the "the" inside "other" is replaced too. */
    demo(s, "the", "a");
    demo(s, "at", "ATTA");
    demo(s, "zebra", "lion");
    demo(s, "", "x");
    return 0;
}
