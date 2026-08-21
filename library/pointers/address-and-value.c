/*
 * title: Address-of and dereference
 * level: 1
 * about: Takes the address of an int with &, follows it with *, and changes the int through the pointer.
 */
#include <stdio.h>

int main(void)
{
    int apples = 5;
    int *p;           /* p can hold the address of an int; right now it holds garbage */

    /*
     * & asks "where do you live?". The answer is an address, a number
     * like 0xbffff6c8. Step over this line (F10) and watch an arrow appear
     * from p to apples in the memory picture.
     */
    p = &apples;

    printf("apples lives at %p\n", (void *)&apples);
    printf("p holds         %p\n", (void *)p);

    /*
     * * goes the other way: "what lives at this address?".
     * *p is not a copy of apples; it IS apples, reached by another road.
     */
    printf("apples = %d, *p = %d\n", apples, *p);

    /* Writing through the pointer changes the int it points to. */
    *p = 12;
    printf("after *p = 12:   apples = %d\n", apples);

    /* And changing apples is visible through the pointer as well. */
    apples = apples + 1;
    printf("after apples+1:  *p = %d\n", *p);

    /*
     * & and * undo each other: *&apples is apples, and &*p is p.
     */
    printf("*&apples = %d, &*p == p is %s\n", *&apples, (&*p == p) ? "true" : "false");

    /* A pointer is a variable too, so it has its own address and size. */
    printf("p itself lives at %p and takes %lu bytes\n",
           (void *)&p, (unsigned long)sizeof p);
    return 0;
}
