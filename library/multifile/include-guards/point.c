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
