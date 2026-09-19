/*
 * title: htoi, lower and the conditional expression
 * level: 1
 * about: Converts hexadecimal strings to integers (exercise 2-3) and lowers letters with the ?: operator, relying on the letters being consecutive.
 */
#include <stdio.h>

/* Exercise 2-10: lower case with a conditional expression instead of
   if-else. 'a' - 'A' is the distance between the two alphabets (32 in
   ASCII), so adding it moves a capital to its small letter. */
int lower(int c)
{
    return (c >= 'A' && c <= 'Z') ? c + 'a' - 'A' : c;
}

/* Value of one hex digit, or -1. */
int hexdigit(int c)
{
    c = lower(c);
    if (c >= '0' && c <= '9')
        return c - '0';
    if (c >= 'a' && c <= 'f')
        return c - 'a' + 10;
    return -1;
}

/* Exercise 2-3: a string of hex digits, with an optional 0x or 0X, to
   its value. Each digit shifts the value along by one hex place
   (times 16) and adds itself in. */
unsigned long htoi(const char s[])
{
    int i = 0, d;
    unsigned long n = 0;

    if (s[0] == '0' && lower(s[1]) == 'x')
        i = 2;
    for (; (d = hexdigit(s[i])) >= 0; i++)
        n = 16 * n + d;
    return n;
}

int main(void)
{
    const char *tests[5];
    char word[] = "Hello, WORLD";
    int i;

    tests[0] = "0x1F";
    tests[1] = "ff";
    tests[2] = "0XCAFE";
    tests[3] = "7fffffff";
    tests[4] = "DEADBEEF";
    for (i = 0; i < 5; i++)
        printf("htoi(\"%s\") = %lu\n", tests[i], htoi(tests[i]));

    for (i = 0; word[i] != '\0'; i++)
        word[i] = (char)lower(word[i]);
    printf("lowered: %s\n", word);

    /* The ?: operator is an expression, so it can sit inside printf. */
    for (i = 1; i <= 3; i++)
        printf("%d item%s\n", i, i == 1 ? "" : "s");
    return 0;
}
