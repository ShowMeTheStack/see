/*
 * point.h - a 2D point type.
 *
 * Both shape.h and main.c include this file, so in main.c it arrives
 * twice. Without the guard the compiler would see "struct point"
 * defined two times and stop with an error.
 *
 * The guard works like this: the first time through, POINT_H is not
 * defined, so everything up to #endif is kept, including the line
 * that defines POINT_H. The second time, #ifndef POINT_H is false and
 * the whole file collapses to nothing.
 */
#ifndef POINT_H
#define POINT_H

struct point {
    int x;
    int y;
};

/* Declarations only. The bodies live in point.c, compiled once. */
struct point point_make(int x, int y);
void point_print(struct point p);
int point_dist2(struct point a, struct point b);

#endif /* POINT_H */
