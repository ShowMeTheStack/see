/*
 * title: Character census with fgetc
 * level: 1
 * about: Reads a file one character at a time with fgetc and counts letters, digits, spaces and the rest.
 */
#include <stdio.h>
#include <ctype.h>

int main(void)
{
    FILE *fp;
    int c;              /* int, not char: it must be able to hold EOF too */
    int letters = 0, digits = 0, spaces = 0, newlines = 0, other = 0;
    int vowels = 0;

    fp = fopen("/tmp/census.txt", "w");
    if (fp == NULL) {
        perror("/tmp/census.txt");
        return 1;
    }
    fputs("Room 101 has 4 doors,\n2 windows and 1 cat!\n", fp);
    fclose(fp);

    fp = fopen("/tmp/census.txt", "r");
    if (fp == NULL) {
        perror("/tmp/census.txt");
        return 1;
    }

    /* fgetc returns the next byte as an unsigned char value (0..255), or
       EOF (which is -1) at the end. If c were a char, a byte of 255 would
       look just like EOF and the loop would stop early. Watch c in the
       variables panel change on every pass. */
    while ((c = fgetc(fp)) != EOF) {
        if (isalpha(c)) {
            letters++;
            switch (tolower(c)) {
            case 'a': case 'e': case 'i': case 'o': case 'u':
                vowels++;
            }
        } else if (isdigit(c)) {
            digits++;
        } else if (c == '\n') {
            newlines++;
        } else if (c == ' ') {
            spaces++;
        } else {
            other++;
        }
    }
    fclose(fp);

    printf("letters  %d (of which %d vowels)\n", letters, vowels);
    printf("digits   %d\n", digits);
    printf("spaces   %d\n", spaces);
    printf("newlines %d\n", newlines);
    printf("other    %d\n", other);
    printf("total    %d bytes\n", letters + digits + spaces + newlines + other);
    return 0;
}
