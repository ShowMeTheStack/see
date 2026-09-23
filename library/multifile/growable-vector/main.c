/*
 * title: A growable vector of doubles
 * level: 3
 * about: Pushes, inserts and removes values in a vector that doubles its heap block whenever it fills up.
 */

/* See builds vec.c and main.c separately and links them. Keep the heap
 * panel open while the first loop runs: the data block is 16 bytes, then
 * 32, 64, 128..., and every time it moves, the old block is freed. */
#include <stdio.h>
#include "vec.h"

static void show(const char *label, const Vec *v)
{
    int i;
    printf("%-12s len %2d cap %2d:", label, v->len, v->cap);
    for (i = 0; i < v->len; i++) {
        printf(" %g", vec_get(v, i));
    }
    printf("\n");
}

int main(void)
{
    Vec v;
    int i;
    double sum = 0.0;

    vec_init(&v);
    for (i = 1; i <= 10; i++) {
        vec_push(&v, i * 1.5);
        if ((i & (i - 1)) == 0) {       /* i is a power of two */
            show("pushed", &v);
        }
    }
    show("ten pushed", &v);

    vec_insert(&v, 0, -1.0);
    vec_insert(&v, 5, 99.0);
    show("inserted", &v);

    vec_remove(&v, 1);
    show("removed [1]", &v);

    while (v.len > 0) {
        sum += vec_pop(&v);
    }
    printf("sum of everything popped: %g\n", sum);
    printf("the block grew %d times\n", vec_grow_count());

    vec_free(&v);
    return 0;
}
