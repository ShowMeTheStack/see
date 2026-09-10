/*
 * title: A tour of math.h
 * level: 2
 * about: Prints a table of sin, cos and tan, then shows sqrt, pow, exp, log, floor, ceil, fabs, fmod, modf, frexp and ldexp at work.
 */
#include <stdio.h>
#include <math.h>

int main(void)
{
    /* C89 has no M_PI. atan(1) is pi/4, exact to the last bit. */
    double pi = 4.0 * atan(1.0);
    double whole, frac, mant;
    int deg, ex;

    printf("pi = %.15f\n", pi);
    printf("angle    sin      cos      tan\n");
    for (deg = 0; deg <= 90; deg += 15) {
        double r = deg * pi / 180.0;   /* the trig functions use radians */
        printf("%4d %8.4f %8.4f ", deg, sin(r), cos(r));
        if (deg == 90)
            printf("   (huge)\n");      /* tan(90 degrees) is undefined */
        else
            printf("%8.4f\n", tan(r));
    }

    printf("sqrt(2)      = %.10f\n", sqrt(2.0));
    printf("pow(2, 10)   = %.0f\n", pow(2.0, 10.0));
    printf("pow(2, 0.5)  = %.10f, the same as sqrt(2)\n", pow(2.0, 0.5));
    printf("exp(1)       = %.10f, the number e\n", exp(1.0));
    printf("log(e*e)     = %.10f, natural log\n", log(exp(2.0)));
    printf("log10(1000)  = %.10f\n", log10(1000.0));

    /* Rounding: floor goes down towards minus infinity and ceil goes up
       towards plus infinity, which matters for negative numbers. */
    printf("floor(2.7) = %.0f  ceil(2.7) = %.0f\n", floor(2.7), ceil(2.7));
    printf("floor(-2.7) = %.0f  ceil(-2.7) = %.0f\n", floor(-2.7), ceil(-2.7));
    /* C89 has no round(); floor(x + 0.5) rounds halves upwards. */
    printf("rounded 2.5 -> %.0f, -2.5 -> %.0f\n", floor(2.5 + 0.5), floor(-2.5 + 0.5));

    printf("fabs(-3.25) = %.2f\n", fabs(-3.25));
    printf("fmod(10, 3) = %.1f, fmod(-10, 3) = %.1f\n", fmod(10.0, 3.0), fmod(-10.0, 3.0));

    /* modf splits a number into whole and fraction parts. */
    frac = modf(123.456, &whole);
    printf("modf(123.456): whole %.0f, fraction %.3f\n", whole, frac);

    /*
     * frexp splits x into mant * 2^ex with mant in [0.5, 1); ldexp puts
     * it back. This is how doubles are stored inside the machine.
     */
    mant = frexp(48.0, &ex);
    printf("48 = %.4f * 2^%d, and ldexp gives back %.1f\n", mant, ex, ldexp(mant, ex));

    /*
     * In See, whole and ex were filled in through pointers: modf and
     * frexp return one value and write a second through the address
     * you pass.
     */
    return 0;
}
