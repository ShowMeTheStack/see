/*
 * title: static functions private to a file
 * level: 2
 * about: Converts distances with two modules that each keep a private helper of the same name.
 */

/* See builds main.c, metric.c and imperial.c separately and links them.
 * Step into print_metric and then print_imperial with F11: the call stack
 * shows round_to in both, but they are two different functions, one in
 * each file. main.c could not call round_to at all; try adding a call and
 * the linker reports it as undefined. */
#include <stdio.h>
#include "metric.h"
#include "imperial.h"

int main(void)
{
    double d[4];
    int i;

    d[0] = 1.8;
    d[1] = 100.0;
    d[2] = 1609.344;
    d[3] = 42195.0;

    for (i = 0; i < 4; i++) {
        printf("%.3f m\n", d[i]);
        print_metric(d[i]);
        print_imperial(d[i]);
    }
    return 0;
}
