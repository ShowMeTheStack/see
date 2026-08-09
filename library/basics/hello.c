/*
 * title: Hello, world
 * level: 1
 * about: Prints a greeting, the first program every C programmer writes.
 */
#include <stdio.h>

/*
 * Every C program starts running at main. The #include line above pulls in
 * the declarations for the standard input/output functions, printf among
 * them, so the compiler knows how printf should be called.
 */
int main(void)
{
    /*
     * The text between the double quotes is a string literal. It lives in a
     * read-only area of memory; look for it in the string literals panel in
     * See. The \n at the end is one character, the newline, which moves the
     * cursor to the start of the next line.
     */
    printf("Hello, world\n");

    /* printf can be called as often as you like; each call continues where
       the last one stopped, so these two calls make a single line. */
    printf("This line is built ");
    printf("from two calls.\n");

    /* Returning 0 from main tells whoever started the program that all went
       well. Any other number usually means something failed. */
    return 0;
}
