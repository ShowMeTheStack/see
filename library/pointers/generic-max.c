/*
 * title: Finding the largest of anything
 * level: 3
 * about: Writes a type-blind max_element that walks bytes with an element size and asks a comparison function which is bigger.
 */
#include <stdio.h>
#include <string.h>

/*
 * The same shape as qsort and bsearch: a base address, a count, an element
 * size, and a function that knows how to compare two elements. It returns
 * a pointer to the winner, so the caller casts it back to the real type.
 */
void *max_element(void *base, size_t count, size_t size,
                  int (*cmp)(const void *, const void *))
{
    char *best = (char *)base;
    char *p = (char *)base;
    size_t i;

    if (count == 0)
        return NULL;
    for (i = 1; i < count; i++) {
        p += size;                   /* next element, size bytes along */
        if (cmp(p, best) > 0)
            best = p;
    }
    return best;
}

int cmp_int(const void *a, const void *b)
{
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);        /* -1, 0 or 1 without risking overflow */
}

int cmp_double(const void *a, const void *b)
{
    double x = *(const double *)a, y = *(const double *)b;
    return (x > y) - (x < y);
}

/* The elements here are char pointers, so a and b point AT char pointers. */
int cmp_len(const void *a, const void *b)
{
    const char *s = *(const char *const *)a;
    const char *t = *(const char *const *)b;
    return (int)strlen(s) - (int)strlen(t);
}

struct city { char name[12]; long people; };

int cmp_city(const void *a, const void *b)
{
    const struct city *x = a, *y = b;
    return (x->people > y->people) - (x->people < y->people);
}

int main(void)
{
    int ints[6];
    double ds[4];
    const char *words[5];
    struct city cities[3];
    int *im;
    double *dm;
    const char **wm;
    struct city *cm;

    ints[0] = 3; ints[1] = -7; ints[2] = 19; ints[3] = 4; ints[4] = 19; ints[5] = 0;
    ds[0] = 2.5; ds[1] = -1.0; ds[2] = 9.75; ds[3] = 9.5;
    words[0] = "pointer"; words[1] = "to"; words[2] = "indirection";
    words[3] = "void"; words[4] = "cast";
    strcpy(cities[0].name, "Lyon");  cities[0].people = 522000L;
    strcpy(cities[1].name, "Porto"); cities[1].people = 232000L;
    strcpy(cities[2].name, "Turin"); cities[2].people = 848000L;

    im = max_element(ints, 6, sizeof ints[0], cmp_int);
    dm = max_element(ds, 4, sizeof ds[0], cmp_double);
    wm = max_element(words, 5, sizeof words[0], cmp_len);
    cm = max_element(cities, 3, sizeof cities[0], cmp_city);

    /* The ties keep the first winner, because cmp must be strictly greater to replace it. */
    printf("largest int    %d at index %ld\n", *im, (long)(im - ints));
    printf("largest double %.2f\n", *dm);
    printf("longest word   %s\n", *wm);
    printf("biggest city   %s (%ld)\n", cm->name, cm->people);
    return 0;
}
