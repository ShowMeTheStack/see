/*
 * title: Const pointer to const
 * level: 2
 * about: Lines up the four combinations of const and pointer and tries each allowed operation on them.
 */
#include <stdio.h>

int main(void)
{
    int a = 1, b = 2;

    int *p1 = &a;                    /* may move, may write */
    const int *p2 = &a;              /* may move, may not write */
    int * const p3 = &a;             /* may not move, may write */
    const int * const p4 = &a;       /* may not move, may not write */

    /* Everything allowed, one line each. */
    p1 = &b;   *p1 = 20;             /* b becomes 20 */
    p2 = &b;                         /* p2 now looks at b */
    *p3 = 10;                        /* a becomes 10 */

    printf("a = %d, b = %d\n", a, b);
    printf("*p1 = %d, *p2 = %d, *p3 = %d, *p4 = %d\n", *p1, *p2, *p3, *p4);

    /*
     * And what the compiler refuses:
     *     *p2 = 0;    error: assignment of read-only location '*p2'
     *     p3 = &b;    error: assignment of read-only variable 'p3'
     *     p4 = &b;    error: assignment of read-only variable 'p4'
     *     *p4 = 0;    error: assignment of read-only location '*p4'
     *
     * A rule to remember them all: const applies to whatever is just to
     * its LEFT, or to what is just to its right if nothing is on the left.
     *     const int *        the int is const
     *     int * const        the pointer is const
     *     const int * const  both
     */
    printf("p4 still points at a: %s\n", p4 == &a ? "yes" : "no");
    return 0;
}
