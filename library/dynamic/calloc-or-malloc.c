/*
 * title: calloc hands you zeros
 * level: 1
 * about: Counts letter frequencies in a table from calloc, which starts at zero, and contrasts it with malloc, whose block must be cleared by hand before counting.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

int main(void)
{
    const char *text = "Calloc clears, malloc does not.";
    int *from_calloc, *from_malloc;
    int i;

    /*
     * calloc(count, size) allocates count * size bytes and sets them all to
     * zero. Step over it and the heap panel shows 26 zeros.
     */
    from_calloc = calloc(26, sizeof *from_calloc);

    /*
     * malloc gives the same size of block but leaves the bytes as they were.
     * See marks them as uninitialised; counting into them with ++ would read
     * garbage first, and See would say so. memset fixes that.
     */
    from_malloc = malloc(26 * sizeof *from_malloc);
    if (from_calloc == NULL || from_malloc == NULL) {
        free(from_calloc);
        free(from_malloc);
        return 0;
    }
    memset(from_malloc, 0, 26 * sizeof *from_malloc);

    for (i = 0; text[i] != '\0'; i++)
        if (isalpha((unsigned char)text[i])) {
            from_calloc[tolower((unsigned char)text[i]) - 'a']++;
            from_malloc[tolower((unsigned char)text[i]) - 'a']++;
        }

    printf("\"%s\"\n", text);
    for (i = 0; i < 26; i++)
        if (from_calloc[i] > 0)
            printf("%c: %d %d\n", 'a' + i, from_calloc[i], from_malloc[i]);

    /*
     * memset with 0 is fine for ints and chars. For doubles and pointers,
     * all-zero bytes happen to mean 0.0 and NULL on this machine, but C does
     * not promise that everywhere, so careful code assigns those explicitly.
     */
    free(from_calloc);
    free(from_malloc);
    return 0;
}
