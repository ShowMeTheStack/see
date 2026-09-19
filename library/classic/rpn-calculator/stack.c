/* stack.c: the value stack. sp and val are static: other files cannot
   name them, they can only use push and pop. That is C's way of hiding
   data, decades before classes. */
#include <stdio.h>
#include "calc.h"

#define MAXVAL 100

static int sp = 0;           /* next free position */
static double val[MAXVAL];   /* the values themselves */

/* Watch val in the globals panel: push writes at val[sp] and moves sp up,
   pop moves sp down and reads. Values above sp are left behind, but
   they no longer count. */
void push(double f)
{
    if (sp < MAXVAL)
        val[sp++] = f;
    else
        printf("error: stack full, can't push %g\n", f);
}

double pop(void)
{
    if (sp > 0)
        return val[--sp];
    printf("error: stack empty\n");
    return 0.0;
}

int depth(void)
{
    return sp;
}

void clear(void)
{
    sp = 0;
}
