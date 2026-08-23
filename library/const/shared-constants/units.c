/*
 * units.c: the one and only definition of the table.
 */
#include <string.h>
#include "units.h"

/*
 * Defined once here, used read-only everywhere. Because they are const,
 * no other file can change them, so there is no question of who did.
 */
const struct unit units[] = {
    { "mm",   0.001 },
    { "cm",   0.01 },
    { "inch", 0.0254 },
    { "foot", 0.3048 },
    { "yard", 0.9144 },
    { "m",    1.0 },
    { "km",   1000.0 },
    { "mile", 1609.344 }
};

const int unit_count = sizeof units / sizeof units[0];

const char * const version = "units 1.0";

/* Returns a pointer into the const table, so the result is const too. */
const struct unit *find_unit(const char *name)
{
    int i;
    for (i = 0; i < unit_count; i++)
        if (strcmp(units[i].name, name) == 0)
            return &units[i];
    return NULL;
}

double convert(double amount, const struct unit *from, const struct unit *to)
{
    return amount * from->metres / to->metres;
}
