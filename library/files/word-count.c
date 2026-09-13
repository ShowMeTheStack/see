/*
 * title: wc - counting lines, words and characters
 * level: 2
 * about: Recreates the Unix wc tool on a file, using a tiny two-state machine to tell where words start.
 */
#include <stdio.h>
#include <ctype.h>

#define OUT 0       /* between words */
#define IN  1       /* inside a word */

int main(void)
{
    FILE *fp;
    int c;
    long lines = 0, words = 0, chars = 0;
    long longest = 0, linelen = 0;
    int state = OUT;

    fp = fopen("/tmp/wc.txt", "w");
    if (fp == NULL) {
        perror("/tmp/wc.txt");
        return 1;
    }
    fputs("It was the best of times,\n", fp);
    fputs("  it was the   worst of times;\n", fp);
    fputs("\n", fp);
    fputs("it was the age of wisdom.\n", fp);
    fclose(fp);

    fp = fopen("/tmp/wc.txt", "r");
    if (fp == NULL) {
        perror("/tmp/wc.txt");
        return 1;
    }

    /* A word starts exactly when we go from OUT to IN. Counting those
       moments, rather than counting spaces, copes with runs of spaces,
       leading spaces and empty lines. Put a breakpoint on words++ and see
       it fire once per word, never on the gaps. */
    while ((c = fgetc(fp)) != EOF) {
        chars++;
        if (c == '\n') {
            lines++;
            if (linelen > longest)
                longest = linelen;
            linelen = 0;
        } else {
            linelen++;
        }
        if (isspace(c)) {
            state = OUT;
        } else if (state == OUT) {
            state = IN;
            words++;
        }
    }
    fclose(fp);

    printf("%7ld %7ld %7ld /tmp/wc.txt\n", lines, words, chars);
    printf("longest line: %ld characters\n", longest);
    return 0;
}
