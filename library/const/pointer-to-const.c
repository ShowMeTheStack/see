/*
 * title: Pointer to const, const int *p
 * level: 2
 * about: Uses a pointer that may move from value to value but may not change what it points at.
 */
#include <stdio.h>

int main(void)
{
    int marks[4];
    int bonus = 10;
    const int *p;          /* p points to a const int: *p is read-only */
    int i;

    marks[0] = 61; marks[1] = 74; marks[2] = 58; marks[3] = 90;

    /*
     * The ints themselves are not const. The const is a promise made by
     * p: "through me, you can only look". Pointing a const int * at a
     * plain int is always allowed; it only adds a restriction.
     */
    p = &marks[0];
    printf("first mark: %d\n", *p);

    /* The pointer itself may move; watch its arrow walk the array. */
    for (i = 0; i < 4; i++, p++)
        printf("mark %d: %d\n", i, *p);

    p = &bonus;            /* and point somewhere else entirely */
    printf("bonus: %d\n", *p);

    /*
     *     *p = 20;
     * would stop the build with:
     *     error: assignment of read-only location '*p'
     */

    /* The object can still be changed by its own name; p simply sees the new value. */
    bonus = 20;
    printf("bonus after changing it directly: %d\n", *p);

    /* "int const *p" means exactly the same as "const int *p"; only the side of int differs. */
    return 0;
}
