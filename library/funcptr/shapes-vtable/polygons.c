/*
 * polygons.c: rectangles and triangles, each with its own table.
 */
#include <stdlib.h>
#include <math.h>
#include "shape.h"

struct rect {
    struct shape base;
    double w, h;
};

static double r_area(const struct shape *s)
{
    const struct rect *r = (const struct rect *)s;
    return r->w * r->h;
}
static double r_perimeter(const struct shape *s)
{
    const struct rect *r = (const struct rect *)s;
    return 2.0 * (r->w + r->h);
}
static void r_scale(struct shape *s, double f)
{
    struct rect *r = (struct rect *)s;
    r->w *= f;
    r->h *= f;
}

static const struct shape_ops rect_ops = { "rectangle", r_area, r_perimeter, r_scale };

struct shape *rect_new(const char *label, double w, double h)
{
    struct rect *r = malloc(sizeof *r);
    if (r == NULL)
        return NULL;
    r->base.ops = &rect_ops;
    r->base.label = label;
    r->w = w;
    r->h = h;
    return &r->base;
}

struct triangle {
    struct shape base;
    double a, b, c;
};

static double t_perimeter(const struct shape *s)
{
    const struct triangle *t = (const struct triangle *)s;
    return t->a + t->b + t->c;
}
/* Heron's formula from the three sides. */
static double t_area(const struct shape *s)
{
    const struct triangle *t = (const struct triangle *)s;
    double p = t_perimeter(s) / 2.0;
    return sqrt(p * (p - t->a) * (p - t->b) * (p - t->c));
}
static void t_scale(struct shape *s, double f)
{
    struct triangle *t = (struct triangle *)s;
    t->a *= f;
    t->b *= f;
    t->c *= f;
}

static const struct shape_ops triangle_ops = { "triangle", t_area, t_perimeter, t_scale };

struct shape *triangle_new(const char *label, double a, double b, double c)
{
    struct triangle *t = malloc(sizeof *t);
    if (t == NULL)
        return NULL;
    t->base.ops = &triangle_ops;
    t->base.label = label;
    t->a = a;
    t->b = b;
    t->c = c;
    return &t->base;
}
