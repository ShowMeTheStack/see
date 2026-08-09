/*
 * title: A char is a small number
 * level: 1
 * about: Prints characters and their codes, does arithmetic on letters and digits, and turns a digit character into its value.
 */
#include <stdio.h>

int main(void)
{
    char c = 'A';
    char next;
    char digit = '7';
    int value;
    char lower;

    /*
     * In memory a char is just one byte holding a number. 'A' is a way of
     * writing that number (65 in ASCII) without having to remember it.
     * Hover over c in See's stack panel: the box holds 65.
     */
    printf("'%c' is stored as %d\n", c, c);

    /* Because it is a number, you can add to it. The letters A to Z have
       consecutive codes, so 'A' + 1 is 'B'. */
    next = c + 1;
    printf("'%c' + 1 is '%c' (%d)\n", c, next, next);

    /* The digit characters '0' to '9' are also consecutive, but '7' is not
       7: it is 55. Subtracting '0' turns a digit character into its value.
       This one line is how every number-reading routine starts. */
    value = digit - '0';
    printf("'%c' has code %d, and '%c' - '0' is %d\n", digit, digit, digit, value);
    printf("twice the digit is %d\n", value * 2);

    /* Upper and lower case letters are 32 apart in ASCII. Writing 'a' - 'A'
       instead of 32 says why the number is there. */
    lower = c + ('a' - 'A');
    printf("'%c' in lower case is '%c'\n", c, lower);

    /* Comparing characters compares their codes. */
    printf("is 'Q' a capital letter? %d\n", 'Q' >= 'A' && 'Q' <= 'Z');
    printf("is 'q' a capital letter? %d\n", 'q' >= 'A' && 'q' <= 'Z');

    /* A few characters you cannot see, and their codes. */
    printf("space %d, newline %d, tab %d, zero byte %d\n", ' ', '\n', '\t', '\0');
    return 0;
}
