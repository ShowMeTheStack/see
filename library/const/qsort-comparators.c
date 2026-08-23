/*
 * title: qsort comparators and const void *
 * level: 2
 * about: Sorts numbers and words with qsort, writing comparators that keep the const of their const void * arguments when they cast.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * qsort promises the comparator two read-only elements, so the
 * parameters are const void *. The cast must keep that const: casting to
 * plain int * would throw the promise away (and gcc's -Wcast-qual would
 * complain).
 */
int by_value(const void *a, const void *b)
{
    const int *x = (const int *)a;
    const int *y = (const int *)b;
    return (*x > *y) - (*x < *y);
}

int by_value_desc(const void *a, const void *b)
{
    return by_value(b, a);           /* swap the arguments to reverse the order */
}

/*
 * The array holds const char * elements, so each argument points AT a
 * const char *. Reading right to left: a pointer to a const pointer to
 * const char, since the element itself is read-only here too.
 */
int by_string(const void *a, const void *b)
{
    const char * const *s = (const char * const *)a;
    const char * const *t = (const char * const *)b;
    return strcmp(*s, *t);
}

int by_length(const void *a, const void *b)
{
    size_t m = strlen(*(const char * const *)a);
    size_t n = strlen(*(const char * const *)b);
    return (m > n) - (m < n);
}

void print_ints(const char *label, const int *v, int n)
{
    int i;
    printf("%-11s", label);
    for (i = 0; i < n; i++)
        printf(" %d", v[i]);
    printf("\n");
}

void print_words(const char *label, const char * const *w, int n)
{
    int i;
    printf("%-11s", label);
    for (i = 0; i < n; i++)
        printf(" %s", w[i]);
    printf("\n");
}

int main(void)
{
    int v[8];
    const char *w[6];
    int i;

    srand(7);
    for (i = 0; i < 8; i++)
        v[i] = rand() % 100;
    w[0] = "volatile"; w[1] = "const"; w[2] = "static";
    w[3] = "extern";   w[4] = "auto";  w[5] = "register";

    print_ints("unsorted:", v, 8);
    qsort(v, 8, sizeof v[0], by_value);
    print_ints("ascending:", v, 8);
    qsort(v, 8, sizeof v[0], by_value_desc);
    print_ints("descending:", v, 8);

    qsort(w, 6, sizeof w[0], by_string);
    print_words("a to z:", w, 6);
    /*
     * qsort is not stable: words of equal length may come out in any
     * order, not necessarily the alphabetical order they went in with.
     */
    qsort(w, 6, sizeof w[0], by_length);
    print_words("by length:", w, 6);
    return 0;
}
