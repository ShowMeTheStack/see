/*
 * title: Writing numbers in decimal, hex and octal
 * level: 2
 * about: Writes the same values as decimal, hexadecimal, octal and character literals, with the suffixes that set a literal's type.
 */
#include <stdio.h>

int main(void)
{
    /* All three hold the same number; only the way it is written differs.
       In See they look identical on the stack. */
    int dec = 493;
    int hex = 0x1ED;
    int oct = 0755;
    int letter = 'A';
    int escaped = '\101';
    long big = 100000L;
    unsigned int mask = 0xFFu;
    double sci = 6.02e23;
    float small = 1.5e-3f;

    printf("493 = 0x1ED = 0755 ? %d %d %d\n", dec, hex, oct);

    /*
     * A leading 0 means octal. It is easy to write by accident: 010 is
     * eight, not ten. Octal survives in C because of Unix file
     * permissions: 0755 is rwx r-x r-x.
     */
    printf("010 is %d, not 10\n", 010);

    /* A character literal is an int. '\101' is octal 101, which is 65. */
    printf("'A' = %d, '\\101' = %d, '\\x41' = %d\n", letter, escaped, '\x41');

    /*
     * Suffixes: L makes a long, u makes it unsigned, f makes a float
     * (without it, 1.5e-3 is a double). On this machine long and int are
     * both 4 bytes, but the suffix still sets the type.
     */
    printf("100000L = %ld, 0xFFu = %u, 6.02e23 = %g, 1.5e-3f = %g\n", big, mask, sci, small);
    printf("sizeof 1.5f = %lu, sizeof 1.5 = %lu, sizeof 'A' = %lu\n",
           (unsigned long)sizeof 1.5f, (unsigned long)sizeof 1.5, (unsigned long)sizeof 'A');

    /* printf turns it the other way: one value, three ways of writing it. */
    printf("%d in hex is %x, in octal %o; with # : %#x %#o\n", dec, dec, dec, dec, dec);
    return 0;
}
