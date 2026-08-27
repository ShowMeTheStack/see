/*
 * title: Reading every line, however many
 * level: 3
 * about: Reads lines of any length into a growing array of heap strings, then prints them in reverse order with their lengths and frees every one.
 * input: The quick brown fox\njumps over\nthe lazy dog.\n\nA line that is quite a bit longer than the sixteen bytes the buffer starts with.\nlast line without a newline
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * Read one line of any length. Returns a malloc'd string without the '\n'
 * (the caller must free it), or NULL at end of input.
 */
static char *read_line(void)
{
    size_t cap = 16, len = 0;
    char *buf = malloc(cap);
    char *bigger;
    int ch;

    if (buf == NULL)
        return NULL;
    while ((ch = getchar()) != EOF && ch != '\n') {
        if (len == cap) {
            /* Every byte is in use, so double the buffer. */
            bigger = realloc(buf, cap * 2);
            if (bigger == NULL) {
                free(buf);
                return NULL;
            }
            buf = bigger;
            cap *= 2;
        }
        buf[len++] = (char)ch;
    }
    if (ch == EOF && len == 0) {
        free(buf);          /* nothing was read: no line at all */
        return NULL;
    }
    /* Make room for the '\0' and give back the spare bytes in one go. */
    bigger = realloc(buf, len + 1);
    if (bigger == NULL) {
        free(buf);
        return NULL;
    }
    buf = bigger;
    buf[len] = '\0';
    return buf;
}

int main(void)
{
    char **lines = NULL;
    char **bigger;
    size_t count = 0, cap = 0, i, n;
    char *line;

    while ((line = read_line()) != NULL) {
        if (count == cap) {
            cap = cap ? cap * 2 : 4;
            bigger = realloc(lines, cap * sizeof *lines);
            if (bigger == NULL) {
                free(line);
                break;
            }
            lines = bigger;
        }
        /* The array now owns the line: it is responsible for freeing it. */
        lines[count++] = line;
    }

    /*
     * Pause here and look at the heap: one block of pointers, and from it an
     * arrow to each line, every block exactly as long as its text plus one.
     */
    printf("%u lines, last first:\n", (unsigned)count);
    for (i = count; i > 0; i--) {
        for (n = 0; lines[i - 1][n] != '\0'; n++)
            ;
        printf("%3u | %s\n", (unsigned)n, lines[i - 1]);
    }

    /* The strings first, then the array that held their addresses. */
    for (i = 0; i < count; i++)
        free(lines[i]);
    free(lines);
    return 0;
}
