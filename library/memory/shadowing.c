/*
 * title: Same name, different boxes
 * level: 2
 * about: Declares a variable called x at file scope, in main and in two nested blocks, printing each one's address to show they are four separate objects.
 */
#include <stdio.h>

int x = 1;          /* file scope: lives with the globals */

static void show_global(void)
{
    /* No local x here, so this x is the global one. */
    printf("in show_global: x = %d at %p\n", x, (void *)&x);
}

int main(void)
{
    int x = 2;      /* hides the global inside main */

    printf("main block    : x = %d at %p\n", x, (void *)&x);
    {
        int x = 3;  /* hides main's x inside these braces */
        printf("inner block   : x = %d at %p\n", x, (void *)&x);
        {
            int x = 4;
            printf("innermost     : x = %d at %p\n", x, (void *)&x);
            x = 40;     /* changes only the innermost box */
        }
        printf("inner again   : x = %d (untouched)\n", x);
    }
    printf("main again    : x = %d (untouched)\n", x);
    show_global();

    /*
     * Step through this in See: when you enter a block, a new x appears in
     * the stack panel next to the old one; the name refers to the nearest
     * enclosing declaration. Shadowing compiles fine but is easy to misread,
     * so most style guides discourage it.
     */
    return 0;
}
