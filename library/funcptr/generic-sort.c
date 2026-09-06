/*
 * title: Writing your own qsort-style sort
 * level: 4
 * about: Implements a generic insertion sort over void pointers with an element size and a comparator, then uses it on ints, doubles, strings and structs.
 */
#include <stdio.h>
#include <string.h>

/*
 * The same interface as qsort: base points at n elements of size bytes
 * each, and cmp decides the order. The sort moves raw bytes, so it can
 * sort anything, but it has to do its own address arithmetic with
 * char pointers because arithmetic on void * is not allowed in C.
 */
void generic_sort(void *base, size_t n, size_t size,
                  int (*cmp)(const void *, const void *))
{
    char *a = base;
    char tmp[64];           /* holds one element while it is being inserted */
    size_t i, j;

    if (size > sizeof tmp)
        return;             /* a real version would malloc a buffer instead */

    for (i = 1; i < n; i++) {
        memcpy(tmp, a + i * size, size);
        j = i;
        /* j is unsigned, so test j > 0 before using j - 1 */
        while (j > 0 && cmp(a + (j - 1) * size, tmp) > 0) {
            memcpy(a + j * size, a + (j - 1) * size, size);
            j--;
        }
        memcpy(a + j * size, tmp, size);
    }
}

int cmp_int(const void *x, const void *y)
{
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

int cmp_double_desc(const void *x, const void *y)
{
    double a = *(const double *)x, b = *(const double *)y;
    return (a < b) - (a > b);
}

/* The elements are char pointers, so each void * points at a char *. */
int cmp_str(const void *x, const void *y)
{
    return strcmp(*(const char * const *)x, *(const char * const *)y);
}

struct planet {
    char name[8];
    double au;              /* distance from the sun */
};

int cmp_planet_au(const void *x, const void *y)
{
    const struct planet *a = x, *b = y;
    return (a->au > b->au) - (a->au < b->au);
}

int main(void)
{
    int ints[] = { 5, -2, 9, 0, 3, 3, -7 };
    double ds[] = { 2.5, 9.75, -1.0, 3.125 };
    const char *words[] = { "pear", "apple", "fig", "banana", "cherry" };
    struct planet ps[] = {
        { "Mars", 1.52 }, { "Venus", 0.72 }, { "Jupiter", 5.20 },
        { "Mercury", 0.39 }, { "Earth", 1.00 }
    };
    size_t i;

    generic_sort(ints, 7, sizeof ints[0], cmp_int);
    printf("ints:   ");
    for (i = 0; i < 7; i++) printf(" %d", ints[i]);

    generic_sort(ds, 4, sizeof ds[0], cmp_double_desc);
    printf("\ndoubles:");
    for (i = 0; i < 4; i++) printf(" %g", ds[i]);

    /* Sorting the pointers: the string literals themselves never move. */
    generic_sort(words, 5, sizeof words[0], cmp_str);
    printf("\nwords:  ");
    for (i = 0; i < 5; i++) printf(" %s", words[i]);

    /* Each planet is 16 bytes (8 for the name, then a double aligned to 8). */
    generic_sort(ps, 5, sizeof ps[0], cmp_planet_au);
    printf("\nplanets (%d bytes each):", (int)sizeof ps[0]);
    for (i = 0; i < 5; i++) printf(" %s", ps[i].name);
    printf("\n");
    return 0;
}
