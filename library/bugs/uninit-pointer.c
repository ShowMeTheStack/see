/*
 * title: A struct pointer that points nowhere
 * level: 2
 * about: Declares a pointer to a point struct and fills in its fields without ever making a struct for it to point at.
 * expect: fault
 */

/*
 * THE PUZZLE
 * Declaring struct point *p makes a pointer: four bytes able to hold
 * an address. It does not make a point. Which point is p->x = 3
 * writing into?
 *
 * HOW TO HUNT IT WITH SEE
 * Debug with F5 and look at main's frame: p is drawn in red, See's way
 * of saying "not set yet", because nothing has been stored in it.
 * Press F10. See first warns that p is read before it has a value, then stops the write,
 * because the leftover bits in p, taken as an address, lead somewhere
 * that is not yours. On a real machine the leftover value might happen
 * to be a valid address, and the write would silently damage another
 * variable.
 */
#include <stdio.h>

struct point {
    int x;
    int y;
};

int main(void)
{
    struct point *p;

    p->x = 3;
    p->y = 4;
    printf("(%d, %d)\n", p->x, p->y);
    return 0;
}

/*
 * THE FIX
 * Give the pointer something to point at, either a variable:
 *
 *     struct point pt;
 *     struct point *p = &pt;
 *
 * or a heap block from malloc(sizeof *p), checked for NULL and freed
 * later. A good habit: initialise every pointer when you declare it,
 * to a real object or to NULL, so a mistake fails at once and clearly.
 */
