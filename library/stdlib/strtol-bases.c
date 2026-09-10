/*
 * title: strtol with end pointers and number bases
 * level: 3
 * about: Parses the same digits in bases 2, 8, 10, 16 and 36, lets base 0 guess from the prefix, and uses the end pointer to walk along a string of numbers.
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * long strtol(const char *s, char **end, int base)
 * skips leading white space, reads an optional sign and as many digits
 * as are valid in the base, and stores in *end a pointer to the first
 * character it did not use. That end pointer is what makes strtol so
 * much better than atoi: you can tell where the number stopped.
 */
static void try_base(const char *s, int base)
{
    char *end;
    long v = strtol(s, &end, base);
    printf("  strtol(\"%s\", base %2d) = %8ld, used %d chars, rest \"%s\"\n",
           s, base, v, (int)(end - s), end);
}

int main(void)
{
    const char *list = "  12 0x1F -7 0755 99bottles";
    const char *p;
    char *end;
    long v;
    int count = 0;

    printf("the same text in different bases:\n");
    try_base("101", 2);
    try_base("101", 8);
    try_base("101", 10);
    try_base("101", 16);
    try_base("101", 36);
    try_base("zz", 36);       /* digits go 0-9 then a-z: z is 35 */
    try_base("1012", 2);      /* stops at the 2, which is not binary */

    /*
     * Base 0 means "decide from the prefix", like a C source file:
     * 0x or 0X is hex, a leading 0 is octal, anything else decimal.
     */
    printf("base 0 reads C-style prefixes:\n");
    try_base("0x1F", 0);
    try_base("0755", 0);
    try_base("755", 0);
    try_base("08", 0);        /* 8 is not octal: reads just the 0 */

    /*
     * Walking a list: each call starts where the last one ended. When
     * end == p, no digits were found and the loop must stop, or it
     * would read the same spot forever.
     */
    printf("walking \"%s\":\n", list);
    p = list;
    for (;;) {
        v = strtol(p, &end, 0);
        if (end == p)
            break;
        printf("  number %d: %ld\n", ++count, v);
        p = end;
    }
    printf("  stopped at \"%s\"\n", p);

    /*
     * In See, end is an arrow into the middle of the string literal.
     * Step over each strtol and watch it hop along the text.
     */
    return 0;
}
