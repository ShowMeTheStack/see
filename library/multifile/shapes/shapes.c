/* shapes.c - constructors and measurements for struct shape.
 * Every function switches on kind, so adding a shape means touching this
 * file and shapes.h, and nothing in main.c. */
#include <math.h>
#include "shapes.h"

#define PI 3.14159265358979

void shape_circle(struct shape *s, const char *name, double r)
{
    s->kind = CIRCLE;
    s->name = name;
    s->u.circle.r = r;
}

void shape_rect(struct shape *s, const char *name, double w, double h)
{
    s->kind = RECTANGLE;
    s->name = name;
    s->u.rect.w = w;
    s->u.rect.h = h;
}

void shape_triangle(struct shape *s, const char *name, double a, double b, double c)
{
    s->kind = TRIANGLE;
    s->name = name;
    s->u.tri.a = a;
    s->u.tri.b = b;
    s->u.tri.c = c;
}

double shape_area(const struct shape *s)
{
    double p;

    switch (s->kind) {
    case CIRCLE:
        return PI * s->u.circle.r * s->u.circle.r;
    case RECTANGLE:
        return s->u.rect.w * s->u.rect.h;
    case TRIANGLE:
        /* Heron's formula, from the three sides alone. */
        p = (s->u.tri.a + s->u.tri.b + s->u.tri.c) / 2.0;
        return sqrt(p * (p - s->u.tri.a) * (p - s->u.tri.b) * (p - s->u.tri.c));
    }
    return 0.0;
}

double shape_perimeter(const struct shape *s)
{
    switch (s->kind) {
    case CIRCLE:
        return 2.0 * PI * s->u.circle.r;
    case RECTANGLE:
        return 2.0 * (s->u.rect.w + s->u.rect.h);
    case TRIANGLE:
        return s->u.tri.a + s->u.tri.b + s->u.tri.c;
    }
    return 0.0;
}

const char *shape_kind_name(const struct shape *s)
{
    static const char *names[3] = { "circle", "rectangle", "triangle" };
    return names[s->kind];
}
