/*
 * title: A splitter that keeps empty fields
 * level: 3
 * about: Splits a line on a separator without changing it, recording each field as a pointer and a length, so empty fields survive.
 * input: name;;age;city;\n;x;\nsingle\n
 */
#include <stdio.h>
#include <string.h>

#define MAXF 10

/* One field: where it starts and how long it is. No copy is made and no
   NUL is written, so the input can even be a string literal. */
struct field {
    const char *start;
    int len;
};

static int split(const char *s, char sep, struct field *out, int max)
{
    int n = 0;
    const char *p = s;
    for (;;) {
        const char *q = p;
        while (*q && *q != sep)
            q++;
        if (n < max) {
            out[n].start = p;
            out[n].len = (int)(q - p);
            n++;
        }
        if (*q == '\0')
            break;          /* reached the end: that was the last field */
        p = q + 1;          /* skip the separator; an empty field may follow */
    }
    return n;
}

int main(void)
{
    char line[80];
    struct field f[MAXF];
    int n, i;
    size_t len;

    while (fgets(line, sizeof line, stdin) != NULL) {
        len = strlen(line);
        if (len && line[len - 1] == '\n')
            line[len - 1] = '\0';
        n = split(line, ';', f, MAXF);
        printf("\"%s\" has %d fields:", line, n);
        /* %.*s prints exactly len characters: the way to print a string
           that has no NUL of its own. In See, each f[i].start is an arrow
           into the middle of line. */
        for (i = 0; i < n; i++)
            printf(" [%.*s]", f[i].len, f[i].start);
        printf("\n");
    }
    return 0;
}
