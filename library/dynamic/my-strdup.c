/*
 * title: Making your own strdup
 * level: 1
 * about: Writes a function that copies a string into a fresh heap block of exactly the right size, and uses it to keep words that would otherwise be overwritten.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * strdup is not part of C89, so here it is. strlen does not count the
 * '\0', hence the + 1. The caller owns the new block and must free it.
 */
static char *dup_string(const char *s)
{
    char *copy = malloc(strlen(s) + 1);
    if (copy != NULL)
        strcpy(copy, s);
    return copy;
}

int main(void)
{
    char buffer[32];
    char *kept[3];
    char *pointed[3];
    static const char *words[] = { "red", "green", "blue" };
    int i;

    for (i = 0; i < 3; i++) {
        /* Pretend each word arrives in the same reusable buffer, as input does. */
        strcpy(buffer, words[i]);
        pointed[i] = buffer;            /* only remembers where the buffer is */
        kept[i] = dup_string(buffer);   /* takes its own copy */
    }

    /*
     * All three pointed[] arrows lead to the same stack buffer, which now
     * holds only the last word. Each kept[] arrow leads to its own heap
     * block. Compare them in the memory picture.
     */
    for (i = 0; i < 3; i++)
        printf("pointed[%d] = %-6s kept[%d] = %s\n", i, pointed[i], i, kept[i] ? kept[i] : "(null)");

    for (i = 0; i < 3; i++)
        free(kept[i]);
    return 0;
}
