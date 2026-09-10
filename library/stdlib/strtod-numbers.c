/*
 * title: Pulling decimals out of text with strtod
 * level: 2
 * about: Scans a shopping receipt with strtod, using the end pointer to find each price among the words, and totals it.
 */
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <math.h>     /* for HUGE_VAL */

int main(void)
{
    const char *receipt =
        "bread 2.49 milk 1.15 cheese 4.8 apples 3 "
        "tea .99 coffee 1.2e1 discount -1.50";
    const char *p = receipt;
    char *end;
    double v, total = 0.0;
    int items = 0;

    /*
     * strtod reads the longest prefix that looks like a floating point
     * number: sign, digits, a decimal point, an exponent like e1. If it
     * cannot start a number at all, end == p and we skip a character.
     */
    while (*p != '\0') {
        v = strtod(p, &end);
        if (end == p) {
            p++;            /* not a number here: move on one character */
            continue;
        }
        printf("  found %-7.*s -> %7.2f\n", (int)(end - p), p, v);
        total += v;
        items++;
        p = end;
    }
    printf("%d numbers, total %.2f\n", items, total);

    /*
     * Special cases. strtod skips leading spaces, accepts a lone sign
     * only when digits follow, and reports overflow with ERANGE.
     */
    v = strtod("   +7.25kg", &end);
    printf("\"   +7.25kg\" -> %.2f, rest \"%s\"\n", v, end);
    v = strtod("-", &end);
    printf("\"-\" -> %.1f, %s\n", v, *end == '-' ? "nothing consumed" : "consumed");
    errno = 0;
    v = strtod("1e999", &end);
    printf("\"1e999\" -> %s, errno %s\n", v == HUGE_VAL ? "HUGE_VAL" : "a number",
           errno == ERANGE ? "ERANGE" : "not set");

    /*
     * In See, step through the loop and watch p and end, two arrows
     * into the same string literal: end runs ahead to the end of each
     * number, then p catches up.
     */
    return 0;
}
