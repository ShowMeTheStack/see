/*
 * title: A hex dump of a binary file
 * level: 3
 * about: Writes a mix of text, an int, a double and a short to a file, then prints it as offset, hex bytes and printable characters like xxd.
 */
#include <stdio.h>
#include <ctype.h>

#define WIDTH 16

static void dump(FILE *fp)
{
    unsigned char row[WIDTH];
    size_t got, i;
    long offset = 0;

    while ((got = fread(row, 1, WIDTH, fp)) > 0) {
        printf("%08lx  ", offset);
        for (i = 0; i < WIDTH; i++) {
            if (i < got)
                printf("%02x ", row[i]);
            else
                printf("   ");      /* pad a short last row */
            if (i == 7)
                printf(" ");
        }
        printf(" |");
        for (i = 0; i < got; i++)
            putchar(isprint(row[i]) ? row[i] : '.');
        printf("|\n");
        offset += (long)got;
    }
}

int main(void)
{
    FILE *fp;
    int number = 0x12345678;
    double half = 0.5;
    short minus = -2;

    fp = fopen("/tmp/mixed.bin", "wb");
    if (fp == NULL) {
        perror("/tmp/mixed.bin");
        return 1;
    }
    fputs("Hi!\n", fp);
    fwrite(&number, sizeof number, 1, fp);
    fwrite(&half, sizeof half, 1, fp);
    fwrite(&minus, sizeof minus, 1, fp);
    fputs("end", fp);
    fclose(fp);

    fp = fopen("/tmp/mixed.bin", "rb");
    if (fp == NULL) {
        perror("/tmp/mixed.bin");
        return 1;
    }
    dump(fp);
    fclose(fp);

    /* How to read it:
       48 69 21 0a      "Hi!\n" - text is just its character codes.
       78 56 34 12      0x12345678 backwards: this machine is little-
                        endian, the lowest byte is stored first.
       00 .. 00 e0 3f   0.5 as an IEEE double; the sign, exponent and top
                        of the fraction sit in the last two bytes.
       fe ff            -2 as a two's complement short, low byte first.
       Compare with the memory panel: the variables look the same there. */
    return 0;
}
