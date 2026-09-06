/*
 * title: Shapes with a shared virtual table
 * level: 4
 * about: Models circles, rectangles and triangles as heap objects that share one table of function pointers per kind, the way C++ implements virtual functions.
 */
#include <stdio.h>
#include <stdlib.h>
#include "shape.h"

#define NSHAPES 5

int main(void)
{
    struct shape *all[NSHAPES];
    double total = 0.0;
    int i, biggest = 0;

    all[0] = circle_new("wheel", 1.5);
    all[1] = rect_new("door", 0.9, 2.1);
    all[2] = triangle_new("sail", 3.0, 4.0, 5.0);
    all[3] = circle_new("coin", 0.25);
    all[4] = rect_new("field", 40.0, 25.0);
    for (i = 0; i < NSHAPES; i++)
        if (all[i] == NULL) {
            printf("out of memory\n");
            return 0;
        }

    /*
     * Stop here in See and follow the arrows: each heap object's ops
     * field points at a table in the globals, and both circles point at
     * the same table. The tables in turn point at the code.
     */
    for (i = 0; i < NSHAPES; i++) {
        shape_print(all[i]);
        total += shape_area(all[i]);
        if (shape_area(all[i]) > shape_area(all[biggest]))
            biggest = i;
    }
    printf("total area %.2f, biggest is %s\n\n", total, all[biggest]->label);

    /* Scale everything; each shape scales its own way. */
    printf("after doubling every size:\n");
    for (i = 0; i < NSHAPES; i++) {
        shape_scale(all[i], 2.0);
        shape_print(all[i]);
    }

    /*
     * The pointers were made from &c->base, the start of each block,
     * so they can be handed straight back to free.
     */
    for (i = 0; i < NSHAPES; i++)
        free(all[i]);
    return 0;
}
