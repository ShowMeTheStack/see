/*
 * title: Sorting records three ways with qsort
 * level: 2
 * about: Sorts an array of city records by name, by population and by country then name, using qsort with three comparison functions.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct city {
    const char *name;      /* points at a string literal */
    const char *country;
    long population;       /* thousands */
};

/* qsort knows nothing about cities. It hands the comparator two pointers to
   elements as const void *, and the comparator converts them back. Return
   negative, zero or positive, like strcmp. */
int by_name(const void *a, const void *b)
{
    const struct city *x = (const struct city *)a;
    const struct city *y = (const struct city *)b;
    return strcmp(x->name, y->name);
}

int by_population_desc(const void *a, const void *b)
{
    const struct city *x = (const struct city *)a;
    const struct city *y = (const struct city *)b;
    /* Compare instead of subtracting: subtraction can overflow for big
       values, and comparisons cannot. */
    if (x->population < y->population) return 1;
    if (x->population > y->population) return -1;
    return 0;
}

/* Sort by one key, and break ties with a second key. */
int by_country_then_name(const void *a, const void *b)
{
    const struct city *x = (const struct city *)a;
    const struct city *y = (const struct city *)b;
    int c = strcmp(x->country, y->country);
    if (c != 0)
        return c;
    return strcmp(x->name, y->name);
}

void print_all(const char *title, const struct city *c, int n)
{
    int i;
    printf("-- %s --\n", title);
    for (i = 0; i < n; i++)
        printf("  %-10s %-8s %6ld\n", c[i].name, c[i].country, c[i].population);
}

int main(void)
{
    /* The structs hold pointers, not copies of the text. In the memory picture
       every name field is an arrow into the string literal area. When qsort
       swaps two records it moves the arrows, never the letters. */
    struct city c[] = {
        { "Lagos", "Nigeria", 15388 },
        { "Osaka", "Japan", 19059 },
        { "Kano", "Nigeria", 4103 },
        { "Lima", "Peru", 10883 },
        { "Tokyo", "Japan", 37274 },
        { "Cusco", "Peru", 428 },
        { "Sapporo", "Japan", 2665 }
    };
    int n = (int)(sizeof c / sizeof c[0]);

    print_all("as written", c, n);

    qsort(c, n, sizeof c[0], by_name);
    print_all("by name", c, n);

    qsort(c, n, sizeof c[0], by_population_desc);
    print_all("largest first", c, n);

    qsort(c, n, sizeof c[0], by_country_then_name);
    print_all("by country, then name", c, n);
    return 0;
}
