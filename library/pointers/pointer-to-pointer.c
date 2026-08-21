/*
 * title: A pointer to a pointer
 * level: 2
 * about: Builds a chain value <- p <- pp and reads and writes the value through one and two levels of indirection.
 */
#include <stdio.h>

int main(void)
{
    int value = 7;
    int other = 100;
    int *p = &value;      /* one arrow: p -> value */
    int **pp = &p;        /* two arrows: pp -> p -> value */

    /*
     * In the memory picture you will see a chain of arrows. Each * follows
     * one arrow:  pp is the address of p, *pp is p, **pp is value.
     */
    printf("value = %d\n", value);
    printf("*p    = %d\n", *p);
    printf("**pp  = %d\n", **pp);

    printf("&p  = %p, pp  = %p (the same)\n", (void *)&p, (void *)pp);
    printf("&value = %p, *pp = %p (the same)\n", (void *)&value, (void *)*pp);

    /* Writing through two levels changes value. */
    **pp = 42;
    printf("after **pp = 42: value = %d\n", value);

    /*
     * Writing through ONE level changes p, the middle link. Watch p's
     * arrow swing from value to other when you step over this line.
     */
    *pp = &other;
    printf("after *pp = &other: *p = %d, **pp = %d\n", *p, **pp);

    /* value has not moved and still holds 42; nobody points at it now. */
    printf("value is still %d\n", value);
    return 0;
}
