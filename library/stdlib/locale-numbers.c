/*
 * title: What localeconv says about number formats
 * level: 2
 * about: Queries the current locale with setlocale and localeconv, prints its decimal point and grouping rules, and uses them to format large numbers.
 */
#include <stdio.h>
#include <string.h>
#include <locale.h>
#include <limits.h>

/*
 * Every C program starts in the "C" locale: a full stop for the
 * decimal point, no thousands separator, no currency symbol. setlocale
 * can switch to another locale if the system has one; localeconv
 * describes the current one in a struct lconv.
 *
 * Fields that are not used are empty strings, and numeric fields that
 * are not used hold CHAR_MAX.
 */
static void show_string(const char *name, const char *v)
{
    printf("  %-18s \"%s\"%s\n", name, v, v[0] == '\0' ? "  (not used)" : "");
}

static void show_number(const char *name, char v)
{
    if (v == CHAR_MAX)
        printf("  %-18s CHAR_MAX  (not used)\n", name);
    else
        printf("  %-18s %d\n", name, v);
}

/*
 * Group the digits of n in threes with sep, the way a locale with a
 * thousands separator would. Writes into out, which must be big enough.
 */
static void group(long n, const char *sep, char *out)
{
    char digits[16];
    int len, i, j = 0;

    sprintf(digits, "%ld", n);
    len = (int)strlen(digits);
    for (i = 0; i < len; i++) {
        out[j++] = digits[i];
        if (i < len - 1 && (len - 1 - i) % 3 == 0) {
            strcpy(out + j, sep);
            j += (int)strlen(sep);
        }
    }
    out[j] = '\0';
}

int main(void)
{
    struct lconv *lc;
    const char *name;
    char buf[40];

    name = setlocale(LC_ALL, NULL);       /* NULL asks, without changing */
    printf("current locale: \"%s\"\n", name != NULL ? name : "(unknown)");

    lc = localeconv();
    printf("numbers:\n");
    show_string("decimal_point", lc->decimal_point);
    show_string("thousands_sep", lc->thousands_sep);
    printf("money:\n");
    show_string("currency_symbol", lc->currency_symbol);
    show_string("int_curr_symbol", lc->int_curr_symbol);
    show_string("mon_decimal_point", lc->mon_decimal_point);
    show_number("frac_digits", lc->frac_digits);
    show_number("p_cs_precedes", lc->p_cs_precedes);

    /*
     * The "C" locale says not to group digits. A program that wants
     * grouping anyway can use its own separator, as here, or use
     * thousands_sep when a locale provides one.
     */
    group(1234567L, lc->thousands_sep[0] ? lc->thousands_sep : ",", buf);
    printf("1234567 grouped: %s\n", buf);
    group(-98765432L, " ", buf);
    printf("-98765432 with spaces: %s\n", buf);
    printf("printf uses the locale's decimal point: %.2f\n", 3.14159);

    /*
     * In See, lc points to a struct the library owns: you may read it,
     * but not change it or free it, and the next localeconv call may
     * overwrite it.
     */
    return 0;
}
