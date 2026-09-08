/*
 * shape.h - a polygon made of points.
 *
 * A polygon needs struct point, so this header includes point.h
 * itself. A header should bring in whatever it depends on; the
 * guards make that safe however the includes end up nested.
 */
#ifndef SHAPE_H
#define SHAPE_H

#include "point.h"

#define SHAPE_MAX_POINTS 8

struct shape {
    const char *name;
    int count;
    struct point pts[SHAPE_MAX_POINTS];
};

void shape_init(struct shape *s, const char *name);
int shape_add(struct shape *s, struct point p);
int shape_perimeter2(const struct shape *s);
void shape_print(const struct shape *s);

#endif /* SHAPE_H */
