/*
 * title: Escape sequences in strings
 * level: 1
 * about: Prints tabs, quotes, backslashes and other characters that cannot be typed straight into a string literal.
 */
#include <stdio.h>

int main(void)
{
    /*
     * Inside a string literal, a backslash starts an escape sequence: two
     * characters in the source that stand for one character in memory.
     * In See's string literals panel each escape takes a single byte.
     */

    /* \t is a tab: it jumps to the next column that is a multiple of 8. */
    printf("name\tlanguage\tyear\n");
    printf("Ritchie\tC\t\t1972\n");
    printf("Wirth\tPascal\t\t1970\n");

    /* A double quote would end the string, so it is written \" . A
       backslash would start an escape, so it is written \\ . */
    printf("She said \"hello\" and left.\n");
    printf("A Windows path: C:\\games\\chess\n");

    /* A single quote needs no escape in a string, only in a char literal. */
    printf("It's fine here; as a char it is '%c'\n", '\'');

    /* Numeric escapes give any byte by its code, in octal or hex. */
    printf("octal \\101 is %c, hex \\x42 is %c\n", '\101', '\x42');

    /*
     * \0 is the zero byte that ends every string. %s stops at the first
     * one, so the word after it is never printed, although it is still in
     * memory: look at this literal in See.
     */
    printf("%s\n", "visible\0 hidden");

    /* A long string can be split across lines: string literals written
       next to each other are glued into one by the compiler. */
    printf("These two pieces "
           "become one string.\n");
    return 0;
}
