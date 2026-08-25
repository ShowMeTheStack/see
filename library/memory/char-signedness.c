/*
 * title: One byte, two meanings
 * level: 2
 * about: Stores the same bit patterns in a signed char and an unsigned char and prints both, showing two's complement and why a char from text should be cast before ctype calls.
 */
#include <stdio.h>
#include <limits.h>
#include <ctype.h>

static void bits(unsigned char b)
{
    int i;
    for (i = 7; i >= 0; i--)
        putchar((b >> i) & 1 ? '1' : '0');
}

int main(void)
{
    static const unsigned char patterns[] = { 0x00, 0x01, 0x7F, 0x80, 0x81, 0xFE, 0xFF };
    unsigned int i;
    signed char s;
    unsigned char u;
    char letter = 'e';

    printf("char is %s here: CHAR_MIN %d, CHAR_MAX %d\n",
           CHAR_MIN < 0 ? "signed" : "unsigned", CHAR_MIN, CHAR_MAX);
    printf("bits      unsigned  signed\n");
    for (i = 0; i < sizeof patterns; i++) {
        u = patterns[i];
        s = (signed char)patterns[i];
        bits(u);
        printf("  %8d  %6d\n", u, s);
    }

    /*
     * Two's complement: the top bit counts as -128 instead of +128. So
     * 1000 0001 is -128 + 1 = -127 when signed, and 128 + 1 = 129 when not.
     * The byte in memory is identical; only the type decides how it reads.
     */

    /*
     * The ctype functions want a value in the unsigned char range (or EOF).
     * A plain char with the top bit set is negative here, so the usual habit
     * is to cast through unsigned char first.
     */
    printf("toupper('%c') = '%c'\n", letter, toupper((unsigned char)letter));
    printf("(char)200 = %d, (unsigned char)200 = %d\n", (char)200, (unsigned char)200);
    return 0;
}
