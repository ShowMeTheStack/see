/* point.h - a 2D point. This header is included by line.h AND by main.c,
 * so main.c ends up reading it twice. Without the guard below, the second
 * copy would define struct point again, which is an error.
 *
 * How the guard works: the first time through, POINT_H is not defined,
 * so the preprocessor defines it and keeps everything up to #endif. The
 * second time, POINT_H is already defined and the whole body is skipped. */
#ifndef POINT_H
#define POINT_H

struct point {
    int x;
    int y;
};

struct point point_make(int x, int y);
void point_print(struct point p);

#endif /* POINT_H */
