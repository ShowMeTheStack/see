/*
 * title: A variable that cannot change
 * level: 1
 * about: Declares const values for a circle calculation and shows the compiler refusing an assignment to one of them.
 */
#include <stdio.h>

int main(void)
{
    /*
     * const means "read-only after this line". A const variable must get
     * its value in the declaration, because no later assignment is allowed.
     */
    const double pi = 3.14159265;
    const int sides_of_triangle = 3;
    double r = 2.0;
    double area;

    area = pi * r * r;
    printf("a circle of radius %.1f has area %.3f\n", r, area);

    r = 5.0;                     /* r is an ordinary variable: fine */
    printf("radius %.1f: area %.3f\n", r, pi * r * r);

    /*
     * Remove the comment marks from the next line and build. The compiler
     * stops with:
     *     error: assignment of read-only variable 'pi'
     * The mistake is caught before the program ever runs, which is the
     * whole point of writing const.
     */
    /* pi = 3.0; */

    /*
     * ++ and += change the variable too, so they are refused as well:
     *     sides_of_triangle++;   error: increment of read-only variable 'sides_of_triangle'
     */

    printf("a triangle still has %d sides\n", sides_of_triangle);
    return 0;
}
