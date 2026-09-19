/*
 * title: squeeze and any
 * level: 2
 * about: Deletes characters from a string in place with two indexes (squeeze), and finds the first character of one string that occurs in another (any).
 */
#include <stdio.h>

/* Delete every c from s. i reads, j writes. j never gets ahead of i, so
   the string can be squeezed in place without a second buffer. Watch
   the two indexes in the locals panel: j falls behind i each time a c
   is skipped. */
void squeeze_char(char s[], int c)
{
    int i, j;

    for (i = j = 0; s[i] != '\0'; i++)
        if (s[i] != c)
            s[j++] = s[i];
    s[j] = '\0';
}

/* Is c anywhere in the string set? */
static int in_set(int c, const char set[])
{
    int k;

    for (k = 0; set[k] != '\0'; k++)
        if (set[k] == c)
            return 1;
    return 0;
}

/* Exercise 2-4: delete every character of s1 that appears anywhere
   in s2. */
void squeeze(char s1[], const char s2[])
{
    int i, j;

    for (i = j = 0; s1[i] != '\0'; i++)
        if (!in_set(s1[i], s2))
            s1[j++] = s1[i];
    s1[j] = '\0';
}

/* Exercise 2-5: the index of the first character in s1 that is also in
   s2, or -1. The library function strpbrk does the same job but gives
   back a pointer instead of an index. */
int any(const char s1[], const char s2[])
{
    int i;

    for (i = 0; s1[i] != '\0'; i++)
        if (in_set(s1[i], s2))
            return i;
    return -1;
}

int main(void)
{
    /* Arrays, not pointers to literals: squeeze writes into its string,
       and string literals must not be changed. Each array below is a
       copy of the literal, made on main's stack. */
    char a[] = "mississippi";
    char b[] = "the C programming language";
    char c[] = "hello, world";

    squeeze_char(a, 's');
    printf("mississippi without s: %s\n", a);

    squeeze(b, "aeiou");
    printf("without vowels: %s\n", b);

    printf("first vowel in \"%s\" is at %d\n", c, any(c, "aeiou"));
    printf("first punctuation at %d\n", any(c, ",.!?"));
    printf("first digit at %d\n", any(c, "0123456789"));
    return 0;
}
