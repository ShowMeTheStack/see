/*
 * title: Structs in, structs out
 * level: 2
 * about: Passes 2D points and rectangles to functions by value and gets new structs back, all without a single pointer.
 */
#include <stdio.h>

struct point {
    double x, y;
};

struct rect {
    struct point lo;   /* bottom-left corner */
    struct point hi;   /* top-right corner */
};

/* A struct argument is copied whole into the callee's frame, just like
   an int. Returning a struct copies it back out. */
struct point make_point(double x, double y)
{
    struct point p;

    p.x = x;
    p.y = y;
    return p;
}

struct point midpoint(struct point a, struct point b)
{
    return make_point((a.x + b.x) / 2, (a.y + b.y) / 2);
}

/* The smallest rectangle containing both points. */
struct rect bounding_box(struct point a, struct point b)
{
    struct rect r;

    r.lo.x = a.x < b.x ? a.x : b.x;
    r.lo.y = a.y < b.y ? a.y : b.y;
    r.hi.x = a.x > b.x ? a.x : b.x;
    r.hi.y = a.y > b.y ? a.y : b.y;
    return r;
}

double area(struct rect r)
{
    return (r.hi.x - r.lo.x) * (r.hi.y - r.lo.y);
}

/* Changing a copy does nothing to the original. */
void try_to_move(struct point p)
{
    p.x = 999;
    p.y = 999;
}

int main(void)
{
    struct point a, b, m;
    struct rect box;

    a = make_point(1, 5);
    b = make_point(7, -1);

    /* Step into midpoint: its a and b are separate 16-byte copies in a
       new frame. The doubles in them sit at 8-byte aligned addresses. */
    m = midpoint(a, b);
    printf("midpoint of (%g,%g) and (%g,%g) is (%g,%g)\n",
           a.x, a.y, b.x, b.y, m.x, m.y);

    box = bounding_box(a, b);
    printf("bounding box from (%g,%g) to (%g,%g), area %g\n",
           box.lo.x, box.lo.y, box.hi.x, box.hi.y, area(box));

    try_to_move(a);
    printf("after try_to_move, a is still (%g,%g)\n", a.x, a.y);
    return 0;
}
