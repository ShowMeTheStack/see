/*
 * title: Points and the distance between them
 * level: 1
 * about: Stores three points in structs, prints the distance between each pair and the perimeter of their triangle.
 */
#include <stdio.h>
#include <math.h>

/* A struct glues related values together under one name. A point is two
   doubles that always travel as a pair, so they belong in one struct. */
struct point {
    double x;
    double y;
};

/* The point is passed by value: the function receives its own copy of both
   fields. Step into this function (F11) and you will see a and b as two new
   16-byte boxes on the stack, separate from the ones in main. */
double distance(struct point a, struct point b)
{
    double dx = b.x - a.x;
    double dy = b.y - a.y;
    return sqrt(dx * dx + dy * dy);
}

void show(const char *name, struct point p)
{
    printf("%s = (%.1f, %.1f)\n", name, p.x, p.y);
}

int main(void)
{
    /* A struct can be initialised with a brace list, in field order. */
    struct point a = { 0.0, 0.0 };
    struct point b = { 3.0, 0.0 };
    struct point c;
    double ab, bc, ca;

    /* Or field by field with the dot operator. */
    c.x = 3.0;
    c.y = 4.0;

    show("a", a);
    show("b", b);
    show("c", c);

    ab = distance(a, b);
    bc = distance(b, c);
    ca = distance(c, a);

    printf("|ab| = %.3f\n", ab);
    printf("|bc| = %.3f\n", bc);
    printf("|ca| = %.3f\n", ca);
    printf("perimeter = %.3f\n", ab + bc + ca);

    /* Assigning one struct to another copies every field at once. Changing
       the copy afterwards leaves the original alone. */
    b = c;
    b.y = 10.0;
    show("b after b = c; b.y = 10", b);
    show("c is unchanged", c);
    return 0;
}
