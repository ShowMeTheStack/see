/*
 * title: Searching a const table with bsearch
 * level: 3
 * about: Looks up chemical symbols in a sorted, fully const table of structs using bsearch with a const key.
 * input: Fe Au He Xx Na O
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct element {
    const char *symbol;
    const char *name;
    int number;
    double mass;
};

/*
 * The table never changes, so it is const all the way down: a compiler
 * may put it in read-only memory. It must be sorted by symbol for bsearch.
 */
static const struct element table[] = {
    { "Ag", "silver",    47, 107.87 },
    { "Au", "gold",      79, 196.97 },
    { "C",  "carbon",     6,  12.011 },
    { "Fe", "iron",      26,  55.845 },
    { "H",  "hydrogen",   1,   1.008 },
    { "He", "helium",     2,   4.0026 },
    { "N",  "nitrogen",   7,  14.007 },
    { "Na", "sodium",    11,  22.990 },
    { "O",  "oxygen",     8,  15.999 }
};

#define TABLE_SIZE (sizeof table / sizeof table[0])

/*
 * bsearch passes the key first and a table element second. Here the key
 * is a plain string, the element a struct; both arrive as const void *.
 */
int cmp_symbol(const void *key, const void *elem)
{
    const char *k = (const char *)key;
    const struct element *e = (const struct element *)elem;
    return strcmp(k, e->symbol);
}

int main(void)
{
    char sym[4];
    const struct element *e;

    printf("%lu elements in the table\n", (unsigned long)TABLE_SIZE);

    while (scanf("%3s", sym) == 1) {
        /*
         * bsearch returns void *, but what it points at is const here, so
         * keep it in a const struct element *. Writing e->number = 0 would
         * then be refused: error: assignment of read-only member 'number'
         */
        e = bsearch(sym, table, TABLE_SIZE, sizeof table[0], cmp_symbol);
        if (e == NULL)
            printf("%-2s  not in the table\n", sym);
        else
            printf("%-2s  %-9s number %2d, mass %8.3f\n", e->symbol, e->name, e->number, e->mass);
    }
    return 0;
}
