/*
 * title: Splitting records with strtok
 * level: 2
 * about: Breaks comma-separated lines into fields with strtok, and shows the NULs it secretly writes into the buffer.
 * input: Oslo,Norway,709000\nLima,Peru,10719000\nPerth,,2125000\n
 */
#include <stdio.h>
#include <string.h>

static void dump(const char *buf, int n)
{
    int i;
    printf("  bytes: ");
    for (i = 0; i < n; i++)
        putchar(buf[i] ? buf[i] : '|');   /* show each NUL as | */
    printf("\n");
}

int main(void)
{
    char line[80];
    char *field;
    int n, k;

    while (fgets(line, sizeof line, stdin) != NULL) {
        n = (int)strlen(line);
        printf("line: %s", line);

        /* First call: pass the buffer. strtok skips leading delimiters,
           finds the end of the token and overwrites that delimiter with a
           NUL. It remembers where it stopped in a hidden static pointer. */
        field = strtok(line, ",\n");
        k = 0;
        while (field != NULL) {
            printf("  field %d: \"%s\" at offset %d\n", k++, field, (int)(field - line));
            /* Later calls pass NULL, meaning "carry on from last time". */
            field = strtok(NULL, ",\n");
        }
        /* The commas are gone: the buffer is now several strings in a row.
           Look at line in See's stack panel after the loop. */
        dump(line, n);
        /* Notice Perth: the empty field between ",," vanished. strtok
           treats a run of delimiters as one, so it cannot report empty
           fields. A hand-written splitter can (see the next example). */
    }
    return 0;
}
