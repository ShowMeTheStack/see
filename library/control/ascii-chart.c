/*
 * title: ASCII chart
 * level: 2
 * about: Prints the printable ASCII characters as a table of codes in decimal, hex and as characters.
 */
#include <stdio.h>

int main(void)
{
    int row, col, code;

    /* The 95 printable characters run from 32 (space) to 126 (~).
       Lay them out in 6 columns, reading down each column like a
       phone book: column col, row row holds code 32 + col*16 + row. */
    for (row = 0; row < 16; row++) {
        for (col = 0; col < 6; col++) {
            code = 32 + col * 16 + row;
            if (code > 126)
                continue;   /* the last column is short: skip the gaps */
            /* The same int printed three ways. %c prints the character
               whose code it is: in C a character IS a number. */
            printf("%3d %02X %c   ", code, code, code);
        }
        printf("\n");
    }
    printf("'A' is %d, 'a' is %d, the gap is %d\n", 'A', 'a', 'a' - 'A');
    printf("'7' is %d, so '7' - '0' is %d\n", '7', '7' - '0');
    return 0;
}
