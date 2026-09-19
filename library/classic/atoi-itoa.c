/*
 * title: atoi, itoa and reverse
 * level: 2
 * about: Converts strings to ints and back by hand, building itoa's digits backwards and flipping them with reverse, and handles INT_MIN correctly.
 */
#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <limits.h>

/* String to int: skip white space, note the sign, then for each digit
   multiply what we have by 10 and add the digit. "472" goes 4, 47, 472. */
int my_atoi(const char s[])
{
    int i, n, sign;

    for (i = 0; isspace((unsigned char)s[i]); i++)
        ;
    sign = (s[i] == '-') ? -1 : 1;
    if (s[i] == '+' || s[i] == '-')
        i++;
    for (n = 0; isdigit((unsigned char)s[i]); i++)
        n = 10 * n + (s[i] - '0');
    return sign * n;
}

/* Reverse a string in place by swapping from both ends towards the
   middle. The comma operator lets the for loop move i and j together. */
void reverse(char s[])
{
    int c, i, j;

    for (i = 0, j = (int)strlen(s) - 1; i < j; i++, j--) {
        c = s[i];
        s[i] = s[j];
        s[j] = (char)c;
    }
}

/* Int to string. n % 10 gives the last digit first, so the digits come
   out backwards and are reversed at the end. The book's version does
   n = -n for negatives, which overflows for INT_MIN (there is no
   +2147483648 in an int). This one keeps n negative instead and makes
   each digit positive, which works for every int. */
void my_itoa(int n, char s[])
{
    int i = 0, negative = n < 0, d;

    do {
        d = n % 10;               /* -7 % 10 is -7 in C89 on this machine */
        s[i++] = (char)('0' + (d < 0 ? -d : d));
    } while ((n /= 10) != 0);
    if (negative)
        s[i++] = '-';
    s[i] = '\0';
    /* Pause here and look at s in the stack panel: the digits are in
       the wrong order, "-" at the end. */
    reverse(s);
}

int main(void)
{
    const char *inputs[5];
    int values[5];
    char buf[20];
    int i;

    inputs[0] = "472";
    inputs[1] = "   -38";
    inputs[2] = "+9000 apples";
    inputs[3] = "0";
    inputs[4] = "12x34";
    for (i = 0; i < 5; i++)
        printf("my_atoi(\"%s\") = %d\n", inputs[i], my_atoi(inputs[i]));

    values[0] = 0;
    values[1] = 1979;
    values[2] = -256;
    values[3] = INT_MAX;
    values[4] = INT_MIN;
    for (i = 0; i < 5; i++) {
        my_itoa(values[i], buf);
        printf("my_itoa(%d) = \"%s\"\n", values[i], buf);
    }
    return 0;
}
