/*
 * title: Counting lines, words and characters
 * level: 2
 * about: Reads text one character at a time and counts lines, words and characters like the Unix wc tool, plus the longest word.
 * input: It was the best of times,\nit was the worst of times,\n  it was the age of   wisdom...\n
 */
#include <stdio.h>
#include <ctype.h>

int main(void)
{
    int c;                 /* int, not char: getchar returns EOF (-1) at the end */
    long lines = 0, words = 0, chars = 0;
    int inWord = 0;        /* are we in the middle of a word right now? */
    int curLen = 0, longest = 0;

    /* A word starts at the moment we go from "not in a word" to "in a
       word". Counting those moments counts words, however many spaces
       sit between them. */
    while ((c = getchar()) != EOF) {
        chars++;
        if (c == '\n')
            lines++;
        if (isspace(c)) {
            inWord = 0;
            curLen = 0;
        } else {
            if (!inWord) {
                inWord = 1;
                words++;
            }
            if (++curLen > longest)
                longest = curLen;
        }
    }
    printf("%ld lines, %ld words, %ld characters\n", lines, words, chars);
    printf("longest word: %d characters\n", longest);
    return 0;
}
