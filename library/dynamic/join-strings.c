/*
 * title: Joining strings with one exact malloc
 * level: 2
 * about: Joins a list of strings with a separator by measuring the total length first, allocating exactly that many bytes, then copying each piece into place.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Returns a new string (caller frees) holding parts[0..n-1] joined by sep. */
static char *join(const char *const *parts, int n, const char *sep)
{
    size_t total = 0, seplen = strlen(sep), len;
    char *out, *at;
    int i;

    /* Pass 1: measure. */
    for (i = 0; i < n; i++)
        total += strlen(parts[i]);
    if (n > 1)
        total += (n - 1) * seplen;

    out = malloc(total + 1);
    if (out == NULL)
        return NULL;

    /*
     * Pass 2: copy, keeping a pointer to where the next piece goes. Using
     * strcat would re-scan the growing string from the start every time;
     * remembering the end makes the join linear.
     */
    at = out;
    for (i = 0; i < n; i++) {
        if (i > 0) {
            memcpy(at, sep, seplen);
            at += seplen;
        }
        len = strlen(parts[i]);
        memcpy(at, parts[i], len);
        at += len;
    }
    *at = '\0';
    /* at - out must equal total: every byte of the block is now used. */
    return out;
}

int main(void)
{
    static const char *const path[] = { "usr", "local", "lib", "see" };
    static const char *const team[] = { "Ada", "Grace", "Dennis", "Ken" };
    char *p, *t, *single;

    p = join(path, 4, "/");
    t = join(team, 4, ", ");
    single = join(team, 1, " and ");

    if (p != NULL && t != NULL && single != NULL) {
        printf("/%s  (%u bytes allocated)\n", p, (unsigned)strlen(p) + 1);
        printf("%s  (%u bytes allocated)\n", t, (unsigned)strlen(t) + 1);
        printf("%s  (one part, so no separator)\n", single);
    }

    free(p);
    free(t);
    free(single);
    return 0;
}
