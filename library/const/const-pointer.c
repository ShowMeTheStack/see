/*
 * title: Const pointer, int * const p
 * level: 2
 * about: Uses a pointer that is fixed to one object for life but may freely change that object.
 */
#include <stdio.h>

int main(void)
{
    int counter = 0;
    int other = 99;

    /*
     * Here const sits AFTER the star, so it applies to the pointer, not
     * to the int. cp is locked onto counter from birth: it must be
     * initialised, because it can never be assigned later.
     */
    int * const cp = &counter;
    int i;

    for (i = 0; i < 5; i++)
        *cp += i;                 /* changing the target is allowed */
    printf("counter = %d\n", counter);

    *cp = *cp * 10;
    printf("counter = %d\n", counter);

    /*
     *     cp = &other;
     * would stop the build with:
     *     error: assignment of read-only variable 'cp'
     * and so would cp++ . In the memory picture cp's arrow never moves.
     */

    printf("other is still %d\n", other);

    /*
     * An array name behaves much like a const pointer: you can write
     * through it, a[0] = 1, but you cannot make it point elsewhere.
     */
    return 0;
}
