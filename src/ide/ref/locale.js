/* The C reference: <locale.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  setlocale: {
    text: 'setlocale(category, locale) selects the locale, the set of national conventions (decimal point, character classes, collation order, time and money formats), for one category or for all of them with LC_ALL. It returns a string naming the new locale, or NULL if the request cannot be honoured, in which case nothing changes.\n\nlocale "C" is the minimal locale every C program starts in. "" asks for the user\'s native locale from the environment. NULL changes nothing and just asks which locale is in effect.\n\nSee only has the "C" locale, so "C" and "" succeed and any other name returns NULL. The returned string belongs to the library: do not modify or free it, and copy it if you need it after another setlocale call.',
    example: `#include <stdio.h>
#include <locale.h>

int main(void)
{
    if (setlocale(LC_ALL, "C") != NULL)
        printf("the C locale is available\\n");
    if (setlocale(LC_ALL, "fr_FR") == NULL)
        printf("fr_FR is not available here\\n");
    return 0;
}
`,
    see: ['localeconv', 'LC_ALL', 'lconv'],
  },
  localeconv: {
    text: 'localeconv() returns a pointer to a struct lconv describing how numbers and money are formatted in the current locale: the decimal point, the thousands separator, the currency symbol and so on.\n\nThe structure belongs to the library and may be overwritten by the next call to localeconv or setlocale. Read it, do not change it.\n\nIn the "C" locale the decimal point is "." and most other strings are empty, with the char fields set to CHAR_MAX meaning "not available".',
    example: `#include <stdio.h>
#include <limits.h>
#include <locale.h>

int main(void)
{
    struct lconv *lc = localeconv();

    printf("decimal point: \\"%s\\"\\n", lc->decimal_point);
    printf("thousands separator: \\"%s\\"\\n", lc->thousands_sep);
    printf("frac_digits %s\\n", lc->frac_digits == CHAR_MAX ? "not available" : "given");
    return 0;
}
`,
    see: ['setlocale', 'lconv'],
  },
  lconv: {
    header: 'locale.h',
    kind: 'type',
    sig: 'struct lconv { char *decimal_point; char *thousands_sep; char *grouping; ... char frac_digits; ... };',
    text: 'struct lconv is the structure localeconv returns, describing the numeric and monetary conventions of the current locale.\n\nThe string fields for ordinary numbers are decimal_point, thousands_sep and grouping. The monetary ones are int_curr_symbol, currency_symbol, mon_decimal_point, mon_thousands_sep, mon_grouping, positive_sign and negative_sign. The char fields (int_frac_digits, frac_digits, p_cs_precedes, p_sep_by_space, n_cs_precedes, n_sep_by_space, p_sign_posn, n_sign_posn) describe where the symbol and sign go; CHAR_MAX means the information is not available.\n\nOpen /usr/include/locale.h to see the full declaration.',
    example: `#include <stdio.h>
#include <locale.h>

int main(void)
{
    struct lconv *lc = localeconv();

    printf("currency symbol: \\"%s\\", decimal point \\"%s\\"\\n", lc->currency_symbol, lc->decimal_point);
    return 0;
}
`,
    see: ['localeconv', 'setlocale'],
  },
  LC_ALL: {
    text: 'LC_ALL, passed to setlocale, sets or queries every category of the locale at once. It is the category most programs use.\n\nsetlocale(LC_ALL, "") switches the whole program to the user\'s preferred conventions; setlocale(LC_ALL, "C") goes back to the defaults.',
    example: `#include <stdio.h>
#include <locale.h>

int main(void)
{
    char *name = setlocale(LC_ALL, "");

    printf("native locale %s\\n", name != NULL ? "selected" : "not available");
    return 0;
}
`,
    see: ['setlocale', 'LC_NUMERIC', 'LC_CTYPE'],
  },
  LC_COLLATE: {
    text: 'LC_COLLATE is the category that controls how strings are ordered by strcoll and transformed by strxfrm. strcmp is not affected: it always compares the character codes.',
    example: `#include <stdio.h>
#include <string.h>
#include <locale.h>

int main(void)
{
    setlocale(LC_COLLATE, "C");
    printf("strcoll(\\"apple\\", \\"Banana\\") %s 0\\n", strcoll("apple", "Banana") > 0 ? ">" : "<=");
    return 0;
}
`,
    see: ['setlocale', 'strcoll', 'strxfrm'],
  },
  LC_CTYPE: {
    text: 'LC_CTYPE is the category that controls character handling: which characters isalpha, isupper and the other <ctype.h> tests accept, what toupper and tolower do, and how multibyte characters are read.\n\nIn the "C" locale only the ASCII letters are letters.',
    example: `#include <stdio.h>
#include <ctype.h>
#include <locale.h>

int main(void)
{
    setlocale(LC_CTYPE, "C");
    printf("is 0xE9 a letter in the C locale? %s\\n", isalpha(0xE9) ? "yes" : "no");
    return 0;
}
`,
    see: ['setlocale', 'isalpha', 'MB_LEN_MAX'],
  },
  LC_MONETARY: {
    text: 'LC_MONETARY is the category that controls the money-formatting fields localeconv reports: currency_symbol, mon_decimal_point, frac_digits and the rest. No C89 function formats money by itself; programs read these fields and do it.',
    example: `#include <stdio.h>
#include <locale.h>

int main(void)
{
    setlocale(LC_MONETARY, "C");
    printf("currency symbol in the C locale: \\"%s\\"\\n", localeconv()->currency_symbol);
    return 0;
}
`,
    see: ['setlocale', 'localeconv', 'lconv'],
  },
  LC_NUMERIC: {
    text: 'LC_NUMERIC is the category that controls the decimal point used by printf, scanf, strtod and atof, and the non-monetary fields of localeconv.\n\nIn a locale where the decimal point is a comma, printf("%f", 1.5) would print 1,500000. Programs that write data files often keep LC_NUMERIC at "C" for exactly that reason.',
    example: `#include <stdio.h>
#include <locale.h>

int main(void)
{
    setlocale(LC_NUMERIC, "C");
    printf("%.2f uses \\"%s\\" as the decimal point\\n", 3.14, localeconv()->decimal_point);
    return 0;
}
`,
    see: ['setlocale', 'localeconv', 'printf', 'strtod'],
  },
  LC_TIME: {
    text: 'LC_TIME is the category that controls how strftime writes dates and times: the names of months and weekdays, and the formats of %c, %x and %X.',
    example: `#include <stdio.h>
#include <time.h>
#include <locale.h>

int main(void)
{
    time_t t = 0;
    char buf[40];

    setlocale(LC_TIME, "C");
    strftime(buf, sizeof buf, "%A %B", gmtime(&t));
    printf("%s\\n", buf);
    return 0;
}
`,
    see: ['setlocale', 'strftime'],
  },
});
