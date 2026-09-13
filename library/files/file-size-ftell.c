/*
 * title: How big is a file? fseek and ftell
 * level: 2
 * about: Measures a file by seeking to its end and asking ftell for the position, then reads its last few bytes.
 */
#include <stdio.h>

/* Returns the size in bytes, or -1 if something fails. The file position
   is put back where it was, so the caller never notices. */
long file_size(FILE *fp)
{
    long here, size;

    here = ftell(fp);
    if (here < 0)
        return -1;
    if (fseek(fp, 0L, SEEK_END) != 0)
        return -1;
    size = ftell(fp);
    fseek(fp, here, SEEK_SET);
    return size;
}

int main(void)
{
    FILE *fp;
    long size;
    int c, i;

    fp = fopen("/tmp/alphabet.txt", "wb");
    if (fp == NULL) {
        perror("/tmp/alphabet.txt");
        return 1;
    }
    for (c = 'a'; c <= 'z'; c++)
        fputc(c, fp);
    fclose(fp);

    fp = fopen("/tmp/alphabet.txt", "rb");
    if (fp == NULL) {
        perror("/tmp/alphabet.txt");
        return 1;
    }

    /* Read two characters first, so the position is not 0 when we ask.
       (Two separate statements: two fgetc calls inside one printf could
       run in either order.) */
    c = fgetc(fp);
    i = fgetc(fp);
    printf("first two: %c%c\n", c, i);
    printf("position before measuring: %ld\n", ftell(fp));

    size = file_size(fp);
    printf("size: %ld bytes\n", size);
    printf("position after measuring:  %ld (put back)\n", ftell(fp));

    /* SEEK_END with a negative offset counts back from the end. */
    fseek(fp, -5L, SEEK_END);
    printf("last five: ");
    for (i = 0; i < 5; i++)
        putchar(fgetc(fp));
    putchar('\n');

    /* SEEK_SET is from the start; SEEK_CUR from where we are now. */
    fseek(fp, 10L, SEEK_SET);
    printf("byte 10 is %c\n", fgetc(fp));
    fseek(fp, 3L, SEEK_CUR);
    printf("three further on is %c\n", fgetc(fp));

    fclose(fp);
    return 0;
}
