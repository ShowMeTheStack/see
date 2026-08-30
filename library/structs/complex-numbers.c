/*
 * title: Complex numbers and the Mandelbrot set
 * level: 3
 * about: Defines a complex number struct with add, multiply and modulus, checks a few identities, then draws the Mandelbrot set in ASCII.
 */
#include <stdio.h>
#include <math.h>

/* C89 has no complex type, so we make one. Two doubles: 16 bytes, and
   because double is aligned to 8 there is no padding between them. */
typedef struct {
    double re;
    double im;
} Complex;

Complex cx(double re, double im)
{
    Complex z;
    z.re = re;
    z.im = im;
    return z;
}

Complex cadd(Complex a, Complex b)
{
    return cx(a.re + b.re, a.im + b.im);
}

/* (a + bi)(c + di) = (ac - bd) + (ad + bc)i, because i*i = -1. */
Complex cmul(Complex a, Complex b)
{
    return cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
}

double cabs2(Complex z)       /* squared modulus: no sqrt needed for comparisons */
{
    return z.re * z.re + z.im * z.im;
}

void cprint(const char *label, Complex z)
{
    printf("%-10s %7.3f %c %.3fi\n", label, z.re, z.im < 0 ? '-' : '+', fabs(z.im));
}

/* A point c belongs to the Mandelbrot set if z -> z*z + c, starting from 0,
   never escapes beyond radius 2. We give up after a fixed number of steps. */
int escape_time(Complex c, int limit)
{
    Complex z = cx(0.0, 0.0);
    int n;
    for (n = 0; n < limit; n++) {
        if (cabs2(z) > 4.0)
            return n;
        z = cadd(cmul(z, z), c);
    }
    return limit;
}

int main(void)
{
    Complex i = cx(0.0, 1.0);
    Complex a = cx(3.0, 4.0);
    Complex b = cx(1.0, -2.0);
    const char *shades = " .:-=+*#%@";
    int row, col;

    cprint("i*i", cmul(i, i));
    cprint("a", a);
    cprint("b", b);
    cprint("a+b", cadd(a, b));
    cprint("a*b", cmul(a, b));
    printf("|a| = %.3f\n", sqrt(cabs2(a)));

    /* 24 rows by 60 columns, real part -2.1..0.9, imaginary -1.2..1.2.
       Each character costs at most 30 iterations, so this stays quick. */
    for (row = 0; row < 24; row++) {
        for (col = 0; col < 60; col++) {
            Complex c = cx(-2.1 + col * 0.05, 1.2 - row * 0.1);
            int n = escape_time(c, 30);
            putchar(n == 30 ? '@' : shades[n % 9]);
        }
        putchar('\n');
    }
    return 0;
}
