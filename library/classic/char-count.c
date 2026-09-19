/*
 * title: Counting characters with getchar
 * level: 1
 * about: Reads stdin one character at a time until EOF and counts the characters, digits, spaces and everything else.
 * input: Hello, world!\nIt is 1978 and C is new.\n
 */
#include <stdio.h>

int main(void)
{
    /* c must be an int, not a char. getchar returns every possible char
       value and also EOF, which is a value no char can be (-1 here).
       Squeezing it into a char would confuse a real 0xFF byte with EOF. */
    int c;
    long nc = 0;
    int ndigit[10];
    int nwhite = 0, nother = 0, i;

    for (i = 0; i < 10; i++)
        ndigit[i] = 0;

    while ((c = getchar()) != EOF) {
        ++nc;
        /* The digits '0'..'9' have consecutive codes, so c - '0' turns
           a digit character into its value, ready to use as an index. */
        if (c >= '0' && c <= '9')
            ++ndigit[c - '0'];
        else if (c == ' ' || c == '\n' || c == '\t')
            ++nwhite;
        else
            ++nother;
    }

    printf("%ld characters\n", nc);
    printf("digits =");
    for (i = 0; i < 10; i++)
        printf(" %d", ndigit[i]);
    printf(", white space = %d, other = %d\n", nwhite, nother);
    return 0;
}
