/*
 * title: Sorting records with qsort and several keys
 * level: 2
 * about: Sorts an array of athlete records by time, by name, and by country then time, using three comparison functions with qsort.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct runner {
    char name[12];
    char country[4];
    int seconds;
};

/*
 * qsort knows nothing about runners. It hands the comparison function
 * two const void pointers to elements, and the function converts them
 * back to the real type. Return negative, zero or positive, like strcmp.
 */
static int by_time(const void *a, const void *b)
{
    const struct runner *x = (const struct runner *)a;
    const struct runner *y = (const struct runner *)b;
    /* (x > y) - (x < y) gives -1, 0 or 1 and, unlike x - y, can never
       overflow. */
    return (x->seconds > y->seconds) - (x->seconds < y->seconds);
}

static int by_name(const void *a, const void *b)
{
    const struct runner *x = (const struct runner *)a;
    const struct runner *y = (const struct runner *)b;
    return strcmp(x->name, y->name);
}

/* Two keys: country first, and only for a tie, the time. */
static int by_country_then_time(const void *a, const void *b)
{
    const struct runner *x = (const struct runner *)a;
    const struct runner *y = (const struct runner *)b;
    int c = strcmp(x->country, y->country);
    if (c != 0)
        return c;
    return by_time(a, b);
}

static void print(const char *title, const struct runner *r, int n)
{
    int i;
    printf("%s\n", title);
    for (i = 0; i < n; i++)
        printf("  %-10s %s  %d:%02d\n", r[i].name, r[i].country,
               r[i].seconds / 60, r[i].seconds % 60);
}

static void set(struct runner *r, const char *name, const char *country, int secs)
{
    strcpy(r->name, name);
    strcpy(r->country, country);
    r->seconds = secs;
}

int main(void)
{
    struct runner field[7];
    int n = 7;

    /*
     * qsort copies whole records, including the unused bytes after each
     * name's '\0'. Clearing the array first gives those bytes a known
     * value, so nothing uninitialised is ever copied.
     */
    memset(field, 0, sizeof field);

    set(&field[0], "Okafor", "NGA", 1694);
    set(&field[1], "Lindqvist", "SWE", 1712);
    set(&field[2], "Kiprop", "KEN", 1660);
    set(&field[3], "Almeida", "BRA", 1745);
    set(&field[4], "Wanjiru", "KEN", 1671);
    set(&field[5], "Berg", "SWE", 1699);
    set(&field[6], "Mutai", "KEN", 1702);

    /*
     * Each qsort call rearranges the whole structs inside field, 20
     * bytes at a time. Watch the array in See's memory view: the names
     * move, because the records themselves are swapped.
     */
    qsort(field, n, sizeof field[0], by_time);
    print("by time:", field, n);
    qsort(field, n, sizeof field[0], by_name);
    print("by name:", field, n);
    qsort(field, n, sizeof field[0], by_country_then_time);
    print("by country, then time:", field, n);
    return 0;
}
