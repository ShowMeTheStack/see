/*
 * shape.c - the polygon functions.
 */
#include <stdio.h>
#include "shape.h"
#include "point.h"   /* already included by shape.h; the guard skips it */

void shape_init(struct shape *s, const char *name)
{
    s->name = name;
    s->count = 0;
}

/* Returns 1 on success, 0 when the polygon is full. */
int shape_add(struct shape *s, struct point p)
{
    if (s->count >= SHAPE_MAX_POINTS)
        return 0;
    s->pts[s->count++] = p;
    return 1;
}

/* Sum of the squared side lengths, going round back to the start. */
int shape_perimeter2(const struct shape *s)
{
    int i, total = 0;
    for (i = 0; i < s->count; i++)
        total += point_dist2(s->pts[i], s->pts[(i + 1) % s->count]);
    return total;
}

void shape_print(const struct shape *s)
{
    int i;
    printf("%s:", s->name);
    for (i = 0; i < s->count; i++) {
        printf(" ");
        point_print(s->pts[i]);
    }
    printf("\n");
}
