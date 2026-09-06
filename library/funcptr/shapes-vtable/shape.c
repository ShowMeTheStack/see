/*
 * shape.c: code that only knows about struct shape and its table.
 * Nothing here mentions circles or rectangles, yet it can print and
 * scale them all: that is the whole point of the vtable.
 */
#include <stdio.h>
#include "shape.h"

double shape_area(const struct shape *s)      { return s->ops->area(s); }
double shape_perimeter(const struct shape *s) { return s->ops->perimeter(s); }
void shape_scale(struct shape *s, double f)   { s->ops->scale(s, f); }

void shape_print(const struct shape *s)
{
    printf("%-6s %-9s area %8.2f  perimeter %7.2f\n",
           s->label, s->ops->kind, shape_area(s), shape_perimeter(s));
}
