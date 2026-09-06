/*
 * title: Finding roots by bisection and Newton's method
 * level: 3
 * about: Solves f(x) = 0 for several functions, passing f (and its derivative for Newton) as function pointers, and compares how fast each method closes in.
 */
#include <stdio.h>
#include <math.h>

typedef double (*fn)(double);

/*
 * Bisection: f(a) and f(b) have opposite signs, so a root lies between.
 * Halve the interval, keep the half where the sign still changes. Slow
 * but sure: one bit of accuracy per step.
 */
double bisect(fn f, double a, double b, double tol, int *steps)
{
    double m = a, fa = f(a);
    *steps = 0;
    while (b - a > tol) {
        m = (a + b) / 2.0;
        (*steps)++;
        if ((f(m) < 0) == (fa < 0)) {
            a = m;
            fa = f(m);
        } else {
            b = m;
        }
    }
    return (a + b) / 2.0;
}

/*
 * Newton: slide down the tangent line to where it crosses zero.
 * x' = x - f(x) / f'(x). Near a simple root the number of correct
 * digits roughly doubles every step, but it needs the derivative, and
 * a bad starting point can send it anywhere.
 */
double newton(fn f, fn df, double x, double tol, int *steps)
{
    double dx;
    *steps = 0;
    do {
        dx = f(x) / df(x);
        x -= dx;
        (*steps)++;
    } while (fabs(dx) > tol && *steps < 50);
    return x;
}

/* x^2 - 2 = 0 gives sqrt(2). */
double sq2(double x)   { return x * x - 2.0; }
double dsq2(double x)  { return 2.0 * x; }

/* x^3 - x - 1 = 0: the "plastic number". */
double cubic(double x)  { return x * x * x - x - 1.0; }
double dcubic(double x) { return 3.0 * x * x - 1.0; }

/* cos x = x */
double fixed(double x)  { return cos(x) - x; }
double dfixed(double x) { return -sin(x) - 1.0; }

struct equation {
    const char *text;
    fn f, df;
    double a, b;
};

int main(void)
{
    struct equation eq[3];
    int i, s1, s2;
    double r1, r2;

    eq[0].text = "x^2 = 2";     eq[0].f = sq2;   eq[0].df = dsq2;   eq[0].a = 0; eq[0].b = 2;
    eq[1].text = "x^3 = x + 1"; eq[1].f = cubic; eq[1].df = dcubic; eq[1].a = 1; eq[1].b = 2;
    eq[2].text = "cos x = x";   eq[2].f = fixed; eq[2].df = dfixed; eq[2].a = 0; eq[2].b = 1;

    for (i = 0; i < 3; i++) {
        r1 = bisect(eq[i].f, eq[i].a, eq[i].b, 1e-10, &s1);
        r2 = newton(eq[i].f, eq[i].df, eq[i].b, 1e-10, &s2);
        printf("%-12s bisection %.10f in %2d steps, Newton %.10f in %d steps\n",
               eq[i].text, r1, s1, r2, s2);
    }
    return 0;
}
