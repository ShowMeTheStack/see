/* roman.c - the module under test. Greedy conversion with a table that
 * includes the subtractive pairs (CM, XC, IV, ...), so there are no
 * special cases in the code. */
#include <string.h>
#include "roman.h"

static const int values[13] = { 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 };
static const char *symbols[13] = { "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I" };

int roman_from_int(int n, char *out)
{
    int i;

    out[0] = '\0';
    if (n < 1 || n > 3999) {
        return 0;
    }
    for (i = 0; i < 13; i++) {
        while (n >= values[i]) {
            strcat(out, symbols[i]);
            n -= values[i];
        }
    }
    return 1;
}

/* Read greedily with the same table, then check by converting back: only
 * the canonical spelling survives the round trip, so "IIII" and "IC" fail. */
int roman_to_int(const char *s)
{
    int total = 0;
    int i;
    size_t len;
    const char *p = s;
    char again[16];

    if (strlen(s) == 0 || strlen(s) > 15) {
        return 0;
    }
    for (i = 0; i < 13; i++) {
        len = strlen(symbols[i]);
        while (strncmp(p, symbols[i], len) == 0) {
            total += values[i];
            p += len;
        }
    }
    if (*p != '\0' || !roman_from_int(total, again) || strcmp(again, s) != 0) {
        return 0;
    }
    return total;
}
