/*
 * circle.c: one concrete shape. The struct shape comes first; the
 * circle's own data follows it in the same heap block.
 */
#include <stdlib.h>
#include "shape.h"

struct circle {
    struct shape base;      /* must be first */
    double r;
};

/* Convert back from the base pointer: safe because base is first. */
static double c_area(const struct shape *s)
{
    const struct circle *c = (const struct circle *)s;
    return 3.14159265358979 * c->r * c->r;
}
static double c_perimeter(const struct shape *s)
{
    const struct circle *c = (const struct circle *)s;
    return 2.0 * 3.14159265358979 * c->r;
}
static void c_scale(struct shape *s, double f)
{
    ((struct circle *)s)->r *= f;
}

/* static: one table for all circles, invisible outside this file. */
static const struct shape_ops circle_ops = { "circle", c_area, c_perimeter, c_scale };

struct shape *circle_new(const char *label, double r)
{
    struct circle *c = malloc(sizeof *c);
    if (c == NULL)
        return NULL;
    c->base.ops = &circle_ops;
    c->base.label = label;
    c->r = r;
    return &c->base;
}
