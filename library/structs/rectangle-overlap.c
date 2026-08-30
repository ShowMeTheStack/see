/*
 * title: Rectangles that overlap
 * level: 2
 * about: Builds rectangles from two corner points, computes areas and the intersection of each pair.
 */
#include <stdio.h>

struct point {
    int x;
    int y;
};

/* A struct may contain other structs. A rectangle is described by its
   bottom-left and top-right corners. In the memory picture a rect is one
   16-byte box holding two smaller 8-byte boxes. */
struct rect {
    struct point lo;
    struct point hi;
};

int max(int a, int b) { return a > b ? a : b; }
int min(int a, int b) { return a < b ? a : b; }

/* Build a rectangle from any two opposite corners, sorting the coordinates so
   that lo really is the lower-left one. Returning a struct by value is allowed
   in C89: the whole thing is copied back to the caller. */
struct rect make_rect(int x1, int y1, int x2, int y2)
{
    struct rect r;
    r.lo.x = min(x1, x2);
    r.lo.y = min(y1, y2);
    r.hi.x = max(x1, x2);
    r.hi.y = max(y1, y2);
    return r;
}

int area(struct rect r)
{
    return (r.hi.x - r.lo.x) * (r.hi.y - r.lo.y);
}

/* The overlap of two rectangles is again a rectangle: the larger of the two
   low corners and the smaller of the two high corners. If that rectangle is
   "inside out", there is no overlap. The result goes through a pointer so the
   function can also return a yes/no answer. */
int intersect(struct rect a, struct rect b, struct rect *out)
{
    out->lo.x = max(a.lo.x, b.lo.x);
    out->lo.y = max(a.lo.y, b.lo.y);
    out->hi.x = min(a.hi.x, b.hi.x);
    out->hi.y = min(a.hi.y, b.hi.y);
    return out->lo.x < out->hi.x && out->lo.y < out->hi.y;
}

void print_rect(struct rect r)
{
    printf("[(%d,%d)-(%d,%d)]", r.lo.x, r.lo.y, r.hi.x, r.hi.y);
}

int main(void)
{
    struct rect r[4];
    struct rect both;
    int i, j;

    r[0] = make_rect(0, 0, 4, 3);
    r[1] = make_rect(6, 5, 2, 1);   /* corners given "backwards" on purpose */
    r[2] = make_rect(5, 0, 8, 2);
    r[3] = make_rect(1, 1, 2, 2);

    for (i = 0; i < 4; i++) {
        printf("r%d ", i);
        print_rect(r[i]);
        printf(" area %d\n", area(r[i]));
    }

    for (i = 0; i < 4; i++) {
        for (j = i + 1; j < 4; j++) {
            printf("r%d & r%d: ", i, j);
            if (intersect(r[i], r[j], &both)) {
                print_rect(both);
                printf(" area %d\n", area(both));
            } else {
                printf("no overlap\n");
            }
        }
    }
    return 0;
}
