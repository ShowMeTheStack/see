/*
 * title: Shapes as a tagged union
 * level: 3
 * about: Stores circles, rectangles and triangles in one array using a struct with a kind tag and a union of their measurements.
 */
#include <stdio.h>
#include <math.h>
#include <string.h>

enum kind { CIRCLE, RECTANGLE, TRIANGLE };

/* A union holds ONE of its members at a time, and all members start at the
   same address. Its size is the size of its largest member. The tag field
   outside the union records which member is the live one; reading any other
   member would give nonsense. */
struct shape {
    enum kind kind;
    union {
        struct { double r; } circle;
        struct { double w, h; } rect;
        struct { double a, b, c; } tri;
    } u;
};

/* Start every shape from all-zero bytes. A circle only uses 8 of the 24
   union bytes, and returning the struct copies all of them, so the unused
   ones should hold something definite rather than leftover stack junk. */
struct shape blank(void)
{
    struct shape s;
    memset(&s, 0, sizeof s);
    return s;
}

struct shape circle(double r)
{
    struct shape s = blank();
    s.kind = CIRCLE;
    s.u.circle.r = r;
    return s;
}

struct shape rectangle(double w, double h)
{
    struct shape s = blank();
    s.kind = RECTANGLE;
    s.u.rect.w = w;
    s.u.rect.h = h;
    return s;
}

struct shape triangle(double a, double b, double c)
{
    struct shape s = blank();
    s.kind = TRIANGLE;
    s.u.tri.a = a;
    s.u.tri.b = b;
    s.u.tri.c = c;
    return s;
}

/* Every function that uses a shape switches on the tag first. */
double area(const struct shape *s)
{
    double p;
    switch (s->kind) {
    case CIRCLE:
        return 3.14159265358979 * s->u.circle.r * s->u.circle.r;
    case RECTANGLE:
        return s->u.rect.w * s->u.rect.h;
    case TRIANGLE:
        /* Heron's formula from the three sides. */
        p = (s->u.tri.a + s->u.tri.b + s->u.tri.c) / 2.0;
        return sqrt(p * (p - s->u.tri.a) * (p - s->u.tri.b) * (p - s->u.tri.c));
    }
    return 0.0;
}

double perimeter(const struct shape *s)
{
    switch (s->kind) {
    case CIRCLE:    return 2.0 * 3.14159265358979 * s->u.circle.r;
    case RECTANGLE: return 2.0 * (s->u.rect.w + s->u.rect.h);
    case TRIANGLE:  return s->u.tri.a + s->u.tri.b + s->u.tri.c;
    }
    return 0.0;
}

const char *kind_name(enum kind k)
{
    static const char *names[] = { "circle", "rectangle", "triangle" };
    return names[k];
}

int main(void)
{
    struct shape shapes[4];
    double total = 0.0;
    int i;

    shapes[0] = circle(1.5);
    shapes[1] = rectangle(3.0, 4.0);
    shapes[2] = triangle(3.0, 4.0, 5.0);
    shapes[3] = circle(0.5);

    for (i = 0; i < 4; i++) {
        printf("%-10s area %7.3f  perimeter %7.3f\n", kind_name(shapes[i].kind),
               area(&shapes[i]), perimeter(&shapes[i]));
        total += area(&shapes[i]);
    }
    printf("total area %.3f\n", total);

    /* The union is as big as its biggest member (three doubles = 24 bytes),
       and the struct adds the tag plus padding to keep the doubles aligned. */
    printf("sizeof union = %d, sizeof struct shape = %d\n",
           (int)sizeof shapes[0].u, (int)sizeof(struct shape));
    return 0;
}
