/*
 * title: Shapes with a tagged union
 * level: 2
 * about: Builds circles, rectangles and triangles through a shapes module and prints their areas and perimeters.
 */

/* See builds main.c and shapes.c as separate pieces and links them.
 * main.c never looks inside the union; it asks shapes.c for answers. */
#include <stdio.h>
#include "shapes.h"

int main(void)
{
    struct shape s[4];
    double total = 0.0;
    int i;

    shape_circle(&s[0], "coin", 1.25);
    shape_rect(&s[1], "door", 0.9, 2.1);
    shape_triangle(&s[2], "sail", 3.0, 4.0, 5.0);
    shape_rect(&s[3], "tile", 0.3, 0.3);

    /* Expand s in the stack panel: each element is the same size, the size
     * of the largest union member (three doubles) plus kind and name.
     * A circle uses only the first double; the rest is just space. */
    printf("%-6s %-10s %9s %9s\n", "name", "kind", "area", "perim");
    for (i = 0; i < 4; i++) {
        printf("%-6s %-10s %9.3f %9.3f\n", s[i].name, shape_kind_name(&s[i]),
               shape_area(&s[i]), shape_perimeter(&s[i]));
        total += shape_area(&s[i]);
    }
    printf("total area %.3f\n", total);
    printf("sizeof(struct shape) = %u\n", (unsigned)sizeof(struct shape));
    return 0;
}
