/*
 * shape.h: the "base class". Every shape starts with a struct shape,
 * so a pointer to a circle or a rectangle can also be used as a
 * pointer to its struct shape part (C guarantees that a pointer to a
 * struct, suitably converted, points to its first member).
 */
#ifndef SHAPE_H
#define SHAPE_H

struct shape;

/*
 * The virtual table: one per kind of shape, shared by every shape of
 * that kind. Objects only store a pointer to it, so a thousand circles
 * cost one table, not a thousand copies of the function pointers.
 */
struct shape_ops {
    const char *kind;
    double (*area)(const struct shape *self);
    double (*perimeter)(const struct shape *self);
    void (*scale)(struct shape *self, double factor);
};

struct shape {
    const struct shape_ops *ops;
    const char *label;
};

/* Generic functions that work on any shape through its table. */
double shape_area(const struct shape *s);
double shape_perimeter(const struct shape *s);
void shape_scale(struct shape *s, double factor);
void shape_print(const struct shape *s);

/* Constructors for the concrete shapes; each returns a heap object. */
struct shape *circle_new(const char *label, double r);
struct shape *rect_new(const char *label, double w, double h);
struct shape *triangle_new(const char *label, double a, double b, double c);

#endif
