/*
 * title: Ownership: who frees what?
 * level: 3
 * about: Contrasts functions that return a new string the caller must free, a pointer into the caller's own string, and a pointer to static data that must never be freed.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

/*
 * Rule of thumb: whoever calls malloc owns the block until they hand it on,
 * and the owner frees it exactly once. A function's comment should say which
 * kind of pointer it returns.
 */

/* Returns a NEW string. The caller owns it and must free it. */
static char *shout(const char *s)
{
    size_t i, n = strlen(s);
    char *out = malloc(n + 2);
    if (out == NULL)
        return NULL;
    for (i = 0; i < n; i++)
        out[i] = (char)toupper((unsigned char)s[i]);
    out[n] = '!';
    out[n + 1] = '\0';
    return out;
}

/* Returns a BORROWED pointer into s itself. Free nothing; valid while s is. */
static const char *skip_spaces(const char *s)
{
    while (*s == ' ')
        s++;
    return s;
}

/* Returns a pointer to STATIC data. Never free it. */
static const char *mood(int score)
{
    return score > 5 ? "happy" : "grumpy";
}

/* TAKES ownership of s: after the call the caller must not use or free s. */
static void consume(char *s)
{
    printf("consume: printing and freeing \"%s\"\n", s);
    free(s);
}

int main(void)
{
    char *loud;
    const char *trimmed;
    const char *m;
    char *gift;

    loud = shout("hello");                 /* we own loud */
    trimmed = skip_spaces("   padded");     /* borrowed from a literal */
    m = mood(8);                            /* static, not ours */

    /*
     * In the memory picture: loud's arrow lands on the heap, trimmed's
     * lands in the middle of a string literal, m's on another literal.
     * Only the heap one may be freed.
     */
    printf("loud    = %s  (heap, ours)\n", loud ? loud : "(null)");
    printf("trimmed = %s  (borrowed)\n", trimmed);
    printf("mood    = %s  (static)\n", m);

    free(loud);
    loud = NULL;

    /* Ownership can move: after consume(), gift belongs to nobody here. */
    gift = shout("bye");
    if (gift != NULL)
        consume(gift);
    gift = NULL;

    /*
     * Calling free(trimmed) or free(m) would be a bug that See stops on:
     * those addresses never came from malloc.
     */
    return 0;
}
