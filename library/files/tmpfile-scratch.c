/*
 * title: Scratch space with tmpfile
 * level: 2
 * about: Uses an unnamed temporary file from tmpfile to hold numbers while reading stdin, then reads them back in reverse with fseek.
 * input: 4 8 15 16 23 42
 */
#include <stdio.h>

int main(void)
{
    FILE *scratch;
    int x, n = 0;
    long k;

    /* tmpfile opens a brand new file in "w+b" mode. It has no name you
       need to know, and it disappears by itself when closed: perfect for
       intermediate results. */
    scratch = tmpfile();
    if (scratch == NULL) {
        perror("tmpfile");
        return 1;
    }

    /* Store each int as 4 raw bytes. */
    while (scanf("%d", &x) == 1) {
        fwrite(&x, sizeof x, 1, scratch);
        n++;
    }
    printf("stored %d numbers, file is %ld bytes\n", n, ftell(scratch));

    /* Walk backwards: the k-th int starts at k * sizeof(int). */
    printf("reversed:");
    for (k = n - 1; k >= 0; k--) {
        fseek(scratch, k * (long)sizeof x, SEEK_SET);
        if (fread(&x, sizeof x, 1, scratch) == 1)
            printf(" %d", x);
    }
    printf("\n");

    fclose(scratch);    /* and it is gone */
    return 0;
}
