/* shapes.h - one struct that can be any of three shapes.
 * The kind field says which member of the union is in use. */
#ifndef SHAPES_H
#define SHAPES_H

enum shape_kind { CIRCLE, RECTANGLE, TRIANGLE };

struct shape {
    enum shape_kind kind;
    const char *name;
    union {
        struct { double r; } circle;
        struct { double w, h; } rect;
        struct { double a, b, c; } tri;
    } u;
};

void shape_circle(struct shape *s, const char *name, double r);
void shape_rect(struct shape *s, const char *name, double w, double h);
void shape_triangle(struct shape *s, const char *name, double a, double b, double c);
double shape_area(const struct shape *s);
double shape_perimeter(const struct shape *s);
const char *shape_kind_name(const struct shape *s);

#endif
