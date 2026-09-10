/*
 * title: A glossary looked up with bsearch
 * level: 3
 * about: Sorts a table of C terms with qsort, then answers queries with bsearch, counting how few comparisons each lookup needs.
 * input: pointer\nlvalue\nsegfault\nmalloc\nalias\nvolatile\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct entry {
    const char *word;
    const char *meaning;
};

static int comparisons = 0;

/* For qsort: both arguments point at table entries. */
static int cmp_entries(const void *a, const void *b)
{
    const struct entry *x = (const struct entry *)a;
    const struct entry *y = (const struct entry *)b;
    return strcmp(x->word, y->word);
}

/*
 * For bsearch: the first argument is the KEY you passed, the second an
 * element of the table. Here the key is a plain string, so the two
 * pointers have different types, and that is allowed.
 */
static int cmp_key(const void *key, const void *elem)
{
    const struct entry *e = (const struct entry *)elem;
    comparisons++;
    return strcmp((const char *)key, e->word);
}

int main(void)
{
    struct entry table[12];
    int n = 12, i;
    char line[32];
    struct entry *hit;
    size_t len;

    table[0].word = "volatile";  table[0].meaning = "may change behind the compiler's back";
    table[1].word = "pointer";   table[1].meaning = "a variable holding an address";
    table[2].word = "lvalue";    table[2].meaning = "an expression naming an object";
    table[3].word = "malloc";    table[3].meaning = "asks for a block of heap memory";
    table[4].word = "array";     table[4].meaning = "elements side by side in memory";
    table[5].word = "struct";    table[5].meaning = "a record of named members";
    table[6].word = "union";     table[6].meaning = "members sharing the same bytes";
    table[7].word = "sizeof";    table[7].meaning = "the size of a type, in bytes";
    table[8].word = "enum";      table[8].meaning = "a set of named integer constants";
    table[9].word = "static";    table[9].meaning = "lasts for the whole run, or file-private";
    table[10].word = "typedef";  table[10].meaning = "a new name for an existing type";
    table[11].word = "alias";    table[11].meaning = "two names for the same object";

    /* bsearch needs a sorted table, sorted with the same ordering. */
    qsort(table, n, sizeof table[0], cmp_entries);
    printf("sorted:");
    for (i = 0; i < n; i++)
        printf(" %s", table[i].word);
    printf("\n");

    while (fgets(line, sizeof line, stdin) != NULL) {
        len = strlen(line);
        if (len > 0 && line[len - 1] == '\n')
            line[len - 1] = '\0';

        comparisons = 0;
        hit = (struct entry *)bsearch(line, table, n, sizeof table[0], cmp_key);
        if (hit != NULL)
            printf("%-9s %s  [%d comparisons, slot %d]\n", line, hit->meaning,
                   comparisons, (int)(hit - table));
        else
            printf("%-9s not in the glossary  [%d comparisons]\n", line, comparisons);
    }

    /*
     * With 12 entries, binary search needs at most 4 comparisons, since
     * each one halves what is left. In See, hit is an arrow into the
     * table array, or NULL when the word is missing.
     */
    return 0;
}
