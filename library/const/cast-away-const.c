/*
 * title: Casting const away
 * level: 4
 * about: Removes const with a cast twice, once harmlessly on an object that was never const and once on a truly const global, where See stops the write.
 * expect: fault
 */
#include <stdio.h>

/* Really const: it lives in read-only data, next to the string literals. */
static const int limit = 100;

/*
 * A function that promised not to change *p, then broke the promise.
 * The cast silences the compiler; it does not make the write safe.
 */
void sneaky_reset(const int *p)
{
    int *q = (int *)p;           /* the cast throws the const away */
    *q = 0;
}

int main(void)
{
    int score = 42;              /* an ordinary, writable int */

    /*
     * Case 1: score was never const. It was only viewed through a const
     * pointer for a while. Writing through the cast is legal C (though
     * it betrays anyone who trusted the const parameter).
     */
    sneaky_reset(&score);
    printf("score after sneaky_reset: %d\n", score);

    /*
     * Case 2: limit was DEFINED const. Writing to it is undefined
     * behaviour. Here it sits in read-only memory, so See stops the
     * program on the write inside sneaky_reset with "write to read-only
     * memory". On other systems it might crash, or quietly work, or the
     * compiler may already have copied 100 into every place limit is used
     * so the change is invisible. None of these can be relied on.
     */
    printf("limit is %d; now trying to reset it...\n", limit);
    sneaky_reset(&limit);

    printf("never reached: limit = %d\n", limit);
    return 0;
}
