/*
 * title: Printing a file backwards with a line index
 * level: 3
 * about: Records where every line starts with ftell, then prints the lines last-to-first by seeking to each saved offset.
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    FILE *fp;
    long *start = NULL;     /* growing heap array of line offsets */
    long *bigger;
    int cap = 2, n = 0, i, c;
    long pos;
    char line[64];

    fp = fopen("/tmp/countdown.txt", "w");
    if (fp == NULL) {
        perror("/tmp/countdown.txt");
        return 1;
    }
    fputs("one, the first line\ntwo\nthree is longer than the rest\nfour\nfive: lift-off\n", fp);
    fclose(fp);

    fp = fopen("/tmp/countdown.txt", "rb");
    if (fp == NULL) {
        perror("/tmp/countdown.txt");
        return 1;
    }
    start = malloc(cap * sizeof *start);
    if (start == NULL) {
        fclose(fp);
        return 1;
    }

    /* Pass 1: note the offset of the first byte of each line. A line
       starts at 0 and right after every '\n'. When the array is full it
       doubles with realloc: watch the heap block move and grow. */
    pos = 0;
    start[n++] = 0;
    while ((c = fgetc(fp)) != EOF) {
        pos++;
        if (c == '\n') {
            if (n == cap) {
                bigger = realloc(start, 2 * cap * sizeof *start);
                if (bigger == NULL)
                    break;
                start = bigger;
                cap *= 2;
            }
            start[n++] = pos;
        }
    }
    /* The file ends with '\n', so the last "line start" is the end of
       the file itself and holds nothing. Drop it. */
    if (n > 0 && start[n - 1] == pos)
        n--;

    printf("%d lines, offsets:", n);
    for (i = 0; i < n; i++)
        printf(" %ld", start[i]);
    printf("\n");

    /* Pass 2: random access. fseek lands on the start of a line and
       fgets reads just that one line. */
    for (i = n - 1; i >= 0; i--) {
        fseek(fp, start[i], SEEK_SET);
        if (fgets(line, sizeof line, fp) != NULL)
            printf("%d: %s", i + 1, line);
    }

    fclose(fp);
    free(start);
    return 0;
}
