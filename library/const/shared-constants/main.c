/*
 * title: Sharing a const table between files
 * level: 3
 * about: Defines a table of length units once in units.c, declares it extern const in units.h, and converts distances read from input in main.c.
 * input: 5 km mile\n12 inch cm\n1 mile foot\n3 parsec m\n100 yard m
 */
#include <stdio.h>
#include "units.h"

int main(void)
{
    double amount;
    char from[12], to[12];
    const struct unit *a, *b;
    int i;

    printf("%s knows %d units:", version, unit_count);
    for (i = 0; i < unit_count; i++)
        printf(" %s", units[i].name);
    printf("\n");

    /*
     *     units[0].metres = 2.0;
     * fails here just as it would in units.c:
     *     error: assignment of read-only member 'metres'
     * The header carries the const into every file that includes it.
     */

    while (scanf("%lf %11s %11s", &amount, from, to) == 3) {
        a = find_unit(from);
        b = find_unit(to);
        if (a == NULL || b == NULL) {
            printf("%g %s: unknown unit\n", amount, a == NULL ? from : to);
            continue;
        }
        printf("%g %s = %.4f %s\n", amount, a->name, convert(amount, a, b), b->name);
    }
    return 0;
}
