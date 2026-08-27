/*
 * title: Inserting and removing in a dynamic array
 * level: 3
 * about: Keeps a sorted list of numbers in a growable heap array, inserting each new value in place and removing others by sliding the tail with memmove.
 * input: + 50 + 20 + 80 + 35 + 65 - 20 + 10 + 90 - 65 - 99 + 40
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct vec {
    int *data;
    int len, cap;
};

/* Index of the first element >= v (binary search on the sorted array). */
static int lower_bound(const struct vec *a, int v)
{
    int lo = 0, hi = a->len, mid;
    while (lo < hi) {
        mid = (lo + hi) / 2;
        if (a->data[mid] < v)
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}

static int insert(struct vec *a, int v)
{
    int at;
    int *bigger;
    if (a->len == a->cap) {
        bigger = realloc(a->data, (a->cap ? a->cap * 2 : 4) * sizeof *a->data);
        if (bigger == NULL)
            return 0;
        a->data = bigger;
        a->cap = a->cap ? a->cap * 2 : 4;
    }
    at = lower_bound(a, v);
    /*
     * Open a gap at position at by moving the tail one place right. The
     * regions overlap, so it must be memmove, not memcpy.
     */
    memmove(a->data + at + 1, a->data + at, (a->len - at) * sizeof *a->data);
    a->data[at] = v;
    a->len++;
    return 1;
}

static int remove_value(struct vec *a, int v)
{
    int at = lower_bound(a, v);
    if (at == a->len || a->data[at] != v)
        return 0;
    /* Close the gap by moving the tail one place left. */
    memmove(a->data + at, a->data + at + 1, (a->len - at - 1) * sizeof *a->data);
    a->len--;
    return 1;
}

static void show(const struct vec *a)
{
    int i;
    printf("  [");
    for (i = 0; i < a->len; i++)
        printf(i ? " %d" : "%d", a->data[i]);
    printf("]  len %d cap %d\n", a->len, a->cap);
}

int main(void)
{
    struct vec a;
    char op;
    int v;

    a.data = NULL;
    a.len = a.cap = 0;

    while (scanf(" %c %d", &op, &v) == 2) {
        if (op == '+') {
            printf("insert %d\n", v);
            insert(&a, v);
        } else if (op == '-') {
            printf("remove %d%s\n", v, remove_value(&a, v) ? "" : ": not there");
        }
        show(&a);
    }
    free(a.data);
    return 0;
}
