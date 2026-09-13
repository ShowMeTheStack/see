/*
 * title: Text file or binary file?
 * level: 2
 * about: Saves the same numbers once as text with fprintf and once as raw bytes with fwrite, compares the sizes and reads both back.
 */
#include <stdio.h>

static long size_of(const char *path)
{
    FILE *fp = fopen(path, "rb");
    long n;

    if (fp == NULL)
        return -1;
    fseek(fp, 0L, SEEK_END);
    n = ftell(fp);
    fclose(fp);
    return n;
}

int main(void)
{
    int values[5];
    int back[5];
    FILE *fp;
    int i, c;

    values[0] = 7; values[1] = 42; values[2] = -1000; values[3] = 65535; values[4] = 2000000000;

    /* Text: each number becomes its digits plus a separator. Small
       numbers are short, big numbers are long, and a person can read it. */
    fp = fopen("/tmp/nums.txt", "w");
    if (fp == NULL) {
        perror("/tmp/nums.txt");
        return 1;
    }
    for (i = 0; i < 5; i++)
        fprintf(fp, "%d\n", values[i]);
    fclose(fp);

    /* Binary: each int is its 4 bytes from memory, whatever its value. */
    fp = fopen("/tmp/nums.bin", "wb");
    if (fp == NULL) {
        perror("/tmp/nums.bin");
        return 1;
    }
    fwrite(values, sizeof values[0], 5, fp);
    fclose(fp);

    printf("text file:   %ld bytes\n", size_of("/tmp/nums.txt"));
    printf("binary file: %ld bytes (5 x %d)\n", size_of("/tmp/nums.bin"), (int)sizeof(int));

    /* Look inside: the text file is characters you recognise ... */
    printf("text bytes:  ");
    fp = fopen("/tmp/nums.txt", "rb");
    if (fp == NULL)
        return 1;
    while ((c = fgetc(fp)) != EOF)
        if (c == '\n')
            printf("\\n");
        else
            putchar(c);
    fclose(fp);
    printf("\n");

    /* ... and the binary file is raw bytes. 7 is 07 00 00 00. */
    printf("binary bytes:");
    fp = fopen("/tmp/nums.bin", "rb");
    if (fp == NULL)
        return 1;
    for (i = 0; i < 8 && (c = fgetc(fp)) != EOF; i++)
        printf(" %02x", c);
    printf(" ...\n");

    /* Reading back is symmetric: fscanf for text, fread for binary. */
    rewind(fp);
    fread(back, sizeof back[0], 5, fp);
    fclose(fp);
    printf("from binary:");
    for (i = 0; i < 5; i++)
        printf(" %d", back[i]);
    printf("\n");

    fp = fopen("/tmp/nums.txt", "r");
    if (fp == NULL)
        return 1;
    printf("from text:  ");
    for (i = 0; i < 5 && fscanf(fp, "%d", &back[i]) == 1; i++)
        printf(" %d", back[i]);
    printf("\n");
    fclose(fp);
    return 0;
}
