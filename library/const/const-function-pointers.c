/*
 * title: const in function pointer types
 * level: 3
 * about: Builds a table of text filters whose function pointer type promises the input is read-only, and fixes the table itself with const.
 */
#include <stdio.h>
#include <ctype.h>
#include <string.h>

/*
 * A filter reads src (const: it will not change it) and writes dst.
 * The const is part of the type: a function taking plain char *src
 * would NOT match this pointer type.
 */
typedef void (*filter_fn)(char *dst, const char *src);

void upper(char *dst, const char *src)
{
    for (; *src != '\0'; src++)
        *dst++ = (char)toupper((unsigned char)*src);
    *dst = '\0';
}

void reverse(char *dst, const char *src)
{
    const char *p = src + strlen(src);
    while (p > src)
        *dst++ = *--p;
    *dst = '\0';
}

void no_vowels(char *dst, const char *src)
{
    for (; *src != '\0'; src++)
        if (strchr("aeiouAEIOU", *src) == NULL)
            *dst++ = *src;
    *dst = '\0';
}

/*
 * The table: an array of const function pointers. Nobody can swap a
 * filter out later. Written without the typedef it would be
 *     void (* const filters[3])(char *, const char *)
 * which is exactly why typedefs for function pointers are popular.
 */
static filter_fn const filters[3] = { upper, reverse, no_vowels };
static const char * const names[3] = { "upper", "reverse", "no vowels" };

int main(void)
{
    const char *text = "pointers and promises";
    char out[64];
    int i;

    /* A const pointer to a function: fixed for life, still callable. */
    void (* const first)(char *, const char *) = upper;

    for (i = 0; i < 3; i++) {
        filters[i](out, text);
        printf("%-10s %s\n", names[i], out);
    }

    first(out, "const");
    printf("%-10s %s\n", "first", out);

    /*
     *     filters[0] = reverse;   error: assignment of read-only location 'filters[0]'
     *     first = reverse;        error: assignment of read-only variable 'first'
     */
    return 0;
}
