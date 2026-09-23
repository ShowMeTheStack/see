/* metric.c - private helpers are static: they have "internal linkage",
 * so the linker never sees their names and no other file can call them. */
#include <stdio.h>
#include "metric.h"

/* Rounds to the nearest centimetre. */
static double round_to(double x)
{
    long cm = (long)(x * 100.0 + 0.5);
    return cm / 100.0;
}

static const char *unit_for(double m)
{
    return m >= 1000.0 ? "km" : "m";
}

void print_metric(double metres)
{
    if (metres >= 1000.0) {
        printf("  metric:   %.2f %s\n", round_to(metres / 1000.0), unit_for(metres));
    } else {
        printf("  metric:   %.2f %s\n", round_to(metres), unit_for(metres));
    }
}
