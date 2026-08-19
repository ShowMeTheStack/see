/*
 * title: Reversing a string in place
 * level: 1
 * about: Writes strrev with two pointers that swap characters from the ends inwards, and shows why a string literal cannot be reversed.
 */
#include <stdio.h>
#include <string.h>

static char *my_strrev(char *s)
{
    char *left = s;
    char *right = s + strlen(s) - 1;   /* the last real character, not the NUL */
    char t;

    /* For "" strlen is 0 and right starts one before s; the test left < right
       is false straight away, so nothing is touched. Watch the two arrows
       in the memory picture move towards each other. */
    while (left < right) {
        t = *left;
        *left++ = *right;
        *right-- = t;
    }
    return s;
}

int main(void)
{
    char a[] = "stressed";
    char b[] = "Was it a car or a cat I saw";
    char c[] = "";
    char d[] = "x";

    printf("%s -> ", a);
    printf("%s\n", my_strrev(a));
    printf("%s -> ", b);
    printf("%s\n", my_strrev(b));
    printf("\"%s\" -> \"%s\"\n", c, my_strrev(c));
    printf("%s -> %s\n", "x", my_strrev(d));

    /* my_strrev("hello") would compile, because a literal is a char array,
       but writing into it is not allowed. See stops such a program with
       "write to a string literal". Copy it into an array first, as above. */
    return 0;
}
