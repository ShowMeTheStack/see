/*
 * title: Temperature conversion table
 * level: 1
 * about: Prints Celsius, Fahrenheit and Kelvin side by side using one tiny function per conversion.
 */
#include <stdio.h>

/* A function turns a formula into a name. Once written, the formula
   cannot be mistyped in one place and right in another. */
double c_to_f(double c)
{
    return c * 9.0 / 5.0 + 32.0;
}

double c_to_k(double c)
{
    return c + 273.15;
}

double f_to_c(double f)
{
    return (f - 32.0) * 5.0 / 9.0;
}

/* A function that returns nothing is declared void. It is called for
   what it does (printing), not for a value. */
void print_row(double c)
{
    printf("%8.1f %10.1f %10.2f\n", c, c_to_f(c), c_to_k(c));
}

int main(void)
{
    int c;

    printf("%8s %10s %10s\n", "Celsius", "Fahrenheit", "Kelvin");
    /* Each pass calls print_row, which calls c_to_f and c_to_k.
       Press F11 on print_row to follow one row all the way down. */
    for (c = -40; c <= 100; c += 20)
        print_row(c);   /* the int is converted to double automatically */

    printf("\nbody temperature 98.6 F is %.1f C\n", f_to_c(98.6));
    printf("-40 is the same on both scales: %.1f F\n", c_to_f(-40));
    return 0;
}
