/* imperial.c - another round_to, with a different meaning: nearest
 * quarter. If either one were not static, linking would fail with a
 * "multiple definition" error. */
#include <stdio.h>
#include "imperial.h"

static double round_to(double x)
{
    long q = (long)(x * 4.0 + 0.5);
    return q / 4.0;
}

/* A static variable at file scope: a counter only this file can see. */
static int calls = 0;

void print_imperial(double metres)
{
    double feet = metres / 0.3048;

    calls++;
    if (feet >= 5280.0) {
        printf("  imperial: %.2f miles (call %d)\n", round_to(feet / 5280.0), calls);
    } else {
        printf("  imperial: %.2f feet (call %d)\n", round_to(feet), calls);
    }
}
