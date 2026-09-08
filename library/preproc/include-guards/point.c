/*
 * point.c - the functions declared in point.h.
 */
#include <stdio.h>
#include "point.h"

struct point point_make(int x, int y)
{
    struct point p;
    p.x = x;
    p.y = y;
    return p;
}

void point_print(struct point p)
{
    printf("(%d, %d)", p.x, p.y);
}

/* Squared distance: no sqrt needed to compare lengths. */
int point_dist2(struct point a, struct point b)
{
    int dx = a.x - b.x;
    int dy = a.y - b.y;
    return dx * dx + dy * dy;
}
