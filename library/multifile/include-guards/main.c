/*
 * title: Include guards stop double definitions
 * level: 1
 * about: Includes the same header twice, once directly and once through another header, and stays correct thanks to include guards.
 */

/* The folder has point.c, line.c and main.c, built separately by See and
 * then linked into one program. Headers are not built on their own: the
 * preprocessor pastes them into each .c file that asks for them. */
#include <stdio.h>
#include "point.h"
#include "line.h"   /* pulls in point.h a second time; the guard skips it */
#include "point.h"  /* and a third time, still harmless */

int main(void)
{
    struct line l;
    struct point m;

    l.a = point_make(2, 3);
    l.b = point_make(10, 9);

    printf("line from ");
    point_print(l.a);
    printf(" to ");
    point_print(l.b);
    printf("\n");

    /* Step over this call and look at the stack: line_midpoint got its own
     * copy of l, eight ints, separate from main's. */
    m = line_midpoint(l);
    printf("midpoint ");
    point_print(m);
    printf("\nlength squared %d\n", line_length_squared(l));
    return 0;
}
