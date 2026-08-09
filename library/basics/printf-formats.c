/*
 * title: The printf conversions
 * level: 1
 * about: Prints the same few values through each printf conversion: %d, %u, %x, %o, %c, %s, %f, %e, %g and %%.
 */
#include <stdio.h>

int main(void)
{
    int n = 255;
    char letter = 'A';
    double price = 1234.5678;

    /*
     * printf reads its first argument, the format string, from left to
     * right. Ordinary characters are copied out. Each % starts a
     * conversion that takes the next argument and turns it into text.
     * The letter after the % must match the type of that argument.
     */
    printf("%%d  decimal         : %d\n", n);
    printf("%%i  also decimal    : %i\n", n);
    printf("%%u  unsigned        : %u\n", (unsigned)n);
    printf("%%x  hexadecimal     : %x\n", (unsigned)n);
    printf("%%X  hex, capitals   : %X\n", (unsigned)n);
    printf("%%o  octal           : %o\n", (unsigned)n);

    /* A char is a small integer. %c prints the character with that code,
       %d prints the code itself. Same byte, two ways of looking at it. */
    printf("%%c  character       : %c\n", letter);
    printf("%%d  of that char    : %d\n", letter);

    /* %s wants the address of the first character of a string and prints
       characters until it reaches the terminating zero byte. */
    printf("%%s  string          : %s\n", "plain text");

    /* Three ways to print a double. %f always uses a decimal point and six
       digits after it, %e uses scientific notation, %g picks whichever of
       the two is shorter and drops trailing zeros. */
    printf("%%f  fixed           : %f\n", price);
    printf("%%e  exponent        : %e\n", price);
    printf("%%g  general         : %g\n", price);

    /* To print a percent sign itself, write it twice. */
    printf("%%%%  a percent sign  : 100%%\n");
    return 0;
}
