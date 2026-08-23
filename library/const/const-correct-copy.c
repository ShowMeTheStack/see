/*
 * title: const tells you which way data flows
 * level: 2
 * about: Writes a bounded string copy and a word-join whose const parameters make it obvious which argument is read and which is written.
 */
#include <stdio.h>
#include <string.h>

/*
 * Copies at most size-1 chars of src into dst and always ends dst with
 * '\0'. Returns how many chars were copied.
 *
 * Which argument is the destination? With strcpy(a, b) people mix them
 * up. Here the types answer: src is const char *, so it is only read;
 * dst is plain char *, so it is the one written. A bare literal passed
 * as dst would still slip through, because literals have type char[] in
 * C; holding literals in const char * variables closes that gap too.
 */
size_t copy_bounded(char *dst, const char *src, size_t size)
{
    size_t n = 0;
    if (size == 0)
        return 0;
    while (n + 1 < size && src[n] != '\0') {
        dst[n] = src[n];
        n++;
    }
    dst[n] = '\0';
    return n;
}

/* Joins words with a separator into out (capacity cap). Everything read is const. */
void join(char *out, size_t cap, const char * const *words, int n, const char *sep)
{
    size_t used = 0;
    int i;
    out[0] = '\0';
    for (i = 0; i < n; i++) {
        if (i > 0)
            used += copy_bounded(out + used, sep, cap - used);
        used += copy_bounded(out + used, words[i], cap - used);
    }
}

int main(void)
{
    char small[8];
    char line[40];
    const char *label = "constant";
    const char *parts[4];
    size_t got;

    /* Watch small fill up in the stack view, and stop one short so the '\0' fits. */
    got = copy_bounded(small, "pointers and const", sizeof small);
    printf("copied %lu chars: \"%s\"\n", (unsigned long)got, small);

    /*
     *     copy_bounded(label, small, sizeof small);
     * puts the arguments the wrong way round. Because label is a
     * const char *, the compiler catches it:
     *     warning: passing argument discards 'const' qualifier from pointer target type
     */
    got = copy_bounded(small, label, sizeof small);
    printf("copied %lu chars: \"%s\"\n", (unsigned long)got, small);

    parts[0] = "read"; parts[1] = "only"; parts[2] = "is"; parts[3] = "polite";
    join(line, sizeof line, parts, 4, " - ");
    printf("%s (%lu chars)\n", line, (unsigned long)strlen(line));
    return 0;
}
