/*
 * title: Numerical integration of any function
 * level: 3
 * about: Integrates several functions with the trapezoid rule and Simpson's rule, each taking the function to integrate as a parameter.
 */
#include <stdio.h>
#include <math.h>

typedef double (*realfn)(double);

/*
 * Trapezoid rule: cut [a, b] into n strips and replace the curve on each
 * strip by a straight line. The integrator never knows which function
 * it is integrating; it only calls f.
 */
double trapezoid(realfn f, double a, double b, int n)
{
    double h = (b - a) / n, sum;
    int i;
    sum = (f(a) + f(b)) / 2.0;
    for (i = 1; i < n; i++)
        sum += f(a + i * h);
    return sum * h;
}

/* Simpson's rule fits parabolas through pairs of strips; n must be even. */
double simpson(realfn f, double a, double b, int n)
{
    double h = (b - a) / n, sum;
    int i;
    sum = f(a) + f(b);
    for (i = 1; i < n; i++)
        sum += (i % 2 ? 4.0 : 2.0) * f(a + i * h);
    return sum * h / 3.0;
}

/* Our own functions, alongside library ones like sin and exp. */
double parabola(double x) { return x * x; }
double bell(double x)     { return exp(-x * x); }
double quarter_circle(double x) { return sqrt(1.0 - x * x); }

struct problem {
    const char *text;
    realfn f;               /* a library function's address works just like ours */
    double a, b;
    double exact;
};

int main(void)
{
    struct problem p[5];
    int i, n;

    p[0].text = "x^2 on [0,3]";       p[0].f = parabola;       p[0].a = 0; p[0].b = 3;
    p[0].exact = 9.0;
    p[1].text = "sin x on [0,pi]";    p[1].f = sin;            p[1].a = 0; p[1].b = 3.14159265358979;
    p[1].exact = 2.0;
    p[2].text = "e^x on [0,1]";       p[2].f = exp;            p[2].a = 0; p[2].b = 1;
    p[2].exact = exp(1.0) - 1.0;
    p[3].text = "sqrt(1-x^2) [0,1]";  p[3].f = quarter_circle; p[3].a = 0; p[3].b = 1;
    p[3].exact = 3.14159265358979 / 4.0;
    p[4].text = "e^(-x^2) on [0,2]";  p[4].f = bell;           p[4].a = 0; p[4].b = 2;
    p[4].exact = 0.882081390762422;

    printf("%-20s %4s %12s %12s %12s\n", "integral", "n", "trapezoid", "simpson", "exact");
    for (i = 0; i < 5; i++) {
        for (n = 4; n <= 64; n *= 4)
            printf("%-20s %4d %12.8f %12.8f %12.8f\n",
                   n == 4 ? p[i].text : "", n,
                   trapezoid(p[i].f, p[i].a, p[i].b, n),
                   simpson(p[i].f, p[i].a, p[i].b, n),
                   p[i].exact);
    }
    /*
     * Simpson's rule is exact for x^2 even with 4 strips: it is built
     * from parabolas. The quarter circle converges slowly for both,
     * because its slope is infinite at x = 1.
     */
    return 0;
}
