/*
 * title: Counting lines, blanks and tabs
 * level: 1
 * about: Counts newlines, blanks and tabs in its input, and shows that a character constant like '\n' is just a small integer.
 * input: first line\n\tindented with a tab\n  two blanks in front\n\nthe line above was empty\n
 */
#include <stdio.h>

int main(void)
{
    int c;
    int lines = 0, blanks = 0, tabs = 0;

    /* A character in single quotes is a number: '\n' is 10, ' ' is 32,
       '\t' is 9. Writing '\n' instead of 10 says what you mean. */
    printf("'\\n' = %d, ' ' = %d, '\\t' = %d, 'A' = %d\n", '\n', ' ', '\t', 'A');

    while ((c = getchar()) != EOF) {
        /* Each test is separate (not else if), but a character can only
           match one of them anyway. */
        if (c == '\n')
            ++lines;
        if (c == ' ')
            ++blanks;
        if (c == '\t')
            ++tabs;
    }
    printf("%d lines, %d blanks, %d tabs\n", lines, blanks, tabs);
    return 0;
}
