/*
 * title: A table of math library functions
 * level: 1
 * about: Prints a table of sqrt, sin, cos, exp and log by looping over an array of pointers to the library functions.
 */
#include <stdio.h>
#include <math.h>

int main(void)
{
    /*
     * The math functions are ordinary functions taking a double and
     * returning a double, so their addresses can sit side by side in an
     * array. The names live in a second array at the same positions.
     */
    double (*fns[5])(double);
    const char *names[5];
    double x;
    int i;

    fns[0] = sqrt; names[0] = "sqrt";
    fns[1] = sin;  names[1] = "sin";
    fns[2] = cos;  names[2] = "cos";
    fns[3] = exp;  names[3] = "exp";
    fns[4] = log;  names[4] = "log";

    printf("%5s", "x");
    for (i = 0; i < 5; i++)
        printf("%10s", names[i]);
    printf("\n");

    /* One loop for the rows, one for the columns; no repeated code. */
    for (x = 0.5; x <= 3.0; x += 0.5) {
        printf("%5.1f", x);
        for (i = 0; i < 5; i++)
            printf("%10.4f", fns[i](x));
        printf("\n");
    }
    return 0;
}
