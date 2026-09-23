#include <stdio.h>
#include <ctype.h>
#include "words.h"

int next_word(char *buf, int size)
{
    int c, n = 0;

    while ((c = getchar()) != EOF && !isalpha(c)) {
        ;   /* skip spaces, digits and punctuation */
    }
    if (c == EOF) {
        return 0;
    }
    do {
        if (n < size - 1) {
            buf[n++] = (char)tolower(c);
        }
    } while ((c = getchar()) != EOF && isalpha(c));
    buf[n] = '\0';
    return 1;
}
