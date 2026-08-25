/*
 * title: static locals remember, automatic locals forget
 * level: 1
 * about: Calls a function five times; its automatic counter starts again at zero every call while its static counter keeps counting.
 */
#include <stdio.h>

static void visit(void)
{
    int fresh = 0;          /* automatic: made new in each call's stack frame */
    static int kept = 0;    /* static: made once, lives with the globals */

    fresh = fresh + 1;
    kept = kept + 1;
    printf("fresh = %d   kept = %d\n", fresh, kept);

    /*
     * In See, watch where the two live: fresh appears inside visit's frame
     * on the stack and disappears when visit returns. kept sits in the
     * globals area the whole time, even while main is running.
     */
}

int main(void)
{
    int i;

    for (i = 0; i < 5; i++)
        visit();

    /*
     * The initialiser "= 0" on kept runs once, before main starts; it is not
     * an assignment that happens on every call. That is the whole trick.
     */
    return 0;
}
