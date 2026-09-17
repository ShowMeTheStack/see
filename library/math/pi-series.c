/*
 * title: Pi from three infinite series
 * level: 2
 * about: Races the Leibniz series, the Nilakantha series and the Wallis product towards pi and prints how close each gets.
 */
#include <stdio.h>
#include <math.h>

int main(void)
{
    /* atan(1) is pi / 4, so this gives pi to full double precision
       to compare against. */
    double pi = 4.0 * atan(1.0);
    double leibniz = 0.0, nilakantha = 3.0, wallis = 1.0;
    double sign = 1.0, k;
    long n;

    printf("%8s %14s %14s %14s\n", "terms", "Leibniz", "Nilakantha", "Wallis");
    for (n = 1; n <= 100000; n++) {
        /* Leibniz: pi/4 = 1 - 1/3 + 1/5 - 1/7 + ...
           Beautiful and painfully slow: each extra correct digit costs
           ten times as many terms. */
        leibniz += sign / (2.0 * n - 1.0);

        /* Nilakantha (15th century Kerala):
           pi = 3 + 4/(2*3*4) - 4/(4*5*6) + 4/(6*7*8) - ...
           Much faster, the error shrinks like 1/n^3. */
        k = 2.0 * n;
        nilakantha += sign * 4.0 / (k * (k + 1.0) * (k + 2.0));

        /* Wallis: pi/2 = (2/1)(2/3)(4/3)(4/5)(6/5)(6/7)... */
        wallis *= (k / (k - 1.0)) * (k / (k + 1.0));

        sign = -sign;

        if (n == 10 || n == 100 || n == 1000 || n == 10000 || n == 100000)
            printf("%8ld %14.10f %14.10f %14.10f\n",
                   n, 4.0 * leibniz, nilakantha, 2.0 * wallis);
    }
    printf("%8s %14.10f\n", "true pi", pi);
    printf("errors after %ld terms: %.2e  %.2e  %.2e\n", n - 1,
           fabs(4.0 * leibniz - pi), fabs(nilakantha - pi), fabs(2.0 * wallis - pi));
    return 0;
}
