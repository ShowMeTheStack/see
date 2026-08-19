/*
 * title: Palindrome detector
 * level: 2
 * about: Tests lines of text for palindromes, skipping spaces and punctuation and ignoring case, by moving two indexes towards each other.
 * input: Racecar\nA man, a plan, a canal: Panama!\nhello world\nNo 'x' in Nixon\nWas it a rat I saw?\n
 */
#include <stdio.h>
#include <ctype.h>
#include <string.h>

/* No copy is made: two indexes skip over anything that is not a letter or
   digit and compare the rest, folded to lower case. */
static int is_palindrome(const char *s)
{
    int i = 0;
    int j = (int)strlen(s) - 1;

    while (i < j) {
        if (!isalnum((unsigned char)s[i])) { i++; continue; }
        if (!isalnum((unsigned char)s[j])) { j--; continue; }
        if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j]))
            return 0;    /* first mismatch decides it */
        i++;
        j--;
    }
    return 1;
}

int main(void)
{
    char line[100];

    /* %99[^\n] reads up to 99 characters that are not a newline: a whole
       line, spaces included. The " " before it skips the previous newline. */
    while (scanf(" %99[^\n]", line) == 1)
        printf("%-34s %s\n", line, is_palindrome(line) ? "palindrome" : "no");
    return 0;
}
