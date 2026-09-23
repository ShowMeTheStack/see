/* line.h - a segment between two points. It needs struct point, so it
 * includes point.h itself; a header should stand on its own. */
#ifndef LINE_H
#define LINE_H

#include "point.h"

struct line {
    struct point a;
    struct point b;
};

int line_length_squared(struct line l);
struct point line_midpoint(struct line l);

#endif /* LINE_H */
