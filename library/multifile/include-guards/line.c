#include "line.h"

int line_length_squared(struct line l)
{
    int dx = l.b.x - l.a.x;
    int dy = l.b.y - l.a.y;
    return dx * dx + dy * dy;
}

/* Structs are passed and returned by value: l here is a full copy. */
struct point line_midpoint(struct line l)
{
    return point_make((l.a.x + l.b.x) / 2, (l.a.y + l.b.y) / 2);
}
