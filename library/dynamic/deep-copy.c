/*
 * title: Shallow copy versus deep copy
 * level: 3
 * about: Copies a struct that owns heap memory first by plain assignment, which shares the memory, and then with a deep-copy function that duplicates it, showing why only the second is safe to free twice.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct polygon {
    char *label;     /* owned */
    int n;
    int *xs;         /* owned, n ints */
};

static int make(struct polygon *p, const char *label, int n)
{
    int i;
    p->label = malloc(strlen(label) + 1);
    p->xs = malloc(n * sizeof *p->xs);
    p->n = n;
    if (p->label == NULL || p->xs == NULL) {
        free(p->label);
        free(p->xs);
        return 0;
    }
    strcpy(p->label, label);
    for (i = 0; i < n; i++)
        p->xs[i] = i * i;
    return 1;
}

/* Duplicate everything the struct owns, not just the pointers to it. */
static int deep_copy(struct polygon *dst, const struct polygon *src)
{
    if (!make(dst, src->label, src->n))
        return 0;
    memcpy(dst->xs, src->xs, src->n * sizeof *src->xs);
    return 1;
}

static void destroy(struct polygon *p)
{
    free(p->label);
    free(p->xs);
    p->label = NULL;
    p->xs = NULL;
}

static void show(const char *who, const struct polygon *p)
{
    int i;
    printf("%-8s %s (label %p, xs %p):", who, p->label, (void *)p->label, (void *)p->xs);
    for (i = 0; i < p->n; i++)
        printf(" %d", p->xs[i]);
    printf("\n");
}

int main(void)
{
    struct polygon original, shallow, deep;

    if (!make(&original, "square", 4))
        return 0;

    /*
     * Plain assignment copies the two pointers, not what they point at.
     * In the memory picture, original and shallow have arrows to the very
     * same heap blocks.
     */
    shallow = original;
    if (!deep_copy(&deep, &original)) {
        destroy(&original);
        return 0;
    }

    shallow.xs[0] = 99;      /* also changes original! */
    deep.xs[1] = -1;         /* changes only deep */
    show("original", &original);
    show("shallow", &shallow);
    show("deep", &deep);

    /*
     * Two owners for one block means two frees of one block. So shallow is
     * only a borrowed view: destroy original (which really owns the memory)
     * and deep, never shallow.
     */
    destroy(&original);
    destroy(&deep);
    return 0;
}
