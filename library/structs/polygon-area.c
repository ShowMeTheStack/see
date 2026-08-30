/*
 * title: Polygon area with the shoelace formula
 * level: 2
 * about: Reads polygons as lists of vertices into an array of point structs, then prints each one's area, perimeter, orientation and centroid.
 * input: 4\n0 0\n4 0\n4 3\n0 3\n3\n0 0\n0 6\n8 0\n6\n0 0\n6 0\n6 2\n2 2\n2 5\n0 5\n0\n
 */
#include <stdio.h>
#include <math.h>

#define MAXV 20

typedef struct {
    double x, y;
} Point;

typedef struct {
    int n;
    Point v[MAXV];
} Polygon;

/* Shoelace: add up cross products of consecutive vertices. The result is
   twice the signed area: positive if the vertices go anticlockwise. The
   index (i + 1) % n wraps the last vertex round to the first. */
double signed_area(const Polygon *p)
{
    double s = 0.0;
    int i;
    for (i = 0; i < p->n; i++) {
        const Point *a = &p->v[i];
        const Point *b = &p->v[(i + 1) % p->n];
        s += a->x * b->y - b->x * a->y;
    }
    return s / 2.0;
}

double perimeter(const Polygon *p)
{
    double s = 0.0;
    int i;
    for (i = 0; i < p->n; i++) {
        Point a = p->v[i];
        Point b = p->v[(i + 1) % p->n];
        s += sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    }
    return s;
}

Point centroid(const Polygon *p)
{
    Point c;
    double a = signed_area(p);
    int i;
    c.x = c.y = 0.0;
    for (i = 0; i < p->n; i++) {
        Point s = p->v[i];
        Point t = p->v[(i + 1) % p->n];
        double cross = s.x * t.y - t.x * s.y;
        c.x += (s.x + t.x) * cross;
        c.y += (s.y + t.y) * cross;
    }
    c.x /= 6.0 * a;
    c.y /= 6.0 * a;
    return c;
}

int main(void)
{
    Polygon poly;
    int i, count = 0;

    /* A vertex count of 0 ends the input. */
    while (scanf("%d", &poly.n) == 1 && poly.n >= 3 && poly.n <= MAXV) {
        double a;
        Point c;
        for (i = 0; i < poly.n; i++)
            scanf("%lf %lf", &poly.v[i].x, &poly.v[i].y);
        a = signed_area(&poly);
        c = centroid(&poly);
        count++;
        printf("polygon %d: %d vertices, area %.2f, perimeter %.2f, %s, centroid (%.3f, %.3f)\n",
               count, poly.n, fabs(a), perimeter(&poly),
               a > 0 ? "anticlockwise" : "clockwise", c.x, c.y);
    }
    return 0;
}
