/*
 * title: Solving a quadratic equation
 * level: 3
 * about: Reads the coefficients of several quadratics and prints two real roots, one repeated root, or a complex pair, depending on the discriminant.
 * input: 1 -3 2\n1 2 1\n1 2 5\n2 -7 3\n0 2 -8
 */
#include <stdio.h>
#include <math.h>

int main(void)
{
    double a, b, c;
    double disc;
    double root;
    double r1, r2;
    double real, imag;

    /* Each line of input is one equation a x^2 + b x + c = 0. */
    while (scanf("%lf %lf %lf", &a, &b, &c) == 3) {
        printf("%gx^2 + %gx + %g = 0:  ", a, b, c);

        /* If a is 0 there is no x^2 term and the formula below would
           divide by zero. Then it is the straight line b x + c = 0. */
        if (a == 0.0) {
            if (b == 0.0) {
                printf("not an equation in x\n");
            } else {
                printf("linear, x = %g\n", -c / b);
            }
            continue;
        }

        /*
         * The discriminant b^2 - 4ac decides everything: positive gives
         * two real roots, zero one double root, negative no real roots
         * (but two complex ones).
         */
        disc = b * b - 4.0 * a * c;
        if (disc > 0.0) {
            root = sqrt(disc);
            r1 = (-b + root) / (2.0 * a);
            r2 = (-b - root) / (2.0 * a);
            printf("two roots, x = %g and x = %g\n", r1, r2);
        } else if (disc == 0.0) {
            printf("one double root, x = %g\n", -b / (2.0 * a));
        } else {
            /* sqrt of a negative number is not a real number, so take the
               square root of -disc and write the answer as p +- qi. */
            real = -b / (2.0 * a);
            imag = sqrt(-disc) / (2.0 * a);
            printf("complex roots, x = %g + %gi and x = %g - %gi\n", real, imag, real, imag);
        }
    }
    return 0;
}
