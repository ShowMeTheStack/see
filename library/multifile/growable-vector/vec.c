/* vec.c - the growth rule is "double the capacity", so n pushes cost
 * O(n) copying in total, not O(n squared). */
#include <stdlib.h>
#include <string.h>
#include "vec.h"

static int grows = 0;

void vec_init(Vec *v)
{
    v->data = NULL;
    v->len = 0;
    v->cap = 0;
}

void vec_free(Vec *v)
{
    free(v->data);
    vec_init(v);
}

/* realloc(NULL, n) behaves like malloc(n), so the first push needs no
 * special case. Keep the result in a temporary: if realloc fails it
 * returns NULL but the old block is still ours, and overwriting v->data
 * with NULL would lose it. */
static int ensure(Vec *v, int need)
{
    int cap;
    double *p;

    if (need <= v->cap) {
        return 1;
    }
    cap = v->cap ? v->cap * 2 : 2;
    while (cap < need) {
        cap *= 2;
    }
    p = realloc(v->data, cap * sizeof *p);
    if (p == NULL) {
        return 0;
    }
    v->data = p;
    v->cap = cap;
    grows++;
    return 1;
}

int vec_push(Vec *v, double x)
{
    if (!ensure(v, v->len + 1)) {
        return 0;
    }
    v->data[v->len++] = x;
    return 1;
}

double vec_pop(Vec *v)
{
    return v->data[--v->len];
}

double vec_get(const Vec *v, int i)
{
    return v->data[i];
}

/* memmove, not memcpy: the source and destination overlap. */
void vec_insert(Vec *v, int at, double x)
{
    if (!ensure(v, v->len + 1)) {
        return;
    }
    memmove(v->data + at + 1, v->data + at, (v->len - at) * sizeof *v->data);
    v->data[at] = x;
    v->len++;
}

void vec_remove(Vec *v, int at)
{
    memmove(v->data + at, v->data + at + 1, (v->len - at - 1) * sizeof *v->data);
    v->len--;
}

int vec_grow_count(void)
{
    return grows;
}
