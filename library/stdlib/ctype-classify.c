/*
 * title: Classifying characters with ctype.h
 * level: 1
 * about: Reads a line and prints a table showing which ctype.h tests each character passes, then counts letters, digits, spaces and punctuation.
 * input: Hi! C89 in 1989, tab:\tend.\n
 */
#include <stdio.h>
#include <ctype.h>

/*
 * The is... functions take an int that must be either EOF or a value
 * that fits in unsigned char. Plain char is signed here, so a byte
 * above 127 would arrive negative; casting to unsigned char first is
 * the safe habit, even when the text is plain ASCII.
 */
int main(void)
{
    int c;
    int letters = 0, digits = 0, spaces = 0, punct = 0, other = 0;

    printf("char  alpha digit alnum space punct upper lower xdigit\n");
    while ((c = getchar()) != EOF && c != '\n') {
        unsigned char u = (unsigned char)c;

        /* Show invisible characters by name. */
        if (u == ' ')
            printf("' ' ");
        else if (u == '\t')
            printf("\\t  ");
        else
            printf(" %c  ", u);

        printf("%5s %5s %5s %5s %5s %5s %5s %6s\n",
               isalpha(u) ? "yes" : ".",
               isdigit(u) ? "yes" : ".",
               isalnum(u) ? "yes" : ".",
               isspace(u) ? "yes" : ".",
               ispunct(u) ? "yes" : ".",
               isupper(u) ? "yes" : ".",
               islower(u) ? "yes" : ".",
               isxdigit(u) ? "yes" : ".");

        if (isalpha(u))
            letters++;
        else if (isdigit(u))
            digits++;
        else if (isspace(u))
            spaces++;
        else if (ispunct(u))
            punct++;
        else
            other++;
    }

    printf("letters %d, digits %d, spaces %d, punctuation %d, other %d\n",
           letters, digits, spaces, punct, other);

    /*
     * The tests return "nonzero" for true, not necessarily 1, so write
     * if (isdigit(c)), never if (isdigit(c) == 1).
     */
    return 0;
}
