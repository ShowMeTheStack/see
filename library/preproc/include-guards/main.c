/*
 * title: Include guards across several files
 * level: 3
 * about: Builds a square and a triangle from point and shape modules whose headers include each other safely.
 */
#include <stdio.h>

/*
 * main.c includes point.h directly and again through shape.h. Open
 * point.h to see the #ifndef / #define / #endif guard that makes the
 * second copy disappear. Try deleting the guard lines from point.h:
 * the build fails with a redefinition of struct point.
 */
#include "point.h"
#include "shape.h"
#include "point.h"

int main(void)
{
    struct shape square, tri;
    struct point origin;

    origin = point_make(0, 0);

    shape_init(&square, "square");
    shape_add(&square, origin);
    shape_add(&square, point_make(3, 0));
    shape_add(&square, point_make(3, 3));
    shape_add(&square, point_make(0, 3));

    shape_init(&tri, "triangle");
    shape_add(&tri, point_make(0, 0));
    shape_add(&tri, point_make(4, 0));
    shape_add(&tri, point_make(0, 3));

    shape_print(&square);
    printf("  sum of squared sides: %d\n", shape_perimeter2(&square));
    shape_print(&tri);
    printf("  sum of squared sides: %d\n", shape_perimeter2(&tri));

    /*
     * In the memory picture, square and tri are big structs on main's
     * stack, each with an array of eight points of which only some are
     * used. Their name fields point into the string literals.
     */
    return 0;
}
