/*
 * title: Splitting a line into words in place
 * level: 3
 * about: Reads a line, cuts it into words by writing zeros into the buffer, and keeps an array of pointers to the word starts.
 * input: the quick  brown fox jumps over the lazy dog
 */
#include <stdio.h>
#include <string.h>

#define MAXW 16

/*
 * No copying: each word stays where it is in line. The function replaces
 * the space after each word with '\0' and records where the word began.
 * Afterwards, look at line in the memory picture: it is now several short
 * strings back to back, and every words[i] arrow lands inside it.
 */
int split(char *line, char *words[], int max)
{
    int n = 0;
    char *p = line;

    while (*p != '\0' && n < max) {
        while (*p == ' ' || *p == '\n')     /* skip the gap */
            p++;
        if (*p == '\0')
            break;
        words[n++] = p;                     /* a word starts here */
        while (*p != '\0' && *p != ' ' && *p != '\n')
            p++;
        if (*p != '\0')
            *p++ = '\0';                    /* end it, and move past */
    }
    return n;
}

int main(void)
{
    char line[100];
    char *words[MAXW];
    char *longest;
    int n, i;

    /* %99[^\n] reads up to 99 characters that are not a newline. */
    if (scanf("%99[^\n]", line) != 1)
        return 0;

    n = split(line, words, MAXW);
    printf("%d words\n", n);

    longest = words[0];
    for (i = 0; i < n; i++) {
        printf("  [%d] \"%s\" at offset %ld\n", i, words[i], (long)(words[i] - line));
        if (strlen(words[i]) > strlen(longest))
            longest = words[i];
    }
    if (n > 0)
        printf("longest: %s\n", longest);

    /* Print the words backwards; only the pointers are visited in reverse. */
    for (i = n - 1; i >= 0; i--)
        printf("%s%s", words[i], i > 0 ? " " : "\n");
    return 0;
}
